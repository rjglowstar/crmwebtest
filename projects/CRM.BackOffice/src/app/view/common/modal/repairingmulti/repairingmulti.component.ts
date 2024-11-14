import { DatePipe } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { CommuteService, InventoryService, RepairingService } from '../../../../services';
import { UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { InventoryItems, Repairing, RInvItem } from '../../../../entities';
import { NgxSpinnerService } from 'ngx-spinner';
import { UntypedFormBuilder, UntypedFormGroup, NgForm } from '@angular/forms';
import { DataResult, process } from '@progress/kendo-data-query';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { element } from 'protractor';
import { fxCredential } from 'shared/enitites';
@Component({
  selector: 'app-repairingmulti',
  templateUrl: './repairingmulti.component.html',
  styleUrls: ['./repairingmulti.component.css']
})
export class RepairingmultiComponent implements OnInit {
  @Output() public toggle = new EventEmitter<boolean>();
  public repairingAllList: Array<Repairing> = new Array<Repairing>();
  public repairingShowList: Array<Repairing> = new Array<Repairing>();
  public searchStoneId: string = '';
  public gridViewInvList!: DataResult;
  public pageSize = 10;
  public skip = 0;
  public mySelection: Array<string> = new Array<string>();
  public isShowCheckBoxAll: boolean = true;
  public selectableSettings: SelectableSettings = { mode: 'multiple' };
  public fxCredentials!: fxCredential;

  constructor(
    public router: Router,
    public utilityService: UtilityService,
    private alertDialogService: AlertdialogService,
    public datepipe: DatePipe,
    private inventoryService: InventoryService,
    private spinnerService: NgxSpinnerService,
    private formBuilder: UntypedFormBuilder,
    private _repairService: RepairingService,
    private commuteService: CommuteService
  ) { }

  async ngOnInit() {
    await this.loadDefaultMethod();
  }

  public async loadDefaultMethod() {
    try {
      this.spinnerService.show();
      this.fxCredentials = JSON.parse(sessionStorage.getItem("fxCredentials") ?? '') as fxCredential;
      if (!this.fxCredentials)
        this.router.navigate(["login"]);

      this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error)
    }
  }

  public async getInventoryMeasurementData(isNewData: boolean = false) {
    try {
      let stoneIds: Array<string> = this.utilityService.CheckStoneIds(this.searchStoneId).map(x => x.toLowerCase());
      let gridStoneIds = this.repairingAllList.map(x => x.defectedStone.stoneId).map(z => z.toLowerCase());
      stoneIds = stoneIds.filter(x => !gridStoneIds.includes(x));
      if (stoneIds.length > 0) {
        let result: InventoryItems[] = await this.inventoryService.getInventoryByStoneIdsWithLowercase(stoneIds);
        if (result.length > 0) {
          for (let index = 0; index < result.length; index++) {
            let dInventoryObj = new RInvItem();
            const element = result[index];
            dInventoryObj = this.mappingInventoryToRInvItem(element);
            let repairingObj = new Repairing();
            repairingObj.defectedStone = dInventoryObj;
            repairingObj.repairedStone = new RInvItem();
            repairingObj.isIssue = "Issue";
            repairingObj.createdBy = this.fxCredentials.fullName;
            this.repairingAllList.push(repairingObj);
          }
          this.loadInvListPaging();
        }
        else {
          this.alertDialogService.show('No stone found!');
          this.searchStoneId = '';
        }
      }
      else
        this.alertDialogService.show(`There are some stones which already on the List`);
    }
    catch (error: any) {
      console.error(error);
      this.alertDialogService.show('Something went wrong on get inventory data!');
    }
  }

  public async loadInvListPaging() {
    this.repairingShowList = new Array<Repairing>();
    if (this.repairingAllList.length > 0) {
      for (let i = this.skip; i < this.pageSize + this.skip; i++) {
        const element = this.repairingAllList[i];
        if (element)
          this.repairingShowList.push(element);
      }
    }
    this.loadInventoryGrid(this.repairingAllList);
  }

  public loadInventoryGrid(invItems: Repairing[]) {
    this.gridViewInvList = process(this.repairingShowList, {});
    this.gridViewInvList.total = invItems.length;
    this.spinnerService.hide();
  }

  public pageChange(event: PageChangeEvent): void {
    this.spinnerService.show();
    this.repairingShowList = new Array<Repairing>();
    this.skip = event.skip;
    this.loadInvListPaging();
  }

  public closeRepairingDialog() {
    this.toggle.emit(false);
  }

  public async onSubmit(form: NgForm) {
    let existStoneIds = await this.getExistStones();
    if (existStoneIds.length > 0) {
      this.alertDialogService.show(existStoneIds.join(',') + ' stoneId(s) already exists in repairing!');
      return;
    }

    this.alertDialogService.ConfirmYesNo(`Are you want to Added stone(s) for repairing`, "Repairing Stones").subscribe(async (res: any) => {
      if (res.flag) {
        try {
          if (form.valid) {
            this.spinnerService.show();
            let response = await this._repairService.InsertList(this.repairingAllList);
            if (response) {
              let res = await this.commuteService.updateInventoryForRepairing(this.repairingAllList.map(z => z.defectedStone.stoneId));
              if (res) {
                this.utilityService.showNotification(response);
                this.spinnerService.hide();
                this.closeRepairingDialog();
              }
              else {
                this.alertDialogService.show(`Stone not updated in Frontoffice, Please contact administrator!`);
                this.spinnerService.hide();
              }
            }
            else {
              this.alertDialogService.show(`Something went wrong, Try again later!`);
              this.spinnerService.hide();
            }
          }
        }
        catch (error: any) {
          console.error(error);
          this.spinnerService.hide();
          this.alertDialogService.show(error.error);
        }
      }
    });
  }

  private async getExistStones(): Promise<string[]> {
    let existStones: string[] = [];
    try {
      let stoneIds = this.repairingAllList.map(z => z.defectedStone.stoneId);
      existStones = await this._repairService.isExistStonesRepair(stoneIds);

    } catch (error: any) {
      console.error(error);
    }
    return existStones;
  }

  public cellClickHandler(e: any) {
    if (!e.isEdited)
      e.sender.editCell(e.rowIndex, e.columnIndex, this.createFormGroup(e.dataItem));
  }

  public createFormGroup(dataItem: Repairing): UntypedFormGroup {
    return this.formBuilder.group({
      description: dataItem.description,
    });
  }

  public async cellCloseHandler(args: any) {
    try {
      let { formGroup, dataItem } = args;
      if (formGroup.dirty)
        dataItem.description = formGroup.value.description;
    }
    catch (error: any) {
      console.error(error);
      this.alertDialogService.show(`Data insert fail, Try again later!`);
    }
  }

  public selectAllInvList(event: string) {
    this.mySelection = [];
    if (event.toLowerCase() == 'checked')
      this.mySelection = this.repairingAllList.map(x => x.defectedStone.stoneId);
  }

  public selectData(item: any, event: any) {
    if (event.target.checked)
      this.mySelection.push(item.defectedStone.stoneId);
    else {
      let index = this.mySelection.findIndex(z => z == item.defectedStone.stoneId);
      if (index > -1)
        this.mySelection.splice(index, 1);
    }
  }

  public deleteInvFromGrid() {
    this.alertDialogService.ConfirmYesNo(`Are you want to delete selected stone(s) from the List`, "Repairing Stone").subscribe((res: any) => {
      if (res.flag) {
        let repairingAllList: Repairing[] = this.repairingAllList.filter(x => !this.mySelection.includes(x.defectedStone.stoneId));
        this.mySelection = [];
        this.repairingAllList = repairingAllList;
        this.loadInvListPaging();
      }
    })
  }

  public mappingInventoryToRInvItem(inv: InventoryItems): RInvItem {
    let invObj: RInvItem = new RInvItem();
    invObj.stoneId = inv.stoneId;
    invObj.weight = inv.weight;
    invObj.clarity = inv.clarity;
    invObj.cut = inv.cut;
    invObj.polish = inv.polish;
    invObj.symmetry = inv.symmetry;
    invObj.fluorescence = inv.fluorescence;
    invObj.shape = inv.shape;
    invObj.color = inv.color;
    invObj.inclusion = inv.inclusion;
    invObj.measurement = inv.measurement;

    return invObj;
  }

}
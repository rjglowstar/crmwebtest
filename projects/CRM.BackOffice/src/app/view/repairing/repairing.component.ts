import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { ExcelExportData } from '@progress/kendo-angular-excel-export';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { DataResult, GroupDescriptor, process } from '@progress/kendo-data-query';
import { NgxSpinnerService } from 'ngx-spinner';
import { GridDetailConfig } from 'shared/businessobjects';
import { fxCredential } from 'shared/enitites';
import { StoneStatus, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { RepairingResponse, RepairingSearchCriteria } from '../../businessobjects';
import { InventoryItems, Repairing } from '../../entities';
import { CommuteService, GridPropertiesService, InventoryService, RepairingService } from '../../services';

@Component({
  selector: 'app-repairing',
  templateUrl: './repairing.component.html',
  styleUrls: ['./repairing.component.css']
})
export class RepairingComponent implements OnInit {

  public groups: GroupDescriptor[] = [];
  public gridView!: DataResult;
  public pageSize = 27;
  public skip = 0
  public fields!: GridDetailConfig[];
  public fxCredentials!: fxCredential;
  public repairingSearchCriteriaObj: RepairingSearchCriteria = new RepairingSearchCriteria();
  public repairingResponse: RepairingResponse = new RepairingResponse();
  public repairingExcelData: Repairing[] = [];
  public filterFlag = true;
  public stoneId: string = '';
  public isRepairingModal: boolean = false;
  public isRepairingMultiModal: boolean = false;
  public repairingObj = new Repairing();
  public selectableSettings: SelectableSettings = { mode: 'multiple' };
  public mySelection: any[] = [];
  public isMemo: boolean = false;
  public isVisiable: boolean = true;
  public selectedInventoryItems: InventoryItems[] = [];
  public stoneIds: string[] = [];
  public isDisabled: boolean = true;
  public isViewButtons: boolean = false;
  public isRepairProcess: boolean = true;
  public isDisableEdit: boolean = true;
  public islabIssue: boolean = false;
  public isDisableLabAndPriceReqsend: boolean = true;

  constructor(
    private router: Router,
    private alertDialogService: AlertdialogService,
    private spinnerService: NgxSpinnerService,
    private utilityService: UtilityService,
    private gridPropertiesService: GridPropertiesService,
    private repairingService: RepairingService,
    private inventoryService: InventoryService,
    private commuteService: CommuteService,
  ) { }

  public async ngOnInit(): Promise<void> {
    await this.defaultMethodsLoad();
  }

  //#region Default Method
  public async defaultMethodsLoad() {
    try {
      this.fxCredentials = JSON.parse(sessionStorage.getItem("fxCredentials") ?? '') as fxCredential;
      if (!this.fxCredentials)
        this.router.navigate(["login"]);

      if (this.fxCredentials && this.fxCredentials.origin && (this.fxCredentials.origin.toLowerCase() == 'admin' || this.fxCredentials.origin.toLowerCase() == 'opmanager'))
        this.isViewButtons = true;

      this.utilityService.filterToggleSubject.subscribe(flag => {
        this.filterFlag = flag;
      });

      this.spinnerService.show();
      await this.getGridConfiguration();
      await this.loadRejectedInventory();
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Something went wrong, Data not load!');
    }
  }
  //#endregion

  //#region Grid Config
  public async getGridConfiguration() {
    try {
      this.spinnerService.show();
      this.fields = await this.gridPropertiesService.getRepairingGrid();
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.alertDialogService.show(error);
      this.spinnerService.hide();
    }
  }

  public groupChange(groups: GroupDescriptor[]): void {
    try {
      this.groups = groups;
      this.loadRejectedInventory();
    }
    catch (error: any) {
      this.alertDialogService.show(error.error)
    }
  }

  public pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.loadRejectedInventory();
  }

  public selectedRowChange(event: any) {

    if (this.mySelection.length > 0) {
      let fetchRepairData = this.repairingResponse.repairing.filter(x => this.mySelection.includes(x.id));
      if (this.mySelection.length == 1) {
        this.repairingObj = fetchRepairData[0];
        if (this.repairingObj.memoStatus && this.repairingObj.memoStatus.toLowerCase() == "issue")
          this.isDisableEdit = false;
        else
          this.isDisableEdit = true;
      }
      else {
        this.repairingObj = new Repairing();
        this.isDisableEdit = true;
      }

      if (this.mySelection.length > 0) {
        let recCount = 0;
        fetchRepairData.forEach(element => {
          if ((element.memoStatus && element.memoStatus.toLowerCase() == "receive")
            && (element.isIssue && element.isIssue.toLowerCase() == "receive"))
            recCount = recCount + 1;
        });
        if (recCount == fetchRepairData.length)
          this.isDisableLabAndPriceReqsend = false;
        else
          this.isDisableLabAndPriceReqsend = true;
      }

      this.stoneIds = fetchRepairData.map(x => x.defectedStone.stoneId);
    }
    else
      this.stoneIds = [];
  }
  //#endregion

  public async loadRejectedInventory() {
    try {
      this.spinnerService.show();
      this.repairingSearchCriteriaObj.stoneIds = this.stoneId ? this.utilityService.CheckStoneIds(this.stoneId).map(x => x.toUpperCase()) : [];
      let res = await this.repairingService.getRepairing(this.repairingSearchCriteriaObj, this.skip, this.pageSize);
      if (res) {
        this.repairingResponse = JSON.parse(JSON.stringify(res));
        this.gridView = process(this.repairingResponse.repairing, { group: this.groups });
        this.gridView.total = res.totalCount;
        this.repairingExcelData = [...this.repairingResponse.repairing];
        this.repairingExcelData.forEach(z => {
          z.createdDateString = this.format(z.createdDate) as any;
        });

        this.spinnerService.hide();
      }
      else
        this.spinnerService.hide();
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Data not load, Try gain later!');
    }
  }

  public format(inputDate: Date) {
    let date, month, year;

    date = new Date(inputDate).getDate();
    month = new Date(inputDate).getMonth() + 1;
    year = new Date(inputDate).getFullYear();

    date = date
      .toString()
      .padStart(2, '0');

    month = month
      .toString()
      .padStart(2, '0');

    return `${date}/${month}/${year}`;
  }

  public filterPartToggle() {
    this.utilityService.setfilterToggleValue(this.filterFlag);
  }

  public async onFilterSubmit(form: NgForm) {
    if (form.valid) {
      await this.loadRejectedInventory();
    }
  }

  public async clearFilter(form: NgForm) {
    this.spinnerService.show();
    form.reset();
    this.skip = 0;
    this.repairingSearchCriteriaObj = new RepairingSearchCriteria();
    this.stoneId = '';
    this.mySelection = [];
    await this.loadRejectedInventory();
  }

  public openRepairingDialog(flag: boolean = true) {
    if (flag)
      this.isRepairingModal = true;
    else {
      if (this.mySelection.length == 1)
        this.isRepairingModal = true;
    }
  }

  public openRepairingMultiDialog() {
    this.isRepairingMultiModal = !this.isRepairingMultiModal;
  }

  public deleteRepairing() {
    this.alertDialogService.ConfirmYesNo("Are you sure you want to delete", "Repairing Stone")
      .subscribe(async (res: any) => {
        if (res.flag) {
          try {
            this.spinnerService.show();
            let res = await this.repairingService.delete(this.mySelection[0]);
            if (res) {
              this.utilityService.showNotification('Repairing Stone deleted successfully!');
              this.loadRejectedInventory();
            }
            else
              this.alertDialogService.show('Something went wrong, Try gain later!', 'error');

            this.spinnerService.hide();
          }
          catch (error: any) {
            console.error(error);
            this.spinnerService.hide();
            this.alertDialogService.show('Something went wrong, Try gain later!');
          }
        }
      });
  }

  public refreshData() {
    this.loadRejectedInventory();
    this.mySelection = [];
    this.repairingObj = new Repairing();
  }

  public async openMemoDialog(): Promise<void> {
    if (this.stoneIds.length > 0)
      await this.getInventoryDetailsByStoneId(this.stoneIds);

    let message = '';
    let invalidStonesMemo = this.selectedInventoryItems.filter(c => c.isMemo).map(c => c.stoneId).join(', ');
    if (invalidStonesMemo.length > 0)
      message += `${invalidStonesMemo} <b>In Memo</b> <br/>`;

    let invalidStonesHold = this.selectedInventoryItems.filter(c => c.isHold).map(c => c.stoneId).join(', ');
    if (invalidStonesHold.length > 0)
      message += `${invalidStonesHold} <b>In Hold</b> <br/>`;

    if (message)
      this.alertDialogService.show(message);
    else
      this.isMemo = true;
  }

  public async getInventoryDetailsByStoneId(stoneIds: string[]) {
    this.selectedInventoryItems = await this.inventoryService.getInventoryByStoneIds(stoneIds);
  }

  public async openLabIssueDialog(): Promise<void> {
    if (this.stoneIds.length > 0)
      await this.getInventoryDetailsByStoneId(this.stoneIds);
    this.islabIssue = true;
  }

  public async submitPriceRequest() {
    if (this.stoneIds.length > 0) {
      await this.getInventoryDetailsByStoneId(this.stoneIds);
      if (this.selectedInventoryItems.length > 0) {
        this.selectedInventoryItems.forEach(c => c.status = StoneStatus.Lab.toString());
        await this.savePricingRequestDiamanto(this.selectedInventoryItems);
      }
    }
  }

  public async savePricingRequestDiamanto(inv: InventoryItems[]) {
    try {
      var res = await this.commuteService.insertPricingRequest(inv, "Price Request From Repairing", this.fxCredentials.fullName);
      if (res) {
        let resStatus = await this.repairingService.updateCompleteStatus(this.stoneIds);
        if (resStatus) {
          let resInv = await this.repairingService.updateInventoryIsPricingRequestBool(inv);
          if (resInv)
            this.utilityService.showNotification(inv.length + ' stone(s) pricing request submitted! and Stone Status Updated');
        }
      }
      else
        this.alertDialogService.show('Pricing request not inserted, Please contact administrator!', 'error');
    } catch (error: any) {
      this.alertDialogService.show('Pricing request not inserted, Please contact administrator!', 'error');
      console.error(error);
    }
  }

}
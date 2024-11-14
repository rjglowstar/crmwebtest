import { Component, OnInit } from '@angular/core';
import { CustAddDiscCriteria } from '../../businessobjects/customer/customerAddDiscCriteria';
import { AppPreloadService, UtilityService } from 'shared/services';
import { fxCredential } from 'shared/enitites';
import { Router } from '@angular/router';
import { DataResult, GroupDescriptor, process, SortDescriptor } from '@progress/kendo-data-query';
import { AlertdialogService } from 'shared/views';
import { CustomerCriteriaService, GridPropertiesService, InventoryService } from '../../services';
import { GridDetailConfig } from 'shared/businessobjects';
import { NgxSpinnerService } from 'ngx-spinner';
import { SelectableSettings } from '@progress/kendo-angular-treeview';
import { PageChangeEvent } from '@progress/kendo-angular-grid';
import { custAddDisc } from '../../entities/customer/customerAddDisc';
import { NgForm, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { InventoryItems } from '../../entities';

@Component({
  selector: 'app-ftpaddisc',
  templateUrl: './ftpaddisc.component.html',
  styleUrls: ['./ftpaddisc.component.css']
})
export class FtpAddDiscComponent implements OnInit {
  public skip = 0;
  public pageSize = 26;
  public summaryTotalCount = 0;

  public filterFlag = false;
  public isShowCheckBoxAll: boolean = true;
  public isAllSelected: boolean = false;

  public gridView!: DataResult;
  public stoneId!: string;
  public sort: SortDescriptor[] = [];
  private fxCredentials!: fxCredential;
  public selectableSettings: SelectableSettings = { mode: 'multiple' };
  public custAddDiscCriteria: CustAddDiscCriteria = new CustAddDiscCriteria();

  public groups: GroupDescriptor[] = [];
  public mySelection: string[] = [];
  public custAddDiscObj: custAddDisc = new custAddDisc();
  public allCustAddDisc: custAddDisc[] = [];
  public custAddDiscFields!: GridDetailConfig[];

  constructor(private router: Router,
    private formBuilder: UntypedFormBuilder,
    private appPreloadService: AppPreloadService,
    private alertDialogService: AlertdialogService,
    private customerCriteriaService: CustomerCriteriaService,
    private gridPropertiesService: GridPropertiesService,
    private spinnerService: NgxSpinnerService,
    public utilityService: UtilityService,
    private inventoryService: InventoryService) { }

  async ngOnInit() {
    await this.defaultMethodsLoad();
  }

  //#region Initiate Data
  async defaultMethodsLoad() {
    this.fxCredentials = await this.appPreloadService.fetchFxCredentials();
    if (!this.fxCredentials)
      this.router.navigate(["login"]);

    this.custAddDiscFields = this.gridPropertiesService.getCustomerAddDiscGrid();

    this.spinnerService.show();
    await this.loadCustAddDisc();
  }

  public async loadCustAddDisc() {
    try {
      this.spinnerService.show();

      this.custAddDiscCriteria.stoneIds = this.stoneId ? this.utilityService.CheckStoneIds(this.stoneId).map(x => x.toUpperCase()) : [];
      const resData: any = await this.customerCriteriaService.getCustAddDisc(this.custAddDiscCriteria, this.skip, this.pageSize);
      var customerAddDiscData = resData.custAddDisc;
      const stoneIds = customerAddDiscData.map((r: custAddDisc) => r.stoneId);
      // Fetch inventory data
      var invRes: InventoryItems[] = await this.inventoryService.getInventoryByStoneIds(stoneIds);

      this.allCustAddDisc = customerAddDiscData.map((item: custAddDisc) => {
        const inventoryItem = invRes.find((res) => res.stoneId == item.stoneId);

        const fAmount = (inventoryItem?.price?.discount ?? 0) + item.discount;
        return {
          ...item,
          shape: inventoryItem?.shape,
          weight: inventoryItem?.weight,
          color: inventoryItem?.color,
          clarity: inventoryItem?.clarity,
          cut: inventoryItem?.cut,
          polish: inventoryItem?.polish,
          symmetry: inventoryItem?.symmetry,
          fluorescence: inventoryItem?.fluorescence,
          price: inventoryItem?.price,
          fAmount: fAmount.toFixed(3)
        };
      })

      this.gridView = process(this.allCustAddDisc, { group: this.groups, sort: this.sort });
      this.gridView.total = resData.totalCount;
      this.summaryTotalCount = resData.totalCount
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.alertDialogService.show(error.error);
    }
  }

  public async onFilterSubmit(form: NgForm) {
    this.skip = 0;
    this.loadCustAddDisc();
  }

  public clearFilter(form: NgForm) {
    form.reset();
    this.custAddDiscCriteria = new CustAddDiscCriteria();
    this.loadCustAddDisc();
  }

  public groupChange(groups: GroupDescriptor[]): void {
    try {
      this.groups = groups;
      this.loadCustAddDisc();
    }
    catch (error: any) {
      console.error(error);
      this.alertDialogService.show('Something went wrong, Try again later!');
    }
  }

  //#region OnChange Functions
  public pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.loadCustAddDisc();
  }

  public filterPartToggle() {
    this.filterFlag = !this.filterFlag
  }

  public sortChange(sort: SortDescriptor[]): void {
    this.sort = sort;
    this.loadCustAddDisc();
  }

  public async selectedRowChange(e: any) {
    this.custAddDiscObj = new custAddDisc();
    if (e.selectedRows != null && e.selectedRows.length > 0) {
      let value: custAddDisc = e.selectedRows[0].dataItem;
      this.custAddDiscObj = JSON.parse(JSON.stringify(value));
    }
  }

  //#region Select All
  public async selectAllCustAddDisc(event: string, isAll: boolean) {
    if (event.toLowerCase() == 'checked') {
      if (this.summaryTotalCount > this.pageSize && isAll) {
        this.spinnerService.show();
        let res = await this.customerCriteriaService.getAllCustAddDiscIds();
        if (res) {
          this.mySelection = res;
          this.spinnerService.hide();
        }
        else
          this.spinnerService.hide();
        this.isAllSelected = false;
      }
      else {
        if (isAll || this.summaryTotalCount < this.pageSize)
          this.isAllSelected = false;
        else if (this.summaryTotalCount > this.pageSize)
          this.isAllSelected = true;
      }
    }
    else if (event.toLowerCase() == 'uncheckedall') {
      this.mySelection = [];
      this.isAllSelected = false;
      this.selectedRowChange(event);
    }
    else {
      this.allCustAddDisc.forEach(z => {
        let selectionIndex = this.mySelection.findIndex(a => a == z.stoneId);
        if (selectionIndex != -1)
          this.mySelection.splice(selectionIndex, 1);
      });
      this.isAllSelected = false;
    }
  }
  //#endregion

  public openDeleteDialog() {
    try {
      this.alertDialogService.ConfirmYesNo("Are you sure you want to delete?", "Delete")
        .subscribe(async (res: any) => {
          if (res.flag) {
            this.spinnerService.show();
            let responseDelete = await this.customerCriteriaService.deleteCustAddDisc(this.mySelection)
            if (responseDelete) {
              this.spinnerService.hide();
              this.loadCustAddDisc();
              this.mySelection = [];
              this.utilityService.showNotification(`Record deleted successfully!`)
            }
          }
        });
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  //#region Temp Price CRUD
  public cellClickHandler(e: any) {
    if (!e.isEdited)
      e.sender.editCell(e.rowIndex, e.columnIndex, this.createFormGroup(e.dataItem));
  }

  public createFormGroup(dataItem: any): UntypedFormGroup {
    return this.formBuilder.group({
      discount: dataItem.discount
    });
  }

  public async cellCloseHandler(args: any) {
    try {
      let { formGroup, dataItem } = args;
      if (formGroup.dirty) {
        var result = await this.customerCriteriaService.updateCustAddDisc(dataItem.id, formGroup.value.discount)
        if (result) {
          this.mySelection = [];
          this.loadCustAddDisc();
          this.utilityService.showNotification(`Discount updated successfully!`)
        }
      }
    }
    catch (error: any) {
      console.error(error);
      this.alertDialogService.show(`Data insert fail, Try again later!`);
    }
  }
}

import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { DataResult, GroupDescriptor, process } from '@progress/kendo-data-query';
import { NgxSpinnerService } from 'ngx-spinner';
import { GridDetailConfig } from 'shared/businessobjects';
import { fxCredential, GridConfig, GridMasterConfig } from 'shared/enitites';
import { AppPreloadService, ConfigService, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { AccountingconfigService, GridPropertiesService, TransactItemService } from '../../services';
import { TaxType, TransactItemGroup } from "../../entities";
import { TransactItem } from '../../entities';
import { TransactItemSearchCriteria } from '../../businessobjects/transactItem/transactItemSearchCriteria';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';

@Component({
  selector: 'app-transactitem',
  templateUrl: './transactitem.component.html',
  styleUrls: ['./transactitem.component.css']
})
export class TransactitemComponent implements OnInit {

  public pageName: string = 'Tansact Item';
  public isTransctItemMaster: boolean = false;
  public isEditMode: boolean = false;

  public gridView!: DataResult;
  public fields!: GridDetailConfig[];
  public skeletonArray = new Array(18);
  public filterFlag = true;

  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains'
  };

  public groups: GroupDescriptor[] = [];
  public pageSize = 26;
  public skip = 0;
  public mySelection: string[] = [];


  // Grid Configuration
  public isGridConfig: boolean = false;
  private fxCredential!: fxCredential;
  public gridConfig!: GridConfig;
  public gridMasterConfigResponse!: GridMasterConfig;

  public transactItemGroups: TransactItemGroup = new TransactItemGroup();
  public listTransactItems: Array<TransactItemGroup> = [];
  public listTransactName: Array<string> = [];
  public listTaxTypeItems: Array<TaxType> = [];
  public listTaxTypes: Array<{ id: string, name: string; isChecked: boolean }> = [];

  public transactItemObj: TransactItem = new TransactItem();
  public seletedTaxTypes: string[] = [];
  public filterTax: string = '';
  public filterTaxChk: boolean = true;

  // Filter TransactItme 
  public transactItemSearchCriteria: TransactItemSearchCriteria = new TransactItemSearchCriteria();

  public isViewButtons: boolean = false;

  constructor(
    private gridPropertiesService: GridPropertiesService,
    private router: Router,
    private alertDialogService: AlertdialogService,
    private spinnerService: NgxSpinnerService,
    private configService: ConfigService,
    private appPreloadService: AppPreloadService,
    public utilityService: UtilityService,
    private transactItemService: TransactItemService,
    private accountingconfigService: AccountingconfigService
  ) { }

  async ngOnInit() {
    await this.defaultMethodsLoad();
  }

  public async defaultMethodsLoad() {
    this.fxCredential = await this.appPreloadService.fetchFxCredentials();
    if (!this.fxCredential)
      this.router.navigate(["login"]);

    if (this.fxCredential && this.fxCredential.origin && (this.fxCredential.origin.toLowerCase() == 'admin' || this.fxCredential.origin.toLowerCase() == 'accounts'))
      this.isViewButtons = true;

    await this.getGridConfiguration();
    await this.getTransactItmeGroupDetails();
    await this.getTaxTypeDetails();
    await this.loadTransactItem();
    this.utilityService.filterToggleSubject.subscribe(flag => {
      this.filterFlag = flag;
    });
  }

  public async getTransactItmeGroupDetails() {
    let tigData = await this.accountingconfigService.getTransactItemGroups();
    tigData.forEach((item) => {
      this.listTransactItems.push({ id: item.id, name: item.name, parent: item.parent, description: item.description })
    })
  }
  public async getTaxTypeDetails() {
    let ttData = await this.accountingconfigService.getTaxTypesList();
    ttData.forEach((item) => {
      this.listTaxTypeItems.push({ id: item.id, name: item.name, rate: item.rate, type: item.type, isRounding: item.isRounding })
      this.listTaxTypes.push({ id: item.id, name: item.name, isChecked: false });
    })
  }

  public async getGridConfiguration() {
    try {
      this.gridConfig = await this.configService.getGridConfig(this.fxCredential.id, "TransactItem", "TransactItemGrid", this.gridPropertiesService.getTransactItemGrid());
      if (this.gridConfig && this.gridConfig.id != '') {
        let dbObj: GridDetailConfig[] = this.gridConfig.gridDetail;
        if (dbObj && dbObj.some(c => c.isSelected)) {
          this.fields = dbObj;
          this.fields.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        }
        else
          this.fields.forEach(c => c.isSelected = true);
      }
      else {
        this.gridMasterConfigResponse = await this.configService.getMasterGridConfig("TransactItem", "TransactItemGrid");
        if (this.gridMasterConfigResponse)
          this.fields = this.gridMasterConfigResponse.gridDetail;
        else
          this.fields = await this.gridPropertiesService.getTransactItemGrid();
      }
    } catch (error: any) {
      this.alertDialogService.show(error.error)
    }
  }

  public async loadTransactItem() {
    try {
      this.listTransactName = [];
      let transactItemData: any = await this.transactItemService.getTransactItemPaginated(this.skip, this.pageSize);
      transactItemData.forEach((item: any) => {
        this.listTransactName.push(item.name);
      });
      this.gridDataFetcher(transactItemData);
    }
    catch (error: any) {
      this.alertDialogService.show(error.error)
    }
  }

  private gridDataFetcher(transactItemData: any) {
    this.gridView = process(transactItemData, { group: this.groups });
    this.gridView.total = transactItemData.length;
  }

  //#region Filter section
  public filterPartToggle() {
    this.utilityService.setfilterToggleValue(this.filterFlag);
  }

  public async onFilterSubmit(form: NgForm) {
    try {
      if (form?.valid) {
        if (form?.value.name) {
          let transactItemData = await this.transactItemService.getTransactItemByName(form?.value.name);
          this.gridDataFetcher(transactItemData);
        }
        if (form?.value.group) {
          let transactItemData = await this.transactItemService.getTransactItemByGroup(form?.value.group.name);
          this.gridDataFetcher(transactItemData);
        }
      }
    } catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error)
    }
  }

  public clearFilter(form: NgForm) {
    form.reset()
    this.loadTransactItem()
  }
  //#endregion Filter section

  //#region Grid Configuration
  public openGridConfigDialog(): void {
    this.isGridConfig = true;
  }

  public async setNewGridConfig(gridConfig: GridConfig) {
    if (gridConfig) {
      this.fields = gridConfig.gridDetail;
      this.gridConfig = new GridConfig();
      this.gridConfig.id = gridConfig.id
      this.gridConfig.gridDetail = gridConfig.gridDetail;
      this.gridConfig.gridName = gridConfig.gridName;
      this.gridConfig.pageName = gridConfig.pageName;
      this.gridConfig.empID = gridConfig.empID;
    }
  }
  //#endregion Grid Configuration

  //#region Transact Itme CRUD
  public selectedRowChange(e: any) {
    this.isEditMode = true;
    this.transactItemObj = new TransactItem();
    let value: any = e.selectedRows[0].dataItem;
    this.transactItemObj = { ...value };
  }

  public async submitTransactItem(form?: NgForm, action?: boolean) {
    try {
      if (form?.valid) {
        this.spinnerService.show();
        let result;
        let messageText: string = '';
        if (!this.isEditMode) {
          if (this.seletedTaxTypes.length > 0) {
            for (let index = 0; index < this.seletedTaxTypes.length; index++) {
              const element = this.seletedTaxTypes[index];
              this.listTaxTypeItems.forEach((item) => {
                if (element.toLowerCase() == item.name.toLowerCase()) {
                  this.transactItemObj.taxes.push(item);
                }
              });
            }
          }
          messageText = 'Added';
          result = await this.transactItemService.insertTransactItem(this.transactItemObj);
        } else {
          if (this.seletedTaxTypes.length > 0) {
            this.transactItemObj.taxes = [];
            for (let index = 0; index < this.seletedTaxTypes.length; index++) {
              const element = this.seletedTaxTypes[index];
              this.listTaxTypeItems.forEach((item) => {
                if (element.toLowerCase() == item.name.toLowerCase()) {
                  this.transactItemObj.taxes.push(item);
                }
              });
            }
          }
          messageText = 'Updated';
          result = await this.transactItemService.updateTransactItem(this.transactItemObj);
        }
        if (result) {
          this.isEditMode = false;
          this.spinnerService.hide();
          this.resetTaxTypesIfChecked();
          this.resetForm(form);
          this.utilityService.showNotification(`Record ${messageText} successfully!`)
          this.loadTransactItem();
          if (!action)
            this.isTransctItemMaster = false;
        }
        else {
          this.isEditMode = false;
          this.isTransctItemMaster = false;
        }
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error)
    }
  }

  public openTransationItmeEditMode(action: boolean) {
    if (action && this.isEditMode) {
      this.isTransctItemMaster = true;
      this.seletedTaxTypes = [];
      if (this.transactItemObj && this.transactItemObj.taxes.length) {
        this.transactItemObj.taxes.forEach((ele) => {
          this.seletedTaxTypes.push(ele.name);
        });
        this.onMultiSelectChange(this.listTaxTypes, this.seletedTaxTypes);
      }
    }
  }

  private resetTaxTypesIfChecked() {
    this.listTaxTypes.forEach((ele) => {
      if (ele.isChecked == true)
        ele.isChecked = false;
    })
  }

  public async addNewTransactItem() {
    this.isTransctItemMaster = true;
    this.isEditMode = false;
    this.mySelection = [];
    this.seletedTaxTypes = [];
    this.resetTaxTypesIfChecked();
    this.resetForm();
  }

  public resetForm(form?: NgForm) {
    this.transactItemObj = new TransactItem();
    this.isEditMode = false;
    form?.reset();
  }

  public closeTransactItemMaster(form: NgForm) {
    this.isTransctItemMaster = false;
    this.isEditMode = false;
    this.mySelection = [];
    this.resetForm(form);
  }

  public async deleteTransactItem() {
    try {
      this.alertDialogService.ConfirmYesNo("Are you sure you want to delete?", "Delete")
        .subscribe(async (res: any) => {
          if (res.flag) {
            this.spinnerService.show();
            let responseDelete = await this.transactItemService.deleteTransactItem(this.transactItemObj.id);
            if (responseDelete !== undefined && responseDelete !== null) {
              this.loadTransactItem();
              this.spinnerService.hide();
              this.isEditMode = false;
              this.utilityService.showNotification(`You have been deleted successfully!`)
            }
          }
        });
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error)
    }
  }
  //#endregion Transact Itme CRUD

  //#region Multiselection 
  public getCommaSapratedString(vals: any[], isAll: boolean = false): string {
    let name = vals.join(',')
    if (!isAll)
      if (name.length > 15)
        name = name.substring(0, 15) + '...';

    return name;
  }

  public onOpenDropdown(list: Array<{ name: string; isChecked: boolean }>, e: boolean, selectedData: string[]): boolean {
    if (selectedData?.length == list.map(z => z.name).length)
      e = true;
    else
      e = false;
    return e;
  }

  public onMultiSelectChange(val: Array<{ id: string, name: string; isChecked: boolean }>, selectedData: string[]): void {

    val.forEach(element => {
      element.isChecked = false;
    });

    if (selectedData && selectedData.length > 0) {

      val.forEach(element => {
        selectedData.forEach((item) => {
          if (element.name.toString().toLowerCase() == item.toString().toLowerCase())
            element.isChecked = true;
        });
      });
    }
  }
  //#endregion
}
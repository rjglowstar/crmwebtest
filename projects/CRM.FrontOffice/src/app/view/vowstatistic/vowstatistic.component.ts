import { Component, OnInit } from '@angular/core';
import { AlertdialogService } from 'shared/views';
import { NgxSpinnerService } from 'ngx-spinner';
import { AppPreloadService, ConfigService, OriginValue, UtilityService } from 'shared/services';
import { GridDetailConfig } from 'shared/businessobjects';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { NgForm } from '@angular/forms';
import { fxCredential, GridConfig, GridMasterConfig } from 'shared/enitites';
import { CustomerService, GridPropertiesService, SystemUserService, VowStatisticService } from '../../services';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { CustLookUp, VowStatisticSearchCriteria } from '../../businessobjects';
import { DataResult, GroupDescriptor, process } from '@progress/kendo-data-query';
import { Router } from '@angular/router';
import { SystemUser } from '../../entities';

@Component({
  selector: 'app-vowstatistic',
  templateUrl: './vowstatistic.component.html'
})
export class VowStatisticComponent implements OnInit {


  //Pre-Grid 
  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains',
  };
  public selectableSettings: SelectableSettings = {
    mode: 'single',
  };
  public mySelection: string[] = [];
  public skeletonArray = new Array(18);
  public groups: GroupDescriptor[] = [];
  public isCheckAdmin: boolean = false;

  //Grid & Pagination Settings
  public pageSize = 26;
  public skip = 0;
  public fields!: GridDetailConfig[];
  public gridView!: DataResult;
  public isGridConfig: boolean = false;
  public gridConfig!: GridConfig;
  public gridMasterConfigResponse!: GridMasterConfig;


  // Pre-filter setttings
  public filterFlag = true;
  public listCustomerItems: Array<{ name: string; value: string; isChecked: boolean }> = [];
  public selectedCustomerItem: string = "";
  public systemUsers: SystemUser[] = [];
  public customerlist: CustLookUp[] = [];
  public listSellerItems: Array<{ name: string; value: string; isChecked: boolean }> = [];
  public selectedSellereId: string = '';
  public selectedCustomerId: string = '';
  public filterSellerChk: boolean = true;
  public filterCustomerChk: boolean = true;



  // Filter Employee
  public vowStatisticSearchCriteria: VowStatisticSearchCriteria = new VowStatisticSearchCriteria();

  private fxCredential!: fxCredential;

  constructor(
    private router: Router,
    private spinnerService: NgxSpinnerService,
    private alertDialogService: AlertdialogService,
    private appPreloadService: AppPreloadService,
    private configService: ConfigService,
    private gridPropertiesService: GridPropertiesService,
    public utilityService: UtilityService,
    private systemUserService: SystemUserService,
    private vowStatisticService: VowStatisticService,
    public customerService: CustomerService,
  ) { }

  public async ngOnInit() {
    await this.defaultMethodsLoad();
  }

  //#region Initialize Data
  async defaultMethodsLoad() {
    this.spinnerService.show();
    this.fxCredential = await this.appPreloadService.fetchFxCredentials();
    let data = await this.systemUserService.getSystemUserByOrigin(OriginValue.Seller.toString());
    if (!this.fxCredential)
      this.router.navigate(["login"]);
    else {
      if (this.fxCredential.origin == "Admin") {
        this.isCheckAdmin = true
      }
      this.spinnerService.hide();
      await this.loadSeller();
      await this.loadCoustomer();
      await this.getGridConfiguration();
      await this.loadVowStatistic();

      this.utilityService.filterToggleSubject.subscribe(flag => {
        this.filterFlag = flag;
      });
    }
  }

  public tagMapper(tags: string[]): void {
    // This function is used for hide selected items in multiselect box
  }

  private async loadSeller() {
    try {
      let data = await this.systemUserService.getSystemUserByOrigin(OriginValue.Seller.toString());
      if (data) {
        this.systemUsers = data;
        data.reverse().forEach(z => { this.listSellerItems.push({ name: z.fullName, value: z.id, isChecked: false }); });
      }
      else
        this.alertDialogService.show('Sellers not load!');
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Sellers not load!');
    }
  }

  private async loadCoustomer() {
    try {
      let data = await this.customerService.getAllCustomers();
      if (data) {
        this.customerlist = data;
        data.reverse().forEach(z => { this.listCustomerItems.push({ name: z.companyName, value: z.id, isChecked: false }); });
      }
      else
        this.alertDialogService.show('Customers not load!');
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Customers not load!');
    }
  }



  private async loadVowStatistic() {
    try {
      this.spinnerService.show();
      if (!this.isCheckAdmin) {
        this.vowStatisticSearchCriteria.sellerIds = [this.fxCredential.id]
      }
      let res = await this.vowStatisticService.getBySearch(this.vowStatisticSearchCriteria, this.skip, this.pageSize);
      if (res) {
        this.gridView = process(res.vowStatistic, { group: this.groups });
        this.gridView.total = res.totalCount;
        this.spinnerService.hide();
      }
      else
        this.spinnerService.hide();
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Vow Statistic not load, Try gain later!');
    }
  }


  public async getGridConfiguration() {
    try {
      this.spinnerService.show();
      this.gridConfig = await this.configService.getGridConfig(this.fxCredential.id, "VowStatistic", "VowStatisticGrid", this.gridPropertiesService.getVowStatisticGrid());
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
        this.gridMasterConfigResponse = await this.configService.getMasterGridConfig("VowStatistic", "VowStatisticGrid");
        if (this.gridMasterConfigResponse)
          this.fields = this.gridMasterConfigResponse.gridDetail;
        else
          this.fields = await this.gridPropertiesService.getVowStatisticGrid();
      }
      this.spinnerService.hide();
    } catch (error: any) {
      this.alertDialogService.show(error.error)
      this.spinnerService.hide();
    }
  }

  public calculateDayDiff(pDate: Date): number {
    let date = new Date(pDate);
    let currentDate = new Date();

    let days = Math.floor(((currentDate.getTime() - date.getTime()) / 1000 / 60 / 60 / 24));
    return days;
  }
  //#endregion

  //#region MultiSelect DDL
  public onMultiSelectChange(val: Array<{ name: string; value: string; isChecked: boolean }>, selectedData: string[]): void {
    val.forEach(element => {
      element.isChecked = false;
    });

    if (selectedData && selectedData.length > 0) {
      val.forEach(element => {
        selectedData.forEach(item => {
          if (element.value.toLocaleLowerCase() == item.toLocaleLowerCase())
            element.isChecked = true;
        });
      });
    }
  }

  public onOpenDropdown(list: Array<{ name: string; value: string; isChecked: boolean }>, e: boolean, selectedData: string[]): boolean {
    if (selectedData?.length == list.map(z => z.name).length)
      e = true;
    else
      e = false;
    return e;
  }

  public onOpenDropdownCustomer(list: Array<{ name: string; value: string; isChecked: boolean }>, e: boolean, selectedData: string[]): boolean {
    if (selectedData?.length == list.map(z => z.name).length)
      e = true;
    else
      e = false;
    return e;
  }

  public handleFilter(e: any): string {
    return e;
  }

  public handleFilterCustomer(e: any): string {
    return e;
  }

  public filterDropdownSearch(allData: SystemUser[], e: any, selectedData: string[]): Array<{ name: string; value: string; isChecked: boolean }> {
    let filterData: any[] = [];
    allData.forEach(z => { filterData.push({ name: z.fullName, value: z.id, isChecked: false }); });
    filterData.forEach(z => {
      if (selectedData?.includes(z.name))
        z.isChecked = true;
    });
    if (e?.length > 0)
      return filterData.filter(z => z.name?.toLowerCase().includes(e?.toLowerCase()));
    else
      return filterData;
  }

  public filterCustomerDropdownSearch(allData: CustLookUp[], e: any, selectedData: string[]): Array<{ name: string; value: string; isChecked: boolean }> {
    let filterData: any[] = [];
    allData.forEach(z => { filterData.push({ name: z.companyName, value: z.id, isChecked: false }); });
    filterData.forEach(z => {
      if (selectedData?.includes(z.name))
        z.isChecked = true;
    });
    if (e?.length > 0)
      return filterData.filter(z => z.name?.toLowerCase().includes(e?.toLowerCase()));
    else
      return filterData;
  }

  public checkAllListItems(list: Array<{ name: string; value: string; isChecked: boolean }>, e: boolean, selectedData: string[]): string[] {
    if (e) {
      selectedData = [];
      selectedData = list.map(z => z.name);
      list.forEach(element => {
        element.isChecked = true;
      });
    }
    else {
      selectedData = [];
      list.forEach(element => {
        element.isChecked = false;
      });
    }
    return selectedData;
  }

  public getCommaSapratedString(vals: any[], isAll: boolean = false): string {
    let names = this.systemUsers.filter(z => vals.includes(z.id)).map(z => z.fullName);

    let name = names.join(',')
    if (!isAll)
      if (name.length > 15)
        name = name.substring(0, 15) + '...';

    return name;
  }


  public getCusCommaSapratedString(vals: any[], isAll: boolean = false): string {
    let names = this.customerlist.filter(z => vals.includes(z.id)).map(z => z.companyName);

    let name = names.join(',')
    if (!isAll)
      if (name.length > 15)
        name = name.substring(0, 15) + '...';

    return name;
  }
  //#endregion



  public handleCustomerFilter(val: Array<{ name: string; value: string; isChecked: boolean }>, selectedData: string[]): void {
    val.forEach(element => {
      element.isChecked = false;
    });
    if (selectedData && selectedData.length > 0) {
      val.forEach(element => {
        selectedData.forEach(item => {
          if (element.value.toLocaleLowerCase() == item.toLocaleLowerCase())
            element.isChecked = true;
        });
      });
    }
  }


  //#region Filter Section
  public onFilterSubmit(form: NgForm) {
    this.skip = 0;
    this.loadVowStatistic();
  }

  public pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.loadVowStatistic();
  }

  public clearFilter(form: NgForm) {
    form.reset();
    this.vowStatisticSearchCriteria = new VowStatisticSearchCriteria();
    this.listSellerItems.forEach(z => { z.isChecked = false; });
    this.listCustomerItems.forEach(z => { z.isChecked = false; });
    this.loadVowStatistic();
  }

  public filterPartToggle() {
    this.utilityService.setfilterToggleValue(this.filterFlag);
  }
  //#endregion
}

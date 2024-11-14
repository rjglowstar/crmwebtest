import { Component, OnInit } from '@angular/core';
import { AlertdialogService } from 'shared/views';
import { NgxSpinnerService } from 'ngx-spinner';
import { AppPreloadService, CommonService, ConfigService, UtilityService } from 'shared/services';
import { City, Country, GridDetailConfig, State } from 'shared/businessobjects';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { NgForm } from '@angular/forms';
import { fxCredential, GridConfig, GridMasterConfig } from 'shared/enitites';
import { CustomerService, GridPropertiesService, LeadService, LoginhistoryService } from '../../services';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { CustLookUp, CustomerLoginHistoryCriteria } from '../../businessobjects';
import { DataResult, GroupDescriptor, process } from '@progress/kendo-data-query';
import { Router } from '@angular/router';

@Component({
  selector: 'app-loginhistory',
  templateUrl: './loginhistory.component.html'
})
export class LoginhistoryComponent implements OnInit {

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
  public customerItems!: CustLookUp[];
  public countryItems!: Country[];
  public selectedCountry: any;
  public stateItems!: State[];
  public selectedState: any;
  public cityItems!: City[];
  public selectedCity: any;
  public listCustomerItems: Array<{ name: string; isChecked: boolean }> = [];

  // Filter Employee
  public loginHistorySearchCriteria: CustomerLoginHistoryCriteria = new CustomerLoginHistoryCriteria();
  private fxCredential!: fxCredential;

  constructor(
    private router: Router,
    private spinnerService: NgxSpinnerService,
    private alertDialogService: AlertdialogService,
    private appPreloadService: AppPreloadService,
    private commonService: CommonService,
    private configService: ConfigService,
    private gridPropertiesService: GridPropertiesService,
    private utilityService: UtilityService,
    private customerService: CustomerService,
    private loginhistoryService: LoginhistoryService
  ) { }

  public async ngOnInit() {
    await this.defaultMethodsLoad();
  }

  //#region Initialize Data
  async defaultMethodsLoad() {
    this.spinnerService.show();
    this.fxCredential = await this.appPreloadService.fetchFxCredentials();
    if (!this.fxCredential)
      this.router.navigate(["login"]);
    else {
      this.spinnerService.hide();
      await this.preLoadDataGathering();
      await this.getGridConfiguration();
      await this.loadLoginHistory();
     
      this.utilityService.filterToggleSubject.subscribe(flag => {
        this.filterFlag = flag;
      });
    }
  }

  private async preLoadDataGathering() {
    await this.getCustomerList();
    await this.getCountryData();
  }

  private async getCustomerList() {
    try {
      this.customerItems = await this.customerService.getAllCustomers();
    }
    catch (error: any) {
      this.alertDialogService.show(error.error);
    }
  }

  private async getCountryData() {
    try {
      this.countryItems = await this.commonService.getCountries();
    }
    catch (error: any) {
      console.error(error);
      this.alertDialogService.show('Something went wrong, Try again later!');
    }
  }

  public onCountryChange(e: string): void {
    try {
      this.spinnerService.show();
      this.selectedCountry = this.countryItems.find((c) => c.name == e);
      if (this.selectedCountry != null)
        this.getStatesByCountryCode(this.selectedCountry.iso2);

      this.loginHistorySearchCriteria.state = null as any;
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      console.error(error);
      this.alertDialogService.show('Something went wrong, Try again later!');
    }
  }

  private async getStatesByCountryCode(country_code: string) {
    try {
      this.stateItems = await this.commonService.getStatesByCountryCode(country_code);
    }
    catch (error: any) {
      this.spinnerService.hide();
      console.error(error);
      this.alertDialogService.show('Something went wrong, Try again later!');
    }
  }

  public onStateChange(e: string): void {
    try {
      this.spinnerService.show();
      this.selectedState = this.stateItems.find((c: State) => c.name == e);
      if (this.selectedState != null)
        this.getCityData(this.selectedCountry, this.selectedState.state_Code);
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      console.error(error);
      this.alertDialogService.show('Something went wrong, Try again later!');
    }
  }

  public async getCityData(selectedCountry: Country, state_code: string) {
    try {
      this.cityItems = await this.commonService.getCitiesByCountryCodeandStateCode(selectedCountry.iso2, state_code);
    }
    catch (error: any) {
      this.spinnerService.hide();
      console.error(error);
      this.alertDialogService.show('Something went wrong, Try again later!');
    }
  }

  public onCityChange(e: string): void {
    try {
      this.selectedCity = this.cityItems.find((c: City) => c.name == e);
    }
    catch (error: any) {
      this.spinnerService.hide();
      console.error(error);
      this.alertDialogService.show('Something went wrong, Try again later!');
    }
  }

  private async loadLoginHistory() {
    try {
      this.spinnerService.show();
      if (this.fxCredential.origin == "Admin")
        this.loginHistorySearchCriteria.isAdmin = true;
      if (this.fxCredential.origin == "Seller")
        this.loginHistorySearchCriteria.sellerId = this.fxCredential.id;
      let res = await this.loginhistoryService.getPaginatedLoginHistory(this.loginHistorySearchCriteria, this.skip, this.pageSize);
      if (res) {
        this.gridView = process(res.customerLoginHistorys, { group: this.groups });
        this.gridView.total = res.totalCount;
        this.spinnerService.hide();
      }
      else
        this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      console.error(error);
      this.alertDialogService.show('Something went wrong, Try again later!');
    }
  }

  public async getGridConfiguration() {
    try {
      this.spinnerService.show();
      this.gridConfig = await this.configService.getGridConfig(this.fxCredential.id, "LoginHistory", "LoginHistoryGrid", this.gridPropertiesService.getLoginHistoryGrid());
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
        this.gridMasterConfigResponse = await this.configService.getMasterGridConfig("LoginHistory", "LoginHistoryGrid");
        if (this.gridMasterConfigResponse)
          this.fields = this.gridMasterConfigResponse.gridDetail;
        else
          this.fields = await this.gridPropertiesService.getLoginHistoryGrid();
      }
      this.spinnerService.hide();
    } catch (error: any) {
      this.alertDialogService.show(error.error)
      this.spinnerService.hide();
    }
  }

  public pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.loadLoginHistory();
  }
  //#endregion

  //#region Filter Section
  public onFilterSubmit(form: NgForm) {
    if (this.loginHistorySearchCriteria.fromDate != null)
      this.loginHistorySearchCriteria.fromDate = this.utilityService.setUTCDateFilter(this.loginHistorySearchCriteria.fromDate);
    if (this.loginHistorySearchCriteria.toDate != null)
      this.loginHistorySearchCriteria.toDate = this.utilityService.setUTCDateFilter(this.loginHistorySearchCriteria.toDate);
    this.skip = 0;
    this.loadLoginHistory();
  }

  public clearFilter(form: NgForm) {
    form.reset();
    this.loginHistorySearchCriteria = new CustomerLoginHistoryCriteria();
    this.loadLoginHistory();
  }

  public filterPartToggle() {
    this.utilityService.setfilterToggleValue(this.filterFlag);
  }
  //#endregion
}

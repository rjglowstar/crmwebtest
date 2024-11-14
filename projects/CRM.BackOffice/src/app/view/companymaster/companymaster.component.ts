import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { DataResult, GroupDescriptor, process } from '@progress/kendo-data-query';
import { Address, City, Country, GridDetailConfig, State } from 'shared/businessobjects';
import { AppPreloadService, CommonService, ConfigService, listAddressTypeItems, UtilityService } from 'shared/services';
import { NgxSpinnerService } from 'ngx-spinner';
import { AlertdialogService } from 'shared/views/common/alertdialog/alertdialog.service';
import { fxCredential, GridConfig, GridMasterConfig } from 'shared/enitites';
import { GridPropertiesService } from '../../services';
import { CompanyService } from '../../services/company/company.service';
import { CompanyResponse, CompanySearchCriteria } from '../../businessobjects';
import { Company } from '../../entities';

@Component({
  selector: 'app-companymaster',
  templateUrl: './companymaster.component.html',
  styleUrls: []
})
export class CompanymasterComponent implements OnInit {

  public isCompanyMaster: boolean = false;
  public groups: GroupDescriptor[] = [];
  public pageSize = 26;
  public skip = 0
  public gridView!: DataResult;
  public filterFlag = true;
  public selectableSettings: SelectableSettings = {
    mode: 'single',
  };
  public mySelection: string[] = [];
  public fields!: GridDetailConfig[];
  public skeletonArray = new Array(18);
  public companyObj: Company = new Company();
  public tempCompanyObj!: string;
  public websitePattern = "(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?"
  public countryItems!: Country[];
  public selectedCountry: any;
  public stateItems!: State[];
  public selectedState: any;
  public cityItems!: City[];
  public selectedCity: any;
  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains'
  };
  public insertFlag: boolean = true;
  public openedDelete: boolean = false;
  public listAddressTypeItems = listAddressTypeItems
  public companyAddress: Address = new Address();
  public searchCriteria: CompanySearchCriteria = new CompanySearchCriteria();
  public isGridConfig: boolean = false;
  private fxCredential!: fxCredential;
  public gridConfig!: GridConfig;
  public gridMasterConfigResponse!: GridMasterConfig;

  public isViewButtons: boolean = false;

  constructor(
    private gridPropertiesService: GridPropertiesService,
    private router: Router,
    private commonService: CommonService,
    public utilityService: UtilityService,
    private companyService: CompanyService,
    private alertDialogService: AlertdialogService,
    private spinnerService: NgxSpinnerService,
    private configService: ConfigService,
    private appPreloadService: AppPreloadService
  ) { }

  async ngOnInit() {
    await this.defaultMethodsLoad();
  }

  public async defaultMethodsLoad() {
    this.fxCredential = await this.appPreloadService.fetchFxCredentials();
    if (!this.fxCredential)
      this.router.navigate(["login"]);

    if (this.fxCredential && this.fxCredential.origin && (this.fxCredential.origin.toLowerCase() == 'admin'))
      this.isViewButtons = true;

    await this.getGridConfiguration();
    await this.getCountryData();
    await this.loadCompany();
    this.utilityService.filterToggleSubject.subscribe(flag => {
      this.filterFlag = flag;
    });
  }

  public async getGridConfiguration() {
    try {
      this.gridConfig = await this.configService.getGridConfig(this.fxCredential.id, "Company", "CompanyGrid", this.gridPropertiesService.getCompanyMasterGrid());
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
        this.gridMasterConfigResponse = await this.configService.getMasterGridConfig("Company", "CompanyGrid");
        if (this.gridMasterConfigResponse)
          this.fields = this.gridMasterConfigResponse.gridDetail;
        else
          this.fields = await this.gridPropertiesService.getCompanyMasterGrid();
      }
    } catch (error: any) {
      this.alertDialogService.show(error.error)
    }
  }

  public async loadCompany() {
    try {
      let res: CompanyResponse = await this.companyService.getCompany(this.searchCriteria, this.skip, this.pageSize);
      this.gridView = process(res.companys, { group: this.groups });
      this.gridView.total = res.totalCount;
    }
    catch (error: any) {
      this.alertDialogService.show(error.error)
    }
  }

  private async getCountryData() {
    try {
      this.countryItems = await this.commonService.getCountries();
    }
    catch (error: any) {
      this.alertDialogService.show(error.error)
    }
  }

  public async onCountryChange(e: string) {
    try {
      this.spinnerService.show();
      this.selectedCountry = this.countryItems.find(c => c.name == e);
      if (this.selectedCountry)
        await this.getStatesByCountryCode(this.selectedCountry.iso2)

      this.searchCriteria.state = null as any;
      this.searchCriteria.city = null as any;
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
      this.stateItems = await this.commonService.getStatesByCountryCode(country_code)
    }
    catch (error: any) {
      this.spinnerService.hide();
      console.error(error);
      this.alertDialogService.show('Something went wrong, Try again later!');
    }
  }

  public async onStateChange(e: string) {
    try {
      this.spinnerService.show();
      this.selectedState = this.stateItems.find((c: State) => c.name == e);
      if (this.selectedState)
        await this.getCityData(this.selectedCountry, this.selectedState.state_Code)

      this.searchCriteria.city = null as any;
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
      this.cityItems = await this.commonService.getCitiesByCountryCodeandStateCode(selectedCountry.iso2, state_code)
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

  public groupChange(groups: GroupDescriptor[]): void {
    try {
      this.groups = groups;
      this.loadCompany();
    }
    catch (error: any) {
      console.error(error);
      this.alertDialogService.show('Something went wrong, Try again later!');
    }
  }

  public pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.loadCompany();
  }

  public selectedRowChange(e: any) {
    this.insertFlag = false;
    this.companyObj = new Company();
    let value: any = e.selectedRows[0].dataItem
    this.companyObj = { ...value };
  }

  public resetAddress() {
    this.stateItems = [];
    this.cityItems = [];
  }

  public filterPartToggle() {
    this.utilityService.setfilterToggleValue(this.filterFlag);
  }

  public onFilterSubmit(form: NgForm) {
    this.skip = 0
    this.loadCompany()
  }

  public clearFilter(form: NgForm) {
    form.reset()
    this.searchCriteria = new CompanySearchCriteria()
    this.loadCompany();
    this.resetAddress();
  }

  public openMasterDialog(): void {
    this.mySelection = [];
    this.companyObj = new Company();
    this.insertFlag = true;
    this.isCompanyMaster = true;
    this.companyAddress = new Address();
  }

  public async openUpdateDialog() {
    this.isCompanyMaster = true;
    let valueCountryExist = this.countryItems.filter((s: any) => {
      return s.name === this.companyObj.address.country
    })
    if (valueCountryExist !== undefined && valueCountryExist !== null && valueCountryExist.length > 0) {
      this.getStatesByCountryCode(valueCountryExist[0].iso2);
      setTimeout(async () => {
        let valueStateExist = this.stateItems.filter((s: any) => {
          return s.name?.toLowerCase() === this.companyObj.address.state?.toLowerCase()
        });
        if (valueStateExist !== undefined && valueStateExist !== null && valueStateExist.length > 0) {
          await this.getCityData(valueCountryExist[0], valueStateExist[0].state_Code)
        }
      }, 200);
    }
    this.companyAddress = { ...this.companyObj.address };
    this.tempCompanyObj = JSON.stringify(this.companyObj);
  }

  public closeMasterDialog(form: NgForm): void {
    this.isCompanyMaster = false;
    this.mySelection = [];
    this.resetForm(form);
  }

  public refreshPage(action: boolean, form: NgForm, messageType: string) {
    this.loadCompany();
    this.mySelection = [];
    if (action)
      this.isCompanyMaster = false;
    this.resetForm(form);
    this.companyObj = new Company();
    this.spinnerService.hide();
    this.utilityService.showNotification(`You have been ${messageType} company successfully!`)
  }

  public resetForm(form?: NgForm) {
    this.companyObj = new Company();
    this.insertFlag = true;
    form?.reset();
    this.resetAddress()
  }

  public openDeleteDialog() {
    try {
      this.alertDialogService.ConfirmYesNo("Are you sure you want to delete?", "Delete")
        .subscribe(async (res: any) => {
          this.mySelection = [];
          if (res.flag) {
            this.spinnerService.show();
            let responseDelete = await this.companyService.deleteCompany(this.companyObj.id)
            if (responseDelete !== undefined && responseDelete !== null) {
              this.loadCompany();
              this.spinnerService.hide();
              this.insertFlag = true;
              this.utilityService.showNotification(`You have been deleted successfully!`)
            }
          }
        })
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error)
    }
  }

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


}
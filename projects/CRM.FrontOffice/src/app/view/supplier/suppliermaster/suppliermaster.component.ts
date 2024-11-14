import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { DataResult, GroupDescriptor, process } from '@progress/kendo-data-query';
import { CountryISO, PhoneNumberFormat, SearchCountryField } from 'ngx-intl-tel-input-gg';
import { NgxSpinnerService } from 'ngx-spinner';
import { City, Country, GridDetailConfig, State } from 'shared/businessobjects';
import { GridConfig, GridMasterConfig } from 'shared/enitites';
import { CommonService, ConfigService, IntlTelType, UtilityService, listAddressTypeItems, listBusinessTypeItems, listMembershipItems, listOrgTypeItems, listOriginItems } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { SupplierResponse, SupplierSearchCriteria } from '../../../businessobjects';
import { Supplier, fxCredential } from '../../../entities';
import { AppPreloadService, GridPropertiesService, SupplierService } from '../../../services';

@Component({
  selector: 'app-suppliernmaster',
  templateUrl: './suppliermaster.component.html',
})

export class SuppliermasterComponent implements OnInit {
  public groups: GroupDescriptor[] = [];
  public pageSize = 26;
  public skip = 0
  public fields!: GridDetailConfig[];
  public gridView!: DataResult;
  public isRegOrganization: boolean = false;
  public filterFlag = true;
  public selectableSettings: SelectableSettings = {
    mode: 'single',
  };
  public openedConfirmationOrganizationDetails = false;
  public skeletonArray = new Array(18);
  public mySelection: string[] = [];

  // CRUD Organization
  public supplierObj: Supplier = new Supplier();
  public listOriginItems = listOriginItems
  public listAddressTypeItems = listAddressTypeItems
  public listOrgTypeItems = listOrgTypeItems
  public listBusinessTypeItems = listBusinessTypeItems
  public listMembershipItems = listMembershipItems
  public websitePattern = "(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?"
  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains'
  };
  public insertFlag: boolean = true;
  public openedDelete: boolean = false;
  public mobileMask = '(999) 000-00-00-00';
  public phoneMask = '(9999) 000-00-00';
  public faxMask = '(999) 000-0000';

  public countryItems!: Country[];
  public selectedCountry: any;
  public stateItems!: State[];
  public selectedState: any;
  public cityItems!: City[];
  public selectedCity: any;

  // Filter Organization
  public supplierCriteria: SupplierSearchCriteria = new SupplierSearchCriteria();

  // Grid Configuration
  public isGridConfig: boolean = false;
  private fxCredential!: fxCredential;
  public gridConfig!: GridConfig;
  public gridMasterConfigResponse!: GridMasterConfig;

  public preferredCountries: CountryISO[] = [CountryISO.Belgium, CountryISO.Thailand, CountryISO.UnitedArabEmirates, CountryISO.UnitedStates];
  public separateDialCode = true;
  public SearchCountryField = SearchCountryField;
  public CountryISO = CountryISO;
  public PhoneNumberFormat = PhoneNumberFormat;
  public primaryMobileNo!: any;
  public IntlTelType = IntlTelType;
  public primaryMobileValidation: boolean = false;

  constructor(
    private router: Router,
    private gridPropertiesService: GridPropertiesService,
    private commonService: CommonService,
    public utilityService: UtilityService,
    private supplierService: SupplierService,
    private alertDialogService: AlertdialogService,
    private spinnerService: NgxSpinnerService,
    private configService: ConfigService,
    private appPreloadService: AppPreloadService) { }

  async ngOnInit() {
    await this.defaultMethodsLoad();
  }

  public async defaultMethodsLoad() {
    this.fxCredential = await this.appPreloadService.fetchFxCredentials();
    if (!this.fxCredential)
      this.router.navigate(["login"]);
    await this.getGridConfiguration();
    await this.getCountryData();
    await this.loadSupplier();
    this.utilityService.filterToggleSubject.subscribe(flag => {
      this.filterFlag = flag;
    });
  }

  public async getGridConfiguration() {
    try {
      this.spinnerService.show();
      this.gridConfig = await this.configService.getGridConfig(this.fxCredential.id, "Supplier", "SupplierGrid", this.gridPropertiesService.getSupplierGrid());
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
        this.gridMasterConfigResponse = await this.configService.getMasterGridConfig("Supplier", "SupplierGrid");
        if (this.gridMasterConfigResponse)
          this.fields = this.gridMasterConfigResponse.gridDetail;
        else
          this.fields = await this.gridPropertiesService.getSupplierGrid();
      }
      this.spinnerService.hide();
    } catch (error: any) {
      this.alertDialogService.show(error.error)
      this.spinnerService.hide();
    }
  }

  //#region List Organization
  public async loadSupplier() {
    try {
      this.spinnerService.show();
      let supplierRes: SupplierResponse = await this.supplierService.getsuppliers(this.supplierCriteria, this.skip, this.pageSize);
      this.gridView = process(supplierRes.suppliers, { group: this.groups });
      this.gridView.total = supplierRes.totalCount;
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.alertDialogService.show(error.error)
      this.spinnerService.hide();
    }
  }

  public groupChange(groups: GroupDescriptor[]): void {
    try {
      this.groups = groups;
      this.loadSupplier();
    }
    catch (error: any) {
      this.alertDialogService.show(error.error)
    }
  }

  public pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.loadSupplier();
  }
  //#endregion List Supplier

  //#region Filter Section
  public filterPartToggle() {
    this.utilityService.setfilterToggleValue(this.filterFlag);
  }

  public selectedRowChange(e: any) {
    this.insertFlag = false;
    this.supplierObj = new Supplier();
    let value: any = e.selectedRows[0].dataItem
    this.supplierObj = { ...value };
  }

  public onFilterSubmit(form: NgForm) {
    this.skip = 0
    this.loadSupplier()
  }

  public clearFilter(form: NgForm) {
    form.reset()
    this.supplierCriteria = new SupplierSearchCriteria()
    this.loadSupplier()
  }
  //#endregion Filter Section

  //#region Supplier Modal
  public openAddOrgDialog(): void {
    this.supplierObj = new Supplier();
    this.insertFlag = true;
    this.isRegOrganization = true;
  }

  public async openUpdateOrgDialog() {
    this.isRegOrganization = true;

    if (this.supplierObj.mobileNo)
      this.primaryMobileNo = this.supplierObj.mobileNo ?? "";

    await this.onCountryChange(this.supplierObj.address.country);
    await this.onStateChange(this.supplierObj.address.state);
  }

  public closeRegOrganDialog(form: NgForm): void {
    this.isRegOrganization = false;
    this.mySelection = [];
    this.resetForm(form);
  }

  public async onOrgSubmit(form: NgForm, action: boolean) {
    try {
      if (form.valid) {
        this.spinnerService.show();
        let messageType: string = "";
        let response: any;

        if (this.primaryMobileNo && this.primaryMobileNo.e164Number)
          this.supplierObj.mobileNo = this.primaryMobileNo.e164Number;

        if (!this.insertFlag) {
          messageType = "updated";
          response = await this.supplierService.supplierUpdate(this.supplierObj);
        }
        else {
          messageType = "registered";
          response = await this.supplierService.supplierRequest(this.supplierObj);
        }

        if (response) {
          this.loadSupplier();
          this.mySelection = [];
          this.spinnerService.hide();
          if (action)
            this.isRegOrganization = false;
          this.resetForm(form);
          this.utilityService.showNotification(`You have been ${messageType} successfully!`)
        }
      }
      else {
        Object.keys(form.controls).forEach(key => {
          form.controls[key].markAsTouched();
        });
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error)
    }
  }

  public resetForm(form?: NgForm) {
    this.supplierObj = new Supplier();
    this.insertFlag = true;
    form?.reset();
  }

  public openDeleteDialog() {
    try {
      // Note: Need to check employee list zero for respective Organization
      this.alertDialogService.ConfirmYesNo("Are you sure you want to delete?", "Delete")
        .subscribe(async (res: any) => {
          this.mySelection = [];
          if (res.flag) {
            this.spinnerService.show();
            let responseDelete = await this.supplierService.deleteSupplier(this.supplierObj.id)
            if (responseDelete !== undefined && responseDelete !== null) {
              this.loadSupplier();
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
  //#endregion Organization Modal

  public openOrgRedirect(pagename: string) {
    this.router.navigate(["/supplier/" + pagename, this.supplierObj.id]);
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

  private async getCountryData() {
    try {
      this.countryItems = await this.commonService.getCountries();
    }
    catch (error: any) {
      console.error(error);
      this.alertDialogService.show('Something went wrong , Try again later!');
    }
  }

  public async onCountryChange(e: string) {
    try {
      this.spinnerService.show();
      this.selectedCountry = this.countryItems.find(c => c.name == e);
      if (this.selectedCountry != null)
        await this.getStatesByCountryCode(this.selectedCountry.iso2)

      this.supplierObj.address.state = null as any;
      this.supplierObj.address.city = null as any;
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      console.error(error);
      this.alertDialogService.show('Something went wrong , Try again later!');
    }
  }

  private async getStatesByCountryCode(country_code: string) {
    try {
      this.stateItems = await this.commonService.getStatesByCountryCode(country_code)
    }
    catch (error: any) {
      this.spinnerService.hide();
      console.error(error);
      this.alertDialogService.show('Something went wrong , Try again later!');
    }
  }

  public async onStateChange(e: string) {
    try {
      this.spinnerService.show();
      this.selectedState = this.stateItems.find((c: State) => c.name == e);
      if (this.selectedState != null)
        await this.getCityData(this.selectedCountry, this.selectedState.state_Code)

      this.supplierObj.address.city = null as any;
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      console.error(error);
      this.alertDialogService.show('Something went wrong , Try again later!');
    }
  }

  public async getCityData(selectedCountry: Country, state_code: string) {
    try {
      this.cityItems = await this.commonService.getCitiesByCountryCodeandStateCode(selectedCountry.iso2, state_code)
    }
    catch (error: any) {
      this.spinnerService.hide();
      console.error(error);
      this.alertDialogService.show('Something went wrong , Try again later!');
    }
  }

  public onCityChange(e: string): void {
    try {
      this.selectedCity = this.cityItems.find((c: City) => c.name == e);
    }
    catch (error: any) {
      this.spinnerService.hide();
      console.error(error);
      this.alertDialogService.show('Something went wrong , Try again later!');
    }
  }

  public checkIntPhoneValidation(event: any, type: string, form: NgForm) {
    if (type === IntlTelType.PrimaryMobile)
      this.primaryMobileValidation = event === null ? true : false;
  }

}
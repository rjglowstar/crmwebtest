import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { NotificationService } from '@progress/kendo-angular-notification';
import { DataResult, GroupDescriptor, process } from '@progress/kendo-data-query';
import * as moment from 'moment';
import { CountryISO, PhoneNumberFormat, SearchCountryField } from 'ngx-intl-tel-input-gg';
import { NgxSpinnerService } from 'ngx-spinner';
import { City, Country, GridDetailConfig, SocialMedia, SocialMediaProvider, State } from 'shared/businessobjects';
import { GridConfig, GridMasterConfig, RegisterModel } from 'shared/enitites';
import { AccountService, CommonService, ConfigService, IntlTelType, UtilityService, listAddressTypeItems, listBranchItems, listCompany, listOriginItems, listSocialMediaProviderItems } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { SystemUserSearchCriteria } from '../../../businessobjects';
import { SystemUser, fxCredential } from '../../../entities';
import { AppPreloadService, GridPropertiesService, SystemUserService } from '../../../services';

@Component({
  selector: 'app-systemusermaster',
  templateUrl: './systemusermaster.component.html',
  styleUrls: ['./systemusermaster.component.css']
})
export class SystemusermasterComponent implements OnInit {
  public groups: GroupDescriptor[] = [];
  public pageSize = 26;
  public skip = 0;
  public fields!: GridDetailConfig[];
  public gridView!: DataResult;
  public isRegSystemUser: boolean = false;
  public filterFlag = true;
  public selectableSettings: SelectableSettings = { mode: 'single' };
  public openedConfirmationSystemUserDetails = false;
  public skeletonArray = new Array(18);
  public mySelection: string[] = [];
  public systemUserObj: SystemUser = new SystemUser();
  public websitePattern = '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?';
  public countryItems!: Country[];
  public selectedCountry: any;
  public stateItems!: State[];
  public selectedState: any;
  public cityItems!: City[];
  public selectedCity: any;
  public socialMediaProviderItems!: SocialMediaProvider[];
  public mobileMask = '(999) 000-00-00';
  public listOriginItems = listOriginItems;
  public listCompany = listCompany;
  public listAddressTypeItems = listAddressTypeItems;
  public listBranchItems = listBranchItems;
  public listSocialMediaProviderItems: string[] = [];
  public selectedSocialMediaProviderItem: any;
  public socialMediaObj: SocialMedia = new SocialMedia();
  public isSocialMediaUpdateFlag: boolean = false;
  public isMessagingFlag: boolean = false;
  public editSocialMediaId: string = '';
  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains',
  };
  public insertFlag: boolean = true;
  public openedDelete: boolean = false;
  public systemUserCriteria: SystemUserSearchCriteria = new SystemUserSearchCriteria();
  public isPermission: boolean = false;
  public pageComeFromPermission!: string
  public systemUserPermi!: SystemUser;
  public modalTitle!: string;
  public isGridConfig: boolean = false;
  private fxCredentials!: fxCredential;
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
    private accountService: AccountService,
    private commonService: CommonService,
    public utilityService: UtilityService,
    private systemUserService: SystemUserService,
    private gridPropertiesService: GridPropertiesService,
    public notificationService: NotificationService,
    private alertDialogService: AlertdialogService,
    private spinnerService: NgxSpinnerService,
    private configService: ConfigService,
    private appPreloadService: AppPreloadService
  ) { }

  async ngOnInit() {
    await this.defaultMethodsLoad();
  }

  //#region Initiate Data
  async defaultMethodsLoad() {
    this.fxCredentials = await this.appPreloadService.fetchFxCredentials();
    if (!this.fxCredentials)
      this.router.navigate(["login"]);

    this.fields = await this.gridPropertiesService.getSystemUserGrid();
    this.utilityService.filterToggleSubject.subscribe((flag) => {
      this.filterFlag = flag;
    });
    await this.getGridConfiguration();
    await this.getCountryData();
    await this.loadSystemUser();
    this.getSocialMediaProviderData();
  }

  public async getGridConfiguration() {
    try {
      this.spinnerService.show();
      this.gridConfig = await this.configService.getGridConfig(this.fxCredentials.id, "SystemUser", "SystemUserGrid", this.gridPropertiesService.getSystemUserGrid());
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
        this.gridMasterConfigResponse = await this.configService.getMasterGridConfig("SystemUser", "SystemUserGrid");
        if (this.gridMasterConfigResponse)
          this.fields = this.gridMasterConfigResponse.gridDetail;
        else
          this.fields = await this.gridPropertiesService.getSystemUserGrid();
      }
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.alertDialogService.show(error);
      this.spinnerService.hide();
    }
  }

  private async getCountryData() {
    try {
      this.countryItems = await this.commonService.getCountries();
    }
    catch (error: any) {
      this.alertDialogService.show(error.error);
    }
  }

  private getSocialMediaProviderData() {
    this.socialMediaProviderItems = [];
    this.listSocialMediaProviderItems = [];
    this.socialMediaProviderItems = listSocialMediaProviderItems;
    this.socialMediaProviderItems.forEach((z) => {
      this.listSocialMediaProviderItems.push(z.providerName);
    });
  }

  public async loadSystemUser() {
    try {
      let emp: any = await this.systemUserService.getSystemUsers(this.systemUserCriteria, this.skip, this.pageSize);
      this.gridView = process(emp.systemUser, { group: this.groups });
      this.gridView.total = emp.totalCount;
    }
    catch (error: any) {
      this.alertDialogService.show(error.error);
    }
  }
  //#endregion

  //#region SystemUser CRUD
  public openAddSystemUserDialog(): void {
    this.systemUserObj = new SystemUser();
    this.insertFlag = true;
    this.isRegSystemUser = true;
  }

  public closeRegSystemUserDialog(form: NgForm): void {
    this.isRegSystemUser = false;
    this.mySelection = [];
    this.resetForm(form);
  }

  public async openUpdateSystemUserDialog() {
    this.isRegSystemUser = true;
    let valueCountryExist = this.countryItems.filter((s: any) => {
      return s.name === this.systemUserObj.address.country;
    });
    if (valueCountryExist !== undefined && valueCountryExist !== null && valueCountryExist.length > 0) {
      await this.getStatesByCountryCode(valueCountryExist[0].iso2);
      setTimeout(async () => {
        let valueStateExist = this.stateItems.filter((s: any) => {
          return s.name?.toLowerCase() === this.systemUserObj.address.state?.toLowerCase();
        });
        if (valueStateExist !== undefined && valueStateExist !== null && valueStateExist.length > 0)
          await this.getCityData(valueCountryExist[0], valueStateExist[0].state_Code);
      }, 200);
    }

    this.systemUserObj.joiningDate = this.getValidJoiningDate(this.systemUserObj.joiningDate);

    this.systemUserObj.socialMedias.forEach(z => {
      this.listSocialMediaProviderItems = this.listSocialMediaProviderItems.filter(a => a != z.provider.providerName);
    });

    this.primaryMobileNo = this.systemUserObj.mobile ?? "";
  }

  public async onSystemUserSubmit(form: NgForm, action: boolean) {
    try {
      if (form.valid) {
        this.spinnerService.show();
        let messageType: string = '';
        let response: boolean;
        this.setExtraFields();

        if (this.primaryMobileNo && this.primaryMobileNo.e164Number)
          this.systemUserObj.mobile = this.primaryMobileNo.e164Number;

        if (!this.insertFlag) {
          messageType = 'updated';
          response = await this.systemUserService.systemUserUpdate(this.systemUserObj);
        }
        else {
          messageType = 'registered';
          response = await this.systemUserService.systemUserRequest(this.systemUserObj);
        }

        if (response) {
          this.spinnerService.hide();
          if (response) {
            this.systemUserCriteria = new SystemUserSearchCriteria();
            this.loadSystemUser();
            this.mySelection = [];
            if (action)
              this.isRegSystemUser = false;
            this.resetForm(form);
            this.utilityService.showNotification(`You have been ${messageType} successfully!`);
          }
          else {
            this.spinnerService.hide();
            this.alertDialogService.show("Something went wrong, Try again later!");
          }
        }
      }
      else {
        this.spinnerService.hide();
        Object.keys(form.controls).forEach((key) => {
          form.controls[key].markAsTouched();
        });
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public openDeleteDialog() {
    try {
      this.alertDialogService.ConfirmYesNo("Are you sure you want to delete?", "Delete")
        .subscribe(async (res: any) => {
          this.mySelection = [];
          if (res.flag) {
            this.spinnerService.show();
            let responseDelete = await this.systemUserService.deleteSystemUser(this.systemUserObj.id)
            if (responseDelete !== undefined && responseDelete !== null) {
              this.spinnerService.hide();
              this.loadSystemUser();
              this.insertFlag = true;
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

  public async closeDeleteDialog(value: string) {
    if (value == 'yes') {
      let responseDelete = await this.systemUserService.deleteSystemUser(this.systemUserObj.id);
      if (responseDelete !== undefined && responseDelete !== null) {
        this.loadSystemUser();
        this.insertFlag = true;
        this.utilityService.showNotification(`You have been deleted successfully!`);
      }
    }
    this.openedDelete = false;
  }

  private setExtraFields() {
    this.systemUserObj.joiningDate = this.utilityService.setUTCDateFilter(this.systemUserObj.joiningDate);
    this.systemUserObj.fullName = this.systemUserObj.name.firstName + ' ' + (this.systemUserObj.name.middleName ?? '') + ' ' + this.systemUserObj.name.lastName;
  }
  //#endregion

  //#region OnChange Functions
  public pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.loadSystemUser();
  }

  public filterPartToggle() {
    this.utilityService.setfilterToggleValue(this.filterFlag);
  }

  public groupChange(groups: GroupDescriptor[]): void {
    try {
      this.groups = groups;
      this.loadSystemUser();
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
      if (this.selectedCountry)
        this.getStatesByCountryCode(this.selectedCountry.iso2);

      this.systemUserObj.address.state = null as any;
      this.systemUserObj.address.city = null as any;
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
      if (this.selectedState)
        this.getCityData(this.selectedCountry, this.selectedState.state_Code);

      this.systemUserObj.address.city = null as any;
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

  public resetForm(form?: NgForm) {
    this.insertFlag = true;
    form?.reset();
    this.systemUserObj = new SystemUser();
    this.getSocialMediaProviderData();
  }

  public async selectedRowChange(e: any) {
    this.insertFlag = false;
    this.systemUserObj = new SystemUser();
    if (e.selectedRows != null && e.selectedRows.length > 0) {
      let value: SystemUser = e.selectedRows[0].dataItem;
      value.joiningDate = this.getValidJoiningDate(value.joiningDate);
      this.systemUserObj = JSON.parse(JSON.stringify(value));
    }
  }

  public getValidJoiningDate(date: any): Date {
    const day = moment(date).date();
    const month = moment(date).month();
    const year = moment(date).year();
    var newDate = new Date(year, month, day);
    return newDate;
  }

  public openSystemUserDetails() {
    this.router.navigate(['/systemuser/details', this.systemUserObj.id]);
  }

  public onFilterSubmit(form: NgForm) {
    this.skip = 0;
    this.loadSystemUser();
  }

  public clearFilter(form: NgForm) {
    form.reset();
    this.systemUserCriteria = new SystemUserSearchCriteria();
    this.loadSystemUser();
    this.getSocialMediaProviderData();
  }

  public openGridConfigDialog(): void {
    this.isGridConfig = true;
  }

  public setNewGridConfig(gridConfig: GridConfig) {
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
  //#endregion

  //#region SocialMedia CRUD
  public onSocialMediaProviderChange(e: any) {
    let socialMediaProvider = this.socialMediaProviderItems.find(z => z.providerName == e);
    if (socialMediaProvider?.mediaType == 'Messaging' || socialMediaProvider?.mediaType == '3')
      this.isMessagingFlag = true;
    else
      this.isMessagingFlag = false;
  }

  public onSocialMediaSubmit() {
    let socialMediaProvider = this.socialMediaProviderItems.find((z) => z.providerName == this.selectedSocialMediaProviderItem);
    let socialMedia: SocialMedia = new SocialMedia();
    socialMedia.provider = socialMediaProvider ?? new SocialMediaProvider();
    socialMedia.mobileNumber = this.socialMediaObj.mobileNumber;
    socialMedia.profileName = this.socialMediaObj.profileName;
    this.systemUserObj.socialMedias.push(socialMedia);
    this.listSocialMediaProviderItems = this.listSocialMediaProviderItems.filter((z) => z != this.selectedSocialMediaProviderItem);

    this.socialMediaObj.mobileNumber = '';
    this.socialMediaObj.profileName = '';
    this.selectedSocialMediaProviderItem = '';
  }

  public onSocialMediaUpdate() {
    let socialMediaProvider = this.socialMediaProviderItems.find((z) => z.providerName == this.selectedSocialMediaProviderItem);
    this.systemUserObj.socialMedias.forEach((z) => {
      if (z.provider.providerName == this.editSocialMediaId) {
        z.provider = socialMediaProvider ?? new SocialMediaProvider();
        z.mobileNumber = this.socialMediaObj.mobileNumber;
        z.profileName = this.socialMediaObj.profileName;
      }
    });

    this.listSocialMediaProviderItems = this.listSocialMediaProviderItems.filter((z) => z != this.selectedSocialMediaProviderItem);
    this.socialMediaObj.mobileNumber = '';
    this.socialMediaObj.profileName = '';
    this.selectedSocialMediaProviderItem = '';
    this.editSocialMediaId = '';
    this.isSocialMediaUpdateFlag = false;
  }

  public onSocialMediaEdit(e: any) {
    if (e.provider != null && e.provider != undefined) {
      if (e.provider.mediaType == 'Messaging' || e.provider.mediaType == '3')
        this.isMessagingFlag = true;
      else
        this.isMessagingFlag = false;
      this.editSocialMediaId = e.provider.providerName;
      this.listSocialMediaProviderItems.push(e.provider.providerName);
      this.selectedSocialMediaProviderItem = e.provider.providerName;
    }
    this.socialMediaObj.mobileNumber = e.mobileNumber;
    this.socialMediaObj.profileName = e.profileName;

    this.isSocialMediaUpdateFlag = true;
  }

  public onSocialMediaDelete(e: any) {
    this.alertDialogService.ConfirmYesNo('Are you sure you want to delete?', 'Delete')
      .subscribe(async (res: any) => {
        if (res.flag)
          this.systemUserObj.socialMedias = this.systemUserObj.socialMedias.filter((z) => z.provider.providerName != e.provider.providerName);
      });
  }
  //#endregion

  //#region SetPermission SystemUser
  public setPermission(systemUser: SystemUser) {
    this.systemUserPermi = systemUser;
    this.pageComeFromPermission = "SystemUser";
    this.isPermission = true;
    this.modalTitle = systemUser.fullName;
  }
  //#endregion

  //#region User Register
  public async addUserBySystemUser(emp: SystemUser) {
    this.alertDialogService.ConfirmYesNo('Are you sure you want to add user from this systemUser?', 'Add New User')
      .subscribe(async (res: any) => {
        try {
          if (res.flag) {
            this.spinnerService.show();

            let userObj: RegisterModel = new RegisterModel();
            userObj.ident = emp.id;
            userObj.origin = emp.origin;
            userObj.email = emp.email;
            userObj.phoneNumber = emp.mobile;
            userObj.password = emp.email;
            userObj.confirmPassword = emp.email;

            var result = await this.accountService.insertUser(userObj);
            if (result == "Success") {
              this.spinnerService.hide();
              this.utilityService.showNotification(`New user register successfully!`)
              this.loadSystemUser();
              this.resetForm();
            }
            else {
              this.spinnerService.hide();
              var errorObj = JSON.parse(result);
              console.error(result);
              this.alertDialogService.show(errorObj[0]?.description ?? "Something went wrong, Try again later!");
            }
          }
        }
        catch (error: any) {
          console.error(error);
          this.spinnerService.hide();
          this.alertDialogService.show("User not register, Try again later!");
        }
      });
  }

  public checkIntPhoneValidation(event: any, type: string, form: NgForm) {
    if (type === IntlTelType.PrimaryMobile)
      this.primaryMobileValidation = event === null ? true : false;
  }
  //#endregion 

}
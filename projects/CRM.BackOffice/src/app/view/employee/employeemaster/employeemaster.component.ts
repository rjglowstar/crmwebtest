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
import { GridConfig, GridMasterConfig, RegisterModel, SystemUserPermission, fxCredential } from 'shared/enitites';
import { AccountService, AppPreloadService, CommonService, ConfigService, IntlTelType, UtilityService, listAddressTypeItems, listBranchItems, listOriginItems, listSocialMediaProviderItems } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { BranchDNorm, CommonResponse, EmployeeSearchCriteria, OrganizationDNorm } from '../../../businessobjects';
import { Department, Employee } from '../../../entities';
import { EmployeeService, GridPropertiesService, OrganizationService } from '../../../services';

@Component({
  selector: 'app-employeemaster',
  templateUrl: './employeemaster.component.html',
  styleUrls: ['./employeemaster.component.css'],
})
export class EmployeemasterComponent implements OnInit {
  public groups: GroupDescriptor[] = [];
  public pageSize = 26;
  public skip = 0;
  public fields!: GridDetailConfig[];
  public gridView!: DataResult;
  public isRegEmployee: boolean = false;
  public filterFlag = true;
  public selectableSettings: SelectableSettings = { mode: 'single' };
  public openedConfirmationEmployeeDetails = false;
  public skeletonArray = new Array(18);
  public mySelection: string[] = [];

  // CRUD Employee
  public employeeObj: Employee = new Employee();
  public websitePattern = '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?';
  public countryItems!: Country[];
  public selectedCountry: any;
  public organizationDNormItems!: OrganizationDNorm[];
  public selectedOrganizationDNormItems?: { text: string; value: string };
  public branchDNormItems!: BranchDNorm[];
  public selectedBranchDNormItems?: { text: string, value: string };
  public deptItems!: Department[];
  public selectedDeptItems?: { text: string, value: string };
  public stateItems!: State[];
  public selectedState: any;
  public cityItems!: City[];
  public selectedCity: any;
  public socialMediaProviderItems!: SocialMediaProvider[];
  public mobileMask = '(999) 000-00-00';

  public listOriginItems = listOriginItems;
  public listAddressTypeItems = listAddressTypeItems;
  public listBranchItems = listBranchItems;
  public listSocialMediaProviderItems: string[] = [];
  public selectedSocialMediaProviderItem: any;
  public socialMediaObj: SocialMedia = new SocialMedia();

  public listOrganizationDNormItems: Array<{ text: string; value: string }> = [];
  public listBranchDNormItems: Array<{ text: string; value: string }> = [];
  public listDepartmentItems: Array<{ text: string; value: string }> = [];
  public isSocialMediaUpdateFlag: boolean = false;
  public isMessagingFlag: boolean = false;
  public editSocialMediaId: string = '';

  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains',
  };
  public insertFlag: boolean = true;
  public openedDelete: boolean = false;

  // Filter Employee
  public employeeCriteria: EmployeeSearchCriteria = new EmployeeSearchCriteria();

  //Emp Permission
  public isPermission: boolean = false;
  public pageComeFromPermission!: string
  public empPermi!: Employee;
  public modalTitle!: string;

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
  public isCanDeleteEmployee: boolean = false;

  public isViewButtons: boolean = false;

  constructor(
    private router: Router,
    private commonService: CommonService,
    public utilityService: UtilityService,
    private employeeService: EmployeeService,
    private gridPropertiesService: GridPropertiesService,
    public notificationService: NotificationService,
    private alertDialogService: AlertdialogService,
    private organizationService: OrganizationService,
    private spinnerService: NgxSpinnerService,
    private accountService: AccountService,
    private configService: ConfigService,
    private appPreloadService: AppPreloadService
  ) { }

  async ngOnInit() {
    await this.defaultMethodsLoad();
  }

  //#region Initiate Data
  public async defaultMethodsLoad() {
    this.fxCredential = await this.appPreloadService.fetchFxCredentials();
    if (!this.fxCredential)
      this.router.navigate(["login"]);

    if (this.fxCredential && this.fxCredential.origin && (this.fxCredential.origin.toLowerCase() == 'admin' || this.fxCredential.origin.toLowerCase() == 'opmanager'))
      this.isViewButtons = true;

    await this.getGridConfiguration();
    this.utilityService.filterToggleSubject.subscribe((flag) => {
      this.filterFlag = flag;
    });
    await this.getOrganizationDNormData();
    await this.getCountryData();
    await this.loadEmployee();
    this.getSocialMediaProviderData();
    await this.setUserRights();
  }

  public async setUserRights() {
    let userPermissions: SystemUserPermission = new SystemUserPermission();
    let sesValue = sessionStorage.getItem("userPermission");
    if (sesValue)
      userPermissions = JSON.parse(sesValue) as SystemUserPermission;
    if (userPermissions.actions.length > 0) {
      let CanDeleteEmployee = userPermissions.actions.find(z => z.name == "CanDeleteEmployee");
      if (CanDeleteEmployee != null)
        this.isCanDeleteEmployee = true;
    }
  }

  public async getGridConfiguration() {
    try {
      this.spinnerService.show();
      this.gridConfig = await this.configService.getGridConfig(this.fxCredential.id, "Employee", "EmployeeGrid", await this.gridPropertiesService.getEmployeeGrid());
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
        this.gridMasterConfigResponse = await this.configService.getMasterGridConfig("Employee", "EmployeeGrid");
        if (this.gridMasterConfigResponse)
          this.fields = this.gridMasterConfigResponse.gridDetail;
        else
          this.fields = await this.gridPropertiesService.getEmployeeGrid();
      }
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.alertDialogService.show(error);
      this.spinnerService.hide();
    }
  }

  private async getOrganizationDNormData() {
    try {
      this.organizationDNormItems = await this.organizationService.getOrganizationDNorm();
      this.organizationDNormItems.forEach((z) => {
        this.listOrganizationDNormItems.push({ text: z.name, value: z.id });
      });
    }
    catch (error: any) {
      console.error(error);
      this.alertDialogService.show(error.error);
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

  public async loadEmployee() {
    try {
      let emp: any = await this.employeeService.getEmployees(this.employeeCriteria, this.skip, this.pageSize);
      this.gridView = process(emp.employees, { group: this.groups });
      this.gridView.total = emp.totalCount;
    }
    catch (error: any) {
      this.alertDialogService.show(error.error);
    }
  }
  //#endregion

  //#region Employee CRUD
  public openAddEmpDialog(): void {
    this.employeeObj = new Employee();
    this.insertFlag = true;
    this.isRegEmployee = true;
    this.listBranchDNormItems = [];
    this.listDepartmentItems = [];
  }

  public closeRegEmpDialog(form: NgForm): void {
    this.isRegEmployee = false;
    this.mySelection = [];
    this.resetForm(form);
  }

  public async openUpdateEmpDialog() {
    this.isRegEmployee = true;
    let valueCountryExist = this.countryItems.filter((s: any) => {
      return s.name === this.employeeObj.address.country;
    });
    if (valueCountryExist !== undefined && valueCountryExist !== null && valueCountryExist.length > 0) {
      this.getStatesByCountryCode(valueCountryExist[0].iso2);
      setTimeout(async () => {
        let valueStateExist = this.stateItems.filter((s: any) => {
          return s.name?.toLowerCase() === this.employeeObj.address.state?.toLowerCase();
        });
        if (valueStateExist !== undefined && valueStateExist !== null && valueStateExist.length > 0)
          await this.getCityData(valueCountryExist[0], valueStateExist[0].state_Code);
      }, 200);
    }

    this.employeeObj.joiningDate = this.getValidJoiningDate(this.employeeObj.joiningDate);

    this.selectedOrganizationDNormItems = { text: this.employeeObj.organization.name, value: this.employeeObj.organization.id };
    this.selectedBranchDNormItems = { text: this.employeeObj.branch.name, value: this.employeeObj.branch.name };
    this.selectedDeptItems = { text: this.employeeObj.department, value: this.employeeObj.departmentId };
    this.onOrganizationDNormChange(this.selectedOrganizationDNormItems, false, true);

    this.employeeObj.socialMedias.forEach(z => {
      this.listSocialMediaProviderItems = this.listSocialMediaProviderItems.filter(a => a != z.provider.providerName);
    });

    this.primaryMobileNo = this.employeeObj.mobile ?? "";
  }

  public async onEmpSubmit(form: NgForm, action: boolean) {
    try {
      if (form.valid) {
        this.spinnerService.show();
        let messageType: string = '';
        let response: CommonResponse;
        this.setExtraFields();
        if (!this.insertFlag) {
          messageType = 'updated';
          response = await this.employeeService.employeeUpdate(this.employeeObj);
        }
        else {
          messageType = 'registered';
          response = await this.employeeService.employeeRequest(this.employeeObj);
        }

        if (response) {
          this.spinnerService.hide();
          if (response.isSuccess) {
            this.employeeCriteria = new EmployeeSearchCriteria();
            this.loadEmployee();
            this.mySelection = [];
            if (action)
              this.isRegEmployee = false;
            this.resetForm(form);
            this.utilityService.showNotification(`You have been ${messageType} successfully!`);
          }
          else {
            this.alertDialogService.show(response.message);

            if (response?.errorMessage?.length > 0)
              console.error(response.errorMessage);
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
            let responseDelete = await this.employeeService.deleteEmployee(this.employeeObj.id)
            if (responseDelete !== undefined && responseDelete !== null) {
              this.spinnerService.hide();
              this.loadEmployee();
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
      let responseDelete = await this.employeeService.deleteEmployee(this.employeeObj.id);
      if (responseDelete !== undefined && responseDelete !== null) {
        this.loadEmployee();
        this.insertFlag = true;
        this.utilityService.showNotification(`You have been deleted successfully!`);
      }
    }
    this.openedDelete = false;
  }

  private setExtraFields() {
    this.employeeObj.joiningDate = this.utilityService.setUTCDateFilter(this.employeeObj.joiningDate);
    this.employeeObj.fullName = this.employeeObj.name.firstName + ' ' + (this.employeeObj.name.middleName ?? '') + ' ' + this.employeeObj.name.lastName;
    if (this.primaryMobileNo && this.primaryMobileNo.e164Number)
      this.employeeObj.mobile = this.primaryMobileNo.e164Number;
  }
  //#endregion

  //#region OnChange Functions
  public pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.loadEmployee();
  }

  public filterPartToggle() {
    this.utilityService.setfilterToggleValue(this.filterFlag);
  }

  public groupChange(groups: GroupDescriptor[]): void {
    try {
      this.groups = groups;
      this.loadEmployee();
    }
    catch (error: any) {
      this.alertDialogService.show(error.error);
    }
  }

  public async onOrganizationDNormChange(e: any, isFilter: boolean = false, isEdit: boolean = false) {
    const orgDNorm = this.organizationDNormItems.find(z => z.id == e.value);

    if (orgDNorm != undefined && orgDNorm != null) {
      if (isFilter)
        this.employeeCriteria.organizationId = orgDNorm.id;
      else
        this.employeeObj.organization = { ...orgDNorm };
    }

    this.spinnerService.show();

    this.employeeCriteria.branch = null as any;
    this.employeeCriteria.departmentId = null as any;

    if (isFilter) {
      await this.getBranchDNormByOrgId(this.employeeCriteria.organizationId, isEdit);
      await this.getDepartmentsByOrgId(this.employeeCriteria.organizationId, isEdit, true);
    }
    else {
      await this.getBranchDNormByOrgId(this.employeeObj.organization.id, isEdit);
      await this.getDepartmentsByOrgId(this.employeeObj.organization.id, isEdit, false);
    }
  }

  private async getBranchDNormByOrgId(id: string, isEdit: boolean = false) {
    try {
      this.branchDNormItems = await this.organizationService.getBranchDNormByOrganizationId(id);

      if (!isEdit)
        this.selectedBranchDNormItems = undefined;

      this.listBranchDNormItems = [];
      this.branchDNormItems.forEach((z) => { this.listBranchDNormItems.push({ text: z.name, value: z.name }); });
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  private async getDepartmentsByOrgId(id: string, isEdit: boolean = false, isFilter: boolean = false) {
    try {
      this.deptItems = await this.organizationService.getDepartmentByOrganizationId(id);

      if (isFilter == true)
        this.deptItems = this.deptItems.filter(z => z.branchName == this.employeeCriteria.branch);
      else {
        if (this.selectedBranchDNormItems && this.employeeObj.branch)
          this.deptItems = this.deptItems.filter(z => z.branchName == this.employeeObj.branch.name);
      }

      if (!isEdit)
        this.selectedDeptItems = undefined;

      this.listDepartmentItems = [];
      this.deptItems.forEach(z => { this.listDepartmentItems.push({ text: z.name, value: z.id }); });
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public onBranchDNormChange(e: any, isFilter: boolean = false) {
    let branchDNorm: any;

    if (isFilter == true)
      branchDNorm = this.branchDNormItems.find(z => z.name == e);
    else
      branchDNorm = this.branchDNormItems.find(z => z.name == e.value);

    if (branchDNorm != undefined && branchDNorm != null) {
      this.employeeCriteria.departmentId = null as any;

      if (isFilter) {
        this.employeeCriteria.branch = branchDNorm.name;
        this.getDepartmentsByOrgId(this.employeeCriteria.organizationId, false, isFilter);
      }
      else {
        this.employeeObj.branch = { ...branchDNorm };
        this.getDepartmentsByOrgId(this.employeeObj.organization.id, false, isFilter);
      }
    }
  }

  public onDepartmentChange(e: any, isFilter: boolean = false) {
    const dept = this.deptItems.find(z => z.id == e.value);
    if (dept != undefined && dept != null) {
      if (isFilter) {
        this.employeeCriteria.departmentId = dept.id;
      }
      else {
        this.employeeObj.department = dept.name ?? '';
        this.employeeObj.departmentId = dept.id ?? '';
      }
    }
  }

  public onCountryChange(e: string): void {
    try {
      this.spinnerService.show();
      this.selectedCountry = this.countryItems.find((c) => c.name == e);
      if (this.selectedCountry)
        this.getStatesByCountryCode(this.selectedCountry.iso2);

      this.employeeObj.address.state = null as any;
      this.employeeObj.address.city = null as any;
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

      this.employeeObj.address.city = null as any;
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
    this.employeeObj = new Employee();
    this.employeeCriteria = new EmployeeSearchCriteria();
    this.getSocialMediaProviderData();
  }

  public selectedRowChange(e: any) {
    this.insertFlag = false;
    this.employeeObj = new Employee();
    if (e.selectedRows != null && e.selectedRows.length > 0) {
      let value: Employee = e.selectedRows[0].dataItem;
      value.joiningDate = this.getValidJoiningDate(value.joiningDate);
      this.employeeObj = JSON.parse(JSON.stringify(value));
    }
  }

  public getValidJoiningDate(date: any): Date {
    const day = moment(date).date();
    const month = moment(date).month();
    const year = moment(date).year();
    var newDate = new Date(year, month, day);
    return newDate;
  }

  public openEmpDetails() {
    this.router.navigate(['/employee/details', this.employeeObj.id]);
  }

  public onFilterSubmit(form: NgForm) {
    this.skip = 0;
    this.loadEmployee();
  }

  public clearFilter(form: NgForm) {
    form.reset();
    this.employeeCriteria = new EmployeeSearchCriteria();
    this.loadEmployee();
    this.getSocialMediaProviderData();
    this.listBranchDNormItems = [];
    this.listDepartmentItems = [];
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
    this.employeeObj.socialMedias.push(socialMedia);
    this.listSocialMediaProviderItems = this.listSocialMediaProviderItems.filter((z) => z != this.selectedSocialMediaProviderItem);

    this.socialMediaObj.mobileNumber = '';
    this.socialMediaObj.profileName = '';
    this.selectedSocialMediaProviderItem = '';
  }

  public onSocialMediaUpdate() {
    let socialMediaProvider = this.socialMediaProviderItems.find((z) => z.providerName == this.selectedSocialMediaProviderItem);
    this.employeeObj.socialMedias.forEach((z) => {
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
          this.employeeObj.socialMedias = this.employeeObj.socialMedias.filter((z) => z.provider.providerName != e.provider.providerName);
      });
  }
  //#endregion

  //#region SetPermission Employee
  public setPermission(emp: Employee) {
    this.empPermi = emp;
    this.pageComeFromPermission = "Employee";
    this.isPermission = true;
    this.modalTitle = emp.fullName;
  }
  //#endregion

  //#region User Register
  public async addUserByEmployee(emp: Employee) {
    try {
      this.alertDialogService.ConfirmYesNo('Are you sure you want to add user from this employee?', 'Add New User')
        .subscribe(async (res: any) => {
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
              this.loadEmployee();
              this.resetForm();
            }
            else {
              this.spinnerService.hide();
              var errorObj = JSON.parse(result);
              console.error(result);
              this.alertDialogService.show(errorObj[0]?.description ?? "Something went wrong, Try again later!");
            }
          }
        });
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }
  //#endregion

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

  public checkIntPhoneValidation(event: any, type: string, form: NgForm) {
    if (type === IntlTelType.PrimaryMobile)
      this.primaryMobileValidation = event === null ? true : false;
  }

}
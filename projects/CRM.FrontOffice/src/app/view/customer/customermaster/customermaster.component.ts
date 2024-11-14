import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { NotificationService } from '@progress/kendo-angular-notification';
import { DataResult, GroupDescriptor, SortDescriptor, process } from '@progress/kendo-data-query';
import * as moment from 'moment';
import { CountryISO, PhoneNumberFormat, SearchCountryField } from 'ngx-intl-tel-input-gg';
import { NgxSpinnerService } from 'ngx-spinner';
import { SortFieldDescriptor } from 'projects/CRM.Customer/src/app/businessobjects/common/sortfielddescriptor';
import { City, Country, GridDetailConfig, SocialMedia, SocialMediaProvider, State } from 'shared/businessobjects';
import { AzureFileStore, GridConfig, GridMasterConfig, RegisterModel, SystemUserPermission, fxCredential } from 'shared/enitites';
import { AccountService, AppPreloadService, CommonService, ConfigService, FileStoreService, FileStoreTypes, IntlTelType, UtilityService, listBusinessTypeItems, listCustomerOriginItems, listSocialMediaProviderItems } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { CustomerSearchCriteria, CustomerSearchResponse, StoneProposalMailData } from '../../../businessobjects';
import { CustomerItemData } from '../../../businessobjects/customer/CustomerItemData';
import { Customer, CustomerDNorm, SystemUser, SystemUserDNorm } from '../../../entities';
import { CustomerPreferenceService, CustomerService, CustomerVerificationService, GridPropertiesService, StoneProposalService, SystemUserService } from '../../../services';
import { parsePhoneNumberFromString, isValidNumber } from 'libphonenumber-js';

@Component({
  selector: 'app-customermaster',
  templateUrl: './customermaster.component.html',
  styleUrls: ['./customermaster.component.css']
})

export class CustomerMasterComponent implements OnInit {
  @ViewChild('thumbnailImageInvitation') thumbnailImageInvitation!: ElementRef<HTMLInputElement>;
  public isCustVerification: boolean = false;
  public isGridConfig: boolean = false;
  public fxCredential!: fxCredential;
  public gridConfig!: GridConfig;
  public gridMasterConfigResponse!: GridMasterConfig;
  public filterFlag = true;
  public sort: SortDescriptor[] = [];
  public groups: GroupDescriptor[] = [];
  public pageSize = 26;
  public skip = 0;
  public fields!: GridDetailConfig[];
  public gridView!: DataResult;
  public isRegSystemUser: boolean = false;
  public selectableSettings: SelectableSettings = { mode: 'single' };
  public skeletonArray = new Array(18);
  public mySelection: string[] = [];
  // Filter CustomerVerificationSearchCriteria
  public customerSearchCriteria: CustomerSearchCriteria = new CustomerSearchCriteria();
  // public registerCustomer = new RegisterCustomer();
  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains',
  };
  // accept or Rejectcustomer
  public selectedOrganizationDNormItem?: string;
  public selectedBranchDNormItem?: string;
  public selectedSellerItem?: string;
  // InternationalphoneNumber
  separateDialCode = true;
  SearchCountryField = SearchCountryField;
  CountryISO = CountryISO;
  CountryISOs = CountryISO as { [key: string]: string };
  PhoneNumberFormat = PhoneNumberFormat;
  preferredCountries: CountryISO[] = [CountryISO.Belgium, CountryISO.Thailand, CountryISO.UnitedArabEmirates, CountryISO.UnitedStates];
  intMobileNo: any;
  // view Attached Document
  public isShowDocument: boolean = false;
  public imgSrcDisplay!: string
  // CRUD Customer Verification
  public selectedSellerItems?: { text: string; value: string };
  public isAddDialogopen: boolean = false;
  public isCustInviDialogOpen: boolean = false;
  public customerdetailsobj: Customer = new Customer();
  public mobileMask = '(999) 000-00-00';
  public phoneMask = '(9999) 000-00-00';
  public faxMask = '(999) 000-0000';
  public countryItems!: Country[];
  public selectedCountry: any;
  public excelFile: any[] = [];
  public stateItems!: State[];
  public selectedState: any;
  public cityItems!: City[];
  public selectedCity: any;
  public isRegCustomer: boolean = false;
  public insertFlag: boolean = true;
  public imagePreviewbusiness: any;
  public imagePreviewprofile: any;
  public imagePreviewphoto: any;
  public localform!: NgForm;
  public isImgselectedProfile: boolean = false;
  public isImgselectedPhotoIdent: boolean = false;
  public isImgselectedBusiness: boolean = false;
  public isActive: boolean = false;
  public isOnline: boolean = false;
  public iseditcustomers: boolean = false;
  public socialMediaProviderItems!: SocialMediaProvider[];
  public listSocialMediaProviderItems: string[] = [];
  public selectedSocialMediaProviderItem: any;
  public socialMediaObj: SocialMedia = new SocialMedia();
  public isSocialMediaUpdateFlag: boolean = false;
  public isMessagingFlag: boolean = false;
  public editSocialMediaId: string = '';
  public customer: Customer = new Customer();
  public listSellerItems: Array<{ text: string; value: string }> = [];
  public sellerItems!: SystemUser[];
  public fileStore: AzureFileStore[] = [];
  public cloneFileStore: AzureFileStore[] = [];
  public profileFileStore: AzureFileStore = new AzureFileStore();
  public photoIdentityFileStore: AzureFileStore = new AzureFileStore();
  public businessIndentityFileStore: AzureFileStore = new AzureFileStore();
  @ViewChild('profileFileupload', { static: false }) ProfileFileupload!: ElementRef;
  @ViewChild('photoIdentityFileupload', { static: false }) PhotoIdentityFileupload!: ElementRef;
  @ViewChild('businessIndentityFileupload', { static: false }) BusinessIndentityFileupload!: ElementRef;
  public currentFile!: File;
  public profileImageErrorFlag: boolean = false;
  public profileImageModel: any = undefined;
  public photoIdentityErrorFlag: boolean = false;
  public photoIdentityModel: any = undefined;
  public businessIdentityErrorFlag: boolean = false;
  public businessIdentityModel: any = undefined;
  public showUploadProfile = true;
  public showUploadIdent = true;
  public showUploadBusiness = true;
  public fileUploadItems: Array<{ type: string, file: File }> = new Array<{ type: string, file: File }>();
  public listBusinessTypeItems = listBusinessTypeItems;
  public listCustomerOriginItems = listCustomerOriginItems;
  public FileStoreTypes = FileStoreTypes;
  public isAdminRole = false;
  public primaryMobileNo!: any;
  public IntlTelType = IntlTelType;
  public primaryMobileValidation: boolean = false;
  public secondaryMobileNo!: any;
  public secondaryMobileValidation: boolean = false;
  public isCanEditCustomer: boolean = false;
  public isCanDeleteCustomer: boolean = false;
  public businessMobileNo!: any;
  public businessMobileValidation: boolean = false;
  public inputState: string = "";
  public inputCity: string = "";
  public cloneSellerId: string = "";
  public businessIndentityFileFound: boolean = false;
  public photoIdentityFileFound: boolean = false;
  public profileImageFlag: boolean = false;
  public photoIdentityFlag: boolean = false;
  public businessIdentityFlag: boolean = false;
  public profileImageFileFound: boolean = false;
  public isSellerRole: boolean = false;
  public sendInvitationCust: CustomerDNorm[] = [];
  public sellerId: string = "";
  public invitationEmailSubject: string = "";
  public imagePreviewInvitation: any;
  public isImgselectedInvitation: boolean = false;
  public customerInvitationMail: StoneProposalMailData = new StoneProposalMailData();

  constructor(
    public customerService: CustomerService,
    private customerPrefService: CustomerPreferenceService,
    private router: Router,
    private commonService: CommonService,
    public utilityService: UtilityService,
    private gridPropertiesService: GridPropertiesService,
    public notificationService: NotificationService,
    private alertDialogService: AlertdialogService,
    private spinnerService: NgxSpinnerService,
    private configService: ConfigService,
    private appPreloadService: AppPreloadService,
    private accountService: AccountService,
    private fileStoreService: FileStoreService,
    private systemUserService: SystemUserService,
    private customerVerificationService: CustomerVerificationService,
    private sanitizer: DomSanitizer,
    private stoneProposalService: StoneProposalService,) { }

  async ngOnInit() {
    await this.defaultMethods();
  }

  //#region Fetch defaultdetails
  async defaultMethods() {
    this.fxCredential = await this.appPreloadService.fetchFxCredentials();
    if (!this.fxCredential)
      this.router.navigate(["login"]);

    if (this.fxCredential?.origin == 'Seller') {
      this.isSellerRole = true;
      this.sellerId = this.fxCredential?.id;
    }

    if (this.fxCredential?.origin == 'Admin' || this.fxCredential?.origin == "SuperAdmin")
      this.isAdminRole = true;
    else
      this.customerSearchCriteria.sellerId = this.fxCredential.id;

    await this.getGridConfiguration();
    this.utilityService.filterToggleSubject.subscribe((flag) => {
      this.filterFlag = flag;
    });

    this.spinnerService.show();
    this.getSocialMediaProviderData();
    await this.getCountryData();
    await this.getSellerData();
    await this.loadCustomers();
    await this.setUserRights();
    this.spinnerService.hide();
  }

  public async setUserRights() {
    let userPermissions: SystemUserPermission = new SystemUserPermission();
    let sesValue = sessionStorage.getItem("userPermission");
    if (sesValue)
      userPermissions = JSON.parse(sesValue) as SystemUserPermission;
    if (userPermissions.actions.length > 0) {
      let CanEditCustomer = userPermissions.actions.find(z => z.name == "CanEditCustomer");
      if (CanEditCustomer != null)
        this.isCanEditCustomer = true;

      let CanDeleteCustomer = userPermissions.actions.find(z => z.name == "CanDeleteCustomer");
      if (CanDeleteCustomer != null)
        this.isCanDeleteCustomer = true;
    }
  }

  public async getGridConfiguration() {
    try {
      this.gridConfig = await this.configService.getGridConfig(this.fxCredential.id, "CustomerVerification", "CustomerVerificationGrid", this.gridPropertiesService.getCustomerGrid());
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
        this.gridMasterConfigResponse = await this.configService.getMasterGridConfig("CustomerVerification", "CustomerVerificationGrid");
        if (this.gridMasterConfigResponse)
          this.fields = this.gridMasterConfigResponse.gridDetail;
        else
          this.fields = await this.gridPropertiesService.getCustomerGrid();
      }
    }
    catch (error: any) {
      this.alertDialogService.show(error);
      this.spinnerService.hide();
    }
  }

  private async getCountryData() {
    try {
      this.countryItems = await this.customerService.getCustomerByCountry();
    }
    catch (error: any) {
      this.alertDialogService.show(error.error);
    }
  }

  public async loadCustomers() {
    try {
      let response: CustomerSearchResponse = await this.customerService.getCustomers(this.customerSearchCriteria, this.skip, this.pageSize);
      if (response) {
        this.gridView = process(response.customers, { group: this.groups, sort: this.sort });
        this.gridView.total = response.totalCount;
        this.spinnerService.hide();
      }
    }
    catch (error: any) {
      this.alertDialogService.show(error.error);
    }
  }

  private async getSellerData() {
    try {
      this.sellerItems = await this.systemUserService.getSystemUserByOrigin("Seller");
      this.sellerItems.forEach((item) => {
        this.listSellerItems.push({ text: item.fullName, value: item.id });
      });
    }
    catch (error: any) {
      console.error(error);
      this.alertDialogService.show(error.error);
    }
  }

  public getSocialMediaData(socialMediaType: string) {
    return this.customer.socialMedias.find((c) => c.provider.providerName.toLowerCase() == socialMediaType.toLowerCase());
  }

  public async getImagePath(type: string) {
    let image: AzureFileStore = this.fileStore.find(z => z.identType.toLowerCase() == type.toLowerCase()) as AzureFileStore;
    if (image) {
      let imgSrcDisplay = await this.fileStoreService.downloadBlobFile(image.id)
      this.imgSrcDisplay = await this.utilityService.blobToBase64WithMIME(imgSrcDisplay) as string;
    }
    else
      this.imgSrcDisplay = "assets/images/image-not-found.jpg";

  }

  public getThumbnailImagePath(type: string) {
    if (type != undefined && type != null && type != "") {
      let image: AzureFileStore = this.fileStore.find(z => z.identType.toLowerCase() == type.toLowerCase()) as AzureFileStore;
      if (image)
        return image.fileThumbnail;
      else {
        if (type.toLowerCase() == FileStoreTypes.CustomerProfile)
          return "assets/images/profile.png";
        else
          return "assets/images/image-not-found.jpg";
      }
      return null;
    }
    return null;
  }

  private loadImage(imageSrc: string) {
    if (imageSrc != undefined && imageSrc != null && imageSrc != "")
      return 'data:image/JPEG;base64,' + imageSrc;
    else
      return null
  }
  //#endregion

  //#region download excel
  public async downLoadExcelFile() {
    try {
      this.spinnerService.show();
      let searchedCust = await this.customerService.getAllCustomersbySearchCriteria(this.customerSearchCriteria)
      if (searchedCust.length > 0) {
        this.excelFile = [];
        let i = 0;
        searchedCust.forEach(element => {
          var excel = {
            CompanyName: element.companyName,
            FullName: element.fullName,
            Origin: element.origin,
            BirthDate: element.birthDate,
            MobileNo: element.mobile1,
            Email: element.email,
            CreatedBy: element.createdBy,
            Seller: element.seller.name,
            TelephoneNo: element.phoneNo,
            Designation: element.designation,
            BusinessDate: element.businessDate,
            BusinessType: element.businessType,
            BusinessEmail: element.businessEmail,
            BusinessMobileNo: element.businessMobileNo,
            BusinessPhoneNo: element.businessPhoneNo,
            Address: element.address.line1,
            Country: element.address.country,
            PostalCode: element.address.zipCode,
            Fax: element.faxNo,
            Reference: element.referenceName,
            CartExpireHour: element.cartExpireHour,
            RegisterDate: element.createdDate
          }
          this.excelFile.push(excel);

          i++;
        });
      }
      if (this.excelFile.length > 0)
        this.utilityService.exportAsExcelFile(this.excelFile, "customer_excel");

      this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  //#region Filter
  public onFilterSubmit(form: NgForm) {
    this.mySelection = [];
    this.skip = 0;
    this.loadCustomers();
  }

  public clearFilter(form: NgForm) {
    this.mySelection = [];
    form.reset();
    this.customerSearchCriteria = new CustomerSearchCriteria();

    if (this.fxCredential?.origin != 'Admin')
      this.customerSearchCriteria.sellerId = this.fxCredential.id;

    this.getSocialMediaProviderData();
    this.loadCustomers();
  }
  //#endregion Filter

  //#region OnChange Functions
  public sanitizeURL(url: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  public pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.loadCustomers();
  }

  public filterPartToggle() {
    this.utilityService.setfilterToggleValue(this.filterFlag);
  }

  public sortChange(sort: SortDescriptor[]): void {
    this.sort = sort;
    this.customerSearchCriteria.sortFieldDescriptors = new Array<SortFieldDescriptor>();

    if (this.sort && this.sort.length > 0) {
      let properties = this.gridPropertiesService.getCustomerGrid();
      for (let index = 0; index < this.sort.length; index++) {
        let sortFieldDescriptor = new SortFieldDescriptor();
        const element = this.sort[index];
        sortFieldDescriptor.dir = element.dir;
        sortFieldDescriptor.field = properties.find(x => x.propertyName == element.field)?.sortFieldName ?? "";
        this.customerSearchCriteria.sortFieldDescriptors.push(sortFieldDescriptor);
      }
    }
    this.loadCustomers();
  }

  public groupChange(groups: GroupDescriptor[]): void {
    try {
      this.groups = groups;
      this.loadCustomers();
    }
    catch (error: any) {
      this.alertDialogService.show(error.error);
    }
  }

  public async selectedRowChange(e: any) {
    this.insertFlag = false;
    this.customerdetailsobj = new Customer();
    if (e.selectedRows != null && e.selectedRows.length > 0) {
      let value: Customer = e.selectedRows[0].dataItem;
      this.isActive = value.isActive;
      value.birthDate = this.getValidBirthDate(value.birthDate);
      this.customerdetailsobj = JSON.parse(JSON.stringify(value));
      let imageList: AzureFileStore[] = await this.fileStoreService.getAzureFileByIdent(this.customerdetailsobj.id);
      this.cloneFileStore = [];
      if (imageList && imageList.length > 0) {
        for (let index = 0; index < imageList.length; index++) {
          const element = imageList[index];
          this.cloneFileStore.push({ ...element });
          element.fileThumbnail = this.loadImage(element.fileThumbnail) || null as any;
          if (element.identType == FileStoreTypes.CustomerProfile)
            this.showUploadProfile = false;
          if (element.identType == FileStoreTypes.CustomerPhotoIdent)
            this.showUploadIdent = false;
          if (element.identType == FileStoreTypes.CustomerBussinessIdent)
            this.showUploadBusiness = false;
        }
        this.fileStore = [];
        this.fileStore = imageList;
      }
      else
        this.fileStore = [];

      this.setCustomerImages();
    }
  }

  private setCustomerImages() {
    let profileFileStore = this.fileStore.find(z => z.identType == FileStoreTypes.CustomerProfile);
    if (profileFileStore == null) {
      profileFileStore = new AzureFileStore();
      this.profileImageFlag = false;
      this.showUploadProfile = true;
      this.profileImageFileFound = false;
    }
    else {
      this.profileFileStore = profileFileStore;
    }

    let photoIdentityFileStore = this.fileStore.find(z => z.identType == FileStoreTypes.CustomerPhotoIdent);
    if (photoIdentityFileStore == null) {
      photoIdentityFileStore = new AzureFileStore();
      this.photoIdentityFlag = false;
      this.showUploadIdent = true
      this.photoIdentityFileFound = false;
    }
    else {
      this.photoIdentityFileFound = true;
      this.photoIdentityFileStore = photoIdentityFileStore;
    }

    let businessIndentityFileStore = this.fileStore.find(z => z.identType == FileStoreTypes.CustomerBussinessIdent);
    if (businessIndentityFileStore == null) {
      businessIndentityFileStore = new AzureFileStore();
      this.businessIdentityFlag = false;
      this.showUploadBusiness = true
      this.businessIndentityFileFound = false;
    }
    else {
      this.businessIndentityFileFound = true;
      this.businessIndentityFileStore = businessIndentityFileStore;
    }
  }

  public getValidBirthDate(date: any): Date {
    const day = moment(date).date();
    const month = moment(date).month();
    const year = moment(date).year();
    var newDate = new Date(year, month, day);
    return newDate;
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

  public openCustomerDetails() {
    this.router.navigate(['/customer/details', this.customerdetailsobj.id]);
  }

  public onSellerChange(e: any) {
    const seller = this.sellerItems.find(z => z.id == e.value);
    if (seller != undefined && seller != null) {
      let dnorm: SystemUserDNorm = new SystemUserDNorm();
      dnorm.id = seller.id;
      dnorm.name = seller.fullName;
      dnorm.mobile = seller.mobile;
      dnorm.email = seller.email;
      dnorm.address = seller.address;
      this.customerdetailsobj.seller = dnorm;
    }
  }

  public onCountryChange(e: string): void {
    try {
      this.spinnerService.show();
      this.selectedCountry = this.countryItems.find((c) => c.name == e);
      if (this.selectedCountry != null)
        this.getStatesByCountryCode(this.selectedCountry.iso2);

      this.customerdetailsobj.address.state = null as any;
      this.customerdetailsobj.address.city = null as any;
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

      this.customerdetailsobj.address.city = null as any;
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

  public async openDocumentDialog(type: string) {

    let image: AzureFileStore = this.fileStore.find(z => z.identType.toLowerCase() == type.toLowerCase()) as AzureFileStore;
    if (image) {
      if (image.blobName.split('.')[1].toLowerCase() == "pdf")
        await this.fileStoreService.downloadFile(image.id);
      else {
        await this.getImagePath(type)
        this.isShowDocument = true;
      }
    }
  }

  public closeDocumentDialog() {
    this.isShowDocument = false;
  }
  //#endregion

  //#region User Register
  // public async addUserForCustomer(id: string, customer: Customer) {
  //   try {
  //     let userObj: RegisterModel = new RegisterModel();
  //     userObj.ident = id;
  //     userObj.origin = customer.origin.toString();
  //     userObj.email = customer.email;
  //     userObj.phoneNumber = customer.mobile1;
  //     userObj.password = "Glowstar@2021";
  //     userObj.confirmPassword = "Glowstar@2021";

  //     var result = await this.accountService.insertUser(userObj);
  //     if (result.toLowerCase() == "success") {
  //       await this.updateFileStoreWithCustomerId(id);
  //       this.spinnerService.hide();
  //       this.utilityService.showNotification(`New customer register successfully!`)
  //       this.loadCustomers();
  //     }
  //     else {
  //       this.spinnerService.hide();
  //       var errorObj = JSON.parse(result);
  //       this.alertDialogService.show(errorObj[0]?.description ?? "Something went wrong, Try again later!");
  //     }
  //   }
  //   catch (error: any) {
  //     console.error(error);
  //     this.spinnerService.hide();
  //     this.alertDialogService.show('User not created, Please contact administrator!', 'error');
  //   }
  // }

  public async updateFileStoreWithCustomerId(id: string) {
    try {

      for (let index = 0; index < this.cloneFileStore.length; index++) {
        const element = this.cloneFileStore[index];
        element.ident = id;
        await this.fileStoreService.updateAzureFileStore(element);
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }
  //#endregion

  //#region SocialMedia CRUD
  private getSocialMediaProviderData() {
    this.socialMediaProviderItems = [];
    this.listSocialMediaProviderItems = [];
    this.socialMediaProviderItems = listSocialMediaProviderItems;
    this.socialMediaProviderItems.forEach((z) => {
      this.listSocialMediaProviderItems.push(z.providerName);
    });
  }

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
    this.customerdetailsobj.socialMedias.push(socialMedia);
    this.listSocialMediaProviderItems = this.listSocialMediaProviderItems.filter((z) => z != this.selectedSocialMediaProviderItem);

    this.socialMediaObj.mobileNumber = '';
    this.socialMediaObj.profileName = '';
    this.selectedSocialMediaProviderItem = '';
  }

  public onSocialMediaUpdate() {
    let socialMediaProvider = this.socialMediaProviderItems.find((z) => z.providerName == this.selectedSocialMediaProviderItem);
    this.customerdetailsobj.socialMedias.forEach((z) => {
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
          this.customerdetailsobj.socialMedias = this.customerdetailsobj.socialMedias.filter((z) => z.provider.providerName != e.provider.providerName);
      });
  }
  //#endregion

  //#region CRUD Customer
  public openAddCustomerDialog() {
    this.isAddDialogopen = true;
    this.iseditcustomers = false;
    this.insertFlag = true;
    this.showUploadProfile = true;
    this.showUploadIdent = true;
    this.showUploadBusiness = true;
    this.customerdetailsobj = new Customer();
  }

  public closeAddCustomerDialog() {
    this.customerdetailsobj = new Customer();
    this.isAddDialogopen = false;
    this.resetFormimg(this.localform);
    this.mySelection = [];
    this.resetForm();
    this.loadCustomers();
  }

  public uploadFiles(form: NgForm, event: Event, type: string): void {
    try {
      let acceptedFiles: string[] = [];
      const target = event.target as HTMLInputElement;
      if (target.accept) {
        acceptedFiles = target.accept.split(',').map(function (item) {
          return item.trim();
        });
      }

      if (target.files && target.files.length) {
        if (acceptedFiles.indexOf(target.files[0].type) == -1) {
          this.alertDialogService.show(`Please select valid file.`);
          return;
        }

        let file = target.files[0];
        this.currentFile = file;
        if (type == FileStoreTypes.CustomerProfile) {
          this.profileImageModel = this.currentFile;
          const reader = new FileReader();
          reader.onload = () => {
            this.imagePreviewprofile = reader.result;
          };
          reader.readAsDataURL(file);
          this.profileImageErrorFlag = false;
          this.isImgselectedProfile = true;
        }
        else if (type == FileStoreTypes.CustomerPhotoIdent) {
          this.photoIdentityModel = this.currentFile;
          const reader = new FileReader();
          reader.onload = () => {
            this.imagePreviewphoto = reader.result;
            if (this.imagePreviewphoto?.toString().includes('application/pdf'))
              this.imagePreviewphoto = 'commonAssets/images/pdf_doc.png';
          };
          reader.readAsDataURL(file);
          this.photoIdentityErrorFlag = false;
          this.isImgselectedPhotoIdent = true;
        }
        else {
          this.businessIdentityModel = this.currentFile;
          const reader = new FileReader();
          reader.onload = () => {
            this.imagePreviewbusiness = reader.result;
            if (this.imagePreviewbusiness?.toString().includes('application/pdf'))
              this.imagePreviewbusiness = 'commonAssets/images/pdf_doc.png';
          };
          reader.readAsDataURL(file);
          if (this.businessIdentityErrorFlag)
            this.businessIdentityErrorFlag = false;
          this.isImgselectedBusiness = true;
        }

        this.fileUploadItems.push({ file: file, type: type });
      }
    }
    catch (error: any) {
      console.error(error);
      this.alertDialogService.show("Something went wrong, Try again later");
    }
  }

  public resetFormimg(form: NgForm) {
    this.clearPhotoProfile(form);
    this.clearPhotoIdentity(form);
    this.clearBusinessIdentity(form);
    this.iseditcustomers = false;
  }

  public resetForm(form?: NgForm) {
    this.insertFlag = true;
    form?.reset();
    this.customerdetailsobj = new Customer();
    this.selectedSellerItems = { text: "", value: "" }
    this.mySelection = [];
    this.getSocialMediaProviderData();
  }

  public clearPhotoProfile(form: NgForm) {
    this.localform = form
    this.isImgselectedProfile = false;
    this.profileImageModel = undefined;
    this.profileImageErrorFlag = false;
    this.imagePreviewprofile = undefined;
    this.profileFileStore = new AzureFileStore();
  }

  public clearPhotoIdentity(form: NgForm) {
    this.localform = form
    this.isImgselectedPhotoIdent = false;
    this.photoIdentityModel = undefined;
    this.imagePreviewphoto = undefined;
    this.photoIdentityErrorFlag = false;
    this.photoIdentityFileStore = new AzureFileStore();
  }

  public clearBusinessIdentity(form: NgForm) {
    this.localform = form
    this.isImgselectedBusiness = false;
    this.businessIdentityModel = undefined;
    this.imagePreviewbusiness = undefined;
    this.businessIdentityErrorFlag = false;
    this.businessIndentityFileStore = new AzureFileStore();
  }

  public clearPreviewFile(type: string) {
    if (type == FileStoreTypes.CustomerProfile) {
      this.imagePreviewprofile = '';
      this.isImgselectedProfile = false;
      this.profileImageModel = undefined;
    }
    else if (type == FileStoreTypes.CustomerPhotoIdent) {
      this.imagePreviewphoto = '';
      this.isImgselectedPhotoIdent = false;
      this.photoIdentityModel = undefined;
    }
    else {
      this.imagePreviewbusiness = '';
      this.isImgselectedBusiness = false;
      this.businessIdentityModel = undefined;
    }

    let fileUploadItemsIndex = this.fileUploadItems.findIndex(z => z.type == type);
    if (fileUploadItemsIndex >= 0)
      this.fileUploadItems.splice(fileUploadItemsIndex, 1);
  }

  public setExtraFields() {
    this.customerdetailsobj.fullName = this.customerdetailsobj.name.firstName + " " + (this.customerdetailsobj.name.middleName ?? '') + " " + this.customerdetailsobj.name.lastName;
  }

  public async onVerificationCustomerSubmit(form: NgForm, action: boolean) {
    try {
      if (form.valid) {
        this.spinnerService.show();

        if (this.customerdetailsobj.address.city == "") {
          this.alertDialogService.show("Business Proof Compulsory When Ledger Group Is Customer!");
          this.spinnerService.hide();
          return
        }

        this.setExtraFields();
        let messageType: string = "";
        if (!this.isImgselectedProfile && !this.iseditcustomers) {
          this.profileImageErrorFlag = true;
          return;
        }
        else
          this.profileImageErrorFlag = false;


        if (!this.isImgselectedPhotoIdent && !this.iseditcustomers) {
          this.photoIdentityErrorFlag = true;
          return;
        }
        else
          this.photoIdentityErrorFlag = false;

        if (!this.isImgselectedBusiness && !this.iseditcustomers) {
          this.businessIdentityErrorFlag = true;
          return;
        }
        else
          this.businessIdentityErrorFlag = false;

        this.customerdetailsobj.countryCode = this.selectedCountry.iso2;

        if (this.primaryMobileNo && this.primaryMobileNo.e164Number)
          this.customerdetailsobj.mobile1 = this.primaryMobileNo.e164Number;
        if (this.secondaryMobileNo && this.secondaryMobileNo.e164Number)
          this.customerdetailsobj.mobile2 = this.secondaryMobileNo.e164Number;
        if (this.businessMobileNo && this.businessMobileNo.e164Number)
          this.customerdetailsobj.businessMobileNo = this.businessMobileNo.e164Number;

        if (!this.insertFlag) {
          let fetchCustomerObj = { ...this.customerdetailsobj }

          //# updated RenewDate when seller changed 
          if (this.cloneSellerId && this.cloneSellerId.length > 0) {
            if (this.cloneSellerId != this.customerdetailsobj.seller.id) {

              var result = await this.customerPrefService.changeSellerId(this.customerdetailsobj.id, this.customerdetailsobj.seller.id);
              if (result)
                await this.customerService.sendMailToCustomer(this.customerdetailsobj);

              this.customerdetailsobj.renewDate = new Date();
            }
          }
          let response = await this.customerService.updateCustomer(this.customerdetailsobj);
          if (response) {
            if (this.currentFile) {
              for (let index = 0; index < this.fileUploadItems.length; index++) {
                const element = this.fileUploadItems[index];
                await this.uploadFilesOnServer(element.file, element.type, fetchCustomerObj.id, index, form);
              }
            }
            this.utilityService.showNotification(`Customer updated successfully!`);
            if (action)
              this.isAddDialogopen = false;
            this.loadCustomers();
          }
          else {
            this.alertDialogService.show(`Customer not updated, Try again later!`);
            this.spinnerService.hide();
            return;
          }

        } else if (this.insertFlag) {
          if (this.profileImageErrorFlag == false && this.photoIdentityErrorFlag == false && this.businessIdentityErrorFlag == false) {
            // let response = await this.customerService.insertCustomer(this.customerdetailsobj);
            // if (response) {
            //   this.addUserForCustomer(response, this.customerdetailsobj);
            //   for (let index = 0; index < this.fileUploadItems.length; index++) {
            //     const element = this.fileUploadItems[index];
            //     await this.uploadFilesOnServer(element.file, element.type, response, index, form);

            //   }
            //   if (action) {
            //     messageType = ""
            //     this.isAddDialogopen = false;
            //     this.resetForm(form);
            //     this.loadCustomers();
            //     this.resetFormimg(form);
            //     this.utilityService.showNotification(`Customer registered successfully!`);
            //   }
            //   else {
            //     this.resetForm(form);
            //     this.resetFormimg(form);
            //   }
            // }
            // else
            //   this.alertDialogService.show(`Something went wrong, Try again later!`, "error")
          }
        }
        this.spinnerService.hide();
        this.resetForm(form);
        this.resetFormimg(form);
      }
      else {
        Object.keys(form.controls).forEach(key => {
          form.controls[key].markAsTouched();
        });
      }
    } catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error)
    }
  }

  public uploadFilesOnServer(file: File, type: string, ident: string, index: number, form: NgForm) {

    this.fileStoreService.postUploadFileDocument(file, type, ident, this.customerdetailsobj?.email).subscribe(
      (res: any) => {
        if (res.body?.statusCode == 200) {
          let response = res.body.value;
          this.setFileuploadResponse(response, type);
          if (index == this.fileUploadItems.length - 1) {
            this.utilityService.showNotification(`Customer have been Registered successfully!`);
            this.fileUploadItems = [];
            this.router.navigate(['login']);
          }
        }
      },
      (err: any) => {
        this.currentFile = null as any;
        console.error(err);
        this.alertDialogService.show(`Something went wrong while uploading a file!`, "error")
      }
    );
  }

  public setFileuploadResponse(response: any, type: string) {
    if (type == FileStoreTypes.CustomerProfile) {
      if (this.profileImageErrorFlag)
        this.profileImageErrorFlag = false;
    }
    else if (type == FileStoreTypes.CustomerPhotoIdent) {
      if (this.photoIdentityErrorFlag)
        this.photoIdentityErrorFlag = false;
    }
    else {
      if (this.businessIdentityErrorFlag)
        this.businessIdentityErrorFlag = false;
    }
  }

  public async deleteCustomer() {
    this.alertDialogService.ConfirmYesNo("Are you sure you want to remove selected customer?", "Delete")
      .subscribe(async (res: any) => {
        this.mySelection = [];
        if (res.flag) {
          try {
            this.spinnerService.show();
            let res = await this.customerService.deleteCustomer(this.customerdetailsobj.id)
            if (res && res == 1) {
              await this.removeUser();
              this.loadCustomers();
              this.utilityService.showNotification(`Record deleted successfully!`)
              this.spinnerService.hide();
            }
            else {
              this.spinnerService.hide();
              this.alertDialogService.show(`Something went wrong, Try again later!`);
            }
          } catch (error: any) {
            console.error(error);
            this.spinnerService.hide();
            this.alertDialogService.show('Customer not remove, Try again later!');
          }
        }
      });
  }

  public async removeUser() {
    try {
      if (this.isAdminRole) {
        this.alertDialogService.ConfirmYesNo("Are you sure you want to remove online access for selected customer?", "Remove")
          .subscribe(async (res: any) => {
            if (res.flag) {
              var userRes = await this.accountService.removeUser(this.customerdetailsobj.email);
              if (userRes && userRes == 'Success!') {
                let updateCustomer = new CustomerItemData();
                updateCustomer.customerId = this.customerdetailsobj.id;
                updateCustomer.userId = "";
                this.customerService.updateCustomerUserId(updateCustomer);
                this.utilityService.showNotification('User removed successfully!');
              }
              else {
                if (userRes)
                  this.alertDialogService.show(userRes);
                else
                  this.alertDialogService.show('User not remove, Please contact administrator!', 'error');
              }
            }
          });
      }
      else
        this.alertDialogService.show('You dont have permission, Please contact administrator!', 'error');
    }
    catch (error: any) {
      console.error(error.error);
      this.spinnerService.hide();
    }
  }
  //#endregion 

  //#region Update Customer
  public async openUpdateCustomerDialog() {
    this.iseditcustomers = true
    this.isAddDialogopen = true;
    this.selectedCountry = this.countryItems.find((c) => c.name == this.customerdetailsobj.address.country);

    let valueCountryExist = this.countryItems.filter((s: any) => {
      return s.name === this.customerdetailsobj.address.country;
    });

    if (valueCountryExist !== undefined && valueCountryExist !== null && valueCountryExist.length > 0) {
      await this.getStatesByCountryCode(valueCountryExist[0].iso2);
      setTimeout(async () => {
        let valueStateExist = this.stateItems.filter((s: any) => {
          return s.name?.toLowerCase() === this.customerdetailsobj.address.state?.toLowerCase();
        });
        if (valueStateExist !== undefined && valueStateExist !== null && valueStateExist.length > 0)
          await this.getCityData(valueCountryExist[0], valueStateExist[0].state_Code);
      }, 200);
    }

    this.customerdetailsobj.birthDate = this.getValidBirthDate(this.customerdetailsobj.birthDate);
    this.cloneSellerId = this.customerdetailsobj.seller.id;
    this.selectedSellerItems = { text: this.customerdetailsobj.seller.name, value: this.customerdetailsobj.seller.id };
    this.primaryMobileNo = parsePhoneNumberFromString(this.customerdetailsobj.mobile1 ?? '' as string)?.nationalNumber as any;
    this.secondaryMobileNo = parsePhoneNumberFromString(this.customerdetailsobj.mobile2 ?? '' as string)?.nationalNumber as any;
    this.businessMobileNo = parsePhoneNumberFromString(this.customerdetailsobj.businessMobileNo ?? '' as string)?.nationalNumber as any;
    this.inputState = JSON.parse(JSON.stringify(this.customerdetailsobj.address.state));
    this.inputCity = JSON.parse(JSON.stringify(this.customerdetailsobj.address.city));

    let valueStateExist = this.stateItems.filter((s: any) => {
      return s.name.toLowerCase() === this.customerdetailsobj.address.state.toLowerCase();
    });

    if (!(valueStateExist !== undefined && valueStateExist !== null && valueStateExist.length > 0)) {
      this.customerdetailsobj.address.state = "";
    }

    let valueCityExist = this.cityItems?.filter((s: any) => {
      return s.name.toLowerCase() === this.customerdetailsobj.address.city.toLowerCase();
    });

    if (!(valueCityExist !== undefined && valueCityExist !== null && valueCityExist.length > 0)) {
      this.customerdetailsobj.address.city = "";
    }

  }

  getSepratedMobile(dataItem: string) {
    const phoneNumber = dataItem;
    const countryCodeLength = phoneNumber?.length - 10;
    let phoneno = phoneNumber.substring(countryCodeLength, phoneNumber?.length);
    return phoneno ?? '';
  }
  //#endregion

  public checkIntPhoneValidation(event: any, type: string, form: NgForm) {
    if (type === IntlTelType.PrimaryMobile)
      this.primaryMobileValidation = event === null ? true : false;
    else if (type === IntlTelType.SecondaryMobile)
      this.secondaryMobileValidation = event === null ? true : false;
    else if (type === IntlTelType.BusinessMobile)
      this.businessMobileValidation = event === null ? true : false;
  }

  //#region active user and deactive
  public async activeDeactiveCustomer() {
    this.alertDialogService.ConfirmYesNo(`Are you sure you want to ${this.isActive ? "Deactivate" : "Activate"} to customer ?`, 'Online User')
      .subscribe(async (res: any) => {
        if (res.flag) {
          try {
            if (this.isActive) {
              this.spinnerService.show();
              let response = await this.updateCustomerStatus();
              if (response) {
                await this.removeUser();
                this.spinnerService.hide();
              }
            }
            else {
              await this.updateCustomerStatus();
              this.spinnerService.hide();
            }
            this.loadCustomers();
          } catch (error: any) {
            console.error(error);
            this.spinnerService.hide();
            this.alertDialogService.show('User not updated, Please contact administrator!');
          }
        }
      });
  }

  //#update active and deactive customer
  public async updateCustomerStatus() {
    try {
      let updateCustomer = new CustomerItemData();
      updateCustomer.customerId = this.customerdetailsobj.id;
      updateCustomer.isActive = !this.isActive;
      let response = await this.customerService.updateCustomerStatus(updateCustomer);
      if (response) {
        this.utilityService.showNotification(`Customer register ${this.isActive ? "deactivated" : "activated"} successfully!`);
        this.isActive = !this.isActive;
        return response;
      }
      else {
        this.alertDialogService.show(`Customer not updated, Try again later!`);
        this.spinnerService.hide();
        return;
      }
    } catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('User not updated, Please contact administrator!');
      return;
    }
  }

  //#region Add User
  public async addUserForCustomer() {
    if (this.isAdminRole) {
      this.alertDialogService.ConfirmYesNo('Are you sure you want to add this customer as online user?', 'Online User')
        .subscribe(async (res: any) => {
          if (res.flag) {
            try {
              this.spinnerService.show();
              let userObj: RegisterModel = new RegisterModel();
              userObj.ident = this.customerdetailsobj.id;
              userObj.origin = this.customerdetailsobj.origin.toString();
              userObj.email = this.customerdetailsobj.email;
              userObj.phoneNumber = this.customerdetailsobj.mobile1;

              userObj.password = "Diamond@2023";
              userObj.confirmPassword = "Diamond@2023";

              var result = await this.accountService.insertCustomerUser(userObj);
              if (result == "Success") {
                //await this.sendApprovalMailToCustomer(userObj, "Diamond@2023");
                let updateCustomer = new CustomerItemData();
                updateCustomer.customerId = this.customerdetailsobj.id;
                updateCustomer.userId = this.customerdetailsobj.id;
                this.customerService.updateCustomerUserId(updateCustomer);
                this.utilityService.showNotification(`New customer register successfully!`);
                this.spinnerService.hide();
              }
              else {
                this.spinnerService.hide();
                var errorObj = JSON.parse(result);
                this.alertDialogService.show(errorObj[0]?.description ?? "Something went wrong(addUserForCustomer), Try again later!");
              }
            }
            catch (error: any) {
              console.error(error);
              this.spinnerService.hide();
              this.alertDialogService.show('User not created, Please contact administrator!');
            }
          }
        });
    }
    else
      this.alertDialogService.show('You dont have permission, Please contact administrator!', 'error');
  }

  public async sendApprovalMailToCustomer(userObj: RegisterModel, userPass: string) {
    try {
      userObj.password = userPass;
      userObj.confirmPassword = userPass;
      let res = await this.customerVerificationService.sendApprovalMailToCustomer(userObj);
      if (res) {
        this.spinnerService.hide();
        this.utilityService.showNotification('Customer Approval Mail Send to Customer successfully.!');
      }
      else {
        this.spinnerService.hide();
        this.alertDialogService.show('Customer Approval Mail Not Sent.');
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }
  public loadCountryCode(phoneno: string): CountryISO {
    phoneno = phoneno ?? '' as string;
    if (typeof phoneno === 'string' && phoneno != "") {
      const phoneNumberObj = parsePhoneNumberFromString(phoneno) as any;
      if (phoneNumberObj && isValidNumber(phoneNumberObj.number)) {
        const countryItem = this.countryItems.find(item => item.iso2 === phoneNumberObj.country);
        const result = countryItem ? CountryISO[this.removeAllSpaces(countryItem.name) as keyof typeof CountryISO] : CountryISO.India;
        return result;
      }
    }
    return CountryISO.India;

  }

  public removeAllSpaces(input: string): string {
    return input.replace(/\s+/g, '');
  }

  public async openCustInvitationDialog() {
    this.isCustInviDialogOpen = !this.isCustInviDialogOpen;
    await this.getInvitationImagePath();
  }

  public closeCustInvitationDialog() {
    this.isCustInviDialogOpen = false;
  }

  public async uploadInvitImage(event: Event) {
    try {
      const target = event.target as HTMLInputElement;
      const acceptedFiles: string[] = (target.accept || '').split(',').map(item => item.trim());

      if (!target.files || !target.files.length) {
        return;
      }

      const file = target.files[0];
      if (!acceptedFiles.includes(file.type)) {
        this.alertDialogService.show('Please select a valid file.');
        return;
      }

      const renamedFile = new File([file], this.sellerId, { type: file.type });
      if (renamedFile)
        await this.uploadFileOnServer(renamedFile);
    } catch (error: any) {
      console.error(error);
      this.alertDialogService.show('Something went wrong. Please try again later.');
    }
  }

  public async uploadFileOnServer(file: File) {
    this.fileStoreService.uploadImageByName(file).subscribe(
      async (res: any) => {
        if (res.body?.success) {
          await this.getInvitationImagePath();
          this.utilityService.showNotification('Image uploaded successfully!');
        }
      },
      (err: any) => {
        console.error(err);
        this.alertDialogService.show(`Something went wrong while uploading a file!`, "error");
      }
    );
  }

  public async getInvitationImagePath() {
    try {
      this.spinnerService.show();
      if (this.isSellerRole) {
        const imageObj = await this.fileStoreService.getAzureFileByName(this.sellerId);
        if (imageObj && imageObj.length > 0) {
          const firstImageSrc = imageObj[0]?.fileThumbnail;
          this.imagePreviewInvitation = this.loadImage(firstImageSrc);
          this.isImgselectedInvitation = true;
        }
      }
      this.spinnerService.hide();
    } catch (error: any) {
      console.error(error);
      this.alertDialogService.show('Something went wrong. Please try again later.');
    }
  }

  public deleteInvitationImage() {
    this.alertDialogService.ConfirmYesNo("Are you sure you want to delete invitation image?", "Delete")
      .subscribe(async (res: any) => {
        if (res.flag) {
          let flag = await this.fileStoreService.deletefileByName(this.sellerId);
          if (flag) {
            this.imagePreviewInvitation = "";
            this.thumbnailImageInvitation!.nativeElement.value = '';
            this.isImgselectedInvitation = false;
            this.utilityService.showNotification(`Image deleted successfully!`);
          }
          else
            this.alertDialogService.show(`Something went wrong. Please try again!`, 'error');
        }
      });
  }

  public async sendCustomerInvitation(form: NgForm) {
    try {
      if (!form.valid)
        return;
      
      this.customerSearchCriteria = new CustomerSearchCriteria();
      this.customerSearchCriteria.sellerId = this.fxCredential.id;
      let sellerWiseCustomers = await this.customerService.getAllCustomersbySearchCriteria(this.customerSearchCriteria);

      this.sendInvitationCust = sellerWiseCustomers.map(item => {
        let cust = new CustomerDNorm();

        cust.id = item.id;
        cust.name = item.fullName;
        cust.code = item.code;
        cust.email = item.email;
        cust.mobile = item.mobile1;
        cust.companyName = item.companyName;
        cust.city = item.address?.city;

        return cust;
      });

      this.customerInvitationMail.customerDNorms = this.sendInvitationCust;

      const systemUserData = await this.systemUserService.getSystemUserById(this.fxCredential?.id);

      if (systemUserData) {
        const systemUser = new SystemUserDNorm();
        systemUser.id = systemUserData.id;
        systemUser.name = systemUserData.fullName;
        systemUser.email = systemUserData.emailConfig?.emailId;
        systemUser.mobile = systemUserData.mobile;
        systemUser.address = systemUserData.address;

        this.customerInvitationMail.systemUser = systemUser;
        this.customerInvitationMail.companyname = systemUserData.companyName;
        this.customerInvitationMail.subject = this.invitationEmailSubject;
      } else {
        this.alertDialogService.show("Your session has expired, please log in again!");
        return;
      }

      this.spinnerService.show();
      let res = await this.stoneProposalService.sendCustomerInvitation(this.customerInvitationMail);

      if (res && res.isSuccess) {
        this.closeCustInvitationDialog();
        this.utilityService.showNotification('Mail send successfully!');
      }
      else {
        console.error(res);
        if (res && res.message)
          this.alertDialogService.show(res.message);
        else
          this.alertDialogService.show("Mail not send, Kindly check your email config.");

      }
      this.spinnerService.hide();
    }
    catch (error: any) {
      console.error(error);
      this.alertDialogService.show("Mail not send, Kindly check your email config.");
      this.spinnerService.hide();
    }
  }
  //#endregion
}
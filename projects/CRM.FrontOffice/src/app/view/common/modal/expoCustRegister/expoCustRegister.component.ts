import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import * as moment from 'moment';
import { CountryISO, PhoneNumberFormat, SearchCountryField } from 'ngx-intl-tel-input-gg';
import { NgxSpinnerService } from 'ngx-spinner';
import { City, CommonResponse, Country, SocialMedia, SocialMediaProvider, State } from 'shared/businessobjects';
import { AzureFileStore } from 'shared/enitites';
import { CommonService, FileStoreService, FileStoreTypes, IntlTelType, UtilityService, listBusinessTypeItems, listCustomerOriginItems, listSocialMediaProviderItems } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { BranchDNorm } from '../../../../businessobjects';
import { Customer, RegisterCustomer, SystemUser, SystemUserDNorm, fxCredential } from '../../../../entities';
import { AppPreloadService, CustomerService, CustomerVerificationService, SystemUserService } from '../../../../services';

@Component({
  selector: 'app-expoCustRegister',
  templateUrl: './expoCustRegister.component.html',
  styleUrls: ['./expoCustRegister.component.css']
})

export class ExpoCustRegisterComponent implements OnInit {
  @Output() toggle: EventEmitter<boolean> = new EventEmitter();
  public customerdetailsobj: RegisterCustomer = new RegisterCustomer();
  public isImgselectedProfile: boolean = false;
  public isImgselectedPhotoIdent: boolean = false;
  public isImgselectedBusiness: boolean = false;
  public currentFile!: File;
  public profileImageErrorFlag: boolean = false;
  public profileImageModel: any = undefined;
  public photoIdentityErrorFlag: boolean = false;
  public photoIdentityModel: any = undefined;
  public businessIdentityErrorFlag: boolean = false;
  public businessIdentityModel: any = undefined;
  public fileUploadItems: Array<{ type: string, file: File }> = new Array<{ type: string, file: File }>();
  public listBranchDNormItems: Array<{ text: string; value: string }> = [];
  public branchDNormItems!: BranchDNorm[];
  public countryItems!: Country[];
  public selectedCountry: any;
  public stateItems!: State[];
  public selectedState: any;
  public cityItems!: City[];
  public selectedCity: any;
  public FileStoreTypes = FileStoreTypes;
  public selectedOrganizationDNormItems?: { text: string; value: string };
  public selectedBranchDNormItems?: { text: string; value: string };
  public selectedSellerDNormItems?: { text: string; value: string };
  public mySelection: string[] = [];
  public imagePreviewbusiness: any;
  public imagePreviewprofile: any;
  public imagePreviewphoto: any;
  public localform!: NgForm;
  public mobileMask = '(999) 000-00-00';
  public phoneMask = '(9999) 000-00-00';
  public faxMask = '(999) 000-0000';
  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains',
  };
  public listDesignationItems: Array<string> = [
    "OWNER",
    "DIRECTOR",
    "PURCHASE MANAGER",
    "SALES MANAGER",
    "PURCHASE EXECUTIVE",
    "AUTHORISED PERSON",
    "GENERAL MANAGER"
  ];
  public listBusinessTypeItems = listBusinessTypeItems;
  public listCustomerOriginItems = listCustomerOriginItems;
  public fileStore: AzureFileStore[] = [];
  public cloneFileStore: AzureFileStore[] = [];
  public profileFileStore: AzureFileStore = new AzureFileStore();
  public photoIdentityFileStore: AzureFileStore = new AzureFileStore();
  public businessIndentityFileStore: AzureFileStore = new AzureFileStore();
  public isShowDocument: boolean = false;
  public imgSrcDisplay!: string;
  public socialMediaProviderItems!: SocialMediaProvider[];
  public listSocialMediaProviderItems: string[] = [];
  public selectedSocialMediaProviderItem: any;
  public socialMediaObj: SocialMedia = new SocialMedia();
  public isSocialMediaUpdateFlag: boolean = false;
  public isMessagingFlag: boolean = false;
  public editSocialMediaId: string = '';
  public preferredCountries: CountryISO[] = [CountryISO.Belgium, CountryISO.Thailand, CountryISO.UnitedArabEmirates, CountryISO.UnitedStates];
  public separateDialCode = true;
  public SearchCountryField = SearchCountryField;
  public CountryISO = CountryISO;
  public PhoneNumberFormat = PhoneNumberFormat;
  public primaryMobileNo!: any;
  public IntlTelType = IntlTelType;
  public primaryMobileValidation: boolean = false;
  public secondaryMobileNo!: any;
  public secondaryMobileValidation: boolean = false;
  public businessMobileNo!: any;
  public businessMobileValidation: boolean = false;
  private fxCredential!: fxCredential;
  public listSellerDNormItems: Array<{ text: string; value: string }> = [];
  public selectedSellerDNormItem?: string;
  public sellerDNormItems!: SystemUserDNorm[];
  public seller: SystemUserDNorm = new SystemUserDNorm();
  public customer: Customer = new Customer();

  constructor(
    public alertDialogService: AlertdialogService,
    public customerService: CustomerService,
    private spinnerService: NgxSpinnerService,
    private fileStoreService: FileStoreService,
    private utilityService: UtilityService,
    private router: Router,
    private commonService: CommonService,
    private appPreloadService: AppPreloadService,
    private systemUserService: SystemUserService,
    public customerVerificationService: CustomerVerificationService,
  ) { }

  async ngOnInit() {
    await this.getSocialMediaProviderData();
    await this.getCountryData();
    await this.defaultMethodsLoad();
  }

  async defaultMethodsLoad() {
    this.spinnerService.show();
    this.fxCredential = await this.appPreloadService.fetchFxCredentials();
    if (!this.fxCredential)
      this.router.navigate(["login"]);

    await this.getSellerDNormData();
    this.spinnerService.hide();
  }

  public setExtraFields() {
    this.customerdetailsobj.fullName = this.customerdetailsobj.name.firstName + " " + (this.customerdetailsobj.name.middleName ?? '') + " " + this.customerdetailsobj.name.lastName;
  }

  public getValidBirthDate(date: any): Date {
    const day = moment(date).date();
    const month = moment(date).month();
    const year = moment(date).year();
    var newDate = new Date(year, month, day);
    return newDate;
  }

  public async onVerificationCustomerSubmit(form: NgForm, action: boolean) {
    try {
      if (form.valid) {
        this.setExtraFields();
        let messageType: string = "";
        this.spinnerService.show();
        this.customerdetailsobj.countryCode = this.selectedCountry.iso2;

        if (this.primaryMobileNo && this.primaryMobileNo.e164Number)
          this.customerdetailsobj.primaryMobile = this.primaryMobileNo.e164Number;
        if (this.secondaryMobileNo && this.secondaryMobileNo.e164Number)
          this.customerdetailsobj.secondaryMobile = this.secondaryMobileNo.e164Number;
        if (this.businessMobileNo && this.businessMobileNo.e164Number)
          this.customerdetailsobj.businessMobileNo = this.businessMobileNo.e164Number;

        this.customerdetailsobj.createdBy = this.fxCredential.fullName;

        this.fillCustomerRequest(this.customerdetailsobj);
        if (this.customer !== undefined && this.customer !== null) {
          let response: CommonResponse = await this.customerVerificationService.acceptOrRejectCustomer(this.customer, true);
          if (response && response.isSuccess) {
            for (let index = 0; index < this.fileUploadItems.length; index++) {
              const element = this.fileUploadItems[index];
              await this.uploadFilesOnServer(element.file, element.type, response.message, index, form);
            }
            if (action) {
              messageType = "registered"
              this.spinnerService.hide();
              this.closeAddCustomerDialog();
              this.resetForm(form);
              this.resetFormimg(form);
              this.utilityService.showNotification(`You have been ${messageType} successfully!`);
            }
            else {
              this.spinnerService.hide();
              this.resetForm(form);
              this.resetFormimg(form);
            }
          }
          else {
            this.alertDialogService.show(response.message, "error");
            this.spinnerService.hide();
            return;
          }
        }
        this.resetForm(form);
        this.resetFormimg(form);

      }
    } catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(error.error)
    }
  }

  public uploadFilesOnServer(file: File, type: string, ident: string, index: number, form: NgForm) {
    this.fileStoreService.postUploadFileDocument(file, type, ident, this.customerdetailsobj?.email).subscribe(
      (res: any) => {
        if (res && res.body?.statusCode == 200) {
          let response = res.body.value;
          this.setFileuploadResponse(response, type);
          if (index == this.fileUploadItems.length - 1) {
            this.utilityService.showNotification(`Customer have been Registered successfully!`);
            this.fileUploadItems = [];
            this.router.navigate(['login']);
          }
        }
      },
      async (err: any) => {
        await this.customerService.deleteCustomerRegistration(ident);
        this.currentFile = null as any;
        console.error(err);
        this.alertDialogService.show(`Something went wrong while uploading a file!`, "error")
      }
    );
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


  public resetFormimg(form: NgForm) {
    this.clearPhotoProfile(form);
    this.clearPhotoIdentity(form);
    this.clearBusinessIdentity(form);
  }

  public resetForm(form?: NgForm) {
    form?.reset();
    this.customerdetailsobj = new RegisterCustomer();
    this.selectedOrganizationDNormItems = { text: "", value: "" }
    this.selectedBranchDNormItems = { text: "", value: "" }
    this.selectedSellerDNormItems = { text: "", value: "" }
    this.mySelection = [];
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

  public async openDocumentDialog(type: string) {
    let image: AzureFileStore = this.fileStore.find(z => z.identType.toLowerCase() == type.toLowerCase()) as AzureFileStore;
    if (image) {
      if (image.blobName.split('.')[1].toLowerCase() == ".pdf")
        await this.fileStoreService.downloadFile(image.id);
      else {
        await this.getImagePath(type)
        this.isShowDocument = true;
      }
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

  public async getImagePath(type: string) {
    let image: AzureFileStore = this.fileStore.find(z => z.identType.toLowerCase() == type.toLowerCase()) as AzureFileStore;
    if (image) {
      let imgSrcDisplay = await this.fileStoreService.downloadBlobFile(image.id)
      this.imgSrcDisplay = await this.utilityService.blobToBase64WithMIME(imgSrcDisplay) as string;
    }
    else
      this.imgSrcDisplay = "assets/images/image-not-found.jpg";

  }

  public closeAddCustomerDialog() {
    this.toggle.emit(false);
  }

  public checkIntPhoneValidation(event: any, type: string, form: NgForm) {
    if (type === IntlTelType.PrimaryMobile)
      this.primaryMobileValidation = event === null ? true : false;
    else if (type === IntlTelType.SecondaryMobile)
      this.secondaryMobileValidation = event === null ? true : false;
    else if (type === IntlTelType.BusinessMobile)
      this.businessMobileValidation = event === null ? true : false;
  }

  private async getSellerDNormData() {
    try {
      let sellers: SystemUser[] = await this.systemUserService.getSystemUserByOrigin("Seller");
      this.sellerDNormItems = new Array<SystemUserDNorm>();
      for (let index = 0; index < sellers.length; index++) {
        const element = sellers[index];
        this.sellerDNormItems.push({
          id: element.id,
          name: element.fullName,
          mobile: element.mobile,
          email: element.email,
          address: element.address
        });
      }

      this.sellerDNormItems.forEach((item) => {
        this.listSellerDNormItems.push({ text: item.name, value: item.id });
      });
    }
    catch (error: any) {
      console.error(error);
      this.alertDialogService.show(error.error);
    }
  }

  public onSellerDNormChange(e: any) {
    const sellerDNorm = this.sellerDNormItems.find(z => z.id == e.value);
    if (sellerDNorm != undefined && sellerDNorm != null) {
      this.seller = sellerDNorm;
    }
  }

  public fillCustomerRequest(registerCustomer: RegisterCustomer) {
    this.customer.id = registerCustomer.id;
    this.customer.name.firstName = registerCustomer.name.firstName;
    this.customer.name.lastName = registerCustomer.name.lastName;
    this.customer.name.middleName = registerCustomer.name.middleName;
    this.customer.fullName = registerCustomer.fullName;
    this.customer.email = registerCustomer.email;
    this.customer.mobile1 = registerCustomer.primaryMobile;
    this.customer.mobile2 = registerCustomer.secondaryMobile;
    this.customer.phoneNo = registerCustomer.phoneNo;
    this.customer.birthDate = registerCustomer.birthDate;
    this.customer.countryCode = registerCustomer.countryCode;
    this.customer.companyName = registerCustomer.companyName;
    this.customer.businessType = registerCustomer.businessType;
    this.customer.designation = registerCustomer.designation;
    this.customer.businessPhoneNo = registerCustomer.businessPhoneNo;
    this.customer.businessEmail = registerCustomer.businessEmail;
    this.customer.businessMobileNo = registerCustomer.businessMobileNo;
    this.customer.businessPhoneNo = registerCustomer.businessPhoneNo;
    this.customer.address = registerCustomer.address;
    this.customer.faxNo = registerCustomer.faxNo;
    this.customer.referenceName = registerCustomer.referenceName;
    this.customer.seller = this.seller;
  }

}
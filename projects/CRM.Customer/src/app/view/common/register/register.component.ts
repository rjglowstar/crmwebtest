import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { CountryISO, PhoneNumberFormat, SearchCountryField } from 'ngx-intl-tel-input-gg';
import { City, Country, SocialMedia, State } from 'shared/businessobjects';
import { Notifications } from 'shared/enitites';
import { CommonService, CustomerRegistrationTemplate, FileStoreService, FileStoreTypes, IntlTelType, NotificationService, UtilityService, listBusinessTypeItems } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { SystemUserDNorm } from '../../../entities';
import { RegisterCustomer } from '../../../entities/register/register-customer';
import { RegisterService, SystemUserService } from '../../../services';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
  encapsulation: ViewEncapsulation.None
})

export class RegisterComponent implements OnInit {
  
  // fileupload ViewChild
  @ViewChild('profileFileupload', { static: false }) ProfileFileupload!: ElementRef;
  @ViewChild('photoIdentityFileupload', { static: false }) PhotoIdentityFileupload!: ElementRef;
  @ViewChild('businessIndentityFileupload', { static: false }) BusinessIndentityFileupload!: ElementRef;

  public separateDialCode = true;
  public SearchCountryField = SearchCountryField;
  public CountryISO = CountryISO;
  public PhoneNumberFormat = PhoneNumberFormat;
  public preferredCountries: CountryISO[] = [CountryISO.Belgium, CountryISO.Thailand, CountryISO.UnitedArabEmirates, CountryISO.UnitedStates];
  public primaryMobileNo!: any;
  public secondaryMobileNo!: any;
  public businessMobile!: any;
  // basic registration field
  public registerCustomer: RegisterCustomer = new RegisterCustomer();
  public mobileMask = '(999) 000-00-00-00';
  public phoneMask = '(9999) 000-00-00';
  public faxMask = '(999) 000-0000';
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

  // Disable future date for birthdate picker
  public disabledDates = (date: Date): boolean => {
    let todayDate = new Date();
    return (date > todayDate);
  };

  public listBusinessTypeItems = listBusinessTypeItems;

  // Designation DropdownValue
  public listDesignationItems: Array<string> = [
    "OWNER",
    "DIRECTOR",
    "PURCHASE MANAGER",
    "SALES MANAGER",
    "PURCHASE EXECUTIVE",
    "AUTHORISED PERSON",
    "GENERAL MANAGER"
  ];

  // Files upload variables
  public currentFile!: File;
  public profileImageFlag: boolean = false;
  public profileImageModel: any = undefined;
  public photoIdentityFlag: boolean = false;
  public photoIdentityModel: any = undefined;
  public businessIdentityFlag: boolean = false;
  public businessIdentityModel: any = undefined;

  //  Social Media
  public whatsAppNumber: string = '';
  public messengerLink: string = '';
  public skypeUserName: string = '';
  public snapChatUserName: string = '';
  public telegramUserName: string = '';
  public linkedInUserName: string = '';
  public fileUploadItems: Array<{ type: string, file: File }> = new Array<{ type: string, file: File }>();
  public profileImgExt: String[] = ['png', 'gif', 'jpeg', 'jpg', 'PNG', 'GIF', 'JPEG', 'JPG'];
  public docProofExt: String[] = ['png', 'gif', 'jpeg', 'jpg', 'pdf', 'PNG', 'GIF', 'JPEG', 'JPG', 'PDF'];
  public IntlTelType = IntlTelType;
  public primaryMobileValidation: boolean = false;
  public secondaryMobileValidation: boolean = false;
  public bussinessMobileValidation: boolean = false;
  public language: string = 'en';
  public showLangList: boolean = false;
  public placeholder: string = 'Select';
  public selectedItem: string = "";
  public languageList: Array<{ text: string; value: string }> = [];
  public logoPath: string = "";
  public logoPathWhite: string = "";
  public passwordPattern = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$!%*?&])([a-zA-Z0-9@#$!%*?&]{8,})$"
  public confirmPasswordText = '';
  public FileStoreTypes = FileStoreTypes;
  public imagePath: string = ""

  constructor(
    private router: Router,
    public commonService: CommonService,
    private alertDialogService: AlertdialogService,
    public registerService: RegisterService,
    public utilityService: UtilityService,
    private fileStoreService: FileStoreService,
    private translateService: TranslateService,
    private notificationService: NotificationService,
    private systemUserService: SystemUserService,
  ) {
    this.notificationService.getMessage();
  }

  async ngOnInit() {
    this.languageList = [{ text: 'English', value: 'en' }, { text: 'Chinese', value: 'ch' }]
    this.language = localStorage.getItem('language') ?? 'en';
    this.selectedItem = this.languageList.find(x => x.value == this.language)?.text.toString() ?? '';
    await this.defaultMethodsLoad();
    this.notificationService.connectWebsocket(this.utilityService.makeRandomString(15));
    this.logoPath = this.utilityService.getCusLogoPath(window.location.href);
    this.logoPathWhite = this.utilityService.getLogoPathWhite(window.location.href);
    this.imagePath = this.utilityService.getLoginImagePath(window.location.href);
  }

  public async defaultMethodsLoad() {
    await this.getCountryData();
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
      this.selectedCountry = this.countryItems.find(c => c.name == e);
      if (this.selectedCountry)
        await this.getStatesByCountryCode(this.selectedCountry.iso2)
    }
    catch (error: any) {
      this.alertDialogService.show(error.error)
    }
  }

  private async getStatesByCountryCode(country_code: string) {
    try {
      this.stateItems = await this.commonService.getStatesByCountryCode(country_code)
    }
    catch (error: any) {
      this.alertDialogService.show(error.error)
    }
  }

  public async onStateChange(e: string) {
    try {
      this.selectedState = this.stateItems.find((c: State) => c.name == e);
      if (this.selectedState)
        await this.getCityData(this.selectedCountry, this.selectedState.state_Code)
    }
    catch (error: any) {
      this.alertDialogService.show(error.error)
    }
  }

  public async getCityData(selectedCountry: Country, state_code: string) {
    try {
      this.cityItems = await this.commonService.getCitiesByCountryCodeandStateCode(selectedCountry.iso2, state_code)
    }
    catch (error: any) {
      this.alertDialogService.show(error.error)
    }
  }

  public onCityChange(e: string): void {
    try {
      this.selectedCity = this.cityItems.find((c: City) => c.name == e);
    }
    catch (error: any) {
      this.alertDialogService.show(error.error)
    }
  }

  public async onRegisterSubmit(form: NgForm) {
    try {
      if (form.valid) {

        if (this.businessIdentityModel == null || this.businessIdentityModel == undefined || this.businessIdentityModel == '') {
          this.alertDialogService.show("Business Proof Is Compulsory!");
          this.businessIdentityFlag = true;
          return
        }
        else
          this.businessIdentityFlag = false;

        if (this.photoIdentityModel == null || this.photoIdentityModel == undefined || this.photoIdentityModel == '') {
          this.alertDialogService.show("Photo Identity Proof Is Compulsory!");
          this.photoIdentityFlag = true;
          return
        }
        else
          this.photoIdentityFlag = false;



        if (this.photoIdentityFlag == false && this.businessIdentityFlag == false) {
          this.registerCustomer.fullName = this.registerCustomer.name?.firstName + " " + this.registerCustomer.name?.middleName + " " + this.registerCustomer.name?.lastName;
          this.registerCustomer.countryCode = this.selectedCountry?.iso2;
          this.registerCustomer.primaryMobile = this.primaryMobileNo?.e164Number;
          this.registerCustomer.secondaryMobile = (this.secondaryMobileNo && this.secondaryMobileNo?.e164Number ? this.secondaryMobileNo?.e164Number : null);
          this.registerCustomer.businessMobileNo = (this.businessMobile && this.businessMobile?.e164Number ? this.businessMobile?.e164Number : null);
          this.registerCustomer.birthDate = this.utilityService.setUTCDateFilter(this.registerCustomer?.birthDate);
          let socialMediaValues: SocialMedia[] = this.setSocialMediaResponse();
          this.registerCustomer.socialMedias = socialMediaValues;
          this.registerCustomer.createdBy = window.location.href;

          let response = await this.registerService.registerCustomer(this.registerCustomer);
          if (response && response.isSuccess) {
            for (let index = 0; index < this.fileUploadItems.length; index++) {
              const element = this.fileUploadItems[index];
              await this.uploadFilesOnServer(element.file, element.type, response.message, index, form);
            }
            // TODO : Once API Resolved with response then removed
            await this.sendMessage(response.message, this.registerCustomer.email);
            this.utilityService.showNotification(`You have been Registered, Please wait until we verify you!`);
            this.resetForm(form);
            this.fileUploadItems = [];
            this.router.navigate(['login']);
          }
          else {
            if (response && response.message)
              this.utilityService.showNotification(response.message, "warning");
            else
              this.alertDialogService.show(`Something went wrong!`, "error");
          }
        }
      }
      else {
        Object.keys(form.controls).forEach(key => {
          form.controls[key].markAsTouched();
        });
      }
    } catch (error: any) {
      console.error(error);
      if (error && error.error && error.error == 'Email Id is Already Registered')
        this.utilityService.showNotification(error.error, "warning");
      else
        this.alertDialogService.show(`Something went wrong!`, "error");
    }
  }

  public resetForm(form: NgForm) {
    form.reset();
    // this.clearPhotoProfile(form);
    this.clearPhotoIdentity(form);
    this.clearBusinessIdentity(form);
  }

  public async sendMessage(customerVerificationId: string, customerEmail: string) {
    var result = await this.systemUserService.getAllSupportersAsync();
    if (result) {
      // this.notificationService.connectWebsocket(customerVerificationId);
      let recevierIds = result.map((u: SystemUserDNorm) => u.id);
      if (recevierIds && recevierIds.length > 0) {
        recevierIds.forEach(async z => {
          let message: Notifications = CustomerRegistrationTemplate(customerVerificationId, z, customerEmail);
          let notificationResponse = await this.notificationService.insertNotification(message);
          if (notificationResponse) {
            message.id = notificationResponse;
            this.notificationService.messages.next(message);
          }
        });
      }
    }
  }

  public setSocialMediaResponse() {
    let customerSocialMedia: SocialMedia[] = [];
    if (this.whatsAppNumber)
      customerSocialMedia.push({ provider: { providerName: "Whatsapp", mediaType: "Messaging" }, profileName: "", mobileNumber: this.whatsAppNumber })

    if (this.messengerLink)
      customerSocialMedia.push({ provider: { providerName: "Facebook", mediaType: "Messaging" }, profileName: this.messengerLink, mobileNumber: "" })

    if (this.skypeUserName)
      customerSocialMedia.push({ provider: { providerName: "Skype", mediaType: "Messaging" }, profileName: this.skypeUserName, mobileNumber: "" })

    if (this.snapChatUserName)
      customerSocialMedia.push({ provider: { providerName: "SnapChat", mediaType: "Messaging" }, profileName: this.snapChatUserName, mobileNumber: "" })

    if (this.telegramUserName)
      customerSocialMedia.push({ provider: { providerName: "Telegram", mediaType: "Messaging" }, profileName: this.telegramUserName, mobileNumber: "" })

    if (this.linkedInUserName)
      customerSocialMedia.push({ provider: { providerName: "LinkedIn", mediaType: "Messaging" }, profileName: this.linkedInUserName, mobileNumber: "" })

    return customerSocialMedia;
  }

  // public clearPhotoProfile(form: NgForm) {
  //   this.ProfileFileupload.nativeElement.value = "";
  //   this.profileImageModel = undefined;
  //   this.profileImageFlag = false;
  // }

  public clearPhotoIdentity(form: NgForm) {
    this.PhotoIdentityFileupload.nativeElement.value = "";
    this.photoIdentityModel = undefined;
    this.photoIdentityFlag = false;
  }

  public clearBusinessIdentity(form: NgForm) {
    this.BusinessIndentityFileupload.nativeElement.value = "";
    this.businessIdentityModel = undefined;
    this.businessIdentityFlag = false;
  }

  public navigateBackward(): void {
    window.history.back();
  }

  private fileChecknPush(type: string) {
    if (this.fileUploadItems && this.fileUploadItems.length > 0) {
      let IsExistFile: any = this.fileUploadItems.find((item: any) => item.type.toLowerCase() == type.toLowerCase());
      if (IsExistFile)
        IsExistFile.file = this.currentFile;
      else
        this.fileUploadItems.push({ type: type, file: this.currentFile });
    }
    else
      this.fileUploadItems.push({ type: type, file: this.currentFile });

    if (type == FileStoreTypes.CustomerProfile) {
      this.profileImageModel = this.currentFile;
      if (this.profileImageFlag)
        this.profileImageFlag = false;
    }
    else if (type == FileStoreTypes.CustomerPhotoIdent) {
      this.photoIdentityModel = this.currentFile;
      if (this.photoIdentityFlag)
        this.photoIdentityFlag = false;
    }
    else if (type == FileStoreTypes.CustomerBussinessIdent) {
      this.businessIdentityModel = this.currentFile;
      if (this.businessIdentityFlag)
        this.businessIdentityFlag = false;
    }
  }

  public uploadFiles(form: NgForm, event: Event, type: string): void {
    let file!: any;
    const target = event.target as HTMLInputElement;

    if (target.files && target.files.length)
      file = target.files[0];

    this.currentFile = file;

    if (this.currentFile) {
      // if (type == FileStoreTypes.CustomerProfile) {
      //   if (this.profileImgExt.includes(file.name.split(".").pop().toLowerCase()))
      //     this.fileChecknPush(type);
      //   else
      //     this.alertDialogService.show(`Please select valid file.`);
      // }
      // else
      //   this.ProfileFileupload.nativeElement.value = "";

      if (type == FileStoreTypes.CustomerPhotoIdent) {
        if (this.docProofExt.includes(file.name.split(".").pop().toLowerCase()))
          this.fileChecknPush(type);
        else
          this.alertDialogService.show(`Please select valid file.`);
      }
      else
        this.PhotoIdentityFileupload.nativeElement.value = "";

      if (type == FileStoreTypes.CustomerBussinessIdent) {
        if (this.docProofExt.includes(file.name.split(".").pop().toLowerCase()))
          this.fileChecknPush(type);
        else
          this.alertDialogService.show(`Please select valid file.`);
      }
      else
        this.BusinessIndentityFileupload.nativeElement.value = "";

    }
  }

  public async uploadFilesOnServer(file: File, type: string, ident: string, index: number, form: NgForm) {
    this.fileStoreService.postUploadFileDocument(file, type, ident, this.registerCustomer?.email).subscribe(
      (res: any) => {
        if (res.body?.statusCode == 200) {
          let response = res.body.value;
          this.setFileuploadResponse(response, type);
        }

      },
      (err: any) => {
        this.currentFile = null as any;
        this.alertDialogService.show(`Something went wrong while uploading a file!`, "error")
      }
    );
  }

  public setFileuploadResponse(response: any, type: string) {
    if (type == FileStoreTypes.CustomerProfile) {
      if (this.profileImageFlag)
        this.profileImageFlag = false;
    }
    else if (type == FileStoreTypes.CustomerPhotoIdent) {
      if (this.photoIdentityFlag)
        this.photoIdentityFlag = false;
    }
    else {
      if (this.businessIdentityFlag)
        this.businessIdentityFlag = false;
    }
  }

  public checkIntPhoneValidation(event: any, type: string, form: NgForm) {
    if (type === IntlTelType.PrimaryMobile)
      this.primaryMobileValidation = event === null ? true : false;
    else if (type === IntlTelType.SecondaryMobile)
      this.secondaryMobileValidation = event === null ? true : false;
    else if (type === IntlTelType.BusinessMobile)
      this.bussinessMobileValidation = event === null ? true : false;
  }

  public async languageChange(language: any) {
    this.translateService.setDefaultLang(language.target.value);
  }

  //#region  Language 
  public showLanguageList() {
    this.showLangList = !this.showLangList;//true;
  }

  public async changeLanguage(event: any) {
    this.selectedItem = event.text;
    this.showLangList = false;
    this.translateService.setDefaultLang(event.value);
  }

  public onClickedOutside(event: Event) {
    if (this.showLangList)
      this.showLangList = false;
  }
  //#endregion
}
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import * as moment from 'moment';
import { CountryISO, PhoneNumberFormat, SearchCountryField } from 'ngx-intl-tel-input-gg';
import { NgxSpinnerService } from 'ngx-spinner';
import { City, CommonResponse, Country, CreditLimit, State } from 'shared/businessobjects';
import { AzureFileStore, Notifications, RegisterModel, SystemUserPermission, fxCredential } from 'shared/enitites';
import { AccountService, AppPreloadService, CommonService, CustomerVerifyTemplate, FileStoreService, FileStoreTypes, IntlTelType, NotificationService, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { Configurations, RegisterCustomer, SystemUser, SystemUserDNorm } from '../../../../entities';
import { Customer } from '../../../../entities/customer/customer';
import { ConfigurationService, CustomerService, CustomerVerificationService, SystemUserService } from '../../../../services';

@Component({
  selector: 'app-customerverify',
  templateUrl: './customerverify.component.html',
  styleUrls: ['./customerverify.component.css']
})
export class CustomerVerifyComponent implements OnInit {
  @Input() public registerCustomerId: string = '';
  @Output() toggle: EventEmitter<boolean> = new EventEmitter();

  private fxCredential!: fxCredential;
  public isRegSystemUser: boolean = false;
  public registerCustomer: RegisterCustomer = new RegisterCustomer();
  public countryItems!: Country[];
  public selectedCountry: any;
  public stateItems!: State[];
  public selectedState: any;
  public cityItems!: City[];
  public selectedCity: any;
  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains',
  };
  separateDialCode = true;
  SearchCountryField = SearchCountryField;
  CountryISO = CountryISO;
  PhoneNumberFormat = PhoneNumberFormat;
  preferredCountries: CountryISO[] = [CountryISO.Belgium, CountryISO.Thailand, CountryISO.UnitedArabEmirates, CountryISO.UnitedStates];
  intMobileNo: any;
  public creditLimit: CreditLimit = new CreditLimit();
  public incomeTaxNo: string = "";
  public customer: Customer = new Customer();
  public seller: SystemUserDNorm = new SystemUserDNorm();
  public listSellerDNormItems: Array<{ text: string; value: string }> = [];
  public sellerDNormItems!: SystemUserDNorm[];
  public selectedSellerDNormItem?: string;
  public fileStore: AzureFileStore[] = [];
  public cloneFileStore: AzureFileStore[] = [];
  public isShowDocument: boolean = false;
  public imgSrcDisplay!: string
  public isAddCustomerDialog: boolean = false;
  public profileTxt = FileStoreTypes.CustomerProfile;
  public indentProofTxt = FileStoreTypes.CustomerPhotoIdent;
  public businessProofTxt = FileStoreTypes.CustomerBussinessIdent
  public isAdminRole = false;
  public isSupportRole = false;
  public configurationObj: Configurations = new Configurations();
  public primaryMobileNo!: any;
  public IntlTelType = IntlTelType;
  public primaryMobileValidation: boolean = false;
  public secondaryMobileNo!: any;
  public secondaryMobileValidation: boolean = false;
  public isCanApproveCustomer: boolean = false;
  public businessMobileNo!: any;
  public businessMobileValidation: boolean = false;
  public inputState: string = "";
  public inputCity: string = "";
  public profileFileStore: AzureFileStore = new AzureFileStore();
  public photoIdentityFileStore: AzureFileStore = new AzureFileStore();
  public businessIndentityFileStore: AzureFileStore = new AzureFileStore();
  public FileStoreTypes = FileStoreTypes;
  public showUploadIdent = true;
  public showUploadBusiness = true;
  public showUploadProfile = true;

  public fileUploadItems: Array<{ type: string, file: File }> = new Array<{ type: string, file: File }>();
  public businessIndentityFileFound: boolean = false;
  public photoIdentityFileFound: boolean = false;

  constructor(
    public customerService: CustomerService,
    public customerVerificationService: CustomerVerificationService,
    private systemUserService: SystemUserService,
    private router: Router,
    private commonService: CommonService,
    public utilityService: UtilityService,
    public notificationService: NotificationService,
    private alertDialogService: AlertdialogService,
    private spinnerService: NgxSpinnerService,
    private appPreloadService: AppPreloadService,
    private accountService: AccountService,
    private fileStoreService: FileStoreService,
    private sanitizer: DomSanitizer,
    private configurationService: ConfigurationService) { }

  async ngOnInit() {
    await this.defaultMethods();
  }

  public async defaultMethods() {
    try {
      this.spinnerService.show();
      await this.setUserRights();

      this.fxCredential = await this.appPreloadService.fetchFxCredentials();
      if (!this.fxCredential)
        this.router.navigate(["login"]);

      if (this.fxCredential?.origin == 'Admin')
        this.isAdminRole = true;

      if (this.fxCredential?.origin == 'Support')
        this.isSupportRole = true;

      await this.getCountryData();
      await this.loadCustomer();

      await this.getSellerDNormData();
      this.registerCustomer.birthDate = this.getValidDate(this.registerCustomer.birthDate);
      this.spinnerService.hide();

    } catch (error: any) {
      console.error(error);
      this.alertDialogService.show('Something went wrong (defaultMethods), Try again later!');
      this.spinnerService.hide();
    }
  }

  public async setUserRights() {
    let userPermissions: SystemUserPermission = new SystemUserPermission();
    let sesValue = sessionStorage.getItem("userPermission");
    if (sesValue)
      userPermissions = JSON.parse(sesValue) as SystemUserPermission;
    if (userPermissions.actions.length > 0) {
      let CanApproveCustomer = userPermissions.actions.find(z => z.name == "CanApproveCustomer");
      if (CanApproveCustomer != null)
        this.isCanApproveCustomer = true;
    }
  }

  public async loadCustomer() {
    try {
      let response = await this.customerVerificationService.getCustomersById(this.registerCustomerId);
      if (response) {
        this.registerCustomer = response;
        this.primaryMobileNo = this.registerCustomer.primaryMobile ?? "";
        this.secondaryMobileNo = this.registerCustomer.secondaryMobile ?? "";
        this.businessMobileNo = this.registerCustomer.businessMobileNo ?? "";

        let imageList: AzureFileStore[] = await this.fileStoreService.getAzureFileByIdent(this.registerCustomerId);
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

        if (this.registerCustomer.address.state)
          this.inputState = JSON.parse(JSON.stringify(this.registerCustomer.address.state));
        if (this.registerCustomer.address.city)
          this.inputCity = JSON.parse(JSON.stringify(this.registerCustomer.address.city));

        this.selectedCountry = this.countryItems.find((c) => c.name == this.registerCustomer.address.country);

        let valueCountryExist = this.countryItems.filter((s: any) => {
          return s.name === this.registerCustomer.address.country;
        });

        if (valueCountryExist !== undefined && valueCountryExist !== null && valueCountryExist.length > 0) {
          await this.getStatesByCountryCode(valueCountryExist[0].iso2);
          setTimeout(async () => {
            let valueStateExist = this.stateItems.filter((s: any) => {
              return s.name?.toLowerCase() === this.registerCustomer.address.state?.toLowerCase();
            });
            if (valueStateExist !== undefined && valueStateExist !== null && valueStateExist.length > 0)
              await this.getCityData(valueCountryExist[0], valueStateExist[0].state_Code);
          }, 200);
        }

        if (this.stateItems && this.stateItems.length > 0) {
          let valueStateExist = this.stateItems.filter((s: any) => {
            return s.name.toLowerCase() === this.registerCustomer.address.state.toLowerCase();
          });

          if (!(valueStateExist !== undefined && valueStateExist !== null && valueStateExist.length > 0))
            this.registerCustomer.address.state = "";
        }

        if (this.cityItems && this.cityItems.length > 0) {
          let valueCityExist = this.cityItems.filter((s: any) => {
            return s.name.toLowerCase() === this.registerCustomer.address.city.toLowerCase();
          });
          if (!(valueCityExist !== undefined && valueCityExist !== null && valueCityExist.length > 0))
            this.registerCustomer.address.city = "";
        }

      }
    }
    catch (error: any) {
      console.error(error);
      this.alertDialogService.show('Something went wrong(loadCustomer), Try again later!');
    }
  }

  private setCustomerImages() {
    let profileFileStore = this.fileStore.find(z => z.identType == FileStoreTypes.CustomerProfile);
    if (profileFileStore == null) {
      profileFileStore = new AzureFileStore();
    }
    else {
      this.profileFileStore = profileFileStore;
    }

    let photoIdentityFileStore = this.fileStore.find(z => z.identType == FileStoreTypes.CustomerPhotoIdent);
    if (photoIdentityFileStore == null) {
      photoIdentityFileStore = new AzureFileStore();
      this.photoIdentityFileFound = false;
    }
    else {
      this.photoIdentityFileFound = true;
      this.photoIdentityFileStore = photoIdentityFileStore;
    }

    let businessIndentityFileStore = this.fileStore.find(z => z.identType == FileStoreTypes.CustomerBussinessIdent);
    if (businessIndentityFileStore == null) {
      businessIndentityFileStore = new AzureFileStore();
      this.businessIndentityFileFound = false;
    }
    else {
      this.businessIndentityFileFound = true;
      this.businessIndentityFileStore = businessIndentityFileStore;
    }
  }

  private loadImage(imageSrc: string) {
    if (imageSrc != undefined && imageSrc != null && imageSrc != "")
      return 'data:image/JPEG;base64,' + imageSrc;
    else
      return null
  }

  public getValidDate(date: any): Date {
    const day = moment(date).date();
    const month = moment(date).month();
    const year = moment(date).year();
    var newDate = new Date(year, month, day);
    return newDate;
  }

  private async getCountryData() {
    try {
      this.countryItems = await this.commonService.getCountries();
    }
    catch (error: any) {
      console.error(error);
      this.alertDialogService.show('Something went wrong(getCountryData), Try again later!');
    }
  }

  public async onCountryChange(e: string) {
    try {
      this.spinnerService.show();
      this.selectedCountry = this.countryItems.find((c) => c.name == e);
      if (this.selectedCountry != null)
        await this.getStatesByCountryCode(this.selectedCountry.iso2);

      this.registerCustomer.address.state = null as any;
      this.registerCustomer.address.city = null as any;
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      console.error(error);
      this.alertDialogService.show('Something went wrong(onCountryChange), Try again later!');
    }
  }

  private async getStatesByCountryCode(country_code: string) {
    try {
      this.stateItems = await this.commonService.getStatesByCountryCode(country_code);
    }
    catch (error: any) {
      this.spinnerService.hide();
      console.error(error);
      this.alertDialogService.show('Something went wrong(getStatesByCountryCode), Try again later!');
    }
  }

  public async onStateChange(e: string) {
    try {
      this.spinnerService.show();
      this.selectedState = this.stateItems.find((c: State) => c.name == e);
      if (this.selectedState != null)
        await this.getCityData(this.selectedCountry, this.selectedState.state_Code);

      this.registerCustomer.address.city = null as any;
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      console.error(error);
      this.alertDialogService.show('Something went wrong(onStateChange), Try again later!');
    }
  }

  public async getCityData(selectedCountry: Country, state_code: string) {
    try {
      this.cityItems = await this.commonService.getCitiesByCountryCodeandStateCode(selectedCountry.iso2, state_code);
    }
    catch (error: any) {
      this.spinnerService.hide();
      console.error(error);
      this.alertDialogService.show('Something went wrong(getCityData), Try again later!');
    }
  }

  public onCityChange(e: string): void {
    try {
      if (e != null)
        this.selectedCity = this.cityItems.find((c: City) => c.name == e);
    }
    catch (error: any) {
      this.spinnerService.hide();
      console.error(error);
      this.alertDialogService.show('Something went wrong(onCityChange), Try again later!');
    }
  }

  public closeCustVerificationDialog(): void {
    this.toggle.emit(false);
  }

  public getSocialMediaData(socialMediaType: string) {
    return this.registerCustomer.socialMedias.find((c) => c.provider.providerName.toLowerCase() == socialMediaType.toLowerCase());
  }

  //#region Accpet/Reject Customer
  public async acceptOrRejectCustomerConfirm(form: NgForm, isAccept: boolean) {
    let businessProof = this.fileStore.find(z => z.identType == FileStoreTypes.CustomerBussinessIdent);
    if (businessProof == null) {
      this.alertDialogService.show('Bussiness Proof is required!');
      return;
    }

    this.alertDialogService.ConfirmYesNo('Are you sure?', 'Customer verification')
      .subscribe(async (res: any) => {
        if (res.flag) {
          try {
            if (this.isAdminRole)
              await this.acceptOrRejectCustomer(form, isAccept);
            else
              await this.updateRegisterCustomer(isAccept);
          }
          catch (error: any) {
            this.spinnerService.hide();
            this.alertDialogService.show(error.error);
          }
        }
      });
  }

  public async updateRegisterCustomer(isAccept: boolean) {
    try {
      this.spinnerService.show();
      this.registerCustomer.isSupportVerify = isAccept;

      if (this.primaryMobileNo && this.primaryMobileNo.e164Number)
        this.registerCustomer.primaryMobile = this.primaryMobileNo.e164Number;
      if (this.secondaryMobileNo && this.secondaryMobileNo.e164Number)
        this.registerCustomer.secondaryMobile = this.secondaryMobileNo.e164Number;
      if (this.businessMobileNo && this.businessMobileNo.e164Number)
        this.registerCustomer.businessMobileNo = this.businessMobileNo.e164Number;

      let res = await this.customerVerificationService.updateRegisterCustomer(this.registerCustomer);
      if (res && res.isSuccess) {
        this.spinnerService.hide();

        //Remove completed action notification
        let response = await this.notificationService.deleteMessagesByParamId(this.registerCustomerId);
        if (response)
          this.notificationService.MessageLoadSub();

        //Send notification to admin if accepted
        if (isAccept)
          await this.sendMessage(this.registerCustomer.email, this.registerCustomer.id);

        this.utilityService.showNotification('Customer updated successfully.!');
        this.closeCustVerificationDialog();
      }
      else {
        this.spinnerService.hide();
        this.alertDialogService.show(res.message);
      }
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Customer not update, Try again later!');
    }
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
        if (type == FileStoreTypes.CustomerProfile) {
          const reader = new FileReader();
          reader.onload = () => {
            let base64 = reader.result;
            this.profileFileStore.fileThumbnail = base64?.toString() ?? '';

            this.profileFileStore.identType = type;
            this.profileFileStore.blobName = file.name;
            this.fileStore.push(this.profileFileStore);
          };
          reader.readAsDataURL(file);
          this.showUploadProfile = false;
        }
        else if (type == FileStoreTypes.CustomerPhotoIdent) {
          const reader = new FileReader();
          reader.onload = () => {
            let base64 = reader.result;
            this.photoIdentityFileStore.fileThumbnail = base64?.toString() ?? '';
            if (base64?.toString().includes('application/pdf'))
              this.photoIdentityFileStore.fileThumbnail = 'commonAssets/images/pdf_doc.png';

            this.photoIdentityFileStore.identType = type;
            this.photoIdentityFileStore.blobName = file.name;
            this.fileStore.push(this.photoIdentityFileStore);
          };
          reader.readAsDataURL(file);
          this.showUploadIdent = false;
        }
        else {
          const reader = new FileReader();
          reader.onload = () => {
            let base64 = reader.result;
            this.businessIndentityFileStore.fileThumbnail = base64?.toString() ?? '';
            if (base64?.toString().includes('application/pdf'))
              this.businessIndentityFileStore.fileThumbnail = 'commonAssets/images/pdf_doc.png';

            this.businessIndentityFileStore.identType = type;
            this.businessIndentityFileStore.blobName = file.name;
            this.fileStore.push(this.businessIndentityFileStore);
          };
          reader.readAsDataURL(file);
          this.showUploadBusiness = false;
        }

        if (this.fileUploadItems.length > 0) {
          let index = this.fileUploadItems.findIndex(z => z.type == type);
          if (index != -1)
            this.fileUploadItems.splice(index, 1);
        }

        this.fileUploadItems.push({ file: file, type: type });
      }
    }
    catch (error: any) {
      console.error(error);
      this.alertDialogService.show("Something went wrong, Try again later");
    }
  }

  public async acceptOrRejectCustomer(form: NgForm, isAccept: boolean) {
    try {
      if (isAccept) {
        if (this.seller == null || this.seller?.id == null) {
          this.alertDialogService.show('Please select seller..!');
          return;
        }
      }

      this.spinnerService.show();
      this.fillCustomerRequest(this.registerCustomer, isAccept);
      if (this.customer !== undefined && this.customer !== null) {
        let response: CommonResponse = await this.customerVerificationService.acceptOrRejectCustomer(this.customer, isAccept);
        if (response && response.isSuccess) {
          if (this.registerCustomer.password != undefined && this.registerCustomer.password != null && response.message?.toLowerCase() != "rejected")
            this.addUserForCustomer(response.message, this.customer, this.registerCustomer.password);
          else
            this.closeCustVerificationDialog();

          this.spinnerService.hide();
          this.utilityService.showNotification("Customer updated successfully!");
        } else {
          this.spinnerService.hide();
          this.alertDialogService.show(response.message);
        }
      }
      else {
        this.spinnerService.hide();
        this.alertDialogService.show('Customer not found, Try again later!');
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public fillCustomerRequest(registerCustomer: RegisterCustomer, isAccept: boolean) {
    this.customer.id = registerCustomer.id;
    // Basic Info
    this.customer.name.firstName = registerCustomer.name.firstName;
    this.customer.createdBy = registerCustomer.createdBy;
    this.customer.name.lastName = registerCustomer.name.lastName;
    this.customer.name.middleName = registerCustomer.name.middleName;
    this.customer.fullName = registerCustomer.fullName;
    this.customer.email = registerCustomer.email;
    this.customer.mobile1 = registerCustomer.primaryMobile;
    this.customer.mobile2 = registerCustomer.secondaryMobile;
    this.customer.phoneNo = registerCustomer.phoneNo;
    this.customer.birthDate = registerCustomer.birthDate;
    this.customer.countryCode = registerCustomer.countryCode;
    // BusinessInfo
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
    // SocailMedias List
    this.customer.socialMedias = registerCustomer.socialMedias;

    //Extra Fields
    this.customer.creditLimit = this.creditLimit;
    this.customer.incomeTaxNo = this.incomeTaxNo;
    if (isAccept)
      this.customer.seller = this.seller;
    else {
      let user = new SystemUserDNorm();
      user.id = this.fxCredential?.id;
      user.name = this.fxCredential?.fullName;
      user.email = registerCustomer.email;
      user.mobile = registerCustomer.primaryMobile;

      this.customer.seller = user;
    }
    this.customer.businessProofExpiryDate = registerCustomer.businessProofExpiryDate;
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
  //#endregion

  //#region User Register
  public async addUserForCustomer(id: string, customer: Customer, password: string) {
    try {
      let userObj: RegisterModel = new RegisterModel();
      userObj.ident = id;
      userObj.origin = customer.origin.toString();
      userObj.email = customer.email;
      userObj.phoneNumber = customer.mobile1;
      userObj.password = password;
      userObj.confirmPassword = password;

      var result = await this.accountService.insertCustomerUser(userObj);
      if (result == "Success") {
        await this.updateFileStoreWithCustomerId(id);
        this.utilityService.showNotification(`New customer register successfully!`)

        //Remove Notification
        let response = await this.notificationService.deleteMessagesByParamId(this.registerCustomerId);
        if (response)
          this.notificationService.MessageLoadSub();

        await this.sendApprovalMailToCustomer(userObj, password);
        this.closeCustVerificationDialog();
      }
      else {
        this.spinnerService.hide();
        var errorObj = JSON.parse(result);
        this.alertDialogService.show(errorObj[0]?.description ?? "Something went wrong(addUserForCustomer), Try again later!");
        await this.revertCustomer(id);
      }
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('User not created, Please contact administrator!');
      await this.revertCustomer(id);
    }
  }

  private async revertCustomer(id: string) {
    try {
      let res = await this.customerVerificationService.revertAcceptedCustomer(id);
      if (res && res.isSuccess)
        this.utilityService.showNotification('Customer removed successfully!');
      else
        console.error(res);

    } catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Customer not removed, Please contact administrator!', 'error');
    }
  }

  public async sendMessage(customerEmail: string, customerId: string) {
    this.configurationObj = await this.configurationService.getConfiguration();
    let selectedAdminUser = this.configurationObj?.custVerificationUser?.id ? this.configurationObj?.custVerificationUser : this.configurationObj?.adminUser;
    if (selectedAdminUser && selectedAdminUser?.id) {
      let message: Notifications = CustomerVerifyTemplate(this.fxCredential.id, selectedAdminUser?.id, this.fxCredential.fullName, customerEmail, customerId);
      let notificationResponse = await this.notificationService.insertNotification(message);
      if (notificationResponse) {
        message.id = notificationResponse;
        this.notificationService.messages.next(message);
      }
    }
    else
      this.alertDialogService.show("Kindly configure default admin in configuration");
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

  public async updateFileStoreWithCustomerId(id: string) {
    try {
      if (this.fileUploadItems.length > 0) {
        for (let index = 0; index < this.fileUploadItems.length; index++) {
          const element = this.fileUploadItems[index];
          await this.uploadFilesOnServer(element.file, element.type, id, index);

          let i = this.cloneFileStore.findIndex(z => z.identType == element.type);
          if (i != -1)
            this.cloneFileStore.splice(i, 1);
        }
      }

      if (this.cloneFileStore.length > 0) {
        for (let index = 0; index < this.cloneFileStore.length; index++) {
          const element = this.cloneFileStore[index];
          element.ident = id;
          await this.fileStoreService.updateAzureFileStore(element);
        }
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public uploadFilesOnServer(file: File, type: string, ident: string, index: number) {
    this.fileStoreService.postUploadFileDocument(file, type, ident, this.registerCustomer.email).subscribe(
      (res: any) => {
        if (res && res.body?.statusCode == 200) {
          let response = res.body.value;
          if (index == this.fileUploadItems.length - 1)
            this.fileUploadItems = [];

        }
      },
      (err: any) => {
        this.cloneFileStore = null as any;
        console.error(err);
        this.alertDialogService.show(`Something went wrong while uploading a file!`, "error")
      }
    );
  }
  //#endregion

  public async getImagePath(type: string) {
    let image: AzureFileStore = this.fileStore.find(z => z.identType.toLowerCase() == type.toLowerCase()) as AzureFileStore;
    if (image) {
      let imgSrcDisplay = await this.fileStoreService.downloadBlobFile(image.id)
      this.imgSrcDisplay = await this.utilityService.blobToBase64WithMIME(imgSrcDisplay) as string;
    }
    else
      this.imgSrcDisplay = "commonAssets/images/image-not-found.jpg";

  }

  public getThumbnailImagePath(type: string) {
    if (type != undefined && type != null && type != "") {
      let image: AzureFileStore = this.fileStore.find(z => z.identType.toLowerCase() == type.toLowerCase()) as AzureFileStore;
      if (image)
        return image.fileThumbnail;
      else {
        if (type == FileStoreTypes.CustomerProfile)
          return "commonAssets/images/userprofile.png";
        else
          return "commonAssets/images/image-not-found.jpg";
      }
    }
    return null;
  }

  public async openDocumentDialog(type: string) {
    try {
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
    catch (error: any) {
      this.alertDialogService.show(error.error);
    }
  }

  public async removeDocument(type: string) {
    let index = this.fileStore.findIndex(z => z.identType.toLowerCase() == type.toLowerCase());
    if (index != -1)
      this.fileStore.splice(index, 1);

    if (type == FileStoreTypes.CustomerProfile)
      this.showUploadProfile = true;
    else if (type == FileStoreTypes.CustomerBussinessIdent)
      this.showUploadBusiness = true;
    else if (type == FileStoreTypes.CustomerPhotoIdent)
      this.showUploadIdent = true;
  }

  public closeDocumentDialog() {
    this.isShowDocument = false;
  }

  public sanitizeURL(url: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  public checkIntPhoneValidation(event: any, type: string, form: NgForm) {
    if (type === IntlTelType.PrimaryMobile)
      this.primaryMobileValidation = event === null ? true : false;
    else if (type === IntlTelType.SecondaryMobile)
      this.secondaryMobileValidation = event === null ? true : false;
    else if (type === IntlTelType.BusinessMobile)
      this.businessMobileValidation = event === null ? true : false;
  }
}
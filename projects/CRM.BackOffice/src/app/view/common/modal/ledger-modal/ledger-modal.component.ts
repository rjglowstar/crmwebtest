import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { SelectableSettings } from '@progress/kendo-angular-grid';
import { CountryISO, PhoneNumberFormat, SearchCountryField } from 'ngx-intl-tel-input-gg';
import { NgxSpinnerService } from 'ngx-spinner';
import { CommuteItem, LedgerSearchCriteria } from 'projects/CRM.BackOffice/src/app/businessobjects';
import { Broker, Customer } from 'projects/CRM.FrontOffice/src/app/entities';
import { Address, City, Country, State } from 'shared/businessobjects';
import { AzureFileStore } from 'shared/enitites';
import { CommonService, FileStoreService, FileStoreTypes, IntlTelType, TransactionType, UtilityService, listAddressTypeItems, listBusinessTypeItems, listCurrencyType } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { BankDNorm, BrokerDNorm, Ledger, LedgerDNorm, LedgerGroup } from '../../../../entities';
import { AccountingconfigService, CommuteService, LedgerService } from '../../../../services';
@Component({
  selector: 'app-ledger-modal',
  templateUrl: './ledger-modal.component.html',
  styleUrls: ['./ledger-modal.component.css']
})
export class LedgermodalComponent implements OnInit {

  @Input() ledgerIdent: string = "";
  @Input() ledgerType: string = "";
  @Input() showSearch: boolean = false;
  @Input() public ledgerObj: Ledger = new Ledger();
  @Output() toggle: EventEmitter<boolean> = new EventEmitter();
  @Output() successEvent: EventEmitter<{ flag: boolean, type: string, ledger: Ledger }> = new EventEmitter();

  public listBusinessTypeItems = listBusinessTypeItems;
  public listAddressTypeItems = listAddressTypeItems;
  public websitePattern = "(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?"
  public countryItems!: Country[];
  public selectedCountry: any;
  public stateItems!: State[];
  public selectedState: any;
  public cityItems!: City[];
  public selectedCity: any;
  public selectableSettings: SelectableSettings = {
    mode: 'single',
  };
  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains'
  };
  public listLedgerGroupItems: Array<LedgerGroup> = new Array<LedgerGroup>();
  public ledgerGroupId!: LedgerGroup;
  public ledgerGroupIdForSearch!: string;
  public showBrokerSection: boolean = false;
  public cloneLedgerObj: Ledger = new Ledger();
  public isBankRequired: boolean = false;
  public transactionType = TransactionType;
  @ViewChild('profileFileupload', { static: false }) ProfileFileupload!: ElementRef;
  @ViewChild('photoIdentityFileupload', { static: false }) PhotoIdentityFileupload!: ElementRef;
  @ViewChild('businessIndentityFileupload', { static: false }) BusinessIndentityFileupload!: ElementRef;
  public currentFile!: File;
  public profileImageFlag: boolean = false;
  public profileImageModel: any = undefined;
  public photoIdentityFlag: boolean = false;
  public photoIdentityModel: any = undefined;
  public businessIdentityFlag: boolean = false;
  public businessIdentityModel: any = undefined;
  public profileImgExt: String[] = ['png', 'gif', 'jpeg', 'jpg', 'PNG', 'GIF', 'JPEG', 'JPG'];
  public docProofExt: String[] = ['png', 'gif', 'jpeg', 'jpg', 'pdf', 'PNG', 'GIF', 'JPEG', 'JPG', 'PDF'];
  public fileUploadItems: Array<{ type: string, file: File }> = new Array<{ type: string, file: File }>();
  public isImgselectedProfile: boolean = false;
  public isImgselectedPhotoIdent: boolean = false;
  public isImgselectedBusiness: boolean = false;
  public showUploadProfile = true;
  public showUploadIdent = true;
  public showUploadBusiness = true;
  public imagePreviewbusiness: any;
  public imagePreviewprofile: any;
  public imagePreviewphoto: any;
  public iseditledger: boolean = false;
  public fileStore: AzureFileStore[] = [];
  public cloneFileStore: AzureFileStore[] = [];
  public isShowDocument: boolean = false;
  public imgSrcDisplay!: string;
  public FileStoreTypes = FileStoreTypes;
  public profileAzureFileStore: AzureFileStore = new AzureFileStore();
  public photoIdentityAzureFileStore: AzureFileStore = new AzureFileStore();
  public businessIndentityAzureFileStore: AzureFileStore = new AzureFileStore();
  public accountSalesLedgerId: string = "";
  public accountPurchaseLedgerId: string = "";
  public preferredCountries: CountryISO[] = [CountryISO.Belgium, CountryISO.Thailand, CountryISO.UnitedArabEmirates, CountryISO.UnitedStates];
  public separateDialCode = true;
  public SearchCountryField = SearchCountryField;
  public CountryISO = CountryISO;
  public PhoneNumberFormat = PhoneNumberFormat;
  public primaryMobileNo!: any;
  public IntlTelType = IntlTelType;
  public primaryMobileValidation: boolean = false;
  public ledgerSearch: string = "";
  public listLedgerItems: Array<{ text: string; value: string }> = [];
  public listCurrencyType: Array<{ text: string; value: string }> = [];
  public businessIndentityFileFound: boolean = false;
  public photoIdentityFileFound: boolean = false;
  public profileImageFileFound: boolean = false;
  public isLedgerAttachmentFromFO: boolean = false;
  public mediaType: any;

  constructor(
    public utilityService: UtilityService,
    public alertDialogService: AlertdialogService,
    public commonService: CommonService,
    private spinnerService: NgxSpinnerService,
    private accountingconfigService: AccountingconfigService,
    private ledgerService: LedgerService,
    private fileStoreService: FileStoreService,
    private sanitizer: DomSanitizer,
    private commuteService: CommuteService,
  ) { }

  async ngOnInit() {
    await this.defaulMethodLoad();
  }

  public async defaulMethodLoad() {
    Object.values(listCurrencyType).forEach(z => { this.listCurrencyType.push({ text: z.toString(), value: z.toString() }); });
    await this.getCountryData();
    await this.getAccoutingConfigDetails();
    if (this.ledgerObj.id)
      this.setLeadgerObjMethod();

    if (this.ledgerIdent) {
      let commuteItem: CommuteItem = new CommuteItem();

      if (this.ledgerType && this.ledgerType == 'Party') {
        commuteItem.customerId = this.ledgerIdent;
        let foCustomerData: Customer = await this.commuteService.getPartyDetailFO(commuteItem);
        if (foCustomerData != null)
          await this.setPartyLedgerObj(foCustomerData);
      }

      if (this.ledgerType && this.ledgerType == 'Broker') {
        commuteItem.brokerId = this.ledgerIdent;
        let foBrokerData: Broker = await this.commuteService.getBrokerDetailFO(commuteItem);
        if (foBrokerData != null)
          this.setBrokerLedgerObj(foBrokerData);
      }

      this.ledgerGroupId = this.ledgerObj.group;
      this.showBrokerSection = this.ledgerObj.group.name?.toLowerCase() == 'broker' ? true : false

      if (this.ledgerObj.group.name?.toLowerCase() == 'bank')
        this.isBankRequired = true;
      else
        this.isBankRequired = false;

      if (this.ledgerObj.mobileNo)
        this.primaryMobileNo = this.ledgerObj.mobileNo;

      if (this.ledgerObj.address.country) {
        let valueCountryExist = this.countryItems.filter((s: any) => {
          return s.name === this.ledgerObj.address.country
        })
        if (valueCountryExist !== undefined && valueCountryExist !== null && valueCountryExist.length > 0) {
          this.selectedCountry = this.countryItems.find(c => c.name == this.ledgerObj.address.country);
          await this.getStatesByCountryCode(valueCountryExist[0].iso2);
          setTimeout(async () => {
            let valueStateExist = this.stateItems.filter((s: any) => {
              return s.name?.toLowerCase() === this.ledgerObj.address.state?.toLowerCase()
            });
            if (valueStateExist !== undefined && valueStateExist !== null && valueStateExist.length > 0)
              await this.getCityData(valueCountryExist[0], valueStateExist[0].state_Code);
          }, 200);
        }
      }
    }
  }

  private async getAccoutingConfigDetails() {
    try {
      await this.accountingconfigService.getAccoutConfig().then(async (accResult) => {

        this.accountPurchaseLedgerId = accResult.purchaseLedger.id;
        this.accountSalesLedgerId = accResult.salesLedger.id;

        this.listLedgerGroupItems = [];
        let listLedgerGroups: LedgerGroup[] = accResult.ledgerGroups;

        if (listLedgerGroups.length > 0) {
          listLedgerGroups.forEach((item) => {
            if (item.name)
              this.listLedgerGroupItems.push(item)
          })

          if (this.listLedgerGroupItems.length > 0)
            this.listLedgerGroupItems.sort((a, b) => a.name.localeCompare(b.name));;
        }
      }).catch((error) => {
        this.alertDialogService.show(error.error);
      });
    }
    catch (error: any) {
      this.alertDialogService.show(error.error)
    }
  }

  public async setLeadgerObjMethod() {
    this.cloneLedgerObj = JSON.parse(JSON.stringify(this.ledgerObj));

    let valueCountryExist = this.countryItems.filter((s: any) => {
      return s.name === this.ledgerObj.address.country
    })
    if (valueCountryExist !== undefined && valueCountryExist !== null && valueCountryExist.length > 0) {
      this.selectedCountry = this.countryItems.find(c => c.name == this.ledgerObj.address.country);
      await this.getStatesByCountryCode(valueCountryExist[0].iso2);
      setTimeout(async () => {
        let valueStateExist = this.stateItems.filter((s: any) => {
          return s.name?.toLowerCase() === this.ledgerObj.address.state?.toLowerCase()
        });
        if (valueStateExist !== undefined && valueStateExist !== null && valueStateExist.length > 0) {
          await this.getCityData(valueCountryExist[0], valueStateExist[0].state_Code)
        }
      }, 200);
    }

    this.ledgerGroupId = this.ledgerObj.group;
    this.showBrokerSection = this.ledgerObj.group.name?.toLowerCase() == 'broker' ? true : false;

    if (this.ledgerObj.group.name?.toLowerCase() == 'bank')
      this.isBankRequired = true;
    else
      this.isBankRequired = false;

    this.iseditledger = true

    let imageList: AzureFileStore[] = await this.fileStoreService.getAzureFileByIdent(this.ledgerObj.id);
    this.cloneFileStore = [];

    if (imageList && imageList.length > 0) {
      for (let index = 0; index < imageList.length; index++) {
        const element = imageList[index];
        this.cloneFileStore.push({ ...element });
        element.fileThumbnail = this.loadImage(element.fileThumbnail) || null as any;
      }
      this.fileStore = [];
      this.fileStore = imageList;
    }
    else
      this.fileStore = [];

    this.setCustomerImages();
    this.primaryMobileNo = this.ledgerObj.mobileNo ?? "";
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
      if (this.selectedCountry != null)
        await this.getStatesByCountryCode(this.selectedCountry.iso2);

      this.ledgerObj.address.state = null as any;
      this.ledgerObj.address.city = null as any;
      this.spinnerService.hide();
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Country not select, Try again later!');
    }
  }

  private async getStatesByCountryCode(country_code: string) {
    try {
      this.stateItems = await this.commonService.getStatesByCountryCode(country_code)
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('State not select, Try again later!');
    }
  }

  public async onStateChange(e: string) {
    try {
      this.spinnerService.show();
      this.selectedState = this.stateItems.find((c: State) => c.name == e);
      if (this.selectedState != null)
        await this.getCityData(this.selectedCountry, this.selectedState.state_Code)

      this.ledgerObj.address.city = null as any;
      this.spinnerService.hide();
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('State not select, Try again later!');
    }
  }

  public async getCityData(selectedCountry: Country, state_code: string) {
    try {
      this.cityItems = await this.commonService.getCitiesByCountryCodeandStateCode(selectedCountry.iso2, state_code)
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('City not select, Try again later!');
    }
  }

  public onCityChange(e: string): void {
    try {
      this.selectedCity = this.cityItems.find((c: City) => c.name == e);
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('City not select, Try again later!');
    }
  }

  public closeLedgerDialog(): void {
    this.toggle.emit(false);
  }

  public openSection(value: any): void {
    try {
      if (value) {
        this.ledgerObj.group = value;

        this.showBrokerSection = value.name?.toLowerCase() == 'broker' ? true : false

        if (this.ledgerObj.group.name?.toLowerCase() == 'bank')
          this.isBankRequired = true;
        else
          this.isBankRequired = false;

        if (this.ledgerObj.group.name?.toLowerCase() == 'customer') {
          if (this.businessIdentityModel == null || this.businessIdentityModel == undefined || this.businessIdentityModel == '')
            this.businessIdentityFlag = true;
          this.isBankRequired = false;
        }
        else {
          this.businessIdentityFlag = false;
          this.isBankRequired = false;
        }

      }
      else {
        this.ledgerObj.group = new LedgerGroup();
        this.showBrokerSection = false;
        this.ledgerGroupId = null as any;
      }

    }
    catch (error: any) {
      console.error(error);
      this.alertDialogService.show('Ledger not select, Try again later!');
    }

  }

  public async onLedgerSubmit(form: NgForm, action: boolean) {
    try {
      if (form.valid) {
        this.spinnerService.show();

        let messageType: string = "";
        let response: any;

        if (this.businessIdentityModel == null || this.businessIdentityModel == undefined || this.businessIdentityModel == '')
          this.businessIdentityFlag = true;

        if (this.businessIdentityFlag == true && this.ledgerObj.group.name?.toLowerCase() == 'customer') {
          this.alertDialogService.show("Business Proof Compulsory When Ledger Group Is Customer!");
          this.spinnerService.hide();
          return
        }

        if (this.ledgerObj.group.isBankLedger && this.ledgerObj.group.name?.toLowerCase()?.includes('bank') && ((this.ledgerObj.bank.ifsc == undefined || this.ledgerObj.bank.ifsc == null || this.ledgerObj.bank.ifsc?.length == 0) && ((this.ledgerObj.bank.iBan == null || this.ledgerObj.bank.iBan == null || this.ledgerObj.bank.iBan?.length == 0)))) {
          this.alertDialogService.show("Either IFSC or IBan is Compulsory on Bank Ledger!");
          this.spinnerService.hide();
          return
        }

        if (this.ledgerIdent)
          this.ledgerObj.idents.push(this.ledgerIdent);

        if (!this.showBrokerSection)
          this.ledgerObj.broker = new BrokerDNorm();

        if (!this.ledgerObj.group.isBankLedger)
          this.ledgerObj.bank = new BankDNorm();

        if (this.primaryMobileNo && this.primaryMobileNo.e164Number)
          this.ledgerObj.mobileNo = this.primaryMobileNo.e164Number;

        if (this.ledgerObj.id) {
          messageType = "updated";
          let selectdLedger = JSON.parse(JSON.stringify(this.ledgerObj));
          response = await this.ledgerService.ledgerUpdate(this.ledgerObj);

          if (this.fileUploadItems.length) {
            for (let index = 0; index < this.fileUploadItems.length; index++) {
              const element = this.fileUploadItems[index];
              await this.uploadFilesOnServer(element.file, element.type);
            }
            this.fileUploadItems = [];
          }

          this.successEvent.emit({ flag: true, type: messageType, ledger: this.ledgerObj });
          if (selectdLedger.id == this.accountPurchaseLedgerId) {
            await this.updateAccountConfig(this.ledgerObj, this.transactionType.Purchase).then((pResult) => {
              response = pResult;
            });
          }
          if (selectdLedger.id == this.accountSalesLedgerId) {
            await this.updateAccountConfig(this.ledgerObj, this.transactionType.Sales).then((sResult) => {
              response = sResult;
            });
          }

          this.spinnerService.hide();
          this.closeLedgerDialog();
          this.resetForm(form);
          this.showBrokerSection = false;
        }
        else {
          var searchCriteria = new LedgerSearchCriteria();
          searchCriteria.email = this.ledgerObj.email;
          searchCriteria.name = this.ledgerObj.name;
          searchCriteria.group = this.ledgerObj.group.name;
          response = await this.ledgerService.checkLedgerExist(searchCriteria);
          if (!response) {

            messageType = "registered";
            response = await this.ledgerService.ledgerRequest(this.ledgerObj);
            if (response) {
              this.ledgerObj.id = response

              for (let index = 0; index < this.fileUploadItems.length; index++) {
                const element = this.fileUploadItems[index];
                await this.uploadFilesOnServer(element.file, element.type);
              }
              this.fileUploadItems = [];

              this.ledgerObj = await this.ledgerService.getLedgerById(this.ledgerObj.id);
              this.successEvent.emit({ flag: true, type: messageType, ledger: this.ledgerObj });

              this.spinnerService.hide();
              if (action)
                this.closeLedgerDialog()

              this.resetForm(form);
              this.showBrokerSection = false;
            }
            else {
              this.alertDialogService.show(response.message);
              if (response?.errorMessage?.length > 0)
                console.error(response.errorMessage);
              this.spinnerService.hide();
            }

          }
          else {
            messageType = "Found duplicate ledger."
            response.message = "Duplicate ledger."

            this.alertDialogService.show(response.message);
            if (response?.errorMessage?.length > 0)
              console.error(response.errorMessage);
            this.spinnerService.hide();
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

  public async updateAccountConfig(ledgerObj: Ledger, accountType: string): Promise<boolean> {
    var updateResult: boolean = false;
    let ledgerDnorm: LedgerDNorm = new LedgerDNorm();
    ledgerDnorm.id = this.cloneLedgerObj.id
    ledgerDnorm.idents = this.cloneLedgerObj.idents;
    ledgerDnorm.name = ledgerObj?.name;
    ledgerDnorm.group = ledgerObj?.group?.name ? ledgerObj?.group?.name : "";
    ledgerDnorm.contactPerson = ledgerObj?.contactPerson ? ledgerObj?.contactPerson : "";
    ledgerDnorm.email = ledgerObj?.email ? ledgerObj?.email : "";
    ledgerDnorm.mobileNo = ledgerObj?.mobileNo ? ledgerObj?.mobileNo : "";
    ledgerDnorm.phoneNo = ledgerObj?.phoneNo ? ledgerObj?.phoneNo : "";
    ledgerDnorm.faxNo = ledgerObj?.faxNo ? ledgerObj?.faxNo : "";
    let address = new Address();
    address.id = ledgerObj?.address.id ? ledgerObj?.address.id : "";
    address.type = ledgerObj?.address.type ? ledgerObj?.address.type : "";;
    address.line1 = ledgerObj?.address.line1 ? ledgerObj?.address.line1 : "";
    address.line2 = ledgerObj?.address.line2 ? ledgerObj?.address.line2 : "";
    address.city = ledgerObj?.address.city ? ledgerObj?.address.city : "";
    address.state = ledgerObj?.address.state ? ledgerObj?.address.state : "";;
    address.country = ledgerObj?.address.country ? ledgerObj?.address.country : "";
    address.zipCode = ledgerObj?.address.zipCode ? ledgerObj?.address.zipCode : "";
    ledgerDnorm.address = address;
    if (accountType == this.transactionType.Sales)
      updateResult = await this.accountingconfigService.updateSalesLedgerAsync(ledgerDnorm);
    else
      updateResult = await this.accountingconfigService.updatePurchaseLedger(ledgerDnorm);
    return updateResult;
  }

  public resetForm(form: NgForm) {
    this.ledgerObj = new Ledger();
    form.reset();
    this.ledgerObj.mobileNo = '';
    this.ledgerObj.faxNo = '';
    this.ledgerObj.phoneNo = '';
  }

  public uploadFiles(form: NgForm, event: Event, type: string): void {
    let file!: any;
    const target = event.target as HTMLInputElement;

    if (target.files && target.files.length) {
      file = target.files[0];
    }
    this.currentFile = file;

    if (this.currentFile) {
      if (type == FileStoreTypes.CustomerProfile) {
        if (this.profileImgExt.includes(file.name?.split(".")?.pop()?.toLowerCase()))
          this.fileChecknPush(type);
        else
          this.alertDialogService.show(`Please select valid file.`);
      }

      if (type == FileStoreTypes.CustomerPhotoIdent) {
        if (this.docProofExt.includes(file.name?.split(".")?.pop()?.toLowerCase()))
          this.fileChecknPush(type);
        else
          this.alertDialogService.show(`Please select valid file.`);
      }

      if (type == FileStoreTypes.CustomerBussinessIdent) {
        if (this.docProofExt.includes(file.name?.split(".")?.pop()?.toLowerCase()))
          this.fileChecknPush(type);
        else
          this.alertDialogService.show(`Please select valid file.`);
      }
    }

    this.setCustomerImages();
  }

  private fileChecknPush(type: string) {
    if (this.fileUploadItems && this.fileUploadItems.length > 0) {
      let IsExistFile: any = this.fileUploadItems.find((item: any) => item.type?.toLowerCase() == type?.toLowerCase());
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

  public uploadFilesOnServer(file: File, type: string) {
    this.fileStoreService.postUploadFileDocument(file, type, this.ledgerObj.id, this.ledgerObj?.email).subscribe(
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

  public clearPhotoProfile(form: NgForm) {
    this.ProfileFileupload.nativeElement.value = "";
    this.profileImageModel = undefined;
    this.profileImageFlag = false;
  }

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

  public async openDocumentDialog(type: string) {
    this.mediaType = type;
    let image: AzureFileStore = this.fileStore.find(z => z.identType?.toLowerCase() == type?.toLowerCase()) as AzureFileStore;
    if (image && !this.isLedgerAttachmentFromFO) {
      if (image.blobName.split('.')[1]?.toLowerCase() == "pdf") {
        let imgSrcDisplay = await this.fileStoreService.downloadBlobFile(image.id)
        let blob = new Blob([imgSrcDisplay], { type: 'application/pdf' })
        this.imgSrcDisplay = URL.createObjectURL(blob);
        // await this.fileStoreService.downloadFile(image.id);
        this.isShowDocument = true;
      }
      else {
        await this.getImagePath(type)
        this.isShowDocument = true;
      }
    }
    else if (image && this.isLedgerAttachmentFromFO)
      await this.fileStoreService.downloadFileFo(image.id);
  }

  public async openLocalBusinessProofFile() {
    let file = this.fileUploadItems.find(z => z.type == FileStoreTypes.CustomerBussinessIdent);
    if (file?.file) {
      const url = window.URL.createObjectURL(file.file);
      window.open(url);
    }
  }

  public async deleteBusinessIndentityProof(type: string) {
    let image: AzureFileStore = this.fileStore.find(z => z.identType?.toLowerCase() == type?.toLowerCase()) as AzureFileStore;

    this.alertDialogService.ConfirmYesNo("Are you sure you want to delete?", "Delete")
      .subscribe(async (res: any) => {
        if (res.flag) {

          let flag = await this.fileStoreService.deletefilestore(image.id ? image.id : "");
          if (flag)
            this.utilityService.showNotification(`file deleted successfully!`);
          else
            this.alertDialogService.show(`Something went wrong. Please try again!`, 'error');

          if (flag) {
            if (type == "CustomerProfile") {
              this.profileImageFlag = false;
              this.showUploadProfile = true;
              this.profileImageModel = undefined;
            }
            else if (type == "CustomerPhotoIdent") {
              this.photoIdentityFlag = false;
              this.showUploadIdent = true;
              this.photoIdentityModel = undefined;
            }
            else if (type == "CustomerBussinessIdent") {
              this.businessIdentityFlag = false;
              this.showUploadBusiness = true;
              this.businessIdentityModel = undefined;
            }
          }
        }
      });
  }

  public removeLocalBusinessProof() {
    this.businessIdentityModel = null;
    this.businessIndentityAzureFileStore = new AzureFileStore();
  }

  public async getImagePath(type: string) {
    let image: AzureFileStore = this.fileStore.find(z => z.identType?.toLowerCase() == type?.toLowerCase()) as AzureFileStore;
    if (image) {
      let imgSrcDisplay = await this.fileStoreService.downloadBlobFile(image.id)
      this.imgSrcDisplay = await this.utilityService.blobToBase64WithMIME(imgSrcDisplay) as string;
      let blob = new Blob([imgSrcDisplay], { type: 'image/jpg' });
      this.imgSrcDisplay = URL.createObjectURL(blob);
    }
    else
      this.imgSrcDisplay = "assets/images/image-not-found.jpg";
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
      this.showUploadProfile = false;
      this.profileImageFileFound = true;
      this.profileImageModel = profileFileStore;
    }
    this.profileAzureFileStore = profileFileStore;

    let photoIdentityFileStore = this.fileStore.find(z => z.identType == FileStoreTypes.CustomerPhotoIdent);
    if (photoIdentityFileStore == null) {
      photoIdentityFileStore = new AzureFileStore();
      this.photoIdentityFlag = false;
      this.showUploadIdent = true
      this.photoIdentityFileFound = false;
    }
    else {
      this.showUploadIdent = false
      this.photoIdentityFileFound = true;
      this.photoIdentityModel = photoIdentityFileStore;
    }
    this.photoIdentityAzureFileStore = photoIdentityFileStore;

    let businessIndentityFileStore = this.fileStore.find(z => z.identType == FileStoreTypes.CustomerBussinessIdent);
    if (businessIndentityFileStore == null) {
      businessIndentityFileStore = new AzureFileStore();
      this.businessIdentityFlag = false;
      this.showUploadBusiness = true
      this.businessIndentityFileFound = false;
    }
    else {
      this.showUploadBusiness = false
      this.businessIndentityFileFound = true;
      this.businessIdentityModel = businessIndentityFileStore;
    }
    this.businessIndentityAzureFileStore = businessIndentityFileStore;
  }

  private loadImage(imageSrc: string) {
    if (imageSrc != undefined && imageSrc != null && imageSrc != "")
      return 'data:image/JPEG;base64,' + imageSrc;
    else
      return null
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
  }

  public async handleLedgerFilter(value: any) {
    this.listLedgerItems = [];
    let types: string[] = ['Customer'];
    if (this.ledgerObj?.group?.name && this.showBrokerSection) {
      types = [];
      types.push(this.ledgerObj.group.name);
    }
    let ledgers = await this.ledgerService.getAllLedgersByType(types, value);
    if (ledgers.length > 0) {
      ledgers.forEach(z => { this.listLedgerItems.push({ text: z.name, value: z.id }); });
    }
  }

  public async onLedgerChange(e: any) {
    if (e) {
      let fetchLedger = await this.ledgerService.getLedgerById(e);
      if (fetchLedger) {
        setTimeout(() => {
          this.ledgerSearch = fetchLedger?.name ?? '';
        }, 0);
        this.ledgerObj = fetchLedger ?? new Ledger();
        this.setLeadgerObjMethod();
      }
    }
    else {
      this.ledgerObj = new Ledger();
      this.fileStore = [];
      this.businessIdentityModel = null as any;
      this.primaryMobileNo = null as any;
      this.setCustomerImages();
    }
  }

  public async setPartyLedgerObj(obj: Customer) {
    try {
      this.spinnerService.show();
      this.ledgerObj = new Ledger();
      this.ledgerObj.name = obj.companyName;
      this.ledgerObj.email = obj.email;
      this.ledgerObj.mobileNo = obj.mobile1;
      this.ledgerObj.contactPerson = obj.fullName;
      this.ledgerObj.code = obj.code;
      this.ledgerObj.phoneNo = obj.mobile2;
      this.ledgerObj.lineOfBusiness = (this.listBusinessTypeItems.findIndex(x => x?.toLowerCase() == obj.businessType) >= 0 ? obj.businessType : "BLANK") ?? "BLANK";
      this.ledgerObj.address = obj.address;
      this.ledgerObj.faxNo = obj.faxNo;
      this.ledgerObj.limit = obj.creditLimit;
      this.ledgerObj.incomeTaxNo = obj.incomeTaxNo;
      this.ledgerObj.group = this.listLedgerGroupItems.find(x => x.name?.toLowerCase() == obj.origin?.toLowerCase()) ?? new LedgerGroup();
      this.ledgerObj.isActive = obj.isActive;

      this.cloneFileStore = [];
      let imageList: AzureFileStore[] = await this.commuteService.getAzureFileByIdentFO(obj.id);
      if (imageList && imageList.length > 0) {
        for (let index = 0; index < imageList.length; index++) {
          const element = imageList[index];
          this.cloneFileStore.push({ ...element });
          element.fileThumbnail = this.loadImage(element.fileThumbnail) || null as any;
          let blobImg = await this.commuteService.downloadBlobFileFO(element.id);
          if (blobImg) {
            let mimeType = this.utilityService.getMimeTypeFromFileName(element.blobName)
            var file = new File([blobImg], element.blobName, { type: mimeType, lastModified: new Date().getTime() });
            this.uploadFilesFromFo(file, element.identType);
          }
        }
        this.fileStore = [];
        this.fileStore = imageList;
        this.setCustomerImages();
        this.spinnerService.hide();
        this.isLedgerAttachmentFromFO = true;
      }
      else {
        this.fileStore = [];
        this.setCustomerImages();
        this.spinnerService.hide();
      }
    } catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Somthing went wrong when get data from Front Office, Try again later!');
    }
  }

  public uploadFilesFromFo(file: any, type: string): void {
    this.currentFile = file;

    if (this.currentFile) {
      if (type == FileStoreTypes.CustomerProfile) {
        if (this.profileImgExt.includes(file.name?.split(".")?.pop()?.toLowerCase()))
          this.fileChecknPush(type);
      }

      if (type == FileStoreTypes.CustomerPhotoIdent) {
        if (this.docProofExt.includes(file.name?.split(".")?.pop()?.toLowerCase()))
          this.fileChecknPush(type);
      }

      if (type == FileStoreTypes.CustomerBussinessIdent) {
        if (this.docProofExt.includes(file.name?.split(".")?.pop()?.toLowerCase()))
          this.fileChecknPush(type);
      }

    }
  }

  public setBrokerLedgerObj(obj: Broker) {
    this.ledgerObj = new Ledger();
    this.ledgerObj.name = obj.name;
    this.ledgerObj.email = obj.email;
    this.ledgerObj.mobileNo = obj.mobileNo;
    this.ledgerObj.contactPerson = obj.name;
    this.ledgerObj.code = obj.code;
    this.ledgerObj.lineOfBusiness = "BLANK";
    this.ledgerObj.address = obj.address;
    this.ledgerObj.incomeTaxNo = obj.incomeTaxNo;
    this.ledgerObj.group = this.listLedgerGroupItems.find(x => x.name?.toLowerCase() == 'broker') ?? new LedgerGroup();
    this.ledgerObj.isActive = obj.isActive;
    this.ledgerObj.broker.brokrage = obj.brokrage;
    this.ledgerObj.broker.refCompanyName = obj.refCompanyName;
    this.ledgerObj.broker.refPersonName = obj.refPersonName;
    this.ledgerObj.broker.refemail = obj.refemail;
    this.ledgerObj.broker.refmobileNo = obj.refmobileNo;
    this.ledgerObj.broker.refAddress = obj.refAddress;

  }

}

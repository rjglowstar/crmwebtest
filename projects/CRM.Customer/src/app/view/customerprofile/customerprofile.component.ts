import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NgForm } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { environment } from 'environments/environment';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { AzureFileStore, ExportColumn, ExportConfig, ExportInfo, MasterConfig, MasterDNorm } from 'shared/enitites';
import { FileStoreService, FileStoreTypes, listBasicExportColumns, listExportFormat, listIncusionExportColumns, listMeasurementExportColumns, listOthersExportColumns, UtilityService } from 'shared/services';
import { CountryISO, PhoneNumberFormat, SearchCountryField } from 'ngx-intl-tel-input-gg';
import { AlertdialogService } from 'shared/views';
import { InvDetailData, ParseSearchQuery, WatchListResponse, WatchListSearchCriteria } from '../../businessobjects';
import { ChangePasswordModel, Customer, CustomerCriteria, CustomerPreference, User } from '../../entities';
import { AppPreloadService, CustomerPreferenceService, CustomerService, ManageService, WatchlistService } from '../../services';
import parsePhoneNumberFromString, { isValidNumber } from 'libphonenumber-js';
import { Country } from 'shared/businessobjects';

@Component({
  selector: 'app-customerprofile',
  templateUrl: './customerprofile.component.html',
  styleUrls: ['./customerprofile.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class CustomerprofileComponent implements OnInit {

  public customerObj: Customer = new Customer();
  public isAddCustomerCriteria: boolean = false;
  public isShowDocument: boolean = false;
  public imgSrcDisplay!: string
  public masterConfigList!: MasterConfig;
  public customerCriteriaData: CustomerCriteria[] = [];
  public selectedCustomerCriteria: CustomerCriteria[] = [];
  public customerCriteriaObj: CustomerCriteria = new CustomerCriteria();
  public insertFlag: boolean = true;
  public FileStoreTypes = FileStoreTypes;
  public fileStore: AzureFileStore[] = [];
  public profileFileStore: AzureFileStore = new AzureFileStore();
  public photoIdentityFileStore: AzureFileStore = new AzureFileStore();
  public businessIndentityFileStore: AzureFileStore = new AzureFileStore();
  public listWatchListInventory: InvDetailData[] = [];
  public listWatchListResponse: WatchListResponse[] = [];
  public customerPreference: CustomerPreference = new CustomerPreference();
  public preferredStoneData: ParseSearchQuery[] = [];
  public saveSearchData: ParseSearchQuery[] = [];
  public exportInfoObj: ExportInfo = new ExportInfo();
  public exportConfigObj: ExportConfig = new ExportConfig();
  public exportColumnObj: ExportColumn = new ExportColumn();
  public editExportConfigIndex: number | null = null;
  public listExportFormat = listExportFormat;
  public listBasicExportColumns = listBasicExportColumns;
  public listIncusionExportColumns = listIncusionExportColumns;
  public listMeasurementExportColumns = listMeasurementExportColumns;
  public listOthersExportColumns = listOthersExportColumns;
  public columnModalTitle = 'Edit';
  public searchColumn = '';
  public isEditColumn: boolean = false;
  public isEditExportColumn: boolean = false;
  public isWishlist: boolean = false;
  public isColumnTemplate: boolean = false;
  public currentUser!: User[];
  public changePasswordModel: ChangePasswordModel = new ChangePasswordModel();
  public passwordPattern = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$!%*?&])([a-zA-Z0-9@#$!%*?&]{8,})$";
  public businessIndentityFileFound: boolean = false;
  public photoIdentityFileFound: boolean = false;
  public separateDialCode = true;
  public SearchCountryField = SearchCountryField;
  public CountryISO = CountryISO;
  public PhoneNumberFormat = PhoneNumberFormat;
  public preferredCountries: CountryISO[] = [CountryISO.Belgium, CountryISO.Thailand, CountryISO.UnitedArabEmirates, CountryISO.UnitedStates];
  public primaryMobileNo!: any;
  public secondaryMobileNo!: any;
  public businessMobile!: any;
  public fileUploadItems: Array<{ type: string, file: File }> = new Array<{ type: string, file: File }>();
  public imagePreviewprofile: any;
  public countryItems!: Country[];

  constructor(
    private customerService: CustomerService,
    private router: Router,
    private alertDialogService: AlertdialogService,
    public utilityService: UtilityService,
    private spinnerService: NgxSpinnerService,
    private fileStoreService: FileStoreService,
    private watchListService: WatchlistService,
    private customerPreferenceService: CustomerPreferenceService,
    private sanitizer: DomSanitizer,
    private appPreloadService: AppPreloadService,
    private manageService: ManageService,
  ) { }

  public async ngOnInit() {
    await this.defaultMethodsLoad();
  }

  //#region Initialize Data
  async defaultMethodsLoad() {
    this.spinnerService.show();
    let credential = await this.appPreloadService.fetchFxCredentials("");
    if (credential.id) {
      await this.getCountryData();
      await this.getCustomerFiles(credential?.id);
      await this.getCustomerData(credential?.id);
    }
  }

  public async getCustomerData(id: string) {
    try {
      this.customerObj = await this.customerService.getCustomerById(id);
      this.primaryMobileNo = parsePhoneNumberFromString(this.customerObj.mobile1 ?? '' as string)?.nationalNumber as any;
      this.secondaryMobileNo = parsePhoneNumberFromString(this.customerObj.mobile2 ?? '' as string)?.nationalNumber as any;
      this.businessMobile = parsePhoneNumberFromString(this.customerObj.businessMobileNo ?? '' as string)?.nationalNumber as any;
      if (this.customerObj == null)
        this.router.navigate(['/dashboard']);
      else {
        await this.getWatchListData();
        await this.getUserData();
      }
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async getCustomerFiles(id: string) {
    try {
      let imageList: AzureFileStore[] = await this.fileStoreService.getAzureFileByIdent(id);
      if (imageList && imageList.length > 0) {
        for (let index = 0; index < imageList.length; index++) {
          const element = imageList[index];
          element.fileThumbnail = this.loadImage(element.fileThumbnail) || null as any;
        }
        this.fileStore = [];
        this.fileStore = imageList;
      }
      this.setCustomerImages();
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show("Somehting went wrong, Try again later.");
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

  private async getCountryData() {
    try {
      this.countryItems = await this.customerService.getCustomerByCountry();
    }
    catch (error: any) {
      this.alertDialogService.show(error.error);
    }
  }

  private loadImage(imageSrc: string) {
    if (imageSrc != undefined && imageSrc != null && imageSrc != "")
      return 'data:image/JPEG;base64,' + imageSrc;
    else
      return null
  }
  //#endregion

  //#region WatchList
  public async getWatchListData() {
    try {
      this.spinnerService.show();
      let watchListSearchCriteria: WatchListSearchCriteria = new WatchListSearchCriteria();
      watchListSearchCriteria.customerId = this.customerObj.id;
      this.listWatchListResponse = await this.watchListService.getAllWatchLists(watchListSearchCriteria);
      if (this.listWatchListResponse && this.listWatchListResponse.length > 0) {
        this.isWishlist = true;
        this.listWatchListInventory = this.listWatchListResponse.map(c => c.inventoryDetail);
        this.spinnerService.hide();
      }
      else
        this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async removeWishlist(watchId: string) {
    this.alertDialogService.ConfirmYesNo("Are you sure you want to remove stone from watchlist?", "Delete")
      .subscribe(async (res: any) => {
        if (res.flag) {
          try {
            this.spinnerService.show();
            let selectedWatch: string[] = new Array<string>();
            selectedWatch = [watchId];
            var invItems = await this.watchListService.removeFromWatchList(selectedWatch);
            if (invItems) {
              this.utilityService.showNotification('Stone remove successfully!');
              await this.getWatchListData();
              this.spinnerService.hide();
            }
            else
              this.spinnerService.hide();
          }
          catch (error: any) {
            this.spinnerService.hide();
            this.alertDialogService.show(error.error);
          }
        }
      });

  }
  //#endregion

  //#region Customer Preference
  public async getCustomerPreferenceData() {
    try {
      this.spinnerService.show();
      var data = await this.customerPreferenceService.getCustomerPreferenceByCustomer(this.customerObj.id);
      if (data) {
        this.customerPreference = data;

        this.preferredStoneData = [];
        data.prefrredStones.forEach(z => {
          let obj: ParseSearchQuery = new ParseSearchQuery();
          obj.name = z.name;
          obj.query = JSON.parse(z.query);
          obj.expiryDate = z.expiryDate;
          this.preferredStoneData.push(obj);
        });

        this.saveSearchData = [];
        data.savedSearches.forEach(z => {
          let obj: ParseSearchQuery = new ParseSearchQuery();
          obj.name = z.name;
          obj.query = JSON.parse(z.query);
          obj.expiryDate = z.expiryDate;
          obj.createdAt = z.createdAt;
          this.saveSearchData.push(obj);
        });

        if (this.customerPreference.exportInfo.configs && this.customerPreference.exportInfo.configs.length > 0) {
          this.isColumnTemplate = true;
          this.exportInfoObj = JSON.parse(JSON.stringify(data.exportInfo));
          this.exportInfoObj.emailTime = this.exportInfoObj.emailTime as Date;
        }

        this.spinnerService.hide();
      }
      else {
        this.isColumnTemplate = false;
        this.spinnerService.hide();
      }
    }
    catch (error: any) {
      this.isColumnTemplate = false;
      this.spinnerService.hide();
      this.alertDialogService.show('Something went wrong, Try again later!');
    }
  }

  public async removeSaveSearch(index: number) {
    this.alertDialogService.ConfirmYesNo("Are you sure you want to remove save search?", "Delete")
      .subscribe(async (res: any) => {
        if (res.flag) {
          try {
            this.spinnerService.show();
            this.customerPreference.savedSearches.splice(index, 1);
            var result = await this.customerPreferenceService.updateCustomerPreference(this.customerPreference);
            if (result) {
              this.utilityService.showNotification('Save Search remove successfully!');
              await this.getCustomerPreferenceData();
              this.spinnerService.hide();
            }
            else
              this.spinnerService.hide();
          }
          catch (error: any) {
            console.error(error);
            this.spinnerService.hide();
            this.alertDialogService.show('Something went wrong, Try again later!');
          }
        }
      });
  }

  public async updateExportSettings() {
    this.alertDialogService.ConfirmYesNo("Are you sure you want to update FTP settings?", "Update")
      .subscribe(async (res: any) => {
        if (res.flag) {
          try {
            this.spinnerService.show();
            this.customerPreference.exportInfo = this.exportInfoObj;
            var result = await this.customerPreferenceService.updateCustomerPreference(this.customerPreference);
            if (result) {
              this.utilityService.showNotification('Save Search remove successfully!');
              await this.getCustomerPreferenceData();
              this.spinnerService.hide();
            }
            else
              this.spinnerService.hide();
          }
          catch (error: any) {
            console.error(error);
            this.spinnerService.hide();
            this.alertDialogService.show('Something went wrong, Try again later!');
          }
        }
      });
  }

  public async addUpdateExportConfig() {
    try {
      if (this.exportConfigObj.name == undefined || this.exportConfigObj.name == null || this.exportConfigObj.name?.length == 0) {
        this.utilityService.showNotification('Name is required!', 'warning');
        return;
      }
      if (this.exportConfigObj.format == undefined || this.exportConfigObj.format == null || this.exportConfigObj.format?.length == 0) {
        this.utilityService.showNotification('Format is required!', 'warning');
        return;
      }
      if (this.exportConfigObj.fields == undefined || this.exportConfigObj.fields == null || this.exportConfigObj.fields?.length == 0) {
        this.utilityService.showNotification('Please select at least one column!', 'warning');
        return;
      }


      this.spinnerService.show();

      let i = 1;
      this.exportConfigObj.fields.forEach(z => {
        z.index = i++;
      });

      if (this.editExportConfigIndex != null)
        this.customerPreference.exportInfo.configs[this.editExportConfigIndex] = this.exportConfigObj;
      else
        this.customerPreference.exportInfo.configs.push(this.exportConfigObj);

      var result = await this.customerPreferenceService.updateCustomerPreference(this.customerPreference);
      if (result) {
        this.utilityService.showNotification('Save Search remove successfully!');
        await this.getCustomerPreferenceData();
        this.closeEditColumnDialog();
        this.spinnerService.hide();
      }
      else
        this.spinnerService.hide();
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Something went wrong, Try again later!');
    }
  }

  public async removeExportConfig(index: number) {
    this.alertDialogService.ConfirmYesNo("Are you sure you want to remove export Template?", "Delete")
      .subscribe(async (res: any) => {
        if (res.flag) {
          try {
            this.spinnerService.show();
            this.customerPreference.exportInfo.configs.splice(index, 1);
            var result = await this.customerPreferenceService.updateCustomerPreference(this.customerPreference);
            if (result) {
              this.utilityService.showNotification('Export Template remove successfully!');
              await this.getCustomerPreferenceData();
              this.spinnerService.hide();
            }
            else
              this.spinnerService.hide();
          }
          catch (error: any) {
            console.error(error);
            this.spinnerService.hide();
            this.alertDialogService.show('Something went wrong, Try again later!');
          }
        }
      });
  }
  //#endregion

  //#region OnChange Function
  public searchColumns() {
    if (this.searchColumn.length == 0) {
      this.listBasicExportColumns = listBasicExportColumns;
      this.listMeasurementExportColumns = listMeasurementExportColumns;
      this.listIncusionExportColumns = listIncusionExportColumns;
      this.listOthersExportColumns = listOthersExportColumns;
    } else {
      let searchColumn = this.searchColumn.toLocaleLowerCase();
      this.listBasicExportColumns = listBasicExportColumns.filter(z => z.title.toLowerCase().includes(searchColumn));
      this.listMeasurementExportColumns = listMeasurementExportColumns.filter(z => z.title.toLowerCase().includes(searchColumn));
      this.listIncusionExportColumns = listIncusionExportColumns.filter(z => z.title.toLowerCase().includes(searchColumn));
      this.listOthersExportColumns = listOthersExportColumns.filter(z => z.title.toLowerCase().includes(searchColumn));
    }
  }

  public addExportColumn(column: ExportColumn) {
    let exists = this.exportConfigObj.fields.find(z => z.title == column.title);
    if (exists == null || column.title == 'Custom') {
      column.index = this.exportConfigObj.fields.length;
      this.exportConfigObj.fields.push(column);
      if (column.title == 'Custom')
        this.closeEditExportColumnDialog();
    }
    else
      this.utilityService.showNotification('This column already exists!', 'warning');
  }

  public removeExportField(index: number) {
    this.exportConfigObj.fields.splice(index, 1);

    let i = 1;
    this.exportConfigObj.fields.forEach(z => {
      z.index = i++;
    });
  }

  public getValidTime(date: any): Date {
    const day = moment(date).date();
    const month = moment(date).month();
    const year = moment(date).year();
    const hour = moment(date).hour();
    const minute = moment(date).minute();
    const second = moment(date).second();
    var newDate = new Date(year, month, day, hour, minute, second);
    return newDate;
  }

  public areAllFieldsAvailable(obj: any): boolean {
    let hasData = false;
    for (const key in obj) {
      if (Array.isArray(obj[key])) {
        if (obj[key].length > 0) {
          hasData = true;
          break;
        }
      } else if (typeof obj[key] === 'object' && Object.keys(obj[key]).length > 0) {
        hasData = true;
        break;
      }
    }

    return hasData;
  }

  public async onTabSelect(e: any) {
    switch (e.index) {
      case 0:
        await this.getWatchListData();
        break;
      case 1:
        await this.getCustomerPreferenceData();
        break;
      case 2:
        await this.getCustomerPreferenceData();
        break;
      case 3:
        await this.getCustomerPreferenceData();
        break;
    }
  }

  public getSanitizeImage(inv: InvDetailData): SafeResourceUrl {
    let url = inv.media.isPrimaryImage
      ? environment.imageURL.replace('{stoneId}', inv.stoneId.toLowerCase())
      : "commonAssets/images/image-not-found.jpg";

    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
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

  public navigateBackward() {
    window.history.back();
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

  public closeDocumentDialog() {
    this.isShowDocument = false;
  }

  public sanitizeURL(url: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  public openAddCustomerCriteria(form?: NgForm): void {
    this.isAddCustomerCriteria = true;
  }

  public closeAddCustomerCriteria(): void {
    this.isAddCustomerCriteria = false;
  }

  public tagMapper(tags: any[]): void {
    // This function is used for hide selected items in multiselect box
  }

  public getCommaSapratedString(vals: any[], isAll: boolean = false): string {
    let name = vals.join(',')
    if (!isAll)
      if (name.length > 22)
        name = name.substring(0, 22) + '...';

    return name;
  }

  public onMultiSelectChange(val: Array<{ name: string; isChecked: boolean }>, selectedData: string[]): void {
    val.forEach(element => {
      element.isChecked = false;
    });

    if (selectedData && selectedData.length > 0) {
      val.forEach(element => {
        selectedData.forEach(item => {
          if (element.name.toLocaleLowerCase() == item.toLocaleLowerCase())
            element.isChecked = true;
        });
      });
    }
  }

  public checkMinMaxValidation(min: any, max: any): string {
    if (min && max) {
      if (parseFloat(min) > parseFloat(max))
        return "min value must greater than max value!";
    }
    else if (min && !max)
      return "max value required!";
    else if (min && !max)
      return "min value required!";

    return '';
  }

  public handleFilter(e: any): string {
    return e;
  }

  public onOpenDropdown(list: Array<{ name: string; isChecked: boolean }>, e: boolean, selectedData: string[]): boolean {
    if (selectedData?.length == list.map(z => z.name).length)
      e = true;
    else
      e = false;
    return e;
  }

  public filterDropdownSearch(allData: MasterDNorm[], e: any, selectedData: string[]): Array<{ name: string; isChecked: boolean }> {
    let filterData: any[] = [];
    allData.forEach(z => { filterData.push({ name: z.name, isChecked: false }); });
    filterData.forEach(z => {
      if (selectedData?.includes(z.name))
        z.isChecked = true;
    });
    if (e?.length > 0)
      return filterData.filter(z => z.name?.toLowerCase().includes(e?.toLowerCase()));
    else
      return filterData;
  }

  public checkAllListItems(list: Array<{ name: string; isChecked: boolean }>, e: boolean, selectedData: string[]): string[] {
    if (e) {
      selectedData = [];
      selectedData = list.map(z => z.name);
      list.forEach(element => {
        element.isChecked = true;
      });
    }
    else {
      selectedData = [];
      list.forEach(element => {
        element.isChecked = false;
      });
    }
    return selectedData;
  }

  public clearColumnTemplateData() {
    this.exportConfigObj = new ExportConfig();
  }

  public clearColumnObjData() {
    this.exportColumnObj = new ExportColumn();
    this.exportColumnObj.title = 'Custom';
  }

  public openAddColumnDialog(): void {
    this.isEditColumn = true;
    this.columnModalTitle = 'Add';
    this.editExportConfigIndex = null;
    this.clearColumnTemplateData();
  }

  public openEditColumnDialog(index: number, obj: ExportConfig): void {
    this.columnModalTitle = 'Edit';
    this.editExportConfigIndex = index;
    this.exportConfigObj = JSON.parse(JSON.stringify(obj));
    this.isEditColumn = true;
  }

  public closeEditColumnDialog(): void {
    this.isEditColumn = false;
  }

  public openEditExportColumnDialog(): void {
    this.isEditExportColumn = true;
    this.clearColumnObjData();
  }

  public closeEditExportColumnDialog(): void {
    this.isEditExportColumn = false;
  }
  //#endregion

  public async getUserData() {
    try {
      this.currentUser = await this.manageService.getUserByMailId(this.customerObj.email);
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async changePasswordClick(form: NgForm) {
    try {
      if (form.valid) {
        this.spinnerService.show();
        var changePasswordModel = new ChangePasswordModel();
        if (this.currentUser[0].id) {
          changePasswordModel.userId = this.currentUser[0].id;
          changePasswordModel.oldPassword = form.value.passwords.oldpassword;
          changePasswordModel.newPassword = form.value.passwords.password;
          changePasswordModel.confirmPassword = form.value.passwords.confirmPassword;

          let res = await this.manageService.ChangePassword(changePasswordModel);
          if (res) {
            this.spinnerService.hide();
            this.alertDialogService.show(`Password Updated Successfuly`, 'Success');
            this.router.navigate(['login']);
          }
          else {
            this.spinnerService.hide();
            this.alertDialogService.show(`Password not update, Please Try again later!`, 'Error');
          }
        }
        else
          this.alertDialogService.show(`UUID Of User Not found`, 'Error');
      }
    } catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(`${error.error}`, 'Error');
    }
  }

  public uploadFiles(event: Event, type: string): void {
    try {
      let fileUploadItemsIndex = this.fileUploadItems.findIndex(z => z.type == type);
      if (fileUploadItemsIndex >= 0)
        this.fileUploadItems.splice(fileUploadItemsIndex, 1);

      let acceptedFiles: string[] = [];
      this.imagePreviewprofile = "";
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
            this.imagePreviewprofile = reader.result;
          };
          reader.readAsDataURL(file);
        }
        else if (type == FileStoreTypes.CustomerPhotoIdent) {
        }
        else {
        }

        this.fileUploadItems.push({ file: file, type: type });
        for (let index = 0; index < this.fileUploadItems.length; index++) {
          const element = this.fileUploadItems[index];
          this.uploadFilesOnServer(element.file, element.type, this.customerObj?.id, index);
        }
      }
    }
    catch (error: any) {
      console.error(error);
      this.alertDialogService.show("Something went wrong, Try again later");
    }
  }

  public uploadFilesOnServer(file: File, type: string, ident: string, index: number) {
    this.fileStoreService.postUploadFileDocument(file, type, ident, this.customerObj?.email).subscribe(
      (res: any) => {
        if (res && res.body?.success) {
          this.setCustomerImages();
          this.fileUploadItems = [];
          this.utilityService.showNotification('Image uploaded successfully!');
        }
      },
      async (err: any) => {
        console.error(err);
        this.alertDialogService.show(`Something went wrong while uploading a file!`, "error")
      }
    );
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
}
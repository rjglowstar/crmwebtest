import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { DataResult, GroupDescriptor, process } from '@progress/kendo-data-query';
import { NgxSpinnerService } from 'ngx-spinner';
import { City, Country, GridDetailConfig, State } from 'shared/businessobjects';
import { AzureFileStore, FileStore } from 'shared/enitites';
import { CommonService, FileStoreService, FileStoreTypes, listAddressTypeItems, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { BrokerResponse, BrokerSearchCriteria } from '../../businessobjects';
import { Broker } from '../../entities';
import { BrokerService, GridPropertiesService } from '../../services';

@Component({
  selector: 'app-broker',
  templateUrl: './broker.component.html',
  styleUrls: ['./broker.component.css']
})

export class BrokerComponent implements OnInit {

  public groups: GroupDescriptor[] = [];
  public pageSize = 25;
  public skip = 0
  public fields!: GridDetailConfig[];
  public gridView!: DataResult;
  public isReg: boolean = false;
  public filterFlag = true;
  public selectableSettings: SelectableSettings = {
    mode: 'single',
  };
  public openedConfirmationDetails = false;
  public skeletonArray = new Array(18);
  public mySelection: string[] = [];
  public listAddressTypeItems = listAddressTypeItems

  //GeoLocation
  public countryItems!: Country[];
  public selectedCountry: any;
  public stateItems!: State[];
  public selectedState: any;
  public cityItems!: City[];
  public selectedCity: any;

  // CRUD   
  public brokerObj: Broker = new Broker();
  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains'
  };
  public insertFlag: boolean = true;
  public openedDelete: boolean = false;
  public mobileMask = '(999) 000-00-00-00';

  // Files upload variables
  public FileStoreTypes = FileStoreTypes;
  public currentFile!: File;
  public profileImageErrorFlag: boolean = false;
  public profileImageModel: any = undefined;
  public isImgselectedProfile: boolean = false;
  public showUploadProfile = true;
  public imagePreviewprofile: any;
  public extraImage: Array<{ id?: string, filetype: string, file: any, isLocal: boolean }> = new Array<{ id?: string, filetype: string, file: string, isLocal: boolean }>();
  public profileFileStore: AzureFileStore = new AzureFileStore();
  public fileUploadItems: Array<{ type: string, file: File }> = new Array<{ type: string, file: File }>();
  public cloneFileStore: AzureFileStore[] = [];
  public fileStore: AzureFileStore[] = [];

  // Filter
  public brokerCriteria: BrokerSearchCriteria = new BrokerSearchCriteria();

  constructor(
    private gridPropertiesService: GridPropertiesService,
    public utilityService: UtilityService,
    private brokerService: BrokerService,
    private alertDialogService: AlertdialogService,
    private spinnerService: NgxSpinnerService,
    private commonService: CommonService,
    private fileStoreService: FileStoreService,
    private domSanitizer: DomSanitizer,
  ) { }

  async ngOnInit() {
    await this.defaultMethodsLoad();
  }

  public async defaultMethodsLoad() {
    this.fields = await this.gridPropertiesService.getBrokerGrid();
    await this.getCountryData();
    await this.loadData();


    this.utilityService.filterToggleSubject.subscribe(flag => {
      this.filterFlag = flag;
    });
  }

  //#region GeoLocation Detail
  private async getCountryData() {
    try {
      this.countryItems = await this.commonService.getCountries();
    }
    catch (error: any) {
      console.error(error);
      this.alertDialogService.show('Something went wrong, Try again later!');
    }
  }

  public async onCountryChange(e: string) {
    try {
      this.spinnerService.show();
      this.selectedCountry = this.countryItems.find(c => c.name == e);
      if (this.selectedCountry != null)
        await this.getStatesByCountryCode(this.selectedCountry.iso2);

      this.brokerObj.address.state = null as any;
      this.brokerObj.address.city = null as any;
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

  public async onStateChange(e: string) {
    try {
      this.spinnerService.show();
      this.selectedState = this.stateItems.find((c: State) => c.name == e);
      if (this.selectedState != null)
        await this.getCityData(this.selectedCountry, this.selectedState.state_Code);

      this.brokerObj.address.city = null as any;
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
  //#endregion GeoLocation Detail 

  //#region List 
  public async loadData() {
    try {
      let response: BrokerResponse = await this.brokerService.getBrokerNames(this.brokerCriteria, this.skip, this.pageSize);
      this.gridView = process(response.broker, { group: this.groups });
      this.gridView.total = response.totalCount;
    }
    catch (error: any) {
      console.error(error);
      console.error(error);
      this.alertDialogService.show('Something went wrong, Try again later!');
    }
  }

  public groupChange(groups: GroupDescriptor[]): void {
    try {
      this.groups = groups;
      this.loadData();
    }
    catch (error: any) {
      console.error(error);
      console.error(error);
      this.alertDialogService.show('Something went wrong, Try again later!');
    }
  }

  public pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.loadData();
  }
  //#endregion List 

  //#region Filter Section
  public filterPartToggle() {
    this.utilityService.setfilterToggleValue(this.filterFlag);
  }

  public async selectedRowChange(e: any) {
    try {
      this.insertFlag = false;
      this.brokerObj = new Broker();
      let value: any = e.selectedRows[0].dataItem
      this.brokerObj = { ...value };
      this.clearPreviewFile("BrokerProfile");
      this.clearPreviewFile("BrokerExtraDocument");
      let imageList: AzureFileStore[] = await this.fileStoreService.getAzureFileByIdent(this.brokerObj.id);
      this.cloneFileStore = [];
      if (imageList && imageList.length > 0) {
        for (let index = 0; index < imageList.length; index++) {
          const element = imageList[index];
          this.cloneFileStore.push({ ...element });
          element.fileThumbnail = this.loadImage(element.fileThumbnail) || null as any;
        }
        this.fileStore = [];
        this.fileStore = imageList;
        this.setBrokerImages();
      }
      else
        this.fileStore = [];
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public onFilterSubmit(form: NgForm) {
    this.skip = 0
    this.loadData()
  }

  public clearFilter(form: NgForm) {
    form.reset()
    this.brokerCriteria = new BrokerSearchCriteria()
    this.loadData()
  }
  //#endregion Filter Section

  //#region Modal
  public openAddDialog(): void {
    this.brokerObj = new Broker();
    this.insertFlag = true;
    this.isReg = true;
    this.extraImage = new Array<{ id?: string, filetype: string, file: any, isLocal: boolean }>();
    this.fileUploadItems = new Array<{ type: string, file: File }>();
    this.imagePreviewprofile = null;
  }

  public async openUpdateDialog() {
    this.isReg = true;
    let valueCountryExist = this.countryItems.filter((s: any) => {
      return s.name === this.brokerObj.address.country;
    });
    if (valueCountryExist !== undefined && valueCountryExist !== null && valueCountryExist.length > 0) {
      await this.getStatesByCountryCode(valueCountryExist[0].iso2);
      setTimeout(async () => {
        if (this.stateItems) {
          let valueStateExist = this.stateItems.filter((s: any) => {
            return s.name?.toLowerCase() === this.brokerObj.address.state?.toLowerCase();
          });
          if (valueStateExist !== undefined && valueStateExist !== null && valueStateExist.length > 0)
            await this.getCityData(valueCountryExist[0], valueStateExist[0].state_Code);
        }
      }, 200);
    }
  }

  public closeDialog(form: NgForm): void {
    this.isReg = false;
    this.mySelection = [];
    this.resetForm(form);
  }

  public async onSubmit(form: NgForm, action: boolean) {
    try {
      if (form.valid) {
        this.spinnerService.show();
        let messageType: string = "";
        let response: any;
        if (!action) {
          this.insertFlag = true;
          this.brokerObj.id = ""
        }

        if (!this.insertFlag) {
          messageType = "updated";
          response = await this.brokerService.Update(this.brokerObj);
        }
        else {
          messageType = "inserted";
          response = await this.brokerService.Insert(this.brokerObj);
          this.brokerObj.id = response;
        }

        if (response) {

          // upload files
          if (this.currentFile) {
            let indexProfile = this.fileUploadItems.findIndex(c => c.type == FileStoreTypes.BrokerProfile);
            if (indexProfile >= 0) {
              const element = this.fileUploadItems[indexProfile];
              await this.uploadProfileOnServer(element.file, element.type, this.brokerObj.id);
              this.fileUploadItems.splice(indexProfile, 1);
            }

            let filteredExtraImg = this.fileUploadItems.filter(c => c.type == FileStoreTypes.BrokerExtraDocument);
            if (filteredExtraImg && filteredExtraImg.length > 0) {
              let upFiles = filteredExtraImg.map(c => c.file);
              await this.uploadFilesOnServer(upFiles, filteredExtraImg[0].type, this.brokerObj.id, filteredExtraImg.length, form);
            }
          }

          this.loadData();
          this.mySelection = [];
          this.spinnerService.hide();
          if (action)
            this.isReg = false;
          this.resetForm(form);
          this.utilityService.showNotification(`You have been ${messageType} successfully!`)
        }
        else {
          this.alertDialogService.show(response.message);

          if (response?.errorMessage?.length > 0)
            console.error(response.errorMessage);
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
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async uploadProfileOnServer(file: File, type: string, ident: string) {
    try {
      let res = await this.fileStoreService.postUploadFileDocument1(file, type, ident, this.brokerObj?.email);
      if (res) {
        if (this.profileImageErrorFlag)
          this.profileImageErrorFlag = false;
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async uploadFilesOnServer(files: File[], type: string, ident: string, count: number, form: NgForm) {
    try {
      let res = await this.fileStoreService.postMultipleUploadFileDocument(files, type, ident, this.brokerObj?.email);
      if (res)
        this.fileUploadItems = [];
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public resetForm(form?: NgForm) {
    this.brokerObj = new Broker();
    this.insertFlag = true;
    form?.reset();
    this.brokerObj.mobileNo = '';
  }

  public openDeleteDialog() {
    try {
      this.alertDialogService.ConfirmYesNo("Are you sure you want to delete?", "Delete")
        .subscribe(async (res: any) => {
          this.mySelection = [];
          if (res.flag) {
            this.spinnerService.show();
            let responseDelete = await this.brokerService.delete(this.brokerObj.id)
            if (responseDelete !== undefined && responseDelete !== null) {
              this.loadData();
              this.spinnerService.hide();
              this.insertFlag = true;
              this.utilityService.showNotification(`You have been deleted successfully!`)
            }
          }
        })
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(error.error)
    }
  }
  //#endregion Modal

  //fileupload
  public clearPreviewFile(type: string) {
    if (type == FileStoreTypes.BrokerProfile) {
      this.imagePreviewprofile = '';
      this.isImgselectedProfile = false;
      this.profileImageModel = undefined;
    }

    let fileUploadItemsIndex = this.fileUploadItems.findIndex(z => z.type == type);
    if (fileUploadItemsIndex >= 0)
      this.fileUploadItems.splice(fileUploadItemsIndex, 1);

    if (type == FileStoreTypes.BrokerExtraDocument) {
      this.extraImage = new Array<{ id?: string, filetype: string, file: any, isLocal: boolean }>();
      this.fileUploadItems = this.fileUploadItems.filter(c => c.type != type);
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
        this.currentFile = file;
        if (type == FileStoreTypes.BrokerProfile) {
          this.profileImageModel = this.currentFile;
          const reader = new FileReader();
          reader.onload = () => {
            this.imagePreviewprofile = reader.result;
          };
          reader.readAsDataURL(file);
          this.profileImageErrorFlag = false;
          this.isImgselectedProfile = true;
          this.fileUploadItems.push({ file: file, type: type });
        }
        else if (type == FileStoreTypes.BrokerExtraDocument) {
          for (let i = 0; i < target.files.length; i++) {
            const element = target.files[i];
            file = target.files[i];
            const reader = new FileReader();
            reader.onload = () => {
              if (element && element.type == "application/pdf")
                this.extraImage.push({ filetype: "pdf", file: reader.result, isLocal: true });
              else
                this.extraImage.push({ filetype: "image", file: reader.result, isLocal: true });
            };
            reader.readAsDataURL(file);
            this.fileUploadItems.push({ file: file, type: type });
          }
        }
      }
    }
    catch (error: any) {
      console.error(error);
      this.alertDialogService.show("Something went wrong, Try again later");
    }
  }

  private loadImage(imageSrc: string) {
    if (imageSrc != undefined && imageSrc != null && imageSrc != "")
      return 'data:image/jpeg;base64,' + imageSrc;
    else
      return null
  }

  public async removeImage(docs: { id?: string, filetype: string, file: any, isLocal: boolean }) {
    let index = this.extraImage.findIndex(c => c.filetype == docs.filetype && c.file == docs.file);
    if (index >= 0) {
      if (!docs.isLocal && docs.id) {
        this.alertDialogService.ConfirmYesNo('Are you sure you want to delete?', 'Delete')
          .subscribe(async (res: any) => {
            if (res.flag) {
              let flag = await this.fileStoreService.deletefilestore(docs.id ? docs.id : "");
              if (flag) {
                this.utilityService.showNotification(`file deleted successfully!`);
                this.extraImage.splice(index, 1);
              }
              else
                this.alertDialogService.show(`Something went wrong. Please try again!`, 'error');
            }
          });
      }
      else
        this.extraImage.splice(index, 1);
    }

  }

  private async setBrokerImages() {
    if (this.fileStore.length > 0) {
      let profileFileStore = this.fileStore.find(z => z.identType == FileStoreTypes.BrokerProfile);
      if (profileFileStore == null) {
        profileFileStore = new AzureFileStore();
        profileFileStore.fileThumbnail = 'assets/images/profile.png';
      }
      this.profileFileStore = profileFileStore;

      this.imagePreviewprofile = profileFileStore.fileThumbnail;
      this.extraImage = new Array<{ filetype: string, file: any, isLocal: boolean }>();
      let extraDocs = this.fileStore.filter(z => z.identType == FileStoreTypes.BrokerExtraDocument);
      if (extraDocs != null && extraDocs.length > 0) {
        extraDocs.forEach(async d => {
          if (d.blobName.split('.')[1] == "pdf")
            this.extraImage.push({ id: d.id, filetype: "pdf", file: d.fileThumbnail, isLocal: false });
          else
            this.extraImage.push({ id: d.id, filetype: "image", file: d.fileThumbnail, isLocal: false });
        });
      }
    }
  }

  public sanitizeURL(url: string) {
    return this.domSanitizer.bypassSecurityTrustResourceUrl(url);
  }

}
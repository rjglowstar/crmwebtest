import { Component, OnInit } from '@angular/core';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { SelectableSettings } from '@progress/kendo-angular-grid';
import { DataResult, GroupDescriptor, process } from '@progress/kendo-data-query';
import { GridDetailConfig } from 'shared/businessobjects';
import { FileStore, fxCredential, GridConfig, GridMasterConfig } from 'shared/enitites';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
import { AlertdialogService } from 'shared/views';
import { AppPreloadService, CommonService, ConfigService, FileStoreService, FileStoreTypes, UtilityService } from 'shared/services';
import { GridPropertiesService, ManageEventService } from '../../services';
import { ManageEvent, ManageEventImages } from '../../entities';
import { NgForm } from '@angular/forms';
import { ManageEventCriteria } from '../../businessobjects';

@Component({
  selector: 'app-manageevent',
  templateUrl: './manageevent.component.html',
  styleUrls: ['./manageevent.component.css']
})
export class ManageeventComponent implements OnInit {


  //Pre-Grid 
  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains',
  };
  public selectableSettings: SelectableSettings = {
    mode: 'single',
  };
  public mySelection: string[] = [];
  public skeletonArray = new Array(18);
  public groups: GroupDescriptor[] = [];

  //Grid & Pagination Settings
  public pageSize = 26;
  public skip = 0;
  public fields!: GridDetailConfig[];
  public gridView!: DataResult;
  public isGridConfig: boolean = false;
  public gridConfig!: GridConfig;
  public gridMasterConfigResponse!: GridMasterConfig;

  // Pre-filter setttings
  public filterFlag: boolean = true;
  private fxCredential!: fxCredential;

  public isEditModFlag: boolean = true;
  public showEventDialog: boolean = false;
  public isImgselectedProfile: boolean = false;
  public isEventLogoselected: boolean = false;
  public profileImageErrorFlag: boolean = false;
  public eventLogoErrorFlag: boolean = false;
  public currentFile!: File;
  public imagePreviewprofile: any;
  public eventLogoimagePreview: any;
  public profileImageModel: any = undefined;
  public eventLogoModel: any = undefined;
  public fileUploadItems: Array<{ file: File }> = new Array<{ file: File }>();
  public gallaryUploadItems: Array<{ file: File }> = new Array<{ file: File }>();
  public fileStore: FileStore[] = [];
  public cloneFileStore: FileStore[] = [];

  //CRUD
  public manageEventObj: ManageEvent = new ManageEvent();

  // Filter Employee
  public manageEventCriteria: ManageEventCriteria = new ManageEventCriteria();

  constructor(
    private router: Router,
    private spinnerService: NgxSpinnerService,
    private alertDialogService: AlertdialogService,
    private appPreloadService: AppPreloadService,
    private commonService: CommonService,
    private configService: ConfigService,
    private gridPropertiesService: GridPropertiesService,
    private utilityService: UtilityService,
    private manageEventService: ManageEventService,
    private fileStoreService: FileStoreService,
  ) { }

  public async ngOnInit() {
    await this.defaultMethodsLoad();
  }

  //#region Initialize Data
  async defaultMethodsLoad() {
    this.spinnerService.show();
    this.fxCredential = await this.appPreloadService.fetchFxCredentials();
    if (!this.fxCredential)
      this.router.navigate(["login"]);
    else {
      this.spinnerService.hide();
      this.gridView = { data: [], total: 0 };
      await this.getGridConfiguration();
      await this.loadEvents();

      this.utilityService.filterToggleSubject.subscribe(flag => {
        this.filterFlag = flag;
      });
    }
  }

  public async getGridConfiguration() {
    try {
      this.spinnerService.show();
      this.gridConfig = await this.configService.getGridConfig(this.fxCredential.id, "Events", "EventsGrid", this.gridPropertiesService.getManageEventGrid());
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
        this.gridMasterConfigResponse = await this.configService.getMasterGridConfig("Events", "EventsGrid");
        if (this.gridMasterConfigResponse)
          this.fields = this.gridMasterConfigResponse.gridDetail;
        else
          this.fields = await this.gridPropertiesService.getManageEventGrid();
      }
      this.spinnerService.hide();
    } catch (error: any) {
      this.alertDialogService.show(error.error)
      this.spinnerService.hide();
    }
  }

  private async loadEvents() {
    try {
      this.spinnerService.show();
      let res = await this.manageEventService.getAllEvents();
      if (res) {
        this.gridView = process(res, { group: this.groups });
        this.gridView.total = res.length;
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

  public async selectedRowChange(e: any) {
    this.isEditModFlag = false;
    this.manageEventObj = new ManageEvent();
    let value: any = e.selectedRows[0].dataItem;
    this.manageEventObj = { ...value };
    this.imagePreviewprofile = this.manageEventObj.eventImage;
    this.eventLogoimagePreview = this.manageEventObj.eventLogo;
    this.profileImageModel = true;
    this.eventLogoModel = true;
    this.isImgselectedProfile = true;
    this.isEventLogoselected = true;
    this.manageEventObj.startDate = this.utilityService.getValidDate(this.manageEventObj.startDate);
    this.manageEventObj.endDate = this.utilityService.getValidDate(this.manageEventObj.endDate);
    /**
     * File Upload to get all image related to this selected events;
     */
    if (this.manageEventObj.id) {
      let imageList: FileStore[] = await this.fileStoreService.getFileByIdent(this.manageEventObj.id);
      // this.cloneFileStore = [];
      if (imageList && imageList.length > 0) {
        this.manageEventObj.images = this.mappingImages(imageList);
      }
    }
  }

  public mappingImages(imageList: FileStore[]): ManageEventImages[] {
    let mapImages: ManageEventImages[] = [];
    imageList.forEach(element => {
      let obj: ManageEventImages = new ManageEventImages();
      obj.imageName = element.fileName;
      obj.imageType = element.type
      obj.imageString = this.loadImage(element.fileThumbnail) || null as any; // 'data:image/jpeg;base64,' + element.fileThumbnail;
      obj.createdDate = element.createdDate;
      mapImages.push(obj);
    });
    return mapImages;
  }

  private loadImage(imageSrc: string) {
    if (imageSrc != undefined && imageSrc != null && imageSrc != "")
      return 'data:image/JPEG;base64,' + imageSrc;
    else
      return null
  }

  public clearEventThumbnil(): void {
    this.imagePreviewprofile = '';
    this.isImgselectedProfile = false;
    this.profileImageModel = undefined;
  }
  
  public clearEventLogoThumbnil(): void {
    this.eventLogoimagePreview = '';
    this.isEventLogoselected = false;
    this.eventLogoModel = undefined;
  }

  public uploadFiles(form: NgForm, event: Event): void {
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
        this.profileImageModel = this.currentFile;
        const reader = new FileReader();
        reader.onload = () => {

          this.imagePreviewprofile = reader.result;
        };
        reader.readAsDataURL(file);
        this.isImgselectedProfile = true;
        this.fileUploadItems.push({ file: file });
      }
    }
    catch (error: any) {
      console.error(error);
      this.alertDialogService.show("Something went wrong, Try again later");
    }
  }

  public uploadEventLogo(form: NgForm, event: Event): void {
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
        this.eventLogoModel = file;
        const reader = new FileReader();
        reader.onload = () => {

          this.eventLogoimagePreview = reader.result;
        };
        reader.readAsDataURL(file);
        this.isEventLogoselected = true;
        this.fileUploadItems.push({ file: file });
      }
    }
    catch (error: any) {
      console.error(error);
      this.alertDialogService.show("Something went wrong, Try again later");
    }
  }

  public uploadEventImages(evt: any) {
    if (evt.target.files && evt.target.files[0]) {
      var filesAmount = evt.target.files.length;
      let cnt = 0;
      this.manageEventObj.images = new Array<ManageEventImages>();
      for (let i = 0; i < filesAmount; i++) {
        var reader = new FileReader();
        let eventImg = new ManageEventImages();
        eventImg.createdById = this.fxCredential.id;
        eventImg.imageName = evt.target.files[i].name;
        eventImg.imageType = evt.target.files[i].type;
        eventImg.imageString = "";
        reader.onload = (evnt: any) => {
          var imageObj = new ManageEventImages();
          imageObj.imageString = evnt.target.result;
          evt.target.files[i]['FileName'] = evt.target.files[i].name;
          this.manageEventObj.images.push(imageObj);
          cnt++;
        }
        reader.readAsDataURL(evt.target.files[i]);
        this.gallaryUploadItems.push({ file: evt.target.files[i] });
      }
    }
  }

  public removeImage(evtImage: ManageEventImages): void {
    let index = this.manageEventObj.images.findIndex(c => c.imageName == evtImage.imageName);
    if (index >= 0)
      this.manageEventObj.images.splice(index, 1);
  }
  //#endregion

  //#region CRUD
  public openAddEventDialog(): void {
    this.showEventDialog = true;
    this.clearEventThumbnil();
    this.clearEventLogoThumbnil();
    this.manageEventObj = new ManageEvent();
  }

  public openUpdateEventDialog(): void {
    this.showEventDialog = true;
  }

  public async onManageEventSubmit(form: NgForm, action: boolean) {
    try {
      if (form.valid) {
        this.spinnerService.show();
        this.manageEventObj.createdBy = this.fxCredential.id;
        this.manageEventObj.createdById = this.fxCredential.id;
        this.manageEventObj.createdDate = this.utilityService.setLiveUTCDate();
        this.manageEventObj.eventImage = this.imagePreviewprofile;
        this.manageEventObj.eventLogo = this.eventLogoimagePreview;
        this.manageEventObj.startDate = this.utilityService.setUTCDateFilter(this.manageEventObj.startDate);
        this.manageEventObj.endDate =  this.utilityService.setUTCDateFilter(this.manageEventObj.endDate);
        this.spinnerService.hide();
        let messageType: string = "";
        let response: any;
        if (!action) {
          this.isEditModFlag = true;
          this.manageEventObj.id = ""
        }

        if (!this.isEditModFlag) {
          messageType = "updated";
          response = await this.manageEventService.UpdateEvent(this.manageEventObj);
        }
        else {
          messageType = "inserted";
          response = await this.manageEventService.insertEvent(this.manageEventObj);
        }

        if (response) {
          for (let index = 0; index < this.gallaryUploadItems.length; index++) {
            const element = this.gallaryUploadItems[index];
            await this.uploadFilesOnServer(element.file, FileStoreTypes.EventImages, response, index, form);
          }
          this.loadEvents();
          this.mySelection = [];
          this.spinnerService.hide();
          if (action)
            this.showEventDialog = false;
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
      }
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async uploadFilesOnServer(file: File, type: string, ident: string, index: number, form: NgForm) {
    this.fileStoreService.postUploadFileDocument(file, type, ident, this.manageEventObj?.eventName).subscribe(
      (res: any) => {
        if (res.body?.statusCode == 200) {
          let response = res.body.value;
        }
      },
      (err: any) => {
        this.currentFile = null as any;
        console.error(err);
        this.alertDialogService.show(`Something went wrong while uploading a file!`, "error")
      }
    );
  }

  public openDeleteDialog(): void {
    try {
      this.alertDialogService.ConfirmYesNo("Are you sure you want to delete?", "Delete")
        .subscribe(async (res: any) => {
          if (res.flag) {
            this.spinnerService.show();
            let responseDelete = await this.manageEventService.deleteEvent(this.manageEventObj.id)
            if (responseDelete !== undefined && responseDelete !== null) {
              this.loadEvents();
              this.spinnerService.hide();
              this.isEditModFlag = true;
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

  public closeEventDialog(): void {
    this.showEventDialog = false;
    this.mySelection = [];
    this.clearEventThumbnil();
    this.clearEventLogoThumbnil();
  }

  public resetForm(form?: NgForm) {
    this.isEditModFlag = true;
    form?.reset();
    this.manageEventObj = new ManageEvent();
    this.gallaryUploadItems = [];
    this.fileUploadItems = [];
    this.clearEventThumbnil();
  }
  //#endregion
  
  public async onFilterSubmit(form: NgForm) {
    if (this.manageEventCriteria.fromDate != null)
      this.manageEventCriteria.fromDate = this.utilityService.setUTCDateFilter(this.manageEventCriteria.fromDate);
    if (this.manageEventCriteria.toDate != null)
      this.manageEventCriteria.toDate = this.utilityService.setUTCDateFilter(this.manageEventCriteria.toDate);
    let data = await this.manageEventService.getFilteredEvents(this.manageEventCriteria);
    this.gridView = process(data, { group: this.groups });
    this.gridView.total = data.length;
  }

  public clearFilter(form: NgForm) {
    form.reset();
    this.manageEventCriteria = new ManageEventCriteria();
    this.loadEvents();
  }

  public filterPartToggle() {
    this.utilityService.setfilterToggleValue(this.filterFlag);
  }

}
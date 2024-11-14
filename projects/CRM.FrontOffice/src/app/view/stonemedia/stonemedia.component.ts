import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { PageChangeEvent, SelectableSettings, } from '@progress/kendo-angular-grid';
import { DataResult, GroupDescriptor, process, } from '@progress/kendo-data-query';
import { NgxSpinnerService } from 'ngx-spinner';
import { environment } from 'environments/environment';
import { GridDetailConfig } from 'shared/businessobjects';
import { InventoryItems, StoneMedia } from '../../entities';
import { fxCredential, GridConfig, GridMasterConfig, MasterConfig, MasterDNorm } from 'shared/enitites';
import { CommuteService, GridPropertiesService, InventoryService, MasterConfigService } from '../../services';
import { ConfigService, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { InventorySearchCriteria, InventorySearchResponse, InventorySelectAllItems, InventorySummary, MediaInput, MediaStatus, WeightRange } from '../../businessobjects';

@Component({
  selector: 'app-stonemedia',
  templateUrl: './stonemedia.component.html',
  styleUrls: ['./stonemedia.component.css'],
})

export class StonemediaComponent implements OnInit {
  public groups: GroupDescriptor[] = [];
  public groupsIssue: GroupDescriptor[] = [];
  public pageSize = 7;
  public skip = 0;
  public fields!: GridDetailConfig[];
  public gridView!: DataResult;
  public gridViewIssue!: DataResult;
  public filterFlag = true;
  public selectableSettings: SelectableSettings = { mode: 'multiple' };
  public skeletonArray = new Array(18);
  public mySelection: string[] = [];
  public InventoryObj: InventoryItems = new InventoryItems();
  public inventoryItems: InventoryItems[] = [];
  public inventoryResponse: InventorySearchResponse = new InventorySearchResponse();
  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains',
  };
  public inventorySearchCriteriaObj: InventorySearchCriteria = new InventorySearchCriteria();
  public listPacketsItems: string[] = [];
  public listStoneItems: Array<{ text: string; value: string }> = [];
  public packetsItems!: InventoryItems[];
  public fxCredentials!: fxCredential;
  public masterConfigList!: MasterConfig;
  public sumMnuStonesWeight?: string;
  public isGridConfig: boolean = false;
  public gridConfig!: GridConfig;
  public gridMasterConfigResponse!: GridMasterConfig;
  public StoneCertificateNo?: string;
  public StoneNo?: string;
  public StoneDescription?: string;
  public isStoneGallery: boolean = false;
  public environment = environment;
  public StoneMediaItems: StoneMedia[] = [];
  public selectedStoneMedia: StoneMedia = new StoneMedia();
  public allTheShapes!: MasterDNorm[];
  public allClarities!: MasterDNorm[];
  public allColors!: MasterDNorm[];
  public allTheFluorescences!: MasterDNorm[];
  public allTheCPS!: MasterDNorm[];
  public filterShape: string = '';
  public filterShapeChk: boolean = true;
  public filterKapan: string = '';
  public filterKapanChk: boolean = true;
  public filterColor: string = '';
  public filterColorChk: boolean = true;
  public filterClarity: string = '';
  public filterClarityChk: boolean = true;
  public filterCut: string = '';
  public filterCutChk: boolean = true;
  public filterPolish: string = '';
  public filterPolishChk: boolean = true;
  public filterSymm: string = '';
  public filterSymmChk: boolean = true;
  public filterFlour: string = '';
  public filterFlourChk: boolean = true;
  public allKapan: string[] = [];
  public listShape: Array<{ name: string; isChecked: boolean }> = [];
  public listKapan: Array<{ name: string; isChecked: boolean }> = [];
  public listColor: Array<{ name: string; isChecked: boolean }> = [];
  public listClarity: Array<{ name: string; isChecked: boolean }> = [];
  public listCut: Array<{ name: string; isChecked: boolean }> = [];
  public listPolish: Array<{ name: string; isChecked: boolean }> = [];
  public listSymm: Array<{ name: string; isChecked: boolean }> = [];
  public listFlour: Array<{ name: string; isChecked: boolean }> = [];
  public firstCaratFrom?: number;
  public firstCaratTo?: number;
  public stoneId?: "";
  public certificateNo!: string
  public invSummary: InventorySummary = new InventorySummary();
  public selectedStone: MediaInput[] = new Array<MediaInput>();
  public isViewButtons: boolean = false;
  public isShowCheckBoxAll: boolean = true;
  public selectedInventoryItems: StoneMedia[] = new Array<StoneMedia>();
  public selectAllFlag: boolean = false;
  public invResponse: InventorySummary = new InventorySummary();
  public allInventoryItems: InventorySelectAllItems[] = [];
  public selectedStoneIds: string[] = new Array<string>();

  constructor(
    private gridPropertiesService: GridPropertiesService,
    public utilityService: UtilityService,
    private alertDialogService: AlertdialogService,
    private spinnerService: NgxSpinnerService,
    private masterConfigService: MasterConfigService,
    private configService: ConfigService,
    private inventoryService: InventoryService,
    private commuteService: CommuteService,
    private changeDetRef: ChangeDetectorRef
  ) { }

  async ngOnInit() {
    await this.defaultMethodsLoad();
  }

  //#region defaultMethods
  async defaultMethodsLoad() {
    this.fxCredentials = JSON.parse(sessionStorage.getItem('fxCredentials') ?? '') as fxCredential;
    //this.inventorySearchCriteriaObj.employeeId = this.fxCredentials.id;
    await this.getGridConfiguration();
    this.gridView = { data: [], total: 0 };
    await this.loadMasterConfig();

    //if (this.fxCredentials && this.fxCredentials.origin && (this.fxCredentials.origin.toLowerCase() == 'admin'))
    this.isViewButtons = true;    

    this.utilityService.filterToggleSubject.subscribe(flag => {
      this.filterFlag = flag;
    });
  }

  public async loadStock() {
    try {
      this.spinnerService.show();
      this.inventoryResponse = await this.inventoryService.getInventoryResponse(this.inventorySearchCriteriaObj, this.skip, this.pageSize);
      if (this.inventoryResponse) {
        this.inventoryItems = this.inventoryResponse.inventories;
        this.StoneMediaItems = this.validateImages(this.inventoryItems);
        this.gridView = process(this.StoneMediaItems, { group: this.groups });
        this.gridView.total = this.inventoryResponse.totalCount;
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

  public async loadMasterConfig() {
    try {
      this.spinnerService.show();
      this.masterConfigList = await this.masterConfigService.getAllMasterConfig();
      this.allTheShapes = this.masterConfigList.shape;
      this.allTheShapes.forEach((z) => {
        this.listShape.push({ name: z.name, isChecked: false });
      });
      this.allColors = this.masterConfigList.colors;
      this.allColors.forEach((z) => {
        this.listColor.push({ name: z.name, isChecked: false });
      });
      this.allClarities = this.masterConfigList.clarities;
      this.allClarities.forEach((z) => {
        this.listClarity.push({ name: z.name, isChecked: false });
      });
      this.allTheFluorescences = this.masterConfigList.fluorescence;
      this.allTheFluorescences.forEach((z) => {
        this.listFlour.push({ name: z.name, isChecked: false });
      });
      this.allTheCPS = this.masterConfigList.cps;
      this.allTheCPS.forEach((z) => {
        this.listCut.push({ name: z.name, isChecked: false });
      });
      this.allTheCPS.forEach((z) => {
        this.listPolish.push({ name: z.name, isChecked: false });
      });
      this.allTheCPS.forEach((z) => {
        this.listSymm.push({ name: z.name, isChecked: false });
      });
      let kapanItems = await this.inventoryService.getOrgKapanList();
      kapanItems.forEach(z => { this.listKapan.push({ name: z, isChecked: false }); });
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }
  //#endregion

  //#region validateImages Video
  private validateImages(data: InventoryItems[]): StoneMedia[] {
    let array: StoneMedia[] = [];
    data.forEach((z) => {
      let one: StoneMedia = new StoneMedia();

      if (z.media.isHtmlVideo == true)
        one.videoUrl = (environment.videoURL.replace('{stoneId}', z.stoneId.toLowerCase()));
      else
        one.videoUrl = 'commonAssets/images/video-not-found.png';

      if (z.media.isPrimaryImage == true)
        one.imageUrl = (environment.imageURL.replace('{stoneId}', z.stoneId.toLowerCase()));
      else
        one.imageUrl = 'commonAssets/images/image-not-found.jpg';

      if (z.media.isArrowBlack == true)
        one.arrowBlackImageUrl = (environment.otherImageBaseURL.replace('{stoneId}', z.stoneId.toLowerCase()) + environment.invStoneArrowBlackImageUrl);
      else
        one.arrowBlackImageUrl = 'commonAssets/images/image-not-found.jpg';

      if (z.media.isHeartBlack == true)
        one.heartBlackImageUrl = (environment.otherImageBaseURL.replace('{stoneId}', z.stoneId.toLowerCase()) + environment.invStoneHeartBlackImageUrl);
      else
        one.heartBlackImageUrl = 'commonAssets/images/image-not-found.jpg';

      if (z.media.isAsetWhite == true)
        one.asetWhiteImageUrl = (environment.otherImageBaseURL.replace('{stoneId}', z.stoneId.toLowerCase()) + environment.invStoneAsetWhiteImageUrl);
      else
        one.asetWhiteImageUrl = 'commonAssets/images/image-not-found.jpg';

      if (z.media.isIdealWhite == true)
        one.idealWhiteImageUrl = (environment.otherImageBaseURL.replace('{stoneId}', z.stoneId.toLowerCase()) + environment.invStoneIdealWhiteImageUrl);
      else
        one.idealWhiteImageUrl = 'commonAssets/images/image-not-found.jpg';

      if (z.media.isOfficeLightBlack == true)
        one.officeLightBlackImageUrl = (environment.otherImageBaseURL.replace('{stoneId}', z.stoneId.toLowerCase()) + environment.invStoneOfficeLightBlackImageUrl);
      else
        one.officeLightBlackImageUrl = 'commonAssets/images/image-not-found.jpg';

      if (z.media.isCertificate == true)
        one.certificateUrl = environment.certiURL.replace('{certiNo}', z.certificateNo);
      else
        one.certificateUrl = 'commonAssets/images/certi-not-found.png';

      one.stoneId = z.stoneId;
      one.shape = z.shape;
      one.weight = z.weight;
      one.color = z.color;
      one.clarity = z.clarity;
      one.cut = z.cut;
      one.polish = z.polish;
      one.symmetry = z.symmetry;
      one.fluorescence = z.fluorescence;
      one.lab = z.lab;
      one.certificateNo = z.certificateNo;
      one.certiType = z.certiType;

      array.push(one);
    });
    return array;
  }
  //#endregion

  //#region Filter
  public filterPartToggle() {
    this.utilityService.setfilterToggleValue(this.filterFlag);
  }

  public onFilterSubmit(form: NgForm) {
    this.skip = 0;
    this.assignAdditionalData();
    this.loadStock();
  }

  public clearFilter(form: NgForm) {
    form.reset();
    this.inventorySearchCriteriaObj = new InventorySearchCriteria();
    this.stoneId = undefined as any;
    this.certificateNo = undefined as any;
    this.loadStock();
  }
  //#endregion

  //#region Dailog
  public openStoneGalleryDailog(stoneMedia: StoneMedia): void {
    this.selectedStoneMedia = stoneMedia;
    this.isStoneGallery = true;
  }

  public closeStoneGalleryDailog(): void {
    this.isStoneGallery = false;
  }
  //#endregion

  //#region Grid Config
  public async getGridConfiguration() {
    try {
      this.spinnerService.show();
      this.gridConfig = await this.configService.getGridConfig(this.fxCredentials.id, 'StoneMedia', 'StoneMediaGrid', this.gridPropertiesService.getStoneMediaGrid());
      if (this.gridConfig && this.gridConfig.id != '') {
        let dbObj: GridDetailConfig[] = this.gridConfig.gridDetail;
        if (dbObj && dbObj.some((c) => c.isSelected)) {
          this.fields = dbObj;
          this.fields.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        } else this.fields.forEach((c) => (c.isSelected = true));
      } else {
        this.gridMasterConfigResponse = await this.configService.getMasterGridConfig('StoneMedia', 'StoneMediaGrid');
        if (this.gridMasterConfigResponse)
          this.fields = this.gridMasterConfigResponse.gridDetail;
        else this.fields = await this.gridPropertiesService.getStoneMediaGrid();
      }
      this.spinnerService.hide();
    } catch (error: any) {
      this.alertDialogService.show(error);
      this.spinnerService.hide();
    }
  }

  public pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.loadStock();
  }

  public openGridConfigDialog(): void {
    this.isGridConfig = true;
  }

  public setNewGridConfig(gridConfig: GridConfig) {
    if (gridConfig) {
      this.fields = gridConfig.gridDetail;
      this.gridConfig = new GridConfig();
      this.gridConfig.id = gridConfig.id;
      this.gridConfig.gridDetail = gridConfig.gridDetail;
      this.gridConfig.gridName = gridConfig.gridName;
      this.gridConfig.pageName = gridConfig.pageName;
      this.gridConfig.empID = gridConfig.empID;
    }
  }

  public selectedRowChange(e: any) {
    this.InventoryObj = new InventoryItems();
    let value: any = e.selectedRows[0].dataItem;
    this.InventoryObj = { ...value };

    this.StoneCertificateNo = this.InventoryObj.certificateNo;
    this.StoneNo = this.InventoryObj.stoneId;
    this.StoneDescription =
      this.InventoryObj.shape +
      '   |   ' +
      this.InventoryObj.weight +
      '   |   ' +
      this.InventoryObj.color +
      '   |   ' +
      this.InventoryObj.clarity +
      '   |   ' +
      this.InventoryObj.cut +
      '   |   ' +
      this.InventoryObj.polish +
      '   |   ' +
      this.InventoryObj.symmetry +
      '   |   ' +
      this.InventoryObj.fluorescence +
      '   |   ' +
      this.InventoryObj.lab;
  }
  //#endregion

  //#region Function
  public onMultiSelectChange(
    val: Array<{ name: string; isChecked: boolean }>,
    selectedData: string[]
  ): void {
    val.forEach((element) => {
      element.isChecked = false;
    });

    if (selectedData && selectedData.length > 0) {
      val.forEach((element) => {
        selectedData.forEach((item) => {
          if (element.name.toLocaleLowerCase() == item.toLocaleLowerCase())
            element.isChecked = true;
        });
      });
    }
  }

  public getCommaSapratedString(vals: any[], isAll: boolean = false): string {
    let name = vals.join(',');
    if (!isAll) if (name.length > 15) name = name.substring(0, 15) + '...';

    return name;
  }

  public onOpenDropdown(
    list: Array<{ name: string; isChecked: boolean }>,
    e: boolean,
    selectedData: string[]
  ): boolean {
    if (selectedData?.length == list.map((z) => z.name).length) e = true;
    else e = false;
    return e;
  }

  public handleFilter(e: any): string {
    return e;
  }

  public filterKapanDropdownSearch(
    allData: string[],
    e: any,
    selectedData: string[]
  ): Array<{ name: string; isChecked: boolean }> {
    let filterData: any[] = [];
    allData.forEach((z) => {
      filterData.push({ name: z, isChecked: false });
    });
    filterData.forEach((z) => {
      if (selectedData?.includes(z.name)) z.isChecked = true;
    });
    if (e?.length > 0)
      return filterData.filter((z) =>
        z.name?.toLowerCase().includes(e?.toLowerCase())
      );
    else return filterData;
  }

  public checkAllListItems(
    list: Array<{ name: string; isChecked: boolean }>,
    e: boolean,
    selectedData: string[]
  ): string[] {
    if (e) {
      selectedData = [];
      selectedData = list.map((z) => z.name);
      list.forEach((element) => {
        element.isChecked = true;
      });
    } else {
      selectedData = [];
      list.forEach((element) => {
        element.isChecked = false;
      });
    }
    return selectedData;
  }

  public filterDropdownSearch(
    allData: MasterDNorm[],
    e: any,
    selectedData: string[]
  ): Array<{ name: string; isChecked: boolean }> {
    let filterData: any[] = [];
    allData.forEach((z) => {
      filterData.push({ name: z.name, isChecked: false });
    });
    filterData.forEach((z) => {
      if (selectedData?.includes(z.name)) z.isChecked = true;
    });
    if (e?.length > 0)
      return filterData.filter((z) =>
        z.name?.toLowerCase().includes(e?.toLowerCase())
      );
    else return filterData;
  }

  public assignAdditionalData(): void {
    let weightRanges = new Array<WeightRange>();

    if (this.firstCaratFrom && this.firstCaratTo) {
      let weight = new WeightRange();
      weight.minWeight = Number(this.firstCaratFrom);
      weight.maxWeight = Number(this.firstCaratTo);
      weightRanges.push(weight);
    }

    this.inventorySearchCriteriaObj.weightRanges = weightRanges;
    this.inventorySearchCriteriaObj.stoneIds = this.stoneId ? this.utilityService.CheckStoneIds(this.stoneId).map(x => x.toUpperCase()) : [];
    this.inventorySearchCriteriaObj.certificateNos = this.certificateNo ? this.utilityService.checkCertificateIds(this.certificateNo) : [];

    let fData = this.inventorySearchCriteriaObj.fromDate;
    this.inventorySearchCriteriaObj.fromDate = fData ? this.utilityService.setUTCDateFilter(fData) : null;

    let tData = this.inventorySearchCriteriaObj.toDate;
    this.inventorySearchCriteriaObj.toDate = tData ? this.utilityService.setUTCDateFilter(tData) : null;
  }

  public async updateMediaStatus() {
    try {
      if (this.selectedStone.length == 0 && this.mySelection.length > 0) {
        this.mySelection.forEach(stId => {
          if (this.inventoryItems.some(c => c.stoneId == stId)) {
            let fData = this.inventoryItems.find(c => c.stoneId == stId);
            if (fData)
              this.selectedStone.push({ stoneId: fData.stoneId, certificateNo: fData.certificateNo });
          }
        });
      }

      if (this.selectedStone.length > 0) {
        this.spinnerService.show();
        let mediaStatus: MediaStatus[] = new Array<MediaStatus>();
        mediaStatus = await this.commuteService.updateMediaStatus(this.selectedStone);

        if (mediaStatus && mediaStatus.length > 0) {
          await this.commuteService.updateMediaStatusInInventory(mediaStatus);
          this.utilityService.showNotification(`Media Sync Successfully!`);
        }
        this.spinnerService.hide();
        this.selectedStone = new Array<MediaInput>();
      }
    }
    catch (error: any) {
      this.alertDialogService.show(error);
      this.spinnerService.hide();
    }
  }

  public async selectAllInventories(event: string) {
    this.selectedInventoryItems = [];
    this.mySelection = [];
    this.selectAllFlag = false;
    this.selectedStone = new Array<MediaInput>();
    if (event.toLowerCase() == 'checked') {
      if (this.invResponse.totalCount > this.pageSize) {
        await this.loadAllInventories();
        this.selectAllFlag = true;
      }
      else {
        this.mySelection = this.inventoryItems.map(z => z.stoneId);

        for (let i = 0; i < this.inventoryItems.length; i++) {
          this.selectedStone.push({ stoneId: this.inventoryItems[i].stoneId, certificateNo: this.inventoryItems[i].certificateNo });
        }
      }
    }
  }

  public async loadAllInventories() {
    try {
      this.allInventoryItems = await this.inventoryService.getInventoryItemsForSelectAll(this.inventorySearchCriteriaObj);
      if (this.allInventoryItems && this.allInventoryItems.length > 0) {
        this.mySelection = this.allInventoryItems.map(z => z.stoneId);

        for (let i = 0; i < this.allInventoryItems.length; i++) {
          this.selectedStone.push({ stoneId: this.allInventoryItems[i].stoneId, certificateNo: this.allInventoryItems[i].certificateNo });
        }
      }

      this.changeDetRef.detectChanges();

      //Get All Data For Memo Issue and Othe Functions
      this.selectedStoneIds = this.allInventoryItems.filter(z => this.mySelection.includes(z.id)).map(z => z.stoneId);
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  //#endregion
}

import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { PageChangeEvent } from '@progress/kendo-angular-grid';
import { DataResult, GroupDescriptor, process } from '@progress/kendo-data-query';
import { GridDetailConfig } from 'shared/businessobjects';
import { fxCredential, GridConfig, GridMasterConfig, InclusionConfig, MasterDNorm, MeasurementConfig } from 'shared/enitites';
import { ConfigService, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { NgxSpinnerService } from 'ngx-spinner';
import { GridPropertiesService, InventoryService, MasterConfigService, PendingPricingService, PricingRequestService, UserPricingCriteriaService } from '../../services';
import { InventoryItems, PricingHistory, UserPricingCriteria } from '../../entities';
import { environment } from 'environments/environment.prod';
import { InventorySearchCriteria } from '../../businessobjects';
import { PendingPricing } from '../../entities/pricing/pendingpricing';

@Component({
  selector: 'app-pendingpricing',
  templateUrl: './pendingpricing.component.html',
  styleUrls: ['./pendingpricing.component.css']
})
export class PendingPricingComponent implements OnInit {
  //#region Grid Init
  public groups: GroupDescriptor[] = [];
  public pageSize = 25;
  public skip = 0;
  public fields!: GridDetailConfig[];
  public gridView?: DataResult;
  //#endregion

  //#region Grid Config
  public isGridConfig: boolean = false;
  private fxCredentials!: fxCredential;
  public gridConfig!: GridConfig;
  public gridMasterConfigResponse!: GridMasterConfig;
  //#endregion

  //#region Media Data
  public mediaTitle!: string;
  public mediaSrc!: string;
  public mediaType!: string;
  public isShowMedia: boolean = false;
  //#endregion

  //#region List & Objects
  public listPricingHistory: PricingHistory[] = [];
  public inventoryItems: InventoryItems[] = [];

  public inclusionData: MasterDNorm[] = [];
  public measurementData: MasterDNorm[] = [];
  public inclusionConfig: InclusionConfig = new InclusionConfig();
  public measurementConfig: MeasurementConfig = new MeasurementConfig();

  public selectedBranchDNormItems: { text: string | null, value: string | null } = { text: 'Pricing', value: 'Pricing' };
  public inventorySearchCriteriaObj: InventorySearchCriteria = new InventorySearchCriteria();
  public employeeCriteriaData: UserPricingCriteria[] = [];

  public isSlotFilter: boolean = false;
  //#endregion

  //#region Summary
  public totalCount: number = 0;
  public totalWeight: number = 0;
  public avgDiscount: number = 0;
  public isSummary: boolean = false;
  public csvFile: any[] = [];
  //#endregion

  constructor(private pricingRequestService: PricingRequestService,
    private inventoryService: InventoryService,
    private sanitizer: DomSanitizer,
    public utilityService: UtilityService,
    private spinnerService: NgxSpinnerService,
    private gridPropertiesService: GridPropertiesService,
    private alertDialogService: AlertdialogService,
    private configService: ConfigService,
    private masterConfigService: MasterConfigService,
    private employeeCriteriaService: UserPricingCriteriaService,
    private pendingPricingService: PendingPricingService) { }

  async ngOnInit() {
    this.fxCredentials = JSON.parse(sessionStorage.getItem("fxCredentials") ?? '') as fxCredential;
    this.spinnerService.show();
    await this.getGridConfiguration();
    await this.getMasterConfigData();
    await this.getUserPricingCriteriaData(this.fxCredentials.id);
    await this.getPendingPricing();
  }

  //#region Init Data
  public async getGridConfiguration() {
    try {
      this.gridConfig = await this.configService.getGridConfig(this.fxCredentials?.id ?? '', "PendingPrice", "PendingPriceGrid", this.gridPropertiesService.getPendingPriceGrid());
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
        this.gridMasterConfigResponse = await this.configService.getMasterGridConfig("PendingPrice", "PendingPriceGrid");
        if (this.gridMasterConfigResponse)
          this.fields = this.gridMasterConfigResponse.gridDetail;
        else
          this.fields = await this.gridPropertiesService.getPendingPriceGrid();
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error);
    }
  }

  public async getMasterConfigData() {
    //Master Config
    let masterConfigList = await this.masterConfigService.getAllMasterConfig();

    this.inclusionData = masterConfigList.inclusions;
    this.measurementData = masterConfigList.measurements;

    this.inclusionConfig = masterConfigList.inclusionConfig;
    this.measurementConfig = masterConfigList.measurementConfig;
  }

  public async getPendingPricing() {
    try {
      this.spinnerService.show();
      let res = await this.pendingPricingService.getPendingPricingData(this.inventorySearchCriteriaObj, this.skip, this.pageSize);
      if (res) {
        this.gridView = process(res.pendingPricings, { group: this.groups });
        this.gridView.total = res.totalCount;

        this.totalCount = res.totalCount;
        this.totalWeight = res.totalWeight;
        this.avgDiscount = res.avgDiscount;

        this.closeSlotFilterDialog();
        this.spinnerService.hide();
      } else
        this.spinnerService.hide();
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Something went wrong on get pending price data, Try gain later.');
    }
  }

  public async onFilterChange(e: any) {
    this.spinnerService.show();
    this.inventorySearchCriteriaObj = e.invFilter;
    this.skip = 0;
    await this.getPendingPricing();
  }

  //#endregion
  public async exportToCSV() {
    this.spinnerService.show();
    var allpendingpriceing = await this.pendingPricingService.getPendingPricingData(this.inventorySearchCriteriaObj, 0, this.totalCount)
    this.genrateCSVData(allpendingpriceing.pendingPricings);
    if (this.csvFile.length > 0)
      this.utilityService.exportAsCsvFile(this.csvFile, "PendingPrice_csv", true)
    this.spinnerService.hide();
  }

  public genrateCSVData(data: PendingPricing[]) {
    this.csvFile = [];
    this.csvFile.push({
      'StoneId': 'StoneId',
      'Shape': 'Shape',
      'Weight': 'Weight',
      'Color': 'Color',
      'Clearity': 'Clearity',
      'Cut': 'Cut',
      'Polish': 'Polish',
      'Symmetry': 'Symmetry',
      'Flourescence': 'Flourescence',
      'Rap': 'Rap',
      'Main Disc': 'Main Disc',
      'Tmain Disc': 'T. Main Disc',
      'Disc Diff': 'Disc Diff',
      'Lab': 'Lab',
      'CDate': 'Created At',
      'UpDate': 'Updated At',
    });
    data.forEach(z => {
      var excel = {
        'StoneId': z.stoneId,
        'Shape': z.shape,
        'Weight': z.weight,
        'Color': z.color,
        'Clearity': z.clarity,
        'Cut': z.cut,
        'Polish': z.polish,
        'Symmetry': z.symmetry,
        'Flourescence': z.fluorescence,
        'Rap': z.price.rap,
        'Main Disc': z.price.discount,
        'Tmain Disc': z.tempPrice.discount,
        'Disc Diff': this.utilityService.ConvertToFloatWithDecimal((z.tempPrice.discount ?? 0) - (z.price.discount ?? 0)),
        'Lab': z.lab,
        'CDate': new Date(z.createdDate).toISOString().slice(0, 10),
        'UpDate': new Date(z.updatedAt).toISOString().slice(0, 10)
      }
      this.csvFile.push(excel);
    });
  }

  public async getUserPricingCriteriaData(id: string) {
    try {
      this.employeeCriteriaData = await this.employeeCriteriaService.getUserPricingCriteriaBySystemUser(id);
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }
  //#endregion

  //#region On Change Functions
  public openSlotFilterDialog(): void {
    this.isSlotFilter = true;
  }

  public closeSlotFilterDialog(): void {
    this.isSlotFilter = false;
  }

  public sanitizeURL(url: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  public openSummary(): void {
    this.isSummary = true;
  }

  public closeSummary(): void {
    this.isSummary = false;
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

  public groupChange(groups: GroupDescriptor[]): void {
    try {
      this.groups = groups;
      this.getPendingPricing();
    }
    catch (error: any) {
      this.alertDialogService.show(error.error);
    }
  }

  public pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.getPendingPricing();
  }

  public openMediaDialog(title: string, stoneId: string, type: string): void {
    if (stoneId) {
      this.mediaTitle = title;

      if (type == "iframe")
        this.mediaSrc = environment.videoURL.replace('{stoneId}', stoneId.toLowerCase());
      else if (type == "img")
        this.mediaSrc = environment.imageURL.replace('{stoneId}', stoneId.toLowerCase());
      else if (type == "cert")
        this.mediaSrc = environment.certiURL.replace('{certiNo}', stoneId);
      else
        this.mediaSrc = stoneId;

      this.mediaType = type;
      this.isShowMedia = true;
    }
  }

  public closeMediaDialog(e: boolean): void {
    this.isShowMedia = e;
  }

  public async expandPricingHistory(e: any) {
    let pricingHistory = await this.pricingRequestService.getPricingHistory(e.dataItem.stoneId);
    if (pricingHistory) {
      pricingHistory.forEach(z => {
        this.listPricingHistory.push(z);
      });
    }

    let invItems = await this.pricingRequestService.getInventoryByStoneId(e.dataItem.stoneId);
    if (invItems) {
      this.inventoryItems.push(invItems);
    }
  }

  public clearPricingHistory(e: any) {
    this.listPricingHistory = this.listPricingHistory.filter(z => z.stoneId != e.dataItem.stoneId);
    this.inventoryItems = this.inventoryItems.filter(z => z.stoneId != e.dataItem.stoneId);
  }

  public getlistPricingHistory(stoneId: string): PricingHistory[] {
    return this.listPricingHistory.filter(z => z.stoneId == stoneId);
  }

  public getInventoryItems(stoneId: string): InventoryItems[] {
    return this.inventoryItems.filter(z => z.stoneId == stoneId) ?? new InventoryItems();
  }

  public calculateDateDiff(date: Date): string {
    let today = new Date();
    let calDate = new Date(date);

    var diff = Math.abs(today.getTime() - calDate.getTime());
    var diffDays = Math.ceil(diff / (1000 * 3600 * 24));

    if (today.getMonth() == calDate.getMonth() && today.getFullYear() == calDate.getFullYear())
      diffDays = today.getDate() - calDate.getDate();

    return diffDays.toString() + ' days ago';
  }
  //#endregion

  public setupURL(stoneId: string, type: string) {
    if (stoneId) {
      if (type == "image")
        return environment.imageURL.replace('{stoneId}', stoneId.toLowerCase());
      else if (type == "video")
        return environment.videoURL.replace('{stoneId}', stoneId.toLowerCase());
      else if (type == "certificate")
        return environment.certiURL.replace('{certiNo}', stoneId);
      else
        return "";
    }
    else
      return "";
  }
}
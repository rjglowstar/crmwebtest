import { ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { PageChangeEvent, RowClassArgs, SelectableSettings } from '@progress/kendo-angular-grid';
import { DataResult, GroupDescriptor, process, SortDescriptor } from '@progress/kendo-data-query';
import { environment } from 'environments/environment.prod';
import { NgxSpinnerService } from 'ngx-spinner';
import { keys } from 'shared/auth';
import { GridDetailConfig, MfgInclusionData, MfgMeasurementData, MfgPricingRequest, PricingMarketSheetRequest, PricingMarketSheetResponse } from 'shared/businessobjects';
import { FancyCutDetailDNorm, fxCredential, GridConfig, GridMasterConfig, InclusionConfig, MasterDNorm, MeasurementConfig, Notifications, SystemUserPermission } from 'shared/enitites';
import { ApplyPriceRequestTemplate, ConfigService, InvHistoryAction, listColorMarkItems, listPriceRequestFilterTypeItems, NotificationService, PricingService, StoneStatus, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { InventorySearchCriteria, InventorySummary, PriceAnalyticsRequest, PriceAnalyticsSalesResponse, PriceReqResponse, PriceRequestApiModel, TempPricingRequest, TempPriceData } from '../../businessobjects';
import { InvHistory, InventoryItems, PricingHistory, PricingRequest, SpecialStoneCriteria, Supplier, SystemUser, UserPricingCriteria } from '../../entities';
import { CommuteService, GridPropertiesService, InvHistoryService, InventoryService, MasterConfigService, PricingRequestService, SpecialstonecriteriaService, SupplierService, SystemUserService, UserPricingCriteriaService } from '../../services';
import { FancyCutItem } from '../../businessobjects/commute/fancycutitem';
import { SortFieldDescriptor } from 'projects/CRM.BackOffice/src/app/businessobjects';

@Component({
  selector: 'app-inventoryPriceV2',
  templateUrl: './inventoryPriceV2.component.html',
  styleUrls: ['./inventoryPriceV2.component.css']
})
export class InvetoryPriceV2Component implements OnInit {
  //#region Grid Init
  public groups: GroupDescriptor[] = [];
  public pageSize = 25;
  public skip = 0;
  public fields!: GridDetailConfig[];
  public subFields!: GridDetailConfig[];
  public gridView?: DataResult;
  public isRegEmployee: boolean = false;
  public filterFlag = true;
  public selectableSettings: SelectableSettings = { mode: 'multiple' };
  public skeletonArray = new Array(18);
  public mySelection: string[] = [];
  public isShowCheckBoxAll: boolean = true;
  public stoneIdsSearchTxt: string[] = Array<string>();
  public gridViewTemp!: DataResult;
  public sort: SortDescriptor[] = [];
  //#endregion

  //#region Grid Config
  public isGridConfig: boolean = false;
  public isOpenUpdateCutModal: boolean = false;
  private fxCredentials!: fxCredential;
  public gridConfig!: GridConfig;
  public gridMasterConfigResponse!: GridMasterConfig;
  //#endregion

  //#region OnChange
  public isShowMedia: boolean = false;
  public showBulk = false;
  public isSlotFilter: boolean = false;
  public showSlotFilter: boolean = true;

  public isAllSelected: boolean = false;
  public isAnalytics: boolean = false;
  public isCanUpdateInvCut: boolean = false;

  @ViewChild("anchor") public anchor!: ElementRef;
  @ViewChild("popup", { read: ElementRef }) public popup!: ElementRef;

  public iscolorMark: boolean = false;
  public isSummary: boolean = false;
  public showExcelOption = false;

  @ViewChild("anchorExcel") public anchorExcel!: ElementRef;
  @ViewChild("popupExcel", { read: ElementRef }) public popupExcel!: ElementRef;
  //#endregion

  //#region Media Data
  public mediaTitle!: string;
  public mediaSrc!: string;
  public mediaType!: string;
  //#endregion

  //#region List & Objects
  public filterReq: PriceRequestApiModel = new PriceRequestApiModel();
  public allPricingRequests: PricingRequest[] = [];
  public listTempPriceData: TempPriceData[] = [];
  public listPricingRequests: PricingRequest[] = [];
  public priceReqResponse: PriceReqResponse = new PriceReqResponse();
  public selectedPricingRequests: PricingRequest[] = [];
  public userPricingCriteriaData: UserPricingCriteria[] = [];
  public selectedSlots: UserPricingCriteria[] = [];
  public listPriceRequestFilterTypeItems = listPriceRequestFilterTypeItems;
  public selectedBranchDNormItems: { text: string | null, value: string | null } = { text: null, value: null };
  public listPricingHistory: PricingHistory[] = [];
  public inventorySearchCriteriaObj: InventorySearchCriteria = new InventorySearchCriteria();
  public inventoryItems: InventoryItems[] = [];
  public searchedStones: InventoryItems[] = [];
  public gridCutUpdateInventory!: InventoryItems[];
  public filterOrAddText!: string;
  public allTheFancy!: FancyCutDetailDNorm[];

  public inclusionData: MasterDNorm[] = [];
  public measurementData: MasterDNorm[] = [];
  public inclusionConfig: InclusionConfig = new InclusionConfig();
  public measurementConfig: MeasurementConfig = new MeasurementConfig();

  public listColorMarkItems = listColorMarkItems;
  public selectedColorMark: string = '';
  public summaryData: InventorySummary = new InventorySummary();
  public excelOption!: string | null;
  public excelFile: any[] = [];
  public specialStoneCriteriaData: SpecialStoneCriteria[] = [];
  public suppliers: Supplier[] = [];
  public pendingPricingRequest: PricingRequest[] = [];
  public systemUserObj: SystemUser = new SystemUser();

  public applyPriceData: { total: number, valid: number, success: number, fail: number, pending: number } = { total: 0, valid: 0, success: 0, fail: 0, pending: 0 };
  public applyPriceErrorData: { stonId: string, msg: string, code: number }[] = [];

  public salesData: PriceAnalyticsSalesResponse[] = [];

  public selectedPriceReq: PricingRequest = new PricingRequest();
  public priceAnalyticsRequest: PriceAnalyticsRequest = new PriceAnalyticsRequest();
  public isHighlightedData: PricingRequest[] = [];

  public isSummaryLoading = false;
  public showTempData: boolean = false;
  public colorMarkClass = '';
  //#endregion

  public bulkDisc: number | null = null
  // public priceChangableStonesStatus: string[] = ['stock', 'stockonhand', 'noncertified']

  constructor(private pricingRequestService: PricingRequestService,
    private inventoryService: InventoryService,
    private systemUserService: SystemUserService,
    private formBuilder: UntypedFormBuilder,
    public utilityService: UtilityService,
    private spinnerService: NgxSpinnerService,
    private configService: ConfigService,
    private gridPropertiesService: GridPropertiesService,
    private alertDialogService: AlertdialogService,
    private sanitizer: DomSanitizer,
    private userPricingCriteriaService: UserPricingCriteriaService,
    private notificationService: NotificationService,
    private pricingService: PricingService,
    private changeDetRef: ChangeDetectorRef,
    private masterConfigService: MasterConfigService,
    private specialstonecriteriaService: SpecialstonecriteriaService,
    private supplierService: SupplierService,
    private invHistoryService: InvHistoryService,
    private commuteService: CommuteService) {
  }

  public async ngOnInit() {
    await this.defaultMethodsLoad();
  }

  //#region Init Data
  public async defaultMethodsLoad() {
    this.fxCredentials = JSON.parse(sessionStorage.getItem("fxCredentials") ?? '') as fxCredential;
    this.spinnerService.show();
    await this.setUserRights();
    await this.getGridConfiguration();
    await this.getSpecialStoneCriteriaData();
    await this.getMasterConfigData();
    await this.getSupplierDetail();
    await this.getSystemUser();
    await this.getUserPricingCriteriaData(this.fxCredentials.id);
    this.openSlotFilterDialog();
    this.spinnerService.hide();
  }

  public async getGridConfiguration() {
    try {
      this.gridConfig = await this.configService.getGridConfig(this.fxCredentials?.id ?? '', "InventoryPrice", "InventoryPriceGrid", this.gridPropertiesService.getInventoryPriceGrid());
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
        this.gridMasterConfigResponse = await this.configService.getMasterGridConfig("InventoryPrice", "InventoryPriceGrid");
        if (this.gridMasterConfigResponse)
          this.fields = this.gridMasterConfigResponse.gridDetail;
        else
          this.fields = await this.gridPropertiesService.getInventoryPriceGrid();
      }
    }
    catch (error: any) {
      this.alertDialogService.show(error);
      this.spinnerService.hide();
    }
  }

  public async getSystemUser() {
    try {
      this.systemUserObj = await this.systemUserService.getSystemUserById(this.fxCredentials.id);
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async setUserRights() {
    let userPermissions: SystemUserPermission = new SystemUserPermission();
    let sesValue = sessionStorage.getItem("userPermission");
    if (sesValue)
      userPermissions = JSON.parse(sesValue) as SystemUserPermission;
    if (userPermissions.actions.length > 0) {
      let CanUpdateCut = userPermissions.actions.find(z => z.name == "CanUpdateInventoryCut");
      if (CanUpdateCut != null)
        this.isCanUpdateInvCut = true;
    }
  }

  public async getMasterConfigData() {
    //Master Config
    let masterConfigList = await this.masterConfigService.getAllMasterConfig();

    this.inclusionData = masterConfigList.inclusions;
    this.measurementData = masterConfigList.measurements;
    this.allTheFancy = masterConfigList.fancyCutDetails;
    this.inclusionConfig = masterConfigList.inclusionConfig;
    this.measurementConfig = masterConfigList.measurementConfig;
  }

  public async getSpecialStoneCriteriaData() {
    try {
      this.specialStoneCriteriaData = await this.specialstonecriteriaService.getAllSpecialStoneCriteria();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async getUserPricingCriteriaData(id: string) {
    try {
      this.userPricingCriteriaData = await this.userPricingCriteriaService.getUserInvPricingCriteriaBySystemUser(id);

      //By Default inv - all slot selected
      this.selectedBranchDNormItems.value = 'Inv';
      this.selectedSlots = this.userPricingCriteriaData;
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async getSummaryData() {
    try {
      this.isSummaryLoading = true;
      let req: PriceRequestApiModel = this.filterReq;
      req.systemUserId = this.fxCredentials.id;

      this.summaryData = await this.pricingRequestService.getSummary(req);
      // this.mySelection = [];
      this.isSummaryLoading = false;
      // this.gridView = process(this.listPricingRequests, { group: this.groups });
      // this.gridView.total = this.summaryData.totalCount;

    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async getPriceRequestData() {
    try {
      this.spinnerService.show();

      let req: PriceRequestApiModel = this.filterReq;
      req.systemUserId = this.fxCredentials.id;
      req.skip = this.skip;
      req.take = this.pageSize;

      let res = await this.pricingRequestService.getPricingInvRequest(req);
      if (res) {
        this.priceReqResponse = res;
        this.listPricingRequests = res.priceRequest;

        if (this.filterReq.invFilter?.showSpecialStone) {
          this.isHighlightedData = res.priceRequest.map((item) => {
            item.isHighLight = true;
            return item;
          });
        } else {
          this.isHighlightedData = this.getHighlightedInvPriceData(res.priceRequest);
        }

        this.listPricingRequests.forEach(z => {
          z.days = this.utilityService.calculateDayDiff(z.marketSheetDate ?? new Date());
          let allIndex = this.allPricingRequests.findIndex(a => a.stoneId == z.stoneId);
          if (allIndex == -1)
            this.allPricingRequests.push(JSON.parse(JSON.stringify(z)));
        });
        this.gridView = process(res.priceRequest, { group: this.groups, sort: this.sort });
        this.gridView.total = res.total;

        this.spinnerService.hide();
        this.closeSlotFilterDialog();
      } else {
        this.spinnerService.hide();
        this.alertDialogService.show('Pricing data not fetch, Try again later!');
        this.closeSlotFilterDialog();
      }
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Something went wrong, Try again later!');
    }
  }
  public sortChange(sort: SortDescriptor[]): void {
    this.sort = sort;
    this.filterReq.invFilter.sortFieldDescriptors = new Array<SortFieldDescriptor>();

    if (this.sort && this.sort.length > 0) {
      let properties = this.gridPropertiesService.getInventoryPriceGrid();
      for (let index = 0; index < this.sort.length; index++) {
        let sortFieldDescriptor = new SortFieldDescriptor();
        const element = this.sort[index];
        sortFieldDescriptor.dir = element.dir;
        sortFieldDescriptor.field = properties.find(x => x.propertyName == element.field)?.sortFieldName ?? "";
        this.filterReq.invFilter.sortFieldDescriptors.push(sortFieldDescriptor);
      }
    }

    this.getPriceRequestData();
  }

  public getHighlightedInvPriceData(priceRequest: PricingRequest[]) {
    let specialStoneCriteria = JSON.parse(sessionStorage.getItem("SpecialStoneCriteria")!) as SpecialStoneCriteria[];
    priceRequest.forEach(pricingRequest => {
      const isMatch = specialStoneCriteria.some(criteria => {
        const match =
          (pricingRequest.availableDays >= (criteria.fromADays ?? 0) && pricingRequest.availableDays <= (criteria.toADays ?? 0)) &&
          (pricingRequest.weight >= criteria.minWeight && pricingRequest.weight <= criteria.maxWeight) &&
          (criteria.shape.length <= 0 || criteria.shape.includes(pricingRequest.shape)) &&
          (criteria.color.length <= 0 || criteria.color.includes(pricingRequest.color)) &&
          (criteria.clarity.length <= 0 || criteria.clarity.includes(pricingRequest.clarity)) &&
          (criteria.fluorescence.length <= 0 || criteria.fluorescence.includes(pricingRequest.fluorescence)) &&
          (criteria.cut.length <= 0 || criteria.cut.includes(pricingRequest.cut)) &&
          (criteria.polish.length <= 0 || criteria.polish.includes(pricingRequest.polish)) &&
          (criteria.symmetry.length <= 0 || criteria.symmetry.includes(pricingRequest.symmetry)) &&
          (criteria.lab.length <= 0 || criteria.lab == null || criteria.lab.includes(pricingRequest.lab)) &&
          (criteria.inclusion.brown.length <= 0 || criteria.inclusion.brown.includes(pricingRequest.inclusion.brown)) &&
          (criteria.inclusion.green.length <= 0 || criteria.inclusion.green.includes(pricingRequest.inclusion.green)) &&
          (criteria.inclusion.milky.length <= 0 || criteria.inclusion.milky.includes(pricingRequest.inclusion.milky)) &&
          (criteria.inclusion.shade.length <= 0 || criteria.inclusion.shade.includes(pricingRequest.inclusion.shade)) &&
          (criteria.inclusion.centerBlack.length <= 0 || criteria.inclusion.centerBlack.includes(pricingRequest.inclusion.centerBlack)) &&
          (criteria.inclusion.sideBlack.length <= 0 || criteria.inclusion.sideBlack.includes(pricingRequest.inclusion.sideBlack)) &&
          (criteria.inclusion.openTable.length <= 0 || criteria.inclusion.openTable.includes(pricingRequest.inclusion.openTable)) &&
          (criteria.inclusion.openGirdle.length <= 0 || criteria.inclusion.openGirdle.includes(pricingRequest.inclusion.openGirdle)) &&
          (criteria.inclusion.openCrown.length <= 0 || criteria.inclusion.openCrown.includes(pricingRequest.inclusion.openCrown)) &&
          (criteria.inclusion.openPavilion.length <= 0 || criteria.inclusion.openPavilion.includes(pricingRequest.inclusion.openPavilion)) &&
          (criteria.inclusion.naturalOnCrown.length <= 0 || criteria.inclusion.naturalOnCrown.includes(pricingRequest.inclusion.naturalOnCrown)) &&
          (criteria.inclusion.naturalOnGirdle.length <= 0 || criteria.inclusion.naturalOnGirdle.includes(pricingRequest.inclusion.naturalOnGirdle)) &&
          (criteria.inclusion.eyeClean.length <= 0 || criteria.inclusion.eyeClean.includes(pricingRequest.inclusion.eyeClean)) &&
          (criteria.inclusion.efoc.length <= 0 || criteria.inclusion.efoc.includes(pricingRequest.inclusion.efoc)) &&
          (criteria.inclusion.efop.length <= 0 || criteria.inclusion.efop.includes(pricingRequest.inclusion.efop)) &&
          (criteria.inclusion.bowtie.length <= 0 || criteria.inclusion.bowtie.includes(pricingRequest.inclusion.bowtie)) &&
          (criteria.inclusion.hna.length <= 0 || criteria.inclusion.hna.includes(pricingRequest.inclusion.hna)) &&
          (criteria.inclusion.girdleCondition.length <= 0 || criteria.inclusion.girdleCondition.some(condition => condition.toLowerCase() === pricingRequest.inclusion.girdleCondition.toLowerCase())) &&
          (criteria.inclusion.naturalOnPavillion.length <= 0 || criteria.inclusion.naturalOnPavillion.includes(pricingRequest.inclusion.naturalOnPavillion)) &&
          ((criteria.fromLimit == null && criteria.toLimit == null) || ((pricingRequest.price.discount ?? 0) >= (criteria.fromLimit ?? 0) && (pricingRequest.price.discount ?? 0) <= (criteria.toLimit ?? 0))) &&
          ((criteria.measurement.fromLength == null && criteria.measurement.toLength == null) || (pricingRequest.measurement.length >= (criteria.measurement.fromLength ?? 0) && pricingRequest.measurement.length <= (criteria.measurement.toLength ?? 0))) &&
          ((criteria.measurement.fromWidth == null && criteria.measurement.toWidth == null) || (pricingRequest.measurement.width >= (criteria.measurement.fromWidth ?? 0) && pricingRequest.measurement.width <= (criteria.measurement.toWidth ?? 0))) &&
          ((criteria.measurement.fromDepth == null && criteria.measurement.toDepth == null) || (pricingRequest.measurement.depth >= (criteria.measurement.fromDepth ?? 0) && pricingRequest.measurement.depth <= (criteria.measurement.toDepth ?? 0))) &&
          ((criteria.measurement.fromTable == null && criteria.measurement.toTable == null) || (pricingRequest.measurement.table >= (criteria.measurement.fromTable ?? 0) && pricingRequest.measurement.table <= (criteria.measurement.toTable ?? 0))) &&
          ((criteria.measurement.fromGirdlePer == null && criteria.measurement.toGirdlePer == null) || (pricingRequest.measurement.girdlePer >= (criteria.measurement.fromGirdlePer ?? 0) && pricingRequest.measurement.girdlePer <= (criteria.measurement.toGirdlePer ?? 0))) &&
          ((criteria.measurement.fromHeight == null && criteria.measurement.toHeight == null) || (pricingRequest.measurement.height >= (criteria.measurement.fromHeight ?? 0) && pricingRequest.measurement.height <= (criteria.measurement.toHeight ?? 0))) &&
          ((criteria.measurement.fromPavilionAngle == null && criteria.measurement.toPavilionAngle == null) || (pricingRequest.measurement.pavilionAngle >= (criteria.measurement.fromPavilionAngle ?? 0) && pricingRequest.measurement.pavilionAngle <= (criteria.measurement.toPavilionAngle ?? 0))) &&
          ((criteria.measurement.fromPavilionDepth == null && criteria.measurement.toPavilionDepth == null) || (pricingRequest.measurement.pavilionDepth >= (criteria.measurement.fromPavilionDepth ?? 0) && pricingRequest.measurement.pavilionDepth <= (criteria.measurement.toPavilionDepth ?? 0))) &&
          ((criteria.measurement.fromCrownAngle == null && criteria.measurement.toCrownAngle == null) || (pricingRequest.measurement.crownAngle >= (criteria.measurement.fromCrownAngle ?? 0) && pricingRequest.measurement.crownAngle <= (criteria.measurement.toCrownAngle ?? 0))) &&
          ((criteria.measurement.fromCrownHeight == null && criteria.measurement.toCrownHeight == null) || (pricingRequest.measurement.crownHeight >= (criteria.measurement.fromCrownHeight ?? 0) && pricingRequest.measurement.crownHeight <= (criteria.measurement.toCrownHeight ?? 0))) &&
          (pricingRequest.shape.toLocaleLowerCase() == "rbc" || ((criteria.measurement.fromRatio == null && criteria.measurement.toRatio == null) || (pricingRequest.measurement.ratio >= (criteria.measurement.fromRatio ?? 0) && pricingRequest.measurement.ratio <= (criteria.measurement.toRatio ?? 0))))

        return match;
      });
      if (isMatch) {
        pricingRequest.isHighLight = true;
      }
    });

    return priceRequest;
  }

  public async onFilterChange(e: any) {
    this.spinnerService.show();
    this.filterReq = e;
    this.skip = 0;
    this.inventorySearchCriteriaObj = this.filterReq.invFilter;
    this.selectedBranchDNormItems.value = this.filterReq.type;
    this.selectedSlots = this.userPricingCriteriaData.filter((res) => res.id === this.filterReq.selectedCriteriaId);
    await this.getPriceRequestData();
    this.getSummaryData();
  }

  public async ApplySpecialStoneCriteriaForDiscount(invData: PricingRequest[]): Promise<PricingRequest[]> {
    for (let index = 0; index < invData.length; index++) {
      let target = invData[index];
      var data = this.specialStoneCriteriaData.filter(z =>
        this.utilityService.filterFromToDecimalValues(target.weight, z.minWeight, z.maxWeight) &&
        this.utilityService.filterArrayString(target.shape, z.shape) &&
        this.utilityService.filterArrayString(target.lab, z.lab, true) &&
        this.utilityService.filterArrayString(target.color, z.color) &&
        this.utilityService.filterArrayString(target.clarity, z.clarity) &&
        this.utilityService.filterArrayString(target.cut, z.cut) &&
        this.utilityService.filterArrayString(target.polish, z.polish) &&
        this.utilityService.filterArrayString(target.symmetry, z.symmetry) &&
        this.utilityService.filterArrayString(target.fluorescence, z.fluorescence) &&
        this.utilityService.filterArrayString(target.inclusion.brown, z.inclusion.brown) &&
        this.utilityService.filterArrayString(target.inclusion.green, z.inclusion.green) &&
        this.utilityService.filterArrayString(target.inclusion.milky, z.inclusion.milky) &&
        this.utilityService.filterArrayString(target.inclusion.shade, z.inclusion.shade) &&
        this.utilityService.filterArrayString(target.inclusion.bowtie, z.inclusion.bowtie) &&
        this.utilityService.filterArrayString(target.inclusion.girdleCondition, z.inclusion.girdleCondition) &&
        this.utilityService.filterArrayString(target.inclusion.efop, z.inclusion.efop) &&
        this.utilityService.filterArrayString(target.inclusion.hna, z.inclusion.hna) &&
        this.utilityService.filterArrayString(target.inclusion.efoc, z.inclusion.efoc) &&
        this.utilityService.filterArrayString(target.inclusion.eyeClean, z.inclusion.eyeClean) &&
        this.utilityService.filterArrayString(target.inclusion.naturalOnGirdle, z.inclusion.naturalOnGirdle) &&
        this.utilityService.filterArrayString(target.inclusion.naturalOnPavillion, z.inclusion.naturalOnPavillion) &&
        this.utilityService.filterArrayString(target.inclusion.naturalOnCrown, z.inclusion.naturalOnCrown) &&
        this.utilityService.filterArrayString(target.inclusion.openGirdle, z.inclusion.openGirdle) &&
        this.utilityService.filterArrayString(target.inclusion.openCrown, z.inclusion.openCrown) &&
        this.utilityService.filterArrayString(target.inclusion.openTable, z.inclusion.openTable) &&
        this.utilityService.filterArrayString(target.inclusion.openPavilion, z.inclusion.openPavilion) &&
        this.utilityService.filterArrayString(target.inclusion.centerBlack, z.inclusion.centerBlack) &&
        this.utilityService.filterArrayString(target.inclusion.sideBlack, z.inclusion.sideBlack) &&
        this.utilityService.filterFromToNegativeDecimalValues(target.price.discount, z.fromLimit, z.toLimit) &&
        this.utilityService.filterFromToDecimalValues(target.measurement.length, z.measurement.fromLength, z.measurement.toLength) &&
        this.utilityService.filterFromToDecimalValues(target.measurement.width, z.measurement.fromWidth, z.measurement.toWidth) &&
        this.utilityService.filterFromToDecimalValues(target.measurement.depth, z.measurement.fromDepth, z.measurement.toDepth) &&
        this.utilityService.filterFromToDecimalValues(target.measurement.table, z.measurement.fromTable, z.measurement.toTable) &&
        this.utilityService.filterFromToDecimalValues(target.measurement.height, z.measurement.fromHeight, z.measurement.toHeight) &&
        this.utilityService.filterFromToDecimalValues(target.measurement.girdlePer, z.measurement.fromGirdlePer, z.measurement.toGirdlePer) &&
        this.utilityService.filterFromToDecimalValues(target.measurement.pavilionAngle, z.measurement.fromPavilionAngle, z.measurement.toPavilionAngle) &&
        this.utilityService.filterFromToDecimalValues(target.measurement.pavilionDepth, z.measurement.fromPavilionDepth, z.measurement.toPavilionDepth) &&
        this.utilityService.filterFromToDecimalValues(target.measurement.crownAngle, z.measurement.fromCrownAngle, z.measurement.toCrownAngle) &&
        this.utilityService.filterFromToDecimalValues(target.measurement.crownHeight, z.measurement.fromCrownHeight, z.measurement.toCrownHeight) &&

        this.utilityService.filterFromToDecimalValues(target.measurement.ratio, z.measurement.fromRatio, z.measurement.toRatio) &&
        this.utilityService.filterFromToDecimalValues(target.availableDays, z.fromADays, z.toADays));

      if (data != null && data.length > 0) {
        for (let index = 0; index < data.length; index++) {
          const z = data[index];
          if (z.discount != null) {
            target.tempPrice.discount = (parseFloat(target.tempPrice.discount?.toString() ?? '0') + parseFloat(z.discount?.toString() ?? '0'));
            target = await this.checkValidLimitation(target);
            if (target.isValid != null)
              target = this.calculateRapPricing(target);
          }
        }
      }

    }

    return invData;
  }

  public async getSupplierDetail() {
    try {
      this.suppliers = await this.supplierService.getAllSuppliers();
    }
    catch (error: any) {
      this.spinnerService.hide();
      console.error(error);
    }
  }
  //#endregion

  //#region Temp Price CRUD
  public async unlockStone() {
    var stones = this.allPricingRequests.filter(z => this.mySelection.includes(z.stoneId) && z.isLock == true);
    if (stones.length == 0) {
      this.alertDialogService.show(`No Lock Stone(s) found!`);
      return;
    }

    this.alertDialogService.ConfirmYesNo("Are you sure you want to unlock stone(s)?", "Unlock Stone")
      .subscribe(async (res: any) => {
        if (res.flag) {
          try {
            var stones = this.allPricingRequests.filter(z => this.mySelection.includes(z.stoneId) && z.isLock == true);
            if (stones.length > 0) {
              this.spinnerService.show();
              for (let index = 0; index < stones.length; index++) {
                let z = stones[index];

                //Fill this data to update in pricing history
                z.identity.id = this.fxCredentials.id;
                z.identity.name = this.fxCredentials.fullName;
                z.identity.type = "Pricing";
                z.createdBy = this.fxCredentials.id;
              }

              let result = await this.pricingRequestService.insertTempPricing(stones);
              if (result) {
                stones.forEach(z => {
                  //Update allPricingRequests for apply change
                  let allIndex = this.allPricingRequests.findIndex(a => a.stoneId == z.stoneId);
                  if (allIndex > -1)
                    this.allPricingRequests[allIndex].isLock = false;

                  let listIndex = this.listPricingRequests.findIndex(a => a.stoneId == z.stoneId);
                  if (listIndex > -1)
                    this.listPricingRequests[listIndex].isLock = false;

                });

                this.gridView = process(this.listPricingRequests, { group: this.groups });
                this.spinnerService.hide();
                this.utilityService.showNotification(`Data updated successfully!`);

              } else {
                this.spinnerService.hide();
                this.alertDialogService.show(`Data update fail, Try again later!`);
              }
            } else
              this.alertDialogService.show(`No Lock Stone(s) found!`);
          }
          catch (error: any) {
            console.error(error);
            this.alertDialogService.show(`Data insert fail, Try again later!`);
          }
        }
      });
  }

  public cellClickHandler(e: any) {
    if (!e.isEdited)
      e.sender.editCell(e.rowIndex, e.columnIndex, this.createFormGroup(e.dataItem));

  }



  public createFormGroup(dataItem: any): UntypedFormGroup {
    if (!dataItem.isLock) {
      return this.formBuilder.group({
        tempDisc: dataItem.tempPrice.discount,
        pricingComment: dataItem.pricingComment
      });
    }
    else
      return this.formBuilder.group({});
  }

  public async cellCloseHandler(args: any) {
    try {
      let { formGroup, dataItem } = args;
      if (formGroup.dirty) {
        dataItem.identity.id = this.fxCredentials.id;
        dataItem.identity.name = this.fxCredentials.fullName;
        dataItem.identity.type = "Pricing";
        dataItem.createdBy = this.fxCredentials.id;
        dataItem.pricingComment = formGroup.value.pricingComment;

        let result!: string;
        if (dataItem.tempPrice.discount != formGroup.value.tempDisc) {
          var validchange = this.CheckValidDiscountChanges(formGroup.value, dataItem);
          if (!validchange) {
            this.alertDialogService.show(`You can't change this discount on this status!`);
            return;
          }

          dataItem.tempPrice.discount = formGroup.value.tempDisc;
          dataItem = await this.checkValidLimitation(dataItem);
          if (dataItem.isValid != null)
            dataItem = this.calculateRapPricing(dataItem);

          result = await this.pricingRequestService.insertOneTempPricing(dataItem);
          if (result)
            this.insertInvItemHistoryList([dataItem.stoneId], InvHistoryAction.TempPriceChanged, `Updated the Temp Price from Inventory Price Page for Stone`);
        }
        else {
          result = await this.pricingRequestService.insertOneTempPricing(dataItem);
          if (result)
            this.insertInvItemHistoryList([dataItem.stoneId], InvHistoryAction.TempPriceChanged, `Updated the Temp Price from Inventory Price Page for Stone`);
        }

        if (result) {
          this.utilityService.showNotification(`Data updated successfully!`);

          //Update allPricingRequests for apply change
          let allIndex = this.allPricingRequests.findIndex(a => a.stoneId == dataItem.stoneId);
          if (allIndex == -1)
            this.allPricingRequests.push(JSON.parse(JSON.stringify(dataItem)));
          else {
            this.allPricingRequests[allIndex].tempBasePrice = JSON.parse(JSON.stringify(dataItem.tempBasePrice));
            this.allPricingRequests[allIndex].tempPrice = JSON.parse(JSON.stringify(dataItem.tempPrice));
            this.allPricingRequests[allIndex].isValid = dataItem.isValid;
          }
          this.mySelection = [];
        }
        else
          this.alertDialogService.show(`Data insert fail, Try again later!`);
      }
    }
    catch (error: any) {
      console.error(error);
      this.alertDialogService.show(`Data insert fail, Try again later!`);
    }
  }

  public mappingPricingRequestData(item: PricingRequest): MfgPricingRequest {
    let mesurement = new MfgMeasurementData();
    mesurement.TblDepth = item.measurement.depth;
    mesurement.TblAng = item.measurement.table;
    mesurement.Length = item.measurement.length;
    mesurement.Width = item.measurement.width;
    mesurement.Height = item.measurement.height;
    mesurement.CrHeight = item.measurement.crownHeight;
    mesurement.CrAngle = item.measurement.crownAngle;
    mesurement.PvlDepth = item.measurement.pavilionDepth;
    mesurement.PvlAngle = item.measurement.pavilionAngle;
    mesurement.StarLength = 0;
    mesurement.LowerHalf = 0;
    mesurement.GirdlePer = item.measurement.girdlePer;
    mesurement.MinGirdle = item.measurement.minGirdle;
    mesurement.MaxGirdle = item.measurement.maxGirdle;
    mesurement.Ratio = item.measurement.ratio;

    let incusion = new MfgInclusionData();
    if (item.inclusion) {
      incusion.Brown = item.inclusion.brown;
      incusion.Green = item.inclusion.green;
      incusion.Milky = item.inclusion.milky;
      incusion.Shade = item.inclusion.shade;
      incusion.SideBlack = item.inclusion.sideBlack;
      incusion.CenterBlack = item.inclusion.centerBlack;
      incusion.SideWhite = item.inclusion.sideWhite;
      incusion.CenterWhite = item.inclusion.centerWhite;
      incusion.OpenTable = item.inclusion.openTable;
      incusion.OpenCrown = item.inclusion.openCrown;
      incusion.OpenPavilion = item.inclusion.openPavilion;
      incusion.OpenGirdle = item.inclusion.openGirdle;
      incusion.GirdleCond = [item.inclusion.girdleCondition];
      incusion.EFOC = item.inclusion.efoc;
      incusion.EFOP = item.inclusion.efop;
      incusion.Culet = item.inclusion.culet;
      incusion.HNA = item.inclusion.hna;
      incusion.EyeClean = item.inclusion.eyeClean;
      incusion.KToS = item.inclusion.ktoS?.split(',') ?? [];
      incusion.NaturalOnGirdle = item.inclusion.naturalOnGirdle;
      incusion.NaturalOnCrown = item.inclusion.naturalOnCrown;
      incusion.NaturalOnPavillion = item.inclusion.naturalOnPavillion;
      incusion.FlColor = item.inclusion.flColor;
      incusion.Luster = item.inclusion.luster;
      incusion.BowTie = item.inclusion.bowtie;
      incusion.CertiComment = item.inclusion.certiComment;
    }

    let req: MfgPricingRequest = {
      Lab: (item.lab && item.lab.length > 0) ? item.lab.toUpperCase() : "GIA",
      Rapver: "NONE",
      Id: item.stoneId,
      Shape: item.shape?.toUpperCase(),
      Weight: item.weight,
      Color: (item.color?.toUpperCase() == "O" || item.color?.toUpperCase() == "P") ? "M" : item.color?.toUpperCase(),
      Clarity: item.clarity?.toUpperCase(),
      Cut: item.cut?.toUpperCase(),
      Polish: item.polish?.toUpperCase(),
      Symmetry: item.symmetry?.toUpperCase(),
      Flour: item.fluorescence?.toUpperCase(),
      InclusionPrice: incusion,
      MeasurePrice: mesurement,
      IGrade: item.inclusion.iGrade,
      MGrade: item.measurement.mGrade
    };

    return req;
  }

  public async checkNewRapForPriceRequest(item: PricingRequest[]): Promise<PricingRequest[]> {
    let reqList: PricingMarketSheetRequest[] = [];
    item.forEach(z => {
      reqList.push(this.mappingMarketSheetPricing(z));
    });

    let response = await this.pricingService.getMarketSheetPrice(reqList);
    if (response && response.length > 0) {
      item.forEach(z => {
        let target = response.find(a => a.id == z.stoneId);
        if (target && target.rapPrice != null && target.rapPrice > 0) {
          z.price.rap = target.rapPrice;
          z = this.calculateRapPricing(z);
        }
      });
    }
    return item;
  }

  public CheckValidDiscountChanges(values: any, invs: PricingRequest): boolean {
    let flag = true;
    if (invs.tempPrice.discount != values.tempDisc) {
      if (invs.status == StoneStatus.Arrival.toString())
        flag = false;
    }
    return flag;
  }

  public async updateBulkDiscountManual() {
    try {
      this.alertDialogService.ConfirmYesNo("Are you sure you want to bulk update discount?", "Update Main Discount")
        .subscribe(async (res: any) => {
          if (res.flag) {
            this.spinnerService.show();

            let listPricingRequests = this.allPricingRequests.filter(z => this.mySelection.includes(z.stoneId));
            for (let index = 0; index < listPricingRequests.length; index++) {
              let z = listPricingRequests[index];

              z.tempPrice.discount = (parseFloat(z.price.discount?.toString() ?? '0') + parseFloat(this.bulkDisc?.toString() ?? '0'));
              z = this.calculateRapPricing(z);

              //Fill this data to update in pricing history
              z.identity.id = this.fxCredentials.id;
              z.identity.name = this.fxCredentials.fullName;
              z.identity.type = "Pricing";
              z.createdBy = this.fxCredentials.id;
            }

            listPricingRequests = await this.checkValidLimitationBulk(listPricingRequests);
            listPricingRequests.forEach(z => {
              //Update allPricingRequests for apply change
              let allIndex = this.allPricingRequests.findIndex(a => a.stoneId == z.stoneId);
              if (allIndex == -1)
                this.allPricingRequests.push(JSON.parse(JSON.stringify(z)));
              else {
                this.allPricingRequests[allIndex].tempPrice = JSON.parse(JSON.stringify(z.tempPrice));
                this.allPricingRequests[allIndex].isValid = z.isValid;
              }
            });

            let result = await this.pricingRequestService.insertTempPricing(listPricingRequests);
            if (result) {
              this.spinnerService.hide();
              await this.getPriceRequestData();
              this.utilityService.showNotification(`Data updated successfully!`);
              this.getSummaryData();
            }
            else {
              this.spinnerService.hide();
              this.alertDialogService.show(`Data update fail, Try again later!`);
            }

            this.bulkDisc = null;
            this.showBulk = false;
          }
        });
    }
    catch (error) {
      console.error(error);
      this.bulkDisc = null;
      this.showBulk = false;
      this.alertDialogService.show(`Data update fail, Try again later!`);
    }
  }

  public updateBulkDiscountConfirm(type: string) {
    this.alertDialogService.ConfirmYesNo("Are you sure you want to bulk update " + type + " Discount?", "Update " + type + " Discount")
      .subscribe(async (res: any) => {
        if (res.flag) {
          await this.updateBulkDiscount(type);
        }
      });
  }

  public async updateBulkDiscount(type: string) {
    try {
      let listPricingRequests = this.allPricingRequests.filter(z => this.mySelection.includes(z.stoneId));
      this.spinnerService.show();
      listPricingRequests = JSON.parse(JSON.stringify(listPricingRequests));
      let res = await this.calculateMarketSheetPricing(listPricingRequests);
      if (res.failCount >= listPricingRequests.length) {
        this.utilityService.showNotification(`No rap discount not found!`, 'warning');
        this.spinnerService.hide();
        return;
      }
      else if (res.failCount > 0)
        this.utilityService.showNotification(res.failCount + ` rap discount not found!`, 'warning');

      let updateData = res.data.filter(z => z.tempPrice.discount != null);
      if (updateData.length == 0) {
        this.utilityService.showNotification(`No rap discount not found!`, 'warning');
        this.spinnerService.hide();
        return;
      }

      let result = await this.pricingRequestService.insertTempPricing(updateData);
      if (result) {
        await this.getPriceRequestData();

        //Update in All Pricing
        this.allPricingRequests.forEach(z => {
          let newData = updateData.find(a => a.stoneId == z.stoneId);
          if (newData != null)
            z = newData;
        });

        this.spinnerService.hide();
        this.utilityService.showNotification(`Data updated successfully!`);
      }
      else {
        this.spinnerService.hide();
        this.alertDialogService.show(`Data update fail, Try again later!`);
      }
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(`Something went wrong, Try again later!`);
    }
  }

  public async onEnterAddStone(event: any) {
    try {
      let stoneId = event.target.value;
      await this.loadStoneDetails(stoneId);
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async loadStoneDetails(stoneId: string) {
    try {
      this.spinnerService.show();
      let fetchIds: string[] = this.utilityService.CheckStoneIdsAndCertificateIds(stoneId);
      this.stoneIdsSearchTxt = fetchIds.map(x => x.toLowerCase());
      if (fetchIds && fetchIds.length > 0) {
        this.searchedStones = await this.inventoryService.getInventoryByStoneIds(fetchIds);
        this.gridCutUpdateInventory = this.searchedStones;
      } else
        this.gridCutUpdateInventory = [];
      this.spinnerService.hide();
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async calculateMarketSheetPricing(listPricingRequests: PricingRequest[]): Promise<{
    failCount: number, data: PricingRequest[]
  }> {
    let reqList: PricingMarketSheetRequest[] = [];
    let response: PricingMarketSheetResponse[] = [];
    let failResCount: number = 0;

    let listPricingGradeRequests = listPricingRequests.filter(z => z.inclusion.iGrade != null && z.measurement.mGrade != null);
    failResCount = listPricingRequests.length - listPricingGradeRequests.length;

    listPricingGradeRequests.forEach(z => {
      reqList.push(this.mappingMarketSheetPricing(z));
      //z.availableDays = this.utilityService.calculateAvailableDateDiff(z.marketSheetDate, z.holdDays, z.isHold == true ? z.holdDate : null);
    });

    response = await this.pricingService.getMarketSheetPrice(reqList);
    if (response && response.length > 0) {
      for (let index = 0; index < listPricingGradeRequests.length; index++) {
        let z = listPricingGradeRequests[index];
        let target = response.find(a => a.id == z.stoneId);
        if (target && target.rapPrice != null && target.rapPrice > 0) {
          if (target.error == null) {
            target = this.utilityService.setAmtForPricingMarketSheetDiscountResponse(target, z.weight);
            z.price.rap = target.rapPrice;
            z.tempPrice.rap = target.rapPrice;
            z.tempPrice.discount = target.discount;
            z.tempPrice.netAmount = target.amount;
            z.tempPrice.perCarat = target.dCaret;

            z = await this.checkValidLimitation(z);
            failResCount--;
          }
          else {
            z.tempPrice.rap = target.rapPrice;
            z.price.rap = target.rapPrice;
            z.tempPrice.discount = null as any;
            z.tempPrice.netAmount = null as any;
            z.tempPrice.perCarat = null as any;

          }
          failResCount++;
        }

        z.identity.id = this.fxCredentials.id;
        z.identity.name = this.fxCredentials.fullName;
        z.identity.type = "Pricing";
        z.createdBy = this.fxCredentials.id;
      }
    }
    listPricingGradeRequests = await this.ApplySpecialStoneCriteriaForDiscount(listPricingGradeRequests);

    return { failCount: failResCount, data: listPricingGradeRequests };
  }

  public mappingMarketSheetPricing(z: PricingRequest): PricingMarketSheetRequest {
    let mesurement = new MfgMeasurementData();
    mesurement.TblDepth = z.measurement.depth;
    mesurement.TblAng = z.measurement.table;
    mesurement.Length = z.measurement.length;
    mesurement.Width = z.measurement.width;
    mesurement.Height = z.measurement.height;
    mesurement.CrHeight = z.measurement.crownHeight;
    mesurement.CrAngle = z.measurement.crownAngle;
    mesurement.PvlDepth = z.measurement.pavilionDepth;
    mesurement.PvlAngle = z.measurement.pavilionAngle;
    mesurement.StarLength = 0;
    mesurement.LowerHalf = 0;
    mesurement.GirdlePer = z.measurement.girdlePer;
    mesurement.MinGirdle = z.measurement.minGirdle;
    mesurement.MaxGirdle = z.measurement.maxGirdle;
    mesurement.Ratio = z.measurement.ratio;

    let inclusion = new MfgInclusionData();
    inclusion.Brown = z.inclusion.brown;
    inclusion.Green = z.inclusion.green;
    inclusion.Milky = z.inclusion.milky;
    inclusion.Shade = z.inclusion.shade;
    inclusion.SideBlack = z.inclusion.sideBlack;
    inclusion.CenterBlack = z.inclusion.centerBlack;
    inclusion.SideWhite = z.inclusion.sideWhite;
    inclusion.CenterWhite = z.inclusion.centerWhite;
    inclusion.OpenTable = z.inclusion.openTable;
    inclusion.OpenCrown = z.inclusion.openCrown;
    inclusion.OpenPavilion = z.inclusion.openPavilion;
    inclusion.OpenGirdle = z.inclusion.openGirdle;

    if (z.inclusion.girdleCondition && z.inclusion.girdleCondition.length > 0)
      inclusion.GirdleCond.push(z.inclusion.girdleCondition?.toUpperCase());

    inclusion.EFOC = z.inclusion.efoc;
    inclusion.EFOP = z.inclusion.efop;
    inclusion.Culet = z.inclusion.culet;
    inclusion.HNA = z.inclusion.hna;
    inclusion.EyeClean = z.inclusion.eyeClean;

    inclusion.KToS = [];
    let ktos = z.inclusion.ktoS?.split(',');
    if (ktos && ktos.length > 0) {
      for (let index = 0; index < ktos.length; index++) {
        const element = ktos[index];
        inclusion.KToS.push(element.trim());
      }
    }

    inclusion.NaturalOnGirdle = z.inclusion.naturalOnGirdle;
    inclusion.NaturalOnCrown = z.inclusion.naturalOnCrown;
    inclusion.NaturalOnPavillion = z.inclusion.naturalOnPavillion;
    inclusion.FlColor = z.inclusion.flColor;
    inclusion.Luster = z.inclusion.luster;
    inclusion.BowTie = z.inclusion.bowtie;

    let req: PricingMarketSheetRequest = {
      Lab: (z.lab && z.lab.length > 0) ? z.lab : "GIA",
      Id: z.stoneId,
      Shape: z.shape,
      Weight: z.weight,
      Color: (z.color?.toUpperCase() == 'O' || z.color?.toUpperCase() == 'P') ? 'M' : z.color?.toUpperCase(),
      Clarity: z.clarity,
      Cut: z.cut,
      Polish: z.polish,
      Symmetry: z.symmetry,
      Flour: z.fluorescence,
      MGrade: z.measurement.mGrade,
      IGrade: z.inclusion.iGrade,
      //Day: this.utilityService.calculateAvailableDateDiff(z.marketSheetDate ?? new Date(), z.holdDays, z.isHold == true ? z.holdDate : null),
      Day: z.availableDays,
      InclusionPrice: inclusion,
      MeasurePrice: mesurement
    };

    return req;
  }

  public async checkValidLimitation(target: PricingRequest): Promise<PricingRequest> {
    var data = this.userPricingCriteriaData.find(z => z.minWeight <= target.weight && z.maxWeight >= target.weight &&
      this.compareArrayString(target.shape, z.shape) &&
      this.compareArrayString(target.lab, z.lab, true) &&
      this.compareArrayStringColor(target.color, z.color) &&
      this.compareArrayString(target.clarity, z.clarity) &&
      this.compareArrayString(target.cut, z.cut) &&
      this.compareArrayString(target.polish, z.polish) &&
      this.compareArrayString(target.symmetry, z.symmetry) &&
      this.compareArrayString(target.fluorescence, z.fluorescence));

    if (data != null) {
      let priceDisc = target.price?.discount;
      if (target.price?.discount == null) {
        target.isValid = true;
        return target;
      }
      priceDisc = await this.getPreviousBaseDiscount(target);
      let diff: number = parseFloat(priceDisc?.toString() ?? '0') - parseFloat(target.tempPrice?.discount?.toString() ?? '0');
      if (diff > 0)
        target.isValid = (data.upLimit >= diff);
      else
        target.isValid = (data.downLimit >= Math.abs(diff));

      if (target.isValid == false) {
        console.info("StoneId" + target.stoneId + " UpLimit: " + data.upLimit + " Down Limit: " + data.downLimit);
        console.info("StoneId" + target.stoneId + " Previous Price: " + priceDisc);
        console.info("StoneId" + target.stoneId + " Difference: " + diff);
      }
    }
    else {
      target.isValid = false;
      this.alertDialogService.show(target.stoneId + ' slot criteria not exists!');
    }
    return target;
  }

  public async getPreviousBaseDiscount(target: PricingRequest): Promise<number | null> {
    let pricingHistory = await this.pricingRequestService.getPricingHistory(target.stoneId);
    if (pricingHistory && pricingHistory.length > 0) {
      let todate = new Date();
      let todayData = pricingHistory.filter(z => this.matchDate(new Date(z.createdDate), todate));
      if (todayData && todayData.length > 0) {
        //Get Today First Change
        // todayData = this.sortingDate(todayData);
        // return todayData[0].price.discount;

        let previousData = pricingHistory.filter(z => !this.matchDate(new Date(z.createdDate), todate));
        if (previousData && previousData.length > 0) {
          //Get Previous Last Discount
          previousData = this.sortingDate(previousData);
          return previousData[previousData.length - 1].price.discount;
        } else
          return target.price?.discount;
      }
      else
        return target.price?.discount;
    }
    else
      return target.price?.discount;
  }

  //#update cut parameter
  public async openModalToUpdateCut() {
    this.subFields = await this.gridPropertiesService.getLeadInventoryItems().filter((item) => item.propertyName != "checkbox");
    this.isOpenUpdateCutModal = !this.isOpenUpdateCutModal;
  }

  public async updateLatestFancyCut() {
    try {
      this.alertDialogService.ConfirmYesNo("Are you sure you want update cut parameter?", "Update")
        .subscribe(async (res: any) => {
          if (res.flag) {
            if (this.allTheFancy && this.allTheFancy.length) {
              if (this.searchedStones && this.searchedStones.length > 0) {
                let updateInvs = this.searchedStones.map((item) => {
                  if (item && item.shape.toLowerCase() != 'rbc') {
                    let girdleAll = this.measurementData.filter(item => item.type.toLowerCase().indexOf('girdle') !== -1);
                    let targetminP = girdleAll.find(z => z.name == item.measurement.minGirdle)?.priority;
                    let targetmaxP = girdleAll.find(z => z.name == item.measurement.maxGirdle)?.priority;
                    
                    let newShape = item.shapeRemark != null ? true : false;
                    
                    let finalFancyCutRecords = this.allTheFancy.find(
                      f => newShape ? f.shape.toLowerCase() == item?.shapeRemark.toLowerCase() : f.shape.toLowerCase() == item?.shape.toLowerCase()
                        && f.minDepth <= (item.measurement.depth ?? 0) && f.maxDepth >= (item.measurement.depth ?? 0)
                        && f.minTable <= (item.measurement.table ?? 0) && f.maxTable >= (item.measurement.table ?? 0)
                        && f.minRatio <= item.measurement.ratio && f.maxRatio >= item.measurement.ratio
                        && typeof f.minGirdlePriority === 'number' && f.minGirdlePriority <= (typeof targetminP === 'string' ? parseInt(targetminP) : 0)
                        && typeof f.maxGirdlePriority === 'number' && f.maxGirdlePriority >= (typeof targetmaxP === 'string' ? parseInt(targetmaxP) : 0)
                    );
                    if (finalFancyCutRecords != null)
                      item.cut = finalFancyCutRecords.cut;
                    else {
                      item.cut = "FR";
                    }
                  }
                  return item
                })
                let fancyCutObj: FancyCutItem[] = [];
                updateInvs.map(a => fancyCutObj.push({ stoneId: a.stoneId, cut: a.cut }));
                if (fancyCutObj && fancyCutObj.length > 0) {
                  let res = await this.inventoryService.updateInventoryCutList(fancyCutObj);
                  if (res)
                    this.utilityService.showNotification(`Cut parameter updated successfully!`, 'success');
                }

                let result = await this.updateSupplierInventoryData(updateInvs);
                if (result)
                  this.utilityService.showNotification(updateInvs.length.toString() + ` Record(s) updated successfully in supplier data!`);

                this.closeUpdateCutDialog();
                this.filterOrAddText = "";
              }
            }
            else {
              this.alertDialogService.show(`Fancy cut parameter details not available!`);
            }
          }
        })
    }
    catch (error) {
      console.error(error);
      this.alertDialogService.show(`Data update fail, Try again later!`);
    }
  }
  //#endregion

  public async updateSupplierInventoryData(inv: InventoryItems[]): Promise<boolean> {
    let res = false;
    try {
      var distinctSuppliers = inv.map((u: InventoryItems) => u.supplier.code).filter((x: any, i: any, a: any) => x && a.indexOf(x) === i);
      for (let i = 0; i < distinctSuppliers.length; i++) {
        var z = distinctSuppliers[i];
        var supplierDetail = this.suppliers.find(a => a.code == z);
        if (supplierDetail) {
          if (supplierDetail.apiPath) {
            var invBySuppliers = inv.filter(a => a.supplier.code == z);
            let fancyCutObj: FancyCutItem[] = [];
            invBySuppliers.map(a => fancyCutObj.push({ stoneId: a.stoneId, cut: a.cut }));
            res = await this.commuteService.updateStoneCut(fancyCutObj, supplierDetail.apiPath);
          }
          else
            this.alertDialogService.show(supplierDetail.name + ' supplier api not found, Please contact administrator!');
        } else {
          this.alertDialogService.show(z + ' supplier not found, Please contact administrator!');
        }
      }
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('inventory not updated in supplier data, Please contact administrator!', 'error');
    }
    return res;
  }

  public async closeUpdateCutDialog() {
    this.isOpenUpdateCutModal = !this.isOpenUpdateCutModal;
  }

  public sortingDate(data: PricingHistory[]) {
    data = data.sort((n1, n2) => {
      let np1 = new Date(n1.createdDate);
      let np2 = new Date(n2.createdDate);

      if (np1 > np2)
        return 1;

      if (np1 < np2)
        return -1;

      return 0;
    });
    return data;
  }

  public matchDate(target: Date, filter: Date): boolean {
    let flag = true;

    if (target.getFullYear() != filter.getFullYear())
      return false;
    if (target.getMonth() != filter.getMonth())
      return false;
    if (target.getDate() != filter.getDate())
      return false;

    return flag;
  }

  public compareArrayString(target: string, filter: string[], isOptional: boolean = false): boolean {
    if (filter == null || filter.length == 0)
      return true;
    else if (filter != null && filter.length > 0 && (target == null || target.length == 0))
      return isOptional;
    else
      return filter.map(u => u?.toLowerCase()).includes(target.toLowerCase());
  }

  public compareArrayStringColor(target: string, filter: string[], isOptional: boolean = false): boolean {
    if (filter == null || filter.length == 0)
      return true;
    else if (filter != null && filter.length > 0 && (target == null || target.length == 0))
      return isOptional;
    else if (target != null && target.length > 0)
      return true;
    else
      return filter.map(u => u?.toLowerCase()).includes(target.toLowerCase());
  }

  public calculateRapPricing(target: PricingRequest): PricingRequest {
    const rap = target.price.rap;
    let disc = target.tempPrice.discount;
    if (rap && disc) {
      if (disc.toString() != '-') {

        disc = parseFloat(disc.toString());
        let weight = target.weight;
        let stoneRap = weight * rap;
        let calDiscount = 100 + disc;
        let netAmount = (calDiscount * stoneRap) / 100;

        target.tempPrice.rap = rap;
        target.tempPrice.netAmount = this.utilityService.ConvertToFloatWithDecimal(netAmount);
        let perCarat = netAmount / weight;
        target.tempPrice.perCarat = this.utilityService.ConvertToFloatWithDecimal(perCarat);
      }
    }
    return target;
  }

  private showApplyMessage() {
    let msg = '';
    msg += this.applyPriceData.total + ' <b>Total Selected Stone(s)</b><br />';
    msg += this.applyPriceData.valid + ' <b>Valid Stone(s)</b><br />';
    msg += this.applyPriceData.total - this.applyPriceData.valid + ' <b>Not Valid Stone(s)</b><br />';
    msg += this.applyPriceData.success + ' <b>Success Stone(s)</b><br />';
    msg += this.applyPriceData.fail + ' <b>Fail Stone(s)</b><br />';
    msg += this.applyPriceData.pending + ' <b>Pending Pricing Stone(s)</b><br /><br />';
    msg += '<b>Total Selected Stone Id(s):</b>' + this.mySelection.join(',') + '<br /><br />';

    for (let index = 1; index <= 4; index++) {
      const code = index;
      let errorMsgs = this.applyPriceErrorData.filter(z => z.code == code);
      if (errorMsgs.length > 0) {
        let errorMsgStoneIds = errorMsgs.map(z => z.stonId);
        msg += errorMsgStoneIds.join(',') + ' <b>' + errorMsgs[0].msg + '</b><br /><br />';
      }
    }
    this.alertDialogService.show(msg);
  }

  public async onApplyChanges() {
    try {
      this.alertDialogService.ConfirmYesNo("Are you sure you want to apply discount?", "Update")
        .subscribe(async (res: any) => {
          if (res.flag) {
            this.spinnerService.show();
            this.applyPriceErrorData = [];
            this.applyPriceData = { total: 0, valid: 0, success: 0, fail: 0, pending: 0 };
            // let updatedData = this.allPricingRequests.filter(z => this.mySelection.includes(z.stoneId) && z.tempPrice.discount != null && z.isValid);
            let updatedData = await this.getSelectedValidStoneData();
            if (updatedData.length > 0) {
              this.applyPriceData.valid = updatedData.length;
              updatedData.forEach(z => {
                z.identity.id = this.fxCredentials.id;
                z.identity.name = this.fxCredentials.fullName;
                z.identity.type = "Pricing";
              });
              let result: number = 0;
              this.pendingPricingRequest = [];

              //Update Latest Rap
              updatedData = await this.checkNewRapForPriceRequest(updatedData);

              //Check For Batch Wise data update
              if (updatedData.length > keys.batchWiseSaveLimit) {
                let batches = Math.ceil(updatedData.length / keys.batchWiseSaveLimit);

                for (let index = 0; index < batches; index++) {
                  let startIndex = keys.batchWiseSaveLimit * index;
                  let batchData = updatedData.slice(startIndex, startIndex + keys.batchWiseSaveLimit);
                  result += await this.updateInventory(batchData);
                }
              }
              else
                result = await this.updateInventory(updatedData);

              if (result && result > 0) {
                this.showApplyMessage();
                this.SendNotificationForPriceRequest(updatedData.map(z => z.stoneId));
                await this.getPriceRequestData();
                this.getSummaryData();
              }
              else {
                this.alertDialogService.show(`Pricing request not updated, Try again later!`, 'error');
                this.spinnerService.hide();
              }
            }
            else {
              if (this.applyPriceErrorData.length > 0)
                this.showApplyMessage();

              this.spinnerService.hide();
            }
          }
        });
    }
    catch (error) {
      console.error(error);
      this.alertDialogService.show(`Data update fail, Try again later!`);
    }
  }

  private async getSelectedValidStoneData(): Promise<PricingRequest[]> {
    let unfindStones: string[] = [];
    let updatedData: PricingRequest[] = [];
    let allPricingRequests: PricingRequest[] = JSON.parse(JSON.stringify(this.allPricingRequests));
    this.applyPriceData.total = this.mySelection.length;

    //Get stones from allPricingRequests data with mySelection
    for (let index = 0; index < this.mySelection.length; index++) {
      let stoneId = this.mySelection[index];

      //Check if exist in all inventory array
      let inv = allPricingRequests.find(z => z.stoneId == stoneId);
      if (inv != null) {
        //Check if exist in grid data
        var exists = this.listPricingRequests.find(z => z.stoneId == stoneId);
        if (exists == null)
          updatedData.push(inv);
        else
          updatedData.push(exists);
      }
      else
        unfindStones.push(stoneId);
    }

    if (unfindStones.length > 0)
      unfindStones.forEach(z => { this.applyPriceErrorData.push({ stonId: z, msg: 'not found in our data!', code: 1 }) });

    //Update Temp Price Data & IsValid flag again
    updatedData = await this.checkValidLimitationBulk(updatedData);

    if (updatedData.filter(z => z.tempPrice.discount == null).length > 0)
      updatedData.filter(z => z.tempPrice.discount == null).forEach(z => { this.applyPriceErrorData.push({ stonId: z.stoneId, msg: 'temp discount not found!', code: 2 }) });

    updatedData = updatedData.filter(z => z.tempPrice.discount != null && z.isValid);

    return updatedData;
  }

  public async checkValidLimitationBulk(targets: PricingRequest[]): Promise<PricingRequest[]> {
    let validPricingRequest: PricingRequest[] = [];
    try {
      let getHistoryData: { inv: PricingRequest, criteria: UserPricingCriteria }[] = [];
      for (let index = 0; index < targets.length; index++) {
        const target = targets[index];
        var data = this.userPricingCriteriaData.find(z => z.minWeight <= target.weight && z.maxWeight >= target.weight &&
          this.compareArrayString(target.shape, z.shape) &&
          this.compareArrayString(target.lab, z.lab, true) &&
          this.compareArrayStringColor(target.color, z.color) &&
          this.compareArrayString(target.clarity, z.clarity) &&
          this.compareArrayString(target.cut, z.cut) &&
          this.compareArrayString(target.polish, z.polish) &&
          this.compareArrayString(target.symmetry, z.symmetry) &&
          this.compareArrayString(target.fluorescence, z.fluorescence));

        if (data != null) {
          if (target.price?.discount == null) {
            target.isValid = true;
            validPricingRequest.push(target);
          }
          else
            getHistoryData.push({ inv: target, criteria: data });
        }
        else {
          target.isValid = false;
          this.alertDialogService.show(target.stoneId + ' slot criteria not exists!', 'error');
          validPricingRequest.push(target);
        }
      }

      if (getHistoryData.length > 0) {
        let historyStoneIds = getHistoryData.map(z => z.inv.stoneId);
        let pricingHistories = await this.pricingRequestService.getPricingHistoryBulk(historyStoneIds);
        for (let j = 0; j < getHistoryData.length; j++) {
          const target = getHistoryData[j].inv;
          const criteria = getHistoryData[j].criteria;

          let priceDisc = target.price?.discount;

          if (pricingHistories.length > 0) {
            let history = pricingHistories.filter(z => z.stoneId == target.stoneId);
            if (history.length > 0)
              priceDisc = this.getPreviousBaseDiscountWithHistory(target, history);
          }

          let diff: number = parseFloat(priceDisc?.toString() ?? '0') - parseFloat(target.tempPrice?.discount?.toString() ?? '0');
          if (diff > 0)
            target.isValid = (criteria.upLimit >= diff);
          else
            target.isValid = (criteria.downLimit >= Math.abs(diff));

          if (target.isValid == false) {
            this.applyPriceErrorData.push({ stonId: target.stoneId, msg: "not valid difference from previous pricing", code: 3 });
            console.info("StoneId" + target.stoneId + " UpLimit: " + criteria.upLimit + " Down Limit: " + criteria.downLimit);
            console.info("StoneId" + target.stoneId + " Previous Price: " + priceDisc);
            console.info("StoneId" + target.stoneId + " Difference: " + diff);
          }

          validPricingRequest.push(target);
        }
      }
    } catch (error: any) {
      console.error(error);
      this.alertDialogService.show('Pricing history not get, Please contact administrator!');
    }
    return validPricingRequest;
  }

  public getPreviousBaseDiscountWithHistory(target: PricingRequest, pricingHistory: PricingHistory[]): number | null {
    if (pricingHistory && pricingHistory.length > 0) {
      let todate = new Date();
      let todayData = pricingHistory.filter(z => this.matchDate(new Date(z.createdDate), todate));
      if (todayData && todayData.length > 0) {
        //Get Today First Change
        // todayData = this.sortingDate(todayData);
        // return todayData[0].price.discount;

        let previousData = pricingHistory.filter(z => !this.matchDate(new Date(z.createdDate), todate));
        if (previousData && previousData.length > 0) {
          //Get Previous Last Discount
          previousData = this.sortingDate(previousData);
          return previousData[previousData.length - 1].price.discount;
        } else
          return target.price?.discount;
      }
      else
        return target.price?.discount;
    }
    else
      return target.price?.discount;
  }

  public async SendNotificationForPriceRequest(stoneIds: string[]) {
    var result = await this.pricingRequestService.getInventoryByStoneIds(stoneIds);
    if (result) {
      let recevierIds = result.map((u: any) => u.identity.id).filter((x: any, i: any, a: any) => x && a.indexOf(x) === i);
      if (recevierIds && recevierIds.length > 0) {
        recevierIds.forEach(async z => {
          let stoneIds = result.filter(a => a.identity.id == z).map(a => a.stoneId);
          let message: Notifications = ApplyPriceRequestTemplate(this.fxCredentials, z, stoneIds);
          let notificationResponse = await this.notificationService.insertNotification(message);
          if (notificationResponse) {
            message.id = notificationResponse;
            this.notificationService.messages.next(message);
          }
        });
      }
    }
  }

  private async updateInventory(pricing: PricingRequest[]): Promise<number> {
    try {
      let res = false;
      var distinctSuppliers = pricing.map((u: PricingRequest) => u.supplier?.code).filter((x: any, i: any, a: any) => x && a.indexOf(x) === i);
      if (distinctSuppliers.length == 0) {
        this.alertDialogService.show('No backoffice organization found, Please contact administrator');
        return 0;
      }
      for (let i = 0; i < distinctSuppliers.length; i++) {
        var z = distinctSuppliers[i];
        var supplierDetail = this.suppliers.find(a => a.code == z);
        if (supplierDetail) {
          if (supplierDetail.apiPath) {
            var pricingBySuppliers = pricing.filter(a => a.supplier?.code == z);

            //Check for Hold Stone data from frontoffice inventory
            var stoneIds = pricingBySuppliers.map(a => a.stoneId);
            var checkHoldStones = await this.inventoryService.getCheckHoldStones(stoneIds);
            if (checkHoldStones && checkHoldStones.length > 0) {
              var holdStoneIds = checkHoldStones.filter(a => a.isHold == true).map(a => a.stoneId);
              if (holdStoneIds.length > 0) {
                let pendingPricingRequest = JSON.parse(JSON.stringify(pricingBySuppliers.filter(z => holdStoneIds.includes(z.stoneId))));
                this.pendingPricingRequest.push(...pendingPricingRequest);
                this.applyPriceData.pending += holdStoneIds.length;

                pricingBySuppliers = pricingBySuppliers.filter(z => !holdStoneIds.includes(z.stoneId))
              }
            }

            if (pricingBySuppliers.length > 0) {
              let req = this.mappingSupplierPricingRequest(pricingBySuppliers);
              var result = await this.commuteService.updateTempPricing(req, supplierDetail.apiPath);

              // if (result.isSuccess && result.data && result.data.length > 0) {
              //   let pendingStones = pricingBySuppliers.filter(z => result.data.includes(z.stoneId));
              //   if (pendingStones && pendingStones.length > 0) {
              //     this.pendingPricingRequest = pendingStones;
              //     this.applyPriceData.pending += pendingStones.length;
              //   }
              // }

              res = result.isSuccess;
              if (!res) {
                this.applyPriceData.fail += pricingBySuppliers.length;
                break;
              }
              else
                this.applyPriceData.success += pricingBySuppliers.length;
            }
            else
              res = true;

          } else {
            this.applyPriceData.fail += pricing.filter(a => a.supplier?.code == z).length;
            console.error(supplierDetail.name + ' supplier api not found');
            break;
          }
        } else {
          this.applyPriceData.fail += pricing.filter(a => a.supplier?.code == z).length;
          console.error(z + ' supplier not found, Please contact administrator!');
          break;
        }
      }

      if (res) {
        if (this.pendingPricingRequest.length > 0) {
          //Update IsHold Flag for pending pricing data
          let pendingStoneIds = this.pendingPricingRequest.map(z => z.stoneId);
          pricing.forEach(z => {
            if (pendingStoneIds.includes(z.stoneId))
              z.isHold = true;
            else
              z.isHold = false;
          });
        }
        return await this.updateTempPricing(pricing);
      }

      return 0;
    }
    catch (error: any) {
      console.error(error);
      return 0;
    }
  }

  public mappingSupplierPricingRequest(pricing: PricingRequest[]): TempPricingRequest[] {
    let pricingReq: TempPricingRequest[] = [];

    pricing.forEach(z => {
      let obj: TempPricingRequest = new TempPricingRequest();
      obj.stoneId = z.stoneId;
      obj.status = z.status;
      obj.updatedBy = z.updatedBy;
      obj.tempBasePrice = z.tempBasePrice;
      obj.tempPrice = z.tempPrice;

      pricingReq.push(obj);
    });

    return pricingReq;
  }

  private async updateTempPricing(pricing: PricingRequest[]): Promise<number> {
    try {
      var result = await this.pricingRequestService.removeTempPricing(pricing);
      if (!result) {
        this.alertDialogService.show(`Data update fail, Try again later!`);
        this.spinnerService.hide();
      } else
        this.insertInvItemHistoryList(pricing.map(item => item.stoneId), InvHistoryAction.MainDiscChanged, `Updated the Main Disc from the Inventory Price page for stone`);
      return result;
    } catch (error: any) {
      console.error(error);
      this.alertDialogService.show(`Data update fail, Try again later!`);
      this.spinnerService.hide();
      return 0;
    }
  }
  //#endregion

  //#region OnChange Functions
  public rowCss(args: RowClassArgs) {
    if (args.dataItem.isLock)
      return { 'table-row-bg-yellow': args.dataItem.isLock == true }

    return null as any
  }

  public sanitizeURL(url: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  public openGridConfigDialog(): void {
    this.isGridConfig = true;
  }

  public openAnalyticsDialog(priceReq: PricingRequest): void {
    this.selectedPriceReq = priceReq;
    this.isAnalytics = true;
  }

  public closeAnalyticsDialog(): void {
    this.selectedPriceReq = new PricingRequest();
    this.isAnalytics = false;
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

  public async expandPricingHistory(e: any) {
    let pricingHistory = await this.pricingRequestService.getPricingHistory(e.dataItem.stoneId);
    if (pricingHistory) {
      pricingHistory.forEach(z => {
        if (this.listPricingHistory.find(a => a.id == z.id) == null)
          this.listPricingHistory.push(z);
      });
    }

    let invItems = await this.pricingRequestService.getInventoryByStoneId(e.dataItem.stoneId);
    if (invItems) {
      this.inventoryItems.push(invItems);
    }
  }

  public getlistPricingHistory(stoneId: string): PricingHistory[] {
    return this.listPricingHistory.filter(z => z.stoneId == stoneId);
  }

  public getInventoryItems(stoneId: string): InventoryItems[] {
    return this.inventoryItems.filter(z => z.stoneId == stoneId) ?? new InventoryItems();
  }

  public clearPricingHistory(e: any) {
    this.listPricingHistory = this.listPricingHistory.filter(z => z.stoneId != e.dataItem.stoneId);
    this.inventoryItems = this.inventoryItems.filter(z => z.stoneId != e.dataItem.stoneId);
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

  public selectedRowChange(e: any) {
    if (e.selectedRows && e.selectedRows.length > 0) {
      let senitizeData = JSON.parse(JSON.stringify(e.selectedRows[0].dataItem));

      let index = this.allPricingRequests.findIndex(z => z.stoneId == senitizeData.stoneId);
      if (index > -1)
        this.allPricingRequests.splice(index, 1);

      let selectionData = this.mySelection.find(z => z == senitizeData.stoneId);
      if (selectionData == null)
        this.mySelection.push(senitizeData.stoneId);

      let allData = this.allPricingRequests.find(z => z.stoneId == senitizeData.stoneId);
      if (allData == null)
        this.allPricingRequests.push(senitizeData);
    }
  }

  public groupChange(groups: GroupDescriptor[]): void {
    try {
      this.groups = groups;
      this.getPriceRequestData();
    }
    catch (error: any) {
      this.alertDialogService.show(error.error);
    }
  }

  public pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.getPriceRequestData();
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

  public openSlotFilterDialog(): void {
    this.isSlotFilter = true;
  }

  public closeSlotFilterDialog(): void {
    this.isSlotFilter = false;
  }

  public onBulkToggle(): void {
    this.showBulk = !this.showBulk;
  }

  public async copyToClipboard() {
    try {
      this.spinnerService.show();
      let res = JSON.parse(JSON.stringify(this.mySelection));
      if (res) {
        let stoneIdString = res.join(' ');
        navigator.clipboard.writeText(stoneIdString);
        this.utilityService.showNotification(`Copy to clipboard successfully!`);
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
  //#endregion

  //#region Select All
  public async loadAllInventories() {
    try {
      const take = this.priceReqResponse.total;
      this.spinnerService.show();
      this.allPricingRequests = [];
      this.mySelection = [];

      //batch wise select all
      let batches = Math.ceil(this.priceReqResponse.total / take);
      for (let index = 0; index < batches; index++) {
        let startIndex = (take * index);

        let req: PriceRequestApiModel = this.filterReq;
        req.systemUserId = this.fxCredentials.id;
        req.skip = startIndex;
        req.take = take;
        if (this.mySelection.length <= this.priceReqResponse.total) {
          let res = await this.pricingRequestService.getPricingInvByCriteriaRange(req);
          if (res) {
            this.allPricingRequests.push(...res.priceRequest);
            //this.mySelection.push(...JSON.parse(JSON.stringify(res.priceRequest.map(z => z.stoneId))));            
          }
        }
      }

      this.mySelection = this.allPricingRequests.map(z => z.stoneId);
      this.spinnerService.hide();
      this.changeDetRef.detectChanges();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async selectAllPricing(event: string, isAll: boolean) {
    if (event.toLowerCase() == 'checked') {
      if (this.priceReqResponse.total > this.pageSize && isAll) {
        await this.loadAllInventories();
        this.isAllSelected = false;
      }
      else {
        if (isAll || this.priceReqResponse.total < this.pageSize)
          this.isAllSelected = false;
        else if (this.priceReqResponse.total > this.pageSize)
          this.isAllSelected = true;

        this.listPricingRequests.forEach(z => {
          let allIndex = this.allPricingRequests.findIndex(a => a.stoneId == z.stoneId);
          if (allIndex == -1)
            this.allPricingRequests.push(JSON.parse(JSON.stringify(z)));
        });
      }
    }
    else if (event.toLowerCase() == 'uncheckedall') {
      this.mySelection = [];
      this.allPricingRequests = [];
    }
    else {
      this.listPricingRequests.forEach(z => {
        let selectionIndex = this.mySelection.findIndex(a => a == z.stoneId);
        if (selectionIndex != -1)
          this.mySelection.splice(selectionIndex, 1);
        let allIndex = this.allPricingRequests.findIndex(a => a.stoneId == z.stoneId);
        if (allIndex != -1)
          this.allPricingRequests.splice(allIndex, 1);
      });
      this.isAllSelected = false;
    }
  }
  //#endregion

  //#region Popup Close
  @HostListener("document:click", ["$event"])
  public documentClick(event: any): void {
    if (!this.contains(event.target)) {
      this.showBulk = false;
    }
  }

  private contains(target: any): boolean {
    return (
      this.anchor.nativeElement.contains(target) ||
      (this.popup ? this.popup.nativeElement.contains(target) : false)
    );
  }
  //#endregion

  //#region Color Mark
  public openColorMarkDialog() {
    this.iscolorMark = true;
  }

  public closeColorMarkDialog() {
    this.iscolorMark = false;
    this.selectedColorMark = '';
  }

  public markColor(color: string) {
    this.selectedColorMark = color;
    this.getColorFromClass(color);
  }

  public getColorFromClass(color: string, isGrid = false): string {
    this.colorMarkClass = color;
    return this.colorMarkClass;
  }

  public getColorMarkRGB(color: string, isGrid = false): string {
    let colorMarkClass = '';

    switch (color) {
      case "Red":
        colorMarkClass = "#EF9A9A";
        break;
      case "Yellow":
        colorMarkClass = "#FFF59D";
        break;
      case "Blue":
        colorMarkClass = "#81D4FA";
        break;
      case "Brown":
        colorMarkClass = "#BCAAA4";
        break;
      case "Green":
        colorMarkClass = "#A5D6A7";
        break;
      case "None":
        if (isGrid)
          colorMarkClass = 'transparent';
        else
          colorMarkClass = '#BDBDBD';
        break;
      default:
        colorMarkClass = "transparent";
        break;
    }

    return colorMarkClass;
  }

  public async saveColorMark() {
    try {
      this.spinnerService.show();
      let listPricingRequests = this.allPricingRequests.filter(z => this.mySelection.includes(z.stoneId));
      listPricingRequests.forEach(z => {
        if (this.selectedColorMark == 'None')
          z.discColorMark = null as any;
        else
          z.discColorMark = this.selectedColorMark;

        z.identity.id = this.fxCredentials.id;
        z.identity.name = this.fxCredentials.fullName;
        z.identity.type = "Pricing";
        z.createdBy = this.fxCredentials.id;
      });
      let result = await this.pricingRequestService.insertTempPricing(listPricingRequests, true);
      if (result) {
        this.insertInvItemHistoryList(listPricingRequests?.map(item => item.stoneId), InvHistoryAction.DiscColorMarkChanged, "Updated the Disc Color Mark from the Inventory Price page for stone");
        this.spinnerService.hide();
        this.closeColorMarkDialog();
        this.mySelection = [];
        await this.getPriceRequestData();
        this.utilityService.showNotification(`Data updated successfully!`);
      }
      else {
        this.spinnerService.hide();
        this.alertDialogService.show(`Data update fail, Try again later!`);
      }
    }
    catch (error) {
      this.spinnerService.hide();
      console.error(error);
      this.alertDialogService.show("Something went wrong, Try again later.");
    }
  }
  //#endregion

  //#region Summary
  public openSummary(): void {
    this.isSummary = true;
  }

  public closeSummary(): void {
    this.isSummary = false;
  }

  public async filterChange(type: string) {
    this.skip = 0;
    if (this.filterReq.invFilter == undefined)
      this.filterReq.invFilter = new InventorySearchCriteria();

    if (type == 'Hold') {
      let isHold = this.filterReq.invFilter.isHold;
      if (isHold)
        this.filterReq.invFilter.isHold = null as any;
      else
        this.filterReq.invFilter.isHold = true;
    }
    else if (type == 'Memo') {
      let isMemo = this.filterReq.invFilter.isMemo;
      if (isMemo)
        this.filterReq.invFilter.isMemo = null as any;
      else
        this.filterReq.invFilter.isMemo = true;
    }
    else if (type == 'Lead') {
      let isLead = this.filterReq.invFilter.isLead;
      if (isLead)
        this.filterReq.invFilter.isLead = null as any;
      else
        this.filterReq.invFilter.isLead = true;
    }
    else if (type == 'Available') {
      let isAvailable = this.filterReq.invFilter.isAvailable;
      if (isAvailable)
        this.filterReq.invFilter.isAvailable = null as any;
      else
        this.filterReq.invFilter.isAvailable = true;
    }

    this.spinnerService.show();
    await this.getPriceRequestData();
    this.getSummaryData();
    this.closeSummary();
  }

  public async filterRapnetHoldChange() {
    this.skip = 0;
    if (this.filterReq.invFilter == undefined)
      this.filterReq.invFilter = new InventorySearchCriteria();

    let isHold = this.filterReq.invFilter.isRapnetHold;
    if (isHold)
      this.filterReq.invFilter.isRapnetHold = null as any;
    else
      this.filterReq.invFilter.isRapnetHold = true;

    this.spinnerService.show();
    await this.getPriceRequestData();
    this.getSummaryData();
    this.closeSummary();
  }

  public async filterLocationChange(location: string) {
    this.skip = 0;
    if (this.filterReq.invFilter == undefined)
      this.filterReq.invFilter = new InventorySearchCriteria();

    let index = this.filterReq.invFilter.location.indexOf(location);
    if (index >= 0)
      this.filterReq.invFilter.location.splice(index, 1);
    else
      this.filterReq.invFilter.location.push(location);

    this.spinnerService.show();
    await this.getPriceRequestData();
    this.getSummaryData();
    this.closeSummary();
  }
  //#endregion

  //#region Export To Excel / Mail
  public onExcelToggle(): void {
    this.showExcelOption = !this.showExcelOption;
  }

  public async exportToExcel(type: string) {
    this.excelFile = [];

    if (this.excelOption == 'selected') {
      if (this.mySelection.length == 0) {
        this.alertDialogService.show('Select at least one stone for export!');
        this.showExcelOption = false;
        return;
      }
    }

    this.spinnerService.show();

    let req: PriceRequestApiModel = this.filterReq;
    req.systemUserId = this.fxCredentials.id;
    req.skip = 0;
    req.take = this.summaryData.totalCount;

    let res = await this.pricingRequestService.getPricingInvRequest(req);
    if (res) {
      let exportData = res.priceRequest;
      if (exportData && exportData.length > 0) {
        if (this.excelOption == 'selected') {
          exportData = exportData.filter(item => this.mySelection.includes(item.stoneId));
        }

        exportData.forEach(element => {
          element.days = this.utilityService.calculateDayDiff(element.marketSheetDate ?? new Date());
          //element.availableDays = this.utilityService.calculateAvailableDateDiff(element.marketSheetDate, element.holdDays, element.isHold == true ? element.holdDate : null);
          var excel = this.convertArrayToObject(this.fields, element);
          this.excelFile.push(excel);
        });

        if (this.excelFile.length > 0) {
          if (type == "export") {
            let isExport: boolean = this.utilityService.exportAsExcelFile(this.excelFile, "Diamond_Excel");
            if (isExport) {
              this.excelOption = null;
              this.showExcelOption = false;
            }
          }
        }

        if (exportData && exportData.length > 0) {
          if (type == "csv") {
            this.generateExcelData(exportData);
            if (exportData && exportData.length > 0)
              this.utilityService.exportAsCsvFile(this.excelFile, "Diamond_csv", true)
            this.excelOption = null;
            this.showExcelOption = false;
          }
        }
        this.spinnerService.hide();
      }
      else {
        this.alertDialogService.show('No Data Found!');
        this.spinnerService.hide();
      }
    }
    else
      this.spinnerService.hide();
  }

  private async generateExcelData(data: PricingRequest[]) {
    this.excelFile = [];
    this.excelFile.push({
      'Stone Id': 'Stone Id',
      'CertificateNo': 'CertificateNo',
      'Days': 'Days',
      'Avai. Days': 'Avai. Days',
      'IGrade': 'IGrade',
      'MGrade': 'MGrade',
      'Shape': 'Shape',
      'Weight': 'Weight',
      'Color': 'Color',
      'Clarity': 'Clarity',
      'Cut': 'Cut',
      'Polish': 'Polish',
      'Symmetry': 'Symmetry',
      'Fluorescence': 'Fluorescence',
      'Diameter': 'Diameter',
      'Depth% / Total Depth': 'Depth% / Total Depth',
      'Table': 'Table',
      'Rap': 'Rap',
      'Base Disc': 'Base Disc',
      'Status': 'Status',
      'Main Disc': 'Main Disc',
      'T.Main Disc': 'T.Main Disc',
      'Disc Diff': 'Disc Diff',
      'Lab': 'Lab',
      'Natts': 'Natts',
      'Shade': 'Shade',
      'Brown': 'Brown',
      'Green': 'Green',
      'Milky': 'Milky',
      'Location': 'Location',
      'Memo': 'Memo',
      'Hold': 'Hold',
      'Rapnet Hold': 'Rapnet Hold',
      'Type Two': 'Type Two',
      'P.Comment': 'P.Comment',
      'Certificate': 'Certificate',
      'ImageUrl': 'ImageUrl',
      'videoUrl': 'videoUrl',
      'HoldDate': 'HoldDate',
      'Hold By': 'Hold By',
      'Ktos': 'Ktos',
      'Kapan': 'Kapan',
      'Discount1': 'Discount1',
      'Discount2': 'Discount2',
      'Discount3': 'Discount3',
      'Base NetAmount': 'Base NetAmount',
      'Base $/CT': 'Base $/CT',
      'NetAmount': 'NetAmount',
      'Price Date': 'Price Date',
      '$/CT': '$/CT',
      'TypeA': 'TypeA',
      'Ratio': 'Ratio',
      'A. Days': 'A. Days',
      'Gridle': 'Gridle',
      'Marksheet Date': 'Marksheet Date',
      'Comment': 'Comment'
    });

    data.forEach(z => {
      var excel = {
        'Stone Id': z.stoneId,
        'CertificateNo': z.certificateNo,
        'Days': z.days,
        'Avai. Days': z.availableDays,
        'IGrade': z.inclusion.iGrade,
        'MGrade': z.measurement.mGrade,
        'Shape': z.shape,
        'Weight': z.weight,
        'Color': z.color,
        'Clarity': z.clarity,
        'Cut': z.cut,
        'Polish': z.polish,
        'Symmetry': z.symmetry,
        'Fluorescence': z.fluorescence,
        'Diameter': z.measurement.width,
        'Depth% / Total Depth': z.measurement.depth,
        'Table': z.measurement.table,
        'Rap': z.price.rap,
        'Base Disc': z.basePrice.discount,
        'Status': z.status,
        'Main Disc': z.price.discount,
        'T.Main Disc': z.tempPrice.discount,
        'Disc Diff': this.utilityService.ConvertToFloatWithDecimal(Number(z.tempPrice.discount) - Number(z.price.discount)),
        'Lab': z.lab,
        'Natts': z.inclusion.sideBlack && z.inclusion.centerBlack ? (z.inclusion.sideBlack + ' - ' + z.inclusion.centerBlack) : '',
        'Shade': z.inclusion.shade,
        'Brown': z.inclusion.brown,
        'Green': z.inclusion.green,
        'Milky': z.inclusion.milky,
        'Location': z.location,
        'Memo': z.isMemo,
        'Hold': z.isHold,
        'Rapnet Hold': z.isRapnetHold,
        'Type Two': z.isTypeTwo,
        'P.Comment': z.pricingComment,
        'Certificate': z.media.isCertificate,
        'ImageUrl': z.media.isPrimaryImage ? ('=HYPERLINK("' + environment.imageURL.replace('{stoneId}', z.stoneId.toLowerCase()) + '","Image")') : '',
        'videoUrl': z.media.isHtmlVideo ? ('=HYPERLINK("' + environment.videoURL.replace('{stoneId}', z.stoneId.toLowerCase()) + '","Video")') : '',
        'HoldDate': z.holdDate,
        'Hold By': z.holdBy,
        'Ktos': z.inclusion.ktoS,
        'Kapan': z.kapan,
        'Discount1': z.discountOne,
        'Discount2': z.discountTwo,
        'Discount3': z.discountThree,
        'Base NetAmount': z.basePrice.netAmount,
        'Base $/CT': z.basePrice.perCarat,
        'NetAmount': z.price.netAmount,
        'Price Date': z.expiryDate,
        '$/CT': z.price.perCarat,
        'TypeA': z.typeA,
        'Ratio': z.measurement.ratio,
        'A. Days': z.availableDays,
        'Gridle': z.measurement.minGirdle && z.measurement.maxGirdle ? (z.measurement.minGirdle + ' - ' + z.measurement.maxGirdle) : '',
        'Marksheet Date': z.marketSheetDate,
        'Comment': z.comments
      }
      this.excelFile.push(excel);
    });
  }
  //insert invLogItem
  public async insertInvItemHistoryList(invIds: string[], action: string, desc: string) {
    try {
      var invList = await this.inventoryService.getInventoryByStoneIds(invIds);
      var invHistorys: InvHistory[] = [];
      invList?.map((item) => {
        if (invIds.includes(item.stoneId)) {
          const invHistory = new InvHistory()
          invHistory.stoneId = item.stoneId;
          invHistory.invId = item.id;
          invHistory.action = action;
          invHistory.userName = this.fxCredentials.fullName;
          invHistory.price = item.price;
          invHistory.supplier = item.supplier;
          invHistory.description = desc + " " + item.stoneId;
          invHistorys.push(invHistory);
        }
      })
      this.invHistoryService.InsertInvHistoryList(invHistorys);
    }
    catch (error: any) {
      this.alertDialogService.show(`Something went wrong, Try again later!`);
    }
  }

  public convertArrayToObject(fields: GridDetailConfig[], element: any): any {
    let iURL = (element.media.isPrimaryImage) ? environment.imageURL.replace("{stoneId}", element.stoneId.toLowerCase()) : "";
    let cURL = (element.media.isCertificate) ? environment.certiURL.replace("{certiNo}", element.certificateNo) : "";
    let vURL = (element.media.isHtmlVideo) ? environment.videoURL.replace("{stoneId}", element.stoneId.toLowerCase()) : "";;
    var obj: any = {};
    for (let i = 0; i < fields.length; i++) {
      let field = fields[i];
      if (!(field.title == "Checkbox" || field.title == "Analytic")) {
        if (field.title == "Media") {
          obj["CertificateUrl"] = cURL;
          obj["ImageUrl"] = iURL;
          obj["VideoUrl"] = vURL;
        }
        else if (field.propertyName.includes("measurement")) {
          let propertyname = field.propertyName.split(".")[1];
          obj[field.title] = element.measurement[propertyname];
        }
        else if (field.propertyName.includes("inclusion")) {
          let propertyname = field.propertyName.split(".")[1];
          obj[field.title] = element.inclusion[propertyname];
        }
        else if (field.propertyName.includes("basePrice")) {
          let propertyname = field.propertyName.split(".")[1];
          obj[field.title] = element.basePrice[propertyname];
        }
        else if (field.propertyName.includes("price")) {
          let propertyname = field.propertyName.split(".")[1];
          obj[field.title] = element.price[propertyname];
        }
        else if (field.title.includes("Natts")) {
          if (element.inclusion.sideBlack != null && element.inclusion.centerBlack != null)
            obj[field.title] = element.inclusion.sideBlack + " - " + element.inclusion.centerBlack;
          else
            obj[field.title] = "-";
        }
        else if (field.title.includes("Girdle")) {
          if (element.measurement.minGirdle != null && element.measurement.maxGirdle != null)
            obj[field.title] = element.measurement.minGirdle + " - " + element.measurement.maxGirdle;
          else
            obj[field.title] = "-";
        }
        else if (field.title.includes("T. Base Disc"))
          obj[field.title] = element.tempBasePrice.discount;
        else if (field.title.includes("T. Main Disc"))
          obj[field.title] = element.tempPrice.discount;
        else if (field.title.includes("Diameter"))
          obj[field.title] = this.utilityService.getMesurmentString(element.shape, element.measurement.length, element.measurement.width, element.measurement.height);
        else
          obj[field.title] = element[field.propertyName];
      }
    }
    return obj;
  }

  public downloadAttachment() {
    this.spinnerService.show();
    let isExport: boolean = this.utilityService.exportAsExcelFile(this.excelFile, "Diamond_Excel");
    if (!isExport) {
      this.alertDialogService.show('File not found, Try again later');
      this.spinnerService.hide();
    } else
      this.spinnerService.hide();
  }
  //#endregion

  public setupURL(stoneId: string, type: string) {
    var url = '';
    if (stoneId) {
      if (type == "image")
        url = environment.imageURL.replace('{stoneId}', stoneId.toLowerCase());
      else if (type == "video")
        url = environment.videoURL.replace('{stoneId}', stoneId.toLowerCase());
      else if (type == "certificate")
        url = environment.certiURL.replace('{certiNo}', stoneId);
      else
        return "";
    }
    else
      return "";

    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  public async showTempDisc() {
    try {
      await this.getTempDatasByStoneId(this.mySelection);
    }
    catch (error) {
      console.error(error);
      this.alertDialogService.show(`Data update fail, Try again later!`);
    }
  }

  public async getTempDatasByStoneId(stoneIds: string[]) {
    try {

      this.spinnerService.show();
      this.listTempPriceData = await this.pricingRequestService.getTempDatasByStoneId(stoneIds);
      if (this.listTempPriceData) {
        this.gridViewTemp = process(this.listTempPriceData, { group: this.groups });
      }
      this.showTempData = true;
      this.spinnerService.hide();
    } catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Temp Data not get, Try aagain!')
    }
  }

  public closeTempshowDialog(): void {
    this.listTempPriceData = [];
    this.showTempData = false;
  }

  public async syncInvSpecialStones() {
    try {
      this.alertDialogService.ConfirmYesNo("Are you sure you want to sync special stones?", "Sync")
        .subscribe(async (res: any) => {
          if (res.flag) {
            this.spinnerService.show();
            var result = await this.pricingRequestService.syncInvSpecialStones();
            if (result) {
              this.spinnerService.hide();
              this.alertDialogService.show(`Special Stones Sync Successfully!`);
            }
          }
        });
    }
    catch (error) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(`Data update fail, Try again later!`);
    }
  }
}
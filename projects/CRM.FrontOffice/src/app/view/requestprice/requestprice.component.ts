import { ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { DataResult, GroupDescriptor, process } from '@progress/kendo-data-query';
import { GridDetailConfig, MfgInclusionData, MfgMeasurementData, MfgPricingRequest, PricingDiscountApiResponse, PricingMarketSheetRequest, PricingMarketSheetResponse } from 'shared/businessobjects';
import { fxCredential, GridConfig, GridMasterConfig, InclusionConfig, MasterDNorm, MeasurementConfig } from 'shared/enitites';
import { ConfigService, listPriceRequestFilterTypeItems, listColorMarkItems, PricingService, StoneStatus, UtilityService, InvHistoryAction } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { NgxSpinnerService } from 'ngx-spinner';
import { InventorySearchCriteria, InventorySummary, PriceAnalyticsRequest, PriceReqResponse, PriceRequestApiModel, TempPricingRequest, UpdateTempPricingRequest } from '../../businessobjects';
import { CommuteService, GradingService, GridPropertiesService, InvHistoryService, InventoryService, MasterConfigService, PendingPricingService, PricingConfigService, PricingRequestService, SpecialstonecriteriaService, SupplierService, UserPricingCriteriaService } from '../../services';
import { InvHistory, InventoryItemInclusion, InventoryItemMeasurement, InventoryItems, PriceDNorm, PricingConfig, PricingHistory, PricingRequest, SpecialStoneCriteria, Supplier, SupplierDNorm, UserPricingCriteria } from '../../entities';
import { environment } from 'environments/environment.prod';
import { keys } from 'shared/auth';
import { GradingMaster } from '../../entities/grading/gradingmaster';

@Component({
  selector: 'app-requestprice',
  templateUrl: './requestprice.component.html',
  styleUrls: ['./requestprice.component.css']
})
export class RequestPriceComponent implements OnInit {
  //#region Grid Init
  public groups: GroupDescriptor[] = [];
  public pageSize = 25;
  public skip = 0;
  public fields!: GridDetailConfig[];
  public gridView?: DataResult;
  public isRegEmployee: boolean = false;
  public filterFlag = true;
  public selectableSettings: SelectableSettings = { mode: 'multiple' };
  public skeletonArray = new Array(18);
  public mySelection: string[] = [];
  public isShowCheckBoxAll: boolean = true;
  //#endregion

  //#region Grid Config
  public isGridConfig: boolean = false;
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
  public listPricingRequests: PricingRequest[] = [];
  public selectedPricingRequests: PricingRequest[] = [];

  public priceReqResponse: PriceReqResponse = new PriceReqResponse();

  public employeeCriteriaData: UserPricingCriteria[] = [];
  public selectedSlots: UserPricingCriteria[] = [];

  public listPriceRequestFilterTypeItems = listPriceRequestFilterTypeItems;
  public selectedBranchDNormItems: { text: string | null, value: string | null } = { text: 'Pricing', value: 'Pricing' };

  public listPricingHistory: PricingHistory[] = [];
  public inventorySearchCriteriaObj: InventorySearchCriteria = new InventorySearchCriteria();

  public inventoryItems: InventoryItems[] = [];
  // public priceAnalytics: InventoryItems[] = [];
  public allTheLab!: MasterDNorm[];
  public allTheShapes!: MasterDNorm[];
  public allColors!: MasterDNorm[];
  public allClarities!: MasterDNorm[];
  public allTheFluorescences!: MasterDNorm[];
  public allTheCPS!: MasterDNorm[];

  public inclusionData: MasterDNorm[] = [];
  public measurementData: MasterDNorm[] = [];
  public inclusionConfig: InclusionConfig = new InclusionConfig();
  public measurementConfig: MeasurementConfig = new MeasurementConfig();

  public suppliers: Supplier[] = [];

  public listColorMarkItems = listColorMarkItems;
  public selectedColorMark: string = '';

  public summaryData: InventorySummary = new InventorySummary();

  public excelOption!: string | null;
  public excelFile: any[] = [];

  public specialStoneCriteriaData: SpecialStoneCriteria[] = [];

  public gradingMasterItem: GradingMaster[] = [];

  public pricingConfig: PricingConfig = new PricingConfig();

  public applyPriceData: { total: number, valid: number, success: number, fail: number, pending: number } = { total: 0, valid: 0, success: 0, fail: 0, pending: 0 };
  public applyPriceErrorData: { stonId: string, msg: string, code: number }[] = [];

  public selectedPriceReq: PricingRequest = new PricingRequest();
  public priceAnalyticsRequest: PriceAnalyticsRequest = new PriceAnalyticsRequest();

  public isSummaryLoading = false;
  //#endregion

  public discOption: string | null = 'plus';
  public bulkDisc: number | null = null
  // public priceChangableStonesStatus: string[] = ['stock', 'stockonhand', 'noncertified']

  constructor(private pricingRequestService: PricingRequestService,
    private formBuilder: UntypedFormBuilder,
    public utilityService: UtilityService,
    private spinnerService: NgxSpinnerService,
    private configService: ConfigService,
    private gridPropertiesService: GridPropertiesService,
    private alertDialogService: AlertdialogService,
    private sanitizer: DomSanitizer,
    private employeeCriteriaService: UserPricingCriteriaService,
    private pricingService: PricingService,
    private changeDetRef: ChangeDetectorRef,
    private masterConfigService: MasterConfigService,
    private gradingService: GradingService,
    private supplierService: SupplierService,
    private pricingConfigService: PricingConfigService,
    private specialstonecriteriaService: SpecialstonecriteriaService,
    private inventoryService: InventoryService,
    private pendingPricingService: PendingPricingService,
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
    await this.getGridConfiguration();
    await this.getSpecialStoneCriteriaData();
    await this.getMasterConfigData();
    await this.getUserPricingCriteriaData(this.fxCredentials.id);
    await this.getPricingConfig();
    await this.getSupplierDetail();
    await this.getPriceRequestData();
    this.getSummaryData();
  }

  public async getGridConfiguration() {
    try {
      this.gridConfig = await this.configService.getGridConfig(this.fxCredentials?.id ?? '', "PriceRequest", "PriceRequestGrid", this.gridPropertiesService.getPriceRequestGrid());
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
        this.gridMasterConfigResponse = await this.configService.getMasterGridConfig("PriceRequest", "PriceRequestGrid");
        if (this.gridMasterConfigResponse)
          this.fields = this.gridMasterConfigResponse.gridDetail;
        else
          this.fields = await this.gridPropertiesService.getPriceRequestGrid();
      }
    }
    catch (error: any) {
      this.alertDialogService.show(error);
      this.spinnerService.hide();
    }
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

  public async getMasterConfigData() {
    //Master Config
    let masterConfigList = await this.masterConfigService.getAllMasterConfig();
    this.allTheShapes = this.utilityService.sortingMasterDNormPriority(masterConfigList.shape);
    this.allColors = this.utilityService.sortingMasterDNormPriority(masterConfigList.colors);
    this.allClarities = this.utilityService.sortingMasterDNormPriority(masterConfigList.clarities);
    this.allTheFluorescences = this.utilityService.sortingMasterDNormPriority(masterConfigList.fluorescence);
    this.allTheCPS = this.utilityService.sortingMasterDNormPriority(masterConfigList.cps);
    this.allTheLab = this.utilityService.sortingMasterDNormPriority(masterConfigList.lab);

    this.inclusionData = masterConfigList.inclusions;
    this.measurementData = masterConfigList.measurements;

    this.inclusionConfig = masterConfigList.inclusionConfig;
    this.measurementConfig = masterConfigList.measurementConfig;
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

  public async getPricingConfig() {
    try {
      this.pricingConfig = await this.pricingConfigService.getPricingConfigData();
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
      req.slots = this.employeeCriteriaData;
      req.systemUserId = this.fxCredentials.id;
      req.skip = this.skip;
      req.take = this.pageSize;
      req.type = 'Pricing';

      this.summaryData = await this.pricingRequestService.getSummary(req);
      this.mySelection = [];
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
      req.slots = this.employeeCriteriaData;
      req.systemUserId = this.fxCredentials.id;
      req.skip = this.skip;
      req.take = this.pageSize;
      req.type = 'Pricing';

      let res = await this.pricingRequestService.getPricingRequest(req);
      if (res) {
        this.priceReqResponse = res;
        this.listPricingRequests = res.priceRequest;
        this.listPricingRequests.forEach(z => {
          z.days = this.utilityService.calculateDayDiff(z.marketSheetDate ?? new Date());
          if (z.expiryDate.toString() == "0001-01-01T00:00:00" || z.expiryDate.toString() == "0001-01-01T00:00:00Z")
            z.expiryDate = null as any;
          let allIndex = this.allPricingRequests.findIndex(a => a.stoneId == z.stoneId);
          if (allIndex == -1)
            this.allPricingRequests.push(JSON.parse(JSON.stringify(z)));
        });
        this.gridView = process(this.listPricingRequests, { group: this.groups });
        this.gridView.total = res.total;

        this.getGradingData(this.listPricingRequests);

        this.closeSlotFilterDialog();
        this.spinnerService.hide();
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

  public async onFilterChange(e: any) {
    this.spinnerService.show();
    this.filterReq = e;
    this.skip = 0;
    this.inventorySearchCriteriaObj = this.filterReq.invFilter;
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
        this.utilityService.filterFromToDecimalValues(target.availableDays, z.fromADays, z.toADays)
      );

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

  public async getGradingData(priceReq: PricingRequest[]) {
    let Ids = priceReq.map(z => z.stoneId);
    var exists = this.gradingMasterItem.filter(z => Ids.includes(z.stoneId));
    if (Ids.length != exists.length) {
      var distinctSuppliers = priceReq.map((u: PricingRequest) => u.supplier?.code).filter((x: any, i: any, a: any) => x && a.indexOf(x) === i);
      for (let i = 0; i < distinctSuppliers.length; i++) {
        var z = distinctSuppliers[i];
        var supplierDetail = this.suppliers.find(a => a.code == z);
        if (supplierDetail) {
          if (supplierDetail.apiPath) {
            let newData = await this.gradingService.GetGradingFromStoneIds(Ids, supplierDetail.apiPath);
            newData = newData.filter(z => z.rapVer == 'InvUpload');
            this.gradingMasterItem.push(...newData);
          } else
            this.alertDialogService.show(supplierDetail.name + ' supplier api not found, Please contact administrator!');
        } else
          this.alertDialogService.show(z + ' supplier not found, Please contact administrator!');

      }
    }
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
  public cellClickHandler(e: any) {
    if (!e.isEdited)
      e.sender.editCell(e.rowIndex, e.columnIndex, this.createFormGroup(e.dataItem));
  }

  public createFormGroup(dataItem: any): UntypedFormGroup {
    if (dataItem.status == StoneStatus.Arrival.toString()) {
      return this.formBuilder.group({
        tempBaseDisc: dataItem.tempBasePrice.discount,
        pricingComment: dataItem.pricingComment
      });
    }
    else if (dataItem.status == StoneStatus.Stock.toString()) {
      return this.formBuilder.group({
        tempDisc: dataItem.tempPrice.discount,
        pricingComment: dataItem.pricingComment
      });
    }
    else {
      return this.formBuilder.group({
        tempDisc: dataItem.tempPrice.discount,
        tempBaseDisc: dataItem.tempBasePrice.discount,
        pricingComment: dataItem.pricingComment
      });
    }
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
        if (dataItem.expiryDate == null)
          dataItem.expiryDate = this.setNewExpiryDate();

        let result: boolean = false;
        if (dataItem.tempPrice.discount != formGroup.value.tempDisc || dataItem.tempBasePrice.discount != formGroup.value.tempBaseDisc) {
          var validchange = this.CheckValidDiscountChanges(formGroup.value, dataItem);
          if (!validchange) {
            this.alertDialogService.show(`You can't change this discount on this status!`);
            return;
          }

          if (dataItem.tempPrice.discount != formGroup.value.tempDisc) {
            //dataItem = await this.checkNewRap(dataItem);
            if (dataItem) {
              dataItem.tempPrice.discount = formGroup.value.tempDisc;
              dataItem = await this.checkValidLimitation(dataItem);
              if (dataItem.isValid != null)
                dataItem = this.calculateRapPricing(dataItem);
            }
          }
          else if (dataItem.tempBasePrice.discount != formGroup.value.tempBaseDisc) {
            //dataItem = await this.checkNewRap(dataItem);
            if (dataItem) {
              dataItem.tempBasePrice.discount = formGroup.value.tempBaseDisc;
              dataItem = this.calculateRapPricing(dataItem);
            }
          }


          let updateData = this.mappingUpdateTempPricingReq(dataItem);
          result = await this.pricingRequestService.updateOnePricingRequest(updateData);
          if (result)
            this.insertInvItemHistoryList([updateData.stoneId], InvHistoryAction.DiscColorMarkChanged, `Updated the Disc Color Mark from the Pricing Request Page for stone`);

        }
        else {
          let updateData = this.mappingUpdateTempPricingReq(dataItem);
          result = await this.pricingRequestService.updateOnePricingRequest(updateData);
          if (result)
            this.insertInvItemHistoryList([updateData.stoneId], InvHistoryAction.DiscColorMarkChanged, `Updated the Disc Color Mark from the Pricing Request Page for stone`);
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

  public mappingUpdateTempPricingReq(item: PricingRequest, colorUpdate = false): UpdateTempPricingRequest {
    let data = new UpdateTempPricingRequest();
    data.stoneId = item.stoneId;
    data.tempBasePrice = item.tempBasePrice;
    data.tempPrice = item.tempPrice;
    data.isValid = item.isValid;
    data.pricingComment = item.pricingComment;
    data.expiryDate = item.expiryDate;
    data.updatedBy = this.fxCredentials.id;
    data.discColorMark = item.discColorMark;
    data.canUpdateColor = colorUpdate;
    return data;
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
      incusion.GirdleCond = [item.inclusion.girdleCondition?.toUpperCase()];
      incusion.EFOC = item.inclusion.efoc;
      incusion.EFOP = item.inclusion.efop;
      incusion.Culet = item.inclusion.culet;
      incusion.HNA = item.inclusion.hna;
      incusion.EyeClean = item.inclusion.eyeClean;

      incusion.KToS = [];
      let ktos = item.inclusion.ktoS?.split(',');
      if (ktos && ktos.length > 0) {
        for (let index = 0; index < ktos.length; index++) {
          const element = ktos[index];
          incusion.KToS.push(element.trim());
        }
      }

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

  public CheckValidDiscountChanges(values: any, invs: PricingRequest): boolean {
    let flag = true;
    if (invs.tempPrice.discount != values.tempDisc) {
      if (invs.status == StoneStatus.Arrival.toString())
        flag = false;
    }
    else if (invs.tempBasePrice.discount != values.tempBaseDisc) {
      if (invs.status == StoneStatus.Stock.toString())
        flag = false;
    }
    return flag;
  }

  public async updateBulkDiscountManual(isPriceDiscount: boolean) {
    try {
      let type = 'Base';
      if (isPriceDiscount)
        type = 'Main';

      this.alertDialogService.ConfirmYesNo("Are you sure you want to bulk update discount?", "Update " + type + ' Discount')
        .subscribe(async (res: any) => {
          if (res.flag) {
            let statusFail = 0;
            this.spinnerService.show();
            let listPricingRequests = this.allPricingRequests.filter(z => this.mySelection.includes(z.stoneId));
            for (let index = 0; index < listPricingRequests.length; index++) {
              let z = listPricingRequests[index];
              if (isPriceDiscount) {
                if (z.status != StoneStatus.Arrival.toString()) {
                  if (this.discOption == 'plus')
                    z.tempPrice.discount = (parseFloat(z.tempPrice.discount?.toString() ?? '0') + parseFloat(this.bulkDisc?.toString() ?? '0'));
                  else
                    z.tempPrice.discount = parseFloat(this.bulkDisc?.toString() ?? '0');
                }
                else
                  statusFail++;
              }
              else {
                if (z.status != StoneStatus.Stock.toString()) {
                  if (this.discOption == 'plus')
                    z.tempBasePrice.discount = (parseFloat(z.tempBasePrice.discount?.toString() ?? '0') + parseFloat(this.bulkDisc?.toString() ?? '0'));
                  else
                    z.tempBasePrice.discount = parseFloat(this.bulkDisc?.toString() ?? '0');
                }
                else
                  statusFail++;
              }
              z = this.calculateRapPricing(z);

              if (z.expiryDate == null)
                z.expiryDate = this.setNewExpiryDate();

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
                this.allPricingRequests[allIndex].tempBasePrice = JSON.parse(JSON.stringify(z.tempBasePrice));
                this.allPricingRequests[allIndex].tempPrice = JSON.parse(JSON.stringify(z.tempPrice));
                this.allPricingRequests[allIndex].isValid = z.isValid;
              }
            });

            if (listPricingRequests.length == statusFail) {
              this.alertDialogService.show(`You can't change this discount on this status!`);
              this.spinnerService.hide();
            }
            else {
              let updateData: UpdateTempPricingRequest[] = [];

              listPricingRequests.forEach(z => { updateData.push(this.mappingUpdateTempPricingReq(z)); });
              let result = await this.pricingRequestService.updatePricingRequest(updateData);
              if (result) {
                this.insertInvItemHistoryList(updateData.map(a => a.stoneId), InvHistoryAction.PriceRequestChanged, `Updated the stone Price from the Pricing Request Page for stone`);
                this.utilityService.showNotification(`Data updated successfully!`);
                this.spinnerService.hide();
                await this.getPriceRequestData();
                this.getSummaryData();
              }
              else {
                this.spinnerService.hide();
                this.alertDialogService.show(`Data update fail, Try again later!`);
              }

              if (statusFail > 0)
                this.utilityService.showNotification(statusFail + ` stone(s) can't change on their status!`, 'warning');
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
      let failResCount: number = 0;

      if (type == 'Base')
        failResCount = await this.calculateBasePricing(listPricingRequests);
      else
        failResCount = await this.calculateMarketSheetPricing(listPricingRequests);

      if (failResCount == listPricingRequests.length) {
        this.utilityService.showNotification(`No rap discount not found!`, 'warning');
        this.spinnerService.hide();
        return;
      }
      else if (failResCount > 0)
        this.utilityService.showNotification(failResCount + ` rap discount not found!`, 'warning');

      listPricingRequests.forEach(z => {
        if (z.expiryDate == null)
          z.expiryDate = this.setNewExpiryDate();
      });

      let updateData: UpdateTempPricingRequest[] = [];
      listPricingRequests.forEach(z => { updateData.push(this.mappingUpdateTempPricingReq(z)); });
      let result = await this.pricingRequestService.updatePricingRequest(updateData);
      if (result) {
        this.insertInvItemHistoryList(updateData.map(a => a.stoneId), InvHistoryAction.PriceRequestChanged, `Updated the stone Price from the Pricing Request Page for stone`);
        //await this.getSummaryData();
        await this.getPriceRequestData();
        this.utilityService.showNotification(`Data updated successfully!`);
        this.spinnerService.hide();
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

  public async calculateBasePricing(listPricingRequests: PricingRequest[]): Promise<number> {
    let reqList: MfgPricingRequest[] = [];
    let response: PricingDiscountApiResponse[] = [];
    let failResCount: number = 0;

    listPricingRequests.forEach(z => {
      reqList.push(this.mappingPricingRequestData(z));
    });

    response = await this.pricingService.getBasePrice(reqList);
    if (response && response.length > 0) {
      for (let index = 0; index < listPricingRequests.length; index++) {
        let z = listPricingRequests[index];
        if (z.status != StoneStatus.Stock.toString()) {
          let target = response.find(a => a.id == z.stoneId);
          if (target && target.rapPrice != null && target.rapPrice > 0) {
            if (target.error == null) {
              target = this.utilityService.setAmtForPricingDiscountResponse(target, z.weight);
              z.tempBasePrice.rap = target.rapPrice;
              z.tempBasePrice.discount = target.discount;
              z.tempBasePrice.netAmount = target.amount;
              z.tempBasePrice.perCarat = target.dCaret;

              z.identity.id = this.fxCredentials.id;
              z.identity.name = this.fxCredentials.fullName;
              z.identity.type = "Pricing";
              z.createdBy = this.fxCredentials.id;
            }
            else {
              z.tempBasePrice.rap = target.rapPrice;
              failResCount++;
            }
            let tempPrice = this.allPricingRequests.find(a => a.stoneId == z.stoneId)?.tempPrice;
            z.tempPrice = tempPrice ?? new PriceDNorm();
          }
          else
            failResCount++;
        }
      }

      //Update in All Pricing
      this.allPricingRequests.forEach(z => {
        let newData = listPricingRequests.find(a => a.stoneId == z.stoneId);
        if (newData != null)
          z.tempBasePrice = newData.tempBasePrice;
      });
    }

    return failResCount;
  }

  public async calculateMarketSheetPricing(listPricingRequests: PricingRequest[]): Promise<number> {
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
        if (z.status != StoneStatus.Arrival.toString()) {
          let target = response.find(a => a.id == z.stoneId);
          if (target && target.rapPrice != null && target.rapPrice > 0) {
            if (target.error == null) {
              target = this.utilityService.setAmtForPricingMarketSheetDiscountResponse(target, z.weight);
              z.tempPrice.rap = target.rapPrice;
              // let specialStoneDiscount = await this.getSpecialStoneDiscountBySlot(z)
              // console.log("==>", z)
              // if (this.specialStoneCriteriaobj.discount != null && z.tempPrice.discount)
              //   z.tempPrice.discount = (Number(z.tempPrice.discount) + Number(this.specialStoneCriteriaobj.discount));
              // else
              z.tempPrice.discount = target.discount;
              z.tempPrice.netAmount = target.amount;
              z.tempPrice.perCarat = target.dCaret;

              z.identity.id = this.fxCredentials.id;
              z.identity.name = this.fxCredentials.fullName;
              z.identity.type = "Pricing";
              z.createdBy = this.fxCredentials.id;

              failResCount--;
            }
            else {
              z.tempPrice.rap = target.rapPrice;
              z.tempPrice.discount = null as any;
            }

            let tempBasePrice = this.allPricingRequests.find(a => a.stoneId == z.stoneId)?.tempBasePrice;
            z.tempBasePrice = tempBasePrice ?? new PriceDNorm();
            failResCount++;
          }
        }
      }
    }
    listPricingGradeRequests = await this.checkValidLimitationBulk(listPricingGradeRequests);
    listPricingGradeRequests = await this.ApplySpecialStoneCriteriaForDiscount(listPricingGradeRequests);

    //Update in All Pricing
    this.allPricingRequests.forEach(z => {
      let newData = listPricingGradeRequests.find(a => a.stoneId == z.stoneId);
      if (newData != null) {
        z.tempPrice = newData.tempPrice;
        z.isValid = newData.isValid;
      }
    });

    return failResCount;
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

    let day = 0;
    if (z.status != StoneStatus.Lab.toString() && z.status != StoneStatus.Arrival.toString())
      day = z.availableDays;
    //day = this.utilityService.calculateAvailableDateDiff(z.marketSheetDate ?? new Date(), z.holdDays, z.isHold == true ? z.holdDate : null);      

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
      Day: day,
      InclusionPrice: inclusion,
      MeasurePrice: mesurement
    };

    return req;
  }

  public async checkValidLimitation(target: PricingRequest): Promise<PricingRequest> {
    var data = this.employeeCriteriaData.find(z => z.minWeight <= target.weight && z.maxWeight >= target.weight &&
      this.utilityService.filterArrayString(target.shape, z.shape) &&
      this.utilityService.filterArrayString(target.lab, z.lab, true) &&
      this.utilityService.filterArrayStringColor(target.color, z.color) &&
      this.utilityService.filterArrayString(target.clarity, z.clarity) &&
      this.utilityService.filterArrayString(target.cut, z.cut, true) &&
      this.utilityService.filterArrayString(target.polish, z.polish) &&
      this.utilityService.filterArrayString(target.symmetry, z.symmetry) &&
      this.utilityService.filterArrayString(target.fluorescence, z.fluorescence));

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
    }
    else
      target.isValid = false;

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

  public calculateRapPricing(target: PricingRequest): PricingRequest {
    const rap = target.basePrice.rap;
    let disc = target.tempBasePrice.discount;
    if (rap && disc) {
      if (disc.toString() != '-') {

        disc = parseFloat(disc.toString());
        let weight = target.weight;
        let stoneRap = weight * rap;
        let calDiscount = 100 + disc;
        let netAmount = (calDiscount * stoneRap) / 100;

        target.tempBasePrice.rap = rap;
        target.tempBasePrice.netAmount = this.utilityService.ConvertToFloatWithDecimal(netAmount);
        let perCarat = netAmount / weight;
        target.tempBasePrice.perCarat = this.utilityService.ConvertToFloatWithDecimal(perCarat);
      }
    }

    disc = target.tempPrice.discount;
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

  public async checkNewRapForPriceRequest(item: PricingRequest[]): Promise<PricingRequest[]> {
    try {

      let reqList: PricingMarketSheetRequest[] = [];
      item.forEach(z => {
        reqList.push(this.mappingMarketSheetPricing(z));
      });

      let response = await this.pricingService.getMarketSheetPrice(reqList);
      if (response && response.length > 0) {
        item.forEach(z => {
          let target = response.find(a => a.id == z.stoneId);
          if (target && target.rapPrice != null && target.rapPrice > 0) {
            z.basePrice.rap = target.rapPrice;
            z.price.rap = target.rapPrice;
            z = this.calculateRapPricing(z);
          }
        });
      }
      return item;
    } catch (error: any) {
      console.error(error);
      this.alertDialogService.show('Pricing request not call from MFG, Try again later!');
      return [];
    }
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
    this.alertDialogService.ConfirmYesNo("Are you sure you want to apply discount?", "Update")
      .subscribe(async (res: any) => {
        try {
          if (res.flag) {
            this.spinnerService.show();
            this.applyPriceErrorData = [];
            this.applyPriceData = { total: 0, valid: 0, success: 0, fail: 0, pending: 0 };
            let updatedData = await this.getSelectedValidStoneData();
            if (updatedData.length > 0) {
              this.applyPriceData.valid = updatedData.length;
              updatedData.forEach(z => {
                z.identity.id = this.fxCredentials.id;
                z.identity.name = this.fxCredentials.fullName;
                z.identity.type = "Pricing";
                if (z.expiryDate == null)
                  z.expiryDate = this.setNewExpiryDate();
              });
              let result: number = 0;

              //Update Latest Rap
              updatedData = await this.checkNewRapForPriceRequest(updatedData);

              //Check For Batch Wise data update
              if (updatedData.length > keys.batchWiseSaveLimit) {
                let batches = Math.ceil(updatedData.length / keys.batchWiseSaveLimit);

                for (let index = 0; index < batches; index++) {
                  let startIndex = keys.batchWiseSaveLimit * index;
                  let batchData = updatedData.slice(startIndex, startIndex + keys.batchWiseSaveLimit);
                  result += await this.onApplyChangesByBatch(batchData);
                }
              }
              else
                result = await this.onApplyChangesByBatch(updatedData);

              if (result) {
                this.showApplyMessage();
                this.SendNotificationForPriceRequest(updatedData.map(z => z.stoneId));
                await this.getPriceRequestData();
                this.getSummaryData();
              }
              else {
                this.alertDialogService.show(`Data update fail, Try again later!`);
                this.spinnerService.hide();
              }
            }
            else {
              if (this.applyPriceErrorData.length > 0)
                this.showApplyMessage();

              this.spinnerService.hide();
            }
          }
        }
        catch (error) {
          this.spinnerService.hide();
          console.error(error);
          this.alertDialogService.show(`Data update fail, Try again later!`);
        }
      });
  }

  public async onApplyChangesByBatch(pricing: PricingRequest[]): Promise<number> {
    try {
      let validPricingData: PricingRequest[] = JSON.parse(JSON.stringify(pricing));
      let stoneIds = pricing.map(z => z.stoneId);

      //Check For Hold Stone Data to insert pending pricing
      var getHoldStoneIds = await this.inventoryService.getHoldStoneForPriceRequest(stoneIds);
      if (getHoldStoneIds && getHoldStoneIds.length) {
        let pendingPricing = validPricingData.filter(z => getHoldStoneIds.includes(z.stoneId));
        //Insert Pending Pricing For Hold Stones
        let res = await this.pendingPricingService.insertPendingPricing(pendingPricing);
        if (res) {
          // this.utilityService.showNotification(pendingPricing.length + ' Stone(s) updated in pending pricing!');
          this.applyPriceData.pending += pendingPricing.length;
          //Remove Hold Stone Data (Do not update price on backoffice if stone is in hold)
          validPricingData = validPricingData.filter(z => !getHoldStoneIds.includes(z.stoneId));
        }
      }

      if (validPricingData.length > 0) {
        //Update Inventory Item Data in BackOffice | FrontOffice
        let supplierRes = await this.updateInventory(validPricingData);
        if (supplierRes) {
          //Remove Price Request Data
          this.applyPriceData.success += validPricingData.length;
          return await this.pricingRequestService.removePricingRequest(pricing);
        }
        else {
          console.error(`Pricing request not updated from updateInventory`);
          this.spinnerService.hide();
        }
      }
      else {
        //Remove Price Request Data
        return await this.pricingRequestService.removePricingRequest(pricing);
      }
      return 0;
    }
    catch (error) {
      this.spinnerService.hide();
      console.error(error);
      this.alertDialogService.show(`Data update fail, Try again later!`);
      return 0;
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

    //Check IsValid flag again
    updatedData = await this.checkValidLimitationBulk(updatedData);

    updatedData = updatedData.filter(z => this.checkLabValidation(z, this.pricingConfig.baseDiscountDifference ?? 0));

    return updatedData;
  }

  public async checkValidLimitationBulk(targets: PricingRequest[]): Promise<PricingRequest[]> {
    let validPricingRequest: PricingRequest[] = [];
    try {
      let getHistoryData: { inv: PricingRequest, criteria: UserPricingCriteria }[] = [];
      for (let index = 0; index < targets.length; index++) {
        const target = targets[index];
        var data = this.employeeCriteriaData.find(z => z.minWeight <= target.weight && z.maxWeight >= target.weight &&
          this.utilityService.filterArrayString(target.shape, z.shape) &&
          this.utilityService.filterArrayString(target.lab, z.lab, true) &&
          this.utilityService.filterArrayStringColor(target.color, z.color) &&
          this.utilityService.filterArrayString(target.clarity, z.clarity) &&
          this.utilityService.filterArrayString(target.cut, z.cut, true) &&
          this.utilityService.filterArrayString(target.polish, z.polish) &&
          this.utilityService.filterArrayString(target.symmetry, z.symmetry) &&
          this.utilityService.filterArrayString(target.fluorescence, z.fluorescence));

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
            this.applyPriceErrorData.push({ stonId: target.stoneId, msg: "not valid difference from previous pricing", code: 2 });
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

  private async updateInventory(pricing: PricingRequest[]): Promise<boolean> {
    try {
      let res = false;
      var distinctSuppliers = pricing.map((u: PricingRequest) => u.supplier?.code).filter((x: any, i: any, a: any) => x && a.indexOf(x) === i);
      for (let i = 0; i < distinctSuppliers.length; i++) {
        var z = distinctSuppliers[i];
        var supplierDetail = this.suppliers.find(a => a.code == z);
        if (supplierDetail) {
          if (supplierDetail.apiPath) {
            var pricingBySuppliers = pricing.filter(a => a.supplier?.code == z);
            res = await this.updateSupplierInventory(pricingBySuppliers, supplierDetail.apiPath);
            if (!res) {
              this.applyPriceData.fail += pricingBySuppliers.length;
              return res;
            }
          } else {
            this.applyPriceData.fail += pricing.filter(a => a.supplier?.code == z).length;
            console.error(supplierDetail.name + ' supplier api not found');
            return false;
          }
        } else {
          this.applyPriceData.fail += pricing.filter(a => a.supplier?.code == z).length;
          console.error(z + ' supplier not found, Please contact administrator!');
          return false;
        }
      }
      return res;
    }
    catch (error: any) {
      console.error(error);
      return false;
    }
  }

  private async updateSupplierInventory(pricing: PricingRequest[], api: string): Promise<boolean> {
    try {
      //Update in BackOffice Inventory
      let req = this.mappingSupplierPricingRequest(pricing);


      await this.insertInvItemHistoryList(pricing.map(x=>x.stoneId),"update-bo-inv" , JSON.stringify(pricing));
      //In 'res' only Lab status inventory come for update / insert in Frontoffice as Stock
      var res = await this.commuteService.updatePricingRequest(req, api);

      //Update / Insert in Front Office Inventory if Request is Lab
      if (res.isSuccess && res.data && res.data.length > 0) {
        let invs: InventoryItems[] = [];
        res.data.forEach((z: any) => {
          let inv: InventoryItems = new InventoryItems();
          inv = JSON.parse(JSON.stringify(z));

          let supplierData = this.suppliers.find(a => a.code == z.stoneOrg.orgCode);
          if (supplierData) {
            let supplier: SupplierDNorm = {
              id: supplierData.id,
              name: supplierData.name,
              code: supplierData.code,
              person: supplierData.person,
              phoneNo: supplierData.phoneNo,
              email: supplierData.email,
              address: supplierData.address
            };

            inv.id = null as any;
            inv.supplier = supplier;
            invs.push(inv);
          }
        });

        //This happend if backoffice's Stone(s) orgCode is null or empty
        if (res.data.length != invs.length) {
          await this.commuteService.reverseUpdatePricingRequest(req, api);
          return res.isSuccess = false;
        }

        invs.forEach((inv: InventoryItems) => {
          if (inv.supplier.address) {
            if (inv.location != inv.supplier.address?.country)
              inv.location = inv.supplier.address?.country;
          }

          const matchRes = pricing.find((res) => res.stoneId === inv.stoneId);
          if (matchRes)
            inv.isSpecialStone = matchRes?.isSpecialStone;
            inv.isDOrder = matchRes?.isDOrder ?? false;
        });

        res.isSuccess = await this.pricingRequestService.insertInventoryItem(invs);
      }

      await this.insertInvItemHistoryList(pricing.map(x=>x.stoneId),"update-after-bo-inv" , JSON.stringify(res));
      return res.isSuccess;
    }
    catch (error: any) {
      console.error(error);
      return false;
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
      obj.pricingComment = z.pricingComment;
      obj.discColorMark = z.discColorMark;

      pricingReq.push(obj);
    });

    return pricingReq;
  }

  private checkLabValidation(filter: PricingRequest, discDiffrence: number): boolean {
    let flag = true;

    //Check isValid flag on tempPrice discount
    if (filter.tempPrice.discount != null) {
      if (!filter.isValid)
        return false;
    }

    //check discDiffrence & nullable temp data
    if (filter.status == StoneStatus.Lab.toString()) {
      flag = (filter.tempPrice.discount != null && filter.tempBasePrice.discount != null);
      if (flag && filter.lab != 'NC') {
        let pDisc = parseFloat((filter.tempPrice.discount ?? 0).toString());
        let bDisc = parseFloat((filter.tempBasePrice.discount ?? 0).toString());
        let discDiff = parseFloat(discDiffrence.toString());

        let diff = pDisc + discDiff;
        flag = (bDisc <= diff)
        if (!flag) {
          console.warn(filter.stoneId + ' | ' + bDisc.toString() + ' <= ' + diff.toString() + ' Disc Diffrence not Valid!' + ' Discount Difference = ' + discDiff.toString());
          this.applyPriceErrorData.push({ stonId: filter.stoneId, msg: "discount diffrence not valid!", code: 3 });
        }
      }
      else if (!flag)
        this.applyPriceErrorData.push({ stonId: filter.stoneId, msg: "temp discount not found!", code: 4 });

    } else {
      flag = (filter.tempPrice.discount != null || filter.tempBasePrice.discount != null);
      if (!flag)
        this.applyPriceErrorData.push({ stonId: filter.stoneId, msg: "temp discount not found!", code: 4 });
    }

    return flag;
  }

  public async SendNotificationForPriceRequest(stoneIds: string[]) {
    // var result = await this.inventoryService.getInventoryByStoneIds(stoneIds);
    // if (result) {
    //   let recevierIds = result.map((u: any) => u.identity.id).filter((x: any, i: any, a: any) => x && a.indexOf(x) === i);
    //   if (recevierIds && recevierIds.length > 0) {
    //     recevierIds.forEach(z => {
    //       let stoneIds = result.filter(a => a.identity.id == z).map(a => a.stoneId);
    //       let message: Notifications = ApplyPriceRequestTemplate(this.fxCredentials, z, stoneIds);
    //       this.notificationService.messages.next(message);
    //     });
    //   }
    // }
  }
  //#endregion

  //#region OnChange Functions
  public setNewExpiryDate(): Date {
    let today = new Date();
    today.setDate(today.getDate() + (this.pricingConfig.expirationDay ?? 0));
    return today;
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

  public getInvInclusionItem(stoneId: string): InventoryItemInclusion[] {
    let inclusionArray: InventoryItemInclusion[] = [];
    let inv = this.inventoryItems.find(z => z.stoneId == stoneId);
    if (inv)
      inclusionArray.push(inv.inclusion);
    else
      inclusionArray.push(this.allPricingRequests.find(z => z.stoneId == stoneId)?.inclusion ?? new InventoryItemInclusion());
    return inclusionArray;
  }

  public getInvMeasurementItem(stoneId: string): InventoryItemMeasurement[] {
    let measurementArray: InventoryItemMeasurement[] = [];
    let inv = this.inventoryItems.find(z => z.stoneId == stoneId);
    if (inv)
      measurementArray.push(inv.measurement);
    else
      measurementArray.push(this.allPricingRequests.find(z => z.stoneId == stoneId)?.measurement ?? new InventoryItemMeasurement());
    return measurementArray;
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
      this.spinnerService.show();

      let req: PriceRequestApiModel = this.filterReq;
      req.slots = this.employeeCriteriaData;
      req.systemUserId = this.fxCredentials.id;
      req.skip = 0;
      req.take = this.summaryData.totalCount;
      req.type = 'Pricing';

      let res = await this.pricingRequestService.getPricingRequest(req);
      if (res) {
        this.allPricingRequests = res.priceRequest;
        this.mySelection = [];
        this.mySelection = this.allPricingRequests.map(z => z.stoneId);
        this.spinnerService.hide();
      } else
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
      if (this.summaryData.totalCount > this.pageSize && isAll) {
        await this.loadAllInventories();
        this.isAllSelected = false;
      }
      else {
        if (isAll || this.summaryData.totalCount < this.pageSize)
          this.isAllSelected = false;
        else if (this.summaryData.totalCount > this.pageSize)
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
    if (!this.containsExcel(event.target)) {
      this.showExcelOption = false;
    }
  }

  private contains(target: any): boolean {
    return (
      this.anchor.nativeElement.contains(target) ||
      (this.popup ? this.popup.nativeElement.contains(target) : false)
    );
  }

  private containsExcel(target: any): boolean {
    return (
      this.anchorExcel.nativeElement.contains(target) ||
      (this.popupExcel ? this.popupExcel.nativeElement.contains(target) : false)
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
        z.discColorMark = this.selectedColorMark;
        if (z.expiryDate == null)
          z.expiryDate = this.setNewExpiryDate();
      });

      let updateData: UpdateTempPricingRequest[] = [];
      listPricingRequests.forEach(z => { updateData.push(this.mappingUpdateTempPricingReq(z, true)); });
      let result = await this.pricingRequestService.updatePricingRequest(updateData);
      if (result) {
        this.insertInvItemHistoryList(updateData.map(a => a.stoneId), InvHistoryAction.PriceRequestChanged, `Updated the stone Price from the Pricing Request Page for stone`);
        this.utilityService.showNotification(`Data updated successfully!`);
        this.spinnerService.hide();
        this.closeColorMarkDialog();
        this.mySelection = [];
        await this.getPriceRequestData();
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
    req.slots = this.employeeCriteriaData;
    req.systemUserId = this.fxCredentials.id;
    req.skip = 0;
    req.take = this.summaryData.totalCount;
    req.type = 'Pricing';

    let res = await this.pricingRequestService.getPricingRequest(req);
    if (res) {
      let exportData = res.priceRequest;
      if (exportData && exportData.length > 0) {
        if (this.excelOption == 'selected') {
          exportData = exportData.filter(item => this.mySelection.includes(item.stoneId));
        }

        exportData.forEach(element => {
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

  public convertArrayToObject(fields: GridDetailConfig[], element: any): any {
    let iURL = (element.media.isPrimaryImage) ? environment.imageURL.replace("{stoneId}", element.stoneId.toLowerCase()) : "";
    let cURL = (element.media.isCertificate) ? environment.certiURL.replace("{certiNo}", element.certificateNo) : "";
    let vURL = (element.media.isHtmlVideo) ? environment.videoURL.replace("{stoneId}", element.stoneId.toLowerCase()) : "";
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

  //#region Compare Lab Inv
  public getCompareRequestWithInvData(stoneId: String, type: string, typeTwo: string): string {
    let className = '';
    try {
      let tooltipData = '';
      let priceData = '';
      let prevIndex = null;
      let curIndex = null;
      prevIndex = 1;
      curIndex = 1;
      let InvUploadWeight: number = 0;
      let listData: MasterDNorm[] = [];

      var InvData = this.gradingMasterItem.find(z => z.stoneId == stoneId);
      if (InvData) {
        //Get 'Grading' Data. if not found then take 'InvUpload' data
        if (type == 'SHAPE') {
          priceData = this.listPricingRequests.find(z => z.stoneId == stoneId)?.shape ?? '';
          tooltipData = InvData?.shape ?? '';
          listData = this.allTheShapes;
        }
        else if (type == 'WEIGHT') {

          if (InvData?.weight > 0)
            InvUploadWeight = InvData.weight;
          tooltipData = InvUploadWeight.toString();

          if ((InvUploadWeight) > (this.listPricingRequests.find(z => z.stoneId == stoneId)?.weight ?? 0)) {
            prevIndex = 2;
            curIndex = 1;
          }
          if ((InvUploadWeight) < (this.listPricingRequests.find(z => z.stoneId == stoneId)?.weight ?? 0)) {
            prevIndex = 1;
            curIndex = 2;
          }
        }
        else if (type == 'COLOR') {
          priceData = this.listPricingRequests.find(z => z.stoneId == stoneId)?.color ?? '';
          tooltipData = InvData?.color ?? '';
          listData = this.allColors;
        }
        else if (type == 'CLARITY') {
          priceData = this.listPricingRequests.find(z => z.stoneId == stoneId)?.clarity ?? '';
          tooltipData = InvData?.clarity ?? '';
          listData = this.allClarities;
        }
        else if (type == 'CUT') {
          priceData = this.listPricingRequests.find(z => z.stoneId == stoneId)?.cut ?? '';
          tooltipData = InvData?.cut ?? '';
          listData = this.allTheCPS;
        }
        else if (type == 'POLISH') {
          priceData = this.listPricingRequests.find(z => z.stoneId == stoneId)?.polish ?? '';
          tooltipData = InvData?.polish ?? '';
          listData = this.allTheCPS;
        }
        else if (type == 'SYMMETRY') {
          priceData = this.listPricingRequests.find(z => z.stoneId == stoneId)?.symmetry ?? '';
          tooltipData = InvData?.symmetry ?? '';
          listData = this.allTheCPS;
        }
        else if (type == 'FLUORESCENCE') {
          priceData = this.listPricingRequests.find(z => z.stoneId == stoneId)?.fluorescence ?? '';
          tooltipData = InvData?.fluorescence ?? '';
          listData = this.allTheFluorescences;
        }

        if (listData.length > 0) {
          prevIndex = Number(listData.find(t => t.displayName == priceData)?.priority ?? 0);
          curIndex = Number(listData.find(t => t.displayName == tooltipData)?.priority ?? 0);
        }

        if (prevIndex < curIndex)
          className = 'icon-back ms-1 d-inline-block rotate-90 i-green';
        else if (prevIndex > curIndex)
          className = 'icon-back ms-1 d-inline-block a-rotate-90 i-red';
        else
          className = '';

        if (typeTwo == 'ToolTip')
          className = tooltipData;

        return className;
      }
      return className;
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error)
      return className;
    }
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

  public syncPricingReqSpecialStones() {
    try {
      this.alertDialogService.ConfirmYesNo("Are you sure you want to sync special stones?", "Sync")
        .subscribe(async (res: any) => {
          if (res.flag) {
            this.spinnerService.show();
            var result = await this.pricingRequestService.syncPricingReqSpecialStones();
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
import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { NgForm } from '@angular/forms';
import { DataResult, GroupDescriptor, process } from '@progress/kendo-data-query';
import { NgxSpinnerService } from 'ngx-spinner';
import * as moment from 'moment';
import { Router } from '@angular/router';
import { fromEvent } from 'rxjs';
import { debounceTime, filter, map } from 'rxjs/operators';
import { GradingService, GridPropertiesService, MasterConfigService } from '../../services';
import { GridDetailConfig, MfgInclusionData, MfgMeasurementData, MfgPricingRequest } from 'shared/businessobjects';
import { InventoryItems } from '../../entities';
import { fxCredential, GridConfig, GridMasterConfig, InclusionConfig, MasterConfig, MasterDNorm, MeasurementConfig } from 'shared/enitites';
import { AppPreloadService, ConfigService, listGrainingItems, PricingService, StoneStatus, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { TypeFilterPipe } from 'shared/directives/typefilter.pipe';
import { GradingMaster } from '../../businessobjects/grading/gradingmaster';

@Component({
  selector: 'app-grading',
  templateUrl: './grading.component.html',
  styleUrls: ['./grading.component.css']
})

export class GradingComponent implements OnInit {
  @Output() toggle: EventEmitter<boolean> = new EventEmitter();
  @ViewChild('searchStoneId') searchStoneId!: ElementRef;

  public groups: GroupDescriptor[] = [];
  public pageSize = 26;
  public skip = 0;
  public fields!: GridDetailConfig[];
  public gridView!: DataResult;
  public filterFlag = true;
  public selectableSettings: SelectableSettings = {
    mode: 'multiple',
  };
  public skeletonArray = new Array(18);
  public mySelection: string[] = [];
  public isShowCheckBoxAll: boolean = true;
  public isRateFound: boolean = true;
  public isplanmaker: boolean = false;
  public isEditPlan: boolean = false;
  public isFormValid: boolean = false;
  public inventoryItems: InventoryItems[] = [];
  public fxCredentials?: fxCredential;
  public gradingMasterObj: GradingMaster = new GradingMaster();
  public inclusionConfig: InclusionConfig = new InclusionConfig();
  public masterConfigList!: MasterConfig;
  public allTheLab?: MasterDNorm[];
  public allTheShapes?: MasterDNorm[];
  public allColors?: MasterDNorm[];
  public allClarities?: MasterDNorm[];
  public allTheFluorescences?: MasterDNorm[];
  public allTheCPS?: MasterDNorm[];
  public inclusionData: MasterDNorm[] = [];
  public inclusionFlag: boolean = false;
  public measurementData: MasterDNorm[] = [];
  public measurementConfig: MeasurementConfig = new MeasurementConfig();
  public listStatus: Array<{ name: string; isChecked: boolean }> = [];
  public listKToS: Array<{ name: string; isChecked: boolean }> = [];
  public listCulet: Array<{ name: string; isChecked: boolean }> = [];
  public listLocation: Array<{ name: string; isChecked: boolean }> = [];
  public listGrainingItems = listGrainingItems;
  public listPacketsItems: string[] = [];
  public listFilterPacketsItems: string[] = [];
  public navGradingMasterItem: Array<{ name: string; isChecked: boolean }> = [];
  public packetsItems!: InventoryItems[];
  public gradingMasterItem: GradingMaster[] = [];
  public searchPacket: string = '';
  public isEditInventory: boolean = false;
  public isGridConfig: boolean = false;
  private fxCredential!: fxCredential;
  public gridConfig!: GridConfig;
  public gridMasterConfigResponse!: GridMasterConfig;
  public totalPacket: number = 0;
  public totalWeight: number = 0;
  public totalNetAmount: number = 0;
  public netAmounts: number[] = [];
  public netAmountsRapVer: string[] = [];
  public chartColor: string = '#6c757d';

  public isViewButtons: boolean = false;

  constructor(
    private masterConfigService: MasterConfigService,
    private gridPropertiesService: GridPropertiesService,
    private alertDialogService: AlertdialogService,
    public utilityService: UtilityService,
    private gradingService: GradingService,
    private spinnerService: NgxSpinnerService,
    private configService: ConfigService,
    private pricingService: PricingService,
    public appPreloadService: AppPreloadService,
    public router: Router) { }

  async ngOnInit() {
    await this.defaultMethodsLoad();
  }

  //#region DefaultMethod
  public async defaultMethodsLoad() {
    this.fxCredential = await this.appPreloadService.fetchFxCredentials();
    if (!this.fxCredential)
      this.router.navigate(["login"]);

    if (this.fxCredential && this.fxCredential.origin && (this.fxCredential.origin.toLowerCase() == 'admin'))
      this.isViewButtons = true;

    this.gridView = { data: [], total: 0 };
    this.onSearchStoneId();
    await this.getGridConfiguration();
    await this.getMasterConfigData();
  }

  public async getGridConfiguration() {
    try {
      this.spinnerService.show();
      this.gridConfig = await this.configService.getGridConfig(this.fxCredential.id, "Grading", "GradingGrid", this.gridPropertiesService.getGradingGrid());
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
        this.gridMasterConfigResponse = await this.configService.getMasterGridConfig("Grading", "GradingGrid");
        if (this.gridMasterConfigResponse)
          this.fields = this.gridMasterConfigResponse.gridDetail;
        else
          this.fields = await this.gridPropertiesService.getGradingGrid();
      }
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.alertDialogService.show(error);
      this.spinnerService.hide();
    }
  }

  public async getMasterConfigData() {
    this.spinnerService.show();
    //Status
    Object.values(StoneStatus).forEach(z => { this.listStatus.push({ name: z.toString(), isChecked: false }); });
    //Master Config
    this.masterConfigList = await this.masterConfigService.getAllMasterConfig();
    this.allTheShapes = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.shape);
    this.allColors = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.colors);
    this.allClarities = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.clarities);
    this.allTheFluorescences = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.fluorescence);
    this.allTheCPS = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.cps);
    this.allTheLab = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.lab);
    this.inclusionData = this.masterConfigList.inclusions;
    this.inclusionConfig = this.masterConfigList.inclusionConfig;
    this.measurementData = this.masterConfigList.measurements;
    this.measurementConfig = this.masterConfigList.measurementConfig;

    let allKTOS = this.inclusionData.filter(item => item.type.toLowerCase().indexOf('ktos') !== -1);
    allKTOS.forEach(z => { this.listKToS.push({ name: z.name, isChecked: false }); });

    let allCulet = this.inclusionData.filter(item => item.type.toLowerCase().indexOf('culet') !== -1);
    allCulet.forEach(z => { this.listCulet.push({ name: z.name, isChecked: false }); });
    this.spinnerService.hide();
  }
  //#endregion

  //#region PacketChange
  public async navChange(index: number) {
    let selectedId = '';
    this.navGradingMasterItem.forEach((element, i) => {
      if (i == index) {
        selectedId = element.name;
        element.isChecked = true;
      }
      else
        element.isChecked = false;
    });
    await this.packetChange(selectedId);
  }

  public async packetChange(e: any) {
    try {
      this.spinnerService.show();
      this.gridView = { data: [], total: 0 };
      this.mySelection = [];
      this.gradingMasterItem = await this.gradingService.GetGrading(e);
      if (this.gradingMasterItem != undefined && this.gradingMasterItem != null) {
        this.gridView = process(this.gradingMasterItem, { group: this.groups });
        this.gridView.total = this.gradingMasterItem.length;
        this.setChart();
      }
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public onSearchStoneId() {
    try {
      fromEvent(this.searchStoneId.nativeElement, 'keyup').pipe(
        map((event: any) => {
          return event.target.value;
        }), debounceTime(1000)
      ).subscribe(async (searchText: string) => {
        this.spinnerService.show();

        this.navGradingMasterItem = [];
        this.listPacketsItems = [];

        if (searchText.length > 1) {
          let data = await this.gradingService.getInventoryItemsBySearchStoneId(searchText);
          if (data) {
            data.forEach(z => { this.listPacketsItems.push(z.stoneId); });
            this.listFilterPacketsItems = [...this.listPacketsItems];
            this.listFilterPacketsItems.forEach(z => {
              this.navGradingMasterItem.push({ name: z, isChecked: false });
            });
          }
        }
        this.spinnerService.hide();
      });
    }
    catch (error: any) {
      this.spinnerService.hide();
      console.error(error);
      this.alertDialogService.show("Something went wrong, Try again later!");
    }
  }
  //#endregion

  //#region Function  
  public resetForm(form?: NgForm) {
    this.gridView = { data: [], total: 0 };
    form?.reset();
  }

  public assignDropDownDataForEdit() {
    this.spinnerService.show();
    //Basic
    this.gradingMasterObj.shape = this.matchDropDownField(this.gradingMasterObj.shape, this.allTheShapes);
    this.gradingMasterObj.color = this.matchDropDownField(this.gradingMasterObj.color, this.allColors);
    this.gradingMasterObj.clarity = this.matchDropDownField(this.gradingMasterObj.clarity, this.allClarities);
    this.gradingMasterObj.fluorescence = this.matchDropDownField(this.gradingMasterObj.fluorescence, this.allTheFluorescences);
    this.gradingMasterObj.cut = this.matchDropDownField(this.gradingMasterObj.cut, this.allTheCPS);
    this.gradingMasterObj.polish = this.matchDropDownField(this.gradingMasterObj.polish, this.allTheCPS);
    this.gradingMasterObj.symmetry = this.matchDropDownField(this.gradingMasterObj.symmetry, this.allTheCPS);
    this.gradingMasterObj.lab = this.matchDropDownField(this.gradingMasterObj.lab, this.allTheLab);
    //Inclusion
    this.gradingMasterObj.inclusion.brown = this.matchDropDownField(this.gradingMasterObj.inclusion.brown, TypeFilterPipe.prototype.transform(this.inclusionData, 'brown'));
    this.gradingMasterObj.inclusion.shade = this.matchDropDownField(this.gradingMasterObj.inclusion.shade, TypeFilterPipe.prototype.transform(this.inclusionData, 'shade'));
    this.gradingMasterObj.inclusion.green = this.matchDropDownField(this.gradingMasterObj.inclusion.green, TypeFilterPipe.prototype.transform(this.inclusionData, 'green'));
    this.gradingMasterObj.inclusion.milky = this.matchDropDownField(this.gradingMasterObj.inclusion.milky, TypeFilterPipe.prototype.transform(this.inclusionData, 'milky'));

    this.gradingMasterObj.inclusion.sideBlack = this.matchDropDownField(this.gradingMasterObj.inclusion.sideBlack, TypeFilterPipe.prototype.transform(this.inclusionData, 'sideBlack'));
    this.gradingMasterObj.inclusion.centerSideBlack = this.matchDropDownField(this.gradingMasterObj.inclusion.centerSideBlack, TypeFilterPipe.prototype.transform(this.inclusionData, 'centerSideBlack'));
    this.gradingMasterObj.inclusion.centerBlack = this.matchDropDownField(this.gradingMasterObj.inclusion.centerBlack, TypeFilterPipe.prototype.transform(this.inclusionData, 'centerBlack'));
    this.gradingMasterObj.inclusion.sideWhite = this.matchDropDownField(this.gradingMasterObj.inclusion.sideWhite, TypeFilterPipe.prototype.transform(this.inclusionData, 'sideWhite'));
    this.gradingMasterObj.inclusion.centerSideWhite = this.matchDropDownField(this.gradingMasterObj.inclusion.centerSideWhite, TypeFilterPipe.prototype.transform(this.inclusionData, 'centerSideWhite'));
    this.gradingMasterObj.inclusion.centerWhite = this.matchDropDownField(this.gradingMasterObj.inclusion.centerWhite, TypeFilterPipe.prototype.transform(this.inclusionData, 'centerWhite'));

    this.gradingMasterObj.inclusion.openCrown = this.matchDropDownField(this.gradingMasterObj.inclusion.openCrown, TypeFilterPipe.prototype.transform(this.inclusionData, 'openCrown'));
    this.gradingMasterObj.inclusion.openTable = this.matchDropDownField(this.gradingMasterObj.inclusion.openTable, TypeFilterPipe.prototype.transform(this.inclusionData, 'openTable'));
    this.gradingMasterObj.inclusion.openPavilion = this.matchDropDownField(this.gradingMasterObj.inclusion.openPavilion, TypeFilterPipe.prototype.transform(this.inclusionData, 'openPavilion'));
    this.gradingMasterObj.inclusion.openGirdle = this.matchDropDownField(this.gradingMasterObj.inclusion.openGirdle, TypeFilterPipe.prototype.transform(this.inclusionData, 'openGirdle'));

    this.gradingMasterObj.inclusion.efoc = this.matchDropDownField(this.gradingMasterObj.inclusion.efoc, TypeFilterPipe.prototype.transform(this.inclusionData, 'eFOC'));
    this.gradingMasterObj.inclusion.efot = this.matchDropDownField(this.gradingMasterObj.inclusion.efot, TypeFilterPipe.prototype.transform(this.inclusionData, 'eFOT'));
    this.gradingMasterObj.inclusion.efop = this.matchDropDownField(this.gradingMasterObj.inclusion.efop, TypeFilterPipe.prototype.transform(this.inclusionData, 'eFOP'));
    this.gradingMasterObj.inclusion.efog = this.matchDropDownField(this.gradingMasterObj.inclusion.efog, TypeFilterPipe.prototype.transform(this.inclusionData, 'eFOG'));

    this.gradingMasterObj.inclusion.naturalOnCrown = this.matchDropDownField(this.gradingMasterObj.inclusion.naturalOnCrown, TypeFilterPipe.prototype.transform(this.inclusionData, 'naturalOnCrown'));
    this.gradingMasterObj.inclusion.naturalOnGirdle = this.matchDropDownField(this.gradingMasterObj.inclusion.naturalOnGirdle, TypeFilterPipe.prototype.transform(this.inclusionData, 'naturalOnGirdle'));
    this.gradingMasterObj.inclusion.naturalOnPavillion = this.matchDropDownField(this.gradingMasterObj.inclusion.naturalOnPavillion, TypeFilterPipe.prototype.transform(this.inclusionData, 'naturalonpavilion'));
    this.gradingMasterObj.inclusion.naturalOnTable = this.matchDropDownField(this.gradingMasterObj.inclusion.naturalOnTable, TypeFilterPipe.prototype.transform(this.inclusionData, 'naturalOnTable'));

    this.gradingMasterObj.inclusion.girdleCondition = this.matchDropDownField(this.gradingMasterObj.inclusion.girdleCondition, TypeFilterPipe.prototype.transform(this.inclusionData, 'girdleCondition'));
    this.gradingMasterObj.inclusion.culet = this.matchDropDownField(this.gradingMasterObj.inclusion.culet, TypeFilterPipe.prototype.transform(this.inclusionData, 'culet'));
    this.gradingMasterObj.inclusion.hna = this.matchDropDownField(this.gradingMasterObj.inclusion.hna, TypeFilterPipe.prototype.transform(this.inclusionData, 'hNA'));
    this.gradingMasterObj.inclusion.eyeClean = this.matchDropDownField(this.gradingMasterObj.inclusion.eyeClean, TypeFilterPipe.prototype.transform(this.inclusionData, 'eyeClean'));
    this.gradingMasterObj.inclusion.ktoS = this.matchDropDownField(this.gradingMasterObj.inclusion.ktoS, TypeFilterPipe.prototype.transform(this.inclusionData, 'ktoS'));
    this.gradingMasterObj.inclusion.flColor = this.matchDropDownField(this.gradingMasterObj.inclusion.flColor, TypeFilterPipe.prototype.transform(this.inclusionData, 'fLColor'));
    this.gradingMasterObj.inclusion.redSpot = this.matchDropDownField(this.gradingMasterObj.inclusion.redSpot, TypeFilterPipe.prototype.transform(this.inclusionData, 'redSpot'));
    this.gradingMasterObj.inclusion.luster = this.matchDropDownField(this.gradingMasterObj.inclusion.luster, TypeFilterPipe.prototype.transform(this.inclusionData, 'luster'));
    this.gradingMasterObj.inclusion.bowtie = this.matchDropDownField(this.gradingMasterObj.inclusion.bowtie, TypeFilterPipe.prototype.transform(this.inclusionData, 'bowtie'));
    this.spinnerService.hide();
  }

  public matchDropDownField(field: string, list: MasterDNorm[] | undefined): string {
    var obj = list?.find(c => c.name.toLowerCase() == field?.toLowerCase() || c.displayName.toLowerCase() == field?.toLowerCase() || c.optionalWords && c.optionalWords.map(u => u.toLowerCase().trim()).includes(field?.toLowerCase()));
    if (obj)
      field = obj.name;
    return field;
  }

  public calculateRapPricing() {
    this.spinnerService.show();
    let rap = this.gradingMasterObj.basePrice.rap;
    let disc = this.gradingMasterObj.basePrice.discount;
    if (rap && disc) {
      if (disc.toString() != '-') {

        disc = parseFloat(disc.toString());
        let weight = this.gradingMasterObj.weight;
        let stoneRap = weight * rap;
        let calDiscount = 100 + disc;
        let netAmount = (calDiscount * stoneRap) / 100;

        this.gradingMasterObj.basePrice.netAmount = this.utilityService.ConvertToFloatWithDecimal(netAmount);
        let perCarat = netAmount / weight;
        this.gradingMasterObj.basePrice.perCarat = this.utilityService.ConvertToFloatWithDecimal(perCarat);
      }
    }
    this.spinnerService.hide();
  }

  public mappingPricingRequestData(item: GradingMaster): MfgPricingRequest {
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
      incusion.GirdleCond = [];
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

  public async GetPricing() {
    this.spinnerService.show();
    try {
      if (this.gradingMasterObj != null && this.gradingMasterObj.stoneId) {
        let newObj = JSON.parse(JSON.stringify(this.gradingMasterObj));

        let reqList: MfgPricingRequest[] = [];
        reqList.push(this.mappingPricingRequestData(newObj));

        let response = await this.pricingService.getBasePrice(reqList);
        if (response && response.length > 0) {
          let target = response.find(a => a.id == this.gradingMasterObj.stoneId);
          if (target && target.error == null) {
            target = this.utilityService.setAmtForPricingDiscountResponse(target, this.gradingMasterObj.weight);

            this.gradingMasterObj.basePrice.rap = target.rapPrice;
            this.gradingMasterObj.basePrice.discount = target.discount;
            this.gradingMasterObj.basePrice.netAmount = target.amount;
            this.gradingMasterObj.basePrice.perCarat = target.dCaret;
          }
          else {
            if (target && target.rapPrice != null && target.rapPrice > 0)
              this.gradingMasterObj.basePrice.rap = target.rapPrice;
            else
              this.gradingMasterObj.basePrice.rap = 0;
            this.gradingMasterObj.basePrice.discount = 0;
            this.gradingMasterObj.basePrice.netAmount = 0;
            this.gradingMasterObj.basePrice.perCarat = 0;
          }

        }
        else {
          this.gradingMasterObj.basePrice.rap = 0;
          this.gradingMasterObj.basePrice.discount = 0;
          this.gradingMasterObj.basePrice.netAmount = 0;
          this.gradingMasterObj.basePrice.perCarat = 0;
        }
      }
      else
        this.alertDialogService.show('Please Select Available Stone.')

      this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error)
    }
  }

  public checkRequiredFields(): void {
    this.isFormValid = this.validateFields();
  }

  public validateFields(): boolean {
    const obj = this.gradingMasterObj;
    return this.checkStringNullOrEmpty(obj.stoneId)
      && this.checkStringNullOrEmpty(obj.kapan)
      && this.checkStringNullOrEmpty(obj.article)
      && this.checkStringNullOrEmpty(obj.shape)
      && this.checkStringNullOrEmpty(obj.weight?.toString() ?? '')
      && this.checkStringNullOrEmpty(obj.color)
      && this.checkStringNullOrEmpty(obj.clarity)
      && this.checkStringNullOrEmpty(obj.cut)
      && this.checkStringNullOrEmpty(obj.polish)
      && this.checkStringNullOrEmpty(obj.symmetry)
      && this.checkStringNullOrEmpty(obj.fluorescence)
      && this.checkStringNullOrEmpty(obj.basePrice.rap?.toString() ?? '')
      && this.checkStringNullOrEmpty(obj.basePrice.discount?.toString() ?? '')
      && this.checkStringNullOrEmpty(obj.basePrice.netAmount?.toString() ?? '')
      && this.checkStringNullOrEmpty(obj.basePrice.perCarat?.toString() ?? '')
      && this.checkStringNullOrEmpty(obj.inclusion.shade)
      && this.checkStringNullOrEmpty(obj.inclusion.brown)
      && this.checkStringNullOrEmpty(obj.inclusion.green)
      && this.checkStringNullOrEmpty(obj.inclusion.milky)
      && this.checkStringNullOrEmpty(obj.inclusion.hna)
      && this.checkStringNullOrEmpty(obj.inclusion.eyeClean)
      && this.checkStringNullOrEmpty(obj.measurement.depth?.toString() ?? '')
      && this.checkStringNullOrEmpty(obj.measurement.table?.toString() ?? '')
      && this.checkStringNullOrEmpty(obj.measurement.length?.toString() ?? '')
      && this.checkStringNullOrEmpty(obj.measurement.height?.toString() ?? '')
      && this.checkStringNullOrEmpty(obj.measurement.ratio?.toString() ?? '')
  }

  public checkStringNullOrEmpty(field: string): boolean {
    var flag = true;
    if (field == undefined || field == null || field?.length == 0 || (typeof field == 'undefined'))
      flag = false;
    return flag;
  }

  public getValidDate(date: any): Date | null {
    if (date != null) {
      const day = moment(date).date();
      const month = moment(date).month();
      const year = moment(date).year();
      var newDate = new Date(year, month, day);
      return newDate;
    }
    return date;
  }
  //#endregion

  //#region Save Method
  public async onInvSubmit(form: NgForm) {
    try {
      this.spinnerService.show();
      if (form.valid) {
        let res = await this.gradingService.UpdateGrading(this.gradingMasterObj);
        if (res) {
          this.closeEditInventoryDialog();
          this.mySelection = [];
          this.gridView = { data: [], total: 0 };
          this.utilityService.showNotification(`Record updated successfully!`)
        }
        else
          this.utilityService.showNotification(`Something went wrong, Try again later!`)
      }
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }
  //#endregion  

  //#region GridConfig
  public groupChange(groups: GroupDescriptor[]): void {
    try {
      this.groups = groups;
    }
    catch (error: any) {
      this.alertDialogService.show(error.error);
    }
  }

  public selectedRowChange(e: any) {
    this.gradingMasterObj = new GradingMaster();
    if (e.selectedRows != null && e.selectedRows.length > 0) {
      let value: GradingMaster = JSON.parse(JSON.stringify(e.selectedRows[0].dataItem));
      this.gradingMasterObj = { ...value };
    }
  }

  public pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
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
  //#endregion

  //#region Dialog
  public openPlanmakerDialog(): void {
    this.isplanmaker = true;
  }

  public openEditPlanDialog(): void {
    this.isEditPlan = true;
  }

  public closeEditPlanDialog(): void {
    this.isEditPlan = false;
  }

  public openEditInventoryDialog(): void {
    if (this.gradingMasterObj.rapVer != 'InvUpload') {
      this.assignDropDownDataForEdit();
      this.isEditInventory = true;
    }
    else
      this.alertDialogService.show("You can't allow to change this detail");
  }

  public closeEditInventoryDialog(): void {
    this.isEditInventory = false;
  }
  //#endregion  

  //#region Chart
  private setChart() {
    let newTitle: string[] = [];
    let newdata: number[] = [];

    this.gradingMasterItem.forEach(element => {
      var netAmountsRapVer = element.rapVer
      if (netAmountsRapVer)
        newTitle.push(netAmountsRapVer)

      var netAmounts = element.basePrice.netAmount
      if (netAmounts)
        newdata.push(netAmounts)
      else
        newdata.push(0)
    });

    this.netAmounts = newdata;
    this.netAmountsRapVer = newTitle;
  }
  //#endregion   
}
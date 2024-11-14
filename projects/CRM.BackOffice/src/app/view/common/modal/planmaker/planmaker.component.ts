import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { DataResult, GroupDescriptor, process } from '@progress/kendo-data-query';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { GradingService, GridPropertiesService, InventoryService, MasterConfigService } from '../../../../services';
import { GridDetailConfig, MfgInclusionData, MfgMeasurementData, MfgPricingRequest } from 'shared/businessobjects';
import { fxCredential, GridConfig, GridMasterConfig, InclusionConfig, MasterConfig, MasterDNorm, MeasurementConfig } from 'shared/enitites';
import { InventoryItems } from '../../../../entities';
import { AlertdialogService } from 'shared/views';
import { AppPreloadService, ConfigService, PricingService, StoneStatus, UtilityService } from 'shared/services';
import { GradingMaster } from 'projects/CRM.BackOffice/src/app/businessobjects/grading/gradingmaster';

@Component({
  selector: 'app-planmaker',
  templateUrl: './planmaker.component.html',
  styleUrls: ['./planmaker.component.css']
})
export class PlanmakerComponent implements OnInit {
  @Output() toggle: EventEmitter<boolean> = new EventEmitter();

  public groups: GroupDescriptor[] = [];
  public pageSize = 26;
  public skip = 0;
  public fields!: GridDetailConfig[];
  public gridView!: DataResult;
  public isRegEmployee: boolean = false;
  public filterFlag = true;
  public selectableSettings: SelectableSettings = {
    mode: 'multiple',
  };
  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains'
  };
  public skeletonArray = new Array(18);
  public mySelection: string[] = [];
  public isShowCheckBoxAll: boolean = true;
  public selectedCPS?: string;
  public isBGM: boolean = false;
  public masterConfigList!: MasterConfig;
  public allTheLab?: MasterDNorm[];
  public allTheShapes!: MasterDNorm[];
  public allColors!: MasterDNorm[];
  public allClarities!: MasterDNorm[];
  public allTheFluorescences!: MasterDNorm[];
  public allTheCPS!: MasterDNorm[];
  public inclusionData: MasterDNorm[] = [];
  public inclusionFlag: boolean = false;
  public inclusionConfig: InclusionConfig = new InclusionConfig();
  public measurementData: MasterDNorm[] = [];
  public measurementConfig: MeasurementConfig = new MeasurementConfig();
  public listStatus: Array<{ name: string; isChecked: boolean }> = [];
  public listKToS: Array<{ name: string; isChecked: boolean }> = [];
  public listCulet: Array<{ name: string; isChecked: boolean }> = [];
  public location: Array<{ name: string; isChecked: boolean }> = [];
  public isEditInventory: boolean = false;
  public isSearchFilter: boolean = false;
  public isGridConfig: boolean = false;
  public fxCredentials?: fxCredential;
  public fxCredential!: fxCredential;
  public totalPacket: number = 0;
  public totalWeight: number = 0;
  public totalNetAmount: number = 0;
  public isplanmaker: boolean = false;
  public isEditPlan: boolean = false;
  public calculateValue: string = '0';
  public listPacketsItems: Array<{ text: string; value: string }> = [];
  public listPacketsFilterItems: Array<{ text: string; value: string }> = [];
  public inventoryObj: InventoryItems = new InventoryItems();
  public inventoryItems: InventoryItems[] = [];
  public packetsItems: InventoryItems[] = [];
  public gridStoneItem: InventoryItems[] = [];
  public selectedInventoryItems: InventoryItems[] = [];
  public gradingMasterItem: GradingMaster[] = [];
  public clearString!: string;
  public gridConfig!: GridConfig;
  public gridMasterConfigResponse!: GridMasterConfig;
  public extraData: boolean = true;

  constructor(
    private inventoryService: InventoryService,
    private gridPropertiesService: GridPropertiesService,
    private alertDialogService: AlertdialogService,
    public utilityService: UtilityService,
    private masterConfigService: MasterConfigService,
    private gradingService: GradingService,
    private spinnerService: NgxSpinnerService,
    private pricingService: PricingService,
    private configService: ConfigService,
    public appPreloadService: AppPreloadService,
    public router: Router) { }

  async ngOnInit() {
    await this.defaultMethodsLoad();
  }

  //#region defaultMethods
  public async defaultMethodsLoad() {
    this.fxCredential = await this.appPreloadService.fetchFxCredentials();
    if (!this.fxCredential)
      this.router.navigate(["login"]);
    this.gridView = { data: [], total: 0 };
    await this.getMasterConfigData();
    await this.getGridConfiguration();
  }

  public async getMasterConfigData() {
    Object.values(StoneStatus).forEach(z => { this.listStatus.push({ name: z.toString(), isChecked: false }); });
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
  }
  //#endregion  

  //#region Grid Config
  public async getGridConfiguration() {
    try {
      this.spinnerService.show();
      this.gridConfig = await this.configService.getGridConfig(this.fxCredential.id, "PlanMaker", "PlanMakerGrid", this.gridPropertiesService.getPlanMakerGrid());
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
        this.gridMasterConfigResponse = await this.configService.getMasterGridConfig("PlanMaker", "PlanMakerGrid");
        if (this.gridMasterConfigResponse)
          this.fields = this.gridMasterConfigResponse.gridDetail;
        else
          this.fields = await this.gridPropertiesService.getPlanMakerGrid();
      }
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.alertDialogService.show(error);
      this.spinnerService.hide();
    }
  }

  public cellClickHandler(e: any) {
    // this.mySelection = [];
    // this.mySelection.push(e.dataItem.stoneId);
    // this.selectedInventoryItems = []
    // this.selectedInventoryItems.push(e.dataItem)
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

  //#region Function
  public async packetChange(e: any) {
    try {
      this.clearFilter();
      if (e.length == 0)
        return;

      const stonedata = await this.gradingService.getInventoryByStoneId(e);
      if (stonedata != undefined && stonedata != null) {
        let exist = this.packetsItems.find(z => z.stoneId == stonedata.stoneId);
        if (exist == null)
          this.packetsItems.push(JSON.parse(JSON.stringify(stonedata)));
        this.inventoryObj = JSON.parse(JSON.stringify(stonedata));
        this.calculateValue = stonedata.weight.toString();
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public addRemoveStringInArrayFilter(a: string, b: string) {
    a = b
  }

  public groupChange(groups: GroupDescriptor[]): void {
    try {
      this.groups = groups;
    }
    catch (error: any) {
      this.alertDialogService.show(error.error);
    }
  }

  public pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
  }

  public calcData(input: string) {
    if (input == 'BS') {
      if (this.calculateValue.length > 1)
        this.calculateValue = this.calculateValue.slice(0, -1);
      else {
        this.calculateValue = '0';
        return
      }
    }
    else if (input == '.') {
      if (!this.calculateValue.includes('.')) {
        this.calculateValue += input;
      }
    }
    else {
      if (this.calculateValue == '0')
        this.calculateValue = input;
      else
        this.calculateValue += input;
    }
  }

  public changeCPSData(type: string) {
    if (type == '3EX') {
      var ExData = this.allTheCPS?.find(z => z.name.toLowerCase() == 'ex');
      this.inventoryObj.cut = ExData?.name ?? 'EX';
      this.inventoryObj.polish = ExData?.name ?? 'EX';
      this.inventoryObj.symmetry = ExData?.name ?? 'EX';
    }
    else if (type == '2EX') {
      var ExData = this.allTheCPS?.find(z => z.name.toLowerCase() == 'ex');
      this.inventoryObj.cut = ExData?.name ?? 'EX';
      this.inventoryObj.polish = ExData?.name ?? 'EX';
      this.inventoryObj.symmetry = this.clearString;
    }
    else if (type == '3VG') {
      var ExData = this.allTheCPS?.find(z => z.name.toLowerCase() == 'ex');
      var VGData = this.allTheCPS?.find(z => z.name.toLowerCase() == 'vg');

      this.inventoryObj.cut = this.clearString;
      this.inventoryObj.cut = ExData?.name ?? 'EX';
      this.inventoryObj.cut = VGData?.name ?? 'VG';

      this.inventoryObj.polish = this.clearString;
      this.inventoryObj.polish = ExData?.name ?? 'EX';
      this.inventoryObj.polish = VGData?.name ?? 'VG';

      this.inventoryObj.symmetry = this.clearString;
      this.inventoryObj.symmetry = ExData?.name ?? 'EX';
      this.inventoryObj.symmetry = VGData?.name ?? 'VG';
    }
    else if (type == 'Clear') {
      this.inventoryObj.cut = this.clearString;
      this.inventoryObj.polish = this.clearString;
      this.inventoryObj.symmetry = this.clearString;
      this.inventoryObj.inclusion.brown = this.clearString;
      this.inventoryObj.inclusion.green = this.clearString;
      this.inventoryObj.inclusion.milky = this.clearString;
    }
    else if (type == 'BGM') {
      const inclusions = [...this.inclusionData];
      let BrownData = inclusions.filter(item => item.type.toLowerCase().indexOf('brown') !== -1);
      var NoBrownData = BrownData.find(z => z.name.toLowerCase() == 'no');
      this.inventoryObj.inclusion.brown = this.clearString;
      this.inventoryObj.inclusion.brown = NoBrownData?.name ?? 'NO';

      var NoGreenData = inclusions.filter(item => item.type.toLowerCase().indexOf('green') !== -1).find(z => z.name.toLowerCase() == 'no');
      this.inventoryObj.inclusion.green = this.clearString;
      this.inventoryObj.inclusion.green = NoGreenData?.name ?? 'NO';

      var NoMilkyData = inclusions.filter(item => item.type.toLowerCase().indexOf('milky') !== -1).find(z => z.name.toLowerCase() == 'no');
      this.inventoryObj.inclusion.milky = this.clearString;
      this.inventoryObj.inclusion.milky = NoMilkyData?.name ?? 'NO';
    }
  }

  public onSelect(event: any): void {
    if (event.selectedRows && event.selectedRows.length > 0) {
      event.selectedRows.forEach((element: any) => {
        let Selectedindex = this.selectedInventoryItems.findIndex(x => x == element.dataItem);
        if (Selectedindex < 0)
          this.selectedInventoryItems.push(element.dataItem)
      });
    }
    else {
      event.deselectedRows.forEach((element: any) => {
        if (!element.dataItem.isDisabled) {
          let index = this.selectedInventoryItems.findIndex(x => x == element.dataItem);
          if (index >= 0)
            this.selectedInventoryItems.splice(index, 1)
        }
      });
    }
  }

  public mappingPricingRequestData(item: InventoryItems): MfgPricingRequest {
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

  public async AddStoneToGrid() {
    try {
      if (this.checkValidationForAll()) {
        if (this.inventoryObj != null && this.inventoryObj.stoneId) {
          let newObj = JSON.parse(JSON.stringify(this.inventoryObj));
          newObj.weight = parseFloat(this.calculateValue);

          let reqList: MfgPricingRequest[] = [];
          reqList.push(this.mappingPricingRequestData(newObj));

          this.spinnerService.show();
          let response = await this.pricingService.getBasePrice(reqList);
          if (response && response.length > 0) {
            let target = response.find(a => a.id == this.inventoryObj.stoneId);
            if (target && target.error == null) {
              target = this.utilityService.setAmtForPricingDiscountResponse(target, this.inventoryObj.weight);

              this.spinnerService.hide();
              newObj.basePrice.rap = target.rapPrice;
              newObj.basePrice.discount = target.discount;
              newObj.basePrice.netAmount = target.amount;
              newObj.basePrice.perCarat = target.dCaret;
            }
            else {
              this.spinnerService.hide();
              if (target && target.rapPrice != null && target.rapPrice > 0)
                newObj.basePrice.rap = target.rapPrice;
              else
                newObj.basePrice.rap = null as any;
              newObj.basePrice.discount = null as any;
              newObj.basePrice.netAmount = null as any;
              newObj.basePrice.perCarat = null as any;
            }
          }
          else {
            this.spinnerService.hide();
            newObj.basePrice.rap = null as any;
            newObj.basePrice.discount = null as any;
            newObj.basePrice.netAmount = null as any;
            newObj.basePrice.perCarat = null as any;
          }
          this.gridStoneItem.push({ ...newObj });
          this.gridView = process(this.gridStoneItem, { group: this.groups });
          this.gridView.total = this.gridStoneItem.length;
        }
        else {
          this.alertDialogService.show('Please Select Available Stone.')
        }
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error)
    }
  }

  public resetForm(form?: NgForm) {
    this.inventoryObj = new InventoryItems;
    this.gridStoneItem = [];
    this.gridView = { data: [], total: 0 };
    form?.reset();
  }

  public async onSavePlan(form: NgForm, action: boolean) {
    try {
      if (this.selectedInventoryItems.length == 1) {
        if (form.valid) {
          this.spinnerService.show();
          let messageType: string = "";
          let response: any;
          this.fxCredentials = JSON.parse(sessionStorage.getItem("fxCredentials") ?? '') as fxCredential;

          this.selectedInventoryItems.forEach(z => {
            z.identity.id = this.fxCredentials?.id ?? '';
            z.identity.name = this.fxCredentials?.fullName ?? '';
            z.identity.type = 'Employee' ?? '';
          })
          messageType = "updated";
          response = await this.gradingService.InsertGrading(this.selectedInventoryItems, "Grading");
          if (response) {
            this.mySelection = [];
            this.spinnerService.hide();
            this.resetForm(form);
            this.closePlanmakerDialog();
            response = await this.gradingService.updateInventoryData(this.selectedInventoryItems[0])
            if (response) {
              this.utilityService.showNotification(`You have been ${messageType} successfully!`)
            }
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
      else
        this.alertDialogService.show('Multiple Plan Not Allowed.')
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public checkValidationForAll(): boolean {
    try {
      let flag = true;
      let InvData = '';
      let invIndex: number = 0;
      let curIndex: number = 0;
      let listData: MasterDNorm[] = [];

      //Shape
      InvData = this.packetsItems.find(z => z.stoneId == this.inventoryObj.stoneId)?.shape ?? '';
      if (InvData != this.inventoryObj.shape) {
        this.alertDialogService.show('Shape change not allowed');
        flag = false;
        return flag
      }

      //Color
      listData = this.allColors;
      InvData = this.packetsItems.find(z => z.stoneId == this.inventoryObj.stoneId)?.color ?? '';
      invIndex = parseInt(listData.find(t => t.displayName == InvData)?.priority ?? '0');
      curIndex = parseInt(listData.find(t => t.displayName == this.inventoryObj.color)?.priority ?? '0');
      if (curIndex + 1 == invIndex || curIndex - 1 == invIndex || curIndex == invIndex || curIndex + 2 == invIndex || curIndex - 2 == invIndex)
        flag = true;
      else {
        this.alertDialogService.show('Only two step change allowed from color : ' + InvData);
        flag = false;
        return flag;
      }

      //Clarity
      listData = this.allClarities;
      InvData = this.packetsItems.find(z => z.stoneId == this.inventoryObj.stoneId)?.clarity ?? '';
      invIndex = parseInt(listData.find(t => t.displayName == InvData)?.priority ?? '0');
      curIndex = parseInt(listData.find(t => t.displayName == this.inventoryObj.clarity)?.priority ?? '0');
      if (curIndex + 1 == invIndex || curIndex - 1 == invIndex || curIndex == invIndex || curIndex + 2 == invIndex || curIndex - 2 == invIndex)
        flag = true;
      else {
        this.alertDialogService.show('Only two step change allowed from clarity : ' + InvData);
        flag = false;
        return flag;
      }

      //cut
      listData = this.allTheCPS;
      InvData = this.packetsItems.find(z => z.stoneId == this.inventoryObj.stoneId)?.cut ?? '';
      invIndex = parseInt(listData.find(t => t.displayName == InvData)?.priority ?? '0');
      curIndex = parseInt(listData.find(t => t.displayName == this.inventoryObj.cut)?.priority ?? '0');
      if (curIndex + 1 == invIndex || curIndex - 1 == invIndex || curIndex == invIndex || curIndex + 2 == invIndex || curIndex - 2 == invIndex)
        flag = true;
      else {
        this.alertDialogService.show('Only two step change allowed from cut : ' + InvData);
        flag = false;
        return flag;
      }

      //polish
      listData = this.allTheCPS;
      InvData = this.packetsItems.find(z => z.stoneId == this.inventoryObj.stoneId)?.polish ?? '';
      invIndex = parseInt(listData.find(t => t.displayName == InvData)?.priority ?? '0');
      curIndex = parseInt(listData.find(t => t.displayName == this.inventoryObj.polish)?.priority ?? '0');
      if (curIndex + 1 == invIndex || curIndex - 1 == invIndex || curIndex == invIndex || curIndex + 2 == invIndex || curIndex - 2 == invIndex)
        flag = true;
      else {
        this.alertDialogService.show('Only two step change allowed from polish : ' + InvData);
        flag = false;
        return flag;
      }

      //symmetry
      listData = this.allTheCPS;
      InvData = this.packetsItems.find(z => z.stoneId == this.inventoryObj.stoneId)?.symmetry ?? '';
      invIndex = parseInt(listData.find(t => t.displayName == InvData)?.priority ?? '0');
      curIndex = parseInt(listData.find(t => t.displayName == this.inventoryObj.symmetry)?.priority ?? '0');
      if (curIndex + 1 == invIndex || curIndex - 1 == invIndex || curIndex == invIndex || curIndex + 2 == invIndex || curIndex - 2 == invIndex)
        flag = true;
      else {
        this.alertDialogService.show('Only two step change allowed from symmetry : ' + InvData);
        flag = false;
        return flag;
      }

      //fluorescence
      listData = this.allTheFluorescences;
      InvData = this.packetsItems.find(z => z.stoneId == this.inventoryObj.stoneId)?.fluorescence ?? '';
      invIndex = parseInt(listData.find(t => t.displayName == InvData)?.priority ?? '0');
      curIndex = parseInt(listData.find(t => t.displayName == this.inventoryObj.fluorescence)?.priority ?? '0');
      if (curIndex + 1 == invIndex || curIndex - 1 == invIndex || curIndex == invIndex || curIndex + 2 == invIndex || curIndex - 2 == invIndex)
        flag = true;
      else {
        this.alertDialogService.show('Only two step change allowed from fluorescence : ' + InvData);
        flag = false;
        return flag;
      }

      return flag
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
      return false
    }
  }

  public calculateDept(target: InventoryItems): void {
    if (target.measurement.height && (target.measurement.length || target.measurement.width)) {
      target.measurement.length = this.utilityService.ConvertToFloatWithDecimal(parseFloat(target.measurement.length?.toString() ?? '0'));
      target.measurement.width = this.utilityService.ConvertToFloatWithDecimal(parseFloat(target.measurement.width?.toString() ?? '0'));
      target.measurement.height = this.utilityService.ConvertToFloatWithDecimal(parseFloat(target.measurement.height?.toString() ?? '0'));
      if (target.shape?.toLowerCase() == 'rbc')
        target.measurement.depth = ((target.measurement.height ?? 0) / (target.measurement.length ?? 0)) * 100;
      else if (target.shape?.toLowerCase() == 'hb') {
        let val = (target.measurement.length ?? 0);
        if ((target.measurement.length ?? 0) < (target.measurement.width ?? 0))
          val = (target.measurement.width ?? 0);
        target.measurement.depth = ((target.measurement.height ?? 0) / val) * 100;
      }
      else {
        let val = (target.measurement.length ?? 0);
        if ((target.measurement.length ?? 0) > (target.measurement.width ?? 0))
          val = (target.measurement.width ?? 0);
        target.measurement.depth = ((target.measurement.height ?? 0) / val) * 100;
      }
      if (target.measurement.depth == Infinity || target.measurement.depth == 0)
        target.measurement.depth = null as any;
      else
        target.measurement.depth = this.utilityService.ConvertToFloatWithDecimal(target.measurement.depth ?? 0);
    }
    else
      target.measurement.depth = null as any;
  }

  // public handleFilter(value: any) {
  //   this.listPacketsItems = this.listPacketsFilterItems.filter(
  //     (s) => s.text.toLowerCase().indexOf(value.toLowerCase()) !== -1
  //   );
  // }

  public async handleFilter(value: any) {
    try {
      this.spinnerService.show();

      this.listPacketsItems = [];
      if (value.length > 1) {
        let data = await this.gradingService.getInventoryItemsBySearchStoneId(value);
        if (data) {
          data.forEach(z => { this.listPacketsItems.push({ text: z.stoneId, value: z.stoneId }); });
        }
      }
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }

  }
  //#endregion

  //#region Dailog
  public closePlanmakerDialog(): void {
    this.toggle.emit(false);
  }
  public openGridConfigDialog(): void {
    this.isGridConfig = true;
  }
  //#endregion

  //#region Filter
  public clearFilter(form?: NgForm) {
    this.inventoryObj = new InventoryItems();
    this.gridView = { data: [], total: 0 };
    this.mySelection = [];
    this.gridStoneItem = [];
    this.selectedInventoryItems = []
    this.inventoryItems = []
  }
  //#endregion

}
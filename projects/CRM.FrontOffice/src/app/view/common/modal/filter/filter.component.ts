import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { InclusionConfig, MasterConfig, MasterDNorm, MeasurementConfig } from 'shared/enitites';
import { GroupDescriptor } from '@progress/kendo-data-query';
import { CommonService, listColorMarkItems, listGrainingItems, listPriceRequestFilterTypeItems, PricingStoneStatus, StoneStatus, UtilityService, TypeA } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { NgxSpinnerService } from 'ngx-spinner';
import { InventoryService, MasterConfigService, PricingRequestService, SupplierService, SystemUserService, UserPricingCriteriaService } from '../../../../services';
import { fxCredential, InventoryItems, SupplierDNorm, SystemUser, UserPricingCriteria } from '../../../../entities';
import { InventorySearchCriteria, PriceRequestApiModel, WeightRange } from '../../../../businessobjects';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css']
})
export class FilterComponent implements OnInit {

  //#region Input Output
  @Input() isPricing: boolean = false;
  @Input() groups!: GroupDescriptor[];
  @Input() skip!: number;
  @Input() pageSize!: number;
  @Input() selectedSlots!: UserPricingCriteria[];
  @Input() inventorySearchCriteriaObj!: InventorySearchCriteria;
  @Input() selectedTypeDNormItems!: { text: string | null, value: string | null };
  @Output() ChildEvent = new EventEmitter();
  @Output() toggle: EventEmitter<boolean> = new EventEmitter();
  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains',
  };
  //#endregion

  //#region List & Objects
  public organizationDNormItems!: SupplierDNorm[];
  public selectedDeptItems?: { text: string, value: string };
  public empItems!: SystemUser[];
  public selectedEmpItems?: { text: string, value: string };
  public selectedCPS?: string;

  public listSupplierDNormItems: Array<{ name: string; value: string; isChecked: boolean }> = [];
  public allListSupplierDNormItems: Array<{ name: string; value: string; isChecked: boolean }> = [];
  public listEmpItems: Array<{ text: string; value: string }> = [];

  public masterConfigList!: MasterConfig;
  public allTheLab?: MasterDNorm[];
  public allTheShapes?: MasterDNorm[];
  public allColors?: MasterDNorm[];
  public allClarities?: MasterDNorm[];
  public allTheFluorescences?: MasterDNorm[];
  public allTheCPS?: MasterDNorm[];
  public allTheCut?: MasterDNorm[];
  public allTheGirdle: string[] = [];
  public minGirdle: string = '';
  public maxGirdle: string = '';

  public inclusionData: MasterDNorm[] = [];
  public inclusionConfig: InclusionConfig = new InclusionConfig();
  public measurementData: MasterDNorm[] = [];
  public measurementConfig: MeasurementConfig = new MeasurementConfig();
  public listStatus: Array<{ name: string; isChecked: boolean }> = [];
  public listKToS: Array<{ name: string; isChecked: boolean }> = [];
  public listCulet: Array<{ name: string; isChecked: boolean }> = [];
  public listLocation: Array<{ name: string; isChecked: boolean }> = [];
  public listGrainingItems = listGrainingItems;
  public listColorMarkItems = listColorMarkItems;
  public listColorMark: Array<{ name: string; isChecked: boolean }> = [];
  public allHoldBy: string[] = [];
  public listHoldByItems: Array<{ name: string; isChecked: boolean }> = [];
  public listKapanItems: Array<{ name: string; isChecked: boolean }> = [];
  public listIGradeItems: Array<{ name: string; isChecked: boolean }> = [];
  public listMGradeItems: Array<{ name: string; isChecked: boolean }> = [];
  public listTypeA: Array<{ name: string; isChecked: boolean }> = [];

  private fxCredentials!: fxCredential;

  public employeeCriteriaData: UserPricingCriteria[] = [];
  public selectedSlotsIds: string[] = [];
  public selectedSlotsDistinct: UserPricingCriteria = new UserPricingCriteria();

  public listPriceRequestFilterTypeItems = listPriceRequestFilterTypeItems;

  public inventoryItems: InventoryItems[] = [];
  public tempInventorySearchCriteriaObj: InventorySearchCriteria = new InventorySearchCriteria();
  //#endregion

  //#region Flag Obj
  public isBGM: boolean = false;
  public isNoBGM: boolean = false;
  public showSlotFilter: boolean = true;
  public inclusionFlag: boolean = false;
  //#endregion

  //#region Custom Models
  public stoneId: string = "";
  public certificateNo: string = "";

  public filterHoldBy: string = '';
  public filterHoldByChk: boolean = true;

  public firstCaratFrom?: number;
  public firstCaratTo?: number;
  public secondCaratFrom?: number;
  public secondCaratTo?: number;
  public thirdCaratFrom?: number;
  public thirdCaratTo?: number;
  public fourthCaratFrom?: number;
  public fourthCaratTo?: number;
  public errRation: string = "";
  public errDiscount: string = "";
  public errTotalDepth: string = "";
  public errTable: string = "";
  public errGirdlePer: string = "";
  public errGirdle: string = "";
  public errPavAngle: string = "";
  public errPavDepth: string = "";
  public errCrnAngle: string = "";
  public errCrnHeight: string = "";
  public errDiaMinimum: string = "";
  public errDiaMaximum: string = "";
  public errArrivalDate: string = "";
  public errLength: string = "";
  public errWidth: string = "";
  public errDepth: string = "";
  public errHeight: string = "";
  public errDollarPerCt: string = "";
  public errNetAmount: string = "";
  public errADay: string = "";
  public errMDay: string = "";
  //#endregion

  public loadChanges: boolean = false;

  constructor(private pricingRequestService: PricingRequestService,
    private employeeCriteriaService: UserPricingCriteriaService,
    private spinnerService: NgxSpinnerService,
    private alertDialogService: AlertdialogService,
    private masterConfigService: MasterConfigService,
    private organizationService: SupplierService,
    public utilityService: UtilityService,
    private commonService: CommonService,
    private inventoryService: InventoryService,
    private changeDetRef: ChangeDetectorRef,
    private employeeService: SystemUserService) { }

  async ngOnInit() {
    this.fxCredentials = JSON.parse(sessionStorage.getItem("fxCredentials") ?? '') as fxCredential;
    this.spinnerService.show();
    await this.getSupplierDNormData();
    await this.getSystemUserData();
    await this.getMasterConfigData();
    await this.getUserPricingCriteriaData(this.fxCredentials.id);
    this.setExtraValues();
  }

  //#region Init Data
  public async getUserPricingCriteriaData(id: string) {
    try {
      this.employeeCriteriaData = await this.employeeCriteriaService.getUserPricingCriteriaBySystemUser(id);
      if (this.selectedTypeDNormItems.value == 'Inv') {
        this.showSlotFilter = true;
        if (this.selectedSlots.length > 0)
          this.selectedSlotsIds = this.selectedSlots.map(z => z.id);
        this.distinctSelectedData();

        this.spinnerService.hide();
      }
      else {
        this.spinnerService.hide();
        this.showSlotFilter = false;
        this.distinctSelectedDataAll();
      }
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public setExtraValues() {
    if (this.inventorySearchCriteriaObj.weightRanges != null && this.inventorySearchCriteriaObj.weightRanges.length > 0) {
      if (this.inventorySearchCriteriaObj.weightRanges.length >= 1) {
        this.firstCaratFrom = this.inventorySearchCriteriaObj.weightRanges[0].minWeight;
        this.firstCaratTo = this.inventorySearchCriteriaObj.weightRanges[0].maxWeight;
      }
      if (this.inventorySearchCriteriaObj.weightRanges.length >= 2) {
        this.secondCaratFrom = this.inventorySearchCriteriaObj.weightRanges[1].minWeight;
        this.secondCaratTo = this.inventorySearchCriteriaObj.weightRanges[1].maxWeight;
      }
      if (this.inventorySearchCriteriaObj.weightRanges.length >= 3) {
        this.thirdCaratFrom = this.inventorySearchCriteriaObj.weightRanges[2].minWeight;
        this.thirdCaratTo = this.inventorySearchCriteriaObj.weightRanges[2].maxWeight;
      }
      if (this.inventorySearchCriteriaObj.weightRanges.length == 4) {
        this.fourthCaratFrom = this.inventorySearchCriteriaObj.weightRanges[3].minWeight;
        this.fourthCaratTo = this.inventorySearchCriteriaObj.weightRanges[3].maxWeight;
      }
    }

    if (this.inventorySearchCriteriaObj.stoneIds.length > 0)
      this.stoneId = this.inventorySearchCriteriaObj.stoneIds.join(",");

    if (this.inventorySearchCriteriaObj.certificateNos.length > 0)
      this.certificateNo = this.inventorySearchCriteriaObj.certificateNos.join(",");

    this.isBGM = this.inventorySearchCriteriaObj.isBgm;
  }

  public async getDistinctLocationData() {
    try {
      var locationItems = await this.inventoryService.getInventoryLocationList();
      if (locationItems) {
        locationItems.forEach(z => { this.listLocation.push({ name: z, isChecked: false }); });
        this.utilityService.onMultiSelectChange(this.listLocation, this.inventorySearchCriteriaObj.location);
        this.utilityService.onMultiSelectValueChange(this.listSupplierDNormItems, this.inventorySearchCriteriaObj.supplierIds);
        this.loadChanges = true;
      }
    }
    catch (error: any) {
      this.alertDialogService.show(error.error);
    }
  }

  //#region Org, Emp Data
  private async getSupplierDNormData() {
    try {
      let organizationDNormItems = await this.organizationService.getSupplierDNorm();
      if (organizationDNormItems) {
        this.organizationDNormItems = [...organizationDNormItems];

        this.organizationDNormItems.forEach(z => { this.listSupplierDNormItems.push({ name: z.name, value: z.id, isChecked: false }) });
        this.allListSupplierDNormItems = [...this.listSupplierDNormItems];
      }
    }
    catch (error: any) {
      console.error(error);
      this.alertDialogService.show(error.error);
    }
  }

  public async onSupplierDNormChange(e: any, isEdit: boolean = false) {
    const orgDNorm = this.organizationDNormItems.find(z => z.id == e.value);
    if (orgDNorm != undefined && orgDNorm != null) {
      this.inventorySearchCriteriaObj.supplierIds.push(orgDNorm.id);
    }

    this.spinnerService.show();
  }

  public async getSystemUserData() {
    this.empItems = await this.employeeService.getAllSystemUsers();
    if (this.empItems) {
      // this.allHoldBy = this.empItems.map(z => z.fullName);
      this.allHoldBy = this.empItems.filter(z => z.origin.toLowerCase() === 'seller').map(z => z.fullName);
      this.empItems.forEach((z) => { this.listEmpItems.push({ text: z.fullName, value: z.id }); });
      this.empItems.filter(z => z.origin.toLowerCase() == 'seller').forEach((z) => { this.listHoldByItems.push({ name: z.fullName, isChecked: false }); });
      this.utilityService.onMultiSelectChange(this.listHoldByItems, this.inventorySearchCriteriaObj.holdBy);
    }
  }

  public onSystemUserChange(e: any) {
    const emp = this.empItems.find(z => z.id == e.value);
    if (emp != undefined && emp != null) {
      this.inventorySearchCriteriaObj.empId?.push(emp.id);
    }
  }
  //#endregion

  //#region Master Config Data
  public async getMasterConfigData() {
    //Status
    Object.values(PricingStoneStatus).forEach(z => { if (z.toString() != StoneStatus.Pricing.toString() && z.toString() != StoneStatus.Sold.toString()) this.listStatus.push({ name: z.toString(), isChecked: false }); });
    if (!this.isPricing) {
      this.inventorySearchCriteriaObj.status = [];
      this.inventorySearchCriteriaObj.status.push(StoneStatus.Stock.toString());
      this.utilityService.onMultiSelectChange(this.listStatus, this.inventorySearchCriteriaObj.status);
    }
    else
      this.utilityService.onMultiSelectChange(this.listStatus, this.inventorySearchCriteriaObj.status);

    this.listColorMarkItems.forEach(z => { this.listColorMark.push({ name: z.toString(), isChecked: false }); });
    this.utilityService.onMultiSelectChange(this.listColorMark, this.inventorySearchCriteriaObj.discColorMark);

    //Master Config
    this.masterConfigList = await this.masterConfigService.getAllMasterConfig();
    this.allTheShapes = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.shape);
    this.allColors = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.colors);
    this.allClarities = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.clarities);
    this.allTheFluorescences = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.fluorescence);
    this.allTheCut = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.cut);
    this.allTheCPS = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.cps);
    this.allTheLab = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.lab);
    this.inclusionData = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.inclusions);
    this.inclusionConfig = this.masterConfigList.inclusionConfig;
    this.measurementData = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.measurements);
    this.measurementConfig = this.masterConfigList.measurementConfig;

    let allKTOS = this.inclusionData.filter(item => item.type.toLowerCase().indexOf('ktos') !== -1);
    allKTOS.forEach(z => { this.listKToS.push({ name: z.name, isChecked: false }); });
    this.utilityService.onMultiSelectChange(this.listKToS, this.inventorySearchCriteriaObj.kToS);

    let allCulet = this.inclusionData.filter(item => item.type.toLowerCase().indexOf('culet') !== -1);
    allCulet.forEach(z => { this.listCulet.push({ name: z.name, isChecked: false }); });
    this.utilityService.onMultiSelectChange(this.listCulet, this.inventorySearchCriteriaObj.culet);

    let iGradeItems = await this.inventoryService.getOrgIGradeList();
    iGradeItems.forEach(z => { this.listIGradeItems.push({ name: z, isChecked: false }); });
    this.utilityService.onMultiSelectChange(this.listIGradeItems, this.inventorySearchCriteriaObj.iGrade);

    let mGradeItems = await this.inventoryService.getOrgMGradeList();
    mGradeItems.forEach(z => { this.listMGradeItems.push({ name: z, isChecked: false }); });
    this.utilityService.onMultiSelectChange(this.listMGradeItems, this.inventorySearchCriteriaObj.mGrade);

    let allTheGirdle = this.measurementData.filter(item => item.type.toLowerCase().indexOf('girdle') !== -1);
    allTheGirdle.forEach(z => { this.allTheGirdle.push(z.name); });

    let kapanItems: string[] = [];
    if (this.selectedTypeDNormItems.value == 'Inv')
      kapanItems = await this.inventoryService.getOrgKapanList();
    else
      kapanItems = await this.pricingRequestService.getPriceRequestKapanList();
    kapanItems.forEach(z => { this.listKapanItems.push({ name: z, isChecked: false }); });
    this.utilityService.onMultiSelectChange(this.listKapanItems, this.inventorySearchCriteriaObj.kapan);

    //TypeA
    Object.values(TypeA).forEach(z => { this.listTypeA.push({ name: z.toString(), isChecked: false }); });

    await this.getDistinctLocationData();
  }
  //#endregion

  //#endregion

  //#region OnChange Functions
  public tagMapper(tags: string[]): void {
    // This function is used for hide selected items in multiselect box
  }

  public addRemoveStringInArrayFilter(a: string[], b: string) {
    if (b == 'All') {
      let c = [...a];
      c.forEach(z => { a.splice(0, 1); });
      return;
    }
    if (a.indexOf(b) == -1)
      a.push(b);
    else {
      let index = a.findIndex(x => x == b);
      if (index >= 0)
        a.splice(index, 1)
    }
  }

  public checkMinMaxValidation(min: any, max: any): string {
    if (min && max) {
      if (parseFloat(min) > parseFloat(max))
        return "min value must greater than max value!";
    }
    else if (min && !max)
      return "max value required!";
    else if (max && !min)
      return "min value required!";

    return '';
  }

  public changeBGMData(type: string) {
    if (type == 'Clear') {
      this.inventorySearchCriteriaObj.green = [];
      this.inventorySearchCriteriaObj.brown = [];
      this.inventorySearchCriteriaObj.milky = [];
      this.inventorySearchCriteriaObj.shade = [];
      this.isBGM = false;
      this.isNoBGM = false;
    }
    else if (type == 'NoBGM') {
      this.isBGM = false;
      if (this.isNoBGM) {
        this.inventorySearchCriteriaObj.green = [];
        this.inventorySearchCriteriaObj.brown = [];
        this.inventorySearchCriteriaObj.milky = [];
        this.inventorySearchCriteriaObj.shade = [];
        this.isNoBGM = false;
      }
      else {
        this.isNoBGM = true;

        const inclusions = [...this.inclusionData];
        let BrownData = inclusions.filter(item => item.type.toLowerCase().indexOf('brown') !== -1);
        var NoBrownData = BrownData.find(z => z.name.toLowerCase() == 'no');
        this.inventorySearchCriteriaObj.brown = [];
        this.inventorySearchCriteriaObj.brown.push(NoBrownData?.name ?? 'NO');

        var NoGreenData = inclusions.filter(item => item.type.toLowerCase().indexOf('green') !== -1).find(z => z.name.toLowerCase() == 'no');
        this.inventorySearchCriteriaObj.green = [];
        this.inventorySearchCriteriaObj.green.push(NoGreenData?.name ?? 'NO');

        var NoMilkyData = inclusions.filter(item => item.type.toLowerCase().indexOf('milky') !== -1).find(z => z.name.toLowerCase() == 'no');
        this.inventorySearchCriteriaObj.milky = [];
        this.inventorySearchCriteriaObj.milky.push(NoMilkyData?.name ?? 'NO');

        var NoShadeData = inclusions.filter(item => item.type.toLowerCase().indexOf('shade') !== -1).find(z => z.name.toLowerCase() == 'no');
        this.inventorySearchCriteriaObj.shade = [];
        this.inventorySearchCriteriaObj.shade.push(NoShadeData?.name ?? 'NO');
      }
    }
    else if (type == 'BGM') {
      this.isNoBGM = false;
      if (this.isBGM) {
        this.inventorySearchCriteriaObj.green = [];
        this.inventorySearchCriteriaObj.brown = [];
        this.inventorySearchCriteriaObj.milky = [];
        this.inventorySearchCriteriaObj.shade = [];
        this.isBGM = false;
      }
      else {
        this.isBGM = true;

        const inclusions = [...this.inclusionData];
        let BrownData = inclusions.filter(item => item.type.toLowerCase().indexOf('brown') !== -1);
        var AllBrownData = BrownData.filter(z => z.name.toLowerCase() != 'no').map(z => z.name) ?? [];
        this.inventorySearchCriteriaObj.brown = [];
        this.inventorySearchCriteriaObj.brown.push(...AllBrownData);

        var AllGreenData = inclusions.filter(item => item.type.toLowerCase().indexOf('green') !== -1).filter(z => z.name.toLowerCase() != 'no').map(z => z.name) ?? [];
        this.inventorySearchCriteriaObj.green = [];
        this.inventorySearchCriteriaObj.green.push(...AllGreenData);

        var AllMilkyData = inclusions.filter(item => item.type.toLowerCase().indexOf('milky') !== -1).filter(z => z.name.toLowerCase() != 'no').map(z => z.name) ?? [];
        this.inventorySearchCriteriaObj.milky = [];
        this.inventorySearchCriteriaObj.milky.push(...AllMilkyData);

        var AllShadeData = inclusions.filter(item => item.type.toLowerCase().indexOf('shade') !== -1).filter(z => z.name.toLowerCase() != 'no').map(z => z.name) ?? [];
        this.inventorySearchCriteriaObj.shade = [];
        this.inventorySearchCriteriaObj.shade.push(...AllShadeData);
      }
    }
    this.inventorySearchCriteriaObj.isBgm = this.isBGM;
  }

  public checkBGM() {
    var NoMilkyData = this.inclusionData.filter(item => item.type.toLowerCase().indexOf('milky') !== -1).find(z => z.name.toLowerCase() == 'no');
    var checkMilky = this.inventorySearchCriteriaObj.milky.indexOf(NoMilkyData?.name ?? 'NO');

    var NoGreenData = this.inclusionData.filter(item => item.type.toLowerCase().indexOf('green') !== -1).find(z => z.name.toLowerCase() == 'no');
    var checkGreen = this.inventorySearchCriteriaObj.green.indexOf(NoGreenData?.name ?? 'NO');

    let BrownData = this.inclusionData.filter(item => item.type.toLowerCase().indexOf('brown') !== -1).find(z => z.name.toLowerCase() == 'no');
    var checkBrown = this.inventorySearchCriteriaObj.brown.indexOf(BrownData?.name ?? 'NO');

    let ShadeData = this.inclusionData.filter(item => item.type.toLowerCase().indexOf('shade') !== -1).find(z => z.name.toLowerCase() == 'no');
    var checkShade = this.inventorySearchCriteriaObj.shade.indexOf(ShadeData?.name ?? 'NO');

    if (checkMilky > -1 && checkGreen > -1 && checkBrown > -1 && checkShade > -1)
      this.isNoBGM = true;
    else {
      this.isNoBGM = false;

      var allMilkyCount = this.inclusionData.filter(item => item.type.toLowerCase().indexOf('milky') !== -1).filter(z => z.name.toLowerCase() != 'no').length;
      var milkyDataCount = this.inventorySearchCriteriaObj.milky.filter(z => z.toLowerCase() != 'no').length;

      var allGreenData = this.inclusionData.filter(item => item.type.toLowerCase().indexOf('green') !== -1).filter(z => z.name.toLowerCase() != 'no').length;
      var greenDataCount = this.inventorySearchCriteriaObj.green.filter(z => z.toLowerCase() != 'no').length;

      let allBrownData = this.inclusionData.filter(item => item.type.toLowerCase().indexOf('brown') !== -1).filter(z => z.name.toLowerCase() != 'no').length;
      let brownDataCount = this.inventorySearchCriteriaObj.brown.filter(z => z.toLowerCase() != 'no').length;

      let allShadeData = this.inclusionData.filter(item => item.type.toLowerCase().indexOf('shade') !== -1).filter(z => z.name.toLowerCase() != 'no').length;
      let shadeDataCount = this.inventorySearchCriteriaObj.shade.filter(z => z.toLowerCase() != 'no').length;

      if (brownDataCount == allGreenData && greenDataCount == allBrownData && allMilkyCount == milkyDataCount && allShadeData == shadeDataCount)
        this.isBGM = true;
      else
        this.isBGM = false;
    }
    this.inventorySearchCriteriaObj.isBgm = this.isBGM;
  }

  public clearSearchCriteria(form: NgForm, isClearAll = true): void {
    let selectedDNorm = JSON.parse(JSON.stringify(this.selectedTypeDNormItems));
    form?.reset();
    this.inventorySearchCriteriaObj = new InventorySearchCriteria();
    this.inventorySearchCriteriaObj.supplierIds = [];

    this.firstCaratFrom = undefined;
    this.firstCaratTo = undefined;
    this.secondCaratFrom = undefined;
    this.secondCaratTo = undefined;
    this.thirdCaratFrom = undefined;
    this.thirdCaratTo = undefined;
    this.fourthCaratFrom = undefined;
    this.fourthCaratTo = undefined;

    if (isClearAll) {
      this.selectedSlots = [];
      this.selectedSlotsIds = [];
      this.selectedSlotsDistinct = new UserPricingCriteria();

      if (!this.isPricing)
        this.selectedTypeDNormItems = { text: null, value: null };
    }
    else
      this.selectedTypeDNormItems = selectedDNorm;

    this.stoneId = '';
    this.certificateNo = '';

    this.listStatus.forEach(z => { z.isChecked = false });
    this.listColorMark.forEach(z => { z.isChecked = false });
    this.listLocation.forEach(z => { z.isChecked = false });
    this.listKToS.forEach(z => { z.isChecked = false });
    this.listCulet.forEach(z => { z.isChecked = false });
    this.isBGM = false;
    this.isNoBGM = false;

    this.getUserPricingCriteriaData(this.fxCredentials.id);
  }

  public closeSlotFilterDialog(): void {
    this.toggle.emit(false);
  }

  public onTypeChange(e: any): void {
    if (e.value == "Inv") {
      this.selectedSlots = [];
      this.selectedSlotsIds = [];
      this.selectedSlotsDistinct = new UserPricingCriteria();
      this.showSlotFilter = true;
    }
    else {
      this.showSlotFilter = false;
      this.distinctSelectedDataAll();
      this.listSupplierDNormItems = [...this.allListSupplierDNormItems];
    }
  }

  public onGirdleChange() {
    this.errGirdle = '';
    this.inventorySearchCriteriaObj.girdle = [];

    if (this.minGirdle || this.maxGirdle) {
      if (this.minGirdle && this.maxGirdle) {
        let allTheGirdle = this.measurementData.filter(item => item.type.toLowerCase().indexOf('girdle') !== -1);
        let min = Number(allTheGirdle.find(z => this.minGirdle == z.name)?.priority ?? 0);
        let max = Number(allTheGirdle.find(z => this.maxGirdle == z.name)?.priority ?? 0);
        if (max < min)
          this.errGirdle = 'Invalid max & min selection';
        else {
          let data = allTheGirdle.filter(z => parseInt(z.priority) >= min && parseInt(z.priority) <= max).map(z => z.name);
          this.inventorySearchCriteriaObj.girdle = data;
        }
      }
      else
        this.errGirdle = 'min & max girdle are required';
    }
  }

  public onSelectUserPricingCriteria(data: UserPricingCriteria): void {
    if (this.selectedSlots.length > 0) {
      var index = this.selectedSlots.findIndex(z => z.id == data.id);
      if (index > -1)
        this.selectedSlots.splice(index, 1);
      else
        this.selectedSlots.push(data);
    } else
      this.selectedSlots.push(data);

    this.distinctSelectedData();
  }

  public distinctSelectedData(): void {
    this.selectedSlotsDistinct = new UserPricingCriteria();
    if (this.selectedSlots.length > 0) {
      this.selectedSlots.forEach(z => {
        this.selectedSlotsDistinct.shape.push(...z.shape.map(a => a.toUpperCase()));
        this.selectedSlotsDistinct.lab.push(...z.lab.map(a => a.toUpperCase()));
        this.selectedSlotsDistinct.color.push(...z.color.map(a => a.toUpperCase()));
        this.selectedSlotsDistinct.clarity.push(...z.clarity.map(a => a.toUpperCase()));
        this.selectedSlotsDistinct.cut.push(...z.cut.map(a => a.toUpperCase()));
        this.selectedSlotsDistinct.polish.push(...z.polish.map(a => a.toUpperCase()));
        this.selectedSlotsDistinct.symmetry.push(...z.symmetry.map(a => a.toUpperCase()));
        this.selectedSlotsDistinct.fluorescence.push(...z.fluorescence.map(a => a.toUpperCase()));
        this.selectedSlotsDistinct.organizations.push(...z.organizations.map(a => a.toUpperCase()));
      });

      this.selectedSlotsDistinct.shape = this.selectedSlotsDistinct.shape.filter(this.utilityService.onlyUniqueFromStringArray);
      this.selectedSlotsDistinct.lab = this.selectedSlotsDistinct.lab.filter(this.utilityService.onlyUniqueFromStringArray);
      this.selectedSlotsDistinct.color = this.selectedSlotsDistinct.color.filter(this.utilityService.onlyUniqueFromStringArray);
      this.selectedSlotsDistinct.clarity = this.selectedSlotsDistinct.clarity.filter(this.utilityService.onlyUniqueFromStringArray);
      this.selectedSlotsDistinct.cut = this.selectedSlotsDistinct.cut.filter(this.utilityService.onlyUniqueFromStringArray);
      this.selectedSlotsDistinct.polish = this.selectedSlotsDistinct.polish.filter(this.utilityService.onlyUniqueFromStringArray);
      this.selectedSlotsDistinct.symmetry = this.selectedSlotsDistinct.symmetry.filter(this.utilityService.onlyUniqueFromStringArray);
      this.selectedSlotsDistinct.fluorescence = this.selectedSlotsDistinct.fluorescence.filter(this.utilityService.onlyUniqueFromStringArray);
      this.selectedSlotsDistinct.organizations = this.selectedSlotsDistinct.organizations.filter(this.utilityService.onlyUniqueFromStringArray);
    }
    else {
      this.listSupplierDNormItems = [...this.allListSupplierDNormItems];
      if (this.selectedTypeDNormItems?.value != "Inv")
        this.distinctSelectedDataAll();
    }

  }

  public distinctSelectedDataAll(): void {
    this.selectedSlotsDistinct = new UserPricingCriteria();
    this.allTheShapes?.forEach(z => { this.selectedSlotsDistinct.shape.push(z.name.toUpperCase()); });
    this.allTheLab?.forEach(z => { this.selectedSlotsDistinct.lab.push(z.name.toUpperCase()); });
    this.allColors?.forEach(z => { this.selectedSlotsDistinct.color.push(z.name.toUpperCase()); });
    this.allClarities?.forEach(z => { this.selectedSlotsDistinct.clarity.push(z.name.toUpperCase()); });
    this.allTheCPS?.forEach(z => { this.selectedSlotsDistinct.cut.push(z.name.toUpperCase()); });
    this.allTheCPS?.forEach(z => { this.selectedSlotsDistinct.polish.push(z.name.toUpperCase()); });
    this.allTheCPS?.forEach(z => { this.selectedSlotsDistinct.symmetry.push(z.name.toUpperCase()); });
    this.allTheFluorescences?.forEach(z => { this.selectedSlotsDistinct.fluorescence.push(z.name.toUpperCase()); });
  }

  public selectAllSlot() {
    this.selectedSlots.push(...this.employeeCriteriaData);
    let selectedSlotIds = this.employeeCriteriaData.map(z => z.id);
    this.selectedSlotsIds.push(...selectedSlotIds);
    this.distinctSelectedData();
  }

  public deSelectAllSlot() {
    this.selectedSlots = [];
    this.selectedSlotsIds = [];
    this.distinctSelectedData();
  }
  //#endregion

  //#region Filter Search Functions
  public async getPriceRequestData() {
    try {
      if (this.selectedTypeDNormItems?.value == 'Inv' && this.selectedSlots.length == 0) {
        this.alertDialogService.show(`Please slelect at least one slot.`);
        return;
      }
      this.spinnerService.show();
      this.assignAdditionalData();

      let req: PriceRequestApiModel = new PriceRequestApiModel();
      req.slots = this.selectedSlots;
      req.invFilter = this.inventorySearchCriteriaObj;
      req.type = this.selectedTypeDNormItems?.value ?? 'Temp';
      req.systemUserId = this.fxCredentials.id;
      req.skip = 0;
      req.take = this.pageSize;

      this.ChildEvent.emit(req);
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public assignAdditionalData(): void {
    let weightRanges = new Array<WeightRange>();

    if (this.firstCaratFrom && this.firstCaratTo) {
      let weight = new WeightRange();
      weight.minWeight = Number(this.firstCaratFrom);
      weight.maxWeight = Number(this.firstCaratTo);
      weightRanges.push(weight);
    }
    if (this.secondCaratFrom && this.secondCaratTo) {
      let weight = new WeightRange();
      weight.minWeight = Number(this.secondCaratFrom);
      weight.maxWeight = Number(this.secondCaratTo);
      weightRanges.push(weight);
    }
    if (this.thirdCaratFrom && this.thirdCaratTo) {
      let weight = new WeightRange();
      weight.minWeight = Number(this.thirdCaratFrom);
      weight.maxWeight = Number(this.thirdCaratTo);
      weightRanges.push(weight);
    }
    if (this.fourthCaratFrom && this.fourthCaratTo) {
      let weight = new WeightRange();
      weight.minWeight = Number(this.fourthCaratFrom);
      weight.maxWeight = Number(this.fourthCaratTo);
      weightRanges.push(weight);
    }
    this.inventorySearchCriteriaObj.weightRanges = weightRanges;
    this.inventorySearchCriteriaObj.stoneIds = this.stoneId ? this.utilityService.CheckStoneIds(this.stoneId).map(x => x.toUpperCase()) : [];
    this.inventorySearchCriteriaObj.certificateNos = this.certificateNo ? this.utilityService.checkCertificateIds(this.certificateNo) : [];
  }

  public dateChangeFunction(e: any, type: string): void {
    if (type == 'from')
      this.inventorySearchCriteriaObj.fromDate = e ? this.utilityService.setUTCDateFilter(e) : null;
    else
      this.inventorySearchCriteriaObj.toDate = e ? this.utilityService.setUTCDateFilter(e) : null;
  }

  public holdDateChangeFunction(e: any, type: string): void {
    if (type == 'from')
      this.inventorySearchCriteriaObj.fromHoldDate = e ? this.utilityService.setUTCDateFilter(e) : null;
    else
      this.inventorySearchCriteriaObj.toHoldDate = e ? this.utilityService.setUTCDateFilter(e) : null;
  }

  public priceDateChangeFunction(e: any, type: string): void {
    if (type == 'from')
      this.inventorySearchCriteriaObj.fromPriceDate = e ? this.utilityService.setUTCDateFilter(e) : null;
    else
      this.inventorySearchCriteriaObj.toPriceDate = e ? this.utilityService.setUTCDateFilter(e) : null;
  }
  //#endregion
}
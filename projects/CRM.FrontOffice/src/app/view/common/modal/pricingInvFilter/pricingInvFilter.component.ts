import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CutDetailDNorm, InclusionConfig, MasterConfig, MasterDNorm, MeasurementConfig } from 'shared/enitites';
import { GroupDescriptor } from '@progress/kendo-data-query';
import { listColorMarkItems, listPriceRequestFilterTypeItems, PricingStoneStatus, StoneStatus, UtilityService, TypeA } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { NgxSpinnerService } from 'ngx-spinner';
import { InventoryService, MasterConfigService, PricingRequestService, SupplierService, SystemUserService, UserPricingCriteriaService } from '../../../../services';
import { fxCredential, SupplierDNorm, SystemUser, UserPricingCriteria } from '../../../../entities';
import { InventorySearchCriteria, PriceRequestApiModel, WeightRange } from '../../../../businessobjects';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-pricing-inv-filter',
  templateUrl: './pricingInvFilter.component.html',
  styleUrls: ['./pricingInvFilter.component.css']
})
export class PricingInvFilterComponent implements OnInit {

  //Start - Input & Output
  @Input() isPricing: boolean = false;
  @Input() groups!: GroupDescriptor[];
  @Input() skip!: number;
  @Input() pageSize!: number;
  @Input() selectedSlots!: UserPricingCriteria[];
  @Input() inventorySearchCriteriaObj!: InventorySearchCriteria;
  @Input() selectedTypeDNormItems!: { text: string | null, value: string | null };
  @Output() ChildEvent = new EventEmitter();
  @Output() toggle: EventEmitter<boolean> = new EventEmitter();
  //End - Input & Output

  //Start - Flags
  public isBGM: boolean = false;
  public isNoBGM: boolean = false;
  public showSlotFilter: boolean = true;
  public inclusionFlag: boolean = false;
  public loadChanges: boolean = false;
  //End - Flags

  //Start - List & Objects
  public organizationDNormItems!: SupplierDNorm[];
  public selectedCPS?: string;

  public empItems!: SystemUser[];
  public allHoldBy: string[] = [];
  public listEmpItems: Array<{ text: string; value: string }> = [];
  public listHoldByItems: Array<{ name: string; isChecked: boolean }> = [];
  public listPriceRequestFilterTypeItems = listPriceRequestFilterTypeItems; //List Of Filter Type Items
  private fxCredentials!: fxCredential; //Get credential
  public employeeCriteriaData: UserPricingCriteria[] = [];
  public selectedSlot: UserPricingCriteria[] = [];
  public selectedSlotsDistinct: UserPricingCriteria = new UserPricingCriteria();
  public listSupplierDNormItems: Array<{ name: string; value: string; isChecked: boolean }> = [];
  public allListSupplierDNormItems: Array<{ name: string; value: string; isChecked: boolean }> = [];
  public listStatus: Array<{ name: string; isChecked: boolean }> = [];
  public measurementData: MasterDNorm[] = [];
  public measurementConfig: MeasurementConfig = new MeasurementConfig();
  public listKToS: Array<{ name: string; isChecked: boolean }> = [];
  public listCulet: Array<{ name: string; isChecked: boolean }> = [];
  public listLocation: Array<{ name: string; isChecked: boolean }> = [];
  public listKapanItems: Array<{ name: string; isChecked: boolean }> = [];
  public listColorMark: Array<{ name: string; isChecked: boolean }> = [];
  public listTypeA: Array<{ name: string; isChecked: boolean }> = [];
  public listIGradeItems: Array<{ name: string; isChecked: boolean }> = [];
  public listMGradeItems: Array<{ name: string; isChecked: boolean }> = [];
  public listColorMarkItems = listColorMarkItems;

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
  public allCutDetails!: CutDetailDNorm[];

  public inclusionData: MasterDNorm[] = [];
  public inclusionConfig: InclusionConfig = new InclusionConfig();

  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains',
  };
  //End - List & Objects

  //Custom models
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
  public errFromToDate: string = "";
  public errHoldDate: string = "";
  public errPriceDate: string = "";
  public errFirstCarat: string = "";
  public errSecondCarat: string = "";
  public errThirdCarat: string = "";
  public errFourthCarat: string = "";

  constructor(private pricingRequestService: PricingRequestService,
    private employeeCriteriaService: UserPricingCriteriaService,
    private spinnerService: NgxSpinnerService,
    private alertDialogService: AlertdialogService,
    private masterConfigService: MasterConfigService,
    private organizationService: SupplierService,
    public utilityService: UtilityService,
    private inventoryService: InventoryService,
    private employeeService: SystemUserService) { }

  async ngOnInit() {
    this.selectedSlot = [this.selectedSlots[0]];
    this.fxCredentials = JSON.parse(sessionStorage.getItem("fxCredentials") ?? '') as fxCredential;
    this.spinnerService.show();
    await this.getSupplierDNormData();
    await this.getSystemUserData();
    await this.getMasterConfigData();
    await this.getUserPricingCriteriaData(this.fxCredentials.id);
    this.setExtraValues();
  }

  //Get User Pricing Criteria Data
  public async getUserPricingCriteriaData(id: string) {
    try {
      this.employeeCriteriaData = await this.employeeCriteriaService.getUserPricingCriteriaBySystemUser(id);
      if (this.selectedTypeDNormItems.value == 'Inv') {
        this.showSlotFilter = true;
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

    // this.isBGM = this.inventorySearchCriteriaObj.isBgm;
  }

  //Changed PriceRequest Filter Type Method
  public onTypeChange(e: any): void {
    if (e.value == "Inv") {
      this.distinctSelectedData();
      this.showSlotFilter = true;
    }
    else {
      this.showSlotFilter = false;
      this.inventorySearchCriteriaObj.shape = [];
      this.inventorySearchCriteriaObj.color = [];
      this.inventorySearchCriteriaObj.clarity = [];
      this.inventorySearchCriteriaObj.flour = [];
      this.inventorySearchCriteriaObj.lab = [];
      this.inventorySearchCriteriaObj.cps = [];
      this.inventorySearchCriteriaObj.cut = [];
      this.inventorySearchCriteriaObj.polish = [];
      this.inventorySearchCriteriaObj.symm = [];
      this.distinctSelectedDataAll();
      this.listSupplierDNormItems = [...this.allListSupplierDNormItems];
    }
  }

  //Select Pricing Criteria
  public onSelectUserPricingCriteria(slot: UserPricingCriteria[]) {
    this.inventorySearchCriteriaObj.shape = [];
    this.inventorySearchCriteriaObj.color = [];
    this.inventorySearchCriteriaObj.clarity = [];
    this.inventorySearchCriteriaObj.flour = [];
    this.inventorySearchCriteriaObj.lab = [];
    this.inventorySearchCriteriaObj.cps = [];
    this.inventorySearchCriteriaObj.cut = [];
    this.inventorySearchCriteriaObj.polish = [];
    this.inventorySearchCriteriaObj.symm = [];
    if (slot !== null && slot !== undefined) {
      this.selectedSlot = slot;
      this.distinctSelectedData();
    } else {
      console.error("Invalid slot:", slot);
    }
  }

  //#region - Get Locations Data - Op
  public async getDistinctLocationData() {
    try {
      const locationItems = await this.inventoryService.getInventoryLocationList();
      if (locationItems) {
        this.listLocation = locationItems.map(z => ({ name: z, isChecked: false }));
        this.utilityService.onMultiSelectChange(this.listLocation, this.inventorySearchCriteriaObj.location);
        this.utilityService.onMultiSelectValueChange(this.listSupplierDNormItems, this.inventorySearchCriteriaObj.supplierIds);
        this.loadChanges = true;
      }
    } catch (error: any) {
      this.alertDialogService.show(error.error);
    }
  }
  //#endregion - Get Locations Data

  //#region - From-To Date Changed Function - Op
  public dateChangeFunction(e: any, type: string): void {
    this.inventorySearchCriteriaObj[type === 'from' ? 'fromDate' : 'toDate'] = e ? this.utilityService.setUTCDateFilter(e) : null;
    this.errFromToDate = !this.inventorySearchCriteriaObj.fromDate && this.inventorySearchCriteriaObj.toDate ? "From Date is required!" : !this.inventorySearchCriteriaObj.toDate && this.inventorySearchCriteriaObj.fromDate ? "To Date is required!" : '';
  }
  //#endregion - From-To Date Changed Function

  //#region - Hold Date Changed Function - Op
  public holdDateChangeFunction(e: any, type: string): void {
    this.inventorySearchCriteriaObj[type === 'from' ? 'fromHoldDate' : 'toHoldDate'] = e ? this.utilityService.setUTCDateFilter(e) : null;
    this.errHoldDate = !this.inventorySearchCriteriaObj.fromHoldDate && this.inventorySearchCriteriaObj.toHoldDate ? "From Hold Date is required!" : !this.inventorySearchCriteriaObj.toHoldDate && this.inventorySearchCriteriaObj.fromHoldDate ? "To Hold Date is required!" : '';
  }
  //#endregion - Hold Date Changed Function

  //#region - Price Date Changed Function - Op
  public priceDateChangeFunction(e: any, type: string): void {
    this.inventorySearchCriteriaObj[type === 'from' ? 'fromPriceDate' : 'toPriceDate'] = e ? this.utilityService.setUTCDateFilter(e) : null;
    this.errPriceDate = !this.inventorySearchCriteriaObj.fromPriceDate && this.inventorySearchCriteriaObj.toPriceDate ? "From Price Date is required!" : !this.inventorySearchCriteriaObj.toPriceDate && this.inventorySearchCriteriaObj.fromPriceDate ? "To Price Date is required!" : '';
  }
  //#endregion - Price Date Changed Function

  //#region - Get System Users Data - Op
  public async getSystemUserData() {
    this.empItems = await this.employeeService.getAllSystemUsers();
    if (this.empItems) {
      //this.allHoldBy = this.empItems.map(z => z.fullName);
      this.allHoldBy = this.empItems.filter(z => z.origin.toLowerCase() === 'seller').map(z => z.fullName);
      this.listEmpItems = this.empItems.map(z => ({ text: z.fullName, value: z.id }));
      this.listHoldByItems = this.empItems
        .filter(z => z.origin.toLowerCase() === 'seller')
        .map(z => ({ name: z.fullName, isChecked: false }));
      await this.utilityService.onMultiSelectChange(this.listHoldByItems, this.inventorySearchCriteriaObj.holdBy);
    }
  }
  //#endregion - Get System Users Data

  //#region - Validate Min-Max Value - Op
  public checkMinMaxValidation(min: any, max: any): string {
    if (min && max) {
      return parseFloat(min) > parseFloat(max) ? "min value must be less than max value!" : '';
    } else {
      return min && !max ? "max value is required!" : max && !min ? "min value is required!" : '';
    }
  }
  //#endregion - Validate Min-Max Value

  private validateCaratRange(fromCarat: number | undefined, toCarat: number | undefined): string {
    const minWeight = this.selectedSlot[0].minWeight;
    const maxWeight = this.selectedSlot[0].maxWeight;

    if (fromCarat && fromCarat !== undefined && fromCarat < minWeight) {
      return "Size must be >= minimum weight criteria.";
    } else if (toCarat && toCarat !== undefined && toCarat > maxWeight) {
      return "Size must be <= maximum weight criteria.";
    } else if (fromCarat && fromCarat !== undefined && fromCarat > maxWeight) {
      return "Min size must be <= maximum weight criteria.";
    } else if (toCarat && toCarat !== undefined && toCarat < minWeight) {
      return "Max size must be >= minimum weight criteria.";
    } else if (!fromCarat && toCarat) {
      return "Min size is required!";
    } else if (!toCarat && fromCarat) {
      return "Max size is required!";
    } else {
      return '';
    }
  }

  public checkWeightValidation() {
    this.errFirstCarat = this.validateCaratRange(this.firstCaratFrom, this.firstCaratTo);
    this.errSecondCarat = this.validateCaratRange(this.secondCaratFrom, this.secondCaratTo);
    this.errThirdCarat = this.validateCaratRange(this.thirdCaratFrom, this.thirdCaratTo);
    this.errFourthCarat = this.validateCaratRange(this.fourthCaratFrom, this.fourthCaratTo);
  }

  public alterStringInArrayByFilterCriteria(a: string[], b: string, c?: string[], d?: any,) {
    let criteriaArray = ["cps", "color", "clarity", "fluorescence", "lab", "shape"];
    if (b === "All" && c) {
      a.splice(0, a.length, ...c);
    } else {
      if (a.length === (this.selectedSlot[0] as any)[d]?.length) {
        a.splice(0, a.length);
      }
      if (this.inventorySearchCriteriaObj.cps?.length === 0 || criteriaArray?.includes(d)) {
        const index = a.indexOf(b);
        if (index === -1) {
          a.push(b);
        } else {
          a.splice(index, 1);
        }
      }
    }

    if (d === "clearCPS") {
      this.inventorySearchCriteriaObj.cut = [];
      this.inventorySearchCriteriaObj.polish = [];
      this.inventorySearchCriteriaObj.symm = [];
      this.inventorySearchCriteriaObj.cps = [];
    }

    if (d === "cps") {
      if (a.length > 0) {
        const selectedCutDetails = this.allCutDetails.filter((x) => a.includes(x.cps));
        this.inventorySearchCriteriaObj.cut = [...new Set(selectedCutDetails.map((x) => x.cut))];
        this.inventorySearchCriteriaObj.polish = [...new Set(selectedCutDetails.map((x) => x.polish))];
        this.inventorySearchCriteriaObj.symm = [...new Set(selectedCutDetails.map((x) => x.symmetry))];
      }

      if (a.length === 0) {
        this.inventorySearchCriteriaObj.cut = [];
        this.inventorySearchCriteriaObj.polish = [];
        this.inventorySearchCriteriaObj.symm = [];
      }
    }
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

  //#region - Master Config Data
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

    //#region - Get Kapan List - Op
    let kapanItems: string[] = [];
    if (this.selectedTypeDNormItems.value == 'Inv')
      kapanItems = await this.inventoryService.getOrgKapanList();
    else
      kapanItems = await this.pricingRequestService.getPriceRequestKapanList();
    this.listKapanItems = kapanItems.map(z => ({ name: z, isChecked: false }));
    this.utilityService.onMultiSelectChange(this.listKapanItems, this.inventorySearchCriteriaObj.kapan);
    //#endregion - Get Kapan List

    //#region - Get List Of Color Mark - Op
    this.listColorMark = this.listColorMarkItems.map(z => ({ name: z.toString(), isChecked: false }));
    this.utilityService.onMultiSelectChange(this.listColorMark, this.inventorySearchCriteriaObj.discColorMark);
    //#endregion - Get List Of Color Mark

    //#region - TypeA - Done
    Object.values(TypeA).forEach(z => { this.listTypeA.push({ name: z.toString(), isChecked: false }); });
    //#endregion - TypeA

    // //Master Config
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

    //#region - Get Key to Symbol(KTOS)
    const allKTOS = this.inclusionData.filter(item => item.type.toLowerCase().includes('ktos')).map(z => ({ name: z.name, isChecked: false }));
    this.listKToS.push(...allKTOS);
    this.utilityService.onMultiSelectChange(this.listKToS, this.inventorySearchCriteriaObj.kToS);
    //#endregion - Get Key to Symbol

    //#region - Get Culet Data
    const allCulet = this.inclusionData.filter(item => item.type.toLowerCase().includes('culet')).map(z => ({ name: z.name, isChecked: false }));
    this.listCulet.push(...allCulet);
    this.utilityService.onMultiSelectChange(this.listCulet, this.inventorySearchCriteriaObj.culet);
    //#endregion - Get Culet Data

    //#region - Get IGrade Dropdown Data
    const iGradeItems = await this.inventoryService.getOrgIGradeList();
    this.listIGradeItems = iGradeItems.map(z => ({ name: z, isChecked: false }));
    this.utilityService.onMultiSelectChange(this.listIGradeItems, this.inventorySearchCriteriaObj.iGrade);
    //#endregion - Get IGrade Dropdown Data

    //#region - Get MGrade Dropdown Data
    const mGradeItems = await this.inventoryService.getOrgMGradeList();
    this.listMGradeItems = mGradeItems.map(z => ({ name: z, isChecked: false }));
    this.utilityService.onMultiSelectChange(this.listMGradeItems, this.inventorySearchCriteriaObj.mGrade);
    //#endregion - Get MGrade Dropdown Data

    //#region - Get Girdle Data
    const allTheGirdle = this.measurementData.filter(item => item.type.toLowerCase().includes('girdle')).map(z => z.name);
    this.allTheGirdle.push(...allTheGirdle);
    //#endregion - Get Girdle Data

    this.allCutDetails = this.masterConfigList?.cutDetails;
    await this.getDistinctLocationData();
  }

  public distinctSelectedData(): void {
    this.selectedSlotsDistinct = new UserPricingCriteria();
    if (this.selectedSlot.length > 0) {
      this.selectedSlot.forEach(z => {
        this.selectedSlotsDistinct.shape.push(...z.shape.map(a => a.toUpperCase()));
        this.selectedSlotsDistinct.lab.push(...z.lab.map(a => a.toUpperCase()));
        this.selectedSlotsDistinct.color.push(...z.color.map(a => a.toUpperCase()));
        this.selectedSlotsDistinct.clarity.push(...z.clarity.map(a => a.toUpperCase()));
        this.selectedSlotsDistinct.fluorescence.push(...z.fluorescence.map(a => a.toUpperCase()));
        this.selectedSlotsDistinct.organizations.push(...z.organizations.map(a => a.toUpperCase()));
      });

      this.selectedSlotsDistinct.shape = this.selectedSlotsDistinct.shape.filter(this.utilityService.onlyUniqueFromStringArray);
      this.selectedSlotsDistinct.lab = this.selectedSlotsDistinct.lab.filter(this.utilityService.onlyUniqueFromStringArray);
      this.selectedSlotsDistinct.color = this.selectedSlotsDistinct.color.filter(this.utilityService.onlyUniqueFromStringArray);
      this.selectedSlotsDistinct.clarity = this.selectedSlotsDistinct.clarity.filter(this.utilityService.onlyUniqueFromStringArray);
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
    this.allTheFluorescences?.forEach(z => { this.selectedSlotsDistinct.fluorescence.push(z.name.toUpperCase()); });
  }

  public assignAdditionalData(): void {
    let weightRanges = new Array<WeightRange>();

    const caratRanges = [
      { from: this.firstCaratFrom, to: this.firstCaratTo },
      { from: this.secondCaratFrom, to: this.secondCaratTo },
      { from: this.thirdCaratFrom, to: this.thirdCaratTo },
      { from: this.fourthCaratFrom, to: this.fourthCaratTo }
    ];

    caratRanges.forEach(range => {
      if (range.from && range.to) {
        const weight = new WeightRange();
        weight.minWeight = Number(range.from);
        weight.maxWeight = Number(range.to);
        weightRanges.push(weight);
      }
    });
    this.inventorySearchCriteriaObj.weightRanges = weightRanges;
    this.inventorySearchCriteriaObj.stoneIds = this.stoneId ? this.utilityService.CheckStoneIds(this.stoneId).map(x => x.toUpperCase()) : [];
    this.inventorySearchCriteriaObj.certificateNos = this.certificateNo ? this.utilityService.checkCertificateIds(this.certificateNo) : [];
    this.inventorySearchCriteriaObj.minWeight = this.selectedSlot[0].minWeight;
    this.inventorySearchCriteriaObj.maxWeight = this.selectedSlot[0].maxWeight;

    if (this.selectedTypeDNormItems?.value == 'Inv') {
      const selectedSlotCopy = { ...this.selectedSlot[0] };
      if (this.inventorySearchCriteriaObj.shape.length === 0)
        this.alterStringInArrayByFilterCriteria(this.inventorySearchCriteriaObj.shape, 'All', selectedSlotCopy.shape);
      if (this.inventorySearchCriteriaObj.color.length === 0)
        this.alterStringInArrayByFilterCriteria(this.inventorySearchCriteriaObj.color, 'All', selectedSlotCopy.color);
      if (this.inventorySearchCriteriaObj.clarity.length === 0)
        this.alterStringInArrayByFilterCriteria(this.inventorySearchCriteriaObj.clarity, 'All', selectedSlotCopy.clarity);
      if (this.inventorySearchCriteriaObj.lab.length === 0)
        this.alterStringInArrayByFilterCriteria(this.inventorySearchCriteriaObj.lab, 'All', selectedSlotCopy.lab);
      const { cps, cut, polish, symm } = this.inventorySearchCriteriaObj;
      if (!(cps?.length || cut?.length || polish?.length || symm?.length)) {
        this.alterStringInArrayByFilterCriteria(cps, 'All', selectedSlotCopy.cps);
      }
      if (this.inventorySearchCriteriaObj.cut.length === 0)
        this.alterStringInArrayByFilterCriteria(this.inventorySearchCriteriaObj.cut, 'All', selectedSlotCopy.cut);
      if (this.inventorySearchCriteriaObj.polish.length === 0)
        this.alterStringInArrayByFilterCriteria(this.inventorySearchCriteriaObj.polish, 'All', selectedSlotCopy.polish);
      if (this.inventorySearchCriteriaObj.symm.length === 0)
        this.alterStringInArrayByFilterCriteria(this.inventorySearchCriteriaObj.symm, 'All', selectedSlotCopy.symmetry);
      if (this.inventorySearchCriteriaObj.flour.length === 0)
        this.alterStringInArrayByFilterCriteria(this.inventorySearchCriteriaObj.flour, 'All', selectedSlotCopy.fluorescence);
    }
  }

  //#region - Filter BGM Data
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

  //#region - Get Supplier Data
  private async getSupplierDNormData() {
    try {
      const organizationDNormItems = await this.organizationService.getSupplierDNorm();
      if (organizationDNormItems) {
        this.organizationDNormItems = [...organizationDNormItems];
        this.listSupplierDNormItems = this.organizationDNormItems.map(item => ({
          name: item.name,
          value: item.id,
          isChecked: false
        }));
        this.allListSupplierDNormItems = this.listSupplierDNormItems.slice();
      }
    } catch (error: any) {
      console.error(error);
      this.alertDialogService.show(error.error);
    }
  }

  //#region - Check Validation for Gridle
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

  //#Closed Filter Modal Method
  public closeSlotFilterDialog(): void {
    this.toggle.emit(false);
  }

  public isButtonDisabled(): boolean {
    return (
      this.selectedTypeDNormItems == null ||
      this.selectedTypeDNormItems.value == null ||
      this.errTotalDepth.length > 0 ||
      this.errRation.length > 0 ||
      this.errDiscount.length > 0 ||
      this.errTable.length > 0 ||
      this.errGirdlePer.length > 0 ||
      this.errGirdle.length > 0 ||
      this.errPavAngle.length > 0 ||
      this.errPavDepth.length > 0 ||
      this.errCrnAngle.length > 0 ||
      this.errCrnHeight.length > 0 ||
      this.errDiaMinimum.length > 0 ||
      this.errDiaMaximum.length > 0 ||
      this.errArrivalDate.length > 0 ||
      this.errLength.length > 0 ||
      this.errWidth.length > 0 ||
      this.errDepth.length > 0 ||
      this.errHeight.length > 0 ||
      this.errDollarPerCt.length > 0 ||
      this.errNetAmount.length > 0 ||
      this.errADay.length > 0 ||
      this.errFromToDate.length > 0 ||
      this.errHoldDate.length > 0 ||
      this.errPriceDate.length > 0 ||
      this.errFirstCarat.length > 0 ||
      this.errSecondCarat.length > 0 ||
      this.errThirdCarat.length > 0 ||
      this.errFourthCarat.length > 0 ||
      this.errMDay.length > 0
    );
  }

  //Apply Price Request Data Method
  public applyPriceRequestData(): void {
    try {
      if (this.selectedTypeDNormItems?.value == 'Inv' && [this.selectedSlots].length == 0) {
        this.alertDialogService.show(`Please select at least one slot.`);
        return;
      }
      this.spinnerService.show();
      this.assignAdditionalData();

      let req: PriceRequestApiModel = new PriceRequestApiModel();
      req.invFilter = this.inventorySearchCriteriaObj;
      req.type = this.selectedTypeDNormItems?.value ?? 'Temp';
      req.systemUserId = this.fxCredentials.id;
      req.selectedCriteriaId = this.selectedSlot[0].id;
      req.skip = 0;
      req.take = this.pageSize;
      this.ChildEvent.emit(req);
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  //Clear Search Criteria Method
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

  isCutItemSelected(cut: string): boolean {
    const { inventorySearchCriteriaObj, selectedSlot } = this;
    return inventorySearchCriteriaObj.cut.includes(cut) &&
      (inventorySearchCriteriaObj.cut.length < selectedSlot[0].cut.length || selectedSlot[0].cut.length === 0) &&
      inventorySearchCriteriaObj.cps.length === 0;
  }

  isPolishItemSelected(polish: string): boolean {
    const { inventorySearchCriteriaObj, selectedSlot } = this;
    return inventorySearchCriteriaObj.polish.includes(polish) &&
      (inventorySearchCriteriaObj.polish.length < selectedSlot[0].polish.length || selectedSlot[0].polish.length === 0) &&
      inventorySearchCriteriaObj.cps.length === 0;
  }

  isSymmItemSelected(symm: string): boolean {
    const { inventorySearchCriteriaObj, selectedSlot } = this;
    return inventorySearchCriteriaObj.symm.includes(symm) &&
      (inventorySearchCriteriaObj.symm.length < selectedSlot[0].symmetry.length || selectedSlot[0].symmetry.length === 0) &&
      inventorySearchCriteriaObj.cps.length === 0;
  }


}
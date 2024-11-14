import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NgForm } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { DataResult, GroupDescriptor, process, SortDescriptor } from '@progress/kendo-data-query';
import { environment } from 'environments/environment';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { SortFieldDescriptor } from 'projects/CRM.BackOffice/src/app/businessobjects';
import { GridDetailConfig } from 'shared/businessobjects';
import { InclusionConfig, MasterConfig, MasterDNorm, MeasurementConfig } from 'shared/enitites';
import { FrontStoneStatus, LeadStatus, listGrainingItems, StoneStatus, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { InventorySearchCriteria, WeightRange } from '../../businessobjects';
import { Customer, CustomerDNorm, InventoryItems, SupplierDNorm } from '../../entities';
import { GridPropertiesService } from '../../services';
import { InventorySummary } from '../../businessobjects/inventory/inventorysummary';
import { InventorySelectAllItems } from '../../businessobjects/inventory/inventoryselectallitem';
import { ExpoTicketService } from '../../services/inventory/expoticket.service';
import { ExpoTickets } from '../../entities/inventory/expotickets';

@Component({
  selector: 'app-expoinventories',
  templateUrl: './expoinventories.component.html',
  styleUrl: './expoinventories.component.css',
  encapsulation: ViewEncapsulation.None
})
export class ExpoinventoriesComponent implements OnInit {

  //#region Grid Init
  public sort: SortDescriptor[] = [];
  public groups: GroupDescriptor[] = [];
  public pageSize = 26;
  public skip = 0;
  public fields!: GridDetailConfig[];
  public gridView?: DataResult;
  public selectableSettings: SelectableSettings = {
    mode: 'multiple',
  };
  public skeletonArray = new Array(18);
  public mySelection: string[] = [];
  public isShowCheckBoxAll: boolean = true;
  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains',
  };
  //#endregion

  //#region List & Objects
  public inventoryObj: InventoryItems = new InventoryItems();
  public invSummary: InventorySummary = new InventorySummary();
  public supplierDNormItems!: SupplierDNorm[];
  public selectedCPS?: string;
  public isBGM: boolean = false;
  public listSupplierDNormItems: Array<{ name: string; value: string; isChecked: boolean }> = [];
  public masterConfigList!: MasterConfig;
  public allTheLab?: MasterDNorm[];
  public allTheShapes?: MasterDNorm[];
  public allColors?: MasterDNorm[];
  public allClarities?: MasterDNorm[];
  public allTheFluorescences?: MasterDNorm[];
  public allTheCPS?: MasterDNorm[];
  public inclusionData: MasterDNorm[] = [];
  public inclusionConfig: InclusionConfig = new InclusionConfig();
  public measurementData: MasterDNorm[] = [];
  public measurementConfig: MeasurementConfig = new MeasurementConfig();
  public listStatus: Array<{ name: string; isChecked: boolean }> = [];
  public listLeadStatus: Array<{ name: string; isChecked: boolean }> = [];
  public listKToS: Array<{ name: string; isChecked: boolean }> = [];
  public listCulet: Array<{ name: string; isChecked: boolean }> = [];
  public listLocation: Array<{ name: string; isChecked: boolean }> = [];
  public listGrainingItems = listGrainingItems;
  public listKapanItems: Array<{ name: string; isChecked: boolean }> = [];
  public listIGradeItems: Array<{ name: string; isChecked: boolean }> = [];
  public listMGradeItems: Array<{ name: string; isChecked: boolean }> = [];
  public inventoryItems: InventoryItems[] = [];
  public invSearchCriteriaObj: InventorySearchCriteria = new InventorySearchCriteria();
  public customer: Customer[] = [];
  public listCustomer: Array<{ text: string; value: string }> = [];
  //#endregion

  //#region Model Flag
  public isSearchFilter: boolean = false;
  public isShowMedia: boolean = false;
  public showExcelOption = false;
  public isSelectedShow: boolean = false;
  public filterLocChk: boolean = true;
  public filterCuletChk: boolean = true;
  public filterKtoSChk: boolean = true;
  public isExpoRequestModal: boolean = false;
  public isCheckExpoGeneratedCode: boolean = false;
  public generatedCode!: number;
  //#endregion


  //#region Custom Models
  public stoneId?: "";
  public certificateNo?: "";
  public mediaTitle!: string
  public mediaSrc!: string
  public mediaType!: string
  public firstCaratFrom?: number;
  public firstCaratTo?: number;
  public secondCaratFrom?: number;
  public secondCaratTo?: number;
  public thirdCaratFrom?: number;
  public thirdCaratTo?: number;
  public fourthCaratFrom?: number;
  public fourthCaratTo?: number;
  public errRation: string = "";
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
  public errDiscPer: string = "";
  public errNetAmount: string = "";
  public errMDay: string = "";
  public errADay: string = "";
  public errStr: string = "";
  public errLrh: string = "";
  public exportRequestMessage: string = '';
  public allInventoryItems: InventorySelectAllItems[] = [];
  public isFirstTimeLoad = true;

  //#endregion

  constructor(
    private alertDialogService: AlertdialogService,
    public utilityService: UtilityService,
    private spinnerService: NgxSpinnerService,
    private gridPropertiesService: GridPropertiesService,
    private sanitizer: DomSanitizer,
    private expoTicketService: ExpoTicketService,
  ) { }

  public async ngOnInit() {
    await this.defaultMethodsLoad();
  }

  //#region Init Data
  public async defaultMethodsLoad() {

    //Status
    Object.values(FrontStoneStatus).forEach(z => { this.listStatus.push({ name: z.toString(), isChecked: false }); });
    this.invSearchCriteriaObj.status.push(StoneStatus.Stock.toString());
    this.invSearchCriteriaObj.status.push(StoneStatus.Transit.toString());
    this.utilityService.onMultiSelectChange(this.listStatus, this.invSearchCriteriaObj.status);

    //Lead Status
    Object.values(LeadStatus).forEach(z => { if (z != LeadStatus.Qualification.toString()) this.listLeadStatus.push({ name: z.toString(), isChecked: false }); });
    this.invSearchCriteriaObj.leadStatus.push(LeadStatus.Proposal.toString());
    this.utilityService.onMultiSelectChange(this.listLeadStatus, this.invSearchCriteriaObj.leadStatus);

    this.spinnerService.show();
    try {
      let isSuccess = await this.initInventoryData();
      if (isSuccess) {
        this.spinnerService.hide();
        this.fields = this.gridPropertiesService.getInventoryGrid();
        this.getSummaryData();
      }
    }
    catch (error: any) {
      this.alertDialogService.show(error);
      this.spinnerService.hide();
    }
  }
  //#endregion

  //#region Inv Search Filter Data
  public async getSummaryData() {
    try {
      this.invSearchCriteriaObj.leadStatus = [LeadStatus.Proposal.toString()];
      this.invSearchCriteriaObj.isInExpo = true;
      // this.invSearchCriteriaObj.selectedStones = this.mySelection;
      this.invSummary = await this.expoTicketService.getInvSummaryBySearch(this.invSearchCriteriaObj);
      this.gridView = process(this.inventoryItems, { group: this.groups, sort: this.sort });
      this.gridView.total = this.invSummary.totalCount;
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async initInventoryData(): Promise<boolean> {
    try {
      let isSuccess = false;
      this.spinnerService.show();
      this.invSearchCriteriaObj.leadStatus = [LeadStatus.Proposal.toString()];
      this.invSearchCriteriaObj.isInExpo = true;
      // this.invSearchCriteriaObj.selectedStones = this.mySelection;
      let res = await this.expoTicketService.getInventoryItemsBySearch(this.invSearchCriteriaObj, this.skip, this.pageSize);
      if (res) {
        this.inventoryItems = res;
        this.inventoryItems.forEach(z => {
          let index = this.allInventoryItems.findIndex(a => a.stoneId == z.stoneId);
          if (index == -1)
            this.allInventoryItems.push({ id: z.id, stoneId: z.stoneId, certificateNo: z.certificateNo, status: z.status });
        });
        if (this.isSelectedShow)
          this.inventoryItems = await this.expoTicketService.getInvItemsAsync(this.mySelection);
        this.gridView = process(this.inventoryItems, { group: this.groups, sort: this.sort });
        this.gridView.total = this.invSummary.totalCount;

        this.spinnerService.hide();
        isSuccess = true;
      }
      return isSuccess;
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
      return false;
    }
  }

  //#region On Change Functions
  public async selectAll(e: any) {
    e.stopPropagation();
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

  public onCustomerChange(e: any) {
    const customer = this.customer.find(z => z.id == e.value);
    if (customer != undefined && customer != null) {
      let cust = new CustomerDNorm();
      cust.id = customer.id;
      cust.name = customer.fullName;
      cust.code = customer.code;
      cust.email = customer.email;
      cust.mobile = customer.mobile1;
    }
  }
  //#endregion

  //#region Master Config Data
  public async getMasterConfigData() {
    //Master Config
    this.masterConfigList = await this.expoTicketService.getAllMasterConfig();
    this.allTheShapes = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.shape);
    this.allColors = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.colors);
    this.allClarities = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.clarities);
    this.allTheFluorescences = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.fluorescence);
    this.allTheCPS = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.cps);
    this.allTheLab = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.lab);
    this.inclusionData = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.inclusions);
    this.inclusionConfig = this.masterConfigList.inclusionConfig;
    this.measurementData = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.measurements);
    this.measurementConfig = this.masterConfigList.measurementConfig;

    let allKTOS = this.inclusionData.filter(item => item.type.toLowerCase().indexOf('ktos') !== -1);
    allKTOS.forEach(z => { this.listKToS.push({ name: z.name, isChecked: false }); });

    let allCulet = this.inclusionData.filter(item => item.type.toLowerCase().indexOf('culet') !== -1);
    allCulet.forEach(z => { this.listCulet.push({ name: z.name, isChecked: false }); });

    if (!this.listKapanItems || this.listKapanItems.length <= 0) {
      let kapanItems = await this.expoTicketService.getOrgKapanList();
      kapanItems.forEach(z => { this.listKapanItems.push({ name: z, isChecked: false }); });
    }

    if (!this.listIGradeItems || this.listIGradeItems.length <= 0) {
      let iGradeItems = await this.expoTicketService.getOrgIGradeList();
      iGradeItems.forEach(z => { this.listIGradeItems.push({ name: z, isChecked: false }); });
    }

    if (!this.listMGradeItems || this.listMGradeItems.length <= 0) {
      let mGradeItems = await this.expoTicketService.getOrgMGradeList();
      mGradeItems.forEach(z => { this.listMGradeItems.push({ name: z, isChecked: false }); });
    }

    if (!this.listLocation || this.listLocation.length <= 0)
      await this.getLocationData();
  }

  public async getLocationData() {
    try {
      let listLocations: string[] = await this.expoTicketService.getInventoryLocationList();
      if (listLocations)
        listLocations.forEach(z => { this.listLocation.push({ name: z, isChecked: false }); });
    }
    catch (error: any) {
      this.alertDialogService.show(error.error);
    }
  }
  //#endregion

  //#region On Change Functions
  public async filterBySearch() {
    this.skip = 0;
    this.assignAdditionalData();
    await this.initInventoryData();
    this.getSummaryData();
    this.isSearchFilter = false;
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
    this.invSearchCriteriaObj.weightRanges = weightRanges;
    this.invSearchCriteriaObj.stoneIds = this.stoneId ? this.utilityService.CheckStoneIds(this.stoneId).map(x => x.toUpperCase()) : [];
    this.invSearchCriteriaObj.certificateNos = this.certificateNo ? this.utilityService.checkCertificateIds(this.certificateNo) : [];

    let fData = this.invSearchCriteriaObj.fromDate;
    this.invSearchCriteriaObj.fromDate = fData ? this.utilityService.setUTCDateFilter(fData) : null;

    let tData = this.invSearchCriteriaObj.toDate;
    this.invSearchCriteriaObj.toDate = tData ? this.utilityService.setUTCDateFilter(tData) : null;
  }

  public deselectAll() {
    this.mySelection = [];
  }

  public calculateDateDiff(date: Date | null): string {
    if (date == null)
      return '0';

    let today = new Date();
    let calDate = new Date(date);

    var diff = Math.abs(today.getTime() - calDate.getTime());
    var diffDays = Math.ceil(diff / (1000 * 3600 * 24));

    if (today.getMonth() == calDate.getMonth() && today.getFullYear() == calDate.getFullYear())
      diffDays = today.getDate() - calDate.getDate();

    return diffDays.toString();
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

  public selectedRowChange(e: any) {
    this.inventoryObj = new InventoryItems();
    if (e.selectedRows != null && e.selectedRows.length > 0) {
      let value: InventoryItems = e.selectedRows[0].dataItem;
      this.inventoryObj = { ...value };
    }
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

  public groupChange(groups: GroupDescriptor[]): void {
    try {
      this.groups = groups;
      this.initInventoryData();
    }
    catch (error: any) {
      this.alertDialogService.show(error.error);
    }
  }

  public sortChange(sort: SortDescriptor[]): void {
    this.sort = sort;

    this.invSearchCriteriaObj.sortFieldDescriptors = new Array<SortFieldDescriptor>();

    if (this.sort && this.sort.length > 0) {
      let properties = this.gridPropertiesService.getInventoryGrid();
      for (let index = 0; index < this.sort.length; index++) {
        let sortFieldDescriptor = new SortFieldDescriptor();
        const element = this.sort[index];
        sortFieldDescriptor.dir = element.dir;
        sortFieldDescriptor.field = properties.find(x => x.propertyName == element.field)?.sortFieldName ?? "";
        this.invSearchCriteriaObj.sortFieldDescriptors.push(sortFieldDescriptor);
      }
    }

    this.initInventoryData();
  }

  public onShowSelected() {
    this.isSelectedShow = !this.isSelectedShow;
    this.initInventoryData();
  }

  //#region fullscreen 
  toggleFullScreen() {
    if (document.fullscreenElement) {
      this.exitFullScreen();
    } else {
      this.requestFullScreen();
    }
  }

  requestFullScreen() {
    const elem: any = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    }
  }

  exitFullScreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }

  public pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.initInventoryData();
  }

  public checkCPS(type?: string) {
    if (type == 'BGM') {
      var NoMilkyData = this.inclusionData.filter(item => item.type.toLowerCase().indexOf('milky') !== -1).find(z => z.name.toLowerCase() == 'no');
      var checkMilky = this.invSearchCriteriaObj.milky.indexOf(NoMilkyData?.name ?? 'NO');

      var NoGreenData = this.inclusionData.filter(item => item.type.toLowerCase().indexOf('green') !== -1).find(z => z.name.toLowerCase() == 'no');
      var checkGreen = this.invSearchCriteriaObj.green.indexOf(NoGreenData?.name ?? 'NO');

      let BrownData = this.inclusionData.filter(item => item.type.toLowerCase().indexOf('brown') !== -1).find(z => z.name.toLowerCase() == 'no');
      var checkBrown = this.invSearchCriteriaObj.brown.indexOf(BrownData?.name ?? 'NO');

      if (checkMilky > -1 && checkGreen > -1 && checkBrown > -1)
        this.isBGM = true;
      else
        this.isBGM = false;
    }
    else {
      var ExData = this.allTheCPS?.find(z => z.name.toLowerCase() == 'ex');
      var VGData = this.allTheCPS?.find(z => z.name.toLowerCase() == 'vg');

      var checkCutEX = this.invSearchCriteriaObj.cut.indexOf(ExData?.name ?? 'EX');
      var checkPolishEX = this.invSearchCriteriaObj.polish.indexOf(ExData?.name ?? 'EX');
      var checkSymmEX = this.invSearchCriteriaObj.symm.indexOf(ExData?.name ?? 'EX');

      var checkCutVG = this.invSearchCriteriaObj.cut.indexOf(VGData?.name ?? 'VG');
      var checkPolishVG = this.invSearchCriteriaObj.polish.indexOf(VGData?.name ?? 'VG');
      var checkSymmVG = this.invSearchCriteriaObj.symm.indexOf(VGData?.name ?? 'VG');

      if (checkCutEX > -1 && checkPolishEX > -1 && checkSymmEX > -1 && checkCutVG > -1 && checkPolishVG > -1 && checkSymmVG > -1)
        this.selectedCPS = '3VG';
      else if (checkCutEX > -1 && checkPolishEX > -1 && checkSymmEX > -1)
        this.selectedCPS = '3EX';
      else if (checkCutEX > -1 && checkPolishEX > -1)
        this.selectedCPS = '2EX';
      else
        this.selectedCPS = 'Clear';
    }
  }

  public changeCPSData(type: string) {
    this.selectedCPS = type != 'BGM' ? type : this.selectedCPS;
    if (type == '3EX') {
      var ExData = this.allTheCPS?.find(z => z.name.toLowerCase() == 'ex');
      this.invSearchCriteriaObj.cut = [];
      this.invSearchCriteriaObj.cut.push(ExData?.name ?? 'EX');

      this.invSearchCriteriaObj.polish = [];
      this.invSearchCriteriaObj.polish.push(ExData?.name ?? 'EX');

      this.invSearchCriteriaObj.symm = [];
      this.invSearchCriteriaObj.symm.push(ExData?.name ?? 'EX');
    }
    else if (type == '2EX') {
      var ExData = this.allTheCPS?.find(z => z.name.toLowerCase() == 'ex');
      this.invSearchCriteriaObj.cut = [];
      this.invSearchCriteriaObj.cut.push(ExData?.name ?? 'EX');

      this.invSearchCriteriaObj.polish = [];
      this.invSearchCriteriaObj.polish.push(ExData?.name ?? 'EX');

      this.invSearchCriteriaObj.symm = [];
    }
    else if (type == '3VG') {
      var ExData = this.allTheCPS?.find(z => z.name.toLowerCase() == 'ex');
      var VGData = this.allTheCPS?.find(z => z.name.toLowerCase() == 'vg');

      this.invSearchCriteriaObj.cut = [];
      this.invSearchCriteriaObj.cut.push(ExData?.name ?? 'EX');
      this.invSearchCriteriaObj.cut.push(VGData?.name ?? 'VG');

      this.invSearchCriteriaObj.polish = [];
      this.invSearchCriteriaObj.polish.push(ExData?.name ?? 'EX');
      this.invSearchCriteriaObj.polish.push(VGData?.name ?? 'VG');

      this.invSearchCriteriaObj.symm = [];
      this.invSearchCriteriaObj.symm.push(ExData?.name ?? 'EX');
      this.invSearchCriteriaObj.symm.push(VGData?.name ?? 'VG');
    }
    else if (type == 'Clear') {
      this.invSearchCriteriaObj.cut = [];
      this.invSearchCriteriaObj.polish = [];
      this.invSearchCriteriaObj.symm = [];
    }
    else if (type == 'BGM') {
      if (this.isBGM) {
        this.invSearchCriteriaObj.green = [];
        this.invSearchCriteriaObj.brown = [];
        this.invSearchCriteriaObj.milky = [];
        this.isBGM = false;
      }
      else {
        this.isBGM = true;

        const inclusions = [...this.inclusionData];
        let BrownData = inclusions.filter(item => item.type.toLowerCase().indexOf('brown') !== -1);
        var NoBrownData = BrownData.find(z => z.name.toLowerCase() == 'no');
        this.invSearchCriteriaObj.brown = [];
        this.invSearchCriteriaObj.brown.push(NoBrownData?.name ?? 'NO');

        var NoGreenData = inclusions.filter(item => item.type.toLowerCase().indexOf('green') !== -1).find(z => z.name.toLowerCase() == 'no');
        this.invSearchCriteriaObj.green = [];
        this.invSearchCriteriaObj.green.push(NoGreenData?.name ?? 'NO');

        var NoMilkyData = inclusions.filter(item => item.type.toLowerCase().indexOf('milky') !== -1).find(z => z.name.toLowerCase() == 'no');
        this.invSearchCriteriaObj.milky = [];
        this.invSearchCriteriaObj.milky.push(NoMilkyData?.name ?? 'NO');
      }
    }
  }

  public async openSearchDialog() {
    try {
      this.isSearchFilter = true;
      if (this.isFirstTimeLoad) {
        this.spinnerService.show();
        await this.getCustomerData();
        await this.getMasterConfigData();
        await this.getSupplierDNormData();
        // await this.getSystemUserData();
        this.isFirstTimeLoad = false;
      }
      this.spinnerService.hide();

      //show checked location if change from summary filter
      this.utilityService.onMultiSelectChange(this.listLocation, this.invSearchCriteriaObj.location);
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async getCustomerData() {
    try {
      if (!this.listCustomer || this.listCustomer.length <= 0) {
        let customer = await this.expoTicketService.getAllCustomers();
        if (customer) {
          this.customer = customer;
          customer.forEach((z) => { this.listCustomer.push({ text: z.companyName + ' | ' + z.email, value: z.id }); });
        }
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show('Something went wrong on get customer, Try again later.');
    }
  }

  //#region Org, Emp Data
  private async getSupplierDNormData() {
    try {
      if (!this.supplierDNormItems) {
        this.supplierDNormItems = await this.expoTicketService.getSupplierDNorm();
        this.supplierDNormItems.forEach(z => { this.listSupplierDNormItems.push({ name: z.name, value: z.id, isChecked: false }) });
      }
    }
    catch (error: any) {
      console.error(error);
      this.alertDialogService.show(error.error);
    }
  }

  public closeSearchDialog(): void {
    this.isSearchFilter = false;
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
      else if (type == "download")
        this.mediaSrc = environment.otherImageBaseURL.replace('{stoneId}', stoneId.toLowerCase()) + "/video.mp4";
      else
        this.mediaSrc = stoneId;

      this.mediaType = type;
      this.isShowMedia = true;
    }
  }

  public openExpoAddConformation(): void {
    let selectedExpReqInvItems: InventoryItems[] = [];
    if (this.mySelection.length > 0)
      selectedExpReqInvItems = this.inventoryItems.filter(x => this.mySelection.includes(x.stoneId));

    this.exportRequestMessage = `Are you sure you want to raise expo request for selected stone(s) ?`
    this.toggleExpoRequestDialog();
  }

  public toggleExpoRequestDialog(): void {
    this.isExpoRequestModal = !this.isExpoRequestModal;
  }

  public async submitExpoRequest() {
    try {
      if (this.mySelection.length > 0) {
        this.spinnerService.show();
        let expoTicket = new ExpoTickets();
        expoTicket.stoneIds = this.mySelection;
        const res = await this.expoTicketService.insertExpoTicket(expoTicket);
        if (res) {
          this.spinnerService.hide();
          this.utilityService.showNotification(`Expo Ticket Created Successfully!`);
          this.toggleExpoRequestDialog();
          this.toggleExpoGeneratedCodeDialog();
          this.generatedCode = res;
          this.mySelection = [];
        }
      }
      else
        this.alertDialogService.show('Kindly, select stone send expo request!');

    }
    catch (error: any) {
      this.spinnerService.hide();
      console.error(error);
      if (error?.error)
        this.alertDialogService.show(error?.error);
      else
        this.alertDialogService.show('Expo request not save, Try again later!');
    }
  }

  public toggleExpoGeneratedCodeDialog(): void {
    this.isCheckExpoGeneratedCode = !this.isCheckExpoGeneratedCode;
  }


  public senitizeURL(url: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  public closeMediaDialog(e: boolean): void {
    this.isShowMedia = e;
  }

  public onExcelToggle(): void {
    this.showExcelOption = !this.showExcelOption;
  }

  public clearSearchCriteria(form: NgForm): void {
    form?.reset();
    this.invSearchCriteriaObj = new InventorySearchCriteria();
    this.sort = new Array<SortDescriptor>();
    // this.invSearchCriteriaObj.supplierIds = [];
    this.listStatus.forEach(z => { z.isChecked = false });
    this.listLocation.forEach(z => { z.isChecked = false });
    this.listKToS.forEach(z => { z.isChecked = false });
    this.listCulet.forEach(z => { z.isChecked = false });
    this.firstCaratFrom = undefined;
    this.firstCaratTo = undefined;
    this.secondCaratFrom = undefined;
    this.secondCaratTo = undefined;
    this.thirdCaratFrom = undefined;
    this.thirdCaratTo = undefined;
    this.fourthCaratFrom = undefined;
    this.fourthCaratTo = undefined;
    this.stoneId = '';
    this.certificateNo = '';
  }

  public copyDiamondDetailLink(stoneId: string) {
    let baseUrl = environment.proposalUrl;
    var url = baseUrl + 'diamond-detail/' + stoneId;
    navigator.clipboard.writeText(url);
    this.utilityService.showNotification(`Copy to clipboard successfully!`);
  }
  //#endregion

  public async copyToClipboard() {
    try {
      this.spinnerService.show();
      let res = await this.expoTicketService.copyToClipboardStoneId(this.invSearchCriteriaObj);
      if (res) {
        navigator.clipboard.writeText(res);
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

}


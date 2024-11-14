import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { DataResult, GroupDescriptor, process } from '@progress/kendo-data-query';
import { NgxSpinnerService } from 'ngx-spinner';
import { GridDetailConfig } from 'shared/businessobjects';
import { fxCredential, GridConfig, GridMasterConfig, InclusionConfig, MasterConfig, MasterDNorm, MeasurementConfig } from 'shared/enitites';
import { AppPreloadService, CommonService, ConfigService, listGrainingItems, StoneStatus, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { BranchDNorm,  InventorySearchCriteria, OrganizationDNorm, WeightRange } from '../../businessobjects';
import { EmployeeService, GridPropertiesService, InventoryService, KapanAnalysisService, MasterConfigService, OrganizationService } from '../../services';
import { Department, Employee } from '../../entities';
import { KapanSummary } from '../../businessobjects/analysis/kapansummary';
import { InvAnalysis } from '../../businessobjects/analysis/invanalysis';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';

@Component({
  selector: 'app-kapananalysis',
  templateUrl: './kapananalysis.component.html',
  styleUrls: ['./kapananalysis.component.css']
})
export class KapananalysisComponent implements OnInit {

  public isGridConfig: boolean = false;
  private fxCredential!: fxCredential;
  public gridConfig!: GridConfig;
  public filterFlag = true;
  public fields!: GridDetailConfig[];
  public gridMasterConfigResponse!: GridMasterConfig;
  public commonGrid: GridDetailConfig[] = new Array<GridDetailConfig>();
  public baseGrid: GridDetailConfig[] = new Array<GridDetailConfig>();
  public stockGrid: GridDetailConfig[] = new Array<GridDetailConfig>();
  public soldGrid: GridDetailConfig[] = new Array<GridDetailConfig>();
  public searchCriteria: InventorySearchCriteria = new InventorySearchCriteria();
  public invAnalysisList: InvAnalysis[] = new Array<InvAnalysis>();
  public pageSize = 26;
  public skip = 0
  public groups: GroupDescriptor[] = [];
  public groupsIssue: GroupDescriptor[] = [];
  public gridView!: DataResult;
  public gridViewIssue!: DataResult;
  public selectableSettings: SelectableSettings = { mode: 'multiple', };
  public mySelection: string[] = [];
  public kapanSummaryData: KapanSummary[] = new Array<KapanSummary>();
  public gridClass = "";
  public summaryExpanded: boolean = false;
  public isDisabled: boolean = true;

  //searchdialog variable
  public stoneId?: "";
  public certificateNo?: "";
  public isSearchFilter: boolean = false;
  public listLocation: Array<{ name: string; isChecked: boolean }> = [];
  public filterStatus: string = '';
  public filterStatusChk: boolean = true;
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
  public listStatus: Array<{ name: string; isChecked: boolean }> = [];
  public listKToS: Array<{ name: string; isChecked: boolean }> = [];
  public listCulet: Array<{ name: string; isChecked: boolean }> = [];
  public listGrainingItems = listGrainingItems;
  public listKapanItems: Array<{ name: string; isChecked: boolean }> = [];
  public listIGradeItems: Array<{ name: string; isChecked: boolean }> = [];
  public listMGradeItems: Array<{ name: string; isChecked: boolean }> = [];
  public firstCaratFrom?: number;
  public firstCaratTo?: number;
  public secondCaratFrom?: number;
  public secondCaratTo?: number;
  public thirdCaratFrom?: number;
  public thirdCaratTo?: number;
  public fourthCaratFrom?: number;
  public fourthCaratTo?: number;
  public isBGM: boolean = false;
  public selectedCPS?: string;
  public allTheCPS!: MasterDNorm[];
  public inclusionData: MasterDNorm[] = [];
  public masterConfigList!: MasterConfig;
  public allTheShapes!: MasterDNorm[];
  public allClarities!: MasterDNorm[];
  public allColors!: MasterDNorm[];
  public allTheFluorescences!: MasterDNorm[];
  public allTheLab?: MasterDNorm[];
  public inclusionConfig: InclusionConfig = new InclusionConfig();
  public measurementData: MasterDNorm[] = [];
  public measurementConfig: MeasurementConfig = new MeasurementConfig();
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
  public errNetAmount: string = "";
  public deptItems!: Department[];
  public selectedDeptItems?: { text: string, value: string };
  public empItems!: Employee[];
  public selectedEmpItems?: { text: string, value: string };
  public organizationDNormItems!: OrganizationDNorm[];
  public listOrganizationDNormItems: Array<{ text: string; value: string }> = [];
  public listBranchDNormItems: Array<{ text: string; value: string }> = [];
  public listDepartmentItems: Array<{ text: string; value: string }> = [];
  public listEmpItems: Array<{ text: string; value: string }> = [];
  public listEmployeeItems: Array<{ text: string; value: string }> = [];
  public listPacketsItems: string[] = [];
  public branchDNormItems!: BranchDNorm[];
  public selectedBranchDNormItems?: { text: string, value: string };
  public selectedOrganizationDNormItems?: { text: string; value: string };

  public isViewButtons: boolean = false;

  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains',
  };

  constructor(private alertDialogService: AlertdialogService,
    private spinnerService: NgxSpinnerService,
    private router: Router,
    private appPreloadService: AppPreloadService,
    public utilityService: UtilityService,
    private configService: ConfigService,
    private inventoryService: InventoryService,
    private gridPropertiesService: GridPropertiesService,
    private kapanAnalysisService: KapanAnalysisService,
    private masterConfigService: MasterConfigService,
    private commonService: CommonService,
    private organizationService: OrganizationService,
    private employeeService: EmployeeService,
  ) { }

  async ngOnInit() {
    await this.defaultMethods();
  }

  public async defaultMethods() {
    try {
      this.fxCredential = await this.appPreloadService.fetchFxCredentials();
      if (!this.fxCredential)
        this.router.navigate(["login"]);

      if (this.fxCredential && this.fxCredential.origin && (this.fxCredential.origin.toLowerCase() == 'admin'))
        this.isViewButtons = true;

      this.spinnerService.show();
      await this.getGridConfiguration();
      await this.getMasterConfigData();
      await this.getOrganizationDNormData();
      await this.getEmployeeData();
      await this.getAllKapanAnalysis();
      this.spinnerService.hide();
      await this.getKapanSummary();
      this.isDisabled = false;
    } catch (error: any) {
      this.alertDialogService.show(error);
      this.spinnerService.hide();
    }
  }

  public async getKapanSummary() {
    try {
      this.kapanSummaryData = await this.kapanAnalysisService.getKapanSummary(this.searchCriteria);

      let kapanSummary = new KapanSummary();
      kapanSummary.status = "Total";
      kapanSummary.gradingPcs = this.kapanSummaryData.reduce((ty, u) => ty + u.gradingPcs, 0);
      kapanSummary.gradingWeight = this.kapanSummaryData.reduce((ty, u) => ty + u.gradingWeight, 0);
      kapanSummary.gradingAmt = this.kapanSummaryData.reduce((ty, u) => ty + u.gradingAmt, 0);
      let gradingRapWeight = this.kapanSummaryData.reduce((ty, u) => ty + ((u.gradingAmt * 100) / (u.gradingDisc + 100)), 0);
      kapanSummary.gradingDisc = kapanSummary.gradingAmt / gradingRapWeight * 100 - 100;
      kapanSummary.basePcs = this.kapanSummaryData.reduce((ty, u) => ty + u.basePcs, 0);
      kapanSummary.baseWeight = this.kapanSummaryData.reduce((ty, u) => ty + u.baseWeight, 0);
      kapanSummary.baseAmt = this.kapanSummaryData.reduce((ty, u) => ty + u.baseAmt, 0);
      let baseRapWeight = this.kapanSummaryData.reduce((ty, u) => ty + ((u.baseAmt * 100) / (u.baseDisc + 100)), 0);
      kapanSummary.baseDisc = kapanSummary.baseAmt / baseRapWeight * 100 - 100;
      kapanSummary.difference = this.kapanSummaryData.reduce((ty, u) => ty + u.difference, 0);
      kapanSummary.stockDcaret = this.kapanSummaryData.reduce((ty, u) => ty + u.stockDcaret, 0);
      kapanSummary.stockAmt = this.kapanSummaryData.reduce((ty, u) => ty + u.stockAmt, 0);
      let stockRapWeight = this.kapanSummaryData.reduce((ty, u) => ty + ((u.stockAmt * 100) / (u.stockDisc + 100)), 0);
      kapanSummary.stockDisc = kapanSummary.stockAmt / stockRapWeight * 100 - 100;
      kapanSummary.labExpense = this.kapanSummaryData.reduce((ty, u) => ty + u.labExpense, 0);
      this.kapanSummaryData.push(kapanSummary);

      this.gridView.total = this.kapanSummaryData.find(c => c.status == "Total")?.basePcs ?? 0;

      for (let i = 0; i < this.kapanSummaryData.length; i++) {
        const element = this.kapanSummaryData[i];
        element.difference = element.baseAmt - element.gradingAmt;
      }
    } catch (error: any) {
      this.alertDialogService.show(error);
      this.spinnerService.hide();
    }
  }

  public async copyToClipboard() {
    try {
      this.spinnerService.show();
      let res = await this.inventoryService.copyToClipboardStoneId(this.searchCriteria);
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

  public async getAllKapanAnalysis() {
    try {
      this.spinnerService.show();
      let res = await this.kapanAnalysisService.getInventoryItemsBySearch(this.searchCriteria, this.skip, this.pageSize);
      if (res) {
        this.invAnalysisList = JSON.parse(JSON.stringify(res));
        this.gridView = process(res, { group: this.groups });
        if (this.kapanSummaryData.length > 0 && this.kapanSummaryData.some(c => c.status == "Total"))
          this.gridView.total = this.kapanSummaryData.find(c => c.status == "Total")?.basePcs ?? 0;
        else
          this.gridView.total = 0;
      }
      this.spinnerService.hide();
    } catch (error: any) {
      this.alertDialogService.show(error);
      this.spinnerService.hide();
    }
  }

  public async getMasterConfigData() {
    try {
      Object.values(StoneStatus).forEach(z => { this.listStatus.push({ name: z.toString(), isChecked: false }); });
      this.utilityService.onMultiSelectChange(this.listStatus, this.searchCriteria.status);
      this.masterConfigList = await this.masterConfigService.getAllMasterConfig();
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

      let kapanItems = await this.inventoryService.getOrgKapanList();
      kapanItems.forEach(z => { this.listKapanItems.push({ name: z, isChecked: false }); });

      let iGradeItems = await this.inventoryService.getOrgIGradeList(this.searchCriteria.organizationId ?? '');
      iGradeItems.forEach(z => { this.listIGradeItems.push({ name: z, isChecked: false }); });

      let mGradeItems = await this.inventoryService.getOrgMGradeList(this.searchCriteria.organizationId ?? '');
      mGradeItems.forEach(z => { this.listMGradeItems.push({ name: z, isChecked: false }); });

      this.getCountryData();
    }
    catch (error: any) {
      this.alertDialogService.show(error);
      this.spinnerService.hide();
    }
  }

  private async getOrganizationDNormData() {
    try {
      this.organizationDNormItems = await this.organizationService.getOrganizationDNorm();

      let organizationId = this.fxCredential.organizationId;
      let organization = this.organizationDNormItems.find(z => z.id == organizationId) ?? new OrganizationDNorm();

      this.organizationDNormItems = [{ ...organization }];
      await this.getDepartmentsByOrgId(organizationId);
    }
    catch (error: any) {
      console.error(error);
      this.alertDialogService.show(error.error);
    }
  }

  private async getCountryData() {
    try {
      var countryItems = await this.commonService.getCountries();
      if (countryItems)
        countryItems.forEach(z => { this.listLocation.push({ name: z.name, isChecked: false }); });
    }
    catch (error: any) {
      this.alertDialogService.show(error.error);
    }
  }

  private async getDepartmentsByOrgId(id: string) {
    try {
      this.deptItems = await this.organizationService.getDepartmentByOrganizationId(id);
      this.listDepartmentItems = [];
      this.deptItems.forEach(z => { this.listDepartmentItems.push({ text: z.name, value: z.id }); });
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public onBranchDNormChange(e: any) {
    const branchDNorm = this.branchDNormItems.find(z => z.name == e.value);
    if (branchDNorm != undefined && branchDNorm != null) {
      this.searchCriteria.branch = branchDNorm.name;
      this.getDepartmentsByOrgId(this.searchCriteria.organizationId ?? '');
    }
  }

  public onDepartmentChange(e: any) {
    const dept = this.deptItems.find(z => z.id == e.value);
    if (dept != undefined && dept != null) {
      this.searchCriteria.deptId = dept.id ?? '';
    }
  }

  public async getEmployeeData() {
    this.empItems = await this.employeeService.getAllEmployees();
    this.empItems.forEach((z) => { this.listEmpItems.push({ text: z.fullName, value: z.id }); });
  }

  public onEmployeeChange(e: any) {
    const emp = this.empItems.find(z => z.id == e.value);
    if (emp != undefined && emp != null)
      this.searchCriteria.empId = emp.id ?? '';
  }

  public groupChange(groups: GroupDescriptor[]): void {
    try {
      this.groups = groups;
      this.getAllKapanAnalysis();
    }
    catch (error: any) {
      this.alertDialogService.show(error.error)
    }
  }

  public pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.getAllKapanAnalysis();
  }

  public async filterBySearch() {
    this.skip = 0;
    this.mySelection = [];
    this.spinnerService.show();
    this.assignAdditionalData();
    if (this.summaryExpanded)
      await this.getKapanSummary();

    await this.getAllKapanAnalysis();
    this.spinnerService.hide();
    this.isSearchFilter = false;

    if (!this.summaryExpanded) {
      this.isDisabled = true;
      await this.getKapanSummary();
      this.isDisabled = false;
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

    this.searchCriteria.weightRanges = weightRanges;
    this.searchCriteria.stoneIds = this.stoneId ? this.utilityService.CheckStoneIds(this.stoneId).map(x => x.toUpperCase()) : []; 
    this.searchCriteria.certificateNos = this.certificateNo ? this.utilityService.checkCertificateIds(this.certificateNo) : [];

    let fData = this.searchCriteria.fromDate;
    this.searchCriteria.fromDate = fData ? this.utilityService.setUTCDateFilter(fData) : null;

    let tData = this.searchCriteria.toDate;
    this.searchCriteria.toDate = tData ? this.utilityService.setUTCDateFilter(tData) : null;
  }

  public openSearchDialog(): void {
    this.isSearchFilter = true;

    //show checked location if change from summary filter
    this.utilityService.onMultiSelectChange(this.listLocation, this.searchCriteria.location);
  }

  // public onMultiSelectChange(val: Array<{ name: string; isChecked: boolean }>, selectedData: string[]): void {
  //   val.forEach(element => {
  //     element.isChecked = false;
  //   });

  //   if (selectedData && selectedData.length > 0) {
  //     val.forEach(element => {
  //       selectedData.forEach(item => {
  //         if (element.name.toLocaleLowerCase() == item.toLocaleLowerCase())
  //           element.isChecked = true;
  //       });
  //     });
  //   }
  // }

  public closeSearchDialog(): void {
    this.isSearchFilter = false;
  }

  public clearSearchCriteria(): void {
    this.searchCriteria = new InventorySearchCriteria();
    this.searchCriteria.organizationId = this.fxCredential?.organizationId ?? '';
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

  public changeCPSData(type: string) {
    this.selectedCPS = type != 'BGM' ? type : this.selectedCPS;
    if (type == '3EX') {
      var ExData = this.allTheCPS?.find(z => z.name.toLowerCase() == 'ex');
      this.searchCriteria.cut = [];
      this.searchCriteria.cut.push(ExData?.name ?? 'EX');

      this.searchCriteria.polish = [];
      this.searchCriteria.polish.push(ExData?.name ?? 'EX');

      this.searchCriteria.symm = [];
      this.searchCriteria.symm.push(ExData?.name ?? 'EX');
    }
    else if (type == '2EX') {
      var ExData = this.allTheCPS?.find(z => z.name.toLowerCase() == 'ex');
      this.searchCriteria.cut = [];
      this.searchCriteria.cut.push(ExData?.name ?? 'EX');

      this.searchCriteria.polish = [];
      this.searchCriteria.polish.push(ExData?.name ?? 'EX');

      this.searchCriteria.symm = [];
    }
    else if (type == '3VG') {
      var ExData = this.allTheCPS?.find(z => z.name.toLowerCase() == 'ex');
      var VGData = this.allTheCPS?.find(z => z.name.toLowerCase() == 'vg');

      this.searchCriteria.cut = [];
      this.searchCriteria.cut.push(ExData?.name ?? 'EX');
      this.searchCriteria.cut.push(VGData?.name ?? 'VG');

      this.searchCriteria.polish = [];
      this.searchCriteria.polish.push(ExData?.name ?? 'EX');
      this.searchCriteria.polish.push(VGData?.name ?? 'VG');

      this.searchCriteria.symm = [];
      this.searchCriteria.symm.push(ExData?.name ?? 'EX');
      this.searchCriteria.symm.push(VGData?.name ?? 'VG');
    }
    else if (type == 'Clear') {
      this.searchCriteria.cut = [];
      this.searchCriteria.polish = [];
      this.searchCriteria.symm = [];
    }
    else if (type == 'BGM') {
      if (this.isBGM) {
        this.searchCriteria.green = [];
        this.searchCriteria.brown = [];
        this.searchCriteria.milky = [];
        this.isBGM = false;
      }
      else {
        this.isBGM = true;

        const inclusions = [...this.inclusionData];
        let BrownData = inclusions.filter(item => item.type.toLowerCase().indexOf('brown') !== -1);
        var NoBrownData = BrownData.find(z => z.name.toLowerCase() == 'no');
        this.searchCriteria.brown = [];
        this.searchCriteria.brown.push(NoBrownData?.name ?? 'NO');

        var NoGreenData = inclusions.filter(item => item.type.toLowerCase().indexOf('green') !== -1).find(z => z.name.toLowerCase() == 'no');
        this.searchCriteria.green = [];
        this.searchCriteria.green.push(NoGreenData?.name ?? 'NO');

        var NoMilkyData = inclusions.filter(item => item.type.toLowerCase().indexOf('milky') !== -1).find(z => z.name.toLowerCase() == 'no');
        this.searchCriteria.milky = [];
        this.searchCriteria.milky.push(NoMilkyData?.name ?? 'NO');
      }
    }
  }

  public checkCPS(type?: string) {
    if (type == 'BGM') {
      var NoMilkyData = this.inclusionData.filter(item => item.type.toLowerCase().indexOf('milky') !== -1).find(z => z.name.toLowerCase() == 'no');
      var checkMilky = this.searchCriteria.milky.indexOf(NoMilkyData?.name ?? 'NO');

      var NoGreenData = this.inclusionData.filter(item => item.type.toLowerCase().indexOf('green') !== -1).find(z => z.name.toLowerCase() == 'no');
      var checkGreen = this.searchCriteria.green.indexOf(NoGreenData?.name ?? 'NO');

      let BrownData = this.inclusionData.filter(item => item.type.toLowerCase().indexOf('brown') !== -1).find(z => z.name.toLowerCase() == 'no');
      var checkBrown = this.searchCriteria.brown.indexOf(BrownData?.name ?? 'NO');

      if (checkMilky > -1 && checkGreen > -1 && checkBrown > -1)
        this.isBGM = true;
      else
        this.isBGM = false;
    }
    else {
      var ExData = this.allTheCPS?.find(z => z.name.toLowerCase() == 'ex');
      var VGData = this.allTheCPS?.find(z => z.name.toLowerCase() == 'vg');

      var checkCutEX = this.searchCriteria.cut.indexOf(ExData?.name ?? 'EX');
      var checkPolishEX = this.searchCriteria.polish.indexOf(ExData?.name ?? 'EX');
      var checkSymmEX = this.searchCriteria.symm.indexOf(ExData?.name ?? 'EX');

      var checkCutVG = this.searchCriteria.cut.indexOf(VGData?.name ?? 'VG');
      var checkPolishVG = this.searchCriteria.polish.indexOf(VGData?.name ?? 'VG');
      var checkSymmVG = this.searchCriteria.symm.indexOf(VGData?.name ?? 'VG');

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

  public tagMapper(tags: string[]): void {
    // This function is used for hide selected items in multiselect box
  }

  public async onPanelChange(e: any) {
    if (e.length > 0 && e[0].expanded) {
      this.summaryExpanded = true;
      this.gridClass = "analysis-ht";
      this.spinnerService.show();
      if (this.kapanSummaryData.length == 0)
        await this.getKapanSummary();
      this.spinnerService.hide();
    }
    else {
      this.summaryExpanded = false;
      this.gridClass = "";
    }
  }

  public async getGridConfiguration() {
    try {
      let i = 1;
      this.commonGrid = [
        { propertyName: "stoneId", title: "Stone Id", width: 80, sortOrder: i++, isSelected: true },
        { propertyName: "article", title: "Article", width: 80, sortOrder: i++, isSelected: true },
        { propertyName: "origin", title: "Origin", width: 80, sortOrder: i++, isSelected: true },
      ];

      i = 1;
      this.baseGrid = [
        { propertyName: "gradingInvDetail.shape", title: "Shape", width: 100, sortOrder: i++, isSelected: true },
        { propertyName: "gradingInvDetail.weight", title: "Weight", width: 70, sortOrder: i++, isSelected: true },
        { propertyName: "gradingInvDetail.color", title: "Color", width: 60, sortOrder: i++, isSelected: true },
        { propertyName: "gradingInvDetail.clarity", title: "Clarity", width: 70, sortOrder: i++, isSelected: true },
        { propertyName: "gradingInvDetail.cut", title: "Cut", width: 70, sortOrder: i++, isSelected: true },
        { propertyName: "gradingInvDetail.polish", title: "Polish", width: 70, sortOrder: i++, isSelected: true },
        { propertyName: "gradingInvDetail.symmetry", title: "Sym", width: 70, sortOrder: i++, isSelected: true },
        { propertyName: "gradingInvDetail.fluorescence", title: "Fluor", width: 90, sortOrder: i++, isSelected: true },
        { propertyName: "inclusion.iGrade", title: "IGrade", width: 70, sortOrder: i++, isSelected: true },
        { propertyName: "gradingInvDetail.measurement.mGrade", title: "MGrade", width: 70, sortOrder: i++, isSelected: true },
        { propertyName: "lab", title: "Lab", width: 90, sortOrder: i++, isSelected: true },
        { propertyName: "certificateNo", title: "CertiNo", width: 130, sortOrder: i++, isSelected: true },
        { propertyName: "labExpense", title: "Lab Expense", width: 100, sortOrder: i++, isSelected: true },
        { propertyName: "gradingInvDetail.price.rap", title: "Rap", width: 100, sortOrder: i++, isSelected: true },
        { propertyName: "gradingInvDetail.price.discount", title: "Disc", width: 80, sortOrder: i++, isSelected: true },
        { propertyName: "gradingInvDetail.price.perCarat", title: "$/ct", width: 100, sortOrder: i++, isSelected: true },
        { propertyName: "gradingInvDetail.price.netAmount", title: "Amt", width: 100, sortOrder: i++, isSelected: true },
      ];

      i = 1;
      this.stockGrid = [
        { propertyName: "stockInvDetail.weight", title: "Weight", width: 70, sortOrder: i++, isSelected: true },
        { propertyName: "stockInvDetail.color", title: "Color", width: 60, sortOrder: i++, isSelected: true },
        { propertyName: "stockInvDetail.clarity", title: "Clarity", width: 70, sortOrder: i++, isSelected: true },
        { propertyName: "stockInvDetail.cut", title: "Cut", width: 70, sortOrder: i++, isSelected: true },
        { propertyName: "stockInvDetail.polish", title: "Polish", width: 70, sortOrder: i++, isSelected: true },
        { propertyName: "stockInvDetail.symmetry", title: "Sym", width: 70, sortOrder: i++, isSelected: true },
        { propertyName: "stockInvDetail.fluorescence", title: "Fluor", width: 90, sortOrder: i++, isSelected: true },
        { propertyName: "inclusion.iGrade", title: "IGrade", width: 70, sortOrder: i++, isSelected: true },
        { propertyName: "stockInvDetail.measurement.mGrade", title: "MGrade", width: 70, sortOrder: i++, isSelected: true },
        { propertyName: "baseInvDetail.price.rap", title: "Rap", width: 100, sortOrder: i++, isSelected: true },
        { propertyName: "baseInvDetail.price.discount", title: "Disc", width: 80, sortOrder: i++, isSelected: true },
        { propertyName: "baseInvDetail.price.perCarat", title: "$/ct", width: 100, sortOrder: i++, isSelected: true },
        { propertyName: "baseInvDetail.price.netAmount", title: "Amt", width: 100, sortOrder: i++, isSelected: true },
        { propertyName: "inclusion.brown", title: "Brown", width: 100, sortOrder: i++, isSelected: true },
        { propertyName: "inclusion.milky", title: "Milky", width: 100, sortOrder: i++, isSelected: true },
      ];

      i = 1;
      this.soldGrid = [
        { propertyName: "soldInvDetail.soldDate", title: "Date", width: 100, sortOrder: i++, isSelected: true },
        { propertyName: "soldInvDetail.invItem.price.discount", title: "Disc", width: 80, sortOrder: i++, isSelected: true },
        { propertyName: "soldInvDetail.invItem.price.perCarat", title: "$/ct", width: 100, sortOrder: i++, isSelected: true },
        { propertyName: "soldInvDetail.invItem.price.netAmount", title: "Amt", width: 100, sortOrder: i++, isSelected: true }
      ];
    }
    catch (error: any) {
      this.alertDialogService.show(error);
      this.spinnerService.hide();
    }
  }
}

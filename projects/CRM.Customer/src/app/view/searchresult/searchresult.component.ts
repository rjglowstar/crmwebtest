import { Component, OnInit, Renderer2, ViewEncapsulation } from '@angular/core';
import { NgForm } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { DataResult, GroupDescriptor, process, SortDescriptor } from '@progress/kendo-data-query';
import { environment } from 'environments/environment';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { GridDetailConfig } from 'shared/businessobjects';
import { DbLog, GridConfig, GridMasterConfig, InclusionConfig, MasterConfig, MasterDNorm, MeasurementConfig, SearchQuery } from 'shared/enitites';
import { CommonService, ConfigService, listCustomerStoneStatus, listGrainingItems, LogService, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { CustomerInvSearchCriteria, CustomerInvSummary, ExportToExcelMailData, InvDetailData, ParseSearchQuery, WeightRange } from '../../businessobjects';
import { Appointment, Cart, CustFxCredential, Customer, CustomerDNorm, CustomerPreference, Scheme } from '../../entities';
import { AppPreloadService, CartService, CustomerInvSearchService, CustomerPreferenceService, CustomerService, EmailService, GridPropertiesService, LeadService, MasterConfigService, SchemeService, WatchlistService } from '../../services';

@Component({
  selector: 'app-searchresult',
  templateUrl: './searchresult.component.html',
  styleUrl: './searchresult.component.css',
  encapsulation: ViewEncapsulation.None
})
export class SearchresultComponent implements OnInit {
  //#region Grid Init
  public sort: SortDescriptor[] = [];
  public groups: GroupDescriptor[] = [];
  public pageSize = 26;
  public skip = 0;
  public fields!: GridDetailConfig[];
  public gridView!: DataResult;
  public selectableSettings: SelectableSettings = {
    mode: 'multiple', checkboxOnly: true
  };
  public mySelection: string[] = [];
  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains',
  };
  public isShowCheckBoxAll: boolean = true;
  //#endregion

  //#region Grid Config
  public isGridConfig: boolean = false;
  public gridConfig!: GridConfig;
  public gridMasterConfigResponse!: GridMasterConfig;

  //#endregion

  //#region List & Objects
  public customerDNorm = new CustomerDNorm();
  public invSearchCriteriaObj: CustomerInvSearchCriteria = new CustomerInvSearchCriteria();
  public tempInvSearchCriteriaObj: CustomerInvSearchCriteria = new CustomerInvSearchCriteria();
  public allInvItems: InvDetailData[] = [];
  public invItemObj: InvDetailData = new InvDetailData();
  public filterInventoryItems: InvDetailData[] = [];
  public selectedInventoryItems: InvDetailData[] = [];
  public selectedStoneIds: string[] = [];
  public summary: CustomerInvSummary = new CustomerInvSummary();
  public selectedCPS?: string;
  public isBGM: boolean = false;
  public masterConfigList!: MasterConfig;
  public allTheLab?: MasterDNorm[];
  public allTheShapes?: MasterDNorm[];
  public allColors?: MasterDNorm[];
  public allClarities?: MasterDNorm[];
  public allTheFluorescences?: MasterDNorm[];
  public allTheCPS?: MasterDNorm[];
  public inclusionData: MasterDNorm[] = [];
  public inclusionFlag: boolean = false;
  public inclusionConfig: InclusionConfig = new InclusionConfig();
  public measurementData: MasterDNorm[] = [];
  public measurementConfig: MeasurementConfig = new MeasurementConfig();
  public listStatus: Array<{ name: string; isChecked: boolean }> = [];
  public listKToS: Array<{ name: string; isChecked: boolean }> = [];
  public listCulet: Array<{ name: string; isChecked: boolean }> = [];
  public listLocation: Array<{ name: string; isChecked: boolean }> = [];
  public listGrainingItems = listGrainingItems;
  public fxCredentials?: CustFxCredential;
  public mediaSrc!: string
  public mediaType!: string
  public exportType: string = '';
  public excelFile: any[] = [];
  public exportToExcelMailObj: ExportToExcelMailData = new ExportToExcelMailData();
  public customerPreference: CustomerPreference = new CustomerPreference();
  public saveSearchData: ParseSearchQuery[] = [];
  public saveSearchName: string = '';
  public aiRecDiamondStoneIds: string[] = [];
  //#endregion

  //#region Custom Models
  public stoneId?: string;
  public certificateNo?: string;
  public newArrivalStoneDays = 10;
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
  public errNetAmount: string = "";
  public errDiscPer: string = "";
  public totalCount = '0';
  public totalWeight = '0.00';
  public totalNetAmount = '0.00';
  public avgDiscount = '0.00';
  public avgPerCarat = '0.00';
  public rNetAmount = '0.00';
  public finalDisc: number = 0.00;
  public showSelected = false;
  public pageFrom: string = "SearchResult";
  public selectedAmt: number = 0;
  public filterSaveSearch!: string | null;
  public isRemovingSaveSearch = false;
  //#endregion

  //#region Model Flag
  public isSearchFilter: boolean = false;
  public showDiamonddetailModal = false;
  public isShowMedia = false;
  public isCompareDialog = false;
  public isCheckout = false;
  public isExcelModal = false;
  public isSaveSearchNameModal = false;
  public isSendMail = false;
  public isEditSaveSearch = false;
  //#endregion

  public isAppoint = false;
  public appointmentObj: Appointment = new Appointment();
  public filterStatus: string = '';
  public filterStatusChk: boolean = true;
  public statusList: MasterDNorm[] = [];
  public filterLoc: string = '';
  public filterLocChk: boolean = true;
  public locList: MasterDNorm[] = [];
  public filterCulet: string = '';
  public filterCuletChk: boolean = true;
  public culetList: MasterDNorm[] = [];
  public filterKtoS: string = '';
  public filterKtoSChk: boolean = true;
  public ktoSList: MasterDNorm[] = [];
  public manualString: string = "";
  public searchByShape: string = "";
  private scheme: Scheme = new Scheme();
  public lastPurchase: number = 0.00;
  public totalVowValue: number = 0.00;
  public appliedVowDisc: number = 0.00;
  public appliedVowAmt: number = 0.00;
  public paybleAmount: number = 0.00;
  public totalAmount: number = 0.00;

  constructor(
    private router: Router,
    public sanitizer: DomSanitizer,
    private alertDialogService: AlertdialogService,
    public utilityService: UtilityService,
    private masterConfigService: MasterConfigService,
    private spinnerService: NgxSpinnerService,
    private commonService: CommonService,
    private configService: ConfigService,
    private gridPropertiesService: GridPropertiesService,
    private inventoryService: CustomerInvSearchService,
    private watchlistService: WatchlistService,
    private customerService: CustomerService,
    private customerPreferenceService: CustomerPreferenceService,
    private emailService: EmailService,
    private cartService: CartService,
    private leadService: LeadService,
    private logService: LogService,
    private appPreloadService: AppPreloadService,
    private schemeService: SchemeService,
    private renderer: Renderer2,
    private route: ActivatedRoute
  ) { }

  public async ngOnInit() {
    window.scrollTo(0, 0);
    await this.defaultMethodsLoad();

    var aiRecDiamondStoneIds = sessionStorage.getItem("AIRecommended");
    if (aiRecDiamondStoneIds != null) {
      const parsedStoneIds = JSON.parse(aiRecDiamondStoneIds);

      if (Array.isArray(parsedStoneIds)) {
        this.aiRecDiamondStoneIds = parsedStoneIds;
      }

      await this.filterBySearch();
      sessionStorage.removeItem("AIRecommended");
      return;
    }

    var newFlag = JSON.parse(sessionStorage.getItem("NewDiamonds") ?? 'false') as boolean;
    if (newFlag) {
      this.invSearchCriteriaObj.status.push("New");
      this.onMultiSelectChange(this.listStatus, this.invSearchCriteriaObj.status);
      await this.filterBySearch();
      sessionStorage.removeItem("NewDiamonds");
      return;
    }

    var saveSearchName = sessionStorage.getItem("SaveSearch");
    if (saveSearchName) {
      this.isEditSaveSearch = JSON.parse(sessionStorage.getItem("IsEditSaveSearch") ?? 'false') as boolean;

      this.filterSaveSearch = saveSearchName;
      this.onSaveSearchChange(saveSearchName, this.isEditSaveSearch);
      if (this.isEditSaveSearch) {
        this.isSearchFilter = true;
        sessionStorage.removeItem("IsEditSaveSearch");
      }
      sessionStorage.removeItem("SaveSearch");
      return;
    }

    this.route.params.subscribe(params => {
      this.manualString = params['dashboardSearchString'];
      if (this.manualString) {
        this.filterBySearch();
        this.router.navigate(['/searchresult'], { replaceUrl: true });
        return;
      }
    });

    if (sessionStorage.getItem("SearchByShape")) {
      this.searchByShape = (sessionStorage.getItem("SearchByShape") ?? "");
      sessionStorage.removeItem("SearchByShape");
      await this.filterBySearch();
      return;
    }

    if (sessionStorage.getItem("SearchHistory")) {
      let historyId = (sessionStorage.getItem("SearchHistory") ?? "");
      let history = await this.inventoryService.getHistoryById(historyId);
      if (history && history.searchQuery) {
        let searchCriteria = JSON.parse(history.searchQuery, this.toCamelCase);
        searchCriteria.weightRanges = JSON.parse(JSON.stringify(searchCriteria.weightRanges), this.toCamelCase);
        this.invSearchCriteriaObj = searchCriteria;
        this.reverseAssignAdditionalData(searchCriteria);
        await this.filterBySearch();
      }
      sessionStorage.removeItem("SearchHistory");
      return;
    }

    this.openSearchDialog();
  }

  //#region Init Data
  public async defaultMethodsLoad() {
    this.spinnerService.show();
    this.fxCredentials = JSON.parse(sessionStorage.getItem("fxCredentials") ?? '') as CustFxCredential;
    await this.getMasterConfigData();
    await this.getGridConfiguration();
    await this.getCustomer();
    await this.getCustomerPreferenceData();
  }

  public async getGridConfiguration() {
    try {
      this.gridConfig = await this.configService.getGridConfig(this.fxCredentials?.id ?? '', "SearchResultInventory", "SearchResultInventoryGrid", this.gridPropertiesService.getSearchResultInventoryGrid());
      if (this.gridConfig && this.gridConfig.id != '') {
        let dbObj: GridDetailConfig[] = this.gridConfig.gridDetail.filter(x => this.gridPropertiesService.getSearchResultInventoryGrid().map(x => x.propertyName).includes(x.propertyName));
        if (dbObj && dbObj.some(c => c.isSelected)) {
          this.fields = dbObj;
          this.fields.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        }
        else
          this.fields.forEach(c => c.isSelected = true);
      }
      else {
        this.gridMasterConfigResponse = await this.configService.getMasterGridConfig("SearchResultInventory", "SearchResultInventoryGrid");
        if (this.gridMasterConfigResponse)
          this.fields = this.gridMasterConfigResponse.gridDetail;
        else
          this.fields = await this.gridPropertiesService.getSearchResultInventoryGrid();
      }
    }
    catch (error: any) {
      this.alertDialogService.show(error);
      this.spinnerService.hide();
    }
  }

  public async getCustomer() {
    try {
      var res = await this.customerService.getCustomerDNormByIdAsync(this.fxCredentials?.id ?? '');
      if (res) {
        this.customerDNorm = res;
        this.appointmentObj.customer = res;
      }
      else
        this.alertDialogService.show('Customer not found, Try login again');
    } catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Customer not found, Try login again');
    }
  }
  //#endregion

  //#region Master Config Data
  public async getMasterConfigData() {
    //Status
    listCustomerStoneStatus.forEach(z => { this.listStatus.push({ name: z.toString(), isChecked: false }); });
    //Master Config
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

    await this.getLocationData();
  }

  public async getLocationData() {
    try {
      let listLocations: string[] = await this.inventoryService.getInventoryLocationList();
      if (listLocations)
        listLocations.forEach(z => { this.listLocation.push({ name: z, isChecked: false }); });
    }
    catch (error: any) {
      this.alertDialogService.show(error.error);
    }
  }
  //#endregion

  //#region Grid Change Events
  public selectedRowChange(e: any) {
    this.selectedInventoryItems = [];
    if (this.mySelection.length > 0)
      this.selectedInventoryItems = this.allInvItems.filter(z => this.mySelection.includes(z.stoneId));
    this.calculateTotalAndAvg();
  }

  public calculateTotalAndAvg() {
    if (this.selectedInventoryItems.length > 0) {
      this.totalCount = this.selectedInventoryItems.length.toString();
      this.totalWeight = this.utilityService.ConvertToFloatWithDecimal(this.selectedInventoryItems.map(z => z.weight).reduce((ty, u) => ty + u, 0)).toString();
      this.totalNetAmount = this.utilityService.ConvertToFloatWithDecimal(this.selectedInventoryItems.map(z => z.price.netAmount ?? 0).reduce((ty, u) => ty + u, 0)).toString();
      this.rNetAmount = this.utilityService.ConvertToFloatWithDecimal(this.selectedInventoryItems.map(z => ((z.price.rap ?? 0) * z.weight)).reduce((ty, u) => ty + u, 0)).toString();
      this.avgPerCarat = this.utilityService.ConvertToFloatWithDecimal((parseFloat(this.totalNetAmount) / parseFloat(this.totalWeight))).toString();
      this.avgDiscount = this.utilityService.ConvertToFloatWithDecimal(((parseFloat(this.totalNetAmount) / parseFloat(this.rNetAmount)) * 100) - 100).toString();

      this.calculateVow(parseFloat(this.totalNetAmount));

    }
    else {
      this.totalCount = '0';
      this.totalWeight = '0.00';
      this.totalNetAmount = '0.00';
      this.avgDiscount = '0.00';
      this.avgPerCarat = '0.00';
      this.rNetAmount = '0.00';
      this.appliedVowDisc = 0;
      this.paybleAmount = 0;
      this.finalDisc = 0;
    }

  }

  public groupChange(groups: GroupDescriptor[]): void {
    try {
      this.groups = groups;
      this.getInventoryBySearchCriteria();
    }
    catch (error: any) {
      this.alertDialogService.show(error.error);
    }
  }

  public pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.getInventoryBySearchCriteria();
  }

  public selectAll(e: any) {
    // if (e.currentTarget.checked) {
    //   this.mySelection = [];
    //   let data = this.filterInventoryItems.map(z => z.id);
    //   this.mySelection.push(...data);
    // }
    // else
    //   this.mySelection = [];
  }

  public sanitizeURL(url: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  public sortChange(sort: SortDescriptor[]): void {
    this.sort = sort;
    this.getInventoryBySearchCriteria();
  }
  //#endregion

  //#region Get Inventory Search By Filter
  public async getSummaryData() {
    try {
      this.invSearchCriteriaObj.selectedStones = this.mySelection;
      let res = await this.inventoryService.getInvSummary(this.invSearchCriteriaObj);
      if (res)
        this.summary = res;
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Something went wrong, Try again later!');
    }
  }

  public async getInventoryBySearchCriteria() {
    try {
      this.spinnerService.show();
      this.invSearchCriteriaObj.customer = this.customerDNorm;
      this.tempInvSearchCriteriaObj = JSON.parse(JSON.stringify(this.invSearchCriteriaObj));
      this.invSearchCriteriaObj.selectedStones = this.mySelection;

      let res = await this.inventoryService.getInventoryItemsBySearch(this.invSearchCriteriaObj, this.skip, this.pageSize);
      if (res) {
        this.filterInventoryItems = JSON.parse(JSON.stringify(res.inventories));
        this.summary.totalCount = res.totalCount;

        this.filterInventoryItems.forEach(z => {
          this.utilityService.changeAdditionalDataForCustomerInv(z, this.allTheShapes ?? []);
        });
        this.setAllInventoryArrayData(res.inventories);
        // this.summary = res;
        this.setGridData();
      }
      else {
        this.spinnerService.hide();
        this.alertDialogService.show('Something went wrong, Try again later!');
      }
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Something went wrong, Try again later!');
    }
  }

  public async filterBySearch() {
    this.spinnerService.show();
    this.skip = 0;
    this.assignAdditionalData();
    // await this.getSummaryData();
    await this.getInventoryBySearchCriteria();
    this.isSearchFilter = false;
  }

  public clearSearchCriteria(form: NgForm): void {
    this.invSearchCriteriaObj = new CustomerInvSearchCriteria();
    form.resetForm();
    this.changeCPSData('Clear');
    this.firstCaratFrom = undefined;
    this.firstCaratTo = undefined;
    this.secondCaratFrom = undefined;
    this.secondCaratTo = undefined;
    this.thirdCaratFrom = undefined;
    this.thirdCaratTo = undefined;
    this.fourthCaratFrom = undefined;
    this.fourthCaratTo = undefined;
    this.filterSaveSearch = '';
    this.isEditSaveSearch = false;
    this.aiRecDiamondStoneIds = [];
    this.manualString = '';
  }

  public reverseAssignAdditionalData(criteria: CustomerInvSearchCriteria): void {
    let weightRanges = criteria.weightRanges;

    let i = 0;
    weightRanges.forEach(z => {
      if (i == 0) {
        this.firstCaratFrom = z.minWeight;
        this.firstCaratTo = z.maxWeight;
      }
      else if (i == 1) {
        this.secondCaratFrom = z.minWeight;
        this.secondCaratTo = z.maxWeight;
      }
      else if (i == 2) {
        this.thirdCaratFrom = z.minWeight;
        this.thirdCaratTo = z.maxWeight;
      }
      else if (i == 3) {
        this.fourthCaratFrom = z.minWeight;
        this.fourthCaratTo = z.maxWeight;
      }
      i++;
    });

    if (criteria.stoneIds.length > 0)
      this.stoneId = criteria.stoneIds.join(',').toString();

    if (criteria.certificateNos.length > 0)
      this.certificateNo = criteria.certificateNos.join(',').toString();
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

    let newManualString: string[] = [];

    if (this.manualString && this.manualString != "") {
      newManualString = this.utilityService.checkCertificateIds(this.manualString);
    }
    if (newManualString && newManualString.length > 0) {
      newManualString.forEach(z => {
        let flag = false;
        flag = this.onlyNumbers(z)
        if (flag)
          this.invSearchCriteriaObj.certificateNos.push(z);
        else
          this.invSearchCriteriaObj.stoneIds.push(z);
      });
    }

    if (this.searchByShape && this.searchByShape != "") {
      this.invSearchCriteriaObj.shape.push(this.searchByShape);
    }

    if (this.invSearchCriteriaObj.fromDate) {
      let fData = this.invSearchCriteriaObj.fromDate;
      this.invSearchCriteriaObj.fromDate = fData ? this.utilityService.setUTCDateFilter(fData) : null;
    }

    if (this.invSearchCriteriaObj.toDate) {
      let tData = this.invSearchCriteriaObj.toDate;
      this.invSearchCriteriaObj.toDate = tData ? this.utilityService.setUTCDateFilter(tData) : null;
    }

    if (this.invSearchCriteriaObj.location == null)
      this.invSearchCriteriaObj.location = [];

    if (this.invSearchCriteriaObj.status == null)
      this.invSearchCriteriaObj.status = [];

    if (this.aiRecDiamondStoneIds.length > 0) {
      this.aiRecDiamondStoneIds.forEach(stoneId => {
        this.invSearchCriteriaObj.stoneIds.push(stoneId);
      });
    }
  }

  public onlyNumbers(str: string) {
    return /^[0-9]+$/.test(str);
  }

  public setGridData() {
    this.gridView = process(this.filterInventoryItems, { group: this.groups, sort: this.sort });
    this.gridView.total = this.summary.totalCount;
    this.spinnerService.hide();
  }
  //#endregion

  //#region OnChange Functions
  public setAllInventoryArrayData(invs: InvDetailData[]) {
    invs.forEach(z => {
      let allIndex = this.allInvItems.findIndex(a => a.stoneId == z.stoneId);
      if (allIndex == -1)
        this.allInvItems.push(JSON.parse(JSON.stringify(z)));
    });
  }

  public showSelectedInventories() {
    this.spinnerService.show();
    if (this.showSelected) {
      this.gridView = process(this.selectedInventoryItems, { group: this.groups });
      this.gridView.total = this.selectedInventoryItems.length;
      this.spinnerService.hide();
    } else
      this.setGridData();
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

  public addRemoveStringInArrayFilterColor(a: string[], b: string) {
    if (b == 'All') {
      let c = [...a];
      c.forEach(z => { a.splice(0, 1); });
      return;
    }
    else if (b == '*') {
      let c = [...a];
      c.forEach(z => { a.splice(0, 1); });
      a.push(b);
      return;
    }

    if (a.indexOf(b) == -1) {
      if (a.includes('*')) {
        let index = a.findIndex(x => x == '*');
        if (index >= 0)
          a.splice(index, 1)
      }

      a.push(b);
    }
    else {
      let index = a.findIndex(x => x == b);
      if (index >= 0)
        a.splice(index, 1)
    }

  }

  public onMultiSelectChange(val: Array<{ name: string; isChecked: boolean }>, selectedData: string[]): void {
    val.forEach(element => {
      element.isChecked = false;
    });

    if (selectedData && selectedData.length > 0) {
      val.forEach(element => {
        selectedData.forEach(item => {
          if (element.name.toLocaleLowerCase() == item.toLocaleLowerCase())
            element.isChecked = true;
        });
      });
    }
  }

  public checkMinMaxValidation(min: any, max: any): string {
    if (min && max) {
      if (parseFloat(min) > parseFloat(max))
        return "min value must greater than max value!";
    }
    else if (min && !max)
      return "max value required!";
    else if (min && !max)
      return "min value required!";

    return '';
  }

  public tagMapper(tags: string[]): void {
    // This function is used for hide selected items in multiselect box
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

      this.invSearchCriteriaObj.green = [];
      this.invSearchCriteriaObj.brown = [];
      this.invSearchCriteriaObj.milky = [];

      this.isBGM = false;
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

  public calculateDateDiff(createdDate: Date): boolean {
    createdDate = new Date(createdDate);
    let currentDate = new Date();

    let days = Math.floor((Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()) - Date.UTC(createdDate.getFullYear(), createdDate.getMonth(), createdDate.getDate())) / (1000 * 60 * 60 * 24));
    if (days <= this.newArrivalStoneDays)
      return true;
    else
      return false;
  }

  public toCamelCase(key: any, value: any) {
    if (value && typeof value === 'object') {
      for (var k in value) {
        if (/^[A-Z]/.test(k) && Object.hasOwnProperty.call(value, k)) {
          value[k.charAt(0).toLowerCase() + k.substring(1)] = value[k];
          delete value[k];
        }
      }
    }
    return value;
  }
  //#endregion

  //#Shape-icon name trim space
  getClassName(displayName: string): string {
    return displayName.toUpperCase().trim().replace(/\s+/g, '');
  }

  //#region Model Changes
  public openExcelDialog() {
    this.isExcelModal = true;
  }

  public closeExcelDialog() {
    this.isExcelModal = false;
  }

  public openSearchDialog() {
    this.mySelection = [];
    this.isSearchFilter = true;
  }

  public closeSearchDialog() {
    this.isSearchFilter = false;
  }

  public openDiamonddetailSidebar(inv: InvDetailData) {
    this.showDiamonddetailModal = false;
    this.invItemObj = inv;
    setTimeout(() => { this.showDiamonddetailModal = true; }, 0);
  }

  public openDiamondDetails(inv: InvDetailData) {
    const url = this.router.serializeUrl(this.router.createUrlTree(['/diamond-detail/', inv.stoneId]));
    window.open(url, '_blank');
  }

  public openMediaDialog(type: string, inv: InvDetailData): void {
    let src = 'commonAssets/images/image-not-found.jpg';
    switch (type.toLowerCase()) {
      case "img":
        src = inv.media.isPrimaryImage
          ? environment.imageURL.replace('{stoneId}', inv.stoneId.toLowerCase())
          : "commonAssets/images/image-not-found.jpg";
        break;
      case "iframe":
        src = inv.media.isHtmlVideo
          ? environment.videoURL.replace('{stoneId}', inv.stoneId.toLowerCase())
          : "commonAssets/images/video-not-found.png";
        break;
      case "cert":
        src = inv.media.isCertificate
          ? environment.certiURL.replace('{certiNo}', inv.certificateNo)
          : "commonAssets/images/certi-not-found.png";
        break;
      case "download":
        src = inv.media.isDownloadableVideo
          ? environment.otherImageBaseURL.replace('{stoneId}', inv.stoneId.toLowerCase()) + "/video.mp4"
          : "commonAssets/images/video-not-found.png";
        break;
    }
    this.mediaSrc = src;
    this.mediaType = type;
    this.isShowMedia = true;
  }

  public openCompareDialog(): void {
    this.selectedStoneIds = this.selectedInventoryItems.map(z => z.stoneId);
    this.isCompareDialog = true;
  }

  public closeCompareDialog(): void {
    this.isCompareDialog = false;
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

  public async openCheckoutDialog(): Promise<void> {
    this.selectedStoneIds = this.selectedInventoryItems.map(z => z.invId);

    let validationMessage = await this.cartService.getCheckCartValidInventoryAsync(this.selectedStoneIds);
    if (validationMessage)
      return this.alertDialogService.show(validationMessage);

    this.selectedAmt = Number(parseFloat(this.totalNetAmount));
    this.isCheckout = true;
  }

  public async parentMethodCall() {
    this.isCheckout = false;
    this.clearSelectionData();
    // await this.getSummaryData();
    await this.getInventoryBySearchCriteria();
  }

  public clearSelectionData() {
    this.mySelection = [];
    this.selectedStoneIds = [];
    this.selectedInventoryItems = [];
    this.calculateTotalAndAvg();
  }

  public navigateBackward() {
    if (Array.isArray(this.filterInventoryItems) && this.filterInventoryItems.length) {
      this.isSearchFilter = false;
    } else {
      window.history.back();
    }
  }

  public openSaveSearchNameModal(): void {
    this.isSaveSearchNameModal = true;
    this.saveSearchName = '';
  }

  public closeSaveSearchNameModal(): void {
    this.isSaveSearchNameModal = false;
  }

  public openSendMailDialog(): void {
    this.isSendMail = true;
    this.isBodyScrollHidden(true);
  }

  public closeSendMailDialog(): void {
    this.isSendMail = false;
    this.clearSendMail();
    this.isBodyScrollHidden(false);
  }

  public openMyAppointDialog(): void {
    this.appointmentObj.stoneIds = this.selectedInventoryItems.map(z => z.stoneId);
    this.appointmentObj.Status = "Booked";
    this.isAppoint = true;
  }

  public closeyAppointDialog(): void {
    this.isAppoint = false;
  }
  //#endregion

  //#region Watch list
  public async addWatchlistData() {
    try {
      if (this.selectedInventoryItems.length > 0) {
        this.spinnerService.show();
        var stoneIds = this.selectedInventoryItems.map(z => z.stoneId);
        var res = await this.watchlistService.insertWatchListsFromInvIds(stoneIds, this.fxCredentials?.id ?? '');
        if (res) {
          this.spinnerService.hide();
          this.alertDialogService.show(res);
        }
        else {
          this.spinnerService.hide();
          this.alertDialogService.show('Something went wrong, Try again later!');
        }
      }
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Something went wrong, Try again later!');
    }
  }
  //#endregion

  //#region Add to cart
  public async addToCartData() {
    if (this.selectedInventoryItems.length > 0) {
      this.alertDialogService.ConfirmYesNo("Are you sure you want to add to cart?", "Cart")
        .subscribe(async (res: any) => {
          if (res.flag) {
            try {

              let customerDetail: Customer = await this.customerService.getCustomerById(this.fxCredentials?.id ?? '');
              if (customerDetail) {
                this.spinnerService.show();
                var data = this.mappingCartData(this.selectedInventoryItems, customerDetail);
                var result = await this.cartService.insertCartsAsync(data);
                if (result) {
                  this.clearSelectionData();
                  await this.filterBySearch();
                  this.alertDialogService.show(result);
                }
                else {
                  this.spinnerService.hide();
                  this.alertDialogService.show('Something went wrong, Try again later!');
                }
              } else
                this.alertDialogService.show('Customer not found, Try login again!');
            }
            catch (error: any) {
              console.error(error);
              this.spinnerService.hide();
              this.alertDialogService.show('Something went wrong, Try again later!');
            }
          }
        });
    }
  }

  public mappingCartData(invs: InvDetailData[], customer: Customer): Cart[] {
    let carts: Cart[] = [];
    invs.forEach(z => {
      let addCart = new Cart();

      addCart.customer = this.customerDNorm;
      addCart.seller = customer.seller;
      addCart.invId = z.invId;
      addCart.stoneId = z.stoneId;
      addCart.WebPlatform = "Online";

      carts.push(addCart);
    });

    return carts;
  }
  //#endregion

  //#region Export Data
  public async exportToExcel() {
    try {
      this.spinnerService.show();
      let data: InvDetailData[] = [];
      if (this.exportType == 'Selected') {
        if (this.selectedInventoryItems.length == 0) {
          this.spinnerService.hide();
          this.alertDialogService.show('No selected stone(s) found!');
          return;
        }
        data = this.selectedInventoryItems;
      }
      else if (this.exportType == 'Search') {
        if (this.summary.totalCount > 500) {
          this.alertDialogService.show('You can not download more than 500 Stones');
          this.spinnerService.hide();
          return;
        }
        let res = await this.inventoryService.getAllInventoryItemsBySearch(this.invSearchCriteriaObj);
        if (res)
          data = res;
      } else {
        this.spinnerService.hide();
        this.alertDialogService.show('Select type for export to excel!');
        return;
      }

      //this.generateExcelData(data);      
      //if (this.excelFile.length > 0)
      //this.utilityService.exportAsExcelFile(this.excelFile, "Search_Stones_Excel_");

      await this.exportExcelNew(data);
      this.closeExcelDialog();
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  private async generateExcelData(data: InvDetailData[]) {
    this.excelFile = [];
    let i = 0;
    var totalWeight = 0;
    var totalNetAmount = 0;
    data.forEach(z => {
      totalWeight += z.weight;
      totalNetAmount += (z.price.netAmount ? z.price.netAmount : 0);

      var excel = {
        CertificateUrl: z.media.isCertificate ? environment.certiURL.replace('{certiNo}', z.certificateNo) : '',
        ImageUrl: z.media.isPrimaryImage ? environment.imageURL.replace('{stoneId}', z.stoneId) : '',
        VideoUrl: z.media.isHtmlVideo ? environment.videoURL.replace('{stoneId}', z.stoneId) : '',
        'Stock Id': z.stoneId,
        'Certificate No': z.certificateNo,
        'Shape': z.shape,
        Size: z.weight,
        Color: z.color,
        Clarity: z.clarity,
        Cut: z.cut,
        Polish: z.polish,
        Symmetry: z.symmetry,
        Flouresence: z.fluorescence,
        Length: z.measurement.length,
        Width: z.measurement.width,
        Height: z.measurement.height,
        Depth: z.measurement.depth,
        Table: z.measurement.table,
        Lab: z.lab,
        Rap: z.price.rap,
        'Disc%': z.price.discount + "%",
        '$/Ct': z.price.perCarat,
        'Net Amount': z.price.netAmount,
        Location: z.location
      }
      this.excelFile.push(excel);

      i++;
    });

    let obj: any = {
      CertificateUrl: '',
      ImageUrl: '',
      VideoUrl: '',
      'Stock Id': '',
      'Certificate No': '',
      'Shape': '',
      Size: totalWeight,
      Color: '',
      Clarity: '',
      Cut: '',
      Polish: '',
      Symmetry: '',
      Flouresence: '',
      Length: '',
      Width: '',
      Height: '',
      Depth: '',
      Table: '',
      Lab: '',
      Rap: '',
      'Disc%': '',
      '$/Ct': '',
      'Net Amount': "$" + totalNetAmount.toFixed(2),
      Location: ''
    }
    this.excelFile.push(obj);
  }

  public async exportExcelNew(data: InvDetailData[]) {
    try {

      data.forEach(z => {
        z.imageURL = environment.imageURL;
        z.videoURL = environment.videoURL;
        z.certiURL = environment.certiURL;
        z.otherImageBaseURL = environment.otherImageBaseURL;
      })

      let response = await this.customerService.downloadExcel(data);
      if (response) {
        var downloadURL = window.URL.createObjectURL(response);
        var link = document.createElement('a');
        link.href = downloadURL;
        link.download = `${this.utilityService.exportFileName(this.utilityService.replaceSymbols(this.fxCredentials?.company ?? 'SearchResult'))}`;
        link.click();
      }
    } catch (error: any) {
      this.alertDialogService.show("something went wrong, please try again or contact administrator");
      this.spinnerService.hide();
    }
  }
  //#endregion

  //#region Send Email
  public async downloadAttachment() {
    try {
      this.spinnerService.show();

      let data: InvDetailData[] = [];
      if (this.exportType == 'Selected') {
        if (this.selectedInventoryItems.length == 0) {
          this.alertDialogService.show('No selected stone(s) found!');
          return;
        }
        data = this.selectedInventoryItems;
      }
      else if (this.exportType == 'Search') {
        let res = await this.inventoryService.getAllInventoryItemsBySearch(this.invSearchCriteriaObj);
        if (res)
          data = res;
      } else {
        this.spinnerService.hide();
        this.alertDialogService.show('Select type for export to excel!');
        return;
      }

      this.generateExcelData(data);

      if (this.excelFile.length > 0)
        this.utilityService.exportAsExcelFile(this.excelFile, "Diamond_Excel");

      this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async sendMail(form: NgForm) {
    try {
      if (!form.valid)
        return;

      let isEmailValid = this.checkValidEmail(this.exportToExcelMailObj.toEmail);
      if (!isEmailValid) {
        this.alertDialogService.show('Not valid email address in Mail To');
        return;
      }

      let isCCValid = this.checkValidEmail(this.exportToExcelMailObj.cC);
      if (!isCCValid) {
        this.alertDialogService.show('Not valid email address in CC');
        return;
      }

      let isBccValid = this.checkValidEmail(this.exportToExcelMailObj.bcc);
      if (!isBccValid) {
        this.alertDialogService.show('Not valid email address in Bcc');
        return;
      }

      this.spinnerService.show();

      let data: InvDetailData[] = [];
      if (this.exportType == 'Selected') {
        if (this.selectedInventoryItems.length == 0) {
          this.alertDialogService.show('No selected stone(s) found!');
          return;
        }
        data = this.selectedInventoryItems;
      }
      else if (this.exportType == 'Search') {
        let res = await this.inventoryService.getAllInventoryItemsBySearch(this.invSearchCriteriaObj);
        if (res)
          data = res;
      } else {
        this.spinnerService.hide();
        this.alertDialogService.show('Select type for export to excel!');
        return;
      }

      let fileName = "Diamond_Excel";
      this.generateExcelData(data);
      this.exportToExcelMailObj.systemUserId = this.fxCredentials?.id ?? '';
      this.exportToExcelMailObj.excelBase64String = this.utilityService.exportAsExcelFileBase64(this.excelFile);;
      this.exportToExcelMailObj.excelFileName = this.utilityService.exportFileName(fileName);
      this.exportToExcelMailObj.excelMediaType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      this.exportToExcelMailObj.companyName = this.utilityService.getCompanyNameFromUrl(window.location.href);

      let res = await this.emailService.sendEmailAsync(this.exportToExcelMailObj);
      if (res && res.isSuccess) {
        this.utilityService.showNotification(res.message);
        this.closeSendMailDialog();
        this.spinnerService.hide();
      }
      else {
        console.error(res);
        if (res)
          this.alertDialogService.show(res.message);
        else
          this.alertDialogService.show("Something went wrong, Try again later");
        this.spinnerService.hide();
      }
    }
    catch (error: any) {
      console.error(error);
      this.alertDialogService.show("Something went wrong, Try again later");
      this.spinnerService.hide();
    }
  }

  public checkValidEmail(email: string): boolean {
    let flag = true;
    if (email && email.length > 0) {
      let emailArray = email.split(",");
      if (emailArray && emailArray.length > 0) {
        emailArray.forEach(z => {
          if (flag)
            flag = this.validateEmail(z.trim());
        });
      }
    }
    return flag;
  }

  public validateEmail(email: string): boolean {
    let regexp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    return regexp.test(email);
  }

  public clearSendMail(): void {
    this.exportToExcelMailObj = new ExportToExcelMailData();
  }
  //#endregion

  //#region Customer Preference | Save Search
  public async getCustomerPreferenceData() {
    try {
      this.spinnerService.show();
      var data = await this.customerPreferenceService.getCustomerPreferenceByCustomer(this.fxCredentials?.id ?? '');
      if (data) {
        this.customerPreference = data;

        this.saveSearchData = [];
        data.savedSearches.forEach(z => {
          let obj: ParseSearchQuery = new ParseSearchQuery();
          obj.name = z.name;
          obj.query = JSON.parse(z.query);
          obj.expiryDate = z.expiryDate;
          obj.createdAt = z.createdAt;
          this.saveSearchData.push(obj);
        });

        this.spinnerService.hide();
      }
      else
        this.spinnerService.hide();
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Something went wrong, Try again later!');
    }
  }

  public async addSaveSearch() {
    try {
      if (this.saveSearchName.length > 0) {
        var exists = this.saveSearchData.find(z => z.name.toLowerCase() == this.saveSearchName.toLowerCase())
        if (exists != null) {
          this.alertDialogService.show('Save search name already exists!');
          return;
        }

        this.spinnerService.show();
        var newData = new SearchQuery();
        newData.name = this.saveSearchName;
        newData.query = JSON.stringify(this.invSearchCriteriaObj);
        newData.createdAt = new Date();

        this.customerPreference.savedSearches.push(newData);
        var result: boolean = false;

        if (this.customerPreference.id != null && this.customerPreference.id.length > 0)
          result = await this.customerPreferenceService.updateCustomerPreference(this.customerPreference);
        else {
          this.customerPreference.customer = this.customerDNorm;
          var res = await this.customerPreferenceService.insertCustomerPreference(this.customerPreference);
          result = (res.length > 0);
        }

        if (result) {
          this.utilityService.showNotification('Save Search added successfully!');
          await this.getCustomerPreferenceData();
          await this.filterBySearch();
        }
        else
          this.spinnerService.hide();

        this.closeSaveSearchNameModal();
      }
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Something went wrong, Try again later!');
    }
  }

  public async updateSaveSearchPreferenceData() {
    try {
      this.alertDialogService.ConfirmYesNo("Are you sure you want to update info?", "Update Information")
        .subscribe(async (res: any) => {
          if (res.flag) {
            if (this.filterSaveSearch && this.filterSaveSearch.length > 0) {
              var newData = new SearchQuery();
              newData.name = this.filterSaveSearch;
              newData.query = JSON.stringify(this.invSearchCriteriaObj);

              let isUpdated = await this.customerPreferenceService.UpdateSavedSearchQuery(this.customerDNorm.id, newData);
              if (isUpdated) {
                await this.filterBySearch();
                this.alertDialogService.show('Save Information is updated successfully!');
              }
            } else
              this.alertDialogService.show('Save search name not found!');
          }
        });
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Something went wrong, Try again later!');
    }
  }

  public async removeSaveSearch(name: string) {
    try {
      var index = this.saveSearchData.findIndex(z => z.name == name)

      this.customerPreference.savedSearches.splice(index, 1);
      var result = await this.customerPreferenceService.updateCustomerPreference(this.customerPreference);
      if (result) {
        await this.getCustomerPreferenceData();
        this.utilityService.showNotification('Save search removed!');
        this.spinnerService.hide();
      }
      else
        this.spinnerService.hide();

      this.filterSaveSearch = null;
      this.isRemovingSaveSearch = false;
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Something went wrong, Try again later!');
    }
  }

  public async onSaveSearchChange(e: any, isEditSaveSearch?: boolean) {
    await setTimeout(async () => {
      if (this.isRemovingSaveSearch == true)
        return;

      var exists = this.saveSearchData.find(z => z.name == e)
      if (exists != null) {
        this.spinnerService.show();

        this.invSearchCriteriaObj = JSON.parse(JSON.stringify(exists.query));
        this.fillAdditionalData();
        if (!isEditSaveSearch) {
          this.skip = 0;
          await this.filterBySearch();
        } else
          this.spinnerService.hide();
      }
      else {
        this.filterInventoryItems = [];
      }
    }, 0);
  }

  public fillAdditionalData() {
    if (this.invSearchCriteriaObj.weightRanges.length > 0) {
      this.firstCaratFrom = this.invSearchCriteriaObj.weightRanges[0].minWeight;
      this.firstCaratTo = this.invSearchCriteriaObj.weightRanges[0].maxWeight;
    }
    if (this.invSearchCriteriaObj.weightRanges.length > 1) {
      this.secondCaratFrom = this.invSearchCriteriaObj.weightRanges[1].minWeight;
      this.secondCaratTo = this.invSearchCriteriaObj.weightRanges[1].maxWeight;
    }
    if (this.invSearchCriteriaObj.weightRanges.length > 2) {
      this.thirdCaratFrom = this.invSearchCriteriaObj.weightRanges[2].minWeight;
      this.thirdCaratTo = this.invSearchCriteriaObj.weightRanges[2].maxWeight;
    }
    if (this.invSearchCriteriaObj.weightRanges.length > 3) {
      this.fourthCaratFrom = this.invSearchCriteriaObj.weightRanges[3].minWeight;
      this.fourthCaratTo = this.invSearchCriteriaObj.weightRanges[3].maxWeight;
    }

    this.stoneId = this.invSearchCriteriaObj.stoneIds.length > 0 ? this.invSearchCriteriaObj.stoneIds.join(', ') : null as any;
    this.certificateNo = this.invSearchCriteriaObj.certificateNos.length > 0 ? this.invSearchCriteriaObj.certificateNos.join(', ') : null as any;

    if (this.invSearchCriteriaObj.fromDate)
      this.invSearchCriteriaObj.fromDate = this.getValidDate(this.invSearchCriteriaObj.fromDate);

    if (this.invSearchCriteriaObj.toDate) {
      this.invSearchCriteriaObj.toDate = this.getValidDate(this.invSearchCriteriaObj.toDate);
      let tData = this.invSearchCriteriaObj.toDate;
      this.invSearchCriteriaObj.toDate = tData ? this.utilityService.setUTCDateFilter(tData) : null;
    }

  }

  public getValidDate(date: any): Date {
    const day = moment(date).date();
    const month = moment(date).month();
    const year = moment(date).year();
    var newDate = new Date(year, month, day);
    return newDate;
  }
  //#endregion

  public isCheckShape(shape: string): boolean {
    return (shape.toLowerCase() == 'round')
  }


  /* #region  Add log */
  private addDbLog(action: string, request: string, response: string, error: string) {
    try {
      let log: DbLog = new DbLog();
      log.action = action;
      log.category = "SearchResult Customer";
      log.controller = "Add Cart";
      log.userName = (this.fxCredentials?.fullName) ?? '';
      log.ident = (this.fxCredentials?.id) ?? '';
      log.payLoad = request;
      log.eventTime = new Date().toDateString();
      log.text = response;
      log.errorText = error;
      this.logService.insertLog(log);

    } catch (error: any) {
      console.error(error);
      this.alertDialogService.show('Log not created, Please contact administrator!', "error");
    }
  }
  /* #endregion */

  public async calculateVow(totalAmount: number) {
    try {
      this.spinnerService.show();
      let credential = await this.appPreloadService.fetchFxCredentials("");
      this.scheme = await this.schemeService.getOnlineSchemeAsync(true);
      this.lastPurchase = await this.leadService.getLastPurchaseAmountForVow(credential.id);

      if (this.scheme) {
        let todayAmount = totalAmount;
        let todayPurchase = Number(todayAmount.toFixed(2));
        this.totalVowValue = Number((todayPurchase + this.lastPurchase).toFixed(2));
        let schemeDetail = this.scheme.details.find(c => c.from <= this.totalVowValue && this.totalVowValue <= c.to);
        if (schemeDetail)
          this.appliedVowDisc = schemeDetail?.discount;
        this.paybleAmount = Number((todayPurchase - ((todayPurchase * this.appliedVowDisc) / 100)).toFixed(2));
        this.appliedVowAmt = Number((todayPurchase - this.paybleAmount).toFixed(2));
        this.finalDisc = this.utilityService.ConvertToFloatWithDecimal(((this.paybleAmount / parseFloat(this.rNetAmount)) * 100) - 100);
        this.spinnerService.hide();
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public getcountryFlag(location: string) {
    return location.toLowerCase().replace(/\s+/g, '');
  }

  public isBodyScrollHidden(isScrollHide: boolean) {
    const action = isScrollHide ? 'addClass' : 'removeClass'
    this.renderer[action](document.body, 'hiddenScroll');
  }
}
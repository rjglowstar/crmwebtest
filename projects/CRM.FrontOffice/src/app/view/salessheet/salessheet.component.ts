import { DatePipe } from '@angular/common';
import { Component, ElementRef, HostListener, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { DataResult, GroupDescriptor, process, SortDescriptor } from '@progress/kendo-data-query';
import { environment } from 'environments/environment';
import { NgxSpinnerService } from 'ngx-spinner';
import { GridDetailConfig } from 'shared/businessobjects';
import { fxCredential, GridConfig, GridMasterConfig, InclusionConfig, MasterConfig, MasterDNorm, MeasurementConfig, SystemUserPermission } from 'shared/enitites';
import { ConfigService, TypeA, UtilityService, listColorMarkItems } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { CustLookUp, InventorySearchCriteria, SalesSheet, SalesSheetSummary, WeightRange } from '../../businessobjects';
import { Customer, SupplierDNorm, SystemUser } from '../../entities';
import { GridPropertiesService, InventoryService, SalesSheetService, MasterConfigService, SupplierService, CustomerService, SystemUserService } from '../../services';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-salessheet',
  templateUrl: './salessheet.component.html',
  styleUrls: ['./salessheet.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class SalesSheetComponent implements OnInit {
  //#region Grid Init
  public sort: SortDescriptor[] = [];
  public groups: GroupDescriptor[] = [];
  public pageSize = 26;
  public skip = 0;
  public fields!: GridDetailConfig[];
  public gridView?: DataResult;
  public isRegSystemUser: boolean = false;
  public filterFlag = true;
  public selectableSettings: SelectableSettings = { mode: 'multiple' };
  public mySelection: string[] = [];
  public isShowCheckBoxAll: boolean = true;
  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains',
  };
  //#endregion

  //#region Grid Config
  public isGridConfig: boolean = false;
  public gridConfig!: GridConfig;
  public gridMasterConfigResponse!: GridMasterConfig;
  //#endregion

  //#region List & Objects
  public salesSheetData: SalesSheet[] = [];
  public salesSheetSummary: SalesSheetSummary = new SalesSheetSummary();
  public supplierDNormItems!: SupplierDNorm[];

  public customer: CustLookUp[] = [];
  public listCustomer: Array<{ name: string; value: string; isChecked: boolean }> = [];
  public listColorMarkItems = listColorMarkItems;
  public listColorMark: Array<{ name: string; isChecked: boolean }> = [];

  public listSellerItems: Array<{ name: string; value: string; isChecked: boolean }> = [];
  public sellerItems!: SystemUser[];

  public fxCredentials?: fxCredential;

  public mediaTitle!: string
  public mediaSrc!: string
  public mediaType!: string

  public copyOption!: string | null;
  public excelOption!: string | null;
  public excelFile: any[] = [];

  public showExcelOption = false;
  public showCopyOption = false;

  @ViewChild("anchorExcel") public anchorExcel!: ElementRef;
  @ViewChild("popupExcel", { read: ElementRef }) public popupExcel!: ElementRef;
  @ViewChild("anchorCopy") public anchorCopy!: ElementRef;
  @ViewChild("popupCopy", { read: ElementRef }) public popupCopy!: ElementRef;
  //#endregion

  //#region Filter Data
  public isShowMedia: boolean = false;
  public isSearchFilter: boolean = false;
  public isSummary = false;
  public summaryLoading = true;

  public stoneId?: "";
  public certificateNo?: "";
  public inventorySearchCriteriaObj: InventorySearchCriteria = new InventorySearchCriteria();

  public masterConfigList!: MasterConfig;
  public allTheLab?: MasterDNorm[];
  public allTheShapes?: MasterDNorm[];
  public allColors?: MasterDNorm[];
  public allClarities?: MasterDNorm[];
  public allTheFluorescences?: MasterDNorm[];
  public allTheCPS?: MasterDNorm[];
  public allTheCut?: MasterDNorm[];
  public inclusionData: MasterDNorm[] = [];
  public inclusionFlag: boolean = false;
  public inclusionConfig: InclusionConfig = new InclusionConfig();
  public measurementData: MasterDNorm[] = [];
  public measurementConfig: MeasurementConfig = new MeasurementConfig();
  public listSupplierDNormItems: Array<{ name: string; value: string; isChecked: boolean }> = [];
  public selectedSupplierDNormItems?: { text: string, value: string };

  public listKToS: Array<{ name: string; isChecked: boolean }> = [];
  public listCulet: Array<{ name: string; isChecked: boolean }> = [];
  public listLocation: Array<{ name: string; isChecked: boolean }> = [];
  public listKapanItems: Array<{ name: string; isChecked: boolean }> = [];
  public listIGradeItems: Array<{ name: string; isChecked: boolean }> = [];
  public listMGradeItems: Array<{ name: string; isChecked: boolean }> = [];
  public listTypeA: Array<{ name: string; isChecked: boolean }> = [];

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

  public selectedCPS?: string;
  public isNoBGM: boolean = false;
  public isBGM: boolean = false;

  public isFirstTimeLoad = true;
  public isAllSelected: boolean = false;
  //#endregion

  public selectedCount: number = 0;
  public selectedWeight: number = 0;
  public selectedValue: number = 0;
  public isCanPartyName: boolean = false;


  constructor(private alertDialogService: AlertdialogService,
    private salesSheetService: SalesSheetService,
    private spinnerService: NgxSpinnerService,
    private supplierService: SupplierService,
    private customerService: CustomerService,
    private systemUserService: SystemUserService,
    public utilityService: UtilityService,
    private configService: ConfigService,
    private inventoryService: InventoryService,
    private gridPropertiesService: GridPropertiesService,
    private masterConfigService: MasterConfigService,
    public datepipe: DatePipe
  ) { }

  async ngOnInit() {
    await this.defaultMethods();
  }

  //#region Init Data
  public async defaultMethods() {
    try {
      this.spinnerService.show();
      this.fxCredentials = JSON.parse(sessionStorage.getItem("fxCredentials") ?? '') as fxCredential;
      await this.setUserRights();
      await this.getGridConfiguration();
      await this.initSalesSheetData();
      this.initSalesSheetsalesSheetSummary();
    }
    catch (error: any) {
      this.spinnerService.hide();
      console.error(error);
      this.alertDialogService.show('Sales Sheet data not fetch, Try again later!');
    }
  }

  public async getGridConfiguration() {
    try {
      this.gridConfig = await this.configService.getGridConfig(this.fxCredentials?.id ?? '', "SalesSheet", "SalesSheetGrid", this.gridPropertiesService.getSalesSheetGrid());
      if (this.gridConfig && this.gridConfig.id != '') {
        let dbObj: GridDetailConfig[] = this.gridConfig.gridDetail;
        if (dbObj && dbObj.some(c => c.isSelected)) {
          this.fields = dbObj;
          this.fields.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
          if (!this.isCanPartyName)
            this.fields = this.fields.filter(e => e.title != "Customer" && e.title != "Company");
        }
        else
          this.fields.forEach(c => c.isSelected = true);
      }
      else {
        this.gridMasterConfigResponse = await this.configService.getMasterGridConfig("SalesSheet", "SalesSheetGrid");
        if (this.gridMasterConfigResponse)
          this.fields = this.gridMasterConfigResponse.gridDetail;
        else
          this.fields = await this.gridPropertiesService.getSalesSheetGrid();

        if (!this.isCanPartyName)
          this.fields = this.fields.filter(e => e.title != "Customer" && e.title != "Company");
      }
      this.listColorMarkItems.forEach(z => { this.listColorMark.push({ name: z.toString(), isChecked: false }); });
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
    }
  }

  public async setUserRights() {
    let userPermissions: SystemUserPermission = new SystemUserPermission();
    let sesValue = sessionStorage.getItem("userPermission");
    if (sesValue)
      userPermissions = JSON.parse(sesValue) as SystemUserPermission;
    if (userPermissions.actions.length > 0) {
      let CanPartyName = userPermissions.actions.find(z => z.name == "Can Show Pary Name");
      if (CanPartyName != null)
        this.isCanPartyName = true;
    }
  }

  public async getMasterConfigData() {
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

    let allCulet = this.inclusionData.filter(item => item.type.toLowerCase().indexOf('culet') !== -1);
    allCulet.forEach(z => { this.listCulet.push({ name: z.name, isChecked: false }); });

    let kapanItems = await this.inventoryService.getOrgKapanList();
    kapanItems.forEach(z => { this.listKapanItems.push({ name: z, isChecked: false }); });

    let iGradeItems = await this.inventoryService.getOrgIGradeList();
    iGradeItems.forEach(z => { this.listIGradeItems.push({ name: z, isChecked: false }); });

    let mGradeItems = await this.inventoryService.getOrgMGradeList();
    mGradeItems.forEach(z => { this.listMGradeItems.push({ name: z, isChecked: false }); });

    let listLocations: string[] = await this.inventoryService.getInventoryLocationList();
    if (listLocations)
      listLocations.forEach(z => { this.listLocation.push({ name: z, isChecked: false }); });

    //TypeA
    Object.values(TypeA).forEach(z => { this.listTypeA.push({ name: z.toString(), isChecked: false }); });
  }

  public async initSalesSheetData() {
    try {
      this.spinnerService.show();
      let salesSheetRes = await this.salesSheetService.getSalesSheetBySearch(this.inventorySearchCriteriaObj, this.skip, this.pageSize);
      if (salesSheetRes) {
        this.salesSheetData = salesSheetRes.salesSheet;
        this.salesSheetSummary.totalPcs = salesSheetRes.counts;
        this.loadGridData();
        this.spinnerService.hide();
      }
      else {
        this.spinnerService.hide();
        this.alertDialogService.show('Sales Sheet data not fetch, Try again later!');
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      console.error(error);
      this.alertDialogService.show('Sales Sheet data not fetch, Try again later!');
    }
  }

  public async initSalesSheetsalesSheetSummary() {
    try {
      this.summaryLoading = true;
      let salesSheetSummary = await this.salesSheetService.getSalesSheetSummary(this.inventorySearchCriteriaObj);
      if (salesSheetSummary) {
        this.salesSheetSummary = salesSheetSummary;
        this.summaryLoading = false;
      } else
        this.summaryLoading = false;
    }
    catch (error: any) {
      this.spinnerService.hide();
      console.error(error);
      this.alertDialogService.show('Summary data not fetch, Try again later!');
    }
  }

  private async getSupplierDNormData() {
    try {
      this.supplierDNormItems = await this.supplierService.getSupplierDNorm();
      this.supplierDNormItems.forEach(z => { this.listSupplierDNormItems.push({ name: z.name, value: z.id, isChecked: false }) });
    }
    catch (error: any) {
      console.error(error);
      this.alertDialogService.show(error.error);
    }
  }

  public async getCustomerData() {
    try {
      let customer = await this.customerService.getAllCustomers();
      if (customer) {
        this.customer = customer;
        customer.forEach((z) => { this.listCustomer.push({ name: z.companyName, value: z.id, isChecked: false  }); });
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show('Something went wrong on get customer, Try again later.');
    }
  }

  private async getSellerData() {
    try {
      this.sellerItems = await this.systemUserService.getSystemUserByOrigin("Seller");
      this.sellerItems.forEach((item) => {
        this.listSellerItems.push({ name: item.fullName, value: item.id, isChecked: false })
      });
    }
    catch (error: any) {
      console.error(error);
      this.alertDialogService.show(error.error);
    }
  }
  //#endregion

  //#region Grid Changes
  public loadGridData() {
    this.gridView = process(this.salesSheetData, { group: this.groups, sort: this.sort });
    this.gridView.total = this.salesSheetSummary.totalPcs;
  }

  public groupChange(groups: GroupDescriptor[]): void {
    try {
      this.groups = groups;
      this.initSalesSheetData();
    }
    catch (error: any) {
      this.alertDialogService.show(error.error);
    }
  }

  public sortChange(sort: SortDescriptor[]): void {
    this.sort = sort;
    this.initSalesSheetData();
  }

  public pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.initSalesSheetData();
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

  public closeMediaDialog(e: boolean): void {
    this.isShowMedia = e;
  }

  public copyDiamondDetailLink(stoneId: string) {
    let baseUrl = environment.proposalUrl;
    var url = baseUrl + 'diamond-detail/' + stoneId;
    navigator.clipboard.writeText(url);
    this.utilityService.showNotification(`Copy to clipboard successfully!`);
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

  public openGridConfigDialog(): void {
    this.isGridConfig = true;
  }
  //#endregion

  //#region Filter Changes
  public async filterBySearch() {
    this.skip = 0;
    this.salesSheetSummary = new SalesSheetSummary();
    this.assignAdditionalData();
    await this.initSalesSheetData();
    this.isSearchFilter = false;
    this.initSalesSheetsalesSheetSummary();
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

    let fData = this.inventorySearchCriteriaObj.fromDate;
    this.inventorySearchCriteriaObj.fromDate = fData ? this.utilityService.setUTCDateFilter(fData) : null;

    let tData = this.inventorySearchCriteriaObj.toDate;
    this.inventorySearchCriteriaObj.toDate = tData ? this.utilityService.setUTCDateFilter(tData) : null;
  }

  public clearSearchCriteria(form:NgForm): void {
    form.reset();
    this.inventorySearchCriteriaObj = new InventorySearchCriteria();
    this.salesSheetSummary = new SalesSheetSummary();
    this.inventorySearchCriteriaObj.supplierIds = [];
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
    this.checkBGM();
  }

  public async onSupplierDNormChange(e: any, isEdit: boolean = false) {
    if (e) {
      const orgDNorm = this.supplierDNormItems.find(z => z.id == e.value);
      if (orgDNorm != undefined && orgDNorm != null) {
        this.inventorySearchCriteriaObj.supplierIds.push(orgDNorm.id);
        return;
      }
    }
    this.inventorySearchCriteriaObj.supplierIds = [];
  }

  public async openSearchDialog() {
    this.isSearchFilter = true;
    if (this.isFirstTimeLoad) {
      this.spinnerService.show();
      await this.getMasterConfigData();
      await this.getSupplierDNormData();
      await this.getCustomerData();
      await this.getSellerData();
      this.spinnerService.hide();
      this.isFirstTimeLoad = false;
    }
  }

  public closeSearchDialog(): void {
    this.isSearchFilter = false;
  }

  public openSummary(): void {
    this.isSummary = true;
  }

  public closeSummary(): void {
    this.isSummary = false;
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

  public getLeadData(item: SalesSheet) {
    let msg = "Total Stones : " + item.stoneCount;
    msg += "\n<br />Total Amount : " + item.totalAmount;
    return msg;
  }
  //#endregion

  //#region Select All
  public async selectAllData(event: string, isAll: boolean) {
    if (event.toLowerCase() == 'checked') {
      if (this.salesSheetSummary.totalPcs > this.pageSize && isAll) {
        this.spinnerService.show();
        let res = await this.salesSheetService.getCopyToClipboard(this.inventorySearchCriteriaObj);
        if (res) {
          this.mySelection = res;
          this.spinnerService.hide();
        }
        else
          this.spinnerService.hide();
        this.isAllSelected = false;
      }
      else {
        if (isAll || this.salesSheetSummary.totalPcs < this.pageSize)
          this.isAllSelected = false;
        else if (this.salesSheetSummary.totalPcs > this.pageSize)
          this.isAllSelected = true;

        this.mySelection.push(...this.salesSheetData.map(z => z.stoneId));
      }
    }
    else if (event.toLowerCase() == 'uncheckedall') {
      this.mySelection = [];
      this.selectedRowChange(event);
    }
    else {
      this.salesSheetData.forEach(z => {
        let selectionIndex = this.mySelection.findIndex(a => a == z.stoneId);
        if (selectionIndex != -1)
          this.mySelection.splice(selectionIndex, 1);
      });
      this.isAllSelected = false;
    }
  }
  //#endregion

  //#region Popup Close
  @HostListener("document:click", ["$event"])
  public documentClick(event: any): void {
    if (!this.containsExcel(event.target))
      this.showExcelOption = false;


    if (!this.containsCopy(event.target))
      this.showCopyOption = false;

  }

  private containsExcel(target: any): boolean {
    return (
      this.anchorExcel.nativeElement.contains(target) ||
      (this.popupExcel ? this.popupExcel.nativeElement.contains(target) : false)
    );
  }

  private containsCopy(target: any): boolean {
    return (
      this.anchorCopy.nativeElement.contains(target) ||
      (this.popupCopy ? this.popupCopy.nativeElement.contains(target) : false)
    );
  }
  //#endregion

  //#region Export To Excel / Mail
  public onExcelToggle(): void {
    this.showExcelOption = !this.showExcelOption;
  }

  public onCopyToggle(): void {
    this.showCopyOption = !this.showCopyOption;
  }

  public async exportToExcel() {
    this.excelFile = [];
    this.spinnerService.show();
    let exportData: SalesSheet[] = [];

    if (this.excelOption == 'selected') {
      if (this.mySelection.length == 0) {
        this.alertDialogService.show('Select at least one stone for export!');
        this.showExcelOption = false;
        this.spinnerService.hide();
        return;
      }

      let criteria: InventorySearchCriteria = new InventorySearchCriteria();
      criteria.stoneIds = this.mySelection;
      let data = await this.salesSheetService.getSalesSheetBySearch(criteria, 0, this.mySelection.length);
      if (data)
        exportData = data.salesSheet;
      else {
        this.spinnerService.hide();
        this.alertDialogService.show('Export to excel not working, Try again later!');
        return;
      }
    }
    else {
      let data = await this.salesSheetService.getSalesSheetBySearch(this.inventorySearchCriteriaObj, 0, this.salesSheetSummary.totalPcs);
      if (data)
        exportData = data.salesSheet;
      else {
        this.spinnerService.hide();
        this.alertDialogService.show('Export to excel not working, Try again later!');
        return;
      }
    }

    if (exportData && exportData.length > 0) {

      exportData.forEach(element => {
        var excel = this.convertArrayToObject(this.fields, element);
        this.excelFile.push(excel);
      });

      if (this.excelFile.length > 0) {
        let isExport: boolean = this.utilityService.exportAsExcelFile(this.excelFile, "Sale_Sheet");
        if (isExport) {
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
        else if (field.propertyName.includes("supplier")) {
          let propertyname = field.propertyName.split(".")[1];
          obj[field.title] = element.supplier[propertyname];
        }
        else if (field.propertyName.includes("primarySupplier")) {
          let propertyname = field.propertyName.split(".")[1];
          obj[field.title] = element.primarySupplier[propertyname];
        }
        else if (field.propertyName.includes("viaSupplier")) {
          let propertyname = field.propertyName.split(".")[1];
          obj[field.title] = element.viaSupplier[propertyname];
        }
        else if (field.propertyName.includes("broker")) {
          let propertyname = field.propertyName.split(".")[1];
          obj[field.title] = element.broker[propertyname];
        }
        else if (field.title.includes("MarketSheetDays"))
          obj[field.title] = element["availableDays"] + element['holdDays'];
        else if (field.propertyName.includes("availableDays"))
          obj[field.title] = element.availableDays;
        //obj[field.title] = this.utilityService.calculateAvailableDateDiff(element.marketSheetDate, element.holdDays, element.isHold == true ? element.holdDate : null);
        else if (field.propertyName.includes("soldDate"))
          obj[field.title] = this.datepipe.transform(element[field.propertyName], 'dd-MM-yyyy');
        else
          obj[field.title] = element[field.propertyName];
      }
    }
    return obj;
  }

  public async copyToClipboard() {
    this.spinnerService.show();
    let copyData: string[] = [];

    if (this.copyOption == 'selected') {
      if (this.mySelection.length == 0) {
        this.alertDialogService.show('Select at least one stone for copy!');
        this.showCopyOption = false;
        this.spinnerService.hide();
        return;
      }

      copyData = JSON.parse(JSON.stringify(this.mySelection));
    }
    else {
      let data = await this.salesSheetService.getCopyToClipboard(this.inventorySearchCriteriaObj);
      if (data)
        copyData = data;
      else {
        this.spinnerService.hide();
        this.alertDialogService.show('Copt to clipboard not working, Try again later!');
        return;
      }
    }

    if (copyData && copyData.length > 0) {
      let stoneIdString = copyData.join(' ');
      navigator.clipboard.writeText(stoneIdString);
      this.utilityService.showNotification(`Copy to clipboard successfully!`);
      this.showCopyOption = false;
      this.spinnerService.hide();
    }
    else {
      this.alertDialogService.show('No Data Found!');
      this.showCopyOption = false;
      this.spinnerService.hide();
    }
  }
  //#endregion


  public selectedRowChange(e: any) {
    if (this.mySelection.length > 0) {
      var list = this.salesSheetData.filter(c => { return this.mySelection.indexOf(c.stoneId) >= 0 });
      if (list.length > 0) {
        this.selectedCount = list.length;
        this.selectedValue = list.reduce((ty, u) => ty + u.fAmount!, 0);
        this.selectedWeight = list.reduce((ty, u) => ty + u.weight!, 0);
      }
    }
    else {
      this.selectedCount = 0;
      this.selectedWeight = 0;
      this.selectedValue = 0;
    }
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

}

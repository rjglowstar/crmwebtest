import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { PageChangeEvent, SelectAllCheckboxState, SelectableSettings } from '@progress/kendo-angular-grid';
import { DataResult, GroupDescriptor, process, SortDescriptor } from '@progress/kendo-data-query';
import { NgxSpinnerService } from 'ngx-spinner';
import { GridDetailConfig } from 'shared/businessobjects';
import { fxCredential, GridConfig, GridMasterConfig, InclusionConfig, MasterConfig, MasterDNorm, MeasurementConfig } from 'shared/enitites';
import { CommonService, ConfigService, FrontOrderDetailStatus, FrontStoneStatus, listGrainingItems, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { BrokerDNorm, ExportToExcelMailData, OrderDetailFilter, WeightRange } from '../../businessobjects';
import { OrderDetailResponse } from '../../businessobjects/business/orderdetailresponse';
import { OrderDetailSummary } from '../../businessobjects/business/orderdetailsummary';
import { CustomerDNorm, SystemUserDNorm } from '../../entities';
import { BrokerService, CustomerService, GridPropertiesService, InventoryService, MasterConfigService, OrderDetailService, SystemUserService } from '../../services';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-orderdetail',
  templateUrl: './orderdetail.component.html',
  styleUrls: ['./orderdetail.component.css']
})
export class OrderdetailComponent implements OnInit {

  //#region Grid Init
  public sort: SortDescriptor[] = [];
  public groups: GroupDescriptor[] = [];
  public pageSize = 26;
  public skip = 0;
  public fields!: GridDetailConfig[];
  public gridView?: DataResult;
  public isRegSystemUser: boolean = false;
  public filterFlag = true;
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

  //#region search dialog
  public isSearchFilter: boolean = false;
  public listLocation: Array<{ name: string; isChecked: boolean }> = [];
  // public inventorySearchCriteriaObj: OrderDetailFilter = new OrderDetailFilter();
  public stoneId?: "";
  public certificateNo?: "";
  public firstCaratFrom?: number;
  public firstCaratTo?: number;
  public secondCaratFrom?: number;
  public secondCaratTo?: number;
  public thirdCaratFrom?: number;
  public thirdCaratTo?: number;
  public fourthCaratFrom?: number;
  public fourthCaratTo?: number;
  public listKapanItems: Array<{ name: string; isChecked: boolean }> = [];
  public listIGradeItems: Array<{ name: string; isChecked: boolean }> = [];
  public listMGradeItems: Array<{ name: string; isChecked: boolean }> = [];
  public listStatus: Array<{ name: string; isChecked: boolean }> = [];
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
  public listKToS: Array<{ name: string; isChecked: boolean }> = [];
  public listCulet: Array<{ name: string; isChecked: boolean }> = [];
  public listGrainingItems = listGrainingItems;
  public isBGM: boolean = false;
  public selectedCPS?: string;
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
  public excelOption!: string | null;
  public listCustomer: Array<{ name: string; isChecked: boolean }> = [];
  public listCustomerDNormItems: Array<{ name: string; value: string, isChecked: boolean }> = [];
  public customerItems: CustomerDNorm[] = new Array<CustomerDNorm>();
  public selectedCustomer: string[] = [];
  public OrderDetailobj = new OrderDetailResponse()
  public listBroker: Array<{ name: string; isChecked: boolean }> = [];
  public listBrokerDNormItems: Array<{ name: string; value: string, isChecked: boolean }> = [];
  public brokerItems: BrokerDNorm[] = new Array<BrokerDNorm>();
  public selectedBroker: string[] = [];

  public listSeller: Array<{ name: string; isChecked: boolean }> = [];
  public listSellerDNormItems: Array<{ name: string; value: string, isChecked: boolean }> = [];
  public sellerItems: SystemUserDNorm[] = new Array<SystemUserDNorm>();
  public selectedSeller: string[] = [];
  //#endregion

  //#region Grid Config
  public isGridConfig: boolean = false;
  public gridConfig!: GridConfig;
  public gridMasterConfigResponse!: GridMasterConfig;
  //#endregion

  public fxCredentials?: fxCredential;
  public isAdminRole = false;
  public isSendMail = false;
  public exportToExcelMailObj: ExportToExcelMailData = new ExportToExcelMailData();
  public excelFile: any[] = [];
  public orderDetailItems: OrderDetailResponse[] = new Array<OrderDetailResponse>();
  public orderDetailSummary: OrderDetailSummary = new OrderDetailSummary();
  public orderDetailFilter: OrderDetailFilter = new OrderDetailFilter();
  public FinalAMt: number = 0;
  public orderDetailSelected: OrderDetailResponse[] = [];
  public isSelectAll: boolean = false;

  constructor(private gridPropertiesService: GridPropertiesService,
    private configService: ConfigService,
    private spinnerService: NgxSpinnerService,
    private alertDialogService: AlertdialogService,
    public utilityService: UtilityService,
    private orderDetailService: OrderDetailService,
    private commonService: CommonService,
    private masterConfigService: MasterConfigService,
    private changeDetRef: ChangeDetectorRef,
    private inventoryService: InventoryService,
    private customerService: CustomerService,
    private brokerService: BrokerService,
    private systemUserService: SystemUserService,
    private datepipe: DatePipe
  ) { }

  async ngOnInit() {
    await this.defaultMethodsLoad();
  }

  public async defaultMethodsLoad() {
    this.fxCredentials = JSON.parse(sessionStorage.getItem("fxCredentials") ?? '') as fxCredential;
    if (this.fxCredentials?.origin == 'Admin')
      this.isAdminRole = true;

    this.spinnerService.show();
    await this.getGridConfiguration();
    await this.getMasterConfigData();
    await this.getOrderDetailSummary();
    await this.getOrderDetailData();
    this.spinnerService.hide();
  }

  public async getGridConfiguration() {
    try {
      this.gridConfig = await this.configService.getGridConfig(this.fxCredentials?.id ?? '', "OrderDetail", "OrderDetailGrid", this.gridPropertiesService.getOrderDetailGrid());
      if (this.gridConfig && this.gridConfig.id != '') {
        let dbObj: GridDetailConfig[] = this.gridConfig.gridDetail;
        if (dbObj && dbObj.some(c => c.isSelected)) {
          this.fields = dbObj;
          const doNotSortItem = this.fields.filter(item => item.propertyName == "checkbox");
          const remainingItems = this.fields.filter(item => item.propertyName !== null && item.propertyName != "checkbox");

          remainingItems.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
          this.fields = [...doNotSortItem, ...remainingItems];
        }
        else
          this.fields.forEach(c => c.isSelected = true);
      }
      else {
        this.gridMasterConfigResponse = await this.configService.getMasterGridConfig("OrderDetail", "OrderDetailGrid");
        if (this.gridMasterConfigResponse)
          this.fields = this.gridMasterConfigResponse.gridDetail;
        else
          this.fields = await this.gridPropertiesService.getOrderDetailGrid();
      }
    }
    catch (error: any) {
      this.alertDialogService.show(error);
      this.spinnerService.hide();
    }
  }

  //#region Master Config Data
  public async getMasterConfigData() {
    //Status
    Object.values(FrontOrderDetailStatus).forEach(z => { this.listStatus.push({ name: z.toString(), isChecked: false }); });

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

    let kapanItems = await this.inventoryService.getOrgKapanList();
    kapanItems.forEach(z => { this.listKapanItems.push({ name: z, isChecked: false }); });

    let iGradeItems = await this.inventoryService.getOrgIGradeList();
    iGradeItems.forEach(z => { this.listIGradeItems.push({ name: z, isChecked: false }); });

    let mGradeItems = await this.inventoryService.getOrgMGradeList();
    mGradeItems.forEach(z => { this.listMGradeItems.push({ name: z, isChecked: false }); });

    this.getCustomerData();
    this.getBrokerData();
    this.getSellerData();
    if (!this.listLocation || this.listLocation.length <= 0)
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

  public async exportToExcel() {

    if (this.mySelection.length == 0) {
      this.alertDialogService.show('Select at least one stone for export!');
      return;
    }

    this.excelFile = [];
    this.spinnerService.show();
    let exportData: OrderDetailResponse[] = [];

    if (this.orderDetailSelected) {
      exportData = this.orderDetailSelected.filter(x => this.mySelection.includes(x.stoneId))
      if (exportData.length == 0) {
        exportData = this.orderDetailItems
      }
    }
    else {
      this.spinnerService.hide();
      this.alertDialogService.show('Export to excel not working, Try again later!');
      return;
    }

    if (exportData && exportData.length > 0) {
      exportData.forEach(element => {
        var excel = this.convertArrayToObject(this.fields, element);
        this.excelFile.push(excel);
      });

      if (this.excelFile.length > 0) {
        let isExport: boolean = this.utilityService.exportAsExcelFile(this.excelFile, "Order_detail");
        if (isExport) {
          this.excelOption = null;
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
    var obj: any = {};
    for (let i = 0; i < fields.length; i++) {
      let field = fields[i];
      if (!(field.title == "Checkbox")) {
        if (field.title == "leadNo") {
          let propertyname = field.propertyName;
          obj[field.title] = element[propertyname];
        }
        else if (field.title == "Stone Id") {
          let propertyname = field.propertyName.split(".")[1];
          obj[field.title] = element.leadInventoryItems[propertyname];
        }
        else if (field.title == "Shape") {
          let propertyname = field.propertyName.split(".")[1];
          obj[field.title] = element.leadInventoryItems[propertyname];
        }
        else if (field.title == "Weight") {
          let propertyname = field.propertyName.split(".")[1];
          obj[field.title] = element.leadInventoryItems[propertyname];
        }
        else if (field.title == "Color") {
          let propertyname = field.propertyName.split(".")[1];
          obj[field.title] = element.leadInventoryItems[propertyname];
        }
        else if (field.title == "Clarity") {
          let propertyname = field.propertyName.split(".")[1];
          obj[field.title] = element.leadInventoryItems[propertyname];
        }
        else if (field.title == "Cut") {
          let propertyname = field.propertyName.split(".")[1];
          obj[field.title] = element.leadInventoryItems[propertyname];
        }
        else if (field.title == "Polish") {
          let propertyname = field.propertyName.split(".")[1];
          obj[field.title] = element.leadInventoryItems[propertyname];
        }
        else if (field.title == "Symmetry") {
          let propertyname = field.propertyName.split(".")[1];
          obj[field.title] = element.leadInventoryItems[propertyname];
        }
        else if (field.title == "Fluorescence") {
          let propertyname = field.propertyName.split(".")[1];
          obj[field.title] = element.leadInventoryItems[propertyname];
        }
        else if (field.title.includes("Diameter")) {
          let propertyname = field.propertyName.split(".")[1];
          obj[field.title] = element.leadInventoryItems[propertyname];
        }
        else if (field.title == "Lab") {
          let propertyname = field.propertyName.split(".")[1];
          obj[field.title] = element.leadInventoryItems[propertyname];
        }
        else if (field.title == "Certificate No") {
          let propertyname = field.propertyName.split(".")[1];
          obj[field.title] = element.leadInventoryItems[propertyname];
        }
        else if (field.title == "Rap" || field.title == "M.Disc") {
          let propertyname = field.propertyName.split(".")[2];
          obj[field.title] = element.leadInventoryItems.price[propertyname];
        }
        else if (field.title == "Net Amt") {
          let propertyname = field.propertyName.split(".")[1];
          obj[field.title] = element.leadInventoryItems[propertyname];
        }
        else if (field.title == "VOW.Disc") {
          let propertyname = field.propertyName.split(".")[1];
          obj[field.title] = element.leadInventoryItems[propertyname];
        }
        else if (field.title == "B.Net Amt") {
          let propertyname = field.propertyName.split(".")[1];
          obj[field.title] = element.leadInventoryItems[propertyname];
        }
        else if (field.title == "Party") {
          let propertyname = field.propertyName.split(".")[1];
          obj[field.title] = element.customer[propertyname];
        }
        else if (field.title == "Location") {
          let propertyname = field.propertyName;
          obj[field.title] = element[propertyname];
        }
        else if (field.propertyName.includes("orderDate"))
          obj[field.title] = this.datepipe.transform(element[field.propertyName], 'dd-MM-yyyy');
      }

    }
    return obj;

  }

  private async getCustomerData() {
    try {
      let customers: CustomerDNorm[] = await this.customerService.getAllCustomerDNormsByName('');
      this.listCustomerDNormItems = [];
      this.customerItems = customers;
      this.customerItems.reverse().forEach(z => { this.listCustomerDNormItems.push({ name: z.companyName, value: z.id, isChecked: false }); });
    }
    catch (error: any) {
      this.alertDialogService.show(error.error);
    }
  }

  private async getBrokerData() {
    try {
      let brokers: BrokerDNorm[] = await this.brokerService.getAllBrokerDNorms();
      this.listBrokerDNormItems = [];
      this.brokerItems = brokers;
      this.brokerItems.reverse().forEach(z => { this.listBrokerDNormItems.push({ name: z.name, value: z.id, isChecked: false }); });
    }
    catch (error: any) {
      this.alertDialogService.show(error.error);
    }
  }

  private async getSellerData() {
    try {
      let sellers: SystemUserDNorm[] = await this.systemUserService.getSystemUserDNormAsync();
      this.listSellerDNormItems = [];
      this.sellerItems = sellers;
      this.sellerItems.reverse().forEach(z => { this.listSellerDNormItems.push({ name: z.name, value: z.id, isChecked: false }); });
    }
    catch (error: any) {
      this.alertDialogService.show(error.error);
    }
  }
  //#endregion

  public async getOrderDetailSummary() {
    try {
      if (this.fxCredentials?.origin == "Seller") {
        this.orderDetailFilter.sellerId = this.fxCredentials.id;
      }
      this.orderDetailSummary = await this.orderDetailService.getOrderDetailSummary(this.orderDetailFilter);
    }
    catch (error: any) {
      this.alertDialogService.show(error);
      this.spinnerService.hide();
    }
  }

  public async getOrderDetailData() {
    try {
      this.spinnerService.show();
      if (this.fxCredentials?.origin == "Seller") {
        this.orderDetailFilter.sellerId = this.fxCredentials.id;
      }
        let res = await this.orderDetailService.getOrderDetails(this.skip, this.pageSize, this.orderDetailFilter);
        if (res) {
          this.orderDetailItems = res;
          this.gridView = process(res, { group: this.groups, sort: this.sort });
          this.gridView.total = this.orderDetailSummary.totalRecord;
          this.spinnerService.hide();
        }
        else
          this.spinnerService.hide();
    }
    catch (error: any) {
      this.alertDialogService.show(error);
      this.spinnerService.hide();
    }
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

  public openSendMailDialog(): void {
    this.isSendMail = true;
  }

  public closeSendMailDialog(): void {
    this.isSendMail = false;
    this.clearSendMail();
  }

  public clearSendMail(): void {
    this.exportToExcelMailObj = new ExportToExcelMailData();
  }

  //#region Summary
  public isSummary = false;
  public openSummary(): void {
    this.isSummary = true;
  }

  public closeSummary(): void {
    this.isSummary = false;
  }
  //#endregion

  public openSearchDialog(): void {
    this.isSearchFilter = true;

    //show checked location if change from summary filter
    this.onMultiSelectChange(this.listLocation, this.orderDetailFilter.location);
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
    this.orderDetailFilter.weightRanges = weightRanges;
    this.orderDetailFilter.stoneIds = this.stoneId ? this.utilityService.CheckStoneIds(this.stoneId).map(x => x.toUpperCase()) : [];
    this.orderDetailFilter.certificateNos = this.certificateNo ? this.utilityService.checkCertificateIds(this.certificateNo) : [];

    let fData = this.orderDetailFilter.startDate;
    this.orderDetailFilter.startDate = fData ? this.utilityService.setUTCDateFilter(fData) : null;

    let tData = this.orderDetailFilter.endDate;
    this.orderDetailFilter.endDate = tData ? this.utilityService.setUTCDateFilter(tData) : null;
  }

  public async filterBySearch() {
    this.skip = 0;
    this.mySelection = [];
    this.FinalAMt = 0;
    this.spinnerService.show();
    this.assignAdditionalData();
    await this.getOrderDetailSummary();
    await this.getOrderDetailData();
    this.isSearchFilter = false;
    this.spinnerService.hide();
  }

  public clearSearchCriteria(): void {
    this.orderDetailFilter = new OrderDetailFilter();
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
    this.selectedCustomer = [];
    this.selectedBroker = [];
    this.selectedSeller = [];
    this.listCustomerDNormItems.forEach(z => { z.isChecked = false });
    this.listBrokerDNormItems.forEach(z => { z.isChecked = false });
    this.listSellerDNormItems.forEach(z => { z.isChecked = false });
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

  public checkCPS(type?: string) {
    if (type == 'BGM') {
      var NoMilkyData = this.inclusionData.filter(item => item.type.toLowerCase().indexOf('milky') !== -1).find(z => z.name.toLowerCase() == 'no');
      var checkMilky = this.orderDetailFilter.milky.indexOf(NoMilkyData?.name ?? 'NO');

      var NoGreenData = this.inclusionData.filter(item => item.type.toLowerCase().indexOf('green') !== -1).find(z => z.name.toLowerCase() == 'no');
      var checkGreen = this.orderDetailFilter.green.indexOf(NoGreenData?.name ?? 'NO');

      let BrownData = this.inclusionData.filter(item => item.type.toLowerCase().indexOf('brown') !== -1).find(z => z.name.toLowerCase() == 'no');
      var checkBrown = this.orderDetailFilter.brown.indexOf(BrownData?.name ?? 'NO');

      if (checkMilky > -1 && checkGreen > -1 && checkBrown > -1)
        this.isBGM = true;
      else
        this.isBGM = false;
    }
    else {
      var ExData = this.allTheCPS?.find(z => z.name.toLowerCase() == 'ex');
      var VGData = this.allTheCPS?.find(z => z.name.toLowerCase() == 'vg');

      var checkCutEX = this.orderDetailFilter.cut.indexOf(ExData?.name ?? 'EX');
      var checkPolishEX = this.orderDetailFilter.polish.indexOf(ExData?.name ?? 'EX');
      var checkSymmEX = this.orderDetailFilter.symm.indexOf(ExData?.name ?? 'EX');

      var checkCutVG = this.orderDetailFilter.cut.indexOf(VGData?.name ?? 'VG');
      var checkPolishVG = this.orderDetailFilter.polish.indexOf(VGData?.name ?? 'VG');
      var checkSymmVG = this.orderDetailFilter.symm.indexOf(VGData?.name ?? 'VG');

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
      this.orderDetailFilter.cut = [];
      this.orderDetailFilter.cut.push(ExData?.name ?? 'EX');

      this.orderDetailFilter.polish = [];
      this.orderDetailFilter.polish.push(ExData?.name ?? 'EX');

      this.orderDetailFilter.symm = [];
      this.orderDetailFilter.symm.push(ExData?.name ?? 'EX');
    }
    else if (type == '2EX') {
      var ExData = this.allTheCPS?.find(z => z.name.toLowerCase() == 'ex');
      this.orderDetailFilter.cut = [];
      this.orderDetailFilter.cut.push(ExData?.name ?? 'EX');

      this.orderDetailFilter.polish = [];
      this.orderDetailFilter.polish.push(ExData?.name ?? 'EX');

      this.orderDetailFilter.symm = [];
    }
    else if (type == '3VG') {
      var ExData = this.allTheCPS?.find(z => z.name.toLowerCase() == 'ex');
      var VGData = this.allTheCPS?.find(z => z.name.toLowerCase() == 'vg');

      this.orderDetailFilter.cut = [];
      this.orderDetailFilter.cut.push(ExData?.name ?? 'EX');
      this.orderDetailFilter.cut.push(VGData?.name ?? 'VG');

      this.orderDetailFilter.polish = [];
      this.orderDetailFilter.polish.push(ExData?.name ?? 'EX');
      this.orderDetailFilter.polish.push(VGData?.name ?? 'VG');

      this.orderDetailFilter.symm = [];
      this.orderDetailFilter.symm.push(ExData?.name ?? 'EX');
      this.orderDetailFilter.symm.push(VGData?.name ?? 'VG');
    }
    else if (type == 'Clear') {
      this.orderDetailFilter.cut = [];
      this.orderDetailFilter.polish = [];
      this.orderDetailFilter.symm = [];
    }
    else if (type == 'BGM') {
      if (this.isBGM) {
        this.orderDetailFilter.green = [];
        this.orderDetailFilter.brown = [];
        this.orderDetailFilter.milky = [];
        this.isBGM = false;
      }
      else {
        this.isBGM = true;

        const inclusions = [...this.inclusionData];
        let BrownData = inclusions.filter(item => item.type.toLowerCase().indexOf('brown') !== -1);
        var NoBrownData = BrownData.find(z => z.name.toLowerCase() == 'no');
        this.orderDetailFilter.brown = [];
        this.orderDetailFilter.brown.push(NoBrownData?.name ?? 'NO');

        var NoGreenData = inclusions.filter(item => item.type.toLowerCase().indexOf('green') !== -1).find(z => z.name.toLowerCase() == 'no');
        this.orderDetailFilter.green = [];
        this.orderDetailFilter.green.push(NoGreenData?.name ?? 'NO');

        var NoMilkyData = inclusions.filter(item => item.type.toLowerCase().indexOf('milky') !== -1).find(z => z.name.toLowerCase() == 'no');
        this.orderDetailFilter.milky = [];
        this.orderDetailFilter.milky.push(NoMilkyData?.name ?? 'NO');
      }
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

  public onMultiSelectCustChange(val: Array<{ value: string, name: string; isChecked: boolean }>, selectedData: string[]): void {
    val.forEach(element => {
      element.isChecked = false;
    });

    if (selectedData && selectedData.length > 0) {
      val.forEach(element => {
        selectedData.forEach(item => {
          if (element.value.toLocaleLowerCase() == item.toLocaleLowerCase())
            element.isChecked = true;
        });
      });
    }
  }

  public customerValueChange(val: string[]) {
    if (val && val.length > 0)
      this.selectedCustomer = this.listCustomerDNormItems.filter(c => val.includes(c.value) && c.isChecked).map(d => d.name);
  }

  public brokerValueChange(val: string[]) {
    if (val && val.length > 0)
      this.selectedBroker = this.listBrokerDNormItems.filter(c => val.includes(c.value) && c.isChecked).map(d => d.name);
  }

  public sellerValueChange(val: string[]) {
    if (val && val.length > 0)
      this.selectedSeller = this.listSellerDNormItems.filter(c => val.includes(c.value) && c.isChecked).map(d => d.name);
  }

  public closeSearchDialog(): void {
    this.isSearchFilter = false;
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
      this.exportToExcelMailObj.systemUserId = this.fxCredentials?.id ?? '';

      let fileName = "Diamond_Excel";
      // this.exportToExcelMailObj.excelBase64String = this.utilityService.exportAsExcelFileBase64(this.excelFile);;
      // this.exportToExcelMailObj.excelFileName = this.utilityService.exportFileName(fileName);
      // this.exportToExcelMailObj.excelMediaType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

      // let res = await this.inventoryService.ExportToExcelMail(this.exportToExcelMailObj);
      // if (res && res.isSuccess) {
      //   this.utilityService.showNotification(res.message);
      //   this.closeSendMailDialog();
      // }
      // else {
      //   console.error(res);
      //   if (res) {
      //     this.alertDialogService.show(res.message);
      //   }
      //   else
      //     this.alertDialogService.show("Something went wrong, Try again later");
      // }
      this.spinnerService.hide();
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

  //#region Select All
  public async selectAllInventories(event: SelectAllCheckboxState) {
    this.mySelection = [];
    this.isSelectAll = false
    if (event.toLowerCase() == 'checked') {
      if (this.orderDetailSummary.totalRecord > this.pageSize) {
        if (!this.orderDetailItems || this.orderDetailItems.length != this.orderDetailSummary.totalRecord) {
          try {
            this.spinnerService.show();
            this.orderDetailItems = await this.orderDetailService.getOrderDetailsForFilter(this.orderDetailFilter);
            this.orderDetailSelected = this.orderDetailItems;
            this.isSelectAll = true;
            this.spinnerService.hide();
          } catch (error: any) {
            console.error(error);
            this.spinnerService.hide();
            this.alertDialogService.show('Select all stone fail, Please contact administrator!');
          }
        }
        if (this.orderDetailItems && this.orderDetailItems.length > 0) {
          this.mySelection = this.orderDetailItems.map(z => z.leadInventoryItems.stoneId);
          this.changeDetRef.detectChanges();
        }
        else
          this.spinnerService.hide();
        this.getSelectFAmt();
      }
      else
        this.mySelection = this.orderDetailItems.map(z => z.leadInventoryItems.stoneId);
    }
    else {
      this.mySelection = [];
      this.FinalAMt = 0;
      this.orderDetailSelected = [];
    }
  }
  //#endregion
  public async getSelectFAmt() {
    try {
      if (this.mySelection.length > 0) {
        this.spinnerService.show();
        let res = await this.orderDetailService.getOrderDetailsForFilter(this.orderDetailFilter)
        this.spinnerService.hide();
        if (res) {
          var amt = res.filter(x => this.mySelection.includes(x.leadInventoryItems.stoneId)).map(x => x.leadInventoryItems.fAmount);
          this.FinalAMt = amt.length > 0 ? amt.reduce((accumulator, currentValue) => accumulator + currentValue, 0) : 0;
          this.orderDetailSelected = res;
        }
      } else {
        this.FinalAMt = 0;
      }
    }
    catch (err: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(err);
    }
  }

  public selectedRowChange(data: any) {
    this.getSelectFAmt();
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

  public onRowCheckboxChange(e: any, data: any) {
    this.getSelectFAmt();
  }

  public pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.getOrderDetailSummary();
    this.getOrderDetailData();
  }

  public groupChange(groups: GroupDescriptor[]): void {
    try {
      this.groups = groups;
      // this.initInventoryData();
    }
    catch (error: any) {
      this.alertDialogService.show(error.error);
    }
  }

  public sortChange(sort: SortDescriptor[]): void {
    this.sort = sort;
    // this.initInventoryData();
  }

  public async copyToClipboard() {
    try {
      this.spinnerService.show();
      var certifcatenos = this.orderDetailSelected.filter(x => this.mySelection.includes(x.stoneId)).map(x => x.leadInventoryItems.certificateNo);
      if (certifcatenos) {
        let stoneIdString = certifcatenos.join(' ');
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
}

import { ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { PageChangeEvent, SelectableSettings, SelectAllCheckboxState } from '@progress/kendo-angular-grid';
import { Align } from '@progress/kendo-angular-popup';
import { DataResult, GroupDescriptor, process, SortDescriptor } from '@progress/kendo-data-query';
import { environment } from 'environments/environment';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { SortFieldDescriptor } from 'projects/CRM.BackOffice/src/app/businessobjects';
import { GridDetailConfig } from 'shared/businessobjects';
import { GridConfig, GridMasterConfig, InclusionConfig, MasterConfig, MasterDNorm, MeasurementConfig } from 'shared/enitites';
import { ConfigService, FrontStoneStatus, LeadStatus, listGrainingItems, StoneStatus, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { CustLookUp, ExportToExcelMailData, InventorySearchCriteria, InventorySelectAllItems, InventorySummary, WeightRange } from '../../businessobjects';
import { CustomerDNorm, ExpoInvItem, ExpoRequests, fxCredential, InventoryItems, InvItem, Supplier, SupplierDNorm, SystemUser, SystemUserDNorm } from '../../entities';
import { CustomerService, ExpoRequestService, GridPropertiesService, InventoryService, LeadService, MasterConfigService, SupplierService, SystemUserService } from '../../services';
import { ExpoTicketService } from '../../services/inventory/expoticket.service';

@Component({
  selector: 'app-expoinventory',
  templateUrl: './expoinventory.component.html',
  styleUrls: ['./expoinventory.component.css']
})
export class ExpoInventoryComponent implements OnInit {

  //#region Grid Init
  public sort: SortDescriptor[] = [];
  public groups: GroupDescriptor[] = [];
  public pageSize = 26;
  public skip = 0;
  public fields!: GridDetailConfig[];
  public invFields!: GridDetailConfig[];
  public gridView?: DataResult;
  public isRegSystemUser: boolean = false;
  public filterFlag = true;
  public generatedCode!: string;
  public selectableSettings: SelectableSettings = {
    mode: 'multiple',
  };
  public invSelectableSettings: SelectableSettings = {
    mode: 'multiple', checkboxOnly: true
  };
  public skeletonArray = new Array(18);
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
  public inventoryObj: InventoryItems = new InventoryItems();
  public invSummary: InventorySummary = new InventorySummary();
  public supplierDNormItems!: SupplierDNorm[];
  public selectedSupplierDNormItems?: { text: string, value: string };
  public systemUserItems!: SystemUser[];
  public selectedEmpItems?: { text: string, value: string };
  public selectedCustomer?: { text: string, value: string };
  public selectedCPS?: string;
  public isBGM: boolean = false;
  public listSupplierDNormItems: Array<{ name: string; value: string; isChecked: boolean }> = [];
  public listBranchDNormItems: Array<{ text: string; value: string }> = [];
  public listDepartmentItems: Array<{ text: string; value: string }> = [];
  public listEmpItems: Array<{ text: string; value: string }> = [];
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
  public listLeadStatus: Array<{ name: string; isChecked: boolean }> = [];
  public listKToS: Array<{ name: string; isChecked: boolean }> = [];
  public listCulet: Array<{ name: string; isChecked: boolean }> = [];
  public listLocation: Array<{ name: string; isChecked: boolean }> = [];
  public listGrainingItems = listGrainingItems;
  public listKapanItems: Array<{ name: string; isChecked: boolean }> = [];
  public listIGradeItems: Array<{ name: string; isChecked: boolean }> = [];
  public listMGradeItems: Array<{ name: string; isChecked: boolean }> = [];
  public inventoryItems: InventoryItems[] = [];
  public allInventoryItems: InventorySelectAllItems[] = [];
  public inventorySearchCriteriaObj: InventorySearchCriteria = new InventorySearchCriteria();
  public tempInventorySearchCriteriaObj: InventorySearchCriteria = new InventorySearchCriteria();
  public fxCredentials?: fxCredential;
  public exportToExcelMailObj: ExportToExcelMailData = new ExportToExcelMailData();
  public customer: CustLookUp[] = [];
  public listCustomer: Array<{ text: string; value: string }> = [];
  public suppliers: Supplier[] = [];
  public reqInventories: InventoryItems[] = [];
  public expoRemark: string = "";
  //#endregion

  //#region Model Flag
  public isEditInventory: boolean = false;
  public isSearchFilter: boolean = false;
  public isShowMedia: boolean = false;
  public isFormValid: boolean = false;
  public showExcelOption = false;
  public isSendMail = false;
  public isAdminRole = false;
  public isAddExpoRequest = false;
  public isExpoRemark: boolean = false;

  @ViewChild("anchor") public anchor!: ElementRef;
  @ViewChild("popup", { read: ElementRef }) public popup!: ElementRef;
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
  public excelOption!: string | null;
  public anchorAlign: Align = { horizontal: "right", vertical: "bottom" };
  public popupAlign: Align = { horizontal: "center", vertical: "top" };
  public excelFile: any[] = [];
  public isLeadModal: boolean = false;
  public leadListInvInput: InvItem[] = [];
  public sellerObj = new SystemUserDNorm();
  public basesixtyfour: any;
  public exportData: InventoryItems[] = [];
  public isCanHoldInventory: boolean = false;
  public isCanReleaseHoldInventory: boolean = false;
  public isCanRapnetHoldInventory: boolean = false;
  public isCanRapnetReleaseHoldInventory: boolean = false;
  public isCanDeleteInventory: boolean = false;

  public selectAllState: SelectAllCheckboxState = 'unchecked';
  public isFirstTimeLoad = true;

  public aDiscount!: number;
  //#endregion

  constructor(
    private inventoryService: InventoryService,
    private alertDialogService: AlertdialogService,
    public utilityService: UtilityService,
    private masterConfigService: MasterConfigService,
    private supplierService: SupplierService,
    private spinnerService: NgxSpinnerService,
    private systemUserService: SystemUserService,
    private gridPropertiesService: GridPropertiesService,
    private configService: ConfigService,
    private sanitizer: DomSanitizer,
    private changeDetRef: ChangeDetectorRef,
    private customerService: CustomerService,
    private leadService: LeadService,
    private expoRequestService: ExpoRequestService,
    private expoTicketService: ExpoTicketService,
  ) { }

  public async ngOnInit() {
    await this.defaultMethodsLoad();
  }

  //#region Init Data
  public async defaultMethodsLoad() {
    this.fxCredentials = JSON.parse(sessionStorage.getItem("fxCredentials") ?? '') as fxCredential;
    if (this.fxCredentials?.origin == 'Admin')
      this.isAdminRole = true;

    this.spinnerService.show();
    this.sellerObj = await this.leadService.getSellerDNormById(this.fxCredentials.id);

    //Status
    Object.values(FrontStoneStatus).forEach(z => { this.listStatus.push({ name: z.toString(), isChecked: false }); });
    this.inventorySearchCriteriaObj.status.push(StoneStatus.Stock.toString());
    this.inventorySearchCriteriaObj.status.push(StoneStatus.Transit.toString());
    this.utilityService.onMultiSelectChange(this.listStatus, this.inventorySearchCriteriaObj.status);

    //Lead Status
    Object.values(LeadStatus).forEach(z => { if (z != LeadStatus.Qualification.toString()) this.listLeadStatus.push({ name: z.toString(), isChecked: false }); });
    this.inventorySearchCriteriaObj.leadStatus.push(LeadStatus.Proposal.toString());
    this.utilityService.onMultiSelectChange(this.listLeadStatus, this.inventorySearchCriteriaObj.leadStatus);

    await this.getGridConfiguration();
    await this.initInventoryData();

    this.getSummaryData();
    this.getSupplierDetail();
  }

  public async getGridConfiguration() {
    try {
      this.gridConfig = await this.configService.getGridConfig(this.fxCredentials?.id ?? '', "ExpoInventory", "ExpoInventoryGrid", this.gridPropertiesService.getInventoryGrid());
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
        this.gridMasterConfigResponse = await this.configService.getMasterGridConfig("ExpoInventory", "ExpoInventoryGrid");
        if (this.gridMasterConfigResponse)
          this.fields = this.gridMasterConfigResponse.gridDetail;
        else
          this.fields = await this.gridPropertiesService.getInventoryGrid();
      }

      this.invFields = this.gridPropertiesService.getExpoTicketRequestInvListGrid();
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
      // this.inventorySearchCriteriaObj.leadStatus = [LeadStatus.Proposal.toString()];
      this.inventorySearchCriteriaObj.isInExpo = true;
      this.inventorySearchCriteriaObj.selectedStones = this.mySelection;
      this.invSummary = await this.inventoryService.getInvSummaryBySearch(this.inventorySearchCriteriaObj);
      this.gridView = process(this.inventoryItems, { group: this.groups, sort: this.sort });
      this.gridView.total = this.invSummary.totalCount;
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async initInventoryData() {
    try {
      this.spinnerService.show();
      // this.inventorySearchCriteriaObj.leadStatus = [LeadStatus.Proposal.toString()];
      this.inventorySearchCriteriaObj.isInExpo = true;
      this.inventorySearchCriteriaObj.selectedStones = this.mySelection;
      let res = await this.inventoryService.getInventoryItemsBySearch(this.inventorySearchCriteriaObj, this.skip, this.pageSize);
      if (res) {
        this.inventoryItems = res;
        this.inventoryItems.forEach(z => {
          let index = this.allInventoryItems.findIndex(a => a.stoneId == z.stoneId);
          if (index == -1)
            this.allInventoryItems.push({ id: z.id, stoneId: z.stoneId, certificateNo: z.certificateNo, status: z.status });
        });
        this.gridView = process(res, { group: this.groups, sort: this.sort });
        this.gridView.total = this.invSummary.totalCount;

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

  public async getCustomerData() {
    try {
      if (!this.listCustomer || this.listCustomer.length <= 0) {
        let customer = await this.customerService.getAllCustomers();
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

  //#region Org, Emp Data
  private async getSupplierDNormData() {
    try {
      if (!this.supplierDNormItems) {
        this.supplierDNormItems = await this.supplierService.getSupplierDNorm();
        this.supplierDNormItems.forEach(z => { this.listSupplierDNormItems.push({ name: z.name, value: z.id, isChecked: false }) });
      }
    }
    catch (error: any) {
      console.error(error);
      this.alertDialogService.show(error.error);
    }
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


  public async getSystemUserData() {
    try {
      this.systemUserItems = await this.systemUserService.getAllSystemUsers();
      this.systemUserItems.forEach((z) => { this.listEmpItems.push({ text: z.fullName, value: z.id }); });
    }
    catch (error: any) {
      this.alertDialogService.show(error.error);
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

    if (!this.listKapanItems || this.listKapanItems.length <= 0) {
      let kapanItems = await this.inventoryService.getOrgKapanList();
      kapanItems.forEach(z => { this.listKapanItems.push({ name: z, isChecked: false }); });
    }

    if (!this.listIGradeItems || this.listIGradeItems.length <= 0) {
      let iGradeItems = await this.inventoryService.getOrgIGradeList();
      iGradeItems.forEach(z => { this.listIGradeItems.push({ name: z, isChecked: false }); });
    }

    if (!this.listMGradeItems || this.listMGradeItems.length <= 0) {
      let mGradeItems = await this.inventoryService.getOrgMGradeList();
      mGradeItems.forEach(z => { this.listMGradeItems.push({ name: z, isChecked: false }); });
    }

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
    this.inventorySearchCriteriaObj.weightRanges = weightRanges;
    this.inventorySearchCriteriaObj.stoneIds = this.stoneId ? this.utilityService.CheckStoneIds(this.stoneId).map(x => x.toUpperCase()) : [];
    this.inventorySearchCriteriaObj.certificateNos = this.certificateNo ? this.utilityService.checkCertificateIds(this.certificateNo) : [];

    let fData = this.inventorySearchCriteriaObj.fromDate;
    this.inventorySearchCriteriaObj.fromDate = fData ? this.utilityService.setUTCDateFilter(fData) : null;

    let tData = this.inventorySearchCriteriaObj.toDate;
    this.inventorySearchCriteriaObj.toDate = tData ? this.utilityService.setUTCDateFilter(tData) : null;
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

  public tagMapper(tags: string[]): void {
    // This function is used for hide selected items in multiselect box
  }

  public selectedRowChange(e: any) {
    this.inventoryObj = new InventoryItems();
    if (this.mySelection != null && this.mySelection.length > 0) {
      var selectedInv = this.inventoryItems.find(z => z.id == this.mySelection[0]);
      let value: InventoryItems = JSON.parse(JSON.stringify(selectedInv));
      value.labSendDate = this.getValidDate(value.labSendDate);
      value.labReceiveDate = this.getValidDate(value.labReceiveDate);
      value.marketSheetDate = this.getValidDate(value.marketSheetDate);
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

    this.inventorySearchCriteriaObj.sortFieldDescriptors = new Array<SortFieldDescriptor>();

    if (this.sort && this.sort.length > 0) {
      let properties = this.gridPropertiesService.getInventoryGrid();
      for (let index = 0; index < this.sort.length; index++) {
        let sortFieldDescriptor = new SortFieldDescriptor();
        const element = this.sort[index];
        sortFieldDescriptor.dir = element.dir;
        sortFieldDescriptor.field = properties.find(x => x.propertyName == element.field)?.sortFieldName ?? "";
        this.inventorySearchCriteriaObj.sortFieldDescriptors.push(sortFieldDescriptor);
      }
    }

    this.initInventoryData();
  }

  public pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.initInventoryData();
  }

  public calculateRapPricing() {
    let rap = this.inventoryObj.basePrice.rap;
    let disc = this.inventoryObj.basePrice.discount;
    if (rap && disc) {
      if (disc.toString() != '-') {

        disc = parseFloat(disc.toString());
        let weight = this.inventoryObj.weight;
        let stoneRap = weight * rap;
        let calDiscount = 100 + disc;
        let netAmount = (calDiscount * stoneRap) / 100;

        this.inventoryObj.basePrice.netAmount = this.utilityService.ConvertToFloatWithDecimal(netAmount);
        let perCarat = netAmount / weight;
        this.inventoryObj.basePrice.perCarat = this.utilityService.ConvertToFloatWithDecimal(perCarat);
      }
    }
  }

  public checkCPS(type?: string) {
    if (type == 'BGM') {
      var NoMilkyData = this.inclusionData.filter(item => item.type.toLowerCase().indexOf('milky') !== -1).find(z => z.name.toLowerCase() == 'no');
      var checkMilky = this.inventorySearchCriteriaObj.milky.indexOf(NoMilkyData?.name ?? 'NO');

      var NoGreenData = this.inclusionData.filter(item => item.type.toLowerCase().indexOf('green') !== -1).find(z => z.name.toLowerCase() == 'no');
      var checkGreen = this.inventorySearchCriteriaObj.green.indexOf(NoGreenData?.name ?? 'NO');

      let BrownData = this.inclusionData.filter(item => item.type.toLowerCase().indexOf('brown') !== -1).find(z => z.name.toLowerCase() == 'no');
      var checkBrown = this.inventorySearchCriteriaObj.brown.indexOf(BrownData?.name ?? 'NO');

      if (checkMilky > -1 && checkGreen > -1 && checkBrown > -1)
        this.isBGM = true;
      else
        this.isBGM = false;
    }
    else {
      var ExData = this.allTheCPS?.find(z => z.name.toLowerCase() == 'ex');
      var VGData = this.allTheCPS?.find(z => z.name.toLowerCase() == 'vg');

      var checkCutEX = this.inventorySearchCriteriaObj.cut.indexOf(ExData?.name ?? 'EX');
      var checkPolishEX = this.inventorySearchCriteriaObj.polish.indexOf(ExData?.name ?? 'EX');
      var checkSymmEX = this.inventorySearchCriteriaObj.symm.indexOf(ExData?.name ?? 'EX');

      var checkCutVG = this.inventorySearchCriteriaObj.cut.indexOf(VGData?.name ?? 'VG');
      var checkPolishVG = this.inventorySearchCriteriaObj.polish.indexOf(VGData?.name ?? 'VG');
      var checkSymmVG = this.inventorySearchCriteriaObj.symm.indexOf(VGData?.name ?? 'VG');

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
      this.inventorySearchCriteriaObj.cut = [];
      this.inventorySearchCriteriaObj.cut.push(ExData?.name ?? 'EX');

      this.inventorySearchCriteriaObj.polish = [];
      this.inventorySearchCriteriaObj.polish.push(ExData?.name ?? 'EX');

      this.inventorySearchCriteriaObj.symm = [];
      this.inventorySearchCriteriaObj.symm.push(ExData?.name ?? 'EX');
    }
    else if (type == '2EX') {
      var ExData = this.allTheCPS?.find(z => z.name.toLowerCase() == 'ex');
      this.inventorySearchCriteriaObj.cut = [];
      this.inventorySearchCriteriaObj.cut.push(ExData?.name ?? 'EX');

      this.inventorySearchCriteriaObj.polish = [];
      this.inventorySearchCriteriaObj.polish.push(ExData?.name ?? 'EX');

      this.inventorySearchCriteriaObj.symm = [];
    }
    else if (type == '3VG') {
      var ExData = this.allTheCPS?.find(z => z.name.toLowerCase() == 'ex');
      var VGData = this.allTheCPS?.find(z => z.name.toLowerCase() == 'vg');

      this.inventorySearchCriteriaObj.cut = [];
      this.inventorySearchCriteriaObj.cut.push(ExData?.name ?? 'EX');
      this.inventorySearchCriteriaObj.cut.push(VGData?.name ?? 'VG');

      this.inventorySearchCriteriaObj.polish = [];
      this.inventorySearchCriteriaObj.polish.push(ExData?.name ?? 'EX');
      this.inventorySearchCriteriaObj.polish.push(VGData?.name ?? 'VG');

      this.inventorySearchCriteriaObj.symm = [];
      this.inventorySearchCriteriaObj.symm.push(ExData?.name ?? 'EX');
      this.inventorySearchCriteriaObj.symm.push(VGData?.name ?? 'VG');
    }
    else if (type == 'Clear') {
      this.inventorySearchCriteriaObj.cut = [];
      this.inventorySearchCriteriaObj.polish = [];
      this.inventorySearchCriteriaObj.symm = [];
    }
    else if (type == 'BGM') {
      if (this.isBGM) {
        this.inventorySearchCriteriaObj.green = [];
        this.inventorySearchCriteriaObj.brown = [];
        this.inventorySearchCriteriaObj.milky = [];
        this.isBGM = false;
      }
      else {
        this.isBGM = true;

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
        await this.getSystemUserData();
        this.isFirstTimeLoad = false;
      }
      this.spinnerService.hide();

      //show checked location if change from summary filter
      this.utilityService.onMultiSelectChange(this.listLocation, this.inventorySearchCriteriaObj.location);
    }
    catch (error: any) {
      this.spinnerService.hide();
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

  public senitizeURL(url: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  public closeMediaDialog(e: boolean): void {
    this.isShowMedia = e;
  }

  public openGridConfigDialog(): void {
    this.isGridConfig = true;
  }

  public onExcelToggle(): void {
    this.showExcelOption = !this.showExcelOption;
  }

  public clearSearchCriteria(form: NgForm): void {
    form?.reset();
    this.inventorySearchCriteriaObj = new InventorySearchCriteria();
    this.sort = new Array<SortDescriptor>();
    this.inventorySearchCriteriaObj.supplierIds = [];
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

  public async copyToClipboard() {
    try {
      this.spinnerService.show();
      let res = await this.inventoryService.copyToClipboardStoneId(this.inventorySearchCriteriaObj);
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

  public async filterHoldChange() {
    this.skip = 0;
    let isHold = this.inventorySearchCriteriaObj.isHold;
    if (isHold)
      this.inventorySearchCriteriaObj.isHold = null as any;
    else
      this.inventorySearchCriteriaObj.isHold = true;
    await this.initInventoryData();
    this.getSummaryData();
    this.closeSummary();
  }

  public async filterMemoChange() {
    if (this.invSummary.totalMemo > 0) {
      this.skip = 0;
      let isMemo = this.inventorySearchCriteriaObj.isMemo;
      if (isMemo)
        this.inventorySearchCriteriaObj.isMemo = null as any;
      else
        this.inventorySearchCriteriaObj.isMemo = true;
      await this.initInventoryData();
      this.getSummaryData();
      this.closeSummary();
    }
  }

  public async filterTransitChange() {
    if (this.invSummary.totalTransit > 0) {
      this.skip = 0;
      this.inventorySearchCriteriaObj.status = [];
      this.inventorySearchCriteriaObj.status.push(StoneStatus.Transit.toString());
      await this.initInventoryData();
      this.getSummaryData();
      this.closeSummary();
    }
  }

  public async filterAvailableChange() {
    this.skip = 0;
    let isAvailable = this.inventorySearchCriteriaObj.isAvailable;
    if (isAvailable)
      this.inventorySearchCriteriaObj.isAvailable = null as any;
    else
      this.inventorySearchCriteriaObj.isAvailable = true;
    await this.initInventoryData();
    this.getSummaryData();
    this.closeSummary();
  }

  public async filterRapnetHoldChange() {
    this.skip = 0;
    let isHold = this.inventorySearchCriteriaObj.isRapnetHold;
    if (isHold)
      this.inventorySearchCriteriaObj.isRapnetHold = null as any;
    else
      this.inventorySearchCriteriaObj.isRapnetHold = true;
    await this.initInventoryData();
    this.getSummaryData();
    this.closeSummary();
  }

  public async filterLocationChange(location: string) {
    this.skip = 0;
    let index = this.inventorySearchCriteriaObj.location.indexOf(location);
    if (index >= 0)
      this.inventorySearchCriteriaObj.location.splice(index, 1);
    else
      this.inventorySearchCriteriaObj.location.push(location);
    await this.initInventoryData();
    this.getSummaryData();
    this.closeSummary();
  }

  public openSendMailDialog(): void {
    this.isSendMail = true;
  }

  public closeSendMailDialog(): void {
    this.isSendMail = false;
    this.excelOption = null;
    this.aDiscount = null as any;
    this.clearSendMail();
  }

  public clearSendMail(): void {
    this.exportToExcelMailObj = new ExportToExcelMailData();
  }

  public copyDiamondDetailLink(stoneId: string) {
    let baseUrl = environment.proposalUrl;
    var url = baseUrl + 'diamond-detail/' + stoneId;
    navigator.clipboard.writeText(url);
    this.utilityService.showNotification(`Copy to clipboard successfully!`);
  }
  //#endregion

  //#region Export To Excel / Mail / Proposal
  public async downloadBlobExcel(blob: any) {
    var downloadURL = window.URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = downloadURL;
    link.download = `${this.utilityService.exportFileName(this.utilityService.replaceSymbols('Data' ?? 'SearchResult'))}`;
    link.click();
  }

  public async exportExcelWithCriteria(criteria: InventorySearchCriteria) {
    try {
      let response = await this.inventoryService.exportExcel(criteria, this.excelOption ?? 'searched', this.aDiscount);
      if (response) {
        let basesixtyfourWithMIME = await this.utilityService.blobToBase64WithMIME(response) as string;
        if (basesixtyfourWithMIME.split(',').length > 1)
          this.basesixtyfour = basesixtyfourWithMIME.split(',')[basesixtyfourWithMIME.split(',').length - 1];

        return response;
      }
      else
        return null as any;
    } catch (error: any) {
      this.alertDialogService.show("something went wrong on export Excel, please try again or contact administrator");
      this.spinnerService.hide();
      return null as any;
    }
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

    if (type == "export") {
      await this.downloadAttachment();
      this.excelOption = null;
      this.aDiscount = null as any;
      this.showExcelOption = false;
      return;
    }
    else if (type == "mail") {
      this.showExcelOption = false;
      this.openSendMailDialog();
      return;
    }

    this.spinnerService.show();
    if (this.isFirstTimeLoad) {
      await this.getCustomerData();
      await this.getSystemUserData();
    }

    this.exportData = [];
    if (this.excelOption == 'selected') {
      let selectedStoneIds = this.allInventoryItems.filter(z => this.mySelection.includes(z.id)).map(z => z.stoneId);
      this.exportData = await this.inventoryService.getInventoryByStoneIds(selectedStoneIds);
    }
    else
      this.exportData = await this.inventoryService.getInventoryItemsBySearchForExcel(this.inventorySearchCriteriaObj);

    this.exportData.forEach(z => {
      if (z.shape.toLowerCase() != 'rbc' && z.shape.toLowerCase() != 'round')
        z.cut = '';

      if (this.aDiscount) {
        z.price.discount = Number(z.price.discount ?? 0) + Number(this.aDiscount);

        let stoneRap = z.weight * (z.price.rap ?? 0);
        let calDiscount = 100 + z.price.discount;
        let netAmount = (calDiscount * stoneRap) / 100;

        z.price.netAmount = this.utilityService.ConvertToFloatWithDecimal(netAmount);
        let perCarat = netAmount / z.weight;
        z.price.perCarat = this.utilityService.ConvertToFloatWithDecimal(perCarat);
      }
    });

    if (this.exportData && this.exportData.length > 0) {
      if (type == "print") {
        this.getPrintHtml();
        this.excelOption = null;
        this.aDiscount = null as any;
        this.showExcelOption = false;
      }
      else if (type == 'csv') {
        this.generateExcelData(this.exportData);

        if (this.excelFile.length > 0)
          this.utilityService.exportAsCsvFile(this.excelFile, "Diamond_Csv", true);

        this.excelOption = null;
        this.aDiscount = null as any;
        this.showExcelOption = false;
      }
      this.spinnerService.hide();
    }
    else {
      this.alertDialogService.show('No Data Found!');
      this.spinnerService.hide();
    }
  }

  public async downloadAttachment() {
    try {
      this.spinnerService.show();
      let criteria = new InventorySearchCriteria();
      if (this.excelOption == 'selected')
        criteria.selectedStones = this.mySelection;
      else
        criteria = JSON.parse(JSON.stringify(this.inventorySearchCriteriaObj));

      let blob = await this.exportExcelWithCriteria(criteria);
      if (blob)
        this.downloadBlobExcel(blob);
      this.spinnerService.hide();
    } catch (error: any) {
      this.alertDialogService.show("something went wrong on export Excel, please try again or contact administrator");
      this.spinnerService.hide();
      return null as any;
    }
  }

  private async generateExcelData(data: InventoryItems[]) {
    this.excelFile = [];
    let dataFrom: number = 7;
    let dataTo: number = (data.length + dataFrom);

    this.excelFile.push({
      'Stone No': '',
      'Image link': '',
      'Video Link': '',
      'Video': '',
      'Lab': '',
      'Report No': 'Note: Use filter to select stones and check your selection average discount and total amount.',
      'Shape': '',
      'Carats': '',
      'Color': '',
      'Clarity': '',
      'Rap': '',
      'value': '',
      'Disc %': '',
      'Price/Ct': '',
      'Amount': '',
      'Cut': '',
      'Polish': '',
      'Sym': '',
      'Flour': '',
      'Measurement': '',
      'Table %': '',
      'Depth %': '',
      'Crown Angle': '',
      'Crown': '',
      'Pav Angle': '',
      'Pav Height': '',
      'Key To Symbols': '',
      'lower Half': '',
      'Girdle Thickness': '',
      'Girdle Size': '',
      'Ratio': '',
      'Natts': '',
      'HNA': '',
      'Comment': '',
      'Shade': '',
      'Kapan': '',
      'Origin': ''
    });
    this.excelFile.push({
      'Stone No': '',
      'Image link': '',
      'Video Link': '',
      'Video': '',
      'Lab': '',
      'Report No': '',
      'Shape': 'No.of.Pcs',
      'Carats': 'Weight',
      'Color': '',
      'Clarity': '',
      'Rap': 'RAP AVG',
      'value': 'RAP TOTAL',
      'Disc %': 'AVG DIS%',
      'Price/Ct': 'AVG P.CT',
      'Amount': 'TOTAL VL',
      'Cut': '',
      'Polish': '',
      'Sym': '',
      'Flour': '',
      'Measurement': '',
      'Table %': '',
      'Depth %': '',
      'Crown Angle': '',
      'Crown': '',
      'Pav Angle': '',
      'Pav Height': '',
      'Key To Symbols': '',
      'lower Half': '',
      'Girdle Thickness': '',
      'Girdle Size': '',
      'Ratio': '',
      'Natts': '',
      'HNA': '',
      'Comment': '',
      'Shade': '',
      'Kapan': '',
      'Origin': ''
    });
    this.excelFile.push({
      'Stone No': '',
      'Image link': '',
      'Video Link': '',
      'Video': '',
      'Lab': '',
      'Report No': 'All',
      'Shape': '=COUNTA(A' + dataFrom + ':A' + dataTo + ')',
      'Carats': '=ROUND(SUM(H' + (dataFrom - 1) + ':H' + dataTo + '),2)',
      'Color': '',
      'Clarity': '',
      'Rap': '=ROUND(L3/H3,2)',
      'value': '=ROUND(SUM(L' + dataFrom + ':L' + dataTo + '),2)',
      'Disc %': '=((O3/L3)*100)-100',
      'Price/Ct': '=O3/H3',
      'Amount': '=ROUND(SUM(O' + dataFrom + ':O' + dataTo + '),2)',
      'Cut': '',
      'Polish': '',
      'Sym': '',
      'Flour': '',
      'Measurement': '',
      'Table %': '',
      'Depth %': '',
      'Crown Angle': '',
      'Crown': '',
      'Pav Angle': '',
      'Pav Height': '',
      'Key To Symbols': '',
      'lower Half': '',
      'Girdle Thickness': '',
      'Girdle Size': '',
      'Ratio': '',
      'Natts': '',
      'HNA': '',
      'Comment': '',
      'Shade': '',
      'Kapan': '',
      'Origin': ''
    });
    this.excelFile.push({
      'Stone No': '',
      'Image link': '',
      'Video Link': '',
      'Video': '',
      'Lab': '',
      'Report No': 'Selection',
      'Shape': '=SUBTOTAL(3,A' + dataFrom + ':A' + dataTo + ')',
      'Carats': '=ROUND(SUBTOTAL(9,H' + dataFrom + ':H' + dataTo + '),2)',
      'Color': '',
      'Clarity': '',
      'Rap': '=ROUND(L4/H4,2)',
      'value': '=ROUND(SUBTOTAL(9,L' + dataFrom + ':L' + dataTo + '),2)',
      'Disc %': '=((O4/L4)*100)-100',
      'Price/Ct': '=O4/H4',
      'Amount': '=ROUND(SUBTOTAL(9,O' + dataFrom + ':O' + dataTo + '),2)',
      'Cut': '',
      'Polish': '',
      'Sym': '',
      'Flour': '',
      'Measurement': '',
      'Table %': '',
      'Depth %': '',
      'Crown Angle': '',
      'Crown': '',
      'Pav Angle': '',
      'Pav Height': '',
      'Key To Symbols': '',
      'lower Half': '',
      'Girdle Thickness': '',
      'Girdle Size': '',
      'Ratio': '',
      'Natts': '',
      'HNA': '',
      'Comment': '',
      'Shade': '',
      'Kapan': '',
      'Origin': ''
    });
    this.excelFile.push({
      'Stone No': '',
      'Image link': '',
      'Video Link': '',
      'Video': '',
      'Lab': '',
      'Report No': '',
      'Shape': '',
      'Carats': '',
      'Color': '',
      'Clarity': '',
      'Rap': '',
      'value': '',
      'Disc %': '',
      'Price/Ct': '',
      'Amount': '',
      'Cut': '',
      'Polish': '',
      'Sym': '',
      'Flour': '',
      'Measurement': '',
      'Table %': '',
      'Depth %': '',
      'Crown Angle': '',
      'Crown': '',
      'Pav Angle': '',
      'Pav Height': '',
      'Key To Symbols': '',
      'lower Half': '',
      'Girdle Thickness': '',
      'Girdle Size': '',
      'Ratio': '',
      'Natts': '',
      'HNA': '',
      'Comment': '',
      'Shade': '',
      'Kapan': '',
      'Origin': ''
    });
    this.excelFile.push({
      'Stone No': 'Stone No',
      'Image link': 'Image link',
      'Video Link': 'Video link',
      'Video': 'Video',
      'Lab': 'Lab',
      'Report No': 'Report No',
      'Shape': 'Shape',
      'Carats': 'Carats',
      'Color': 'Color',
      'Clarity': 'Clarity',
      'Rap': 'Rap',
      'value': 'value',
      'Disc %': 'Disc %',
      'Price/Ct': 'Price/Ct',
      'Amount': 'Amount',
      'Cut': 'Cut',
      'Polish': 'Polish',
      'Sym': 'Sym',
      'Flour': 'Flour',
      'Measurement': 'Measurement',
      'Table %': 'Table %',
      'Depth %': 'Depth %',
      'Crown Angle': 'Crown Angle',
      'Crown': 'Crown',
      'Pav Angle': 'Pav Angle',
      'Pav Height': 'Pav Height',
      'Key To Symbols': 'Key To Symbols',
      'lower Half': 'lower Half',
      'Girdle Thickness': 'Girdle Thickness',
      'Girdle Size': 'Girdle Size',
      'Ratio': 'Ratio',
      'Natts': 'Natts',
      'HNA': 'HNA',
      'Comment': 'Comment',
      'Shade': 'Shade',
      'Kapan': 'Kapan',
      'Origin': 'Origin'
    });

    data.forEach(z => {
      var excel = {
        'Stone No': z.stoneId,
        'Image link': z.media.isPrimaryImage ? ('=HYPERLINK("' + environment.imageURL.replace('{stoneId}', z.stoneId) + '","Image")') : '',
        'Video Link': z.media.isHtmlVideo ? ('=HYPERLINK("' + environment.videoURL.replace('{stoneId}', z.stoneId) + '","Video")') : '',
        'Video': z.media.isDownloadableVideo ? ('=HYPERLINK("' + environment.otherImageBaseURL.replace('{stoneId}', z.stoneId.toLowerCase()) + "/video.mp4" + '","Download")') : '',
        'Lab': z.lab,
        'Report No': z.certificateNo,
        'Shape': z.shape,
        'Carats': z.weight,
        'Color': z.color,
        'Clarity': z.clarity,
        'Rap': z.price.rap,
        'value': ((z.price.rap ?? 0) * z.weight),
        'Disc %': z.price.discount,
        'Price/Ct': z.price.perCarat,
        'Amount': z.price.netAmount,
        'Cut': z.cut,
        'Polish': z.polish,
        'Sym': z.symmetry,
        'Flour': z.fluorescence,
        'Measurement': this.utilityService.ConvertToFloatWithDecimalTwoDigit(z.measurement.length) + ' * ' + this.utilityService.ConvertToFloatWithDecimalTwoDigit(z.measurement.width) + ' * ' + this.utilityService.ConvertToFloatWithDecimalTwoDigit(z.measurement.height),
        'Table %': z.measurement.table,
        'Depth %': z.measurement.depth,
        'Crown Angle': z.measurement.crownAngle,
        'Crown': z.measurement.crownHeight,
        'Pav Angle': z.measurement.pavilionAngle,
        'Pav Height': z.measurement.pavilionDepth,
        'Key To Symbols': z.inclusion.ktoS,
        'lower Half': z.lrHalf,
        'Girdle Thickness': this.setGirdleThickness(z.measurement.minGirdle, z.measurement.maxGirdle),
        'Girdle Size': z.measurement.girdlePer,
        'Ratio': z.measurement.ratio,
        'Natts': z.inclusion.sideBlack + ' - ' + z.inclusion.centerBlack,
        'HNA': z.inclusion.hna,
        'Comment': z.comments,
        'Shade': z.inclusion.shade,
        'Kapan': z.kapan,
        'Origin': z.kapanOrigin
      }
      this.excelFile.push(excel);
    });
  }

  private setGirdleThickness(minGirdle: string, maxGirdle: string): string {
    let thickness: string = minGirdle + ' to ' + maxGirdle;

    if (minGirdle == null || minGirdle == undefined || minGirdle?.length == 0)
      thickness = maxGirdle;

    if (maxGirdle == null || maxGirdle == undefined || maxGirdle?.length == 0)
      thickness = minGirdle;

    if (thickness == ' to ')
      thickness = '';

    return thickness;
  }

  public convertArrayToObject(fields: GridDetailConfig[], element: any): any {
    let iURL = (element.media.isPrimaryImage) ? environment.imageURL.replace("{stoneId}", element.stoneId.toLowerCase()) : "";
    let cURL = (element.media.isCertificate) ? environment.certiURL.replace("{certiNo}", element.certificateNo) : "";
    let vURL = (element.media.isHtmlVideo) ? environment.videoURL.replace("{stoneId}", element.stoneId.toLowerCase()) : "";
    var obj: any = {};
    for (let i = 0; i < fields.length; i++) {
      if (!(fields[i].title == "Checkbox")) {
        if (fields[i].title == "Media") {
          obj["CertificateUrl"] = cURL;
          obj["ImageUrl"] = iURL;
          obj["VideoUrl"] = vURL;
        }
        else if (fields[i].propertyName.includes("measurement")) {
          let propertyname = fields[i].propertyName.split(".")[1];
          obj[fields[i].title] = element.measurement[propertyname];
        }
        else if (fields[i].propertyName.includes("inclusion")) {
          let propertyname = fields[i].propertyName.split(".")[1];
          obj[fields[i].title] = element.inclusion[propertyname];
        }
        else if (fields[i].title == "Weight")
          obj[fields[i].title] = element.weight.toFixed(2);
        else if (fields[i].title == "$/CT")
          obj[fields[i].title] = ((element.basePrice.netAmount ?? 0) / element.weight).toFixed(3);
        else if (fields[i].title == "Rap")
          obj[fields[i].title] = element.basePrice.rap.toFixed(3);
        else if (fields[i].title == "Discount")
          obj[fields[i].title] = element.basePrice.discount?.toFixed(3);
        else if (fields[i].title == "NetAmount")
          obj[fields[i].title] = element.basePrice.netAmount?.toFixed(3);
        else
          obj[fields[i].title] = element[fields[i].propertyName];
      }
    }
    return obj;
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
      let fileName = "Diamond";

      let criteria = new InventorySearchCriteria();
      if (this.excelOption == 'selected')
        criteria.selectedStones = this.mySelection;
      else
        criteria = JSON.parse(JSON.stringify(this.inventorySearchCriteriaObj));

      await this.exportExcelWithCriteria(criteria);

      this.exportToExcelMailObj.excelBase64String = this.basesixtyfour;
      this.exportToExcelMailObj.excelFileName = this.utilityService.exportFileName(fileName) + '.xlsx';
      this.exportToExcelMailObj.excelMediaType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

      let res = await this.inventoryService.ExportToExcelMail(this.exportToExcelMailObj);
      if (res && res.isSuccess) {
        this.utilityService.showNotification(res.message);
        this.closeSendMailDialog();
      }
      else {
        console.error(res);
        if (res) {
          this.alertDialogService.show(res.message);
        }
        else
          this.alertDialogService.show("Something went wrong, Try again later");
      }
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

  public async printStoneDetail() {

    this.alertDialogService.ConfirmYesNo(`Are you want to Print Stone Detail?`, "Stone Print").subscribe(async (res: any) => {
      if (res.flag) {
        try {
          this.spinnerService.show();
          let selectedStoneIds = this.allInventoryItems.filter(z => this.mySelection.includes(z.id)).map(z => z.stoneId);

          let response = await this.inventoryService.downloadBarcodeExcel(selectedStoneIds);
          if (response) {
            this.spinnerService.hide();
            var downloadURL = window.URL.createObjectURL(response);
            var link = document.createElement('a');
            link.href = downloadURL;
            link.download = `${this.utilityService.exportFileName(this.utilityService.replaceSymbols('barcode'))}`;
            link.click();
            this.mySelection = [];
          }
        }
        catch (error: any) {
          console.error(error);
          this.spinnerService.hide();
          this.alertDialogService.show('Print not working, Try again later..!');
        }
      }
    });

  }

  public getPrintHtml() {
    let printStone: HTMLIFrameElement = document.createElement("iframe");
    printStone.name = "print_detail";
    printStone.style.position = "absolute";
    printStone.style.top = "-1000000px";
    document.body.appendChild(printStone);

    let html = `<html>
    <head>
    <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <style>
      table, th, td {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
        border: 0.1px solid black;
        border-collapse: collapse;
        padding: 2px 5px;
        font-size: 8px;
        text-align: center;
      }

      table {
        width: 100%;
      }
    </style>
    </head>
    <body>
    <table>
    <thead>
    <tr>
      <th>ID</th>
        <th>Shape</th>
        <th>Size</th>
        <th>Clr</th>
        <th>Clar</th>
        <th>Cut</th>
        <th>Pol</th>
        <th>Sym</th>
        <th>Flour</th>
        <th>Diameter</th>
        <th>Depth</th>
        <th>Table</th>
        <th>Certi_NO</th>
        <th>Rap</th>
        <th>Disc %</th>
        <th>Dcarat</th>
        <th>Price</th>
    </tr>
    </thead>
    <tbody>`;

    for (let i = 0; i < this.exportData.length; i++) {
      let inv = this.exportData[i];
      html += `<tr>
        <td>`+ inv.stoneId + `</td>
        <td>`+ inv.shape + `</td>
        <td>`+ inv.weight + `</td>
        <td>`+ inv.color + `</td>
        <td>`+ inv.clarity + `</td>
        <td>`+ inv.cut + `</td>
        <td>`+ inv.polish + `</td>
        <td>`+ inv.symmetry + `</td>
        <td>`+ inv.fluorescence + `</td>        
        <td>`+ this.utilityService.getMesurmentString(inv.shape, inv.measurement.length, inv.measurement.width, inv.measurement.height) + `</td>
        <td>`+ inv.measurement.depth + `</td>
        <td>`+ inv.measurement.table + `</td>
        <td>`+ inv.certificateNo + `</td>
        <td>`+ inv.price.rap + `</td>
        <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(inv.price.discount ?? 0) + `</td>
        <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(inv.price.perCarat ?? 0) + `</td>
        <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(inv.price.netAmount ?? 0) + `</td>
    </tr>`;
    }

    html += `</tbody>
    </table>
    </body>
    </html>`;

    printStone?.contentWindow?.document.open();
    printStone?.contentWindow?.document.write(html);
    printStone?.contentWindow?.focus();
    printStone?.contentWindow?.print();
    printStone?.contentWindow?.document.close();
  }
  //#endregion

  //#region Popup Close
  @HostListener("document:click", ["$event"])
  public documentClick(event: any): void {
    if (!this.contains(event.target)) {
      this.showExcelOption = false;
    }
  }

  private contains(target: any): boolean {
    return (
      this.anchor.nativeElement.contains(target) ||
      (this.popup ? this.popup.nativeElement.contains(target) : false)
    );
  }
  //#endregion

  //#region add expo request
  public async openExpoRequest() {
    this.isAddExpoRequest = !this.isAddExpoRequest;
  }

  public toggleDetailDialog() {
    this.isAddExpoRequest = !this.isAddExpoRequest;
  }

  public validateExpoTicketNumber(input: string) {
    // Create a regular expression to check validation
    const regex = /^\d{7}$/;

    // Test the input against the regular expression
    return regex.test(input);
  }

  public async onEnterAddStone(code: string) {
    try {
      if (code) {
        if (!this.validateExpoTicketNumber(code)) {
          this.alertDialogService.show('Please enter valid number!');
          return;
        }
        await this.getInventoryByExpoTicketCode(code);
      }
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async getInventoryByExpoTicketCode(code: string) {
    try {
      this.reqInventories = [];
      let expoinv = await this.expoTicketService.getExpoTicketByCode(+code);
      if (expoinv)
        this.reqInventories = await this.inventoryService.getInventoryByStoneIds(expoinv.stoneIds);
      else
        this.alertDialogService.show('Record not available for this code number!');
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }

  }

  public async addExpoTicketviewingReq() {
    this.alertDialogService.ConfirmYesNo("Are you sure you want to add expo request for Expo stone(s)?", "Expo Request")
      .subscribe(async (res: any) => {
        if (res.flag) {
          try {
            this.spinnerService.show();
            let req: ExpoRequests = new ExpoRequests();
            this.reqInventories.map((item) => item.id).forEach(z => {
              let obj = new ExpoInvItem();
              obj.invId = z;
              req.invItems.push(obj);
            });
            req.seller = this.sellerObj;

            let res = await this.expoRequestService.insertExpoRequest(req);
            if (res) {
              this.reqInventories = [];
              this.generatedCode = "";
              this.openExpoRequest();
              await this.initInventoryData();
              this.spinnerService.hide();
              this.alertDialogService.show('Expo Request Created, Req No: ' + res);
            }
            else {
              this.spinnerService.hide();
              this.alertDialogService.show('Inventory not update, Please try again later!');
            }
          } catch (error: any) {
            console.error(error);
            this.spinnerService.hide();
            this.alertDialogService.show('Inventory not update, Please try again later!');
          }
        }
      });
  }
  //#endregion

  //#region Select All
  public async selectAllInventories(event: SelectAllCheckboxState) {
    this.mySelection = [];

    if (event.toLowerCase() == 'checked') {
      if (this.invSummary.totalCount > this.pageSize) {
        if (!this.allInventoryItems || this.allInventoryItems.length != this.invSummary.totalCount) {
          try {
            this.spinnerService.show();
            this.allInventoryItems = await this.inventoryService.getInventoryItemsForSelectAll(this.inventorySearchCriteriaObj);
            this.spinnerService.hide();
          } catch (error: any) {
            console.error(error);
            this.spinnerService.hide();
            this.alertDialogService.show('Select all stone fail, Please contact administrator!');
          }
        }
        if (this.allInventoryItems && this.allInventoryItems.length > 0) {
          this.mySelection = this.allInventoryItems.map(z => z.id);
          this.changeDetRef.detectChanges();
        }
        else
          this.spinnerService.hide();
      }
      else
        this.mySelection = this.inventoryItems.map(z => z.id);
    }
    else
      this.mySelection = [];

  }
  //#endregion

  //#region Summary
  public isSummary = false;
  public openSummary(): void {
    this.isSummary = true;
  }

  public closeSummary(): void {
    this.isSummary = false;
  }
  //#endregion

  //#region Viewing Req
  public async viewingReq() {
    if (this.mySelection.length == 0) {
      this.alertDialogService.show('Please select at least one stone!');
      return;
    }

    var isValid = await this.checkValidStones();
    if (!isValid)
      return

    this.alertDialogService.ConfirmYesNo("Are you sure you want to add expo request for selected stone(s)?", "Expo Request")
      .subscribe(async (res: any) => {
        if (res.flag) {
          try {
            this.spinnerService.show();
            let req: ExpoRequests = new ExpoRequests();
            this.mySelection.forEach(z => {
              let obj = new ExpoInvItem();
              obj.invId = z;
              req.invItems.push(obj);
            });
            req.seller = this.sellerObj;

            let res = await this.expoRequestService.insertExpoRequest(req);
            if (res) {
              this.mySelection = [];
              await this.initInventoryData();
              this.spinnerService.hide();
              this.alertDialogService.show('Expo Request Created, Req No: ' + res);
            }
            else {
              this.spinnerService.hide();
              this.alertDialogService.show('Inventory not update, Please try again later!');
            }
          } catch (error: any) {
            console.error(error);
            this.spinnerService.hide();
            this.alertDialogService.show('Inventory not update, Please try again later!');
          }
        }
      });
  }

  private async checkValidStones(): Promise<boolean> {
    let flag = false;
    try {
      this.spinnerService.show();
      var res = await this.inventoryService.getInventoryByInvIds(this.mySelection);
      if (res) {
        var invalidStatus: string[] = [LeadStatus.Hold.toString(), LeadStatus.Order.toString(), LeadStatus.Delivered.toString(), LeadStatus.Cart.toString()];
        var invalidStones = res.filter(z => invalidStatus.includes(z.leadStatus)).map(z => z.stoneId);
        if (invalidStones.length > 0)
          this.alertDialogService.show(invalidStones.join(',') + ' Stone(s) is in lead, Please remove from selection!');
        else {
          invalidStones = res.filter(z => z.status == StoneStatus.Sold.toString()).map(z => z.stoneId);
          if (invalidStones.length > 0)
            this.alertDialogService.show(invalidStones.join(',') + ' Stone(s) already sold, Please remove from selection!');
          else
            flag = true;
        }

        this.spinnerService.hide();
      }
      else {
        this.alertDialogService.show('Stones not found, Please contact administrator!');
        this.spinnerService.hide();
      }
    } catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Stones not check, Please contact administrator!');
    }
    return flag;
  }
  //#endregion

  //#region Add Expo Inventory Remark
  public openExpoRemark() {
    this.isExpoRemark = true;
  }

  public closeExpoRemark() {
    this.isExpoRemark = !this.isExpoRemark;
  }

  public async addExpoRemark() {
    let isUpdateExpoRemark = await this.inventoryService.addExpoInvRemark(this.mySelection, this.expoRemark);
    if (isUpdateExpoRemark) {
      this.mySelection = [];
      this.expoRemark = "";
      await this.initInventoryData();
      this.closeExpoRemark();
      this.utilityService.showNotification(`Expo Inventory Remark Added Successfully!`);
    }
  }
  //#endregion
}
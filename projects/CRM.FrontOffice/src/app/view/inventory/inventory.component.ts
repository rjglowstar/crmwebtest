import { ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { PageChangeEvent, SelectAllCheckboxState, SelectableSettings } from '@progress/kendo-angular-grid';
import { Align } from '@progress/kendo-angular-popup';
import { DataResult, GroupDescriptor, SortDescriptor, process } from '@progress/kendo-data-query';
import { environment } from 'environments/environment';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { SortFieldDescriptor } from 'projects/CRM.BackOffice/src/app/businessobjects';
import { GirdleDNorm, GradeSearchItems, GridDetailConfig, InclusionPrice, MeasItems, MfgInclusionData, MfgMeasurementData, MfgPricingRequest } from 'shared/businessobjects';
import { TypeFilterPipe } from 'shared/directives/typefilter.pipe';
import { GridConfig, GridMasterConfig, InclusionConfig, MasterConfig, MasterDNorm, MeasurementConfig, SystemUserPermission } from 'shared/enitites';
import { CommonService, ConfigService, FrontStoneStatus, InvHistoryAction, LeadStatus, MeasureGradeService, PricingService, StoneStatus, TypeA, UtilityService, listGrainingItems } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { CommuteItem, CustLookUp, ExportToExcelMailData, InvHoldOrRapnetHoldItems, InventorySearchCriteria, InventorySelectAllItems, InventorySummary, StoneProposalMailData, WeightRange } from '../../businessobjects';
import { UpdateBaseDisc } from '../../businessobjects/commute/updatebasedis';
import { ExpoMasterSearchCriteria } from '../../businessobjects/organizations/expomastersearchcriteria ';
import { CustomerDNorm, InvHistory, InvItem, InventoryItemMeasurement, InventoryItems, PriceDNorm, PricingRequest, SavedEmail, Supplier, SupplierDNorm, SystemUser, SystemUserDNorm, fxCredential } from '../../entities';
import { CustInventoryCriteria } from '../../entities/inventory/custinventorycriteria';
import { ExpoMasterDNorm } from '../../entities/organization/dnorm/expomasterdnorm';
import { CustomerService, FoUtilityService, GridPropertiesService, InventoryService, LeadService, MasterConfigService, PendingPricingService, PricingRequestService, SavedEmailService, StoneProposalService, SupplierService, SystemUserService } from '../../services';
import { InvHistoryService } from '../../services/business/invhistory.service';
import { CommuteService } from '../../services/commute/commute.service';
import { ExpomasterService } from '../../services/expomaster/expomaster.service';


@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.css'
})
export class InventoryComponent implements OnInit {

  //#region Grid Init
  public sort: SortDescriptor[] = [];
  public groups: GroupDescriptor[] = [];
  public pageSize = 26;
  public skip = 0;
  public fields!: GridDetailConfig[];
  public gridView?: DataResult;
  public isRegSystemUser: boolean = false;
  public filterFlag = true;
  public invHistorys!: InvHistory[];
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
  public allHoldBy: string[] = [];
  public selectedEmpItems?: { text: string, value: string };
  public selectedCustomer?: { text: string, value: string };
  public selectedCPS?: string;
  public isBGM: boolean = false;
  public listSupplierDNormItems: Array<{ name: string; value: string; isChecked: boolean }> = [];
  public listBranchDNormItems: Array<{ text: string; value: string }> = [];
  public listDepartmentItems: Array<{ text: string; value: string }> = [];
  public listEmpItems: Array<{ text: string; value: string }> = [];
  public listLeadStatus: Array<{ name: string; isChecked: boolean }> = [];
  public masterConfigList!: MasterConfig;
  public allTheLab?: MasterDNorm[];
  public allTheShapes?: MasterDNorm[];
  public allColors?: MasterDNorm[];
  public allClarities?: MasterDNorm[];
  public allTheFluorescences?: MasterDNorm[];
  public allTheCPS?: MasterDNorm[];
  public inclusionData: MasterDNorm[] = [];
  public inclusionFlag: boolean = false;
  public filterHoldByChk: boolean = true;
  public filterHoldBy: string = '';
  public inclusionConfig: InclusionConfig = new InclusionConfig();
  public measurementData: MasterDNorm[] = [];
  public measurementConfig: MeasurementConfig = new MeasurementConfig();
  public listStatus: Array<{ name: string; isChecked: boolean }> = [];
  public listKToS: Array<{ name: string; isChecked: boolean }> = [];
  public listCulet: Array<{ name: string; isChecked: boolean }> = [];
  public listLocation: Array<{ name: string; isChecked: boolean }> = [];
  public listTypeA: Array<{ name: string; isChecked: boolean }> = [];
  public listHoldByItems: Array<{ name: string; isChecked: boolean }> = [];
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
  public stoneProposalMail: StoneProposalMailData = new StoneProposalMailData();
  public expomastersearchcriteria: ExpoMasterSearchCriteria = new ExpoMasterSearchCriteria();
  public CustInventoryCriteriaobj: CustInventoryCriteria = new CustInventoryCriteria();
  public customer: CustLookUp[] = [];
  public listCustomer: Array<{ text: string; value: string; isCheckedPro: boolean }> = [];
  public suppliers: Supplier[] = [];
  public praposalCust: CustomerDNorm[] = [];
  public isProposalSuccess: boolean = false;
  public proposalSuccMsg!: string;
  public filterStoneByCerID!: string;
  //#endregion

  //#region Model Flag
  public isEditInventory: boolean = false;
  public isSearchFilter: boolean = false;
  public isShowMedia: boolean = false;
  public isFormValid: boolean = false;
  public showExcelOption = false;
  public isSendMail = false;
  public isSendProposal = false;
  public isAdminRole = false;
  public isEditBaseDiscount: boolean = false;

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
  public isStockInventory: boolean = false;

  public filterkts: boolean = true;
  public selectAllState: SelectAllCheckboxState = 'unchecked';
  public isFirstTimeLoad = true;

  public insertFlag: boolean = true;
  public isRegOrganization: boolean = false;
  public aDiscount!: number;
  public expoMasterItems!: ExpoMasterDNorm[];
  public searchMailTo: Array<string> = [];
  public mailTo: string[] = [];
  public searchCCMail: Array<string> = [];
  public ccEmail: string[] = [];
  public searchBCCMail: Array<string> = [];
  public bccEmail: string[] = [];
  public prapoCust: Array<{ text: string; value: string; isCheckedPro: boolean }> = [];
  public isCheckedPro: boolean = false;
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
    private pricingService: PricingService,
    private pricingRequestService: PricingRequestService,
    private PendingPricingService: PendingPricingService,
    private changeDetRef: ChangeDetectorRef,
    private measureGradeService: MeasureGradeService,
    private stoneProposalService: StoneProposalService,
    private commonService: CommonService,
    private expoMasterService: ExpomasterService,
    private customerService: CustomerService,
    private leadService: LeadService,
    private invHistoryService: InvHistoryService,
    private commuteService: CommuteService,
    private savedEmailService: SavedEmailService,
    private foUtilityService: FoUtilityService
  ) { }

  public async ngOnInit() {
    await this.defaultMethodsLoad();
  }

  copyText() {
    let selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = this.proposalSuccMsg;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
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

    //TypeA
    Object.values(TypeA).forEach(z => { this.listTypeA.push({ name: z.toString(), isChecked: false }); });

    //Lead Status
    Object.values(LeadStatus).forEach(z => { if (z != LeadStatus.Proposal.toString() && z != LeadStatus.Rejected.toString()) this.listLeadStatus.push({ name: z.toString(), isChecked: false }); });
    this.utilityService.onMultiSelectChange(this.listLeadStatus, this.inventorySearchCriteriaObj.leadStatus);

    this.getGridConfiguration();
    await this.initInventoryData();
    this.setUserRights();
    this.getExpoMasterData();
    this.getSummaryData();
    this.getSupplierDetail();
  }

  public resetForm(form?: NgForm) {
    this.inventoryObj = new InventoryItems();
    this.insertFlag = true;
    form?.reset();
  }
  public async setUserRights() {
    let userPermissions: SystemUserPermission = new SystemUserPermission();
    let sesValue = sessionStorage.getItem("userPermission");
    if (sesValue)
      userPermissions = JSON.parse(sesValue) as SystemUserPermission;
    if (userPermissions.actions.length > 0) {
      let CanHoldInventory = userPermissions.actions.find(z => z.name == "CanHoldInventory");
      if (CanHoldInventory != null)
        this.isCanHoldInventory = true;

      let CanReleaseHoldInventory = userPermissions.actions.find(z => z.name == "CanReleaseHoldInventory");
      if (CanReleaseHoldInventory != null)
        this.isCanReleaseHoldInventory = true;

      let CanRapnetHoldInventory = userPermissions.actions.find(z => z.name == "CanRapnetHoldInventory");
      if (CanRapnetHoldInventory != null)
        this.isCanRapnetHoldInventory = true;

      let CanRapnetReleaseHoldInventory = userPermissions.actions.find(z => z.name == "CanRapnetReleaseHoldInventory");
      if (CanRapnetReleaseHoldInventory != null)
        this.isCanRapnetReleaseHoldInventory = true;

      let CanDeleteInventory = userPermissions.actions.find(z => z.name == "CanDeleteInventory");
      if (CanDeleteInventory != null)
        this.isCanDeleteInventory = true;
    }
  }

  public async getGridConfiguration() {
    try {
      this.gridConfig = await this.configService.getGridConfig(this.fxCredentials?.id ?? '', "Inventory", "InventoryGrid", this.gridPropertiesService.getInventoryGrid());
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
        this.gridMasterConfigResponse = await this.configService.getMasterGridConfig("Inventory", "InventoryGrid");
        if (this.gridMasterConfigResponse)
          this.fields = this.gridMasterConfigResponse.gridDetail;
        else
          this.fields = await this.gridPropertiesService.getInventoryGrid();
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
      // this.inventorySearchCriteriaObj.selectedStones = this.mySelection;
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
          customer.forEach((z) => { this.listCustomer.push({ text: z.companyName + ' | ' + z.email, value: z.id, isCheckedPro: false }); });
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
      this.allHoldBy = this.systemUserItems.filter(z => z.origin.toLowerCase() === 'seller').map(z => z.fullName);
      // this.allHoldBy = this.systemUserItems.map(z => z.fullName);
      this.systemUserItems.filter(z => z.origin.toLowerCase() == 'seller').forEach((z) => { this.listHoldByItems.push({ name: z.fullName, isChecked: false }); });
      this.utilityService.onMultiSelectChange(this.listHoldByItems, this.inventorySearchCriteriaObj.holdBy);
    }
    catch (error: any) {
      this.alertDialogService.show(error.error);
    }
  }

  // public onCustomerChange(e: any) {
  //   const customer = this.customer.find(z => z.id == e.value);
  //   if (customer != undefined && customer != null) {
  //     let cust = new CustomerDNorm();
  //     cust.id = customer.id;
  //     cust.name = customer.fullName;
  //     cust.code = customer.code;
  //     cust.email = customer.email;
  //     cust.mobile = customer.mobile1;
  //     this.stoneProposalMail.cutomer = cust;
  //   }
  // }


  public onUserChange(): void {
    this.listCustomer.forEach(element => {
      element.isCheckedPro = false;
    });

    if (this.prapoCust.length > 0) {
      this.prapoCust.forEach(item => {
        this.listCustomer.forEach(element => {
          if (element.value == item.value) {
            element.isCheckedPro = true;
          }
        });
      });
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

  public async onChangePricing() {
    try {
      if (this.inventoryObj.weight <= 0)
        return

      let reqList: MfgPricingRequest[] = [];
      reqList.push(this.mappingPricingRequestData(this.inventoryObj));

      this.spinnerService.show();
      let response = await this.pricingService.getBasePrice(reqList);
      if (response && response.length > 0) {
        let target = response.find(a => a.id == this.inventoryObj.stoneId);
        if (target && target.error == null) {
          target = this.utilityService.setAmtForPricingDiscountResponse(target, this.inventoryObj.weight);
          this.inventoryObj.basePrice.rap = target.rapPrice;
          this.inventoryObj.basePrice.discount = target.discount;
          this.inventoryObj.basePrice.netAmount = target.amount;
          this.inventoryObj.basePrice.perCarat = target.dCaret;
          this.spinnerService.hide();
        }
        else {
          this.spinnerService.hide();
          this.inventoryObj.basePrice = new PriceDNorm();
          if (target && target.rapPrice != null && target.rapPrice > 0)
            this.inventoryObj.basePrice.rap = target.rapPrice;
          this.utilityService.showNotification(`Discount not found!`, 'warning');
        }
      }
      else {
        this.spinnerService.hide();
        this.inventoryObj.basePrice = new PriceDNorm();
        this.utilityService.showNotification(`Price not found!`, 'warning');
      }
      this.checkRequiredFields();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.inventoryObj.basePrice = new PriceDNorm();
      this.checkRequiredFields();
      this.alertDialogService.show(error.error);
    }
  }

  public onChangeLab(): void {
    if (this.inventoryObj.lab == 'NC' && (this.inventoryObj.price.rap == null || this.inventoryObj.price.discount == null || this.inventoryObj.price.netAmount == null || this.inventoryObj.price.perCarat == null)) {
      this.alertDialogService.ConfirmYesNo("Price data not available, Are you sure you want to add as pricing request?", "Non Certified Lab")
        .subscribe(async (res: any) => {
          if (!res.flag) {
            this.inventoryObj.lab = this.inventoryItems.find(z => z.id == this.inventoryObj.id)?.lab ?? null as any;
          }
        });
    }
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
        this.getMasterConfigData();
        this.getSupplierDNormData();
        this.getSystemUserData();
        this.getCustomerData();
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

  public async openMediaDialog(title: string, stoneId: string, type: string) {
    if (stoneId) {
      this.mediaTitle = title;

      if (type == "iframe") {
        let isExistNVideo = await this.inventoryService.getHtmlVideoExist(stoneId);
        this.mediaSrc =  isExistNVideo ? environment.nVideoURL.replace(/{stoneId}/g, stoneId.toLowerCase()) : environment.videoURL.replace('{stoneId}', stoneId.toLowerCase());
      }
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
    this.listLeadStatus.forEach(z => { z.isChecked = false });
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

  public openSendProposalDialog(): void {
    this.isSendProposal = true;
  }

  public closeSendProposalDialog(): void {
    this.isSendProposal = false;
    this.clearSendProposal();
    this.selectedCustomer = undefined;
    this.praposalCust = [];
    this.prapoCust = [];

    this.listCustomer.forEach(element => {
      element.isCheckedPro = false;
    });

  }

  public clearSendProposal(): void {
    this.stoneProposalMail = new StoneProposalMailData();
  }

  public clearSendMail(): void {
    this.exportToExcelMailObj = new ExportToExcelMailData();
    this.mailTo = [];
    this.ccEmail = [];
    this.bccEmail = [];
  }

  public copyDiamondDetailLink(stoneId: string) {
    let baseUrl = environment.proposalUrl;
    var url = baseUrl + 'diamond-detail/' + stoneId;
    navigator.clipboard.writeText(url);
    this.utilityService.showNotification(`Copy to clipboard successfully!`);
  }

  public openDiamondDetails(stoneId: string) {
    let baseUrl = environment.proposalUrl;
    var url = baseUrl + 'diamond-detail/' + stoneId;
    window.open(url, '_blank');
  }

  public async onSaveCustomer() {
    try {
      this.spinnerService.show();
      let messageType = '';
      let response!: any;

      messageType = 'inserted';
      const customer = this.customer.find(z => z.id == this.inventorySearchCriteriaObj.customerId);
      let systemUserData = this.systemUserItems.find(z => z.id == this.fxCredentials?.id ?? '');
      if (systemUserData != undefined && systemUserData != null) {

        this.CustInventoryCriteriaobj.createdBy = systemUserData.fullName;
        this.CustInventoryCriteriaobj.CretedById = systemUserData.id
        this.CustInventoryCriteriaobj.customer.sellerId = systemUserData.id;
      }

      if (customer != undefined && customer != null) {

        this.CustInventoryCriteriaobj.customer.id = customer.id;
        this.CustInventoryCriteriaobj.customer.name = customer.fullName;
        this.CustInventoryCriteriaobj.customer.code = customer.code;
        this.CustInventoryCriteriaobj.customer.email = customer.email;
        this.CustInventoryCriteriaobj.customer.companyName = customer.companyName;
        this.CustInventoryCriteriaobj.customer.city = customer.address.city;
        this.CustInventoryCriteriaobj.customer.mobile = customer.mobile1;

      }
      this.CustInventoryCriteriaobj.inventoryCriteria = this.inventorySearchCriteriaObj
      response = await this.inventoryService.InsertCustInventoryCriteria(this.CustInventoryCriteriaobj);
      if (response) {
        this.spinnerService.hide();
        this.utilityService.showNotification(`Record ` + messageType + ` successfully!`);
      }
      else {
        this.spinnerService.hide();
        this.utilityService.showNotification(`Something went wrong, Try again later!`)
      }

    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }

  }


  //#endregion

  //#region CURD Functions
  // public async setNonCertified() {
  //   try {
  //     this.alertDialogService.ConfirmYesNo("Are you sure you want to change lab status for selected stone(s)?", "Non Certified Lab")
  //       .subscribe(async (res: any) => {
  //         if (res.flag) {
  //           this.spinnerService.show();
  //           let selectedInventoryItems: InventoryItems[] = [];

  //           let selectedInventoryStones = this.allInventoryItems.filter(item => this.mySelection.includes(item.id));
  //           selectedInventoryStones.forEach(z => {
  //             let obj: InventoryItems = new InventoryItems();
  //             obj.stoneId = z.stoneId;

  //             //Add Require fields to avoid api call error
  //             obj.weight = 0;
  //             obj.updatedBy = this.fxCredentials?.id ?? '';
  //             obj.identity = this.inventoryItems[0].identity;
  //             obj.stoneOrg = this.inventoryItems[0].stoneOrg;

  //             selectedInventoryItems.push(obj);
  //           });

  //           let res = await this.inventoryService.updateInventoryLabToNC(selectedInventoryItems);
  //           if (res) {
  //             this.initInventoryData();
  //             if (res.item1 == 0 && res.item2 == 0)
  //               this.utilityService.showNotification(selectedInventoryItems.length.toString() + ` Record(s) updated successfully!`);
  //             else {
  //               if (res.item1 > 0)
  //                 this.utilityService.showNotification(res.item1.toString() + ` Record(s) updated successfully!`);
  //               if (res.item2 > 0)
  //                 this.utilityService.showNotification(res.item2.toString() + ` Pricing request submitted successfully!`);
  //             }
  //           }
  //           else
  //             this.utilityService.showNotification(`Stone(s) already in `);

  //           this.spinnerService.hide();
  //           this.mySelection = [];
  //         }
  //       });
  //   }
  //   catch (error: any) {
  //     this.spinnerService.hide();
  //     this.alertDialogService.show(error.error);
  //   }
  // }

  public async changeHoldData(isHold: boolean, isRelease: boolean = false) {
    try {
      let type = '';

      let stoneIds: string[] = this.allInventoryItems.filter(item => this.mySelection.includes(item.id)).map(i => i.stoneId)
      let allInvItems: InventoryItems[] = await this.inventoryService.getInventoryByStoneIds(stoneIds);
      if (!allInvItems || allInvItems?.length == 0) {
        this.alertDialogService.show('Stone(s) not found, Please contact administrator!');
        return;
      }

      if (!isRelease) {
        if (isHold) {
          type = 'Hold';
          let fetchInventoryHoldOrMemo = allInvItems.some(i => i.isHold == isHold || i.isMemo == isHold);
          if (fetchInventoryHoldOrMemo) {
            this.alertDialogService.show('Stone(s) already in ' + type + ' or Memo!');
            return;
          }

        }
        else {
          type = 'Rapnet Hold';
          let fetchInventoryHoldOrMemo = allInvItems.some(i => i.isRapnetHold == !isHold);
          if (fetchInventoryHoldOrMemo) {
            this.alertDialogService.show('Stone(s) already in ' + type + '!');
            return;
          }
        }
      }
      else {
        if (isHold) {
          type = 'Hold';
          let fetchInventoryHoldOrMemo = allInvItems.some(i => i.isHold == !isHold);
          if (fetchInventoryHoldOrMemo) {
            this.alertDialogService.show('Stone(s) already released!');
            return;
          }

        }
        else {
          type = 'Rapnet Hold';
          let fetchInventoryHoldOrMemo = allInvItems.some(i => i.isRapnetHold == isHold);
          if (fetchInventoryHoldOrMemo) {
            this.alertDialogService.show('Stone(s) already  released!');
            return;
          }
        }
      }

      this.alertDialogService.ConfirmYesNo("Are you sure you want to change status to " + (isRelease ? ('Release ' + type) : type) + " for selected stone(s)?", "Change " + type)
        .subscribe(async (res: any) => {
          if (res.flag) {
            this.spinnerService.show();
            let selectedInventoryItems: InvHoldOrRapnetHoldItems = new InvHoldOrRapnetHoldItems();
            selectedInventoryItems.stoneIds = allInvItems.map(i => i.stoneId);
            selectedInventoryItems.type = type;
            selectedInventoryItems.flag = isRelease ? false : true;
            let res = await this.inventoryService.updateInventoryHoldData(selectedInventoryItems);
            if (res) {
              if (type == "Hold") {
                if (selectedInventoryItems.flag)
                  this.insertInvItemHistoryList(selectedInventoryItems.stoneIds, InvHistoryAction.Hold, `Updated the stone to Hold from the Inventory page for stone`);
                else
                  this.insertInvItemHistoryList(selectedInventoryItems.stoneIds, InvHistoryAction.UnHold, `Updated the stone to UnHold from the Inventory page for stone`);
              }
              else {
                if (selectedInventoryItems.flag)
                  this.insertInvItemHistoryList(selectedInventoryItems.stoneIds, InvHistoryAction.RapnetHold, `Updated the stone to RapnetHold from the Inventory page for stone`);
                else
                  this.insertInvItemHistoryList(selectedInventoryItems.stoneIds, InvHistoryAction.RapnetUnHold, `Updated the stone to RapnetUnHold from the Inventory page for stone`);
              }

              if (isHold) {
                let result = await this.updateSupplierInventoryData(allInvItems, !isRelease);
                if (result)
                  this.utilityService.showNotification(allInvItems.length.toString() + ` Record(s) updated successfully in supplier data!`);

                if (isRelease) {
                  //Pending Pricing Update & Insert Pricing Request if not in pending pricing
                  let pricingRes = await this.pricingRequestService.updatePricingOnReleaseStones(allInvItems, 'Inv Hold Release');
                  if (pricingRes) {
                    let res = await this.PendingPricingService.deletePendingPrice(allInvItems.map(i => i.stoneId));
                    this.utilityService.showNotification(allInvItems.length.toString() + ` pricing updated successfully!`);
                  }
                }
              }
              this.utilityService.showNotification(allInvItems.length.toString() + ` Record(s) updated successfully!`);
              await this.initInventoryData();
              this.getSummaryData();
            }
            else {
              this.spinnerService.hide();
              this.utilityService.showNotification(`Stone(s) already in ` + type, 'warning');
            }
            this.mySelection = [];
          }
        });
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async updateSupplierInventoryData(inv: InventoryItems[], isHold: boolean): Promise<boolean> {
    let res = false;
    try {
      var distinctSuppliers = inv.map((u: InventoryItems) => u.supplier.code).filter((x: any, i: any, a: any) => x && a.indexOf(x) === i);
      for (let i = 0; i < distinctSuppliers.length; i++) {
        var z = distinctSuppliers[i];
        var supplierDetail = this.suppliers.find(a => a.code == z);
        if (supplierDetail) {
          if (supplierDetail.apiPath) {
            var invBySuppliers = inv.filter(a => a.supplier.code == z);
            let commuteObj = new CommuteItem();
            commuteObj.stoneIds = invBySuppliers.map(a => a.stoneId);
            commuteObj.isHold = isHold;
            if (isHold == true)
              commuteObj.holdBy = this.fxCredentials?.fullName ?? "";
            else
              commuteObj.holdBy = null as any;

            res = await this.commuteService.updateStoneHold(commuteObj, supplierDetail.apiPath);
            if (res) {
              if (isHold)
                this.insertInvItemHistoryList(commuteObj.stoneIds, InvHistoryAction.Hold, `Updated the stone to Hold in BO from the Inventory page for stone`);
              else
                this.insertInvItemHistoryList(commuteObj.stoneIds, InvHistoryAction.UnHold, `Updated the stone to UnHold in BO from the Inventory page for stone`);
            }
          }
          else
            this.alertDialogService.show(supplierDetail.name + ' supplier api not found, Please contact administrator!');
        } else {
          this.alertDialogService.show(z + ' supplier not found, Please contact administrator!');
        }
      }
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('inventory not updated in supplier data, Please contact administrator!', 'error');
    }
    return res;
  }

  //modal expo master opne

  public async openUpdateExpoDialog() {
    this.isRegOrganization = true;
    await this.onExpoMasterChange(this.inventoryObj.expoName);
  }

  public closeExpoMasterDialog(form: NgForm): void {
    this.isRegOrganization = false;
    this.mySelection = [];
    this.resetForm(form);
  }

  public closeProposalSuccess() {
    this.isProposalSuccess = false;
    this.proposalSuccMsg = '';
  }

  public async onExpoMasterChange(e: string) {
    try {
      this.spinnerService.show();
      this.expoMasterItems.find(c => c.name == e);

      this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      console.error(error);
      this.alertDialogService.show('Something went wrong , Try again later!');
    }
  }


  private async getExpoMasterData() {
    try {
      var expomasterData = await this.expoMasterService.getExpoMaster(this.expomastersearchcriteria);
      this.expoMasterItems = JSON.parse(JSON.stringify(expomasterData))
    }
    catch (error: any) {
      console.error(error);
      this.alertDialogService.show('Something went wrong , Try again later!');
    }
  }
  //submit form
  public async onExpoMasterSubmit(form: NgForm) {
    try {
      var expodata = form.value;
      this.updateExpo(expodata.expoName);
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error)
    }
  }

  // end expo master modal
  public async updateExpo(expoName: string) {
    if (this.mySelection.length == 0) {
      this.alertDialogService.show('Please select at least one stone!');
      return;
    }

    var soldStoneId = this.allInventoryItems.filter(z => this.mySelection.includes(z.id) && z.status == StoneStatus.Sold.toString()).map(z => z.stoneId);
    if (soldStoneId.length > 0) {
      this.alertDialogService.show(soldStoneId.join(',') + ' Stone(s) alredy sold, Please remove from selection!');
      return;
    }

    try {
      var selectedStoneIds = this.allInventoryItems.filter(z => this.mySelection.includes(z.id)).map(z => z.stoneId);
      let allInvItems: InventoryItems[] = await this.inventoryService.getInventoryByStoneIds(selectedStoneIds);

      let orderStoneIds = allInvItems.filter(z => z.leadStatus == LeadStatus.Order.toString()).map(z => z.stoneId);
      if (orderStoneIds.length > 0) {
        this.alertDialogService.show(orderStoneIds.join(',') + ' Stone(s) in order, Please remove from selection!');
        return;
      }
    } catch (error) {
      console.error(error);
      this.alertDialogService.show('Stone check fail, Please contact administrator!');
    }

    this.alertDialogService.ConfirmYesNo("Are you sure you want to change Expo status for selected stone(s)?", "Update Expo")
      .subscribe(async (res: any) => {
        if (res.flag) {
          try {
            this.spinnerService.show();
            let res = await this.inventoryService.updateExpoFlag(this.mySelection, expoName);
            if (res) {
              this.mySelection = [];
              await this.initInventoryData();
              this.spinnerService.hide();
              this.utilityService.showNotification('Inventory updated successfully!');
              this.isRegOrganization = false;
            }
            else {
              this.spinnerService.hide();
              this.alertDialogService.show('Inventory not update, Please try again later!');
              this.isRegOrganization = false;
            }
          } catch (error: any) {
            console.error(error);
            this.spinnerService.hide();
            this.alertDialogService.show('Inventory not update, Please try again later!');
          }
        }
      });
  }

  public async UpdateInvGrade(inv: InventoryItems) {
    try {
      let req: GradeSearchItems[] = [];
      let obj: GradeSearchItems = new GradeSearchItems();
      obj.id = inv.stoneId?.toUpperCase();
      obj.lab = "GIA"//inv.lab?.toUpperCase() ?? 'GIA';
      obj.shape = inv.shape?.toUpperCase();
      obj.size = Number(inv.weight);
      obj.color = inv.color?.toUpperCase();
      obj.clarity = inv.clarity?.toUpperCase();
      obj.cut = inv.cut?.toUpperCase();
      obj.polish = inv.polish?.toUpperCase();
      obj.sym = inv.symmetry?.toUpperCase();
      obj.fluo = inv.fluorescence?.toUpperCase();

      let inclusionData: InclusionPrice = new InclusionPrice();
      inclusionData.brown = inv.inclusion.brown?.toUpperCase();
      inclusionData.green = inv.inclusion.green?.toUpperCase();
      inclusionData.milky = inv.inclusion.milky?.toUpperCase();
      inclusionData.shade = inv.inclusion.shade?.toUpperCase();
      inclusionData.sideBlack = inv.inclusion.sideBlack?.toUpperCase();
      inclusionData.centerBlack = inv.inclusion.centerBlack?.toUpperCase();
      inclusionData.sideWhite = inv.inclusion.sideWhite?.toUpperCase();
      inclusionData.centerWhite = inv.inclusion.centerWhite?.toUpperCase();
      inclusionData.openTable = inv.inclusion.openTable?.toUpperCase();
      inclusionData.openCrown = inv.inclusion.openCrown?.toUpperCase();
      inclusionData.openPavilion = inv.inclusion.openPavilion?.toUpperCase();
      inclusionData.openGirdle = inv.inclusion.openGirdle?.toUpperCase();
      if (inv.inclusion.girdleCondition && inv.inclusion.girdleCondition.length > 0)
        inclusionData.girdleCond.push(inv.inclusion.girdleCondition?.toUpperCase());
      inclusionData.eFOC = inv.inclusion.efoc?.toUpperCase();
      inclusionData.eFOP = inv.inclusion.efop?.toUpperCase();
      inclusionData.culet = inv.inclusion.culet?.toUpperCase();
      inclusionData.hNA = inv.inclusion.hna?.toUpperCase();
      inclusionData.eyeClean = inv.inclusion.eyeClean?.toUpperCase();

      let ktos = inv.inclusion.ktoS?.split(',');
      if (ktos && ktos.length > 0) {
        inclusionData.kToS = [];
        for (let index = 0; index < ktos.length; index++) {
          const element = ktos[index];
          inclusionData.kToS.push(element.trim());
          obj.ktoS.push(element.trim());
        }
      }

      inclusionData.naturalOnGirdle = inv.inclusion.naturalOnGirdle?.toUpperCase();
      inclusionData.naturalOnCrown = inv.inclusion.naturalOnCrown?.toUpperCase();
      inclusionData.naturalOnPavillion = inv.inclusion.naturalOnPavillion?.toUpperCase();
      inclusionData.flColor = inv.inclusion.flColor?.toUpperCase();
      inclusionData.luster = inv.inclusion.luster?.toUpperCase();
      inclusionData.bowTie = inv.inclusion.bowtie?.toUpperCase();
      inclusionData.certiComment = inv.inclusion.certiComment?.toUpperCase();

      obj.inclusion = inclusionData;
      obj.measurement = this.mappingMeasListForGrading(inv.measurement);

      let girdleData: GirdleDNorm = new GirdleDNorm();
      girdleData.min = inv.measurement.minGirdle?.toUpperCase();
      girdleData.max = inv.measurement.maxGirdle?.toUpperCase();

      obj.girdle = girdleData;
      obj.certComment = [];

      req.push(obj);

      let res = await this.measureGradeService.getPrice(req);
      if (res) {
        let result = await this.inventoryService.updateInventoryGrading(res);
        if (result) {
          this.utilityService.showNotification(`Stone grade updated!`);
        }
      }
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Something went wrong when get grade.');
    }
  }

  private mappingMeasListForGrading(measurment: InventoryItemMeasurement): MeasItems[] {
    let list: MeasItems[] = [];

    let measurData: MeasItems = new MeasItems();
    if (measurment.depth) {
      measurData.type = 'Depth';
      measurData.value = Number(measurment.depth);
      list.push(measurData);
    }

    if (measurment.table) {
      measurData = new MeasItems();
      measurData.type = 'Table';
      measurData.value = Number(measurment.table);
      list.push(measurData);
    }

    if (measurment.length) {
      measurData = new MeasItems();
      measurData.type = 'Length';
      measurData.value = Number(measurment.length);
      list.push(measurData);
    }

    if (measurment.width) {
      measurData = new MeasItems();
      measurData.type = 'Width';
      measurData.value = Number(measurment.width);
      list.push(measurData);
    }

    if (measurment.height) {
      measurData = new MeasItems();
      measurData.type = 'Height';
      measurData.value = Number(measurment.height);
      list.push(measurData);
    }

    if (measurment.crownHeight) {
      measurData = new MeasItems();
      measurData.type = 'CrHeight';
      measurData.value = Number(measurment.crownHeight);
      list.push(measurData);
    }

    if (measurment.crownAngle) {
      measurData = new MeasItems();
      measurData.type = 'CrAngle';
      measurData.value = Number(measurment.crownAngle);
      list.push(measurData);
    }

    if (measurment.pavilionDepth) {
      measurData = new MeasItems();
      measurData.type = 'PavDepth';
      measurData.value = Number(measurment.pavilionDepth);
      list.push(measurData);
    }

    if (measurment.pavilionAngle) {
      measurData = new MeasItems();
      measurData.type = 'PavAngle';
      measurData.value = Number(measurment.pavilionAngle);
      list.push(measurData);
    }

    if (measurment.ratio) {
      measurData = new MeasItems();
      measurData.type = 'Ratio';
      measurData.value = Number(measurment.ratio);
      list.push(measurData);
    }

    if (measurment.girdlePer) {
      measurData = new MeasItems();
      measurData.type = 'GirdlePer';
      measurData.value = Number(measurment.girdlePer);
      list.push(measurData);
    }

    return list;
  }

  public async onInvDelete() {
    try {
      if (this.fxCredentials?.origin != 'Admin') {
        this.alertDialogService.show(`You are not allow to delete stone.`);
        return;
      }

      this.alertDialogService.ConfirmYesNo("Are you sure you want to remove selected stone?", "Delete")
        .subscribe(async (res: any) => {
          this.mySelection = [];
          if (res.flag) {
            this.spinnerService.show();
            let res = await this.inventoryService.deleteInventoryData(this.inventoryObj.id)
            if (res && res == 1) {
              this.insertInvItemHistoryList([this.inventoryObj.id], InvHistoryAction.InvDeleted, `Stone is Removed from the Inventory page for stone`);
              await this.initInventoryData();
              this.getSummaryData();
              this.utilityService.showNotification(`Record deleted successfully!`)
            }
            else {
              this.spinnerService.hide();
              this.alertDialogService.show(`Something went wrong, Try again later!`);
            }
          }
        });
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public checkRequiredFields(): void {
    this.isFormValid = this.validateFields();
  }

  public validateFields(): boolean {
    const obj = this.inventoryObj;

    return this.checkStringNullOrEmpty(obj.stoneId)
      && this.checkStringNullOrEmpty(obj.kapan)
      // && this.checkStringNullOrEmpty(obj.article)
      // && this.checkStringNullOrEmpty(obj.rfid)
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
      && this.checkStringNullOrEmpty(obj.measurement.width?.toString() ?? '')
      && this.checkStringNullOrEmpty(obj.measurement.height?.toString() ?? '')
      && this.checkStringNullOrEmpty(obj.measurement.ratio?.toString() ?? '')
  }

  public checkStringNullOrEmpty(field: string): boolean {
    var flag = true;
    if (field == undefined || field == null || field?.length == 0 || (typeof field == 'undefined'))
      flag = false;
    return flag;
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

  public async filterBySearch() {
    this.skip = 0;
    this.assignAdditionalData();
    this.getSummaryData();
    this.initInventoryData();
    this.isSearchFilter = false;
  }

  //Match Name for Dropdown Selection
  public assignDropDownDataForEdit() {
    //Basic
    this.inventoryObj.shape = this.matchDropDownField(this.inventoryObj.shape, this.allTheShapes);
    this.inventoryObj.color = this.matchDropDownField(this.inventoryObj.color, this.allColors);
    this.inventoryObj.clarity = this.matchDropDownField(this.inventoryObj.clarity, this.allClarities);
    this.inventoryObj.fluorescence = this.matchDropDownField(this.inventoryObj.fluorescence, this.allTheFluorescences);
    this.inventoryObj.cut = this.matchDropDownField(this.inventoryObj.cut, this.allTheCPS);
    this.inventoryObj.polish = this.matchDropDownField(this.inventoryObj.polish, this.allTheCPS);
    this.inventoryObj.symmetry = this.matchDropDownField(this.inventoryObj.symmetry, this.allTheCPS);
    this.inventoryObj.lab = this.matchDropDownField(this.inventoryObj.lab, this.allTheLab);
    //Inclusion
    this.inventoryObj.inclusion.brown = this.matchDropDownField(this.inventoryObj.inclusion.brown, TypeFilterPipe.prototype.transform(this.inclusionData, 'brown'));
    this.inventoryObj.inclusion.shade = this.matchDropDownField(this.inventoryObj.inclusion.shade, TypeFilterPipe.prototype.transform(this.inclusionData, 'shade'));
    this.inventoryObj.inclusion.green = this.matchDropDownField(this.inventoryObj.inclusion.green, TypeFilterPipe.prototype.transform(this.inclusionData, 'green'));
    this.inventoryObj.inclusion.milky = this.matchDropDownField(this.inventoryObj.inclusion.milky, TypeFilterPipe.prototype.transform(this.inclusionData, 'milky'));

    this.inventoryObj.inclusion.sideBlack = this.matchDropDownField(this.inventoryObj.inclusion.sideBlack, TypeFilterPipe.prototype.transform(this.inclusionData, 'sideBlack'));
    this.inventoryObj.inclusion.centerSideBlack = this.matchDropDownField(this.inventoryObj.inclusion.centerSideBlack, TypeFilterPipe.prototype.transform(this.inclusionData, 'centerSideBlack'));
    this.inventoryObj.inclusion.centerBlack = this.matchDropDownField(this.inventoryObj.inclusion.centerBlack, TypeFilterPipe.prototype.transform(this.inclusionData, 'centerBlack'));
    this.inventoryObj.inclusion.sideWhite = this.matchDropDownField(this.inventoryObj.inclusion.sideWhite, TypeFilterPipe.prototype.transform(this.inclusionData, 'sideWhite'));
    this.inventoryObj.inclusion.centerSideWhite = this.matchDropDownField(this.inventoryObj.inclusion.centerSideWhite, TypeFilterPipe.prototype.transform(this.inclusionData, 'centerSideWhite'));
    this.inventoryObj.inclusion.centerWhite = this.matchDropDownField(this.inventoryObj.inclusion.centerWhite, TypeFilterPipe.prototype.transform(this.inclusionData, 'centerWhite'));

    this.inventoryObj.inclusion.openCrown = this.matchDropDownField(this.inventoryObj.inclusion.openCrown, TypeFilterPipe.prototype.transform(this.inclusionData, 'openCrown'));
    this.inventoryObj.inclusion.openTable = this.matchDropDownField(this.inventoryObj.inclusion.openTable, TypeFilterPipe.prototype.transform(this.inclusionData, 'openTable'));
    this.inventoryObj.inclusion.openPavilion = this.matchDropDownField(this.inventoryObj.inclusion.openPavilion, TypeFilterPipe.prototype.transform(this.inclusionData, 'openPavilion'));
    this.inventoryObj.inclusion.openGirdle = this.matchDropDownField(this.inventoryObj.inclusion.openGirdle, TypeFilterPipe.prototype.transform(this.inclusionData, 'openGirdle'));

    this.inventoryObj.inclusion.efoc = this.matchDropDownField(this.inventoryObj.inclusion.efoc, TypeFilterPipe.prototype.transform(this.inclusionData, 'eFOC'));
    this.inventoryObj.inclusion.efot = this.matchDropDownField(this.inventoryObj.inclusion.efot, TypeFilterPipe.prototype.transform(this.inclusionData, 'eFOT'));
    this.inventoryObj.inclusion.efop = this.matchDropDownField(this.inventoryObj.inclusion.efop, TypeFilterPipe.prototype.transform(this.inclusionData, 'eFOP'));
    this.inventoryObj.inclusion.efog = this.matchDropDownField(this.inventoryObj.inclusion.efog, TypeFilterPipe.prototype.transform(this.inclusionData, 'eFOG'));

    this.inventoryObj.inclusion.naturalOnCrown = this.matchDropDownField(this.inventoryObj.inclusion.naturalOnCrown, TypeFilterPipe.prototype.transform(this.inclusionData, 'naturalOnCrown'));
    this.inventoryObj.inclusion.naturalOnGirdle = this.matchDropDownField(this.inventoryObj.inclusion.naturalOnGirdle, TypeFilterPipe.prototype.transform(this.inclusionData, 'naturalOnGirdle'));
    this.inventoryObj.inclusion.naturalOnPavillion = this.matchDropDownField(this.inventoryObj.inclusion.naturalOnPavillion, TypeFilterPipe.prototype.transform(this.inclusionData, 'naturalonpavilion'));
    this.inventoryObj.inclusion.naturalOnTable = this.matchDropDownField(this.inventoryObj.inclusion.naturalOnTable, TypeFilterPipe.prototype.transform(this.inclusionData, 'naturalOnTable'));

    this.inventoryObj.inclusion.girdleCondition = this.matchDropDownField(this.inventoryObj.inclusion.girdleCondition, TypeFilterPipe.prototype.transform(this.inclusionData, 'girdleCondition'));
    this.inventoryObj.inclusion.culet = this.matchDropDownField(this.inventoryObj.inclusion.culet, TypeFilterPipe.prototype.transform(this.inclusionData, 'culet'));
    this.inventoryObj.inclusion.hna = this.matchDropDownField(this.inventoryObj.inclusion.hna, TypeFilterPipe.prototype.transform(this.inclusionData, 'hNA'));
    this.inventoryObj.inclusion.eyeClean = this.matchDropDownField(this.inventoryObj.inclusion.eyeClean, TypeFilterPipe.prototype.transform(this.inclusionData, 'eyeClean'));
    this.inventoryObj.inclusion.ktoS = this.matchDropDownField(this.inventoryObj.inclusion.ktoS, TypeFilterPipe.prototype.transform(this.inclusionData, 'ktoS'));
    this.inventoryObj.inclusion.flColor = this.matchDropDownField(this.inventoryObj.inclusion.flColor, TypeFilterPipe.prototype.transform(this.inclusionData, 'fLColor'));
    this.inventoryObj.inclusion.redSpot = this.matchDropDownField(this.inventoryObj.inclusion.redSpot, TypeFilterPipe.prototype.transform(this.inclusionData, 'redSpot'));
    this.inventoryObj.inclusion.luster = this.matchDropDownField(this.inventoryObj.inclusion.luster, TypeFilterPipe.prototype.transform(this.inclusionData, 'luster'));
    this.inventoryObj.inclusion.bowtie = this.matchDropDownField(this.inventoryObj.inclusion.bowtie, TypeFilterPipe.prototype.transform(this.inclusionData, 'bowtie'));
  }

  public matchDropDownField(field: string, list: MasterDNorm[] | undefined): string {
    var obj = list?.find(c => c.name.toLowerCase() == field?.toLowerCase() || c.displayName.toLowerCase() == field?.toLowerCase() || c.optionalWords && c.optionalWords.map(u => u.toLowerCase().trim()).includes(field?.toLowerCase()));
    if (obj)
      field = obj.name;
    return field;
  }
  //#endregion

  //#region Export To Excel / Mail / Proposal
  public async handleMailToFilter(value: any) {
    this.searchMailTo = await this.getSearchEmails(value);
  }

  public async handleCCFilter(value: any) {
    this.searchCCMail = await this.getSearchEmails(value);
  }

  public async handleBCCFilter(value: any) {
    this.searchBCCMail = await this.getSearchEmails(value);
  }

  public async getSearchEmails(value: any) {
    try {
      let res = await this.savedEmailService.searchMail(this.fxCredentials?.id ?? '', value);
      if (res) {
        this.spinnerService.hide();
        return res;
      }
      else
        this.spinnerService.hide();
    } catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show('Search data not found!', 'error');
    }
    return [];
  }

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

      // if (type == "export") {
      //   let blob = await this.exportExcelNew(this.exportData);
      //   if (blob)
      //     this.downloadBlobExcel(blob);
      //   this.excelOption = null;
      //   this.showExcelOption = false;
      // }
      // else 
      // if (type == "mail") {
      //   this.showExcelOption = false;
      //   this.basesixtyfour = null as any;
      //   this.openSendMailDialog();
      // }
      // else 
      if (type == "proposal") {
        if (this.excelOption == 'selected') {
          let stoneIds = this.exportData.filter(item => this.mySelection.includes(item.id)).map(z => z.stoneId);
          this.stoneProposalMail.stoneIds = stoneIds;
        }
        else {
          this.stoneProposalMail.criteriaJson = JSON.stringify(this.inventorySearchCriteriaObj);
          this.stoneProposalMail.stoneIds = this.exportData.map(z => z.stoneId);
        }
        this.stoneProposalMail.aDiscount = this.aDiscount;

        this.showExcelOption = false;
        this.openSendProposalDialog();
      }
      else if (type == "print") {
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
      'Origin': '',
      'Location': '',
      'MarksheetDate': ''
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
      'Origin': '',
      'Location': '',
      'MarksheetDate': ''
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
      'Origin': '',
      'Location': '',
      'MarksheetDate': ''
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
      'Origin': '',
      'Location': '',
      'MarksheetDate': ''
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
      'Origin': '',
      'Location': '',
      'MarksheetDate': ''
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
      'Origin': 'Origin',
      'Location': 'Location',
      'MarksheetDate': 'MarksheetDate'
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
        'Origin': z.kapanOrigin,
        'Location': z.location,
        'MarksheetDate': z.marketSheetDate
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

      let notValidEmail!: string;
      this.mailTo.forEach(z => {
        let isEmailValid = this.utilityService.checkValidEmail(z);
        if (!isEmailValid)
          notValidEmail = z;
      });
      if (notValidEmail) {
        this.alertDialogService.show(notValidEmail + ' Not valid email address!');
        return;
      }
      this.exportToExcelMailObj.toEmail = this.mailTo.join(',');

      this.ccEmail.forEach(z => {
        let isEmailValid = this.utilityService.checkValidEmail(z);
        if (!isEmailValid)
          notValidEmail = z;
      });
      if (notValidEmail) {
        this.alertDialogService.show(notValidEmail + ' Not valid email address!');
        return;
      }
      this.exportToExcelMailObj.cC = this.ccEmail.join(',');

      this.bccEmail.forEach(z => {
        let isEmailValid = this.utilityService.checkValidEmail(z);
        if (!isEmailValid)
          notValidEmail = z;
      });
      if (notValidEmail) {
        this.alertDialogService.show(notValidEmail + ' Not valid email address!');
        return;
      }
      this.exportToExcelMailObj.bcc = this.bccEmail.join(',');

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
        await this.saveEmailAddress();
        this.closeSendMailDialog();
      }
      else {
        console.error(res);
        if (res && res.message)
          this.alertDialogService.show(res.message);
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

  public async saveEmailAddress() {
    try {
      let data: SavedEmail[] = [];
      this.mailTo.forEach(z => {
        let email = new SavedEmail();
        email.email = z;
        email.createdBy = this.fxCredentials?.id ?? '';
        data.push(email);
      });

      this.ccEmail.forEach(z => {
        let email = new SavedEmail();
        email.email = z;
        email.createdBy = this.fxCredentials?.id ?? '';
        data.push(email);
      });

      this.bccEmail.forEach(z => {
        let email = new SavedEmail();
        email.email = z;
        email.createdBy = this.fxCredentials?.id ?? '';
        data.push(email);
      });

      await this.savedEmailService.insert(data);
    } catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show("Something went wrong, Try again later");
    }
  }

  public async sendProposal(form: NgForm) {
    try {
      if (!form.valid)
        return;

      this.prapoCust.forEach(item => {

        const customer = this.customer.find(z => z.id == item.value);
        if (customer != undefined && customer != null) {

          let cust = new CustomerDNorm();
          cust.id = customer.id;
          cust.name = customer.fullName;
          cust.code = customer.code;
          cust.email = customer.email;
          cust.mobile = customer.mobile1;
          cust.companyName = customer.companyName;
          cust.city = customer.address.city;

          this.praposalCust.push(cust);
        }
      });

      if (this.filterStoneByCerID && this.filterStoneByCerID.length > 0) {
        let certificateIds: string[] = this.utilityService.CheckStoneIdsAndCertificateIds(this.filterStoneByCerID);
        if (certificateIds.length > 0) {
          if (this.excelOption == 'selected') {
            let stoneIds = this.exportData.filter(item => this.mySelection.includes(item.id) && !certificateIds.includes(item.certificateNo)).map(z => z.stoneId);
            this.stoneProposalMail.stoneIds = stoneIds;
          }
          else {
            this.stoneProposalMail.stoneIds = this.exportData.filter(item => !certificateIds.includes(item.certificateNo)).map(z => z.stoneId);
          }
        }
      }

      this.stoneProposalMail.customerDNorms = this.praposalCust;

      let proposalUrl = environment.proposalUrl;
      this.stoneProposalMail.proposalUrl = proposalUrl + 'proposal';

      let systemUserData = this.systemUserItems.find(z => z.id == this.fxCredentials?.id ?? '');
      if (systemUserData) {
        let systemUser = new SystemUserDNorm();
        systemUser.id = systemUserData.id;
        systemUser.name = systemUserData.fullName;
        systemUser.email = systemUserData.emailConfig.emailId;
        systemUser.mobile = systemUserData.mobile;
        systemUser.address = systemUserData.address;

        this.stoneProposalMail.systemUser = systemUser;
        this.stoneProposalMail.companyname = systemUserData.companyName;
      }
      else {
        this.alertDialogService.show("Your session Expired, Try login again!");
        return;
      }

      this.spinnerService.show();
      let res = await this.stoneProposalService.sendStoneProposal(this.stoneProposalMail);

      if (res && res.isSuccess) {
        this.proposalSuccMsg = res.message;
        //this.alertDialogService.show(res.message);
        this.isProposalSuccess = true;

        this.excelOption = null;
        this.aDiscount = null as any;
        this.closeSendProposalDialog();
      }
      else {
        console.error(res);
        if (res && res.message)
          this.alertDialogService.show(res.message);
        else
          this.alertDialogService.show("Mail not send, Kindly check your email config.");

      }
      this.spinnerService.hide();
    }
    catch (error: any) {
      console.error(error);
      this.alertDialogService.show("Mail not send, Kindly check your email config.");
      this.spinnerService.hide();
    }
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
        <th>Lab</th>
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
        <td>`+ inv.lab + `</td>
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

  //#region LeadModal
  public async openLeadDialog(): Promise<void> {
    let stoneIds: string[] = []
    if (this.allInventoryItems && this.allInventoryItems.length > 0)
      stoneIds = this.allInventoryItems.filter(item => this.mySelection.includes(item.id)).map(z => z.stoneId);
    else
      stoneIds = this.inventoryItems.filter(item => this.mySelection.includes(item.id)).map(z => z.stoneId);

    if (stoneIds && stoneIds.length > 0) {
      this.leadListInvInput = new Array<InvItem>();
      this.spinnerService.show();
      let fetchData: InvItem[] = await this.inventoryService.getInventoryDNormsByStones(stoneIds, " " as any);
      let soldStonesInv: InvItem[] = fetchData.filter(x => x.status == StoneStatus.Sold.toString());
      if (fetchData && fetchData.length > 0) {
        fetchData = fetchData.filter(x => x.status != StoneStatus.Sold.toString());

        for (let index = 0; index < fetchData.length; index++) {
          let oi = new InvItem();
          const element: any = fetchData[index];
          oi = element;
          this.leadListInvInput.push(oi)
        }
        if (soldStonesInv && soldStonesInv.length > 0)
          this.alertDialogService.show(`${soldStonesInv.length == 1 ? soldStonesInv[0].stoneId.toString() + ' Stone is' : soldStonesInv.map(x => x.stoneId).join(", ") + ' Stones are'} on <b>Sold</b>.`);
        else
          this.isLeadModal = true;
      }
      else
        this.alertDialogService.show(`${stoneIds.length == 1 ? stoneIds.toString() + ' Stone is' : stoneIds.join(", ") + ' Stones are'} not found in inventory.`);
    }
    else
      this.alertDialogService.show(`Stone Ids are not found.`);
    this.spinnerService.hide();
  }

  public async closeLeadDialog(flag: boolean): Promise<void> {
    if (flag == undefined)
      this.isLeadModal = false;
    else if(flag)
      this.isLeadModal = false;
    await this.initInventoryData();
    this.mySelection = [];
  }
  //#endregion

  //#region  Pricing Request Section
  public async onPricingRequest() {
    if (this.mySelection.length == 0) {
      this.alertDialogService.show("Please select atleast one stone");
      return;
    }

    this.alertDialogService.ConfirmYesNo("Are you sure you want to pricing request for selected stone(s)?", "Update")
      .subscribe(async (res: any) => {
        if (res.flag) {
          try {
            this.spinnerService.show();
            let stoneIds: string[] = this.allInventoryItems.filter(item => this.mySelection.includes(item.id)).map(i => i.stoneId)
            let res: InventoryItems[] = await this.inventoryService.getInventoryByStoneIds(stoneIds);
            if (res && res.length > 0) {

              let exists = res.filter(z => z.isPricingRequest || z.isHold || z.isMemo || z.status == StoneStatus.Sold.toString());
              if (exists.length == res.length) {
                let pricingReqStoneIds = res.filter(z => z.isPricingRequest).map(z => z.stoneId);
                let holdStoneIds = res.filter(z => z.isHold).map(z => z.stoneId);
                let memoStoneIds = res.filter(z => z.isMemo).map(z => z.stoneId);
                let soldStoneIds = res.filter(z => z.status == StoneStatus.Sold.toString()).map(z => z.stoneId);

                let msg = "Not valid Pricing Request!";
                if (pricingReqStoneIds.length > 0)
                  msg += '<br />' + pricingReqStoneIds.join(',') + " stone(s) already in Pricing Request!";
                if (holdStoneIds.length > 0)
                  msg += '<br />' + holdStoneIds.join(',') + " stone(s) in Hold!";
                if (memoStoneIds.length > 0)
                  msg += '<br />' + memoStoneIds.join(',') + " stone(s) in Memo!";
                if (soldStoneIds.length > 0)
                  msg += '<br />' + soldStoneIds.join(',') + " stone(s) already Sold!";

                this.alertDialogService.show(msg);
                this.spinnerService.hide();
                return;
              }
              else if (exists.length > 0)
                this.utilityService.showNotification(exists.length.toString() + ' stone(s) not Valid!', 'warning');

              res = res.filter(z => !z.isPricingRequest);
              stoneIds = res.map(a => a.stoneId);

              let resultPricingReq = await this.savePricingRequest(res);
              if (resultPricingReq) {
                let result = await this.inventoryService.updateInventoryPricingFlag(stoneIds);
                if (result) {
                  this.insertInvItemHistoryList(stoneIds, InvHistoryAction.PricingRequest, `Updated the PricingRequest from the Inventory page for stone`);
                  await this.initInventoryData();
                  this.spinnerService.hide();
                  this.utilityService.showNotification(res.length + ' stone(s) pricing request submitted!');
                  this.utilityService.showNotification(res.length + ' stone(s) inventory data updated!');
                }
              }
              else {
                this.spinnerService.hide();
                this.alertDialogService.show('Pricing request not inserted, Please contact administrator!', 'error');
              }
            }

          } catch (error: any) {
            console.error(error);
            this.spinnerService.hide();
            this.alertDialogService.show(error.error);
          }
        }
      });
  }

  public async savePricingRequest(inv: InventoryItems[]): Promise<boolean> {
    try {
      let pricingRequest: PricingRequest[] = this.mappingPricingRequest(inv);
      return await this.pricingRequestService.insertPricingRequest(pricingRequest, "ManualPricingReq");
    } catch (error: any) {
      console.error(error);
      this.alertDialogService.show('Pricing request not inserted, Please contact administrator!', 'error');
      this.spinnerService.hide();
      return false;
    }
  }

  //insert invLogItem
  public async insertInvItemHistoryList(invIds: string[], action: string, desc: string) {
    try {
      var invHistorys: InvHistory[] = [];
      this.inventoryItems?.map((item) => {
        if (invIds.includes(item.stoneId) || invIds.includes(item.id)) {
          const invHistory = new InvHistory()
          invHistory.stoneId = item.stoneId;
          invHistory.invId = item.id;
          invHistory.action = action;
          invHistory.userName = this.fxCredentials?.fullName ?? "";
          invHistory.price = item.price;
          invHistory.supplier = item.supplier;
          invHistory.description = desc + " " + item.stoneId;
          invHistorys.push(invHistory);
        }
      })
      if (invHistorys.length > 0)
        await this.invHistoryService.InsertInvHistoryList(invHistorys);
    }
    catch (error: any) {
      this.alertDialogService.show(error.error);
    }
  }

  public mappingPricingRequest(inv: InventoryItems[]): PricingRequest[] {
    let pricingRequest: PricingRequest[] = [];

    inv.forEach(z => {
      let pricing: PricingRequest = new PricingRequest();
      pricing.stoneId = z.stoneId;
      pricing.certificateNo = z.certificateNo;
      pricing.kapan = z.kapan;
      pricing.article = z.article;
      pricing.grade = z.grade;
      pricing.shape = z.shape;
      pricing.weight = z.weight;
      pricing.color = z.color;
      pricing.clarity = z.clarity;
      pricing.cut = z.cut;
      pricing.polish = z.polish;
      pricing.symmetry = z.symmetry;
      pricing.fluorescence = z.fluorescence;
      pricing.lab = z.lab;
      pricing.location = z.location;
      pricing.comments = z.comments;

      pricing.inclusion = z.inclusion;
      pricing.measurement = z.measurement;

      pricing.marketSheetDate = z.marketSheetDate;
      pricing.media = z.media;
      pricing.isHold = z.isHold;
      pricing.isRapnetHold = z.isRapnetHold;
      pricing.holdDate = z.holdDate;
      pricing.holdDays = z.holdDays;
      if (z.status == StoneStatus.Stock.toString())
        pricing.availableDays = z.availableDays;

      pricing.basePrice = z.basePrice;
      pricing.price = z.price;
      pricing.status = z.status;

      pricing.supplier = z.supplier;
      if (z.identity.id != null)
        pricing.identity = z.identity;
      else {
        pricing.identity.id = this.fxCredentials?.id ?? '';
        pricing.identity.name = this.fxCredentials?.fullName ?? '';
        pricing.identity.type = this.fxCredentials?.origin ?? '';
      }

      pricingRequest.push(pricing);
    });

    return pricingRequest;
  }

  //#endregion

  //#region BaseDiscountModel
  public openBaseDiscountDialog() {
    this.isEditBaseDiscount = true;
  }

  public closeUpdateDiscontDialog() {
    this.isEditBaseDiscount = false;
  }

  public async UpdateBaseDiscount(form: NgForm) {
    if (form.valid) {
      this.spinnerService.show();
      let updateBaseDiscount = new UpdateBaseDisc();
      updateBaseDiscount.stoneId = this.inventoryObj.stoneId;
      updateBaseDiscount.rap = this.inventoryObj.basePrice.rap;
      updateBaseDiscount.discount = this.inventoryObj.basePrice.discount;
      updateBaseDiscount.netAmount = this.inventoryObj.basePrice.netAmount;
      updateBaseDiscount.perCarat = this.inventoryObj.basePrice.perCarat;

      var suplier = this.suppliers.find(c => c.code == this.inventoryObj.supplier.code);

      if (suplier && suplier.apiPath) {
        var result = await this.inventoryService.updateInventoryBaseDisc(updateBaseDiscount);

        if (result) {
          var res = await this.commuteService.updateBaseDiscount(updateBaseDiscount, suplier.apiPath);
          if (res)
            this.utilityService.showNotification(`Inventory base discount updated sucessfully!`);
          else
            this.alertDialogService.show(`Inventory base discount not updated, Try again later!`);
        }
        else
          this.alertDialogService.show(`Inventory base discount not updated, Try again later!`);

        this.initInventoryData();
        this.isEditBaseDiscount = false;
        this.spinnerService.hide();
      }
      else {
        this.isEditBaseDiscount = false;
        this.spinnerService.hide();
        this.alertDialogService.show(`Suplier ApiPath not found!`);
      }
    }
  }
  //#endregion
  
    public onOpenDropdown(list: Array<{ name: string; isChecked: boolean }>, e: boolean, selectedData: string[]): boolean {
    if (selectedData?.length == list.map(z => z.name).length)
      e = true;
    else
      e = false;
    return e;
  }
}
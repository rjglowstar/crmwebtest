import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { Align } from '@progress/kendo-angular-popup';
import { DataResult, GroupDescriptor, process, SortDescriptor } from '@progress/kendo-data-query';
import { NgxSpinnerService } from 'ngx-spinner';
import { fromEvent } from 'rxjs';
import { debounceTime, filter, map } from 'rxjs/operators';
import { GirdleDNorm, GradeSearchItems, GridDetailConfig, InclusionPrice, MeasItems, MfgInclusionData, MfgMeasurementData, MfgPricingRequest } from 'shared/businessobjects';
import { fxCredential, GridConfig, GridMasterConfig, InclusionConfig, MasterConfig, MasterDNorm, MeasurementConfig, Notifications, SystemUserPermission } from 'shared/enitites';
import { ConfigService, FileStoreService, listExportRequestFilterLocation, listGrainingItems, MeasureGradeService, NotificationService, PricingService, StoneStatus, TypeA, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { HoldInventoryItems, InventorySearchCriteria, InventorySelectAllItems, InventorySummary, TempPendingPricing, UpdateInventoryItem, UpdateNCInventory, WeightRange } from '../../businessobjects';
import { Department, Employee, ExportRequest, InventoryItemMeasurement, InventoryItems, PriceDNorm } from '../../entities';
import { BoUtilityService, CommuteService, EmployeeService, ExportRequestService, GridPropertiesService, InclusionuploadService, InventoryService, MasterConfigService, OrganizationService } from '../../services';
import { TypeFilterPipe } from 'shared/directives/typefilter.pipe';
import { environment } from 'environments/environment';
import { MediaStatus } from '../../businessobjects/common/mediastatus';
import { Media } from '../../entities/inventory/media';
import { LabUpdateItem } from '../../businessobjects/commute/labUpdateItem';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css']
})
export class InventoryComponent implements OnInit {
  @ViewChild('folderUpload') folderUpload!: ElementRef;
  public disabledFlag: boolean = false;
  public sort: SortDescriptor[] = [];
  public groups: GroupDescriptor[] = [];
  public groupsIssue: GroupDescriptor[] = [];
  public pageSize = 26;
  public skip = 0
  public fields!: GridDetailConfig[];
  public fieldsManualIssue!: GridDetailConfig[];
  public gridView!: DataResult;
  public gridViewIssue!: DataResult;
  public filterFlag = true;
  public selectableSettings: SelectableSettings = { mode: 'multiple', };
  public isShowCheckBoxAll: boolean = true;
  public allInventoryItems: InventorySelectAllItems[] = [];
  public openedConfirmationPartyDetails = false;
  public skeletonArray = new Array(18);
  public mySelection: string[] = [];
  public InventoryObj: InventoryItems = new InventoryItems();
  public inventoryItems: InventoryItems[] = [];
  public selectedInventoryItems: InventoryItems[] = [];
  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains'
  };
  public filterkts: boolean = true;
  public insertFlag: boolean = true;
  public inventorySearchCriteriaObj: InventorySearchCriteria = new InventorySearchCriteria();
  public tempInventorySearchCriteriaObj: InventorySearchCriteria = new InventorySearchCriteria();
  public stoneId?: "";
  public certificateNo?: "";
  public isManualIssue: boolean = false;
  public islabIssue: boolean = false;
  public islabReceive: boolean = false;
  public isMemo: boolean = false;
  public listDepartmentItems: Array<{ text: string; value: string }> = [];
  public listEmpItems: Array<{ text: string; value: string }> = [];
  public listEmployeeItems: Array<{ text: string; value: string }> = [];
  public listPacketsItems: string[] = [];
  public deptItems!: Department[];
  public selectedDeptItems?: { text: string, value: string };
  public selectedDeptItemsIssue?: { text: string, value: string };
  public empItems!: Employee[];
  public selectedEmpItems?: { text: string, value: string };
  public selectedEmpItemsIssue?: { text: string, value: string };
  public packetsItems!: InventoryItems[];
  public selectedPacketsItems?: { text: string, value: string };
  public fxCredentials!: fxCredential;
  public masterConfigList!: MasterConfig;
  public allTheShapes!: MasterDNorm[];
  public allClarities!: MasterDNorm[];
  public allColors!: MasterDNorm[];
  public allTheFluorescences!: MasterDNorm[];
  public allTheCPS!: MasterDNorm[];
  public totalCount?: number;
  public totalWeight?: number;
  public totalNetAmount?: number;
  public cntMnuStones?: string;
  public sumMnuStonesWeight?: string;
  public isGridConfig: boolean = false;
  public gridConfig!: GridConfig;
  public gridMasterConfigResponse!: GridMasterConfig;
  public isStockConsignment: boolean = false;
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
  public listTypeA: Array<{ name: string; isChecked: boolean }> = [];
  public invResponse: InventorySummary = new InventorySummary();
  public isEditInventory: boolean = false;
  public isSearchFilter: boolean = false;
  public isShowMedia: boolean = false;
  public isFormValid: boolean = false;
  public showExcelOption = false;
  public isSendMail = false;
  public isAdminRole = false;
  @ViewChild("anchor") public anchor!: ElementRef;
  @ViewChild("popup", { read: ElementRef }) public popup!: ElementRef;
  @ViewChild('BarcodeInput') barcodeInput!: ElementRef;
  public anchorAlign: Align = { horizontal: "right", vertical: "bottom" };
  public popupAlign: Align = { horizontal: "center", vertical: "top" };
  public excelOption: string | null = 'selected';
  public excelFile: any[] = [];
  public isVisiable: boolean = true;
  public message: Notifications = new Notifications();
  public inventoryObj: InventoryItems = new InventoryItems();
  public selectedCustomer?: { text: string, value: string };
  public selectedCPS?: string;
  public isBGM: boolean = false;
  public allTheLab?: MasterDNorm[];
  public inclusionData: MasterDNorm[] = [];
  public inclusionFlag: boolean = false;
  public inclusionConfig: InclusionConfig = new InclusionConfig();
  public measurementData: MasterDNorm[] = [];
  public measurementConfig: MeasurementConfig = new MeasurementConfig();
  public listKToS: Array<{ name: string; isChecked: boolean }> = [];
  public listCulet: Array<{ name: string; isChecked: boolean }> = [];
  public listLocation: Array<{ name: string; isChecked: boolean }> = [];
  public listGrainingItems = listGrainingItems;
  public listKapanItems: Array<{ name: string; isChecked: boolean }> = [];
  public listIGradeItems: Array<{ name: string; isChecked: boolean }> = [];
  public listMGradeItems: Array<{ name: string; isChecked: boolean }> = [];
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
  public isSummary = false;
  public selectedStoneIds: string[] = new Array<string>();
  public selectAllFlag: boolean = false;
  public isMediaDialog: boolean = false;
  public isUploading: boolean = false;
  public isUploaded: boolean = false;
  public errorStoneIds: string[] = [];
  public fileUploadItems: Array<{ stoneId: string, file: File[], status: string }> = new Array<{ stoneId: string, file: File[], status: string }>();
  public allowedFileNames: string[] = ["0.json", "1.json", "2.json", "3.json", "4.json", "5.json", "6.json", "7.json", "sm.json", "still.jpg", "video.mp4", "Arrow_Black_BG.jpg", "ASET_White_BG.jpg", "Heart_Black_BG.jpg", "IDEAL_White_BG.jpg", "Office_Light_Black_BG.jpg"];
  public isDisabled: boolean = true;
  public listDateType: Array<string> = [
    "Blank",
    "Arrival",
    "LabSend",
    "LabResult",
    "LabReceive",
    "MarketSheet"
  ];
  public heldByItems!: string[];
  public listHeldByItems: Array<{ name: string; isChecked: boolean }> = [];
  public isCanIssueInventory: boolean = false;
  public isCanEditInventory: boolean = false;
  public isCanNonCertiInventory: boolean = false;
  public isCanLabIssueInventory: boolean = false;
  public isCanMemoIssueInventory: boolean = false;
  public isCanDeleteInventory: boolean = false;
  public isViewButtons: boolean = false;
  public showExportRequest: boolean = false;
  public myExportReqSelection: string[] = [];
  public gridExportReqList!: DataResult;
  public exportRequestData: ExportRequest[] = [];
  public applyLocation: string = '';
  public listExportRequestFilterLocation = listExportRequestFilterLocation;
  public exportData: InventoryItems[] = [];
  public basesixtyfour: any;

  public isSummaryLoading: boolean = false;
  public loadingHtml = '<img src="commonAssets/images/dialoading.gif" width="25px" alt="loading" />';
  public isFirstTimeLoad = true;

  constructor(public router: Router,
    private gridPropertiesService: GridPropertiesService,
    public utilityService: UtilityService,
    private inventoryService: InventoryService,
    private alertDialogService: AlertdialogService,
    private spinnerService: NgxSpinnerService,
    private organizationService: OrganizationService,
    private employeeService: EmployeeService,
    private masterConfigService: MasterConfigService,
    private configService: ConfigService,
    private changeDetRef: ChangeDetectorRef,
    private notificationService: NotificationService,
    public datepipe: DatePipe,
    public fileStoreService: FileStoreService,
    private pricingService: PricingService,
    private commuteService: CommuteService,
    private inclusionuploadService: InclusionuploadService,
    private exportRequestService: ExportRequestService,
    private measureGradeService: MeasureGradeService,
    private boUtilityService: BoUtilityService) { }

  async ngOnInit() {
    await this.defaultMethodsLoad();
  }

  //#region DefaultMethod
  async defaultMethodsLoad() {
    try {
      this.fxCredentials = JSON.parse(sessionStorage.getItem("fxCredentials") ?? '') as fxCredential;
      if (this.fxCredentials && this.fxCredentials.origin.toLowerCase() == 'admin')
        this.isAdminRole = true;

      if (this.fxCredentials && this.fxCredentials.origin && (this.fxCredentials.origin.toLowerCase() == 'admin' || this.fxCredentials.origin.toLowerCase() == 'opmanager' || this.fxCredentials.origin.toLowerCase() == 'accounts'))
        this.isViewButtons = true;

      this.spinnerService.show();
      this.utilityService.filterToggleSubject.subscribe(flag => {
        this.filterFlag = flag;
      });

      this.setUserRights();
      await this.getGridConfiguration();
      await this.initInventoryData();

      this.getInvSummaryData();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public setUserRights(): void {
    let userPermissions: SystemUserPermission = new SystemUserPermission();
    let sesValue = sessionStorage.getItem("userPermission");
    if (sesValue)
      userPermissions = JSON.parse(sesValue) as SystemUserPermission;
    if (userPermissions.actions.length > 0) {
      let CanIssueInventory = userPermissions.actions.find(z => z.name == "CanIssueInventory");
      if (CanIssueInventory != null)
        this.isCanIssueInventory = true;
      let CanEditInventory = userPermissions.actions.find(z => z.name == "CanEditInventory");
      if (CanEditInventory != null)
        this.isCanEditInventory = true;
      let CanNonCertiInventory = userPermissions.actions.find(z => z.name == "CanNonCertiInventory");
      if (CanNonCertiInventory != null)
        this.isCanNonCertiInventory = true;
      let CanLabIssueInventory = userPermissions.actions.find(z => z.name == "CanLabIssueInventory");
      if (CanLabIssueInventory != null)
        this.isCanLabIssueInventory = true;
      let CanMemoIssueInventory = userPermissions.actions.find(z => z.name == "CanMemoIssueInventory");
      if (CanMemoIssueInventory != null)
        this.isCanMemoIssueInventory = true;
      let CanDeleteInventory = userPermissions.actions.find(z => z.name == "CanDeleteInventory");
      if (CanDeleteInventory != null)
        this.isCanDeleteInventory = true;
    }
  }

  public async getMasterConfigData() {
    Object.values(StoneStatus).forEach(z => { this.listStatus.push({ name: z.toString(), isChecked: false }); });

    //TypeA
    Object.values(TypeA).forEach(z => { this.listTypeA.push({ name: z.toString(), isChecked: false }); });

    this.utilityService.onMultiSelectChange(this.listStatus, this.inventorySearchCriteriaObj.status);
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

    let iGradeItems = await this.inventoryService.getOrgIGradeList(this.inventorySearchCriteriaObj.organizationId ?? '');
    iGradeItems.forEach(z => { this.listIGradeItems.push({ name: z, isChecked: false }); });

    let mGradeItems = await this.inventoryService.getOrgMGradeList(this.inventorySearchCriteriaObj.organizationId ?? '');
    mGradeItems.forEach(z => { this.listMGradeItems.push({ name: z, isChecked: false }); });

    await this.getLocationData();
  }

  // private async getCountryData() {
  //   try {
  //     var countryItems = await this.commonService.getCountries();
  //     if (countryItems)
  //       countryItems.forEach(z => { this.listLocation.push({ name: z.name, isChecked: false }); });
  //   }
  //   catch (error: any) {
  //     this.alertDialogService.show(error.error);
  //   }
  // }

  private async getDepartmentsByOrgId() {
    try {
      this.deptItems = await this.organizationService.getDepartmentByOrganizationId(this.fxCredentials.organizationId);
      this.listDepartmentItems = [];
      this.deptItems.forEach(z => { this.listDepartmentItems.push({ text: z.name, value: z.id }); });
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public onDepartmentChange(e: any) {
    const dept = this.deptItems.find(z => z.id == e.value);
    if (dept != undefined && dept != null) {
      this.inventorySearchCriteriaObj.deptId = dept.id ?? '';
      this.getEmployeeData(dept.id);
    }
  }

  public async getEmployeeData(deptid: string) {
    this.empItems = await this.employeeService.getAllEmployees();
    if (this.empItems) {
      let empdata = this.empItems.filter(z => z.departmentId == deptid)
      if (empdata) {
        this.listEmpItems = [];
        empdata.forEach((z) => { this.listEmpItems.push({ text: z.fullName, value: z.id }); });
      }
    }
  }

  public onEmployeeChange(e: any) {
    const emp = this.empItems.find(z => z.id == e.value);
    if (emp != undefined && emp != null)
      this.inventorySearchCriteriaObj.empId = emp.id ?? '';
  }

  public async getHeldByData() {
    this.heldByItems = await this.inventoryService.getHeldByList();
    if (this.heldByItems)
      this.heldByItems.forEach((z) => { this.listHeldByItems.push({ name: z, isChecked: false }); });
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

  //#region Grid Config
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

  public onSelect(event: any): void {
    try {
      if (event.selectedRows && event.selectedRows.length > 0) {
        event.selectedRows.forEach((element: any) => {
          let Selectedindex = this.selectedInventoryItems.findIndex(x => x.stoneId == element.dataItem.stoneId);
          if (Selectedindex < 0)
            this.selectedInventoryItems.push(element.dataItem)
        });
      }
      else {
        event.deselectedRows.forEach((element: any) => {
          if (!element.dataItem.isDisabled) {
            let index = this.selectedInventoryItems.findIndex(x => x.stoneId == element.dataItem.stoneId);
            if (index >= 0)
              this.selectedInventoryItems.splice(index, 1)
          }
        });
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public groupChange(groups: GroupDescriptor[]): void {
    try {
      this.groups = groups;
      this.initInventoryData();
    }
    catch (error: any) {
      this.alertDialogService.show(error.error)
    }
  }

  public sortChange(sort: SortDescriptor[]): void {
    this.sort = sort;
    this.initInventoryData();
  }

  public pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.initInventoryData();
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
  //#endregion  

  //#region Inv Search Filter Data
  public async getInvSummaryData() {
    try {
      this.isSummaryLoading = true;
      this.gridView.total = 0;
      this.inventorySearchCriteriaObj.selectedStones = this.mySelection;
      this.invResponse = await this.inventoryService.getInvSummary(this.inventorySearchCriteriaObj);
      if (this.invResponse) {
        this.gridView = process(this.inventoryItems, { group: this.groups });
        this.gridView.total = this.invResponse.totalCount;
        this.isSummaryLoading = false;
      }
      else
        this.isSummaryLoading = false;

    }
    catch (error: any) {
      console.error(error);
      this.isSummaryLoading = false;
      this.alertDialogService.show('Summary not get, Please contact administrator!');
    }
  }

  public async initInventoryData() {
    try {
      this.spinnerService.show();
      // this.inventorySearchCriteriaObj.selectedStones = this.mySelection;
      this.inventoryItems = await this.inventoryService.getPaginatedInvItem(this.inventorySearchCriteriaObj, this.skip, this.pageSize);

      this.inventoryItems.forEach(z => {
        let index = this.allInventoryItems.findIndex(a => a.stoneId == z.stoneId);
        if (index == -1)
          this.allInventoryItems.push({ id: z.id, stoneId: z.stoneId, certificateNo: z.certificateNo, status: z.status });
      });
      this.gridView = process(this.inventoryItems, { group: this.groups, sort: this.sort });
      this.gridView.total = this.invResponse.totalCount;

      this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async getInventoryDetailsByStoneId(stoneIds: string[]) {
    try {
      this.spinnerService.show();
      this.selectedInventoryItems = await this.inventoryService.getInventoryByStoneIds(stoneIds);
      this.spinnerService.hide();
    } catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Inventory not get, Try aagain later!')
    }
  }
  //#endregion

  //#region ManualIssue Dialog
  public async openManualIssueDialog(): Promise<void> {
    try {
      setTimeout(async () => {
        await this.onAddBarcode();
      }, 500);

      this.isManualIssue = true;
      this.gridViewIssue = { data: [], total: 0 };
      this.fieldsManualIssue = JSON.parse(JSON.stringify(this.fields));
      this.fieldsManualIssue.filter(z => z.title.toLowerCase() == "checkbox").forEach(z => { z.isSelected = false });
      this.loadManualIssueGrid();

    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async loadManualIssueGrid() {
    try {
      this.spinnerService.show();
      if (this.selectAllFlag)
        await this.getInventoryDetailsByStoneId(this.selectedStoneIds);

      if (this.selectedInventoryItems.length > 0) {
        let invalidStonesStatus = this.selectedInventoryItems.filter(c => c.status != null && c.status.toLowerCase() == 'lab').map(c => c.stoneId).join(', ');
        let invalidStonesMemo = this.selectedInventoryItems.filter(c => c.isMemo).map(c => c.stoneId).join(', ');
        //let invalidStonesHasTask = this.selectedInventoryItems.filter(c => c.hasTask).map(c => c.stoneId).join(', ');

        this.selectedInventoryItems = this.selectedInventoryItems.filter(c => !c.isMemo && (c.status != null && c.status.toLowerCase() != 'lab'));

        let message = '';
        if (invalidStonesStatus.length > 0)
          message += `${invalidStonesStatus} <b>Invalid Status</b> <br/>`;
        if (invalidStonesMemo.length > 0)
          message += `${invalidStonesMemo} <b>In Memo</b> <br/>`;
        //if (invalidStonesHasTask.length > 0)
        //message += `${invalidStonesHasTask} <b>In HasTask</b> <br/>`;

        if (message)
          this.alertDialogService.show(message);

        this.gridViewIssue = process(this.selectedInventoryItems, { group: this.groupsIssue });

        this.cntMnuStones = this.selectedInventoryItems.length.toString();
        let totalWeight = 0.0;
        this.selectedInventoryItems.forEach(z => {
          totalWeight = totalWeight + z.weight;
        });
        this.sumMnuStonesWeight = totalWeight.toFixed(2);
        this.spinnerService.hide();

      }
      this.spinnerService.hide();

    } catch (error: any) {
      this.spinnerService.hide();
      console.error(error);
      this.alertDialogService.show(error.error);
    }

  }

  public async onAddPacket() {
    try {
      let tempSelectData = [...this.selectedInventoryItems];
      let selectedindex = this.inventoryItems.findIndex(x => x.stoneId == this.selectedPacketsItems?.value);
      if (selectedindex >= 0) {
        let existIndex = this.selectedInventoryItems.findIndex(x => x.stoneId == this.selectedPacketsItems?.value);
        if (existIndex >= 0) {
          this.alertDialogService.show(`${this.inventoryItems[selectedindex].stoneId} <b>already exist</b> in list`);
          return;
        }
        tempSelectData.push(this.inventoryItems[selectedindex])
        this.selectedInventoryItems.push(this.inventoryItems[selectedindex])
      }
      this.loadManualIssueGrid();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }
  //#endregion

  //#region Dialog
  public closeManualIssueDialog(): void {
    this.isManualIssue = false;
    this.gridViewIssue = { data: [], total: 0 };
    this.mySelection = [];
    this.selectedInventoryItems = [];
    this.selectedPacketsItems = undefined;
    this.selectedDeptItemsIssue = undefined;
    this.selectedEmpItemsIssue = undefined;
    this.selectAllFlag = false;
  }

  public async openLabIssueDialog(): Promise<void> {
    if (this.selectAllFlag)
      await this.getInventoryDetailsByStoneId(this.selectedStoneIds);
    this.islabIssue = true;

  }

  public async openLabReceiveDialog(): Promise<void> {
    if (this.selectAllFlag)
      await this.getInventoryDetailsByStoneId(this.selectedStoneIds);
    this.islabReceive = true;
  }

  public async openMemoDialog(): Promise<void> {
    if (this.selectAllFlag)
      await this.getInventoryDetailsByStoneId(this.selectedStoneIds);

    let message = '';
    let invalidStonesMemo = this.selectedInventoryItems.filter(c => c.isMemo).map(c => c.stoneId).join(', ');
    if (invalidStonesMemo.length > 0)
      message += `${invalidStonesMemo} <b>In Memo</b> <br/>`;

    // let invalidStonesHold = this.selectedInventoryItems.filter(c => c.isHold).map(c => c.stoneId).join(', ');
    // if (invalidStonesHold.length > 0)
    //   message += `${invalidStonesHold} <b>In Hold</b> <br/>`;

    if (message) {
      this.alertDialogService.show(message);
      this.selectAllFlag = false;
    }
    else
      this.isMemo = true;
  }

  public openMediaDialog(title: string, type: string, inv: InventoryItems): void {
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
    }

    this.mediaTitle = title;
    this.mediaSrc = src;
    this.mediaType = type;
    this.isShowMedia = true;
  }

  public openMediaUploadDialog() {
    this.isMediaDialog = true;
  }

  public closeMediaUploadDialog() {
    this.isMediaDialog = false;
    this.resetUploadMedia();
  }

  public async uploadFolders(form: NgForm, event: Event) {
    try {
      const target = event.target as HTMLInputElement;
      let stoneIds: string[] = [];
      let isError: boolean = false;
      if (target.files && target.files.length) {
        for (let i = 0; i < target.files.length; i++) {
          let file: any = target.files[i];
          if (file && file.webkitRelativePath && this.allowedFileNames.includes(file.name)) {
            let stId = (file && file.webkitRelativePath) ? file.webkitRelativePath.split("/")[1].toUpperCase() : "";
            if (this.fileUploadItems.some(c => c.stoneId == stId)) {
              let index = this.fileUploadItems.findIndex(c => c.stoneId == stId);
              this.fileUploadItems[index].file.push(file);
            }
            else {
              this.fileUploadItems.push({ file: [file], stoneId: stId, status: "Pending" });
              stoneIds.push(stId);
            }
          }
          else
            isError = true;
        }

        if (stoneIds && stoneIds.length > 0) {
          this.errorStoneIds = await this.inventoryService.getAvailableInvIds(stoneIds);
          if (this.errorStoneIds && this.errorStoneIds.length > 0)
            this.fileUploadItems = this.fileUploadItems.filter(c => !this.errorStoneIds.includes(c.stoneId));
        }
      }

      if (isError) {
        this.alertDialogService.show("Some files contain invalid files.");
      }
    }
    catch (error: any) {
      console.error(error);
      this.alertDialogService.show("Something went wrong upload Folders, Try again later");
    }
  }

  public async uploadOnServer() {
    try {
      this.isUploading = true;
      this.isUploaded = false;
      let mediaStatus: MediaStatus[] = new Array<MediaStatus>();
      if (this.fileUploadItems && this.fileUploadItems.length > 0) {
        for (let i = 0; i < this.fileUploadItems.length; i++) {
          if (this.fileUploadItems[i].status != "Completed") {
            let files = this.fileUploadItems[i];
            files.status = "Uploading";
            let res = await this.fileStoreService.uploadDiamondImages(files.file, files.stoneId);
            if (res) {
              files.status = "Completed";
              mediaStatus.push({ stoneId: files.stoneId, media: this.setStoneMedia(files.file) })
            }
          }
        }
      }

      if (mediaStatus && mediaStatus.length > 0) {
        let flag: boolean = await this.inventoryService.updateMediaStatus(mediaStatus);

        if (flag)
          this.utilityService.showNotification(`File Uploaded Successfully!`);
      }
      this.isUploading = false;
      this.isUploaded = true;
    }
    catch (error: any) {
      console.error(error);
      this.alertDialogService.show("Something went wrong upload On Server, Try again later");
    }
  }

  public setStoneMedia(files: File[]) {
    try {
      let media: Media = new Media();
      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];

          if (file.name == "0.json")
            media.isHtmlVideo = true;
          else if (file.name == "still.jpg")
            media.isPrimaryImage = true;
          else if (file.name == "video.mp4")
            media.isDownloadableVideo = true;
          else if (file.name == "Arrow_Black_BG.jpg")
            media.isArrowBlack = true;
          else if (file.name == "ASET_White_BG.jpg")
            media.isAsetWhite = true;
          else if (file.name == "Heart_Black_BG.jpg")
            media.isHeartBlack = true;
          else if (file.name == "IDEAL_White_BG.jpg")
            media.isIdealWhite = true;
          else if (file.name == "Office_Light_Black_BG.jpg")
            media.isOfficeLightBlack = true;
        }
      }
      return media;
    }
    catch (error: any) {
      console.error(error);
      this.alertDialogService.show("Something went wrong set StoneMedia, Try again later");
      let media: Media = new Media();
      return media;
    }
  }

  public resetUploadMedia() {
    this.isUploading = false;
    this.isUploaded = false;
    this.fileUploadItems = new Array<{ stoneId: string, file: File[], status: string }>();
    this.folderUpload.nativeElement.value = "";
    this.errorStoneIds = [];
  }
  //#endregion

  //#region Refresh Data
  public async refreshData() {
    this.selectAllFlag = false;
    this.mySelection = [];
    this.selectedInventoryItems = [];
    await this.initInventoryData();
    this.getInvSummaryData();
  }
  //#endregion

  //#region OnChange Function
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

  public onAddBarcode() {
    try {
      fromEvent(this.barcodeInput.nativeElement, 'keyup').pipe(
        map((event: any) => {
          return event.target.value;
        })
        , filter(res => res.length > 1)
        , debounceTime(1000)
      ).subscribe((barcodeText: string) => {
        let stones = this.utilityService.CheckStoneIds(barcodeText);
        let tempSelectData = [...this.selectedInventoryItems];
        let alreadyExist = ""

        for (let index = 0; index < stones.length; index++) {
          const element = stones[index];
          let selectedindex = this.inventoryItems.findIndex(x => x.stoneId.toLowerCase() == element.toLowerCase());
          if (selectedindex >= 0) {
            let existIndex = this.selectedInventoryItems.findIndex(x => x.stoneId.toLowerCase() == element.toLowerCase());
            if (existIndex < 0) {
              tempSelectData.push(this.inventoryItems[selectedindex])
              this.selectedInventoryItems.push(this.inventoryItems[selectedindex])
            }
            else
              alreadyExist += element.toUpperCase() + ", "
          }
        }
        this.loadManualIssueGrid();
        if (alreadyExist)
          this.alertDialogService.show(`${alreadyExist} <b>already exist</b> in list`);
      })
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async printStoneDetail() {

    this.alertDialogService.ConfirmYesNo(`Are you want to Barcode Print?`, "Barcode Print").subscribe(async (res: any) => {
      if (res.flag) {
        try {
          this.spinnerService.show();
          let stoneIds: Array<string> = new Array<string>();
          if (this.selectAllFlag)
            stoneIds = this.allInventoryItems.filter(x => this.mySelection.includes(x.id)).map(z => z.stoneId);
          else
            stoneIds = this.selectedInventoryItems.filter(x => this.mySelection.includes(x.id)).map(x => x.stoneId);

          let response = await this.inventoryService.downloadBarcodeExcel(stoneIds);
          if (response) {
            this.spinnerService.hide();
            var downloadURL = window.URL.createObjectURL(response);
            var link = document.createElement('a');
            link.href = downloadURL;
            link.download = `${this.utilityService.exportFileName(this.utilityService.replaceSymbols('barcode'))}`;
            link.click();
            this.mySelection = [];
            this.selectAllFlag = false;
          }
        }
        catch (error: any) {
          this.spinnerService.hide();
          this.alertDialogService.show(error.error);
        }
      }
    });
  }
  
  public onOpenDropdown(list: Array<{ name: string; isChecked: boolean }>, e: boolean, selectedData: string[]): boolean {
    if (selectedData?.length == list.map(z => z.name).length)
      e = true;
    else
      e = false;
    return e;
  }

  public handleFilter(e: any): string {
    return e;
  }

  public filterKapanDropdownSearch(allData: string[], e: any, selectedData: string[]): Array<{ name: string; isChecked: boolean }> {
    let filterData: any[] = [];
    allData.forEach(z => { filterData.push({ name: z, isChecked: false }); });
    filterData.forEach(z => {
      if (selectedData?.includes(z.name))
        z.isChecked = true;
    });
    if (e?.length > 0)
      return filterData.filter(z => z.name?.toLowerCase().includes(e?.toLowerCase()));
    else
      return filterData;
  }

  public filterDropdownSearch(allData: MasterDNorm[], e: any, selectedData: string[]): Array<{ name: string; isChecked: boolean }> {
    let filterData: any[] = [];
    allData.forEach(z => { filterData.push({ name: z.name, isChecked: false }); });
    filterData.forEach(z => {
      if (selectedData?.includes(z.name))
        z.isChecked = true;
    });
    if (e?.length > 0)
      return filterData.filter(z => z.name?.toLowerCase().includes(e?.toLowerCase()));
    else
      return filterData;
  }

  public filterStatusDropdownSearch(e: any, selectedData: string[]): Array<{ name: string; isChecked: boolean }> {
    let filterData: any[] = [];
    Object.values(StoneStatus).forEach(z => { this.listStatus.push({ name: z.toString(), isChecked: false }); });
    filterData.forEach(z => {
      if (selectedData?.includes(z.name))
        z.isChecked = true;
    });
    if (e?.length > 0)
      return filterData.filter(z => z.name?.toLowerCase().includes(e?.toLowerCase()));
    else
      return filterData;
  }

  public tagMapper(tags: string[]): void {
    // This function is used for hide selected items in multiselect box
  }

  public async loadAllInventories() {
    try {
      //this.inventorySearchCriteriaObj.organizationId = this.fxCredentials?.organizationId;
      this.allInventoryItems = await this.inventoryService.getInventoryItemsForSelectAll(this.inventorySearchCriteriaObj);
      if (this.allInventoryItems && this.allInventoryItems.length > 0)
        this.mySelection = this.allInventoryItems.map(z => z.id);

      //Get All Data For Memo Issue and Othe Functions
      this.selectedStoneIds = this.allInventoryItems.filter(z => this.mySelection.includes(z.id)).map(z => z.stoneId);
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async selectAllInventories(event: any) {
    this.mySelection = [];
    this.selectAllFlag = false;
    if (event.toLowerCase() == 'checked') {
      if (this.invResponse.totalCount > this.pageSize) {
        this.spinnerService.show();
        await this.loadAllInventories();
        this.spinnerService.hide();
        this.changeDetRef.detectChanges();
        this.selectAllFlag = true;
      }
      else
        this.mySelection = this.inventoryItems.map(z => z.id);
    }
  }

  public async openSearchDialog() {
    this.isSearchFilter = true;
    if (this.isFirstTimeLoad) {
      this.spinnerService.show();
      await this.getMasterConfigData();
      await this.getDepartmentsByOrgId();
      await this.getHeldByData();
      this.spinnerService.hide();
      this.isFirstTimeLoad = false;
    }

    //show checked location if change from summary filter
    this.utilityService.onMultiSelectChange(this.listLocation, this.inventorySearchCriteriaObj.location);
  }

  public closeSearchDialog(): void {
    this.isSearchFilter = false;
  }

  public filterSidebar() {
    this.filterFlag = !this.filterFlag;
  }

  public closeMediaDialog(e: boolean): void {
    this.isShowMedia = e;
  }

  public openEditInventoryDialog(): void {
    this.assignDropDownDataForEdit();
    this.isFormValid = false;
    this.isEditInventory = true;
    this.checkRequiredFields();
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

  public closeEditInventoryDialog(): void {
    this.isEditInventory = false;
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

  public selectedRowChange(event: any) {
    this.inventoryObj = new InventoryItems();
    if (this.mySelection != null && this.mySelection.length > 0) {
      var selectedInv = this.inventoryItems.find(z => z.id == this.mySelection[0]);
      if (selectedInv) {
        let value: InventoryItems = JSON.parse(JSON.stringify(selectedInv));
        value.labSendDate = this.utilityService.getValidDate(value.labSendDate);
        value.labReceiveDate = this.utilityService.getValidDate(value.labReceiveDate);
        value.marketSheetDate = this.utilityService.getValidDate(value.marketSheetDate);
        this.inventoryObj = { ...value };
      }
    }


    if (event.selectedRows && event.selectedRows.length > 0) {
      event.selectedRows.forEach((element: any) => {
        let Selectedindex = this.selectedInventoryItems.findIndex(x => x.stoneId == element.dataItem.stoneId);
        if (Selectedindex < 0)
          this.selectedInventoryItems.push(element.dataItem)
      });
    }
    else {
      event.deselectedRows.forEach((element: any) => {
        if (!element.dataItem.isDisabled) {
          let index = this.selectedInventoryItems.findIndex(x => x.stoneId == element.dataItem.stoneId);
          if (index >= 0)
            this.selectedInventoryItems.splice(index, 1)
        }
      });
    }
  }
  //#endregion

  //#region SavePacket
  public async onSavePacket(form: NgForm, action: boolean) {
    try {
      if (form.valid) {
        this.spinnerService.show();
        let response: any;
        this.fxCredentials = JSON.parse(sessionStorage.getItem("fxCredentials") ?? '') as fxCredential;

        this.selectedInventoryItems.forEach(z => {
          //z.hasTask = true;
          z.stoneOrg.deptId = this.selectedDeptItemsIssue?.value ?? '';
          z.stoneOrg.deptName = this.selectedDeptItemsIssue?.text ?? '';
          z.identity.id = this.selectedEmpItemsIssue?.value ?? '';
          z.identity.name = this.selectedEmpItemsIssue?.text ?? '';
          z.updatedBy = this.fxCredentials?.id ?? '';
        })

        response = await this.inventoryService.updateInventoryListData(this.selectedInventoryItems);
        if (response) {
          await this.sendMessage();
          this.mySelection = [];
          this.spinnerService.hide();
          this.selectedPacketsItems = undefined;
          this.selectedDeptItemsIssue = undefined;
          this.selectedEmpItemsIssue = undefined;
          this.selectedInventoryItems = [];
          this.gridViewIssue = process(this.selectedInventoryItems, { group: this.groupsIssue });
          this.cntMnuStones = this.selectedInventoryItems.length.toString();
          let totalWeight = 0.0;
          this.selectedInventoryItems.forEach(z => {
            totalWeight = totalWeight + z.weight;
          });
          this.sumMnuStonesWeight = totalWeight.toFixed(2);
          if (action)
            this.isManualIssue = false;
          this.resetForm(form);
          this.fields.filter(z => z.propertyName.toLowerCase() == "checkbox").forEach(z => z.isSelected = true);
          this.utilityService.showNotification(`Packet(s) Updated successfully!`)
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
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }
  //#endregion

  //#region Dialog Summary
  public openSummary(): void {
    this.isSummary = true;
  }

  public closeSummary(): void {
    this.isSummary = false;
  }
  //#endregion

  //#region Filter
  public filterPartToggle() {
    this.utilityService.setfilterToggleValue(this.filterFlag);
  }

  public resetForm(form?: NgForm) {
    this.InventoryObj = new InventoryItems();
    this.selectedInventoryItems = []
    this.insertFlag = true;
    form?.reset();
  }

  public async filterHoldChange() {
    this.skip = 0;
    let isHold = this.inventorySearchCriteriaObj.isHold;
    if (isHold)
      this.inventorySearchCriteriaObj.isHold = null as any;
    else
      this.inventorySearchCriteriaObj.isHold = true;
    await this.initInventoryData();
    this.getInvSummaryData();
    this.closeSummary();
  }

  public async filterMemoChange() {
    if (this.invResponse.totalMemo > 0) {
      this.skip = 0;
      let isMemo = this.inventorySearchCriteriaObj.isMemo;
      if (isMemo)
        this.inventorySearchCriteriaObj.isMemo = null as any;
      else
        this.inventorySearchCriteriaObj.isMemo = true;
      await this.initInventoryData();
      this.getInvSummaryData();
      this.closeSummary();
    }
  }

  public async filterTransitChange() {
    if (this.invResponse.totalTransit > 0) {
      this.skip = 0;
      this.inventorySearchCriteriaObj.status = [];
      this.inventorySearchCriteriaObj.status.push(StoneStatus.Transit.toString());
      await this.initInventoryData();
      this.getInvSummaryData();
      this.closeSummary();
    }
  }

  public async filterRapnetHoldChange() {
    this.skip = 0;
    // this.mySelection = [];
    let isHold = this.inventorySearchCriteriaObj.isRapnetHold;
    if (isHold)
      this.inventorySearchCriteriaObj.isRapnetHold = null as any;
    else
      this.inventorySearchCriteriaObj.isRapnetHold = true;
    await this.getInvSummaryData();
    await this.initInventoryData();
    this.closeSummary();
  }

  public async filterLocationChange(location: string) {
    this.skip = 0;
    // this.mySelection = [];
    let index = this.inventorySearchCriteriaObj.location.indexOf(location);
    if (index >= 0)
      this.inventorySearchCriteriaObj.location.splice(index, 1);
    else
      this.inventorySearchCriteriaObj.location.push(location);
    await this.getInvSummaryData();
    await this.initInventoryData();
    this.closeSummary();
  }

  public async filterBySearch() {
    this.skip = 0;
    // this.mySelection = [];
    this.assignAdditionalData();
    await this.initInventoryData();
    this.getInvSummaryData();
    this.isSearchFilter = false;
  }

  public clearSearchCriteria(form: NgForm): void {
    form?.reset();
    this.inventorySearchCriteriaObj = new InventorySearchCriteria();

    this.stoneId = "";
    this.certificateNo = "";

    this.inventorySearchCriteriaObj.organizationId = this.fxCredentials?.organizationId ?? '';
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
  //#endregion

  //#region Mapping
  private mappingtoHoldStoneArray(inv: InventoryItems[]): HoldInventoryItems[] {
    let target: HoldInventoryItems[] = [];

    inv.forEach(z => {
      let obj: HoldInventoryItems = new HoldInventoryItems();
      obj.stoneId = z.stoneId;
      obj.isHold = z.isHold;
      obj.holdBy = this.fxCredentials.fullName;
      obj.holdDate = z.holdDate;
      obj.holdDays = z.holdDays;
      obj.updatedAt = z.updatedAt;
      target.push(obj);
    });

    return target;
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

  private mappingUpdateInventoryData(inv: InventoryItems) {
    let data: UpdateInventoryItem = new UpdateInventoryItem();
    data.stoneId = inv.stoneId;

    data.article = inv.article;
    data.shape = inv.shape;
    data.weight = inv.weight;
    data.color = inv.color;
    data.clarity = inv.clarity;
    data.cut = inv.cut;
    data.polish = inv.polish;
    data.symmetry = inv.symmetry;
    data.fluorescence = inv.fluorescence;
    data.location = inv.location;
    data.isCPBlocked = inv.isCPBlocked;
    data.lab = inv.lab?.toUpperCase();
    data.certificateNo = inv.certificateNo;
    data.inscription = inv.inscription;
    data.comments = inv.comments;
    data.bgmComments = inv.bgmComments;
    data.inclusion = inv.inclusion;
    data.measurement = inv.measurement;

    return data;
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
  //#endregion

  //#region Edit & Update Data
  public async changeHoldData(isHold: boolean, isRelease: boolean = false) {
    try {
      var type = 'Rapnet Hold';
      if (isHold)
        type = 'Hold';
      if (isRelease)
        type = 'Release';

      this.alertDialogService.ConfirmYesNo("Are you sure you want to change status to " + type + " for selected stone(s)?", "Change " + type)
        .subscribe(async (res: any) => {
          if (res.flag) {
            this.spinnerService.show();
            let selectedInventoryItems: InventoryItems[] = [];
            let failStones = 0;

            let selectedInventoryStones = this.allInventoryItems.filter(item => this.mySelection.includes(item.id));
            selectedInventoryStones.forEach(z => {
              let obj: InventoryItems = new InventoryItems();
              obj.stoneId = z.stoneId;
              obj.status = z.status;

              if (isRelease) {
                obj.isHold = false;
                obj.holdBy = "";
              }
              else {
                obj.isHold = isHold;
                if (isHold)
                  obj.holdBy = this.fxCredentials.fullName;
              }

              //Add Require fields to avoid api call error
              obj.weight = 0;
              obj.identity = this.inventoryItems[0].identity;
              obj.stoneOrg = this.inventoryItems[0].stoneOrg;

              selectedInventoryItems.push(obj);
            });

            var pendingPricingStoneData: TempPendingPricing[] = [];

            //Get pending pricing data from diamanto for update price
            let selectedStoneIds: string[] = selectedInventoryItems.map(z => z.stoneId);
            pendingPricingStoneData = await this.commuteService.getPendingPricingTemp(selectedStoneIds);
            if (pendingPricingStoneData && pendingPricingStoneData.length > 0) {
              selectedInventoryItems.forEach(z => {
                var exists = pendingPricingStoneData.find(a => a.stoneId == z.stoneId);
                if (exists != null)
                  z.price = exists.tempPrice;
              });
            }

            if (selectedInventoryItems.length > 0) {
              let UpdatedStoneData: InventoryItems[] = [];
              //Update Hold / Release and pending pricing if exists
              UpdatedStoneData = await this.inventoryService.updateInventoryHoldData(selectedInventoryItems);
              if (UpdatedStoneData && UpdatedStoneData.length > 0) {
                //Update Hold / Release & pending price data in diamanto
                var result = await this.updateDiamantoInventory(UpdatedStoneData);

                //Insert Pricing Request for release stone(s) in diamanto
                if (isRelease) {
                  var existsPricingStoneIds = pendingPricingStoneData.map(a => a.stoneId);

                  //check if pending pricing not exists (do not price request if already in pending pricing data)
                  let pricingReqInvs = UpdatedStoneData.filter(z => !existsPricingStoneIds.includes(z.stoneId));
                  if (pricingReqInvs.length > 0)
                    await this.savePricingRequestDiamanto(pricingReqInvs);
                }

                await this.initInventoryData();
                this.getInvSummaryData();
                this.spinnerService.hide();
                this.utilityService.showNotification(UpdatedStoneData.length + ` Record(s) updated successfully!`);
                this.utilityService.showNotification(result + ` Record(s) updated successfully in diamanto!`);
                if (failStones > 0)
                  this.utilityService.showNotification(failStones.toString() + ` stone(s) can not hold before 'Stock' status!`, 'warning');
              }
              else {
                this.spinnerService.hide();
                this.utilityService.showNotification(`Stone(s) already in ` + type, 'warning');
              }
            }
            else {
              this.spinnerService.hide();
              this.alertDialogService.show("You can only hold after 'Stock' status!");
            }
            this.mySelection = [];
          }
        });
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Stone not updated, Please contact administrator!');
    }
  }

  private async updateDiamantoInventory(inv: InventoryItems[]): Promise<number> {
    try {
      var HoldStoneData = this.mappingtoHoldStoneArray(inv);
      return await this.commuteService.updateInventoryHold(HoldStoneData);
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(`Stone(s) not updated in diamanto data, Please contact administrator!`, 'error');
      return 0;
    }
  }

  public async savePricingRequestDiamanto(inv: InventoryItems[]) {
    try {
      var res = await this.commuteService.insertPricingRequest(inv, "Inv Changes By " + this.fxCredentials.fullName, "InvChanges-" + this.fxCredentials.fullName);
      if (res)
        this.utilityService.showNotification(inv.length + ' stone(s) pricing request submitted!');
      else
        this.alertDialogService.show('Pricing request not inserted, Please contact administrator!', 'error');
    } catch (error: any) {
      this.alertDialogService.show('Pricing request not inserted, Please contact administrator!', 'error');
      console.error(error);
    }
  }

  public async setNonCertified() {
    this.alertDialogService.ConfirmYesNo("Are you sure you want to change lab status for selected stone(s)?", "Non Certified Lab")
      .subscribe(async (res: any) => {
        if (res.flag) {
          try {
            this.spinnerService.show();

            let ncData: UpdateNCInventory = new UpdateNCInventory();
            ncData.stoneIds = this.allInventoryItems.filter(item => this.mySelection.includes(item.id)).map(z => z.stoneId);
            ncData.updatedBy = this.fxCredentials?.id ?? '';

            let res: InventoryItems[] = await this.inventoryService.updateInventoryLabToNC(ncData);
            if (res) {
              if (res.length > 0) {
                let labUpdateItem: LabUpdateItem = new LabUpdateItem();
                labUpdateItem.lab = "NC";
                labUpdateItem.stoneIds = ncData.stoneIds;
                labUpdateItem.updatedBy = ncData.updatedBy;
                var result = await this.commuteService.updateStoneLab(labUpdateItem);

                let newData: InventoryItems[] = JSON.parse(JSON.stringify(res));
                newData.forEach(z => { z.status = StoneStatus.Lab.toString() });
                await this.savePricingRequestDiamanto(newData);
              }

              await this.initInventoryData();
              this.getInvSummaryData();
              this.utilityService.showNotification(res.length.toString() + ` Record(s) updated successfully!`);
            }
            else
              this.utilityService.showNotification(`Stone(s) already in `);

            this.spinnerService.hide();
            this.mySelection = [];
          }
          catch (error: any) {
            this.spinnerService.hide();
            this.alertDialogService.show(error.error);
          }
        }
      });
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
              this.spinnerService.hide();
              this.initInventoryData();
              this.utilityService.showNotification(`Record deleted successfully!`)
            }
            else {
              this.spinnerService.hide();
              this.alertDialogService.show(`Something went wrong on Inv Delete, Try again later!`);
            }
          }
        });
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
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

  public async onInvSubmit(form: NgForm) {
    try {
      if (form.valid) {
        this.spinnerService.show();

        let lsd = this.inventoryObj.labSendDate;
        this.inventoryObj.labSendDate = lsd ? this.utilityService.setUTCDateFilter(lsd) : null;
        let lrd = this.inventoryObj.labReceiveDate;
        this.inventoryObj.labReceiveDate = lrd ? this.utilityService.setUTCDateFilter(lrd) : null;
        let msd = this.inventoryObj.marketSheetDate;
        this.inventoryObj.marketSheetDate = msd ? this.utilityService.setUTCDateFilter(msd) : null;

        let res = await this.inventoryService.updateInventoryData(this.inventoryObj)
        if (res) {
          //Update on Front Office Inv Item
          if (this.inventoryObj.status == StoneStatus.Stock.toString()) {
            let data = this.mappingUpdateInventoryData(this.inventoryObj);
            await this.commuteService.updateInventoryItem(data);
          }

          if (this.inventoryObj.lab == 'NC') {
            let newData = JSON.parse(JSON.stringify(this.inventoryObj));
            newData.status = StoneStatus.Lab.toString();
            let invArray: InventoryItems[] = [];
            invArray.push(newData);
            await this.savePricingRequestDiamanto(invArray);
          }
          await this.UpdateInvGrade(this.inventoryObj);
          this.spinnerService.hide();
          this.closeEditInventoryDialog();
          this.initInventoryData();
          this.mySelection = [];
          this.utilityService.showNotification(`Record updated successfully!`)
        }
        else {
          this.spinnerService.hide();
          this.utilityService.showNotification(`Something went wrong on Inv Submit, Try again later!`)
        }
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async UpdateInvGrade(inv: InventoryItems) {
    try {
      let req: GradeSearchItems[] = [];
      let obj: GradeSearchItems = new GradeSearchItems();
      obj.id = inv.stoneId?.toUpperCase();
      obj.lab = "GIA"
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
        let result = await this.inclusionuploadService.updateInventoryGrading(res);
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
  //#endregion

  //#region Export Request
  public async sendMessage() {
    this.message.icon = "icon-erroricon";
    this.message.title = "Stone Issue Info";
    this.message.categoryType = "alert";
    this.message.description = "Stone Issue sent by " + this.fxCredentials.fullName;
    this.message.action = "ManualIssueModal";
    this.message.param = this.selectedInventoryItems.map(x => x.stoneId).join(',');
    this.message.senderId = JSON.parse(sessionStorage.getItem("userToken") ?? "").ident;
    this.message.receiverId = this.selectedEmpItems?.value ?? "";
    let notificationResponse = await this.notificationService.insertNotification(this.message);
    if (notificationResponse) {
      this.message.id = notificationResponse;
      this.notificationService.messages.next(this.message)
    }
  }

  public async openExportRequestDialog() {
    this.showExportRequest = true;
    await this.getStoneForExportRequest();
  }

  public closeExportRequestDialog() {
    this.showExportRequest = false;
    this.myExportReqSelection = [];
  }

  public async getStoneForExportRequest() {
    try {
      this.spinnerService.show();
      let exportRequestData = await this.exportRequestService.buildExportReqDataByInv(this.mySelection);
      if (exportRequestData) {
        this.exportRequestData = exportRequestData;
        this.applyExportRequestDataGrid();
        this.spinnerService.hide();
      }
      else
        this.spinnerService.hide();

    } catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Export Request not update, Try again later');
    }
  }

  public applyExportRequestDataGrid() {
    this.gridExportReqList = process(this.exportRequestData, {});
    this.gridExportReqList.total = this.exportRequestData.length;
  }

  public mappingInvToExportRequest(inv: InventoryItems[]): ExportRequest[] {
    let data: ExportRequest[] = [];

    inv.forEach(z => {
      let item: ExportRequest = new ExportRequest();
      item.stoneId = z.stoneId;
      item.shape = z.shape;
      item.weight = z.weight;
      item.color = z.color;
      item.clarity = z.clarity;
      item.cut = z.cut;
      item.polish = z.polish;
      item.symmetry = z.symmetry;
      item.fluorescence = z.fluorescence;
      item.location = z.location;
      item.requestedBy = this.fxCredentials?.fullName;
      item.price = z.price;
      data.push(item);
    });

    return data;
  }

  public updateExportRequestLocation() {
    if (this.applyLocation.length > 0) {

      if (this.myExportReqSelection.length == 0)
        this.exportRequestData.forEach(z => { z.location = this.applyLocation; z.requestedBy = this.fxCredentials?.fullName; });
      else
        this.exportRequestData.filter(z => this.myExportReqSelection.includes(z.stoneId)).forEach(z => { z.location = this.applyLocation; z.requestedBy = this.fxCredentials?.fullName; });

      this.applyExportRequestDataGrid();
    }
  }

  public removeExportRequestData() {
    this.exportRequestData = this.exportRequestData.filter(z => !this.myExportReqSelection.includes(z.stoneId));
    this.applyExportRequestDataGrid();
    if (this.exportRequestData.length == 0)
      this.closeExportRequestDialog();
  }

  public async onExportRequestSubmit(form: NgForm) {
    try {
      if (this.exportRequestData.length == 0) {
        this.utilityService.showNotification('No data found for save!', 'warning');
        this.closeExportRequestDialog();
        return;
      }

      let notUpdated = this.exportRequestData.filter(z => z.location == null || z.location == undefined || z.location?.length == 0);
      if (notUpdated.length > 0) {
        this.alertDialogService.show('Save location of <b>' + notUpdated.map(z => z.stoneId).join(',') + '</b> stone(s) before submit export request!');
        return;
      }

      this.spinnerService.show();
      let res = await this.exportRequestService.insertExportRequest(this.exportRequestData);
      if (res && res.isSuccess) {
        this.utilityService.showNotification('Export request save successfully!');
        this.closeExportRequestDialog();
        this.mySelection = [];
        this.spinnerService.hide();
      }
      else {
        if (res.message)
          this.alertDialogService.show(res.message);
        else
          this.alertDialogService.show('Export Request not update, Try again later');

        if (res.errorMessage)
          console.error(res.errorMessage);

        this.spinnerService.hide();
      }

    } catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Export Request not update, Try again later');
    }
  }

  public onExcelToggle(): void {
    this.showExcelOption = !this.showExcelOption;
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

    this.spinnerService.show();
    this.exportData = [];
    let criteria = new InventorySearchCriteria();

    if (this.excelOption == 'selected')
      criteria.selectedStones = this.mySelection;
    else
      criteria = JSON.parse(JSON.stringify(this.inventorySearchCriteriaObj));

    if (this.invResponse.totalCount > 0) {
      if (type == "export") {
        let blob = await this.exportExcelNew(criteria);
        if (blob)
          this.downloadBlobExcel(blob);
        this.excelOption = null;
        this.showExcelOption = false;
      }
      this.spinnerService.hide();
    }
    else {
      this.alertDialogService.show('No Data Found!');
      this.spinnerService.hide();
    }
  }

  public async exportExcelNew(criteria: InventorySearchCriteria) {
    try {
      let response = await this.inventoryService.exportExcel(criteria, this.excelOption ?? 'searched');
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

  public downloadBlobExcel(blob: any) {
    var downloadURL = window.URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = downloadURL;
    link.download = `${this.utilityService.exportFileName(this.utilityService.replaceSymbols('Data' ?? 'SearchResult'))}`;
    link.click();
  }

  public async onCertificateLink() {
    try {
      this.router.navigate(['inventory/certificateLink'])
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async onDownloadMulCerti() {
    try {
      const inventoryItems = await this.inventoryService.getCertificateIdsByStoneIds();

      if (inventoryItems.length > 0) {
        const chunkSize = 10;
        const dynamicReportArray = inventoryItems.map(item => ({
          "ReportNumber": item.certificateNo,
          "PrintDocumentTypeKey": item.weight > 0.49 ? "Cert" : "MiniCert"
        }));

        const baseUrl = "https://my.hrdantwerp.com/Download/GetMultipleGradingReportsPdfs/?reports=";

        // Function to chunk the array with explicit types
        const chunkArray = (array: any[], size: number): any[][] => {
          const result: any[][] = [];
          for (let i = 0; i < array.length; i += size) {
            result.push(array.slice(i, i + size));
          }
          return result;
        };

        const chunks = chunkArray(dynamicReportArray, chunkSize);
        chunks.forEach((chunk, index) => {
          setTimeout(() => {
            const encodedReports = encodeURIComponent(JSON.stringify(chunk));
            const url = `${baseUrl}${encodedReports}`;

            const a = document.createElement('a');
            a.href = url;
            a.target = '_blank';
            document.body.appendChild(a); // Append the anchor to the body
            a.click();
            document.body.removeChild(a); // Remove the anchor from the body
          }, index * 5000); // Delay of 1 minute between each call
        });
      } else {
        this.alertDialogService.show("No stones found without synchronization of certificates.");
      }
    } catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }
  //#endregion
  
  //#region Apply Rap
  public async applyRapUpdate(){
    try{
      this.spinnerService.show();
    let allRapPrice = await this.commuteService.getAllRapPrice();
    if(allRapPrice){
      let result = await this.inventoryService.updateRap(allRapPrice);
      if(result){
        let msg = "";
        msg += ' <b>Total : </b>' + result.total + '<br />';
        msg += ' <b>Success : </b>' + result.success.length +'<br />';
        let errorMessages = result.error.join(', ');
        if(result.error.length != 0)
        msg += ' <b>Fail : </b>' + errorMessages + '<br />';
        else
        msg += ' <b>Fail : </b>' + result.error.length + '<br />';
        this.alertDialogService.show(msg);
      }
    }
    this.spinnerService.hide();
  }
  catch (error: any) {
    console.error(error);
    this.spinnerService.hide();
    this.alertDialogService.show('Something went wrong on update rap.');
  }
  }
  //#endregion
}

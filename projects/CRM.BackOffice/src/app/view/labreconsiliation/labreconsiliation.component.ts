import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { PageChangeEvent, RowClassArgs, SelectableSettings } from '@progress/kendo-angular-grid';
import { DataResult, GroupDescriptor, SortDescriptor, orderBy, process } from '@progress/kendo-data-query';
import { environment } from 'environments/environment';
import { NgxSpinnerService } from 'ngx-spinner';
import { Address, GirdleDNorm, GradeSearchItems, GridDetailConfig, InclusionPrice, MeasItems, MfgInclusionData, MfgMeasurementData, MfgPricingRequest, RapPriceRequest } from 'shared/businessobjects';
import { DbLog, FancyCutDetailDNorm, GirdlePerDetailDnorm, GridConfig, GridMasterConfig, MasterConfig, MasterDNorm, Notifications, fxCredential } from 'shared/enitites';
import { ConfigService, LogService, MeasureGradeService, NotificationService, PriceRequestTemplate, PricingService, StoneStatus, UtilityService, listActionType, listLabResultItems } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import * as xlsx from 'xlsx';
import { InverntoryError, Lab, LabRecheckRequest, LabResult, LabResultExcelItems, LabServiceCharge, LabServiceType } from '../../businessobjects';
import { GradingMaster } from '../../businessobjects/grading/gradingmaster';
import { InventoryItemMeasurement, InventoryItems, Organization, RInvItem, Repairing } from '../../entities';
import { CommuteService, EmployeeCriteriaService, GradingService, GridPropertiesService, InventoryService, LabService, MasterConfigService, OrganizationService, RepairingService } from '../../services';
@Component({
  selector: 'app-labreconsiliation',
  templateUrl: './labreconsiliation.component.html',
  styleUrls: ['./labreconsiliation.component.css']
})
export class LabreconsiliationComponent implements OnInit {

  public fields!: GridDetailConfig[];
  public gridView!: DataResult;
  public gridViewIssue!: DataResult;
  public groups!: GroupDescriptor[];
  public sort!: SortDescriptor[];
  public mySelection: string[] = [];
  public selectableSettings: SelectableSettings = {
    mode: 'multiple',
  };
  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains'
  };
  public existStoneIds: string[] = [];
  public masterConfigList!: MasterConfig;
  public allTheShapes!: MasterDNorm[];
  public allColors!: MasterDNorm[];
  public allClarities!: MasterDNorm[];
  public allTheFluorescences!: MasterDNorm[];
  public allTheCPS!: MasterDNorm[];
  public allTheFancy!: FancyCutDetailDNorm[];
  public allGirdlePer!: GirdlePerDetailDnorm[];
  public measurementData: MasterDNorm[] = [];
  public inclusionData: MasterDNorm[] = [];
  public fxCredentials!: fxCredential;
  public organizationAddress: Address = new Address();
  public isGridConfig: boolean = false;
  public gridConfig!: GridConfig;
  public gridMasterConfigResponse!: GridMasterConfig;
  public labServiceItems!: LabServiceType[];
  public listReason: Array<{ name: string; code: string; isChecked: boolean }> = [];
  public isRecheckIssue: boolean = false;
  public skeletonArray = new Array(18);
  public labReCheckRequestObj: LabRecheckRequest = new LabRecheckRequest();
  public errorMessagesByStoneId: InverntoryError[] = [];
  public listLabResultItems = listLabResultItems;
  public SelectedLab: string = '';
  public mediaTitle!: string
  public mediaSrc!: string
  public mediaType!: string
  public isShowMedia: boolean = false;
  public selectedReasonItems: string[] = [];
  public labServiceCharge: LabServiceCharge = new LabServiceCharge();
  public recheckCharge!: string
  public labItems: Lab[] = [];
  public listLabItems: Array<{ text: string; value: string }> = [];
  public selectedLabItems?: { text: string, value: string };
  public labObj: Lab = new Lab();
  public organizationData: Organization = new Organization();
  public listActionType: Array<{ text: string; value: string }> = [];
  public actionType = "";
  public serviceCode: string[] = [];
  public excelFile: any[] = [];
  public pageSize = 26;
  public skip = 0;
  public gridInventoryData: LabResultExcelItems[] = [];
  public isRepairingStones = false;
  public isRepairVisible = false;
  public labResultExcelItems: LabResultExcelItems[] = []; //Read The Excel And Add Data In labResultExcelItems  
  public selectedLabResultExcelItems: LabResultExcelItems[] = []; //Add selected Data In selectedLabResultExcelItems from labResultExcelItems  
  public inventoryItems: InventoryItems[] = []; //Get Data from InventoryItems  
  public gradingMasterItem: GradingMaster[] = []; //Get Data from GradingMaster. Multiple Records For One Stone.  
  public gradingRapVerItem: GradingMaster[] = []; //Get data from gradingMasterItem where rapVer == 'Grading'  
  public gradingRapVerLastItem: GradingMaster[] = []; //Get Last Record From gradingMasterItem for Perameter Comparison  
  public labResultItems: LabResult[] = []; //Lab Excel Read and add Excel data in labResultItems
  public isViewButtons: boolean = false;
  public repairingAllList: Array<Repairing> = new Array<Repairing>();
  public errorStoneData: { stonId: string, msg: string, code: number }[] = [];
  public gradeErrorStoneData: { stonId: string, msg: string, code: number }[] = [];
  public brownList: MasterDNorm[] = [];
  public milkyList: MasterDNorm[] = [];
  public isFilter: boolean = false;
  public selectedFromWeight?: number = 0;
  public selectedToWeight?: number = 0;
  public invItem: InventoryItems[] = [];

  constructor(
    private router: Router,
    private organizationService: OrganizationService,
    private labService: LabService,
    private alertDialogService: AlertdialogService,
    private spinnerService: NgxSpinnerService,
    public utilityService: UtilityService,
    private masterConfigService: MasterConfigService,
    private gridPropertiesService: GridPropertiesService,
    private pricingService: PricingService,
    private gradingService: GradingService,
    private configService: ConfigService,
    private notificationService: NotificationService,
    private employeeCriteriaService: EmployeeCriteriaService,
    private commuteService: CommuteService,
    private measureGradeService: MeasureGradeService,
    private inventoryService: InventoryService,
    private _repairService: RepairingService,
    public logService: LogService
  ) {
  }

  async ngOnInit() {
    await this.loadDefaultMethod();
  }

  //#region DefaultMethod
  public async loadDefaultMethod() {
    try {
      this.spinnerService.show();
      this.fxCredentials = JSON.parse(sessionStorage.getItem("fxCredentials") ?? '') as fxCredential;
      if (!this.fxCredentials)
        this.router.navigate(["login"]);

      if (this.fxCredentials && this.fxCredentials.origin && (this.fxCredentials.origin.toLowerCase() == 'admin' || this.fxCredentials.origin.toLowerCase() == 'opmanager'))
        this.isViewButtons = true;

      this.organizationAddress = await this.organizationService.getOrganizationAddressByEmployee(this.fxCredentials.id);
      await this.getMasterConfigData();
      await this.getGridConfiguration();
      this.labServiceItems = await this.labService.getAlllabService();
      this.labItems = await this.labService.getAllLabs();
      this.listLabItems = [];
      this.labItems.forEach(z => { this.listLabItems.push({ text: z.name, value: z.name }); });
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error)
    }
  }
  //#endregion

  //#region MasterConfig
  public async getMasterConfigData() {
    try {
      Object.values(listActionType).forEach(z => { this.listActionType.push({ text: z.toString(), value: z.toString() }); });

      this.masterConfigList = await this.masterConfigService.getAllMasterConfig();
      this.allTheShapes = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.shape);
      this.allColors = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.colors);
      this.allClarities = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.clarities);
      this.allTheFluorescences = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.fluorescence);
      this.allTheCPS = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.cps);
      this.allTheFancy = this.masterConfigList.fancyCutDetails;
      this.measurementData = this.masterConfigList.measurements;
      this.allGirdlePer = this.masterConfigList.girdlePerDetails;
      this.inclusionData = this.masterConfigList.inclusions;
      this.brownList = this.inclusionData.filter(item => item.type.toLowerCase().indexOf('brown') !== -1);
      this.milkyList = this.inclusionData.filter(item => item.type.toLowerCase().indexOf('milky') !== -1);
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error)
    }
  }
  //#endregion

  //#region Excel
  public async onSelectExcelFile(event: Event) {
    try {
      let acceptedFiles: string[] = []
      const target = event.target as HTMLInputElement;
      if (target.accept) {
        acceptedFiles = target.accept.split(',').map(function (item) {
          return item.trim();
        });
      }

      if (target.files && target.files.length) {
        if (acceptedFiles.indexOf(target.files[0].type) > -1) {

          let file = target.files[0];
          let fileReader = new FileReader();
          this.clearGrid();
          this.spinnerService.show();
          fileReader.onload = async (e) => {

            var arrayBuffer: any = fileReader.result;
            let data = new Uint8Array(arrayBuffer);
            let arr = new Array();

            for (let i = 0; i != data.length; ++i)
              arr[i] = String.fromCharCode(data[i]);

            let workbook = xlsx.read(arr.join(""), { type: "binary" });
            var fetchExcelItems = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]) as any;

            //update fancy cut for new shape
            let stoneIds = fetchExcelItems.map((x: any) => x['Client Ref'])

            this.invItem = await this.inventoryService.getInventoryByStoneIds(stoneIds);

            if (fetchExcelItems && fetchExcelItems.length > 0) {
              this.labResultExcelItems = new Array<any>();

              for (let j = 0; j < fetchExcelItems.length; j++) {
                Object.keys(fetchExcelItems[j]).map(key => {
                  if (key.toLowerCase().trim() != key) {
                    fetchExcelItems[j][key.toLowerCase().trim()] = fetchExcelItems[j][key];
                    delete fetchExcelItems[j][key];
                  }
                });

                //Insert All data of excel in newLabResult.
                let newLabResult: LabResult = new LabResult();
                newLabResult.LabName = this.SelectedLab;

                let girdelMinMaxString: '';

                if (this.SelectedLab == 'GIA') {
                  newLabResult.clientRef = fetchExcelItems[j]["Client Ref".toLowerCase()]?.toString().trim();
                  if (newLabResult.clientRef == null || newLabResult.clientRef == undefined)
                    break;
                  newLabResult.jobNo = fetchExcelItems[j]["Job No".toLowerCase()]?.toString().trim();
                  newLabResult.controlNo = fetchExcelItems[j]["Control No".toLowerCase()]?.toString().trim();
                  newLabResult.diamondDossier = fetchExcelItems[j]["Diamond Dossier".toLowerCase()]?.toString().trim();
                  newLabResult.reportNo = fetchExcelItems[j]["Report No".toLowerCase()]?.toString().trim();
                  if (newLabResult.reportNo == null || newLabResult.reportNo == undefined)
                    break;
                  newLabResult.reportDt = fetchExcelItems[j]["Report Dt".toLowerCase()]?.toString().trim();
                  newLabResult.memoNo = fetchExcelItems[j]["Memo No".toLowerCase()]?.toString().trim();
                  newLabResult.shape = fetchExcelItems[j]["Shape".toLowerCase()]?.toString().trim();
                  newLabResult.length = fetchExcelItems[j]["Length".toLowerCase()]?.toString().trim();
                  newLabResult.width = fetchExcelItems[j]["Width".toLowerCase()]?.toString().trim();
                  newLabResult.depth = fetchExcelItems[j]["Depth".toLowerCase()]?.toString().trim();//Height                  
                  newLabResult.weight = fetchExcelItems[j]["Weight".toLowerCase()]?.toString().trim();
                  newLabResult.color = fetchExcelItems[j]["Color".toLowerCase()]?.toString().trim();
                  newLabResult.colorDescriptions = fetchExcelItems[j]["Color Descriptions".toLowerCase()]?.toString().trim();
                  newLabResult.clarity = fetchExcelItems[j]["Clarity".toLowerCase()]?.toString().trim();
                  newLabResult.clarityStatus = fetchExcelItems[j]["Clarity Status".toLowerCase()]?.toString().trim();
                  newLabResult.finalCut = fetchExcelItems[j]["Final Cut".toLowerCase()]?.toString().trim();
                  newLabResult.polish = fetchExcelItems[j]["Polish".toLowerCase()]?.toString().trim();
                  newLabResult.symmetry = fetchExcelItems[j]["Symmetry".toLowerCase()]?.toString().trim();
                  newLabResult.fluorescenceIntensity = fetchExcelItems[j]["Fluorescence Intensity".toLowerCase()]?.toString().trim();
                  newLabResult.fluorescenceColor = fetchExcelItems[j]["Fluorescence Color".toLowerCase()]?.toString().trim();
                  newLabResult.girdleCondition = fetchExcelItems[j]["Girdle Condition".toLowerCase()]?.toString().trim();
                  newLabResult.culetSize = fetchExcelItems[j]["Culet Size".toLowerCase()]?.toString().trim();
                  newLabResult.depthPer = fetchExcelItems[j]["Depth %".toLowerCase()]?.toString().trim();//Depth%==TotalDepth
                  newLabResult.tablePer = fetchExcelItems[j]["Table %".toLowerCase()]?.toString().trim();
                  newLabResult.crnAg = fetchExcelItems[j]["Crn Ag".toLowerCase()]?.toString().replace('°', '').trim();
                  newLabResult.crnHt = fetchExcelItems[j]["Crn Ht".toLowerCase()]?.toString().replace('%', '').trim();
                  newLabResult.pavAg = fetchExcelItems[j]["Pav Ag".toLowerCase()]?.toString().replace('°', '').trim();
                  newLabResult.pavDp = fetchExcelItems[j]["Pav Dp".toLowerCase()]?.toString().replace('%', '').trim();
                  newLabResult.strLn = fetchExcelItems[j]["Str Ln".toLowerCase()]?.toString().replace('%', '').trim();
                  newLabResult.lrHalf = fetchExcelItems[j]["Lr Half".toLowerCase()]?.toString().replace('%', '').trim();
                  newLabResult.painting = fetchExcelItems[j]["Painting".toLowerCase()]?.toString().trim();
                  newLabResult.proportion = fetchExcelItems[j]["Proportion".toLowerCase()]?.toString().trim();
                  newLabResult.paintComm = fetchExcelItems[j]["Paint Comm".toLowerCase()]?.toString().trim();
                  newLabResult.keytoSymbols = fetchExcelItems[j]["Key to Symbols".toLowerCase()]?.toString().trim();
                  newLabResult.reportComments = fetchExcelItems[j]["Report Comments".toLowerCase()]?.toString().trim();
                  newLabResult.inscription = fetchExcelItems[j]["Inscription".toLowerCase()]?.toString().trim();
                  newLabResult.syntheticIndicator = fetchExcelItems[j]["Synthetic Indicator".toLowerCase()]?.toString().trim();
                  newLabResult.girdlePer = fetchExcelItems[j]["Girdle %".toLowerCase()]?.toString().replace('%', '').trim();
                  newLabResult.polishFeatures = fetchExcelItems[j]["Polish Features".toLowerCase()]?.toString().trim();
                  newLabResult.symmetryFeatures = fetchExcelItems[j]["Symmetry Features".toLowerCase()]?.toString().trim();
                  newLabResult.shapeDescription = fetchExcelItems[j]["Shape Description".toLowerCase()]?.toString().trim();
                  newLabResult.reportType = fetchExcelItems[j]["Report Type".toLowerCase()]?.toString().trim();
                  newLabResult.sorting = fetchExcelItems[j]["Sorting".toLowerCase()]?.toString().trim();
                  newLabResult.basketStatus = fetchExcelItems[j]["Basket Status".toLowerCase()]?.toString().trim();
                  newLabResult.diamondType = fetchExcelItems[j]["Diamond Type".toLowerCase()]?.toString().trim();
                  let array: string[] = [];
                  let girdelData: '';
                  girdelData = fetchExcelItems[j]["Girdle".toLowerCase()]?.toString().trim();
                  girdelMinMaxString = fetchExcelItems[j]["Girdle".toLowerCase()]?.toString().trim();

                  if (girdelData.includes(' to ')) {
                    array = girdelData.split(' to ');
                    newLabResult.minGirdle = array[0];
                    newLabResult.maxGirdle = array[1];
                  }
                  else {
                    newLabResult.minGirdle = fetchExcelItems[j]["Girdle".toLowerCase()]?.toString().trim();
                    newLabResult.maxGirdle = fetchExcelItems[j]["Girdle".toLowerCase()]?.toString().trim();
                  }
                }
                else if (this.SelectedLab == 'IGI') {
                  newLabResult.clientRef = fetchExcelItems[j]["Customer Ref No.".toLowerCase()]?.toString().trim();
                  if (newLabResult.clientRef == null || newLabResult.clientRef == undefined)
                    break;
                  newLabResult.documentNo = fetchExcelItems[j]["Document No".toLowerCase()]?.toString().trim();
                  newLabResult.reportDt = fetchExcelItems[j]["Report Date".toLowerCase()]?.toString().trim();
                  newLabResult.reportNo = fetchExcelItems[j]["Report Number".toLowerCase()]?.toString().trim();
                  newLabResult.prefix = fetchExcelItems[j]["Prefix".toLowerCase()]?.toString().trim();
                  newLabResult.otherReportNumber = fetchExcelItems[j]["Other Report Number".toLowerCase()]?.toString().trim();
                  newLabResult.shape = fetchExcelItems[j]["Shape Name".toLowerCase()]?.toString().trim();
                  newLabResult.weight = fetchExcelItems[j]["Weight".toLowerCase()]?.toString().trim();
                  newLabResult.numberStones = fetchExcelItems[j]["Number Stones".toLowerCase()]?.toString().trim();
                  newLabResult.description = fetchExcelItems[j]["Description".toLowerCase()]?.toString().trim();
                  newLabResult.length = fetchExcelItems[j]["Measurement1".toLowerCase()]?.toString().trim();
                  newLabResult.width = fetchExcelItems[j]["Measurement2".toLowerCase()]?.toString().trim();
                  newLabResult.depth = fetchExcelItems[j]["Measurement3".toLowerCase()]?.toString().trim();
                  newLabResult.tablePer = fetchExcelItems[j]["Table".toLowerCase()]?.toString().trim();
                  newLabResult.crnHt = fetchExcelItems[j]["Crown Height".toLowerCase()]?.toString().trim();
                  newLabResult.pavDp = fetchExcelItems[j]["Pavilion Depth".toLowerCase()]?.toString().trim();
                  newLabResult.depthPer = fetchExcelItems[j]["Total Depth".toLowerCase()]?.toString().trim();//Depth%==TotalDepth
                  newLabResult.crnAg = fetchExcelItems[j]["Crown Angle".toLowerCase()]?.toString().trim();
                  newLabResult.pavAg = fetchExcelItems[j]["Pavilion Angle".toLowerCase()]?.toString().trim();
                  newLabResult.culetSize = fetchExcelItems[j]["Culet Size".toLowerCase()]?.toString().trim();
                  newLabResult.girdlePer = fetchExcelItems[j]["Girdle Percent".toLowerCase()]?.toString().trim();
                  newLabResult.minGirdle = fetchExcelItems[j]["Girdle Name".toLowerCase()]?.toString().trim();
                  newLabResult.maxGirdle = fetchExcelItems[j]["Girdle Name".toLowerCase()]?.toString().trim();
                  newLabResult.polish = fetchExcelItems[j]["POL or Pol/Sym".toLowerCase()]?.toString().trim();
                  newLabResult.symmetry = fetchExcelItems[j]["SYM".toLowerCase()]?.toString().trim();
                  newLabResult.finalCut = fetchExcelItems[j]["CUT-PROP".toLowerCase()]?.toString().trim();
                  newLabResult.clarity = fetchExcelItems[j]["Clarity".toLowerCase()]?.toString().trim();
                  newLabResult.colorDescriptions = fetchExcelItems[j]["Color (Short)".toLowerCase()]?.toString().trim();
                  newLabResult.reportTypeI = fetchExcelItems[j]["Report Type I".toLowerCase()]?.toString().trim();
                  newLabResult.reportFormatI = fetchExcelItems[j]["Report Format I".toLowerCase()]?.toString().trim();
                  newLabResult.color = fetchExcelItems[j]["Color (Long)".toLowerCase()]?.toString().trim();
                  newLabResult.reportTypeII = fetchExcelItems[j]["Report Type II".toLowerCase()]?.toString().trim();
                  newLabResult.reportFormatII = fetchExcelItems[j]["Report Format II".toLowerCase()]?.toString().trim();
                  newLabResult.fluorescenceIntensity = fetchExcelItems[j]["Fluorescence".toLowerCase()]?.toString().trim();
                  newLabResult.commentsConsultation = fetchExcelItems[j]["Comments Consultation".toLowerCase()]?.toString().trim();
                  newLabResult.specialComments = fetchExcelItems[j]["Special Comments".toLowerCase()]?.toString().trim();
                  newLabResult.reportComments = fetchExcelItems[j]["Report Comment".toLowerCase()]?.toString().trim();
                  newLabResult.memoNo = fetchExcelItems[j]["Memo No".toLowerCase()]?.toString().trim();
                  newLabResult.faxComments = fetchExcelItems[j]["Fax Comments".toLowerCase()]?.toString().trim();
                  newLabResult.inscription = fetchExcelItems[j]["Laserscribe".toLowerCase()]?.toString().trim();
                  newLabResult.recheck = fetchExcelItems[j]["Recheck".toLowerCase()]?.toString().trim();

                  let array: string[] = [];
                  let girdelData: '';
                  girdelData = fetchExcelItems[j]["Girdle Name".toLowerCase()]?.toString().trim();
                  girdelMinMaxString = fetchExcelItems[j]["Girdle Name".toLowerCase()]?.toString().trim();
                  let modifiedName = this.utilityService.convertGridleName(girdelData);

                  if (modifiedName.includes(' to ')) {
                    array = modifiedName.split(' to ');
                    newLabResult.minGirdle = array[0];
                    newLabResult.maxGirdle = array[1];
                  }
                  else {
                    newLabResult.minGirdle = modifiedName.toString().trim();
                    newLabResult.maxGirdle = modifiedName.toString().trim();
                  }

                }
                else if (this.SelectedLab == 'HRD') {
                  newLabResult.reportNo = fetchExcelItems[j]["Report.No".toLowerCase()]?.toString().trim();
                  newLabResult.clientRef = fetchExcelItems[j]["Client Ref".toLowerCase()]?.toString().trim();
                  if (newLabResult.clientRef == null || newLabResult.clientRef == undefined)
                    break;
                  newLabResult.emailTransitOurRef = fetchExcelItems[j]["EmailTransit: Our Ref.".toLowerCase()]?.toString().trim();
                  newLabResult.done = fetchExcelItems[j]["Done".toLowerCase()]?.toString().trim();
                  newLabResult.shape = fetchExcelItems[j]["Shape".toLowerCase()]?.toString().trim();
                  newLabResult.weight = fetchExcelItems[j]["Weight R".toLowerCase()]?.toString().trim();
                  newLabResult.clarity = fetchExcelItems[j]["Clarity".toLowerCase()]?.toString().trim();
                  newLabResult.potentialClarity = fetchExcelItems[j]["Potential Clarity".toLowerCase()]?.toString().trim();
                  newLabResult.weightlossClarity = fetchExcelItems[j]["Weight-loss Clarity".toLowerCase()]?.toString().trim();
                  newLabResult.fluorescenceIntensity = fetchExcelItems[j]["LW-fluo".toLowerCase()]?.toString().trim();
                  newLabResult.color = fetchExcelItems[j]["Colour".toLowerCase()]?.toString().trim();
                  newLabResult.eCG = fetchExcelItems[j]["ECG".toLowerCase()]?.toString().trim();
                  newLabResult.diamLWMinmm = fetchExcelItems[j]["Diam / LW Min".toLowerCase()]?.toString().trim();
                  newLabResult.diamLWMaxmm = fetchExcelItems[j]["Diam / LW Max".toLowerCase()]?.toString().trim();
                  newLabResult.heightCAvgmm = fetchExcelItems[j]["Height CAvg".toLowerCase()]?.toString().trim();
                  newLabResult.minGirdle = fetchExcelItems[j]["Girdle description".toLowerCase()]?.toString().trim();
                  newLabResult.maxGirdle = fetchExcelItems[j]["Girdle description".toLowerCase()]?.toString().trim();
                  girdelMinMaxString = fetchExcelItems[j]["Girdle description".toLowerCase()]?.toString().trim();
                  newLabResult.culetSize = fetchExcelItems[j]["Culet nature".toLowerCase()]?.toString().trim();
                  newLabResult.tablePer = fetchExcelItems[j]["Table width %".toLowerCase()]?.toString().trim();
                  newLabResult.crownPer = fetchExcelItems[j]["Crown %".toLowerCase()]?.toString().trim();
                  newLabResult.pavillionPer = fetchExcelItems[j]["Pavillion %".toLowerCase()]?.toString().trim();
                  newLabResult.finalCut = fetchExcelItems[j]["Proportions".toLowerCase()]?.toString().trim();
                  newLabResult.polish = fetchExcelItems[j]["Polish".toLowerCase()]?.toString().trim();
                  newLabResult.symmetry = fetchExcelItems[j]["Symmetry".toLowerCase()]?.toString().trim();
                  newLabResult.hna = fetchExcelItems[j]["H&A".toLowerCase()]?.toString().trim();
                  newLabResult.potentialMake = fetchExcelItems[j]["Potential Make".toLowerCase()]?.toString().trim();
                  newLabResult.inscription = fetchExcelItems[j]["Inscription".toLowerCase()]?.toString().trim();
                  newLabResult.remarks = fetchExcelItems[j]["Remarks".toLowerCase()]?.toString().trim();
                  newLabResult.premiumIdealCut = fetchExcelItems[j]["Premium Ideal Cut".toLowerCase()]?.toString().trim();
                  newLabResult.depthPer = fetchExcelItems[j]["Total depth%".toLowerCase()]?.toString().trim();//Depth%==TotalDepth
                  newLabResult.girdleCondition = fetchExcelItems[j]["Girdle nature".toLowerCase()]?.toString().trim();
                  newLabResult.crnAg = fetchExcelItems[j]["Crown angle°".toLowerCase()]?.toString().trim();
                  newLabResult.crnHt = fetchExcelItems[j]["Cr. Height%".toLowerCase()]?.toString().trim();
                  newLabResult.pavAg = fetchExcelItems[j]["Pavillion angle°".toLowerCase()]?.toString().trim();
                  newLabResult.pavDp = fetchExcelItems[j]["Pav. depth%".toLowerCase()]?.toString().trim();
                  newLabResult.strLn = fetchExcelItems[j]["Length halves cr%".toLowerCase()]?.toString().trim();
                  newLabResult.lrHalf = fetchExcelItems[j]["Length halves pav%".toLowerCase()]?.toString().trim();
                  newLabResult.girdlePer = fetchExcelItems[j]["Girdle size %".toLowerCase()]?.toString().trim();
                }
                this.labResultItems.push(newLabResult);

                //Insert Required data of excel in LabResultExcelItems as per Inventory Item.
                let newData: LabResultExcelItems = new LabResultExcelItems();
                newData.type = this.SelectedLab + ' Excel';
                newData.stoneId = newLabResult.clientRef;
                newData.weight = parseFloat(newLabResult.weight);
                newData.shape = this.getDisplayNameFromMasterDNorm(newLabResult.shape.trim(), this.allTheShapes);
                newData.color = this.getDisplayNameFromMasterDNorm(newLabResult.color.trim(), this.allColors);
                newData.clarity = this.getDisplayNameFromMasterDNorm(newLabResult.clarity.trim(), this.allClarities);
                newData.cut = this.getDisplayNameFromMasterDNorm(newLabResult.finalCut?.trim(), this.allTheCPS);
                newData.polish = this.getDisplayNameFromMasterDNorm(newLabResult.polish.trim(), this.allTheCPS);
                newData.symmetry = this.getDisplayNameFromMasterDNorm(newLabResult.symmetry.trim(), this.allTheCPS);
                newData.fluorescence = this.getDisplayNameFromMasterDNorm(newLabResult.fluorescenceIntensity.trim(), this.allTheFluorescences);
                newData.table = parseFloat(newLabResult.tablePer);
                newData.culet = newLabResult.culetSize;

                let girdleAll = this.measurementData.filter(item => item.type.toLowerCase().indexOf('girdle') !== -1);
                newData.maxGirdle = this.getDisplayNameFromMasterDNorm(newLabResult.maxGirdle.trim(), girdleAll);
                newData.minGirdle = this.getDisplayNameFromMasterDNorm(newLabResult.minGirdle.trim(), girdleAll);

                let typeFlag = '';
                if (newLabResult.diamondType == "Type IIa")
                  typeFlag = 'Type 2A';
                else if (newLabResult.diamondType == "Type Ia")
                  typeFlag = 'Type 1A';
                else if (newLabResult.diamondType == "Type Iab")
                  typeFlag = 'Type 1AB';
                else
                  typeFlag = newLabResult.diamondType;

                if (this.SelectedLab == 'GIA') {
                  newData.comments = newLabResult.reportComments;
                  newData.depth = parseFloat(newLabResult.depthPer);
                  newData.length = parseFloat(newLabResult.length);
                  newData.width = parseFloat(newLabResult.width);
                  newData.height = parseFloat(newLabResult.depth);
                  newData.crownHeight = parseFloat(newLabResult.crnHt) * 100;
                  newData.crownAngle = parseFloat(newLabResult.crnAg);
                  newData.pavilionDepth = parseFloat(newLabResult.pavDp) * 100;
                  newData.pavilionAngle = parseFloat(newLabResult.pavAg);
                  newData.girdlePer = parseFloat(newLabResult.girdlePer) * 100;
                  newData.girdleCondition = newLabResult.girdleCondition;
                  newData.ktoS = newLabResult.keytoSymbols;
                  newData.flColor = newLabResult.fluorescenceColor;
                  newData.certificateNo = newLabResult.reportNo;
                  newData.Inscription = newLabResult.inscription;
                  newData.strLn = (newLabResult.strLn * 100);
                  newData.lrHalf = (newLabResult.lrHalf * 100);
                  newData.controlNo = newLabResult.controlNo;
                  newData.typeA = typeFlag;

                  if (newData.color == "*")
                    newData.color = this.ShowColorDescription(newLabResult.colorDescriptions);

                  if (newLabResult.colorDescriptions == "Faint Brown")
                    newData.brown = "FBR";

                }
                else if (this.SelectedLab == 'IGI') {
                  newData.Inscription = newLabResult.inscription;
                  newData.certificateNo = newLabResult.reportNo;
                  newData.depth = parseFloat(newLabResult.depthPer);
                  newData.length = parseFloat(newLabResult.length);
                  newData.width = parseFloat(newLabResult.width);
                  newData.height = parseFloat(newLabResult.depth);
                  newData.crownHeight = parseFloat(newLabResult.crnHt);
                  newData.pavilionDepth = parseFloat(newLabResult.pavDp);
                  newData.girdlePer = parseFloat(newLabResult.girdlePer);
                  newData.comments = newLabResult.reportComments;
                  newData.crownAngle = parseFloat(newLabResult.crnAg);
                  newData.pavilionAngle = parseFloat(newLabResult.pavAg);
                }
                else if (this.SelectedLab == 'HRD') {
                  newData.hna = newLabResult.hna;
                  newData.certificateNo = newLabResult.reportNo;
                  newData.depth = parseFloat(newLabResult.depthPer);
                  newData.length = parseFloat(newLabResult.diamLWMaxmm);
                  newData.width = parseFloat(newLabResult.diamLWMinmm);
                  newData.height = parseFloat(newLabResult.heightCAvgmm);
                  newData.girdleCondition = newLabResult.girdleCondition;
                  newData.crownAngle = parseFloat(newLabResult.crnAg);
                  newData.crownHeight = parseFloat(newLabResult.crnHt);
                  newData.pavilionAngle = parseFloat(newLabResult.pavAg);
                  newData.pavilionDepth = parseFloat(newLabResult.pavDp);
                  newData.strLn = newLabResult.strLn;
                  newData.lrHalf = newLabResult.lrHalf;
                  newData.girdlePer = parseFloat(newLabResult.girdlePer);
                  newData.Inscription = newLabResult.reportNo;
                }

                newData.orgId = this.fxCredentials.organizationId;
                newData.orgName = this.fxCredentials.organization;
                newData.deptId = this.fxCredentials.departmentId;
                newData.deptName = this.fxCredentials.department;
                newData.branchName = this.fxCredentials.branch;
                newData.country = this.organizationAddress.country;
                newData.city = this.organizationAddress.city;
                newData.empName = this.fxCredentials.fullName;
                newData.empId = this.fxCredentials.id;
                newData.status = StoneStatus.Lab.toString();

                if (newData.depth == null || newData.depth == undefined || newData.depth == 0)
                  this.calculateDepth(newData);
                this.calculateRatio(newData);

                //find cut in all fancy shape.
                if (newData.shape != "RBC")
                  this.calculateFancyCut(newData);

                //Get CPS value
                newData.cps = this.utilityService.getCPSValue(newData.shape, newData.cut, newData.polish, newData.symmetry, this.masterConfigList.cutDetails);

                newData.isDisabled = false;

                if (newData.shape != "RBC") {
                  var items = this.allGirdlePer.filter(c => c.shape.toLowerCase() == newData.shape.toLowerCase() && c.name.toLowerCase() == girdelMinMaxString.toLowerCase());
                  if (items.length > 0) {
                    newData.girdlePer = this.utilityService.ConvertToFloatWithDecimalTwoDigitRoundWithNum((items[0].minGirdleNumber + items[0].maxGirdleNumber) / 2);
                  }
                }

                this.labResultExcelItems.push(newData)
              }

              let Ids: string[] = this.labResultExcelItems.map((x: any) => x.stoneId);
              this.inventoryItems = await this.labService.GetInvItemsFromStoneIds(Ids)

              await this.checkValidationForAll(this.labResultExcelItems);

              this.labResultExcelItems = await this.setBasePricing(this.labResultExcelItems);

              // var notValidDiscount: string[] = this.labResultExcelItems.filter(z => z.discount == null).map(z => z.stoneId);
              // this.validateValues(this.labResultExcelItems, notValidDiscount, "Discount Not found");

              var notValidDiscount: string[] = this.labResultExcelItems.filter(z => z.rap == null).map(z => z.stoneId);
              if (notValidDiscount.length > 0) {
                this.validateValues(this.labResultExcelItems, notValidDiscount, "Rap Not found");
                notValidDiscount.forEach(z => { this.errorStoneData.push({ stonId: z, msg: "Rap Not found!", code: 1 }) });
              }

              var notValidInvStatus: string[] = this.inventoryItems.filter(z => z.status != StoneStatus.Lab.toString()).map(z => z.stoneId);
              if (notValidInvStatus.length > 0) {
                this.validateValues(this.labResultExcelItems, notValidInvStatus, "Only Lab Inventory Status Stone Allowed");
                notValidInvStatus.forEach(z => { this.errorStoneData.push({ stonId: z, msg: "Only Lab Inventory Status Stone Allowed!", code: 2 }) });
              }

              if (this.labResultExcelItems && this.labResultExcelItems.length > 0) {
                this.gradingMasterItem = await this.labService.GetGradingFromStoneIds(Ids)

                this.labResultExcelItems.forEach(z => {
                  let obj = this.inventoryItems.find(a => a.stoneId == z.stoneId);
                  if (obj != null) {
                    z.kapan = obj.kapan;
                    z.article = obj.article;
                    z.media = obj.media;
                    z.shapeRemark = obj.shapeRemark;
                    
                    if (!this.getDisplayNameFromMasterDNorm(z.color, this.allColors)) {

                      const rap = z.rap;
                      let disc = obj.basePrice.discount;
                      if (rap && disc) {
                        if (disc.toString() != '-') {

                          disc = parseFloat(disc.toString());
                          let weight = z.weight;
                          let stoneRap = weight * rap;
                          let calDiscount = 100 + disc;
                          let netAmount = (calDiscount * stoneRap) / 100;

                          z.netAmount = this.utilityService.ConvertToFloatWithDecimal(netAmount);
                          let perCarat = netAmount / weight;
                          z.perCarat = this.utilityService.ConvertToFloatWithDecimal(perCarat);
                          z.discount = obj.basePrice.discount;
                        }
                      }

                    }
                  }
                });
              }
              let labResultExcelItems = JSON.parse(JSON.stringify(this.labResultExcelItems));
              this.loadItems(labResultExcelItems);
              this.showStoneErrorMsg();
              this.spinnerService.hide();
            }
          }
          fileReader.readAsArrayBuffer(file);
        }
        else
          this.alertDialogService.show(`Please select only .xlsx or .xls file.`);
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error)
    }
  }

  public calculateFancyCut(target: LabResultExcelItems): void {
    if (target && target.shape.toLowerCase() != 'rbc') {
      let girdleAll = this.measurementData.filter(item => item.type.toLowerCase().indexOf('girdle') !== -1);
      let targetminP = girdleAll.find(z => z.name == target.minGirdle)?.priority;
      let targetmaxP = girdleAll.find(z => z.name == target.maxGirdle)?.priority;

      let tempShape = this.invItem.find(x => x.stoneId == target.stoneId && x.shapeRemark != null);
      let newShape = tempShape != null ? true : false;

      let finalFancyCutRecords = this.allTheFancy.find(
        f => newShape ? f.shape.toLowerCase() == tempShape?.shapeRemark.toLowerCase() : f.shape.toLowerCase() == target?.shape.toLowerCase()
          && f.minDepth <= (target.depth ?? 0) && f.maxDepth >= (target.depth ?? 0)
          && f.minTable <= (target.table ?? 0) && f.maxTable >= (target.table ?? 0)
          && f.minRatio <= target.ratio && f.maxRatio >= target.ratio
          && typeof f.minGirdlePriority === 'number' && f.minGirdlePriority <= (typeof targetminP === 'string' ? parseInt(targetminP) : 0)
          && typeof f.maxGirdlePriority === 'number' && f.maxGirdlePriority >= (typeof targetmaxP === 'string' ? parseInt(targetmaxP) : 0)
      );
      if (finalFancyCutRecords != null)
        target.cut = finalFancyCutRecords.cut;
      else
        target.cut = "FR";
    }
  }

  public getDisplayNameFromMasterDNorm(name: string, list: MasterDNorm[]): string {
    if (name && name.length > 0)
      var obj = list.find(c => c.name.toLowerCase() == name.toLowerCase() || c.displayName?.toLowerCase() == name.toLowerCase() || (c.optionalWords && c.optionalWords.length > 0 && c.optionalWords.map(u => u.toLowerCase().trim()).includes(name.toLowerCase())));
    return obj?.name ?? null as any;
  }

  public getDisplayNameForComment(name: string, list: MasterDNorm[]): string {
    if (name != null) {
      var obj = list.find(c => c.name.toLowerCase() == name.toLowerCase() || c.displayName.toLowerCase() == name.toLowerCase() || c.optionalWords != null && c.optionalWords.map(u => u.toLowerCase()).includes(name.toLowerCase()));
      return obj?.displayName ?? null as any;
    }
    else
      return null as any;
  }

  public calculateRatio(target: LabResultExcelItems): void {
    if (target) {

      target.length = this.utilityService.ConvertToFloatWithDecimal(parseFloat(target.length?.toString() ?? '0'));
      target.width = this.utilityService.ConvertToFloatWithDecimal(parseFloat(target.width?.toString() ?? '0'));
      target.height = this.utilityService.ConvertToFloatWithDecimal(parseFloat(target.height?.toString() ?? '0'));

      var max = ((target.length ?? 0) > (target.width ?? 0)) ? (target.length ?? 0) : (target.width ?? 0);
      var min = ((target.width ?? 0) > (target.length ?? 0)) ? (target.length ?? 0) : (target.width ?? 0);

      if (target.shape?.toLowerCase() == 'hb')
        target.ratio = min / max;
      else
        target.ratio = max / min;

      target.ratio = this.utilityService.ConvertToFloatWithDecimal(target.ratio ?? 0);
    }
  }

  public calculateDepth(target: LabResultExcelItems): void {
    if (target.height && (target.length || target.width)) {

      target.length = this.utilityService.ConvertToFloatWithDecimal(parseFloat(target.length?.toString() ?? '0'));
      target.width = this.utilityService.ConvertToFloatWithDecimal(parseFloat(target.width?.toString() ?? '0'));
      target.height = this.utilityService.ConvertToFloatWithDecimal(parseFloat(target.height?.toString() ?? '0'));

      if (target.shape?.toLowerCase() == 'rbc')
        target.depth = ((target.height ?? 0) / (target.length ?? 0)) * 100;
      else if (target.shape?.toLowerCase() == 'hb') {
        let val = (target.length ?? 0);
        if ((target.length ?? 0) < (target.width ?? 0))
          val = (target.width ?? 0);
        target.depth = ((target.height ?? 0) / val) * 100;
      }
      else {
        let val = (target.length ?? 0);
        if ((target.length ?? 0) > (target.width ?? 0))
          val = (target.width ?? 0);
        target.depth = ((target.height ?? 0) / val) * 100;
      }
      if (target.depth == Infinity || target.depth == 0)
        target.depth = null as any;
      else
        target.depth = this.utilityService.ConvertToFloatWithDecimal(target.depth ?? 0);
    }
    else
      target.depth = null as any;
  }

  public mappingPricingRequestData(item: LabResultExcelItems): MfgPricingRequest {
    let mesurement = new MfgMeasurementData();
    mesurement.TblDepth = item.depth ?? 0;
    mesurement.TblAng = item.table ?? 0;
    mesurement.Length = item.length ?? 0;
    mesurement.Width = item.width ?? 0;
    mesurement.Height = item.height ?? 0;
    mesurement.CrHeight = item.crownHeight ?? 0;
    mesurement.CrAngle = item.crownAngle ?? 0;
    mesurement.PvlDepth = item.pavilionDepth ?? 0;
    mesurement.PvlAngle = item.pavilionAngle ?? 0;
    mesurement.StarLength = 0;
    mesurement.LowerHalf = 0;
    mesurement.GirdlePer = item.girdlePer ?? 0;
    mesurement.MinGirdle = item.minGirdle;
    mesurement.MaxGirdle = item.maxGirdle;
    mesurement.Ratio = item.ratio ?? 0;

    let incusion = new MfgInclusionData();
    incusion.Brown = item.brown;
    incusion.Green = item.green;
    incusion.Milky = item.milky;
    incusion.Shade = item.shade;
    incusion.SideBlack = item.sideBlack;
    incusion.CenterBlack = item.centerBlack;
    incusion.SideWhite = item.sideWhite;
    incusion.CenterWhite = item.centerWhite;
    incusion.OpenTable = item.openTable;
    incusion.OpenCrown = item.openCrown;
    incusion.OpenPavilion = item.openPavilion;
    incusion.OpenGirdle = item.openGirdle;
    incusion.GirdleCond = [];
    incusion.EFOC = item.efoc;
    incusion.EFOP = item.efop;
    incusion.Culet = item.culet;
    incusion.HNA = item.hna;
    incusion.EyeClean = item.eyeClean;
    incusion.KToS = item.ktoS?.split(',') ?? [];
    incusion.NaturalOnGirdle = item.naturalOnGirdle;
    incusion.NaturalOnCrown = item.naturalOnCrown;
    incusion.NaturalOnPavillion = item.naturalOnPavillion;
    incusion.FlColor = item.flColor;
    incusion.Luster = item.luster;
    incusion.BowTie = item.bowtie;
    incusion.CertiComment = item.certiComment;

    let req: MfgPricingRequest = {
      Lab: "GIA",
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
      IGrade: "",
      MGrade: ""
    };
    return req;
  }

  public async checkValidationForAll(existData: LabResultExcelItems[]) {
    try {
      //exist stones
      let fetchExcelIds: string[] = existData.map((x: any) => x.stoneId);
      this.existStoneIds = await this.labService.getStoneIdsExistOrNotLabResultAsync(fetchExcelIds)
      if (this.existStoneIds && this.existStoneIds.length > 0) {
        this.validateValues(existData, this.existStoneIds, "Lab result already exists for this StoneId", true);
        if (this.existStoneIds.length > 0)
          this.existStoneIds.forEach(z => { this.errorStoneData.push({ stonId: z, msg: "Lab result already exists for this StoneId", code: 3 }) });
      }

      //Lab Issue not found
      let labIssue = await this.labService.getAllLabsIssueByStoneIds(fetchExcelIds);
      if (labIssue && labIssue.length > 0) {
        let nonExistsIds = existData.filter(z => !labIssue.some(a => a.labIssueItems.some(b => b.stoneId == z.stoneId))).map(z => z.stoneId);
        if (nonExistsIds && nonExistsIds.length > 0) {
          this.validateValues(existData, nonExistsIds, "Lab Issue not found!");
          nonExistsIds.forEach(z => { this.errorStoneData.push({ stonId: z, msg: "Lab Issue not found!", code: 4 }) });
        }
      }
      else
        this.validateValues(existData, fetchExcelIds, "Lab Issue not found!");

      //validation for shape
      var notValidShapeId: string[] = existData.filter(z => z.shape == null).map(z => z.stoneId);
      if (notValidShapeId && notValidShapeId.length > 0) {
        this.validateValues(existData, notValidShapeId, "Please add valid shape");
        notValidShapeId.forEach(z => { this.errorStoneData.push({ stonId: z, msg: "Please add valid shape!", code: 5 }) });
      }

      //validation for color
      var notValidColorId: string[] = existData.filter(z => z.color == null).map(z => z.stoneId);
      if (notValidColorId && notValidColorId.length > 0) {
        this.validateValues(existData, notValidColorId, "Please add valid color");
        notValidColorId.forEach(z => { this.errorStoneData.push({ stonId: z, msg: "Please add valid color!", code: 6 }) });
      }

      //validation for clarity
      var notValidClarityId: string[] = existData.filter(z => z.clarity == null).map(z => z.stoneId);
      if (notValidClarityId && notValidClarityId.length > 0) {
        this.validateValues(existData, notValidClarityId, "Please add valid clarity");
        notValidClarityId.forEach(z => { this.errorStoneData.push({ stonId: z, msg: "Please add valid clarity!", code: 7 }) });
      }

      //validation for fluorescence
      var notValidFlourId: string[] = existData.filter(z => z.fluorescence == null).map(z => z.stoneId);
      if (notValidFlourId && notValidFlourId.length > 0) {
        this.validateValues(existData, notValidFlourId, "Please add valid fluorescence");
        notValidFlourId.forEach(z => { this.errorStoneData.push({ stonId: z, msg: "Please add valid fluorescence!", code: 8 }) });
      }

      //validation for cut
      var notValidCutId: string[] = existData.filter(z => z.cut == null).map(z => z.stoneId);
      if (notValidCutId && notValidCutId.length > 0) {
        this.validateValues(existData, notValidCutId, "Please add valid cut");
        notValidCutId.forEach(z => { this.errorStoneData.push({ stonId: z, msg: "Please add valid cut!", code: 9 }) });
      }

      //validation for polish
      var notValidPolishId: string[] = existData.filter(z => z.polish == null).map(z => z.stoneId);
      if (notValidPolishId && notValidPolishId.length > 0) {
        this.validateValues(existData, notValidPolishId, "Please add valid polish");
        notValidPolishId.forEach(z => { this.errorStoneData.push({ stonId: z, msg: "Please add valid polish!", code: 10 }) });
      }

      //validation for symmetry
      var notValidSymmId: string[] = existData.filter(z => z.symmetry == null).map(z => z.stoneId);
      if (notValidSymmId && notValidSymmId.length > 0) {
        this.validateValues(existData, notValidSymmId, "Please add valid symmetry");
        notValidSymmId.forEach(z => { this.errorStoneData.push({ stonId: z, msg: "Please add valid symmetry!", code: 11 }) });
      }

      //validation for Girdle
      var notValidMinGirdleId: string[] = existData.filter(z => z.minGirdle == null).map(z => z.stoneId);
      if (notValidMinGirdleId && notValidMinGirdleId.length > 0) {
        this.validateValues(existData, notValidMinGirdleId, "Please add valid Girdle");
        notValidMinGirdleId.forEach(z => { this.errorStoneData.push({ stonId: z, msg: "Please add valid Girdle!", code: 12 }) });
      }

      var notValidMaxGirdleId: string[] = existData.filter(z => z.maxGirdle == null).map(z => z.stoneId);
      if (notValidMaxGirdleId && notValidMaxGirdleId.length > 0) {
        this.validateValues(existData, notValidMaxGirdleId, "Please add valid Girdle");
        notValidMaxGirdleId.forEach(z => { this.errorStoneData.push({ stonId: z, msg: "Please add valid Girdle!", code: 13 }) });
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error)
    }
  }

  private async setBasePricing(data: LabResultExcelItems[]): Promise<LabResultExcelItems[]> {
    try {
      let reqList: MfgPricingRequest[] = [];
      data.forEach(z => {
        if (z.isDisabled != true)
          reqList.push(this.mappingPricingRequestData(z));
      });

      let response = await this.pricingService.getBasePrice(reqList);
      if (response && response.length > 0) {
        for (let index = 0; index < reqList.length; index++) {
          let z = data[index];
          let target = response.find(a => a.id == z.stoneId);
          if (target && target.rapPrice != null && target.rapPrice > 0) {
            // if (target.error != null) {
            //   target = this.utilityService.setAmtForPricingDiscountResponse(target, z.weight);
            //   z.rap = target.rapPrice;
            //   z.discount = target.discount;
            //   z.netAmount = target.amount;
            //   z.perCarat = target.dCaret;
            // }
            // else {
            let obj = this.inventoryItems.find(a => a.stoneId == z.stoneId);
            if (obj && obj.basePrice != null && obj.basePrice.discount != null) {
              target.discount = obj.basePrice.discount ?? 0;
              target = this.utilityService.setAmtForPricingDiscountResponse(target, z.weight);
              z.rap = target.rapPrice;
              z.discount = target.discount;
              z.netAmount = target.amount;
              z.perCarat = target.dCaret;
            }
            else {
              z.discount = null as any;
              z.netAmount = null as any;
              z.perCarat = null as any;
            }
            // }
          }
          else
            z = await this.getRapPriceData(z);
        }
      }
    }
    catch (error) {
      console.error(error);
    }
    return data;
  }

  public async getRapPriceData(newItem: LabResultExcelItems): Promise<LabResultExcelItems> {
    try {
      if (newItem.shape != null) {
        let rapPrice: RapPriceRequest = {
          shape: newItem.shape,
          weight: newItem.weight,
          color: newItem.color,
          clarity: newItem.clarity
        }

        let pricing = await this.commuteService.getRapPrice(rapPrice);
        if (pricing)
          newItem.rap = pricing.price;
        else
          newItem.rap = null as any;
      }
      else
        newItem.rap = null as any;

      newItem.discount = null as any;
      newItem.netAmount = null as any;
      newItem.perCarat = null as any;
    }
    catch (error: any) {
      console.error(error);

      newItem.rap = null as any;
      newItem.discount = null as any;
      newItem.netAmount = null as any;
      newItem.perCarat = null as any;
    }
    return newItem;
  }

  private getweight(txt: string): string {
    let startIndex = txt.indexOf('(');
    let endIndex = txt.indexOf(')');
    return txt.substring(startIndex + 1, endIndex)
  }

  public getDetailData(stoneId: string): LabResultExcelItems[] {
    let list: LabResultExcelItems[] = [];
    try {
      //Show Inventory Record In Detail Grid.
      //let invItem = this.inventoryItems.find(z => z.stoneId == stoneId);
      //if (invItem)
      //list.push(this.mappingInvItemtoDetailGrid(invItem));

      let gradItems = this.gradingMasterItem.filter(z => z.stoneId == stoneId);
      if (gradItems)
        list.push(...this.mappingGradeItemtoDetailGrid(gradItems));

      return list;
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error)
      return list;
    }
  }

  private mappingGradeItemtoDetailGrid(data: GradingMaster[]): LabResultExcelItems[] {
    let Items: LabResultExcelItems[] = [];
    data.forEach(z => {
      if (z.rapVer == "InvUpload" || z.rapVer == "Grading" || z.rapVer == "LabResult") {
        let item = new LabResultExcelItems();
        item.type = z.rapVer;
        item.stoneId = z.stoneId;
        item.kapan = z.kapan;
        item.article = z.article
        item.shape = z.shape;
        item.weight = z.weight;
        item.color = z.color;
        item.clarity = z.clarity;
        item.cut = z.cut;
        item.polish = z.polish;
        item.symmetry = z.symmetry;
        item.fluorescence = z.fluorescence;
        item.rap = z.basePrice.rap;
        item.discount = z.basePrice.discount;
        item.netAmount = z.basePrice.netAmount;
        item.perCarat = z.basePrice.perCarat;
        item.certificateNo = z.certificateNo;
        item.comments = z.comments;
        item.brown = z.inclusion.brown;
        item.green = z.inclusion.green;
        item.milky = z.inclusion.milky;
        item.shade = z.inclusion.shade;
        item.sideBlack = z.inclusion.sideBlack;
        item.centerSideBlack = z.inclusion.centerSideBlack;
        item.centerBlack = z.inclusion.centerBlack;
        item.sideWhite = z.inclusion.sideWhite;
        item.centerSideWhite = z.inclusion.centerSideWhite;
        item.centerWhite = z.inclusion.centerWhite;
        item.openCrown = z.inclusion.openCrown;
        item.openTable = z.inclusion.openTable;
        item.openPavilion = z.inclusion.openPavilion;
        item.openGirdle = z.inclusion.openGirdle;
        item.efoc = z.inclusion.efoc;
        item.efot = z.inclusion.efot;
        item.efog = z.inclusion.efog;
        item.efop = z.inclusion.efop;
        item.hna = z.inclusion.hna;
        item.eyeClean = z.inclusion.eyeClean;
        item.ktoS = z.inclusion.ktoS;
        item.naturalOnTable = z.inclusion.naturalOnTable;
        item.naturalOnGirdle = z.inclusion.naturalOnGirdle;
        item.naturalOnCrown = z.inclusion.naturalOnCrown;
        item.naturalOnPavillion = z.inclusion.naturalOnPavillion;
        item.girdleCondition = z.inclusion.girdleCondition;
        item.culet = z.inclusion.culet;
        item.bowtie = z.inclusion.bowtie;
        item.luster = z.inclusion.luster;
        item.redSpot = z.inclusion.redSpot;
        item.depth = z.measurement.depth;
        item.table = z.measurement.table;
        item.length = z.measurement.length;
        item.width = z.measurement.width;
        item.height = z.measurement.height;
        item.crownHeight = z.measurement.crownHeight;
        item.crownAngle = z.measurement.crownAngle;
        item.pavilionDepth = z.measurement.pavilionDepth;
        item.pavilionAngle = z.measurement.pavilionAngle;
        item.girdlePer = z.measurement.girdlePer;
        item.maxGirdle = z.measurement.maxGirdle;
        item.minGirdle = z.measurement.minGirdle;
        item.ratio = z.measurement.ratio;
        item.strLn = z.strLn;
        item.lrHalf = z.lrHalf;
        Items.push(item);
      }
    });
    return Items;
  }
  //#endregion

  //#region On Change Functions
  public loadItems(grid_data: LabResultExcelItems[]) {
    this.gridInventoryData = [];

    if (this.selectedFromWeight && this.selectedFromWeight > 0 && this.selectedToWeight && this.selectedToWeight > 0) {
      let fweight = this.selectedFromWeight;
      let toweight = this.selectedToWeight;
      grid_data = grid_data.filter(z => fweight <= z.weight && z.weight <= toweight);
    }

    if (grid_data.length > 0) {
      for (let indexGrid = this.skip; indexGrid < this.pageSize + this.skip; indexGrid++) {
        const element = grid_data[indexGrid];
        if (element)
          this.gridInventoryData.push(element);
      }
    }

    if (this.selectedFromWeight && this.selectedFromWeight > 0 && this.selectedToWeight && this.selectedToWeight > 0) {
      this.gridView = {
        data: this.gridInventoryData,
        total: grid_data.length
      }
    }
    else {
      this.gridView = {
        data: this.gridInventoryData,
        total: this.labResultExcelItems.length
      }
    }

    this.spinnerService.hide();
  }

  public pageChange(event: PageChangeEvent): void {
    this.spinnerService.show();
    this.gridInventoryData = [];
    this.skip = event.skip;
    this.loadItems(this.labResultExcelItems);
  }

  public resetForm(form?: NgForm) {
    form?.reset();
    this.isRepairingStones = false;
  }
  //#endregion

  //#region Save Method
  public saveActionOnPacket(form: NgForm) {
    try {
      if (form.valid) {
        let validStone: LabResultExcelItems[] = [];

        this.selectedLabResultExcelItems.forEach(z => {
          var index = this.labResultExcelItems.findIndex(a => a.stoneId == z.stoneId);
          if (index > -1) {
            this.labResultExcelItems[index].labServiceAction = this.actionType;
            this.labResultExcelItems[index].labServiceCode = this.serviceCode;
            this.labResultExcelItems[index].labServiceReason = this.labReCheckRequestObj.recheckReason;
            this.labResultExcelItems[index].isRepairingStones = this.isRepairingStones;
          }

          var labResultIndex = this.labResultItems.findIndex(a => a.clientRef == z.stoneId);
          if (labResultIndex > -1) {
            this.labResultItems[labResultIndex].action = this.actionType;
            if (this.isRepairingStones == true)
              this.labResultItems[labResultIndex].isRepaired = true;
            else
              this.labResultItems[labResultIndex].isRepaired = false;
          }

          validStone.push(this.labResultExcelItems[index]);
        });

        var notValidData: string[] = validStone.filter(z => z.weight > 0.99 && z.labServiceAction.toLowerCase() == 'print' && (z.Inscription == "" || z.Inscription == null || z.Inscription == undefined)).map(z => z.stoneId);
        if (notValidData.length > 0) {
          this.validateValues(this.labResultExcelItems, notValidData, "Incription Not Found For 0.99 Up Stone");
          notValidData.forEach(z => { this.errorStoneData.push({ stonId: z, msg: "Incription Not Found For 0.99 Up Stone", code: 14 }) });
        }

        this.resetForm(form);
        this.loadItems(this.labResultExcelItems);
        this.utilityService.showNotification(`Action Added In Selected Packet!`);
        this.showStoneErrorMsg();
        this.closeDialog();
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async saveRecheckPacket(recheckExcelData: LabResultExcelItems[]) {
    try {
      if (recheckExcelData.length > 0) {
        this.spinnerService.show();
        let response: any;

        let labReCheckRequestObj: LabRecheckRequest = new LabRecheckRequest();

        recheckExcelData.forEach(z => {
          labReCheckRequestObj.stoneId.push(z.stoneId);
        });

        labReCheckRequestObj.identity.id = this.fxCredentials.id;
        labReCheckRequestObj.identity.name = this.fxCredentials.fullName;
        labReCheckRequestObj.identity.type = 'Employee' ?? '';
        labReCheckRequestObj.isRecheck = true;

        response = await this.labService.labRecheckRequest(labReCheckRequestObj);
        if (response) {
          this.closeDialog();
          this.utilityService.showNotification(`Lab Recheck Inserted successfully!`)
        }
        else {
          this.alertDialogService.show(response.message);
          if (response?.errorMessage?.length > 0)
            console.error(response.errorMessage);
        }
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async SaveLabResultFile(form?: NgForm) {
    try {
      if (this.selectedLabResultExcelItems.length > 0) {
        let messageType: string = "";
        let response: any;
        let selectedInventoryItems: InventoryItems[] = [];
        let stoneIdwithPrintAction: string[] = [];
        let stoneIdwithRepairing: string[] = [];

        let validActionData = this.selectedLabResultExcelItems.filter(z => z.labServiceAction != null && z.labServiceAction.length > 0 && z.isDisabled == false);

        if (validActionData.length == 0) {
          this.alertDialogService.show('Please select valid action stone(s)');
          return;
        }

        this.spinnerService.show();

        validActionData.forEach(z => {
          let Items = new InventoryItems();
          Items.stoneId = z.stoneId;
          Items.kapan = z.kapan;
          Items.article = z.article;
          Items.shape = z.shape;
          Items.weight = z.weight;
          Items.color = z.color;
          Items.clarity = z.clarity;
          Items.cut = z.cut;
          Items.polish = z.polish;
          Items.symmetry = z.symmetry;
          Items.fluorescence = z.fluorescence;
          Items.cps = z.cps;
          Items.comments = z.comments;
          Items.shapeRemark = z.shapeRemark;

          //Set Old Inculsion & Measurment fields for Grade Update
          let oldInvData = this.inventoryItems.find(a => a.stoneId == z.stoneId);
          if (oldInvData) {
            Items.inclusion = oldInvData.inclusion;
            Items.measurement = oldInvData.measurement;
          }
          Items.pricingComment = oldInvData?.pricingComment ?? '';
          Items.discColorMark = oldInvData?.discColorMark ?? '';

          Items.measurement.depth = this.utilityService.ConvertToFloatWithDecimalTwoDigitRoundWithNum(z.depth ?? (oldInvData?.measurement.depth ?? 0));//Depth% TotalDepth
          Items.measurement.table = z.table ?? (oldInvData?.measurement.table ?? 0);
          Items.measurement.length = this.utilityService.ConvertToFloatWithDecimalTwoDigitRoundWithNum(z.length ?? (oldInvData?.measurement.length ?? 0));
          Items.measurement.width = this.utilityService.ConvertToFloatWithDecimalTwoDigitRoundWithNum(z.width ?? (oldInvData?.measurement.width ?? 0));
          Items.measurement.height = this.utilityService.ConvertToFloatWithDecimalTwoDigitRoundWithNum(z.height ?? (oldInvData?.measurement.height ?? 0));
          Items.measurement.crownHeight = this.utilityService.ConvertToFloatWithDecimalTwoDigitRoundWithNum(z.crownHeight ?? (oldInvData?.measurement.crownHeight ?? 0));
          Items.measurement.crownAngle = this.utilityService.ConvertToFloatWithDecimalTwoDigitRoundWithNum(z.crownAngle ?? (oldInvData?.measurement.crownAngle ?? 0));
          Items.measurement.pavilionDepth = this.utilityService.ConvertToFloatWithDecimalTwoDigitRoundWithNum(z.pavilionDepth ?? (oldInvData?.measurement.pavilionDepth ?? 0));
          Items.measurement.pavilionAngle = this.utilityService.ConvertToFloatWithDecimalTwoDigitRoundWithNum(z.pavilionAngle ?? (oldInvData?.measurement.pavilionAngle ?? 0));
          Items.measurement.girdlePer = this.utilityService.ConvertToFloatWithDecimalTwoDigitRoundWithNum(z.girdlePer ?? (oldInvData?.measurement.girdlePer ?? 0));
          Items.measurement.maxGirdle = z.maxGirdle ?? (oldInvData?.measurement.maxGirdle ?? 0);
          Items.measurement.minGirdle = z.minGirdle ?? (oldInvData?.measurement.minGirdle ?? 0);
          Items.measurement.ratio = this.utilityService.ConvertToFloatWithDecimalTwoDigitRoundWithNum(z.ratio ?? (oldInvData?.measurement.ratio ?? 0));
          Items.inclusion.girdleCondition = z.girdleCondition ?? (oldInvData?.inclusion.girdleCondition ?? 0);
          Items.inclusion.culet = z.culet ?? (oldInvData?.inclusion.culet ?? 0);
          Items.inclusion.ktoS = z.ktoS;
          Items.inclusion.flColor = z.flColor;
          Items.inclusion.brown = z.brown ?? (oldInvData?.inclusion.brown ?? null);
          Items.basePrice.discount = z.discount;
          Items.basePrice.netAmount = z.netAmount;
          Items.basePrice.perCarat = z.perCarat;
          Items.basePrice.rap = z.rap;
          Items.certificateNo = z.certificateNo;
          Items.strLn = z.strLn ?? (oldInvData?.strLn ?? 0);
          Items.lrHalf = z.lrHalf ?? (oldInvData?.lrHalf ?? 0);
          Items.stoneOrg.orgId = this.fxCredentials.organizationId;
          Items.stoneOrg.orgName = this.fxCredentials.organization;
          Items.stoneOrg.deptId = this.fxCredentials.departmentId;
          Items.stoneOrg.deptName = this.fxCredentials.department;
          Items.stoneOrg.branchName = this.fxCredentials.branch;
          Items.stoneOrg.country = this.organizationAddress.country;
          Items.stoneOrg.city = this.organizationAddress.city;
          Items.stoneOrg.orgCode = this.fxCredentials.orgCode;
          Items.identity.id = this.fxCredentials?.id ?? '';
          Items.identity.name = this.fxCredentials?.fullName ?? '';
          Items.identity.type = 'Employee' ?? '';
          Items.status = z.status;
          Items.typeA = z.typeA;
          Items.lab = this.SelectedLab?.toUpperCase();
          // Items.certiType = (Items.lab != "NC") ? ((Items.lab == 'GIA' && Items.weight < 1) ? 'D' : 'P') : null as any;
          Items.certiType = (Items.lab != "NC") ? 'P' : null as any;
          Items.inscription = z.Inscription;
          Items.bgmComments = this.getBrownMilkyComment(Items.inclusion.brown, Items.inclusion.milky);

          //send price request if Action=print and isRepairing=false. 
          if ((z.labServiceAction.toLowerCase() == 'print' || z.labServiceAction.toLowerCase() == 'inscribe and print') && z.isRepairingStones == false) {
            stoneIdwithPrintAction.push(z.stoneId);
            Items.isPricingRequest = true;
          }

          if (z.isRepairingStones == true)
            stoneIdwithRepairing.push(z.stoneId)

          selectedInventoryItems.push(Items);
        });

        //Check if any stone already exist in repairing
        if (stoneIdwithRepairing.length > 0) {
          let existStoneIds = await this._repairService.isExistStonesRepair(stoneIdwithRepairing);
          if (existStoneIds.length > 0) {
            this.alertDialogService.show(existStoneIds.join(',') + ' stoneId(s) already exists in repairing!');
            return;
          }
        }
        messageType = "updated";

        //Update IGrade, MGrade
        await this.UpdateInvGrade(this.labResultItems, selectedInventoryItems);
        //if Grade Not Found.        
        if (this.gradeErrorStoneData.length > 0) {
          this.spinnerService.hide();
          return;
        }

        response = await this.gradingService.InsertGrading(selectedInventoryItems, "LabResult");
        if (response) {

          let labRecheck = validActionData.filter(z => z.labServiceAction.toLowerCase() == 'recheck');
          await this.saveRecheckPacket(labRecheck);
          this.mySelection = [];
          this.resetForm(form);

          response = await this.labService.updateInventoryItemsData(selectedInventoryItems)
          if (response) {
            var list = this.labResultItems.filter(a => selectedInventoryItems.map(z => z.stoneId).includes(a.clientRef));
            if (list && list.length > 0) {
              list.forEach(element => {
                if (element.color == '*')
                  element.color = this.ShowColorDescription(element.colorDescriptions);
              });
            }

            response = await this.labService.InsertLabResult(list);
            if (response) {
              let invitems = selectedInventoryItems.filter(
                a => stoneIdwithPrintAction.map(z => z).includes(a.stoneId)
              );

              //invitems Only PRINT Action stone and isRepairing=false. Send for price request.
              await this.savePricingRequestDiamanto(invitems);

              this.addDbLog('labreconsiliation-savePricingRequestDiamanto', invitems.map(x => x.stoneId).join(', '), '', '');

              //update isRepairingStones in Labissue
              let repairinvitems = selectedInventoryItems.filter(a => stoneIdwithRepairing.map(z => z).includes(a.stoneId));
              if (repairinvitems.length > 0)
                await this.labService.UpdateRepairingInLabIssue(repairinvitems);

              //Add repair stone entry in Repairing               
              if (stoneIdwithRepairing.length > 0) {
                let result: InventoryItems[] = await this.inventoryService.getInventoryByStoneIdsWithLowercase(stoneIdwithRepairing);
                if (result.length > 0) {
                  for (let index = 0; index < result.length; index++) {
                    let dInventoryObj = new RInvItem();
                    const element = result[index];
                    dInventoryObj = this.mappingInventoryToRInvItem(element);
                    let repairingObj = new Repairing();
                    repairingObj.defectedStone = dInventoryObj;
                    repairingObj.repairedStone = new RInvItem();
                    repairingObj.isIssue = "Issue";
                    repairingObj.createdBy = this.fxCredentials.fullName;
                    this.repairingAllList.push(repairingObj);
                  }
                  if (this.repairingAllList && this.repairingAllList.length > 0) {
                    let response = await this._repairService.InsertList(this.repairingAllList);
                    if (response) {
                      let res = await this.commuteService.updateInventoryForRepairing(this.repairingAllList.map(z => z.defectedStone.stoneId));
                      if (res) {
                        this.utilityService.showNotification(response);
                        this.spinnerService.hide();
                      }
                      else {
                        this.alertDialogService.show(`Stone not updated in Frontoffice, Please contact administrator!`);
                        this.spinnerService.hide();
                      }
                    }
                  }
                }
              }

              //Export to excel if Lab GIA
              if (this.SelectedLab == 'GIA')
                this.exportLabFile(this.labResultItems.filter(a => selectedInventoryItems.map(z => z.stoneId).includes(a.clientRef)), validActionData);

              this.labResultExcelItems = this.labResultExcelItems.filter(z => !validActionData.map(a => a.stoneId).includes(z.stoneId))
              this.loadItems(this.labResultExcelItems);

              this.utilityService.showNotification(`You have been ${messageType} successfully!`);
              //this.SendNotificationForPriceRequest(response);
              this.showStoneErrorMsg();
            }
            else
              this.spinnerService.hide();
          }
          else
            this.spinnerService.hide();
        }
        else {
          this.alertDialogService.show(response.message);
          this.spinnerService.hide();

          if (response?.errorMessage?.length > 0)
            console.error(response.errorMessage);
        }
      }
      else
        this.alertDialogService.show('Please select at least one stone.')

      this.selectedLabResultExcelItems = [];
      this.spinnerService.hide();
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Lab Result not save, Try gain later!');
      this.selectedLabResultExcelItems = [];
    }
  }

  private getBrownMilkyComment(brown: string, milky: string): string {
    var comment = "";

    if (this.brownList.length > 0 && this.milkyList.length > 0) {
      if (this.brownList.length > 0 && brown != null && brown.length > 0)
        brown = this.getDisplayNameForComment(brown, this.brownList);

      if (this.milkyList.length > 0 && milky != null && milky.length > 0)
        milky = this.getDisplayNameForComment(milky, this.milkyList);

      comment = brown + " " + milky;
    }

    return comment;
  }

  public mappingInventoryToRInvItem(inv: InventoryItems): RInvItem {
    let invObj: RInvItem = new RInvItem();
    invObj.stoneId = inv.stoneId;
    invObj.weight = inv.weight;
    invObj.clarity = inv.clarity;
    invObj.cut = inv.cut;
    invObj.polish = inv.polish;
    invObj.symmetry = inv.symmetry;
    invObj.fluorescence = inv.fluorescence;
    invObj.shape = inv.shape;
    invObj.color = inv.color;
    invObj.inclusion = inv.inclusion;
    invObj.measurement = inv.measurement;
    return invObj;
  }

  public async savePricingRequestDiamanto(inv: InventoryItems[]) {
    try {
      var res = await this.commuteService.insertPricingRequest(inv, "Lab Result Upload", this.fxCredentials.fullName);
      if (!res) {
        inv.forEach(z => { this.errorStoneData.push({ stonId: z.stoneId, msg: "Pricing request not inserted, Please contact administrator!", code: 15 }) });
      }
    } catch (error: any) {
      this.alertDialogService.show('Pricing request not inserted, Please try again later!', 'error');
      console.error(error);
    }
  }

  public async SendNotificationForPriceRequest(stoneIds: string[]) {
    let empIds = await this.employeeCriteriaService.getEmpIdsForNotificationFromStoneIds(stoneIds);
    if (empIds && empIds.length > 0) {
      empIds.forEach(async z => {
        let message: Notifications = PriceRequestTemplate(this.fxCredentials, z);
        let notificationResponse = await this.notificationService.insertNotification(message);
        if (notificationResponse) {
          message.id = notificationResponse;
          this.notificationService.messages.next(message);
        }
      });
      this.spinnerService.hide();
    }
    else
      this.spinnerService.hide();
  }

  public async UpdateInvGrade(lab: LabResult[], inv: InventoryItems[]) {
    try {
      var selectedLab = lab.filter(a => inv.map(z => z.stoneId).includes(a.clientRef));

      let req: GradeSearchItems[] = [];
      selectedLab.forEach(z => {
        let obj: GradeSearchItems = new GradeSearchItems();
        let invItem: InventoryItems = JSON.parse(JSON.stringify(inv.find(a => a.stoneId == z.clientRef)));
        if (invItem != null) {
          obj.id = invItem.stoneId?.toUpperCase();
          obj.lab = "GIA"
          obj.shape = z.shape?.toUpperCase();
          obj.size = Number(z.weight);
          obj.color = z.color?.toUpperCase();
          obj.clarity = z.clarity?.toUpperCase();
          obj.cut = invItem.cut?.toUpperCase();
          obj.polish = z.polish?.toUpperCase();
          obj.sym = z.symmetry?.toUpperCase();
          obj.fluo = invItem.fluorescence?.toUpperCase();

          let inclusionData: InclusionPrice = new InclusionPrice();
          inclusionData.brown = invItem.inclusion.brown?.toUpperCase();
          inclusionData.green = invItem.inclusion.green?.toUpperCase();
          inclusionData.milky = invItem.inclusion.milky?.toUpperCase();
          inclusionData.shade = invItem.inclusion.shade?.toUpperCase();
          inclusionData.sideBlack = invItem.inclusion.sideBlack?.toUpperCase();
          inclusionData.centerBlack = invItem.inclusion.centerBlack?.toUpperCase();
          inclusionData.sideWhite = invItem.inclusion.sideWhite?.toUpperCase();
          inclusionData.centerWhite = invItem.inclusion.centerWhite?.toUpperCase();
          inclusionData.openTable = invItem.inclusion.openTable?.toUpperCase();
          inclusionData.openCrown = invItem.inclusion.openCrown?.toUpperCase();
          inclusionData.openPavilion = invItem.inclusion.openPavilion?.toUpperCase();
          inclusionData.openGirdle = invItem.inclusion.openGirdle?.toUpperCase();
          if (invItem.inclusion.girdleCondition && invItem.inclusion.girdleCondition.length > 0)
            inclusionData.girdleCond.push(invItem.inclusion.girdleCondition?.toUpperCase());
          inclusionData.eFOC = invItem.inclusion.efoc?.toUpperCase();
          inclusionData.eFOP = invItem.inclusion.efop?.toUpperCase();
          inclusionData.culet = z.culetSize?.toUpperCase();
          inclusionData.hNA = z.hna?.toUpperCase();
          inclusionData.eyeClean = invItem.inclusion.eyeClean?.toUpperCase();

          let ktos = invItem.inclusion.ktoS?.split(',');
          if (ktos && ktos.length > 0) {
            inclusionData.kToS = [];
            for (let index = 0; index < ktos.length; index++) {
              const element = ktos[index];
              inclusionData.kToS.push(element.trim());
              obj.ktoS.push(element.trim());
            }
          }

          inclusionData.naturalOnGirdle = invItem.inclusion.naturalOnGirdle?.toUpperCase();
          inclusionData.naturalOnCrown = invItem.inclusion.naturalOnCrown?.toUpperCase();
          inclusionData.naturalOnPavillion = invItem.inclusion.naturalOnPavillion?.toUpperCase();
          inclusionData.flColor = invItem.inclusion.flColor?.toUpperCase();
          inclusionData.luster = invItem.inclusion.luster?.toUpperCase();
          inclusionData.bowTie = invItem.inclusion.bowtie?.toUpperCase();
          inclusionData.certiComment = invItem.inclusion.certiComment?.toUpperCase();

          obj.inclusion = inclusionData;
          obj.measurement = this.mappingMeasListForGrading(invItem.measurement);

          let girdleData: GirdleDNorm = new GirdleDNorm();
          girdleData.min = z.minGirdle?.toUpperCase();
          girdleData.max = z.maxGirdle?.toUpperCase();

          obj.girdle = girdleData;
          obj.certComment = [];

          obj.girdlePer = invItem.measurement.girdlePer;

          req.push(obj);
        }
      });

      let res = await this.measureGradeService.getPrice(req);
      if (res) {
        //Update in local array for pricing request. then after Local Array Update in Collection
        this.gradeErrorStoneData = [];
        inv.forEach(z => {
          let grading = res.find(a => a.id == z.stoneId);
          if (grading != null) {
            z.measurement.mGrade = grading.mGrade;
            z.inclusion.iGrade = grading.iGrade;

            //if (grading.mGrade == null || grading.mGrade == undefined || grading.mGrade == "")
            //this.gradeErrorStoneData.push({ stonId: z.stoneId, msg: "mGrade Not Found. Lab Result Not Saved", code: 1 });
            //if (grading.iGrade == null || grading.iGrade == undefined || grading.iGrade == "")
            //this.gradeErrorStoneData.push({ stonId: z.stoneId, msg: "iGrade Not Found. Lab Result Not Saved", code: 2 });

          }
        });
        this.utilityService.showNotification(`${res.length} stone(s) grade updated!`);
      }
      else {
        this.alertDialogService.show(`Grading not update!`, 'error');
        console.error(res);
      }
      this.showGradeStoneErrorMsg();
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(`Something went wrong when get grade.`, 'error');
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
  //#endregion

  //#region Functions
  public actionTypeChange() {
    this.isRepairingStones = false;
    this.recheckCharge = "";
    this.listReason = [];
    this.selectedReasonItems = [];
    this.labReCheckRequestObj.recheckReason = [];
    let labServiceItems = this.labServiceItems.filter(z => z.action == this.actionType && z.labName == this.labObj.name);
    labServiceItems.forEach(z => {
      this.listReason.push({ name: z.service, code: z.serviceCode, isChecked: false });
    });

    if (this.actionType.toLowerCase() == 'print' || this.actionType.toLowerCase() == 'inscribe and print')
      this.isRepairVisible = true;
    else
      this.isRepairVisible = false;
  }

  public async UpdateControllerNo() {
    let response: any;
    if (this.selectedLabResultExcelItems.length > 0) {
      let Ids: string[] = this.selectedLabResultExcelItems.map((x: any) => x.stoneId);
      response = await this.labService.UpdateControllerNoFromStoneIds(Ids)
    }
    if (response)
      this.utilityService.showNotification(`You have been updated successfully!`)

  }

  public tagMapper(tags: string[]): void {
    // This function is used for hide selected items in multiselect box
  }

  public onReasonMultiSelectChange(val: Array<{ name: string; code: string; isChecked: boolean }>, selectedData: string[]): void {
    val.forEach(element => {
      element.isChecked = false;
    });

    if (selectedData && selectedData.length > 0) {
      this.selectedReasonItems = selectedData;
      this.serviceCode = [];
      val.forEach(element => {
        selectedData.forEach(item => {
          if (element.name.toLocaleLowerCase() == item.toLocaleLowerCase()) {
            element.isChecked = true;
            this.serviceCode.push(element.code)
          }
        });
      });
    }
    else
      this.selectedReasonItems = [];
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

  public fetchError(id: string) {
    return this.errorMessagesByStoneId.find(x => x.stoneId == id)
  }

  public assignOptionalWordToName(data: LabResultExcelItems): LabResultExcelItems {

    const shape = data.shape;
    if (shape) {
      var obj = this.allTheShapes.find(c => c.name.toLowerCase() == shape.toLowerCase() || c.displayName.toLowerCase() == shape.toLowerCase() || c.optionalWords && c.optionalWords.map(u => u.toLowerCase().trim()).includes(shape.toLowerCase()));
      if (obj)
        data.shape = obj.name;
    }

    const color = data.color;
    if (color) {
      var obj = this.allColors.find(c => c.name.toLowerCase() == color.toLowerCase() || c.displayName.toLowerCase() == color.toLowerCase() || c.optionalWords && c.optionalWords.map(u => u.toLowerCase().trim()).includes(color.toLowerCase()));
      if (obj)
        data.color = obj.name;
    }

    const clarity = data.clarity;
    if (clarity) {
      var obj = this.allClarities.find(c => c.name.toLowerCase() == clarity.toLowerCase() || c.displayName.toLowerCase() == clarity.toLowerCase() || c.optionalWords && c.optionalWords.map(u => u.toLowerCase().trim()).includes(clarity.toLowerCase()));
      if (obj)
        data.clarity = obj.name;
    }

    const fluorescence = data.fluorescence;
    if (fluorescence) {
      var obj = this.allTheFluorescences.find(c => c.name.toLowerCase() == fluorescence.toLowerCase() || c.displayName.toLowerCase() == fluorescence.toLowerCase() || c.optionalWords && c.optionalWords.map(u => u.toLowerCase().trim()).includes(fluorescence.toLowerCase()));
      if (obj)
        data.fluorescence = obj.name;
    }

    const cut = data.cut;
    if (cut) {
      var obj = this.allTheCPS.find(c => c.name.toLowerCase() == cut.toLowerCase() || c.displayName.toLowerCase() == cut.toLowerCase() || c.optionalWords && c.optionalWords.map(u => u.toLowerCase().trim()).includes(cut.toLowerCase()));
      if (obj)
        data.cut = obj.name;
    }

    const polish = data.polish;
    if (polish) {
      var obj = this.allTheCPS.find(c => c.name.toLowerCase() == polish.toLowerCase() || c.displayName.toLowerCase() == polish.toLowerCase() || c.optionalWords && c.optionalWords.map(u => u.toLowerCase().trim()).includes(polish.toLowerCase()));
      if (obj)
        data.polish = obj.name;
    }

    const symmetry = data.symmetry;
    if (symmetry) {
      var obj = this.allTheCPS.find(c => c.name.toLowerCase() == symmetry.toLowerCase() || c.displayName.toLowerCase() == symmetry.toLowerCase() || c.optionalWords && c.optionalWords.map(u => u.toLowerCase().trim()).includes(symmetry.toLowerCase()));
      if (obj)
        data.symmetry = obj.name;
    }

    return data;
  }

  public getCompareLabResultWithGrading(stoneId: String, type: string, typeTwo: string): string {

    let className = '';
    try {
      let InvData = '';
      let labData = '';
      let prevIndex = null;
      let curIndex = null;
      let invParaName = '';
      prevIndex = 1;
      curIndex = 1;
      let InvUploadWeight: number = 0;
      let listData: MasterDNorm[] = [];

      if (type == 'SHAPE') {
        InvData = this.gradingMasterItem.find(z => z.stoneId == stoneId && z.rapVer == 'InvUpload')?.shape ?? '';
        labData = this.labResultExcelItems.find(z => z.stoneId == stoneId)?.shape ?? '';
        listData = this.allTheShapes;
        prevIndex = listData.find(t => t.displayName == labData)?.priority ?? 0;
        curIndex = listData.find(t => t.displayName == InvData)?.priority ?? 0;
        invParaName = InvData;
      }
      else if (type == 'WEIGHT') {
        InvUploadWeight = this.gradingMasterItem.find(z => z.stoneId == stoneId && z.rapVer == 'InvUpload')?.weight ?? 0;

        if ((InvUploadWeight) > (this.labResultExcelItems.find(z => z.stoneId == stoneId)?.weight ?? 0)) {
          prevIndex = 2;
          curIndex = 1;
        }
        if ((InvUploadWeight) < (this.labResultExcelItems.find(z => z.stoneId == stoneId)?.weight ?? 0)) {
          prevIndex = 1;
          curIndex = 2;
        }
        invParaName = InvUploadWeight.toString();
      }
      else if (type == 'COLOR') {
        InvData = this.gradingMasterItem.find(z => z.stoneId == stoneId && z.rapVer == 'InvUpload')?.color ?? '';
        labData = this.labResultExcelItems.find(z => z.stoneId == stoneId)?.color ?? '';
        listData = this.allColors;
        prevIndex = listData.find(t => t.displayName == labData)?.priority ?? 0;
        curIndex = listData.find(t => t.displayName == InvData)?.priority ?? 0;
        invParaName = InvData;
      }
      else if (type == 'CLARITY') {
        InvData = this.gradingMasterItem.find(z => z.stoneId == stoneId && z.rapVer == 'InvUpload')?.clarity ?? '';
        labData = this.labResultExcelItems.find(z => z.stoneId == stoneId)?.clarity ?? '';
        listData = this.allClarities;
        prevIndex = listData.find(t => t.displayName == labData)?.priority ?? 0;
        curIndex = listData.find(t => t.displayName == InvData)?.priority ?? 0;
        invParaName = InvData;
      }
      else if (type == 'CUT') {
        InvData = this.gradingMasterItem.find(z => z.stoneId == stoneId && z.rapVer == 'InvUpload')?.cut ?? '';
        labData = this.labResultExcelItems.find(z => z.stoneId == stoneId)?.cut ?? '';
        listData = this.allTheCPS;
        prevIndex = listData.find(t => t.displayName == labData)?.priority ?? 0;
        curIndex = listData.find(t => t.displayName == InvData)?.priority ?? 0;
        invParaName = InvData;
      }
      else if (type == 'POLISH') {
        InvData = this.gradingMasterItem.find(z => z.stoneId == stoneId && z.rapVer == 'InvUpload')?.polish ?? '';
        labData = this.labResultExcelItems.find(z => z.stoneId == stoneId)?.polish ?? '';
        listData = this.allTheCPS;
        prevIndex = listData.find(t => t.displayName == labData)?.priority ?? 0;
        curIndex = listData.find(t => t.displayName == InvData)?.priority ?? 0;
        invParaName = InvData;
      }
      else if (type == 'SYMMETRY') {
        InvData = this.gradingMasterItem.find(z => z.stoneId == stoneId && z.rapVer == 'InvUpload')?.symmetry ?? '';
        labData = this.labResultExcelItems.find(z => z.stoneId == stoneId)?.symmetry ?? '';
        listData = this.allTheCPS;
        prevIndex = listData.find(t => t.displayName == labData)?.priority ?? 0;
        curIndex = listData.find(t => t.displayName == InvData)?.priority ?? 0;
        invParaName = InvData;
      }
      else if (type == 'FLUORESCENCE') {
        InvData = this.gradingMasterItem.find(z => z.stoneId == stoneId && z.rapVer == 'InvUpload')?.fluorescence ?? '';
        labData = this.labResultExcelItems.find(z => z.stoneId == stoneId)?.fluorescence ?? '';
        listData = this.allTheFluorescences;
        prevIndex = listData.find(t => t.displayName == labData)?.priority ?? 0;
        curIndex = listData.find(t => t.displayName == InvData)?.priority ?? 0;
        invParaName = InvData;
      }

      if (prevIndex < curIndex)
        className = 'icon-back ms-1 d-inline-block rotate-90 i-green';
      else if (prevIndex > curIndex)
        className = 'icon-back ms-1 d-inline-block a-rotate-90 i-red';
      else
        className = '';

      if (typeTwo == 'ToolTip')
        className = invParaName;

      return className;
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error)
      return className;
    }
  }

  public validateValues(data: LabResultExcelItems[], ids: string[], message: string, isResultAvailable: boolean = false) {
    ids.forEach(element => {
      let messageArray = [];
      messageArray.push(message)
      let findErrorIndex = this.errorMessagesByStoneId.findIndex(x => x.stoneId == element);
      if (findErrorIndex >= 0) {
        let messageIndex = this.errorMessagesByStoneId[findErrorIndex].messageList.findIndex(x => x == message);
        if (messageIndex < 0)
          this.errorMessagesByStoneId[findErrorIndex].messageList.push(message)
      }
      else
        this.errorMessagesByStoneId.push({ stoneId: element, messageList: messageArray });
      let index = data.findIndex((x: any) => x.stoneId == element);
      if (index >= 0) {
        data[index].isDisabled = !isResultAvailable;
        data[index].isResultAvailable = isResultAvailable;
      }
    });
  }

  public isDisabled(args: RowClassArgs) {
    return {
      'k-state-disabled': args.dataItem.isDisabled === true
    };
  }
  //#endregion

  //#region Dialog
  public openDialog(): void {
    try {
      this.isRecheckIssue = true;
      this.gridViewIssue = { data: [], total: 0 };
      if (this.selectedLabResultExcelItems.length > 0) {
        this.gridViewIssue = process(this.selectedLabResultExcelItems, { group: this.groups });
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public closeDialog(): void {
    this.isRecheckIssue = false;
    this.gridViewIssue = { data: [], total: 0 };
    this.mySelection = [];
    this.selectedLabResultExcelItems = [];
    this.labReCheckRequestObj = new LabRecheckRequest();
    this.recheckCharge = "";
    this.listReason.forEach(z => { z.isChecked = false });
  }
  //#endregion

  //#region GridConfig
  public async getGridConfiguration() {
    try {
      this.spinnerService.show();
      this.gridConfig = await this.configService.getGridConfig(this.fxCredentials.id, "LabReconsiliation", "LabReconsiliationGrid", this.gridPropertiesService.getLabResultGrid());
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
        this.gridMasterConfigResponse = await this.configService.getMasterGridConfig("LabReconsiliation", "LabReconsiliationGrid");
        if (this.gridMasterConfigResponse)
          this.fields = this.gridMasterConfigResponse.gridDetail;
        else
          this.fields = await this.gridPropertiesService.getLabResultGrid();
      }
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

  public setSelectableSettings() {
    this.selectableSettings = {
      mode: "multiple",
      checkboxOnly: true
    };
  }

  public openGridConfigDialog(): void {
    this.isGridConfig = true;
  }

  public clearGrid(): void {
    this.labResultExcelItems = [];
    this.selectedLabResultExcelItems = [];
    this.mySelection = [];
    this.loadItems(this.labResultExcelItems);
  }

  public onSelect(event: any): void {
    this.selectedLabResultExcelItems = [];
    if (this.mySelection.length > 0) {
      let selectedData = this.labResultExcelItems.filter(z => this.mySelection.includes(z.stoneId));
      this.selectedLabResultExcelItems = JSON.parse(JSON.stringify(selectedData));
    }
  }

  public async selectAllStocks(event: string) {
    this.mySelection = [];
    this.selectedLabResultExcelItems = []
    if (event.toLowerCase() == 'checked') {
      this.mySelection = this.labResultExcelItems.map(z => z.stoneId);
      this.selectedLabResultExcelItems = this.labResultExcelItems;
    }
  }

  public sortChange(sort: SortDescriptor[]): void {
    this.sort = sort;
    if (this.labResultExcelItems && this.labResultExcelItems.length > 0)
      this.sortInventory()
  }

  private sortInventory(): void {
    this.gridView = {
      data: orderBy(this.gridView.data, this.sort),
      total: this.labResultExcelItems.length
    };
  }

  public groupChange(groups: GroupDescriptor[]): void {
    this.groups = groups;
    if (this.labResultExcelItems && this.labResultExcelItems.length > 0)
      this.groupInventoryExcel();
  }

  private groupInventoryExcel(): void {
    if (this.groups.length > 0)
      this.gridView = process(this.labResultExcelItems, { group: this.groups });
    else
      this.loadItems(this.labResultExcelItems);
  }

  public openMediaDialog(title: string, type: string, inv: LabResultExcelItems): void {
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

  public closeMediaDialog(e: boolean): void {
    this.isShowMedia = e;
  }

  public async GetRecheckCharge() {
    try {
      if (this.selectedLabResultExcelItems.length > 0) {
        this.spinnerService.show();
        let response: any;
        this.labServiceCharge.stoneIds = this.selectedLabResultExcelItems.map((x: any) => x.stoneId);
        this.labServiceCharge.reasonItems = this.selectedReasonItems;
        response = await this.labService.GetRecheckCharge(this.labServiceCharge);
        if (response) {
          this.recheckCharge = response.message;
          this.spinnerService.hide();
        }
        else {
          this.alertDialogService.show(response.message);
          if (response?.errorMessage?.length > 0)
            console.error(response.errorMessage);
        }
      }
      else
        this.recheckCharge = "0";
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }
  //#endregion  

  public LabChange() {
    try {
      let Selectedindex = this.labItems.findIndex(x => x.name == this.selectedLabItems?.value);
      if (Selectedindex >= 0) {
        this.labObj = this.labItems[Selectedindex]
        this.SelectedLab = this.labObj.code;
        this.listReason = [];
        this.listReason.forEach(z => { z.isChecked = false });
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  //#region Export Data
  public async exportLabFile(labResult: LabResult[], labExcel: LabResultExcelItems[]) {
    try {
      this.spinnerService.show();
      this.generateLabExcelData(labResult, labExcel);
      if (this.excelFile.length > 0)
        this.utilityService.exportAsExcelFile(this.excelFile, "Search_Stones_Excel_");
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  private async generateLabExcelData(data: LabResult[], labExcel: LabResultExcelItems[]) {
    this.excelFile = [];
    let i = 0;
    data.forEach(z => {
      let lebresultExcel = labExcel.find(a => a.stoneId == z.clientRef);
      var excel = {
        'Job No': z.jobNo,
        'Control No': z.controlNo,
        'Report Action': lebresultExcel?.labServiceAction,
        'Service': lebresultExcel?.labServiceCode.join(', '),
        'Service Comment': '',
        'Inscription Text': '',
        'Report No': z.reportNo,
        '': lebresultExcel?.labServiceReason.join(' & ')
      }
      this.excelFile.push(excel);
      i++;
    });
  }
  //#endregion

  private showStoneErrorMsg() {
    if (this.errorStoneData.length > 0) {
      let msg = '';
      for (let index = 1; index <= 15; index++) {
        const code = index;
        let errorMsgs = this.errorStoneData.filter(z => z.code == code);
        if (errorMsgs.length > 0) {
          let errorMsgStoneIds = errorMsgs.map(z => z.stonId);
          msg += errorMsgStoneIds.join(',') + ' <b>' + errorMsgs[0].msg + '</b><br /><br />';
        }
      }
      this.alertDialogService.show(msg);
      this.errorStoneData = [];
    }
  }

  private showGradeStoneErrorMsg() {
    if (this.gradeErrorStoneData.length > 0) {
      let msg = '';
      for (let index = 1; index <= 2; index++) {
        const code = index;
        let errorMsgs = this.gradeErrorStoneData.filter(z => z.code == code);
        if (errorMsgs.length > 0) {
          let errorMsgStoneIds = errorMsgs.map(z => z.stonId);
          msg += errorMsgStoneIds.join(',') + ' <b>' + errorMsgs[0].msg + '</b><br /><br />';
        }
      }
      this.alertDialogService.show(msg);
    }
  }

  public openFilterDialog(): void {
    this.isFilter = true;
  }

  public closeFilterDailog(): void {
    this.isFilter = false;
  }

  public SearchFilter(): void {
    if (this.labResultExcelItems.length > 0 && this.selectedFromWeight && this.selectedFromWeight > 0 && this.selectedToWeight && this.selectedToWeight > 0) {
      let labResultExcelItems = JSON.parse(JSON.stringify(this.labResultExcelItems));
      this.loadItems(labResultExcelItems);
    }
  }

  public ClearFilter(): void {
    this.selectedFromWeight = 0;
    this.selectedToWeight = 0;
    if (this.labResultExcelItems.length > 0) {
      let labResultExcelItems = JSON.parse(JSON.stringify(this.labResultExcelItems));
      this.loadItems(labResultExcelItems);
    }
  }

  private addDbLog(action: string, request: string, response: string, error: string) {
    try {
      let log: DbLog = new DbLog();
      log.action = action;
      log.category = "BackOffice";
      log.controller = "labreconsiliation";
      log.userName = this.fxCredentials?.fullName;
      log.ident = this.fxCredentials?.id;
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

  public ShowColorDescription(disc: string) {
    var colr_desc = disc?.split(',') || [];
    var clr = colr_desc[1].trim();
    return clr;
  }

  /*Notes
1) Compare Excel data with (Grading Table Entry RapVersion’Grading’ Last Record)
       If (Grading Table Entry RapVersion ’Grading’) entry not found 
     Then compare with (Grading Table Entry RapVersion’InvUpload’)
2) Lab Reconciliation Detail Grid--> All  Grading Table Entry
*/

}
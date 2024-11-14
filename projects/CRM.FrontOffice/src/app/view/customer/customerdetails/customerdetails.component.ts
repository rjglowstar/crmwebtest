import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NgForm } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { GridDetailConfig } from 'shared/businessobjects';
import { AzureFileStore, ExportColumn, ExportConfig, ExportInfo, fxCredential, InclusionConfig, MasterConfig, MasterDNorm } from 'shared/enitites';
import { FileStoreService, FileStoreTypes, listBasicExportColumns, listExportFormat, listIncusionExportColumns, listMeasurementExportColumns, listOthersExportColumns, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { NgxSpinnerService } from 'ngx-spinner';
import { Customer, CustomerCriteria, CustomerDNorm, CustomerPreference, InventoryItems, SupplierDNorm } from '../../../entities';
import { CustomerCriteriaService, CustomerPreferenceService, CustomerService, GridPropertiesService, InventoryService, MasterConfigService, SupplierService, WatchListService } from '../../../services';
import { ParseSearchQuery } from '../../../businessobjects';
import * as moment from 'moment';
import { environment } from 'environments/environment.prod';
import { TypeFilterPipe } from 'shared/directives/typefilter.pipe';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import * as xlsx from 'xlsx';
import { custAddDisc } from '../../../entities/customer/customerAddDisc';
@Component({
  selector: 'app-customerdetails',
  templateUrl: './customerdetails.component.html',
  styleUrls: ['./customerdetails.component.css'],
  encapsulation: ViewEncapsulation.None
})

export class CustomerdetailsComponent implements OnInit {
  public customerObj: Customer = new Customer();
  public isAddCustomerCriteria: boolean = false;
  public isShowDocument: boolean = false;
  public isFileSelect: boolean = false;
  public imgSrcDisplay!: string
  public masterConfigList!: MasterConfig;
  public errWeight: string = '';
  public errDiscount: string = '';
  public errDepth: string = '';
  public errLength: string = '';
  public errWidth: string = '';
  public errHeight: string = '';
  public errTable: string = '';
  public errCrownAngle: string = '';
  public errPavillionAngle: string = '';
  public errPrice: string = '';
  public ftpUpfileName: string = '';
  public customerCriteriaData: CustomerCriteria[] = [];
  public selectedCustomerCriteria: CustomerCriteria[] = [];
  public customerCriteriaObj: CustomerCriteria = new CustomerCriteria();
  public insertFlag: boolean = true;
  public fxCredentials!: fxCredential | null;
  public lastDivNumber = [3, 7, 11, 15, 19];
  //#region DropDown Data
  public SupplierList: string[] = [];
  public ShapesList: MasterDNorm[] = [];
  public LabList: MasterDNorm[] = [];
  public ColorList: MasterDNorm[] = [];
  public ClarityList: MasterDNorm[] = [];
  public FluorList: MasterDNorm[] = [];
  public CPSList: MasterDNorm[] = [];
  public CPSDataList: MasterDNorm[] = [];
  public CutDataList: MasterDNorm[] = [];
  public inclusionData: MasterDNorm[] = [];
  public inclusionConfig: InclusionConfig = new InclusionConfig();
  public BrownList: MasterDNorm[] = [];
  public GreenList: MasterDNorm[] = [];
  public MilkyList: MasterDNorm[] = [];
  public ShadeList: MasterDNorm[] = [];
  public SideBlackList: MasterDNorm[] = [];
  public CenterBlackList: MasterDNorm[] = [];
  public SideWhiteList: MasterDNorm[] = [];
  public CenterWhiteList: MasterDNorm[] = [];
  public OpenCrownList: MasterDNorm[] = [];
  public OpenTableList: MasterDNorm[] = [];
  public OpenPavilionList: MasterDNorm[] = [];
  public OpenGirdleList: MasterDNorm[] = [];
  public GirdleConditionList: MasterDNorm[] = [];
  public EFOCList: MasterDNorm[] = [];
  public EFOTList: MasterDNorm[] = [];
  public EFOGList: MasterDNorm[] = [];
  public EFOPList: MasterDNorm[] = [];
  public CuletList: MasterDNorm[] = [];
  public HNAList: MasterDNorm[] = [];
  public EyeCleanList: MasterDNorm[] = [];
  public KtoSList: MasterDNorm[] = [];
  public NaturalOnTableList: MasterDNorm[] = [];
  public NaturalOnGirdleList: MasterDNorm[] = [];
  public NaturalOnCrownList: MasterDNorm[] = [];
  public NaturalOnPavillionList: MasterDNorm[] = [];
  public FLColorList: MasterDNorm[] = [];
  public GrainingList: MasterDNorm[] = [];
  public RedSpotList: MasterDNorm[] = [];
  public LusterList: MasterDNorm[] = [];
  public BowtieList: MasterDNorm[] = [];
  public allTheLab: Array<{ name: string; isChecked: boolean }> = [];
  public allTheShapes: Array<{ name: string; isChecked: boolean }> = [];
  public allColors: Array<{ name: string; isChecked: boolean }> = [];
  public allClarities: Array<{ name: string; isChecked: boolean }> = [];
  public allTheFluorescences: Array<{ name: string; isChecked: boolean }> = [];
  public allTheCut: Array<{ name: string; isChecked: boolean }> = [];
  public allThePolish: Array<{ name: string; isChecked: boolean }> = [];
  public allTheSymm: Array<{ name: string; isChecked: boolean }> = [];
  public allCPSData: Array<{ name: string; isChecked: boolean }> = [];
  public allBrown: Array<{ name: string; isChecked: boolean }> = [];
  public allGreen: Array<{ name: string; isChecked: boolean }> = [];
  public allMilky: Array<{ name: string; isChecked: boolean }> = [];
  public allShade: Array<{ name: string; isChecked: boolean }> = [];
  public allSideBlack: Array<{ name: string; isChecked: boolean }> = [];
  public allCenterBlack: Array<{ name: string; isChecked: boolean }> = [];
  public allSideWhite: Array<{ name: string; isChecked: boolean }> = [];
  public allCenterWhite: Array<{ name: string; isChecked: boolean }> = [];
  public allOpenCrown: Array<{ name: string; isChecked: boolean }> = [];
  public allOpenTable: Array<{ name: string; isChecked: boolean }> = [];
  public allOpenPavilion: Array<{ name: string; isChecked: boolean }> = [];
  public allOpenGirdle: Array<{ name: string; isChecked: boolean }> = [];
  public allGirdleCondition: Array<{ name: string; isChecked: boolean }> = [];
  public allEFOC: Array<{ name: string; isChecked: boolean }> = [];
  public allEFOT: Array<{ name: string; isChecked: boolean }> = [];
  public allEFOG: Array<{ name: string; isChecked: boolean }> = [];
  public allEFOP: Array<{ name: string; isChecked: boolean }> = [];
  public allCulet: Array<{ name: string; isChecked: boolean }> = [];
  public allHNA: Array<{ name: string; isChecked: boolean }> = [];
  public allEyeClean: Array<{ name: string; isChecked: boolean }> = [];
  public allKtoS: Array<{ name: string; isChecked: boolean }> = [];
  public allNaturalOnTable: Array<{ name: string; isChecked: boolean }> = [];
  public allNaturalOnGirdle: Array<{ name: string; isChecked: boolean }> = [];
  public allNaturalOnCrown: Array<{ name: string; isChecked: boolean }> = [];
  public allNaturalOnPavillion: Array<{ name: string; isChecked: boolean }> = [];
  public allFLColor: Array<{ name: string; isChecked: boolean }> = [];
  public allGraining: Array<{ name: string; isChecked: boolean }> = [];
  public allRedSpot: Array<{ name: string; isChecked: boolean }> = [];
  public allLuster: Array<{ name: string; isChecked: boolean }> = [];
  public allBowtie: Array<{ name: string; isChecked: boolean }> = [];
  public listLocation: Array<{ name: string; isChecked: boolean }> = [];
  public filterShape: string = '';
  public filterShapeChk: boolean = true;
  public filterLab: string = '';
  public filterLabChk: boolean = true;
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
  public filterCps: string = '';
  public filterCpsChk: boolean = true;
  public filterFlour: string = '';
  public filterFlourChk: boolean = true;
  public filterSupplier: string = '';
  public filterSupplierChk: boolean = true;
  public filterBrown: string = '';
  public filterGreen: string = '';
  public filterMilky: string = '';
  public filterShade: string = '';
  public filterSideBlack: string = '';
  public filterCenterBlack: string = '';
  public filterSideWhite: string = '';
  public filterCenterWhite: string = '';
  public filterOpenCrown: string = '';
  public filterOpenTable: string = '';
  public filterOpenPavilion: string = '';
  public filterOpenGirdle: string = '';
  public filterGirdleCondition: string = '';
  public filterEFOC: string = '';
  public filterEFOT: string = '';
  public filterEFOG: string = '';
  public filterEFOP: string = '';
  public filterCulet: string = '';
  public filterHNA: string = '';
  public filterEyeClean: string = '';
  public filterKtoS: string = '';
  public filterNaturalOnTable: string = '';
  public filterNaturalOnGirdle: string = '';
  public filterNaturalOnCrown: string = '';
  public filterNaturalOnPavillion: string = '';
  public filterFLColor: string = '';
  public filterGraining: string = '';
  public filterRedSpot: string = '';
  public filterLuster: string = '';
  public filterBowtie: string = '';
  public filterBrownChk: boolean = true;
  public filterGreenChk: boolean = true;
  public filterMilkyChk: boolean = true;
  public filterShadeChk: boolean = true;
  public filterSideBlackChk: boolean = true;
  public filterCenterBlackChk: boolean = true;
  public filterSideWhiteChk: boolean = true;
  public filterCenterWhiteChk: boolean = true;
  public filterOpenCrownChk: boolean = true;
  public filterOpenTableChk: boolean = true;
  public filterOpenPavilionChk: boolean = true;
  public filterOpenGirdleChk: boolean = true;
  public filterGirdleConditionChk: boolean = true;
  public filterEFOCChk: boolean = true;
  public filterEFOTChk: boolean = true;
  public filterEFOGChk: boolean = true;
  public filterEFOPChk: boolean = true;
  public filterCuletChk: boolean = true;
  public filterHNAChk: boolean = true;
  public filterEyeCleanChk: boolean = true;
  public filterKtoSChk: boolean = true;
  public filterNaturalOnTableChk: boolean = true;
  public filterNaturalOnGirdleChk: boolean = true;
  public filterNaturalOnCrownChk: boolean = true;
  public filterNaturalOnPavillionChk: boolean = true;
  public filterFLColorChk: boolean = true;
  public filterGrainingChk: boolean = true;
  public filterRedSpotChk: boolean = true;
  public filterLusterChk: boolean = true;
  public filterBowtieChk: boolean = true;
  public filterDay: boolean = true;
  //#endregion
  public FileStoreTypes = FileStoreTypes;
  public fileStore: AzureFileStore[] = [];
  public profileFileStore: AzureFileStore = new AzureFileStore();
  public photoIdentityFileStore: AzureFileStore = new AzureFileStore();
  public businessIndentityFileStore: AzureFileStore = new AzureFileStore();
  public listWatchListInventory: InventoryItems[] = [];
  public isDiamondDetails: boolean = false;
  public isEditColumn: boolean = false;
  public isEditExportColumn: boolean = false;
  public customerPreference: CustomerPreference = new CustomerPreference();
  public preferredStoneData: ParseSearchQuery[] = [];
  public saveSearchData: ParseSearchQuery[] = [];
  public exportInfoObj: ExportInfo = new ExportInfo();
  public exportConfigObj: ExportConfig = new ExportConfig();
  public exportColumnObj: ExportColumn = new ExportColumn();
  public editExportConfigIndex: number | null = null;
  public listExportFormat = listExportFormat;
  public listBasicExportColumns = listBasicExportColumns;
  public listIncusionExportColumns = listIncusionExportColumns;
  public listMeasurementExportColumns = listMeasurementExportColumns;
  public listOthersExportColumns = listOthersExportColumns;
  public columnModalTitle = 'Edit';
  public searchColumn = '';
  public show = false;
  public supplierDNormItems!: SupplierDNorm[];
  public listDaysItems: Array<{ name: string; isChecked: boolean }> = [];
  public selectedSupplierDNormItems?: { name: string; isChecked: boolean };
  public listSupplierDNormItems: Array<{ name: string; isChecked: boolean }> = [];
  public businessIndentityFileFound: boolean = false;
  public photoIdentityFileFound: boolean = false;
  public custAddDisc: custAddDisc[] = []
  public listItems: Array<{ name: string; isChecked: boolean }> = [
    { name: 'Sunday', isChecked: false },
    { name: 'Monday', isChecked: false },
    { name: 'Tuesday', isChecked: false },
    { name: 'Wednesday', isChecked: false },
    { name: 'Thursday', isChecked: false },
    { name: 'Friday', isChecked: false },
    { name: 'Saturday', isChecked: false },
  ];

  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains',
  };

  constructor(
    private customerService: CustomerService,
    private router: Router,
    private alertDialogService: AlertdialogService,
    private activatedRoute: ActivatedRoute,
    public utilityService: UtilityService,
    private masterConfigService: MasterConfigService,
    private spinnerService: NgxSpinnerService,
    private fileStoreService: FileStoreService,
    private gridPropertiesService: GridPropertiesService,
    private customerCriteriaService: CustomerCriteriaService,
    private watchListService: WatchListService,
    private customerPreferenceService: CustomerPreferenceService,
    private sanitizer: DomSanitizer,
    private supplierService: SupplierService,
    private inventoryService: InventoryService,
  ) { }

  public async ngOnInit() {
    await this.defaultMethodsLoad();
  }

  //#region Initialize Data
  async defaultMethodsLoad() {
    this.spinnerService.show();
    this.fxCredentials = JSON.parse(sessionStorage.getItem("fxCredentials") ?? '') as fxCredential;
    this.activatedRoute.params.subscribe(async params => {
      const id = params['id'];
      await this.getCustomerFiles(id);
      await this.getCustomerCriteriaData(id);
      await this.getMasterConfigData();
      await this.getCustomerData(id);
      await this.getSupplierDNormData();
    });
  }

  public async getCustomerData(id: string) {
    try {
      this.customerObj = await this.customerService.getCustomerById(id);
      if (this.customerObj == null)
        this.router.navigate(['/customer']);
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async getCustomerFiles(id: string) {
    try {
      let imageList: AzureFileStore[] = await this.fileStoreService.getAzureFileByIdent(id);
      if (imageList && imageList.length > 0) {
        for (let index = 0; index < imageList.length; index++) {
          const element = imageList[index];
          element.fileThumbnail = this.loadImage(element.fileThumbnail) || null as any;
        }
        this.fileStore = imageList;
      }
      else
        this.fileStore = [];

      this.setCustomerImages();
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show("Somehting went wrong, Try again later.");
    }
  }

  private setCustomerImages() {
    let profileFileStore = this.fileStore.find(z => z.identType == FileStoreTypes.CustomerProfile);
    if (profileFileStore == null) {
      profileFileStore = new AzureFileStore();
    }
    else {
      this.profileFileStore = profileFileStore;
    }

    let photoIdentityFileStore = this.fileStore.find(z => z.identType == FileStoreTypes.CustomerPhotoIdent);
    if (photoIdentityFileStore == null) {
      photoIdentityFileStore = new AzureFileStore();
      this.photoIdentityFileFound = false;
    }
    else {
      this.photoIdentityFileFound = true;
      this.photoIdentityFileStore = photoIdentityFileStore;
    }

    let businessIndentityFileStore = this.fileStore.find(z => z.identType == FileStoreTypes.CustomerBussinessIdent);
    if (businessIndentityFileStore == null) {
      businessIndentityFileStore = new AzureFileStore();
      this.businessIndentityFileFound = false;
    }
    else {
      this.businessIndentityFileFound = true;
      this.businessIndentityFileStore = businessIndentityFileStore;
    }
  }

  private loadImage(imageSrc: string) {
    if (imageSrc != undefined && imageSrc != null && imageSrc != "")
      return 'data:image/JPEG;base64,' + imageSrc;
    else
      return null
  }
  //#endregion

  //#region Master Config Data
  public async getMasterConfigData() {
    //Master Config
    this.masterConfigList = await this.masterConfigService.getAllMasterConfig();

    this.ShapesList = this.masterConfigList.shape;
    let allTheShapes = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.shape);
    allTheShapes.forEach(z => { this.allTheShapes.push({ name: z.name, isChecked: false }); });

    this.ColorList = this.masterConfigList.colors;
    let allColors = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.colors);
    allColors.forEach(z => { this.allColors.push({ name: z.name, isChecked: false }); });

    this.ClarityList = this.masterConfigList.clarities;
    let allClarities = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.clarities);
    allClarities.forEach(z => { this.allClarities.push({ name: z.name, isChecked: false }); });

    this.FluorList = this.masterConfigList.fluorescence;
    let allTheFluorescences = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.fluorescence);
    allTheFluorescences.forEach(z => { this.allTheFluorescences.push({ name: z.name, isChecked: false }); });

    this.CPSDataList = this.masterConfigList.cut;
    let allCPSData = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.cut);
    allCPSData.forEach(z => { this.allCPSData.push({ name: z.name, isChecked: false }); });

    this.CutDataList = this.masterConfigList.cps;
    let allTheCut = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.cps);
    allTheCut.forEach(z => { this.allTheCut.push({ name: z.name, isChecked: false }); this.allThePolish.push({ name: z.name, isChecked: false }); this.allTheSymm.push({ name: z.name, isChecked: false }); });

    this.LabList = this.masterConfigList.lab;
    let allTheLab = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.lab);
    allTheLab.forEach(z => { this.allTheLab.push({ name: z.name, isChecked: false }); });

    //this.CountryList.forEach(z => { this.allCountry.push({ name: z, isChecked: false }); });

    this.inclusionData = this.masterConfigList.inclusions;
    this.inclusionConfig = this.masterConfigList.inclusionConfig;

    this.BrownList = TypeFilterPipe.prototype.transform(this.inclusionData, 'brown');
    this.ShadeList = TypeFilterPipe.prototype.transform(this.inclusionData, 'shade');
    this.GreenList = TypeFilterPipe.prototype.transform(this.inclusionData, 'green');
    this.MilkyList = TypeFilterPipe.prototype.transform(this.inclusionData, 'milky');
    this.SideBlackList = TypeFilterPipe.prototype.transform(this.inclusionData, 'sideBlack');
    this.CenterBlackList = TypeFilterPipe.prototype.transform(this.inclusionData, 'centerBlack');
    this.SideWhiteList = TypeFilterPipe.prototype.transform(this.inclusionData, 'sideWhite');
    this.CenterWhiteList = TypeFilterPipe.prototype.transform(this.inclusionData, 'centerWhite');
    this.OpenCrownList = TypeFilterPipe.prototype.transform(this.inclusionData, 'openCrown');
    this.OpenTableList = TypeFilterPipe.prototype.transform(this.inclusionData, 'openTable');
    this.OpenPavilionList = TypeFilterPipe.prototype.transform(this.inclusionData, 'openPavilion');
    this.OpenGirdleList = TypeFilterPipe.prototype.transform(this.inclusionData, 'openGirdle');
    this.EFOCList = TypeFilterPipe.prototype.transform(this.inclusionData, 'eFOC');
    this.EFOTList = TypeFilterPipe.prototype.transform(this.inclusionData, 'eFOT');
    this.EFOPList = TypeFilterPipe.prototype.transform(this.inclusionData, 'eFOP');
    this.EFOGList = TypeFilterPipe.prototype.transform(this.inclusionData, 'eFOG');
    this.NaturalOnCrownList = TypeFilterPipe.prototype.transform(this.inclusionData, 'naturalOnCrown');
    this.NaturalOnGirdleList = TypeFilterPipe.prototype.transform(this.inclusionData, 'naturalOnGirdle');
    this.NaturalOnPavillionList = TypeFilterPipe.prototype.transform(this.inclusionData, 'naturalonpavilion');
    this.NaturalOnTableList = TypeFilterPipe.prototype.transform(this.inclusionData, 'naturalOnTable');
    this.GirdleConditionList = TypeFilterPipe.prototype.transform(this.inclusionData, 'girdleCondition');
    this.CuletList = TypeFilterPipe.prototype.transform(this.inclusionData, 'culet');
    this.EyeCleanList = TypeFilterPipe.prototype.transform(this.inclusionData, 'eyeClean');
    this.KtoSList = TypeFilterPipe.prototype.transform(this.inclusionData, 'ktoS');
    this.FLColorList = TypeFilterPipe.prototype.transform(this.inclusionData, 'fLColor');
    this.RedSpotList = TypeFilterPipe.prototype.transform(this.inclusionData, 'redSpot');
    this.LusterList = TypeFilterPipe.prototype.transform(this.inclusionData, 'luster');
    this.BowtieList = TypeFilterPipe.prototype.transform(this.inclusionData, 'bowtie');
    this.HNAList = TypeFilterPipe.prototype.transform(this.inclusionData, 'hNA');

    let allBrown = this.utilityService.sortingMasterDNormPriority(this.BrownList);
    let allShade = this.utilityService.sortingMasterDNormPriority(this.ShadeList);
    let allGreen = this.utilityService.sortingMasterDNormPriority(this.GreenList);
    let allMilky = this.utilityService.sortingMasterDNormPriority(this.MilkyList);
    let allSideBlack = this.utilityService.sortingMasterDNormPriority(this.SideBlackList);
    let allCenterBlack = this.utilityService.sortingMasterDNormPriority(this.CenterBlackList);
    let allSideWhite = this.utilityService.sortingMasterDNormPriority(this.SideWhiteList);
    let allCenterWhite = this.utilityService.sortingMasterDNormPriority(this.CenterWhiteList);
    let allOpenCrown = this.utilityService.sortingMasterDNormPriority(this.OpenCrownList);
    let allOpenTable = this.utilityService.sortingMasterDNormPriority(this.OpenTableList);
    let allOpenPavilion = this.utilityService.sortingMasterDNormPriority(this.OpenPavilionList);
    let allOpenGirdle = this.utilityService.sortingMasterDNormPriority(this.OpenGirdleList);
    let allEFOC = this.utilityService.sortingMasterDNormPriority(this.EFOCList);
    let allEFOT = this.utilityService.sortingMasterDNormPriority(this.EFOTList);
    let allEFOP = this.utilityService.sortingMasterDNormPriority(this.EFOPList);
    let allEFOG = this.utilityService.sortingMasterDNormPriority(this.EFOGList);
    let allNaturalOnCrown = this.utilityService.sortingMasterDNormPriority(this.NaturalOnCrownList);
    let allNaturalOnGirdle = this.utilityService.sortingMasterDNormPriority(this.NaturalOnGirdleList);
    let allNaturalOnPavillion = this.utilityService.sortingMasterDNormPriority(this.NaturalOnPavillionList);
    let allNaturalOnTable = this.utilityService.sortingMasterDNormPriority(this.NaturalOnTableList);
    let allGirdleCondition = this.utilityService.sortingMasterDNormPriority(this.GirdleConditionList);
    let allCulet = this.utilityService.sortingMasterDNormPriority(this.CuletList);
    let allEyeClean = this.utilityService.sortingMasterDNormPriority(this.EyeCleanList);
    let allKtoS = this.utilityService.sortingMasterDNormPriority(this.KtoSList);
    let allFLColor = this.utilityService.sortingMasterDNormPriority(this.FLColorList);
    let allRedSpot = this.utilityService.sortingMasterDNormPriority(this.RedSpotList);
    let allLuster = this.utilityService.sortingMasterDNormPriority(this.LusterList);
    let allBowtie = this.utilityService.sortingMasterDNormPriority(this.BowtieList);
    let allHNA = this.utilityService.sortingMasterDNormPriority(this.HNAList);

    allBrown.forEach(z => { this.allBrown.push({ name: z.name, isChecked: false }); });
    allShade.forEach(z => { this.allShade.push({ name: z.name, isChecked: false }); });
    allGreen.forEach(z => { this.allGreen.push({ name: z.name, isChecked: false }); });
    allMilky.forEach(z => { this.allMilky.push({ name: z.name, isChecked: false }); });
    allSideBlack.forEach(z => { this.allSideBlack.push({ name: z.name, isChecked: false }); });
    allCenterBlack.forEach(z => { this.allCenterBlack.push({ name: z.name, isChecked: false }); });
    allSideWhite.forEach(z => { this.allSideWhite.push({ name: z.name, isChecked: false }); });
    allCenterWhite.forEach(z => { this.allCenterWhite.push({ name: z.name, isChecked: false }); });
    allOpenCrown.forEach(z => { this.allOpenCrown.push({ name: z.name, isChecked: false }); });
    allOpenTable.forEach(z => { this.allOpenTable.push({ name: z.name, isChecked: false }); });
    allOpenPavilion.forEach(z => { this.allOpenPavilion.push({ name: z.name, isChecked: false }); });
    allOpenGirdle.forEach(z => { this.allOpenGirdle.push({ name: z.name, isChecked: false }); });
    allEFOC.forEach(z => { this.allEFOC.push({ name: z.name, isChecked: false }); });
    allEFOT.forEach(z => { this.allEFOT.push({ name: z.name, isChecked: false }); });
    allEFOP.forEach(z => { this.allEFOP.push({ name: z.name, isChecked: false }); });
    allEFOG.forEach(z => { this.allEFOG.push({ name: z.name, isChecked: false }); });
    allNaturalOnCrown.forEach(z => { this.allNaturalOnCrown.push({ name: z.name, isChecked: false }); });
    allNaturalOnGirdle.forEach(z => { this.allNaturalOnGirdle.push({ name: z.name, isChecked: false }); });
    allNaturalOnPavillion.forEach(z => { this.allNaturalOnPavillion.push({ name: z.name, isChecked: false }); });
    allNaturalOnTable.forEach(z => { this.allNaturalOnTable.push({ name: z.name, isChecked: false }); });
    allGirdleCondition.forEach(z => { this.allGirdleCondition.push({ name: z.name, isChecked: false }); });
    allCulet.forEach(z => { this.allCulet.push({ name: z.name, isChecked: false }); });
    allEyeClean.forEach(z => { this.allEyeClean.push({ name: z.name, isChecked: false }); });
    allKtoS.forEach(z => { this.allKtoS.push({ name: z.name, isChecked: false }); });
    allFLColor.forEach(z => { this.allFLColor.push({ name: z.name, isChecked: false }); });
    allRedSpot.forEach(z => { this.allRedSpot.push({ name: z.name, isChecked: false }); });
    allLuster.forEach(z => { this.allLuster.push({ name: z.name, isChecked: false }); });
    allBowtie.forEach(z => { this.allBowtie.push({ name: z.name, isChecked: false }); });
    allHNA.forEach(z => { this.allHNA.push({ name: z.name, isChecked: false }); });

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

  //#region WatchList
  public async getWatchListData() {
    try {
      this.spinnerService.show();
      var invItems = await this.watchListService.getInvItemsByCustomer(this.customerObj.id);
      if (invItems && invItems.length > 0) {
        this.listWatchListInventory = invItems;
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

  public async removeWishlist(stoneId: string) {
    this.alertDialogService.ConfirmYesNo("Are you sure you want to remove stone from watchlist?", "Delete")
      .subscribe(async (res: any) => {
        if (res.flag) {
          try {
            this.spinnerService.show();
            var invItems = await this.watchListService.deleteWatchListFromInventoryItem(stoneId, this.customerObj.id);
            if (invItems) {
              this.utilityService.showNotification('Stone remove successfully!');
              await this.getWatchListData();
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
      });

  }
  //#endregion

  //#region Customer Preference
  public async getCustomerPreferenceData() {
    try {
      this.spinnerService.show();
      var data = await this.customerPreferenceService.getCustomerPreferenceByCustomer(this.customerObj.id);
      if (data) {
        this.customerPreference = data;

        this.preferredStoneData = [];
        data.prefrredStones.forEach(z => {
          let obj: ParseSearchQuery = new ParseSearchQuery();
          obj.name = z.name;
          obj.query = JSON.parse(z.query);
          obj.expiryDate = z.expiryDate;
          this.preferredStoneData.push(obj);
        });

        this.saveSearchData = [];
        data.savedSearches.forEach(z => {
          let obj: ParseSearchQuery = new ParseSearchQuery();
          obj.name = z.name;
          obj.query = JSON.parse(z.query);
          obj.expiryDate = z.expiryDate;
          obj.createdAt = z.createdAt;
          this.saveSearchData.push(obj);
        });

        this.exportInfoObj = JSON.parse(JSON.stringify(data.exportInfo));
        this.exportInfoObj.emailTime = this.getValidTime(data.exportInfo.emailTime);

        this.spinnerService.hide();
      }
      else {
        this.customerPreference = new CustomerPreference();
        let dnorm: CustomerDNorm = new CustomerDNorm();
        dnorm.city = this.customerObj.address.city;
        dnorm.companyName = this.customerObj.companyName;
        dnorm.name = this.customerObj.fullName;
        dnorm.code = this.customerObj.code;
        dnorm.email = this.customerObj.email;
        dnorm.id = this.customerObj.id;
        dnorm.mobile = this.customerObj.mobile1;
        dnorm.sellerId = this.customerObj.seller.id;
        this.customerPreference.customer = dnorm;
        this.spinnerService.hide();
      }
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Something went wrong, Try again later!');
    }
  }

  public async removeSaveSearch(index: number) {
    this.alertDialogService.ConfirmYesNo("Are you sure you want to remove save search?", "Delete")
      .subscribe(async (res: any) => {
        if (res.flag) {
          try {
            this.spinnerService.show();
            this.customerPreference.savedSearches.splice(index, 1);
            var result = await this.customerPreferenceService.updateCustomerPreference(this.customerPreference);
            if (result) {
              this.utilityService.showNotification('Save Search remove successfully!');
              await this.getCustomerPreferenceData();
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
      });
  }

  public async updateExportSettings() {
    this.alertDialogService.ConfirmYesNo("Are you sure you want to update FTP settings?", "Update")
      .subscribe(async (res: any) => {
        if (res.flag) {
          try {
            this.spinnerService.show();
            this.customerPreference.exportInfo = this.exportInfoObj;
            var result = await this.customerPreferenceService.updateCustomerPreference(this.customerPreference);
            if (result) {
              this.utilityService.showNotification('Save successfully!');
              await this.getCustomerPreferenceData();
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
      });
  }

  public async addUpdateExportConfig() {
    try {
      if (this.exportConfigObj.name == undefined || this.exportConfigObj.name == null || this.exportConfigObj.name?.length == 0) {
        this.utilityService.showNotification('Name is required!', 'warning');
        return;
      }
      if (this.exportConfigObj.format == undefined || this.exportConfigObj.format == null || this.exportConfigObj.format?.length == 0) {
        this.utilityService.showNotification('Format is required!', 'warning');
        return;
      }
      if (this.exportConfigObj.fields == undefined || this.exportConfigObj.fields == null || this.exportConfigObj.fields?.length == 0) {
        this.utilityService.showNotification('Please select at least one column!', 'warning');
        return;
      }


      this.spinnerService.show();

      let i = 1;
      this.exportConfigObj.fields.forEach(z => {
        z.index = i++;
      });

      if (this.editExportConfigIndex != null)
        this.customerPreference.exportInfo.configs[this.editExportConfigIndex] = this.exportConfigObj;
      else
        this.customerPreference.exportInfo.configs.push(this.exportConfigObj);

      var result = await this.customerPreferenceService.updateCustomerPreference(this.customerPreference);
      if (result) {
        this.utilityService.showNotification('Save Search remove successfully!');
        await this.getCustomerPreferenceData();
        this.closeEditColumnDialog();
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

  public async removeExportConfig(index: number) {
    this.alertDialogService.ConfirmYesNo("Are you sure you want to remove export Template?", "Delete")
      .subscribe(async (res: any) => {
        if (res.flag) {
          try {
            this.spinnerService.show();
            this.customerPreference.exportInfo.configs.splice(index, 1);
            var result = await this.customerPreferenceService.updateCustomerPreference(this.customerPreference);
            if (result) {
              this.utilityService.showNotification('Export Template remove successfully!');
              await this.getCustomerPreferenceData();
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
      });
  }
  //#endregion

  //#region OnChange Function
  public searchColumns() {
    if (this.searchColumn.length == 0) {
      this.listBasicExportColumns = listBasicExportColumns;
      this.listMeasurementExportColumns = listMeasurementExportColumns;
      this.listIncusionExportColumns = listIncusionExportColumns;
      this.listOthersExportColumns = listOthersExportColumns;
    } else {
      let searchColumn = this.searchColumn.toLocaleLowerCase();
      this.listBasicExportColumns = listBasicExportColumns.filter(z => z.title.toLowerCase().includes(searchColumn));
      this.listMeasurementExportColumns = listMeasurementExportColumns.filter(z => z.title.toLowerCase().includes(searchColumn));
      this.listIncusionExportColumns = listIncusionExportColumns.filter(z => z.title.toLowerCase().includes(searchColumn));
      this.listOthersExportColumns = listOthersExportColumns.filter(z => z.title.toLowerCase().includes(searchColumn));
    }
  }

  public addExportColumn(column: ExportColumn) {
    let exists = this.exportConfigObj.fields.find(z => z.title == column.title);
    if (exists == null || column.title == 'Custom') {
      column.index = this.exportConfigObj.fields.length;
      this.exportConfigObj.fields.push(JSON.parse(JSON.stringify(column)));
      if (column.title == 'Custom')
        this.closeEditExportColumnDialog();
    }
    else
      this.utilityService.showNotification('This column already exists!', 'warning');
  }

  public removeExportField(index: number) {
    this.exportConfigObj.fields.splice(index, 1);

    let i = 1;
    this.exportConfigObj.fields.forEach(z => {
      z.index = i++;
    });
  }

  public getValidTime(date: any): Date {
    const day = moment(date).date();
    const month = moment(date).month();
    const year = moment(date).year();
    const hour = moment(date).hour();
    const minute = moment(date).minute();
    const second = moment(date).second();
    var newDate = new Date(year, month, day, hour, minute, second);
    return newDate;
  }

  public async onTabSelect(e: any) {
    switch (e.index) {
      case 0:
        await this.getCustomerCriteriaData(this.customerObj.id);
        break;
      case 1:
        await this.getWatchListData();
        break;
      case 2:
        await this.getCustomerPreferenceData();
        break;
      case 3:
        await this.getCustomerPreferenceData();
        break;
      case 4:
        await this.getCustomerPreferenceData();
        break;
    }
  }

  public setupURL(stoneId: string, type: string) {
    if (stoneId) {
      if (type == "image")
        return environment.imageURL.replace('{stoneId}', stoneId.toLowerCase());
      else if (type == "video")
        return environment.videoURL.replace('{stoneId}', stoneId.toLowerCase());
      else if (type == "certificate")
        return environment.certiURL.replace('{certiNo}', stoneId);
      else
        return "";
    }
    else
      return "";
  }

  public getShapeImagePath(shape: string, url: string): string | SafeResourceUrl {
    if (url != undefined && url != null && url.length > 0)
      return this.sanitizeURL(url);

    let path = '../commonAssets/images/Round.png';
    switch (shape.toLowerCase()) {
      case "rbc":
        path = '../commonAssets/images/Round.png';
        break;
      case "cmb":
        path = '../commonAssets/images/Cushion.png';
        break;
      case "chakri":
        path = '../commonAssets/images/Chakri.png';
        break;
      case "em":
        path = '../commonAssets/images/Emerald.png';
        break;
      case "sqem":
        path = '../commonAssets/images/Emerald.png';
        break;
      case "flanders":
        path = '../commonAssets/images/Flanders.png';
        break;
      case "mb":
        path = '../commonAssets/images/Marquise.png';
        break;
      case "ob":
        path = '../commonAssets/images/Oval.png';
        break;
      case "pb":
        path = '../commonAssets/images/Pear.png';
        break;
      case "pentagonal":
        path = '../commonAssets/images/Pentagonal.png';
        break;
      case "smb":
        path = '../commonAssets/images/Princess.png';
        break;
      case "ccrmb":
        path = '../commonAssets/images/Radiant.png';
        break;
    }
    return path;
  }

  public async openDocumentDialog(type: string) {

    let image: AzureFileStore = this.fileStore.find(z => z.identType.toLowerCase() == type.toLowerCase()) as AzureFileStore;
    if (image) {
      if (image.blobName.split('.')[1].toLowerCase() == "pdf")
        await this.fileStoreService.downloadFile(image.id);
      else {
        await this.getImagePath(type)
        this.isShowDocument = true;
      }
    }
  }

  public async getImagePath(type: string) {
    let image: AzureFileStore = this.fileStore.find(z => z.identType.toLowerCase() == type.toLowerCase()) as AzureFileStore;
    if (image) {
      let imgSrcDisplay = await this.fileStoreService.downloadBlobFile(image.id)
      this.imgSrcDisplay = await this.utilityService.blobToBase64WithMIME(imgSrcDisplay) as string;
    }
    else
      this.imgSrcDisplay = "assets/images/image-not-found.jpg";
  }

  public closeDocumentDialog() {
    this.isShowDocument = false;
  }

  public sanitizeURL(url: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  public openAddCustomerCriteria(): void {
    this.clearCustomerCriteria();
    this.isAddCustomerCriteria = true;
  }

  public closeAddCustomerCriteria(): void {
    this.isAddCustomerCriteria = false;
  }

  public clearColumnTemplateData() {
    this.exportConfigObj = new ExportConfig();
  }

  public clearColumnObjData() {
    this.exportColumnObj = new ExportColumn();
    this.exportColumnObj.title = 'Custom';
  }

  public openAddColumnDialog(): void {
    this.isEditColumn = true;
    this.columnModalTitle = 'Add';
    this.editExportConfigIndex = null;
    this.clearColumnTemplateData();
  }

  public openEditColumnDialog(index: number, obj: ExportConfig): void {
    this.columnModalTitle = 'Edit';
    this.editExportConfigIndex = index;
    this.exportConfigObj = JSON.parse(JSON.stringify(obj));
    this.isEditColumn = true;
  }

  public closeEditColumnDialog(): void {
    this.isEditColumn = false;
  }

  public openEditExportColumnDialog(): void {
    this.isEditExportColumn = true;
    this.clearColumnObjData();
  }

  public closeEditExportColumnDialog(): void {
    this.isEditExportColumn = false;
  }

  public openDiamonddetailsDailog(): void {
    this.isDiamondDetails = true;
  }
  //#endregion

  //#region Customer Criteria CRUD
  public selectAllCriteria(event: any) {
    this.customerCriteriaData.forEach(z => { z.isCheck = event.target.checked; });
    if (event.target.checked)
      this.selectedCustomerCriteria.push(...JSON.parse(JSON.stringify(this.customerCriteriaData)));
    else
      this.selectedCustomerCriteria = [];
  }

  public selectCriteria(id: string, event: any) {
    if (event.target.checked) {
      var index = this.selectedCustomerCriteria.findIndex(z => z.id == id);
      if (index >= 0) {
        this.selectedCustomerCriteria.splice(index, 1);
      }

      let criteria = this.customerCriteriaData.find(z => z.id == id);
      if (criteria)
        this.selectedCustomerCriteria.push(JSON.parse(JSON.stringify(criteria)));
    }
    else {
      var index = this.selectedCustomerCriteria.findIndex(z => z.id == id);
      if (index >= 0) {
        this.selectedCustomerCriteria.splice(index, 1);
      }
    }

  }

  public async getCustomerCriteriaData(id: string) {
    try {
      this.customerCriteriaData = await this.customerCriteriaService.getCustomerCriteriaByCustomer(id);
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async onCriteriaSubmit(form: NgForm, action: boolean) {
    try {
      if (form.valid) {
        this.spinnerService.show();
        let messageType = '';
        let response!: any;

        if (this.insertFlag) {
          this.setManualDataForInsert();

          messageType = 'inserted';
          response = await this.customerCriteriaService.criteriaInsert(this.customerCriteriaObj);
        }
        else {
          this.customerCriteriaObj.updatedBy = this.fxCredentials?.id ?? '';

          messageType = 'updated';
          response = await this.customerCriteriaService.criteriaUpdate(this.customerCriteriaObj);
        }

        if (response) {
          this.spinnerService.hide();
          this.clearCustomerCriteria();
          if (action)
            this.closeAddCustomerCriteria();
          this.utilityService.showNotification(`Record ` + messageType + ` successfully!`);
          await this.getCustomerCriteriaData(this.customerObj.id);
        }
        else {
          this.spinnerService.hide();
          this.utilityService.showNotification(`Something went wrong, Try again later!`)
        }

      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public setManualDataForInsert() {
    let customerDNorm: CustomerDNorm = new CustomerDNorm();
    customerDNorm.id = this.customerObj.id;
    customerDNorm.name = this.customerObj.fullName;
    customerDNorm.mobile = this.customerObj.mobile1;
    customerDNorm.email = this.customerObj.email;
    customerDNorm.companyName = this.customerObj.companyName;
    this.customerCriteriaObj.customer = customerDNorm;

    this.customerCriteriaObj.id = '';
    this.customerCriteriaObj.createdBy = this.fxCredentials?.id ?? '';
  }

  public openDeleteDialog(id: string) {
    try {
      this.alertDialogService.ConfirmYesNo("Are you sure you want to delete?", "Delete")
        .subscribe(async (res: any) => {
          if (res.flag) {
            try {
              this.spinnerService.show();
              let responseDelete = await this.customerCriteriaService.deleteCriteria(id)
              if (responseDelete !== undefined && responseDelete !== null) {
                this.spinnerService.hide();
                await this.getCustomerCriteriaData(this.customerObj.id);
                this.utilityService.showNotification(`Record deleted successfully!`)
              }
            }
            catch (error: any) {
              console.error(error);
              this.alertDialogService.show('Something went wrong, Try again later!');
            }
          }
        });
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public editCustomerCriteria(obj: CustomerCriteria, isCopy: boolean = false): void {
    this.insertFlag = isCopy;
    this.customerCriteriaObj = new CustomerCriteria();
    this.customerCriteriaObj = { ...obj };
    if (isCopy)
      this.customerCriteriaObj.createdDate = new Date();

    this.checkForCheckBoxInput();
    this.isAddCustomerCriteria = true;
  }

  public checkForCheckBoxInput(): void {
    this.utilityService.onMultiSelectChange(this.allTheShapes, this.customerCriteriaObj.shape);
    this.utilityService.onMultiSelectChange(this.allTheLab, this.customerCriteriaObj.lab);
    this.utilityService.onMultiSelectChange(this.allColors, this.customerCriteriaObj.color);
    this.utilityService.onMultiSelectChange(this.allClarities, this.customerCriteriaObj.clarity);
    this.utilityService.onMultiSelectChange(this.allCPSData, this.customerCriteriaObj.cps);
    this.utilityService.onMultiSelectChange(this.allTheFluorescences, this.customerCriteriaObj.fluorescence);
    this.utilityService.onMultiSelectChange(this.listSupplierDNormItems, this.customerCriteriaObj.supplier);
    this.utilityService.onMultiSelectChange(this.allBrown, this.customerCriteriaObj.brown);
    this.utilityService.onMultiSelectChange(this.allShade, this.customerCriteriaObj.shade);
    this.utilityService.onMultiSelectChange(this.allGreen, this.customerCriteriaObj.green);
    this.utilityService.onMultiSelectChange(this.allMilky, this.customerCriteriaObj.milky);
    this.utilityService.onMultiSelectChange(this.allSideBlack, this.customerCriteriaObj.sideBlack);
    this.utilityService.onMultiSelectChange(this.allCenterBlack, this.customerCriteriaObj.centerBlack);
    this.utilityService.onMultiSelectChange(this.allSideWhite, this.customerCriteriaObj.sideWhite);
    this.utilityService.onMultiSelectChange(this.allCenterWhite, this.customerCriteriaObj.centerWhite);
    this.utilityService.onMultiSelectChange(this.allOpenCrown, this.customerCriteriaObj.openCrown);
    this.utilityService.onMultiSelectChange(this.allOpenTable, this.customerCriteriaObj.openTable);
    this.utilityService.onMultiSelectChange(this.allOpenPavilion, this.customerCriteriaObj.openPavilion);
    this.utilityService.onMultiSelectChange(this.allOpenGirdle, this.customerCriteriaObj.openGirdle);
    this.utilityService.onMultiSelectChange(this.allEFOC, this.customerCriteriaObj.efoc);
    this.utilityService.onMultiSelectChange(this.allEFOT, this.customerCriteriaObj.efot);
    this.utilityService.onMultiSelectChange(this.allEFOP, this.customerCriteriaObj.efop);
    this.utilityService.onMultiSelectChange(this.allEFOG, this.customerCriteriaObj.efog);
    this.utilityService.onMultiSelectChange(this.allNaturalOnCrown, this.customerCriteriaObj.naturalOnCrown);
    this.utilityService.onMultiSelectChange(this.allNaturalOnGirdle, this.customerCriteriaObj.naturalOnGirdle);
    this.utilityService.onMultiSelectChange(this.allNaturalOnPavillion, this.customerCriteriaObj.naturalOnPavillion);
    this.utilityService.onMultiSelectChange(this.allNaturalOnTable, this.customerCriteriaObj.naturalOnTable);
    this.utilityService.onMultiSelectChange(this.allGirdleCondition, this.customerCriteriaObj.girdleCondition);
    this.utilityService.onMultiSelectChange(this.allCulet, this.customerCriteriaObj.culet);
    this.utilityService.onMultiSelectChange(this.allEyeClean, this.customerCriteriaObj.eyeClean);
    this.utilityService.onMultiSelectChange(this.allKtoS, this.customerCriteriaObj.ktoS);
    this.utilityService.onMultiSelectChange(this.allFLColor, this.customerCriteriaObj.fLColor);
    this.utilityService.onMultiSelectChange(this.allRedSpot, this.customerCriteriaObj.redSpot);
    this.utilityService.onMultiSelectChange(this.allLuster, this.customerCriteriaObj.luster);
    this.utilityService.onMultiSelectChange(this.allBowtie, this.customerCriteriaObj.bowtie);
    this.utilityService.onMultiSelectChange(this.allHNA, this.customerCriteriaObj.hna);
    this.utilityService.onMultiSelectChange(this.listLocation, this.customerCriteriaObj.location);
  }

  public clearCustomerCriteria(form?: NgForm): void {
    this.customerCriteriaObj = new CustomerCriteria();
    form?.reset();
    this.errWeight = '';
    this.errDiscount = '';
    this.errDepth = '';
    this.errLength = '';
    this.errWidth = '';
    this.errHeight = '';
    this.checkForCheckBoxInput();
    this.insertFlag = true;
  }
  //#endregion

  //#region Export To Excel
  public async ExportToExcel() {
    try {
      var excelFile: any[] = [];
      this.spinnerService.show();
      let exportData = await this.customerCriteriaService.getInventoryItemsByCustomerCriteria(this.selectedCustomerCriteria);
      if (exportData && exportData.length > 0) {
        let fields = await this.gridPropertiesService.getInventoryGrid();
        if (fields) {
          exportData.forEach(element => {
            var excel = this.convertArrayToObject(fields, element);
            excelFile.push(excel);
          });

          if (excelFile.length > 0) {
            let isExport: boolean = this.utilityService.exportAsExcelFile(excelFile, "Diamond_Excel_");
            if (isExport) {
              this.selectedCustomerCriteria = [];
              this.customerCriteriaData.forEach(z => { z.isCheck = false; });
            }
          }
        }
        this.spinnerService.hide();
      }
      else {
        this.alertDialogService.show('No Data Found!');
        this.spinnerService.hide();
      }
    }
    catch (error: any) {
      console.error(error);
      this.alertDialogService.show('Something went wrong, Try again later');
    }
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
          obj[fields[i].title] = (element.basePrice.netAmount / element.weight).toFixed(3);
        else if (fields[i].title == "Rap")
          obj[fields[i].title] = element.basePrice.rap.toFixed(3);
        else if (fields[i].title == "Discount")
          obj[fields[i].title] = element.basePrice.discount.toFixed(3);
        else if (fields[i].title == "NetAmount")
          obj[fields[i].title] = element.basePrice.netAmount.toFixed(3);
        else
          obj[fields[i].title] = element[fields[i].propertyName];
      }
    }
    return obj;
  }

  private async getSupplierDNormData() {
    try {
      this.supplierDNormItems = await this.supplierService.getSupplierDNorm();
      this.supplierDNormItems.forEach(z => { this.listSupplierDNormItems.push({ name: z.name, isChecked: false }) });
      this.supplierDNormItems.forEach(z => { this.SupplierList.push(z.name) });
    }
    catch (error: any) {
      console.error(error);
      this.alertDialogService.show(error.error);
    }
  }

  public onSelectExcelFile(event: Event) {
    try {
      let acceptedFiles: string[] = [];
      const target = event.target as HTMLInputElement;
      if (target.accept) {
        acceptedFiles = target.accept.split(',').map(item => item.trim());
      }

      if (target.files && target.files.length) {
        this.isFileSelect = true;
        const file = target.files[0];
        this.ftpUpfileName = file.name;
        if (acceptedFiles.includes(file.type)) {
          const fileReader = new FileReader();
          this.spinnerService.show();

          fileReader.onload = async () => {
            try {
              const arrayBuffer: ArrayBuffer = fileReader.result as ArrayBuffer;
              const data = new Uint8Array(arrayBuffer);
              const arr = Array.from(data, byte => String.fromCharCode(byte));

              const workbook = xlsx.read(arr.join(""), { type: "binary" });
              const fetchExcelItems = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]) as any[];

              if (fetchExcelItems && fetchExcelItems.length > 0) {
                const requiredFields = ['StoneId', 'Type', 'Discount'];
                const invalidItems = fetchExcelItems.filter(item => {
                  return !requiredFields.every(field => field in item);
                });

                if (invalidItems.length > 0) {
                  this.spinnerService.hide();
                  this.alertDialogService.show("The file format is incorrect. Please ensure the file contains 'StoneId', 'Type', and 'Discount' columns.");
                  this.isFileSelect = false;
                  target.value = '';
                  return;
                }

                const excelData = fetchExcelItems.map(item => {
                  const newAddDiscObj: custAddDisc = new custAddDisc();
                  newAddDiscObj.stoneId = item['StoneId']?.toString().trim();
                  newAddDiscObj.type = item['Type']?.toString().trim();
                  newAddDiscObj.discount = item['Discount']?.toString().trim();
                  newAddDiscObj.companyName = this.customerObj.companyName;
                  newAddDiscObj.createdDate = new Date();
                  newAddDiscObj.createdBy = this.fxCredentials?.fullName ?? '';
                  return newAddDiscObj;
                });
                this.custAddDisc = JSON.parse(JSON.stringify(excelData));
              }

              this.spinnerService.hide();
            } catch (e) {
              this.spinnerService.hide();
              this.alertDialogService.show("Error processing the file.");
            }
          };

          fileReader.readAsArrayBuffer(file);
        } else {
          this.alertDialogService.show(`Please select only .xlsx or .xls file.`);
        }
      }
    } catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.message || "An error occurred.");
    }
  }

  public async saveAddiDiscExcelFile() {
    try {
      this.spinnerService.show();
      let res = await this.customerCriteriaService.insertCustomerAddiDisc(this.custAddDisc);
      if (res) {
        this.spinnerService.hide();
        this.custAddDisc = [];
        this.isFileSelect = false;
        this.utilityService.showNotification('Excel Data is Inserted successfully!');
      }
    } catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.message || "An error occurred.");
    }
  }
  //#endregion
}

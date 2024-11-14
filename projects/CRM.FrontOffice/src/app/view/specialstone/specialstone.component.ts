import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { fxCredential, GridConfig, GridMasterConfig, MasterConfig, MasterDNorm } from 'shared/enitites';
import { AppPreloadService, ConfigService, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { NgxSpinnerService } from 'ngx-spinner';
import { GridPropertiesService, MasterConfigService, SpecialstonecriteriaService } from '../../services';
import { SpecialStoneCriteria } from '../../entities';
import { GridDetailConfig } from 'shared/businessobjects';
import { Router } from '@angular/router';
import { GroupDescriptor } from '@progress/kendo-data-query';
import { SelectableSettings } from '@progress/kendo-angular-grid';

@Component({
  selector: 'app-specialstone',
  templateUrl: './specialstone.component.html'
})
export class SpecialStoneComponent implements OnInit {
  public isAddCriteria: boolean = false;

  public masterConfigList!: MasterConfig;

  public ShapesList: MasterDNorm[] = [];
  public LabList: MasterDNorm[] = [];
  public ColorList: MasterDNorm[] = [];
  public ClarityList: MasterDNorm[] = [];
  public FluorList: MasterDNorm[] = [];
  public CPSList: MasterDNorm[] = [];
  public GreenList: MasterDNorm[] = [];
  public BrownList: MasterDNorm[] = [];
  public MilkyList: MasterDNorm[] = [];
  public ShadeList: MasterDNorm[] = [];
  public BowtieList: MasterDNorm[] = [];
  public EFOPList: MasterDNorm[] = [];
  public GirdleConditionList: MasterDNorm[] = [];
  public HNAList: MasterDNorm[] = [];
  public EFocList: MasterDNorm[] = [];
  public EyeCleanList: MasterDNorm[] = [];
  public NOGList: MasterDNorm[] = [];
  public NOCList: MasterDNorm[] = [];
  public NOPList: MasterDNorm[] = [];
  public OpenGirdleList: MasterDNorm[] = [];
  public OpenPavList: MasterDNorm[] = [];
  public OpenCrownList: MasterDNorm[] = [];
  public OpenTblList: MasterDNorm[] = [];
  public BLKTableList: MasterDNorm[] = [];
  public BlkCrownList: MasterDNorm[] = [];

  public allTheLab: Array<{ name: string; isChecked: boolean }> = [];
  public allTheShapes: Array<{ name: string; isChecked: boolean }> = [];
  public allColors: Array<{ name: string; isChecked: boolean }> = [];
  public allClarities: Array<{ name: string; isChecked: boolean }> = [];
  public allTheFluorescences: Array<{ name: string; isChecked: boolean }> = [];
  public allTheCut: Array<{ name: string; isChecked: boolean }> = [];
  public allTheSymm: Array<{ name: string; isChecked: boolean }> = [];
  public allThePolish: Array<{ name: string; isChecked: boolean }> = [];
  public allTheBrown: Array<{ name: string; isChecked: boolean }> = [];
  public allTheGreen: Array<{ name: string; isChecked: boolean }> = [];
  public allTheMilky: Array<{ name: string; isChecked: boolean }> = [];
  public allTheShade: Array<{ name: string; isChecked: boolean }> = [];
  public allTheBowtie: Array<{ name: string; isChecked: boolean }> = [];
  public allTheGirdleCondition: Array<{ name: string; isChecked: boolean }> = [];
  public allEFOP: Array<{ name: string; isChecked: boolean }> = [];
  public allHNA: Array<{ name: string; isChecked: boolean }> = [];
  public allEFoc: Array<{ name: string; isChecked: boolean }> = [];
  public allEyeClean: Array<{ name: string; isChecked: boolean }> = [];
  public allNOG: Array<{ name: string; isChecked: boolean }> = [];
  public allNOC: Array<{ name: string; isChecked: boolean }> = [];
  public allNOP: Array<{ name: string; isChecked: boolean }> = [];
  public allOpenPav: Array<{ name: string; isChecked: boolean }> = [];
  public allOpenGirdle: Array<{ name: string; isChecked: boolean }> = [];
  public allOpenCrown: Array<{ name: string; isChecked: boolean }> = [];
  public allOpenTbl: Array<{ name: string; isChecked: boolean }> = [];
  public allBLKTable: Array<{ name: string; isChecked: boolean }> = [];
  public allBlkCrown: Array<{ name: string; isChecked: boolean }> = [];

  public errWeight: string = '';
  public errLimit: string = '';
  public errLength: string = '';
  public errWidth: string = '';
  public errDepth: string = '';
  public errTable: string = '';
  public errRatio: string = '';
  public errADays: string = '';
  public errGradles: string = '';
  public errPavilionAngle: string = '';
  public errPavilionDepth: string = '';
  public errCrownAngle: string = '';
  public errCrownHeight: string = '';
  public errHeight: string = '';
  public errPerCrt: string = '';
  public errNetAmt: string = '';

  public groups: GroupDescriptor[] = [];
  public gridConfig!: GridConfig;
  public gridMasterConfigResponse!: GridMasterConfig;
  public fields!: GridDetailConfig[];
  public mySelection: string[] = [];
  public selectableSettings: SelectableSettings = {
    mode: 'single',
  };
  public specialStoneCriteriaData: SpecialStoneCriteria[] = [];
  public specialStoneCriteriaObj: SpecialStoneCriteria = new SpecialStoneCriteria();
  public insertFlag: boolean = true;
  public fxCredentials!: fxCredential;
  public lastDivNumber = [3, 7, 11, 15, 19];

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
  public filterFlour: string = '';
  public filterFlourChk: boolean = true;
  public filterBrown: string = '';
  public filterBrownChk: boolean = true;
  public filterGreen: string = '';
  public filterGreenChk: boolean = true;
  public filterMilky: string = '';
  public filterMilkyChk: boolean = true;
  public filterShade: string = '';
  public filterShadeChk: boolean = true;
  public filterBowtie: string = '';
  public filterBowtieChk: boolean = true;
  public filterGirdleCondition: string = '';
  public filterGirdleConditionChk: boolean = true;
  public filterEFOP: string = '';
  public filterEFOPChk: boolean = true;
  public filterHNA: string = '';
  public filterHNAChk: boolean = true;
  public filterEFoc: string = '';
  public filterEFocChk: boolean = true;
  public filterEyeClean: string = '';
  public filterEyeCleanChk: boolean = true;
  public filterNOG: string = '';
  public filterNOGChk: boolean = true;
  public filterNOC: string = '';
  public filterNOCChk: boolean = true;
  public filterNOP: string = '';
  public filterNOPChk: boolean = true;
  public filterOpenGirdle: string = '';
  public filterOpenGirdleChk: boolean = true;
  public filterOpenPav: string = '';
  public filterOpenPavChk: boolean = true;
  public filterOpenCrown: string = '';
  public filterOpenCrownChk: boolean = true;
  public filterOpenTbl: string = '';
  public filterOpenTblChk: boolean = true;
  public filterBLKTable: string = '';
  public filterBLKTableChk: boolean = true;
  public filterBlkCrown: string = '';
  public filterBlkCrownChk: boolean = true;

  public showRatio = false;

  constructor(private alertDialogService: AlertdialogService,
    private masterConfigService: MasterConfigService,
    private router: Router,
    public utilityService: UtilityService,
    private specialstonecriteriaService: SpecialstonecriteriaService,
    public gridPropertyService: GridPropertiesService,
    private configService: ConfigService,
    private appPreloadService: AppPreloadService,
    private spinnerService: NgxSpinnerService) {

  }

  public async ngOnInit() {
    await this.defaultMethodsLoad();
  }

  //#region Initialize Data
  async defaultMethodsLoad() {
    this.spinnerService.show();
    this.fxCredentials = await this.appPreloadService.fetchFxCredentials();
    if (!this.fxCredentials)
      this.router.navigate(["login"]);

    await this.getGridConfiguration();
    await this.getMasterConfigData();
    await this.getSpecialStoneCriteriaData();
  }
  //#endregion

  public async getGridConfiguration() {
    try {
      this.gridConfig = await this.configService.getGridConfig(this.fxCredentials.id, "SpecialStone", "SpecialStoneGrid", this.gridPropertyService.getSpecialStoneGrid());
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
        this.gridMasterConfigResponse = await this.configService.getMasterGridConfig("SpecialStone", "SpecialStoneGrid");
        if (this.gridMasterConfigResponse)
          this.fields = this.gridMasterConfigResponse.gridDetail;
        else
          this.fields = await this.gridPropertyService.getSpecialStoneGrid();

        this.fxCredentials.origin.toLowerCase() == 'admin' ? this.fields : this.fields = this.fields.filter(c => c.title.toLowerCase() != "seller");
      }
    } catch (error: any) {
      this.alertDialogService.show(error.error)
      this.spinnerService.hide();
    }
  }
  public selectedRowChange(e: any) {
    this.insertFlag = false;
    this.specialStoneCriteriaObj = new SpecialStoneCriteria();
    if (e.selectedRows.length > 0) {
      let value: any = e.selectedRows[0].dataItem
      this.specialStoneCriteriaObj = { ...value };
    } else
      this.mySelection = [];
  }

  public groupChange(groups: GroupDescriptor[]): void {
    try {
      this.groups = groups;
      this.getSpecialStoneCriteriaData();
    }
    catch (error: any) {
      this.alertDialogService.show(error.error)
    }
  }

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

    this.BrownList = this.masterConfigList.inclusions.filter(z => z.type == 'brown');
    let allTheBrown = this.utilityService.sortingMasterDNormPriority(this.BrownList);
    allTheBrown.forEach(z => { this.allTheBrown.push({ name: z.name, isChecked: false }); });

    this.GreenList = this.masterConfigList.inclusions.filter(z => z.type == 'green');
    let allTheGreen = this.utilityService.sortingMasterDNormPriority(this.GreenList);
    allTheGreen.forEach(z => { this.allTheGreen.push({ name: z.name, isChecked: false }); });

    this.MilkyList = this.masterConfigList.inclusions.filter(z => z.type == 'milky');
    let allTheMilky = this.utilityService.sortingMasterDNormPriority(this.MilkyList);
    allTheMilky.forEach(z => { this.allTheMilky.push({ name: z.name, isChecked: false }); });

    this.ShadeList = this.masterConfigList.inclusions.filter(z => z.type == 'shade');
    let allTheShade = this.utilityService.sortingMasterDNormPriority(this.ShadeList);
    allTheShade.forEach(z => { this.allTheShade.push({ name: z.name, isChecked: false }); });

    this.BowtieList = this.masterConfigList.inclusions.filter(z => z.type == 'bowtie');
    let allTheBowtie = this.utilityService.sortingMasterDNormPriority(this.BowtieList);
    allTheBowtie.forEach(z => { this.allTheBowtie.push({ name: z.name, isChecked: false }); });

    this.GirdleConditionList = this.masterConfigList.inclusions.filter(z => z.type == 'girdlecondition');
    let allTheGirdleCondition = this.utilityService.sortingMasterDNormPriority(this.GirdleConditionList);
    allTheGirdleCondition.forEach(z => { this.allTheGirdleCondition.push({ name: z.name, isChecked: false }); });

    this.EFOPList = this.masterConfigList.inclusions.filter(z => z.type == 'efop');
    let allEFOP = this.utilityService.sortingMasterDNormPriority(this.EFOPList);
    allEFOP.forEach(z => { this.allEFOP.push({ name: z.name, isChecked: false }); });

    this.HNAList = this.masterConfigList.inclusions.filter(z => z.type == 'hna');
    let allHNA = this.utilityService.sortingMasterDNormPriority(this.HNAList);
    allHNA.forEach(z => { this.allHNA.push({ name: z.name, isChecked: false }); });

    this.EFocList = this.masterConfigList.inclusions.filter(z => z.type == 'efoc');
    let allEFoc = this.utilityService.sortingMasterDNormPriority(this.EFocList);
    allEFoc.forEach(z => { this.allEFoc.push({ name: z.name, isChecked: false }); });

    this.EyeCleanList = this.masterConfigList.inclusions.filter(z => z.type == 'eyeclean');
    let allEyeClean = this.utilityService.sortingMasterDNormPriority(this.EyeCleanList);
    allEyeClean.forEach(z => { this.allEyeClean.push({ name: z.name, isChecked: false }); });

    this.NOGList = this.masterConfigList.inclusions.filter(z => z.type == 'naturalongirdle');
    let allNOG = this.utilityService.sortingMasterDNormPriority(this.NOGList);
    allNOG.forEach(z => { this.allNOG.push({ name: z.name, isChecked: false }); });

    this.NOCList = this.masterConfigList.inclusions.filter(z => z.type == 'naturaloncrown');
    let allNOC = this.utilityService.sortingMasterDNormPriority(this.NOCList);
    allNOC.forEach(z => { this.allNOC.push({ name: z.name, isChecked: false }); });

    this.NOPList = this.masterConfigList.inclusions.filter(z => z.type == 'naturalonpavilion');
    let allNOP = this.utilityService.sortingMasterDNormPriority(this.NOPList);
    allNOP.forEach(z => { this.allNOP.push({ name: z.name, isChecked: false }); });

    this.OpenGirdleList = this.masterConfigList.inclusions.filter(z => z.type == 'opengirdle');
    let allOpenGirdle = this.utilityService.sortingMasterDNormPriority(this.OpenGirdleList);
    allOpenGirdle.forEach(z => { this.allOpenGirdle.push({ name: z.name, isChecked: false }); });

    this.OpenCrownList = this.masterConfigList.inclusions.filter(z => z.type == 'opencrown');
    let allOpenCrown = this.utilityService.sortingMasterDNormPriority(this.OpenCrownList);
    allOpenCrown.forEach(z => { this.allOpenCrown.push({ name: z.name, isChecked: false }); });

    this.OpenPavList = this.masterConfigList.inclusions.filter(z => z.type == 'openpavilion');
    let allOpenPav = this.utilityService.sortingMasterDNormPriority(this.OpenPavList);
    allOpenPav.forEach(z => { this.allOpenPav.push({ name: z.name, isChecked: false }); });

    this.OpenTblList = this.masterConfigList.inclusions.filter(z => z.type == 'opentable');
    let allOpenTbl = this.utilityService.sortingMasterDNormPriority(this.OpenTblList);
    allOpenTbl.forEach(z => { this.allOpenTbl.push({ name: z.name, isChecked: false }); });

    this.BLKTableList = this.masterConfigList.inclusions.filter(z => z.type == 'centerblack');
    let allBLKTable = this.utilityService.sortingMasterDNormPriority(this.BLKTableList);
    allBLKTable.forEach(z => { this.allBLKTable.push({ name: z.name, isChecked: false }); });

    this.BlkCrownList = this.masterConfigList.inclusions.filter(z => z.type == 'sideblack');
    let allBlkCrown = this.utilityService.sortingMasterDNormPriority(this.BlkCrownList);
    allBlkCrown.forEach(z => { this.allBlkCrown.push({ name: z.name, isChecked: false }); });


    this.CPSList = this.masterConfigList.cps;
    let allTheCPS = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.cps);
    allTheCPS.forEach(z => { this.allTheCut.push({ name: z.name, isChecked: false }); });
    allTheCPS.forEach(z => { this.allThePolish.push({ name: z.name, isChecked: false }); });
    allTheCPS.forEach(z => { this.allTheSymm.push({ name: z.name, isChecked: false }); });

    this.LabList = this.masterConfigList.lab;
    let allTheLab = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.lab);
    allTheLab.forEach(z => { this.allTheLab.push({ name: z.name, isChecked: false }); });
  }
  //#endregion

  //#region Employee Criteria CRUD
  public editCriteria(obj: SpecialStoneCriteria, isCopy: boolean = false): void {
    this.insertFlag = isCopy;
    this.specialStoneCriteriaObj = new SpecialStoneCriteria();
    this.specialStoneCriteriaObj = { ...obj };
    this.checkForCheckBoxInput();
    this.showRationValidation();
    this.isAddCriteria = true;
  }

  public async getSpecialStoneCriteriaData() {
    try {
      this.specialStoneCriteriaData = await this.specialstonecriteriaService.getAllSpecialStoneCriteria();
      this.spinnerService.hide();
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
        if(!this.specialStoneCriteriaObj.isDOrder){
          this.specialStoneCriteriaObj.fromNetAmount = null;
          this.specialStoneCriteriaObj.toNetAmount = null;
          this.specialStoneCriteriaObj.fromDollerPerCarat = null;
          this.specialStoneCriteriaObj.toDollerPerCarat = null;
        }
        if (this.insertFlag) {
          this.setManualDataForInsert();

          messageType = 'inserted';
          response = await this.specialstonecriteriaService.criteriaInsert(this.specialStoneCriteriaObj);
        }
        else {
          this.specialStoneCriteriaObj.updatedBy = this.fxCredentials?.id ?? '';

          messageType = 'updated';
          response = await this.specialstonecriteriaService.criteriaUpdate(this.specialStoneCriteriaObj);
        }

        if (response) {
          this.spinnerService.hide();
          this.clearCriteria();
          if (action)
            this.closeAddCriteria();
          this.utilityService.showNotification(`Record ` + messageType + ` successfully!`);
          sessionStorage.removeItem("SpecialStoneCriteria");
          await this.getSpecialStoneCriteriaData();
        }
        else {
          this.spinnerService.hide();
          this.utilityService.showNotification(`Something went wrong, Try again later!`)
        }
        this.mySelection=[];

      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public openDeleteDialog(id: string) {
    try {
      this.alertDialogService.ConfirmYesNo("Are you sure you want to delete?", "Delete")
        .subscribe(async (res: any) => {
          if (res.flag) {
            this.spinnerService.show();
            let responseDelete = await this.specialstonecriteriaService.deleteCriteria(id)
            if (responseDelete !== undefined && responseDelete !== null) {
              this.spinnerService.hide();
              sessionStorage.removeItem("SpecialStoneCriteria");
              await this.getSpecialStoneCriteriaData();
              this.utilityService.showNotification(`Record deleted successfully!`)
            }
          }
        });
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }
  //#endregion

  //#region OnChange Functions
  public showRationValidation() {
    if (this.specialStoneCriteriaObj.shape.length > 0) {
      var fancyStones = this.specialStoneCriteriaObj.shape.filter(z => z.toLowerCase() != "rbc");
      if (fancyStones.length > 0)
        this.showRatio = true;
      else
        this.showRatio = false;
    }
    else
      this.showRatio = false;
  }

  public openCriteria() {
    this.clearCriteria();
    this.isAddCriteria = true;
    this.mySelection=[];
  }

  public closeAddCriteria() {
    this.isAddCriteria = false;
    this.mySelection=[];
  }

  public clearCriteria(form?: NgForm): void {
    this.specialStoneCriteriaObj = new SpecialStoneCriteria();
    form?.reset();
    this.errWeight = '';
    this.errLimit = '';
    this.checkForCheckBoxInput();
    this.insertFlag = true;
  }

  public checkForCheckBoxInput(): void {
    this.utilityService.onMultiSelectChange(this.allTheShapes, this.specialStoneCriteriaObj.shape);
    this.utilityService.onMultiSelectChange(this.allTheLab, this.specialStoneCriteriaObj.lab);
    this.utilityService.onMultiSelectChange(this.allColors, this.specialStoneCriteriaObj.color);
    this.utilityService.onMultiSelectChange(this.allClarities, this.specialStoneCriteriaObj.clarity);
    this.utilityService.onMultiSelectChange(this.allTheCut, this.specialStoneCriteriaObj.cut);
    this.utilityService.onMultiSelectChange(this.allThePolish, this.specialStoneCriteriaObj.polish);
    this.utilityService.onMultiSelectChange(this.allTheSymm, this.specialStoneCriteriaObj.symmetry);
    this.utilityService.onMultiSelectChange(this.allTheFluorescences, this.specialStoneCriteriaObj.fluorescence);
    this.utilityService.onMultiSelectChange(this.allTheBrown, this.specialStoneCriteriaObj.inclusion.brown);
    this.utilityService.onMultiSelectChange(this.allTheGreen, this.specialStoneCriteriaObj.inclusion.green);
    this.utilityService.onMultiSelectChange(this.allTheMilky, this.specialStoneCriteriaObj.inclusion.milky);
    this.utilityService.onMultiSelectChange(this.allTheShade, this.specialStoneCriteriaObj.inclusion.shade);
    this.utilityService.onMultiSelectChange(this.allTheBowtie, this.specialStoneCriteriaObj.inclusion.bowtie);
    this.utilityService.onMultiSelectChange(this.allTheGirdleCondition, this.specialStoneCriteriaObj.inclusion.girdleCondition);
    this.utilityService.onMultiSelectChange(this.allEFOP, this.specialStoneCriteriaObj.inclusion.efop);
    this.utilityService.onMultiSelectChange(this.allHNA, this.specialStoneCriteriaObj.inclusion.hna);
    this.utilityService.onMultiSelectChange(this.allEFoc, this.specialStoneCriteriaObj.inclusion.efoc);
    this.utilityService.onMultiSelectChange(this.allEyeClean, this.specialStoneCriteriaObj.inclusion.eyeClean);
    this.utilityService.onMultiSelectChange(this.allNOG, this.specialStoneCriteriaObj.inclusion.naturalOnGirdle);
    this.utilityService.onMultiSelectChange(this.allNOP, this.specialStoneCriteriaObj.inclusion.naturalOnPavillion);
    this.utilityService.onMultiSelectChange(this.allNOC, this.specialStoneCriteriaObj.inclusion.naturalOnCrown);
    this.utilityService.onMultiSelectChange(this.allOpenGirdle, this.specialStoneCriteriaObj.inclusion.openGirdle);
    this.utilityService.onMultiSelectChange(this.allOpenCrown, this.specialStoneCriteriaObj.inclusion.openCrown);
    this.utilityService.onMultiSelectChange(this.allOpenTbl, this.specialStoneCriteriaObj.inclusion.openTable);
    this.utilityService.onMultiSelectChange(this.allOpenPav, this.specialStoneCriteriaObj.inclusion.openPavilion);
    this.utilityService.onMultiSelectChange(this.allBLKTable, this.specialStoneCriteriaObj.inclusion.centerBlack);
    this.utilityService.onMultiSelectChange(this.allBlkCrown, this.specialStoneCriteriaObj.inclusion.sideBlack);
  }

  public setManualDataForInsert() {
    this.specialStoneCriteriaObj.id = '';
    this.specialStoneCriteriaObj.createdBy = this.fxCredentials?.id ?? '';
  }
  //#endregion

}

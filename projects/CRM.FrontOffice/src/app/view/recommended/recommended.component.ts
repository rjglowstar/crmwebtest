import { Component, OnInit } from '@angular/core';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { DataResult, GroupDescriptor, orderBy, SortDescriptor } from '@progress/kendo-data-query';
import { NgxSpinnerService } from 'ngx-spinner';
import { GridDetailConfig } from 'shared/businessobjects';
import { fxCredential, GridConfig, GridMasterConfig, MasterDNorm } from 'shared/enitites';
import { ConfigService, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { RecommendedResponse, RecommendedSearchCriteria } from '../../businessobjects';
import { GridPropertiesService, MasterConfigService, RecommendedService } from '../../services';

@Component({
  selector: 'app-recommended',
  templateUrl: './recommended.component.html',
  styleUrls: []
})

export class RecommendedComponent implements OnInit {

  public recommendedSearchCriteria: RecommendedSearchCriteria = new RecommendedSearchCriteria();
  public recommendedListItems: RecommendedResponse[] = new Array<RecommendedResponse>();
  public selectedrecommendedListItems: RecommendedResponse[] = new Array<RecommendedResponse>();
  public excelFile: any[] = [];
  public pageSize = 26;
  public skip = 0;
  public fields!: GridDetailConfig[];
  public sort!: SortDescriptor[];
  public selectableSettings: SelectableSettings = { mode: 'multiple' };
  public mySelection: string[] = [];
  public isRowSelected!: boolean;
  public gridView!: DataResult;
  public groups: GroupDescriptor[] = [];
  public filterFlag = true;
  public isShowCheckBoxAll: boolean = true;
  public allTheLab: Array<{ name: string; isChecked: boolean }> = [];
  public allTheShapes: Array<{ name: string; isChecked: boolean }> = [];
  public allColors: Array<{ name: string; isChecked: boolean }> = [];
  public allClarities: Array<{ name: string; isChecked: boolean }> = [];
  public allTheFluorescences: Array<{ name: string; isChecked: boolean }> = [];
  public allTheCPS: Array<{ name: string; isChecked: boolean }> = [];
  public shapesList: MasterDNorm[] = [];
  public labList: MasterDNorm[] = [];
  public colorList: MasterDNorm[] = [];
  public clarityList: MasterDNorm[] = [];
  public fluorList: MasterDNorm[] = [];
  public CPSList: MasterDNorm[] = [];
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
  public isGridConfig: boolean = false;
  private fxCredentials!: fxCredential;
  public gridConfig!: GridConfig;
  public gridMasterConfigResponse!: GridMasterConfig;
  public stoneId = "";
  public certificateNo = "";
  public showRecSearchPopup = false;

  constructor(
    private recommendedService: RecommendedService,
    private alertDialogService: AlertdialogService,
    private spinnerService: NgxSpinnerService,
    private gridPropertiesService: GridPropertiesService,
    public utilityService: UtilityService,
    private configService: ConfigService,
    private masterConfigService: MasterConfigService
  ) { }

  async ngOnInit() {
    this.fxCredentials = JSON.parse(sessionStorage.getItem("fxCredentials") ?? '') as fxCredential;
    await this.loadDefaultMethods();
    await this.getMasterConfigData();
  }

  public async loadDefaultMethods() {
    try {
      this.utilityService.filterToggleSubject.subscribe(flag => {
        this.filterFlag = flag;
      });

      await this.getGridConfiguration();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async getMasterConfigData() {
    try {
      this.spinnerService.show();

      var masterConfigList = await this.masterConfigService.getAllMasterConfig();
      this.shapesList = masterConfigList.shape;
      let allTheShapes = this.utilityService.sortingMasterDNormPriority(masterConfigList.shape);
      allTheShapes.forEach(z => { this.allTheShapes.push({ name: z.name, isChecked: false }); });

      this.colorList = masterConfigList.colors;
      let allColors = this.utilityService.sortingMasterDNormPriority(masterConfigList.colors);
      allColors.forEach(z => { this.allColors.push({ name: z.name, isChecked: false }); });

      this.clarityList = masterConfigList.clarities;
      let allClarities = this.utilityService.sortingMasterDNormPriority(masterConfigList.clarities);
      allClarities.forEach(z => { this.allClarities.push({ name: z.name, isChecked: false }); });

      this.fluorList = masterConfigList.fluorescence;
      let allTheFluorescences = this.utilityService.sortingMasterDNormPriority(masterConfigList.fluorescence);
      allTheFluorescences.forEach(z => { this.allTheFluorescences.push({ name: z.name, isChecked: false }); });

      this.CPSList = masterConfigList.cps;
      let allTheCPS = this.utilityService.sortingMasterDNormPriority(masterConfigList.cps);
      allTheCPS.forEach(z => { this.allTheCPS.push({ name: z.name, isChecked: false }); });

      this.labList = masterConfigList.lab;
      let allTheLab = this.utilityService.sortingMasterDNormPriority(masterConfigList.lab);
      allTheLab.forEach(z => { this.allTheLab.push({ name: z.name, isChecked: false }); });

      await this.getData();
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async getData() {
    try {
      if (this.fxCredentials && this.fxCredentials.origin.toLowerCase() == "seller")
        this.recommendedSearchCriteria.sellerId = this.fxCredentials.id;
      this.recommendedSearchCriteria.stoneIds = this.stoneId ? this.utilityService.CheckStoneIds(this.stoneId).map(x => x.toUpperCase()) : [];
      this.recommendedSearchCriteria.certificateNos = this.certificateNo ? this.utilityService.checkCertificateIds(this.certificateNo) : [];
      this.recommendedListItems = await this.recommendedService.getAllRecommendeds(this.recommendedSearchCriteria);
      this.loadData();
    }
    catch (error: any) {
      this.alertDialogService.show(error);
      this.spinnerService.hide();
    }
  }

  private loadData(): void {
    this.gridView = {
      data: this.recommendedListItems.slice(this.skip, this.skip + this.pageSize),
      total: this.recommendedListItems.length
    };
  }

  public async getGridConfiguration() {
    try {
      this.spinnerService.show();
      this.gridConfig = await this.configService.getGridConfig(this.fxCredentials.id, "Recommended", "RecommendedGrid", this.gridPropertiesService.getrecommended());
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
        this.gridMasterConfigResponse = await this.configService.getMasterGridConfig("Recommended", "RecommendedGrid");
        if (this.gridMasterConfigResponse)
          this.fields = this.gridMasterConfigResponse.gridDetail;
        else
          this.fields = await this.gridPropertiesService.getrecommended();
      }
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.alertDialogService.show(error);
      this.spinnerService.hide();
    }
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

  public filterPartToggle() {
    this.utilityService.setfilterToggleValue(this.filterFlag);
  }

  public async openDeleteDialog() {
    try {
      if (this.mySelection.length > 0) {
        this.alertDialogService.ConfirmYesNo("Are you sure you want to delete?", "Delete")
          .subscribe(async (res: any) => {
            if (res.flag) {
              this.spinnerService.show();
              let flag = await this.recommendedService.deleteRecommended(this.mySelection);
              if (flag) {
                this.utilityService.showNotification(`Item has been removed successfully!`);
                await this.getData();
              }
              this.spinnerService.hide();
            }
          });
      }
    } catch (error: any) {
      this.alertDialogService.show(error);
      this.spinnerService.hide();
    }
  }

  public pageChange({ skip, take }: PageChangeEvent): void {
    this.spinnerService.show();
    this.skip = skip;
    this.pageSize = take;
    this.loadData();
    this.spinnerService.hide();
  }

  public sortChange(sort: SortDescriptor[]): void {
    this.sort = sort;
    this.gridView = {
      data: orderBy(this.gridView.data, this.sort),
      total: this.recommendedListItems.length
    };
  }

  public async groupChange(groups: GroupDescriptor[]) {
    try {
      this.groups = groups;
      await this.getData();
    }
    catch (error: any) {
      this.alertDialogService.show(error.error);
    }
  }

  public async clearSearch() {
    try {
      this.spinnerService.show();
      this.recommendedSearchCriteria = new RecommendedSearchCriteria();

      if (this.fxCredentials && this.fxCredentials.origin.toLowerCase() == "seller")
        this.recommendedSearchCriteria.sellerId = this.fxCredentials.id;

      this.allTheShapes.forEach(c => c.isChecked = false);
      this.allColors.forEach(c => c.isChecked = false);
      this.allClarities.forEach(c => c.isChecked = false);
      this.allTheCPS.forEach(c => c.isChecked = false);
      this.allTheFluorescences.forEach(c => c.isChecked = false);
      this.allTheLab.forEach(c => c.isChecked = false);

      this.stoneId = "";
      this.certificateNo = "";

      await this.getData();
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  //#region  Bid Generation
  public showGenerateBidPopup() {
    this.showRecSearchPopup = true;
  }

  public closeDialogPopupHandler(event: Event) {
    this.showRecSearchPopup = false;
    this.getData();
  }
  //#endregion
}
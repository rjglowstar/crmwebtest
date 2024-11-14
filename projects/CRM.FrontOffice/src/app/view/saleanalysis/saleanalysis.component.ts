import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NgForm } from '@angular/forms';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { NgxSpinnerService } from 'ngx-spinner';
import { MasterConfig, MasterDNorm, MeasurementConfig } from 'shared/enitites';
import { UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views/common/alertdialog/alertdialog.service';
import { InventorySearchCriteria, WeightRange } from '../../businessobjects';
import { FinalStockSaleAnalysis } from '../../businessobjects/analysis/finalstocksaleanalysis';
import { SaleAnalysisResponse } from '../../businessobjects/analysis/saleanalysisresponse';
import { SystemUser, fxCredential } from '../../entities';
import { InventoryService, MasterConfigService, SystemUserService } from '../../services';
import { SaleAnalysisService } from '../../services/analysis/saleanalysis.service';

@Component({
  selector: 'app-saleanalysis',
  templateUrl: './saleanalysis.component.html',
  styleUrls: ['./saleanalysis.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class SaleanalysisComponent implements OnInit {
  public SaleAnalysisResponse: SaleAnalysisResponse[] = [];
  public finalStockSaleAnalysis: FinalStockSaleAnalysis = new FinalStockSaleAnalysis();
  public SaleAnalysisTotal = new SaleAnalysisResponse();
  public fxCredentials?: fxCredential;
  public listStatus: Array<{ name: string; isChecked: boolean }> = [];
  public inventorySearchCriteriaObj: InventorySearchCriteria = new InventorySearchCriteria();
  public tempInventorySearchCriteriaObj: InventorySearchCriteria = new InventorySearchCriteria();
  public isSearchFilter: boolean = false;
  public isFirstTimeLoad = true;
  public masterConfigList!: MasterConfig;
  public allTheLab?: MasterDNorm[];
  public allTheShapes?: MasterDNorm[];
  public allColors?: MasterDNorm[];
  public allClarities?: MasterDNorm[];
  public allTheFluorescences?: MasterDNorm[];
  public allTheCPS?: MasterDNorm[];
  public inclusionData: MasterDNorm[] = [];
  public inclusionFlag: boolean = false;
  public measurementData: MasterDNorm[] = [];
  public measurementConfig: MeasurementConfig = new MeasurementConfig();
  public listKapanItems: Array<{ name: string; isChecked: boolean }> = [];
  public listIGradeItems: Array<{ name: string; isChecked: boolean }> = [];
  public listMGradeItems: Array<{ name: string; isChecked: boolean }> = [];
  public selectedCPS?: string;
  public isBGM: boolean = false;
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
  public systemUserItems!: SystemUser[];
  public listEmpItems: Array<{ text: string; value: string }> = [];
  public allHoldBy: string[] = [];
  public listHoldByItems: Array<{ name: string; isChecked: boolean }> = [];
  public listLocation: Array<{ name: string; isChecked: boolean }> = [];

  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains',
  };

  //#region Model Flag
  public isAdminRole = false;

  constructor(
    private inventoryService: InventoryService,
    public utilityService: UtilityService,
    private masterConfigService: MasterConfigService,
    private spinnerService: NgxSpinnerService,
    private alertDialogService: AlertdialogService,
    private systemUserService: SystemUserService,
    private saleAnalysisService: SaleAnalysisService
  ) { }


  async ngOnInit() {
    await this.defaultMethodsLoad();
  }

  public async openSearchDialog() {
    try {
      this.isSearchFilter = true;
      if (this.isFirstTimeLoad) {
        this.getMasterConfigData();
        this.getSystemUserData();
        this.isFirstTimeLoad = false;
      }

      //show checked location if change from summary filter
      this.utilityService.onMultiSelectChange(this.listLocation, this.inventorySearchCriteriaObj.location);
    }
    catch (error: any) {
      this.alertDialogService.show(error.error);
    }
  }

  public closeSearchDialog(): void {
    this.isSearchFilter = false;
  }


  public async getSaleAnalysisData() {
    try {
      this.spinnerService.show();

      let finalStockSaleAnalysis = await this.saleAnalysisService.getSalesAnalysisBySearch(this.inventorySearchCriteriaObj);

      this.SaleAnalysisTotal.openingStock = finalStockSaleAnalysis.finalOpeningStock;
      this.SaleAnalysisTotal.openingStockWeight = finalStockSaleAnalysis.finalOpeningStockWeight;
      this.SaleAnalysisTotal.openingStockCount = finalStockSaleAnalysis.finalOpeningStockCount;
      this.SaleAnalysisTotal.additionStock = finalStockSaleAnalysis.finalAdditionStock;
      this.SaleAnalysisTotal.additionStockWeight = finalStockSaleAnalysis.finalAdditionStockWeight;
      this.SaleAnalysisTotal.additionStockCount = finalStockSaleAnalysis.finalAdditionStockCount;
      this.SaleAnalysisTotal.saleOpeningStock = finalStockSaleAnalysis.finalSaleOpeningStock;
      this.SaleAnalysisTotal.saleOpeningStockWeight = finalStockSaleAnalysis.finalSaleOpeningStockWeight;
      this.SaleAnalysisTotal.saleOpeningStockCount = finalStockSaleAnalysis.finalSaleOpeningStockCount;
      this.SaleAnalysisTotal.saleAdditionStock = finalStockSaleAnalysis.finalSaleAdditionStock;
      this.SaleAnalysisTotal.saleAdditionStockWeight = finalStockSaleAnalysis.finalSaleAdditionStockWeight;
      this.SaleAnalysisTotal.saleAdditionStockCount = finalStockSaleAnalysis.finalSaleAdditionStockCount;
      this.SaleAnalysisTotal.size = "Total";

      this.SaleAnalysisResponse = finalStockSaleAnalysis.stockSaleAnalyses;
      this.SaleAnalysisResponse.push(this.SaleAnalysisTotal);

      this.spinnerService.hide();
    }
    catch (error: any) {
      this.alertDialogService.show(error);
      this.spinnerService.hide();
    }
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


  public async defaultMethodsLoad() {
    this.fxCredentials = JSON.parse(sessionStorage.getItem("fxCredentials") ?? '') as fxCredential;
    if (this.fxCredentials?.origin == 'Admin')
      this.isAdminRole = true;

  }


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
    this.measurementData = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.measurements);
    this.measurementConfig = this.masterConfigList.measurementConfig;

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

  public clearSearchCriteria(form: NgForm): void {
    form?.reset();
    this.inventorySearchCriteriaObj = new InventorySearchCriteria();
    this.inventorySearchCriteriaObj.supplierIds = [];
    this.listStatus.forEach(z => { z.isChecked = false });
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

  public async filterBySearch() {
    this.assignAdditionalData();
    this.getSaleAnalysisData();
    this.isSearchFilter = false;
  }
}
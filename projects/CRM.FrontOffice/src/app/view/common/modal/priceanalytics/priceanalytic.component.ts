import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PriceAnalyticsRequest, PriceAnalyticsSalesResponse } from '../../../../businessobjects';
import { ConfigService, LeadStatus, StoneStatus, UtilityService } from 'shared/services';
import { fxCredential, InventoryItems, PricingRequest } from '../../../../entities';
import { GridDetailConfig } from 'shared/businessobjects';
import { NgxSpinnerService } from 'ngx-spinner';
import { GridPropertiesService, MasterConfigService, PricingRequestService } from '../../../../services';
import { AlertdialogService } from 'shared/views';
import { GridConfig, GridMasterConfig, MasterConfig } from 'shared/enitites';

@Component({
  selector: 'app-priceanalytic',
  templateUrl: './priceanalytic.component.html',
  styleUrls: ['./priceanalytic.component.css']
})

export class PriceAnalyticsComponent implements OnInit {
  @Output() closeDialog = new EventEmitter();
  @Input() selectedPriceReq: PricingRequest = new PricingRequest();

  public isSAGridConfig: boolean = false;
  public stoneAnalysisGridConfig!: GridConfig;
  public saGridMasterConfigResponse!: GridMasterConfig;

  public stoneAnalysisfields: GridDetailConfig[] = [];

  public totalStone: number = 0;
  public avgDays: number = 0;
  public available: number = 0;
  public inProcess: number = 0;
  public memo: number = 0;
  public lead: number = 0;
  public hold: number = 0;

  public priceAnalyticsSelected: InventoryItems[] = [];
  public priceAnalyticsAvailable: InventoryItems[] = [];
  public priceAnalyticsSold: InventoryItems[] = [];
  public salesData: PriceAnalyticsSalesResponse[] = [];
  public masterConfigList: MasterConfig = new MasterConfig();

  private fxCredentials!: fxCredential;

  constructor(
    private configService: ConfigService,
    private gridPropertiesService: GridPropertiesService,
    private alertDialogService: AlertdialogService,
    private pricingRequestService: PricingRequestService,
    private spinnerService: NgxSpinnerService,
    public utilityService: UtilityService,
    public masterConfigService: MasterConfigService,
  ) { }

  public async ngOnInit() {
    this.spinnerService.show();
    this.fxCredentials = JSON.parse(sessionStorage.getItem("fxCredentials") ?? '') as fxCredential;

    this.masterConfigList = await this.masterConfigService.getAllMasterConfig();

    await this.getGridConfiguration();
    await this.getPriceAnalyticsData();
    this.spinnerService.hide();
  }

  public async getGridConfiguration() {
    try {
      this.stoneAnalysisGridConfig = await this.configService.getGridConfig(this.fxCredentials?.id ?? '', "StoneAnalysis", "StoneAnalysisGrid", this.gridPropertiesService.getStoneAnalysisGrid());
      if (this.stoneAnalysisGridConfig && this.stoneAnalysisGridConfig.id != '') {
        let dbObj: GridDetailConfig[] = this.stoneAnalysisGridConfig.gridDetail;
        if (dbObj && dbObj.some(c => c.isSelected)) {
          this.stoneAnalysisfields = dbObj;
          this.stoneAnalysisfields.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        }
        else
          this.stoneAnalysisfields.forEach(c => c.isSelected = true);
      }
      else {
        this.saGridMasterConfigResponse = await this.configService.getMasterGridConfig("StoneAnalysis", "StoneAnalysisGrid");
        if (this.saGridMasterConfigResponse)
          this.stoneAnalysisfields = this.saGridMasterConfigResponse.gridDetail;
        else
          this.stoneAnalysisfields = await this.gridPropertiesService.getStoneAnalysisGrid();
      }
    }
    catch (error: any) {
      this.alertDialogService.show(error);
      this.spinnerService.hide();
    }
  }

  public setNewSAGridConfig(gridConfig: GridConfig) {
    if (gridConfig) {
      this.stoneAnalysisfields = gridConfig.gridDetail;
      this.stoneAnalysisGridConfig = new GridConfig();
      this.stoneAnalysisGridConfig.id = gridConfig.id
      this.stoneAnalysisGridConfig.gridDetail = gridConfig.gridDetail;
      this.stoneAnalysisGridConfig.gridName = gridConfig.gridName;
      this.stoneAnalysisGridConfig.pageName = gridConfig.pageName;
      this.stoneAnalysisGridConfig.empID = gridConfig.empID;
    }
  }

  public async getPriceAnalyticsData() {
    try {

      let req: PriceAnalyticsRequest = {
        weight: this.selectedPriceReq.weight,
        shape: this.selectedPriceReq.shape,
        color: this.selectedPriceReq.color,
        clarity: this.selectedPriceReq.clarity,
        cps: this.selectedPriceReq.cps,
        fluor: this.selectedPriceReq.fluorescence
      };

      let invs = await this.pricingRequestService.getPriceAnalytics(req);
      if (invs) {

        var totalDays: number[] = [];
        var currentDate = new Date();

        this.priceAnalyticsSelected = [this.mappingPriceReqToInventoryItem(this.selectedPriceReq)];
        this.priceAnalyticsAvailable = invs.filter(z => z.stoneId != this.selectedPriceReq.stoneId && (z.status == StoneStatus.Stock.toString() || z.status == StoneStatus.Transit.toString()));
        this.priceAnalyticsSold = invs.filter(z => z.status != StoneStatus.Stock.toString() && z.status != StoneStatus.Transit.toString());

        if (this.priceAnalyticsSold.length > 0) {
          let invIds = this.priceAnalyticsSold.map(z => z.id);
          this.salesData = await this.pricingRequestService.getPriceAnalyticsSalesData(invIds);
          if (this.salesData.length > 0) {
            this.priceAnalyticsSold.forEach(z => {
              let sale = this.salesData.find(a => a.invId == z.id);
              if (sale != null)
                z.soldDate = new Date(sale.orderDate);
            });
          }

          this.priceAnalyticsSold = this.priceAnalyticsSold.sort((a, b) => {
            return ((b.soldDate ? new Date(b.soldDate).getTime() : 0) - (a.soldDate ? new Date(a.soldDate).getTime() : 0));
          });
        }

        let summaryData = this.getSummaryData(this.priceAnalyticsAvailable);
        let soldSummaryData = this.getSummaryData(this.priceAnalyticsSold);

        this.totalStone = summaryData.length;
        summaryData.forEach(z => {
          if (z.marketSheetDate != null) {
            let dateSent = new Date(z.marketSheetDate);
            let days = Math.floor((Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()) - Date.UTC(dateSent.getFullYear(), dateSent.getMonth(), dateSent.getDate())) / (1000 * 60 * 60 * 24));
            totalDays.push(days);

            //z.availableDays = this.utilityService.calculateAvailableDateDiff(z.marketSheetDate, z.holdDays, z.isHold == true ? z.holdDate : null);
          }
          else
            z.marketSheetDate = new Date();
        });

        this.avgDays = this.utilityService.ConvertToFloatWithDecimal(totalDays.length > 0 ? (totalDays.reduce((a, u) => a + u, 0) / totalDays.length) : 0);
        this.available = this.utilityService.ConvertToFloatWithDecimal(summaryData.map(z => z.availableDays).reduce((a, u) => a + u, 0) / summaryData.length);
        this.inProcess = summaryData.filter(z => z.status == StoneStatus.Transit.toString()).length;
        this.memo = summaryData.filter(z => z.isMemo == true).length;

        this.lead = soldSummaryData.filter(z => z.leadStatus == LeadStatus.Cart.toString() || z.leadStatus == LeadStatus.Hold.toString()).length;
        this.hold = summaryData.filter(z => z.isHold == true).length;
      }
      else
        this.alertDialogService.show('No stone(s) found!');
    }
    catch (error: any) {
      this.spinnerService.hide();
      console.error(error);
      this.alertDialogService.show(error.error);
    }
  }

  private mappingPriceReqToInventoryItem(priceReq: PricingRequest) {
    let item = new InventoryItems();
    item.stoneId = priceReq.stoneId;
    item.shape = priceReq.shape;
    item.weight = priceReq.weight;
    item.color = priceReq.color;
    item.clarity = priceReq.clarity;
    item.cut = priceReq.cut;
    item.polish = priceReq.polish;
    item.symmetry = priceReq.symmetry;
    item.fluorescence = priceReq.fluorescence;
    item.status = priceReq.status;
    item.basePrice = priceReq.basePrice;
    item.price = priceReq.price;

    if (!item.price.rap)
      item.price.rap = priceReq.basePrice.rap;

    item.inclusion = priceReq.inclusion;
    item.measurement = priceReq.measurement;
    item.lab = priceReq.lab;
    item.availableDays = priceReq.availableDays;
    item.holdDays = priceReq.holdDays;
    item.holdDate = priceReq.holdDate;
    item.pricingComment = priceReq.pricingComment;
    item.marketSheetDate = priceReq.marketSheetDate;
    return item;
  }

  private getSummaryData(invs: InventoryItems[]): InventoryItems[] {
    let weightFilter = this.getMinMaxWeightForPriceAnalytics(this.selectedPriceReq.weight);
    let minWeight = weightFilter.min;
    let maxWeight = weightFilter.max;

    //Get CPS value
    if (!this.selectedPriceReq.cps)
      this.selectedPriceReq.cps = this.utilityService.getCPSValue(this.selectedPriceReq.shape, this.selectedPriceReq.cut, this.selectedPriceReq.polish, this.selectedPriceReq.symmetry, this.masterConfigList.cutDetails);

    invs = invs.filter(c =>
      (c.weight >= minWeight && c.weight <= maxWeight) &&
      this.utilityService.filterCommonString(c.shape, this.selectedPriceReq.shape) &&
      this.utilityService.filterCommonString(c.color, this.selectedPriceReq.color) &&
      this.utilityService.filterCommonString(c.clarity, this.selectedPriceReq.clarity) &&
      this.utilityService.filterCommonString(c.fluorescence, this.selectedPriceReq.fluorescence) &&
      this.utilityService.filterCommonString(c.cps, this.selectedPriceReq.cps));

    return invs;
  }

  private getMinMaxWeightForPriceAnalytics(weight: number): { min: number, max: number } {
    let min = 0;
    let max = 0;

    if (weight >= 0.10 && weight <= 0.29) {
      min = 0.10;
      max = 0.29;
    }
    else if (weight >= 0.30 && weight <= 0.31) {
      min = 0.30;
      max = 0.31;
    }
    else if (weight >= 0.32 && weight <= 0.33) {
      min = 0.32;
      max = 0.33;
    }
    else if (weight >= 0.34 && weight <= 0.34) {
      min = 0.34;
      max = 0.34;
    }
    else if (weight >= 0.35 && weight <= 0.39) {
      min = 0.35;
      max = 0.39;
    }
    else if (weight >= 0.40 && weight <= 0.41) {
      min = 0.40;
      max = 0.41;
    }
    else if (weight >= 0.42 && weight <= 0.43) {
      min = 0.42;
      max = 0.43;
    }
    else if (weight >= 0.44 && weight <= 0.44) {
      min = 0.44;
      max = 0.44;
    }
    else if (weight >= 0.45 && weight <= 0.49) {
      min = 0.45;
      max = 0.49;
    }
    else if (weight >= 0.50 && weight <= 0.51) {
      min = 0.50;
      max = 0.51;
    }
    else if (weight >= 0.52 && weight <= 0.53) {
      min = 0.52;
      max = 0.53;
    }
    else if (weight >= 0.54 && weight <= 0.59) {
      min = 0.54;
      max = 0.59;
    }
    else if (weight >= 0.60 && weight <= 0.62) {
      min = 0.60;
      max = 0.62;
    }
    else if (weight >= 0.63 && weight <= 0.64) {
      min = 0.63;
      max = 0.64;
    }
    else if (weight >= 0.65 && weight <= 0.69) {
      min = 0.65;
      max = 0.69;
    }
    else if (weight >= 0.70 && weight <= 0.72) {
      min = 0.70;
      max = 0.72;
    }
    else if (weight >= 0.73 && weight <= 0.74) {
      min = 0.73;
      max = 0.74;
    }
    else if (weight >= 0.75 && weight <= 0.79) {
      min = 0.75;
      max = 0.79;
    }
    else if (weight >= 0.80 && weight <= 0.82) {
      min = 0.80;
      max = 0.82;
    }
    else if (weight >= 0.83 && weight <= 0.84) {
      min = 0.83;
      max = 0.84;
    }
    else if (weight >= 0.85 && weight <= 0.89) {
      min = 0.85;
      max = 0.89;
    }
    else if (weight >= 0.90 && weight <= 0.92) {
      min = 0.90;
      max = 0.92;
    }
    else if (weight >= 0.93 && weight <= 0.94) {
      min = 0.93;
      max = 0.94;
    }
    else if (weight >= 0.95 && weight <= 0.99) {
      min = 0.95;
      max = 0.99;
    }
    else if (weight >= 1.00 && weight <= 1.01) {
      min = 1.00;
      max = 1.01;
    }
    else if (weight >= 1.02 && weight <= 1.03) {
      min = 1.02;
      max = 1.03;
    }
    else if (weight >= 1.04 && weight <= 1.09) {
      min = 1.04;
      max = 1.09;
    }
    else if (weight >= 1.10 && weight <= 1.19) {
      min = 1.10;
      max = 1.19;
    }
    else if (weight >= 1.20 && weight <= 1.29) {
      min = 1.20;
      max = 1.29;
    }
    else if (weight >= 1.30 && weight <= 1.39) {
      min = 1.30;
      max = 1.39;
    }
    else if (weight >= 1.40 && weight <= 1.49) {
      min = 1.40;
      max = 1.49;
    }
    else if (weight >= 1.50 && weight <= 1.99) {
      min = 1.50;
      max = 1.99;
    }
    else if (weight >= 2.00 && weight <= 2.99) {
      min = 2.00;
      max = 2.99;
    }
    else if (weight >= 3.00 && weight <= 3.99) {
      min = 3.00;
      max = 3.99;
    }
    else if (weight >= 4.00 && weight <= 4.99) {
      min = 4.00;
      max = 4.99;
    }
    else if (weight >= 5.00 && weight <= 5.99) {
      min = 5.00;
      max = 5.99;
    }
    else if (weight >= 6.00 && weight <= 6.99) {
      min = 6.00;
      max = 6.99;
    }
    else if (weight >= 10.00 && weight <= 19.99) {
      min = 10.00;
      max = 19.99;
    }

    return { min, max };
  }

  public getSalesFDisc(invId: string) {
    return this.salesData.find(z => z.invId == invId)?.fDisc ?? '';
  }

  public getSalesOrderDate(invId: string) {
    var date = this.salesData.find(z => z.invId == invId)?.orderDate ?? null as any;
    return date;
  }

  public openSAGridConfigDialog(): void {
    this.isSAGridConfig = true;
  }

  closeAnalyticsDialog() {
    this.closeDialog.emit(false);
  }

}

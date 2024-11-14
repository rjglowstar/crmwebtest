import { Component, OnInit } from '@angular/core';
import { DataResult, process } from '@progress/kendo-data-query';
import { NgxSpinnerService } from 'ngx-spinner';
import { GridDetailConfig, MfgInclusionData, MfgMeasurementData, MfgPricingRequest, PricingDiscountApiResponse, PricingMarketSheetRequest, PricingMarketSheetResponse } from 'shared/businessobjects';
import { MasterConfig, MasterDNorm } from 'shared/enitites';
import { PricingService, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import * as xlsx from 'xlsx';
import { DaysData, InvPurchaseAnalysis } from '../../businessobjects';
import { GridPropertiesService, MasterConfigService, PurchaseAnalysisService } from '../../services';

@Component({
  selector: 'app-purchaseanalysis',
  templateUrl: './purchaseanalysis.component.html',
  styles: [
  ]
})
export class PurchaseanalysisComponent implements OnInit {

  public fields!: GridDetailConfig[];
  public gridView!: DataResult;
  public masterConfigList!: MasterConfig;
  public allTheShapes!: MasterDNorm[];
  public allColors!: MasterDNorm[];
  public allClarities!: MasterDNorm[];
  public allTheFluorescences!: MasterDNorm[];
  public allTheCPS!: MasterDNorm[];

  public invPurchaseAnalysisData: InvPurchaseAnalysis[] = [];
  public excelFile: any[] = [];

  constructor(
    private alertDialogService: AlertdialogService,
    public utilityService: UtilityService,
    private spinnerService: NgxSpinnerService,
    private pricingService: PricingService,
    private purchaseAnalysisService: PurchaseAnalysisService,
    private gridPropertiesService: GridPropertiesService,
    private masterConfigService: MasterConfigService,
  ) { }

  async ngOnInit() {
    await this.getGridConfiguration();
    await this.loadMasterConfig();
  }

  //#region  Grid Config
  public async getGridConfiguration() {
    try {
      this.fields = await this.gridPropertiesService.getPurchaseAnalysisGrid();
    }
    catch (error: any) {
      this.alertDialogService.show(error);
      this.spinnerService.hide();
    }
  }

  //#endregion

  //#region  load Master config 
  public async loadMasterConfig() {
    this.masterConfigList = await this.masterConfigService.getAllMasterConfig();
    this.allTheShapes = this.masterConfigList.shape;
    this.allColors = this.masterConfigList.colors;
    this.allClarities = this.masterConfigList.clarities;
    this.allTheFluorescences = this.masterConfigList.fluorescence;
    this.allTheCPS = this.masterConfigList.cps;
  }
  //#endregion

  //#region Phrchase Analysis from Excel
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
        if (acceptedFiles.indexOf(target.files[0].type) == -1) {
          this.alertDialogService.show(`Please select valid file.`);
          return;
        }

        let file = target.files[0];
        let fileReader = new FileReader();
        this.spinnerService.show();
        fileReader.onload = async (e) => {

          var arrayBuffer: any = fileReader.result;
          let data = new Uint8Array(arrayBuffer);
          let arr = new Array();

          for (let i = 0; i != data.length; ++i)
            arr[i] = String.fromCharCode(data[i]);

          let workbook = xlsx.read(arr.join(""), { type: "binary" });
          var inventoryFetchExcelItems = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]) as any;
          if (!inventoryFetchExcelItems[0].hasOwnProperty("any") || !inventoryFetchExcelItems[0].hasOwnProperty("shape") || !inventoryFetchExcelItems[0].hasOwnProperty("weight") || !inventoryFetchExcelItems[0].hasOwnProperty("color") || !inventoryFetchExcelItems[0].hasOwnProperty("clarity") || !inventoryFetchExcelItems[0].hasOwnProperty("cut") || !inventoryFetchExcelItems[0].hasOwnProperty("polish") || !inventoryFetchExcelItems[0].hasOwnProperty("sym") || !inventoryFetchExcelItems[0].hasOwnProperty("fluo")) {
            this.spinnerService.hide();
            this.alertDialogService.show(`Please select valid excel data.`);
            return;
          }
          let finalInventoryItems: InvPurchaseAnalysis[] = [];
          let avgDays: DaysData[] = [];
          let reqMList: MfgPricingRequest[] = [];
          let reqPList: PricingMarketSheetRequest[] = [];

          for (let i = 0; i < inventoryFetchExcelItems.length; i++) {
            let element = inventoryFetchExcelItems[i];
            element = this.checkOptionalWords(element);
            reqMList.push(this.mappingPricingRequestData(element));
            reqPList.push(this.mappingMarketSheetPricing(element))
          }

          let priceData = await this.getPriceData(reqMList, reqPList);
          if (priceData.basePrice.length == 0 || priceData.mainPrice.length == 0) {
            this.spinnerService.hide();
            this.alertDialogService.show('Price data not found!', 'error');
            return;
          }

          let responseB = priceData.basePrice;
          let responseP = priceData.mainPrice;
          if (responseB && responseB.length > 0 && responseP && responseP.length > 0) {

            let invFetchExcelItems = this.ChunkBy(inventoryFetchExcelItems, 100);

            for (let i = 0; i < invFetchExcelItems.length; i++) {
              if (invFetchExcelItems[i] != undefined && invFetchExcelItems[i].length > 0) {

                let daysData = await this.purchaseAnalysisService.getSAvgDays(invFetchExcelItems[i]);
                if (daysData.length == 0 ) {
                  this.spinnerService.hide();
                  this.alertDialogService.show('Avg Days data not found!', 'error');
                  return;
                }

                avgDays.push(...daysData);
              }
            }

            for (let i = 0; i < inventoryFetchExcelItems.length; i++) {
              let element = inventoryFetchExcelItems[i];
              element.shape = this.getDisplayNameFromMasterDNorm(element.shape, this.allTheShapes);
              responseB[i] = this.utilityService.setAmtForPricingDiscountResponse(responseB[i], element.weight);
              responseP[i] = this.utilityService.setAmtForPricingMarketSheetDiscountResponse(responseP[i], element.weight);

              finalInventoryItems.push({
                id: element.any,
                shape: element.shape,
                weight: element.weight,
                color: element.color,
                clarity: element.clarity,
                cut: element.cut,
                polish: element.polish,
                sym: element.sym,
                fluo: element.fluo,
                kPrice: { rap: responseB[i].rapPrice, perCarat: responseB[i].dCaret, netAmount: responseB[i].amount, discount: responseB[i].discount },
                mPrice: { rap: responseP[i].rapPrice, perCarat: responseP[i].dCaret, netAmount: responseP[i].amount, discount: responseP[i].discount },
                sAVGDays: avgDays.find(a => a.stoneId == element.any)?.sCount ?? 90,
                mAVGDays: avgDays.find(a => a.stoneId == element.any)?.count ?? 90
              });
            }
          }

          this.invPurchaseAnalysisData = finalInventoryItems;
          this.gridView = process(finalInventoryItems, {});
          this.gridView.total = finalInventoryItems.length;
          this.spinnerService.hide();
        }

        fileReader.readAsArrayBuffer(file);
      }
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(error.error)
    }
  }
  //#endregion


  public ChunkBy(array: any, chunk: any) {
    const chunkSize = chunk || 10;
    const chunkedArray = array.reduce((acc: any[], item: any) => {
      let group = acc.pop();
      if (group.length === chunkSize) {
        acc.push(group);
        group = [];
      }
      group.push(item);
      acc.push(group);
      return acc;
    }, [[]]);
    return chunkedArray;
  }

  //#region  Others
  private async getPriceData(reqMList: MfgPricingRequest[], reqPList: PricingMarketSheetRequest[]): Promise<{ basePrice: PricingDiscountApiResponse[], mainPrice: PricingMarketSheetResponse[] }> {
    try {
      let responseB = await this.pricingService.getBasePrice(reqMList);
      let responseP = await this.pricingService.getPurchaseDisc(reqPList);

      return { basePrice: responseB, mainPrice: responseP };

    } catch (error: any) {
      console.error(error);
      this.alertDialogService.show('Price not get, Try again later!');
      this.spinnerService.hide();
    }
    return { basePrice: [], mainPrice: [] };
  }

  private async getAvgDaysData(inventoryFetchExcelItems: InvPurchaseAnalysis[]): Promise<{ aAvgDays: DaysData[], mAvgDays: DaysData[] }> {
    try {
      const [aAvgDays, mAvgDays] = await Promise.all([
        this.purchaseAnalysisService.getSAvgDays(inventoryFetchExcelItems),
        this.purchaseAnalysisService.getMAvgDays(inventoryFetchExcelItems)
      ]);
  
      return { aAvgDays, mAvgDays };

    } catch (error: any) {
      console.error(error);
      this.alertDialogService.show('Avg days data not get, Try again later!');
      this.spinnerService.hide();
      return { aAvgDays: [], mAvgDays: [] };
    }
  }

  public mappingPricingRequestData(item: InvPurchaseAnalysis): MfgPricingRequest {

    let req: MfgPricingRequest = {
      Lab: "GIA",
      Rapver: "NONE",
      Id: "",
      Shape: item.shape?.toUpperCase(),
      Weight: item.weight,
      Color: (item.color?.toUpperCase() == "O" || item.color?.toUpperCase() == "P") ? "M" : item.color?.toUpperCase(),
      Clarity: item.clarity?.toUpperCase(),
      Cut: item.cut?.toUpperCase(),
      Polish: item.polish?.toUpperCase(),
      Symmetry: item.sym?.toUpperCase(),
      Flour: item.fluo?.toUpperCase(),
      InclusionPrice: new MfgInclusionData(),
      MeasurePrice: new MfgMeasurementData(),
      IGrade: "",
      MGrade: ""
    };

    return req;
  }

  public mappingMarketSheetPricing(z: InvPurchaseAnalysis): PricingMarketSheetRequest {


    let req: PricingMarketSheetRequest = {
      Lab: "GIA",
      Id: "",
      Shape: z.shape,
      Weight: z.weight,
      Color: (z.color?.toUpperCase() == 'O' || z.color?.toUpperCase() == 'P') ? 'M' : z.color?.toUpperCase(),
      Clarity: z.clarity,
      Cut: z.cut,
      Polish: z.polish,
      Symmetry: z.sym,
      Flour: z.fluo,
      MGrade: "",
      IGrade: "",
      Day: 0,
      InclusionPrice: new MfgInclusionData(),
      MeasurePrice: new MfgMeasurementData()
    };

    return req;
  }

  public checkOptionalWords(inventoryFetchExcelItems: InvPurchaseAnalysis) {
    const shape = inventoryFetchExcelItems.shape;
    var obj = this.allTheShapes.find(c => c.name.toLowerCase() == shape.toLowerCase() || c.displayName.toLowerCase() == shape.toLowerCase() || c.optionalWords && c.optionalWords.map(u => u.toLowerCase().trim()).includes(shape.toLowerCase()));
    if (obj)
      inventoryFetchExcelItems.shape = obj.name;

    const color = inventoryFetchExcelItems.color;
    var obj = this.allColors.find(c => c.name.toLowerCase() == color.toLowerCase() || c.displayName.toLowerCase() == color.toLowerCase() || c.optionalWords && c.optionalWords.map(u => u.toLowerCase().trim()).includes(color.toLowerCase()));
    if (obj)
      inventoryFetchExcelItems.color = obj.name;

    const clarity = inventoryFetchExcelItems.clarity;
    var obj = this.allClarities.find(c => c.name.toLowerCase() == clarity.toLowerCase() || c.displayName.toLowerCase() == clarity.toLowerCase() || c.optionalWords && c.optionalWords.map(u => u.toLowerCase().trim()).includes(clarity.toLowerCase()));
    if (obj)
      inventoryFetchExcelItems.clarity = obj.name;

    const fluorescence = inventoryFetchExcelItems.fluo;
    var obj = this.allTheFluorescences.find(c => c.name.toLowerCase() == fluorescence.toLowerCase() || c.displayName.toLowerCase() == fluorescence.toLowerCase() || c.optionalWords && c.optionalWords.map(u => u.toLowerCase().trim()).includes(fluorescence.toLowerCase()));
    if (obj)
      inventoryFetchExcelItems.fluo = obj.name;

    const cut = inventoryFetchExcelItems.cut;
    var obj = this.allTheCPS.find(c => c.name.toLowerCase() == cut.toLowerCase() || c.displayName.toLowerCase() == cut.toLowerCase() || c.optionalWords && c.optionalWords.map(u => u.toLowerCase().trim()).includes(cut.toLowerCase()));
    if (obj)
      inventoryFetchExcelItems.cut = obj.name;

    const polish = inventoryFetchExcelItems.polish;
    var obj = this.allTheCPS.find(c => c.name.toLowerCase() == polish.toLowerCase() || c.displayName.toLowerCase() == polish.toLowerCase() || c.optionalWords && c.optionalWords.map(u => u.toLowerCase().trim()).includes(polish.toLowerCase()));
    if (obj)
      inventoryFetchExcelItems.polish = obj.name;

    const symmetry = inventoryFetchExcelItems.sym;
    var obj = this.allTheCPS.find(c => c.name.toLowerCase() == symmetry.toLowerCase() || c.displayName.toLowerCase() == symmetry.toLowerCase() || c.optionalWords && c.optionalWords.map(u => u.toLowerCase().trim()).includes(symmetry.toLowerCase()));
    if (obj)
      inventoryFetchExcelItems.sym = obj.name;

    return inventoryFetchExcelItems;
  }

  public clearGrid() {
    this.alertDialogService.ConfirmYesNo("Are you sure you want to clear grid ?", "Purchase Analysis")
      .subscribe((res: any) => {
        if (res.flag) {
          this.gridView = process([], {});
          this.gridView.total = 0;
        }
      });
  }

  public getDisplayNameFromMasterDNorm(name: string, list: MasterDNorm[]): string {
    if (name && name.length > 0)
      var obj = list.find(c => c.name.toLowerCase() == name.toLowerCase() || c.displayName?.toLowerCase() == name.toLowerCase() || (c.optionalWords && c.optionalWords.length > 0 && c.optionalWords.map(u => u.toLowerCase().trim()).includes(name.toLowerCase())));
    return obj?.displayName ?? null as any;
  }
  //#endregion

  //#region Export Excel
  public excelDownload() {
    this.excelFile=[];
    this.generateExcelData(this.invPurchaseAnalysisData);

    if (this.excelFile.length > 0)
      this.utilityService.exportAsCsvFile(this.excelFile, "Purchase_Analytics");
    else
      this.alertDialogService.show('No data found for export!');
  }

  private generateExcelData(data: InvPurchaseAnalysis[]) {
    let i = 2;

    data.forEach(z => {
      var excel = {
        'Stone No': z.id,
        'Shape': z.shape,
        'Size': z.weight,
        'Color': z.color,
        'Clarity': z.clarity,
        'Cut': z.cut,
        'Polish': z.polish,
        'Symmetry': z.sym,
        'Fluore': z.fluo,
        'Rap': z.mPrice.rap,
        'Kapan Dis': z.kPrice.discount,
        'Kapan Dcaret': z.kPrice.perCarat,
        'Kapan NetD': z.kPrice.netAmount,
        '-1.5': '=M' + i + '+(M' + i + '*-1.5/100)',
        '': '',
        'Market Dis': z.mPrice.discount,
        'Market Dcaret': z.mPrice.perCarat,
        'Market NetD': z.mPrice.netAmount,
        '-1.5 ': '=R' + i + '+(R' + i + '*-1.5/100)',
        ' ': '',
        '  ': '=J' + i + '*C' + i,
        '   ': '',
        'sAVGDays': z.sAVGDays
      }
      this.excelFile.push(excel);
      i++;
    });
    this.excelFile.push({
      'Stone No': '',
      'Shape': '',
      'Size': '',
      'Color': '',
      'Clarity': '',
      'Cut': '',
      'Polish': '',
      'Symmetry': '',
      'Fluore': '',
      'Rap': '',
      'Kapan Dis': '',
      'Kapan Dcaret': '',
      'Kapan NetD': '',
      '-1.5': '',
      '': '',
      'Market Dis': '',
      'Market Dcaret': '',
      'Market NetD': '',
      '-1.5 ': '',
      ' ': '',
      '  ': '',
      '   ': '',
      'sAVGDays': ''
    });
    this.excelFile.push({
      'Stone No': '',
      'Shape': '',
      'Size': '=SUM(C2:C' + i + ')',
      'Color': '',
      'Clarity': '',
      'Cut': '',
      'Polish': '',
      'Symmetry': '',
      'Fluore': '',
      'Rap': '',
      'Kapan Dis': '',
      'Kapan Dcaret': '',
      'Kapan NetD': '=SUM(M2:M' + i + ')',
      '-1.5': '=SUM(N2:N' + i + ')',
      '': '',
      'Market Dis': '',
      'Market Dcaret': '',
      'Market NetD': '=SUM(R2:R' + i + ')',
      '-1.5 ': '=SUM(S2:S' + i + ')',
      ' ': '',
      '  ': '=SUM(U2:U' + i + ')',
      '   ': '',
      'sAVGDays': '=AVERAGE(W2:W' + i + ')'
    });
    this.excelFile.push({
      'Stone No': '',
      'Shape': '',
      'Size': '',
      'Color': '',
      'Clarity': '',
      'Cut': '',
      'Polish': '',
      'Symmetry': '',
      'Fluore': '',
      'Rap': '',
      'Kapan Dis': '',
      'Kapan Dcaret': '',
      'Kapan NetD': '',
      '-1.5': '',
      '': '',
      'Market Dis': '',
      'Market Dcaret': '',
      'Market NetD': '',
      '-1.5 ': '',
      ' ': '',
      '  ': '',
      '   ': '',
      'sAVGDays': ''
    });
    this.excelFile.push({
      'Stone No': '',
      'Shape': '',
      'Size': '',
      'Color': '',
      'Clarity': '',
      'Cut': '',
      'Polish': '',
      'Symmetry': '',
      'Fluore': '',
      'Rap': '',
      'Kapan Dis': '',
      'Kapan Dcaret': 'Avg Dcaret',
      'Kapan NetD': '=M' + (i + 1) + '/C' + (i + 1),
      '-1.5': '=N' + (i + 1) + '/C' + (i + 1),
      '': '',
      'Market Dis': '',
      'Market Dcaret': 'Avg Dcaret',
      'Market NetD': '=R' + (i + 1) + '/C' + (i + 1),
      '-1.5 ': '=S' + (i + 1) + '/C' + (i + 1),
      ' ': '',
      '  ': '',
      '   ': '',
      'sAVGDays': ''
    });
    this.excelFile.push({
      'Stone No': '',
      'Shape': '',
      'Size': '',
      'Color': '',
      'Clarity': '',
      'Cut': '',
      'Polish': '',
      'Symmetry': '',
      'Fluore': '',
      'Rap': '',
      'Kapan Dis': '',
      'Kapan Dcaret': 'Avg Disc',
      'Kapan NetD': '=M' + (i + 1) + '/U' + (i + 1) + '*100-100',
      '-1.5': '=N' + (i + 1) + '/U' + (i + 1) + '*100-100',
      '': '',
      'Market Dis': '',
      'Market Dcaret': 'Avg Disc',
      'Market NetD': '=R' + (i + 1) + '/U' + (i + 1) + '*100-100',
      '-1.5 ': '=S' + (i + 1) + '/U' + (i + 1) + '*100-100',
      ' ': '',
      '  ': '',
      '   ': '',
      'sAVGDays': ''
    });
    this.excelFile.push({
      'Stone No': '',
      'Shape': '',
      'Size': '',
      'Color': '',
      'Clarity': '',
      'Cut': '',
      'Polish': '',
      'Symmetry': '',
      'Fluore': '',
      'Rap': '',
      'Kapan Dis': '',
      'Kapan Dcaret': 'Diff. Kapan',
      'Kapan NetD': '=M' + (i + 4) + '-R' + (i + 4) + '',
      '-1.5': '=N' + (i + 4) + '-S' + (i + 4) + '',
      '': '',
      'Market Dis': '',
      'Market Dcaret': '',
      'Market NetD': '',
      '-1.5 ': '',
      ' ': '',
      '  ': '',
      '   ': '',
      'sAVGDays': ''
    });
    this.excelFile.push({
      'Stone No': '',
      'Shape': '',
      'Size': '',
      'Color': '',
      'Clarity': '',
      'Cut': '',
      'Polish': '',
      'Symmetry': '',
      'Fluore': '',
      'Rap': '',
      'Kapan Dis': '',
      'Kapan Dcaret': 'Avg Days',
      'Kapan NetD': '=W' + (i + 1),
      '-1.5': '',
      '': '',
      'Market Dis': '',
      'Market Dcaret': '',
      'Market NetD': '',
      '-1.5 ': '',
      ' ': '',
      '  ': '',
      '   ': '',
      'sAVGDays': ''
    });
  }
  //#endregion

}

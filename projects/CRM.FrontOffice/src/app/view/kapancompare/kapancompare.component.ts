import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { MasterConfig } from 'shared/enitites';
import { AlertdialogService } from 'shared/views';
import { CompareSummary, KapanCompare, KapanCompareFilter, KapanFilterData, WeightRange } from '../../businessobjects';
import { InventoryService, KapanCompareService, MasterConfigService } from '../../services';

@Component({
  selector: 'app-kapancompare',
  templateUrl: './kapancompare.component.html',
  styleUrls: [
    './kapancompare.component.css'
  ]
})
export class KapancompareComponent implements OnInit {
  
  public kapanList: string[] = new Array<string>();
  public masterConfigList!: MasterConfig;
  public colorList: string[] = new Array<string>();
  public clarityList: string[] = new Array<string>();
  public cpsList: string[] = new Array<string>();
  public fluoList: string[] = new Array<string>();
  public kapan1Summary: CompareSummary = new CompareSummary();
  public kapan2Summary: CompareSummary = new CompareSummary();
  public weightRanges: WeightRange[] = new Array<WeightRange>();
  public kapanFilter: KapanCompareFilter = new KapanCompareFilter();
  public compareRes: KapanFilterData[] = new Array<KapanFilterData>();
  public colorCompare: KapanCompare[] = new Array<KapanCompare>();
  public clarityCompare: KapanCompare[] = new Array<KapanCompare>();
  public cpsCompare: KapanCompare[] = new Array<KapanCompare>();
  public fluoCompare: KapanCompare[] = new Array<KapanCompare>();

  constructor(private alertDialogService: AlertdialogService,
    private spinnerService: NgxSpinnerService,
    private masterConfigService: MasterConfigService,
    private inventoryService: InventoryService,
    private kapanCompareService: KapanCompareService) { }

  async ngOnInit() {
    await this.loadDefaultData();
  }

  public async loadDefaultData() {
    try {
      this.spinnerService.show();
      this.kapanList = await this.inventoryService.getOrgKapanList();
      this.masterConfigList = await this.masterConfigService.getAllMasterConfig();
      if (this.masterConfigList) {
        this.colorList = this.masterConfigList.colors.map(c => c.name);
        this.clarityList = this.masterConfigList.clarities.map(c => c.name);
        this.cpsList = this.masterConfigList.cps.map(c => c.name);
        this.fluoList = this.masterConfigList.fluorescence.map(c => c.name);
      }

      this.weightRanges = [{ minWeight: 0.17, maxWeight: 0.29 },
      { minWeight: 0.30, maxWeight: 0.39 },
      { minWeight: 0.40, maxWeight: 0.49 },
      { minWeight: 0.50, maxWeight: 0.59 },
      { minWeight: 0.60, maxWeight: 0.69 },
      { minWeight: 0.70, maxWeight: 0.79 },
      { minWeight: 0.80, maxWeight: 0.89 },
      { minWeight: 0.90, maxWeight: 0.99 },
      { minWeight: 1.00, maxWeight: 1.49 },
      { minWeight: 1.50, maxWeight: 1.99 },
      { minWeight: 2.00, maxWeight: 2.49 },
      { minWeight: 2.50, maxWeight: 2.99 },
      { minWeight: 3.00, maxWeight: 3.49 },
      { minWeight: 3.50, maxWeight: 3.99 },
      { minWeight: 4.00, maxWeight: 4.49 },
      { minWeight: 4.50, maxWeight: 4.99 },
      { minWeight: 5.00, maxWeight: 5.49 },
      { minWeight: 5.50, maxWeight: 5.99 }]
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.alertDialogService.show(error);
      this.spinnerService.hide();
    }
  }

  

  public async filterBySearch() {
    try {
      if (this.kapanFilter.kapanName1 && this.kapanFilter.kapanName2) {
        this.spinnerService.show();
        this.compareRes = await this.kapanCompareService.getKapanCompareData(this.kapanFilter);

        this.setColorRecords();
        this.setClarityRecords();
        this.setCPSRecords();
        this.setFluoRecords();

        let kSummary1 = this.compareRes.find(c => c.kapanName == this.kapanFilter.kapanName1);
        if (kSummary1)
          this.kapan1Summary = kSummary1.summaryDetail;

        let kSummary2 = this.compareRes.find(c => c.kapanName == this.kapanFilter.kapanName2);
        if (kSummary2)
          this.kapan2Summary = kSummary2.summaryDetail;

        this.spinnerService.hide();
      }
      else
        this.compareRes = new Array<KapanFilterData>();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show('Something went wrong, Try again later!');
    }
  }

  public setColorRecords() {
    try {
      if (this.compareRes && this.compareRes.length > 0 && this.masterConfigList && this.masterConfigList.colors.length > 0) {
        this.colorCompare = new Array<KapanCompare>();
        for (let i = 0; i < this.masterConfigList.colors.length; i++) {
          let color = this.masterConfigList.colors[i].name;
          if (color != null) {
            for (let j = 0; j < this.compareRes.length; j++) {
              let kapanData = this.compareRes[j]

              for (let k = 0; k < this.weightRanges.length; k++) {
                let wR = this.weightRanges[k];
                let tempCmp = new KapanCompare();
                tempCmp.kapanName = kapanData.kapanName;
                tempCmp.name = color;
                tempCmp.weightRange = wR.minWeight + "-" + wR.maxWeight;
                tempCmp.totalWeight = kapanData.diamondDetails.reduce((ty, u) => ty + u.weight, 0);

                tempCmp.weight = kapanData.diamondDetails.filter(c => c.color == color && ((wR.minWeight ? wR.minWeight : 0) <= c.weight && (wR.maxWeight ? wR.maxWeight : 0) >= c.weight)).reduce((ty, u) => ty + u.weight, 0);
                tempCmp.percentage = Number((tempCmp.weight / tempCmp.totalWeight * 100).toFixed(2));
                this.colorCompare.push(tempCmp);
              }
            }
          }
        }
      }
      else
        this.alertDialogService.show('Please select Kapan first!');
    }
    catch (error: any) {
      this.alertDialogService.show(error);
      this.spinnerService.hide();
    }
  }

  public setClarityRecords() {
    try {
      if (this.compareRes && this.compareRes.length > 0 && this.masterConfigList && this.masterConfigList.clarities.length > 0) {
        this.clarityCompare = new Array<KapanCompare>();
        for (let i = 0; i < this.masterConfigList.clarities.length; i++) {
          let clarity = this.masterConfigList.clarities[i].name;
          if (clarity != null) {
            for (let j = 0; j < this.compareRes.length; j++) {
              let kapanData = this.compareRes[j]

              for (let k = 0; k < this.weightRanges.length; k++) {
                let wR = this.weightRanges[k];
                let tempCmp = new KapanCompare();
                tempCmp.kapanName = kapanData.kapanName;
                tempCmp.name = clarity;
                tempCmp.weightRange = wR.minWeight + "-" + wR.maxWeight;
                tempCmp.totalWeight = kapanData.diamondDetails.reduce((ty, u) => ty + u.weight, 0);

                tempCmp.weight = kapanData.diamondDetails.filter(c => c.clarity == clarity && ((wR.minWeight ? wR.minWeight : 0) <= c.weight && (wR.maxWeight ? wR.maxWeight : 0) >= c.weight)).reduce((ty, u) => ty + u.weight, 0);
                tempCmp.percentage = Number((tempCmp.weight / tempCmp.totalWeight * 100).toFixed(2));
                this.clarityCompare.push(tempCmp);
              }
            }
          }
        }
      }
      else
        this.alertDialogService.show('Please select Kapan first!');
    }
    catch (error: any) {
      this.alertDialogService.show(error);
      this.spinnerService.hide();
    }
  }

  public setCPSRecords() {
    try {
      if (this.compareRes && this.compareRes.length > 0 && this.masterConfigList && this.masterConfigList.cps.length > 0) {
        this.cpsCompare = new Array<KapanCompare>();
        for (let i = 0; i < this.masterConfigList.cps.length; i++) {
          let cps = this.masterConfigList.cps[i].name;
          if (cps != null) {
            for (let j = 0; j < this.compareRes.length; j++) {
              let kapanData = this.compareRes[j]

              for (let k = 0; k < this.weightRanges.length; k++) {
                let wR = this.weightRanges[k];
                let tempCmp = new KapanCompare();
                tempCmp.kapanName = kapanData.kapanName;
                tempCmp.name = cps;
                tempCmp.weightRange = wR.minWeight + "-" + wR.maxWeight;
                tempCmp.totalWeight = kapanData.diamondDetails.reduce((ty, u) => ty + u.weight, 0);

                tempCmp.weight = kapanData.diamondDetails.filter(c => c.cps == cps && ((wR.minWeight ? wR.minWeight : 0) <= c.weight && (wR.maxWeight ? wR.maxWeight : 0) >= c.weight)).reduce((ty, u) => ty + u.weight, 0);
                tempCmp.percentage = Number((tempCmp.weight / tempCmp.totalWeight * 100).toFixed(2));
                this.cpsCompare.push(tempCmp);
              }
            }
          }
        }
      }
      else
        this.alertDialogService.show('Please select Kapan first!');
    }
    catch (error: any) {
      this.alertDialogService.show(error);
      this.spinnerService.hide();
    }
  }

  public setFluoRecords() {
    try {
      if (this.compareRes && this.compareRes.length > 0 && this.masterConfigList && this.masterConfigList.fluorescence.length > 0) {
        this.fluoCompare = new Array<KapanCompare>();
        for (let i = 0; i < this.masterConfigList.fluorescence.length; i++) {
          let fluo = this.masterConfigList.fluorescence[i].name;
          if (fluo != null) {
            for (let j = 0; j < this.compareRes.length; j++) {
              let kapanData = this.compareRes[j]

              for (let k = 0; k < this.weightRanges.length; k++) {
                let wR = this.weightRanges[k];
                let tempCmp = new KapanCompare();
                tempCmp.kapanName = kapanData.kapanName;
                tempCmp.name = fluo;
                tempCmp.weightRange = wR.minWeight + "-" + wR.maxWeight;
                tempCmp.totalWeight = kapanData.diamondDetails.reduce((ty, u) => ty + u.weight, 0);

                tempCmp.weight = kapanData.diamondDetails.filter(c => c.fluorescence == fluo && ((wR.minWeight ? wR.minWeight : 0) <= c.weight && (wR.maxWeight ? wR.maxWeight : 0) >= c.weight)).reduce((ty, u) => ty + u.weight, 0);
                tempCmp.percentage = Number((tempCmp.weight / tempCmp.totalWeight * 100).toFixed(2));
                this.fluoCompare.push(tempCmp);
              }
            }
          }
        }
      }
      else
        this.alertDialogService.show('Please select Kapan first!');
    }
    catch (error: any) {
      this.alertDialogService.show(error);
      this.spinnerService.hide();
    }
  }

  public getVal(prop: string, name: string, kapanName: string, weightRange: string) {
    if (name && kapanName && weightRange) {
      if (prop == 'color' && this.colorCompare.some(c => c.name == name && c.kapanName == kapanName && c.weightRange == weightRange))
        return (this.colorCompare.find(c => c.name == name && c.kapanName == kapanName && c.weightRange == weightRange)?.percentage == 0) ? '' : this.colorCompare.find(c => c.name == name && c.kapanName == kapanName && c.weightRange == weightRange)?.percentage;
      else if (prop == 'clarity' && this.clarityCompare.some(c => c.name == name && c.kapanName == kapanName && c.weightRange == weightRange))
        return (this.clarityCompare.find(c => c.name == name && c.kapanName == kapanName && c.weightRange == weightRange)?.percentage == 0) ? '' : this.clarityCompare.find(c => c.name == name && c.kapanName == kapanName && c.weightRange == weightRange)?.percentage;
      else if (prop == 'cps' && this.cpsCompare.some(c => c.name == name && c.kapanName == kapanName && c.weightRange == weightRange))
        return (this.cpsCompare.find(c => c.name == name && c.kapanName == kapanName && c.weightRange == weightRange)?.percentage == 0) ? '' : this.cpsCompare.find(c => c.name == name && c.kapanName == kapanName && c.weightRange == weightRange)?.percentage;
      else if (prop == 'fluo' && this.fluoCompare.some(c => c.name == name && c.kapanName == kapanName && c.weightRange == weightRange))
        return (this.fluoCompare.find(c => c.name == name && c.kapanName == kapanName && c.weightRange == weightRange)?.percentage == 0) ? '' : this.fluoCompare.find(c => c.name == name && c.kapanName == kapanName && c.weightRange == weightRange)?.percentage;
      else
        return "";
    }
    else
      return "";
  }

  public getTooltipVal(prop: string, name: string, kapanName: string, weightRange: string) {
    if (name && kapanName && weightRange) {
      if (prop == 'color' && this.colorCompare.some(c => c.name == name && c.kapanName == kapanName && c.weightRange == weightRange))
        return (this.colorCompare.find(c => c.name == name && c.kapanName == kapanName && c.weightRange == weightRange)?.weight == 0) ? '' : Number(this.colorCompare.find(c => c.name == name && c.kapanName == kapanName && c.weightRange == weightRange)?.weight.toFixed(2));
      else if (prop == 'clarity' && this.clarityCompare.some(c => c.name == name && c.kapanName == kapanName && c.weightRange == weightRange))
        return (this.clarityCompare.find(c => c.name == name && c.kapanName == kapanName && c.weightRange == weightRange)?.weight == 0) ? '' : Number(this.clarityCompare.find(c => c.name == name && c.kapanName == kapanName && c.weightRange == weightRange)?.weight.toFixed(2));
      else if (prop == 'cps' && this.cpsCompare.some(c => c.name == name && c.kapanName == kapanName && c.weightRange == weightRange))
        return (this.cpsCompare.find(c => c.name == name && c.kapanName == kapanName && c.weightRange == weightRange)?.weight == 0) ? '' : Number(this.cpsCompare.find(c => c.name == name && c.kapanName == kapanName && c.weightRange == weightRange)?.weight.toFixed(2));
      else if (prop == 'fluo' && this.fluoCompare.some(c => c.name == name && c.kapanName == kapanName && c.weightRange == weightRange))
        return (this.fluoCompare.find(c => c.name == name && c.kapanName == kapanName && c.weightRange == weightRange)?.weight == 0) ? '' : Number(this.fluoCompare.find(c => c.name == name && c.kapanName == kapanName && c.weightRange == weightRange)?.weight.toFixed(2));
      else
        return "";
    }
    else
      return "";
  }

  public getRowTotalVal(prop: string, kapanName: string, weightRange: string) {
    if (kapanName && weightRange) {
      if (prop == 'color' && this.colorCompare.filter(c => c.kapanName == kapanName && c.weightRange == weightRange).length > 0) {
        let records = this.colorCompare.filter(c => c.kapanName == kapanName && c.weightRange == weightRange);
        let perc = records.reduce((ty, u) => ty + u.weight, 0) / records[0].totalWeight * 100;
        return (perc == 0) ? '' : Number(perc.toFixed(2)) + "%";
      }
      else if (prop == 'clarity' && this.clarityCompare.filter(c => c.kapanName == kapanName && c.weightRange == weightRange).length > 0) {
        let records = this.clarityCompare.filter(c => c.kapanName == kapanName && c.weightRange == weightRange);
        let perc = records.reduce((ty, u) => ty + u.weight, 0) / records[0].totalWeight * 100;
        return (perc == 0) ? '' : Number(perc.toFixed(2)) + "%";
      }
      else if (prop == 'cps' && this.cpsCompare.filter(c => c.kapanName == kapanName && c.weightRange == weightRange).length > 0) {
        let records = this.cpsCompare.filter(c => c.kapanName == kapanName && c.weightRange == weightRange);
        let perc = records.reduce((ty, u) => ty + u.weight, 0) / records[0].totalWeight * 100;
        return (perc == 0) ? '' : Number(perc.toFixed(2)) + "%";
      }
      else if (prop == 'fluo' && this.fluoCompare.filter(c => c.kapanName == kapanName && c.weightRange == weightRange).length > 0) {
        let records = this.fluoCompare.filter(c => c.kapanName == kapanName && c.weightRange == weightRange);
        let perc = records.reduce((ty, u) => ty + u.weight, 0) / records[0].totalWeight * 100;
        return (perc == 0) ? '' : Number(perc.toFixed(2)) + "%";
      }
      else
        return "";
    }
    else
      return "";
  }

  public getRowTotalTooltipVal(prop: string, kapanName: string, weightRange: string) {
    if (kapanName && weightRange) {
      if (prop == 'color' && this.colorCompare.filter(c => c.kapanName == kapanName && c.weightRange == weightRange).length > 0) {
        let records = this.colorCompare.filter(c => c.kapanName == kapanName && c.weightRange == weightRange);
        let weight = records.reduce((ty, u) => ty + u.weight, 0);
        return (weight == 0) ? '' : Number(weight.toFixed(2));
      }
      else if (prop == 'clarity' && this.clarityCompare.filter(c => c.kapanName == kapanName && c.weightRange == weightRange).length > 0) {
        let records = this.clarityCompare.filter(c => c.kapanName == kapanName && c.weightRange == weightRange);
        let weight = records.reduce((ty, u) => ty + u.weight, 0);
        return (weight == 0) ? '' : Number(weight.toFixed(2));
      }
      else if (prop == 'cps' && this.cpsCompare.filter(c => c.kapanName == kapanName && c.weightRange == weightRange).length > 0) {
        let records = this.cpsCompare.filter(c => c.kapanName == kapanName && c.weightRange == weightRange);
        let weight = records.reduce((ty, u) => ty + u.weight, 0);
        return (weight == 0) ? '' : Number(weight.toFixed(2));
      }
      else if (prop == 'fluo' && this.fluoCompare.filter(c => c.kapanName == kapanName && c.weightRange == weightRange).length > 0) {
        let records = this.fluoCompare.filter(c => c.kapanName == kapanName && c.weightRange == weightRange);
        let weight = records.reduce((ty, u) => ty + u.weight, 0);
        return (weight == 0) ? '' : Number(weight.toFixed(2));
      }
      else
        return "";
    }
    else
      return "";
  }

  public getColumnTotalVal(prop: string, name: string, kapanName: string) {
    if (name && kapanName) {
      if (prop == 'color' && this.colorCompare.filter(c => c.kapanName == kapanName && c.name == name).length > 0) {
        let records = this.colorCompare.filter(c => c.kapanName == kapanName && c.name == name);
        let perc = records.reduce((ty, u) => ty + u.weight, 0) / records[0].totalWeight * 100;
        return (perc == 0) ? '' : Number(perc.toFixed(2)) + "%";
      }
      else if (prop == 'clarity' && this.clarityCompare.filter(c => c.kapanName == kapanName && c.name == name).length > 0) {
        let records = this.clarityCompare.filter(c => c.kapanName == kapanName && c.name == name);
        let perc = records.reduce((ty, u) => ty + u.weight, 0) / records[0].totalWeight * 100;
        return (perc == 0) ? '' : Number(perc.toFixed(2)) + "%";
      }
      else if (prop == 'cps' && this.cpsCompare.filter(c => c.kapanName == kapanName && c.name == name).length > 0) {
        let records = this.cpsCompare.filter(c => c.kapanName == kapanName && c.name == name);
        let perc = records.reduce((ty, u) => ty + u.weight, 0) / records[0].totalWeight * 100;
        return (perc == 0) ? '' : Number(perc.toFixed(2)) + "%";
      }
      else if (prop == 'fluo' && this.fluoCompare.filter(c => c.kapanName == kapanName && c.name == name).length > 0) {
        let records = this.fluoCompare.filter(c => c.kapanName == kapanName && c.name == name);
        let perc = records.reduce((ty, u) => ty + u.weight, 0) / records[0].totalWeight * 100;
        return (perc == 0) ? '' : Number(perc.toFixed(2)) + "%";
      }
      else
        return "";
    }
    else
      return "";
  }

  public getColumnTotalTooltipVal(prop: string, name: string, kapanName: string) {
    if (name && kapanName) {
      if (prop == 'color' && this.colorCompare.filter(c => c.kapanName == kapanName && c.name == name).length > 0) {
        let records = this.colorCompare.filter(c => c.kapanName == kapanName && c.name == name);
        let weight = records.reduce((ty, u) => ty + u.weight, 0);
        return (weight == 0) ? '' : Number(weight.toFixed(2));
      }
      else if (prop == 'clarity' && this.clarityCompare.filter(c => c.kapanName == kapanName && c.name == name).length > 0) {
        let records = this.clarityCompare.filter(c => c.kapanName == kapanName && c.name == name);
        let weight = records.reduce((ty, u) => ty + u.weight, 0);
        return (weight == 0) ? '' : Number(weight.toFixed(2));
      }
      else if (prop == 'cps' && this.cpsCompare.filter(c => c.kapanName == kapanName && c.name == name).length > 0) {
        let records = this.cpsCompare.filter(c => c.kapanName == kapanName && c.name == name);
        let weight = records.reduce((ty, u) => ty + u.weight, 0);
        return (weight == 0) ? '' : Number(weight.toFixed(2));
      }
      else if (prop == 'fluo' && this.fluoCompare.filter(c => c.kapanName == kapanName && c.name == name).length > 0) {
        let records = this.fluoCompare.filter(c => c.kapanName == kapanName && c.name == name);
        let weight = records.reduce((ty, u) => ty + u.weight, 0);
        return (weight == 0) ? '' : Number(weight.toFixed(2));
      }
      else
        return "";
    }
    else
      return "";
  }
}

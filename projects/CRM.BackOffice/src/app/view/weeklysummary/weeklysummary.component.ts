import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { SelectableSettings } from '@progress/kendo-angular-grid';
import { NgxSpinnerService } from 'ngx-spinner';
import { GridDetailConfig } from 'shared/businessobjects';
import { fxCredential, GridConfig, GridMasterConfig } from 'shared/enitites';
import { AppPreloadService, ConfigService, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { DateSearchFilter, Weeklysummarydropdowndata } from '../../businessobjects';
import { SummaryDNorm, WeeklySummary } from '../../entities';
import { GridPropertiesService, WeeklysummaryService } from '../../services';

@Component({
  selector: 'app-weeklysummary',
  templateUrl: './weeklysummary.component.html',
  styleUrls: ['./weeklysummary.component.css']
})
export class WeeklysummaryComponent implements OnInit {

  @ViewChild("popup", { read: ElementRef }) public popup!: ElementRef;

  public dateFilter: DateSearchFilter = new DateSearchFilter();
  public weeklySummary: WeeklySummary = new WeeklySummary();
  public weeklySummaryDropDownList: Weeklysummarydropdowndata[] = new Array<Weeklysummarydropdowndata>();
  public selectedWeeklySummary!: string
  public selectableSettings: SelectableSettings = { mode: 'multiple', checkboxOnly: true };
  public mySelection: string[] = [];
  public fields!: GridDetailConfig[];
  public sumPSPcs: number = 0;
  public sumPSWt: number = 0;
  public sumPSAmt: number = 0;
  public sumArrivalPcs: number = 0;
  public sumArrivalWt: number = 0;
  public sumArrivalAmt: number = 0;
  public sumTotalPcs: number = 0;
  public sumTotalWt: number = 0;
  public sumTotalAmt: number = 0;

  public sumInwardPcs: number = 0;
  public sumInwardWt: number = 0;
  public sumInwardAmt: number = 0;

  public sumLabPcs: number = 0;
  public sumLabWt: number = 0;
  public sumLabAmt: number = 0;

  public sumLDPcs: number = 0;
  public sumLDWt: number = 0;
  public sumLDAmt: number = 0;
  public sumITPcs: number = 0;
  public sumITWt: number = 0;
  public sumITAmt: number = 0;

  public sumMemoPcs: number = 0;
  public sumMemoWt: number = 0;
  public sumMemoAmt: number = 0;

  public sumStockPcs: number = 0;
  public sumStockWt: number = 0;
  public sumStockAmt: number = 0;

  public sumOHPcs: number = 0;
  public sumOHWt: number = 0;
  public sumOHAmt: number = 0;

  public sumOrderPcs: number = 0;
  public sumOrderWt: number = 0;
  public sumOrderAmt: number = 0;
  public sumDeliPcs: number = 0;
  public sumDeliWt: number = 0;
  public sumDeliAmt: number = 0;

  public sumInwRtnPcs: number = 0;
  public sumInwRtnWt: number = 0;
  public sumInwRtnAmt: number = 0;

  public sumBalancePcs: number = 0;
  public sumBalanceWt: number = 0;
  public sumBalanceAmt: number = 0;

  public sumErrorPsc: number = 0;
  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains'
  };

  public gridMasterConfigResponse!: GridMasterConfig;
  public isGridConfig: boolean = false;
  public gridConfig!: GridConfig;
  private fxCredential!: fxCredential;
  public excelFile: any[] = [];

  public isViewButtons: boolean = false;
  public showKapandetail = false;
  public kapanDetail: SummaryDNorm = new SummaryDNorm();

  constructor(private alertDialogService: AlertdialogService,
    private spinnerService: NgxSpinnerService,
    private weeklysummaryService: WeeklysummaryService,
    private gridPropertiesService: GridPropertiesService,
    private configService: ConfigService,
    public utilityService: UtilityService,
    public router: Router,
    public appPreloadService: AppPreloadService) { }

  async ngOnInit() {
    this.fxCredential = await this.appPreloadService.fetchFxCredentials();
    if (!this.fxCredential)
      this.router.navigate(["login"]);

    if (this.fxCredential && this.fxCredential.origin && (this.fxCredential.origin.toLowerCase() == 'admin'))
      this.isViewButtons = true;

    this.fields = await this.gridPropertiesService.getWeeklySummaryGrid();
    await this.getPreviousSummaries();
  }

  public async getPreviousSummaries() {
    try {
      this.spinnerService.show();
      this.weeklySummaryDropDownList = await this.weeklysummaryService.getPrevSummary();
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error);
    }
  }

  public async getPrevWeeklySummary(id: string) {
    try {
      if (id) {
        this.spinnerService.show();
        this.weeklySummary = await this.weeklysummaryService.getSummaryById(id);
        this.getTotalFooterItems();
        this.spinnerService.hide();
      }
    } catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(error);
    }
  }

  public async getSummary() {
    try {
      if (this.dateFilter && this.dateFilter.startDate && this.dateFilter.endDate) {
        this.dateFilter.startDate = this.utilityService.setUTCDateFilter(this.dateFilter.startDate);
        this.dateFilter.endDate = this.utilityService.setUTCDateFilter(this.dateFilter.endDate);
        this.spinnerService.show();
        let isExist = await this.weeklysummaryService.checkSummary(this.dateFilter);
        if (!isExist) {
          this.weeklySummary = new WeeklySummary();
          this.weeklySummary = await this.weeklysummaryService.getWeeklySummary(this.dateFilter);
          this.getTotalFooterItems();
          this.selectedWeeklySummary = "";
        }
        else
          this.alertDialogService.show('Already added summary on this dates!');
        this.spinnerService.hide();
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error);
    }
  }

  public async saveSummary() {
    try {
      if (this.weeklySummary && this.weeklySummary.startDate && this.weeklySummary.endDate && this.weeklySummary.summary && this.weeklySummary.summary.length > 0) {
        this.alertDialogService.ConfirmYesNo("Are you sure you want to save Summary No : " + this.weeklySummary.summaryNo, "Weekly Summary")
          .subscribe(async (res: any) => {
            if (res.flag) {
              this.spinnerService.show();
              var id = await this.weeklysummaryService.insertSummary(this.weeklySummary);
              if (id) {
                this.getPreviousSummaries();
                this.weeklySummary.id = id;
                this.selectedWeeklySummary = id;
                this.alertDialogService.show('Successfully save summary');
              }
              else
                this.alertDialogService.show('Something went wrong. Try again!');
              this.spinnerService.hide();
            }
          });
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error);
    }
  }

  public async confirmKapan() {
    try {
      if (this.mySelection.length > 0) {
        this.spinnerService.show();
        var flag = await this.weeklysummaryService.confirmMultiKapan(this.weeklySummary.id, this.mySelection);
        if (flag) {
          let kapn = this.weeklySummary.summary.filter(c => this.mySelection.includes(c.kapan))
          if (kapn.length > 0)
            kapn.forEach(z => { z.isConfirm = true; });

          this.spinnerService.hide();
          this.mySelection = [];
        }
        else {
          this.alertDialogService.show('Something went wrong. Try again!');
          this.spinnerService.hide();
        }

      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error);
    }
  }

  public getTotalFooterItems() {
    try {
      if (this.weeklySummary && this.weeklySummary.summary) {
        this.sumPSPcs = this.weeklySummary.summary.reduce((ty, u) => ty + u.previousSummary.pcsCount, 0);
        this.sumPSWt = this.weeklySummary.summary.reduce((ty, u) => ty + u.previousSummary.weight, 0);
        this.sumPSAmt = this.weeklySummary.summary.reduce((ty, u) => ty + u.previousSummary.amt, 0);

        this.sumArrivalPcs = this.weeklySummary.summary.reduce((ty, u) => ty + u.arrival.pcsCount, 0);
        this.sumArrivalWt = this.weeklySummary.summary.reduce((ty, u) => ty + u.arrival.weight, 0);
        this.sumArrivalAmt = this.weeklySummary.summary.reduce((ty, u) => ty + u.arrival.amt, 0);

        this.sumTotalPcs = this.weeklySummary.summary.reduce((ty, u) => ty + u.total.pcsCount, 0);
        this.sumTotalWt = this.weeklySummary.summary.reduce((ty, u) => ty + u.total.weight, 0);
        this.sumTotalAmt = this.weeklySummary.summary.reduce((ty, u) => ty + u.total.amt, 0);

        this.sumInwardPcs = this.weeklySummary.summary.reduce((ty, u) => ty + u.inwardMemo.pcsCount, 0);
        this.sumInwardWt = this.weeklySummary.summary.reduce((ty, u) => ty + u.inwardMemo.weight, 0);
        this.sumInwardAmt = this.weeklySummary.summary.reduce((ty, u) => ty + u.inwardMemo.amt, 0);
        this.sumLabPcs = this.weeklySummary.summary.reduce((ty, u) => ty + u.lab.pcsCount, 0);
        this.sumLabWt = this.weeklySummary.summary.reduce((ty, u) => ty + u.lab.weight, 0);
        this.sumLabAmt = this.weeklySummary.summary.reduce((ty, u) => ty + u.lab.amt, 0);
        // this.sumLDPcs = this.weeklySummary.summary.reduce((ty, u) => ty + u.labDiff.pcsCount, 0);
        this.sumLDWt = this.weeklySummary.summary.reduce((ty, u) => ty + u.labDiff.weight, 0);
        // this.sumLDAmt = this.weeklySummary.summary.reduce((ty, u) => ty + u.labDiff.amt, 0);
        this.sumITPcs = this.weeklySummary.summary.reduce((ty, u) => ty + u.inTransit.pcsCount, 0);
        this.sumITWt = this.weeklySummary.summary.reduce((ty, u) => ty + u.inTransit.weight, 0);
        this.sumITAmt = this.weeklySummary.summary.reduce((ty, u) => ty + u.inTransit.amt, 0);

        this.sumMemoPcs = this.weeklySummary.summary.reduce((ty, u) => ty + u.memo.pcsCount, 0);
        this.sumMemoWt = this.weeklySummary.summary.reduce((ty, u) => ty + u.memo.weight, 0);
        this.sumMemoAmt = this.weeklySummary.summary.reduce((ty, u) => ty + u.memo.amt, 0);
        this.sumStockPcs = this.weeklySummary.summary.reduce((ty, u) => ty + u.stock.pcsCount, 0);
        this.sumStockWt = this.weeklySummary.summary.reduce((ty, u) => ty + u.stock.weight, 0);
        this.sumStockAmt = this.weeklySummary.summary.reduce((ty, u) => ty + u.stock.amt, 0);

        this.sumOrderPcs = this.weeklySummary.summary.reduce((ty, u) => ty + u.order.pcsCount, 0);
        this.sumOrderWt = this.weeklySummary.summary.reduce((ty, u) => ty + u.order.weight, 0);
        this.sumOrderAmt = this.weeklySummary.summary.reduce((ty, u) => ty + u.order.amt, 0);
        this.sumDeliPcs = this.weeklySummary.summary.reduce((ty, u) => ty + u.delivered.pcsCount, 0);
        this.sumDeliWt = this.weeklySummary.summary.reduce((ty, u) => ty + u.delivered.weight, 0);
        this.sumDeliAmt = this.weeklySummary.summary.reduce((ty, u) => ty + u.delivered.amt, 0);

        this.sumInwRtnPcs = this.weeklySummary.summary.reduce((ty, u) => ty + u.inwardReturn.pcsCount, 0);
        this.sumInwRtnWt = this.weeklySummary.summary.reduce((ty, u) => ty + u.inwardReturn.weight, 0);
        this.sumInwRtnAmt = this.weeklySummary.summary.reduce((ty, u) => ty + u.inwardReturn.amt, 0);

        this.sumBalancePcs = this.weeklySummary.summary.reduce((ty, u) => ty + u.balance.pcsCount, 0);
        this.sumBalanceWt = this.weeklySummary.summary.reduce((ty, u) => ty + u.balance.weight, 0);
        this.sumBalanceAmt = this.weeklySummary.summary.reduce((ty, u) => ty + u.balance.amt, 0);

        this.sumErrorPsc = this.weeklySummary.summary.reduce((ty, u) => ty + u.error.pcsCount, 0);
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error);
    }
  }

  public checkDisableSummary() {
    if (this.weeklySummary && (typeof this.weeklySummary.id == 'undefined' || this.weeklySummary.id))
      return true;
    else
      return false;
  }

  //#region Grid Config
  public openGridConfigDialog(): void {
    this.isGridConfig = true;
  }

  public setNewGridConfig(gridConfig: GridConfig) {
    try {
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
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async getGridConfiguration() {
    try {
      this.spinnerService.show();
      this.gridConfig = await this.configService.getGridConfig(this.fxCredential.id, "LabIssue", "LabIssueGrid", this.gridPropertiesService.getWeeklySummaryGrid());
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
        this.gridMasterConfigResponse = await this.configService.getMasterGridConfig("LabIssue", "LabIssueGrid");
        if (this.gridMasterConfigResponse)
          this.fields = this.gridMasterConfigResponse.gridDetail;
        else
          this.fields = await this.gridPropertiesService.getWeeklySummaryGrid();
      }
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.alertDialogService.show(error);
      this.spinnerService.hide();
    }
  }
  //#endregion

  public downloadWS() {
    try {
      if (this.weeklySummary && this.weeklySummary.id) {
        this.excelFile = [];
        for (let j = 0; j < this.weeklySummary.summary.length; j++) {
          var tempObj: any = {};
          for (let i = 0; i < this.fields.length; i++) {
            let element: any = this.weeklySummary.summary[j];
            if (this.fields[i].title == "Kapan")
              tempObj[this.fields[i].title] = element[this.fields[i].propertyName];
            else {
              let propName = this.fields[i].propertyName.split(".");
              if (propName && propName.length > 0)
                tempObj[this.fields[i].title] = element[propName[0]][propName[1]];
            }
          }
          this.excelFile.push(tempObj);
        }
      }
      this.downloadAttachment();
    }
    catch (error: any) {
      this.alertDialogService.show(error);
      this.spinnerService.hide();
    }
  }

  public downloadAttachment() {
    this.spinnerService.show();
    let isExport: boolean = this.utilityService.exportAsExcelFile(this.excelFile, "Weekly Summary-" + this.weeklySummary.summaryNo);
    if (!isExport) {
      this.alertDialogService.show('File not found, Try again later');
      this.spinnerService.hide();
    } else
      this.spinnerService.hide();
  }

  public openKapanDetail(kapan: SummaryDNorm) {
    this.kapanDetail = kapan;
    this.showKapandetail = true;
  }

  public closeKapanDetail() {
    this.kapanDetail = new SummaryDNorm();
    this.showKapandetail = false;
  }

  public copyKapanStones(stones: string[]) {
    if (stones.length > 0) {
      let stoneIdString = stones.join(' ');
      navigator.clipboard.writeText(stoneIdString);
      this.utilityService.showNotification(`Copy to clipboard successfully!`);
    }
  }
}

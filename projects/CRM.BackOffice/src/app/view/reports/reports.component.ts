import { Component, OnInit } from '@angular/core';
import { fxCredential } from 'shared/enitites';
import { UtilityService } from 'shared/services';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css'],
})
export class ReportsComponent implements OnInit {
  //#region List & Objects
  public fxCredentials!: fxCredential;

  public isRojmelReport: boolean = false;
  public isSalesPaymentReport: boolean = false;
  public isShowLedgerOutStandingReport: boolean = false;
  //#endregion

  constructor(
    public utilityService: UtilityService,
  ) { }

  //#region Init Data
  public async ngOnInit() {
    this.fxCredentials = JSON.parse(sessionStorage.getItem("fxCredentials") ?? '') as fxCredential;
  }
  //#endregion

  public openRojmelReportDialog() {
    this.isRojmelReport = true;
  }

  public closeRojmelReportDialog() {
    this.isRojmelReport = false;
  }

  public openSalesPaymentDialog() {
    this.isSalesPaymentReport = true;
  }

  public closeSalesPaymentDialog() {
    this.isSalesPaymentReport = false;
  }

  public openLOReportDialog() {
    this.isShowLedgerOutStandingReport = true;
  }

  public closeLOReportDialog(value: boolean) {
    this.isShowLedgerOutStandingReport = value;
  }

}

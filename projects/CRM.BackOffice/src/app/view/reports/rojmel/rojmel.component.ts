import { Component, ElementRef, EventEmitter, HostListener, OnInit, Output, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { DateRangePopupComponent } from '@progress/kendo-angular-dateinputs';
import { NgxSpinnerService } from 'ngx-spinner';
import { fxCredential } from 'shared/enitites';
import { TransactionType, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { RojmelSearchCriteria, RojmelTransaction, SaleRojmelExport } from '../../../businessobjects';
import { LedgerSummary } from '../../../entities';
import { LedgerSummaryService, TransactionService } from '../../../services';

@Component({
  selector: 'app-rojmel',
  templateUrl: './rojmel.component.html',
  styleUrls: ['./rojmel.component.css']
})
export class RojmelComponent implements OnInit {
  @Output() toggle: EventEmitter<boolean> = new EventEmitter();

  //#region Filter Data
  @ViewChild("anchor") public anchor!: ElementRef<any>;
  @ViewChild("popup", { read: DateRangePopupComponent }) public popup!: DateRangePopupComponent; public showFilterRange = false;
  public range = { start: new Date(), end: new Date() };
  //#endregion

  //#region List & Objects
  public fxCredentials!: fxCredential;

  public rojmelFilterCriteria: RojmelSearchCriteria = new RojmelSearchCriteria();

  public creditData: RojmelTransaction[] = [];
  public debitData: RojmelTransaction[] = [];
  public cashSummary: LedgerSummary[] = [];
  public bankSummary: LedgerSummary[] = [];
  public exportExcelData: Array<SaleRojmelExport> = new Array<SaleRojmelExport>();

  public cashSummaryTotal: number = 0;
  public bankSummaryTotal: number = 0;
  public listCreditCurrencyTotal: Array<{ type: string; total: number }> = [];
  public listDebitCurrencyTotal: Array<{ type: string; total: number }> = [];
  public exportFileName = "rojmel.xlsx";

  //#endregion

  constructor(
    private spinnerService: NgxSpinnerService,
    private alertDialogService: AlertdialogService,
    public utilityService: UtilityService,
    private transactionService: TransactionService,
    private ledgerSummaryService: LedgerSummaryService,
    private sanitizer: DomSanitizer,
  ) { }

  //#region Init Data
  public async ngOnInit() {
    this.fxCredentials = JSON.parse(sessionStorage.getItem("fxCredentials") ?? '') as fxCredential;
    this.dateFilterChanges();
  }
  //#endregion

  //#region Rojmel Filter
  public async filterRojmel() {
    try {
      this.spinnerService.show();
      this.clearRojmelData();
      await this.DebitRojmel();
      await this.CreditRojmel();
      await this.setExportData();
      await this.CashRojmel();
      await this.BankRojmel();
      this.exportFileName = this.fxCredentials.organization + "_" + ((this.rojmelFilterCriteria && this.rojmelFilterCriteria.fromDate) ? this.format(new Date(this.rojmelFilterCriteria.fromDate)) : '') + "_To_" + ((this.rojmelFilterCriteria && this.rojmelFilterCriteria.toDate) ? this.format(new Date(this.rojmelFilterCriteria.toDate)) : '') + ".xlsx";
      this.spinnerService.hide();

    } catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Rojmel not get, Try again later!');
    }
  }

  public clearRojmelData() {
    this.debitData = [];
    this.creditData = [];
    this.cashSummary = [];
    this.cashSummaryTotal = 0;
    this.bankSummary = [];
    this.bankSummaryTotal = 0;
  }

  public async DebitRojmel() {
    try {
      let criteria: RojmelSearchCriteria = JSON.parse(JSON.stringify(this.rojmelFilterCriteria));
      criteria.transactionType = TransactionType.Payment.toString();
      let res = await this.transactionService.getRojmel(criteria);
      if (res && res.length > 0) 
        this.debitData.push(...res);

      criteria.transactionType = TransactionType.General.toString();
      res = await this.transactionService.getRojmel(criteria);
      if (res && res.length > 0) 
        this.debitData.push(...res);

      criteria.transactionType = TransactionType.Contra.toString();
      res = await this.transactionService.getRojmel(criteria);
      if (res && res.length > 0) 
        this.debitData.push(...res);

      if (this.debitData && this.debitData.length > 0) {
        let distinctCurrency = [...new Set(this.debitData.map(item => item.toCurrency))];
        if (distinctCurrency && distinctCurrency.length > 0) {
          this.listDebitCurrencyTotal = new Array<{ type: string; total: number }>();
          distinctCurrency.forEach(type => {
            if (type) {
              let total = 0;
              this.debitData.filter(x => x.toCurrency == type).map(z => z.ccAmount).forEach(z => { total += z });
              this.listDebitCurrencyTotal.push({ type: type, total: this.utilityService.ConvertToFloatWithDecimal(total) })
            }
          })
        }
      }

    } catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Debit data not get, Try again later!');
    }
  }

  public async CreditRojmel() {
    try {
      let criteria: RojmelSearchCriteria = JSON.parse(JSON.stringify(this.rojmelFilterCriteria));
      criteria.transactionType = TransactionType.Receipt.toString();
      let res = await this.transactionService.getRojmel(criteria);
      if (res && res.length > 0) {
        this.creditData = res;
        let distinctCurrency = [...new Set(res.map(item => item.toCurrency))];
        if (distinctCurrency && distinctCurrency.length > 0) {
          this.listCreditCurrencyTotal = new Array<{ type: string; total: number }>();
          distinctCurrency.forEach(type => {
            if (type) {
              let total = 0;
              res.filter(x => x.toCurrency == type).map(z => z.ccAmount).forEach(z => { total += z });
              this.listCreditCurrencyTotal.push({ type: type, total: this.utilityService.ConvertToFloatWithDecimal(total) })
            }
          })
        }
      }
    } catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Credit data not get, Try again later!');
    }
  }



  public async CashRojmel() {
    try {
      let res = await this.ledgerSummaryService.getCashLedgerSummary();
      if (res && res.length > 0) {
        this.cashSummary = res;
        res.map(z => z.total).forEach(z => { this.cashSummaryTotal += z });
        this.cashSummaryTotal = this.utilityService.ConvertToFloatWithDecimal(this.cashSummaryTotal);
      }
    } catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Cash Summary not get, Try again later!');
    }
  }

  public async BankRojmel() {
    try {
      let res = await this.ledgerSummaryService.getBankLedgerSummary();
      if (res && res.length > 0) {
        this.bankSummary = res;
        res.map(z => z.total).forEach(z => { this.bankSummaryTotal += z });
        this.bankSummaryTotal = this.utilityService.ConvertToFloatWithDecimal(this.bankSummaryTotal);
      }
    } catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Bank Summary not get, Try again later!');
    }
  }
  //#endregion

  //#region OnChange Functions
  public dateFilterChanges() {
    this.rojmelFilterCriteria.fromDate = this.utilityService.setUTCDateFilter(this.range.start);
    this.rojmelFilterCriteria.toDate = this.utilityService.setUTCDateFilter(this.range.end);
  }

  public closeReportDialog(): void {
    this.toggle.emit();
  }
  //#endregion

  //#region Popup Close
  @HostListener("document:click", ["$event"])
  public documentClick(event: any): void {
    if (!this.contains(event.target)) {
      this.popup.toggle(false);
    }
  }

  private contains(target: any): boolean {
    let popup = document.getElementsByClassName('k-animation-container')[0] as any;
    return (
      this.anchor.nativeElement.contains(target) ||
      (popup ? popup.contains(target) : false)
    );
  }

  /* #region Export Excel section */
  public setExportData() {
    this.exportExcelData = new Array<SaleRojmelExport>();
    let lengthArray = [this.creditData.length, this.debitData.length];
    let length = (Math.max(...lengthArray)) ?? 0;

    if (length > 0) {
      for (let index = 0; index < length; index++) {
        this.exportExcelData.push({
          transactionDateCredit: ((this.creditData[index]?.transactionDate) ? this.format(new Date(this.creditData[index]?.transactionDate)) : "") ?? "",
          transactionNumberCredit: (this.creditData[index]?.transactionNumber ?? ""),
          partyNameCredit: (this.creditData[index]?.partyName ?? ""),
          toCurrencyCredit: (this.creditData[index]?.toCurrency ?? ""),
          ccAmountCredit: this.utilityService.ConvertToFloatWithDecimal((this.creditData[index]?.ccAmount) ?? 0),
          addAmountCredit: this.utilityService.ConvertToFloatWithDecimal((this.creditData[index]?.addAmount) ?? 0),
          logisticChargeCredit: this.utilityService.ConvertToFloatWithDecimal((this.creditData[index]?.logisticCharge) ?? 0),
          paymentTypeCredit: (this.creditData[index]?.paymentType ?? ""),
          cashHandlingChargeCredit: this.utilityService.ConvertToFloatWithDecimal((this.creditData[index]?.cashHandlingCharge) ?? 0),
          amountCredit: this.utilityService.ConvertToFloatWithDecimal((this.creditData[index]?.amount) ?? 0),
          expenseCredit: this.utilityService.ConvertToFloatWithDecimal((this.creditData[index]?.expense) ?? 0),
          blankSpace: "",
          transactionDateDebit: ((this.debitData[index]?.transactionDate) ? this.format(new Date(this.debitData[index]?.transactionDate)) : "") ?? "",
          transactionNumberDebit: (this.debitData[index]?.transactionNumber ?? ""),
          partyNameDebit: (this.debitData[index]?.partyName ?? ""),
          toCurrencyDebit: (this.debitData[index]?.toCurrency ?? ""),
          ccAmountDebit: this.utilityService.ConvertToFloatWithDecimal((this.debitData[index]?.ccAmount) ?? 0),
          addAmountDebit: this.utilityService.ConvertToFloatWithDecimal((this.debitData[index]?.addAmount) ?? 0),
          logisticChargeDebit: this.utilityService.ConvertToFloatWithDecimal((this.debitData[index]?.logisticCharge) ?? 0),
          paymentTypeDebit: (this.debitData[index]?.paymentType ?? ""),
          cashHandlingChargeDebit: this.utilityService.ConvertToFloatWithDecimal((this.debitData[index]?.cashHandlingCharge) ?? 0),
          amountDebit: this.utilityService.ConvertToFloatWithDecimal((this.debitData[index]?.amount) ?? 0),
          expenseDebit: this.utilityService.ConvertToFloatWithDecimal((this.debitData[index]?.expense) ?? 0),
        })
      }
    }
  }

  public format(inputDate: Date) {
    let date, month, year;

    date = new Date(inputDate).getDate();
    month = new Date(inputDate).getMonth() + 1;
    year = new Date(inputDate).getFullYear();

    date = date
      .toString()
      .padStart(2, '0');

    month = month
      .toString()
      .padStart(2, '0');

    return `${date}/${month}/${year}`;
  }

  public htmlSummaryCredit(isTotal = false) {
    let htmlString = '';
    if (this.listCreditCurrencyTotal && this.listCreditCurrencyTotal.length > 0) {
      for (let index = 0; index < this.listCreditCurrencyTotal.length; index++) {
        const element = this.listCreditCurrencyTotal[index];
        if (!isTotal)
          htmlString += `<div>` + element.type + `:</div> \r\n`;
        else
          htmlString += `\r\n<div>` + element.total + `</div>`;
      }

      return this.sanitizer.bypassSecurityTrustHtml(htmlString);
    }
    else
      return htmlString;
  }

  public htmlSummaryDebit(isTotal = false) {
    let htmlString = '';
    if (this.listDebitCurrencyTotal && this.listDebitCurrencyTotal.length > 0) {
      for (let index = 0; index < this.listDebitCurrencyTotal.length; index++) {
        const element = this.listDebitCurrencyTotal[index];
        if (!isTotal)
          htmlString += `<div>` + element.type + `:</div> \r\n`;
        else
          htmlString += `\r\n<div>` + element.total + `</div>`;
      }

      return this.sanitizer.bypassSecurityTrustHtml(htmlString);
    }
    else
      return htmlString;
  }
  /* #endregion */

  //#endregion
}

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { fxCredential } from 'shared/enitites';
import { AppPreloadService, listCurrencyType, TransactionType, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { AccountingConfig, Ledger, LedgerDNorm, Organization, Transaction } from '../../../../entities';
import { AccountingconfigService, LedgerService, LedgerSummaryService, OrganizationService, PrintAccInvoiceFormat, TransactionService } from '../../../../services';

@Component({
  selector: 'app-general',
  templateUrl: './general.component.html',
  styleUrls: ['./general.component.css']
})

export class GeneralComponent implements OnInit {
  @Input() transactionObj: Transaction = new Transaction();
  @Output() toggle: EventEmitter<boolean> = new EventEmitter();
  @Output() toggleClose: EventEmitter<boolean> = new EventEmitter();

  public generalTransactionObj: Transaction = new Transaction();
  public printTransactionObj: Transaction = new Transaction();
  public isEdit = false;
  public fxCredential!: fxCredential;
  public mainLedgerItems: Ledger[] = [];
  public ledgerType: string[] = [];
  public fromLedgerItems: LedgerDNorm[] = [];
  public listFromLedgerItems: Array<{ text: string; group: string, value: string }> = [];
  public selectedFromLedgerItem: string = "";
  public toLedgerItems: LedgerDNorm[] = [];
  public listToLedgerItems: Array<{ text: string; group: string, value: string }> = [];
  public selectedToLedgerItem: string = "";
  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains'
  };
  public accountingConfigData: AccountingConfig = new AccountingConfig();
  public canPrint = false;
  public organizationId!: string;
  public organizationData: Organization = new Organization();
  public printInvoiceNumber!: string;
  public validAddAmtLimit = true;
  public listCurrencyType: Array<{ text: string; value: string }> = [];
  public disableFromCurrType = false;
  public disableToCurrType = false;

  constructor(
    private alertDialogService: AlertdialogService,
    public utilityService: UtilityService,
    private spinnerService: NgxSpinnerService,
    public appPreloadService: AppPreloadService,
    public router: Router,
    public ledgerService: LedgerService,
    public accountingconfigService: AccountingconfigService,
    private transactionService: TransactionService,
    private printAccInvoiceFormat: PrintAccInvoiceFormat,
    private organizationService: OrganizationService,
    private ledgerSummaryService: LedgerSummaryService
  ) { }

  async ngOnInit() {
    await this.loadDefaultMethods();
  }

  public async loadDefaultMethods() {
    try {
      this.spinnerService.show();
      this.fxCredential = await this.appPreloadService.fetchFxCredentials();
      this.generalTransactionObj.transactionType = this.transactionObj.transactionType;
      await this.GetLedgers();
      await this.loadOrganizationDetail();
      await this.loadAccountConfigDetail();


      if (this.transactionObj.id != null && this.transactionObj.id.length > 0)
        this.isEdit = true;

      if (!this.isEdit) {
        this.clearTransactionData();
        await this.setDefaultCurrencyConvert();
      }
      else
        await this.validateEditObj();

      if (!this.transactionObj.id && this.transactionObj.toLedger.id) {
        setTimeout(() => {
          this.selectedToLedgerItem = this.transactionObj.toLedger.name.toString();
        }, 0);
        if (this.toLedgerItems && this.toLedgerItems.length > 0)
          await this.toLedgerChange(this.transactionObj.toLedger.id);

        if (this.transactionObj.amount)
          this.generalTransactionObj.amount = this.transactionObj.amount;

        if (this.transactionObj.transactionDetail.toCurrency)
          this.generalTransactionObj.transactionDetail.toCurrency = this.transactionObj.transactionDetail.toCurrency;
        this.currencyChange();


      }

    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async setDefaultCurrencyConvert() {
    this.generalTransactionObj.transactionDetail.fromCurrency = listCurrencyType.USD.toString();
    this.generalTransactionObj.transactionDetail.fromCurRate = 1;
    if (!this.generalTransactionObj.transactionDetail.toCurRate)
      await this.setDefaultToCurrencyConvert();
  }

  public async setDefaultToCurrencyConvert() {
    if (this.organizationData.address?.country.trim().toLowerCase() == "hongkong") {
      this.generalTransactionObj.transactionDetail.toCurrency = listCurrencyType.HKD.toString();
      let res = await this.accountingconfigService.getFromToCurrencyRate(this.generalTransactionObj.transactionDetail.fromCurrency, this.generalTransactionObj.transactionDetail.toCurrency, this.accountingConfigData.currencyConfigs);
      this.generalTransactionObj.transactionDetail.toCurRate = res.toRate;
    }
    else if (this.organizationData.address?.country.trim().toLowerCase() == "india") {
      this.generalTransactionObj.transactionDetail.toCurrency = listCurrencyType.INR.toString();
      let res = await this.accountingconfigService.getFromToCurrencyRate(this.generalTransactionObj.transactionDetail.fromCurrency, this.generalTransactionObj.transactionDetail.toCurrency, this.accountingConfigData.currencyConfigs);
      this.generalTransactionObj.transactionDetail.toCurRate = res.toRate;
    }
  }

  public async loadAccountConfigDetail() {
    try {
      this.accountingConfigData = await this.accountingconfigService.getAccoutConfig();
      Object.values(listCurrencyType).forEach(z => { this.listCurrencyType.push({ text: z.toString(), value: z.toString() }); });

    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public clearTransactionData() {
    this.generalTransactionObj = new Transaction();
    this.selectedFromLedgerItem = '';
    this.selectedToLedgerItem = '';
    this.generalTransactionObj.transactionDate = new Date();
    this.generalTransactionObj.transactionDetail.fromCurrency = listCurrencyType.USD.toString();
    this.generalTransactionObj.transactionDetail.fromCurRate = 1;
  }

  public async validateEditObj() {
    this.transactionObj.transactionDate = this.getValidJoiningDate(this.transactionObj.transactionDate);

    this.generalTransactionObj = this.transactionObj;
    this.printInvoiceNumber = this.transactionObj.number;
    this.selectedFromLedgerItem = this.generalTransactionObj.fromLedger.name.toString();
    this.selectedToLedgerItem = this.generalTransactionObj.toLedger.name.toString();
    if (this.generalTransactionObj.transactionDetail.fromCurrency && this.generalTransactionObj.transactionDetail.toCurrency) {
      this.accountingConfigData = await this.accountingconfigService.getAccoutConfig();
      let res = this.accountingconfigService.getFromToCurrencyRate(this.generalTransactionObj.transactionDetail.fromCurrency, this.generalTransactionObj.transactionDetail.toCurrency, this.accountingConfigData.currencyConfigs);
      this.generalTransactionObj.transactionDetail.toCurRate = res.toRate;
    }
    this.fromLedgerChange(this.transactionObj.fromLedger.id);
    this.toLedgerChange(this.transactionObj.toLedger.id);
    this.spinnerService.hide();
  }

  public async currencyChange() {
    this.accountingConfigData = await this.accountingconfigService.getAccoutConfig();
    let res = this.accountingconfigService.getFromToCurrencyRate(this.generalTransactionObj.transactionDetail.fromCurrency, this.generalTransactionObj.transactionDetail.toCurrency, this.accountingConfigData.currencyConfigs);
    this.generalTransactionObj.transactionDetail.fromCurRate = res.fromRate;
    this.generalTransactionObj.transactionDetail.toCurRate = res.toRate;
    this.calculateTotal();
  }

  public getValidJoiningDate(date: any): Date {
    const day = moment(date).date();
    const month = moment(date).month();
    const year = moment(date).year();
    var newDate = new Date(year, month, day);
    return newDate;
  }

  public async loadOrganizationDetail() {
    try {
      this.organizationId = this.fxCredential.organizationId;
      this.organizationData = await this.organizationService.getOrganizationById(this.organizationId)
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async GetLedgers() {
    try {
      this.mainLedgerItems = await this.ledgerService.getAllLedgers();

      if (this.mainLedgerItems && this.mainLedgerItems.length > 0) {
        for (let index = 0; index < this.mainLedgerItems.length; index++) {
          const element = this.mainLedgerItems[index];
          this.fromLedgerItems.push({
            id: element.id,
            group: element.group.name,
            name: element.name,
            code: element.code,
            contactPerson: element.contactPerson,
            email: element.email,
            mobileNo: element.mobileNo,
            phoneNo: element.phoneNo,
            faxNo: element.faxNo,
            address: element.address,
            idents: element.idents,
            incomeTaxNo: element.incomeTaxNo,
            taxNo: element.taxNo,
            ccType: element.ccType,
          });

          this.toLedgerItems.push({
            id: element.id,
            group: element.group.name,
            name: element.name,
            code: element.code,
            contactPerson: element.contactPerson,
            email: element.email,
            mobileNo: element.mobileNo,
            phoneNo: element.phoneNo,
            faxNo: element.faxNo,
            address: element.address,
            idents: element.idents,
            incomeTaxNo: element.incomeTaxNo,
            taxNo: element.taxNo,
            ccType: element.ccType,
          });
        }
      }
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async FromLedgerFilter(value: any) {
    try {
      this.spinnerService.show();
      this.listFromLedgerItems = [];
      let items = this.fromLedgerItems.filter(z => z.name.toLowerCase().includes(value.toLowerCase()))
      items.forEach(z => { this.listFromLedgerItems.push({ text: z.name, group: z.group, value: z.id }); });
      //filter toledger
      if (this.selectedToLedgerItem)
        this.listFromLedgerItems = this.listFromLedgerItems.filter(x => x.text != this.selectedToLedgerItem)
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async ToLedgerFilter(value: any) {
    try {
      this.spinnerService.show();
      this.listToLedgerItems = [];
      let items = this.toLedgerItems.filter(z => z.name.toLowerCase().includes(value.toLowerCase()))
      items.forEach(z => { this.listToLedgerItems.push({ text: z.name, group: z.group, value: z.id }); });
      //filter fromledger
      if (this.selectedFromLedgerItem)
        this.listToLedgerItems = this.listToLedgerItems.filter(x => x.text != this.selectedFromLedgerItem)
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async fromLedgerChange(e: any) {
    try {
      if (e) {
        let fetch = this.fromLedgerItems.find(x => x.id == e);
        if (fetch) {
          setTimeout(() => {
            this.selectedFromLedgerItem = fetch?.name ?? '';
          }, 0);
          this.generalTransactionObj.fromLedger = fetch ?? new LedgerDNorm();

          if (this.generalTransactionObj.fromLedger) {
            if (this.generalTransactionObj.fromLedger.ccType) {
              this.generalTransactionObj.transactionDetail.fromCurrency = this.generalTransactionObj.fromLedger.ccType;
              this.disableFromCurrType = true;
            }
            else {
              if (!this.generalTransactionObj.transactionDetail.fromCurrency) {
                this.generalTransactionObj.transactionDetail.fromCurrency = listCurrencyType.USD.toString();
                this.generalTransactionObj.transactionDetail.fromCurRate = 1;
                this.disableFromCurrType = false;
              }
            }
          }
        }
      }
      else {
        this.generalTransactionObj.fromLedger = new LedgerDNorm();
        this.generalTransactionObj.transactionDetail.fromCurrency = listCurrencyType.USD.toString();
        this.generalTransactionObj.transactionDetail.fromCurRate = 1;
        this.disableFromCurrType = false;
      }
      this.currencyChange();
      this.calculateTotal();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async toLedgerChange(e: any) {
    try {
      if (e) {
        let fetch = this.toLedgerItems.find(x => x.id == e);
        if (fetch) {
          setTimeout(() => {
            this.selectedToLedgerItem = fetch?.name ?? '';
          }, 0);
          this.generalTransactionObj.toLedger = fetch ?? new LedgerDNorm();

          if (this.generalTransactionObj.toLedger) {
            if (this.generalTransactionObj.toLedger.ccType) {
              this.generalTransactionObj.transactionDetail.toCurrency = this.generalTransactionObj.toLedger.ccType;
              let res = await this.accountingconfigService.getFromToCurrencyRate(this.generalTransactionObj.transactionDetail.fromCurrency, this.generalTransactionObj.transactionDetail.toCurrency, this.accountingConfigData.currencyConfigs);
              this.generalTransactionObj.transactionDetail.toCurRate = res.toRate;
              this.disableToCurrType = true;
            }
            else {
              if (!this.generalTransactionObj.transactionDetail.toCurrency) {
                await this.setDefaultToCurrencyConvert();
                this.disableToCurrType = false;
              }
            }
          }
        }
      }
      else {
        this.generalTransactionObj.toLedger = new LedgerDNorm();
        await this.setDefaultToCurrencyConvert();
        this.disableToCurrType = false;
      }

      this.calculateTotal();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async getCurrentFYLedgerSummary(id: string, transactionType: string): Promise<number> {
    let ledgerSummary: number = 0;
    try {
      if (id) {
        let res = await this.ledgerSummaryService.getCurrentFYLedgerSummary(id, transactionType);
        if (res)
          ledgerSummary = res;
      }

      return ledgerSummary;
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
      return ledgerSummary;
    }
  }

  public closeGeneralDialog(): void {
    this.toggleClose.emit(false);
  }

  public async saveTransaction(isNew = false) {
    try {
      if (this.generalTransactionObj.fromLedger.id == null || this.generalTransactionObj.fromLedger.id == undefined) {
        this.alertDialogService.show('Please select from ledger!');
        return;
      }
      if (this.generalTransactionObj.toLedger.id == null || this.generalTransactionObj.toLedger.id == undefined) {
        this.alertDialogService.show('Please select to ledger!');
        return;
      }

      this.generalTransactionObj.transactionType = this.transactionObj.transactionType;
      if (this.generalTransactionObj.netTotal == null || this.generalTransactionObj.netTotal <= 0) {
        this.alertDialogService.show('Please add total amount!');
        return;
      }
      this.generalTransactionObj.number = (this.accountingConfigData.lastInvoiceNum + 1).toString();

      if (this.generalTransactionObj.transactionDate != null)
        this.generalTransactionObj.transactionDate = this.utilityService.setUTCDateFilter(this.generalTransactionObj.transactionDate);

      if (this.generalTransactionObj.addAmount == null)
        this.generalTransactionObj.addAmount = 0;

      if (!this.isEdit)
        this.generalTransactionObj.createdBy = this.fxCredential.fullName;
      
      let res = await this.transactionService.insert(this.generalTransactionObj);
      if (res) {
        this.printInvoiceNumber = res;
        this.utilityService.showNotification('Saved Sucessfully!');
        this.spinnerService.hide();

        if (!isNew)
          this.toggle.emit(false);

        if (this.canPrint) {
          this.printGet();
        }

        this.generalTransactionObj = new Transaction();
        this.selectedFromLedgerItem = '';
        this.selectedToLedgerItem = '';
      }
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('not added, Please try again later!')
    }
  }

  public async updateTransaction() {
    this.generalTransactionObj.transactionType = this.transactionObj.transactionType;
    this.alertDialogService.ConfirmYesNo("Are you sure you want to update transaction", "Update Transaction")
      .subscribe(async (res: any) => {
        if (res.flag) {
          try {
            this.spinnerService.show();
            if (this.generalTransactionObj.transactionDate != null)
              this.generalTransactionObj.transactionDate = this.utilityService.setUTCDateFilter(this.generalTransactionObj.transactionDate);

            let res = await this.transactionService.update(this.generalTransactionObj);
            if (res) {
              this.utilityService.showNotification('Transaction updated successfully! Transactions No: ' + res);
              this.spinnerService.hide();
              this.toggle.emit(false);
            }
            else {
              this.spinnerService.hide();
              this.alertDialogService.show('Transaction not update, Please try again later!', 'error');
            }
          }
          catch (error: any) {
            console.error(error);
            this.spinnerService.hide();
            this.alertDialogService.show('Transaction not update, Please contact administrator!')
          }
        }
      });
  }

  public calculateTotal(additionalAmtManualChange = false) {
    try {
      if (this.generalTransactionObj.amount.toString().length == 0) {
        this.generalTransactionObj.netTotal = 0;
        this.generalTransactionObj.tdsAmount = 0;
        return;
      }

      this.generalTransactionObj.netTotal = this.utilityService.ConvertToFloatWithDecimal(this.generalTransactionObj.amount);
      this.generalTransactionObj.tdsAmount = 0;

      //TDS Calculation
      if (this.generalTransactionObj.toLedger.id?.length > 0 && this.transactionObj.transactionType != TransactionType.Receipt.toString()) {
        if (this.mainLedgerItems && this.mainLedgerItems.length > 0) {
          let party = this.mainLedgerItems.find(z => z.id == this.generalTransactionObj.toLedger.id);
          if (party && party.tdsLimit && party.tdsRate) {
            let netTotal = this.generalTransactionObj.netTotal;

            //Check if exceed limit
            if (netTotal > (party.tdsLimit ?? 0)) {
              let amt = netTotal - party.tdsLimit;
              this.generalTransactionObj.tdsAmount = this.utilityService.ConvertToFloatWithDecimal((amt * party.tdsRate) / 100);
            }
          }
        }
      }

      let addAmt = this.utilityService.setadditionalAmountForTransaction(this.generalTransactionObj.netTotal);
      if (additionalAmtManualChange)
        addAmt = parseFloat((this.generalTransactionObj.addAmount ?? 0).toString());
      else
        this.generalTransactionObj.addAmount = addAmt;

      if (addAmt.toString() == '' || addAmt.toString() == 'NaN' || addAmt.toString() == 'undefined' || addAmt.toString() == 'null')
        addAmt = 0;


      let tdsAmt = parseFloat(this.generalTransactionObj.tcsAmount.toString() ?? "0");
      if (tdsAmt.toString() == '' || tdsAmt.toString() == 'NaN' || tdsAmt.toString() == 'undefined' || tdsAmt.toString() == 'null')
        tdsAmt = 0;

      if (this.generalTransactionObj.tcsAmount.toString().length > 0 && this.generalTransactionObj.tcsAmount.toString() != "-")
        this.generalTransactionObj.netTotal = parseFloat(this.generalTransactionObj.netTotal.toString()) + tdsAmt;

      if (this.generalTransactionObj.addAmount.toString().length > 0 && this.generalTransactionObj.addAmount.toString() != "-")
        this.generalTransactionObj.netTotal = parseFloat(this.generalTransactionObj.netTotal.toString()) + addAmt;

      this.generalTransactionObj.ccAmount = Number(((this.generalTransactionObj.netTotal ? this.generalTransactionObj.netTotal : 0) * Number(this.generalTransactionObj.transactionDetail.toCurRate ?? 0)).toFixed(2)) ?? 0;

    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('not added, Please try again later!')
    }
  }

  public async printGet() {
    try {
      this.spinnerService.show();
      this.printTransactionObj = await this.transactionService.getbyNumber(this.printInvoiceNumber);
      if (this.printTransactionObj) {
        let printStone: HTMLIFrameElement = document.createElement("iframe");
        printStone.name = "print_detail";
        printStone.style.position = "absolute";
        printStone.style.top = "-1000000px";
        document.body.appendChild(printStone);
        printStone?.contentWindow?.document.open();
        printStone?.contentWindow?.document.write(`<html><head>
              <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
              <meta http-equiv="X-UA-Compatible" content="IE=edge">
              <link rel="stylesheet" type="text/css" href="commonAssets/css/printaccinvoice.css" media="print" />
              </head>`);
        let printContents: string;
        printContents = this.printAccInvoiceFormat.getAccInvoicePrint(this.printTransactionObj, this.organizationData);
        printStone?.contentWindow?.document.write(printContents);
        printStone?.contentWindow?.document.close();
      }
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

}
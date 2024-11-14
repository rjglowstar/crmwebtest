import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { Router } from '@angular/router';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { NgxSpinnerService } from 'ngx-spinner';
import { AccountingConfig, Ledger, LedgerDNorm, Organization, Transaction } from '../../../../entities';
import { TransactionService, LedgerService, OrganizationService, AccountingconfigService } from '../../../../services';
import { fxCredential } from 'shared/enitites';
import { AppPreloadService, listCurrencyType, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import * as moment from 'moment';

@Component({
  selector: 'app-contravoucher',
  templateUrl: './contravoucher.component.html',
  styleUrls: ['./contravoucher.component.css']
})

export class ContraVoucherComponent implements OnInit {
  @Input() transactionObj: Transaction = new Transaction();
  @Output() toggle: EventEmitter<boolean> = new EventEmitter();
  @Output() toggleClose: EventEmitter<boolean> = new EventEmitter();

  public contraTransactionObj: Transaction = new Transaction();
  public isEdit = false;
  public fxCredential!: fxCredential;
  public mainLedgerItems: Ledger[] = [];
  public ledgerType: string[] = [];

  public listFromLedgerItems: Array<{ text: string; value: string }> = [];
  public listToLedgerItems: Array<{ text: string; value: string }> = [];
  public ledgerItems: LedgerDNorm[] = [];
  public selectedFromLedgerItem: string = "";
  public selectedToLedgerItem: string = "";

  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains'
  };
  public accountingConfigData: AccountingConfig = new AccountingConfig();
  public organizationId!: string;
  public organizationData: Organization = new Organization();
  public printInvoiceNumber!: string;

  public isContraDetail = false;

  public validAddAmtLimit = true;
  public listCurrencyType: Array<{ text: string; value: string }> = [];

  public bankLedgers: Ledger[] = [];
  public disableFromCurrType = false;
  public disableToCurrType = false;

  constructor(private alertDialogService: AlertdialogService,
    public utilityService: UtilityService,
    private spinnerService: NgxSpinnerService,
    public appPreloadService: AppPreloadService,
    public router: Router,
    public ledgerService: LedgerService,
    private transactionService: TransactionService,
    private organizationService: OrganizationService,
    private accountingconfigService: AccountingconfigService,
  ) { }

  async ngOnInit() {
    await this.loadDefaultMethods();
  }

  public async loadDefaultMethods() {
    try {
      this.spinnerService.show();
      this.fxCredential = await this.appPreloadService.fetchFxCredentials();
      this.contraTransactionObj.transactionType = this.transactionObj.transactionType;
      await this.GetLedgers();
      await this.loadOrganizationDetail();
      await this.loadAccountConfigDetail();

      if (this.transactionObj.id != null && this.transactionObj.id.length > 0)
        this.isEdit = true;

      if (!this.isEdit) {
        this.clearTransactionData();
        this.contraTransactionObj.transactionDetail.fromCurrency = listCurrencyType.USD.toString();
        this.contraTransactionObj.transactionDetail.fromCurRate = 1;
        if (!this.contraTransactionObj.transactionDetail.toCurRate) {
          if (this.organizationData.address?.country.trim().toLowerCase() == "hongkong") {
            this.contraTransactionObj.transactionDetail.toCurrency = listCurrencyType.HKD.toString();
            let res = this.accountingconfigService.getFromToCurrencyRate(this.contraTransactionObj.transactionDetail.fromCurrency, this.contraTransactionObj.transactionDetail.toCurrency, this.accountingConfigData.currencyConfigs);
            this.contraTransactionObj.transactionDetail.toCurRate = res.toRate;
          }
          else if (this.organizationData.address?.country.trim().toLowerCase() == "india") {
            this.contraTransactionObj.transactionDetail.toCurrency = listCurrencyType.INR.toString();
            let res = this.accountingconfigService.getFromToCurrencyRate(this.contraTransactionObj.transactionDetail.fromCurrency, this.contraTransactionObj.transactionDetail.toCurrency, this.accountingConfigData.currencyConfigs);
            this.contraTransactionObj.transactionDetail.toCurRate = res.toRate;
          }
        }
      }
      else
        await this.validateEditObj();

      this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
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
    this.contraTransactionObj = new Transaction();
    this.selectedFromLedgerItem = '';
    this.selectedToLedgerItem = '';
    this.contraTransactionObj.transactionDate = new Date();
    this.contraTransactionObj.transactionDetail.fromCurrency = listCurrencyType.USD.toString();
    this.contraTransactionObj.transactionDetail.fromCurRate = 1;
  }

  public async validateEditObj() {
    this.transactionObj.transactionDate = this.getValidJoiningDate(this.transactionObj.transactionDate);
    this.fromLedgerChange(this.transactionObj.fromLedger.id);
    this.toLedgerChange(this.transactionObj.toLedger.id);
    this.contraTransactionObj = this.transactionObj;
    this.printInvoiceNumber = this.transactionObj.number;
    this.selectedFromLedgerItem = this.contraTransactionObj.fromLedger.name.toString();
    this.selectedToLedgerItem = this.contraTransactionObj.toLedger.name.toString();

    if (this.contraTransactionObj.transactionDetail.fromCurrency && this.contraTransactionObj.transactionDetail.toCurrency) {
      this.accountingConfigData = await this.accountingconfigService.getAccoutConfig();
      let res = this.accountingconfigService.getFromToCurrencyRate(this.contraTransactionObj.transactionDetail.fromCurrency, this.contraTransactionObj.transactionDetail.toCurrency, this.accountingConfigData.currencyConfigs);
      // this.contraTransactionObj.transactionDetail.toCurRate = res.toRate;
    }
    this.spinnerService.hide();
  }

  public async currencyChange() {
    this.accountingConfigData = await this.accountingconfigService.getAccoutConfig();
    let res = this.accountingconfigService.getFromToCurrencyRate(this.contraTransactionObj.transactionDetail.fromCurrency, this.contraTransactionObj.transactionDetail.toCurrency, this.accountingConfigData.currencyConfigs);
    this.contraTransactionObj.transactionDetail.fromCurRate = res.fromRate;
    this.contraTransactionObj.transactionDetail.toCurRate = res.toRate;
    if (this.contraTransactionObj.transactionDetail.toCurRate <= 0) {
      this.contraTransactionObj.amount = 0;
      this.contraTransactionObj.addAmount = 0;
    }
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
      let ledgerType: string[] = ['Bank OD A/C', 'Bank Accounts', 'Bank', 'Cash-In-Hand'];
      let ledgers = await this.ledgerService.getAllLedgersByType(ledgerType);
      this.bankLedgers = JSON.parse(JSON.stringify(ledgers));
      for (let index = 0; index < ledgers.length; index++) {
        const element = ledgers[index];
        this.ledgerItems.push({
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
          taxNo: element.taxNo
        });
      }

      this.listFromLedgerItems = [];
      this.listToLedgerItems = [];
      this.ledgerItems.forEach(z => {
        this.listFromLedgerItems.push({ text: z.name, value: z.id });
        this.listToLedgerItems.push({ text: z.name, value: z.id });
      });
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Party not load, Try gain later!');
    }
  }

  public async FromLedgerFilter(value: any) {
    try {
      this.spinnerService.show();
      this.listFromLedgerItems = [];
      let Items = this.ledgerItems.filter(z => z.name.toLowerCase().includes(value.toLowerCase()))
      Items.forEach(z => { this.listFromLedgerItems.push({ text: z.name, value: z.id }); });
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
      let Items = this.ledgerItems.filter(z => z.name.toLowerCase().includes(value.toLowerCase()))
      Items.forEach(z => { this.listToLedgerItems.push({ text: z.name, value: z.id }); });
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public fromLedgerChange(e: any) {
    try {
      if (e) {
        let fetch = this.ledgerItems.find(x => x.id == e);
        if (fetch) {
          setTimeout(() => {
            this.selectedFromLedgerItem = fetch?.name ?? '';
          }, 0);
          this.contraTransactionObj.fromLedger = fetch ?? new LedgerDNorm();

          //Set Currancy Type From Ledger Bank
          let ledger = this.bankLedgers.find(z => z.id == fetch?.id);
          if (ledger) {
            if (ledger.bank && ledger.ccType) {
              this.contraTransactionObj.transactionDetail.fromCurrency = ledger.ccType;
              this.disableFromCurrType = true;
            }
            else {
              this.contraTransactionObj.transactionDetail.fromCurrency = null as any;
              this.contraTransactionObj.transactionDetail.fromCurRate = 1;
              this.disableFromCurrType = false;
            }
          }
          else {
            this.contraTransactionObj.transactionDetail.fromCurrency = null as any;
            this.disableFromCurrType = false;
          }
        }
      }
      else {
        this.contraTransactionObj.fromLedger = new LedgerDNorm();
        this.disableFromCurrType = false;
      }
      if (!this.transactionObj.id)
        this.currencyChange();
      this.checkForContraDetail();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public toLedgerChange(e: any) {
    try {
      if (e) {
        let fetch = this.ledgerItems.find(x => x.id == e);
        if (fetch) {
          setTimeout(() => {
            this.selectedToLedgerItem = fetch?.name ?? '';
          }, 0);
          this.contraTransactionObj.toLedger = fetch ?? new LedgerDNorm();

          //Set Currancy Type From Ledger Bank
          let ledger = this.bankLedgers.find(z => z.id == fetch?.id);
          if (ledger) {
            if (ledger.bank && ledger.ccType) {
              this.contraTransactionObj.transactionDetail.toCurrency = ledger.ccType;
              this.disableToCurrType = true;
            }
            else {
              this.contraTransactionObj.transactionDetail.toCurrency = null as any;
              this.disableToCurrType = false;
            }
          }
          else {
            this.contraTransactionObj.transactionDetail.toCurrency = null as any;
            this.disableToCurrType = false;
          }
        }
      }
      else {
        this.contraTransactionObj.toLedger = new LedgerDNorm();
        this.disableToCurrType = false;
      }
      if (!this.transactionObj.id)
        this.currencyChange();
      this.checkForContraDetail();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  private checkForContraDetail() {
    if (this.contraTransactionObj.toLedger && this.contraTransactionObj.toLedger.id && this.contraTransactionObj.fromLedger && this.contraTransactionObj.fromLedger.id) {
      let isAssets = this.accountingConfigData.ledgerGroups.find(z => z.name == this.contraTransactionObj.fromLedger.group && z.nature.toLowerCase() == 'assets');
      let isLiability = this.accountingConfigData.ledgerGroups.find(z => z.name == this.contraTransactionObj.toLedger.group && z.nature.toLowerCase() == 'liabilities');
      if (isAssets != null && isLiability != null)
        this.isContraDetail = true;
      else
        this.isContraDetail = false;
    }
    else
      this.isContraDetail = false;
  }

  public closeGeneralDialog(): void {
    this.toggleClose.emit(false);
  }

  public async saveTransaction(isNew = false) {
    try {
      if (this.contraTransactionObj.fromLedger.id == null || this.contraTransactionObj.fromLedger.id == undefined) {
        this.alertDialogService.show('Please select from ledger!');
        return;
      }
      if (this.contraTransactionObj.toLedger.id == null || this.contraTransactionObj.toLedger.id == undefined) {
        this.alertDialogService.show('Please select to ledger!');
        return;
      }

      this.contraTransactionObj.transactionType = this.transactionObj.transactionType;
      if (this.contraTransactionObj.netTotal == null || this.contraTransactionObj.netTotal <= 0) {
        this.alertDialogService.show('Please add total amount!');
        return;
      }
      this.contraTransactionObj.number = (this.accountingConfigData.lastInvoiceNum + 1).toString();

      if (this.contraTransactionObj.transactionDate != null)
        this.contraTransactionObj.transactionDate = this.utilityService.setUTCDateFilter(this.contraTransactionObj.transactionDate);

      if (this.contraTransactionObj.addAmount == null)
        this.contraTransactionObj.addAmount = 0;

      let res = await this.transactionService.insert(this.contraTransactionObj);
      if (res) {
        this.printInvoiceNumber = res;
        this.utilityService.showNotification('Saved Sucessfully!');
        this.spinnerService.hide();

        if (!isNew)
          this.toggle.emit(false);

        this.contraTransactionObj = new Transaction();
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
    this.contraTransactionObj.transactionType = this.transactionObj.transactionType;
    this.alertDialogService.ConfirmYesNo("Are you sure you want to update transaction", "Update Transaction")
      .subscribe(async (res: any) => {
        if (res.flag) {
          try {
            this.spinnerService.show();
            if (this.contraTransactionObj.transactionDate != null)
              this.contraTransactionObj.transactionDate = this.utilityService.setUTCDateFilter(this.contraTransactionObj.transactionDate);

            let res = await this.transactionService.update(this.contraTransactionObj);
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
      this.contraTransactionObj.netTotal = 0;

      let addAmt = this.utilityService.setadditionalAmountForTransaction(this.contraTransactionObj.amount);
      if (additionalAmtManualChange)
        addAmt = parseFloat((this.contraTransactionObj.addAmount ?? 0).toString());
      else
        this.contraTransactionObj.addAmount = addAmt;

      if (addAmt.toString() == '' || addAmt.toString() == 'NaN' || addAmt.toString() == 'undefined' || addAmt.toString() == 'null')
        addAmt = 0;

      let bankCharge = parseFloat((this.contraTransactionObj.paymentDetail.expence ?? 0).toString());
      if (bankCharge.toString() == '' || bankCharge.toString() == 'NaN' || bankCharge.toString() == 'undefined' || bankCharge.toString() == 'null')
        bankCharge = 0;

      this.contraTransactionObj.netTotal = this.utilityService.ConvertToFloatWithDecimal((Number(addAmt) + Number(this.contraTransactionObj.amount) - Number(bankCharge)));
      this.contraTransactionObj.ccAmount = Number((this.contraTransactionObj.netTotal * Number(this.contraTransactionObj.transactionDetail.toCurRate ?? 0)).toFixed(2)) ?? 0;
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('not added, Please try again later!')
    }
  }
}
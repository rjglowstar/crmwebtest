import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { SelectableSettings } from '@progress/kendo-angular-grid';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { fxCredential } from 'shared/enitites';
import { AppPreloadService, listCurrencyType, listETPaymentMethod, listPaymentType, TransactionType, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { AccountingConfig, Ledger, LedgerDNorm, Organization, Transaction } from '../../../../entities';
import { AccountingconfigService, LedgerService, OrganizationService, PrintAccInvoiceFormat, TransactionService } from '../../../../services';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})

export class PaymentComponent implements OnInit {
  @Input() transactionObj: Transaction = new Transaction();
  @Output() toggle: EventEmitter<boolean> = new EventEmitter();
  @Output() toggleClose: EventEmitter<boolean> = new EventEmitter();

  public paymentTransactionObj: Transaction = new Transaction();
  public generalTransactionObj: Transaction = new Transaction();
  public printTransactionObj: Transaction = new Transaction();
  public purchaseTransactions: Transaction[] = [];
  public selectedPurchaseTransactionObj: Transaction = new Transaction();
  public isEdit = false;
  public fxCredential!: fxCredential;
  public mainLedgerItems: Ledger[] = [];
  public ledgerType: string[] = [];
  public fromLedgerItems: LedgerDNorm[] = [];
  public fromLedgerSummary: number = 0;
  public listFromLedgerItems: Array<{ text: string; value: string }> = [];
  public selectedFromLedgerItem: string = "";
  public toLedgerItems: LedgerDNorm[] = [];
  public toLedgerSummary: number = 0;
  public listToLedgerItems: Array<{ text: string; value: string }> = [];
  public selectedToLedgerItem: string = "";

  public selectableSettings: SelectableSettings = { mode: 'multiple' };
  public mySelectionTrans: string[] = [];

  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains'
  };
  public listPaymentType = listPaymentType;
  public listETPaymentMethod = listETPaymentMethod;
  public accountingConfigData: AccountingConfig = new AccountingConfig();
  public canPrint = false;
  public organizationId!: string;
  public organizationData: Organization = new Organization();
  public printInvoiceNumber!: string;
  public remainAmount: number = 0;
  public validAddAmtLimit = true;

  public listCurrencyType: Array<{ text: string; value: string }> = [];
  public disableFromType = false;
  public disableToType = false;

  constructor(private alertDialogService: AlertdialogService,
    public utilityService: UtilityService,
    private spinnerService: NgxSpinnerService,
    public appPreloadService: AppPreloadService,
    public router: Router,
    public ledgerService: LedgerService,
    public accountingconfigService: AccountingconfigService,
    private transactionService: TransactionService,
    private printAccInvoiceFormat: PrintAccInvoiceFormat,
    private organizationService: OrganizationService
  ) { }

  async ngOnInit() {
    await this.loadDefaultMethods();
  }

  public async loadDefaultMethods() {
    try {
      this.spinnerService.show();
      this.fxCredential = await this.appPreloadService.fetchFxCredentials();
      this.paymentTransactionObj.transactionType = this.transactionObj.transactionType;
      await this.GetLedgers();
      await this.loadOrganizationDetail();
      await this.loadAccountConfigDetail();

      if (!this.transactionObj.id && this.transactionObj.toLedger.id) {
        setTimeout(() => {
          this.selectedToLedgerItem = this.transactionObj.toLedger.name.toString();
        }, 0);
        if (this.toLedgerItems && this.toLedgerItems.length > 0)
          this.toLedgerChange(this.transactionObj.toLedger.id);
      }

      if (this.transactionObj.id != null && this.transactionObj.id.length > 0)
        this.isEdit = true;

      if (!this.isEdit)
        this.clearTransactionData();
      else
        await this.validateEditObj();

      this.initCCType();

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

  public initCCType() {
    this.paymentTransactionObj.transactionDetail.fromCurrency = listCurrencyType.USD.toString();
    this.paymentTransactionObj.transactionDetail.fromCurRate = 1;

    if (!this.paymentTransactionObj.transactionDetail.toCurRate) {
      if (this.organizationData && this.organizationData.address && this.organizationData.address.country) {
        if (this.organizationData.address.country.toLowerCase().trim() == "hongkong") {
          this.paymentTransactionObj.transactionDetail.toCurrency = listCurrencyType.HKD.toString();
          let res = this.accountingconfigService.getFromToCurrencyRate(this.paymentTransactionObj.transactionDetail.fromCurrency, this.paymentTransactionObj.transactionDetail.toCurrency, this.accountingConfigData.currencyConfigs);
          this.paymentTransactionObj.transactionDetail.toCurRate = res.toRate;
        }
        else if (this.organizationData.address.country.toLowerCase() == "india") {
          this.paymentTransactionObj.transactionDetail.toCurrency = listCurrencyType.INR.toString();
          let res = this.accountingconfigService.getFromToCurrencyRate(this.paymentTransactionObj.transactionDetail.fromCurrency, this.paymentTransactionObj.transactionDetail.toCurrency, this.accountingConfigData.currencyConfigs);
          this.paymentTransactionObj.transactionDetail.toCurRate = res.toRate;
        }
        this.currencyChange();

      }
    }
  }

  public clearTransactionData() {
    this.paymentTransactionObj = new Transaction();
    this.paymentTransactionObj.transactionType = TransactionType.Payment.toString();
    this.paymentTransactionObj.number = (this.accountingConfigData.lastInvoiceNum + 1).toString();
    this.paymentTransactionObj.tdsAmount = '' as any;
    this.paymentTransactionObj.tcsAmount = '' as any;
    this.paymentTransactionObj.addAmount = '' as any;
    this.selectedFromLedgerItem = '';
    this.selectedToLedgerItem = '';
    this.paymentTransactionObj.transactionDate = new Date();
  }

  public async validateEditObj() {
    this.paymentTransactionObj = JSON.parse(JSON.stringify(this.transactionObj));

    this.paymentTransactionObj.transactionDate = this.getValidEditDate(this.paymentTransactionObj.transactionDate);
    if (this.paymentTransactionObj.paymentDetail.chequeDate)
      this.paymentTransactionObj.paymentDetail.chequeDate = this.getValidEditDate(this.paymentTransactionObj.paymentDetail.chequeDate);

    this.printInvoiceNumber = this.transactionObj.number;
    this.selectedFromLedgerItem = this.paymentTransactionObj.fromLedger.name.toString();
    this.selectedToLedgerItem = this.paymentTransactionObj.toLedger.name.toString();

    this.fromLedgerChange(this.transactionObj.fromLedger.id);
    this.toLedgerChange(this.transactionObj.toLedger.id, false);

    this.purchaseTransactions = [];
    let isLoadUnPaid = false;
    if (this.paymentTransactionObj.paymentDetail.selectedTransactionId.length > 0) {

      let paidAmount: number = 0
      for (let index = 0; index < this.paymentTransactionObj.paymentDetail.selectedTransactionId.length; index++) {

        const element = this.paymentTransactionObj.paymentDetail.selectedTransactionId[index];
        let selectedTransaction = await this.transactionService.getTransactionById(element);
        if (selectedTransaction != null) {

          this.selectedPurchaseTransactionObj = selectedTransaction;
          this.purchaseTransactions.push(selectedTransaction);
          paidAmount += selectedTransaction.paidAmount;
        }
      }
      paidAmount += (this.paymentTransactionObj.paymentDetail.cashHandlingCharge ?? 0) + (this.paymentTransactionObj.paymentDetail.interestAmount ?? 0);
      if (paidAmount < this.paymentTransactionObj.netTotal)
        isLoadUnPaid = true;

      this.remainAmount = Number((this.paymentTransactionObj.netTotal - paidAmount).toFixed(2));
      if (this.paymentTransactionObj.addAmount && this.paymentTransactionObj.addAmount != 0)
        this.remainAmount = this.remainAmount + Math.abs(Number((this.paymentTransactionObj.addAmount).toFixed(2)));
    }
    else {
      isLoadUnPaid = true;
      this.paymentTransactionObj.paidAmount = this.selectedPurchaseTransactionObj.netTotal;
    }

    if (isLoadUnPaid) {
      let res = await this.transactionService.getUnPaidTransactions(this.paymentTransactionObj.toLedger.id, TransactionType.Purchase.toString());
      if (res) {

        res.forEach(element => {
          this.purchaseTransactions.push(element);
        });
      }
    }
    else    //For Prevent Selection of Sales Transactions in Edit Mode
      this.selectableSettings.checkboxOnly = true;

    this.purchaseTransactions = this.removeDuplicates(this.purchaseTransactions, 'number');

    this.spinnerService.hide();
  }

  public removeDuplicates(arr: any, prop: any) {
    return arr.filter((obj: any, index: any, self: any) =>
      index === self.findIndex((t: any) => (
        t[prop] === obj[prop]
      ))
    );
  }

  public getValidEditDate(date: any): Date {
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
      let ledgerType: string[] = ['Cash', 'Bank', 'Suppliers', 'Cash-In-Hand'];
      this.mainLedgerItems = await this.ledgerService.getAllLedgersByType(ledgerType);
      if (this.mainLedgerItems.length > 0) {
        for (let index = 0; index < this.mainLedgerItems.length; index++) {
          const element = this.mainLedgerItems[index];
          if (element.group.name == "Cash" || element.group.name == "Bank" || element.group.name == "Cash-In-Hand") {
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
              ccType: element.ccType
            });
          }
          else if (element.group.name == "Suppliers") {
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
              taxNo: element.taxNo
            });
          }
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
      let Items = this.fromLedgerItems.filter(z => z.name.toLowerCase().includes(value.toLowerCase()))
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
      let Items = this.toLedgerItems.filter(z => z.name.toLowerCase().includes(value.toLowerCase()))
      Items.forEach(z => { this.listToLedgerItems.push({ text: z.name, value: z.id }); });
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
          this.paymentTransactionObj.fromLedger = fetch ?? new LedgerDNorm();

          if (this.paymentTransactionObj.fromLedger && this.paymentTransactionObj.fromLedger.ccType) {
            this.paymentTransactionObj.transactionDetail.fromCurrency = this.paymentTransactionObj.fromLedger.ccType;
            this.disableFromType = true;
            this.currencyChange();
          }
          else {
            this.paymentTransactionObj.transactionDetail.fromCurrency = null as any;
            this.paymentTransactionObj.transactionDetail.fromCurRate = null;
            this.paymentTransactionObj.ccAmount = 0;
            this.disableFromType = false;
          }
        }
      }
      else {
        this.paymentTransactionObj.fromLedger = new LedgerDNorm();
        this.paymentTransactionObj.transactionDetail.fromCurrency = null as any;
        this.paymentTransactionObj.transactionDetail.fromCurRate = null;
        this.paymentTransactionObj.ccAmount = 0;
        this.disableFromType = false;
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async toLedgerChange(e: any, calculate = true) {
    try {
      let cloneToLedger: LedgerDNorm = new LedgerDNorm();
      if (e) {
        let fetch = this.toLedgerItems.find(x => x.id == e);
        if (fetch) {
          setTimeout(() => {
            this.selectedToLedgerItem = fetch?.name ?? '';
          }, 0);
          this.paymentTransactionObj.toLedger = fetch ?? new LedgerDNorm();
          cloneToLedger = JSON.parse(JSON.stringify(this.paymentTransactionObj.toLedger))
        }
      }
      else {
        this.mySelectionTrans = new Array<string>();
        this.paymentTransactionObj.toLedger = new LedgerDNorm();
        this.paymentTransactionObj.transactionDetail.toCurrency = null as any;
        this.paymentTransactionObj.transactionDetail.toCurRate = null;
        this.paymentTransactionObj.amount = 0;
        this.paymentTransactionObj.addAmount = 0;
        this.paymentTransactionObj.netTotal = 0;
        this.paymentTransactionObj.ccAmount = 0;
      }

      if (calculate) {
        if (this.paymentTransactionObj.toLedger.id)
          await this.getPurchaseData(this.paymentTransactionObj.toLedger.id);
        else
          this.purchaseTransactions = new Array<Transaction>();

        if (!this.paymentTransactionObj.toLedger.id)
          this.paymentTransactionObj.toLedger = cloneToLedger;

        if (this.purchaseTransactions.length > 0)
          this.calculateTotal();
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async getPurchaseData(id: string) {
    try {
      this.purchaseTransactions = [];
      if (id) {
        let res = await this.transactionService.getUnPaidTransactions(id, TransactionType.Purchase.toString());
        if (res)
          this.purchaseTransactions = res;
      }
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public closePaymentDialog(): void {
    this.toggleClose.emit(false);
  }

  public selectTransactionData() {
    if (!this.isEdit) {
      this.selectedPurchaseTransactionObj = new Transaction();
      this.paymentTransactionObj.paymentDetail.selectedTransactionId = [];
      this.paymentTransactionObj.transactionDetail.toCurrency = null as any;
      this.paymentTransactionObj.amount = 0;
      this.disableToType = false;
    }

    if (this.mySelectionTrans.length > 0) {
      let selectedTrans = this.purchaseTransactions.filter(z => this.mySelectionTrans.includes(z.id));
      if (selectedTrans.length > 0) {
        this.disableToType = true;

        selectedTrans.forEach(z => {
          if (z != null) {
            if ((this.isEdit && this.paymentTransactionObj.transactionDetail.toCurrency == null) || (this.paymentTransactionObj.transactionDetail.toCurrency == undefined || this.paymentTransactionObj.transactionDetail.toCurrency == z.transactionDetail.toCurrency)) {
              this.selectedPurchaseTransactionObj = JSON.parse(JSON.stringify(z));
              this.paymentTransactionObj.transactionDetail.toCurrency = z.transactionDetail.toCurrency;
              this.paymentTransactionObj.transactionDetail.fromCurRate = 1;
              if (!this.isEdit) {
                if (!(this.paymentTransactionObj.fromLedger && this.paymentTransactionObj.fromLedger.id)) {
                  this.paymentTransactionObj.transactionDetail.fromCurrency = z.transactionDetail.toCurrency;
                  this.paymentTransactionObj.transactionDetail.fromCurRate = 1;
                }

                if (z.ccAmount)
                  this.paymentTransactionObj.amount += this.utilityService.ConvertToFloatWithDecimal(Number(z.ccAmount - (z.paidAmount ?? 0)));
                else
                  this.paymentTransactionObj.amount += Number(((z.netTotal * Number(z.transactionDetail.toCurRate ?? 0)) - (z.paidAmount ?? 0)).toFixed(2)) ?? 0;
              }
              if (z.ccAmount > z.paidAmount)
                this.paymentTransactionObj.paymentDetail.selectedTransactionId.push(z.id);
            }
            else {
              this.utilityService.showNotification(z.number + ' Transaction currency type not match with other(s)!', 'warning');
              let selectionIndex = this.mySelectionTrans.findIndex(a => a == z.id);
              this.mySelectionTrans.splice(selectionIndex, 1);
            }
          }
        });
      }
    }

    this.currencyChange();
    this.calculateTotal();
  }

  public async saveTransaction(isNew = false) {
    if (this.paymentTransactionObj.netTotal == null || this.paymentTransactionObj.netTotal <= 0) {
      this.alertDialogService.show('Please add total amount!');
      return;
    }

    if (this.paymentTransactionObj.fromLedger.id == null || this.paymentTransactionObj.fromLedger.id == undefined) {
      this.alertDialogService.show('Please select from ledger!');
      return;
    }

    if (this.paymentTransactionObj.toLedger.id == null || this.paymentTransactionObj.toLedger.id == undefined) {
      this.alertDialogService.show('Please select to ledger!');
      return;
    }

    if (this.purchaseTransactions.length > 0 && (this.selectedPurchaseTransactionObj.id == null || this.selectedPurchaseTransactionObj.id?.length == 0)) {
      this.alertDialogService.ConfirmYesNo("There is already purchase transaction for this party, Are you sure you want to add advance payment?", "Add Advance")
        .subscribe((res: any) => {
          if (res.flag) {
            this.saveTransactionConfirm(isNew);
          }
        });
      return;
    }

    this.saveTransactionConfirm(isNew);
  }

  public saveTransactionConfirm(isNew = false) {
    this.alertDialogService.ConfirmYesNo("Are you sure you want to add Payment", "Add Payment")
      .subscribe(async (res: any) => {
        if (res.flag) {
          try {
            this.paymentTransactionObj.transactionType = this.transactionObj.transactionType;

            if(this.paymentTransactionObj.paymentDetail.selectedTransactionId.length > 0) {
              this.paymentTransactionObj.paidAmount = this.paymentTransactionObj.netTotal;
            }

            if (this.paymentTransactionObj.transactionDate != null)
              this.paymentTransactionObj.transactionDate = this.utilityService.setUTCDateFilter(this.paymentTransactionObj.transactionDate);
            if (!this.isEdit)
              this.paymentTransactionObj.createdBy = this.fxCredential.fullName;

            let res = await this.transactionService.insert(this.paymentTransactionObj);
            await this.generalTransactionEntry();
            if (res) {
              this.printInvoiceNumber = res;
              this.utilityService.showNotification('Saved Sucessfully!');
              this.spinnerService.hide();


              this.toggle.emit(isNew);
              this.loadDefaultMethods();
              if (this.canPrint)
                this.printGet();

              this.paymentTransactionObj = new Transaction();
              this.purchaseTransactions = [];
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
      });
  }

  public async generalTransactionEntry() {
    try {
      //add toLedger based on paymentdetail type  
      if (this.paymentTransactionObj.paymentDetail.cashHandlingCharge) {
        this.generalTransactionObj.fromLedger = this.accountingConfigData.cashHandlingLedger;
        this.generalTransactionObj.amount = this.paymentTransactionObj.paymentDetail.cashHandlingCharge;
        await this.insertTransactionEntry()
      }

      if (this.paymentTransactionObj.paymentDetail.logisticCharge) {
        this.generalTransactionObj.fromLedger = this.accountingConfigData.logisticChargeLedger;
        this.generalTransactionObj.amount = this.paymentTransactionObj.paymentDetail.logisticCharge;
        await this.insertTransactionEntry()
      }

      if (this.paymentTransactionObj.paymentDetail.expence) {
        this.generalTransactionObj.fromLedger = this.accountingConfigData.expenseLedger;
        this.generalTransactionObj.amount = this.paymentTransactionObj.paymentDetail.expence;
        await this.insertTransactionEntry()
      }

      if (this.paymentTransactionObj.paymentDetail.interestAmount) {
        this.generalTransactionObj.fromLedger = this.accountingConfigData.interestLedger;
        this.generalTransactionObj.amount = this.paymentTransactionObj.paymentDetail.interestAmount;
        await this.insertTransactionEntry()
      }
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('not added, Please try again later!')
    }
  }

   //insert cash handling , expense, interest, logistic charges transaction entry
   public async insertTransactionEntry() {
    try {
      this.generalTransactionObj.toLedger = this.paymentTransactionObj.toLedger
      this.generalTransactionObj.transactionType = TransactionType.General.toString();
      this.generalTransactionObj.transactionDate = new Date();
      this.generalTransactionObj.createdBy = this.fxCredential.fullName;

      if (this.paymentTransactionObj.paymentDetail.interestAmount && this.generalTransactionObj.amount < 0) {
        this.generalTransactionObj.fromLedger = this.paymentTransactionObj.toLedger;
        this.generalTransactionObj.toLedger = this.accountingConfigData.interestLedger;
        this.generalTransactionObj.amount = Math.abs(this.generalTransactionObj.amount);
      }

      //add from ledger
      if (this.generalTransactionObj.fromLedger) {
        if (this.generalTransactionObj.fromLedger.ccType)
          this.generalTransactionObj.transactionDetail.fromCurrency = this.generalTransactionObj.fromLedger.ccType;
        else {
          if (!this.generalTransactionObj.transactionDetail.fromCurrency) {
            this.generalTransactionObj.transactionDetail.fromCurrency = listCurrencyType.USD.toString();
            this.generalTransactionObj.transactionDetail.fromCurRate = 1;
          }
        }
      }

      //add toLedger transaction details
      if (this.generalTransactionObj.toLedger) {
        if (this.generalTransactionObj.toLedger.ccType) {
          this.generalTransactionObj.transactionDetail.toCurrency = this.generalTransactionObj.toLedger.ccType;
          let res = await this.accountingconfigService.getFromToCurrencyRate(this.generalTransactionObj.transactionDetail.fromCurrency, this.generalTransactionObj.transactionDetail.toCurrency, this.accountingConfigData.currencyConfigs);
          this.generalTransactionObj.transactionDetail.toCurRate = res.toRate;
        }
        else {
          if (!this.generalTransactionObj.transactionDetail.toCurrency) {
            await this.setDefaultToCurrencyConvert();
          }
        }
      }

      this.generalTransactionObj.netTotal = this.utilityService.ConvertToFloatWithDecimal(this.generalTransactionObj.amount);
      this.generalTransactionObj.ccAmount = Number(((this.generalTransactionObj.netTotal ? this.generalTransactionObj.netTotal : 0) * Number(this.paymentTransactionObj.transactionDetail.toCurRate ?? 0)).toFixed(2)) ?? 0;
      await this.transactionService.insert(this.generalTransactionObj);
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('not added, Please try again later!')
    }
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

  public async updateTransaction() {
    this.paymentTransactionObj.transactionType = this.transactionObj.transactionType;
    this.alertDialogService.ConfirmYesNo("Are you sure you want to update transaction", "Update Transaction")
      .subscribe(async (res: any) => {
        if (res.flag) {
          try {
            this.spinnerService.show();
            if (this.paymentTransactionObj.transactionDate != null)
              this.paymentTransactionObj.transactionDate = this.utilityService.setUTCDateFilter(this.paymentTransactionObj.transactionDate);

            if (this.remainAmount > 0 && this.mySelectionTrans.length > 0) {

              if (this.paymentTransactionObj.paymentDetail.selectedTransactionId && this.paymentTransactionObj.paymentDetail.selectedTransactionId.length > 0) {
                var paidAmount = this.paymentTransactionObj.netTotal;
                paidAmount - (this.paymentTransactionObj.paymentDetail.cashHandlingCharge ?? 0
                  + this.paymentTransactionObj.paymentDetail.interestAmount ?? 0 + this.paymentTransactionObj.paymentDetail.logisticCharge ?? 0);
                if (paidAmount && paidAmount > 0)
                  this.paymentTransactionObj.paidAmount = paidAmount;
              }
              else{
                this.paymentTransactionObj.paidAmount = this.paymentTransactionObj.netTotal;
              }
            }

            this.paymentTransactionObj.paymentDetail.selectedTransactionId = Array.from(new Set([...this.paymentTransactionObj.paymentDetail.selectedTransactionId]))

            let res = await this.transactionService.update(this.paymentTransactionObj);
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

      if (this.paymentTransactionObj.amount)
        this.paymentTransactionObj.amount = this.utilityService.ConvertToFloatWithDecimal(this.paymentTransactionObj.amount);
      this.paymentTransactionObj.netTotal = 0;

      let interestAmt = 0
      if (this.paymentTransactionObj.paymentDetail.interestPer != null && this.paymentTransactionObj.paymentDetail.interestPer?.toString().length > 0 && this.paymentTransactionObj.paymentDetail.interestPer?.toString() != "0")
        interestAmt = this.utilityService.ConvertToFloatWithDecimal(((this.paymentTransactionObj.amount * Number(this.paymentTransactionObj.paymentDetail.interestPer)) / 100));
      this.paymentTransactionObj.paymentDetail.interestAmount = interestAmt;

      let cashHandlingCharge = parseFloat((this.paymentTransactionObj.paymentDetail.cashHandlingCharge ?? 0).toString());
      if (cashHandlingCharge.toString() == '' || cashHandlingCharge.toString() == 'NaN' || cashHandlingCharge.toString() == 'undefined' || cashHandlingCharge.toString() == 'null')
        cashHandlingCharge = 0;

      let logisticCharge = parseFloat((this.paymentTransactionObj.paymentDetail.logisticCharge ?? 0).toString());
      if (logisticCharge.toString() == '' || logisticCharge.toString() == 'NaN' || logisticCharge.toString() == 'undefined' || logisticCharge.toString() == 'null')
        logisticCharge = 0;

      this.paymentTransactionObj.netTotal = this.utilityService.ConvertToFloatWithDecimal(parseFloat(this.paymentTransactionObj.amount?.toString()) + interestAmt + cashHandlingCharge + logisticCharge);

      let addAmt = 0;
      if (additionalAmtManualChange)
        addAmt = parseFloat((this.paymentTransactionObj.addAmount ?? 0).toString());
      else
        this.paymentTransactionObj.addAmount = addAmt;

      if (addAmt.toString() == '' || addAmt.toString() == 'NaN' || addAmt.toString() == 'undefined' || addAmt.toString() == 'null')
        addAmt = 0;

      let netTotal = this.utilityService.ConvertToFloatWithDecimal(parseFloat(this.paymentTransactionObj.netTotal?.toString()) + addAmt);
      if (netTotal.toString() == '' || netTotal.toString() == 'NaN' || netTotal.toString() == 'undefined' || netTotal.toString() == 'null')
        netTotal = 0;

      this.paymentTransactionObj.netTotal = this.utilityService.ConvertToFloatWithDecimal(netTotal);
      this.paymentTransactionObj.ccAmount = Number((this.paymentTransactionObj.netTotal / Number(this.paymentTransactionObj.transactionDetail.toCurRate ? this.paymentTransactionObj.transactionDetail.toCurRate : 0)).toFixed(2)) ?? 0;
      if (this.paymentTransactionObj.ccAmount?.toString() == 'NaN')
        this.paymentTransactionObj.ccAmount = 0;

      // }
      // else {
      //   this.paymentTransactionObj.netTotal = 0;
      //   this.paymentTransactionObj.ccAmount = Number((this.paymentTransactionObj.netTotal / Number(this.paymentTransactionObj.transactionDetail.toCurRate ? this.paymentTransactionObj.transactionDetail.toCurRate : 0)).toFixed(2)) ?? 0;
      //   if (this.paymentTransactionObj.ccAmount?.toString() == 'NaN')
      //     this.paymentTransactionObj.ccAmount = 0;
      // }

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

  public async currencyChange() {
    this.accountingConfigData = await this.accountingconfigService.getAccoutConfig();
    let res = this.accountingconfigService.getFromToCurrencyRate(this.paymentTransactionObj.transactionDetail.fromCurrency, this.paymentTransactionObj.transactionDetail.toCurrency, this.accountingConfigData.currencyConfigs);
    this.paymentTransactionObj.transactionDetail.fromCurRate = res.fromRate;
    this.paymentTransactionObj.transactionDetail.toCurRate = (res.toRate <= 0) ? null : res.toRate;
    if (this.paymentTransactionObj.transactionDetail.toCurRate == null) {
      this.paymentTransactionObj.amount = 0;
      this.paymentTransactionObj.addAmount = 0;
      this.paymentTransactionObj.ccAmount = 0;
    }
    else
      this.calculateTotal();


  }

}
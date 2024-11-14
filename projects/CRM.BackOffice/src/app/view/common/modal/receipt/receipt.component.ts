import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { Router } from '@angular/router';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { NgxSpinnerService } from 'ngx-spinner';
import { AccountingConfig, Ledger, LedgerDNorm, Organization, Transaction } from '../../../../entities';
import { TransactionService, LedgerService, PrintAccInvoiceFormat, OrganizationService, AccountingconfigService, LedgerSummaryService } from '../../../../services';
import { fxCredential } from 'shared/enitites';
import { AppPreloadService, listCurrencyType, listETPaymentMethod, listPaymentType, TransactionType, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import * as moment from 'moment';
import { SelectableSettings } from '@progress/kendo-angular-grid';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';

@Component({
  selector: 'app-receipt',
  templateUrl: './receipt.component.html',
  styleUrls: ['./receipt.component.css']
})

export class ReceiptComponent implements OnInit {
  @Input() transactionObj: Transaction = new Transaction();
  @Output() toggle: EventEmitter<boolean> = new EventEmitter();
  @Output() toggleClose: EventEmitter<boolean> = new EventEmitter();

  public receiptTransactionObj: Transaction = new Transaction();
  public generalTransactionObj: Transaction = new Transaction();
  public printTransactionObj: Transaction = new Transaction();
  public salesTransactions: Transaction[] = [];
  public selectedSalesTransactionObj: Transaction = new Transaction();
  public isEdit = false;
  public fxCredential!: fxCredential;
  public ledgerType: string[] = [];
  public fromLedgerItems: Ledger[] = [];
  public fromLedgerSummary: number = 0;
  public listFromLedgerItems: Array<{ text: string; value: string }> = [];
  public selectedFromLedgerItem: string = "";
  public toLedgerItems: Ledger[] = [];
  public toLedgerSummary: number = 0;
  public listToLedgerItems: Array<{ text: string; group: string, value: string }> = [];
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
  public validAddAmtLimit = true;
  public listCurrencyType: Array<{ text: string; value: string }> = [];
  public isCurrDisable = false;
  public isFromCurrDisable = false;
  public remainAmount: number = 0;
  public isCashHandlingChargeExist : boolean = false;
  public isExpenseLedgerExist : boolean = false;
  public isLogisticChargeExist : boolean = false;
  public isInterestLedgerExist : boolean = false;
  private searchDebounce = new Subject<any>();
  private subscription: Subscription = this.searchDebounce.pipe(debounceTime(400), distinctUntilChanged(), tap(value => this.searchLedgerFilter(value))).subscribe();

  private searchToDebounce = new Subject<any>();
  private subscriptionTo: Subscription = this.searchToDebounce.pipe(debounceTime(200), distinctUntilChanged(), tap(value => this.searchToLedgerFilter(value))).subscribe();

  constructor(private alertDialogService: AlertdialogService,
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
      this.receiptTransactionObj.transactionType = this.transactionObj.transactionType;
      await this.loadOrganizationDetail();
      await this.loadAccountConfigDetail();

      if (!this.transactionObj.id && this.transactionObj.fromLedger.id) {
        this.fromLedgerItems = await this.ledgerService.getAllLedgersByType(['Customer'], this.transactionObj.fromLedger.name.toLowerCase());
        if (this.fromLedgerItems && this.fromLedgerItems.length > 0)
          this.fromLedgerChange(this.transactionObj.fromLedger.id);
        else
          setTimeout(() => {
            this.selectedFromLedgerItem = this.transactionObj.fromLedger.name ?? '';
          }, 0);
      }

      if (this.transactionObj.id != null && this.transactionObj.id.length > 0)
        this.isEdit = true;

      if (!this.isEdit)
        this.clearTransactionData();
      else
        await this.validateEditObj();

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
    this.receiptTransactionObj = new Transaction();
    this.receiptTransactionObj.transactionType = TransactionType.Receipt.toString();
    this.receiptTransactionObj.number = (this.accountingConfigData.lastInvoiceNum + 1).toString();
    this.receiptTransactionObj.tdsAmount = '' as any;
    this.receiptTransactionObj.tcsAmount = '' as any;
    this.receiptTransactionObj.addAmount = '' as any;
    this.receiptTransactionObj.paidAmount = 0 as any;
    this.selectedFromLedgerItem = '';
    this.selectedToLedgerItem = '';
    this.receiptTransactionObj.transactionDate = new Date();
    this.spinnerService.hide();
  }

  public async validateEditObj() {
    this.receiptTransactionObj = JSON.parse(JSON.stringify(this.transactionObj));

    this.receiptTransactionObj.transactionDate = this.getValidEditDate(this.receiptTransactionObj.transactionDate);
    if (this.receiptTransactionObj.paymentDetail.chequeDate)
      this.receiptTransactionObj.paymentDetail.chequeDate = this.getValidEditDate(this.receiptTransactionObj.paymentDetail.chequeDate);

    this.fromLedgerItems = await this.ledgerService.getAllLedgersByType(['Customer'], this.transactionObj.fromLedger.name.toLowerCase());
    this.toLedgerItems = await this.ledgerService.getAllLedgersByNature('Assets', this.transactionObj.toLedger.name.toLowerCase());

    this.fromLedgerChange(this.transactionObj.fromLedger.id, false);
    this.toLedgerChange(this.transactionObj.toLedger.id, false);
    this.printInvoiceNumber = this.transactionObj.number;

    this.salesTransactions = [];
    let isLoadUnPaid = false;
    if (this.receiptTransactionObj.paymentDetail.selectedTransactionId.length > 0) {

      let paidAmount: number = 0;
      for (let index = 0; index < this.receiptTransactionObj.paymentDetail.selectedTransactionId.length; index++) {

        const element = this.receiptTransactionObj.paymentDetail.selectedTransactionId[index];
        let selectedTransaction = await this.transactionService.getTransactionById(element);
        if (selectedTransaction != null) {

          this.selectedSalesTransactionObj = selectedTransaction;
          this.salesTransactions.push(selectedTransaction);
          paidAmount += selectedTransaction.paidAmount;
        }
      }

      paidAmount += (this.receiptTransactionObj.paymentDetail.expence ?? 0) + (this.receiptTransactionObj.paymentDetail.cashHandlingCharge ?? 0) + (this.receiptTransactionObj.paymentDetail.interestAmount ?? 0);
      if (paidAmount < this.receiptTransactionObj.netTotal)
        isLoadUnPaid = true;

      this.remainAmount = Number((this.receiptTransactionObj.netTotal - paidAmount).toFixed(2));
      if (this.receiptTransactionObj.addAmount && this.receiptTransactionObj.addAmount != 0)
        this.remainAmount = this.remainAmount + Math.abs(Number((this.receiptTransactionObj.addAmount).toFixed(2)));
    }
    else {
      isLoadUnPaid = true;
      this.receiptTransactionObj.paidAmount = this.selectedSalesTransactionObj.netTotal;
    }

    if (isLoadUnPaid) {
      let res = await this.transactionService.getUnPaidTransactions(this.receiptTransactionObj.fromLedger.id);
      if (res) {

        res.forEach(element => {
          this.salesTransactions.push(element);
        });
      }
    }
    else    //For Prevent Selection of Sales Transactions in Edit Mode
      this.selectableSettings.checkboxOnly = true;

    this.salesTransactions = this.removeDuplicates(this.salesTransactions, 'number');

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

  public async FromLedgerFilter(value: any) {
    this.spinnerService.show();
    this.searchDebounce.next(value);
  }

  public async searchLedgerFilter(value: any) {
    try {
      this.spinnerService.show();

      this.listFromLedgerItems = [];
      this.fromLedgerItems = [];

      this.fromLedgerItems = await this.ledgerService.getAllLedgersByType(['Customer'], value);
      if (this.fromLedgerItems) {
        if (this.selectedToLedgerItem)
          this.fromLedgerItems = this.fromLedgerItems.filter(z => z.id != this.receiptTransactionObj.toLedger.id);

        this.listFromLedgerItems = [];
        this.fromLedgerItems.forEach(z => { this.listFromLedgerItems.push({ text: z.name, value: z.id }); });
      }

      this.spinnerService.hide();
    } catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async ToLedgerFilter(value: any) {
    this.spinnerService.show();
    this.searchToDebounce.next(value);
  }

  public async searchToLedgerFilter(value: any) {
    try {
      this.spinnerService.show();
      this.listToLedgerItems = [];
      this.toLedgerItems = [];

      this.toLedgerItems = await this.ledgerService.getAllLedgersByNature('Assets', value);
      this.toLedgerItems = this.toLedgerItems.filter(x => x.group.name != "Customer");
      if (this.toLedgerItems) {
        if (this.selectedFromLedgerItem)
          this.toLedgerItems = this.toLedgerItems.filter(z => z.id != this.receiptTransactionObj.fromLedger.id);

        this.listToLedgerItems = [];
        this.toLedgerItems.forEach(z => { this.listToLedgerItems.push({ text: z.name, group: z.group.name, value: z.id }); });
      }

      this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async fromLedgerChange(e: any, calculate = true) {
    try {
      let cloneFromLedger: LedgerDNorm = new LedgerDNorm();
      if (e) {
        let fetch = this.fromLedgerItems.find(x => x.id == e);
        if (fetch) {
          setTimeout(() => {
            this.selectedFromLedgerItem = fetch?.name ?? '';
          }, 0);
          this.receiptTransactionObj.fromLedger = this.mappingLedgerToLedgerDNorm(fetch);
          cloneFromLedger = JSON.parse(JSON.stringify(this.receiptTransactionObj.fromLedger))
        }
      }
      else
        this.receiptTransactionObj.fromLedger = new LedgerDNorm();

      this.fromLedgerSummary = await this.getCurrentFYLedgerSummary(this.receiptTransactionObj.fromLedger.id, TransactionType.Receipt.toString());
      if (calculate) {
        if (!this.receiptTransactionObj.fromLedger.id)
          this.receiptTransactionObj.fromLedger = cloneFromLedger
        await this.getSalesData(this.receiptTransactionObj.fromLedger.id);
        this.calculateTotal();
      }
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

  public async toLedgerChange(e: any, calculate = true) {
    try {
      if (e) {
        let fetch = this.toLedgerItems.find(x => x.id == e);
        if (fetch) {

          setTimeout(() => {
            this.selectedToLedgerItem = fetch?.name ?? '';
          }, 0);
          this.receiptTransactionObj.toLedger = this.mappingLedgerToLedgerDNorm(fetch);

          if (fetch.ccType) {
            this.receiptTransactionObj.transactionDetail.toCurrency = fetch.ccType;
            this.isCurrDisable = true;
          }
          else {
            this.isCurrDisable = false;
            if (this.receiptTransactionObj.transactionDetail.fromCurrency)
              this.receiptTransactionObj.transactionDetail.toCurrency = this.receiptTransactionObj.transactionDetail.fromCurrency;
          }
        }
      }
      else {
        this.isCurrDisable = false;
        this.receiptTransactionObj.toLedger = new LedgerDNorm();
        if (this.receiptTransactionObj.transactionDetail.fromCurrency)
          this.receiptTransactionObj.transactionDetail.toCurrency = this.receiptTransactionObj.transactionDetail.fromCurrency;
      }

      if (calculate) {
        this.getCurrencyRate();
        this.calculateTotal();
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  private mappingLedgerToLedgerDNorm(ledger: Ledger): LedgerDNorm {
    if (!ledger)
      return new LedgerDNorm();

    let dnorm: LedgerDNorm = {
      id: ledger.id,
      group: ledger.group.name,
      name: ledger.name,
      code: ledger.code,
      contactPerson: ledger.contactPerson,
      email: ledger.email,
      mobileNo: ledger.mobileNo,
      phoneNo: ledger.phoneNo,
      faxNo: ledger.faxNo,
      address: ledger.address,
      idents: ledger.idents,
      incomeTaxNo: ledger.incomeTaxNo,
      taxNo: ledger.taxNo
    };

    return dnorm;
  }

  public async getSalesData(id: string) {
    try {
      this.salesTransactions = [];
      if (id) {
        let res = await this.transactionService.getUnPaidTransactions(id);
        if (res)
          this.salesTransactions = res;
      }
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public closeReceiptDialog(): void {
    this.toggleClose.emit(false);
  }

  public selectTransactionData() {
    if (!this.isEdit) {
      this.selectedSalesTransactionObj = new Transaction();
      this.receiptTransactionObj.paymentDetail.selectedTransactionId = [];
      this.receiptTransactionObj.transactionDetail.fromCurrency = null as any;
      this.receiptTransactionObj.amount = 0;
      this.receiptTransactionObj.paymentDetail.logisticCharge = 0;
      this.isFromCurrDisable = false;
    }

    if (this.mySelectionTrans.length > 0) {
      let selectedTrans = this.salesTransactions.filter(z => this.mySelectionTrans.includes(z.id));
      if (selectedTrans.length > 0) {
        this.isFromCurrDisable = true;

        selectedTrans.forEach(z => {
          if (z != null) {
            if ((this.isEdit && this.receiptTransactionObj.transactionDetail.fromCurrency == z.transactionDetail.toCurrency) || (this.receiptTransactionObj.transactionDetail.fromCurrency == null || this.receiptTransactionObj.transactionDetail.fromCurrency == undefined || this.receiptTransactionObj.transactionDetail.fromCurrency == z.transactionDetail.toCurrency)) {
              this.selectedSalesTransactionObj = JSON.parse(JSON.stringify(z));

              if (!this.isEdit) {
                this.receiptTransactionObj.transactionDetail.fromCurrency = z.transactionDetail.toCurrency;
                this.receiptTransactionObj.transactionDetail.fromCurRate = 1;

                if (!(this.receiptTransactionObj.toLedger && this.receiptTransactionObj.toLedger.id)) {
                  this.receiptTransactionObj.transactionDetail.toCurrency = z.transactionDetail.toCurrency;
                  this.receiptTransactionObj.transactionDetail.toCurRate = 1;
                }

                if (z.ccAmount) {
                  this.receiptTransactionObj.amount += this.utilityService.ConvertToFloatWithDecimal(Number(z.ccAmount - (z.paidAmount ?? 0) - (z.transactionDetail.shippingCharge ?? 0)));
                }
                else
                  this.receiptTransactionObj.amount += Number(((z.netTotal * Number(z.transactionDetail.toCurRate ?? 0)) - (z.paidAmount ?? 0) - (z.transactionDetail.shippingCharge ?? 0)).toFixed(2)) ?? 0;
              }

              if (z.ccAmount > z.paidAmount)
                this.receiptTransactionObj.paymentDetail.selectedTransactionId.push(z.id);
            }
            else {
              this.utilityService.showNotification(z.number + ' Transaction currency type not match with other(s)!', 'warning');
              let selectionIndex = this.mySelectionTrans.findIndex(a => a == z.id);
              this.mySelectionTrans.splice(selectionIndex, 1);
            }
          }
        });

        this.receiptTransactionObj.paymentDetail.logisticCharge += selectedTrans.map(z => z.transactionDetail.shippingCharge).reduce((ty, u) => ty + u, 0);
      }
    }

    this.receiptTransactionObj.amount = this.utilityService.ConvertToFloatWithDecimal(this.receiptTransactionObj.amount);
    this.getCurrencyRate();
    this.calculateTotal();
  }

  public getCurrencyRate() {
    let res = this.accountingconfigService.getFromToCurrencyRate(this.receiptTransactionObj.transactionDetail.fromCurrency, this.receiptTransactionObj.transactionDetail.toCurrency, this.accountingConfigData.currencyConfigs);
    this.receiptTransactionObj.transactionDetail.fromCurRate = res.fromRate;
    this.receiptTransactionObj.transactionDetail.toCurRate = res.toRate;
  }

  public async saveTransaction(isNew = false) {
    if (this.receiptTransactionObj.netTotal == null || this.receiptTransactionObj.netTotal <= 0) {
      this.alertDialogService.show('Please add total amount!');
      return;
    }

    if (this.receiptTransactionObj.fromLedger.id == null || this.receiptTransactionObj.fromLedger.id == undefined) {
      this.alertDialogService.show('Please select from ledger!');
      return;
    }

    if (this.receiptTransactionObj.toLedger.id == null || this.receiptTransactionObj.toLedger.id == undefined) {
      this.alertDialogService.show('Please select to ledger!');
      return;
    }

    if (this.salesTransactions.length > 0 && (this.selectedSalesTransactionObj.id == null || this.selectedSalesTransactionObj.id?.length == 0)) {
      this.alertDialogService.ConfirmYesNo("There is already sale transaction for this party, Are you sure you want to add advance payment?", "Add Advance")
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
    this.alertDialogService.ConfirmYesNo("Are you sure you want to add Receipt", "Add Receipt")
      .subscribe(async (res: any) => {
        if (res.flag) {
          try {
            //Calculate paid amount fro receipt if transaction is selected

            if (this.receiptTransactionObj.paymentDetail.selectedTransactionId && this.receiptTransactionObj.paymentDetail.selectedTransactionId.length > 0) {
              var paidAmount = this.receiptTransactionObj.netTotal;
              paidAmount - (this.receiptTransactionObj.paymentDetail.expence ?? 0 + this.receiptTransactionObj.paymentDetail.cashHandlingCharge ?? 0
                + this.receiptTransactionObj.paymentDetail.interestAmount ?? 0 + this.receiptTransactionObj.paymentDetail.logisticCharge ?? 0);
              if (paidAmount && paidAmount > 0)
                this.receiptTransactionObj.paidAmount = paidAmount;
            }

            this.receiptTransactionObj.transactionType = this.transactionObj.transactionType;
            this.receiptTransactionObj.transactionDetail.organization = this.organizationData;

            if (this.receiptTransactionObj.transactionDate != null)
              this.receiptTransactionObj.transactionDate = this.utilityService.setUTCDateFilter(this.receiptTransactionObj.transactionDate);
            if (!this.isEdit)
              this.receiptTransactionObj.createdBy = this.fxCredential.fullName;

            let res = await this.transactionService.insert(this.receiptTransactionObj);
            this.generalTransactionObj.relatedChargeIds = { "parent": res };
            await this.generalTransactionEntry();
            if (res) {
              this.printInvoiceNumber = res;
              this.utilityService.showNotification('Saved Sucessfully!');
              this.spinnerService.hide();

              this.toggle.emit(isNew);
              this.loadDefaultMethods();
              if (this.canPrint)
                this.printGet();

              this.receiptTransactionObj = new Transaction();
              this.salesTransactions = [];
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
      if (this.receiptTransactionObj.paymentDetail.cashHandlingCharge && !this.isCashHandlingChargeExist) {
        this.generalTransactionObj.toLedger = this.accountingConfigData.cashHandlingLedger;
        this.generalTransactionObj.amount = this.receiptTransactionObj.paymentDetail.cashHandlingCharge;
        await this.insertTransactionEntry()
      }

      if (this.receiptTransactionObj.paymentDetail.logisticCharge && !this.isLogisticChargeExist) {
        this.generalTransactionObj.toLedger = this.accountingConfigData.logisticChargeLedger;
        this.generalTransactionObj.amount = this.receiptTransactionObj.paymentDetail.logisticCharge;
        await this.insertTransactionEntry()
      }

      if (this.receiptTransactionObj.paymentDetail.expence && !this.isExpenseLedgerExist) {
        this.generalTransactionObj.toLedger = this.accountingConfigData.expenseLedger;
        this.generalTransactionObj.amount = this.receiptTransactionObj.paymentDetail.expence;
        await this.insertTransactionEntry()
      }

      if (this.receiptTransactionObj.paymentDetail.interestAmount && !this.isInterestLedgerExist) {
        this.generalTransactionObj.toLedger = this.accountingConfigData.interestLedger;
        this.generalTransactionObj.amount = this.receiptTransactionObj.paymentDetail.interestAmount;
        await this.insertTransactionEntry()
      }
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('not added, Please try again later!')
    }
  }
  public async updateGeneralTransactionEntry() {
    try {
      if (this.generalTransactionObj.toLedger.id == this.accountingConfigData.cashHandlingLedger.id) {
        this.isCashHandlingChargeExist = true;
        this.generalTransactionObj.amount = this.receiptTransactionObj.paymentDetail.cashHandlingCharge;
        await this.updateTransactionEntry()
      }

      if (this.generalTransactionObj.toLedger.id == this.accountingConfigData.logisticChargeLedger.id) {
        this.isLogisticChargeExist = true;
        this.generalTransactionObj.amount = this.receiptTransactionObj.paymentDetail.logisticCharge;
        await this.updateTransactionEntry()
      }

      if (this.generalTransactionObj.toLedger.id == this.accountingConfigData.expenseLedger.id) {
        this.isExpenseLedgerExist = true;
        this.generalTransactionObj.amount = this.receiptTransactionObj.paymentDetail.expence;
        await this.updateTransactionEntry()
      }

      if (this.generalTransactionObj.toLedger.id == this.accountingConfigData.interestLedger.id) {
        this.isInterestLedgerExist = true;
        this.generalTransactionObj.amount = this.receiptTransactionObj.paymentDetail.interestAmount;
        await this.updateTransactionEntry()
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
      this.generalTransactionObj.fromLedger = this.receiptTransactionObj.fromLedger
      this.generalTransactionObj.transactionType = TransactionType.General.toString();
      this.generalTransactionObj.transactionDate = new Date();
      this.generalTransactionObj.createdBy = this.fxCredential.fullName;

      if (this.receiptTransactionObj.paymentDetail.interestAmount && this.generalTransactionObj.amount < 0) {
        this.generalTransactionObj.fromLedger = this.accountingConfigData.interestLedger;
        this.generalTransactionObj.toLedger = this.receiptTransactionObj.fromLedger;
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
      this.generalTransactionObj.amount = Math.abs(this.generalTransactionObj.amount)
      this.generalTransactionObj.netTotal = this.utilityService.ConvertToFloatWithDecimal(this.generalTransactionObj.amount);
      this.generalTransactionObj.ccAmount = Number(((this.generalTransactionObj.netTotal ? this.generalTransactionObj.netTotal : 0) * Number(this.generalTransactionObj.transactionDetail.toCurRate ?? 0)).toFixed(2)) ?? 0;
      await this.transactionService.insert(this.generalTransactionObj);
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('not added, Please try again later!')
    }
  }
  //update cash handling , expense, interest, logistic charges transaction entry
  public async updateTransactionEntry() {
    try {
      this.generalTransactionObj.fromLedger = this.receiptTransactionObj.fromLedger
      this.generalTransactionObj.transactionType = TransactionType.General.toString();
      this.generalTransactionObj.transactionDate = new Date();
      this.generalTransactionObj.createdBy = this.fxCredential.fullName;

      if (this.receiptTransactionObj.paymentDetail.interestAmount && this.generalTransactionObj.amount < 0) {
        this.generalTransactionObj.fromLedger = this.accountingConfigData.interestLedger;
        this.generalTransactionObj.toLedger = this.receiptTransactionObj.fromLedger;
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
      this.generalTransactionObj.amount = Math.abs(this.generalTransactionObj.amount)
      this.generalTransactionObj.netTotal = this.utilityService.ConvertToFloatWithDecimal(this.generalTransactionObj.amount);
      this.generalTransactionObj.ccAmount = Number(((this.generalTransactionObj.netTotal ? this.generalTransactionObj.netTotal : 0) * Number(this.generalTransactionObj.transactionDetail.toCurRate ?? 0)).toFixed(2)) ?? 0;
      await this.transactionService.update(this.generalTransactionObj);
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
    this.receiptTransactionObj.transactionType = this.transactionObj.transactionType;
    this.alertDialogService.ConfirmYesNo("Are you sure you want to update transaction", "Update Transaction")
      .subscribe(async (res: any) => {
        if (res.flag) {
          try {
            this.spinnerService.show();
            if (this.receiptTransactionObj.transactionDate != null)
              this.receiptTransactionObj.transactionDate = this.utilityService.setUTCDateFilter(this.receiptTransactionObj.transactionDate);
            if (this.remainAmount != 0 && this.mySelectionTrans.length > 0) {
              if (this.receiptTransactionObj.paymentDetail.selectedTransactionId && this.receiptTransactionObj.paymentDetail.selectedTransactionId.length > 0) {
                var paidAmount = this.receiptTransactionObj.netTotal;
                // paidAmount - (this.receiptTransactionObj.paymentDetail.expence ?? 0 + this.receiptTransactionObj.paymentDetail.cashHandlingCharge ?? 0
                //   + this.receiptTransactionObj.paymentDetail.interestAmount ?? 0 + this.receiptTransactionObj.paymentDetail.logisticCharge ?? 0);
                if (paidAmount && paidAmount > 0)
                  this.receiptTransactionObj.paidAmount = paidAmount;
              }
            }
              
            this.receiptTransactionObj.paymentDetail.selectedTransactionId = Array.from(new Set([...this.receiptTransactionObj.paymentDetail.selectedTransactionId]))

            let res = await this.transactionService.update(this.receiptTransactionObj);
            
            if (Object.keys(this.receiptTransactionObj.relatedChargeIds).length > 0) {
              for (let key in this.receiptTransactionObj.relatedChargeIds) {
                if (this.receiptTransactionObj.relatedChargeIds.hasOwnProperty(key)) {
                  this.generalTransactionObj = await this.transactionService.getbyNumber(this.receiptTransactionObj.relatedChargeIds[key]);

                  await this.updateGeneralTransactionEntry();
                }
              }
              if((this.receiptTransactionObj.paymentDetail.cashHandlingCharge && !this.isCashHandlingChargeExist) || (this.receiptTransactionObj.paymentDetail.logisticCharge && !this.isLogisticChargeExist)
              || (this.receiptTransactionObj.paymentDetail.expence && !this.isExpenseLedgerExist) || (this.receiptTransactionObj.paymentDetail.interestAmount && !this.isInterestLedgerExist)){
                 this.generalTransactionObj = new Transaction();
                this.generalTransactionObj.relatedChargeIds = { "parent": this.receiptTransactionObj.number };
                await this.generalTransactionEntry();
              }
            }
            else if (this.receiptTransactionObj.paymentDetail.cashHandlingCharge || this.receiptTransactionObj.paymentDetail.expence || this.receiptTransactionObj.paymentDetail.interestAmount || this.receiptTransactionObj.paymentDetail.logisticCharge) {
              this.generalTransactionObj.relatedChargeIds = { "parent": this.receiptTransactionObj.number };
              await this.generalTransactionEntry();
            }
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

  public calculateTotal(additionalAmtManualChange = false, tdsamtManualChange = false) {
    try {
      let amt = parseFloat((this.receiptTransactionObj.amount ?? 0).toString());
      if (amt.toString() == '' || amt.toString() == 'NaN' || amt.toString() == 'undefined' || amt.toString() == 'null')
        amt = 0;

      if (this.receiptTransactionObj.amount.toString() == 'NaN')
        this.receiptTransactionObj.amount = null as any;

      this.receiptTransactionObj.netTotal = 0;

      let interestAmt = 0
      if (this.receiptTransactionObj.paymentDetail.interestPer != null && this.receiptTransactionObj.paymentDetail.interestPer?.toString().length > 0 && this.receiptTransactionObj.paymentDetail.interestPer?.toString() != "0")
        interestAmt = this.utilityService.ConvertToFloatWithDecimal(((amt * Number(this.receiptTransactionObj.paymentDetail.interestPer)) / 100));
      this.receiptTransactionObj.paymentDetail.interestAmount = interestAmt;

      //TDS Calculation
      if (this.receiptTransactionObj.fromLedger.id?.length > 0 && !tdsamtManualChange) {
        let party = this.fromLedgerItems.find(z => z.id == this.receiptTransactionObj.fromLedger.id);
        if (party && party.tdsLimit && party.tdsRate) {
          let netTotal = this.receiptTransactionObj.netTotal;

          //set overall payment total of current FY
          if (this.fromLedgerSummary)
            netTotal = this.receiptTransactionObj.netTotal + this.fromLedgerSummary;

          //Check if exceed limit
          if (netTotal > (party.tdsLimit ?? 0)) {
            let amt = netTotal - party.tdsLimit;
            this.receiptTransactionObj.tdsAmount = this.utilityService.ConvertToFloatWithDecimal((amt * party.tdsRate) / 100);
          }
        }
      }

      let cashHandlingCharge = parseFloat((this.receiptTransactionObj.paymentDetail.cashHandlingCharge ?? 0).toString());
      if (cashHandlingCharge.toString() == '' || cashHandlingCharge.toString() == 'NaN' || cashHandlingCharge.toString() == 'undefined' || cashHandlingCharge.toString() == 'null')
        cashHandlingCharge = 0;

      let logisticCharge = parseFloat((this.receiptTransactionObj.paymentDetail.logisticCharge ?? 0).toString());
      if (logisticCharge.toString() == '' || logisticCharge.toString() == 'NaN' || logisticCharge.toString() == 'undefined' || logisticCharge.toString() == 'null')
        logisticCharge = 0;

      let expence = parseFloat((this.receiptTransactionObj.paymentDetail.expence ?? 0).toString());
      if (expence.toString() == '' || expence.toString() == 'NaN' || expence.toString() == 'undefined' || expence.toString() == 'null')
        expence = 0;

      this.receiptTransactionObj.netTotal = this.utilityService.ConvertToFloatWithDecimal(parseFloat(amt.toString()) + interestAmt + logisticCharge + cashHandlingCharge + expence);

      let addAmt = 0;
      if (additionalAmtManualChange)
        addAmt = parseFloat((this.receiptTransactionObj.addAmount ?? 0).toString());
      else
        this.receiptTransactionObj.addAmount = addAmt;

      if (addAmt.toString() == '' || addAmt.toString() == 'NaN' || addAmt.toString() == 'undefined' || addAmt.toString() == 'null')
        addAmt = 0;

      let netTotal = this.utilityService.ConvertToFloatWithDecimal(parseFloat(this.receiptTransactionObj.netTotal.toString()) + addAmt);
      if (netTotal.toString() == '' || netTotal.toString() == 'NaN' || netTotal.toString() == 'undefined' || netTotal.toString() == 'null')
        netTotal = 0;

      this.receiptTransactionObj.netTotal = this.utilityService.ConvertToFloatWithDecimal(netTotal + Number(this.receiptTransactionObj.tdsAmount ?? 0) + Number(this.receiptTransactionObj.tcsAmount ?? 0));
      this.receiptTransactionObj.ccAmount = this.utilityService.ConvertToFloatWithDecimal(Number(Number(this.receiptTransactionObj.netTotal) * Number(this.receiptTransactionObj.transactionDetail.toCurRate ?? 0))) ?? 0;
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
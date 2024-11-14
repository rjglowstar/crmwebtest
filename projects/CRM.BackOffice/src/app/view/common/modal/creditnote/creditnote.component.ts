import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { DataResult, process } from '@progress/kendo-data-query';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { fromEvent } from 'rxjs';
import { debounceTime, filter, map } from 'rxjs/operators';
import { fxCredential } from 'shared/enitites';
import { TransactionType, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { AccountingConfig, InventoryItems, PackingItem, Transaction, TransactionItem, TransactItemDNorm } from '../../../../entities';
import { AccountingconfigService, CommuteService, InventoryService, LogisticService, OrganizationService, PrintInvoiceFormat, TransactionService, TransactItemService } from '../../../../services';

@Component({
  selector: 'app-creditnote',
  templateUrl: './creditnote.component.html',
  styleUrls: ['./creditnote.component.css']
})
export class CreditNoteComponent implements OnInit {
  //#region Arrays & Objects
  @Output() toggle: EventEmitter<boolean> = new EventEmitter();
  @Output() toggleClose: EventEmitter<boolean> = new EventEmitter();
  @Input() transactionObj: Transaction = new Transaction();
  public creditNoteTransactionObj: Transaction = new Transaction();
  public transactionTotalAmount: number = 0;
  public accountConfig = new AccountingConfig();
  public transactItemsDNorm: TransactItemDNorm[] = [];

  public fxCredentials!: fxCredential;

  public totalPacketAmount: number = 0;
  public totalRap: number = 0;
  public avgDiscPer: number = 0;

  public isShowCheckBoxAll: boolean = true;
  public isEdit: boolean = false;

  @ViewChild('BarcodeInput') barcodeInput!: ElementRef;
  public oldBarcodeText: string = '';
  public searchInvoice: string = '';
  //#endregion

  //#region Grid Data
  public pageSize = 10;
  public skip = 0;
  public gridViewPackageList!: DataResult;
  public gridShowPackingList: PackingItem[] = new Array<PackingItem>();

  public selectableSettings: SelectableSettings = { mode: 'multiple' };
  public mySelectionTrans: string[] = [];

  public mySelectionPackage: string[] = [];
  //#endregion

  //#region Model Flags
  public isPackinglistDialog: boolean = false;
  public validAddAmtLimit: boolean = true;
  //#endregion

  constructor(
    public router: Router,
    private alertDialogService: AlertdialogService,
    public utilityService: UtilityService,
    private spinnerService: NgxSpinnerService,
    private accountConfigService: AccountingconfigService,
    private transactItemService: TransactItemService,
    private transactionService: TransactionService,
    public logisticService: LogisticService,
    public printInvoiceFormat: PrintInvoiceFormat,
    public organizationService: OrganizationService,
    private inventoryService: InventoryService,
    private commuteService: CommuteService,
  ) { }

  async ngOnInit() {
    await this.defaultMethodLoad();
  }

  //#region Init Data
  public async defaultMethodLoad() {
    this.fxCredentials = JSON.parse(sessionStorage.getItem("fxCredentials") ?? '') as fxCredential;
    if (this.fxCredentials == null || this.fxCredentials?.origin == null || (this.fxCredentials?.origin.toLowerCase() != 'accounts' && this.fxCredentials?.origin.toLowerCase() != 'admin')) {
      this.alertDialogService.show('You are not allow to see order detail!');
      this.router.navigate(["dashboard"]);
      return;
    }

    this.spinnerService.show();
    await this.loadAccConfig();
    await this.loadTransactItemDNorm();

    if (!this.transactionObj.id) {
      this.clearTransactionData();
      setTimeout(() => {
        this.onAddBarcode();
      }, 100);
      this.creditNoteTransactionObj.number = (this.accountConfig.lastInvoiceNum + 1).toString();
    }
    else
      await this.validateEditObj();

    this.spinnerService.hide();
  }

  public async loadAccConfig() {
    try {
      this.accountConfig = await this.accountConfigService.getAccoutConfig();
    } catch (error) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Data load fail, Try again later!');
    }
  }

  public async loadTransactItemDNorm() {
    try {
      let data = await this.transactItemService.getTransactItemDNorm();
      if (data)
        this.transactItemsDNorm = data;

    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Transact Item not load, Try gain later!');
    }
  }
  //#endregion

  //#region On Changes Functions
  public closeDialog(flag: boolean): void {
    this.toggleClose.emit(flag);
  }

  public async validateEditObj() {
    this.isEdit = true;
    this.creditNoteTransactionObj = JSON.parse(JSON.stringify(this.transactionObj));

    if (this.creditNoteTransactionObj.packingList && this.creditNoteTransactionObj.packingList.length > 0)
      this.loadPacketListPaging();

    // this.initPartyAddress();
    this.spinnerService.hide();
  }

  public getValidDate(date: any): Date {
    const day = moment(date).date();
    const month = moment(date).month();
    const year = moment(date).year();
    var newDate = new Date(year, month, day);
    return newDate;
  }

  public clearTransactionData() {
    this.mySelectionPackage = [];
    this.mySelectionTrans = [];
    this.creditNoteTransactionObj.transactionType = TransactionType.CreditNote.toString();
    this.calculateTransactionItems();
  }

  //Search Sales Transaction from invoice No
  public onAddBarcode() {
    try {
      fromEvent(this.barcodeInput.nativeElement, 'keyup').pipe(
        map((event: any) => {
          return event.target.value;
        })
        , filter(res => res.length > 1)
        , debounceTime(1000)
      ).subscribe(async (barcodeText: string) => {
        if (this.oldBarcodeText == barcodeText)
          return;

        let transaction = await this.transactionService.getTransactionbyNumber(barcodeText);
        if (transaction != null && transaction.id != null) {
          let transactionObject = new Transaction();

          transactionObject.transactionType = TransactionType.CreditNote.toString();
          transactionObject.number = (this.accountConfig.lastInvoiceNum + 1).toString();
          transactionObject.refNumber = transaction.number;

          transactionObject.fromLedger = transaction.toLedger;
          transactionObject.toLedger = transaction.fromLedger;

          transactionObject.packingList = transaction.packingList;
          transactionObject.items = transaction.items;

          transactionObject.amount = transaction.amount;
          transactionObject.discount = transaction.discount;
          transactionObject.taxAmount = transaction.taxAmount;
          transactionObject.addAmount = transaction.addAmount;
          transactionObject.netTotal = transaction.netTotal;
          transactionObject.tdsAmount = transaction.tdsAmount;
          transactionObject.tcsAmount = transaction.tcsAmount;
          transactionObject.paidAmount = transaction.paidAmount;

          if (transaction.transactionDetail.fromCurrency == transaction.transactionDetail.toCurrency) {
            transactionObject.transactionDetail.fromCurrency = transaction.transactionDetail.toCurrency;
            transactionObject.transactionDetail.toCurrency = transaction.transactionDetail.fromCurrency;
            transactionObject.transactionDetail.fromCurRate = transaction.transactionDetail.toCurRate;
            transactionObject.transactionDetail.toCurRate = transaction.transactionDetail.fromCurRate;
          }

          this.creditNoteTransactionObj = JSON.parse(JSON.stringify(transactionObject));
          this.calculateTransactionItems();

          if (this.creditNoteTransactionObj.packingList && this.creditNoteTransactionObj.packingList.length > 0)
            this.loadPacketListPaging();
        }
        else
          this.utilityService.showNotification('No Sales Transaction Found..!', 'warning');

        this.oldBarcodeText = barcodeText;
      });
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }
  //#endregion

  //#region Mapping Data
  public mappingInvItemToTransactionPackage(invItems: InventoryItems[]): PackingItem[] {
    let items: PackingItem[] = [];
    invItems.forEach(z => {
      let obj = new PackingItem();
      obj.invId = z.id;
      obj.stoneId = z.stoneId;
      obj.shape = z.shape;
      obj.weight = z.weight;
      obj.color = z.color;
      obj.clarity = z.clarity;
      obj.certificateNo = z.certificateNo;
      obj.price = JSON.parse(JSON.stringify(z.price));
      items.push(obj);
    });

    return items;
  }
  //#endregion

  //#region Transaction Item section
  public calculateTransactionItems(additionalAmtManualChange = false) {
    this.creditNoteTransactionObj.amount = this.utilityService.ConvertToFloatWithDecimal(this.creditNoteTransactionObj.items.map(z => z.amount).reduce((ty, u) => ty + u, 0));
    this.creditNoteTransactionObj.discount = this.utilityService.ConvertToFloatWithDecimal(this.creditNoteTransactionObj.items.map(z => z.discount).reduce((ty, u) => ty + u, 0));
    this.creditNoteTransactionObj.taxAmount = this.utilityService.ConvertToFloatWithDecimal(this.creditNoteTransactionObj.items.map(z => z.taxAmount).reduce((ty, u) => ty + u, 0));
    this.transactionTotalAmount = this.utilityService.ConvertToFloatWithDecimal(this.creditNoteTransactionObj.items.map(z => z.total).reduce((ty, u) => ty + u, 0));

    let addAmt = this.utilityService.setadditionalAmountForTransaction(this.transactionTotalAmount);
    if (additionalAmtManualChange)
      addAmt = parseFloat((this.creditNoteTransactionObj.addAmount ?? 0).toString());
    else {
      if (this.creditNoteTransactionObj.insuranceCharge)
        addAmt = parseFloat((this.creditNoteTransactionObj.insuranceCharge ?? 0).toString());

      this.creditNoteTransactionObj.addAmount = addAmt;
    }

    if (addAmt.toString() == '' || addAmt.toString() == 'NaN' || addAmt.toString() == 'undefined' || addAmt.toString() == 'null')
      addAmt = 0;

    this.creditNoteTransactionObj.netTotal = this.utilityService.ConvertToFloatWithDecimal((addAmt + this.transactionTotalAmount));
  }

  public deleteItem(index: number) {
    this.alertDialogService.ConfirmYesNo("Are you sure you want to delete?", "Delete")
      .subscribe((res: any) => {
        if (res.flag) {
          try {
            this.creditNoteTransactionObj.items.splice(index, 1);
            this.calculateTransactionItems();
          }
          catch (error: any) {
            this.spinnerService.hide();
            this.alertDialogService.show(error.error)
          }
        }
      });
  }
  //#endregion

  //#region  Package list section 
  public togglePackinglistDialog(): void {
    this.isPackinglistDialog = !this.isPackinglistDialog;
    if (!this.isPackinglistDialog)
      this.skip = 0;
  }

  public pageChange(event: PageChangeEvent): void {
    this.spinnerService.show();
    this.gridShowPackingList = [];
    this.skip = event.skip;
    this.loadPacketListPaging();
  }

  public async selectAllPackingList(event: string) {
    this.mySelectionPackage = [];
    if (event.toLowerCase() == 'checked')
      this.mySelectionPackage = this.creditNoteTransactionObj.packingList.map(z => z.stoneId);
  }

  public openDeleteDialog() {
    this.alertDialogService.ConfirmYesNo("Are you sure you want to delete?", "Delete")
      .subscribe((res: any) => {
        if (res.flag) {
          try {
            this.deletePackingList();
          }
          catch (error: any) {
            this.spinnerService.hide();
            this.alertDialogService.show(error.error)
          }
        }
      });
  }

  public deletePackingList() {
    this.mySelectionPackage.forEach(z => {
      let index = this.creditNoteTransactionObj.packingList.findIndex(a => a.stoneId.toLowerCase() == z.toLowerCase());
      if (index > -1)
        this.creditNoteTransactionObj.packingList.splice(index, 1);
    });

    this.totalPacketAmount = Number((this.creditNoteTransactionObj.packingList.map(z => (z.price.netAmount ?? 0)).reduce((ty, u) => ty + u, 0)).toFixed(2));
    this.totalRap = Number((this.creditNoteTransactionObj.packingList.map(z => ((z.price.rap ?? 0) * (z.weight))).reduce((ty, u) => ty + u, 0)).toFixed(2));
    if (this.totalPacketAmount > 0)
      this.avgDiscPer = Number((((this.totalPacketAmount / this.totalRap) * 100) - 100).toFixed(2));
    else
      this.avgDiscPer = 0;

    this.loadPacketListPaging();
    this.mySelectionPackage = [];
  }

  public async loadPacketListPaging() {
    this.gridShowPackingList = new Array<PackingItem>();
    if (this.creditNoteTransactionObj.packingList.length > 0) {
      for (let i = this.skip; i < this.pageSize + this.skip; i++) {
        const element = this.creditNoteTransactionObj.packingList[i];
        if (element)
          this.gridShowPackingList.push(element);
      }
    }

    this.loadPacketItemInventoryGrid(this.creditNoteTransactionObj.packingList);
  }

  public async loadPacketItemInventoryGrid(packingItems: PackingItem[]) {
    this.gridViewPackageList = process(this.gridShowPackingList, {});
    this.gridViewPackageList.total = packingItems.length;
    this.totalPacketAmount = Number((packingItems.map(z => (z.price.netAmount ?? 0)).reduce((ty, u) => ty + u, 0)).toFixed(2));
    this.totalRap = Number((packingItems.map(z => ((z.price.rap ?? 0) * (z.weight))).reduce((ty, u) => ty + u, 0)).toFixed(2));
    if (this.totalPacketAmount > 0)
      this.avgDiscPer = Number((((this.totalPacketAmount / this.totalRap) * 100) - 100).toFixed(2));
    else
      this.avgDiscPer = 0;

    this.AddItemByPackageList(false);
    this.spinnerService.hide();
  }

  public AddItemByPackageList(isToggle = true) {
    let transItem = this.transactItemsDNorm.find(z => z.name.toUpperCase() == 'CUT & POLISH DIAMONDS');
    if (transItem && transItem != null && transItem != undefined) {
      let existsItemIndex = this.creditNoteTransactionObj.items.findIndex(z => z.item.id == transItem?.id);
      if (existsItemIndex > -1)
        this.creditNoteTransactionObj.items.splice(existsItemIndex, 1);

      if (this.mySelectionPackage.length > 0) {
        this.creditNoteTransactionObj.packingList = this.creditNoteTransactionObj.packingList.filter(z => this.mySelectionPackage.includes(z.stoneId))
        this.totalPacketAmount = Number((this.creditNoteTransactionObj.packingList.map(z => (z.price.netAmount ?? 0)).reduce((ty, u) => ty + u, 0)).toFixed(2));
        this.totalRap = Number((this.creditNoteTransactionObj.packingList.map(z => ((z.price.rap ?? 0) * (z.weight))).reduce((ty, u) => ty + u, 0)).toFixed(2));
        if (this.totalPacketAmount > 0)
          this.avgDiscPer = Number((((this.totalPacketAmount / this.totalRap) * 100) - 100).toFixed(2));
        else
          this.avgDiscPer = 0;
      }

      if (this.creditNoteTransactionObj.packingList.length > 0) {
        let transactionItemObj = new TransactionItem();
        transactionItemObj.item = transItem;
        transactionItemObj.quantity = this.creditNoteTransactionObj.packingList.length;
        transactionItemObj.amount = this.totalPacketAmount;
        transactionItemObj.rate = this.utilityService.ConvertToFloatWithDecimal(this.totalPacketAmount / this.creditNoteTransactionObj.packingList.length);
        transactionItemObj.total = this.totalPacketAmount;
        transactionItemObj.discPerc = 0;
        transactionItemObj.discount = 0;
        transactionItemObj.taxAmount = 0;

        this.creditNoteTransactionObj.items.push(JSON.parse(JSON.stringify(transactionItemObj)));
      }

      this.calculateTransactionItems();
      if (isToggle)
        this.togglePackinglistDialog();
    }
    else
      this.alertDialogService.show('Please add "CUT & POLISH DIAMONDS" in Transact Item');

  }
  //#endregion

  //#region Save | Add Credit Note Transaction
  public async saveTransaction(isNew = false) {
    if (this.creditNoteTransactionObj.items == null || this.creditNoteTransactionObj.items?.length == 0) {
      this.alertDialogService.show('Please add at least one transaction item!');
      return;
    }

    this.alertDialogService.ConfirmYesNo(`Are you sure you want to save credit note transaction`, `Save Credit Note`)
      .subscribe(async (res: any) => {
        if (res.flag) {
          try {
            this.spinnerService.show();

            await this.insertTransaction();
            if (!isNew)
              this.toggle.emit(false);
          }
          catch (error: any) {
            console.error(error);
            this.spinnerService.hide();
            this.alertDialogService.show('Transaction not added, Please contact administrator!')
          }
        }
      });
  }

  public async insertTransaction() {
    try {
      this.creditNoteTransactionObj.transactionDate = new Date();
      this.creditNoteTransactionObj.transactionType = TransactionType.CreditNote.toString();
      
      let res = await this.transactionService.insert(this.creditNoteTransactionObj);
      if (res) {
        this.utilityService.showNotification('Purchase transaction added successfully! Transactions No: ' + res);
        this.clearTransactionData();
        this.spinnerService.hide();
      }
      else {
        this.spinnerService.hide();
        this.alertDialogService.show('Purchase transaction not add, Please try again later!', 'error');
      }
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Purchase transaction not add, Please try again later!', 'error')
    }
  }
  //#endregion
}
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { DataResult, process } from '@progress/kendo-data-query';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { InverntoryError, InvUpdateItem, InvUpdateItemResponse } from '../../../../businessobjects';
import { fromEvent } from 'rxjs';
import { debounceTime, filter, map } from 'rxjs/operators';
import { fxCredential } from 'shared/enitites';
import { TransactionType, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { AccountingConfig, InventoryItems, PackingItem, Transaction, TransactionItem, TransactItemDNorm } from '../../../../entities';
import { AccountingconfigService, CommuteService, InventoryService, LedgerService, LogisticService, MasterConfigService, OrganizationService, PrintInvoiceFormat, TransactionService, TransactItemService } from '../../../../services';

@Component({
  selector: 'app-debitnote',
  templateUrl: './debitnote.component.html',
  styleUrls: ['./debitnote.component.css']
})
export class DebitNoteComponent implements OnInit {
  //#region Arrays & Objects
  @Output() toggle: EventEmitter<boolean> = new EventEmitter();
  @Output() toggleClose: EventEmitter<boolean> = new EventEmitter();
  @Input() transactionObj: Transaction = new Transaction();
  public debitNoteTransactionObj: Transaction = new Transaction();
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

  public errorMessagesByStoneId: InverntoryError[] = [];
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
    private ledgerService: LedgerService,
    public logisticService: LogisticService,
    public printInvoiceFormat: PrintInvoiceFormat,
    public organizationService: OrganizationService,
    private inventoryService: InventoryService,
    private masterConfigService: MasterConfigService,
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
      this.debitNoteTransactionObj.number = (this.accountConfig.lastInvoiceNum + 1).toString();
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
    this.debitNoteTransactionObj = JSON.parse(JSON.stringify(this.transactionObj));

    if (this.debitNoteTransactionObj.packingList && this.debitNoteTransactionObj.packingList.length > 0)
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
    this.debitNoteTransactionObj.transactionType = TransactionType.DebitNote.toString();
    this.calculateTransactionItems();
  }

  //Search Purchase Transaction from TransactionNo
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

        let transaction = await this.transactionService.getbyNumber(barcodeText, 'debitnote');
        if (transaction != null && transaction.id != null) {
          let transactionObject = new Transaction();

          transactionObject.transactionType = TransactionType.DebitNote.toString();
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

          this.debitNoteTransactionObj = JSON.parse(JSON.stringify(transactionObject));
          this.calculateTransactionItems();

          if (this.debitNoteTransactionObj.packingList && this.debitNoteTransactionObj.packingList.length > 0)
            this.loadPacketListPaging();
        }
        else
          this.utilityService.showNotification('No purchase transaction Found..!', 'warning');

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
    this.debitNoteTransactionObj.amount = this.utilityService.ConvertToFloatWithDecimal(this.debitNoteTransactionObj.items.map(z => z.amount).reduce((ty, u) => ty + u, 0));
    this.debitNoteTransactionObj.discount = this.utilityService.ConvertToFloatWithDecimal(this.debitNoteTransactionObj.items.map(z => z.discount).reduce((ty, u) => ty + u, 0));
    this.debitNoteTransactionObj.taxAmount = this.utilityService.ConvertToFloatWithDecimal(this.debitNoteTransactionObj.items.map(z => z.taxAmount).reduce((ty, u) => ty + u, 0));
    this.transactionTotalAmount = this.utilityService.ConvertToFloatWithDecimal(this.debitNoteTransactionObj.items.map(z => z.total).reduce((ty, u) => ty + u, 0));

    let addAmt = this.utilityService.setadditionalAmountForTransaction(this.transactionTotalAmount);
    if (additionalAmtManualChange)
      addAmt = parseFloat((this.debitNoteTransactionObj.addAmount ?? 0).toString());
    else {
      if (this.debitNoteTransactionObj.insuranceCharge)
        addAmt = parseFloat((this.debitNoteTransactionObj.insuranceCharge ?? 0).toString());

      this.debitNoteTransactionObj.addAmount = addAmt;
    }

    if (addAmt.toString() == '' || addAmt.toString() == 'NaN' || addAmt.toString() == 'undefined' || addAmt.toString() == 'null')
      addAmt = 0;

    this.debitNoteTransactionObj.netTotal = this.utilityService.ConvertToFloatWithDecimal((addAmt + this.transactionTotalAmount));
  }

  public deleteItem(index: number) {
    this.alertDialogService.ConfirmYesNo("Are you sure you want to delete?", "Delete")
      .subscribe((res: any) => {
        if (res.flag) {
          try {
            this.debitNoteTransactionObj.items.splice(index, 1);
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

  //#region Package list section 
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
      this.mySelectionPackage = this.debitNoteTransactionObj.packingList.filter(z => z.isDisabled != true).map(z => z.stoneId);
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
      let index = this.debitNoteTransactionObj.packingList.findIndex(a => a.stoneId.toLowerCase() == z.toLowerCase());
      if (index > -1)
        this.debitNoteTransactionObj.packingList.splice(index, 1);
    });

    this.totalPacketAmount = Number((this.debitNoteTransactionObj.packingList.map(z => (z.price.netAmount ?? 0)).reduce((ty, u) => ty + u, 0)).toFixed(2));
    this.totalRap = Number((this.debitNoteTransactionObj.packingList.map(z => ((z.price.rap ?? 0) * (z.weight))).reduce((ty, u) => ty + u, 0)).toFixed(2));
    if (this.totalPacketAmount > 0)
      this.avgDiscPer = Number((((this.totalPacketAmount / this.totalRap) * 100) - 100).toFixed(2));
    else
      this.avgDiscPer = 0;

    this.loadPacketListPaging();
    this.mySelectionPackage = [];
  }

  public async loadPacketListPaging() {
    this.gridShowPackingList = new Array<PackingItem>();
    if (this.debitNoteTransactionObj.packingList.length > 0) {
      for (let i = this.skip; i < this.pageSize + this.skip; i++) {
        const element = this.debitNoteTransactionObj.packingList[i];
        if (element)
          this.gridShowPackingList.push(element);
      }
    }

    //Check for already removed stone(s)
    let stoneIds = this.debitNoteTransactionObj.packingList.map(z => z.stoneId);
    var res = await this.inventoryService.getInventoryByStoneIds(stoneIds);
    if (res && res.length > 0) {
      let existsStoneIds = res.map(z => z.stoneId);
      let notExistsStone = stoneIds.filter(z => !existsStoneIds.includes(z));
      this.validateValues(this.debitNoteTransactionObj.packingList, notExistsStone, "Stone already deleted from inventory!");
    }
    else
      this.validateValues(this.debitNoteTransactionObj.packingList, stoneIds, "Stone not exists in inventory!");

    this.loadPacketItemInventoryGrid(this.debitNoteTransactionObj.packingList);
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

    if (!this.isEdit)
      this.AddItemByPackageList(false);
      
    this.spinnerService.hide();
  }

  public validateValues(data: any, ids: string[], message: string, isPriceAvai: boolean = true) {
    ids.forEach(element => {
      let messageArray = [];
      messageArray.push(message)
      let findErrorIndex = this.errorMessagesByStoneId.findIndex(x => x.stoneId == element);
      if (findErrorIndex >= 0) {
        let messageIndex = this.errorMessagesByStoneId[findErrorIndex].messageList.findIndex(x => x == message);
        if (messageIndex < 0)
          this.errorMessagesByStoneId[findErrorIndex].messageList.push(message)
      }
      else
        this.errorMessagesByStoneId.push({ stoneId: element, messageList: messageArray });
      let index = data.findIndex((x: any) => x.stoneId == element);
      if (index >= 0) {
        data[index].isDisabled = true;
        data[index].isPriceAvailable = isPriceAvai;
      }
    });
  }

  public fetchError(id: string) {
    return this.errorMessagesByStoneId.find(x => x.stoneId == id)
  }

  public AddItemByPackageList(isToggle = true) {
    let transItem = this.transactItemsDNorm.find(z => z.name.toUpperCase() == 'CUT & POLISH DIAMONDS');
    if (transItem && transItem != null && transItem != undefined) {
      let existsItemIndex = this.debitNoteTransactionObj.items.findIndex(z => z.item.id == transItem?.id);
      if (existsItemIndex > -1)
        this.debitNoteTransactionObj.items.splice(existsItemIndex, 1);

      let validPackageList = this.debitNoteTransactionObj.packingList.filter(z => z.isDisabled != true);
      if (validPackageList.length > 0) {
        let totalPacketAmount = Number((validPackageList.map(z => (z.price.netAmount ?? 0)).reduce((ty, u) => ty + u, 0)).toFixed(2));

        let transactionItemObj = new TransactionItem();
        transactionItemObj.item = transItem;
        transactionItemObj.quantity = validPackageList.length;
        transactionItemObj.amount = totalPacketAmount;
        transactionItemObj.rate = this.utilityService.ConvertToFloatWithDecimal(totalPacketAmount / validPackageList.length);
        transactionItemObj.total = totalPacketAmount;
        transactionItemObj.discPerc = 0;
        transactionItemObj.discount = 0;
        transactionItemObj.taxAmount = 0;

        this.debitNoteTransactionObj.items.push(JSON.parse(JSON.stringify(transactionItemObj)));
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
    if (this.debitNoteTransactionObj.items == null || this.debitNoteTransactionObj.items?.length == 0) {
      this.alertDialogService.show('Please add at least one transaction item!');
      return;
    }

    this.alertDialogService.ConfirmYesNo(`Are you sure you want to save debit note transaction`, `Save Debit Note`)
      .subscribe(async (res: any) => {
        if (res.flag) {
          try {
            this.spinnerService.show();
            let validPackageList = this.debitNoteTransactionObj.packingList.filter(z => z.isDisabled != true);
            if (validPackageList != null && validPackageList.length > 0) {
              let stoneIds = validPackageList.map(z => z.stoneId);

              let req: InvUpdateItem = new InvUpdateItem();
              req.isRemove = true;
              req.stoneIds = stoneIds;

              //Hard delete from front office (not gonna delete if at least stone is in hold)
              let res = await this.commuteService.removeBulkInventoryItems(req, true)
              if (res) {
                //Return request if at least stone is in hold
                if (res.holdStoneIds && res.holdStoneIds.length > 0) {
                  this.spinnerService.hide();
                  this.alertDialogService.show(res.holdStoneIds.join(', ') + ' stone(s) in hold, Please release first!');
                  return;
                }

                //Hard delete from back office
                var result = await this.inventoryService.deleteInventoriesData(stoneIds);
                if (result)
                  await this.insertTransaction();
                else {
                  this.spinnerService.hide();
                  this.alertDialogService.show('stone(s) does not exists in inventory, Please contact administrator!');
                  return;
                }
              }
            }
            else
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
      this.debitNoteTransactionObj.transactionDate = new Date();
      this.debitNoteTransactionObj.transactionType = TransactionType.DebitNote.toString();

      this.debitNoteTransactionObj.packingList = this.debitNoteTransactionObj.packingList.filter(z => z.isDisabled != true);
      let res = await this.transactionService.insert(this.debitNoteTransactionObj);
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
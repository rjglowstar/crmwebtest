import { Component, EventEmitter, ElementRef, HostListener, OnInit, Output, ViewChild } from '@angular/core';
import { AlertdialogService } from 'shared/views';
import { NgxSpinnerService } from 'ngx-spinner';
import { ConfigService, UtilityService } from 'shared/services';
import { GridPropertiesService, LedgerService, OrderService, SalesStatisticsService, TransactionService } from '../../../services';
import { DateRangePopupComponent } from '@progress/kendo-angular-dateinputs';
import { fxCredential, GridConfig, GridMasterConfig } from 'shared/enitites';
import { SalesStatistics, SalesStatisticsSearchCriteria } from '../../../businessobjects';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { Ledger, OrderItem, Transaction } from '../../../entities';
import { DatePipe } from '@angular/common';
import { GridDetailConfig } from 'shared/businessobjects';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';

@Component({
  selector: 'app-salesstatistics',
  templateUrl: './salesstatistics.component.html',
  styleUrls: ['./salesstatistics.component.css']
})
export class SalesStatisticsComponent implements OnInit {
  @Output() toggle: EventEmitter<boolean> = new EventEmitter();

  //#region Grid
  public gridConfig!: GridConfig;
  public fields!: GridDetailConfig[];
  public gridMasterConfigResponse!: GridMasterConfig;
  public isGridConfig: boolean = false;
  //#endregion

  //#region Filter Data
  @ViewChild("anchor") public anchor!: ElementRef<any>;
  @ViewChild("popup", { read: DateRangePopupComponent }) public popup!: DateRangePopupComponent; public showFilterRange = false;
  public range = { start: new Date(), end: new Date() };

  @ViewChild("paymentAnchor") public paymentAnchor!: ElementRef<any>;
  @ViewChild("paymentPopup", { read: DateRangePopupComponent }) public paymentPopup!: DateRangePopupComponent; public showPaymentFilterRange = false;
  public paymentRange = { start: new Date(), end: new Date() };

  @ViewChild("deliveryAnchor") public deliveryAnchor!: ElementRef<any>;
  @ViewChild("deliveryPopup", { read: DateRangePopupComponent }) public deliveryPopup!: DateRangePopupComponent; public showDeliverFilterRange = false;
  public deliveryRange = { start: new Date(), end: new Date() };

  public listPartyLedgerItems: Array<{ text: string; value: string }> = [];
  public selectedPartyLedgerItem: string = "";

  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains'
  };

  public ledgerItems: Ledger[] = [];
  //#endregion

  //#region List & Objects
  public fxCredentials!: fxCredential;

  public salesstatisticsFilterCriteria: SalesStatisticsSearchCriteria = new SalesStatisticsSearchCriteria();
  public reportData: SalesStatistics[] = [];

  public excelFile: any[] = [];

  public listStatus: Array<{ name: string; value: string; isChecked: boolean }> = [];

  public transactionObj: Transaction = new Transaction();
  public isSales: boolean = false;
  public isReceiptDialog = false;

  public totalRecords = 0;
  public totalCCAmt = 0;
  public totalPaidAmt = 0;
  //#endregion

  private searchDebounce = new Subject<any>();
  private subscription: Subscription = this.searchDebounce.pipe(debounceTime(400), distinctUntilChanged(), tap(value => this.searchLedgerFilter(value))).subscribe();

  constructor(
    private spinnerService: NgxSpinnerService,
    private alertDialogService: AlertdialogService,
    public utilityService: UtilityService,
    private salesStatisticsService: SalesStatisticsService,
    private orderService: OrderService,
    public datepipe: DatePipe,
    private ledgerService: LedgerService,
    private configService: ConfigService,
    private gridPropertiesService: GridPropertiesService,
    private transactionService: TransactionService
  ) { }

  //#region Init Data
  public async ngOnInit() {
    this.fxCredentials = JSON.parse(sessionStorage.getItem("fxCredentials") ?? '') as fxCredential;
    this.getGridConfiguration();
    this.fillStatusFilter();
  }

  public async getReport() {
    try {
      this.totalRecords = 0;
      this.totalCCAmt = 0;
      this.totalPaidAmt = 0;
      this.reportData = [];
      this.spinnerService.show();
      let res = await this.salesStatisticsService.getSalesStatistics(this.salesstatisticsFilterCriteria);
      if (res && res.length > 0) {
        this.reportData = this.orderbyNullableDate(res);

        this.totalRecords = res.length;
        res.forEach(z => { this.totalCCAmt += z.ccAmount; this.totalPaidAmt += z.paidAmount; });

        this.spinnerService.hide();
      }
      else
        this.spinnerService.hide();

    } catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Debit data not get, Try again later!');
    }
  }

  public orderbyNullableDate(data: SalesStatistics[]) {
    return data.sort((a, b) => {
      let bdate = 0;
      if (b.dueDate)
        bdate = new Date(b.dueDate).getTime();

      let adate = 0;
      if (a.dueDate)
        adate = new Date(a.dueDate).getTime();

      if (a.dueDate === null) {
        return 1;
      }

      if (b.dueDate === null) {
        return -1;
      }

      if (adate === bdate) {
        return 0;
      }

      return adate > bdate ? 1 : -1;
    });
  }

  public fillStatusFilter() {
    this.listStatus.push({ name: 'Full', value: 'full', isChecked: false });
    this.listStatus.push({ name: 'Part', value: 'part', isChecked: false });
    this.listStatus.push({ name: 'Not Paid', value: 'not paid', isChecked: false });
    this.listStatus.push({ name: 'Advance', value: 'advance', isChecked: false });
  }
  //#endregion

  //#region Grid Config
  public async getGridConfiguration() {
    try {
      this.spinnerService.show();
      this.gridConfig = await this.configService.getGridConfig(this.fxCredentials?.id ?? '', "SalesStatistics", "SalesStatisticsGrid", this.gridPropertiesService.getSalesStatisticsItems());
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
        this.gridMasterConfigResponse = await this.configService.getMasterGridConfig("SalesStatistics", "SalesStatisticsGrid");
        if (this.gridMasterConfigResponse)
          this.fields = this.gridMasterConfigResponse.gridDetail;
        else
          this.fields = await this.gridPropertiesService.getSalesStatisticsItems();

      }
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.alertDialogService.show(error);
      this.spinnerService.hide();
    }
  }

  public openGridConfigDialog(): void {
    this.isGridConfig = true;
  }

  public setNewGridConfig(gridConfig: GridConfig) {
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
  //#endregion

  //#region Export Excel
  public async exportExcel() {
    try {
      if (this.reportData.length > 0) {
        let transactionIds = this.reportData.map(z => z.transactionId);
        this.spinnerService.show();
        let res = await this.orderService.getOrderItemsByTransactionIds(transactionIds);
        if (res && res.length > 0) {
          await this.generateExcelData(res);
          this.utilityService.exportAsExcelFile(this.excelFile, "Sales_Statistics_Excel_");
          this.spinnerService.hide();
        }
        else {
          this.utilityService.showNotification('No data found!', 'warning');
          this.spinnerService.hide();
        }
      } else
        this.utilityService.showNotification('No data found!', 'warning');

    } catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Something went wrong, Try again later!');
    }
  }

  private async generateExcelData(data: OrderItem[]) {
    this.excelFile = [];
    let i = 0;
    data.forEach(z => {
      var trans = this.reportData.find(c => c.transactionId == z.transactionId);
      if (trans != null) {
        var excel = {
          'DELIVERY DATE': this.convertDateToString(z.deliveredDate),
          'PAYMENT DATE': this.convertDateToString(trans.paymentDate),
          'BANK / CASH': trans.receiptType,
          'SALE DATE': this.convertDateToString(trans.transactionDate),
          'SALE NO': trans.transactionNo,
          'INVOICE NO': trans.refNumber,
          // 'UNIT': z.color,
          'STOCK ID': z.invItem.stoneId,
          'SHAPE': z.invItem.shape,
          'SIZE': z.invItem.weight,
          'COLOR': z.invItem.color,
          'CLARITY': z.invItem.clarity,
          'CUT': z.invItem.cut,
          'CERT': z.invItem.certificateNo,
          'DISC': z.invItem.price.discount,
          'Net $': z.invItem.price.netAmount,
          'VOW Disc': z.invItem.vowDiscount,
          'VOW $': z.invItem.vowAmount,
          'O+Add Disc': z.invItem.sDiscount,
          // 'O+Add $': z.invItem.,
          'RAP': z.invItem.price.rap,
          '$ CT': z.invItem.perCarat,
          'NET $': z.invItem.fAmount,
          // 'VATAV': z.invItem.sDiscount,
          'COMPANY': z.party.name,
          'BROKER': z.broker.name,
          'CC Type': trans.ccType,
          'CC Amt': trans.ccAmount,
          'Due Date':trans.dueDate
        }
        this.excelFile.push(excel);
      }
      i++;
    });
  }

  public convertDateToString(date: Date | null) {
    let format = "";
    if (date != null) {
      let propertyVal = new Date(date);
      format = this.datepipe.transform(propertyVal, 'yyyy-MM-dd') ?? ''
    }
    return format;
  }
  //#endregion

  //#region OnChange Functions
  public clearFilter() {
    this.salesstatisticsFilterCriteria = new SalesStatisticsSearchCriteria();
    this.selectedPartyLedgerItem = null as any;
    this.utilityService.onMultiSelectValueChange(this.listStatus, this.salesstatisticsFilterCriteria.status);
  }

  public dateFilterChanges() {
    this.salesstatisticsFilterCriteria.fromDate = this.utilityService.setUTCDateFilter(this.range.start);
    this.salesstatisticsFilterCriteria.toDate = this.utilityService.setUTCDateFilter(this.range.end);
  }

  public paymentDateFilterChanges() {
    this.salesstatisticsFilterCriteria.paymentFromDate = this.utilityService.setUTCDateFilter(this.paymentRange.start);
    this.salesstatisticsFilterCriteria.paymentToDate = this.utilityService.setUTCDateFilter(this.paymentRange.end);
  }

  public deliveredDateFilterChanges() {
    this.salesstatisticsFilterCriteria.deliveryFromDate = this.utilityService.setUTCDateFilter(this.deliveryRange.start);
    this.salesstatisticsFilterCriteria.deliveryToDate = this.utilityService.setUTCDateFilter(this.deliveryRange.end);
  }

  public closeReportDialog(): void {
    this.toggle.emit();
  }

  public async partyLedgerFilter(value: any) {
    this.spinnerService.show();
    this.searchDebounce.next(value);
  }

  public async searchLedgerFilter(value: any) {
    try {
      this.spinnerService.show();

      this.listPartyLedgerItems = [];
      this.ledgerItems = [];

      this.ledgerItems = await this.ledgerService.getAllLedgersByType(['Customer'], value);
      if (this.ledgerItems) {
        if (this.selectedPartyLedgerItem)
          this.ledgerItems = this.ledgerItems.filter(z => z.id != this.salesstatisticsFilterCriteria.partyId);

        this.listPartyLedgerItems = [];
        this.ledgerItems.forEach(z => { this.listPartyLedgerItems.push({ text: z.name, value: z.id }); });
      }

      this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async partyLedgerChange(e: any) {
    if (e) {
      let fetch = this.ledgerItems.find(x => x.id == e);
      if (fetch) {
        setTimeout(() => {
          this.selectedPartyLedgerItem = fetch?.name ?? '';
        }, 0);
        this.salesstatisticsFilterCriteria.partyId = fetch.id;
      }
    }
    else
      this.salesstatisticsFilterCriteria.partyId = null as any;
  }

  public async openSalesTransaction(transId: string) {
    await this.getTransactionById(transId);
    if (this.transactionObj.id != null)
      this.isSales = true;
  }

  public async openReceiptTransaction(transId: string) {
    await this.getTransactionById(transId);
    if (this.transactionObj.id != null)
      this.isReceiptDialog = true;
  }

  public async closeSalesDialog(flag: boolean) {
    this.transactionObj = new Transaction();
    this.isSales = false;
    if (flag)
      this.getReport();
  }

  public async closeReceiptDialog() {
    this.transactionObj = new Transaction();
    this.isReceiptDialog = false;
    this.getReport();
  }

  public async getTransactionById(transId: string) {
    try {
      this.spinnerService.show();
      let trans = new Transaction();
      let res = await this.transactionService.getTransactionById(transId);
      if (res) {
        trans = res;
        this.spinnerService.hide();
      }
      else {
        this.spinnerService.hide();
        this.alertDialogService.show('Transaction not found, Please contact administrator!');
      }

      this.transactionObj = trans;
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Transaction not found, Please contact administrator!');
    }
  }
  //#endregion

  //#region Popup Close
  @HostListener("document:click", ["$event"])
  public documentClick(event: any): void {
    if (!this.contains(event.target)) {
      this.popup.toggle(false);
    }

    if (!this.paymentContains(event.target)) {
      this.paymentPopup.toggle(false);
    }
  }

  private contains(target: any): boolean {
    let popup = document.getElementsByClassName('k-animation-container')[0] as any;
    return (
      this.anchor.nativeElement.contains(target) ||
      (popup ? popup.contains(target) : false)
    );
  }


  private paymentContains(target: any): boolean {
    let paymentPopup = document.getElementsByClassName('k-animation-container')[0] as any;
    return (
      this.paymentAnchor.nativeElement.contains(target) ||
      (paymentPopup ? paymentPopup.contains(target) : false)
    );
  }
  //#endregion

}

import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { PageChangeEvent, RowClassArgs, SelectableSettings } from '@progress/kendo-angular-grid';
import { Align } from '@progress/kendo-angular-popup';
import { DataResult, GroupDescriptor, process, SortDescriptor } from '@progress/kendo-data-query';
import { NgxSpinnerService } from 'ngx-spinner';
import { GridDetailConfig } from 'shared/businessobjects';
import { fxCredential, GridConfig, GridMasterConfig, SystemUserPermission } from 'shared/enitites';
import { ConfigService, SalesExportFields, StoneStatus, TransactionExportFields, TransactionType, UtilityService, salesExportExcelFormat } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { CommuteItem, ExportPdfMail, TransactionSearchCriteria } from '../../businessobjects';
import { InventoryItems, LedgerDNorm, LedgerGroup, OrderItem, Organization, Transaction, TransactionItem } from '../../entities';
import { AccountingconfigService, BoUtilityService, CommuteService, GridPropertiesService, InventoryService, LedgerService, MemoService, OrderService, OrganizationService, PrintAccInvoiceFormat, PrintInvoiceFormat, TransactionService } from '../../services';
import * as XLSX from 'xlsx';
import { EwayBillNoTransaction } from '../../businessobjects/accounting/ewaybillnotransaction';
type AOA = any[][];
@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css']
})
export class TransactionsComponent implements OnInit {
  public filterFlag = false;
  public groups: GroupDescriptor[] = [];
  public sort: SortDescriptor[] = [];
  public selectableSettings: SelectableSettings = { mode: 'multiple' };
  public mySelection: string[] = [];
  public gridView!: DataResult;
  public pageSize = 26;
  public skip = 0
  public fields!: GridDetailConfig[];
  public gridMasterConfigResponse!: GridMasterConfig;
  public isGridConfig: boolean = false;
  public gridConfig!: GridConfig;
  public fxCredentials!: fxCredential;
  public allTransactions: Transaction[] = [];
  public filterTransactions: Transaction[] = [];
  public transactionSearchCriteria: TransactionSearchCriteria = new TransactionSearchCriteria();
  public transactionObj: Transaction = new Transaction();
  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains'
  };
  public partyItems: LedgerDNorm[] = [];
  public EwayBIllNo: EwayBillNoTransaction[] = [];
  transactionTypeList: Array<{ name: string; isChecked: boolean }> = [];
  selectedLedgerGroup: string = null as any;
  selectedLedgerName: string = null as any;
  public isPurchase: boolean = false;
  public isSales: boolean = false;
  public isGeneralDialog = false;
  public isReceiptDialog = false;
  public isPaymentDialog = false;
  public isContraDialog = false;
  public isCreditNoteDialog = false;
  public isDebitNoteDialog = false;
  public printTransactionObj: Transaction = new Transaction();
  public organizationData: Organization = new Organization();
  public organizationId!: string;
  public isCanDeleteTransactions: boolean = false;
  public isViewButtons: boolean = false;
  public ledgerGroupData: LedgerGroup[] = [];
  public isDeleteEnabled: boolean = false;
  public filterStoneId: string = '';
  public filterCertificateNo: string = '';
  public selectedTransactions: Array<Transaction> = new Array<Transaction>();
  public isShowCheckBoxAll: boolean = true;

  data: AOA = [[1, 2], [3, 4]];
  wopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'array' };
  fileName: string = 'SheetJS.xlsx';

  public confirmPassword: boolean = false;
  public password: string = '';

  public exportToPdfMailObj: ExportPdfMail = new ExportPdfMail();
  public isSendMail: boolean = false;
  public showPrintOption: boolean = false;
  @ViewChild("anchor") public anchor!: ElementRef;
  @ViewChild("anchorExcel") public anchorExcel!: ElementRef;
  @ViewChild("popup", { read: ElementRef }) public popup!: ElementRef;
  public anchorAlign: Align = { horizontal: "right", vertical: "bottom" };
  public popupAlign: Align = { horizontal: "center", vertical: "top" };
  public showExcelOption: boolean = false;
  public excelOption: string | null = 'Export_Trans';
  public salespackage: boolean = false;
  public isStockTallyEnable: boolean = false;

  constructor(
    private router: Router,
    private accountingconfigService: AccountingconfigService,
    private alertDialogService: AlertdialogService,
    private spinnerService: NgxSpinnerService,
    public utilityService: UtilityService,
    private gridPropertiesService: GridPropertiesService,
    private configService: ConfigService,
    private ledgerService: LedgerService,
    private transactionService: TransactionService,
    private printAccInvoiceFormat: PrintAccInvoiceFormat,
    private organizationService: OrganizationService,
    public printInvoiceFormat: PrintInvoiceFormat,
    private orderService: OrderService,
    private inventoryService: InventoryService,
    private commuteService: CommuteService,
    private boUtilityService: BoUtilityService,
    private memoService: MemoService,
  ) { }

  public async ngOnInit() {
    let enbleST = await this.utilityService.startIntervalCheck();

    if (enbleST)
      await this.checkStockTallyEnable();

    this.defaultMethodsLoad();
  }

  //#region Default Method
  public async defaultMethodsLoad() {
    try {
      this.fxCredentials = JSON.parse(sessionStorage.getItem("fxCredentials") ?? '') as fxCredential;
      if (!this.fxCredentials)
        this.router.navigate(["login"]);

      if (this.fxCredentials && this.fxCredentials.origin && (this.fxCredentials.origin.toLowerCase() == 'admin' || this.fxCredentials.origin.toLowerCase() == 'accounts'))
        this.isViewButtons = true;

      this.spinnerService.show();
      await this.loadAccountConfigDetail();
      await this.loadParty();
      await this.getGridConfiguration();
      this.preLoadTransactionTypeFilter();
      await this.loadTransaction();
      await this.loadOrganizationDetail();
      await this.setUserRights();

      this.utilityService.filterToggleSubject.subscribe(flag => {
        this.filterFlag = flag;
      });
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Something went wrong, Data not load!');
    }
  }

  public async setUserRights() {
    let userPermissions: SystemUserPermission = new SystemUserPermission();
    let sesValue = sessionStorage.getItem("userPermission");
    if (sesValue)
      userPermissions = JSON.parse(sesValue) as SystemUserPermission;
    if (userPermissions.actions.length > 0) {
      let CanDeleteTransactions = userPermissions.actions.find(z => z.name == "CanDeleteTransactions");
      if (CanDeleteTransactions != null)
        this.isCanDeleteTransactions = true;
    }
  }

  public async checkStockTallyEnable() {
    try {
      this.isStockTallyEnable = await this.commuteService.checkIsStockTallyEnable();
    }
    catch (error: any) {
      this.alertDialogService.show(error.error)
    }
  }

  public async loadParty() {
    try {
      let partys = await this.ledgerService.getAllLedgers();
      for (let index = 0; index < partys.length; index++) {
        const element = partys[index];
        this.partyItems.push({
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
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Party not load, Try gain later!');
    }
  }

  public async loadAccountConfigDetail() {
    try {
      this.ledgerGroupData = await this.accountingconfigService.getLedgerGroups();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async loadOrganizationDetail() {
    try {
      this.organizationId = this.fxCredentials.organizationId;
      this.organizationData = await this.organizationService.getOrganizationById(this.organizationId)
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async loadTransaction() {
    try {
      this.spinnerService.show();
      this.validateData();
      let res = await this.transactionService.getTransactionByCriteria(this.transactionSearchCriteria, this.skip, this.pageSize);
      if (res) {
        // this.isDeleteEnabled = this.transactionSearchCriteria.showOnlyUnpaid ? false : true;
        this.filterTransactions = res.transactions;
        this.gridView = process(res.transactions, { group: this.groups, sort: this.sort });
        this.gridView.total = res.totalCount;
        this.spinnerService.hide();
      }
      else {
        this.spinnerService.hide();
        this.alertDialogService.show('Transaction data not load, Try gain later!');
      }
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Transaction data not load, Try gain later!');
    }
  }
  //#endregion

  //#region Grid Config | On Change
  public async getGridConfiguration() {
    try {
      this.spinnerService.show();
      this.gridConfig = await this.configService.getGridConfig(this.fxCredentials?.id ?? '', "Transaction", "TransactionGrid", this.gridPropertiesService.getTransactionItems());
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
        this.gridMasterConfigResponse = await this.configService.getMasterGridConfig("Transaction", "TransactionGrid");
        if (this.gridMasterConfigResponse)
          this.fields = this.gridMasterConfigResponse.gridDetail;
        else
          this.fields = await this.gridPropertiesService.getTransactionItems();
      }
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.alertDialogService.show(error);
      this.spinnerService.hide();
    }
  }

  public sortChange(sort: SortDescriptor[]): void {
    this.sort = sort;
    this.loadTransaction();
  }

  public onSelect(event: any): void {
    try {
      if (event.selectedRows.length > 0) {

        for (let index = 0; index < event.selectedRows.length; index++) {
          const element = event.selectedRows[index];
          this.selectedTransactions.push(element.dataItem);
        }
      }

      if (event.deselectedRows.length > 0) {
        for (let indexRmove = 0; indexRmove < event.deselectedRows.length; indexRmove++) {
          const element = event.deselectedRows[indexRmove];
          let indexFind = this.selectedTransactions.findIndex(x => x.id == element.dataItem.id);
          if (indexFind > -1)
            this.selectedTransactions.splice(indexFind, 1);
          this.showExcelOption = false

        }
      }
      this.transactionObj = new Transaction();
      if (this.selectedTransactions && this.selectedTransactions.length == 1) {
        this.transactionObj = JSON.parse(JSON.stringify(this.selectedTransactions[0]));
        if (this.selectedTransactions[0].packingList.length > 0 && this.selectedTransactions[0].transactionType == TransactionType.Sales.toString())
          this.salespackage = true;
      } else
        this.salespackage = false

    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Data not selected');
    }
  }

  public groupChange(groups: GroupDescriptor[]): void {
    try {
      this.groups = groups;
      this.loadTransaction();
    }
    catch (error: any) {
      this.alertDialogService.show(error.error)
    }
  }

  public pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.loadTransaction();
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

  public isDisabled(args: RowClassArgs) {
    return {
      'k-state-disabled': args.dataItem.isDisabled === true
    };
  }
  //#endregion

  //#region On Change Functions
  public async filterTransaction() {
    this.skip = 0;
    this.selectedTransactions = new Array<Transaction>();
    this.mySelection = new Array<string>();
    if ((this.filterStoneId && this.filterStoneId.length > 0) || (this.filterCertificateNo && this.filterCertificateNo.length > 0)) {
      //Stone Id only search for Sales & Purchase
      if (!this.transactionSearchCriteria.transactionType.includes(TransactionType.Sales.toString()) && !this.transactionSearchCriteria.transactionType.includes(TransactionType.Purchase.toString())) {
        this.gridView = process([], { group: [], sort: [] });
        this.gridView.total = 0;
        return;
      }
      if (this.filterStoneId && this.filterStoneId.length > 0)
        this.transactionSearchCriteria.stoneIds = this.utilityService.CheckStoneIds(this.filterStoneId);
      else
        this.transactionSearchCriteria.stoneIds = [];

      if (this.filterCertificateNo && this.filterCertificateNo.length > 0)
        this.transactionSearchCriteria.certificateNos = this.utilityService.checkCertificateIds(this.filterCertificateNo);
      else
        this.transactionSearchCriteria.certificateNos = [];
    }
    else {
      this.transactionSearchCriteria.stoneIds = [];
      this.transactionSearchCriteria.certificateNos = [];
    }


    await this.loadTransaction();
  }

  public clearTransaction() {
    this.selectedLedgerGroup = null as any;
    this.selectedLedgerName = null as any;
    this.filterStoneId = null as any;
    this.filterCertificateNo = null as any;
    this.transactionSearchCriteria = new TransactionSearchCriteria();
    this.mySelection = [];
    this.filterTransactions = [];
    this.allTransactions = [];
    this.transactionObj = new Transaction();
    this.selectedTransactions = new Array<Transaction>();
    this.sort = Array<SortDescriptor>();
    this.preLoadTransactionTypeFilter();
    this.loadTransaction();
  }

  public validateData() {
    if (this.transactionSearchCriteria.fromDate != null && this.transactionSearchCriteria.fromDate.toString().length > 0)
      this.transactionSearchCriteria.fromDate = this.utilityService.setUTCDateFilter(this.transactionSearchCriteria.fromDate);
    if (this.transactionSearchCriteria.toDate != null && this.transactionSearchCriteria.toDate.toString().length > 0)
      this.transactionSearchCriteria.toDate = this.utilityService.setUTCDateFilter(this.transactionSearchCriteria.toDate);

    if (this.selectedLedgerGroup != null)
      this.transactionSearchCriteria.ledgerGroup = this.selectedLedgerGroup;
    else
      this.transactionSearchCriteria.ledgerGroup = '';

    if (this.selectedLedgerName != null)
      this.transactionSearchCriteria.ledgerName = this.selectedLedgerName;
    else
      this.transactionSearchCriteria.ledgerName = '';
  }

  public editTransaction() {
    if (this.transactionObj.transactionType == TransactionType.Purchase.toString())
      this.openPurchaseDialog(false);
    else if ((this.transactionObj.transactionType == TransactionType.Sales.toString()))
      this.openSalesDialog(false);
    else if ((this.transactionObj.transactionType == TransactionType.Proforma.toString()))
      this.openSalesDialog(false, false);
    else if (this.transactionObj.transactionType == TransactionType.Receipt.toString())
      this.openReceiptDialog(false);
    else if (this.transactionObj.transactionType == TransactionType.Payment.toString())
      this.openPaymentDialog(false);
    else if (this.transactionObj.transactionType == TransactionType.General.toString())
      this.openGeneralDialog(false);
    else if (this.transactionObj.transactionType == TransactionType.Contra.toString())
      this.openContraDialog(false);
    else if (this.transactionObj.transactionType == TransactionType.CreditNote.toString())
      this.openCreditNoteDialog(false);
    else if (this.transactionObj.transactionType == TransactionType.DebitNote.toString())
      this.openDebitNoteDialog(false);
  }
  //#endregion

  //#region Modal Changes
  public openPurchaseDialog(isNew = true): void {
    if (isNew)
      this.transactionObj = new Transaction();

    this.transactionObj.transactionType = TransactionType.Purchase.toString();
    this.isPurchase = true;
  }

  public async closePurchaseDialog() {
    this.mySelection = [];
    this.selectedTransactions = new Array<Transaction>();
    this.isPurchase = false;
    this.loadTransaction();
  }

  public openSalesDialog(isNew = true, isSaleInvoice = true): void {

    if (this.fxCredentials && this.fxCredentials?.origin && this.fxCredentials?.origin?.toLowerCase() != 'accounts' && this.fxCredentials?.origin?.toLowerCase() != 'admin')
      return this.alertDialogService.show('You do not have a permission to create sales invoice!');


    if (isNew) {
      this.transactionObj = new Transaction();
      if (isSaleInvoice)
        this.transactionObj.transactionType = TransactionType.Sales.toString();
      else
        this.transactionObj.transactionType = TransactionType.Proforma.toString();
    }
    this.isSales = true;
  }

  public async closeSalesDialog(flag: boolean) {
    this.mySelection = [];
    this.transactionObj = new Transaction();
    this.selectedTransactions = new Array<Transaction>();
    this.isSales = false;
    if (flag)
      this.loadTransaction();
  }

  // Receipt
  public openReceiptDialog(isNew = true): void {
    if (isNew)
      this.transactionObj = new Transaction();

    this.transactionObj.transactionType = TransactionType.Receipt.toString();
    let fetchSelectedTransactions = this.filterTransactions.find(x => x.id == this.mySelection[0]) ?? new Transaction();
    if (fetchSelectedTransactions && fetchSelectedTransactions.id && fetchSelectedTransactions.transactionType == TransactionType.Sales.toString()) {
      this.transactionObj.fromLedger.id = (fetchSelectedTransactions.toLedger.id) ?? '';
      this.transactionObj.fromLedger.name = (fetchSelectedTransactions.toLedger.name) ?? '';
    }

    this.isReceiptDialog = true;
  }

  public async closeReceiptDialog(isRefresh: boolean = true) {
    this.mySelection = [];
    this.selectedTransactions = new Array<Transaction>();
    if (!isRefresh)
      this.isReceiptDialog = false;
    else
      this.isReceiptDialog = true;
    this.loadTransaction();
  }

  // Payment
  public openPaymentDialog(isNew = true): void {
    if (isNew)
      this.transactionObj = new Transaction();

    this.transactionObj.transactionType = TransactionType.Payment.toString();

    let fetchSelectedTransactions = this.filterTransactions.find(x => x.id == this.mySelection[0]) ?? new Transaction();
    if (fetchSelectedTransactions && fetchSelectedTransactions.id && fetchSelectedTransactions.transactionType == TransactionType.Purchase.toString()) {
      this.transactionObj.toLedger.id = (fetchSelectedTransactions.toLedger.id) ?? '';
      this.transactionObj.toLedger.name = (fetchSelectedTransactions.toLedger.name) ?? '';
    }

    this.isPaymentDialog = true;
  }

  public async closePaymentDialog(isRefresh: boolean = true) {
    this.mySelection = [];
    this.selectedTransactions = new Array<Transaction>();
    if (!isRefresh)
      this.isPaymentDialog = false;
    else
      this.isPaymentDialog = true;
    this.loadTransaction();
  }

  // General
  public openGeneralDialog(isNew = true): void {
    if (isNew)
      this.transactionObj = new Transaction();

    this.transactionObj.transactionType = TransactionType.General.toString();
    this.isGeneralDialog = true;
  }

  public async closeGeneralDialog() {
    this.isGeneralDialog = false;
    this.loadTransaction();
  }

  // Contra
  public openContraDialog(isNew = true): void {
    if (isNew)
      this.transactionObj = new Transaction();

    this.transactionObj.transactionType = TransactionType.Contra.toString();
    this.isContraDialog = true;
  }

  public async closeContraDialog() {
    this.isContraDialog = false;
    this.loadTransaction();
  }

  // CreditNote
  public openCreditNoteDialog(isNew = true): void {
    if (isNew)
      this.transactionObj = new Transaction();

    this.transactionObj.transactionType = TransactionType.CreditNote.toString();
    this.isCreditNoteDialog = true;
  }

  public async closeCreditNoteDialog() {
    this.isCreditNoteDialog = false;
    this.loadTransaction();
  }

  // DebitNote
  public openDebitNoteDialog(isNew = true): void {
    if (isNew)
      this.transactionObj = new Transaction();

    this.transactionObj.transactionType = TransactionType.DebitNote.toString();
    this.isDebitNoteDialog = true;
  }

  public async closeDebitNoteDialog() {
    this.isDebitNoteDialog = false;
    this.loadTransaction();
  }
  //#endregion

  //#region Delete Transaction
  public closeConfirmPasswordModel() {
    this.confirmPassword = false;
    this.password = '';
  }

  public async deleteTransactionConfirm() {
    if (this.transactionObj.transactionType == TransactionType.Payment.toString() || this.transactionObj.transactionType == TransactionType.Receipt.toString())
      this.confirmPassword = true;
    else
      await this.deleteTransaction();
  }

  public checkPassword() {
    try {
      this.transactionService.checkPasswordForDeleteTransaction(this.password)
        .subscribe(async url => {
          if (url) {
            this.closeConfirmPasswordModel();
            await this.deleteTransaction();
          }
          else
            this.alertDialogService.show('Password not match, Try again!');
        });
    } catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Password not match, Try again!');
    }
  }

  public async deleteTransaction() {
    this.alertDialogService.ConfirmYesNo("Are you sure you want to remove transaction", "Delete")
      .subscribe(async (res: any) => {
        if (res.flag) {
          try {
            this.spinnerService.show();

            if (this.transactionObj.transactionType == TransactionType.Sales.toString()) {
              let isDelivered = await this.orderService.checkOrderIsDelivered(this.transactionObj.id);
              if (!isDelivered) {
                let stoneIds = this.transactionObj.packingList.map(x => x.stoneId);
                if (stoneIds.length > 0) {

                  let orderItems: Array<OrderItem> = await this.orderService.getOrderItemsByStoneIds(stoneIds);
                  let orderStoneIds = new Array<string>();

                  if (orderItems && orderItems.length > 0) {

                    orderStoneIds = orderItems.map(x => x.invItem.stoneId);
                    let orderWoLeadStoneId = orderItems.filter(x => !x.leadId && !x.leadNumber).map(a => a.invItem.stoneId);
                    if (orderWoLeadStoneId && orderWoLeadStoneId.length > 0) {
                      let deleteOrderResponse = await this.orderService.deleteOrderItemByStoneIds(orderWoLeadStoneId);
                      if (deleteOrderResponse)
                        orderStoneIds = orderStoneIds.filter(x => !orderWoLeadStoneId.includes(x));
                    }

                    let orderTransactionRes = await this.orderService.updateTrasactionIdOrderItem(stoneIds);
                    if (orderTransactionRes)
                      this.setStoneStatusUpdate(orderStoneIds, StoneStatus.Order.toString())

                    stoneIds = stoneIds.filter(x => !orderStoneIds.includes(x));
                    if (stoneIds && stoneIds.length > 0)
                      this.setStoneStatusUpdate(stoneIds, StoneStatus.Stock.toString())
                  }
                  else
                    this.setStoneStatusUpdate(stoneIds, StoneStatus.Stock.toString())
                }
              }
              else {
                this.spinnerService.hide();
                this.alertDialogService.show('Can not delete delivered stones. Please Cancel Sale');
                return;
              }
            }

            let res = await this.transactionService.delete(this.transactionObj.id);
            if (res) {

              this.utilityService.showNotification('Transaction remove successfully!');
              if (this.transactionObj.transactionType == TransactionType.Payment.toString() || this.transactionObj.transactionType == TransactionType.Receipt.toString()) {
                if (this.transactionObj.paymentDetail.selectedTransactionId.length > 0)
                  await this.transactionService.setUnPaidTransactions(this.transactionObj.paymentDetail.selectedTransactionId, TransactionType.Payment.toString() ? TransactionType.Purchase.toString() : TransactionType.Sales.toString());
              }

              this.mySelection = [];
              this.selectedTransactions = new Array<Transaction>();
              this.transactionObj = new Transaction();
              this.loadTransaction();
            }
            else {
              this.spinnerService.hide();
              this.alertDialogService.show('Transaction not remove, Try again later!');
            }
          }
          catch (error: any) {
            console.error(error);
            this.spinnerService.hide();
            this.alertDialogService.show('Transaction not remove, Try again later!');
          }
        }
      });
  }
  //#endregion

  public async setStoneStatusUpdate(stoneIds: Array<string>, stoneStatus: string) {
    try {
      let invStatusUpdateRes = await this.inventoryService.updateInventoriesToStockStatus(stoneIds, stoneStatus);
      if (invStatusUpdateRes) {
        let invCommuteObject = new CommuteItem();
        invCommuteObject.status = stoneStatus;
        invCommuteObject.stoneIds = stoneIds;
        let updateResponse = await this.commuteService.updateStoneStatus(invCommuteObject);
        if (!updateResponse)
          this.alertDialogService.show('Something went wrong on Daimanto!', 'error');
      }

    } catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show("Something went wrong!, while updating stone status FO");
    }
  }

  public filterPartToggle() {
    // this.utilityService.setfilterToggleValue(this.filterFlag);
    this.filterFlag = !this.filterFlag;
  }

  public async transactionPrint(isFiveCentAbove: boolean = false) {
    try {
      this.spinnerService.show();
      let data = await this.getPrintHTMLData(false, isFiveCentAbove);
      if (!data)
        return;

      let printStone: HTMLIFrameElement = document.createElement("iframe");
      printStone.name = "print_detail";
      printStone.style.position = "absolute";
      printStone.style.top = "-1000000px";
      document.body.appendChild(printStone);
      printStone?.contentWindow?.document.open();
      printStone?.contentWindow?.document.write(data.header);
      printStone?.contentWindow?.document.write(data.body);
      printStone?.contentWindow?.document.close();
      this.spinnerService.hide();
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Print not open, Try again later!');
    }
  }

  public async getPrintHTMLData(isCGMail: boolean = false, isFiveCentAbove: boolean = false): Promise<{ header: string, body: string }> {
    let headerHtml: string = '';
    let bodyHtml: string = '';

    this.printTransactionObj = await this.transactionService.getTransactionById(this.transactionObj.id);
    if (!this.printTransactionObj || !this.printTransactionObj.id) {
      this.alertDialogService.show('Transaction not found, Try again later!');
      return null as any;
    }
    this.boUtilityService.orderByStoneIdPackingItems(this.printTransactionObj.packingList);

    if (this.transactionObj.transactionType == TransactionType.General.toString()
      || this.transactionObj.transactionType == TransactionType.Payment.toString()
      || this.transactionObj.transactionType == TransactionType.Receipt.toString()
      || this.transactionObj.transactionType == TransactionType.Contra.toString()) {

      headerHtml = `<html><head>
        <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <link rel="stylesheet" type="text/css" href="commonAssets/css/printaccinvoice.css" media="print" />
        </head>`;

      bodyHtml = this.printAccInvoiceFormat.getAccInvoicePrint(this.printTransactionObj, this.organizationData);
    }
    else if (this.transactionObj && (this.transactionObj.transactionType == TransactionType.Sales.toString() || this.transactionObj.transactionType == TransactionType.Proforma.toString())) {

      if ((this.transactionObj.transactionDetail.organization.address?.country.toLowerCase() == 'india'
        && this.transactionObj.transactionDetail.isOverseas)
        || (this.transactionObj.transactionDetail.organization.address?.country.toLowerCase() == 'india'
          && !this.transactionObj.transactionDetail.isOverseas
          && this.transactionObj.transactionDetail.isDDA)) {
        headerHtml = `<html><head>
        <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <link rel="stylesheet" type="text/css" href="commonAssets/css/printmemo.css" media="print" />
        </head>`;
      }
      else if (this.transactionObj.transactionDetail.organization.address?.country.toLowerCase() == 'hong kong') {
        headerHtml = `<html><head>
        <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <link rel="stylesheet" type="text/css" href="commonAssets/css/printinvoice.css" media="print" />

        <style>
        .chal-head {
            display: flex;
            justify-content: space-between;
          }

            .body-f-mid table {
                width: 100%;
            }
        </style>

        </head>`;
      }
      else if (this.transactionObj.transactionDetail.organization.address?.country.toLowerCase() == 'belgium') {
        headerHtml = `<html><head>
        <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <link rel="stylesheet" type="text/css" href="commonAssets/css/printCGinvoice.css" media="print" />
        </head>`;
      }
      else if (this.transactionObj.transactionDetail.organization.address?.country.toLowerCase() == 'united arab emirates') {
        headerHtml = `<html><head>
        <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <link rel="stylesheet" type="text/css" href="commonAssets/css/printsdinvoice.css" media="print" />
        </head>`;
      }
      else {
        headerHtml = `<html><head>
        <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <link rel="stylesheet" type="text/css" href="commonAssets/css/printinvoice.css" media="print" />
        </head>`;
      }

      if (isFiveCentAbove)
        bodyHtml = await this.printInvoiceFormat.getAboveFiveCentInvoice(this.printTransactionObj, isCGMail);
      else
        bodyHtml = await this.printInvoiceFormat.getInvoice(this.printTransactionObj, isCGMail);
    }

    return { header: headerHtml, body: bodyHtml };
  }

  public async convertToSales() {
    if (this.transactionObj == null || this.transactionObj?.transactionType == null || this.transactionObj?.transactionType?.toLowerCase() != 'proforma') {
      this.alertDialogService.show('Please select valid transaction for convertion');
      return;
    }

    this.isStockTallyEnable = await this.commuteService.checkIsStockTallyEnable();
    if (this.isStockTallyEnable)
      return this.alertDialogService.show('System cannot proceed with the sale transaction, purchase, and delivery because stock tally is enabled');

    this.alertDialogService.ConfirmYesNo("Are you sure you want to convert transaction", "Sales Convert")
      .subscribe(async (res: any) => {
        if (res.flag) {
          try {
            this.spinnerService.show();
            let res = await this.transactionService.convertToSales(this.transactionObj.id);
            if (res) {
              this.utilityService.showNotification('Transaction converted successfully!');
              if (this.transactionObj.packingList.length > 0) {
                let invCommuteObject = new CommuteItem();
                invCommuteObject.status = StoneStatus.Sold.toString();
                invCommuteObject.isMemo = false;
                invCommuteObject.stoneIds = this.transactionObj.packingList.map(x => x.stoneId);
                invCommuteObject.organizationCode = this.fxCredentials?.orgCode;
                let updateResponse = await this.commuteService.updateStoneStatus(invCommuteObject);
                if (updateResponse) {
                  //Remove stones from memo
                  let isStoneRemoved = await this.memoService.removeMemoStones(invCommuteObject.stoneIds);
                  if (!isStoneRemoved)
                    this.alertDialogService.show('Stone not removed from memo. please contact admin', 'error');
                }
              }
              this.mySelection = [];
              this.transactionObj = new Transaction();
              this.selectedTransactions = new Array<Transaction>();
              this.loadTransaction();
            }
            else {
              this.spinnerService.hide();
              this.alertDialogService.show('Transaction not convert, Try again later!');
            }
          }
          catch (error: any) {
            console.error(error);
            this.spinnerService.hide();
            this.alertDialogService.show('Transaction not convert, Try again later!');
          }
        }
      });
  }

  public preLoadTransactionTypeFilter() {
    Object.values(TransactionType).forEach(z => { this.transactionTypeList.push({ name: z.toString(), isChecked: false }); });
    this.transactionSearchCriteria.transactionType.push(TransactionType.Purchase.toString());
    this.transactionSearchCriteria.transactionType.push(TransactionType.Sales.toString());
    this.utilityService.onMultiSelectChange(this.transactionTypeList, this.transactionSearchCriteria.transactionType);
  }

  public getWeightOfTransactionItems(items: TransactionItem[]) {
    let weight = this.utilityService.ConvertToFloatWithDecimal(items.reduce((acc, cur) => acc + cur.weight, 0));
    return weight;
  }

  public exportEInvoiceExcel() {
    if (this.selectedTransactions && this.selectedTransactions.length > 0) {
      let notValidInvoiceNo = this.selectedTransactions.filter(x => x.transactionType != TransactionType.Sales.toString()).map(x => x.number);
      if (notValidInvoiceNo && notValidInvoiceNo.length > 0)
        return this.alertDialogService.show(`Kindly remove <b>${notValidInvoiceNo.join(", ")}</b> from selection, because all those Invoice No. ${(notValidInvoiceNo.length == 1) ? "is" : "are"} not belong with sales transaction!`)

    }
    this.exportToExcel()
  }

  public async exportToExcel() {
    try {
      this.spinnerService.show();

      let excelFile = [];

      for (let index = 0; index < this.selectedTransactions.length; index++) {
        let element = this.selectedTransactions[index]

        var excel = await this.convertEInvioceToObjectExcel(SalesExportFields, element, index);
        excelFile.push(excel);
      }

      excelFile.unshift({})
      excelFile.unshift({})
      excelFile.unshift({})
      excelFile.unshift({})
      excelFile.unshift({})

      if (excelFile.length > 0)
        this.utilityService.exportSaleAsExcelFile(excelFile, (this.fxCredentials.organization ?? " "), (this.transactionSearchCriteria.toDate ? this.format(this.transactionSearchCriteria.toDate) : ""), (this.transactionSearchCriteria.fromDate ? this.format(this.transactionSearchCriteria.fromDate) : ""), "SaleTransaction_Excel");

      this.spinnerService.hide();

    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show("Something went wrong while exporting excel, contact administrator!!");
    }

  }

  public async convertEInvioceToObjectExcel(fields: Array<string>, transaction: Transaction, index: number) {

    var obj: any = {};
    for (let i = 0; i < fields.length; i++) {
      let isIgstFlag = false;
      let totalGstRate: number = 0;
      let totalGrossAmt = Number(this.utilityService.ConvertToFloatWithDecimalTwoDigitRound(transaction.amount * (transaction.transactionDetail.toCurRate ?? 0)));
      let quantity = this.utilityService.ConvertToFloatWithDecimal(transaction.items.reduce((acc, cur) => acc + cur.weight, 0));
      let totalSGstAmt: number = 0;
      let totalCGstAmt: number = 0;
      let totalIGstAmt: number = 0;
      if (transaction.transactionDetail.taxTypes && transaction.transactionDetail.taxTypes.length > 0) {
        isIgstFlag = (transaction.transactionDetail.taxTypes.findIndex(x => x.name == 'IGST') >= 0);
        totalGstRate = this.utilityService.ConvertToFloatWithDecimal(transaction.transactionDetail.taxTypes.reduce((acc, cur) => acc + cur.rate, 0));

        if (!isIgstFlag) {
          let SGstRate = (transaction.transactionDetail.taxTypes.find(x => x.name == 'SGST')?.rate) ?? 0;
          if (SGstRate && SGstRate > 0)
            totalSGstAmt = Number(parseFloat(parseFloat(this.utilityService.ConvertToFloatWithDecimal((SGstRate * (totalGrossAmt ?? 0)) / 100).toString()).toFixed(0)));

          let CGstRate = (transaction.transactionDetail.taxTypes.find(x => x.name == 'CGST')?.rate) ?? 0;
          if (CGstRate && CGstRate > 0)
            totalCGstAmt = Number(parseFloat(parseFloat(this.utilityService.ConvertToFloatWithDecimal((CGstRate * (totalGrossAmt ?? 0)) / 100).toString()).toFixed(0)));
        }
        else {
          let IGstRate = (transaction.transactionDetail.taxTypes.find(x => x.name == 'IGST')?.rate) ?? 0;
          if (IGstRate && IGstRate > 0)
            totalIGstAmt = Number(parseFloat(parseFloat(this.utilityService.ConvertToFloatWithDecimal((IGstRate * (totalGrossAmt ?? 0)) / 100).toString()).toFixed(0)));
        }
      }

      if (transaction) {
        if (fields[i] == "Supply Type")
          obj[fields[i]] = "B2B";
        if (fields[i] == "Igst On Intra" || fields[i] == "Igst On Intra2" || fields[i] == "Igst On Intra3")
          obj[fields[i]] = 'No';
        if (fields[i] == "Document Type")
          obj[fields[i]] = "TAX INVOICE";
        if (fields[i] == "Document Number")
          obj[fields[i]] = transaction.refNumber;
        if (fields[i] == "Document Date")
          obj[fields[i]] = this.format(transaction.transactionDate);
        if (fields[i] == "Document Date")
          obj[fields[i]] = this.format(transaction.transactionDate);
        if (fields[i] == "Document Date")
          obj[fields[i]] = this.format(transaction.transactionDate);
        if (fields[i] == "Blank1" || fields[i] == "Blank2" || fields[i] == "Blank3" || fields[i] == "Blank4" || fields[i] == "Blank5" || fields[i] == "Blank6" || fields[i] == "Blank7" || fields[i] == "Blank8" || fields[i] == "Blank9" || fields[i] == "Blank10" || fields[i] == "Blank11")
          obj[fields[i]] = "";
        if (fields[i] == "Buyer GSTIN" || fields[i] == "Buyer GSTIN2")
          obj[fields[i]] = transaction.toLedger.taxNo;
        if (fields[i] == "Buyer Legal Name" || fields[i] == "Buyer Legal Name2" || fields[i] == "Buyer Trade Name" || fields[i] == "Buyer Trade Name2")
          obj[fields[i]] = transaction.toLedger.name;
        if (fields[i] == "Buyer POS" || fields[i] == "Buyer Location" || fields[i] == "Buyer Location2" || fields[i] == "Buyer State" || fields[i] == "Buyer State2")
          obj[fields[i]] = (transaction.toLedger.address?.state) ?? '';
        if (fields[i] == "Buyer PinCode" || fields[i] == "Buyer PinCode2")
          obj[fields[i]] = (transaction.toLedger.address?.zipCode ?? '');
        if (fields[i] == "Buyer Addr1" || fields[i] == "Buyer Addr12")
          obj[fields[i]] = (transaction.toLedger.address?.line1 ?? '');
        if (fields[i] == "Buyer Addr2" || fields[i] == "Buyer Addr22")
          obj[fields[i]] = ((transaction.toLedger.address && transaction.toLedger.address?.city && transaction.toLedger.address?.zipCode)) ? ((transaction.toLedger.address.city ?? '') + '-' + (transaction.toLedger.address.zipCode ?? '')) : "";
        if (fields[i] == "Sl.NO.")
          obj[fields[i]] = index + 1;
        if (fields[i] == "Product Description")
          obj[fields[i]] = "Diamonds";
        if (fields[i] == "HSN Code")
          obj[fields[i]] = "71023910";
        if (fields[i] == "Quantity")
          obj[fields[i]] = quantity;
        if (fields[i] == "Unit")
          obj[fields[i]] = "OTHERS";
        if (fields[i] == "Unit Price")
          obj[fields[i]] = Math.round(totalGrossAmt / (quantity ?? 0));

        if (fields[i] == "Discount" || fields[i] == "Pre TaxValue" || fields[i] == "Cess Rate" ||
          fields[i] == "Cess Amt Adval" || fields[i] == "Cess Non Amt Adval" || fields[i] == "State Cess Rate" || fields[i] == "State Cess Amt Adval" || fields[i] == "State Cess Non Amt Adval"
          || fields[i] == "Other Charges" || fields[i] == "NoDigit1" || fields[i] == "NoDigit2" || fields[i] == "NoDigit3" || fields[i] == "Value Cess Amt"
          || fields[i] == "Value State Cess Amt" || fields[i] == "Value Discount" || fields[i] == "Value Other Charges" || fields[i] == "Value Round off")
          obj[fields[i]] = "0.00";

        if (fields[i] == "Gross Amount" || fields[i] == "Taxable Value" || fields[i] == "Value Total Taxable")
          obj[fields[i]] = totalGrossAmt;
        if (fields[i] == "GST Rate")
          obj[fields[i]] = (totalGstRate > 0) ? totalGstRate : "0.00";
        if (fields[i] == "Sgst Amt" || fields[i] == "Value Sgst Amt")
          obj[fields[i]] = (totalSGstAmt > 0) ? totalSGstAmt : 0;
        if (fields[i] == "Cgst Amt" || fields[i] == "Value Cgst Amt")
          obj[fields[i]] = (totalCGstAmt > 0) ? totalCGstAmt : 0;
        if (fields[i] == "IGST Amt" || fields[i] == "Value IGST Amt")
          obj[fields[i]] = (totalIGstAmt > 0) ? totalIGstAmt : 0;
        if (fields[i] == "Item Total" || fields[i] == "Value Total Invoice")
          obj[fields[i]] = Number(totalGrossAmt + ((totalSGstAmt > 0) ? totalSGstAmt : 0) + ((totalCGstAmt > 0) ? totalCGstAmt : 0) + ((totalIGstAmt > 0) ? totalIGstAmt : 0));
      }
    }
    return obj;
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

  public openExcelDialog() {
    this.showExcelOption = !this.showExcelOption;
  }

  public async exportToTransactionExcel(type: string) {
    try {
      this.spinnerService.show();

      if (this.selectedTransactions && this.selectedTransactions.length > 0) {
        let notValidInvoiceNo = this.selectedTransactions.filter(x => (x.transactionType != TransactionType.Sales.toString() && x.transactionType != TransactionType.Purchase.toString())).map(x => x.number);
        if (notValidInvoiceNo && notValidInvoiceNo.length > 0) {
          this.spinnerService.hide();
          return this.alertDialogService.show(`Transaction No. <b>${notValidInvoiceNo.join(", ")}</b> ${(notValidInvoiceNo.length == 1) ? "is" : "are"} not a <b> sales or purchase </b> transaction!`)
        }
      }

      let excelFile = [];
      for (let index = 0; index < this.selectedTransactions.length; index++) {
        let element = this.selectedTransactions[index]

        if (this.excelOption == "Export_Trans") {
          var excel = await this.convertTransactionToObjectExcel(TransactionExportFields, element);
          excelFile.push(excel);

        } else {
          let exportData: InventoryItems[] = [];
          let stoneIds = this.selectedTransactions[index].packingList.map(z => z.stoneId);
          exportData = await this.inventoryService.getInventoryByStoneIds(stoneIds);
          this.boUtilityService.orderByStoneIdInventoryItems(exportData);

          if (exportData && exportData.length > 0) {
            exportData.forEach((elements, indexs) => {
              let i = indexs + 1;
              elements.price = this.selectedTransactions[index].packingList.find(e => e.stoneId.toLowerCase() == elements.stoneId.toLowerCase())?.price ?? elements.price;
              if (this.selectedTransactions[index].transactionDetail.organization.address?.country?.toLowerCase() == 'india') {
                if (!this.selectedTransactions[index].transactionDetail.isOverseas && !this.selectedTransactions[index].transactionDetail.isDDA) {
                  elements.price.perCarat = Number(this.utilityService.ConvertToFloatWithDecimalTwoDigit(((this.selectedTransactions[index].packingList.find(e => e.stoneId.toLowerCase() == elements.stoneId.toLowerCase())?.price.perCarat) ?? 0) * (this.selectedTransactions[index].transactionDetail.toCurRate ?? 1)) ?? elements.price.perCarat);
                  elements.price.netAmount = Number(this.utilityService.ConvertToFloatWithDecimalTwoDigitRound(((this.selectedTransactions[index].packingList.find(e => e.stoneId.toLowerCase() == elements.stoneId.toLowerCase())?.price.netAmount) ?? 0) * (this.selectedTransactions[index].transactionDetail.toCurRate ?? 1)) ?? elements.price.netAmount);
                }
              }
              var excel = this.convertArrayToObjectExcel(salesExportExcelFormat, elements, i);
              excelFile.push(excel);
            });
          }
        }
      }
      if (type == "export") {
        if (excelFile.length > 0)
          this.utilityService.exportAsExcelFile(excelFile, this.excelOption == "sales_package" ? "Purchase_Excel" : "Sale_Tans_Excel");
      }
      this.spinnerService.hide();
      this.showExcelOption = false;
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.showExcelOption = false;
      this.alertDialogService.show("Something went wrong while exporting excel, contact administrator!!");
    }

  }

  public convertArrayToObjectExcel(fields: Array<{ text: string, value: string }>, element: any, index: number): any {
    var obj: any = {};
    for (let i = 0; i < fields.length; i++) {
      if (fields[i].value.includes("measurement")) {
        let propertyname = fields[i].value.split(".")[1];
        if (fields[i].text == "WIDTH")
          obj[fields[i].text] = element.measurement[propertyname] + ' - ' + element.measurement.length;
        else
          obj[fields[i].text] = element.measurement[propertyname];
      }
      else if (fields[i].value.includes("inclusion")) {
        let propertyname = fields[i].value.split(".")[1];
        obj[fields[i].text] = element.inclusion[propertyname];
      }
      else if (fields[i].value.includes("basePrice")) {
        let propertyname = fields[i].value.split(".")[1];
        obj[fields[i].text] = element.basePrice[propertyname];
      }
      else if (fields[i].value.includes("price")) {
        let propertyname = fields[i].value.split(".")[1];
        obj[fields[i].text] = element.price[propertyname];
      }
      else if (fields[i].text == "NO")
        obj[fields[i].text] = index;
      else
        obj[fields[i].text] = element[fields[i].value];
    }
    return obj;
  }

  public async convertTransactionToObjectExcel(fields: Array<string>, transaction: Transaction) {

    var obj: any = {};
    for (let i = 0; i < fields.length; i++) {
      if (transaction) {
        if (fields[i] == "TRANSACTION DATE")
          obj[fields[i]] = ((transaction?.transactionDate) ? this.format(new Date(transaction?.transactionDate)) : "") ?? "";
        if (fields[i] == "PAYMENT DATE")
          obj[fields[i]] = ((transaction?.paidDate) ? this.format(new Date(transaction?.paidDate)) : "") ?? "";
        if (fields[i] == "TRANSACTION NO")
          obj[fields[i]] = transaction?.number;
        if (fields[i] == "TRANSACTION TYPE")
          obj[fields[i]] = transaction?.transactionType;
        if (fields[i] == "INVOICE NO")
          obj[fields[i]] = transaction?.refNumber ?? "";
        if (fields[i] == "WEIGHT")
          obj[fields[i]] = this.getWeightOfTransactionItems(transaction?.items);
        if (fields[i] == "$/CT.")
          obj[fields[i]] = this.utilityService.ConvertToFloatWithDecimalTwoDigit(transaction?.items.reduce((acc, cur) => acc + cur.rate, 0));
        if (fields[i] == "AMOUNT")
          obj[fields[i]] = this.utilityService.ConvertToFloatWithDecimalTwoDigit(transaction?.items.reduce((acc, cur) => acc + cur.amount, 0));
        if (fields[i] == "COMPANY")
          obj[fields[i]] = transaction.toLedger?.name;
        if (fields[i] == "PAYMENT AMOUNT")
          obj[fields[i]] = this.utilityService.ConvertToFloatWithDecimalTwoDigit(transaction.amount);
        if (fields[i] == "PAID AMOUNT")
          obj[fields[i]] = this.utilityService.ConvertToFloatWithDecimalTwoDigit(transaction.paidAmount);
        if (fields[i] == "CC AMOUNT")
          obj[fields[i]] = this.utilityService.ConvertToFloatWithDecimalTwoDigit(transaction.ccAmount);
      }

    }
    return obj;
  }

  public onPrintToggle() {
    this.showPrintOption = !this.showPrintOption;
  }

  public openSendMailDialog() {
    this.exportToPdfMailObj = new ExportPdfMail();
    this.exportToPdfMailObj.cc = this.organizationData.email ?? "";
    this.exportToPdfMailObj.toEmail = this.transactionObj.toLedger.email;
    this.isSendMail = true;
  }

  public closeSendMailDialog() {
    this.isSendMail = false;
  }

  public async sendMail(form: NgForm) {
    if (!this.transactionObj.toLedger.email) {
      this.alertDialogService.show('Party ledger not found, Please contact administrator!');
      return;
    }

    let notValidEmail!: string;
    let ccEmail = this.exportToPdfMailObj.cc?.split(',');
    if (ccEmail) {
      ccEmail.forEach(z => {
        let isEmailValid = this.utilityService.checkValidEmail(z);
        if (!isEmailValid)
          notValidEmail = z;
      });
      if (notValidEmail) {
        this.alertDialogService.show(notValidEmail + ' Not valid email address!');
        return;
      }
    }

    let bccEmail = this.exportToPdfMailObj.bcc?.split(',');
    if (bccEmail) {
      bccEmail.forEach(z => {
        let isEmailValid = this.utilityService.checkValidEmail(z);
        if (!isEmailValid)
          notValidEmail = z;
      });
      if (notValidEmail) {
        this.alertDialogService.show(notValidEmail + ' Not valid email address!');
        return;
      }
    }

    this.alertDialogService.ConfirmYesNo("Are you sure you want to send mail to " + (this.exportToPdfMailObj.toEmail == '' ? this.transactionObj.toLedger.email : this.exportToPdfMailObj.toEmail) + "?", "Invoice Mail")
      .subscribe(async (res: any) => {
        if (res.flag) {
          try {
            if (!form.valid)
              return;

            let isCGMail = false;
            if (this.transactionObj.transactionDetail.organization.address?.country.toLowerCase() == 'belgium')
              isCGMail = true;

            this.spinnerService.show();
            let data = await this.getPrintHTMLData(isCGMail);
            if (!data || !data?.body) {
              this.alertDialogService.show('Print not found, Try again later!');
              this.spinnerService.hide();
              return;
            }

            if (this.transactionObj.transactionDetail.organization.name == "Diamart (hk) ltd." && !this.exportToPdfMailObj.subject)
              this.exportToPdfMailObj.subject = "INVOICE COPY FROM DIAMART (HK) LIMITED";

            if (this.transactionObj.transactionDetail.organization.name == "Diamart (hk) ltd." && !this.exportToPdfMailObj.body)
              this.exportToPdfMailObj.body = "I hope this email finds you at best of your health & spirit.\nPls find the attachment of the invoice copy.\nPls check it and let me know if there is any correction.\nPls make sure clear all bank charges both sides when you wire.\nNever send payments as per Emails as some phishing emails may misguide you. We are not responsible for any loss or damage in connection with the payments thru. Phishing emails. If you receive an email, claiming to be from Diamart (hk) Limited regarding the payment instructions to be followed as per Email only, let us know by forwarding the email at sales@diamarthk.com.\n\nBest Regards,\nDiamart (Hk) Ltd\nKanani Jignesh\nHong Kong Office:\n1104, 11/F, Chevalier House, 45-51 Chatham road south, Tsim Sha Tsui, Kowloon, Hong Kong.\n本司地址: 尖沙咀, 漆咸道南45-51號 其士大厦1104 室.\nEmail: sales@diamarthk.com | Mob: +852 56400400\nTel.: +852 23307750, +852 23307799 |";

            this.exportToPdfMailObj.pdfHtml = (data.header + data.body);
            this.exportToPdfMailObj.transactionId = this.transactionObj.id;
            this.exportToPdfMailObj.siteUrl = window.location.origin;

            let res = await this.transactionService.pdfMail(this.exportToPdfMailObj);
            if (res && res.isSuccess) {
              this.utilityService.showNotification(res.message);
              this.closeSendMailDialog();
            }
            else {
              console.error(res);
              if (res && res.message)
                this.alertDialogService.show(res.message);
              else
                this.alertDialogService.show("Something went wrong, Try again later");
            }
            this.spinnerService.hide();
          }
          catch (error: any) {
            console.error(error);
            this.alertDialogService.show("Something went wrong, Try again later");
            this.spinnerService.hide();
          }
        }
      });
  }

  //#region Popup Close
  @HostListener("document:click", ["$event"])
  public documentClick(event: any): void {
    if (!this.contains(event.target)) {
      this.showPrintOption = false;
    }
  }

  private contains(target: any): boolean {
    return (
      this.anchor.nativeElement.contains(target) ||
      (this.popup ? this.popup.nativeElement.contains(target) : false)
    );
  }
  //#endregion

  public UploadEWayBillNo(event: any) {
    try {
      const target: DataTransfer = <DataTransfer>(event.target);
      if (target.files.length !== 1) throw new Error('Cannot use multiple files');
      const reader: FileReader = new FileReader();
      reader.onload = (e: any) => {
        const bstr: string = e.target.result;
        const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });
        const wsname: string = wb.SheetNames[0];
        const ws: XLSX.WorkSheet = wb.Sheets[wsname];
        this.data = <AOA>(XLSX.utils.sheet_to_json(ws, { header: 1 }));
        this.data.map(res => {
          this.EwayBIllNo.push({
            irnNo: res[1],
            docketNo: res[4]
          });
        })
      };
      reader.readAsBinaryString(target.files[0]);
      this.EwayBIllNo.slice(1);
      this.transactionService.updateEwayBill(this.EwayBIllNo.slice(1));
      this.utilityService.showNotification('Eway bill number update successfully!');
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }
}
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { DataResult, process } from '@progress/kendo-data-query';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { Address, GridDetailConfig } from 'shared/businessobjects';
import { fxCredential, GridConfig, GridMasterConfig, MasterDNorm } from 'shared/enitites';
import { ConfigService, listCurrencyType, listExportType, salesExportExcelFormat, StoneStatus, TransactionType, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { CommuteItem, OrganizationDNorm } from '../../../../businessobjects';
import { AccountingConfig, BankDNorm, Branch, InventoryItems, Ledger, LedgerDNorm, LedgerSummary, Logistic, OrderInvItem, OrderItem, Organization, PackingItem, PriceDNorm, TaxType, Transaction, TransactionDetail, TransactionItem, TransactItem, TransactItemDNorm } from '../../../../entities';
import { AccountingconfigService, BoUtilityService, CommuteService, GridPropertiesService, InventoryService, LedgerService, LedgerSummaryService, LogisticService, MasterConfigService, MemoService, OrderService, OrganizationService, PrintInvoiceFormat, TransactionService, TransactItemService } from '../../../../services';
import { SaleMemo } from 'projects/CRM.BackOffice/src/app/businessobjects/memo/salememo';
import { MemoInventoryPrice } from 'projects/CRM.BackOffice/src/app/businessobjects/memo/memoinventroyprice';
import { Align } from '@progress/kendo-angular-popup';

@Component({
  selector: 'app-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.css']
})
export class SalesComponent implements OnInit {
  @Output() toggle: EventEmitter<boolean> = new EventEmitter();
  @Input() transactionObj: Transaction = new Transaction();
  public salesTransactionObj: Transaction = new Transaction();
  @Input() orderItems: OrderItem[] = new Array<OrderItem>();
  @Input() salesParty: LedgerDNorm = new LedgerDNorm();
  public fxCredentials!: fxCredential;
  public isPackinglistDialog: boolean = false;
  public accountConfig = new AccountingConfig();
  public selectedLedger: LedgerDNorm = new LedgerDNorm();
  public gridViewPackageList!: DataResult;
  public pageSize = 13;
  public skip = 0;
  public gridShowPackingList: PackingItem[] = new Array<PackingItem>();
  public clonePacketList: PackingItem[] = new Array<PackingItem>();
  public ledgers: LedgerDNorm[] = new Array<LedgerDNorm>();
  public transactItems: TransactItem[] = new Array<TransactItem>();
  public transactionItemObj: TransactionItem = new TransactionItem();
  public listTransactItemItems: Array<{ text: string; value: string }> = [];
  public transactItemsDNorm: TransactItemDNorm[] = [];
  public selectedTransactItem = "";
  public mySelectionTrans: string[] = [];
  public salesTotalAmount: number = 0;
  public salesTotalTaxAmount: number = 0;
  public selectableSettings: SelectableSettings = { mode: 'multiple' };
  public isShowCheckBoxAll: boolean = true;
  public defaultDropdownItem = { text: 'Select item...', value: '' };
  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains'
  };
  public mySelectionPackage: string[] = [];
  public listPartyItems: Array<{ text: string; value: string }> = [];
  public partyItems: LedgerDNorm[] = [];
  public allParty: Ledger[] = [];
  public selectedParty = "";
  public selectedConsign = "";
  public partyFlag: boolean = false;
  public selectedCallback = (args: any) => args.dataItem;
  public totalPacketAmount: number = 0;
  public totalPacketWeight: number = 0;
  public totalRap: number = 0;
  public avgDiscPer: number = 0;
  public selectedPartyLedger: Ledger = new Ledger();
  public selectedAddressId = "";
  public selectedAddress: Address = new Address();
  public listBankItems: Array<{ text: string; value: string }> = [];
  public bankItems: BankDNorm[] = [];
  public selectedBankItem?: string;
  public selectedBankIntermediaryBank?: string;
  public selectedBankintermediaryBankShift?: string;
  public bankObj: BankDNorm = new BankDNorm();
  public logisticObj: Logistic = new Logistic();
  public selectedlogisticItems?: string;
  public listlogisticItems: Array<{ text: string; value: string }> = [];
  public logisticItems: Logistic[] = [];
  public listTax: Array<{ name: string; isChecked: boolean }> = [];
  public allTheTax: TaxType[] = [];
  public listCurrencyType: Array<{ text: string; value: string }> = [];
  public filterTax: string = '';
  public filterTaxChk: boolean = true;
  public taxTypesZ: string[] = [];
  public listExportType: Array<{ text: string; value: string }> = [];
  public printFlag: boolean = false;
  public aboveFiveCentPrintFlag: boolean = false;
  public organizationData: OrganizationDNorm = new OrganizationDNorm();
  public organizationDetailData: Organization = new Organization();
  public transactionTypeItems: string[] = [TransactionType.Sales.toString(), TransactionType.Proforma.toString()];
  public cloneSalesTransactionObj: Transaction = new Transaction();
  public excelFile: any[] = [];
  public aboveOneCaratExcelFile: any[] = [];
  public belowOneCaratExcelFile: any[] = [];
  public validAddAmtLimit = true;
  public editableItemIndex = -1;
  public allTheShapes!: MasterDNorm[];
  public allColors!: MasterDNorm[];
  public filterStoneId: string = '';
  public filterShapes: Array<string> = new Array<string>();
  public filterColors: Array<string> = new Array<string>();
  public filterFWeight: number = null as any;
  public filterTWeight: number = null as any;
  public filterDiscount: number = null as any;
  public filterOrigin: string = null as any;
  public filterShapeChk: boolean = false;
  public filterColorChk: boolean = false;
  public searchString: string = '';
  public listTermsItems: Array<string> = [
    'AGAINST ADVANCE PAYMENT',
    'COD',
    'Due',
    'CONSIGNMENT BASIS',
    'GR WAIVED FOR CERTIFICATION',
    '90 DAYS D/A',
    '120 DAYS D/A',
    'ADVANCE',
    '30 DAYS',
    '60 DAYS',
    'HAND TO HAND'
  ];
  public isDisabled: boolean = true;
  public isLocked: boolean = false;
  public fields!: GridDetailConfig[];
  public isGridConfig: boolean = false;
  public gridConfig!: GridConfig;
  public gridMasterConfigResponse!: GridMasterConfig;
  public advancePaymentFlag: boolean = false;
  public creditNotePaymentFlag: boolean = false;
  public advancePaymentReceiptTransaction: Transaction = new Transaction();
  public creditNotePaymentTransaction: Transaction = new Transaction();
  public listBranchItems: Array<{ text: string; value: string }> = [];
  public branchItems: Branch[] = [];
  public selectedBranchItem?: { text: string; value: string };
  public branchObj: Branch = new Branch();
  public showExcelOption = false;
  public showPrintOption = false;
  public printOption: string | null = 'printInvoice';
  public excelOption: string | null = 'aboveFiveCentCarat';
  @ViewChild("anchor") public anchor!: ElementRef;
  @ViewChild("printAnchor") public printAnchor!: ElementRef;
  @ViewChild("popup", { read: ElementRef }) public popup!: ElementRef;
  public anchorAlign: Align = { horizontal: "right", vertical: "bottom" };
  public popupAlign: Align = { horizontal: "center", vertical: "top" };
  public anchorPrintAlign: Align = { horizontal: "left", vertical: "top" };
  public popupPrintAlign: Align = { horizontal: "left", vertical: "bottom" };
  public isStockTallyEnable: Boolean = false;

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
    private ledgerSummaryService: LedgerSummaryService,
    private configService: ConfigService,
    private gridPropertiesService: GridPropertiesService,
    private memoService: MemoService,
    private orderService: OrderService,
    private boUtilityService: BoUtilityService,
  ) { }

  async ngOnInit() {
    let enbleST = await this.utilityService.startIntervalCheck();

    if (enbleST)
      await this.checkStockTallyEnable();
    
    await this.defaultMethodLoad();
    await this.loadOrderAddDeclaration();

  }

  public async defaultMethodLoad() {
    this.fxCredentials = JSON.parse(sessionStorage.getItem("fxCredentials") ?? '') as fxCredential;
    if (this.fxCredentials == null || this.fxCredentials?.origin == null) {
      this.router.navigate(["login"]);
      return;
    }

    await this.getGridConfiguration();
    await this.loadListDetail();
    await this.loadParty();
    await this.loadBank();
    await this.loadOrganizationDetail();
    await this.loadMasterConfig();
    await this.loadTransactItemDNorm();
    await this.loadAccConfig();

    if (!this.transactionObj.id) {
      this.clearTransactionData();
      this.initTransactionData();
    }
    else
      this.validateEditObj();
    this.salesTransactionObj.transactionType = this.transactionObj.transactionType;

    if (this.salesTransactionObj.transactionType == TransactionType.Proforma.toString())
      this.salesTransactionObj.number = '';

    this.orderItems = this.orderItems.filter((v, i, a) => a.findIndex(v2 => (v2.invItem.stoneId === v.invItem.stoneId)) === i);
    if (this.orderItems && this.orderItems.length > 0) {
      this.salesTransactionObj.isLocked = this.orderItems.some(z => z.isLocked);
      this.salesTransactionObj.packingList = this.mappingExcelInvToTransactionPackage();

      //Check for memo created after order recive
      if (!this.salesTransactionObj.isLocked && this.salesParty && this.salesParty.id) {
        let memoStoneIds = this.salesTransactionObj.packingList.map(z => z.stoneId);
        let memoStonePriceList: Array<MemoInventoryPrice> = await this.memoService.getStonePriceFromMemo(memoStoneIds, this.salesParty.id);
        if (memoStonePriceList && memoStonePriceList.length > 0)
          this.salesTransactionObj.packingList.forEach(x => x.price = (memoStonePriceList.find(a => a.stoneId == x.stoneId)?.price) ?? x.price);
      }

      let isSameCurrency = this.salesTransactionObj.packingList.every(x => x.ccRate == this.salesTransactionObj.packingList[0].ccRate && x.ccType == this.salesTransactionObj.packingList[0].ccType)
      if (isSameCurrency) {
        this.salesTransactionObj.transactionDetail.toCurrency = this.salesTransactionObj.packingList[0].ccType;
        this.salesTransactionObj.transactionDetail.toCurRate = this.salesTransactionObj.packingList[0].ccRate;
      }

      this.clonePacketList = JSON.parse(JSON.stringify(this.salesTransactionObj.packingList));
      this.loadPacketListPaging();
      this.AddItemByPackageList(false);
    }

    if (this.salesParty && this.salesParty.id) {
      this.partyFlag = true;
      this.selectedParty = this.salesParty.name;
      this.salesTransactionObj.toLedger = this.salesParty;
      if (this.salesTransactionObj.id) {
        if (this.salesTransactionObj.transactionDetail.organization.address.country && this.salesTransactionObj.toLedger.address.country)
          this.salesTransactionObj.transactionDetail.isOverseas = this.salesTransactionObj.transactionDetail.organization.address.country?.trim()?.toLowerCase() == this.salesTransactionObj.toLedger.address.country?.trim()?.toLowerCase() ? false : true;
        else
          this.salesTransactionObj.transactionDetail.isOverseas = false;
      }
      else {
        if (this.organizationData.address.country && this.salesTransactionObj.toLedger.address.country)
          this.salesTransactionObj.transactionDetail.isOverseas = this.organizationData.address.country?.trim()?.toLowerCase() == this.salesTransactionObj.toLedger.address.country?.trim()?.toLowerCase() ? false : true;
        else
          this.salesTransactionObj.transactionDetail.isOverseas = false;
      }
    }

    if (this.transactionObj.toLedger.id)
      this.selectedParty = this.transactionObj.toLedger.name;
    if (this.transactionObj.toLedger.id)
      this.selectedConsign = this.transactionObj.transactionDetail.consigneeName;
    if (!this.transactionObj.id)
      this.fillTax();

    this.initPartyAddress();

    this.salesTransactionObj.transactionDetail.fromCurrency = listCurrencyType.USD.toString();
    this.salesTransactionObj.transactionDetail.fromCurRate = 1;

    if (!this.salesTransactionObj.transactionDetail.toCurRate) {
      if (this.organizationData.address.country == "Hong Kong") {
        this.salesTransactionObj.transactionDetail.toCurrency = listCurrencyType.HKD.toString();
        let res = this.accountConfigService.getFromToCurrencyRate(this.salesTransactionObj.transactionDetail.fromCurrency, this.salesTransactionObj.transactionDetail.toCurrency, this.accountConfig.currencyConfigs);
        this.salesTransactionObj.transactionDetail.toCurRate = res.toRate;
      }
      else if (this.organizationData.address.country == "India") {
        this.salesTransactionObj.transactionDetail.toCurrency = listCurrencyType.INR.toString();
        let res = this.accountConfigService.getFromToCurrencyRate(this.salesTransactionObj.transactionDetail.fromCurrency, this.salesTransactionObj.transactionDetail.toCurrency, this.accountConfig.currencyConfigs);
        this.salesTransactionObj.transactionDetail.toCurRate = res.toRate;
      }
    }

    await this.getBranch();
  }

  public async loadOrderAddDeclaration() {
    if (this.orderItems.length > 0 && (this.fxCredentials?.organization == "Diamart (hk) ltd." || this.fxCredentials?.organization == "GLOWSTAR" || this.fxCredentials?.organization == "SarjuImpex" )) {
      const partyId = this.orderItems[0].party.id;
      const isSamePartyIds = this.orderItems.every(item => item.party.id === partyId);

      if (isSamePartyIds) {
        this.salesTransactionObj.transactionDetail.additionalDeclaration = await this.ledgerService.getLedgerAddDeclaration(partyId);
      }
    }
  }

  //#region Check Stock Tally Enable Method

  public async checkStockTallyEnable() {
    try {
      this.isStockTallyEnable = await this.commuteService.checkIsStockTallyEnable();

      if (this.isStockTallyEnable)
        return this.alertDialogService.show('System cannot proceed with the sale transaction, purchase, and delivery because stock tally is enabled');
      
    }
    catch (error: any) {
      this.alertDialogService.show(error.error)
    }
  }

  //#endregion

  public async getGridConfiguration() {
    try {
      this.gridConfig = await this.configService.getGridConfig(this.fxCredentials?.id ?? '', "SalesPL", "SalesPLGrid", this.gridPropertiesService.getLabexpenseItems());
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
        this.gridMasterConfigResponse = await this.configService.getMasterGridConfig("SalesPL", "SalesPLGrid");
        if (this.gridMasterConfigResponse)
          this.fields = this.gridMasterConfigResponse.gridDetail;
        else
          this.fields = await this.gridPropertiesService.getSalesPLItems();
      }
    } catch (error: any) {
      this.alertDialogService.show(error.error)
      this.spinnerService.hide();
    }
  }

  public openGridConfigDialog(): void {
    this.isGridConfig = true;
  }

  public async setNewGridConfig(gridConfig: GridConfig) {
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


  public async loadOrganizationDetail() {
    try {
      let organizationDNormItems: any[] = await this.organizationService.getOrganizationDNorm();
      let organizationId = this.fxCredentials.organizationId;
      this.organizationData = organizationDNormItems.find(z => z.id == organizationId) ?? new OrganizationDNorm();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async loadMasterConfig() {
    let masterConfigList = await this.masterConfigService.getAllMasterConfig();
    masterConfigList.shape.forEach(x => x.isChecked = false);
    this.allTheShapes = masterConfigList.shape;
    masterConfigList.colors.forEach(x => x.isChecked = false);
    this.allColors = masterConfigList.colors;
  }

  public async validateEditObj() {
    this.transactionObj.transactionDate = this.getValidDate(this.transactionObj.transactionDate);
    if (this.transactionObj.transactionDetail.dueDate)
      this.transactionObj.transactionDetail.dueDate = this.getValidDate(this.transactionObj.transactionDetail.dueDate);
    else
      this.transactionObj.transactionDetail.dueDate = undefined as any;

    this.salesTransactionObj = this.transactionObj;
    this.cloneSalesTransactionObj = JSON.parse(JSON.stringify
      (this.transactionObj));
    this.partyFlag = true;
    this.selectedParty = this.salesTransactionObj.toLedger.name;
    this.selectedConsign = this.salesTransactionObj.transactionDetail.consigneeName;
    this.selectedBankItem = this.salesTransactionObj.transactionDetail.bank.bankName?.toString();
    this.selectedlogisticItems = this.salesTransactionObj.transactionDetail.logistic?.name;
    this.taxTypesZ = this.salesTransactionObj.transactionDetail.taxTypes?.map(x => x.name);
    this.selectedBankIntermediaryBank = this.salesTransactionObj.transactionDetail.bank.intermediaryBankName?.toString();
    this.selectedBankintermediaryBankShift = this.salesTransactionObj.transactionDetail.bank.intermediaryBankswift?.toString();
    this.salesTotalAmount = this.utilityService.ConvertToFloatWithDecimal(this.salesTransactionObj.items.map(z => z.total).reduce((ty, u) => ty + u, 0));
    this.calculateTransactionItems(true);

    this.salesTransactionObj.isLocked = this.transactionObj.isLocked;

    if (this.taxTypesZ.length > 0) {
      this.taxTypesZ.forEach(x => {
        if (this.listTax.findIndex(y => y.name == x) >= 0)
          this.listTax[this.listTax.findIndex(y => y.name == x)].isChecked = true;
      })
    }

    if (this.salesTransactionObj.packingList && this.salesTransactionObj.packingList.length > 0) {
      this.salesTransactionObj.packingList = this.salesTransactionObj.packingList.filter((v, i, a) => a.findIndex(v2 => (v2.stoneId === v.stoneId)) === i);
      this.clonePacketList = JSON.parse(JSON.stringify(this.salesTransactionObj.packingList));
      this.loadPacketListPaging();
    }

    if (this.salesTransactionObj.transactionDetail.fromCurrency && this.salesTransactionObj.transactionDetail.toCurrency) {
      if (!this.salesTransactionObj.transactionDetail.toCurRate) {
        let res = this.accountConfigService.getFromToCurrencyRate(this.salesTransactionObj.transactionDetail.fromCurrency, this.salesTransactionObj.transactionDetail.toCurrency, this.accountConfig.currencyConfigs);
        this.salesTransactionObj.transactionDetail.toCurRate = res.toRate;
      }
    }

    if (this.transactionObj.items && this.transactionObj.items.length > 0)
      this.transactionObj.items.forEach((value: TransactionItem, index: number) => { value.index = index.toString() });

    if (this.salesTransactionObj.paidAmount != this.salesTransactionObj.ccAmount) {
      this.initPartyAdvancePayment();
      this.initPartyCreditNotePayment();
    }
    this.spinnerService.hide();
  }

  public getValidDate(date: any): Date {
    const day = moment(date).date();
    const month = moment(date).month();
    const year = moment(date).year();
    var newDate = new Date(year, month, day);
    return newDate;
  }

  //#region  get data from account config */
  public async loadAccConfig() {
    try {
      this.accountConfig = await this.accountConfigService.getAccoutConfig();
    } catch (error) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Data load fail, Try again later!');
    }
  }

  public initTransactionData() {
    // this.salesTransactionObj.transactionType = TransactionType.Sale.toString();
    if (this.accountConfig && this.accountConfig.salesLedger)
      this.salesTransactionObj.fromLedger = this.accountConfig.salesLedger;
    else
      this.alertDialogService.show("Please first assign sales ledger in configuration.");

    this.spinnerService.hide();
  }
  //#endregion */

  //#region  Party section */
  public async loadParty() {
    try {
      let ledgerType: string[] = ["Customer"]
      this.allParty = await this.ledgerService.getAllLedgersByType(ledgerType);
      for (let index = 0; index < this.allParty.length; index++) {
        const element = this.allParty[index];
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
          taxNo: element.taxNo,
          isVerified: element.isVerified,
          isCertReminder: element.isCertReminder
        });
      }

      this.listPartyItems = [];
      this.partyItems.forEach(z => { this.listPartyItems.push({ text: z.name, value: z.id }); });
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Party not load, Try again later!');
    }
  }

  public handlePartyFilter(value: any) {
    this.listPartyItems = [];
    let partyItems = this.partyItems.filter(z => z.name?.toLowerCase().includes(value?.toLowerCase()))
    partyItems.forEach(z => { this.listPartyItems.push({ text: z.name, value: z.id }); });
  }

  public async onPartyChange(e: any) {
    if (e) {
      let fetchParty = this.partyItems.find(x => x.id == e);
      if (fetchParty && fetchParty != undefined) {
        setTimeout(() => {
          this.selectedParty = fetchParty?.name ?? '';
        }, 0);
        fetchParty.address.type = "Primary Address";
        this.salesTransactionObj.toLedger = fetchParty;

        //sale invoice add. declaration from ledger for Diamart (hk) ltd.
        if (fetchParty?.id && (this.fxCredentials?.organization == "Diamart (hk) ltd." || this.fxCredentials?.organization == "GLOWSTAR" || this.fxCredentials?.organization == "SarjuImpex" ))
          this.salesTransactionObj.transactionDetail.additionalDeclaration = await this.ledgerService.getLedgerAddDeclaration(fetchParty?.id);

      }
      else {
        if (this.fxCredentials.organization == "Diamart (hk) ltd." || this.fxCredentials?.organization == "GLOWSTAR" || this.fxCredentials?.organization == "SarjuImpex" )
          this.salesTransactionObj.transactionDetail.additionalDeclaration = "";
        this.salesTransactionObj.toLedger = new LedgerDNorm();
      }
    }
    else {
      if (this.fxCredentials.organization == "Diamart (hk) ltd." || this.fxCredentials?.organization == "GLOWSTAR" || this.fxCredentials?.organization == "SarjuImpex" )
        this.salesTransactionObj.transactionDetail.additionalDeclaration = "";
      this.salesTransactionObj.toLedger = new LedgerDNorm();
    }

    this.initPartyAddress();

    if (!this.transactionObj.id) {
      await this.initPartyAdvancePayment();
      await this.initPartyCreditNotePayment();
    }

    if (this.organizationData.address.country && this.salesTransactionObj.toLedger.address.country)
      this.salesTransactionObj.transactionDetail.isOverseas = this.organizationData.address.country?.trim()?.toLowerCase() == this.salesTransactionObj.toLedger.address.country?.trim()?.toLowerCase() ? false : true;
    else
      this.salesTransactionObj.transactionDetail.isOverseas = false;

    this.fillTax();

    if (this.taxTypesZ.length > 0) {
      this.taxTypesZ.forEach(x => {
        if (this.listTax.findIndex(y => y.name == x) >= 0)
          this.listTax[this.listTax.findIndex(y => y.name == x)].isChecked = true;
      })
    }
  }

  public async onConsignChange(e: any) {
    if (e) {
      let fetchParty = this.partyItems.find(x => x.id == e);
      if (fetchParty && fetchParty != undefined) {
        setTimeout(() => {
          this.selectedConsign = fetchParty?.name ?? '';
        }, 0);
        this.salesTransactionObj.transactionDetail.consigneeName = fetchParty.name;
        this.salesTransactionObj.transactionDetail.consignee = fetchParty;
      }
      else {
        this.salesTransactionObj.transactionDetail.consignee = new LedgerDNorm();
        this.salesTransactionObj.transactionDetail.consigneeName = "";
      }
    }
    else {
      this.salesTransactionObj.transactionDetail.consignee = new LedgerDNorm();
      this.salesTransactionObj.transactionDetail.consigneeName = "";
    }
  }

  public initPartyAddress() {
    if (this.salesTransactionObj.toLedger && this.salesTransactionObj.toLedger.id?.length > 0) {
      this.selectedPartyLedger = this.allParty.find(z => z.id == this.salesTransactionObj.toLedger.id) ?? new Ledger();
      if (this.selectedPartyLedger.address.id == null) {
        this.selectedPartyLedger = this.allParty.find(z => z.idents[0] == this.salesTransactionObj.toLedger.id) ?? new Ledger();
      }
      this.selectedAddressId = this.salesTransactionObj.toLedger.address.id;
      if (this.selectedPartyLedger.address.id != null) {
        this.selectedAddress = this.selectedPartyLedger.address;
        this.salesTransactionObj.toLedger.address = JSON.parse(JSON.stringify(this.selectedAddress));
      }
    }
    this.fillTax();
  }

  public async initPartyAdvancePayment() {
    try {
      this.advancePaymentReceiptTransaction = new Transaction();
      if (this.salesTransactionObj.toLedger && this.salesTransactionObj.toLedger.id?.length > 0)
        this.advancePaymentReceiptTransaction = await this.transactionService.getAdvancePaymentForSales(this.salesTransactionObj.toLedger.id);
    } catch (error: any) {
      console.error(error);
    }
  }

  public async initPartyCreditNotePayment() {
    try {
      this.creditNotePaymentTransaction = new Transaction();
      if (this.salesTransactionObj.toLedger && this.salesTransactionObj.toLedger.id?.length > 0)
        this.creditNotePaymentTransaction = await this.transactionService.getCreditNotePaymentForSales(this.salesTransactionObj.toLedger.id);
    } catch (error: any) {
      console.error(error);
    }
  }


  public onAddressChange(e: string) {
    this.selectedAddressId = e;
    let address = this.selectedPartyLedger.address;
    address.type = "Primary Address";
    if (this.selectedPartyLedger.address.id != e)
      address = this.selectedPartyLedger.otherAddress.find(z => z.id == e) ?? new Address();

    this.selectedAddress = address;
    if (this.organizationData.address.country && this.selectedAddress.country)
      this.salesTransactionObj.transactionDetail.isOverseas = this.organizationData.address.country?.trim()?.toLowerCase() == this.selectedAddress.country?.trim()?.toLowerCase() ? false : true;
    else
      this.salesTransactionObj.transactionDetail.isOverseas = false;
  }

  public saveAddress() {
    this.onAddressChange(this.selectedAddressId);
    this.salesTransactionObj.toLedger.address = JSON.parse(JSON.stringify(this.selectedAddress));
  }
  //#endregion */

  //#region Transaction Item Add / Remove
  public addTransactionItem() {
    if (!this.validateTransactionItemData())
      return;

    this.calculateTransactItem();
    //Set index number for delete Item
    this.transactionItemObj.index = this.salesTransactionObj.items.length.toString();
    if (this.editableItemIndex != -1) {
      this.salesTransactionObj.items[this.editableItemIndex] = this.transactionItemObj;
      this.editableItemIndex = -1;
    }
    else
      this.salesTransactionObj.items.push(JSON.parse(JSON.stringify(this.transactionItemObj)));

    this.transactionItemObj = new TransactionItem();
    this.selectedTransactItem = '';
    this.mySelectionTrans = [];

    this.calculateTransactionItems();
  }

  public editItem(item: TransactionItem, index: number) {
    this.transactionItemObj = JSON.parse(JSON.stringify(item));
    this.selectedTransactItem = JSON.parse(JSON.stringify(item.item.id));
    this.editableItemIndex = JSON.parse(JSON.stringify(index));
    this.mySelectionTrans.push(item.index.toString());
  }

  public calculateTransactItem() {
    this.transactionItemObj.amount = this.utilityService.ConvertToFloatWithDecimal((this.transactionItemObj.rate * this.transactionItemObj.weight));

    if (this.transactionItemObj.discPerc != null && this.transactionItemObj.discPerc > 0)
      this.transactionItemObj.discount = this.utilityService.ConvertToFloatWithDecimal((this.transactionItemObj.amount * this.transactionItemObj.discPerc / 100));
    else {
      this.transactionItemObj.discount = 0;
      this.transactionItemObj.discPerc = 0;
    }

    if (this.transactionItemObj.item.taxTypes != null) {
      this.transactionItemObj.taxAmount = 0;
      this.transactionItemObj.item.taxTypes.forEach((ele) => {
        this.transactionItemObj.taxAmount += this.utilityService.ConvertToFloatWithDecimal((this.transactionItemObj.amount * ele.rate / 100));
      });
    }
    else
      this.transactionItemObj.taxAmount = 0;

    this.transactionItemObj.total = this.utilityService.ConvertToFloatWithDecimal(this.transactionItemObj.amount - this.transactionItemObj.discount + this.transactionItemObj.taxAmount);
  }

  public calculateTransactionItems(additionalAmtManualChange = false) {
    this.salesTransactionObj.amount = this.utilityService.ConvertToFloatWithDecimal(this.salesTransactionObj.items.map(z => z.amount).reduce((ty, u) => ty + u, 0));
    if (this.taxTypesZ.length > 0) {
      let selectedTaxes = this.allTheTax.filter(z => this.taxTypesZ.includes(z.name));
      let taxtAmount = 0;
      selectedTaxes.forEach(z => {
        taxtAmount += this.utilityService.ConvertToFloatWithDecimal((this.salesTransactionObj.amount * z.rate / 100));
      });
      this.salesTotalTaxAmount = this.utilityService.ConvertToFloatWithDecimal(taxtAmount);
    }
    else
      this.salesTotalTaxAmount = 0;

    let shippingCharge = this.salesTransactionObj.transactionDetail.shippingCharge ?? 0;
    if (shippingCharge.toString() == '' || shippingCharge.toString() == 'NaN' || shippingCharge.toString() == 'undefined' || shippingCharge.toString() == 'null')
      shippingCharge = 0;

    this.salesTransactionObj.discount = this.utilityService.ConvertToFloatWithDecimal(this.salesTransactionObj.items.map(z => z.discount).reduce((ty, u) => ty + u, 0));
    this.salesTransactionObj.taxAmount = this.salesTotalTaxAmount + this.utilityService.ConvertToFloatWithDecimal(this.salesTransactionObj.items.map(z => z.taxAmount).reduce((ty, u) => ty + u, 0));
    this.salesTotalAmount = this.utilityService.ConvertToFloatWithDecimal(this.salesTransactionObj.items.map(z => z.total).reduce((ty, u) => ty + u, 0) + this.salesTransactionObj.taxAmount + Number(shippingCharge));
    this.salesTransactionObj.netTotal = this.salesTotalAmount;

    this.calculateCCAmt(additionalAmtManualChange);
    // if (this.totalPacketAmount == 0) {
    //   this.salesTransactionObj.packingList = JSON.parse(JSON.stringify(this.clonePacketList));
    //   this.totalPacketAmount = Number((this.clonePacketList.map(z => (z.price.netAmount ?? 0)).reduce((ty, u) => ty + u, 0)).toFixed(2));
    //   this.totalRap = Number((this.clonePacketList.map(z => ((z.price.rap ?? 0) * (z.weight))).reduce((ty, u) => ty + u, 0)).toFixed(2));
    //   this.avgDiscPer = Number((((this.totalPacketAmount / this.totalRap) * 100) - 100).toFixed(2));
    // }

    // if (this.salesTransactionObj.netTotal > 0)
    //   this.calculatePer();
    // else
    //   this.salesTransactionObj.packingList = JSON.parse(JSON.stringify(this.clonePacketList));
    // this.loadPacketListPaging();
  }

  public validateTransactionItemData(): boolean {
    if (!this.transactionItemObj.item || !this.transactionItemObj.item?.name) {
      this.alertDialogService.show('Please select Transact Item!');
      return false;
    }
    else if (!this.transactionItemObj.quantity) {
      this.alertDialogService.show('Please enter quantity!');
      return false;
    }
    else if (!this.transactionItemObj.weight) {
      this.alertDialogService.show('Please enter weight!');
      return false;
    }
    else if (!this.transactionItemObj.rate) {
      this.alertDialogService.show('Please enter rate!');
      return false;
    }

    return true;
  }

  public removeTransactionItems() {
    this.mySelectionTrans.forEach(z => {
      let index = this.salesTransactionObj.items.findIndex(a => a.index == z);
      if (index > -1)
        this.salesTransactionObj.items.splice(index, 1);
    });
    this.mySelectionTrans = [];

    this.transactionItemObj = new TransactionItem();
    this.selectedTransactItem = '';

    this.calculateTransactionItems();
  }

  public async loadTransactItemDNorm() {
    try {
      let data = await this.transactItemService.getTransactItemDNorm();
      if (data) {
        this.transactItemsDNorm = data;
        this.listTransactItemItems = [];
        this.transactItemsDNorm.forEach(z => { this.listTransactItemItems.push({ text: z.name, value: z.id }); });
      }
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Transact Item not load, Try again later!');
    }
  }

  public onTransactItemChange() {
    let fetchDNorm = this.transactItemsDNorm.find(x => x.id == this.selectedTransactItem);
    if (fetchDNorm)
      this.transactionItemObj.item = fetchDNorm ?? new TransactItemDNorm();
    else
      this.transactionItemObj.item = new TransactItemDNorm();
  }
  //#endregion

  //#region Save | Add Sales Transaction
  public async saveTransaction(isNew = false) {
    if (this.salesTransactionObj.items == null || this.salesTransactionObj.items.length == 0) {
      this.alertDialogService.show('Please add at least one transaction item!');
      return;
    }

    if (this.salesTransactionObj.transactionDetail.toCurrency == null) {
      this.alertDialogService.show("Please add toCurrency for transaction!");
      return;
    }

    if (this.salesTransactionObj.toLedger.id == null || this.salesTransactionObj.toLedger.id == undefined) {
      this.alertDialogService.show('Please select party!');
      return;
    }

    // check ledger isVerified
    if (!this.salesTransactionObj.id && !this.salesTransactionObj.transactionDetail.isSkipInvEnum && !this.salesTransactionObj.toLedger.isVerified) {
      this.alertDialogService.show('Please verify party before generating sales!');
      return;
    }

    if (this.salesTransactionObj.packingList && this.salesTransactionObj.packingList.length > 0 && !this.transactionObj.id) {
      let totalQty = this.salesTransactionObj.items.map(z => z.quantity).reduce((ty, u) => ty + u, 0);
      if (this.salesTransactionObj.packingList.length != totalQty) {
        this.alertDialogService.show('Item(s) should have same quantity as package(s)');
        return;
      }

      if (this.totalPacketAmount != this.salesTransactionObj.amount) {
        this.alertDialogService.show('Item(s) Total Amount should have same as package(s)');
        return;
      }
    }

    if (this.salesTransactionObj.toLedger.address.country?.toLowerCase() != this.salesTransactionObj.fromLedger.address.country?.toLowerCase())
      this.salesTransactionObj.transactionDetail.taxTypes = this.getSelectedManualTaxTypeData();
    this.salesTransactionObj.transactionDetail.organization = this.organizationData;

    //if (this.salesTransactionObj.transactionDetail.organization.address.country && this.salesTransactionObj.toLedger.address.country)
    //this.salesTransactionObj.transactionDetail.isOverseas = this.salesTransactionObj.transactionDetail.organization.address.country?.trim()?.toLowerCase() == this.salesTransactionObj.toLedger.address.country?.trim()?.toLowerCase() ? false : true;
    //else
    //this.salesTransactionObj.transactionDetail.isOverseas = false;

    this.alertDialogService.ConfirmYesNo(`Are you sure you want to ${this.salesTransactionObj.id ? "update" : "add"} sales transaction${this.advancePaymentFlag ? ' with Advance Payment' : ''}`, `${this.salesTransactionObj.id ? "Update" : "Add"} Transaction`)
      .subscribe(async (res: any) => {
        if (res.flag) {
          try {
            if (this.advancePaymentFlag) {
              if (this.advancePaymentReceiptTransaction.transactionDetail.fromCurrency != this.salesTransactionObj.transactionDetail.toCurrency) {
                this.alertDialogService.show('Advance Payment & Sales Currency not match!');
                return;
              }

              this.salesTransactionObj.paymentDetail.selectedTransactionId.push(this.advancePaymentReceiptTransaction.id);
              if (this.advancePaymentReceiptTransaction.paidAmount >= this.salesTransactionObj.ccAmount)
                this.salesTransactionObj.paidAmount = this.salesTransactionObj.ccAmount;
              else if (this.salesTransactionObj.ccAmount > this.advancePaymentReceiptTransaction.paidAmount)
                this.salesTransactionObj.paidAmount = this.advancePaymentReceiptTransaction.paidAmount;
            }

            if (this.creditNotePaymentFlag) {
              if (this.creditNotePaymentTransaction.transactionDetail.fromCurrency != this.salesTransactionObj.transactionDetail.toCurrency) {
                this.alertDialogService.show('Credit Note Payment & Sales Currency not match!');
                return;
              }

              this.salesTransactionObj.paymentDetail.selectedTransactionId.push(this.creditNotePaymentTransaction.id);
              if (this.creditNotePaymentTransaction.paidAmount >= this.salesTransactionObj.ccAmount)
                this.salesTransactionObj.paidAmount = this.salesTransactionObj.ccAmount;
              else if (this.salesTransactionObj.ccAmount > this.creditNotePaymentTransaction.paidAmount)
                this.salesTransactionObj.paidAmount = this.creditNotePaymentTransaction.paidAmount;
            }

            if (this.salesTransactionObj && this.selectedBranchItem?.text) {
              this.salesTransactionObj.fromLedger.address = this.branchObj.address;
              this.salesTransactionObj.transactionDetail.organization.address = this.branchObj.address;
              this.salesTransactionObj.transactionDetail.organization.email = this.branchObj.email;
              this.salesTransactionObj.transactionDetail.organization.faxNo = this.branchObj.faxNo;
              this.salesTransactionObj.transactionDetail.organization.mobileNo = this.branchObj.mobileNo;
              this.salesTransactionObj.transactionDetail.organization.person = this.branchObj.person;
              this.salesTransactionObj.transactionDetail.organization.phoneNo = this.branchObj.phoneNo;
              this.salesTransactionObj.transactionDetail.organization.gstNo = this.branchObj.taxNo;
              this.salesTransactionObj.transactionDetail.organization.incomeTaxNo = this.branchObj.incomeTaxNo;
              this.salesTransactionObj.transactionDetail.organization.taxNo = this.branchObj.taxNo;
            }

            this.spinnerService.show();
            let reponseId = await this.requestTransaction();
            if (this.printFlag || this.aboveFiveCentPrintFlag)
              this.printInvoice(reponseId);
            this.clearTransactionData();
            this.loadAccConfig();

            if (!isNew)
              this.closeSalesDialog(true);
          }
          catch (error: any) {
            console.error(error);
            this.spinnerService.hide();
            this.alertDialogService.show('Inventory not added, Please contact administrator!')
          }
        }
      });
  }

  public async requestTransaction() {
    try {
      let res: any;
      if (this.salesTransactionObj.transactionDate != null)
        this.salesTransactionObj.transactionDate = this.utilityService.setUTCDateFilter(this.salesTransactionObj.transactionDate);

      this.boUtilityService.orderByStoneIdPackingItems(this.salesTransactionObj.packingList);

      if (this.salesTransactionObj.id)
        res = await this.transactionService.update(this.salesTransactionObj);
      else {
        this.salesTransactionObj.createdBy = this.fxCredentials.fullName;
        res = await this.transactionService.insert(this.salesTransactionObj);
      }

      if (res || (res == "" && this.salesTransactionObj.transactionDetail.isSkipInvEnum)) {
        if (!this.salesTransactionObj.id) {
          if (this.salesTransactionObj.transactionType == TransactionType.Sales.toString()) {
            if (this.orderItems && this.orderItems.length > 0) {
              for (let index = 0; index < this.orderItems.length; index++) {
                let orderItem = this.orderItems[index];
                if (orderItem.broker.id) {
                  let isBrokerExist = await this.ledgerService.getLedgerById(orderItem.broker.id);
                  if (isBrokerExist.id) {
                    let brokerLedgerSummary = await this.ledgerSummaryService.getLedgerSummaryByLedgerId(isBrokerExist.id);
                    if (brokerLedgerSummary == null)
                      brokerLedgerSummary = new LedgerSummary();

                    brokerLedgerSummary.name = "Brokers";
                    brokerLedgerSummary.ledger = orderItem.broker;
                    if (orderItem.isLocked) {
                      if (orderItem.invItem.brokerAmount != null)
                        brokerLedgerSummary.credit += orderItem.invItem.brokerAmount;
                      else
                        brokerLedgerSummary.credit += 0;
                      brokerLedgerSummary.debit = 0;
                      brokerLedgerSummary.total = brokerLedgerSummary.debit - brokerLedgerSummary.credit;
                      brokerLedgerSummary.lastTransaction = this.utilityService.setLiveUTCDate();
                    }

                    if (!brokerLedgerSummary.id)
                      await this.ledgerSummaryService.insert(brokerLedgerSummary);
                    else
                      await this.ledgerSummaryService.update(brokerLedgerSummary);
                  }
                }
              }
            }

            //Update Stone Status To Sold (if package list exists)
            if (this.salesTransactionObj.packingList.length > 0) {
              let invCommuteObject = new CommuteItem();
              invCommuteObject.status = StoneStatus.Sold.toString();
              invCommuteObject.isMemo = false;
              invCommuteObject.stoneIds = this.salesTransactionObj.packingList.map(x => x.stoneId);
              invCommuteObject.organizationCode = this.fxCredentials?.orgCode;
              let updateResponse = await this.commuteService.updateStoneStatus(invCommuteObject);
              if (updateResponse) {
                //Remove stones from memo
                let isStoneRemoved = await this.memoService.removeMemoStones(invCommuteObject.stoneIds);
                if (!isStoneRemoved)
                  this.alertDialogService.show('Stone not removed from memo. please contact admin', 'error');

                this.utilityService.showNotification(`Sales transaction added successfully! ${(!this.salesTransactionObj.id && !this.salesTransactionObj.transactionDetail.isSkipInvEnum) ? " Transactions No: " + res : ""}`);
              }
              else
                this.alertDialogService.show(`Sales transaction not add, Please try again later!`, 'error');
            }
            else
              this.utilityService.showNotification(`Sales transaction added successfully! ${(!this.salesTransactionObj.id && !this.salesTransactionObj.transactionDetail.isSkipInvEnum) ? " Transactions No: " + res : ""}`);

          }
          else
            this.utilityService.showNotification(`Sales transaction ${this.salesTransactionObj.id ? "updated" : "added"} successfully! ${(!this.salesTransactionObj.id && !this.salesTransactionObj.transactionDetail.isSkipInvEnum) ? " Transactions No: " + res : ""}`);
        }
        else
          this.utilityService.showNotification(`Sales transaction added successfully! ${(!this.salesTransactionObj.id && !this.salesTransactionObj.transactionDetail.isSkipInvEnum) ? " Transactions No: " + res : ""}`);
        this.spinnerService.hide();

        return res;
      }
      else {
        this.spinnerService.hide();
        this.alertDialogService.show(`Sales transaction not ${this.salesTransactionObj.id ? "update" : "add"}, Please try again later!`, 'error');
      }

    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(`Sales transaction not ${this.salesTransactionObj.id ? "update" : "add"}, Please try again later!`, 'error')
    }
  }

  public clearTransactionData() {
    this.mySelectionPackage = [];
    this.mySelectionTrans = [];
    this.salesTransactionObj = new Transaction();
    this.salesTransactionObj.items = new Array<TransactionItem>();
    this.transactionItemObj = new TransactionItem();
    this.selectedTransactItem = '';
    this.salesTotalAmount = 0;
    this.salesTransactionObj.transactionDate = new Date();
    this.salesTransactionObj.transactionDetail.fromCurrency = listCurrencyType.USD.toString();
    this.salesTransactionObj.transactionDetail.fromCurRate = 1;
    this.calculateTransactionItems();
  }
  //#endregion

  //#region  Package list section 
  public togglePackinglistDialog(): void {
    this.isPackinglistDialog = !this.isPackinglistDialog;
    if (!this.isPackinglistDialog) {
      this.skip = 0;
      this.filterDiscount = null as any;
      this.filterOrigin = null as any;
      this.searchString = '';
      this.clearPackageFilter();
    }
  }

  public async loadPacketListPaging() {
    this.gridShowPackingList = new Array<PackingItem>();
    if (this.salesTransactionObj.packingList.length > 0) {
      for (let i = this.skip; i < this.pageSize + this.skip; i++) {
        const element = this.salesTransactionObj.packingList[i];
        if (element)
          this.gridShowPackingList.push(element);
      }
    }

    this.loadPacketItemInventoryGrid(this.salesTransactionObj.packingList);
  }

  public async loadPacketItemInventoryGrid(packingItems: PackingItem[]) {
    this.gridViewPackageList = process(this.gridShowPackingList, {});
    this.gridViewPackageList.total = packingItems.length;
    this.totalPacketWeight = Number((packingItems.reduce((acc, cur) => acc + cur.weight, 0)).toFixed(2));
    this.totalPacketAmount = Number((packingItems.map(z => (z.price.netAmount ?? 0)).reduce((ty, u) => ty + u, 0)).toFixed(2));
    this.totalRap = Number((packingItems.map(z => ((z.price.rap ?? 0) * (z.weight))).reduce((ty, u) => ty + u, 0)).toFixed(2));
    if (this.totalPacketAmount > 0)
      this.avgDiscPer = Number((((this.totalPacketAmount / this.totalRap) * 100) - 100).toFixed(2));
    else
      this.avgDiscPer = 0;
    this.spinnerService.hide();
  }

  public pageChange(event: PageChangeEvent): void {
    this.spinnerService.show();
    this.gridShowPackingList = [];
    this.skip = event.skip;
    this.loadPacketListPaging();
  }

  public async deletePackingList() {
    try {

      let canDelete: boolean = true;
      if (this.salesTransactionObj.id) {
        let isDelivered = await this.orderService.checkOrderIsDelivered(this.salesTransactionObj.id);
        canDelete = isDelivered ? false : true;
        if (!isDelivered) {

          let orderItems: Array<OrderItem> = await this.orderService.getOrderItemsByStoneIds(this.mySelectionPackage);
          let orderStoneIds = new Array<string>();

          if (orderItems && orderItems.length > 0) {

            orderStoneIds = orderItems.map(x => x.invItem.stoneId);
            let orderWoLeadStoneId = orderItems.filter(x => !x.leadId && !x.leadNumber).map(a => a.invItem.stoneId);
            if (orderWoLeadStoneId && orderWoLeadStoneId.length > 0) {
              let deleteOrderResponse = await this.orderService.deleteOrderItemByStoneIds(orderWoLeadStoneId);
              if (deleteOrderResponse)
                orderStoneIds = orderStoneIds.filter(x => !orderWoLeadStoneId.includes(x));
            }

            let stoneStatus = StoneStatus.Order.toString();
            let orderTransactionRes = await this.orderService.updateTrasactionIdOrderItem(orderStoneIds);
            if (orderTransactionRes)
              await this.setStoneStatusUpdate(orderStoneIds, stoneStatus);


            this.mySelectionPackage = this.mySelectionPackage.filter(x => !orderStoneIds.includes(x));
            if (this.mySelectionPackage && this.mySelectionPackage.length > 0)
              this.setStoneStatusUpdate(this.mySelectionPackage, StoneStatus.Stock.toString())
          }
          else
            this.setStoneStatusUpdate(this.mySelectionPackage, StoneStatus.Stock.toString())

        }
      }

      if (canDelete) {
        this.mySelectionPackage.forEach(z => {
          let index = this.salesTransactionObj.packingList.findIndex(a => a.stoneId?.toLowerCase() == z?.toLowerCase());
          if (index > -1)
            this.salesTransactionObj.packingList.splice(index, 1);
        });

        this.clonePacketList = JSON.parse(JSON.stringify(this.salesTransactionObj.packingList));
        this.totalPacketAmount = Number((this.salesTransactionObj.packingList.map(z => (z.price.netAmount ?? 0)).reduce((ty, u) => ty + u, 0)).toFixed(2));
        this.totalRap = Number((this.salesTransactionObj.packingList.map(z => ((z.price.rap ?? 0) * (z.weight))).reduce((ty, u) => ty + u, 0)).toFixed(2));
        if (this.totalPacketAmount > 0)
          this.avgDiscPer = Number((((this.totalPacketAmount / this.totalRap) * 100) - 100).toFixed(2));
        else
          this.avgDiscPer = 0;

        //this.calculatePer();
        this.loadPacketListPaging();
        this.mySelectionPackage = [];
      }
      else
        this.alertDialogService.show('Can not delete delivered stones. Please Cancel Sale');

    } catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show("Something went wrong!, while deleting stone");
    }
  }

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

  public calculatePer() {
    let findPer = 100 - Number(((this.salesTransactionObj.netTotal * 100) / this.totalPacketAmount).toFixed(2));
    if (findPer) {
      this.salesTransactionObj.packingList.forEach(z => {
        z.price.netAmount = Number((Number(z.price.netAmount) - (Number(z.price.netAmount) * (findPer / 100))).toFixed(2));
        z.price.discount = Number((((z.price.netAmount / ((z.price.rap ?? 0) * (z.weight ?? 0))) * 100) - 100).toFixed(2));
        z.price.perCarat = Number(Number(z.price.netAmount / z.weight).toFixed(2));
      });
    }
  }

  public async selectAllPackingList(event: string) {
    this.mySelectionPackage = [];
    if (event?.toLowerCase() == 'checked')
      this.mySelectionPackage = this.salesTransactionObj.packingList.map(z => z.stoneId);
  }
  //#endregion

  public openDeleteDialog() {
    try {
      this.alertDialogService.ConfirmYesNo('Are you sure you want to delete stones from transaction?', 'Stones delete!')
        .subscribe(async (res: any) => {
          if (res.flag) {
            if (this.isPackinglistDialog)
              this.deletePackingList();
            else
              this.removeTransactionItems();
          }
        })
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error)
    }
  }

  public closeSalesDialog(flag: boolean): void {
    this.toggle.emit(flag);
  }

  //#region  type cast orderitems to packging items */
  public mappingExcelInvToTransactionPackage(): PackingItem[] {
    let items: PackingItem[] = [];
    this.orderItems.forEach(z => {
      let obj = new PackingItem();
      obj.invId = z.invItem.invId;
      obj.stoneId = z.invItem.stoneId;
      obj.shape = z.invItem.shape;
      obj.weight = z.invItem.weight;
      obj.color = z.invItem.color;
      obj.clarity = z.invItem.clarity;
      obj.certificateNo = z.invItem.certificateNo;
      obj.price = this.calculatePriceFromOrderItem(z.invItem);
      obj.ccType = z.invItem.ccType
      obj.ccRate = z.invItem.ccRate
      obj.lab = z.invItem.lab?.toUpperCase();
      obj.origin = z.invItem.kapanOrigin;
      items.push(obj);
    });

    return items;
  }

  private calculatePriceFromOrderItem(item: OrderInvItem) {
    let price: PriceDNorm = new PriceDNorm();
    price.rap = item.price.rap;
    price.netAmount = item.fAmount;

    let totalRAP = ((item.price.rap ?? 0) * (item.weight));
    price.discount = this.utilityService.ConvertToFloatWithDecimal((((price.netAmount ?? 0) / totalRAP) * 100) - 100);
    price.perCarat = this.utilityService.ConvertToFloatWithDecimal((price.netAmount ?? 0) / item.weight);

    return price;
  }
  //#endregion */

  //#region  Transaction Detail for print */
  public async loadBank() {
    try {
      let banks = await this.ledgerService.getBankAccounts();
      for (let index = 0; index < banks.length; index++) {
        const element = banks[index];
        this.bankItems.push(element);
      }
      this.listBankItems = [];
      this.bankItems.forEach(z => { this.listBankItems.push({ text: z.bankName, value: z.bankName }); });
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public bankChange(e: any) {
    let fetchBank = this.bankItems.find(x => x.bankName?.toLowerCase() == e?.toLowerCase());
    if (fetchBank) {
      this.bankObj = fetchBank;
      this.selectedBankIntermediaryBank = this.bankObj.intermediaryBankName?.toString();
      this.selectedBankintermediaryBankShift = this.bankObj.intermediaryBankswift?.toString();
      this.salesTransactionObj.transactionDetail.bank = this.bankObj;
    }
    else
      this.bankObj = new BankDNorm();
  }

  public termChange(value: string) {
    if (value != 'Due') {
      this.salesTransactionObj.transactionDetail.terms = '';
      this.salesTransactionObj.transactionDetail.dueDate = null as any;
    }

    if (value == "COD")
      this.salesTransactionObj.transactionDetail.dueDate = new Date();
  }

  public async loadListDetail() {
    try {
      this.logisticItems = await this.logisticService.getAllLogistics();
      this.listlogisticItems = [];
      this.logisticItems.forEach(z => { this.listlogisticItems.push({ text: z.name, value: z.name }); });

      this.allTheTax = await this.accountConfigService.getTaxTypesList();
      this.allTheTax.forEach(z => { this.listTax.push({ name: z.name, isChecked: false }); });

      Object.values(listCurrencyType).forEach(z => { this.listCurrencyType.push({ text: z.toString(), value: z.toString() }); });
      Object.values(listExportType).forEach(z => { this.listExportType.push({ text: z.toString(), value: z.toString() }); });
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public fillTax() {
    if (this.allTheTax.length > 0) {
      this.salesTransactionObj.transactionDetail.taxTypes = this.getSelectedTaxTypeData();
      this.taxTypesZ = this.salesTransactionObj.transactionDetail.taxTypes?.map(x => x.name);

      if (this.taxTypesZ.length > 0) {
        this.taxTypesZ.forEach(x => {
          if (this.listTax.findIndex(y => y.name == x) >= 0)
            this.listTax[this.listTax.findIndex(y => y.name == x)].isChecked = true;
        });
      }

      if (!this.transactionObj.id)
        this.calculateTransactionItems();
    }
  }

  public LogisticChange(e: any) {
    try {
      let Selectedindex = this.logisticItems.find(x => x.name?.toLowerCase() == e?.toLowerCase());
      if (Selectedindex) {
        this.logisticObj = Selectedindex;
        this.salesTransactionObj.transactionDetail.logistic.id = this.logisticObj.id;
        this.salesTransactionObj.transactionDetail.logistic.email = this.logisticObj.email;
        this.salesTransactionObj.transactionDetail.logistic.mobileNo = this.logisticObj.mobileNo;
        this.salesTransactionObj.transactionDetail.logistic.name = this.logisticObj.name;
        this.salesTransactionObj.transactionDetail.logistic.phoneNo = this.logisticObj.phoneNo;
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  private getSelectedTaxTypeData(): TaxType[] {
    let taxType: TaxType[] = new Array<TaxType>();
    let initTax: TaxType[] = [];
    if (this.salesTransactionObj.toLedger.address.country?.toLowerCase() == 'india' && this.salesTransactionObj.fromLedger.address.country?.toLowerCase() == 'india') {
      if (this.salesTransactionObj.toLedger.address.state?.toLowerCase() == this.salesTransactionObj.fromLedger.address.state?.toLowerCase())
        initTax = this.allTheTax.filter(a => a.name?.toLowerCase() == 'cgst' || a.name?.toLowerCase() == 'sgst');
      else
        initTax = this.allTheTax.filter(a => a.name?.toLowerCase() == 'igst');
    }

    if (initTax.length > 0)
      taxType = initTax;

    return taxType;
  }

  private getSelectedManualTaxTypeData(): TaxType[] {
    let taxType: TaxType[] = [];
    this.taxTypesZ.forEach(z => {
      var obj = this.allTheTax.find(a => a.name == z);
      if (obj != null)
        taxType.push(obj);
    });
    return taxType;
  }

  public onMultiSelectChange(val: Array<any>, selectedData: string[]): void {
    val.forEach(element => {
      element.isChecked = false;
    });
    if (selectedData && selectedData.length > 0) {
      val.forEach(element => {
        selectedData.forEach(item => {
          if (element.name.toLocaleLowerCase() == item.toLocaleLowerCase())
            element.isChecked = true;
        });
      });
    }
    this.calculateTransactionItems();
    this.salesTransactionObj.transactionDetail.taxTypes = this.getSelectedManualTaxTypeData();

  }

  public onOpenDropdown(list: Array<{ name: string; isChecked: boolean }>, e: boolean, selectedData: string[]): boolean {
    if (selectedData.length == 0)
      list.forEach(x => x.isChecked = false);
    if (selectedData?.length == list.map(z => z.name).length)
      e = true;
    else
      e = false;
    return e;
  }

  public handleFilter(e: any): string {
    return e;
  }

  public filterDropdownSearch(allData: TaxType[], e: any, selectedData: string[]): Array<{ name: string; isChecked: boolean }> {
    let filterData: any[] = [];
    allData.forEach(z => { filterData.push({ name: z.name, isChecked: false }); });
    filterData.forEach(z => {
      if (selectedData?.includes(z.name))
        z.isChecked = true;
    });
    if (e?.length > 0)
      return filterData.filter(z => z.name?.toLowerCase().includes(e?.toLowerCase()));
    else
      return filterData;
  }

  public getCommaSapratedString(vals: any[], isAll: boolean = false): string {
    let name = vals.join(',')
    if (!isAll)
      if (name.length > 15)
        name = name.substring(0, 15) + '...';

    return name;
  }
  //#endregion */

  public async printInvoice(refId: string = '') {
    try {
      let printStone: HTMLIFrameElement = document.createElement("iframe");
      printStone.name = "print_detail";
      printStone.style.position = "absolute";
      printStone.style.top = "-1000000px";
      document.body.appendChild(printStone);
      printStone?.contentWindow?.document.open();
      let salesTransactionObj = JSON.parse(JSON.stringify(this.salesTransactionObj))

      let organization = new OrganizationDNorm();
      let transactionDetailObj = new TransactionDetail();

      if (this.transactionObj.id) {
        organization = this.transactionObj.transactionDetail.organization;
        transactionDetailObj = this.transactionObj.transactionDetail;
      }
      else {
        this.salesTransactionObj.refNumber = refId;
        if (this.salesTransactionObj.transactionType?.toLowerCase() == TransactionType.Proforma.toString().toLowerCase())
          this.salesTransactionObj = await this.transactionService.getTransactionbyRefNumber(this.salesTransactionObj.refNumber, TransactionType.Proforma.toString());
        else if (this.salesTransactionObj.transactionType?.toLowerCase() == TransactionType.Sales.toString().toLowerCase())
          this.salesTransactionObj = await this.transactionService.getTransactionbyRefNumber(this.salesTransactionObj.refNumber);

        salesTransactionObj = JSON.parse(JSON.stringify(this.salesTransactionObj))
        organization = this.salesTransactionObj.transactionDetail.organization;
        transactionDetailObj = this.salesTransactionObj.transactionDetail;
      }

      this.boUtilityService.orderByStoneIdPackingItems(salesTransactionObj.packingList);

      if ((organization.address?.country?.toLowerCase() == 'india'
        && transactionDetailObj.isOverseas)
        ||
        (organization.address?.country?.toLowerCase() == 'india'
          && !transactionDetailObj.isOverseas
          && transactionDetailObj.isDDA)
      ) {
        //printmemo.css
        printStone?.contentWindow?.document.write(`<html><head>
    <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <link rel="stylesheet" type="text/css" href="commonAssets/css/printmemo.css" media="print" />
    </head>`);
      }
      else if (organization.address?.country?.toLowerCase() == 'hong kong') {
        //printinvoice.css
        printStone?.contentWindow?.document.write(`<html><head>
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

    </head>`);
      }
      else if (organization.address?.country?.toLowerCase() == 'belgium') {
        //printCGinvoice.css
        printStone?.contentWindow?.document.write(`<html><head>
        <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <link rel="stylesheet" type="text/css" href="commonAssets/css/printCGinvoice.css" media="print" />
        </head>`);
      }
      else if (organization.address?.country?.toLowerCase() == 'united arab emirates') {
        printStone?.contentWindow?.document.write(`<html><head>
        <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <link rel="stylesheet" type="text/css" href="commonAssets/css/printsdinvoice.css" media="print" />
        </head>`);
      }
      else {
        printStone?.contentWindow?.document.write(`<html><head>
    <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <link rel="stylesheet" type="text/css" href="commonAssets/css/printinvoice.css" media="print" />
    </head>`);
      }

      let printContents: string;
      if (this.printOption === "aboveFiveCentPrint" || this.aboveFiveCentPrintFlag)
        printContents = await this.printInvoiceFormat.getAboveFiveCentInvoice(salesTransactionObj);
      else
        printContents = await this.printInvoiceFormat.getInvoice(salesTransactionObj);

      printStone?.contentWindow?.document.write(printContents);
      printStone?.contentWindow?.document.close();
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Print not open, Try gain later!');
    }
  }

  public async currencyChange() {
    let res = this.accountConfigService.getFromToCurrencyRate(this.salesTransactionObj.transactionDetail.fromCurrency, this.salesTransactionObj.transactionDetail.toCurrency, this.accountConfig.currencyConfigs);
    this.salesTransactionObj.transactionDetail.fromCurRate = res.fromRate;
    this.salesTransactionObj.transactionDetail.toCurRate = res.toRate;
    this.calculateCCAmt(true);
  }

  //#region Export to excel
  public async exportToExcel() {
    this.excelFile = [];
    this.aboveOneCaratExcelFile = [];
    this.belowOneCaratExcelFile = [];

    this.spinnerService.show();
    let exportData: InventoryItems[] = [];
    let stoneIds = this.salesTransactionObj.packingList.map(z => z.stoneId);
    exportData = await this.inventoryService.getInventoryByStoneIds(stoneIds);
    this.boUtilityService.orderByStoneIdInventoryItems(exportData);

    //Export Above & Below 0.50 CTent sheets
    if (exportData && exportData.length > 0) {

      if (this.excelOption == 'aboveFiveCentCarat') {
        const belowPointFiveCentData = exportData.filter((res) => res.weight <= 0.49);
        if (belowPointFiveCentData && belowPointFiveCentData.length > 0) {
          this.belowOneCaratExcelFile = await this.processToExportExcel(belowPointFiveCentData);

          if (this.belowOneCaratExcelFile.length > 0)
            this.utilityService.exportAsExcelFile(this.belowOneCaratExcelFile, "Sales_Excel_Below_Five_Cent");

          this.spinnerService.hide();
        }

        const aboverFiveCentData = exportData.filter((res) => res.weight > 0.49);
        if (aboverFiveCentData && aboverFiveCentData.length > 0) {
          this.aboveOneCaratExcelFile = await this.processToExportExcel(aboverFiveCentData);

          if (this.aboveOneCaratExcelFile.length > 0)
            this.utilityService.exportAsExcelFile(this.aboveOneCaratExcelFile, "Sales_Excel_Above_Five_Cent");

          this.spinnerService.hide();
        }
      } else {
        //Export combined data sheet
        this.excelFile = await this.processToExportExcel(exportData);

        if (this.excelFile.length > 0)
          this.utilityService.exportAsExcelFile(this.excelFile, "Sales_Excel");

        this.spinnerService.hide();
      }
    }
    else {
      this.alertDialogService.show('No Data Found!');
      this.spinnerService.hide();
    }
  }

  public async processToExportExcel(data: InventoryItems[]) {
    const filterData = data.map((element, index) => {
      let i = index + 1;
      let updatedElement = { ...element };

      updatedElement.price = this.salesTransactionObj.packingList.find(e => e.stoneId.toLowerCase() == element.stoneId.toLowerCase())?.price ?? element.price;

      if (this.salesTransactionObj.transactionDetail.organization.address?.country?.toLowerCase() == 'india') {
        if (!this.salesTransactionObj.transactionDetail.isOverseas && !this.salesTransactionObj.transactionDetail.isDDA) {
          let perCaratPrice = (this.salesTransactionObj.packingList.find(e => e.stoneId.toLowerCase() == element.stoneId.toLowerCase())?.price.perCarat ?? 0) * (this.salesTransactionObj.transactionDetail.toCurRate ?? 1);
          let netAmountPrice = (this.salesTransactionObj.packingList.find(e => e.stoneId.toLowerCase() == element.stoneId.toLowerCase())?.price.netAmount ?? 0) * (this.salesTransactionObj.transactionDetail.toCurRate ?? 1);

          updatedElement.price.perCarat = Number(this.utilityService.ConvertToFloatWithDecimalTwoDigit(perCaratPrice)) ?? element.price.perCarat;
          updatedElement.price.netAmount = Number(this.utilityService.ConvertToFloatWithDecimalTwoDigitRound(netAmountPrice)) ?? element.price.netAmount;
        }
      }

      return this.convertArrayToObjectExcel(salesExportExcelFormat, updatedElement, i);
    });
    return filterData;
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
  //#endregion Export to excel

  //#region Add & Update Packages
  public async onAddBarcode() {
    try {

      let barcodeText = this.searchString;

      let stones = this.utilityService.CheckStoneIds(barcodeText).map(x => x?.toLowerCase());
      let message = '';
      if (stones.length > 0) {

        stones = stones.filter(c => !this.salesTransactionObj.packingList.map(z => z.stoneId.toLowerCase()).includes(c));
        if (stones && stones.length > 0) {

          let result = await this.inventoryService.getInventoryByStoneIdsWithLowercase(stones);
          if (result) {
            let searchInvItems: InventoryItems[] = JSON.parse(JSON.stringify(result));
            // let holdStones = result.filter(z => z.isHold == true).map(z => z.stoneId);
            let memoStones = result.filter(z => z.isMemo == true).map(z => z.stoneId);
            let soldStones = result.filter(z => z.status == StoneStatus.Sold.toString()).map(z => z.stoneId);
            let labStones = result.filter(z => z.status == StoneStatus.Lab.toString() && z.isLabReturn == false).map(z => z.stoneId);
            let labReturnPendingStones = result.filter(z => z.status == StoneStatus.Stock.toString() && z.isLabReturn == false).map(z => z.stoneId);
            let orderedStones = result.filter(z => z.status == StoneStatus.Order.toString()).map(z => z.stoneId);
            let notFound = stones.filter(z => !result.map(a => a.stoneId.toLowerCase()).includes(z));

            // if (holdStones.length > 0)
            //   message = `${holdStones.join(', ')}  <b>in Hold</b>.<br/><br/>`;
            // if (memoStones.length > 0)
            //   message = message + ` ${memoStones.join(', ')} <b>in Memo</b>.<br/><br/>`;
            if (labStones.length > 0)
              message = message + ` ${labStones.join(', ')} <b>in Lab</b>.<br/><br/>`;
            if (labReturnPendingStones.length > 0)
              message = message + ` ${labReturnPendingStones.join(', ')} <b>in LabReturn pending</b>.<br/><br/>`;
            if (orderedStones.length > 0)
              message = message + ` ${orderedStones.join(', ')} <b>in Order</b>.<br/><br/>`;
            if (soldStones.length > 0)
              message = message + ` ${soldStones.join(', ')} <b>already sold</b>.<br/><br/>`;
            if (notFound.length > 0)
              message = message + ` ${notFound.join(', ')} <b>not found</b>.`;


            let notValidStone = [...soldStones, ...orderedStones, ...labStones, ...labReturnPendingStones];
            let validStones = searchInvItems.filter(z => !notValidStone.includes(z.stoneId));
            if (message.length == 0) {
              //Check if memo stone party same as sale party
              if (memoStones.length > 0) {
                let memoStonesData = searchInvItems.filter(z => memoStones.includes(z.stoneId));
                await this.checkMemoStones(memoStonesData);
              }
              else
                this.setInvItemInPackageList(validStones);
            }
          }
        }
      }
      else
        message = `<b>no stone(s) found</b>.`;

      if (message && message.length > 0)
        this.alertDialogService.show(message);

    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  private async checkMemoStones(memoStones: InventoryItems[]) {
    let memoStoneIds = memoStones.map(z => z.stoneId);
    if (!this.salesTransactionObj.toLedger.id) {
      this.alertDialogService.show('Please select party first for check memo stone(s)!');;
      return;
    }

    let memoStonePriceList: Array<MemoInventoryPrice> = await this.memoService.getStonePriceFromMemo(memoStoneIds, this.salesTransactionObj.toLedger.id);
    if (memoStonePriceList.length == memoStoneIds.length) {

      this.alertDialogService.ConfirmYesNo(memoStoneIds.join(',') + ` Stone(s) is in memo, are you sure you want to add sales?`, "Memo Stones")
        .subscribe(async (res: any) => {
          if (res.flag) {

            let saleMemos: Array<SaleMemo> = await this.memoService.getSaleMemo(memoStoneIds, this.salesTransactionObj.toLedger.id);
            if (memoStonePriceList && memoStonePriceList.length > 0 && saleMemos.length > 0) {

              memoStones.forEach(x => x.price = (memoStonePriceList.find(a => a.stoneId == x.stoneId)?.price) ?? new PriceDNorm())
              saleMemos.forEach(element => {
                this.salesTransactionObj.note = "MemoNo: " + element.memoNo + ", Date: " + element.memoDate.toLocaleString();
              })
            }

            this.setInvItemInPackageList(memoStones);
          }
        });
    }
    else {
      let invalidStones = memoStoneIds.filter(z => !memoStonePriceList.map(z => z.stoneId).includes(z));
      this.alertDialogService.show(invalidStones.join(',') + ' Stone(s) is in another party memo, Please remove it from selection.');
    }
  }

  public setInvItemInPackageList(validStones: InventoryItems[]) {
    let packagelist = this.mappingInvItemToTransactionPackage(validStones);
    if (packagelist.length > 0) {
      this.salesTransactionObj.packingList.push(...packagelist);
      this.gridShowPackingList.push(...packagelist);
      this.utilityService.showNotification(packagelist.length + ' package(s) added..!')
      this.loadPacketItemInventoryGrid(this.salesTransactionObj.packingList);
    }
  }

  public mappingInvItemToTransactionPackage(invItems: InventoryItems[]): PackingItem[] {
    let items: PackingItem[] = [];
    invItems.forEach(z => {
      let obj = new PackingItem();
      obj.invId = z.id;
      obj.stoneId = z.stoneId;
      obj.shape = z.shape;
      obj.weight = z.weight;
      obj.color = z.color;
      obj.lab = z.lab?.toUpperCase();
      obj.origin = z.kapanOrigin;
      obj.clarity = z.clarity;
      obj.certificateNo = z.certificateNo;
      obj.certiType = z.certiType;
      obj.price = JSON.parse(JSON.stringify(z.price));
      items.push(obj);
    });

    return items;
  }

  public filterPackageList() {
    try {
      let filterPackageListData: PackingItem[] = JSON.parse(JSON.stringify(this.salesTransactionObj.packingList));
      if (this.filterStoneId.length > 0) {
        let stoneIds = this.filterStoneId ? this.utilityService.CheckStoneIds(this.filterStoneId) : [];
        let lowerCaseStoneIds: string[] = []
        stoneIds.forEach(z => { lowerCaseStoneIds.push(z.toLowerCase()) });
        filterPackageListData = filterPackageListData.filter(z => lowerCaseStoneIds.includes(z.stoneId.toLowerCase()))
      }
      if (this.filterColors.length > 0)
        filterPackageListData = filterPackageListData.filter(z => this.filterColors.includes(z.color));
      if (this.filterShapes.length > 0)
        filterPackageListData = filterPackageListData.filter(z => this.filterShapes.includes(z.shape));

      filterPackageListData = filterPackageListData.filter(z => this.utilityService.filterFromToDecimalValues(z.weight, this.filterFWeight, this.filterTWeight));
      this.gridShowPackingList = JSON.parse(JSON.stringify(filterPackageListData));
      this.loadPacketItemInventoryGrid(this.salesTransactionObj.packingList);
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Filter fail, Try again later!');
    }
  }

  public clearPackageFilter() {
    this.filterColors = new Array<string>();
    this.allTheShapes.forEach(x => x.isChecked = false);
    this.allColors.forEach(x => x.isChecked = false);
    this.filterShapes = new Array<string>();
    this.filterFWeight = null as any;
    this.filterTWeight = null as any;

    this.loadPacketListPaging();
  }

  public updateDiscount() {
    try {

      if (((this.filterDiscount == null || this.filterDiscount == 0)) && !this.filterOrigin?.trim()) {
        this.alertDialogService.show('Please fill discount or origin!');
        return;
      }

      let filterStoneIds = this.gridShowPackingList.map(z => z.stoneId);
      this.salesTransactionObj.packingList.forEach(z => {
        if (filterStoneIds.includes(z.stoneId)) {
          if (this.filterDiscount) {
            z.price.discount = Number(this.filterDiscount);
            let stoneRap = z.weight * (z.price.rap ?? 0);
            let calDiscount = 100 + z.price.discount;
            let netAmount = (calDiscount * stoneRap) / 100;

            z.price.netAmount = this.utilityService.ConvertToFloatWithDecimal(netAmount);
            let perCarat = netAmount / z.weight;
            z.price.perCarat = this.utilityService.ConvertToFloatWithDecimal(perCarat);
          }

          if (this.filterOrigin?.trim())
            z.origin = this.filterOrigin;
        }
      });

      let filterPackageListData = this.salesTransactionObj.packingList.filter(z => filterStoneIds.includes(z.stoneId));
      this.gridShowPackingList = JSON.parse(JSON.stringify(filterPackageListData));
      this.loadPacketItemInventoryGrid(this.salesTransactionObj.packingList);
      this.utilityService.showNotification('Discount updated..!');

      this.filterDiscount = null as any;
      this.filterOrigin = null as any;
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Update discount fail, Try again later!');
    }
  }

  public AddItemByPackageList(isToggle = true) {
    let transItem = this.transactItemsDNorm.find(z => z.name.toUpperCase() == 'CUT & POLISH DIAMONDS');
    if (transItem && transItem != null && transItem != undefined) {
      let existsItemIndex = this.salesTransactionObj.items.findIndex(z => z.item.id == transItem?.id);
      if (existsItemIndex > -1)
        this.salesTransactionObj.items.splice(existsItemIndex, 1);

      if (this.salesTransactionObj.packingList.length > 0) {
        let transactionItemObj = new TransactionItem();
        transactionItemObj.item = transItem;
        transactionItemObj.quantity = this.salesTransactionObj.packingList.length;
        transactionItemObj.weight = this.totalPacketWeight;
        transactionItemObj.amount = this.totalPacketAmount;
        transactionItemObj.rate = this.utilityService.ConvertToFloatWithDecimal(this.totalPacketAmount / this.totalPacketWeight);
        transactionItemObj.total = this.totalPacketAmount;
        transactionItemObj.discPerc = 0;
        transactionItemObj.discount = 0;
        transactionItemObj.taxAmount = 0;

        this.salesTransactionObj.items.push(JSON.parse(JSON.stringify(transactionItemObj)));
      }

      this.calculateTransactionItems();

      if (isToggle)
        this.togglePackinglistDialog();
    }
    else
      this.alertDialogService.show('Please add "CUT & POLISH DIAMONDS" in Transact Item');

  }
  //#endregion]

  public addDays(e: any, fromDatepicker: boolean = false) {
    const transactionDate = new Date(this.salesTransactionObj.transactionDate);
    const days = fromDatepicker 
      ? Number(this.salesTransactionObj.transactionDetail.terms) 
      : Number(e.target.value);
    
    if (!isNaN(days)) {
      const futureDate = new Date(transactionDate);
      futureDate.setDate(transactionDate.getDate() + days);
      this.salesTransactionObj.transactionDetail.dueDate = futureDate;
    } else {
      this.salesTransactionObj.transactionDetail.dueDate = undefined as any;
    }
  }

  public calculateCCAmt(additionalAmtManualChange = false) {
    this.salesTransactionObj.ccAmount = Number((this.salesTotalAmount * Number(this.salesTransactionObj.transactionDetail.toCurRate ?? 0)).toFixed(2)) ?? 0;

    let addAmt = this.utilityService.setadditionalAmountForTransaction(this.salesTransactionObj.ccAmount);
    if (additionalAmtManualChange)
      addAmt = parseFloat((this.salesTransactionObj.addAmount ?? 0).toString());
    else {
      addAmt = 0;
      if (this.salesTransactionObj.insuranceCharge)
        addAmt = parseFloat((this.salesTransactionObj.insuranceCharge ?? 0).toString()) + addAmt;

      this.salesTransactionObj.addAmount = addAmt;
    }

    if (addAmt.toString() == '' || addAmt.toString() == 'NaN' || addAmt.toString() == 'undefined' || addAmt.toString() == 'null')
      addAmt = 0;

    this.salesTransactionObj.ccAmount = this.utilityService.ConvertToFloatWithDecimal((addAmt + this.salesTransactionObj.ccAmount));

  }

  private async getBranch() {
    try {
      this.organizationDetailData = await this.organizationService.getOrganizationById(this.fxCredentials.organizationId);

      if (this.organizationDetailData.branches)
        this.organizationDetailData.branches.forEach((z) => { this.branchItems.push(z); });

      if (this.branchItems.length > 0) {
        this.listBranchItems = [];
        this.branchItems.forEach((z) => { this.listBranchItems.push({ text: z.name, value: z.name }); });

        //Select Default Branch Match with Organization State.
        //Comment for Default Tax Problem
        // let fetchBranch = this.branchItems.find(x => x.address.state.toLowerCase() == this.organizationDetailData.address.state.toLowerCase());
        // if (fetchBranch) {
        //   this.branchObj = fetchBranch;
        //   this.selectedBranchItem = { text: this.branchObj.name, value: this.branchObj.name };

        //   this.salesTransactionObj.fromLedger.address = this.branchObj.address;
        //   this.salesTransactionObj.transactionDetail.organization.address = this.branchObj.address;
        //   this.salesTransactionObj.transactionDetail.organization.email = this.branchObj.email;
        //   this.salesTransactionObj.transactionDetail.organization.faxNo = this.branchObj.faxNo;
        //   this.salesTransactionObj.transactionDetail.organization.mobileNo = this.branchObj.mobileNo;
        //   this.salesTransactionObj.transactionDetail.organization.person = this.branchObj.person;
        //   this.salesTransactionObj.transactionDetail.organization.phoneNo = this.branchObj.phoneNo;
        //   this.salesTransactionObj.transactionDetail.organization.gstNo = this.branchObj.taxNo;
        //   this.salesTransactionObj.transactionDetail.organization.incomeTaxNo = this.branchObj.incomeTaxNo;
        //   this.salesTransactionObj.transactionDetail.organization.taxNo = this.branchObj.taxNo;
        //   this.fillTax();
        // }
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public branchChange(e: any) {
    if (this.selectedBranchItem) {
      let fetchBranch = this.branchItems.find(x => x.name == e.text);
      if (fetchBranch) {
        this.branchObj = fetchBranch;

        if (this.salesTransactionObj && this.selectedBranchItem?.text) {
          this.salesTransactionObj.fromLedger.address = this.branchObj.address;
          this.fillTax();
        }
      }
    }
    else
      this.branchObj = new Branch();
  }

  //Toggle excel selection options
  public onExcelToggle(): void {
    this.showExcelOption = !this.showExcelOption;
  }

  //Toggle excel selection options
  public onPrintToggle(): void {
    this.showPrintOption = !this.showPrintOption;
  }
}
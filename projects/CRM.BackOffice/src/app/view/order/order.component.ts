import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { PageChangeEvent, RowClassArgs, SelectableSettings } from '@progress/kendo-angular-grid';
import { DataResult, GroupDescriptor, process, SortDescriptor } from '@progress/kendo-data-query';
import { NgxSpinnerService } from 'ngx-spinner';
import { WebcamImage } from 'ngx-webcam';
import { Observable, Subject } from 'rxjs';
import { Country, GridDetailConfig } from 'shared/businessobjects';
import { DbLog, FileStore, fxCredential, GridConfig, GridMasterConfig, SystemUserPermission } from 'shared/enitites';
import { CommonService, ConfigService, FileStoreService, LogService, OrderExportFields, TransactionType, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { DeliveryCommuteItem, OrderSearchCriteria, OrderSearchResult, SortFieldDescriptor } from '../../businessobjects';
import { CompanyDNorm, IdentityDNorm, Ledger, LedgerDNorm, LedgerGroup, OrderItem, TakenBy, Transaction } from '../../entities';
import { CommuteService, GridPropertiesService, InventoryService, LedgerService, MemoService, OrderService } from '../../services';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css']
})

export class OrderComponent implements OnInit {
  public sort: SortDescriptor[] = [];
  public groups: GroupDescriptor[] = [];
  public selectableSettings: SelectableSettings = { mode: 'multiple', };
  public mySelection: string[] = [];
  public gridView!: DataResult;
  public pageSize = 26;
  public skip = 0
  public fields!: GridDetailConfig[];
  public gridMasterConfigResponse!: GridMasterConfig;
  public stoneId: string = '';
  public leadNo: string = '';
  public certificateNo: string = '';
  public partyCode: string = '';
  public isGridConfig: boolean = false;
  public gridConfig!: GridConfig;
  public fxCredentials!: fxCredential;
  public orderSearchCriteria: OrderSearchCriteria = new OrderSearchCriteria();
  public orderSearchResult: OrderSearchResult = new OrderSearchResult();
  public allOrderItems: OrderItem[] = [];
  public filterOrderItems: OrderItem[] = [];
  public filterFlag = true;
  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains'
  };
  public listBrokerItems: Array<{ text: string; value: string }> = [];
  public brokerItems: LedgerDNorm[] = [];
  public listPartyItems: Array<{ text: string; value: string }> = [];
  public partyItems: LedgerDNorm[] = [];
  public listSellerItems: Array<{ text: string; value: string }> = [];
  public sellerItems: IdentityDNorm[] = [];
  public selectedBroker: string = "";
  public selectedParty: string = "";
  public selectedSeller: string = "";
  public isShowCheckBoxAll: boolean = true;
  public isSales: boolean = false;
  public isLedgerFlag: boolean = false;
  public ledgerIdent: string = "";
  public selectedOrderItems: OrderItem[] = new Array<OrderItem>();
  public selectedSalesParty: LedgerDNorm = new LedgerDNorm();
  public transactionObj: Transaction = new Transaction();
  public ledgerObj = new Ledger();
  public listLedgerGroupItems: Array<LedgerGroup> = new Array<LedgerGroup>();
  public validTextLengthFlag: boolean = false;
  public isAddTakenByPopup: boolean = false;
  public photoIdentityErrorFlag: boolean = false;
  public photoIdentityModel: any = undefined;
  public isImgselectedPhotoIdent: boolean = false;
  public currentFile!: File;
  public imagePreviewphoto: any;
  public fileUploadItems: Array<{ type: string, file: File }> = new Array<{ type: string, file: File }>();
  public imageList: FileStore[] = [];
  public imgSrcDisplay: string = "";
  public listTakenByItems: Array<{ text: string; value: string }> = [];
  public takenByItems: TakenBy[] = [];
  public selectedTakenByNameItem: string = "";
  public takenByObj: TakenBy = new TakenBy();
  public alreadyAddTakenByFlag: boolean = false;
  public showLabelTakenBy: boolean = true;
  public isCanDelivered: boolean = false;
  public showWebCam: boolean = false;
  private trigger: Subject<void> = new Subject<void>();
  public isViewButtons: boolean = false;
  public companyItems: CompanyDNorm[] = new Array<CompanyDNorm>();
  public listCompanyItems: Array<{ text: string; value: string }> = new Array<{ text: string; value: string }>();
  public sumWeight: number = 0;
  public sumValue: number = 0;
  public ledgerType: string = '';
  public countryItems!: Country[];
  public selectedCountry: any;
  public isStockTallyEnable: boolean = false;

  constructor(
    private router: Router,
    private alertDialogService: AlertdialogService,
    private spinnerService: NgxSpinnerService,
    public utilityService: UtilityService,
    private gridPropertiesService: GridPropertiesService,
    private configService: ConfigService,
    private orderService: OrderService,
    private ledgerService: LedgerService,
    public memoService: MemoService,
    private fileStoreService: FileStoreService,
    private sanitizer: DomSanitizer,
    private inventoryService: InventoryService,
    private commuteService: CommuteService,
    public commonService: CommonService,
    public logService: LogService
  ) { }

  public async ngOnInit() {
    this.defaultMethodsLoad();
  }

  //#region Default Method
  public async defaultMethodsLoad() {
    try {
      this.fxCredentials = JSON.parse(sessionStorage.getItem("fxCredentials") ?? '') as fxCredential;
      if (!this.fxCredentials)
        this.router.navigate(["login"]);

      if (this.fxCredentials && this.fxCredentials.origin && (this.fxCredentials.origin.toLowerCase() == 'admin' || this.fxCredentials.origin.toLowerCase() == 'opmanager' || this.fxCredentials.origin.toLowerCase() == 'accounts'))
        this.isViewButtons = true;

      this.spinnerService.show();
      await this.getGridConfiguration();
      await this.loadOrders();
      await this.loadBroker();
      await this.loadParty();
      await this.loadSeller();
      await this.setUserRights();
      await this.getCountryData();

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

  private async getCountryData() {
    try {
      this.countryItems = await this.commonService.getCountries();
    }
    catch (error: any) {
      this.alertDialogService.show(error.error)
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

  public async onCountryChange(e: string) {
    try {
      if (e) {
        this.spinnerService.show();
        this.selectedCountry = this.countryItems.find(c => c.name == e);
        this.orderSearchCriteria.country = this.selectedCountry.name;
        this.spinnerService.hide();
      }
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
    }
  }

  public async setUserRights() {
    let userPermissions: SystemUserPermission = new SystemUserPermission();
    let sesValue = sessionStorage.getItem("userPermission");
    if (sesValue)
      userPermissions = JSON.parse(sesValue) as SystemUserPermission;
    if (userPermissions.actions.length > 0) {
      let CanDelivered = userPermissions.actions.find(z => z.name == "CanDelivered");
      if (CanDelivered != null)
        this.isCanDelivered = true;
    }
  }
  //#endregion

  //#region Grid Config | On Change
  public async getGridConfiguration() {
    try {
      this.spinnerService.show();
      this.gridConfig = await this.configService.getGridConfig(this.fxCredentials?.id ?? '', "Order", "OrderGrid", this.gridPropertiesService.getOrderItems());
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
        this.gridMasterConfigResponse = await this.configService.getMasterGridConfig("Order", "OrderGrid");
        if (this.gridMasterConfigResponse)
          this.fields = this.gridMasterConfigResponse.gridDetail;
        else
          this.fields = await this.gridPropertiesService.getOrderItems();

      }
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.alertDialogService.show(error);
      this.spinnerService.hide();
    }
  }

  public async groupChange(groups: GroupDescriptor[]): Promise<void> {
    try {
      this.groups = groups;
      await this.loadOrders();
    }
    catch (error: any) {
      this.alertDialogService.show(error.error)
    }
  }

  public async sortChange(sort: SortDescriptor[]): Promise<void> {
    this.sort = sort;
    this.orderSearchCriteria.sortFieldDescriptors = new Array<SortFieldDescriptor>();

    if (this.sort && this.sort.length > 0) {
      let properties = this.gridPropertiesService.getOrderItems();
      for (let index = 0; index < this.sort.length; index++) {
        let sortFieldDescriptor = new SortFieldDescriptor();
        const element = this.sort[index];
        sortFieldDescriptor.dir = element.dir;
        sortFieldDescriptor.field = properties.find(x => x.propertyName == element.field)?.sortFieldName ?? "";
        this.orderSearchCriteria.sortFieldDescriptors.push(sortFieldDescriptor);
      }
    }

    await this.loadOrders();
  }

  public async pageChange(event: PageChangeEvent): Promise<void> {
    this.skip = event.skip;
    await this.loadOrders();
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

  public errorMsgWithDiffPartySelection(data: any) {
    this.alertDialogService.ConfirmYesNo("Do you want to select different party?", "Warning!")
      .subscribe(async (res: any) => {
        if (!res.flag) {
          let findIndex = this.mySelection.findIndex(x => x == data.id);
          this.mySelection.splice(findIndex, 1);
        }
      })

  }
  //#endregion

  //#region Init Data
  public async loadOrders() {
    try {
      this.spinnerService.show();

      this.orderSearchCriteria.stoneIds = this.stoneId ? this.utilityService.CheckStoneIds(this.stoneId).map(x => x.toUpperCase()) : [];
      this.orderSearchCriteria.leadNos = this.leadNo ? this.utilityService.checkCertificateIds(this.leadNo).map(x => x.toLowerCase()) : [];
      this.orderSearchCriteria.certificateNos = this.certificateNo ? this.utilityService.checkCertificateIds(this.certificateNo).map(x => x.toLowerCase()) : [];
      this.orderSearchCriteria.partyCodes = this.partyCode ? this.utilityService.checkCertificateIds(this.partyCode).map(x => x.toLowerCase()) : [];
      this.orderSearchCriteria.country = this.orderSearchCriteria.country ? this.orderSearchCriteria.country : '';

      let res = await this.orderService.getOrderItemsByCriteria(this.orderSearchCriteria, this.skip, this.pageSize);
      if (res) {
        this.orderSearchResult = JSON.parse(JSON.stringify(res));
        this.filterOrderItems = res.orderItems;
        this.gridView = process(res.orderItems, { group: this.groups, sort: this.sort });
        this.gridView.total = res.totalCount;

        this.spinnerService.hide();
      }
      else
        this.spinnerService.hide();
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Data not load, Try gain later!');
    }
  }

  public filterPartToggle() {
    this.utilityService.setfilterToggleValue(this.filterFlag);
  }

  public async onFilterSubmit(form: NgForm) {
    this.mySelection = [];
    this.selectedOrderItems = new Array<OrderItem>();
    this.skip = 0;
    if (form.valid) {
      await this.loadOrders();
    }
  }

  public async clearFilter(form: NgForm) {
    this.spinnerService.show();
    form.reset();
    this.skip = 0;
    this.orderSearchCriteria = new OrderSearchCriteria();
    this.selectedSeller = "";
    this.stoneId = "";
    this.sort = new Array<SortDescriptor>();
    await this.loadOrders();
    this.mySelection = [];
    this.selectedOrderItems = new Array<OrderItem>();

  }

  public async loadBroker() {
    try {
      let ledgerType: string[] = ['Broker']
      let brokers = await this.ledgerService.getAllLedgersByType(ledgerType);
      for (let index = 0; index < brokers.length; index++) {
        const element = brokers[index];
        this.brokerItems.push({
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
        });
      }

      this.listBrokerItems = [];
      this.brokerItems.forEach(z => { this.listBrokerItems.push({ text: z.name, value: z.id }); });
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Broker not load, Try gain later!');
    }
  }

  public async loadParty() {
    try {
      let ledgerType: string[] = ['Customer']
      let partys = await this.ledgerService.getAllLedgersByType(ledgerType);
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

      this.listPartyItems = [];
      this.partyItems.forEach(z => { this.listPartyItems.push({ text: z.name, value: z.id }); });
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Party not load, Try gain later!');
    }
  }

  public async loadSeller() {
    try {
      let sellerList: Array<IdentityDNorm> = await this.orderService.getGetSellerFromOrderList();
      if (sellerList && sellerList.length > 0) {
        this.sellerItems = sellerList;
        sellerList.forEach(z => { this.listSellerItems.push({ text: z.name, value: z.id }); });
      }
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Seller not load, Try gain later!');
    }
  }
  //#endregion

  //#region OnChanges Functions
  public handlePartyFilter(value: any) {
    this.listPartyItems = [];
    let partyItems = this.partyItems.filter(z => z.name.toLowerCase().includes(value.toLowerCase()))
    partyItems.reverse().forEach(z => { this.listPartyItems.push({ text: z.name, value: z.id }); });
  }

  public partyChange(e: any) {
    if (e) {
      let fetchCustomer = this.partyItems.find(x => x.id == e);
      if (fetchCustomer) {
        setTimeout(() => {
          this.selectedParty = fetchCustomer?.name ?? '' as any;
        }, 0);
        this.orderSearchCriteria.partyId = fetchCustomer.idents[0] ?? "";
      }
    }
  }

  public handleSellerFilter(value: any) {
    this.listSellerItems = [];
    let sellerItems = this.sellerItems.filter(z => z.name.trim().toLowerCase().includes(value.trim().toLowerCase()))
    sellerItems.reverse().forEach(z => { this.listSellerItems.push({ text: z.name, value: z.id }); });
  }

  public sellerChange(e: any) {
    if (e) {
      let fetchSeller = this.listSellerItems.find(x => x.value == e);
      if (fetchSeller) {
        setTimeout(() => {
          this.selectedSeller = fetchSeller?.text ?? '' as any;
        }, 0);
        this.orderSearchCriteria.sellerId = fetchSeller.value ?? "";
      }
    }
  }

  public handleBrokerFilter(value: any) {
    this.listBrokerItems = [];
    let brokerItems = this.brokerItems.filter(z => z.name.toLowerCase().includes(value.toLowerCase()))
    brokerItems.reverse().forEach(z => { this.listBrokerItems.push({ text: z.name, value: z.id }); });
  }

  public brokerChange(e: any) {
    if (e) {
      let fetchBroker = this.brokerItems.find(x => x.id == e);
      if (fetchBroker) {
        setTimeout(() => {
          this.selectedBroker = fetchBroker?.name ?? '' as any;
        }, 0);
        this.orderSearchCriteria.brokerId = fetchBroker.idents[0] ?? "";
      }
    }
  }

  //#endregion

  public async toggleSalesDialog(isSaleInvoice: boolean = true) {
    if (this.filterOrderItems.length > 0) {
      let checkExist: OrderItem[] = this.selectedOrderItems;
      // let checkExist: OrderItem[] = this.filterOrderItems.filter(x => this.mySelection.some(y => y == x.id));

      let isOpenSalesModal: boolean = false;
      if (checkExist.length > 0) {
        let alreadyStoneForSale: boolean = checkExist.some(x => x.transactionNo != null);
        if (alreadyStoneForSale)
          return this.alertDialogService.show(`<b>${checkExist.filter(x => x.transactionNo != null).map(x => x.invItem.stoneId)}</b> stone(s) have already made sales invoice, Kindly select valid stone(s) inventory`)

        if (isSaleInvoice == true) {
          let invaildStoneForSale: boolean = checkExist.some(x => x.invItem.invId == null);
          if (invaildStoneForSale)
            return this.alertDialogService.show(`<b>${checkExist.filter(x => x.invItem.invId == null).map(x => x.invItem.stoneId)}</b> stone(s) not in a Stock, Kindly select available stone(s) inventory`)
        }

        let isSame = checkExist.every(x => x.party.id == checkExist[0].party.id);
        if (!isSame) {
          this.alertDialogService.ConfirmYesNo("Do you want to select different party?", "Warning!")
            .subscribe(async (res: any) => {
              if (!res.flag) {
                this.mySelection.splice(this.mySelection.length - 1, 1);
                return;
              }
              await this.openSalesDialog(checkExist, isOpenSalesModal, isSaleInvoice, true);
            })
        }
        else
          await this.openSalesDialog(checkExist, isOpenSalesModal, isSaleInvoice);

      }
    }
  }

  public async openSalesDialog(checkExist: OrderItem[], isOpenSalesModal: boolean, isSaleInvoice: boolean, isMultipleParty: boolean = false) {
    if (this.fxCredentials && this.fxCredentials?.origin && this.fxCredentials?.origin?.toLowerCase() != 'accounts' && this.fxCredentials?.origin?.toLowerCase() != 'admin')
      return this.alertDialogService.show('You do not have a permission to create sales invoice!');
    let isSameCurrency: boolean = checkExist.every(x => x.invItem.ccType == checkExist[0].invItem.ccType && x.invItem.ccRate == checkExist[0].invItem.ccRate);

    for (let index = 0; index < checkExist.length; index++) {
      const element = checkExist[index];
      if (element) {
        if (!element.party.id) {
          this.openLedgerDialog(element);
          return;
        }

        if (!element.broker.id && element.broker.idents.length > 0) {
          this.openLedgerDialog(element, false);
          return;
        }
      }
      isOpenSalesModal = true;
    }

    if (isOpenSalesModal) {

      if (!isSameCurrency) {
        this.alertDialogService.ConfirmYesNo("CurrencyType or CurrencyRate are diffrent on selected Order. Do you want to proceed?", "Warning!")
          .subscribe(async (res: any) => {
            if (res.flag)
              await this.verifyDataToOpenSalesDialog(checkExist[0].party, isSaleInvoice, isMultipleParty)
          })
      }
      else
        await this.verifyDataToOpenSalesDialog(checkExist[0].party, isSaleInvoice, isMultipleParty)
    }
  }

  public async verifyDataToOpenSalesDialog(party: LedgerDNorm, isSaleInvoice: boolean, isMultipleParty: boolean) {
    // this.selectedOrderItems = new Array<OrderItem>();
    // this.selectedOrderInvItems = JSON.parse(JSON.stringify(this.filterOrderItems.filter(a => this.mySelection.includes(a.id)).map(x => x.invItem)));
    // this.selectedOrderItems = JSON.parse(JSON.stringify(this.filterOrderItems.filter(a => this.mySelection.includes(a.id))));
    this.selectedSalesParty = new LedgerDNorm();
    this.transactionObj = new Transaction();
    if (isSaleInvoice)
      this.transactionObj.transactionType = TransactionType.Sales.toString();
    else
      this.transactionObj.transactionType = TransactionType.Proforma.toString();

    if (!isMultipleParty) {
      this.selectedSalesParty = party;

      let ledgerIsVerified = await this.ledgerService.getLedgerIsVerifiedIsCertReminder(party.id);
      this.selectedSalesParty.isVerified = ledgerIsVerified.isVerified;
      this.selectedSalesParty.isCertReminder = ledgerIsVerified.isCertReminder;
      this.selectedSalesParty.address = ledgerIsVerified.address;
    }

    let stoneIds = this.selectedOrderItems.map(x => x.invItem.stoneId);
    if (stoneIds && stoneIds.length > 0) {
      let labStoneIds = await this.inventoryService.getInLabInventoryByStoneId(stoneIds);
      if (labStoneIds && labStoneIds.length > 0) {
        this.alertDialogService.show(`${labStoneIds.join(", ")} <b>in LabReturn pending</b>.`);
        return;
      }

      this.isSales = true;
    }
  }

  public openLedgerDialog(orderItem: OrderItem, isParty: boolean = true) {
    try {
      this.alertDialogService.ConfirmYesNo(`Kindly Register ${isParty ? "Party" : "Broker"} from here`, `${isParty ? "Party" : "Broker"} not found!`)
        .subscribe(async (res: any) => {
          if (res.flag) {
            if (isParty && !orderItem.party.id) {

              let ledgerDNorm: LedgerDNorm = await this.ledgerService.getLedgerDNormByIdent(orderItem.party.idents[0]);
              if (!ledgerDNorm) {
                this.ledgerIdent = orderItem.party.idents[0] ?? "";
                this.ledgerType = "Party";
                this.isLedgerFlag = true;
              }
              else {
                await this.orderService.updatePartyDetailsOrder(ledgerDNorm);
                await this.loadOrders();
              }
            }
            if (!isParty && orderItem.party.id && !orderItem.broker.id && orderItem.broker.idents) {

              let ledgerDNorm: LedgerDNorm = await this.ledgerService.getLedgerDNormByIdent(orderItem.broker.idents[0]);
              if (!ledgerDNorm) {
                this.ledgerIdent = orderItem.broker.idents[0] ?? "";
                this.ledgerType = "Broker";
                this.isLedgerFlag = true;
              }
              else {
                await this.orderService.updateBrokerDetailsOrder(ledgerDNorm);
                await this.loadOrders();
              }
            }
          }
        })
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error)
    }
  }

  public async updateOrderParties(value: any) {
    if (value.flag) {
      if (value.ledger) {
        let ledgerDnorm = new LedgerDNorm();
        ledgerDnorm.id = value.ledger.id;
        ledgerDnorm.idents = value.ledger.idents;
        ledgerDnorm.name = value.ledger.name;
        ledgerDnorm.group = value.ledger.group.name;
        ledgerDnorm.contactPerson = value.ledger.contactPerson;
        ledgerDnorm.email = value.ledger.email;
        ledgerDnorm.mobileNo = value.ledger.mobileNo;
        ledgerDnorm.phoneNo = value.ledger.phoneNo;
        ledgerDnorm.faxNo = value.ledger.faxNo;
        ledgerDnorm.address = value.ledger.address;
        ledgerDnorm.code = value.ledger.code;
        ledgerDnorm.taxNo = value.ledger.taxNo;
        ledgerDnorm.incomeTaxNo = value.ledger.incomeTaxNo;

        let updateResponse: boolean = false;

        if (ledgerDnorm.group.toLowerCase() == "customer")
          updateResponse = await this.orderService.updatePartyDetailsOrder(ledgerDnorm);
        if (ledgerDnorm.group.toLowerCase() == "broker")
          updateResponse = await this.orderService.updateBrokerDetailsOrder(ledgerDnorm);

        if (updateResponse) {
          this.utilityService.showNotification(`${ledgerDnorm.group.toLowerCase() == "customer" ? "Party" : "Broker"} has been registered successfully!`);
          this.isLedgerFlag = false;
          await this.loadOrders();
          if (ledgerDnorm.group.toLowerCase() == "customer")
            this.selectedOrderItems.forEach(x => {
              if (ledgerDnorm.idents.includes(x.party.idents[0]))
                x.party.id = value.ledger.id
            });
          if (ledgerDnorm.group.toLowerCase() == "broker")
            this.selectedOrderItems.forEach(x => {
              if (ledgerDnorm.idents.includes(x.broker.idents[0]))
                x.broker.id = value.ledger.id
            });
          // this.transactionObj.toLedger = ledgerDnorm;
          // this.isSales = true;
        }
      }


    }
  }

  public async closeSalesDialog(flag: boolean) {
    this.isSales = false;
    if (flag) {
      // this.mySelection = [];
      await this.loadOrders();
      this.mySelection = [];
      this.selectedOrderItems = new Array<OrderItem>();
    }
  }


  /* #region  Delivery Dialog */
  public async toggleDeliveryDialog() {
    let checkInValidOrder = this.selectedOrderItems.filter(x => this.mySelection.includes(x.id));
    let flagInvoice = checkInValidOrder.some(a => (!a.transactionNo || !a.invItem.invId));
    if (flagInvoice) {
      this.alertDialogService.show(`There are ${checkInValidOrder.filter(a => (!a.transactionNo || !a.invItem.invId)).map(x => x.invItem.stoneId).join(", ")} stone(s) not valid for delivery, because invoice no is not exist or stone is not exist on inventory`);
      this.mySelection = [];
      this.selectedOrderItems = new Array<OrderItem>();
      return;
    }

    let deliveredInvoice = checkInValidOrder.some(a => a.isDelivered);
    if (deliveredInvoice) {
      this.alertDialogService.show(`There are ${checkInValidOrder.filter(a => a.isDelivered).map(x => x.invItem.stoneId).join(", ")} stone(s) are already delivered!`);
      this.mySelection = [];
      this.selectedOrderItems = new Array<OrderItem>();
      return;
    }

    let memoStoneIds = await this.orderService.checkStoneInMemo(checkInValidOrder.map(z => z.invItem.stoneId));
    if (memoStoneIds && memoStoneIds.length > 0) {
      this.alertDialogService.show(memoStoneIds.join(', ') + ' Stone(s) in memo, Please receive it first!');
      return;
    }

    this.selectedTakenByNameItem = "";
    this.showLabelTakenBy = true;
    this.listTakenByItems = [];

    this.resetTakenBy();

    this.toggleTakenByDialog();
  }

  public async toggleColorDialog() {
    let checkExist: OrderItem[] = this.selectedOrderItems;
    let invaildStoneForSale: boolean = checkExist.some(x => x.invItem.invId == null);
    if (invaildStoneForSale)
      return this.alertDialogService.show(`<b>${checkExist.filter(x => x.invItem.invId == null).map(x => x.invItem.stoneId)}</b> stone(s) not in a Stock, Kindly select available stone(s) inventory`)

    this.alertDialogService.ConfirmYesNo(`Are you want to mark color ${checkExist.filter(x => x.invItem.isColor == true).map(x => x.invItem.stoneId)} stone(s) ?`, "Box")
      .subscribe(async (res: any) => {
        if (res.flag) {
          let colorTrueStone = this.selectedOrderItems.filter(x => this.mySelection.includes(x.id) && x.invItem.isColor == true).map(x => x.invItem.invId);
          let colorFalseStone = this.selectedOrderItems.filter(x => this.mySelection.includes(x.id) && x.invItem.isColor == false).map(x => x.invItem.invId);
          let colorTrueMark: boolean = false
          let colorFalseMark: boolean = false

          if (colorTrueStone && colorTrueStone.length > 0)
            colorTrueMark = await this.orderService.toggleOrderItemColor(colorTrueStone, false);


          if (colorFalseStone && colorFalseStone.length > 0)
            colorFalseMark = await this.orderService.toggleOrderItemColor(colorFalseStone, true);

          if ((colorTrueMark && colorFalseMark) || (colorTrueMark && !colorFalseMark) || (!colorTrueMark && colorFalseMark)) {
            await this.loadOrders();
            this.mySelection = [];
            this.selectedOrderItems = new Array<OrderItem>();
            this.utilityService.showNotification("Stone(s) have been Color Marked successfully");
          }

        }
      })
  }

  public async onSaveTaken(form: NgForm) {
    try {
      if (form.valid) {
        this.spinnerService.show();
        let takenBy: TakenBy = new TakenBy();
        takenBy = JSON.parse(JSON.stringify(this.takenByObj));

        if (!this.alreadyAddTakenByFlag) {
          this.selectedTakenByNameItem = takenBy.name;
          let response: TakenBy = await this.memoService.insertTakenBy(takenBy);
          if (response.id && this.photoIdentityModel) {
            this.uploadFilesOnServer(this.photoIdentityModel, response)
          }
        }
        this.spinnerService.hide();

        this.alertDialogService.ConfirmYesNo("Are you sure selected Stone(s) Delivered?", "Delivery")
          .subscribe(async (res: any) => {
            if (res.flag) {
              try {
                this.spinnerService.show();

                let fOflag: boolean = true;

                let reqCommuteDelivery: Array<DeliveryCommuteItem> = new Array<DeliveryCommuteItem>();
                for (let index = 0; index < this.selectedOrderItems.length; index++) {
                  let element = this.selectedOrderItems[index];

                  //update lead in fo only if it is a customer order
                  if (element.leadId && element.isLocked) {
                    let reqCommuteDeliveryObj: DeliveryCommuteItem = new DeliveryCommuteItem();

                    if (reqCommuteDelivery.findIndex(a => a.leadId == element.leadId) == -1) {
                      reqCommuteDeliveryObj.leadId = element.leadId;
                      reqCommuteDeliveryObj.leadNumber = Number(element.leadNumber);
                      reqCommuteDeliveryObj.stoneIds = this.selectedOrderItems.filter(x => x.leadNumber == element.leadNumber).map(a => a.invItem.stoneId);

                      /* #region  get ident value match with existing lead party on FO */
                      let allIdents = this.selectedOrderItems.filter(x => x.leadNumber == element.leadNumber).map(a => a.party.idents)
                      reqCommuteDeliveryObj.idents = new Array<string>();
                      allIdents.forEach(element => reqCommuteDeliveryObj.idents.push(...[...element]));
                      reqCommuteDeliveryObj.idents = reqCommuteDeliveryObj.idents.filter((v, i, a) => a.findIndex(v2 => (v2 === v)) === i)
                      /* #endregion */

                      reqCommuteDelivery.push(reqCommuteDeliveryObj);
                    }
                  }
                }

                if (reqCommuteDelivery && reqCommuteDelivery.length > 0) {
                  let frontOfficeInvResponse = await this.commuteService.stoneDeliveredByLead(reqCommuteDelivery);
                  if (!frontOfficeInvResponse) {
                    fOflag = false;

                    this.spinnerService.hide();
                    this.alertDialogService.show("Something went wrong while Delivery Stone on FO")
                  }
                }

                if (fOflag) {
                  let response = await this.orderService.orderMarkedAsDelivered(this.mySelection, this.selectedTakenByNameItem, (this.fxCredentials?.fullName ?? ""));
                  if (response) {

                    let stoneIds: Array<string> = this.selectedOrderItems.filter(x => this.mySelection.includes(x.id)).map(x => x.invItem.stoneId);
                    let backOfficeInvRepsonse = await this.inventoryService.removeRFIDByStoneIds(stoneIds);
                    if (backOfficeInvRepsonse) {

                      await this.commuteService.removePendigPrice(stoneIds);

                      this.spinnerService.hide();
                      this.utilityService.showNotification("Stone(s) have been delivered successfully");
                      this.mySelection = [];
                      this.selectedOrderItems = new Array<OrderItem>();
                      this.toggleTakenByDialog();
                      await this.loadOrders();
                    }
                    else {
                      this.spinnerService.hide();
                      this.alertDialogService.show("Something went wrong while removing RFID on BO");
                    }

                  }
                  else {
                    this.spinnerService.hide();
                    this.alertDialogService.show("Something went wrong while marking in Delivery Stone on BO");
                  }
                }

                this.spinnerService.hide();

              } catch (error: any) {
                console.error(error);
                this.spinnerService.hide();
                this.alertDialogService.show(error.error);
              }
            }
          })

      }
      else {
        this.spinnerService.hide();
        Object.keys(form.controls).forEach((key) => {
          form.controls[key].markAsTouched();
        });
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }


  private addDbLog(action: string, request: string, response: string, error: string) {
    try {
      let log: DbLog = new DbLog();
      log.action = action;
      log.category = "BackOffice";
      log.controller = "Order";
      log.userName = this.fxCredentials?.fullName;
      log.ident = this.fxCredentials?.id;
      log.payLoad = request;
      log.eventTime = new Date().toDateString();
      log.text = response;
      log.errorText = error;
      this.logService.insertLog(log);

    } catch (error: any) {
      console.error(error);
      this.alertDialogService.show('Log not created, Please contact administrator!', "error");
    }
  }

  public uploadFiles(event: Event): void {
    try {
      this.imageList = [];
      let acceptedFiles: string[] = [];
      const target = event.target as HTMLInputElement;
      if (target.accept) {
        acceptedFiles = target.accept.split(',').map(function (item) {
          return item.trim();
        });
      }

      if (target.files && target.files.length) {
        if (acceptedFiles.indexOf(target.files[0].type) == -1) {
          this.alertDialogService.show(`Please select valid file.`);
          return;
        }

        let file = target.files[0];
        this.currentFile = file;

        this.photoIdentityModel = this.currentFile;
        const reader = new FileReader();
        reader.onload = () => {
          this.imagePreviewphoto = reader.result;
          if (this.imagePreviewphoto?.toString().includes('application/pdf'))
            this.imagePreviewphoto = 'commonAssets/images/pdf_doc.png';
        };
        reader.readAsDataURL(file);
        this.photoIdentityErrorFlag = false;
        this.isImgselectedPhotoIdent = true;

      }
    }
    catch (error: any) {
      console.error(error);
      this.alertDialogService.show("Something went wrong, Try again later");
    }
  }

  public clearPreviewFile() {
    this.imagePreviewphoto = '';
    this.isImgselectedPhotoIdent = false;
    this.photoIdentityModel = undefined;
  }

  public uploadFilesOnServer(file: File, ident: TakenBy, type: string = "TakenBy") {

    this.fileStoreService.postUploadFileDocument(file, type, ident.id, this.takenByObj?.name).subscribe(
      async (res: any) => {
        if (res.body?.success) {
          this.utilityService.showNotification(`You have been added TakenBy successfully!`);
          // this.takenByObj = new TakenBy();
          // this.takenByObj = ident;
          // await this.setTakenByImage(this.takenByObj);

          // this.isAddTakenByPopup = false;
          // this.clearPreviewFile();
        }
      },
      (err: any) => {
        this.currentFile = null as any;
        console.error(err);
        this.alertDialogService.show(`Something went wrong while uploading a file!`, "error")
      }
    );
  }

  public async setTakenByImage(takenBy: TakenBy) {
    this.imageList = await this.fileStoreService.getFileByIdent(takenBy.id);
    if (this.imageList && this.imageList[0]) {
      this.imageList[0].filePath = await this.fileStoreService.getPathToBase64(this.imageList[0].id, this.imageList[0].type);
      this.imageList[0].filePath = this.loadImage(this.imageList[0].filePath) || null as any;
    }
    this.spinnerService.hide();
  }

  private loadImage(imageSrc: string) {
    if (imageSrc != undefined && imageSrc != null && imageSrc != "")
      return 'data:image/JPEG;base64,' + imageSrc;
    else
      return null
  }

  public async toggleTakenByDialog() {
    this.isAddTakenByPopup = !this.isAddTakenByPopup;
    let enbleST = false;

    if (this.isAddTakenByPopup)
      enbleST = await this.utilityService.startIntervalCheck();

    if (enbleST)
      await this.checkStockTallyEnable();

    if (!this.takenByObj.id)
      this.imageList = []
  }

  public async handleTakenbyFilter(value: any) {
    try {
      if (value && value.target && value.target.value) {
        let takenBy: any = await this.memoService.getTakenByName(value.target.value);

        if (takenBy && takenBy.length > 0) {
          this.listTakenByItems = [];
          this.takenByItems = takenBy;
          this.takenByItems.reverse().forEach(z => { this.listTakenByItems.push({ text: z.name, value: z.id }); });
        }
      }
      else
        this.listTakenByItems = [];

      this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }

  }

  public resetTakenBy() {
    this.imageList = [];
    this.clearPreviewFile();
    this.alreadyAddTakenByFlag = false;
    this.takenByObj = new TakenBy();
  }

  public async takenByChange(e: any) {
    if (e) {
      let fetchTakenBy = this.takenByItems.find(x => x.name == e);
      if (fetchTakenBy) {
        setTimeout(() => {
          this.selectedTakenByNameItem = fetchTakenBy?.name ?? '';
        }, 0);
        this.takenByObj = fetchTakenBy;
        this.spinnerService.show();
        this.imageList = [];
        this.clearPreviewFile();
        await this.setTakenByImage(this.takenByObj);
        this.alreadyAddTakenByFlag = true;
      }
      else {
        this.takenByObj = new TakenBy();
        this.imageList = [];
        this.clearPreviewFile();
      }
      this.takenByObj.name = e;
    }
    else {
      this.takenByObj = new TakenBy();
      this.imageList = [];
      this.clearPreviewFile();
    }
  }

  public onTakenByKeyPress(event: any) {
    if (event.target.value.length > 0)
      this.validTextLengthFlag = true;
    else
      this.validTextLengthFlag = false;
  }

  public sanitizeURL(url: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  public async showTakenBy(takenBy: string) {
    this.showLabelTakenBy = false;
    await this.handleTakenbyFilter(takenBy);
    await this.takenByChange(takenBy);
    this.toggleTakenByDialog();
  }

  /* #endregion */

  public isNotValid(args: RowClassArgs) {
    if (args.dataItem.invItem.isTransit)
      return { 'table-row-bg-blue': args.dataItem.invItem.isTransit }
    if (args.dataItem.invItem.isColor)
      return { 'table-row-bg-green': args.dataItem.invItem.isColor }
    if (!(args.dataItem.invItem.invId))
      return { 'table-row-bg-red': !(args.dataItem.invItem.invId) }
    return null as any
  }

  //#region Web Cam Support
  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  public triggerSnapshot(): void {
    this.trigger.next();
  }

  public handleImage(webcamImage: WebcamImage): void {
    let imageName = this.utilityService.exportFileName('Webcam_Image');

    const base64 = webcamImage.imageAsBase64;
    const imageFullName = imageName + '.jpeg';
    const imageBlob = this.dataURItoBlob(base64);
    const imageFile = new File([imageBlob], imageFullName, { type: 'image/jpeg' });

    this.currentFile = imageFile;
    this.photoIdentityModel = this.currentFile;
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreviewphoto = reader.result;
    };
    reader.readAsDataURL(imageFile);
    this.photoIdentityErrorFlag = false;
    this.isImgselectedPhotoIdent = true;
    this.showWebCam = false;
  }

  dataURItoBlob(dataURI: any) {
    const byteString = window.atob(dataURI);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([int8Array], { type: 'image/jpeg' });
    return blob;
  }
  //#endregion

  public selectedRowChange(event: any) {
    this.sumWeight = 0;
    this.sumValue = 0;
    // this.selectedOrderItems = this.selectedOrderItems.filter(c => !this.mySelection.includes(c.id));
    // this.selectedOrderItems.push(JSON.parse(JSON.stringify(this.filterOrderItems.filter(a => this.mySelection.includes(a.id)))));


    if (event.selectedRows.length > 0) {
      for (let index = 0; index < event.selectedRows.length; index++) {
        const element = event.selectedRows[index];
        this.selectedOrderItems.push(element.dataItem);
      }
    }

    if (event.deselectedRows.length > 0) {
      for (let indexRmove = 0; indexRmove < event.deselectedRows.length; indexRmove++) {
        const element = event.deselectedRows[indexRmove];
        let indexFind = this.selectedOrderItems.findIndex(x => x.id == element.dataItem.id);
        if (indexFind > -1)
          this.selectedOrderItems.splice(indexFind, 1);

      }
    }

    this.selectedOrderItems.forEach((z: any) => {
      this.sumWeight += z.invItem.weight;
      this.sumValue += z.invItem.fAmount;
    });

    if (this.sumWeight > 0)
      this.sumWeight = this.utilityService.ConvertToFloatWithDecimal(this.sumWeight);
    if (this.sumValue > 0)
      this.sumValue = this.utilityService.ConvertToFloatWithDecimal(this.sumValue);
  }

  public copyToCertificateClipboard() {
    try {

      if (this.selectedOrderItems && this.selectedOrderItems.length > 0) {
        let certificateNos = this.selectedOrderItems.map(x => x.invItem.certificateNo).join(", ");
        if (certificateNos && certificateNos.length > 0) {
          navigator.clipboard.writeText(certificateNos);
          this.utilityService.showNotification(`Certificate Nos copied successfully!`);
        }
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public copyToStoneIdsClipboard() {
    try {

      if (this.selectedOrderItems && this.selectedOrderItems.length > 0) {
        let stoneIds = this.selectedOrderItems.map(x => x.invItem.stoneId).join(", ");
        if (stoneIds && stoneIds.length > 0) {
          navigator.clipboard.writeText(stoneIds);
          this.utilityService.showNotification(`StoneIds copied successfully!`);
        }
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async exportToExcel() {
    try {
      this.spinnerService.show();

      let excelFile = [];

      for (let index = 0; index < this.selectedOrderItems.length; index++) {
        let element = this.selectedOrderItems[index]

        var excel = await this.convertOrderToObjectExcel(OrderExportFields, element);
        excelFile.push(excel);
      }

      if (excelFile.length > 0)
        this.utilityService.exportAsExcelFile(excelFile, "Order_Excel");

      this.spinnerService.hide();

    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show("Something went wrong while exporting excel, contact administrator!!");
    }

  }

  public async convertOrderToObjectExcel(fields: Array<string>, orderItem: OrderItem) {

    var obj: any = {};
    for (let i = 0; i < fields.length; i++) {

      if (orderItem) {
        if (fields[i] == "SALE DATE")
          obj[fields[i]] = ((orderItem?.transactionDate) ? this.format(new Date(orderItem?.transactionDate)) : "") ?? "";
        if (fields[i] == "ORDER DATE")
          obj[fields[i]] = ((orderItem?.createdDate) ? this.format(new Date(orderItem?.createdDate)) : "") ?? "";
        if (fields[i] == "STOCK")
          obj[fields[i]] = orderItem?.invItem?.stoneId;
        if (fields[i] == "SHAPE")
          obj[fields[i]] = orderItem?.invItem?.shape;
        if (fields[i] == "SIZE")
          obj[fields[i]] = orderItem?.invItem?.weight;
        if (fields[i] == "COLOR")
          obj[fields[i]] = orderItem?.invItem?.color;
        if (fields[i] == "CLARITY")
          obj[fields[i]] = orderItem?.invItem?.clarity;
        if (fields[i] == "CUT")
          obj[fields[i]] = orderItem?.invItem?.cut;
        if (fields[i] == "POLISH")
          obj[fields[i]] = orderItem?.invItem?.polish;
        if (fields[i] == "SYMMETRY")
          obj[fields[i]] = orderItem?.invItem?.symmetry;
        if (fields[i] == "FLO")
          obj[fields[i]] = orderItem?.invItem?.fluorescence;
        if (fields[i] == "DIAMETER")
          obj[fields[i]] = orderItem?.invItem?.diaMeter;
        if (fields[i] == "LAB")
          obj[fields[i]] = orderItem?.invItem?.lab;
        if (fields[i] == "CERTF")
          obj[fields[i]] = orderItem?.invItem?.certificateNo;
        if (fields[i] == "CERTTYPE")
          obj[fields[i]] = orderItem?.invItem?.certiType;
        if (fields[i] == "Dic%")
          obj[fields[i]] = orderItem?.invItem?.fDiscount;
        if (fields[i] == "Net $")
          obj[fields[i]] = orderItem?.invItem?.netAmount;
        if (fields[i] == "VOW Disc")
          obj[fields[i]] = orderItem?.invItem?.vowDiscount;
        if (fields[i] == "VOW $")
          obj[fields[i]] = orderItem?.invItem?.vowAmount;
        if (fields[i] == "RAP")
          obj[fields[i]] = orderItem?.invItem?.price?.rap;
        if (fields[i] == "$/CT.")
          obj[fields[i]] = ((orderItem?.invItem?.fAmount ?? 0) / orderItem?.invItem?.weight);
        if (fields[i] == "Amt")
          obj[fields[i]] = orderItem?.invItem?.fAmount;
        if (fields[i] == "COMPANY")
          obj[fields[i]] = orderItem.party?.name;
        if (fields[i] == "COMPANY CODE")
          obj[fields[i]] = orderItem.party?.code;
        if (fields[i] == "Invoice No")
          obj[fields[i]] = orderItem?.invoiceNo ?? "";

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

}
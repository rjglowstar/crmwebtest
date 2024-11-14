import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { PageChangeEvent, RowClassArgs, SelectableSettings } from '@progress/kendo-angular-grid';
import { Align } from '@progress/kendo-angular-popup';
import { AggregateDescriptor, DataResult, GroupDescriptor, process } from '@progress/kendo-data-query';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { GridDetailConfig } from 'shared/businessobjects';
import { DbLog, fxCredential, GridConfig, GridMasterConfig, Notifications } from 'shared/enitites';
import { AppPreloadService, ConfigService, FrontStoneStatus, LeadStatus, LeadHistoryProggress, LeadHistoryProggressStatus, LeadStatusList, listExportRequestFilterLocation, LogService, NotificationService, OriginValue, StoneStatus, UtilityService, InvHistoryAction, LeadHistoryAction } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import * as xlsx from 'xlsx';
import { ExportRequestData, LeadInvExport, LeadMemoRequest, LeadOrderMailConfig, LeadQcRequest, LeadResponse } from '../../../../businessobjects';
import { BrokerDNrom, BusinessConfig, Configurations, CurrencyType, Customer, CustomerDNorm, InventoryItems, InvHistory, InvItem, Lead, LeadHistory, LeadRejectedOffer, LeadRejectedOfferItem, LeadStoneReleaseItem, LeadSummary, MemoRequest, MemoRequestCustomer, QcRequest, RejectedStone, RequestDNorm, Scheme, Supplier, SystemUserDNorm } from '../../../../entities';
import { BrokerService, BusinessconfigurationService, CommuteService, LeadHistoryService, ConfigurationService, CustomerService, GridPropertiesService, InventoryService, LeadService, MailService, MemorequestService, PricingRequestService, QcrequestService, RejectedstoneService, SchemeService, SupplierService, SystemUserService, InvHistoryService } from '../../../../services';
import { SelectEvent } from '@progress/kendo-angular-layout';

@Component({
  selector: 'app-leadmodal',
  templateUrl: './leadmodal.component.html',
  styleUrls: ['./leadmodal.component.css'],
})
export class LeadmodalComponent implements OnInit {

  @Input() leadTitle!: string;
  @Input() leadItem: Lead = new Lead();
  @Input() seller!: SystemUserDNorm;
  @Input() customer!: string;
  @Input() isEditLead!: boolean;
  @Input() isAddLead!: boolean;
  @Input() public leadListInvInput: InvItem[] = [];
  @Input() public allLeads: LeadResponse[] = [];
  @Input() leadId!: string;

  @Output() toggle: EventEmitter<boolean> = new EventEmitter();
  @ViewChild("anchor") public anchor!: ElementRef;
  @ViewChild("popup", { read: ElementRef }) public popup!: ElementRef;

  //#region Popup Close
  @HostListener("document:click", ["$event"])
  public documentClick(event: any): void {
    if (!this.contains(event.target)) {
      this.showExcelOption = false;
    }
  }


  private contains(target: any): boolean {
    return (
      this.anchor?.nativeElement?.contains(target) ||
      (this.popup ? this.popup?.nativeElement?.contains(target) : false)
    );
  }
  //#endregion

  public disabledFlag: boolean = false;
  public groups: GroupDescriptor[] = [];
  public gridInventoryData: InvItem[] = [];
  public gridCartInventoryData: InvItem[] = [];
  public gridViewLeadInventory!: DataResult;
  public gridViewCartInventory!: DataResult;
  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains'
  };
  public aggregates: AggregateDescriptor[] = [{ field: 'weight', aggregate: 'sum' },
  { field: 'netAmount', aggregate: 'sum' }];
  public pageSize = 14;
  public skip = 0;
  public fields!: GridDetailConfig[];
  public gridConfig!: GridConfig;
  public gridMasterConfigResponse!: GridMasterConfig;
  public isGridConfig: boolean = false;
  public selectableSettings: SelectableSettings = {
    mode: 'multiple',
    checkboxOnly: true
  };
  public fxCredential!: fxCredential;
  public listCustomerItems: Array<{ text: string; companyName: string, value: string }> = [];
  public customerItems: CustomerDNorm[] = [];
  public selectedCustomerItem: string = "";
  public customerObj: CustomerDNorm = new CustomerDNorm();
  public listBrokerItems: Array<{ text: string; value: string }> = [];
  public brokerItems: BrokerDNrom[] = [];
  public selectedBrokerItem!: { text: string, value: string };
  public brokerObj: BrokerDNrom = new BrokerDNrom();
  public listInventoryItems: InvItem[] = [];
  public listAcceptedInventoryItems: InvItem[] = [];
  public listCartInventoryItems: InventoryItems[] = [];
  public sellerObj = new SystemUserDNorm();
  public leadObj = new Lead();
  public modifiedAdisList: any = [];
  public isShowCheckBoxAll: boolean = true;
  public mySelection: string[] = [];
  public supplierItems: Supplier[] = [];
  public subjectReqDis: Subject<InvItem> = new Subject();
  public editCardStatus: string = "";
  public gridName: string = '';
  public message: Notifications = new Notifications();
  public gridDetailSummary: LeadSummary = new LeadSummary();
  public gridAcceptedSummary: LeadSummary = new LeadSummary();
  public isRMReason: boolean = false;
  public removeReasonModel: string = "";
  public businessConfig = new BusinessConfig();
  public listRemoveReasonItems: Array<string> = new Array<string>();
  public newInvItems: InvItem[] = [];

  public isEditableBrokerage: boolean = false;
  public isEditableCustomer: boolean = false;
  public brokerageValue: number = 0;
  public rejectedStone: RejectedStone[] = new Array<RejectedStone>();
  public leadHistoryData: LeadHistory[] = new Array<LeadHistory>();
  public leadHistoryItem: LeadHistory = new LeadHistory();
  public visibleRejectedStone: boolean = false;
  public schemes: Scheme = new Scheme();
  public lastPurchase: number = 0;
  public excelOption!: string | null;
  public anchorAlign: Align = { horizontal: "right", vertical: "bottom" };
  public popupAlign: Align = { horizontal: "center", vertical: "top" };
  public showExcelOption: boolean = false;
  public excelFile: any[] = [];
  public reason!: string;

  public isQcReason: boolean = false;
  public isSalesCancel: boolean = false;
  public qcReasonModel: string = "";
  public listQCReasonItems: Array<string> = new Array<string>();
  public addFromTxt: boolean = false;
  public stoneIdsSearchTxt: string[] = Array<string>();
  public configurationObj: Configurations = new Configurations();
  public isAdmin: boolean = false;
  public listCurrencyType: CurrencyType[] = [];
  public memoMessage: string = '';
  public qcMessage: string = '';
  public isMemoModal: boolean = false;
  public isExportRequestModal: boolean = false;
  public rateModel: string = '';
  public selectedMemoInvItems: InvItem[] = [];
  public isRejectedOffer: boolean = false;
  public isStoneRequest: boolean = false;
  public isPrimarySupplier: boolean = false;
  public releaseStoneList: Array<LeadStoneReleaseItem> = Array<LeadStoneReleaseItem>();
  public leadUpdateStatus: string = "";
  public listLeadStatus: Array<string> = LeadStatusList;
  public leadHistoryProggress: any = LeadHistoryProggress;
  public leadHistoryProggressStatus: any = LeadHistoryProggressStatus;
  public leadHistoryAction: string[] = Object.keys(LeadHistoryProggress) as string[];
  public filterOrAddText!: string;
  public commonDisc!: number;
  // public volDiscToggleFlag: boolean = true;
  public locationModel!: string;
  public exportRequestMessage: string = '';
  public selectedExpReqInvItems: Array<InvItem> = new Array<InvItem>();
  public suppliersLocations: Array<string> = listExportRequestFilterLocation;
  public isQCRequest: boolean = false;
  public selectedQcInvItems: InvItem[] = [];
  public supplierList: Supplier[] = [];


  constructor(
    public customerService: CustomerService,
    public brokerService: BrokerService,
    private alertDialogService: AlertdialogService,
    public utilityService: UtilityService,
    private spinnerService: NgxSpinnerService,
    public appPreloadService: AppPreloadService,
    public inventoryService: InventoryService,
    public router: Router,
    private gridPropertiesService: GridPropertiesService,
    private configService: ConfigService,
    public leadService: LeadService,
    public businessConfigurationService: BusinessconfigurationService,
    public rejectedStoneService: RejectedstoneService,
    public schemeService: SchemeService,
    public configurationService: ConfigurationService,
    public notificationService: NotificationService,
    private supplierService: SupplierService,
    public memoRequestService: MemorequestService,
    public qcRequestService: QcrequestService,
    private pricingRequestService: PricingRequestService,
    private systemUserService: SystemUserService,
    private mailService: MailService,
    private commuteService: CommuteService,
    private logService: LogService,
    private leadHistoryService: LeadHistoryService,
    private invHistoryService: InvHistoryService,
  ) {

  }

  async ngOnInit() {
    this.newInvItems = new Array<InvItem>();
    await this.loadDefaultMethods()
  }

  public async loadDefaultMethods() {
    try {
      this.spinnerService.show();
      this.fxCredential = await this.appPreloadService.fetchFxCredentials();
      if (!this.fxCredential)
        this.router.navigate(["login"]);
      if (this.leadTitle == LeadStatus.Hold.toString())
        this.listLeadStatus = this.listLeadStatus.filter(x => x.toLowerCase() != LeadStatus.Proposal.toLowerCase())

      if (this.leadTitle)
        this.leadUpdateStatus = this.leadTitle;

      if (this.seller)
        this.sellerObj = this.seller;
      await this.loadSuppliersDNorm();
      await this.loadBusinessConfiguration();
      await this.loadBrokers();
      await this.loadCurrencyConfig();
      this.reqAddDisChanges();
      if (this.leadId) {
        this.leadItem = await this.leadService.getLeadById(this.leadId);
        this.isEditLead = true;
        this.leadTitle = LeadStatus.Hold;
        if (this.leadTitle)
          this.leadUpdateStatus = this.leadTitle;
      }

      if (this.leadItem && this.leadItem.id) {
        this.leadItem = await this.leadService.getLeadById(this.leadItem.id);
        this.leadItem.platform = this.leadItem.platform?.toLowerCase();
        this.schemes = await this.getSchemes(this.leadItem.platform == "online" ? true : false);
        if (this.leadItem.platform == "online")
          this.lastPurchase = await this.leadService.getLastPurchaseAmountForVow(this.leadItem.customer.id);
        else
          this.lastPurchase = 0;

        this.leadItem.qcCriteria ? this.qcReasonModel = this.leadItem.qcCriteria : this.qcReasonModel = "";
        if (this.leadItem.platform.toLowerCase() == "online")
          this.gridDetailSummary = this.leadItem.leadSummary;
        this.editLead(this.leadItem, this.isEditLead, this.leadTitle);
      }
      else
        await this.toggleAddLeadDialog()
      
      if (this.customer) {
        let customers: CustomerDNorm = await this.customerService.getCustomerDNormByIdAsync(this.customer);
        this.listCustomerItems = [];
        this.customerItems.push(customers);
        this.customerItems.reverse().forEach(z => { this.listCustomerItems.push({ text: z.name, companyName: z.companyName, value: z.id }); });
        await this.customerChange(this.customer);
        this.spinnerService.hide();
      }
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async loadSuppliersDNorm() {
    try {
      this.supplierItems = await this.supplierService.getAllSuppliers();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }

  }

  public async loadCurrencyConfig() {
    try {
      let res = await this.configurationService.getCurrencyTypesList();
      if (res)
        this.listCurrencyType = res;
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  //#region load methods
  public async loadBusinessConfiguration() {
    try {
      this.businessConfig = await this.businessConfigurationService.getBusinessConfiguration();
      if (this.businessConfig && this.businessConfig.removeStoneReasons.length > 0)
        this.listRemoveReasonItems = this.businessConfig.removeStoneReasons;
      if (this.businessConfig && this.businessConfig.qcReasons.length > 0)
        this.listQCReasonItems = this.businessConfig.qcReasons;
      this.configurationObj = await this.configurationService.getConfiguration();

      this.isAdmin = this.fxCredential?.origin == "Admin" ? true : false;
    } catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }


  public async loadBrokers() {
    try {

      this.brokerItems = await this.brokerService.getAllBrokerDNorms();
      this.listBrokerItems = [];
      this.brokerItems.forEach(z => { this.listBrokerItems.push({ text: z.name, value: z.id }); });
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }

  }

  public brokerChange() {
    let fetchBroker = this.brokerItems.find(x => x.id == this.selectedBrokerItem?.value);
    if (fetchBroker)
      this.brokerObj = fetchBroker;

    if (this.isEditableBrokerage)
      this.brokerageValue = JSON.parse(JSON.stringify(this.brokerObj?.brokrage) ?? 0) ?? 0;

    if (!this.leadObj.id) {
      if (this.brokerObj?.brokrage > 0) {
        this.gridDetailSummary = this.calculateSummaryAll(this.listInventoryItems);
        if (this.listAcceptedInventoryItems.length > 0)
          this.gridAcceptedSummary = this.calculateSummaryAll(this.listAcceptedInventoryItems);
      }
      else
        this.listInventoryItems.forEach(x => {
          x.brokerAmount = 0;
        })
    }
  }

  public customerChange(e: any) {
    if (e) {
      let fetchCustomer = this.customerItems.find(x => x.id == e);
      if (fetchCustomer) {
        setTimeout(() => {
          this.selectedCustomerItem = fetchCustomer?.companyName + '-' + fetchCustomer?.name ?? '' as any;
        }, 0);
        this.customerObj = { ...fetchCustomer } ?? new CustomerDNorm();
      }
    }
    else
      this.customerObj = new CustomerDNorm();

  }

  public async handleCustomerFilter(value: any) {
    try {
      if (value) {
        let customers: CustomerDNorm[] = await this.customerService.getAllCustomerDNormsByName(value);
        this.listCustomerItems = [];
        this.customerItems = customers;
        this.customerItems.reverse().forEach(z => { this.listCustomerItems.push({ text: z.name, companyName: z.companyName, value: z.id }); });
        this.spinnerService.hide();
      }
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  //#endregion

  //#region Grid Change Events
  public async loadInventoryByStoneAndCertificate(ids: string[]) {
    try {
      let inventory: InvItem[] = await this.inventoryService.getInventoryDNormsByStonesAndCertificateIds(ids, " " as any);
      let holdIds: Array<string> = new Array<string>();
      let errorMessage = ""

      var notFoundStoneIds = ids.filter(x => !inventory.map(a => a.stoneId.toLowerCase()).includes(x.toLowerCase()) && !inventory.map(a => a.certificateNo).includes(x));
      if (notFoundStoneIds.length > 0)
        errorMessage += `<b>${notFoundStoneIds.join(", ")}</b> not Found`;


      if (this.leadUpdateStatus.toLowerCase() == LeadStatus.Hold.toLowerCase() || this.leadUpdateStatus.toLowerCase() == LeadStatus.Order.toLowerCase()) {
        holdIds = inventory.filter(x => x.isHold).map(x => x.stoneId)

        var pricingRequestIds = await this.pricingRequestService.getPricingRequestStoneIds(ids);
        if (pricingRequestIds.length > 0)
          return this.alertDialogService.show(`${pricingRequestIds.length == 1 ? pricingRequestIds.toString() + ' Stone is' : pricingRequestIds.join(", ") + ' Stones are'}  in Pricing Requests.`);

        if (holdIds.length > 0)
          errorMessage += `<b>${holdIds.join(", ")}</b> is hold`;

        inventory = inventory.filter(x => !holdIds.includes(x.stoneId));

      }


      if (inventory.length > 0) {
        this.newInvItems.push(...inventory);
        this.loadInventory(inventory, true); //load inventory
      }
      if (errorMessage)
        this.alertDialogService.show(errorMessage);
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }

  }


  public loadInventory(inventories: InvItem[], isStoneAdd: boolean = false) {
    if (!isStoneAdd)
      this.listInventoryItems = [];

    if (this.mySelection.length > 0) {
      inventories.sort((a, b) => {
        const indexA = this.mySelection.indexOf(a.invId);
        const indexB = this.mySelection.indexOf(b.invId);
        return indexB - indexA;
      })
    }

    if (inventories && inventories.length > 0) {

      for (let index = 0; index < inventories.length; index++) {
        let element = inventories[index];
        this.calculateInvAmount(element);
        this.listInventoryItems.push(element);
      }

      if (this.listInventoryItems.length > 0) {
        this.gridInventoryData = [];

        for (let indexGrid = 0; indexGrid < this.pageSize; indexGrid++) {
          const element = this.listInventoryItems[indexGrid];
          if (element)
            this.gridInventoryData.push(element);

        }
        this.loadLeadInventoryGrid(this.listInventoryItems);
      }
    }
    else
      if (isStoneAdd)
        this.alertDialogService.show("Stone(s) not Found");
    this.spinnerService.hide();
  }

  public isDisabled(args: RowClassArgs) {
    var classNames = '';
    if (args.dataItem.isRejected === true)
      classNames += 'k-state-disabled';

    if (args.dataItem.aDiscount < 0)
      classNames += 'table-row-bg-red';

    return classNames;
  }

  public async loadLeadInventoryGrid(leadInventoryItems: InvItem[], isPaging: boolean = false) {
    if (leadInventoryItems.length > 0) {
      if (this.leadObj.platform.toLowerCase() == "offline") {
        this.schemes = await this.getSchemes(false);
        // if (this.customerObj.id)
        //   this.lastPurchase = await this.leadService.getLastPurchaseAmountForVow(this.customerObj.id);
        if (!isPaging)
          this.gridDetailSummary = this.calculateSummaryAll(this.listInventoryItems);
        if (this.leadObj.broker.id) {
          if (!isPaging)
            this.gridDetailSummary = this.calculateSummaryAll(this.listInventoryItems);
          if (this.listAcceptedInventoryItems.length > 0)
            this.gridAcceptedSummary = this.calculateSummaryAll(this.listAcceptedInventoryItems);
        }
      }

      if (this.groups && this.groups.length > 0)
        for (let index = 0; index < this.groups.length; index++) {
          const element = this.groups[index];
          element.aggregates = this.aggregates
        }

      if (this.leadItem.leadStatus.toLowerCase() == LeadStatus.Order.toLowerCase())
        this.gridDetailSummary = this.leadItem.leadSummary;

      this.setGridInvData(leadInventoryItems.length);
    }
    else {
      this.gridDetailSummary = new LeadSummary();
      this.setGridInvData(leadInventoryItems.length);
    }
    this.spinnerService.hide();
  }

  private setGridInvData(totalCount: number) {
    this.gridInventoryData = this.sortingInvItemADiscount(this.gridInventoryData);
    this.gridViewLeadInventory = process(this.gridInventoryData, { group: this.groups });
    this.gridViewLeadInventory.total = totalCount;
  }

  public sortingInvItemADiscount(data: InvItem[]) {
    data = data.sort((n1, n2) => {
      let np1 = parseFloat(n1.aDiscount?.toString());
      let np2 = parseFloat(n2.aDiscount?.toString());

      if (np1 > np2)
        return 1;

      if (np1 < np2)
        return -1;

      return 0;
    });
    return data;
  }

  public async onEnterAddStone(event: any) {
    try {
      let stoneId = event.target.value;
      await this.loadStoneDetails(stoneId);
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public onTabSelect(e: SelectEvent): void {
    if (e.title == "LeadHistory")
      this.loadLeadHistoryData();
  }

  public async loadLeadHistoryData() {
    try {
      this.spinnerService.show();
      this.leadHistoryData = await this.leadHistoryService.GetLeadHistoryByLeadId(this.leadItem.id);
      this.leadHistoryData[this.leadHistoryData.length - 1] = { ...this.leadHistoryData[this.leadHistoryData.length - 1], isSelected: true }
      this.leadHistoryItem = this.leadHistoryData[this.leadHistoryData.length - 1];
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  get sortedData(): LeadHistory[] {
    return this.leadHistoryData.slice().sort((a, b) => new Date(b.createdDate).valueOf() - new Date(a.createdDate).valueOf());
  }

  public async loadStoneDetails(stoneId: string) {
    try {
      this.addFromTxt = true;

      if (!stoneId) {
        this.mySelection = new Array<string>();
        this.listAcceptedInventoryItems = new Array<InvItem>();
        this.gridAcceptedSummary = this.calculateSummaryAll(this.listAcceptedInventoryItems);
      }

      if (this.customerObj.id == null)
        return this.alertDialogService.show('Please select customer!');

      this.spinnerService.show();
      let fetchIds: string[] = this.utilityService.CheckStoneIdsAndCertificateIds(stoneId);
      this.stoneIdsSearchTxt = fetchIds.map(x => x.toLowerCase());

      // check already rejected stones with same party in last 24 hr
      let oneDayAgoRejectedStone = await this.leadService.getOneDayAgoRejectedStone(fetchIds, this.customerObj.id)

      if (oneDayAgoRejectedStone && oneDayAgoRejectedStone.length > 0) {
        this.spinnerService.hide();
        return this.alertDialogService.show(`Not valid to do Proceed with this stone <b>${oneDayAgoRejectedStone.join(", ")}</b> wait for some time because stone recently rejected by someone`)
      }

      let existIds: string[] = [];
      let existStones: string[] = [];
      let existCertificates: string[] = [];
      let existStonesInList: string[] = [];

      if (this.listInventoryItems.length > 0) {
        existStones = this.listInventoryItems.map(c => c.stoneId.toLowerCase());
        existCertificates = this.listInventoryItems.map(c => c.certificateNo);
        existIds = [...existStones, ...existCertificates];
        existStonesInList = this.listInventoryItems.filter(item => fetchIds.map(x => x.toLowerCase().toString()).includes(item.stoneId.toLowerCase()) || fetchIds.map(x => x.toLowerCase().toString()).includes(item.certificateNo)).map(x => x.invId);
        fetchIds = fetchIds.filter(item => !existIds.includes(item.toLowerCase()));
      }

      if (!this.leadObj.id || this.leadTitle != LeadStatus.Order.toString()) {
        if (fetchIds && fetchIds.length > 0) {
          if (this.leadObj.id && !this.leadObj.orderExpiredDate && this.leadTitle != LeadStatus.Proposal.toString())
            this.alertDialogService.show(`You are not able to add <b>${fetchIds.join(", ")}</b> because your lead addition time has been expired !!`);
          else
            await this.loadInventoryByStoneAndCertificate(fetchIds);
        }

      }
      else if (fetchIds && fetchIds.length > 0 && !this.leadObj.orderExpiredDate)
        this.alertDialogService.show(`You are not able to add <b>${fetchIds.join(", ")}</b> because your lead addition time has been expired !!`);

      if (existStonesInList.length > 0) {
        this.mySelection = existStonesInList;
        this.listAcceptedInventoryItems = this.listInventoryItems.filter(x => this.mySelection.includes(x.invId));
        if (this.listAcceptedInventoryItems.length > 0)
          this.gridAcceptedSummary = this.calculateSummaryAll(this.listAcceptedInventoryItems);
      }
      this.skip = 0;
      this.loadInventory(this.listInventoryItems);
      this.spinnerService.hide();

    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public checkObj(list: InvItem[]) {
    for (let index = 0; index < list.length; index++) {
      for (let index1 = 0; index1 < list.length; index1++) {
        if (index1 != index) {
          if (list[index].stoneId.toLowerCase() == list[index1].stoneId) {
            return true;
          }
        }
      }
    }
    return false;
  }

  public convertToTitleCase(str: string) {
    // Split the string into individual words
    const words = str.split(/(?=[A-Z])/);
    const uncapitalize = words.map((word, index) => word.charAt(0).toLowerCase() + word.slice(1));
    // Join the words with spaces
    const titleCaseStr = uncapitalize.join(' ');

    return titleCaseStr;
  }

  public onEnterCommonADisc(event: any) {
    try {
      let amount = event.target.value;
      this.onCommonADisc(amount);

    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public onCommonADisc(amount: number) {
    try {

      if (amount.toString() == '-')
        return;

      let selecteInvItems: InvItem[] = new Array<InvItem>();
      if (amount == null || amount == undefined || amount.toString() == "")
        amount = 0;

      if (this.mySelection.length == 0)
        selecteInvItems = this.listInventoryItems;
      else
        selecteInvItems = this.listInventoryItems.filter(o => this.mySelection.some((a) => a == o.invId));




      for (let index = 0; index < selecteInvItems.length; index++) {
        const element = selecteInvItems[index];
        element.aDiscount = Number(element.aDiscount);
        element.aDiscount = Number(amount);
        element.aDiscount = element.aDiscount.toString() as any;
        this.calculateInvAmount(element);
      }
      // this.gridDetailSummary = this.calculateSummaryAll(this.listInventoryItems);


      if (this.mySelection.length == 0) {
        this.mySelection = this.listInventoryItems.map(o => o.invId);
        this.listAcceptedInventoryItems = this.listInventoryItems;
      }

      this.leadItem?.leadInventoryItems?.length > 0 && this.leadItem?.leadInventoryItems
        .map((currentObj, index) => {
          if (currentObj?.invId == selecteInvItems[index]?.invId && currentObj.aDiscount != selecteInvItems[index].aDiscount)
            this.modifiedAdisList.push(selecteInvItems[index].stoneId);
        })
      if (this.listAcceptedInventoryItems.length > 0)
        this.gridAcceptedSummary = this.calculateSummaryAll(this.listAcceptedInventoryItems);


    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public pageChange(event: PageChangeEvent): void {
    this.spinnerService.show();
    this.gridInventoryData = [];
    this.skip = event.skip;

    if (this.listInventoryItems.length > 0) {
      for (let i = this.skip; i < this.pageSize + this.skip; i++) {
        const element = this.listInventoryItems[i];
        if (element)
          this.gridInventoryData.push(element);
      }
      this.loadLeadInventoryGrid(this.listInventoryItems, true);
    }

  }

  public groupChange(groups: GroupDescriptor[]): void {
    try {
      this.groups = groups;
      this.loadLeadInventoryGrid(this.listInventoryItems);
    }
    catch (error: any) {
      console.error(error);
      this.alertDialogService.show(error.error)
    }
  }

  //#endregion

  //#region create lead
  public async submitLead(form: NgForm, action: boolean) {
    try {

      if (form.valid) {
        let confirmationMessage: string = "";
        let onlyApprove: boolean = false;

        if (this.customerObj.id == null)
          return this.alertDialogService.show('Please select customer!');

        if (this.visibleRejectedStone) {
          this.closeLeadDialog();
          return;
        }

        if (this.leadObj.id) {

          if (this.leadUpdateStatus.toLowerCase() == LeadStatus.Order.toString().toLowerCase() || (this.leadObj.leadStatus.toLowerCase() == LeadStatus.Order.toString().toLowerCase())) {
            if (this.leadObj.leadAdminFlag == false)
              return this.alertDialogService.show("Kindly, wait for admin approval about additional discount");
            if (this.leadObj.changePartyId && this.leadObj.leadChangePartyFlag == null)
              return this.alertDialogService.show("Kindly, wait for admin approval about party details changes");
          }

          if (this.leadTitle.toLowerCase() != this.leadUpdateStatus.toLowerCase()) {
            if (this.leadUpdateStatus.toLowerCase() == LeadStatus.Hold.toString().toLowerCase() || this.leadUpdateStatus.toLowerCase() == LeadStatus.Order.toString().toLowerCase()) {
              let leadInventoryItems: InvItem[] = await this.leadService.getStonesByLeadId(this.leadObj.id);

              var stoneIds = Array<string>();
              var soldStoneIds = Array<string>();
              let flag: boolean = false;
              if (this.mySelection.length == 0) {
                stoneIds = leadInventoryItems.map(c => c.stoneId);
                soldStoneIds = leadInventoryItems.filter(x => !x.isRejected && x.status == StoneStatus.Sold.toString()).map(c => c.stoneId);
                flag = leadInventoryItems.some(x => x.isHold && !x.isRejected);
              }
              else {
                flag = leadInventoryItems.filter(a => this.mySelection.includes(a.invId)).some(x => x.isHold && !x.isRejected);
                stoneIds = leadInventoryItems.filter(a => this.mySelection.includes(a.invId)).map(c => c.stoneId);
                soldStoneIds = leadInventoryItems.filter(x => this.mySelection.includes(x.invId) && !x.isRejected && x.status == StoneStatus.Sold.toString()).map(c => c.stoneId);

              }

              if (this.leadUpdateStatus.toLowerCase() != LeadStatus.Rejected.toString().toLowerCase()) {
                if (soldStoneIds && soldStoneIds.length > 0) {
                  this.alertDialogService.show(`${soldStoneIds.length == 1 ? `<b>` + soldStoneIds.toString() + `</b> Stone is` : `<b>` + soldStoneIds.join(", ") + `</b> Stones are`}  Sold, so you can not procced further.`);
                  return;
                }
              }


              var pricingStoneIds = Array<string>();
              pricingStoneIds = leadInventoryItems.filter(x => !x.isRejected).map(c => c.stoneId);
              var returnedIds = await this.pricingRequestService.getPricingRequestStoneIds(pricingStoneIds);
              if (returnedIds.length > 0) {
                this.alertDialogService.show(`${returnedIds.length == 1 ? returnedIds.toString() + ' Stone is' : returnedIds.join(", ") + ' Stones are'}  in Pricing Requests.`);
                return;
              }

              if (flag) {
                if (this.leadObj.leadStatus.toLowerCase() == LeadStatus.Proposal.toString().toLowerCase()) {
                  let holdStones: Array<InvItem> = new Array<InvItem>();
                  if (this.mySelection.length == 0)
                    holdStones = leadInventoryItems.filter(x => x.isHold && !x.isRejected);
                  else
                    holdStones = leadInventoryItems.filter(x => this.mySelection.includes(x.invId) && x.isHold && !x.isRejected);

                  if (holdStones.length > 0)
                    return this.getHoldByOtherSeller(holdStones);
                }
              }
            }

            if (!this.leadObj.qcCriteria) {
              this.leadId = this.leadObj.id
              if (this.leadId) {
                this.openQcReasonDialog();
                return this.utilityService.showNotification("Kindly add qc criteria", "warning");
              }
            }
          }

          let exist: boolean = this.listInventoryItems.some(x => x.aDiscount < 0);
          if (exist && this.leadObj.leadAdminFlag == null) {
            this.alertDialogService.ConfirmYesNo("Do you want to request to admin about the lead?", "Lead")
              .subscribe(async (res: any) => {
                if (res.flag) {
                  this.leadObj.leadAdminFlag = false;
                  await this.updateLeadCommonMethod(false, true);
                }
              });
            return;

          }

          if (this.leadUpdateStatus == LeadStatus.Hold.toString() || this.leadUpdateStatus == LeadStatus.Order.toString()) {
            if (this.listAcceptedInventoryItems.length == 0)
              this.listAcceptedInventoryItems = this.listInventoryItems;
          }

          if (this.listAcceptedInventoryItems.length == this.listInventoryItems.length)
            onlyApprove = true;

          if (this.leadUpdateStatus.toLowerCase() != LeadStatus.Rejected.toLowerCase()) {
            if (onlyApprove) {
              if (this.leadTitle.toLowerCase() != this.leadUpdateStatus.toLowerCase())
                confirmationMessage = `Do you want to move lead on ${this.leadUpdateStatus}`;
              else
                confirmationMessage = `Do you want to update the lead?`;

            }
            else {
              if (this.leadTitle.toLowerCase() == this.leadUpdateStatus.toLowerCase())
                confirmationMessage = `Do you want to update the lead?`;
              else
                confirmationMessage = `Are you want to split a lead on ${this.leadUpdateStatus.toLowerCase()} for <b>${this.listAcceptedInventoryItems.map(x => x.stoneId).join(", ")}</b> stones?`;
            }
          }
          else
            confirmationMessage = `Do you want to rejected the lead?`;

        }
        else
          confirmationMessage = `Do you want to add the lead?`;


        this.alertDialogService.ConfirmYesNo(confirmationMessage, "Lead")
          .subscribe(async (res: any) => {
            if (res.flag) {
              this.spinnerService.show();

              if (this.leadUpdateStatus.toLowerCase() == LeadStatus.Rejected.toString().toLowerCase()) {
                this.spinnerService.hide();
                this.insertLeadHistoryAction(`${this.leadTitle.charAt(0).toUpperCase() + this.leadTitle.slice(1) + "To" + this.leadUpdateStatus.charAt(0).toUpperCase() + this.leadUpdateStatus.slice(1)}`, `Lead has been moved from ${this.leadTitle} to ${this.leadUpdateStatus}`);
                let issExistProcessDate = await this.leadService.getProcessDateByLeadNo(this.leadObj.leadNo);
                if (!issExistProcessDate) {
                  this.isRejectedOffer = true;
                  this.mySelection = this.listInventoryItems.map(x => x.invId);
                }
                else
                  this.alertDialogService.show("you can't reject the lead because it is already in process")
              }
              else {
                if (!this.isEditLead) {
                  this.leadObj = new Lead();
                  this.leadObj.customer = this.customerObj;
                  this.leadObj.broker = this.brokerObj;
                  this.leadObj.seller = this.sellerObj;
                  if (this.fxCredential.fullName)
                    this.leadObj.createdBy = this.fxCredential.fullName;
                  if(this.customer != null && this.customer != ""){
                    this.leadObj.isAILeadGenerated = true;
                  }

                  this.leadObj.leadInventoryItems = new Array<InvItem>();
                  if (this.listInventoryItems.length > 0)
                    for (let index = 0; index < this.listInventoryItems.length; index++) {
                      const element = this.listInventoryItems[index];
                      let invItem = new InvItem();
                      invItem.invId = element.invId;
                      invItem.stoneId = element.stoneId;
                      invItem.isLabReturn = element.isLabReturn;
                      if (element.aDiscount)
                        invItem.aDiscount = element.aDiscount;
                      this.leadObj.leadInventoryItems.push(invItem);
                    }

                  let existAdminRequest: boolean = this.leadObj.leadInventoryItems.some(x => x.aDiscount < 0);
                  if (existAdminRequest) {
                    this.spinnerService.hide();
                    return this.alertDialogService.show("Found additional discount greater then permissionable, please create lead without discount!")
                  }

                  // check already rejected stones with same party in last 24 hr
                  let oneDayAgoRejectedStone = await this.leadService.getOneDayAgoRejectedStone(this.leadObj.leadInventoryItems.map(x => x.stoneId), this.customerObj.id)

                  if (oneDayAgoRejectedStone && oneDayAgoRejectedStone.length > 0) {
                    this.spinnerService.hide();
                    return this.alertDialogService.show(`Not valid to do Proceed with this stone <b>${oneDayAgoRejectedStone.join(", ")}</b> wait for some time because stone recently rejected by someone`)
                  }

                  this.leadObj.leadSummary = new LeadSummary();
                  this.leadObj.leadSummary.totalAmount = this.gridDetailSummary.totalAmount;
                  this.leadObj.leadSummary.totalCarat = this.gridDetailSummary.totalCarat;
                  this.leadObj.leadSummary.totalPcs = this.gridDetailSummary.totalPcs;
                  this.leadObj.leadSummary.totalPayableAmount = this.gridDetailSummary.totalPayableAmount;

                  let response: string = await this.leadService.leadInsert(this.leadObj);

                  if (response == "Duplicate")
                    return this.alertDialogService.show("Duplicate lead detected. A lead with the same details already exists");

                  if (response) {
                    this.spinnerService.hide();
                    this.utilityService.showNotification(`You have been generated lead successfully!`);
                    this.resetForm(form);
                    if (action)
                      this.closeLeadDialog();
                    else
                      this.toggle.emit(false)
                  }
                }
                else {
                  if (!onlyApprove) {
                    if (this.leadTitle.toLowerCase() == this.leadUpdateStatus.toLowerCase()) {
                      this.leadObj.leadInventoryItems = this.listInventoryItems;
                      await this.updateLeadCommonMethod();
                    }
                    else {
                      let leadNewObj = new Lead();
                      leadNewObj.customer = this.leadObj.customer;
                      leadNewObj.broker = this.leadObj.broker;
                      leadNewObj.seller = this.leadObj.seller;
                      leadNewObj.leadStatus = this.leadUpdateStatus;
                      leadNewObj.isVolDiscFlag = this.leadObj.isVolDiscFlag;
                      this.listAcceptedInventoryItems.forEach(x => { x.isHold = true; x.holdBy = (this.fxCredential.fullName ?? "") });
                      leadNewObj.leadInventoryItems = this.listAcceptedInventoryItems;
                      leadNewObj.leadSummary = this.gridAcceptedSummary;
                      if (leadNewObj.leadStatus.toLowerCase() == LeadStatus.Order.toString().toLowerCase())
                        leadNewObj.orderDate = this.utilityService.setLiveUTCDate();

                      if (this.fxCredential.fullName)
                        this.leadObj.createdBy = this.fxCredential.fullName;

                      let response = await this.leadService.leadInsert(leadNewObj);

                      if (response == "Duplicate")
                        return this.alertDialogService.show("Duplicate lead detected. A lead with the same details already exists");

                      if (response) {
                        let invIds = this.listAcceptedInventoryItems.map(x => x.invId);

                        if (this.leadTitle.toLowerCase() == LeadStatus.Proposal.toString().toLowerCase()) {
                          const isRapnetHold = leadNewObj.leadStatus.toLowerCase() == LeadStatus.Hold.toString().toLowerCase() ? false : true;
                          await this.inventoryService.updateInventoryHoldUnHoldById(invIds, true, isRapnetHold);
                          this.insertInvItemHistoryList(invIds, InvHistoryAction.Hold, "Updated the stone to Hold from the Lead Modal for stone");
                        }

                        if (this.leadTitle.toLowerCase() == LeadStatus.Hold.toString().toLowerCase()) {
                          await this.inventoryService.updateInventoryRapNetHoldById(invIds);
                          this.insertInvItemHistoryList(invIds, InvHistoryAction.RapnetHold, "Updated the stone to RapnetHold from the Lead Modal for stone");
                        }

                        if (leadNewObj.leadStatus.toLowerCase() == LeadStatus.Order.toString().toLowerCase()) {
                          await this.inventoryService.updateInventoryStatusById(invIds, FrontStoneStatus.Order.toString());
                          this.insertInvItemHistoryList(invIds, InvHistoryAction.Order, `Updated the stone status is ${FrontStoneStatus.Order.toString()} from the Lead Modal for stone`)
                        }
                        this.listInventoryItems = this.leadObj.leadInventoryItems.filter(o => !this.listAcceptedInventoryItems.some((a) => a.invId == o.invId));
                        await this.updateLeadCommonMethod();
                      }
                    }
                  }
                  else {
                    this.leadObj.leadStatus = this.leadUpdateStatus.toString();
                    this.leadObj.leadInventoryItems = this.listInventoryItems;


                    await this.updateLeadCommonMethod();
                  }
                }
              }
            }
            else {
              this.mySelection = [];
              this.listAcceptedInventoryItems = new Array<InvItem>();
              this.gridAcceptedSummary = this.calculateSummaryAll(this.listAcceptedInventoryItems);
            }
          });
      }
      else {
        this.spinnerService.hide();
        Object.keys(form.controls).forEach((key) => {
          form.controls[key].markAsTouched();
        });
      }
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public compareLists(previousList: InvItem[], currentList: InvItem[]) {
    const addedObjects = [];
    const removedObjects = [];

    // Check for added objectsinsertLeadHistoryAction
    for (const currentObj of currentList) {
      const found = previousList.find(previousObj => previousObj.invId === currentObj.invId);
      if (!found)
        addedObjects.push(currentObj);
    }

    // Check for removed objects
    for (const previousObj of previousList) {
      const found = currentList.find(currentObj => currentObj.invId === previousObj.invId);
      if (!found)
        removedObjects.push(previousObj);
    }

    return {
      added: addedObjects,
      removed: removedObjects
    };
  }

  public async insertLeadHistoryAction(action: string, desc: string, stoneId?: string[]) {
    try {
      let stoneIds = [];

      if (this.mySelection.length > 0)
        stoneIds = this.gridViewLeadInventory.data
          .filter(res => this.mySelection.includes(res.invId))
          .map(s => s.stoneId);
      else
        stoneIds = stoneId && stoneId.length > 0 ? stoneId : this.gridViewLeadInventory.data.map(s => s.stoneId);

      const leadHistoryObj = new LeadHistory()
      leadHistoryObj.leadId = this.leadObj.id;
      leadHistoryObj.leadNo = this.leadObj.leadNo;
      leadHistoryObj.action = action;
      leadHistoryObj.description = desc;
      leadHistoryObj.customer = this.customerObj;
      leadHistoryObj.stoneIds = stoneIds;
      leadHistoryObj.broker = this.brokerObj;
      leadHistoryObj.seller = this.sellerObj;
      leadHistoryObj.createdBy = this.fxCredential.fullName;
      await this.leadHistoryService.InsertLeadHistory(leadHistoryObj)
    }
    catch (error: any) {
      console.error(error);
      this.alertDialogService.show(error.error);
    }
  }

  public async updateLeadCommonMethod(action: boolean = false, isNotify: boolean = false, isSeller: boolean = true, isAccept?: boolean) {
    let invitems = await this.leadService.getStonesByLeadId(this.leadObj.id);
    let oldInvitemsids = new Set(invitems.map(d => d.stoneId));

    let mergedInvitems: InvItem[];
    if (this.leadObj.leadAdminFlag == false)
      this.listAcceptedInventoryItems = this.listInventoryItems;
    if (this.leadTitle.toLowerCase() != this.leadObj.leadStatus.toLowerCase()) {
      if (this.listAcceptedInventoryItems.length == this.gridDetailSummary.totalPcs)
        mergedInvitems = this.listAcceptedInventoryItems = this.listInventoryItems;

      // mergedInvitems = this.listAcceptedInventoryItems;
      else {
        if (this.listAcceptedInventoryItems.length > 0) {
          let acceptItemsIds = new Set(this.listAcceptedInventoryItems.map(d => d.stoneId))
          mergedInvitems = [...invitems.filter(d => !acceptItemsIds.has(d.stoneId))];

        }
        else
          mergedInvitems = [...invitems, ...this.gridInventoryData.filter(d => !oldInvitemsids.has(d.stoneId))];
      }
    }
    else
      mergedInvitems = this.listInventoryItems;

    if ((this.leadObj.leadStatus.toLowerCase() != LeadStatus.Order.toString().toLowerCase()) && (this.leadObj.leadStatus.toLowerCase() != LeadStatus.Rejected.toString().toLowerCase())) {

      this.leadObj.leadInventoryItems = new Array<InvItem>();
      if (mergedInvitems.length > 0) {
        for (let index = 0; index < mergedInvitems.length; index++) {
          const element = mergedInvitems[index];
          let invItem = new InvItem();
          invItem.invId = element.invId;
          invItem.isRejected = element.isRejected;
          invItem.aDiscount = Number((this.listInventoryItems.find(x => x.invId == element.invId)?.aDiscount)) ?? 0;
          this.leadObj.leadInventoryItems.push(invItem);
        }
      }

    }
    else {
      if (this.leadObj.leadStatus.toLowerCase() == LeadStatus.Order.toString().toLowerCase()) {
        mergedInvitems.forEach(x => { !x.isRejected ? x.isHold = true : x.isHold = false });
        this.leadObj.leadInventoryItems = mergedInvitems;
      }
    }

    if (this.leadUpdateStatus.toLowerCase() == LeadStatus.Rejected.toString().toLowerCase() && this.leadObj.leadStatus.toLowerCase() == LeadStatus.Rejected.toString().toLowerCase())
      this.gridDetailSummary = this.calculateSummaryAll(mergedInvitems.filter(x => x.isRejected));
    else
      this.gridDetailSummary = this.calculateSummaryAll(mergedInvitems.filter(x => !x.isRejected));

    this.leadObj.leadSummary = new LeadSummary();
    this.leadObj.leadSummary.totalAmount = this.gridDetailSummary.totalAmount;
    this.leadObj.leadSummary.totalCarat = this.gridDetailSummary.totalCarat;
    this.leadObj.leadSummary.totalPcs = this.gridDetailSummary.totalPcs;
    this.leadObj.leadSummary.totalPayableAmount = this.gridDetailSummary.totalPayableAmount;
    let tempLeadInventoryItems: InvItem[] = (await this.leadService.getStonesByLeadId(this.leadObj?.id)).filter(res => !res.isRejected);

    if (this.leadObj.leadStatus.toLowerCase() == LeadStatus.Order.toString().toLowerCase() && this.mySelection.length == 0)
      this.gridDetailSummary = await this.calculateSummaryAll(this.leadObj.leadInventoryItems, true);

    if ((this.leadObj.platform.toLowerCase() == 'online' || this.leadObj.platform.toLowerCase() == 'offline') && (this.leadObj.leadStatus.toLowerCase() == LeadStatus.Order.toString().toLowerCase() || this.leadObj.leadStatus.toLowerCase() == LeadStatus.Rejected.toString().toLowerCase()))
      this.leadObj.leadSummary = this.gridDetailSummary;

    if (this.leadUpdateStatus.toLowerCase() == LeadStatus.Order.toString().toLowerCase() && this.listAcceptedInventoryItems.length == invitems.filter(z => !z.isRejected).length)
      this.leadObj.orderDate = this.utilityService.setLiveUTCDate();

    let response = await this.leadService.leadUpdate(this.leadObj);
    if (response) {
      
      if (this.leadTitle.toLowerCase() != this.leadUpdateStatus.toLowerCase())
        this.insertLeadHistoryAction(`${this.leadTitle.charAt(0).toUpperCase() + this.leadTitle.slice(1) + "To" + this.leadUpdateStatus.charAt(0).toUpperCase() + this.leadUpdateStatus.slice(1)}`, `Lead has been moved from ${this.leadTitle} to ${this.leadUpdateStatus}`);

      if ((this.editCardStatus == 'hold' || this.editCardStatus == 'order' || this.leadUpdateStatus.toLowerCase() == LeadStatus.Hold.toLowerCase() || this.leadUpdateStatus.toLowerCase() == LeadStatus.Order.toLowerCase())) {
        if (this.newInvItems.length > 0)
          this.insertLeadHistoryAction(LeadHistoryAction.LeadStoneAdded, `Lead has been added ${this.newInvItems.length == 1 ? "stone" : "stones"}`, this.newInvItems.map(item => item.stoneId));

        if (this.modifiedAdisList.length > 0)
          this.insertLeadHistoryAction(LeadHistoryAction.AddDiscountChange, `Lead has been changed additional discount with ${this.modifiedAdisList.length == 1 ? "stone" : "stones"}`, this.modifiedAdisList);

        if (this.leadItem?.isVolDiscFlag != this.leadObj?.isVolDiscFlag)
          this.insertLeadHistoryAction(LeadHistoryAction.VolumeDiscountChange, `Lead has been changed volume discount to ${this.leadObj.isVolDiscFlag ? 'on' : 'off'}`);
      }


      this.isAddLead = action;
      let invIds = this.listInventoryItems.map(x => x.invId);
      this.leadObj.leadInventoryItems = this.listInventoryItems;
      if (this.leadUpdateStatus.toLowerCase() == LeadStatus.Rejected.toString().toLowerCase()) {
        await this.inventoryService.updateInventoryHoldUnHoldById(invIds, false);
        this.insertInvItemHistoryList(invIds, InvHistoryAction.UnHold, "Updated the stone to UnHold from the Lead Modal for stone");
      }

      if (this.leadTitle.toLowerCase() == LeadStatus.Proposal.toString().toLowerCase() && this.leadUpdateStatus.toLowerCase() == LeadStatus.Hold.toString().toLowerCase()) {
        if (isSeller && (tempLeadInventoryItems?.length == this.mySelection?.length || this.mySelection?.length === 0)) {
          await this.inventoryService.updateInventoryHoldUnHoldById(invIds, true);
          this.insertInvItemHistoryList(invIds, InvHistoryAction.Hold, "Updated the stone to Hold from the Lead Modal for stone");
        }
      }

      /* #region For addtional stone add via lead */
      if (this.leadTitle.toLowerCase() == LeadStatus.Hold.toString().toLowerCase() && this.leadUpdateStatus.toLowerCase() == LeadStatus.Hold.toString().toLowerCase()) {
        let unholdInvIds = this.listInventoryItems.filter(a => a.isHold == false).map(x => x.invId);
        if (unholdInvIds && unholdInvIds.length > 0) {
          if (isSeller) {
            await this.inventoryService.updateInventoryHoldUnHoldById(unholdInvIds, true);
            this.insertInvItemHistoryList(unholdInvIds, InvHistoryAction.Hold, "Updated the stone to Hold from the Lead Modal for stone");
          }

        }
      }

      /* #endregion */

      if (this.leadUpdateStatus.toLowerCase() == LeadStatus.Order.toString().toLowerCase() && this.listAcceptedInventoryItems.length == invitems.filter(z => !z.isRejected).length) {
        if (this.leadTitle.toLowerCase() == LeadStatus.Proposal.toString().toLowerCase()) {
          await this.inventoryService.updateInventoryHoldUnHoldById(invIds, true, true);
          this.insertInvItemHistoryList(invIds, InvHistoryAction.Hold, "Updated the stone to Hold from the Lead Modal for stone");
        }

        if (this.leadTitle.toLowerCase() == LeadStatus.Hold.toString().toLowerCase()) {
          await this.inventoryService.updateInventoryRapNetHoldById(invIds);
          this.insertInvItemHistoryList(invIds, InvHistoryAction.RapnetHold, "Updated the stone to RapnetHold from the Lead Modal for stone");
        }

        await this.inventoryService.updateInventoryStatusById(invIds, FrontStoneStatus.Order.toString());
        this.insertInvItemHistoryList(invIds, InvHistoryAction.Order, `Updated the stone status is ${FrontStoneStatus.Order.toString()} from the Lead Modal for stone`)

      }
      if (!action)
        this.closeLeadDialog();
      this.utilityService.showNotification("You have been updated lead successfully!");
      if (isNotify) {
        await this.sendMessage(this.leadObj, isSeller, isAccept);

        if (!isSeller) {
          let response = await this.notificationService.deleteMessagesByParamId(this.leadObj.id);
          if (response)
            this.notificationService.MessageLoadSub();
        }
      }
    }
  }

  public resetForm(form?: NgForm) {
    form?.reset();
    this.leadObj = new Lead();
    this.customerObj = new CustomerDNorm();
    this.brokerObj = new BrokerDNrom();
    this.gridDetailSummary = new LeadSummary();
    this.listInventoryItems = new Array<InvItem>();
    this.gridInventoryData = new Array<InvItem>();
    this.setGridInvData(this.listInventoryItems.length);
  }
  //#endregion

  //#region Dialog Methods

  public closeLeadDialog() {
    this.toggle.emit(true);
  }

  public async toggleAddLeadDialog() {
    this.gridInventoryData = [];
    this.listInventoryItems = [];
    this.leadObj = new Lead();
    this.customerObj = new CustomerDNorm();
    this.brokerObj = new BrokerDNrom();
    this.selectedCustomerItem = undefined as any;

    if (this.leadListInvInput && this.leadListInvInput.length > 0)
      this.loadInventory(this.leadListInvInput);

    this.loadLeadInventoryGrid(this.listInventoryItems);
    this.editCardStatus = LeadStatus.Proposal.toString().toLowerCase()
    await this.getGridConfiguration();
    this.isEditLead = false;

  }

  public async editLead(leadItem: Lead, action: boolean, leadTitle: string) {
    try {

      this.mySelection = [];
      this.leadTitle = leadTitle;
      this.editCardStatus = leadItem.leadStatus.toLowerCase();
      this.skip = 0;
      this.leadObj = new Lead();
      this.leadObj = JSON.parse(JSON.stringify(leadItem));
      this.leadObj.isVolDiscFlag = this.leadItem.isVolDiscFlag;

      let leadInvItems = new Array<InvItem>();
      if (this.leadObj.leadStatus.toLowerCase() != LeadStatus.Order.toString().toLowerCase()) {
        if (this.leadObj.leadStatus.toLowerCase() == LeadStatus.Rejected.toString().toLowerCase())
          leadInvItems = await this.leadService.getStonesByLeadId(leadItem.id, true);
        else if (this.leadObj.leadStatus.toLowerCase() == LeadStatus.Proposal.toString().toLowerCase()) {
          leadInvItems = await this.leadService.getStonesByLeadId(leadItem.id, false);
          this.gridDetailSummary = this.calculateSummaryAll(leadInvItems);
        }
        else if (this.leadObj.leadStatus.toLowerCase() == LeadStatus.Hold.toString().toLowerCase()) {
          leadInvItems = await this.leadService.getStonesByLeadId(leadItem.id, false);
          if (this.leadItem.platform.toLowerCase() == "online")
            this.gridDetailSummary = this.calculateSummaryAll(leadInvItems);
        }
        else
          leadInvItems = await this.leadService.getStonesByLeadId(leadItem.id, false);
      }
      else {
        leadInvItems = await this.leadService.getStonesByLeadId(leadItem.id);
        leadInvItems = leadInvItems.filter(x => !x.isRejected);
        this.isPrimarySupplier = leadInvItems.some((item) => item.primarySupplier.id != null);
      }
      if (leadInvItems)
        this.leadObj.leadInventoryItems = leadInvItems;
      this.customerObj = leadItem.customer;
      this.brokerObj = leadItem.broker;
      if (leadItem.broker.id) {
        this.selectedBrokerItem = { text: "", value: "" };
        this.selectedBrokerItem.text = this.brokerObj.name;
        this.selectedBrokerItem.value = this.brokerObj.id;
      }
      this.sellerObj = leadItem.seller;
      await this.getGridConfiguration();
      this.listInventoryItems = this.leadObj.leadInventoryItems;
      this.loadInventory(this.leadObj.leadInventoryItems);
      this.isEditLead = action;

      this.spinnerService.hide();
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }

  }

  //#endregion

  //#region Summary Calculation 
  public calculateSummaryAll(inventoryItems: InvItem[], isHardVol: boolean = false) {

    let leadSummaryLocal = new LeadSummary();
    leadSummaryLocal.totalCarat = inventoryItems.reduce((acc, cur) => acc + cur.weight, 0);
    leadSummaryLocal.totalAmount = inventoryItems.reduce((acc, cur) => acc + (cur.netAmount ? cur.netAmount : (cur.price.netAmount ? cur.price.netAmount : 0)), 0);
    leadSummaryLocal.totalRAP = inventoryItems.reduce((acc, cur) => acc + ((cur.price.rap ?? 0) * (cur.weight)), 0) ?? 0;
    leadSummaryLocal.totalPcs = inventoryItems.length;
    leadSummaryLocal.avgRap = leadSummaryLocal.totalCarat > 0 ? (leadSummaryLocal.totalRAP / leadSummaryLocal.totalCarat) ?? 0 : 0;

    leadSummaryLocal.avgDiscPer = leadSummaryLocal.totalRAP > 0 ? (((leadSummaryLocal.totalAmount / leadSummaryLocal.totalRAP) * 100) - 100) ?? 0 : 0;
    leadSummaryLocal.perCarat = leadSummaryLocal.totalCarat > 0 ? (leadSummaryLocal.totalAmount / leadSummaryLocal.totalCarat) ?? 0 : 0;

    //#region  VOW calculation
    let totalVowValue = Number((leadSummaryLocal.totalAmount + this.lastPurchase).toFixed(2));
    let vowDiscount = 0;
    if ((this.schemes && this.leadObj.isVolDiscFlag) || (this.schemes && this.leadObj.isVolDiscFlag && isHardVol)) {
      //This is online lead calculation
      let schemeDetail = this.schemes.details.find(c => c.from <= totalVowValue && totalVowValue <= c.to);
      if (schemeDetail) {
        vowDiscount = schemeDetail?.discount;
        if (this.leadItem && this.leadItem.platform && this.leadItem.platform == "online") {
          if (this.leadObj.leadSummary.totalVOWDiscPer && this.leadObj.leadSummary.totalVOWDiscPer < vowDiscount)
            vowDiscount = JSON.parse(JSON.stringify(this.leadObj.leadSummary.totalVOWDiscPer))
        }
      }

      leadSummaryLocal.totalVOWDiscPer = this.mySelection.length > 0 ? vowDiscount : 0;
      if (isHardVol)
        leadSummaryLocal.totalVOWDiscPer = vowDiscount;

      inventoryItems.forEach(x => {
        // this.calculateInvAmount(x);
        x.vowDiscount = vowDiscount;
        x.vowAmount = Number((this.utilityService.ConvertToFloatWithDecimal((((x.netAmount ?? 0)) * vowDiscount / 100))).toFixed(2));
        x.fAmount = Number(((x.netAmount ?? 0) - (x.vowAmount ?? 0)).toFixed(2));
        if (this.leadObj.platform.toLowerCase() == 'offline') {
          let discAmt = (x.netAmount ?? 0) - this.utilityService.ConvertToFloatWithDecimal(x.vowAmount ?? 0)
          if (this.brokerObj?.brokrage)
            x.brokerAmount = Number((((discAmt * (this.brokerObj?.brokrage / 100)) ?? 0) ?? 0).toFixed(2));
        }
      })
      if (this.brokerObj?.brokrage)
        leadSummaryLocal.totalBrokerAmount = inventoryItems.reduce((acc, cur) => acc + cur.brokerAmount, 0);

    }
    else {
      inventoryItems.forEach(x => {
        x.fAmount = Number(((x.netAmount ?? 0)).toFixed(2));
        x.vowDiscount = 0;
        x.vowAmount = 0;
        if (this.leadObj.platform.toLowerCase() == 'offline') {
          let discAmt = (x.netAmount ?? 0);
          if (this.brokerObj?.brokrage)
            x.brokerAmount = Number((((discAmt * (this.brokerObj?.brokrage / 100)) ?? 0) ?? 0).toFixed(2));
        }
      })
      if (this.brokerObj?.brokrage)
        leadSummaryLocal.totalBrokerAmount = inventoryItems.reduce((acc, cur) => acc + cur.brokerAmount, 0);
    }


    if (leadSummaryLocal.totalVOWDiscPer && leadSummaryLocal.totalVOWDiscPer > 0) {
      leadSummaryLocal.totalVOWDiscAmount = this.utilityService.ConvertToFloatWithDecimal((leadSummaryLocal.totalAmount * leadSummaryLocal.totalVOWDiscPer) / 100);
      leadSummaryLocal.totalPayableAmount = this.utilityService.ConvertToFloatWithDecimal(leadSummaryLocal.totalAmount - leadSummaryLocal.totalVOWDiscAmount);
      leadSummaryLocal.discPer = this.utilityService.ConvertToFloatWithDecimal(((leadSummaryLocal.totalPayableAmount / leadSummaryLocal.totalRAP) * 100) - 100);
      leadSummaryLocal.pricePerCarat = this.utilityService.ConvertToFloatWithDecimal(leadSummaryLocal.totalPayableAmount / leadSummaryLocal.totalCarat);

    }
    else {
      leadSummaryLocal.totalVOWDiscAmount = 0;
      leadSummaryLocal.totalPayableAmount = this.utilityService.ConvertToFloatWithDecimal(leadSummaryLocal.totalAmount);
    }
    return leadSummaryLocal;
  }
  //#endregion

  //#region Grid Config
  public openGridConfigDialog(): void {
    this.isGridConfig = true;
    this.gridName = "LeadInventoryGrid";
  }

  public setNewGridConfig(gridConfig: GridConfig) {
    try {
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
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async getGridConfiguration() {
    try {
      this.gridConfig = await this.configService.getGridConfig(this.fxCredential.id, "LeadInventory", "LeadInventoryGrid", this.gridPropertiesService.getLeadInventoryItems());
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
        this.gridMasterConfigResponse = await this.configService.getMasterGridConfig("LeadInventory", "LeadInventoryGrid");
        if (this.gridMasterConfigResponse)
          this.fields = this.gridMasterConfigResponse.gridDetail;
        else {

          this.fields = await this.gridPropertiesService.getLeadInventoryItems();

          if (this.isAdmin || this.leadObj.leadStatus.toLowerCase() == LeadStatus.Rejected.toString().toLowerCase())
            this.fields = this.fields.filter(c => c.title.toLowerCase() != "checkbox");

          if (this.leadObj.platform.toLowerCase() == "online")
            this.fields = this.fields.filter(c => c.propertyName.toLowerCase() != "adiscount" && c.propertyName.toLowerCase() != "fdiscount" && c.propertyName.toLowerCase() != 'brokeramount' && c.title.toLowerCase() != 'volume amount');
          else
            this.fields = this.fields.filter(c => c.title.toLowerCase() != 'vow amount');

          if (this.leadObj.leadStatus.toLowerCase() == LeadStatus.Order.toString().toLowerCase() || this.leadObj.leadStatus.toLowerCase() == LeadStatus.Delivered.toString().toLowerCase()) {
            this.fields.forEach(x => (x.propertyName.toLowerCase() == "isdelivered") ? x.isSelected = true : "")
          }

        }
      }



      // if (!this.leadObj.id)
      //   this.fields = this.fields.filter(c => c.propertyName.toLowerCase() != "adiscount" && c.propertyName.toLowerCase() != "fdiscount");

    }
    catch (error: any) {
      console.error(error);
      this.alertDialogService.show(error);
      this.spinnerService.hide();
    }
  }
  //#endregion

  //#region  Selection Lead Inventories
  public selectAllInventories(event: string) {
    if (event.toLowerCase() == 'checked')
      this.mySelection = this.listInventoryItems.filter(a => !a.isRejected).map(z => z.invId);
    else
      this.mySelection = [];

    this.setListOfAccpectedStones();
  }

  public onSelectChange() {
    this.setListOfAccpectedStones();
  }
  //#endregion

  //#region Delete Inventory
  public async openDeleteDialog() {
    if (this.leadObj.leadStatus.toString().toLowerCase() == LeadStatus.Proposal.toString().toLowerCase()) {
      let message: string = "";
      message = this.mySelection.length == 1 ? "Stone has been deleted successfully!" : "Stones have been deleted successfully!";
      this.alertDialogService.ConfirmYesNo("Are you sure you want to delete?", "Delete")
        .subscribe(async (res: any) => {
          if (res.flag) {
            if (this.leadObj.id) {
              if (this.leadObj.leadStatus.toLowerCase() == this.leadUpdateStatus.toLowerCase()) {
                let rejectedOfferItemAllList = new Array<LeadRejectedOfferItem>();

                let invRejectedList = new Array<InvItem>();
                if (this.mySelection && this.mySelection.length > 0 && this.mySelection.length != this.leadObj.leadInventoryItems.filter(x => !x.isRejected).length)
                  invRejectedList = this.leadObj.leadInventoryItems.filter(a => this.mySelection.includes(a.invId));
                else
                  invRejectedList = this.leadObj.leadInventoryItems;

                rejectedOfferItemAllList = this.mappingInvItemToLeadRejectedOfferItem(invRejectedList);
                let closeAction = {
                  isUpdate: true,
                  isClose: false,
                  invItem: rejectedOfferItemAllList.length > 0 ? rejectedOfferItemAllList : []
                }

                this.closeRejectedDialog(closeAction);
              }
              else
                return this.alertDialogService.show(`Kindly select lead status <b>${this.leadObj.leadStatus.toLowerCase()}</b> before remove inventory from lead.`);
            }
            else {
              this.mySelection.forEach(z => {
                let index = this.listInventoryItems.findIndex(a => a.invId == z);
                if (index >= 0)
                  this.listInventoryItems.splice(index, 1)
              })

              if (this.listInventoryItems.length == 0) {
                this.gridInventoryData = [];
                this.loadLeadInventoryGrid(this.listInventoryItems)
                this.mySelection = [];
              }
              else {
                this.loadInventory(this.listInventoryItems);
                this.listAcceptedInventoryItems = new Array<InvItem>();
                this.gridAcceptedSummary = this.calculateSummaryAll(this.listAcceptedInventoryItems);
              }
              this.utilityService.showNotification("Inventory has been deleted successfully!");

            }
          }
          else
            this.mySelection = [];
        });
    }
    else {

      if (this.leadUpdateStatus.toLowerCase() == LeadStatus.Order.toLowerCase()) {
        let invalidStoneIds = Array<string>();
        let leadInvItems = await this.leadService.getStonesByLeadId(this.leadObj.id, false);

        if (this.mySelection && this.mySelection.length > 0)
          invalidStoneIds = leadInvItems.filter(x => this.mySelection.includes(x.invId) && x.primarySupplier.id != null).map(a => a.stoneId);
        else
          invalidStoneIds = leadInvItems.filter(x => x.primarySupplier.id != null).map(a => a.stoneId);

        if (invalidStoneIds && invalidStoneIds.length > 0)
          return this.alertDialogService.show(`you can't reject the lead because <b>${invalidStoneIds.join(", ")}</b> has primary Supplier!`);
      }


      if (this.leadObj.platform.toLowerCase() == 'online') {
        if (this.mySelection.length == 0) {
          this.alertDialogService.show('Please select at least one stone for reject!');
          return;
        }

        this.alertDialogService.ConfirmYesNo("Are you sure you want to delete?", "Delete")
          .subscribe(async (res: any) => {
            if (res.flag) {
              this.spinnerService.show();
              await this.leadUpdatewithRejectedStones();
              this.spinnerService.show();
              await this.sendOrderRejectMailToCustomer();
              this.spinnerService.hide();
            }
          });
      }
      else {
        if (this.leadObj.leadStatus.toLowerCase() == this.leadUpdateStatus.toLowerCase()) {
          if (this.leadObj.id) {

            // if (this.leadObj.processDate)
            //   return this.alertDialogService.show(`you are not able to delete ,because selected order is already proceed!!`);

            this.isRejectedOffer = true;
          }
        }
        else
          return this.alertDialogService.show(`Kindly select lead status <b>${this.leadObj.leadStatus.toLowerCase()}</b> before remove inventory from lead.`);
      }
    }

  }

  public toggleRMReasonDialog() {
    this.isRMReason = !this.isRMReason;

  }

  public async submitReason() {
    try {
      if (this.removeReasonModel) {
        this.rejectedStone = new Array<RejectedStone>();
        this.spinnerService.show();
        let listOfAllLeadStones = await this.leadService.getStonesByLeadId(this.leadObj.id);
        this.mySelection.forEach(z => {
          let index = listOfAllLeadStones.findIndex(a => a.invId == z);
          if (index >= 0) {
            listOfAllLeadStones[index].removeStoneReason = this.removeReasonModel;
            listOfAllLeadStones[index].isRejected = true;
            let rejectedStoneObj = new RejectedStone();

            rejectedStoneObj.invId = listOfAllLeadStones[index].invId;
            rejectedStoneObj.stoneId = listOfAllLeadStones[index].stoneId;
            rejectedStoneObj.rfid = listOfAllLeadStones[index].stoneId;
            rejectedStoneObj.shape = listOfAllLeadStones[index].shape;
            rejectedStoneObj.weight = listOfAllLeadStones[index].weight;
            rejectedStoneObj.color = listOfAllLeadStones[index].color;
            rejectedStoneObj.clarity = listOfAllLeadStones[index].clarity;
            rejectedStoneObj.cut = listOfAllLeadStones[index].cut;
            rejectedStoneObj.polish = listOfAllLeadStones[index].polish;
            rejectedStoneObj.symmetry = listOfAllLeadStones[index].symmetry;
            rejectedStoneObj.fluorescence = listOfAllLeadStones[index].fluorescence;
            rejectedStoneObj.location = listOfAllLeadStones[index].location;
            rejectedStoneObj.certificateNo = listOfAllLeadStones[index].certificateNo;
            rejectedStoneObj.removeStoneReason = this.removeReasonModel;
            this.rejectedStone.push(rejectedStoneObj);
          }
        })

        this.leadObj.leadInventoryItems = listOfAllLeadStones;
        this.listInventoryItems = listOfAllLeadStones.filter(x => !x.isRejected);
        if (this.leadObj.leadStatus.toLowerCase() == LeadStatus.Hold.toString().toLowerCase()) {
          let leadStonesDNorm = new Array<InvItem>();
          this.gridAcceptedSummary = this.calculateSummaryAll(leadStonesDNorm);
        }

        if (this.leadObj.leadInventoryItems.length == this.leadObj.leadInventoryItems.filter(z => z.isRejected).length) {
          this.leadObj.leadStatus = LeadStatus.Rejected.toString();
          this.toggleRMReasonDialog();
          this.gridDetailSummary = this.calculateSummaryAll(listOfAllLeadStones);
          this.leadObj.leadSummary = new LeadSummary();
          this.leadObj.leadSummary.totalAmount = this.gridDetailSummary.totalAmount;
          this.leadObj.leadSummary.totalCarat = this.gridDetailSummary.totalCarat;
          this.leadObj.leadSummary.totalPcs = this.gridDetailSummary.totalPcs;
          this.leadObj.leadSummary.totalPayableAmount = this.gridDetailSummary.totalPayableAmount;
          this.isRejectedOffer = true;
          this.spinnerService.hide();
          return
        }
        else
          this.gridDetailSummary = this.calculateSummaryAll(this.listInventoryItems);

        this.leadObj.leadSummary = new LeadSummary();
        this.leadObj.leadSummary.totalAmount = this.gridDetailSummary.totalAmount;
        this.leadObj.leadSummary.totalCarat = this.gridDetailSummary.totalCarat;
        this.leadObj.leadSummary.totalPcs = this.gridDetailSummary.totalPcs;
        this.leadObj.leadSummary.totalPayableAmount = this.gridDetailSummary.totalPayableAmount;

        await this.leadUpdatewithRejectedStones();
      }
      this.spinnerService.hide();
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(error.error)
    }
  }

  public async leadUpdatewithRejectedStones() {
    let responseReturn: boolean = false;
    try {
      let cloneTitle = this.leadTitle;
      this.leadObj.leadStatus = this.leadUpdateStatus;
      let rejectedLeadInvItems = await this.leadService.getStonesByLeadId(this.leadObj.id, true);
      if (this.mySelection && this.mySelection.length > 0 && this.mySelection.length != this.leadObj.leadInventoryItems.filter(x => !x.isRejected).length) {
        this.leadObj.leadInventoryItems.filter(a => this.mySelection.includes(a.invId)).forEach(x => { x.isHold = false; x.isRejected = true, x.holdBy = "" });
        if (rejectedLeadInvItems && rejectedLeadInvItems.length > 0)
          this.leadObj.leadInventoryItems = [...this.leadObj.leadInventoryItems, ...rejectedLeadInvItems];
        this.leadObj.leadSummary = this.calculateSummaryAll(this.leadObj.leadInventoryItems.filter(x => !x.isRejected));
      }
      else {
        this.leadObj.leadStatus = LeadStatus.Rejected.toString();
        this.leadObj.leadInventoryItems.forEach(x => { x.isHold = false; x.isRejected = true, x.holdBy = "" });
        this.leadObj.leadInventoryItems = [...this.leadObj.leadInventoryItems, ...rejectedLeadInvItems];
        this.leadObj.leadSummary = this.calculateSummaryAll(this.leadObj.leadInventoryItems.filter(x => x.isRejected));
      }

      let responseLeadUpdate = await this.leadService.leadUpdate(this.leadObj);
      if (responseLeadUpdate) {
        this.listAcceptedInventoryItems = new Array<InvItem>();
        this.gridAcceptedSummary = this.calculateSummaryAll(this.listAcceptedInventoryItems);
        responseReturn = true;
        this.leadTitle = cloneTitle;
        this.leadItem = this.leadObj;

        if (this.leadTitle.toLowerCase() == LeadStatus.Order.toString().toLowerCase() || this.leadObj.platform?.toLowerCase() == 'online')
          this.gridDetailSummary = this.calculateSummaryAll(this.leadObj.leadInventoryItems.filter(x => !x.isRejected));

        if (this.leadTitle.toLowerCase() == LeadStatus.Hold.toString().toLowerCase() || this.leadTitle.toLowerCase() == LeadStatus.Order.toString().toLowerCase()) {
          let invIds: string[] = new Array<string>();

          if (rejectedLeadInvItems && rejectedLeadInvItems.length > 0)
            invIds = this.leadObj.leadInventoryItems.filter(z => !rejectedLeadInvItems.map(x => x.invId).includes(z.invId) && z.isRejected).map(x => x.invId);
          else
            invIds = this.leadObj.leadInventoryItems.filter(z => z.isRejected).map(x => x.invId);

          if (invIds && invIds.length > 0) {
            await this.inventoryService.updateInventoryHoldUnHoldById(invIds, false);
            this.insertInvItemHistoryList(invIds, InvHistoryAction.UnHold, "Updated the stone to UnHold from the Lead Modal for stone");
          }

          let selectedStoneIds: string[] = this.leadObj.leadInventoryItems.filter(z => invIds.includes(z.invId)).map(z => z.stoneId);
          let getAllInventoryDetails: InventoryItems[] = await this.inventoryService.getInventoryByStoneIds(selectedStoneIds);
          if (getAllInventoryDetails && getAllInventoryDetails.length > 0) {
            for (let index = 0; index < getAllInventoryDetails.length; index++) {
              let element = getAllInventoryDetails[index];
              element.isHold = false;
              if (!element.identity.id) {
                element.identity.id = this.fxCredential.id;
                element.identity.name = this.fxCredential.fullName;
                element.identity.type = this.fxCredential.origin;
              }
            }
            await this.pricingRequestService.updatePricingOnReleaseStones(getAllInventoryDetails, 'Lead Reject From Model');
          }

          if (this.leadTitle.toLowerCase() == LeadStatus.Order.toString().toLowerCase()) {
            let stockIds = []
            if (rejectedLeadInvItems && rejectedLeadInvItems.length > 0)
              stockIds = this.leadObj.leadInventoryItems.filter(z => !rejectedLeadInvItems.map(x => x.invId).includes(z.invId) && z.isRejected && z.status != StoneStatus.Transit.toString()).map(x => x.invId);
            else
              stockIds = this.leadObj.leadInventoryItems.filter(z => z.isRejected && z.status != StoneStatus.Transit.toString()).map(x => x.invId);

            // let stockIds = leadInvItems.filter(x => x.status != StoneStatus.Transit.toString()).map(x => x.invId);
            await this.inventoryService.updateInventoryStatusById(stockIds, FrontStoneStatus.Stock.toString());
            this.insertInvItemHistoryList(invIds, InvHistoryAction.Stock, `Updated the stone status is ${FrontStoneStatus.Stock.toString()} from the Lead Modal for stone`)
          }
        }

        let responseRejectedStone: RejectedStone[] = await this.rejectedStoneService.InsertList(this.rejectedStone);
        if (responseRejectedStone) {
          responseReturn = true;
          this.listInventoryItems = this.listInventoryItems.filter(z => !z.isRejected);
          if (this.listInventoryItems.length == 0) {
            this.closeLeadDialog();
            if (this.leadTitle.toLowerCase() != LeadStatus.Proposal.toString().toLowerCase())
              this.insertLeadHistoryAction(`${this.leadTitle.charAt(0).toUpperCase() + this.leadTitle.slice(1) + "ToRejected"}`, `Lead has been rejected with ${(rejectedLeadInvItems.length == 1 ? "stone " : "stones")} by ${this.leadObj.seller.name}`);
          }
          else {
            this.loadInventory(this.listInventoryItems);
            if (this.leadTitle.toLowerCase() != LeadStatus.Proposal.toString().toLowerCase())
              this.insertLeadHistoryAction(LeadHistoryAction.LeadStoneDeleted, `Lead has been removed with ${(rejectedLeadInvItems.length == 1 ? "stone " : "stones")} by ${this.leadObj.seller.name}`, this.leadObj.leadInventoryItems.filter(item => this.mySelection.includes(item.invId)).map((item) => item.stoneId));
            this.toggle.emit(false);
          }
        }
        this.mySelection = [];
        this.removeReasonModel = '';
      }
      else
        this.spinnerService.hide();

      this.leadTitle = cloneTitle;
      this.leadItem = this.leadObj;
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Something went wrong on reject lead, Please contact administrator!');
    }
    return responseReturn;
  }

  public async onClickOnStep(leadHistoryItem: LeadHistory) {
    this.leadHistoryData = this.leadHistoryData.map((item) => {
      if (item.id == leadHistoryItem.id)
        return { ...item, isSelected: true }
      else
        return { ...item, isSelected: false }

    })
    this.leadHistoryItem = leadHistoryItem;
  }

  public async closeRejectedDialog(event: any) {
    try {
      this.isRejectedOffer = event.isClose;

      if (this.isRejectedOffer)
        this.mySelection = new Array<string>();

      let cloneTitle = this.leadTitle;
      if (event.isUpdate) {
        this.spinnerService.show();
        let response = await this.leadUpdatewithRejectedStones();
        if (response) {
          let leadRejectedOfferObj = new LeadRejectedOffer();
          leadRejectedOfferObj.leadNo = this.leadObj.leadNo;
          leadRejectedOfferObj.customer = this.leadObj.customer;
          leadRejectedOfferObj.broker = this.leadObj.broker;
          leadRejectedOfferObj.seller = this.leadObj.seller;
          leadRejectedOfferObj.holdDate = this.leadObj.holdDate;
          leadRejectedOfferObj.rejectedInvItems = event.invItem;
          let insertOfferResponse = await this.leadService.leadRejectedOfferInsert(leadRejectedOfferObj);
          if (insertOfferResponse) {
            this.spinnerService.hide();
            leadRejectedOfferObj.id = insertOfferResponse;
            const stoneIds = leadRejectedOfferObj.rejectedInvItems.map((item) => item.stoneId)
            await this.sendRejectedLeadMessage(leadRejectedOfferObj);
            this.leadTitle = cloneTitle;
            this.leadItem = this.leadObj;

          }
          else
            this.spinnerService.hide();
          this.utilityService.showNotification("Inventory has been deleted successfully!");
        }
        else
          this.spinnerService.hide();
        this.leadTitle = cloneTitle;
        this.leadItem = this.leadObj;

      }
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }

  }

  public async updateInventoryStoneRemoveReason(stoneIds: string[], reason: string) {
    try {
      let fetchInventoryItems: InventoryItems[] = await this.inventoryService.getInventoryByStoneIds(stoneIds);
      let updatedReasonArray: InventoryItems[] = [];
      for (let index = 0; index < fetchInventoryItems.length; index++) {
        const element = fetchInventoryItems[index];
        if ((element.reasonToRemove == null) || (element.reasonToRemove.toLowerCase() != reason.toLowerCase())) {
          element.reasonToRemove = reason;
          updatedReasonArray.push(element);
        }
      }
      if (updatedReasonArray.length > 0)
        return await this.inventoryService.updateOnlyInventoryList(updatedReasonArray) as any;
      else
        return true;
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }


  //#endregion

  //#region  Editable Customer
  public toggleEditCustomer() {
    this.isEditableCustomer = true;
  }
  // #endregion

  //#region Editablebrokrage
  public toggleEditBrokerage(isUpdate = true) {
    this.isEditableBrokerage = !this.isEditableBrokerage;


    if (this.isEditableBrokerage)
      this.brokerageValue = JSON.parse(JSON.stringify(this.brokerObj?.brokrage) ?? 0) ?? 0;
    else
      this.brokerageValue = 0;
    if (this.brokerageValue > 0) {
      this.gridDetailSummary = this.calculateSummaryAll(this.listInventoryItems);
      if (this.listAcceptedInventoryItems.length > 0)
        this.gridAcceptedSummary = this.calculateSummaryAll(this.listAcceptedInventoryItems);
    }
    else
      this.listInventoryItems.forEach(x => {
        x.brokerAmount = 0;
      })

    if (!isUpdate && this.selectedBrokerItem) {
      this.brokerObj = this.leadObj.broker;
      this.selectedBrokerItem = { text: "", value: "" };
      this.selectedBrokerItem.text = this.brokerObj.name;
      this.selectedBrokerItem.value = this.brokerObj.id;
    }

  }


  public async changeBrokerage(isDelete: boolean = false) {

    this.alertDialogService.ConfirmYesNo(`Do you want to ${isDelete ? 'delete' : this.leadObj.broker.id ? 'update' : 'add'} from the lead?`, "Lead Broker")
      .subscribe(async (res: any) => {
        if (res.flag) {
          try {
            this.spinnerService.show();
            let cloneBrokerObj = JSON.parse(JSON.stringify(this.brokerObj));
            this.brokerObj.brokrage = Number(this.brokerageValue);

            if (this.leadObj.id) {
              if (!isDelete) {
                this.leadObj.broker = cloneBrokerObj
                this.leadObj.broker.brokrage = Number(this.brokerageValue);
              }
              else
                this.leadObj.broker = new BrokerDNrom();

              let response = await this.leadService.leadUpdate(this.leadObj);
              if (response) {
                // Remaing this.insertLeadHistoryAction(this.leadObj.id, "Updated")
                this.brokerObj = this.leadObj.broker;
                if (isDelete) {
                  this.insertLeadHistoryAction(LeadHistoryAction.BrokerDeleted, `Lead has been deleted broker by ${this.leadObj.seller.name}`);
                  this.selectedBrokerItem = { text: "", value: "" };
                }
                else {
                  if (this.leadObj.broker.id)
                    this.insertLeadHistoryAction(LeadHistoryAction.BrokerUpdated, `Lead has been updated broker by ${this.leadObj.seller.name}`);
                  else
                    this.insertLeadHistoryAction(LeadHistoryAction.BrokerAdded, `Lead has been added broker by ${this.leadObj.seller.name}`);
                }
                if (this.leadObj.broker.brokrage > 0) {
                  this.gridDetailSummary = this.calculateSummaryAll(this.listInventoryItems);
                  if (this.listAcceptedInventoryItems.length > 0)
                    this.gridAcceptedSummary = this.calculateSummaryAll(this.listAcceptedInventoryItems);
                }
                else
                  this.listInventoryItems.forEach(x => {
                    x.brokerAmount = 0;
                  })

                this.loadInventory(this.listInventoryItems);
                this.spinnerService.hide();
                this.utilityService.showNotification(`Brokerage ${isDelete ? 'deleted' : 'updated'} successfully!`);
              }
              else {
                this.leadObj.broker = cloneBrokerObj;
                this.brokerObj = cloneBrokerObj;
                this.brokerObj.brokrage = cloneBrokerObj.brokrage;

              }
              this.spinnerService.hide();

            }
            if (!isDelete)
              this.toggleEditBrokerage();
          }
          catch (error: any) {
            console.error(error);
            this.spinnerService.hide();
            this.alertDialogService.show(error.error)
          }
        }
        else
          this.isEditableBrokerage = false;
      });
  }
  //#endregion

  //#region SplitLead
  public setListOfAccpectedStones() {
    this.listAcceptedInventoryItems = Array<InvItem>();
    this.listAcceptedInventoryItems = this.listInventoryItems.filter(o => this.mySelection.some((a) => a == o.invId));
    this.gridAcceptedSummary = new LeadSummary();

    if (this.listAcceptedInventoryItems.length >= 0)
      this.gridAcceptedSummary = this.calculateSummaryAll(this.listAcceptedInventoryItems);
  }


  public async submitSplitLead() {

    let exist: boolean = this.listInventoryItems.some(x => x.aDiscount < 0);
    let leadInventoryItemsTOUpdate: InvItem[] = await this.leadService.getStonesByLeadId(this.leadObj.id);

    if (this.visibleRejectedStone) {
      this.closeLeadDialog();
      return;
    }

    if (this.leadUpdateStatus.toLowerCase() == LeadStatus.Rejected.toString().toLowerCase()) {
      if (this.leadObj.processDate)
        return this.alertDialogService.show("you can't reject the lead because it is already in process");
    }

    if (this.leadUpdateStatus.toLowerCase() == LeadStatus.Order.toString().toLowerCase() || (this.leadObj.leadStatus.toLowerCase() == LeadStatus.Order.toString().toLowerCase())) {
      if (this.leadObj.leadAdminFlag == false)
        return this.alertDialogService.show("Kindly, wait for admin approval about additional discount");
      if (this.leadObj.changePartyId && this.leadObj.leadChangePartyFlag == null)
        return this.alertDialogService.show("Kindly, wait for admin approval about party details changes");
    }

    if (this.leadObj.platform?.toLowerCase() == 'online') {
      if (this.leadObj.leadStatus?.toLowerCase() == this.leadUpdateStatus.toLowerCase()) {
        this.closeLeadDialog();
        return;
      }

      this.mySelection = this.leadObj.leadInventoryItems.filter(z => z.isRejected == false).map(a => a.invId);

      if (this.leadUpdateStatus.toLowerCase() != LeadStatus.Rejected.toString().toLowerCase()) {
        var soldStoneIds = this.leadObj.leadInventoryItems.filter(x => !x.isRejected && x.status == StoneStatus.Sold.toString()).map(c => c.stoneId);
        if (soldStoneIds && soldStoneIds.length > 0) {
          this.alertDialogService.show(`${soldStoneIds.length == 1 ? `<b>` + soldStoneIds.toString() + `</b> Stone is` : `<b>` + soldStoneIds.join(", ") + `</b> Stones are`}  Sold, so you can not procced further.`);
          return;
        }
      }

      if (this.leadUpdateStatus.toLowerCase() == LeadStatus.Rejected.toString().toLowerCase()) {

        let issExistProcessDate = await this.leadService.getProcessDateByLeadNo(this.leadObj.leadNo);
        if (!issExistProcessDate)
          await this.openDeleteDialog();
        else
          this.alertDialogService.show("you can't reject the lead because it is already in process")
      }

      else if (this.leadUpdateStatus.toLowerCase() == LeadStatus.Order.toString().toLowerCase()) {
        this.alertDialogService.ConfirmYesNo('Are you sure you want to approve?', "Lead Approve")
          .subscribe(async (res: any) => {
            if (res.flag) {
              try {
                this.spinnerService.show();
                this.leadObj.leadStatus = LeadStatus.Order.toString();
                this.leadObj.orderDate = this.utilityService.setLiveUTCDate();

                let response = await this.leadService.leadUpdate(this.leadObj);
                if (response) {
                  this.utilityService.showNotification('Lead approved successfully!');

                  if (this.leadTitle.toLowerCase() == LeadStatus.Proposal.toString().toLowerCase()) {
                    await this.inventoryService.updateInventoryHoldUnHoldById(this.mySelection, true, true);
                    this.insertInvItemHistoryList(this.mySelection, InvHistoryAction.Hold, "Updated the stone to Hold from the Lead Modal for stone");
                  }

                  if (this.leadTitle.toLowerCase() == LeadStatus.Hold.toString().toLowerCase()) {
                    await this.inventoryService.updateInventoryRapNetHoldById(this.mySelection);
                    this.insertInvItemHistoryList(this.mySelection, InvHistoryAction.RapnetHold, "Updated the stone to RapnetHold from the Lead Modal for stone")
                  }

                  await this.inventoryService.updateInventoryStatusById(this.mySelection, FrontStoneStatus.Order.toString());
                  this.insertInvItemHistoryList(this.mySelection, InvHistoryAction.Order, `Updated the stone status is ${FrontStoneStatus.Order.toString()} from the Lead Modal for stone`)
                  await this.sendOrderApproveMailToCustomer();
                  this.closeLeadDialog();
                  this.spinnerService.hide();
                }
                else {
                  console.error(response);
                  this.alertDialogService.show('Lead not approve, Try again later!');
                  this.spinnerService.hide();
                }
              }
              catch (error: any) {
                console.error(error);
                this.spinnerService.hide();
                this.alertDialogService.show('Lead not approve, Please contact administrator!');
              }
            }
          });
      }
      return;
    }

    if (exist && (this.leadObj.leadAdminFlag == null || this.leadObj.leadAdminFlag == false)) {
      this.alertDialogService.ConfirmYesNo("Do you want to request to admin about the lead?", "Lead")
        .subscribe(async (res: any) => {
          if (res.flag) {
            this.leadObj.leadAdminFlag = false;
            await this.updateLeadCommonMethod(false, true);
          }
        });
      return;

    }

    if (this.leadUpdateStatus == LeadStatus.Order.toString()) {
      if (this.listAcceptedInventoryItems.length == 0)
        this.listAcceptedInventoryItems = this.listInventoryItems;
    }

    if (this.listAcceptedInventoryItems.length > 0) {

      let confirmationMessage: string = "";
      let onlyApprove: boolean = false;
      if (this.listAcceptedInventoryItems.length == this.listInventoryItems.length)
        onlyApprove = true;
      if (this.leadUpdateStatus.toLowerCase() != LeadStatus.Rejected.toLowerCase()) {
        if (onlyApprove)
          if (this.leadTitle.toLowerCase() != this.leadUpdateStatus.toLowerCase())
            confirmationMessage = `Are you sure you want to ${this.leadUpdateStatus}?`;
          else
            confirmationMessage = `Are you sure you want to Update Lead?`;

        else
          if (this.leadTitle.toLowerCase() != this.leadUpdateStatus.toLowerCase())
            confirmationMessage = `Are you want to generate split an order for <b>${this.listAcceptedInventoryItems.map(x => x.stoneId).join(", ")}</b> stones?`;
          else
            confirmationMessage = `Are you sure you want to Update Lead?`;
      }
      else
        confirmationMessage = `Are you sure you want to Reject Lead?`;

      this.alertDialogService.ConfirmYesNo(confirmationMessage, "Lead")
        .subscribe(async (res: any) => {
          if (res.flag) {
            if (this.leadUpdateStatus.toLowerCase() == LeadStatus.Rejected.toString().toLowerCase()) {
              this.spinnerService.hide();
              let issExistProcessDate = await this.leadService.getProcessDateByLeadNo(this.leadObj.leadNo);
              if (!issExistProcessDate) {
                this.isRejectedOffer = true;
                this.mySelection = this.listInventoryItems.map(x => x.invId);
              }
              else
                this.alertDialogService.show("you can't reject the lead because it is already in process")
            }
            else {
              if (!onlyApprove) {
                if (this.leadTitle.toLowerCase() == this.leadUpdateStatus.toLowerCase()) {
                  this.leadObj.leadStatus = this.leadUpdateStatus.toString();
                  this.leadObj.leadInventoryItems = this.listInventoryItems;
                  if (this.leadUpdateStatus.toLowerCase() != LeadStatus.Rejected.toString().toLowerCase()) {
                    var soldStoneIds = this.leadObj.leadInventoryItems.filter(x => !x.isRejected && x.status == StoneStatus.Sold.toString()).map(c => c.stoneId);
                    if (soldStoneIds && soldStoneIds.length > 0) {
                      this.alertDialogService.show(`${soldStoneIds.length == 1 ? `<b>` + soldStoneIds.toString() + `</b> Stone is` : `<b>` + soldStoneIds.join(", ") + `</b> Stones are`}  Sold, so you can not procced further.`);
                      return;
                    }
                  }
                  await this.updateLeadCommonMethod();
                }
                else {
                  this.gridAcceptedSummary = this.calculateSummaryAll(this.listAcceptedInventoryItems);
                  let leadNewObj = new Lead();
                  leadNewObj.customer = this.leadObj.customer;
                  leadNewObj.broker = this.leadObj.broker;
                  leadNewObj.seller = this.leadObj.seller;
                  leadNewObj.isVolDiscFlag = this.leadObj.isVolDiscFlag;
                  leadNewObj.leadStatus = LeadStatus.Order.toString();
                  leadNewObj.leadInventoryItems = this.listAcceptedInventoryItems;
                  leadNewObj.leadSummary = this.gridAcceptedSummary;
                  leadNewObj.orderDate = this.utilityService.setLiveUTCDate();

                  var soldStoneIds = leadNewObj.leadInventoryItems.filter(x => !x.isRejected && x.status == StoneStatus.Sold.toString()).map(c => c.stoneId);
                  if (soldStoneIds && soldStoneIds.length > 0) {
                    this.alertDialogService.show(`${soldStoneIds.length == 1 ? `<b>` + soldStoneIds.toString() + `</b> Stone is` : `<b>` + soldStoneIds.join(", ") + `</b> Stones are`}  Sold, so you can not procced further.`);
                    return;
                  }

                  if (this.fxCredential.fullName)
                    this.leadObj.createdBy = this.fxCredential.fullName;

                  let response = await this.leadService.leadInsert(leadNewObj);

                  if (response == "Duplicate")
                    return this.alertDialogService.show("Duplicate lead detected. A lead with the same details already exists");

                  if (response) {
                    let acceptedInvIds = this.listAcceptedInventoryItems.map(x => x.invId);
                    if (leadNewObj.leadStatus.toLowerCase() == LeadStatus.Order.toString().toLowerCase()) {
                      await this.inventoryService.updateInventoryStatusById(acceptedInvIds, FrontStoneStatus.Order.toString());
                      this.insertInvItemHistoryList(acceptedInvIds, InvHistoryAction.Order, `Updated the stone status is ${FrontStoneStatus.Order.toString()} from the Lead Modal for stone`)
                    }

                    if (leadNewObj.leadStatus.toLowerCase() == LeadStatus.Order.toString().toLowerCase()) {
                      await this.inventoryService.updateInventoryRapNetHoldById(acceptedInvIds);
                      this.insertInvItemHistoryList(this.mySelection, InvHistoryAction.RapnetHold, "Updated the stone to RapnetHold from the Lead Modal for stone")
                    }
                    this.listInventoryItems = leadInventoryItemsTOUpdate.filter(o => !this.listAcceptedInventoryItems.some((a) => a.invId == o.invId));
                    await this.updateLeadCommonMethod();
                  }
                }

              }
              else {
                this.leadObj.leadStatus = this.leadUpdateStatus.toString();
                this.leadObj.leadInventoryItems = this.listInventoryItems;

                if (this.leadUpdateStatus.toLowerCase() != LeadStatus.Rejected.toString().toLowerCase()) {
                  var soldStoneIds = this.leadObj.leadInventoryItems.filter(x => !x.isRejected && x.status == StoneStatus.Sold.toString()).map(c => c.stoneId);
                  if (soldStoneIds && soldStoneIds.length > 0) {
                    this.alertDialogService.show(`${soldStoneIds.length == 1 ? `<b>` + soldStoneIds.toString() + `</b> Stone is` : `<b>` + soldStoneIds.join(", ") + `</b> Stones are`}  Sold, so you can not procced further.`);
                    return;
                  }
                }
                await this.updateLeadCommonMethod();
              }
            }
          }
          else {
            this.mySelection = [];
            this.listAcceptedInventoryItems = new Array<InvItem>();
            this.gridAcceptedSummary = this.calculateSummaryAll(this.listAcceptedInventoryItems);
          }
        })
    }
    else {

      let confirmationMessage: string = "Do you want to update lead";
      if (this.leadUpdateStatus.toLowerCase() == LeadStatus.Rejected.toLowerCase())
        confirmationMessage = `Are you sure you want to Reject Lead?`;

      this.alertDialogService.ConfirmYesNo(confirmationMessage, "Lead")
        .subscribe(async (res: any) => {
          if (res.flag) {
            if (this.leadUpdateStatus.toLowerCase() == LeadStatus.Rejected.toString().toLowerCase()) {
              this.spinnerService.hide();
              let issExistProcessDate = await this.leadService.getProcessDateByLeadNo(this.leadObj.leadNo);
              if (!issExistProcessDate) {
                this.isRejectedOffer = true;
                this.mySelection = this.listInventoryItems.map(x => x.invId);
              }
              else
                this.alertDialogService.show("you can't reject the lead because it is already in process")
            }
            else
              await this.updateLeadCommonMethod();

          }
        });
    }
  }
  //#endregion

  //#region Order Approve Email
  public async confirmMailSend() {
    this.alertDialogService.ConfirmYesNo('Are you sure you want to send order approve mail to customer?', "Order Mail")
      .subscribe(async (res: any) => {
        if (res.flag) {
          this.spinnerService.show();
          await this.sendOrderApproveMailToCustomer();
          this.spinnerService.hide();
        }
      });
  }

  //insert invLogItem

  public async insertInvItemHistoryList(invIds: string[], action: string, desc: string) {
    try {
      var invHistorys: InvHistory[] = [];
      this.leadObj?.leadInventoryItems.map((item) => {
        if (invIds.includes(item.stoneId) || invIds.includes(item.invId)) {
          const invHistory = new InvHistory()
          invHistory.stoneId = item.stoneId;
          invHistory.invId = item.invId;
          invHistory.action = action;
          invHistory.userName = this.fxCredential.fullName;
          invHistory.price = item.price;
          invHistory.supplier = item.supplier
          invHistory.description = desc + " " + item.stoneId;
          invHistorys.push(invHistory);
        }
      })
      if (invHistorys.length > 0)
        await this.invHistoryService.InsertInvHistoryList(invHistorys);
    }
    catch (error: any) {
      this.alertDialogService.show(error.error);
    }
  }

  public async sendOrderApproveMailToCustomer() {
    try {
      let req: LeadOrderMailConfig = new LeadOrderMailConfig();
      req.leadId = this.leadObj.id;
      let systemUser = await this.systemUserService.getSystemUserById(this.leadObj.seller.id);
      if (systemUser && systemUser.companyName) {
        req.companyName = this.utilityService.getFullFormOfCompanyName(systemUser.companyName);
        req.logoPath = this.utilityService.getLogoPathForMail(systemUser.companyName);

        let res = await this.mailService.sendOrderApproveMail(req);
        if (res && res.isSuccess)
          this.utilityService.showNotification('Order approve mail sent successfully!');
        else {
          if (res.errorMessage)
            console.error(res.errorMessage);

          if (res.message)
            this.alertDialogService.show(res.message);
          else
            this.alertDialogService.show('Order approve mail not send to customer, Please contact administrator!');
        }
      }
      else
        this.alertDialogService.show('Seller Company not set, Please set company from system user to send Email.');

    }
    catch (error: any) {
      console.error(error);
      this.alertDialogService.show('Order approve mail not send to customer, Please contact administrator!');
      this.spinnerService.hide();
    }
  }

  public async sendOrderRejectMailToCustomer() {
    try {
      let req: LeadOrderMailConfig = new LeadOrderMailConfig();
      req.leadId = this.leadObj.id;
      let systemUser = await this.systemUserService.getSystemUserById(this.leadObj.seller.id);
      if (systemUser && systemUser.companyName) {
        req.companyName = this.utilityService.getFullFormOfCompanyName(systemUser.companyName);
        req.logoPath = this.utilityService.getLogoPathForMail(systemUser.companyName);

        let res = await this.mailService.sendOrderRejectedMail(req);
        if (res && res.isSuccess)
          this.utilityService.showNotification('Order rejection mail sent successfully!');
        else {
          if (res.errorMessage)
            console.error(res.errorMessage);

          if (res.message)
            this.alertDialogService.show(res.message);
          else
            this.alertDialogService.show('Order rejection mail not send to customer, Please contact administrator!');
        }
      }
      else
        this.alertDialogService.show('Seller Company not set, Please set company from system user to send Email.');

    }
    catch (error: any) {
      console.error(error);
      this.alertDialogService.show('Order approve mail not send to customer, Please contact administrator!');
      this.spinnerService.hide();
    }
  }
  //#endregion

  //#region toggle Rejected Stone List
  public async toggleRejectedStone() {
    this.visibleRejectedStone = !this.visibleRejectedStone;

    let leadInvItems = new Array<InvItem>();
    if (this.visibleRejectedStone) {
      leadInvItems = await this.leadService.getStonesByLeadId(this.leadObj.id, " " as any);
      leadInvItems = leadInvItems.filter(o => o.isRejected);
      if (leadInvItems.length > 0)
        this.fields = this.fields.filter(o => o.title.toLowerCase() != 'checkbox' && o.propertyName.toLowerCase() != 'adiscount');
    }
    else {
      leadInvItems = await this.leadService.getStonesByLeadId(this.leadObj.id, " " as any);
      leadInvItems = leadInvItems.filter(o => !o.isRejected);
      if (leadInvItems.length > 0)
        this.fields = this.gridPropertiesService.getLeadInventoryItems();
    }

    if (this.visibleRejectedStone) {
      if (leadInvItems.length > 0) {
        this.leadObj.leadInventoryItems = leadInvItems;
        this.listInventoryItems = this.leadObj.leadInventoryItems;
        this.loadInventory(this.leadObj.leadInventoryItems);
      }
      else {
        this.visibleRejectedStone = false;
        this.alertDialogService.show('There is no rejected stone for this lead.');
      }
    }
    else {
      this.leadObj.leadInventoryItems = leadInvItems;
      this.listInventoryItems = this.leadObj.leadInventoryItems;
      this.loadInventory(this.leadObj.leadInventoryItems);
      this.visibleRejectedStone = false;
    }

  }
  //#endregion

  //#region Lead title
  public getTitle(field: string) {
    return this.fields.find(f => f.propertyName.toLowerCase() == field.toLowerCase())?.title ?? field;
  }

  //#endregion

  //#region Get Schemes
  public async getSchemes(isOnline: boolean) {
    return await this.schemeService.getOnlineSchemeAsync(isOnline);
  }
  //#endregion

  //#region Select Inv from Excel
  public async onSelectInvFromExcelFile(event: Event) {
    try {
      let acceptedFiles: string[] = []
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
        let fileReader = new FileReader();
        this.spinnerService.show();
        fileReader.onload = async (e) => {

          var arrayBuffer: any = fileReader.result;
          let data = new Uint8Array(arrayBuffer);
          let arr = new Array();

          for (let i = 0; i != data.length; ++i)
            arr[i] = String.fromCharCode(data[i]);

          let workbook = xlsx.read(arr.join(""), { type: "binary" });
          let Heading = ["stoneNo", "disc"]
          let inventoryFetchExcelItems = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: Heading, }) as any;
          let finalInventoryItems: Array<{ stoneNo: string, disc: number }> = new Array<{ stoneNo: string, disc: number }>();

          for (let index = 0; index < inventoryFetchExcelItems.length; index++) {
            let element = inventoryFetchExcelItems[index];
            if (element.hasOwnProperty("stoneNo")) {
              if (element.stoneNo)
                element.stoneNo = element.stoneNo.toLowerCase();
              finalInventoryItems.push(element);
            }
          }

          if (finalInventoryItems && finalInventoryItems.length > 0) {

            let notFoundStoneIds = finalInventoryItems.filter(z => !this.listInventoryItems.map(a => a.stoneId.toLowerCase()).includes(z.stoneNo.toLowerCase())).map(x => x.stoneNo);
            let notFoundInvItems: Array<InvItem> = new Array<InvItem>();
            this.mySelection = this.listInventoryItems.filter(o => finalInventoryItems.some((a) => a.stoneNo.includes(o.stoneId.toLowerCase()))).map(o => o.invId);
            // if (this.mySelection.length > 0) {
            this.listInventoryItems.forEach(x => {
              let findDisPerStone = finalInventoryItems.filter(z => z.stoneNo == x.stoneId.toLowerCase());
              if (findDisPerStone.length > 0) {
                x.aDiscount = findDisPerStone[0].disc - Number(x.price.discount);
                if (x.aDiscount != 0)
                  this.calculateInvAmount(x);
              }
            })

            let holdStones: Array<string> = new Array<string>();
            if (notFoundStoneIds.length > 0) {
              let fetchData: InvItem[] = await this.inventoryService.getInventoryDNormsByStones(notFoundStoneIds, " " as any);
              if (fetchData && fetchData.length > 0) {

                for (let index = 0; index < fetchData.length; index++) {
                  const element: InvItem = fetchData[index];
                  if (element.isHold) {
                    if (this.leadObj.leadStatus.toLowerCase() == LeadStatus.Proposal.toLowerCase()) {
                      element.aDiscount = (finalInventoryItems.find(x => x.stoneNo.toLowerCase() == element.stoneId.toLowerCase())?.disc ?? 0) - Number(element.price.discount);
                      if (element.aDiscount != 0)
                        this.calculateInvAmount(element)
                      notFoundInvItems.push(element);
                    }
                    else
                      holdStones.push(element.stoneId);
                  }
                  else {
                    element.aDiscount = (finalInventoryItems.find(x => x.stoneNo.toLowerCase() == element.stoneId.toLowerCase())?.disc ?? 0) - Number(element.price.discount);
                    if (element.aDiscount != 0)
                      this.calculateInvAmount(element)
                    notFoundInvItems.push(element);
                  }
                }

                if (holdStones.length > 0)
                  this.alertDialogService.show(`${holdStones.length == 1 ? holdStones.toString() + ' Stone is' : holdStones.join(", ") + ' Stones are'} already in hold.`);

                this.listInventoryItems = [...this.listInventoryItems, ...notFoundInvItems];
                notFoundInvItems.forEach(x => { this.newInvItems.push(x); });

                this.loadInventory(this.listInventoryItems);

                if (fetchData.length != notFoundStoneIds.length) {
                  if (notFoundStoneIds[0].toLowerCase() != finalInventoryItems[0].stoneNo.toLowerCase())
                    this.alertDialogService.show(`${notFoundStoneIds.length == 1 ? notFoundStoneIds.toString() + ' Stone is' : notFoundStoneIds.join(", ") + ' Stones are'} not found in inventory for selected file.`);
                }


              }
              else {
                if (notFoundStoneIds[0].toLowerCase() != finalInventoryItems[0].stoneNo.toLowerCase())
                  this.alertDialogService.show(`${notFoundStoneIds.length == 1 ? notFoundStoneIds.toString() + ' Stone is' : notFoundStoneIds.join(", ") + ' Stones are'} not found in inventory for selected file.`);
              }
            }

            this.listAcceptedInventoryItems = Array<InvItem>();
            this.listAcceptedInventoryItems = this.listInventoryItems.filter(o => this.mySelection.some((a) => a == o.invId));
            if (this.listAcceptedInventoryItems.length > 0)
              this.gridAcceptedSummary = this.calculateSummaryAll(this.listAcceptedInventoryItems);

            // }
            // else
            //   this.alertDialogService.show(`No stone found in the selected file.`);
          }

          this.spinnerService.hide();
        }

        fileReader.readAsArrayBuffer(file);
      }
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(error.error)
    }
  }
  //#endregion

  //#region Accept Or Reject lead By admin
  public AcceptOrRejectLeadByAdmin(action: string) {

    let actionType: string = "";

    if (action == 'approve')
      actionType = "Approve";
    else
      actionType = LeadStatus.Rejected.toString();

    let confirmationMessage = `Are you sure you want to ${actionType} a lead Offer?`;

    this.alertDialogService.ConfirmYesNo(confirmationMessage, "Lead")
      .subscribe(async (res: any) => {
        if (res.flag) {
          let leadInventoryItemsTOUpdate: InvItem[] = await this.leadService.getStonesByLeadId(this.leadObj.id);
          if (action == LeadStatus.Rejected.toString().toLowerCase()) {
            leadInventoryItemsTOUpdate.forEach(o => { o.aDiscount = 0 });
            this.leadObj.leadInventoryItems = leadInventoryItemsTOUpdate;
            this.leadObj.leadAdminFlag = null as any;
          }
          else {
            this.leadObj.leadAdminFlag = true;
            this.leadObj.leadInventoryItems = leadInventoryItemsTOUpdate;
          }
          let isAccepte = (action == 'approve') ? true : false;
          this.listInventoryItems = leadInventoryItemsTOUpdate;
          await this.updateLeadCommonMethod(false, true, false, isAccepte);
        }
      })
  }
  //#endregion

  //#region Export Excel

  public onExcelToggle(): void {
    this.showExcelOption = !this.showExcelOption;
  }
  public async exportToExcel() {
    this.excelFile = [];

    if (this.excelOption == 'selected') {
      if (this.mySelection.length == 0) {
        this.alertDialogService.show('Select at least one stone for export!');
        this.showExcelOption = false;
        return;
      }
    }

    this.spinnerService.show();
    let selectedInvIds = new Array<string>();

    if (this.excelOption == 'selected')
      selectedInvIds = this.listInventoryItems.filter(z => this.mySelection.includes(z.invId) && !z.isRejected).map(z => z.invId);
    else
      selectedInvIds = this.listInventoryItems.filter(z => !z.isRejected).map(z => z.invId);

    if (selectedInvIds && selectedInvIds.length > 0) {
      await this.exportExcelNew(this.leadObj.id, this.leadObj.leadNo, selectedInvIds);
      this.excelOption = null;
      this.showExcelOption = false;
      this.mySelection = [];
      this.spinnerService.hide();
    }
    else {
      this.alertDialogService.show('No Data Found!');
      this.spinnerService.hide();
    }
  }

  public async exportExcelNew(leadId: string, leadnNo: number, invIds: Array<string>) {
    try {

      let invExcel: LeadInvExport = new LeadInvExport();
      invExcel.leadId = leadId;
      invExcel.leadNo = leadnNo;
      invExcel.invIds = invIds;

      let response = await this.leadService.downloadLeadInvItemsExcel(invExcel);
      if (response) {
        var downloadURL = window.URL.createObjectURL(response);
        var link = document.createElement('a');
        link.href = downloadURL;
        link.download = `${this.utilityService.exportFileName(this.leadObj.leadNo.toString())}`;
        link.click();
      }
    } catch (error: any) {
      this.alertDialogService.show("something went wrong in export Excel, please try again or contact administrator");
      this.spinnerService.hide();
    }
  }
  //#endregion

  //#region Qc Criteria section
  public openQcReasonDialog() {
    this.isQcReason = !this.isQcReason;
    if (this.isQcReason == false)
      this.qcReasonModel = '';
  }

  public async submitQCReason() {
    try {
      let confirmationMessage = `Are you sure you want to ${this.leadObj.qcCriteria ? "update" : "add"} a Qc Criteria?`;
      this.alertDialogService.ConfirmYesNo(confirmationMessage, "Lead")
        .subscribe(async (res: any) => {
          if (res.flag) {
            if (this.qcReasonModel) {
              this.spinnerService.show();
              let leadObj = new Lead();
              this.leadObj.leadInventoryItems = await this.leadService.getStonesByLeadId(this.leadObj.id);
              leadObj = this.leadObj;
              leadObj.qcCriteria = this.qcReasonModel;
              let response = await this.leadService.leadUpdate(leadObj);
              if (response) {
                if (this.leadObj.qcCriteria)
                  this.insertLeadHistoryAction(LeadHistoryAction.QcCriteriaUpdated, `Lead has been changed Qc Criteria by ${this.leadObj.seller.name}`);
                else
                  this.insertLeadHistoryAction(LeadHistoryAction.QcCriteriaAdded, `Lead has been added Qc Criteria by ${this.leadObj.seller.name}`);
                this.openQcReasonDialog();
                this.utilityService.showNotification(`You have been ${this.leadItem?.qcCriteria ? "updated" : "added"} Qc Criteria successfully!`)
              }
              this.spinnerService.hide();
            }
          }
        });
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  //#endregion

  //#region  Section for Additional discount
  public calIndiDis(item: InvItem) {
    if (item.aDiscount.toString() == '-')
      return;
    this.subjectReqDis.next(item);
  }

  public reqAddDisChanges() {
    this.subjectReqDis.pipe(
      debounceTime(1000)
    ).subscribe((indiReqDisValue: InvItem) => {
      if (indiReqDisValue.aDiscount.toString() == '-')
        return;

      this.leadItem?.leadInventoryItems?.length > 0 && this.leadItem?.leadInventoryItems
        .map((currentObj, index) => {
          if (currentObj?.invId == indiReqDisValue.invId && currentObj.aDiscount != indiReqDisValue.aDiscount)
            this.modifiedAdisList.push(indiReqDisValue.stoneId);
        })
      this.calculateInvAmount(indiReqDisValue);

      if (this.listAcceptedInventoryItems.length == 0)
        this.gridDetailSummary = this.calculateSummaryAll(this.listInventoryItems);
      else
        this.gridAcceptedSummary = this.calculateSummaryAll(this.listAcceptedInventoryItems);
    });
  }

  public calculateInvAmount(target: InvItem) {
    if (target.price.rap && target.price.discount && target.weight) {
      target.fDiscount = target.price.discount;
      if (target.aDiscount) {
        target.fDiscount += Number(target.aDiscount);
        target.fDiscount = Number(target.fDiscount.toFixed(3));
      }
      target.perCarat = this.utilityService.ConvertToFloatWithDecimal((target.price.rap + (target.price.rap * target.fDiscount / 100)));
      target.netAmount = this.utilityService.ConvertToFloatWithDecimal(target.perCarat * target.weight);
    }
  }

  //#endregion

  //#region  Memo Request Section
  public async raiseMemoRequest() {
    try {
      this.clearMemoIssueData();
      let isAdminRequest: boolean = this.leadObj.leadAdminFlag;
      if (isAdminRequest == false)
        return this.alertDialogService.show(`You made a request to admin for the negotiation, Kindly wait for the Admin response, memo request do it later!`);

      let existMemoStone = new Array<string>();
      let existMemoRequestStone = new Array<string>();
      let memoStone = new Array<string>();
      if (this.mySelection.length > 0)
        this.selectedMemoInvItems = this.listInventoryItems.filter(x => this.mySelection.includes(x.invId));
      else
        this.selectedMemoInvItems = this.listInventoryItems;

      let exist: boolean = this.leadObj.leadInventoryItems.some(x => x.aDiscount < 0);
      if (exist && (this.leadObj.leadAdminFlag == null || this.leadObj.leadAdminFlag == false))
        return this.alertDialogService.show(`<b>${this.leadObj.leadInventoryItems.filter(x => x.aDiscount < 0).map(x => x.stoneId)}</b> stones are not valid for memo request!, Kindly get admin approval first`);

      let memoRequestLeads = await this.memoRequestService.getMemoRequestByLeadId(this.leadObj.id);
      this.selectedMemoInvItems.forEach(element => {
        let isExistMemoRequest: boolean = memoRequestLeads.some(c => c.memoStoneIds.some(x => x.invId == element.invId) && !c.isRequest);
        if (element.isMemo) {
          this.selectedMemoInvItems = this.selectedMemoInvItems.filter(x => x.stoneId != element.stoneId);
          existMemoStone.push(element.stoneId);
        }
        else if (isExistMemoRequest) {
          this.selectedMemoInvItems = this.selectedMemoInvItems.filter(x => x.stoneId != element.stoneId);
          existMemoRequestStone.push(element.stoneId);
        }
        else
          memoStone.push(element.stoneId);
      });

      if ((existMemoStone.length > 0 || existMemoRequestStone.length > 0) && this.selectedMemoInvItems.length == 0)
        return this.alertDialogService.show(`${existMemoStone.length > 0 ? `<b>${existMemoStone.join(", ")}</b> stone(s) are already in Memo. <br/>` : ""}  ${existMemoRequestStone.length > 0 ? `<b>${existMemoRequestStone.join(", ")}</b> stone(s) are already in Memo Request. <br/>` : ""}`)

      this.memoMessage = `${existMemoRequestStone.length > 0 ? `<b>${existMemoRequestStone.join(", ")}</b> stone(s) are already in Memo Request. <br/>` : ""} ${existMemoStone.length > 0 ? `<b>${existMemoStone.join(", ")}</b> stone(s) are already in Memo. <br/>` : ""} Are you want to request a Memo for <b>${memoStone.join(", ")}</b> stone(s)?`;
      this.toggleMemoIssueDialog();

    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public toggleMemoIssueDialog() {
    this.isMemoModal = !this.isMemoModal;
  }

  public clearMemoIssueData() {
    this.memoMessage = '';
    this.rateModel = '';
    this.selectedMemoInvItems = [];
    this.isMemoModal = false;
  }

  public async submitMemoIssue() {
    try {
      let suppliers = this.selectedMemoInvItems.filter(
        (thing, i, arr) => arr.findIndex(t => t.supplier.id === thing.supplier.id) === i
      ).map(x => x.supplier);

      if (suppliers.length > 0) {
        let listMemoRequest: MemoRequest[] = new Array<MemoRequest>();
        for (let index = 0; index < suppliers.length; index++) {
          const supplier = suppliers[index];
          if (supplier.id) {
            let filteredInvItems = this.selectedMemoInvItems.filter(x => x.supplier.id == supplier.id);
            if (filteredInvItems.length > 0) {
              let memoRequest: MemoRequest = new MemoRequest();

              let customer = await this.customerService.getCustomerById(this.leadObj.customer.id);
              if (customer)
                memoRequest.customer = this.mappingCustomerToMemoCustomer(customer);
              else {
                this.alertDialogService.show('Customer not found, Please contact administrator!');
                console.warn('Customer not found when trying to fetch by leade customer id: ' + this.leadObj.customer.id);
                return;
              }

              if (this.leadObj.broker?.id)
                memoRequest.broker = this.leadObj.broker;
              memoRequest.leadId = this.leadObj.id;
              memoRequest.leadNo = this.leadObj.leadNo;
              memoRequest.supplier = supplier;
              memoRequest.seller = this.leadObj.seller;
              memoRequest.isRequest = null as any;
              memoRequest.memoStoneIds = filteredInvItems;
              memoRequest.rate = Number(this.rateModel);
              listMemoRequest.push(memoRequest);
            }
          }
        }

        if (listMemoRequest.length > 0) {
          for (let index = 0; index < listMemoRequest.length; index++) {
            const element = listMemoRequest[index];
            let response = await this.memoRequestService.memoRequest(element);
            if (response) {
              let leadMemoRequest = new LeadMemoRequest();
              leadMemoRequest.ident = response;
              leadMemoRequest.leadId = element.leadId;
              if (element.broker?.id)
                leadMemoRequest.broker = this.setRequestDnorm(element.broker, "broker");

              leadMemoRequest.party = this.setRequestDnorm(element.customer, OriginValue.Customer.toLowerCase().toString());
              leadMemoRequest.seller = this.setRequestDnorm(element.seller, OriginValue.Seller.toLowerCase().toString());
              leadMemoRequest.memoStoneIds = element.memoStoneIds;
              leadMemoRequest.rate = element.rate;
              this.callMemoBackOfficeRequest(leadMemoRequest, element.supplier.id)
            }
            this.clearMemoIssueData();
          }
        }
        else
          this.alertDialogService.show('Please select at least one stone!');

      }
    }
    catch (error: any) {
      console.error(error);
      if (error?.error)
        this.alertDialogService.show(error?.error);
      else
        this.alertDialogService.show('Memo issue not save, Try again later!');
    }
  }

  private mappingCustomerToMemoCustomer(customer: Customer): MemoRequestCustomer {
    let cust = new MemoRequestCustomer();
    cust.id = customer.id;
    cust.fullName = customer.fullName;
    cust.mobile1 = customer.mobile1;
    cust.companyName = customer.companyName;
    return customer;
  }

  public async callMemoBackOfficeRequest(leadMemoRequest: LeadMemoRequest, supplierId: string): Promise<any> {
    let supplierObj = await this.supplierService.getSupplierById(supplierId);
    if (supplierObj?.apiPath) {

      leadMemoRequest.memoStoneIds.forEach(x => x.supplier = null as any);
      let resposeInv = await this.memoRequestService.memoRequestForBackOffice(supplierObj.apiPath, leadMemoRequest);
      if (resposeInv) {
        if (resposeInv.includes(";")) {

          let ids: string[] = new Array<string>();
          ids = resposeInv.split(";");
          let memoParamBoId = ids[0];
          let receiverIds: Array<string> = new Array<string>();

          if (ids[1].includes(","))
            receiverIds = ids[1].split(",");
          else
            receiverIds.push(ids[1]);

          if (memoParamBoId && receiverIds.length > 0) {
            for (let index = 0; index < receiverIds.length; index++) {
              const element = receiverIds[index];
              await this.sendMessageOnBackOffice('Memo Request', `Memo Request sent from Diamanto by ${this.fxCredential.fullName}`, memoParamBoId, element, 'MemoRequest');
            }
          }

          this.insertLeadHistoryAction(LeadHistoryAction.MemoRequest, `Lead has sent Memo request from ${this.fxCredential.fullName} to ${supplierObj.name} with this ${(leadMemoRequest?.memoStoneIds.length == 1 ? "stone" : "stones")}`);
          this.utilityService.showNotification(`Memo request has been sent to ${supplierObj.name}, Kindly wait for approval !`);
          this.mySelection = [];
          // this.clearMemoIssueData();
        }
        else
          this.alertDialogService.show(resposeInv);
      }
    }
  }

  public setRequestDnorm(obj: any, origin: string) {

    let orderRequestDNorm: RequestDNorm = new RequestDNorm();
    orderRequestDNorm.id = obj.id;
    orderRequestDNorm.origin = origin;
    orderRequestDNorm.name = origin.toLowerCase() == OriginValue.Customer.toLowerCase().toString() ? obj.fullName : obj.name;
    orderRequestDNorm.email = obj.email;
    orderRequestDNorm.mobileNo = obj.mobile1 ? obj.mobile1 : (obj.mobile ? obj.mobile : (obj.mobileNo ? obj.mobileNo : ""));
    if (obj.companyName && origin == OriginValue.Customer.toLowerCase().toString())
      orderRequestDNorm.companyName = obj.companyName;
    if (origin == 'broker')
      orderRequestDNorm.brokerAmt = obj.brokrage;
    return orderRequestDNorm;
  }

  // public setRequestParty(obj: MemoRequestCustomer): LeadMemoParty {
  //   let party = new RequestDNorm();
  //   party.id = obj.id;
  //   party.fullName = obj.fullName;
  //   party.mobile1 = obj.mobile1;
  //   party.companyName = obj.companyName;
  //   return party;
  // }
  //#endregion

  public async closeLeadCancel(event: any) {
    try {
      if (event.isClose)
        this.isSalesCancel = false;
      else {
        this.isSalesCancel = false;
        this.reason = event.reason;
        //Sales cancel with comment
        if (this.leadObj.leadStatus != LeadStatus.Order.toString()) {
          try {
            await this.checkPaidTransaction();
          }
          catch (error: any) {
            console.error(error);
            this.alertDialogService.show('Stone cancel not proccess, Try again later!');
          }
        }
        else {
          //Order Cancel with comment
          await this.sendSalesCancelMessage();
          this.insertLeadHistoryAction(LeadHistoryAction.OrderCancel, `Lead Order Cancel by ${this.leadObj.seller.name} `);
        }
      }

    } catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async toggleStoneDialog() {
    let requestedOrderStoneIds = this.leadObj.leadInventoryItems.filter(a => a.isHold && !a.isRejected && a.status == StoneStatus.Order.toString()).map(x => x.stoneId).join(", ");

    if (requestedOrderStoneIds.length > 0)
      this.alertDialogService.show(`<b>${requestedOrderStoneIds}</b> stone(s) has already placed in order.so, kindly remove it from the lead!!`)
    else {
      requestedOrderStoneIds = this.leadObj.leadInventoryItems.filter(a => a.isHold && a.status != StoneStatus.Order.toString()).map(x => x.stoneId).join(", ");
      this.spinnerService.show();

      let stones: Array<string> = new Array<string>();
      stones = this.utilityService.CheckStoneIds(requestedOrderStoneIds).map(x => x.toLowerCase());
      this.releaseStoneList = await this.leadService.getHoldLeadStoneByStoneIds(stones, this.fxCredential.id);

      if (this.releaseStoneList && this.releaseStoneList.length > 0) {
        this.spinnerService.hide();
        let message = '';
        let holdByOwnInv: Array<LeadStoneReleaseItem> = JSON.parse(JSON.stringify(this.releaseStoneList)).filter((x: LeadStoneReleaseItem) => x.seller.id == this.fxCredential.id);
        if (holdByOwnInv && holdByOwnInv.length > 0) {
          message = `Hold by you <br>`
          for (let index = 0; index < holdByOwnInv.length; index++) {
            const element = holdByOwnInv[index];
            if (element.leadNo > 0)
              message += `<b>${element.stoneId}</b> hold for <b>${element.customer.companyName}-(${element.customer.name})</b><br>`
            else
              message += `<b>${element.stoneId}</b> added in cart by <b>${element.customer.companyName}-(${element.customer.name})</b><br>`

          }
        }

        let holdInCartInv: Array<LeadStoneReleaseItem> = this.releaseStoneList.filter(x => x.seller.id != this.fxCredential.id && x.leadNo == 0);
        if (holdInCartInv && holdInCartInv.length > 0) {
          for (let index = 0; index < holdInCartInv.length; index++) {
            const element = holdInCartInv[index];
            message += `<b>${element.stoneId}</b> added in cart, kindly contact <b>${element.seller.name}</b><br>`
          }
        }

        if (message != "" && message != undefined && message != null)
          this.alertDialogService.show(message)

        this.releaseStoneList = this.releaseStoneList.filter(x => x.seller.id != this.fxCredential.id && x.leadNo > 0);
        if (this.releaseStoneList && this.releaseStoneList.length > 0)
          this.isStoneRequest = true;

      }
      else {
        this.spinnerService.hide();
        this.alertDialogService.show('No stone(s) are not hold by any seller!');
        requestedOrderStoneIds = '';
        this.releaseStoneList = new Array<LeadStoneReleaseItem>();
      }

    }
  }

  public copyToClipboard() {
    try {
      let res = this.leadObj.leadInventoryItems.map(x => x.stoneId).join(", ");
      if (res.length > 0) {
        navigator.clipboard.writeText(res);
        this.utilityService.showNotification(`Copy to clipboard successfully!`);
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public getHoldByOtherSeller(holdStones: InvItem[]) {

    var distinctHoldby = holdStones.map((u: InvItem) => u.holdBy).filter((x: any, i: any, a: any) => x && a.indexOf(x) === i);
    let message = "";

    if (distinctHoldby && distinctHoldby.length > 0) {
      message = `Lead cannot be moved as it has hold <br/>`;
      for (let i = 0; i < distinctHoldby.length; i++) {
        let holdBy = distinctHoldby[i];
        let holdByInvItem = holdStones.filter(z => z.holdBy == holdBy);
        message += `<b>${holdByInvItem.map(x => x.stoneId).join(", ")} </b>${(holdByInvItem.length == 1 ? "stone" : "stones")}, Respectivly InBusiness with <b>${holdBy} </b><br/>`
      }
    }
    else
      message = `<b>${holdStones.map(x => x.stoneId).join(", ")} </b>${(holdStones.length == 1 ? "stone is" : "stones are")} Hold.<br/>`

    if (message)
      return this.alertDialogService.show(message);
  }

  //#region  Notification section
  public async sendMessage(leadObj: Lead, isSeller = true, isAccept?: boolean) {
    this.message = new Notifications();
    const selectedAdminUser = this.configurationObj?.addDiscountUser?.id ? this.configurationObj?.addDiscountUser : this.configurationObj?.adminUser;
    if (selectedAdminUser && selectedAdminUser?.id) {
      this.message.icon = "icon-erroricon";
      this.message.title = `${leadObj.leadNo}`;
      this.message.categoryType = isAccept != undefined ? "information" : 'modal';
      this.message.description = `Lead notification ${isAccept != undefined ? (isAccept ? 'Accepted' : 'Rejected') : ""} by ${isSeller ? this.leadObj.seller.name : selectedAdminUser?.fullName}`;
      this.message.action = "Lead";
      this.message.param = leadObj.id;
      this.message.senderId = this.fxCredential.id;
      this.message.receiverId = isSeller ? selectedAdminUser?.id : this.leadObj.seller.id;

      let notificationResponse = await this.notificationService.insertNotification(this.message);
      if (notificationResponse) {
        this.message.id = notificationResponse;
        this.notificationService.messages.next(this.message)
      }

    }
    else
      this.alertDialogService.show("Kindly configure default admin in configuration");
  }

  public async sendMessageOnBackOffice(messageText: string, description: string, param: any, receiverId: string, actionType: string = "modal") {
    this.message = new Notifications();

    if (receiverId) {
      this.message.icon = "icon-erroricon";
      this.message.title = messageText;
      this.message.categoryType = "modal";
      this.message.description = description;
      this.message.action = actionType;
      this.message.param = param;
      this.message.senderId = JSON.parse(sessionStorage.getItem("userToken") ?? "").ident;
      this.message.receiverId = receiverId;

      let notificationResponse = await this.notificationService.insertNotification(this.message);
      if (notificationResponse) {
        this.message.id = notificationResponse;
        this.notificationService.messages.next(this.message)
      }
    }

  }

  public async sendRejectedLeadMessage(leadRejecetdOfferObj: LeadRejectedOffer) {
    this.message = new Notifications();

    const selectedAdminUser = this.configurationObj?.leadRejectedUser?.id ? this.configurationObj?.leadRejectedUser : this.configurationObj?.adminUser;
    if (selectedAdminUser && selectedAdminUser?.id) {
      this.message.icon = "icon-info";
      this.message.title = `${leadRejecetdOfferObj.leadNo}`;
      this.message.categoryType = "modal";
      this.message.description = `Lead Rejected by ${leadRejecetdOfferObj.seller.name}`;
      this.message.action = "leadrejected";
      this.message.param = leadRejecetdOfferObj.id;
      this.message.senderId = this.fxCredential.id;
      this.message.receiverId = selectedAdminUser?.id;

      let notificationResponse = await this.notificationService.insertNotification(this.message);
      if (notificationResponse) {
        this.message.id = notificationResponse;
        this.notificationService.messages.next(this.message);
      }

    }
    else
      this.alertDialogService.show("Kindly configure default admin in configuration");
  }

  public async sendSalesCancelMessage() {
    try {
      const selectedAdminUser = this.configurationObj?.salesOrderCancelUser?.id ? this.configurationObj?.salesOrderCancelUser : this.configurationObj?.adminUser;
      if (selectedAdminUser && selectedAdminUser?.id) {
        this.spinnerService.show();
        this.message = new Notifications();
        this.message.icon = "icon-info";
        this.message.title = `${this.leadObj.leadNo}`;
        this.message.categoryType = "modal";
        this.message.description = `Lead ${this.leadObj.leadStatus == "Order" ? "Order Cancel" : "Sales Cancel"} by ${this.leadObj.seller.name}`;
        this.message.action = this.leadObj.leadStatus == "Order" ? "leadordercancel" : "leadsalescancel";
        this.message.param = this.mySelection.join(',');
        this.message.reason = this.reason;
        this.message.senderId = this.fxCredential.id;
        this.message.receiverId = selectedAdminUser?.id;

        let notificationResponse = await this.notificationService.insertNotification(this.message);
        if (notificationResponse) {
          this.message.id = notificationResponse;
          this.notificationService.messages.next(this.message);
          this.utilityService.showNotification('Sales cancel request generated!');
          this.spinnerService.hide();
        }
        else
          this.spinnerService.hide();
      }
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Notification not send, Try again later!');
    }
  }
  //#endregion

  public isValDiscToggle(value: boolean) {
    this.leadObj.isVolDiscFlag = value;
    if (this.listAcceptedInventoryItems.length > 0)
      this.gridAcceptedSummary = this.calculateSummaryAll(this.listAcceptedInventoryItems);
    else
      this.gridDetailSummary = this.calculateSummaryAll(this.listInventoryItems);
  }

  public mappingInvItemToLeadRejectedOfferItem(inv: InvItem[]): LeadRejectedOfferItem[] {
    let invList: Array<LeadRejectedOfferItem> = new Array<LeadRejectedOfferItem>();
    for (let index = 0; index < inv.length; index++) {
      const element = inv[index];
      let invObj: LeadRejectedOfferItem = new LeadRejectedOfferItem();
      invObj.stoneId = element.stoneId;
      invObj.weight = element.weight;
      invObj.shape = element.shape;
      invObj.price = element.price
      invList.push(invObj);
    }
    return invList;
  }

  public closeRequestParty(valueObj: { changePartyReqId: string, isOpen: boolean }) {
    this.isEditableCustomer = valueObj.isOpen
    if (valueObj.changePartyReqId)
      this.leadObj.changePartyId = valueObj.changePartyReqId;

  }

  //#region Sales Cancel or order cancel
  public async stoneCancelProccess() {

    if (this.configurationObj.adminUser && this.configurationObj.adminUser.id) {
      // validation to check for order cancel has primary supplier
      if (this.leadObj.leadStatus == LeadStatus.Order.toString()) {
        let invalidStoneIds = Array<string>();
        let leadInvItems = await this.leadService.getStonesByLeadId(this.leadObj.id, false);

        if (this.mySelection && this.mySelection.length > 0)
          invalidStoneIds = leadInvItems.filter(x => this.mySelection.includes(x.invId) && x.primarySupplier.id != null).map(a => a.stoneId);
        else
          invalidStoneIds = leadInvItems.filter(x => x.primarySupplier.id != null).map(a => a.stoneId);

        if (invalidStoneIds && invalidStoneIds.length > 0)
          return this.alertDialogService.show(`This <b>${invalidStoneIds.join(", ")}</b> have primary supplier selected. Reset Order before cancelling.`);

        let exists = await this.notificationService.checkExistsOrdersCancelNotifications(this.leadObj.leadNo.toString());
        if (exists) {
          this.alertDialogService.ConfirmYesNo(`${this.leadObj.leadStatus == "Order" ? "Order Cancel" : "Sales Cancel"} request already exists for this Lead, You want to replace old request ? `, "Order Cancel Request")
            .subscribe(async (existsRes: any) => {
              if (existsRes.flag) {
                await this.notificationService.deleteMessage(exists);
                this.insertLeadHistoryAction(LeadHistoryAction.OrderCancel, `Lead ${this.leadObj.leadStatus == "Order" ? "Order Cancel" : "Sales Cancel"} by ${this.leadObj.seller.name} `);
                this.isSalesCancel = true;
                return;
              }
            });
        }
        else {
          this.isSalesCancel = true;
          return;
        }
      }

      // for sale cancel process
      if (this.leadObj.leadStatus != LeadStatus.Order.toString())
        this.isSalesCancel = true; //Open sales cancel modal

    }
    else
      this.alertDialogService.show("Kindly configure default admin in configuration");
  }

  //#endregion



  public async defaultstoneCancelProccess() {
    try {
      let exists = await this.notificationService.getExistsSalesCancelNotifications(this.leadObj.leadNo.toString());
      if (exists) {
        this.alertDialogService.ConfirmYesNo(`${this.leadObj.leadStatus == "Order" ? "Order Cancel" : "Sales Cancel"} request already exists for this Lead, You want to replace old request ? `, "Sales Cancel Request")
          .subscribe(async (existsRes: any) => {
            if (existsRes.flag) {
              await this.notificationService.deleteMessage(exists);
              this.insertLeadHistoryAction(LeadHistoryAction.SaleCancel, `Lead ${this.leadObj.leadStatus == "Order" ? "Order Cancel" : "Sales Cancel"} by ${this.leadObj.seller.name} `);
              await this.sendSalesCancelMessage();

            }
          });
      }
      else {
        this.insertLeadHistoryAction(LeadHistoryAction.SaleCancel, `Lead ${this.leadObj.leadStatus == "Order" ? "Order Cancel" : "Sales Cancel"} by ${this.leadObj.seller.name} `);
        await this.sendSalesCancelMessage();
      }
    }
    catch (error: any) {
      console.error(error);
      this.alertDialogService.show('Stone cancel not proccess, Try again later!');
    }
  }

  public async checkPaidTransaction(): Promise<boolean> {
    try {
      let supplierCodes = this.leadObj.leadInventoryItems.filter(x => this.mySelection.includes(x.invId)).map(z => z.primarySupplier.code);
      let suppliers: Supplier[] = [];

      this.supplierItems.forEach(supMain => {
        supplierCodes.forEach(supIner => {
          if (supIner == supMain.code)
            suppliers.push(supMain);
        });
      });

      suppliers = suppliers.map(u => u).filter((x, i, a) => x && a.indexOf(x) === i);
      let isPendingTrans = false;
      let supplierNames = "";
      let errorMessage = "";
      let message = "";

      if (suppliers.length > 0) {
        for (let index = 0; index < suppliers.length; index++) {
          const element = suppliers[index];
          let supplierApi = element.apiPath;
          if (supplierApi) {
            let res = await this.commuteService.checkForPaidTransaction(this.leadObj.id, supplierApi);
            if (!res.isSuccess) {
              supplierNames += " " + element.name;

              if (res.errorMessage)
                errorMessage += res.errorMessage;

              if (res.message)
                message += res.message;

              isPendingTrans = true;
            }
          }
          else {
            this.alertDialogService.show('Backoffice URL not found for supplier ' + element.name);
            return false;
          }
        }

        if (isPendingTrans && message)
          this.alertDialogService.show(message);
        else if (isPendingTrans && errorMessage)
          this.alertDialogService.show(errorMessage);
        else if (isPendingTrans && !message && !errorMessage)
          this.defaultstoneCancelProccess();
        else if (!isPendingTrans)
          this.alertDialogService.show("Please contact accountant of " + supplierNames + " for generating credit notes.");
      }
      else
        this.defaultstoneCancelProccess();



    } catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Something went wrong, Try again later!');
      return false;
    }

    return true;
  }

  public raiseExportRequest() {
    if (this.mySelection.length > 0)
      this.selectedExpReqInvItems = this.listInventoryItems.filter(x => this.mySelection.includes(x.invId));
    else
      this.selectedExpReqInvItems = this.listInventoryItems;

    this.exportRequestMessage = `Are you sure you want to raise export request for<b>${this.selectedExpReqInvItems.map(x => x.stoneId).join(", ")} </b> stone(s) ?`
    this.toggleExportRequestDialog();

  }

  public toggleExportRequestDialog() {
    this.isExportRequestModal = !this.isExportRequestModal;
  }

  public async submitExportRequest() {
    try {
      let successCount = 0;
      if (this.locationModel) {

        this.spinnerService.show();
        let suppliers = this.selectedExpReqInvItems.filter(
          (thing, i, arr) => arr.findIndex(t => t.supplier.id === thing.supplier.id) === i
        ).map(x => x.supplier);

        if (suppliers && suppliers.length > 0) {
          let supCountry = this.locationModel;
          if (supCountry == 'HK')
            supCountry = "Hong Kong";
          else if (supCountry == 'UAE')
            supCountry = 'United Arab Emirates';

          for (let index = 0; index < suppliers.length; index++) {

            const supplier = suppliers[index];
            if (supplier.id) {

              let filteredInvItems = this.selectedExpReqInvItems.filter(x => x.supplier.id == supplier.id && x.supplier.address?.country.toLowerCase() != supCountry.toLowerCase());
              if (filteredInvItems.length > 0) {

                let listExportRequest: ExportRequestData = new ExportRequestData();
                listExportRequest.stoneIds = filteredInvItems.map(x => x.stoneId);
                listExportRequest.requestBy = this.fxCredential.fullName;
                listExportRequest.location = this.locationModel;

                if (listExportRequest && listExportRequest.stoneIds && listExportRequest.stoneIds.length > 0) {
                  let supplierObj = (await this.supplierService.getSupplierById(supplier.id));

                  if (supplierObj.apiPath) {
                    let res = await this.commuteService.insertExportRequest(listExportRequest, supplierObj.apiPath);
                    if (res && res.isSuccess)
                      successCount++;
                    else {
                      if (res.message)
                        this.alertDialogService.show(res.message);
                      else
                        this.alertDialogService.show('Export Request not update, Try again later');

                      if (res.errorMessage)
                        console.error(res.errorMessage);

                      this.spinnerService.hide();
                    }
                  }
                }

              }
            }
          }

          if (successCount == suppliers.length) {
            this.insertLeadHistoryAction(LeadHistoryAction.ExportRequest, `Lead has been sent stone export request for ${this.selectedExpReqInvItems.map(x => x.stoneId).join(", ") + " " + (this.selectedExpReqInvItems.length == 1 ? "stone" : 'stones')
              } to ${this.locationModel} `);
            this.utilityService.showNotification('Export request save successfully!');
            this.toggleExportRequestDialog();
            this.mySelection = [];
            this.locationModel = null as any;
            this.spinnerService.hide();
          }
        }
        this.spinnerService.hide();
      }
      else
        this.alertDialogService.show('Kindly, select location before send export request!');

    }
    catch (error: any) {
      this.spinnerService.hide();
      console.error(error);
      if (error?.error)
        this.alertDialogService.show(error?.error);
      else
        this.alertDialogService.show('Export request not save, Try again later!');
    }
  }

  //#region  Qc Request

  public async raiseQcRequest() {
    try {
      this.clearQcRequestData();

      let existQcStone = new Array<string>();
      let existQcRequestStone = new Array<string>();
      let qcStone = new Array<string>();
      if (this.mySelection.length > 0)
        this.selectedQcInvItems = JSON.parse(JSON.stringify(this.listInventoryItems.filter(x => this.mySelection.includes(x.invId))));
      else
        this.selectedQcInvItems = JSON.parse(JSON.stringify(this.listInventoryItems));

      let qcRequestLeads = await this.qcRequestService.getQcRequestByLeadId(this.leadObj.id);
      this.selectedQcInvItems.forEach(element => {
        let isExistQcRequest: boolean = qcRequestLeads.some(c => c.qcStoneIds.some(x => x.invId == element.invId) && !c.isRequest);
        if (element.isMemo) {
          this.selectedQcInvItems = this.selectedQcInvItems.filter(x => x.stoneId != element.stoneId);
          existQcStone.push(element.stoneId);
        }
        else if (isExistQcRequest) {
          this.selectedQcInvItems = this.selectedQcInvItems.filter(x => x.stoneId != element.stoneId);
          existQcRequestStone.push(element.stoneId);
        }
        else
          qcStone.push(element.stoneId);
      });

      if ((existQcStone.length > 0 || existQcRequestStone.length > 0) && this.selectedQcInvItems.length == 0)
        return this.alertDialogService.show(`${existQcStone.length > 0 ? `<b>${existQcStone.join(", ")}</b> stone(s) are already in Qc. <br/>` : ""}  ${existQcRequestStone.length > 0 ? `<b>${existQcRequestStone.join(", ")}</b> stone(s) are already in Qc Request. <br/>` : ""}`)

      this.qcMessage = `${existQcRequestStone.length > 0 ? `<b>${existQcRequestStone.join(", ")}</b> stone(s) are already in Qc Request. <br/>` : ""} ${existQcStone.length > 0 ? `<b>${existQcStone.join(", ")}</b> stone(s) are already in Qc. <br/>` : ""} Are you want to request a Qc for <b>${qcStone.join(", ")}</b> stone(s)?`;
      this.toggleQcRequest();

    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public toggleQcRequest() {
    this.isQCRequest = !this.isQCRequest;
  }

  public clearQcRequestData() {
    this.qcMessage = '';
    this.selectedQcInvItems = [];
    this.isQCRequest = false;
  }

  public async submitQcRequest() {
    try {
      let suppliers = this.selectedQcInvItems.filter(
        (thing, i, arr) => arr.findIndex(t => t.supplier.id === thing.supplier.id) === i
      ).map(x => x.supplier);

      if (suppliers.length > 0) {
        let listQcRequest: QcRequest[] = new Array<QcRequest>();
        for (let index = 0; index < suppliers.length; index++) {
          const supplier = suppliers[index];
          if (supplier.id) {
            let filteredInvItems = this.selectedQcInvItems.filter(x => x.supplier.id == supplier.id);
            if (filteredInvItems.length > 0) {
              filteredInvItems.forEach(x => x.status = "Viewing");
              let qcRequest: QcRequest = new QcRequest();
              qcRequest.customer = this.mappingCustomerToQcCustomer(this.leadObj.customer);
              qcRequest.leadId = this.leadObj.id;
              qcRequest.leadNo = this.leadObj.leadNo;
              qcRequest.supplier = supplier;
              qcRequest.seller = this.leadObj.seller;
              qcRequest.isRequest = null as any;
              qcRequest.qcStoneIds = filteredInvItems;
              listQcRequest.push(qcRequest);
            }
          }
        }

        if (listQcRequest && listQcRequest.length > 0) {
          for (let index = 0; index < listQcRequest.length; index++) {
            const element = listQcRequest[index];
            let response = await this.qcRequestService.qcRequestForFo(element);
            if (response) {
              let leadQcRequest = new LeadQcRequest();
              leadQcRequest.ident = response;
              leadQcRequest.leadId = element.leadId;
              leadQcRequest.leadNo = element.leadNo.toString();
              leadQcRequest.party = this.setRequestDnorm(element.customer, OriginValue.Customer.toLowerCase().toString());
              leadQcRequest.seller = this.setRequestDnorm(element.seller, OriginValue.Seller.toLowerCase().toString());
              leadQcRequest.qcStoneIds = element.qcStoneIds;
              this.callQcBackOfficeRequest(leadQcRequest, element.supplier.id)
            }
            this.clearQcRequestData();
          }

          this.mySelection = new Array<string>();
          this.listAcceptedInventoryItems = new Array<InvItem>();
          this.gridAcceptedSummary = this.calculateSummaryAll(this.listAcceptedInventoryItems);
        }
        else
          this.alertDialogService.show('Please select at least one stone!');

      }
    }
    catch (error: any) {
      console.error(error);
      if (error?.error)
        this.alertDialogService.show(error?.error);
      else
        this.alertDialogService.show('Memo issue not save, Try again later!');
    }
  }

  public async callQcBackOfficeRequest(leadQcRequest: LeadQcRequest, supplierId: string): Promise<any> {
    let supplierObj = (await this.supplierService.getSupplierById(supplierId));
    if (supplierObj.apiPath) {
      leadQcRequest.qcStoneIds.forEach(x => x.supplier = null as any);
      let resposeInv = await this.qcRequestService.qcRequestForBo(supplierObj.apiPath, leadQcRequest);
      if (resposeInv) {
        if (resposeInv.includes(";")) {
          let ids: string[] = new Array<string>();
          ids = resposeInv.split(";");
          let memoParamBoId = ids[0];
          let receiverIds: Array<string> = new Array<string>();
          if (ids[1].includes(","))
            receiverIds = ids[1].split(",");
          else
            receiverIds.push(ids[1]);
          if (memoParamBoId && receiverIds.length > 0) {
            for (let index = 0; index < receiverIds.length; index++) {
              const element = receiverIds[index];
              await this.sendMessageOnBackOffice('Qc Request', `Qc Request sent by ${this.fxCredential.fullName}`, memoParamBoId, element, 'QcRequestBO');
            }
          }
          this.insertLeadHistoryAction(LeadHistoryAction.QcRequest, `Lead has sent Qc request from ${this.fxCredential.fullName} to ${supplierObj.name} with this ${(leadQcRequest?.qcStoneIds.length == 1 ? "stone" : "stones")}`);
          this.utilityService.showNotification(`Qc request has been sent to ${supplierObj.name}, Kindly wait for approval !`);
          this.clearQcRequestData();
        }
        else
          this.alertDialogService.show(resposeInv);

      }
    }
  }

  private mappingCustomerToQcCustomer(customer: CustomerDNorm): MemoRequestCustomer {
    let cust = new MemoRequestCustomer();
    cust.id = customer.id;
    cust.fullName = customer.name;
    cust.mobile1 = customer.mobile;
    cust.companyName = customer.companyName;
    return cust;
  }

  // #endregion

  /* #region  Add log */
  private addDbLog(action: string, request: string, response: string, error: string) {
    try {
      let log: DbLog = new DbLog();
      log.action = action;
      log.category = "FrontOffice";
      log.controller = "Lead";
      log.userName = this.fxCredential?.fullName;
      log.ident = this.fxCredential?.id;
      log.payLoad = request;
      log.eventTime = new Date().toDateString();
      log.text = response;
      log.errorText = error;
      this.logService.insertLog(log);

    }
    catch (error: any) {
      console.error(error);
      this.alertDialogService.show('Log not created, Please contact administrator!', "error");
    }
  }
  /* #endregion */


}

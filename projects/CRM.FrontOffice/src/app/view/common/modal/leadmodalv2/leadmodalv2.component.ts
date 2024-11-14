import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { PageChangeEvent, RowClassArgs, SelectableSettings } from '@progress/kendo-angular-grid';
import { Align } from '@progress/kendo-angular-popup';
import { AggregateDescriptor, DataResult, GroupDescriptor, process } from '@progress/kendo-data-query';
import { environment } from 'environments/environment.prod';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { GridDetailConfig } from 'shared/businessobjects';
import { fxCredential, GridConfig, GridMasterConfig, Notifications } from 'shared/enitites';
import { AppPreloadService, ConfigService, FrontStoneStatus, LeadStatus, LeadStatusList, listCurrencyType, NotificationService, OriginValue, StoneStatus, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import * as xlsx from 'xlsx';
import { InvExcel, LeadMemoParty, LeadMemoRequest, LeadResponse } from '../../../../businessobjects';
import { BrokerDNrom, BusinessConfig, Configurations, CurrencyType, Customer, CustomerDNorm, InventoryItems, InvItem, Lead, LeadRejectedOffer, LeadSummary, MemoRequest, MemoRequestCustomer, RejectedStone, RequestDNorm, Scheme, SystemUserDNorm } from '../../../../entities';
import { BrokerService, BusinessconfigurationService, ConfigurationService, CustomerService, GridPropertiesService, InventoryService, LeadService, MemorequestService, RejectedstoneService, SchemeService, SupplierService } from '../../../../services';


@Component({
  selector: 'app-leadmodalv2',
  templateUrl: './leadmodalv2.component.html',
  styleUrls: ['./leadmodalv2.component.css']
})
export class Leadmodalv2Component implements OnInit {

  @Input() leadTitle!: string;
  @Input() leadItem: Lead = new Lead();
  @Input() seller!: SystemUserDNorm;
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
      this.anchor.nativeElement.contains(target) ||
      (this.popup ? this.popup.nativeElement.contains(target) : false)
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
  public isShowCheckBoxAll: boolean = true;
  public mySelection: string[] = [];
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

  public isEditableBrokerage: boolean = false;
  public isEditableCustomer: boolean = false;
  public brokerageValue: number = 0;
  public rejectedStone: RejectedStone[] = new Array<RejectedStone>();
  public visibleRejectedStone: boolean = false;
  public schemes: Scheme = new Scheme();
  public lastPurchase: number = 0;
  public excelOption!: string | null;
  public anchorAlign: Align = { horizontal: "right", vertical: "bottom" };
  public popupAlign: Align = { horizontal: "center", vertical: "top" };
  public showExcelOption: boolean = false;
  public excelFile: any[] = [];

  public isQcReason: boolean = false;
  public qcReasonModel: string = "";
  public listQCReasonItems: Array<string> = new Array<string>();
  public iNRPrice: number = 0;
  public addFromTxt: boolean = false;
  public stoneIdsSearchTxt: string[] = Array<string>();
  public configurationObj: Configurations = new Configurations();
  public isAdmin: boolean = false;
  public listCurrencyType: CurrencyType[] = [];
  public isRupee: boolean = false;

  public memoMessage: string = '';
  public isMemoModal: boolean = false;
  public rateModel: string = '';
  public selectedMemoInvItems: InvItem[] = [];
  public isRejectedOffer: boolean = false;
  public isStoneRequest: boolean = false;
  public requestedStoneIds: string = "";
  public leadUpdateStatus: string = "";
  public listLeadStatus: Array<string> = LeadStatusList;
  // public volDiscToggleFlag: boolean = true;

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
    public memoRequestService: MemorequestService
  ) {
  }

  async ngOnInit() {
    await this.loadDefaultMethods()
  }

  public async loadDefaultMethods() {
    try {
      this.spinnerService.show();
      this.fxCredential = await this.appPreloadService.fetchFxCredentials();
      if (!this.fxCredential)
        this.router.navigate(["login"]);
      if (this.leadTitle == LeadStatus.Hold)
        this.listLeadStatus = this.listLeadStatus.filter(x => x.toLowerCase() != LeadStatus.Proposal.toLowerCase())
      if (this.leadTitle)
        this.leadUpdateStatus = this.leadTitle;

      if (this.seller)
        this.sellerObj = this.seller;
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
        this.leadItem.platform = this.leadItem.platform.toLowerCase();
        this.schemes = await this.getSchemes(this.leadItem.platform == "online" ? true : false);
        this.lastPurchase = await this.leadService.getLastPurchaseAmountForVow(this.leadItem.customer.id);
        this.leadItem.qcCriteria ? this.qcReasonModel = this.leadItem.qcCriteria : this.qcReasonModel = "";
        if (this.leadItem.platform.toLowerCase() == "online")
          this.gridDetailSummary = this.leadItem.leadSummary;
        this.editLead(this.leadItem, this.isEditLead, this.leadTitle);
      }
      else
        await this.toggleAddLeadDialog();
    }
    catch (error: any) {
      console.error(error);
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
      this.spinnerService.show();
      this.businessConfig = await this.businessConfigurationService.getBusinessConfiguration();
      if (this.businessConfig && this.businessConfig.removeStoneReasons.length > 0)
        this.listRemoveReasonItems = this.businessConfig.removeStoneReasons;
      if (this.businessConfig && this.businessConfig.qcReasons.length > 0)
        this.listQCReasonItems = this.businessConfig.qcReasons;
      this.configurationObj = await this.configurationService.getConfiguration();
      if (this.configurationObj && this.configurationObj.adminUser?.id)
        this.isAdmin = this.configurationObj.adminUser.id == this.fxCredential.id ? true : false;
      let currencyList = await this.configurationService.getCurrencyTypesList();

      if (currencyList && currencyList.length > 0) {
        //this.iNRPrice = (currencyList.find(c => c.fromCurrency.toLowerCase() == 'inr')?.fromRate) ?? 77;
        let res = this.configurationService.getFromToCurrencyRate(listCurrencyType.USD, listCurrencyType.INR, this.listCurrencyType);
        this.iNRPrice = res.toRate;
      }
      this.spinnerService.hide();
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
      this.spinnerService.hide();
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
  public async loadInventoryByStone(stoneIds: string[]) {
    try {
      let inventory: InvItem[] = await this.inventoryService.getInventoryDNormsByStones(stoneIds, " " as any);
      let holdstoneIds: Array<string> = new Array<string>();
      if (this.leadObj.leadStatus.toLowerCase() == LeadStatus.Hold.toLowerCase()) {
        for (let index = 0; index < inventory.length; index++) {
          const element = inventory[index];
          if (element.isHold) {
            holdstoneIds.push(element.stoneId);
            inventory.splice(index, 1)
          }
        }
      }
      this.loadInventory(inventory, true);  //load inventory
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }

  }

  public async loadInventoryByCertificate(certificateIds: string[]) {
    try {

      let inventory: InvItem[] = await this.inventoryService.getInventoryDNormsByCertificateIds(certificateIds, " " as any);
      let stoneIds: Array<string> = new Array<string>();
      if (this.leadObj.leadStatus.toLowerCase() == LeadStatus.Hold.toLowerCase()) {
        for (let index = 0; index < inventory.length; index++) {
          const element = inventory[index];
          if (element.isHold) {
            stoneIds.push(element.stoneId);
            inventory.splice(index, 1)
          }
        }
      }
      this.loadInventory(inventory, true);  //load inventory
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

    if (inventories && inventories.length > 0) {
      let filterSoldStones = inventories.filter(x => x.status?.toLowerCase() == StoneStatus.Sold.toLowerCase());
      if (filterSoldStones && filterSoldStones.length > 0)
        this.alertDialogService.show(`${filterSoldStones.map(x => x.stoneId)} Stone(s) are already sold`);

      inventories = inventories.filter(x => x.status?.toLowerCase().toString() != StoneStatus.Sold.toLowerCase().toString());

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
        this.loadLeadInventoryGrid(this.listInventoryItems)
      }
    }
    else
      if (isStoneAdd)
        this.alertDialogService.show("Stone(s) not Found");
    this.spinnerService.hide();
  }

  public isDisabled(args: RowClassArgs) {
    return {
      'k-state-disabled': args.dataItem.isRejected === true

    };
  }

  public async loadLeadInventoryGrid(leadInventoryItems: InvItem[], isPaging: boolean = false) {
    if (leadInventoryItems.length > 0) {
      if (this.leadObj.platform.toLowerCase() == "offline") {
        this.schemes = await this.getSchemes(false);
        if (this.customerObj.id)
          this.lastPurchase = await this.leadService.getLastPurchaseAmountForVow(this.customerObj.id);
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

      this.gridViewLeadInventory = process(this.gridInventoryData, { group: this.groups });
      this.gridViewLeadInventory.total = leadInventoryItems.length;
    }
    else {
      this.gridDetailSummary = new LeadSummary();
      this.gridViewLeadInventory = process(this.gridInventoryData, { group: this.groups });
      this.gridViewLeadInventory.total = leadInventoryItems.length;
    }
    this.spinnerService.hide();
  }

  public async onAddStones(event: any) {
    try {
      let stoneId = event.target.value;
      this.addFromTxt = true;

      if (this.customerObj.id == null)
        return this.alertDialogService.show('Please select customer!');

      this.spinnerService.show();
      let fetchStoneIds: string[] = this.utilityService.CheckStoneIds(stoneId);
      this.stoneIdsSearchTxt = fetchStoneIds;
      let existStones: string[] = [];
      let existStonesInList: string[] = [];
      if (this.listInventoryItems.length > 0) {
        existStones = this.listInventoryItems.map(c => c.stoneId.toLowerCase());
        existStonesInList = this.listInventoryItems.filter(item => fetchStoneIds.map(x => x.toLowerCase().toString()).includes(item.stoneId.toLowerCase())).map(x => x.invId);
        fetchStoneIds = fetchStoneIds.filter(item => !existStones.includes(item.toLowerCase()));
      }
      if (fetchStoneIds.length > 0)
        await this.loadInventoryByStone(fetchStoneIds);

      if (existStonesInList.length > 0) {
        this.mySelection = existStonesInList;
        this.listAcceptedInventoryItems = this.listInventoryItems.filter(x => this.mySelection.includes(x.invId));
        if (this.listAcceptedInventoryItems.length > 0)
          this.gridAcceptedSummary = this.calculateSummaryAll(this.listAcceptedInventoryItems);
      }

      this.spinnerService.hide();
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async onCertificate(event: any) {
    try {
      let certificateId = event.target.value;

      this.addFromTxt = true;
      if (this.customerObj.id == null) {
        this.alertDialogService.show('Please select customer!');
        return;
      }
      this.spinnerService.show();

      let fetchCertificateIds: string[] = this.utilityService.checkCertificateIds(certificateId);
      let existCertificates: string[] = [];
      let existCertificatesInList: string[] = [];
      if (this.listInventoryItems.length > 0) {
        existCertificates = this.listInventoryItems.map(c => c.certificateNo.toLowerCase());
        existCertificatesInList = this.listInventoryItems.filter(item => fetchCertificateIds.map(x => x.toLowerCase().toString()).includes(item.certificateNo.toLowerCase())).map(x => x.invId);
        fetchCertificateIds = fetchCertificateIds.filter(item => !existCertificates.includes(item.toLowerCase()));
      }

      if (fetchCertificateIds.length > 0)
        await this.loadInventoryByCertificate(fetchCertificateIds);

      if (existCertificatesInList.length > 0) {
        this.mySelection = existCertificatesInList;
        this.listAcceptedInventoryItems = this.listInventoryItems.filter(x => this.mySelection.includes(x.invId));
        if (this.listAcceptedInventoryItems.length > 0)
          this.gridAcceptedSummary = this.calculateSummaryAll(this.listAcceptedInventoryItems);
      }
      this.spinnerService.hide();

    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public onCommonADisc(event: any) {
    try {
      let amount = event.target.value;

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

        if (this.leadObj.id) {
          if (this.leadObj.leadStatus.toLowerCase() == LeadStatus.Order.toString().toLowerCase()) {
            if (this.leadObj.leadAdminFlag == false)
              return this.alertDialogService.show("Kindly, wait for admin approval about additional discount");
          }

          if (this.leadTitle.toLowerCase() != this.leadUpdateStatus.toLowerCase()) {

            let leadInventoryItems: InvItem[] = await this.leadService.getStonesByLeadId(this.leadObj.id, " " as any);

            let flag: boolean = leadInventoryItems.filter(a => this.mySelection.includes(a.invId)).some(x => x.isHold && !x.isRejected);
            if (flag) {
              if (this.leadObj.leadStatus.toLowerCase() == LeadStatus.Proposal.toString().toLowerCase()) {
                let holdStones = leadInventoryItems.filter(x => x.isHold && !x.isRejected);
                if (holdStones.length > 0)
                  return this.getHoldByOtherSeller(holdStones);
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

          let exist: boolean = this.leadObj.leadInventoryItems.some(x => x.aDiscount < 0);
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


          if (this.listAcceptedInventoryItems.length == 0)
            this.listAcceptedInventoryItems.length = this.listInventoryItems.length

          if (this.listAcceptedInventoryItems.length == this.listInventoryItems.length)
            onlyApprove = true;

          if (this.leadUpdateStatus.toLowerCase() != LeadStatus.Rejected.toLowerCase()) {
            if (onlyApprove) {
              if (this.leadTitle.toLowerCase() != this.leadUpdateStatus.toLowerCase())
                confirmationMessage = `Do you want to move lead on ${this.leadUpdateStatus}`;
              else
                confirmationMessage = `Do you want to Update the lead?`;

            }
            else {
              if (this.leadTitle.toLowerCase() == this.leadUpdateStatus.toLowerCase())
                confirmationMessage = `Do you want to Update the lead?`;
              else
                confirmationMessage = `Are you want to split a lead on hold for <b>${this.listAcceptedInventoryItems.map(x => x.stoneId).join(", ")}</b> stones?`;
            }
          }
          else
            confirmationMessage = `Do you want to Rejected the lead?`;

        }
        else
          confirmationMessage = `Do you want to Add the lead?`

        this.alertDialogService.ConfirmYesNo(confirmationMessage, "Lead")
          .subscribe(async (res: any) => {
            if (res.flag) {
              this.spinnerService.show();
              if (this.leadUpdateStatus.toLowerCase() == LeadStatus.Rejected.toString().toLowerCase()) {
                this.spinnerService.hide();
                this.isRejectedOffer = true;
              }
              else {
                if (!this.isEditLead) {
                  this.leadObj = new Lead();
                  this.leadObj.customer = this.customerObj;
                  this.leadObj.broker = this.brokerObj;
                  this.leadObj.seller = this.sellerObj;

                  this.leadObj.leadInventoryItems = new Array<InvItem>();
                  if (this.listInventoryItems.length > 0)
                    for (let index = 0; index < this.listInventoryItems.length; index++) {
                      const element = this.listInventoryItems[index];
                      let invItem = new InvItem();
                      invItem.invId = element.invId;
                      if (element.aDiscount)
                        invItem.aDiscount = element.aDiscount;

                      this.leadObj.leadInventoryItems.push(invItem);
                    }

                  let existAdminRequest: boolean = this.leadObj.leadInventoryItems.some(x => x.aDiscount < 0);
                  if (existAdminRequest) {
                    this.spinnerService.hide();
                    return this.alertDialogService.show("Found additional discount greater then permissionable, please create lead without discount!")
                  }

                  this.leadObj.leadSummary = new LeadSummary();
                  this.leadObj.leadSummary.totalAmount = this.gridDetailSummary.totalAmount;
                  this.leadObj.leadSummary.totalCarat = this.gridDetailSummary.totalCarat;
                  this.leadObj.leadSummary.totalPcs = this.gridDetailSummary.totalPcs;

                  let response: string = await this.leadService.leadInsert(this.leadObj);
                  if (response) {
                    this.spinnerService.hide();
                    this.utilityService.showNotification(`You have been genrated lead successfully!`);
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
                      this.listAcceptedInventoryItems.forEach(x => x.isHold = true);
                      leadNewObj.leadInventoryItems = this.listAcceptedInventoryItems;
                      leadNewObj.leadSummary = this.gridAcceptedSummary;
                      let response = await this.leadService.leadInsert(leadNewObj);
                      if (response) {
                        let invIds = this.listAcceptedInventoryItems.map(x => x.invId);
                        await this.inventoryService.updateInventoryHoldUnHoldById(invIds, true);
                        await this.inventoryService.updateInventoryHoldBy(invIds, this.leadObj.seller.name);
                        this.listInventoryItems = this.leadObj.leadInventoryItems.filter(o => !this.listAcceptedInventoryItems.some((a) => a.invId == o.invId));
                        this.leadObj.isVolDiscFlag = !this.leadObj.isVolDiscFlag;
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
            else
              this.mySelection = [];
          });
      }
      else {
        this.spinnerService.hide();
        Object.keys(form.controls).forEach((key) => {
          form.controls[key].markAsTouched();
        });
      }
    } catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async updateLeadCommonMethod(action: boolean = false, isNotify: boolean = false, isSeller: boolean = true) {

    let invitems = await this.leadService.getStonesByLeadId(this.leadObj.id, " " as any);
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
      if (this.leadObj.leadStatus.toLowerCase() == LeadStatus.Order.toString().toLowerCase())
        this.leadObj.leadInventoryItems = mergedInvitems;
    }

    // let orderInventoryItems = JSON.parse(JSON.stringify(this.listInventoryItems));
    // this.listInventoryItems = this.leadObj.leadInventoryItems;
    // if (this.leadUpdateStatus.toLowerCase() == LeadStatus.Hold.toLowerCase())
    //   this.listInventoryItems.forEach(x => (!x.isRejected) ? x.isHold = true : x.isHold = false);
    // if (this.leadUpdateStatus.toLowerCase() == LeadStatus.Order.toLowerCase()) {
    //   this.listInventoryItems = orderInventoryItems;
    //   this.listInventoryItems.forEach(x => (!x.isRejected) ? x.isHold = true : x.isHold = false);
    // }
    // if (this.leadUpdateStatus.toLowerCase() == LeadStatus.Rejected.toLowerCase())
    //   this.listInventoryItems.forEach(x => { x.isHold = false; x.isRejected = true });

    if (this.leadUpdateStatus.toLowerCase() == LeadStatus.Rejected.toString().toLowerCase())
      this.gridDetailSummary = this.calculateSummaryAll(mergedInvitems.filter(x => x.isRejected));
    else
      this.gridDetailSummary = this.calculateSummaryAll(mergedInvitems.filter(x => !x.isRejected));
    this.leadObj.leadSummary = new LeadSummary();
    this.leadObj.leadSummary.totalAmount = this.gridDetailSummary.totalAmount;
    this.leadObj.leadSummary.totalCarat = this.gridDetailSummary.totalCarat;
    this.leadObj.leadSummary.totalPcs = this.gridDetailSummary.totalPcs;
    if (this.isRupee)
      this.leadObj.dollarRate = this.iNRPrice;
    if ((this.leadObj.platform == 'online' || this.leadObj.platform == 'offline') && (this.leadObj.leadStatus.toLowerCase() == LeadStatus.Order.toString().toLowerCase() || this.leadObj.leadStatus.toLowerCase() == LeadStatus.Rejected.toString().toLowerCase()))
      this.leadObj.leadSummary = this.gridDetailSummary;

    if (this.leadUpdateStatus.toLowerCase() == LeadStatus.Order.toString().toLowerCase())
      this.leadObj.orderDate = this.utilityService.setLiveUTCDate();

    let response = await this.leadService.leadUpdate(this.leadObj);
    if (response) {
      this.isAddLead = action;

      let invIds = this.listInventoryItems.map(x => x.invId);

      if (this.leadUpdateStatus.toLowerCase() == LeadStatus.Rejected.toString().toLowerCase())
        await this.inventoryService.updateInventoryHoldUnHoldById(invIds, false);

      if (this.leadObj.leadStatus.toLowerCase() == LeadStatus.Hold.toString().toLowerCase() && this.leadUpdateStatus.toLowerCase() == LeadStatus.Hold.toString().toLowerCase())
        await this.inventoryService.updateInventoryHoldUnHoldById(invIds, true);

      if (this.leadUpdateStatus.toLowerCase() == LeadStatus.Order.toString().toLowerCase()) {
        if (this.leadTitle.toLowerCase() == LeadStatus.Proposal.toString().toLowerCase())
          await this.inventoryService.updateInventoryHoldUnHoldById(invIds, true);

        await this.inventoryService.updateInventoryStatusById(invIds, FrontStoneStatus.Order.toString());

      }
      if (!action)
        this.closeLeadDialog();
      this.utilityService.showNotification("You have been updated lead successfully!");
      if (isNotify) {
        this.sendMessage(this.leadObj, isSeller);

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
    this.gridViewLeadInventory = process(this.gridInventoryData, { group: this.groups });
    this.gridViewLeadInventory.total = this.listInventoryItems.length;
  }
  //#endregion

  //#region Dialog Methods

  public closeLeadDialog() {
    this.toggle.emit();
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
        leadInvItems = await this.leadService.getStonesByLeadId(leadItem.id, " " as any);
        leadInvItems = leadInvItems.filter(x => !x.isRejected);
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
      this.loadInventory(this.leadObj.leadInventoryItems)
      this.isEditLead = action;


    } catch (error: any) {
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

    let rapCount = inventoryItems.reduce((acc, cur) => acc + (cur.price.rap ?? 0), 0);

    leadSummaryLocal.totalPcs = inventoryItems.length;
    leadSummaryLocal.avgRap = rapCount / leadSummaryLocal.totalPcs;

    leadSummaryLocal.avgDiscPer = (((leadSummaryLocal.totalAmount / leadSummaryLocal.totalRAP) * 100) - 100);
    leadSummaryLocal.perCarat = leadSummaryLocal.totalAmount / leadSummaryLocal.totalCarat;

    //#region  VOW calculation
    let totalVowValue = Number((leadSummaryLocal.totalAmount + this.lastPurchase).toFixed(2));
    let vowDiscount = 0;
    if ((this.schemes && this.leadObj.isVolDiscFlag) || (this.schemes && isHardVol)) {
      let schemeDetail = this.schemes.details.find(c => c.from <= totalVowValue && totalVowValue <= c.to);
      if (schemeDetail)
        vowDiscount = schemeDetail?.discount;
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

    //#endregion
    if (this.leadObj.leadSummary.totalVOWDiscPer)
      leadSummaryLocal.totalVOWDiscPer = this.leadObj.leadSummary.totalVOWDiscPer;

    if (this.leadObj.leadSummary.totalAmount)
      leadSummaryLocal.totalVOWDiscAmount = this.leadObj.leadSummary.totalVOWDiscAmount;


    leadSummaryLocal.totalVOWDiscAmount = (leadSummaryLocal.totalAmount * leadSummaryLocal.totalVOWDiscPer) / 100;
    leadSummaryLocal.totalPayableAmount = leadSummaryLocal.totalAmount - leadSummaryLocal.totalVOWDiscAmount;
    if (leadSummaryLocal.totalVOWDiscPer) {
      leadSummaryLocal.discPer = leadSummaryLocal.totalPayableAmount / leadSummaryLocal.totalRAP * 100 - 100;
      leadSummaryLocal.pricePerCarat = leadSummaryLocal.avgRap + (leadSummaryLocal.avgRap * leadSummaryLocal.discPer / 100);
    }

    return leadSummaryLocal;
  }
  //#endregion



  //#region Grid Config
  public openGridConfigDialog(): void {
    this.fields = this.fields.filter(x => x.propertyName.toLowerCase() != 'checkbox');
    this.isGridConfig = true;
    if (this.editCardStatus.toLowerCase() == LeadStatus.Order.toString().toLowerCase())
      this.gridName = "LeadInventoryGridApproved";
    else
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
        else
          this.fields = await this.gridPropertiesService.getLeadInventoryItems();
      }

      if (this.isAdmin || this.leadObj.leadStatus.toLowerCase() == LeadStatus.Order.toString().toLowerCase() || this.leadObj.leadStatus.toLowerCase() == LeadStatus.Rejected.toString().toLowerCase() || this.leadObj.platform.toLowerCase() == 'online')
        this.fields = this.fields.filter(c => c.title.toLowerCase() != "checkbox");

      if (this.leadObj.platform.toLowerCase() == "online")
        this.fields = this.fields.filter(c => c.propertyName.toLowerCase() != "adiscount" && c.propertyName.toLowerCase() != "fdiscount" && c.propertyName.toLowerCase() != 'brokeramount' && c.title.toLowerCase() != 'volume amount');
      else
        this.fields = this.fields.filter(c => c.title.toLowerCase() != 'vow amount');

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
  public openDeleteDialog() {
    try {

      let message: string = "";
      message = this.mySelection.length == 1 ? "Stone has been deleted successfully!" : "Stones have been deleted successfully!";
      this.alertDialogService.ConfirmYesNo("Are you sure you want to delete?", "Delete")
        .subscribe(async (res: any) => {
          if (res.flag) {
            if (this.leadObj.id) {

              let listOfAllLeadStones: InvItem[] = await this.leadService.getStonesByLeadId(this.leadObj.id, " " as any);
              let listOfSelecetdLeadStones = listOfAllLeadStones.filter(x => this.mySelection.includes(x.invId));
              if (this.leadTitle.toLowerCase() == LeadStatus.Hold.toString().toLowerCase())
                listOfSelecetdLeadStones.forEach(x => x.isRejected = true);
              else
                listOfSelecetdLeadStones.forEach(x => { x.isHold = false; x.isRejected = true });

              let listOfNotSelecetdLeadStones = listOfAllLeadStones.filter(x => !this.mySelection.includes(x.invId));
              listOfAllLeadStones = [...listOfSelecetdLeadStones, ...listOfNotSelecetdLeadStones]
              this.leadObj.leadInventoryItems = listOfAllLeadStones;

              if (this.leadTitle.toLowerCase() == LeadStatus.Hold.toString().toLowerCase())
                this.listInventoryItems = listOfAllLeadStones.filter(x => !x.isRejected && x.isHold);
              else
                this.listInventoryItems = listOfAllLeadStones.filter(x => !x.isRejected);


              if (this.leadObj.leadInventoryItems.length == this.leadObj.leadInventoryItems.filter(z => z.isRejected).length) {
                this.leadObj.leadStatus = LeadStatus.Rejected.toString();
                this.gridDetailSummary = this.calculateSummaryAll(listOfAllLeadStones);
              }
              else
                this.gridDetailSummary = this.calculateSummaryAll(this.listInventoryItems);

              this.leadObj.leadSummary = new LeadSummary();
              this.leadObj.leadSummary.totalAmount = this.gridDetailSummary.totalAmount;
              this.leadObj.leadSummary.totalCarat = this.gridDetailSummary.totalCarat;
              this.leadObj.leadSummary.totalPcs = this.gridDetailSummary.totalPcs;

              let responseLeadUpdate = await this.leadService.leadUpdate(this.leadObj);

              if (responseLeadUpdate) {
                if (this.leadTitle.toLowerCase() == LeadStatus.Hold.toString().toLowerCase())
                  await this.inventoryService.updateInventoryHoldUnHoldById(this.leadObj.leadInventoryItems.filter(z => z.isRejected).map(x => x.invId), false);
                if (this.listInventoryItems.length > 0)
                  this.loadInventory(this.listInventoryItems);
                else
                  this.closeLeadDialog();
                this.mySelection = [];
              }
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
              else
                this.loadInventory(this.listInventoryItems);
            }
          }
        })
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(error.error)
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
        let listOfAllLeadStones = await this.leadService.getStonesByLeadId(this.leadObj.id, " " as any);
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
    if (this.leadUpdateStatus.toLowerCase() == LeadStatus.Rejected.toString().toLowerCase()) {
      this.leadObj.leadStatus = this.leadUpdateStatus;
      this.leadObj.leadInventoryItems.forEach(x => { x.isHold = false; x.isRejected = true });
      this.leadObj.leadSummary = this.calculateSummaryAll(this.leadObj.leadInventoryItems.filter(x => x.isRejected));
    }
    let responseLeadUpdate = await this.leadService.leadUpdate(this.leadObj);

    if (responseLeadUpdate) {
      responseReturn = true;
      if (this.leadTitle.toLowerCase() == LeadStatus.Hold.toString().toLowerCase())
        await this.inventoryService.updateInventoryHoldUnHoldById(this.leadObj.leadInventoryItems.filter(z => z.isRejected).map(x => x.invId), false);
      let responseRejectedStone: RejectedStone[] = await this.rejectedStoneService.InsertList(this.rejectedStone);
      if (responseRejectedStone) {
        responseReturn = true;
        this.listInventoryItems = this.listInventoryItems.filter(z => !z.isRejected);
        if (this.listInventoryItems.length == 0)
          this.closeLeadDialog();
        else {
          this.loadInventory(this.listInventoryItems);
          this.toggle.emit(false);
        }
      }
      this.mySelection = [];
      this.removeReasonModel = '';
      this.toggleRMReasonDialog();
    }

    return responseReturn;
  }

  public async closeRejectedDialog(event: any) {
    this.isRejectedOffer = event.isClose;
    if (event.isUpdate) {
      let response = await this.leadUpdatewithRejectedStones();
      if (response) {
        let leadRejectedOfferObj = new LeadRejectedOffer();
        leadRejectedOfferObj.leadNo = this.leadObj.leadNo;
        leadRejectedOfferObj.customer = this.leadObj.customer;
        leadRejectedOfferObj.broker = this.leadObj.broker;
        leadRejectedOfferObj.seller = this.leadObj.seller;
        leadRejectedOfferObj.rejectedInvItems = event.invItem;
        let insertOfferResponse = await this.leadService.leadRejectedOfferInsert(leadRejectedOfferObj);
        if (insertOfferResponse) {
          leadRejectedOfferObj.id = insertOfferResponse;
          await this.sendRejectedLeadMessage(leadRejectedOfferObj);

        }
      }
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

  /* #region  Editable Customer */
  public toggleEditCustomer() {
    this.isEditableCustomer = true;
  }
  /* #endregion */

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
                this.brokerObj = this.leadObj.broker;
                if (isDelete)
                  this.selectedBrokerItem = { text: "", value: "" };
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
          } catch (error: any) {
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

    if (this.listAcceptedInventoryItems.length == 0)
      this.gridDetailSummary = this.calculateSummaryAll(this.listInventoryItems);
    else
      this.gridAcceptedSummary = this.calculateSummaryAll(this.listAcceptedInventoryItems);

    if (this.listAcceptedInventoryItems.length == 1)
      this.gridDetailSummary = this.calculateSummaryAll(this.listInventoryItems, true);
  }


  public async submitSplitLead() {

    let exist: boolean = this.leadObj.leadInventoryItems.some(x => x.aDiscount < 0);
    let leadInventoryItemsTOUpdate: InvItem[] = await this.leadService.getStonesByLeadId(this.leadObj.id, " " as any);

    if (this.leadObj.leadStatus.toLowerCase() == LeadStatus.Order.toString().toLowerCase()) {
      if (this.leadObj.leadAdminFlag == false)
        return this.alertDialogService.show("Kindly, wait for admin approval about additional discount");
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
              this.isRejectedOffer = true;
            }
            else {

              if (!onlyApprove) {
                if (this.leadTitle.toLowerCase() == this.leadUpdateStatus.toLowerCase()) {
                  this.leadObj.leadStatus = this.leadUpdateStatus.toString();
                  this.leadObj.leadInventoryItems = this.listInventoryItems;
                  await this.updateLeadCommonMethod();
                }
                else {
                  let leadNewObj = new Lead();
                  leadNewObj.customer = this.leadObj.customer;
                  leadNewObj.broker = this.leadObj.broker;
                  leadNewObj.seller = this.leadObj.seller;
                  leadNewObj.leadStatus = LeadStatus.Order.toString();
                  leadNewObj.leadInventoryItems = this.listAcceptedInventoryItems;
                  leadNewObj.leadSummary = this.gridAcceptedSummary;
                  leadNewObj.orderDate = this.utilityService.setLiveUTCDate();
                  let response = await this.leadService.leadInsert(leadNewObj);
                  if (response) {
                    let acceptedInvIds = this.listAcceptedInventoryItems.map(x => x.invId);
                    if (leadNewObj.leadStatus.toLowerCase() == LeadStatus.Order.toString().toLowerCase())
                      await this.inventoryService.updateInventoryStatusById(acceptedInvIds, FrontStoneStatus.Order.toString());
                    this.listInventoryItems = leadInventoryItemsTOUpdate.filter(o => !this.listAcceptedInventoryItems.some((a) => a.invId == o.invId));
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
          else
            this.mySelection = [];
        })
    }
    else {
      this.alertDialogService.ConfirmYesNo("Do you want to update lead", "Lead")
        .subscribe(async (res: any) => {
          if (res.flag) {
            await this.updateLeadCommonMethod();

          }
        });
    }

  }
  //#endregion

  //#region toggle Rejected Stone List
  public async toggleRejectedStone() {
    this.visibleRejectedStone = !this.visibleRejectedStone;

    let leadInvItems = new Array<InvItem>();
    if (this.visibleRejectedStone) {
      if (this.leadObj.leadStatus.toLowerCase() != LeadStatus.Order.toString().toLowerCase())
        leadInvItems = await this.leadService.getStonesByLeadId(this.leadObj.id, true);
      else {
        leadInvItems = await this.leadService.getStonesByLeadId(this.leadObj.id, " " as any);
        leadInvItems = leadInvItems.filter(o => o.isRejected);
      }
      if (leadInvItems.length > 0)
        this.fields = this.fields.filter(o => o.title.toLowerCase() != 'checkbox' && o.propertyName.toLowerCase() != 'adiscount');
    }
    else {
      if (this.leadObj.leadStatus.toLowerCase() != LeadStatus.Order.toString().toLowerCase())
        leadInvItems = await this.leadService.getStonesByLeadId(this.leadObj.id, false);
      else {
        leadInvItems = await this.leadService.getStonesByLeadId(this.leadObj.id, " " as any);
        leadInvItems = leadInvItems.filter(o => !o.isRejected);
      }
      if (leadInvItems.length > 0) {
        this.fields = this.gridPropertiesService.getLeadInventoryItems();
        if (this.leadObj.leadStatus.toLowerCase() == LeadStatus.Order.toString().toLowerCase())
          this.fields = this.fields.filter(o => o.title.toLowerCase() != 'checkbox' && o.propertyName.toLowerCase() != 'adiscount');
      }
    }

    if (this.visibleRejectedStone) {
      if (leadInvItems.length > 0) {
        this.leadObj.leadInventoryItems = leadInvItems;
        this.listInventoryItems = this.leadObj.leadInventoryItems;
        this.loadInventory(this.leadObj.leadInventoryItems)
      }
      else {
        this.visibleRejectedStone = false;
        this.alertDialogService.show('There is no rejected stone for this lead.');
      }
    }
    else {
      this.leadObj.leadInventoryItems = leadInvItems;
      this.listInventoryItems = this.leadObj.leadInventoryItems;
      this.loadInventory(this.leadObj.leadInventoryItems)
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

  //#region AcceptOrReject Online lead
  public AcceptOrRejectOnlineLead(action: string) {
    let actionType: string = "";

    if (action == LeadStatus.Order.toString().toLowerCase())
      actionType = LeadStatus.Order.toString();
    else
      actionType = LeadStatus.Rejected.toString();

    let confirmationMessage = `Are you sure you want to ${actionType} a lead?`;

    this.alertDialogService.ConfirmYesNo(confirmationMessage, "Lead")
      .subscribe(async (res: any) => {
        if (res.flag) {
          let leadInventoryItemsTOUpdate: InvItem[] = await this.leadService.getStonesByLeadId(this.leadObj.id, " " as any);
          this.leadObj.leadStatus = actionType;
          if (action == LeadStatus.Rejected.toString().toLowerCase()) {
            leadInventoryItemsTOUpdate.forEach(o => o.isHold = false);
            this.leadObj.leadInventoryItems = leadInventoryItemsTOUpdate;
          }
          else
            this.leadObj.leadInventoryItems = leadInventoryItemsTOUpdate;
          this.listInventoryItems = leadInventoryItemsTOUpdate;
          await this.updateLeadCommonMethod();
        }
      })

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
          let leadInventoryItemsTOUpdate: InvItem[] = await this.leadService.getStonesByLeadId(this.leadObj.id, " " as any);
          if (action == LeadStatus.Rejected.toString().toLowerCase()) {
            leadInventoryItemsTOUpdate.forEach(o => { o.aDiscount = 0 });
            this.leadObj.leadInventoryItems = leadInventoryItemsTOUpdate;
            this.leadObj.leadAdminFlag = null as any;
          }
          else {
            this.leadObj.leadAdminFlag = true;
            this.leadObj.leadInventoryItems = leadInventoryItemsTOUpdate;
          }

          this.listInventoryItems = leadInventoryItemsTOUpdate;
          await this.updateLeadCommonMethod(false, true, false);
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
    let exportData: InventoryItems[] = [];
    let selectedStoneIds = new Array<string>();

    if (this.excelOption == 'selected') {
      selectedStoneIds = this.listInventoryItems.filter(z => this.mySelection.includes(z.invId) && !z.isRejected).map(z => z.stoneId);
      exportData = await this.inventoryService.getInventoryByStoneIds(selectedStoneIds);
    }
    else {
      selectedStoneIds = this.listInventoryItems.filter(z => !z.isRejected).map(z => z.stoneId);
      exportData = await this.inventoryService.getInventoryByStoneIds(selectedStoneIds);

    }

    if (exportData && exportData.length > 0) {
      let invFields = await this.gridPropertiesService.getInventoryGrid();
      exportData.forEach(element => {
        let invExport = JSON.parse(JSON.stringify(element));
        let invItemFind = this.listInventoryItems.find(x => x.invId == invExport.id);
        if (invItemFind) {
          element.price.perCarat = invItemFind.perCarat;
          element.price.discount = invItemFind.fDiscount;
          element.price.netAmount = invItemFind.netAmount ?? 0;
        }
        var excel = this.convertArrayToObject(invFields, element);
        this.excelFile.push(excel);
      });

      if (this.excelFile.length > 0) {
        await this.exportExcelNew(exportData);
        this.excelOption = null;
        this.showExcelOption = false;
        this.mySelection = [];
      }
      this.spinnerService.hide();
    }
    else {
      this.alertDialogService.show('No Data Found!');
      this.spinnerService.hide();
    }
  }

  public async exportExcelNew(data: InventoryItems[]) {
    try {

      let invExcel: InvExcel = new InvExcel();
      invExcel.imageURL = environment.imageURL;
      invExcel.videoURL = environment.videoURL;
      invExcel.certiURL = environment.certiURL;
      invExcel.otherImageBaseURL = environment.otherImageBaseURL;
      invExcel.inventories = data;

      let response = await this.customerService.downloadEmployeeExcel(invExcel);
      if (response) {
        var downloadURL = window.URL.createObjectURL(response);
        var link = document.createElement('a');
        link.href = downloadURL;
        link.download = `${this.utilityService.exportFileName(this.leadObj.leadNo.toString())}`;
        link.click();
      }
    } catch (error: any) {
      this.alertDialogService.show("something went wrong, please try again or contact administrator");
      this.spinnerService.hide();
    }
  }

  public convertArrayToObject(fields: GridDetailConfig[], element: any): any {
    let iURL = (element.media.isPrimaryImage) ? environment.imageURL.replace("{stoneId}", element.stoneId.toLowerCase()) : "";
    let cURL = (element.media.isCertificate) ? environment.certiURL.replace("{certiNo}", element.certificateNo) : "";
    let vURL = (element.media.isHtmlVideo) ? environment.videoURL.replace("{stoneId}", element.stoneId.toLowerCase()) : "";
    var obj: any = {};
    for (let i = 0; i < fields.length; i++) {
      if (!(fields[i].title == "Checkbox")) {
        if (fields[i].title == "Media") {
          obj["CertificateUrl"] = cURL;
          obj["ImageUrl"] = iURL;
          obj["VideoUrl"] = vURL;
        }
        else if (fields[i].propertyName.includes("measurement")) {
          let propertyname = fields[i].propertyName.split(".")[1];
          obj[fields[i].title] = element.measurement[propertyname];
        }
        else if (fields[i].propertyName.includes("inclusion")) {
          let propertyname = fields[i].propertyName.split(".")[1];
          obj[fields[i].title] = element.inclusion[propertyname];
        }
        else if (fields[i].title == "Weight")
          obj[fields[i].title] = element.weight.toFixed(2);
        else if (fields[i].title == "$/CT")
          obj[fields[i].title] = ((element.basePrice.netAmount ?? 0) / element.weight).toFixed(3);
        else if (fields[i].title == "Rap")
          obj[fields[i].title] = element.basePrice.rap.toFixed(3);
        else if (fields[i].title == "Discount")
          obj[fields[i].title] = element.basePrice.discount?.toFixed(3);
        else if (fields[i].title == "NetAmount")
          obj[fields[i].title] = element.basePrice.netAmount?.toFixed(3);
        else
          obj[fields[i].title] = element[fields[i].propertyName];
      }
    }
    return obj;
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
              this.leadObj.leadInventoryItems = await this.leadService.getStonesByLeadId(this.leadObj.id, " " as any);
              leadObj = this.leadObj;
              leadObj.qcCriteria = this.qcReasonModel;
              let response = await this.leadService.leadUpdate(leadObj);
              if (response) {
                this.openQcReasonDialog();
                this.utilityService.showNotification(`You have been ${this.leadItem.qcCriteria ? "updated" : "added"} Qc Criteria successfully!`)
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

  /* #region  Section for Additional discount */
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
      if (target.aDiscount)
        target.fDiscount += Number(target.aDiscount);

      target.perCarat = this.utilityService.ConvertToFloatWithDecimal((target.price.rap + (target.price.rap * target.fDiscount / 100)));
      target.netAmount = this.utilityService.ConvertToFloatWithDecimal(target.perCarat * target.weight);
    }
  }

  //#endregion

  /* #region  Memo Request Section */
  public async raiseMemoRequest() {
    try {
      this.clearMemoIssueData();
      let isAdminRequest: boolean = this.leadObj.leadAdminFlag;
      if (isAdminRequest == false)
        return this.alertDialogService.show(`You made a request to admin for the negotiation, Kindly wait for the Admin response, memo request do it later!`);

      let existMemoStone = new Array<string>();
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
        let isExistMemo: boolean = memoRequestLeads.some(c => c.memoStoneIds.some(x => x.invId == element.invId) && c.isRequest == false);
        if (isExistMemo) {
          this.selectedMemoInvItems = this.selectedMemoInvItems.filter(x => x.stoneId != element.stoneId);
          existMemoStone.push(element.stoneId);
        }
        else
          memoStone.push(element.stoneId);
      });

      if (existMemoStone.length > 0 && this.selectedMemoInvItems.length == 0)
        return this.alertDialogService.show(`${existMemoStone.length > 0 ? `<b>${existMemoStone.join(", ")}</b> stone(s) are already in Memo. <br/>` : ""}`)

      this.memoMessage = `${existMemoStone.length > 0 ? `<b>${existMemoStone.join(", ")}</b> stone(s) are already in Memo. <br/>` : ""} Are you want to request a Memo for <b>${memoStone.join(", ")}</b> stone(s)?`;
      this.toggleMemoIssueDialog();

    } catch (error: any) {
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

              leadMemoRequest.party = this.setRequestParty(element.customer);
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
      this.alertDialogService.show('Memo issue not save, Try again later!');
    }
  }

  private mappingCustomerToMemoCustomer(customer: Customer): MemoRequestCustomer {
    let cust = new MemoRequestCustomer();
    cust.fullName = customer.fullName;
    cust.code = customer.code;
    cust.origin = customer.origin;
    cust.email = customer.email;
    cust.mobile1 = customer.mobile1;
    cust.mobile2 = customer.mobile2;
    cust.phoneNo = customer.phoneNo;
    cust.companyName = customer.companyName;
    cust.businessType = customer.businessType;
    cust.address = customer.address;
    cust.faxNo = customer.faxNo;
    cust.incomeTaxNo = customer.incomeTaxNo;
    cust.creditLimit = customer.creditLimit;
    return customer;
  }

  public async callMemoBackOfficeRequest(leadMemoRequest: LeadMemoRequest, supplierId: string): Promise<any> {
    let supplierObj = (await this.supplierService.getSupplierById(supplierId));
    if (supplierObj.apiPath) {
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
              this.sendMessageOnBackOffice('Memo Request', `Memo Request sent from Diamanto by ${this.fxCredential.fullName}`, memoParamBoId, element, 'MemoRequest');
            }
          }
          this.utilityService.showNotification(`Memo request has been sent to ${supplierObj.name}, Kindly wait for approval !`);
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
    orderRequestDNorm.name = obj.name ? obj.name : obj.fullName ?? "";
    orderRequestDNorm.email = obj.email;
    orderRequestDNorm.mobileNo = obj.mobile ? obj.mobile : obj.mobileNo ? obj.mobileNo : "";
    if (obj.companyName && origin == OriginValue.Customer.toLowerCase().toString())
      orderRequestDNorm.companyName = obj.companyName;
    return orderRequestDNorm;
  }

  public setRequestParty(obj: MemoRequestCustomer): LeadMemoParty {
    let party = new LeadMemoParty();
    party.id = obj.id;
    party.fullName = obj.fullName;
    party.code = obj.code;
    party.origin = obj.origin;
    party.email = obj.email;
    party.mobile1 = obj.mobile1;
    party.mobile2 = obj.mobile2;
    party.phoneNo = obj.phoneNo;
    party.companyName = obj.companyName;
    party.businessType = obj.businessType;
    party.address = obj.address;
    party.faxNo = obj.faxNo;
    party.incomeTaxNo = obj.incomeTaxNo;
    party.creditLimit = obj.creditLimit;
    return party;
  }
  /* #endregion */

  public toggleStoneDialog() {
    this.isStoneRequest = !this.isStoneRequest;
    this.requestedStoneIds = this.leadObj.leadInventoryItems.filter(a => a.isHold).map(x => x.stoneId).join(", ");
  }

  public getHoldByOtherSeller(holdStones: InvItem[]) {
    var distinctHeldby = holdStones.map((u: InvItem) => u.holdBy).filter((x: any, i: any, a: any) => x && a.indexOf(x) === i);
    let message = `Lead cannot be moved as it has hold <br/>`;
    for (let i = 0; i < distinctHeldby.length; i++) {
      let holdBy = distinctHeldby[i];
      let heldByInvItem = holdStones.filter(z => z.holdBy == holdBy);
      message += `<b>${heldByInvItem.map(x => x.stoneId).join(",")} </b>${(heldByInvItem.length == 1 ? "stone" : "stones")}, Respectivly InBusiness with <b>${holdBy} </b><br/>`
    }
    return this.alertDialogService.show(message);
  }

  /* #region  Notification section */
  public sendMessage(leadObj: Lead, isSeller = true) {
    this.message = new Notifications();
    if (this.configurationObj.adminUser && this.configurationObj.adminUser.id) {
      this.message.icon = "icon-erroricon";
      this.message.title = `${leadObj.leadNo}`;
      this.message.categoryType = "modal";
      this.message.description = `Lead notification by ${isSeller ? this.leadObj.seller.name : this.configurationObj.adminUser.fullName}`;
      this.message.action = "Lead";
      this.message.param = leadObj.id;
      this.message.senderId = this.fxCredential.id;
      this.message.receiverId = isSeller ? this.configurationObj.adminUser.id : this.leadObj.seller.id;
      this.notificationService.messages.next(this.message)

    }
    else
      this.alertDialogService.show("Kindly configure default admin in configuration");
  }

  public sendMessageOnBackOffice(messageText: string, description: string, param: any, receiverId: string, actionType: string = "modal") {
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
      this.notificationService.messages.next(this.message)
    }

  }

  public sendRejectedLeadMessage(leadRejecetdOfferObj: LeadRejectedOffer) {
    this.message = new Notifications();

    if (this.configurationObj.adminUser && this.configurationObj.adminUser.id) {
      this.message.icon = "icon-info";
      this.message.title = `${leadRejecetdOfferObj.leadNo}`;
      this.message.categoryType = "modal";
      this.message.description = `Lead Rejected by ${leadRejecetdOfferObj.seller.name}`;
      this.message.action = "leadrejected";
      this.message.param = leadRejecetdOfferObj.id;
      this.message.senderId = this.fxCredential.id;
      this.message.receiverId = this.configurationObj.adminUser.id;
      this.notificationService.messages.next(this.message)

    }
    else
      this.alertDialogService.show("Kindly configure default admin in configuration");
  }
  /* #endregion */

  public isValDiscToggle(value: boolean) {
    this.leadObj.isVolDiscFlag = value;
    if (this.listAcceptedInventoryItems.length > 0)
      this.gridAcceptedSummary = this.calculateSummaryAll(this.listAcceptedInventoryItems);
    else
      this.gridDetailSummary = this.calculateSummaryAll(this.listInventoryItems);
  }
}

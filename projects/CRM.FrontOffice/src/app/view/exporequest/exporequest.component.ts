import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { PageChangeEvent, RowClassArgs, SelectableSettings } from '@progress/kendo-angular-grid';
import { DataResult, GroupDescriptor, process } from '@progress/kendo-data-query';
import { NgxSpinnerService } from 'ngx-spinner';
import { keys } from 'shared/auth';
import { GridDetailConfig } from 'shared/businessobjects';
import { Notifications } from 'shared/enitites';
import { ExpoStatus, FrontStoneStatus, InvHistoryAction, LeadStatus, listCurrencyType, NotificationService, OriginValue, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { ExpoRequestCriteria, ExpoRequestResponse, ExpoRequestSummary, ExpoUpdate, OrderRequest } from '../../businessobjects';
import { CurrencyType, Customer, CustomerDNorm, ExpoRequests, fxCredential, InventoryItems, InvHistory, InvItem, Lead, LeadSummary, RequestDNorm, Scheme, SupplierDNorm, SystemUser, SystemUserDNorm } from '../../entities';
import { AppPreloadService, ConfigurationService, CustomerService, ExpoRequestService, GridPropertiesService, InventoryService, LeadService, OrderService, SchemeService, SupplierService, SystemUserService, InvHistoryService } from '../../services';
declare var Spacecode: any;

@Component({
  selector: 'app-exporequest',
  templateUrl: './exporequest.component.html',
  styleUrls: ['./exporequest.component.css'],
})
export class ExpoRequestComponent implements OnInit {
  public fxCredential!: fxCredential;

  //#region Grid Init
  public groups: GroupDescriptor[] = [];
  public pageSize = 26;
  public skip = 0
  public fields!: GridDetailConfig[];
  public invFields!: GridDetailConfig[];
  public orderInvFields!: GridDetailConfig[];
  public gridView!: DataResult;
  public mySelection: string[] = [];
  public selectableSettings: SelectableSettings = {
    mode: 'single',
  };
  public invSelectableSettings: SelectableSettings = {
    mode: 'multiple', checkboxOnly: true
  };
  public myInvSelection: string[] = [];
  //#endregion

  //#region List | Objects
  public expoRequestsData: ExpoRequests[] = [];
  public expoRequestCriteria: ExpoRequestCriteria = new ExpoRequestCriteria();
  public expoRequestObj: ExpoRequests = new ExpoRequests();
  public expoRequestsSummary: ExpoRequestSummary = new ExpoRequestSummary();

  public reqInventories: InventoryItems[] = [];
  public isViewDetail = false;
  public isOrder = false;
  public isCustomer = false;

  public customersItems: CustomerDNorm[] = [];
  public listCustomerItems: Array<{ text: string; value: string }> = [];
  public selectedCustomer!: string;

  public supplierItems: SupplierDNorm[] = [];
  public listSupplierItems: Array<{ text: string; value: string }> = [];
  public selectedSupplier!: string;

  public ccType!: string;
  public ccRate!: number;
  public dollarConversionRateList: Array<CurrencyType> = new Array<CurrencyType>();

  public leadObj: Lead = new Lead();
  public schemes: Scheme = new Scheme();
  //#endregion

  //#region Filters
  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains'
  };

  public filterFlag = true;

  public listSellerDNormItems: Array<{ name: string; value: string, isChecked: boolean }> = [];
  public stoneId!: string;
  public reqNumbers!: string;
  public certificateNo!: string;
  public device: any;
  public selectedRfids: Array<string> = new Array<string>();
  public filterOrAddText!: string;
  public listStatus: Array<{ name: string, isChecked: boolean }> = [];
  //#endregion

  constructor(
    private expoRequestService: ExpoRequestService,
    private inventoryService: InventoryService,
    private customerService: CustomerService,
    private supplierService: SupplierService,
    private leadService: LeadService,
    public schemeService: SchemeService,
    public orderService: OrderService,
    private router: Router,
    private gridPropertiesService: GridPropertiesService,
    private alertDialogService: AlertdialogService,
    private spinnerService: NgxSpinnerService,
    private appPreloadService: AppPreloadService,
    public utilityService: UtilityService,
    private configurationService: ConfigurationService,
    private systemUserService: SystemUserService,
    private notificationService: NotificationService,
    private invHistoryService: InvHistoryService) { }

  async ngOnInit() {
    await this.loadDefaultMethods();
  }

  //#region Init Data
  public async loadDefaultMethods() {
    try {
      this.fxCredential = await this.appPreloadService.fetchFxCredentials();
      if (!this.fxCredential)
        this.router.navigate(["login"]);

      this.utilityService.filterToggleSubject.subscribe(flag => {
        this.filterFlag = flag;
      });

      this.expoRequestCriteria = new ExpoRequestCriteria();
      this.fields = this.gridPropertiesService.getExpoRequestListGrid();
      this.invFields = this.gridPropertiesService.getExpoRequestInvListGrid();
      this.orderInvFields = this.gridPropertiesService.getExpoRequestOrderInvListGrid();

      this.spinnerService.show();
      this.loadRfIdDevice();
      await this.loadSellerDNorm();
      await this.loadSuppliersData();
      await this.loadCurrencyConfig();
      await this.loadExpoRequestData();
      this.loadExpoRequestSummaryData();

      this.schemes = await this.schemeService.getOnlineSchemeAsync(false);
      Object.values(ExpoStatus).forEach(z => { if (z != ExpoStatus.Order.toString()) this.listStatus.push({ name: z?.toString(), isChecked: false }); });
    } catch (error: any) {
      console.error(error);
      this.alertDialogService.show('Data not load, Try again later!');
    }
  }

  private loadRfIdDevice() {
    try {
      let deviceUrl: string = '';
      deviceUrl = "ws://" + keys.rfidAPIUrlFO;

      this.device = new Spacecode.Device(deviceUrl);
      this.device.connect();
    } catch (error: any) {
      console.error(error);
      this.alertDialogService.show('RFID Device not run!', 'Error');
    }
  }

  private async loadSellerDNorm() {
    try {
      let sellers: SystemUser[] = await this.systemUserService.getSystemUserByOrigin(OriginValue.Seller.toString());

      sellers.forEach((item) => {
        this.listSellerDNormItems.push({ name: item.fullName, value: item.id, isChecked: false });
      });
    }
    catch (error: any) {
      console.error(error);
      this.alertDialogService.show(error.error);
    }
  }

  public async loadExpoRequestData() {
    try {
      this.setAdditionalData();
      this.spinnerService.show();
      let res: ExpoRequestResponse = await this.expoRequestService.getExpoRequestPaginated(this.expoRequestCriteria, this.skip, this.pageSize);
      if (res) {
        this.expoRequestsData = res.expoRequests;
        this.gridView = process(res.expoRequests, { group: this.groups });
        this.gridView.total = res.totalCount;
        this.spinnerService.hide();
      }
      else {
        this.alertDialogService.show('Data not get Try again later!');
        this.spinnerService.hide();
      }
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Something went wrong, Try again later!');
    }
  }

  public async loadExpoRequestSummaryData() {
    try {
      let res: ExpoRequestSummary = await this.expoRequestService.getExpoRequestSummary(this.expoRequestCriteria);
      if (res)
        this.expoRequestsSummary = res;
      else
        this.alertDialogService.show('Summary Data not get, Try again later!', 'error');
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Something went wrong, Try again later!');
    }
  }

  private setAdditionalData() {
    this.expoRequestCriteria.stoneIds = this.stoneId ? this.utilityService.CheckStoneIds(this.stoneId).map(x => x.toUpperCase()) : [];
    if (this.reqNumbers) {
      let leadNos: Array<number> = (this.utilityService.checkCertificateIds(this.reqNumbers).map(x => (this.utilityService.containsOnlyNumbers(x)) ? Number(x) : 0)).filter(a => a != 0) ?? new Array<number>();
      this.expoRequestCriteria.numbers = this.reqNumbers ? leadNos : [];
    }
    else
      this.expoRequestCriteria.numbers = new Array<number>();

    this.expoRequestCriteria.certificateNos = this.certificateNo ? this.utilityService.checkCertificateIds(this.certificateNo) : [];
  }

  public async getRequestInventories() {
    try {
      this.reqInventories = [];
      if (this.expoRequestObj.invItems.length > 0) {
        this.spinnerService.show();
        let stoneIds = this.expoRequestObj.invItems.map(z => z.stoneId);

        this.reqInventories = await this.inventoryService.getInventoryByStoneIds(stoneIds);
        if (this.reqInventories.length > 0) {
          let otherIssuedStoneIds = await this.expoRequestService.checkOtherIssueStones(stoneIds, this.expoRequestObj.id);

          this.reqInventories.forEach(z => {
            let expoReqInv = this.expoRequestObj.invItems.find(a => a.stoneId == z.stoneId);
            if (expoReqInv != null) {
              z.status = expoReqInv.status;
              z.createdDate = expoReqInv.issueAt ?? null as any;
              z.createdBy = expoReqInv.issueBy ?? null as any;
              z.updatedAt = expoReqInv.receiveAt ?? null as any;
              z.updatedBy = expoReqInv.receiveBy ?? null as any;
            }

            let otherIssuedStoneId = otherIssuedStoneIds.find(a => a == z.stoneId);
            //Use 'hasTask' for Check Other Expo Request Issued stones
            if (otherIssuedStoneId != null)
              z.hasTask = true;
            else
              z.hasTask = false;

          });

          this.reqInventories = this.reqInventories.sort(function (a, b) {
            return a.stoneId.localeCompare(b.stoneId, undefined, {
              numeric: true,
              sensitivity: 'base'
            });
          });

          this.spinnerService.hide();
        }
        else
          this.spinnerService.hide();
      }
    } catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Something went wrong, Try again later!');
    }
  }

  public async handleCustomerFilter(value: any) {
    try {
      if (value) {
        this.spinnerService.show();
        this.customersItems = await this.customerService.getAllCustomerDNormsByName(value);
        this.listCustomerItems = [];
        this.customersItems.reverse().forEach(z => { this.listCustomerItems.push({ text: z.companyName + ' | ' + z.name, value: z.id }); });
        this.spinnerService.hide();
      }
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async loadSuppliersData() {
    try {
      this.supplierItems = await this.supplierService.getSupplierDNorm();
      if (this.supplierItems.length > 0) {
        this.listSupplierItems = [];
        this.supplierItems.forEach(z => { this.listSupplierItems.push({ text: z.name, value: z.id }); });
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }

  }

  public async loadCurrencyConfig() {
    try {
      let currencyList = await this.configurationService.getCurrencyTypesList();
      if (currencyList && currencyList.length > 0) {
        this.dollarConversionRateList = Array<CurrencyType>();
        currencyList.unshift({ fromCurrency: listCurrencyType.USD, fromRate: 1, toCurrency: listCurrencyType.USD, toRate: 1, id: null as any });
        this.dollarConversionRateList = currencyList.filter(x => x.fromCurrency == listCurrencyType.USD);
        this.ccType = (this.dollarConversionRateList.find(x => x.toCurrency == listCurrencyType.USD)?.toCurrency) ?? "";
        this.ccRate = (this.dollarConversionRateList.find(x => x.toCurrency == listCurrencyType.USD)?.toRate) ?? 0;
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }
  //#endregion

  //#region OnChange Functions
  public getCommaSapratedStringFromData(vals: any[], list: Array<{ name: string; value: string; isChecked: boolean }>, isAll: boolean = false): string {
    let names = list.filter(z => vals.includes(z.value)).map(z => z.name.substring(0, 3) + '.');
    if (isAll)
      names = list.filter(z => vals.includes(z.value)).map(z => z.name);

    let name = names.join(',')
    if (!isAll)
      if (name.length > 15)
        name = name.substring(0, 15) + '...';

    return name;
  }

  public async copyToClipboard() {
    let issueStones = this.expoRequestObj.invItems.filter(z => z.status == ExpoStatus.Issue.toString()).map(z => z.stoneId);
    if (issueStones.length > 0) {
      navigator.clipboard.writeText(issueStones.join(', '));
      this.utilityService.showNotification(`Copy to clipboard successfully!`);
    }
    else
      this.utilityService.showNotification(`No Issue Stone Found!`, 'warning');
  }

  public getStatusCount(data: ExpoRequests, status: string): number {
    if (status == "issueCount")
      return data.invItems.filter(z => z.status == ExpoStatus.Issue.toString()).length;
    else if (status == "pendingCount")
      return data.invItems.filter(z => z.status == ExpoStatus.Pending.toString()).length;
    else
      return data.invItems.filter(z => z.status == ExpoStatus.Order.toString() || z.status == ExpoStatus.Received.toString()).length;
  }

  public async currencyChange() {
    this.ccRate = (this.dollarConversionRateList.find(x => x.toCurrency == this.ccType)?.toRate) ?? 0;
  }

  public isNotValid(args: RowClassArgs) {
    var invalidStatus: string[] = [LeadStatus.Hold.toString(), LeadStatus.Order.toString(), LeadStatus.Delivered.toString(), LeadStatus.Cart.toString()];
    if (args.dataItem.leadStatus)
      return { 'table-row-bg-red': (invalidStatus.includes(args.dataItem.leadStatus) && args.dataItem.status != ExpoStatus.Order.toString()) }

    if (args.dataItem.hasTask)
      return { 'table-row-bg-red': args.dataItem.hasTask == true }

    if (args.dataItem.status)
      return { 'table-row-bg-yellow': args.dataItem.status == ExpoStatus.Issue.toString() }

    return null as any
  }

  public groupChange(groups: GroupDescriptor[]): void {
    try {
      this.groups = groups;
      this.loadExpoRequestData();
    }
    catch (error: any) {
      this.alertDialogService.show(error.error)
    }
  }

  public pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.loadExpoRequestData();
  }

  public selectedRowChange(event: any) {
    this.expoRequestObj = event.selectedRows[0]?.dataItem as ExpoRequests;
  }

  public getOtherInquiriesNumbers(stoneId: string): string {
    return this.expoRequestsData.reduce((inquiriesNumbers: number[], res) => {
      if (res.number !== this.expoRequestObj.number && res.invItems.some(r => r.stoneId === stoneId)) {
        inquiriesNumbers.push(res.number);
      }
      return inquiriesNumbers;
    }, [])
      .sort((a, b) => a - b)
      .join(',');
  }

  public async openDetail() {

    if (this.expoRequestObj.id) {
      await this.getRequestInventories();
      if (this.reqInventories.length == 0) {
        this.alertDialogService.show('No Inventory Found!, Please remove request.');
        this.spinnerService.hide();
        return;
      }

      this.toggleDetailDialog();
    }
    else
      this.alertDialogService.show('Please select record again!');
  }

  public async onFilterSubmit(form: NgForm) {
    if (form.valid) {
      await this.loadExpoRequestData();
      this.loadExpoRequestSummaryData();
    }
  }

  public async clearFilter(form: NgForm) {
    form.reset();
    this.skip = 0;
    this.expoRequestCriteria = new ExpoRequestCriteria();
    this.reqNumbers = null as any;
    this.stoneId = null as any;
    this.certificateNo = null as any;
    await this.loadExpoRequestData();
    this.loadExpoRequestSummaryData();
    this.mySelection = [];
  }

  public filterPartToggle() {
    this.utilityService.setfilterToggleValue(this.filterFlag);
  }

  public selectAllInventories(event: string) {
    if (event.toLowerCase() == 'checked')
      this.myInvSelection = this.reqInventories.map(z => z.stoneId);
    else
      this.myInvSelection = [];
  }

  public async onCustomerChange() {
    this.leadObj.leadSummary = this.calculateSummaryAll(this.leadObj.leadInventoryItems);
  }
  //#endregion

  //#region Detail View
  public toggleDetailDialog() {
    this.isViewDetail = !this.isViewDetail;
    this.myInvSelection = [];
  }

  public toggleOrderDialog() {
    this.isOrder = !this.isOrder;
  }

  public toggleCustomerDialog() {
    this.isCustomer = !this.isCustomer;
  }

  public async UpdateInvViewing(markView = true) {
    if (markView) {
      var invalidStones = this.expoRequestObj.invItems.filter(z => this.myInvSelection.includes(z.stoneId) && (z.status == ExpoStatus.Received.toString() || z.status == ExpoStatus.Order.toString())).map(z => z.stoneId);
      if (invalidStones.length > 0) {
        this.alertDialogService.show(`You can't update Received/Order status to Issue, Please remove ` + invalidStones.join(',') + ` from selection!`);
        return;
      }

      var invalidStatus: string[] = [LeadStatus.Hold.toString(), LeadStatus.Order.toString(), LeadStatus.Delivered.toString(), LeadStatus.Cart.toString()];
      invalidStones = this.reqInventories.filter(z => this.myInvSelection.includes(z.stoneId) && invalidStatus.includes(z.leadStatus)).map(z => z.stoneId);
      if (invalidStones.length > 0) {
        this.alertDialogService.show(invalidStones.join(',') + ` Stone(s) in Lead, Please remove from selection!`);
        return;
      }

      invalidStones = this.reqInventories.filter(z => this.myInvSelection.includes(z.stoneId) && z.hasTask == true).map(z => z.stoneId);
      if (invalidStones.length > 0) {
        this.alertDialogService.show(invalidStones.join(',') + ` Stone(s) in another expo request issue, Please wait for their release!`);
        return;
      }
    }
    else {
      var invalidStones = this.expoRequestObj.invItems.filter(z => this.myInvSelection.includes(z.stoneId) && z.status == ExpoStatus.Order.toString()).map(z => z.stoneId);
      if (invalidStones.length > 0) {
        this.alertDialogService.show(`You can't update Order status to Received, Please remove ` + invalidStones.join(',') + ` from selection!`);
        return;
      }
    }

    this.alertDialogService.ConfirmYesNo(`Are you sure you want to update status.`, "Update to " + (markView ? ExpoStatus.Issue.toString() : ExpoStatus.Received.toString()))
      .subscribe(async (res: any) => {
        if (res.flag) {
          try {
            if (this.myInvSelection.length > 0) {
              this.spinnerService.show();

              this.expoRequestObj.invItems.forEach(z => {
                if (this.myInvSelection.find(a => a == z.stoneId) != null) {
                  if (markView) {
                    z.status = ExpoStatus.Issue.toString();
                    z.issueAt = this.utilityService.setLiveUTCDate();
                    z.issueBy = this.fxCredential?.fullName;
                  }
                  else {
                    z.status = ExpoStatus.Received.toString();
                    z.receiveAt = this.utilityService.setLiveUTCDate();
                    z.receiveBy = this.fxCredential?.fullName;
                  }

                  z.updatedAt = this.utilityService.setLiveUTCDate();
                  z.updatedBy = this.fxCredential?.fullName;
                }
              });

              this.expoRequestObj.updatedBy = this.fxCredential?.fullName;
              let res = await this.expoRequestService.updateExpoRequest(this.expoRequestObj);
              if (res) {
                this.utilityService.showNotification('Updated successfully!');
                await this.getRequestInventories();

                //Load & Update One
                this.expoRequestObj = await this.expoRequestService.getById(this.expoRequestObj.id);
                let index = this.expoRequestsData.findIndex(z => z.id == this.expoRequestObj.id);
                if (index != -1) {
                  this.expoRequestsData[index] = this.expoRequestObj;
                  this.gridView = process(this.expoRequestsData, { group: this.groups });
                }
                this.myInvSelection = [];
                this.spinnerService.hide();
              }
              else {
                this.alertDialogService.show('Date not updated, Try again later!', 'error');
                this.spinnerService.hide();
              }
            }
          } catch (error: any) {
            console.error(error);
            this.spinnerService.hide();
            this.alertDialogService.show('Something went wrong, Try again later!');
          }
        }
      });
  }

  public OrderDialog() {
    let invalidStones = this.reqInventories.filter(z => this.myInvSelection.includes(z.stoneId) && z.status != ExpoStatus.Issue.toString()).map(z => z.stoneId);
    if (invalidStones.length > 0) {
      this.alertDialogService.show(`You can only place order of Issued Stone(s), Please remove ` + invalidStones.join(',') + ` from selection!`);
      return;
    }

    var invalidStatus: string[] = [LeadStatus.Hold.toString(), LeadStatus.Order.toString(), LeadStatus.Delivered.toString(), LeadStatus.Cart.toString()];
    invalidStones = this.reqInventories.filter(z => this.myInvSelection.includes(z.stoneId) && invalidStatus.includes(z.leadStatus)).map(z => z.stoneId);
    if (invalidStones.length > 0) {
      this.alertDialogService.show(invalidStones.join(',') + ` Stone(s) in Lead, Please remove from selection!`);
      return;
    }

    this.leadObj.platform = 'offline';
    let selectedInvs = this.reqInventories.filter(z => this.myInvSelection.includes(z.stoneId));

    this.leadObj.seller = this.expoRequestObj.seller;
    this.leadObj.leadInventoryItems = [];
    selectedInvs.forEach(z => {
      let invItem: InvItem = new InvItem();
      invItem.invId = z.id;
      invItem.kapan = z.kapan;
      invItem.stoneId = z.stoneId;
      invItem.rfid = z.rfid;
      invItem.shape = z.shape;
      invItem.weight = z.weight;
      invItem.color = z.color;
      invItem.clarity = z.clarity;
      invItem.cut = z.cut;
      invItem.cps = z.cps;
      invItem.polish = z.polish;
      invItem.symmetry = z.symmetry;
      invItem.fluorescence = z.fluorescence;
      invItem.location = z.location;
      invItem.lab = z.lab;
      invItem.certificateNo = z.certificateNo;
      invItem.price = z.price;
      invItem.supplier = z.supplier;
      invItem.holdBy = z.holdBy;
      invItem.status = z.status;
      invItem.sDiscount = 0;
      invItem.expoName = z.expoName;
      invItem.isHold = z.isHold;
      invItem.isMemo = z.isMemo;

      this.leadObj.leadInventoryItems.push(invItem);
    });

    this.leadObj.leadInventoryItems = this.leadObj.leadInventoryItems.sort(function (a, b) {
      return a.stoneId.localeCompare(b.stoneId, undefined, {
        numeric: true,
        sensitivity: 'base'
      });
    });

    this.leadObj.leadSummary = this.calculateSummaryAll(this.leadObj.leadInventoryItems);
    if (this.fxCredential.fullName)
      this.leadObj.createdBy = this.fxCredential.fullName;
    this.toggleOrderDialog();
  }

  public async submitOrder(form: NgForm) {
    if (form.valid) {
      if (this.selectedCustomer == undefined || this.selectedCustomer == null || this.selectedCustomer?.length == 0) {
        this.alertDialogService.show('Please select Customer!');
        return;
      }

      this.alertDialogService.ConfirmYesNo(`Are you sure you want to add this lead.`, "Add Lead")
        .subscribe(async (res: any) => {
          if (res.flag) {
            try {
              this.spinnerService.show();
              this.additionalMapping();
              let res = await this.leadService.leadInsert(this.leadObj);
              if (res) {
                let invIds = this.leadObj.leadInventoryItems.map(z => z.invId);
                await this.inventoryService.updateInventoryHoldUnHoldById(invIds, true);
                this.insertInvItemHistoryList(invIds, InvHistoryAction.Hold, "Updated the stone to Hold from the Export Request for stone");

                this.leadObj.leadInventoryItems.forEach(z => {
                  let index = this.expoRequestObj.invItems.findIndex(a => a.invId == z.invId);
                  if (index != -1)
                    this.expoRequestObj.invItems[index].status = ExpoStatus.Order.toString();
                });

                await this.expoRequestService.updateExpoRequest(this.expoRequestObj);
                this.alertDialogService.show('Order has been placed successfully!');

                let stoneIds = this.leadObj.leadInventoryItems.map(z => z.stoneId);
                var otheExpoReqs = await this.expoRequestService.getOtherSellerRequests(stoneIds, this.expoRequestObj.id);
                if (otheExpoReqs && otheExpoReqs.length > 0) {

                  otheExpoReqs.forEach(async req => {

                    let description = "Your stone ";
                    description = stoneIds.filter(x => req.invItems.map(s => s.stoneId).includes(x)).join(',');
                    description += " get order from other customer.";

                    let message = new Notifications();
                    message.icon = "icon-info";
                    message.title = "Stones Orderd";
                    message.categoryType = "information";
                    message.description = description;
                    message.senderId = this.fxCredential.id;
                    message.receiverId = req.seller.id;

                    let notificationResponse = await this.notificationService.insertNotification(message);
                    if (notificationResponse) {
                      message.id = notificationResponse;
                      this.notificationService.messages.next(message)
                    }
                  });
                }

                this.toggleOrderDialog();
                this.toggleDetailDialog();
                await this.loadExpoRequestData();
                this.loadExpoRequestSummaryData();
                this.mySelection = [];
                this.myInvSelection = [];

                this.spinnerService.hide();
              }
            } catch (error: any) {
              console.error(error);
              this.spinnerService.hide();
              this.alertDialogService.show('Something went wrong, Try again later!');
            }
          }
        });
    }
  }

  public additionalMapping() {
    this.leadObj.seller = this.expoRequestObj.seller;
    this.leadObj.platform = 'offline';
    this.leadObj.leadStatus = LeadStatus.Hold.toString();
    this.leadObj.customer = this.customersItems.find(z => z.id == this.selectedCustomer) ?? new CustomerDNorm();
  }

  public async onEnterAddStone(event: any) {
    try {
      let stoneId = event.target.value;
      await this.selectStoneDetailsData(stoneId);
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async selectStoneDetailsData(stoneId: string) {
    try {
      if (!stoneId)
        this.myInvSelection = new Array<string>();

      this.spinnerService.show();
      let fetchIds: string[] = this.utilityService.CheckStoneIdsAndCertificateIds(stoneId);
      let existStonesInList: string[] = [];

      if (this.reqInventories.length > 0)
        existStonesInList = this.reqInventories.filter(item => fetchIds.map(x => x.toLowerCase().toString()).includes(item.stoneId.toLowerCase()) || fetchIds.map(x => x.toLowerCase().toString()).includes(item.certificateNo)).map(x => x.stoneId);

      if (existStonesInList.length > 0)
        this.myInvSelection = existStonesInList;

      let newStoneIds = fetchIds.filter(item => !this.reqInventories.map(x => x.stoneId).includes(item));

      let InvIdsExpo = await this.inventoryService.getInventoryByStoneIds(newStoneIds);
      newStoneIds = InvIdsExpo.filter(x => x.isInExpo && x.leadStatus != LeadStatus.Order.toString()).map(x => x.stoneId);
      let notValidInExpo = InvIdsExpo.filter(x => !newStoneIds.includes(x.stoneId)).map(x => x.stoneId);

      if (notValidInExpo.length > 0)
        this.alertDialogService.show(`<b>${notValidInExpo.join(", ")}</b> not Found In Expo`);

      if (newStoneIds && newStoneIds.length > 0) {
        this.spinnerService.hide();

        this.alertDialogService.ConfirmYesNo(`Are you sure you want to add this stones.`, "Add New Stones")
          .subscribe(async (res: any) => {
            if (res.flag) {
              this.spinnerService.show();

              let expoUpdate = new ExpoUpdate();
              expoUpdate.idents = newStoneIds;
              expoUpdate.number = this.expoRequestObj.number;
              expoUpdate.seller = this.expoRequestObj.seller;
              expoUpdate.status = this.expoRequestObj.status;

              let expoInvItems = await this.expoRequestService.updateInventoriesInExporequest(expoUpdate);
              if (expoInvItems && expoInvItems.length > 0) {

                expoInvItems.forEach(x => {
                  this.expoRequestObj.invItems.push(x);
                });

                await this.getRequestInventories();
              }
              else
                this.alertDialogService.show("Stones not found!");

              this.spinnerService.hide();
            }
          });
      }

      this.spinnerService.hide();

    } catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }
  //#endregion

  //#region RFID lighting sectiond
  public lightToggle() {
    if (this.reqInventories && this.reqInventories.length > 0) {
      this.stopLighting();
      if (this.myInvSelection && this.myInvSelection.length > 0) {
        this.selectedRfids = this.reqInventories.filter(x => this.myInvSelection.includes(x.stoneId)).map(z => z.rfid);
        this.lightingMethod();
      }
      else
        this.selectedRfids = new Array<string>();

    }
  }

  public lightingMethod() {
    try {
      this.spinnerService.show();
      this.device.startLightingTagsLed(null, this.selectedRfids);
      this.device.setLightIntensity(null, 300);
      let that = this;
      this.device.on('lightingstarted', function (tagsNotLighted: any) {
        that.spinnerService.hide();
      });
    } catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show("Something went wrong, Please try again later");
    }


  }

  public stopLighting() {
    try {
      this.spinnerService.show();
      this.device.stopLightingTagsLed();
      let that = this;
      this.device.on('lightingstopped', function () {
        that.spinnerService.hide();
      });
    } catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show("Something went wrong, Please try again later");
    }


  }
  //#endregion

  //#region Summary Calculation 
  public calculateSummaryAll(inventoryItems: InvItem[]) {

    let leadSummaryLocal = new LeadSummary();
    leadSummaryLocal.totalCarat = inventoryItems.reduce((acc, cur) => acc + cur.weight, 0);
    leadSummaryLocal.totalAmount = inventoryItems.reduce((acc, cur) => acc + (cur.netAmount ? cur.netAmount : (cur.price.netAmount ? cur.price.netAmount : 0)), 0);
    leadSummaryLocal.totalRAP = inventoryItems.reduce((acc, cur) => acc + ((cur.price.rap ?? 0) * (cur.weight)), 0) ?? 0;
    leadSummaryLocal.totalPcs = inventoryItems.length;
    leadSummaryLocal.avgRap = (leadSummaryLocal.totalRAP / leadSummaryLocal.totalCarat) ?? 0;

    leadSummaryLocal.avgDiscPer = (((leadSummaryLocal.totalAmount / leadSummaryLocal.totalRAP) * 100) - 100) ?? 0;
    leadSummaryLocal.perCarat = (leadSummaryLocal.totalAmount / leadSummaryLocal.totalCarat) ?? 0;

    let totalVowValue = Number((leadSummaryLocal.totalAmount).toFixed(2));
    let vowDiscount = 0;
    let schemeDetail = this.schemes.details.find(c => c.from <= totalVowValue && totalVowValue <= c.to);
    if (schemeDetail)
      vowDiscount = schemeDetail?.discount;

    leadSummaryLocal.totalVOWDiscPer = vowDiscount;

    inventoryItems.forEach(x => {
      if (x.price.rap && x.price.discount && x.weight) {
        x.fDiscount = x.price.discount;
        x.perCarat = this.utilityService.ConvertToFloatWithDecimal((x.price.rap + (x.price.rap * x.fDiscount / 100)));
        x.netAmount = this.utilityService.ConvertToFloatWithDecimal(x.perCarat * x.weight);
      }

      x.vowDiscount = vowDiscount;
      x.vowAmount = Number((this.utilityService.ConvertToFloatWithDecimal((((x.netAmount ?? 0)) * vowDiscount / 100))).toFixed(2));
      x.fAmount = Number(((x.netAmount ?? 0) - (x.vowAmount ?? 0)).toFixed(2));
    });

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

  //insert invLogItem
  public async insertInvItemHistoryList(invIds: string[], action: string, desc: string) {
    try {
      var invHistorys: InvHistory[] = [];
      this.leadObj?.leadInventoryItems.map((item) => {
        if (invIds?.includes(item.invId)) {
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

}
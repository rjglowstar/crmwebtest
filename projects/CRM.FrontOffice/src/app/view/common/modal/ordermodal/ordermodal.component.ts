import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { DataResult, GroupDescriptor, process } from '@progress/kendo-data-query';
import { NgxSpinnerService } from 'ngx-spinner';
import { fromEvent } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';
import { GridDetailConfig } from 'shared/businessobjects';
import { FrontStoneStatus, listCurrencyType, NotificationService, OriginValue, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { BrokerDNorm, LeadOrderItem, OrderRequest } from '../../../../businessobjects';
import { CurrencyType, CustomerDNorm, fxCredential, InvHistory, InvItem, Lead, RequestDNorm, SupplierDNorm, SystemUserDNorm } from '../../../../entities';
import { AppPreloadService, CommuteService, ConfigurationService, GridPropertiesService, InvHistoryService, InventoryService, LeadService, OrderService, SupplierService } from '../../../../services';
@Component({
  selector: 'app-ordermodal',
  templateUrl: './ordermodal.component.html',
  styleUrls: ['./ordermodal.component.css']
})
export class OrdermodalComponent implements OnInit {

  @Input() public lead: LeadOrderItem = new LeadOrderItem();
  @Output() toggle: EventEmitter<boolean> = new EventEmitter();
  @ViewChild('SelectStoneTxtInput') selectStoneTxtInput!: ElementRef;

  public fxCredential!: fxCredential;
  public fields!: GridDetailConfig[];
  public gridViewOrderInventory!: DataResult;
  public pageSize = 10;
  public skip = 0;
  public listOrderInventoryItems: InvItem[] = [];
  public listFinalInvItems: InvItem[] = [];
  public gridOrderInventoryData: InvItem[] = [];
  public listSupplierItems: Array<{ text: string; value: string }> = [];
  public supplierItems: SupplierDNorm[] = [];
  public selectedSupplierItem?: { text: string, value: string };
  public selectedSupplierItems: Array<string> = new Array<string>();
  public selectedPSupplierItem?: { text: string, value: string };
  public selectedViaSupplierItem?: { text: string, value: string };
  public pSupplierObj: SupplierDNorm = new SupplierDNorm();
  public viaSupplierObj: SupplierDNorm = new SupplierDNorm();
  public supplierList: SupplierDNorm[] = [];
  public stoneSuppliersList: Array<{ name: string; value: string, isChecked: boolean }> = Array<{ name: string; value: string; isChecked: boolean }>();
  public selectableSettings: SelectableSettings = { mode: 'multiple', };
  public mySelection: Array<string> = new Array<string>();
  public isDisabledSave: boolean = true;
  public groups: GroupDescriptor[] = [];
  public isShowCheckBoxAll: boolean = true;
  public ccRate!: number
  public ccType!: string;
  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains'
  };
  public dollarConversionRateList: Array<CurrencyType> = new Array<CurrencyType>();
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
  public selectedTerms!: string;
  public selectedRemark!: string;

  constructor(
    public leadService: LeadService,
    private gridPropertiesService: GridPropertiesService,
    private spinnerService: NgxSpinnerService,
    private alertDialogService: AlertdialogService,
    private supplierService: SupplierService,
    public appPreloadService: AppPreloadService,
    public router: Router,
    public orderService: OrderService,
    public utilityService: UtilityService,
    public inventoryService: InventoryService,
    public configurationService: ConfigurationService,
    public commuteService: CommuteService,
    public invHistoryService: InvHistoryService,
    public notificationService: NotificationService
  ) { }

  async ngOnInit() {
    this.loadDefaultMethods();
  }

  public async loadDefaultMethods() {
    this.fxCredential = await this.appPreloadService.fetchFxCredentials();
    if (!this.fxCredential)
      this.router.navigate(["login"]);
    await this.getGridConfig();
    await this.loadOrderAllInv();
    await this.loadSuppliersDNorm();
    await this.loadCurrencyConfig();
    this.onSelectionStones();
  }

  public async getGridConfig() {
    this.fields = await this.gridPropertiesService.getLeadOrderInventoryItems();
    if (this.lead.platform.toLowerCase() == "online")
      this.fields = this.fields.filter(c => c.propertyName.toLowerCase() != "adiscount" && c.propertyName.toLowerCase() != "fdiscount" && c.propertyName.toLowerCase() != 'brokeramount' && c.title.toLowerCase() != 'volume amount');
    else
      this.fields = this.fields.filter(c => c.title.toLowerCase() != 'vow amount');
  }

  public async loadCurrencyConfig() {
    try {
      let currencyList = await this.configurationService.getCurrencyTypesList();
      if (currencyList && currencyList.length > 0) {
        this.dollarConversionRateList = Array<CurrencyType>();
        currencyList.unshift({ fromCurrency: listCurrencyType.USD, fromRate: 1, toCurrency: listCurrencyType.USD, toRate: 1, id: null as any });
        this.dollarConversionRateList = currencyList.filter(x => x.fromCurrency == listCurrencyType.USD);
        this.defaultCurrencyConversion();
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async loadSuppliersDNorm() {
    try {
      this.supplierItems = await this.supplierService.getSupplierDNorm();
      if (this.supplierItems.length > 0) {
        this.listSupplierItems = [];
        this.supplierItems.forEach(z => { this.listSupplierItems.push({ text: z.name, value: z.id }); });
      }
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }

  }

  public supplierChange() {
    if (!this.selectedSupplierItem?.value)
      this.selectedSupplierItem = undefined;
  }

  public pSupplierChange() {
    let fetchSupplier = this.supplierItems.find(x => x.id == this.selectedPSupplierItem?.value);
    if (fetchSupplier)
      this.pSupplierObj = fetchSupplier;
    else
      this.pSupplierObj = new SupplierDNorm();
  }

  public viaSupplierChange() {
    let fetchSupplier = this.supplierItems.find(x => x.id == this.selectedViaSupplierItem?.value);
    if (fetchSupplier)
      this.viaSupplierObj = fetchSupplier;
    else
      this.viaSupplierObj = new SupplierDNorm();
  }

  public async loadOrderAllInv() {
    try {
      this.listOrderInventoryItems = await this.leadService.getStonesByLeadId(this.lead.id);
      this.listOrderInventoryItems = this.listOrderInventoryItems.filter(x => !x.isRejected);

      if (this.listOrderInventoryItems && this.listOrderInventoryItems.length > 0) {
        this.stoneSuppliersList = Array<{ name: string; value: string; isChecked: boolean }>();
        let mainSuppliersList: Array<SupplierDNorm> = [...new Set(this.listOrderInventoryItems.map(item => item.supplier))];
        if (mainSuppliersList && mainSuppliersList.length > 0) {
          mainSuppliersList = mainSuppliersList.filter((v, i, a) => a.findIndex(v2 => (v2.id === v.id)) === i);

          mainSuppliersList.forEach(item => {
            this.stoneSuppliersList.push({ name: item.name, value: item.id, isChecked: false })
          })
        }

      }

      this.isDisabledSave = this.checkSetPrimarySupplierForAll();
      this.loadOrderPaging();
    } catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public groupChange(groups: GroupDescriptor[]): void {
    try {
      this.groups = groups;
      this.loadOrderInventoryGrid(this.listOrderInventoryItems);
    }
    catch (error: any) {
      this.alertDialogService.show(error.error)
    }
  }

  public async loadOrderPaging() {
    if (this.listOrderInventoryItems.length > 0) {
      for (let i = this.skip; i < this.pageSize + this.skip; i++) {
        const element = this.listOrderInventoryItems[i];
        if (element)
          this.gridOrderInventoryData.push(element);
      }
      this.loadOrderInventoryGrid(this.listOrderInventoryItems);
    }
  }

  public async loadOrderInventoryGrid(inventoryItems: InvItem[]) {
    if (inventoryItems.length > 0) {
      this.gridViewOrderInventory = process(this.gridOrderInventoryData, { group: this.groups });
      this.gridViewOrderInventory.total = inventoryItems.length;
    }
    this.spinnerService.hide();
  }

  public pageChange(event: PageChangeEvent): void {
    this.spinnerService.show();
    this.gridOrderInventoryData = [];
    this.skip = event.skip;
    this.loadOrderPaging();
  }

  public toggleOrderDialog() {
    this.toggle.emit(false);
  }

  public async submitApprovedOrder() {
    // if (this.lead.processDate)
    //   return this.alertDialogService.show(`Order has been already proceed, Kindly choose another order!`)
    let invalidStoneIds = Array<string>();
    if (this.mySelection && this.mySelection.length > 0)
      invalidStoneIds = this.listOrderInventoryItems.filter(a => this.mySelection.includes(a.stoneId) && !a.primarySupplier.id).map(x => x.stoneId);
    else
      invalidStoneIds = this.listOrderInventoryItems.filter(x => !x.primarySupplier.id).map(x => x.stoneId);

    if (invalidStoneIds && invalidStoneIds.length > 0)
      return this.alertDialogService.show(`You have not added primary supplier on <b>${invalidStoneIds.join(", ")}</b>!, Kindly add it`)

    if (this.lead.processDate) {
      if (this.mySelection && this.mySelection.length > 0)
        invalidStoneIds = this.listOrderInventoryItems.filter(a => this.mySelection.includes(a.stoneId) && a.orderProcessDate).map(x => x.stoneId);
      else
        invalidStoneIds = this.listOrderInventoryItems.filter(x => x.orderProcessDate).map(x => x.stoneId);

      if (invalidStoneIds && invalidStoneIds.length > 0)
        return this.alertDialogService.show(`<b>${invalidStoneIds.join(", ")}</b> already added Primary Supplier!`)
    }
    else {
      if (this.mySelection && this.mySelection.length == 0)
        this.mySelection = this.listOrderInventoryItems.map(x => x.stoneId)
    }

    this.alertDialogService.ConfirmYesNo(`Do you want to Approve the Order of <b>${this.mySelection.join(", ")}</b>?`, "Order Supplier")
      .subscribe(async (res: any) => {
        if (res.flag) {
          try {
            this.spinnerService.show();
            let leadObj = new Lead();
            leadObj = await this.leadService.getLeadById(this.lead.id);
            if (leadObj.id) {
              leadObj.leadInventoryItems = this.listOrderInventoryItems;
              if (this.mySelection && this.mySelection.length > 0) {
                leadObj.leadInventoryItems.forEach(x => {
                  if (this.mySelection.includes(x.stoneId)) {
                    x.orderProcessDate = this.utilityService.setLiveUTCDate();
                  }
                })
                this.listFinalInvItems = leadObj.leadInventoryItems.filter(x => this.mySelection.includes(x.stoneId));
              }
              else {
                leadObj.leadInventoryItems.forEach(x => x.orderProcessDate = this.utilityService.setLiveUTCDate());
                this.listFinalInvItems = leadObj.leadInventoryItems;
              }

              leadObj.processDate = this.utilityService.setLiveUTCDate();

              let primarySuppCodes = this.listFinalInvItems.map(u => u.primarySupplier.code);
              let primarySuppliers = this.supplierItems.filter(z => primarySuppCodes.includes(z.code));
              if (primarySuppliers.length > 0) {
                let suppierResponse = await this.suppliersCalls(primarySuppliers);
                if (suppierResponse.toLowerCase() == "added") {
                  let leadUpdateResponse: boolean = await this.leadService.leadUpdate(leadObj);
                  if (leadUpdateResponse) {
                    this.spinnerService.hide();
                    this.utilityService.showNotification("Order have been procced successfully !");
                    this.toggleOrderDialog();
                  }
                  else {
                    this.spinnerService.hide();
                    this.alertDialogService.show(`Something went wrong!, Lead Order`);
                  }
                }
              }
              else {
                this.spinnerService.hide();
                this.alertDialogService.show(`Primary suppier not found!`);
              }
            }
            else
              this.alertDialogService.show(`Something went wrong!, Lead Order`);
          } catch (error: any) {
            this.toggleOrderDialog();
            this.spinnerService.hide();
            this.alertDialogService.show(error.error);
          }
        }
      })
  }

  public async suppliersCalls(pSuppliers: SupplierDNorm[]): Promise<string> {
    let suppierResponse = "";
    for (let j = 0; j < pSuppliers.length; j++) {
      let ps = pSuppliers[j];
      let orderRequestMain: OrderRequest = new OrderRequest();
      orderRequestMain.isLocked = true;
      orderRequestMain.party = this.setOrderRequestDnorm(this.lead.customer, OriginValue.Customer.toLowerCase().toString());
      orderRequestMain = this.setOrderObj(orderRequestMain);
      orderRequestMain.invItems = this.listFinalInvItems.filter(x => x.primarySupplier.code == ps.code);

      //Primary supplier call to party
      suppierResponse = await this.callOrderRequest(orderRequestMain, ps.id);
      if (suppierResponse.toLowerCase() == 'added') {
        //Check if primary supplier not same as inv supplier
        let orderInventoryItems = orderRequestMain.invItems.filter(z => z.primarySupplier.code != z.supplier.code);
        orderInventoryItems.forEach(x => {
          x.ccType = this.dollarConversionRateList.find(x => x.toCurrency == listCurrencyType.USD)?.toCurrency ?? ""
          x.ccRate = this.dollarConversionRateList.find(x => x.toCurrency == listCurrencyType.USD)?.toRate ?? 0
        })

        if (orderInventoryItems.length > 0) {
          //Group Supplier from Inv
          let invSuppCodes = orderInventoryItems.map(u => u.supplier.code);
          let suppliers = this.supplierItems.filter(z => invSuppCodes.includes(z.code));
          if (suppliers.length > 0) {
            for (let i = 0; i < suppliers.length; i++) {
              let sp = suppliers[i];
              if (sp.code) {
                //Get Inv by supplier and Send brockerage only Primary supplier
                let supplierInvGroup = orderInventoryItems.filter(z => z.supplier.code == sp.code).map((x) => {
                  if (x.brokerAmount > 0) {
                    x.brokerAmount = 0;
                  }
                  return x;
                });

                //check Via Supplier Invs
                let viaSupplierInv = supplierInvGroup.filter(z => z.viaSupplier && z.viaSupplier.code != null);
                if (viaSupplierInv.length > 0) {
                  //group by via suppliers
                  let viaSuppCodes = viaSupplierInv.map(u => u.viaSupplier.code);
                  let viaSuppliers = this.supplierItems.filter(z => viaSuppCodes.includes(z.code));
                  for (let k = 0; k < viaSuppliers.length; k++) {
                    let vsp = viaSuppliers[k];
                    let vspInvs = supplierInvGroup.filter(z => z.viaSupplier.code == vsp.code);
                    if (vspInvs.length > 0) {
                      if (vsp.code != sp.code) {
                        //Via Supplier Order call to primary supplier
                        let orderRequest: OrderRequest = new OrderRequest();
                        orderRequest.party = this.setOrderRequestSupplierDnorm(ps, OriginValue.Supplier.toLowerCase().toString());
                        orderRequest = this.setOrderObj(orderRequest);
                        orderRequest.invItems = vspInvs;
                        suppierResponse = await this.callOrderRequest(orderRequest, vsp.id);
                        if (suppierResponse.toLowerCase() != 'added')
                          break;

                        //Inv Supplier Order call to via supplier
                        let invOrderRequest = new OrderRequest();
                        invOrderRequest.party = this.setOrderRequestSupplierDnorm(vsp, OriginValue.Supplier.toLowerCase().toString());
                        invOrderRequest = this.setOrderObj(invOrderRequest);
                        invOrderRequest.invItems = vspInvs;
                        suppierResponse = await this.callOrderRequest(invOrderRequest, sp.id);
                        if (suppierResponse.toLowerCase() != 'added')
                          break;

                      }
                      else {
                        //Inv Supplier Order call to primary Supplier
                        let invOrderRequest = new OrderRequest();
                        invOrderRequest.party = this.setOrderRequestSupplierDnorm(ps, OriginValue.Supplier.toLowerCase().toString());
                        invOrderRequest = this.setOrderObj(invOrderRequest);
                        invOrderRequest.invItems = vspInvs;
                        suppierResponse = await this.callOrderRequest(invOrderRequest, sp.id);
                        if (suppierResponse.toLowerCase() != 'added')
                          break;
                      }
                    }
                  }

                  //Non Via Supplier Inv Order Call
                  let invSuppliersInv = supplierInvGroup.filter(z => z.viaSupplier == null || z.viaSupplier.code == null);
                  if (invSuppliersInv.length > 0) {
                    let orderRequest: OrderRequest = new OrderRequest();
                    orderRequest.party = this.setOrderRequestSupplierDnorm(ps, OriginValue.Supplier.toLowerCase().toString());
                    orderRequest = this.setOrderObj(orderRequest);
                    orderRequest.invItems = invSuppliersInv;
                    suppierResponse = await this.callOrderRequest(orderRequest, sp.id);
                    if (suppierResponse.toLowerCase() != 'added')
                      break;
                  }

                } else {
                  //No Via Supplier Found - call inv supplier order
                  let orderRequest: OrderRequest = new OrderRequest();
                  orderRequest.party = this.setOrderRequestSupplierDnorm(ps, OriginValue.Supplier.toLowerCase().toString());
                  orderRequest = this.setOrderObj(orderRequest);
                  orderRequest.invItems = supplierInvGroup;
                  suppierResponse = await this.callOrderRequest(orderRequest, sp.id);
                  if (suppierResponse.toLowerCase() != 'added')
                    break;
                }
              }
              else {
                this.alertDialogService.show(sp.name + 'Supplier code not found, Please contact administrator!', 'error');
                break;
              }
            }
          }
        }

      }
    }

    return suppierResponse;
  }

  public async callOrderRequest(orderRequest: OrderRequest, supplierId: string): Promise<any> {
    try {
      let supplierApi = (await this.supplierService.getSupplierById(supplierId)).apiPath;
      if (supplierApi) {
        let resposeInv = await this.orderService.orderRequest(supplierApi, orderRequest);
        if (resposeInv.toLowerCase() != 'added') {
          this.alertDialogService.show("Not added order in back office!", 'error')
          let leadObj: Lead = await this.leadService.getLeadById(orderRequest.leadId);
          leadObj.processDate = null as any;
          leadObj.leadInventoryItems.forEach(x => x.orderProcessDate = null as any);
          await this.leadService.leadUpdate(leadObj);
        }
        return resposeInv;
      }
    } catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Somehting went wrong, Try again later!');
    }

  }

  //insert invLogItem
  public async insertInvItemHistoryList(invIds: string[], action: string, desc: string) {
    try {
      var invHistorys: InvHistory[] = [];
      this.listOrderInventoryItems?.map((item) => {
        if (invIds.includes(item.stoneId) || invIds.includes(item.invId)) {
          const invHistory = new InvHistory()
          invHistory.stoneId = item.stoneId;
          invHistory.invId = item.invId;
          invHistory.action = action;
          invHistory.userName = this.fxCredential.fullName;
          invHistory.price = item.price;
          invHistory.supplier = item.supplier;
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

  public setOrderObj(orderRequestObj: OrderRequest) {

    orderRequestObj.leadId = this.lead.id;
    orderRequestObj.leadNumber = this.lead.leadNo.toString();
    if (this.lead.broker.id)
      orderRequestObj.broker = this.setOrderRequestBrokerDnorm(this.lead.broker, "broker");
    orderRequestObj.seller = this.setOrderRequestSellerDnorm(this.lead.seller, OriginValue.Seller.toLowerCase());
    orderRequestObj.approvedBy = this.setOrderRequestUserDnorm(this.fxCredential, this.fxCredential.origin);
    return orderRequestObj;
  }

  public setOrderRequestUserDnorm(obj: fxCredential, origin: string) {
    let orderRequestDNorm: RequestDNorm = new RequestDNorm();
    orderRequestDNorm.id = obj.id;
    orderRequestDNorm.origin = origin;
    orderRequestDNorm.name = obj.fullName;
    return orderRequestDNorm;
  }
  public setOrderRequestSellerDnorm(obj: SystemUserDNorm, origin: string) {
    let orderRequestDNorm: RequestDNorm = new RequestDNorm();
    orderRequestDNorm.id = obj.id;
    orderRequestDNorm.origin = origin;
    orderRequestDNorm.name = obj.name;
    orderRequestDNorm.email = obj.email;
    orderRequestDNorm.mobileNo = obj.mobile ? obj.mobile : "";
    orderRequestDNorm.companyName = obj.name;
    return orderRequestDNorm;
  }
  public setOrderRequestBrokerDnorm(obj: BrokerDNorm, origin: string) {
    let orderRequestDNorm: RequestDNorm = new RequestDNorm();
    orderRequestDNorm.id = obj.id;
    orderRequestDNorm.origin = origin;
    orderRequestDNorm.name = obj.name;
    orderRequestDNorm.email = obj.email;
    orderRequestDNorm.mobileNo = obj.mobileNo ? obj.mobileNo : "";
    orderRequestDNorm.companyName = obj.name;
    return orderRequestDNorm;
  }
  public setOrderRequestSupplierDnorm(obj: SupplierDNorm, origin: string) {
    let orderRequestDNorm: RequestDNorm = new RequestDNorm();
    orderRequestDNorm.id = obj.id;
    orderRequestDNorm.origin = origin;
    orderRequestDNorm.name = obj.name;
    orderRequestDNorm.email = obj.email;
    orderRequestDNorm.mobileNo = obj.phoneNo ? obj.phoneNo : "";
    orderRequestDNorm.companyName = obj.name;
    return orderRequestDNorm;
  }
  public setOrderRequestDnorm(obj: CustomerDNorm, origin: string) {
    let orderRequestDNorm: RequestDNorm = new RequestDNorm();
    orderRequestDNorm.id = obj.id;
    orderRequestDNorm.origin = origin;
    orderRequestDNorm.name = obj.name ? obj.name : "";
    orderRequestDNorm.email = obj.email;
    orderRequestDNorm.mobileNo = obj.mobile ? obj.mobile : "";
    orderRequestDNorm.companyName = obj.companyName;
    return orderRequestDNorm;
  }

  public async setPrimarySupplier() {
    let pSupplierFlag = false;
    let vSupplierFlag = false;

    //Check for Order cancel request exist or not
    let notification = await this.notificationService.getExistsOrderCancelNotifications(this.lead.leadNo.toString());
    let orderCancelId: string[] = [];
    notification.forEach((x) => {
      orderCancelId.push(...x.param.split(','))
    });
    let notValidIds: string[] = [];
    if (this.mySelection.length > 0) {
      notValidIds = this.listOrderInventoryItems.filter(z => orderCancelId.includes(z.invId) && this.mySelection.includes(z.stoneId)).map(x => x.stoneId);
      if (notValidIds.length > 0)
        return this.alertDialogService.show(`Exist Order cancel request on <b>${notValidIds.join(", ")}</b>!,Please contact administrator!`)
    }

    if (this.mySelection.length == 0) {
      notValidIds = this.listOrderInventoryItems.filter(z => orderCancelId.includes(z.invId)).map(x => x.stoneId);
      if (notValidIds.length > 0)
        return this.alertDialogService.show(`Exist Order cancel request on <b>${notValidIds.join(", ")}</b>!,Please contact administrator!`)
    }
    
    let existsPrimarySuppier = this.listOrderInventoryItems.find(x => this.mySelection.map(a => a.toLowerCase()).includes(x.stoneId.toLowerCase()) && x.primarySupplier.id != null);
    if (existsPrimarySuppier != null)
      pSupplierFlag = true;

    let existsViaSuppier = this.listOrderInventoryItems.find(x => this.mySelection.map(a => a.toLowerCase()).includes(x.stoneId.toLowerCase()) && x.viaSupplier.id != null);
    if (existsViaSuppier != null)
      vSupplierFlag = true;

    // if (pSupplierFlag && vSupplierFlag) {
    //   this.alertDialogService.show('Suppliers already selected!');
    //   return;
    // }

    let msg = pSupplierFlag == false && vSupplierFlag == false ? "Primary and Via" : (pSupplierFlag == false ? "Primary" : "Via");
    let confirmationMessage = "";

    let invItemsSetSupplier: InvItem[] = new Array<InvItem>();
    if (this.mySelection && this.mySelection.length > 0) {
      invItemsSetSupplier = this.listOrderInventoryItems.filter(x => this.mySelection.map(a => a.toLowerCase()).includes(x.stoneId.toLowerCase()));
      confirmationMessage = `Do you want to set <b>${this.pSupplierObj.name ?? this.viaSupplierObj.name}</b> as ${msg} Supplier for <b>${this.mySelection.join(", ")}</b> stone(s) `;
    }
    else {
      invItemsSetSupplier = this.listOrderInventoryItems.filter(x => this.selectedSupplierItems.includes(x.supplier.id));
      confirmationMessage = `Do you want to set <b>${this.pSupplierObj.name ?? this.viaSupplierObj.name}</b> as ${msg} Supplier for <b>${invItemsSetSupplier.map(x => x.stoneId).join(", ")}</b> stone(s) `;

    }

    this.alertDialogService.ConfirmYesNo(confirmationMessage, msg + " Supplier")
      .subscribe(async (res: any) => {
        if (res.flag) {
          let selectedPSupplier = new SupplierDNorm();
          let selectedVSupplier = new SupplierDNorm();

          if (this.pSupplierObj.id)
            selectedPSupplier = JSON.parse(JSON.stringify(this.pSupplierObj))


          if (this.viaSupplierObj.id)
            selectedVSupplier = JSON.parse(JSON.stringify(this.viaSupplierObj))

          if (invItemsSetSupplier.length > 0) {
            for (let index = 0; index < invItemsSetSupplier.length; index++) {
              const element = invItemsSetSupplier[index];
              if (selectedPSupplier.id) {
                element.primarySupplier = selectedPSupplier;
                element.ccType = this.ccType;
                element.ccRate = this.ccRate;
                element.terms = this.selectedTerms;
                element.remark = this.selectedRemark;
              }
              if (selectedVSupplier.id) {
                if (element.supplier.id != element.primarySupplier.id) {
                  if (element.primarySupplier.id != selectedVSupplier.id && element.supplier.id != selectedVSupplier.id)
                    element.viaSupplier = selectedVSupplier;
                  else
                    element.viaSupplier = new SupplierDNorm();
                }
                else
                  element.viaSupplier = new SupplierDNorm();
              }
            }
          }

          this.isDisabledSave = this.checkSetPrimarySupplierForAll();

          this.pSupplierObj = new SupplierDNorm();
          this.viaSupplierObj = new SupplierDNorm();

          this.selectedPSupplierItem = undefined;
          this.selectedViaSupplierItem = undefined;
          this.selectedSupplierItems = new Array<string>();
          this.utilityService.onMultiSelectValueChange(this.stoneSuppliersList, this.selectedSupplierItems)
          this.defaultCurrencyConversion();

        }
      });
  }

  public checkSetPrimarySupplierForAll() {
    if (this.mySelection && this.mySelection.length > 0)
      return this.listOrderInventoryItems.filter(a => this.mySelection.includes(a.stoneId)).some(x => !x.primarySupplier.id);
    else
      return this.listOrderInventoryItems.some(x => !x.primarySupplier.id);
  }

  public onSelectionStones() {
    try {
      if (this.selectStoneTxtInput && this.selectStoneTxtInput.nativeElement) {
        fromEvent(this.selectStoneTxtInput.nativeElement, 'keyup').pipe(
          map((event: any) => {
            return event.target.value;
          })
          , debounceTime(2000)
        ).subscribe((stoneId: string) => {
          if (stoneId) {
            this.spinnerService.show();
            let fetchStoneIds: string[] = this.utilityService.CheckStoneIds(stoneId);
            if (fetchStoneIds && fetchStoneIds.length > 0)
              this.mySelection = this.listOrderInventoryItems.filter(o => fetchStoneIds.some((a) => a.toLowerCase() == o.stoneId.toLowerCase())).map(o => o.stoneId);
            else
              this.mySelection = [];
            this.spinnerService.hide();
          }
          else
            this.mySelection = [];
        });
      }

    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async selectAllInvList(event: string) {
    this.mySelection = [];
    if (event.toLowerCase() == 'checked')
      this.mySelection = this.listOrderInventoryItems.map(z => z.stoneId);
  }

  public async currencyChange() {
    this.ccRate = (this.dollarConversionRateList.find(x => x.toCurrency == this.ccType)?.toRate) ?? 0;
  }

  public defaultCurrencyConversion() {
    if (this.dollarConversionRateList.length > 0) {
      this.ccType = (this.dollarConversionRateList.find(x => x.toCurrency == listCurrencyType.USD)?.toCurrency) ?? "";
      this.ccRate = (this.dollarConversionRateList.find(x => x.toCurrency == listCurrencyType.USD)?.toRate) ?? 0;
    }
  }

  public async resetOrder() {
    if (this.mySelection && this.mySelection.length == 0)
      this.mySelection = this.listOrderInventoryItems.map(o => o.stoneId);

    let invalidStoneIds = Array<string>();
    if (this.mySelection && this.mySelection.length > 0)
      invalidStoneIds = this.listOrderInventoryItems.filter(a => this.mySelection.includes(a.stoneId) && !a.primarySupplier.id).map(x => x.stoneId);
    else
      invalidStoneIds = this.listOrderInventoryItems.filter(x => !x.primarySupplier.id).map(x => x.stoneId);

    if (invalidStoneIds && invalidStoneIds.length > 0)
      return this.alertDialogService.show(`You have not added primary supplier on <b>${invalidStoneIds.join(", ")}</b>!, Kindly add it`)

    this.alertDialogService.ConfirmYesNo(`Are you sure you want to reset this order of <b>${this.mySelection.join(", ")}</b> from Backoffice!<br /> This will reset Primary & Via Suppiers also.`, "Reset Order")
      .subscribe(async (res: any) => {
        if (res.flag) {
          try {
            let pSupplierCodes = [...new Set(this.listOrderInventoryItems.filter(z => this.mySelection.includes(z.stoneId)).map(u => u.primarySupplier.code))];

            for (let supCode of pSupplierCodes) {
              let pSupplier = this.supplierItems.filter(z => z.code == supCode);
              if (pSupplier) {

                let pSupplierApi = (await this.supplierService.getSupplierById(pSupplier[0].id)).apiPath;
                var pInventories = this.listOrderInventoryItems.filter(x => this.mySelection.includes(x.stoneId) && x.primarySupplier.code === supCode);
                if (pInventories && pInventories.length > 0) {

                  let res = await this.commuteService.checkOrder(this.lead.leadNo.toString(), pSupplierApi, pInventories.map(x => x.stoneId));
                  if (res && res.length > 0)
                    invalidStoneIds.push(...res);
                }
              }
            }

            if (invalidStoneIds.length <= 0) {
              for (let supCode of pSupplierCodes) {
                let pSupplier = this.supplierItems.filter(z => z.code == supCode);
                if (pSupplier) {

                  let pSupplierApi = (await this.supplierService.getSupplierById(pSupplier[0].id)).apiPath;
                  var pInventories = this.listOrderInventoryItems.filter(x => this.mySelection.includes(x.stoneId) && x.primarySupplier.code == supCode);
                  if (pInventories && pInventories.length > 0) {
                    let res = await this.commuteService.deleteOrder(this.lead.leadNo.toString(), pSupplierApi, pInventories.map(x => x.stoneId));
                    if (res && res.isSuccess) {

                      let viaSupplierCodes = [...new Set(pInventories.map(u => u.viaSupplier.code))];
                      if (viaSupplierCodes && viaSupplierCodes.length > 0) {

                        for (let viaSupCode of viaSupplierCodes) {
                          let viaSupplier = this.supplierItems.filter(z => z.code == viaSupCode);
                          if (viaSupplier && viaSupplier.length > 0) {

                            let viaSupplierApi = (await this.supplierService.getSupplierById(viaSupplier[0].id)).apiPath;
                            var viaInventories = pInventories.filter(x => x.viaSupplier.code == viaSupCode);
                            if (viaSupplierApi && viaInventories && viaInventories.length > 0) {
                              res = await this.commuteService.deleteIntraCompanyOrder(this.lead.leadNo.toString(), viaSupplierApi, viaInventories.map(x => x.stoneId));
                            }
                          }
                        }
                      }

                      let supplierCodes = [...new Set(pInventories.map(u => u.supplier.code))];
                      if (supplierCodes && supplierCodes.length > 0) {

                        for (let sup of supplierCodes) {
                          if (sup != supCode) {

                            let supplier = this.supplierItems.filter(z => z.code == sup);
                            if (supplier) {

                              let supplierApi = (await this.supplierService.getSupplierById(supplier[0].id)).apiPath;
                              var supInventories = pInventories.filter(x => x.supplier.code === sup);
                              if (supplierApi && supInventories && supInventories.length > 0) {
                                res = await this.commuteService.deleteIntraCompanyOrder(this.lead.leadNo.toString(), supplierApi, supInventories.map(x => x.stoneId));
                              }
                            }
                          }
                        }
                      }

                    }
                  }
                }
              }

              let validStones = [...new Set(this.listOrderInventoryItems.filter(z => this.mySelection.includes(z.stoneId) && !invalidStoneIds.includes(z.stoneId)).map(z => z.stoneId))];
              let orderRes = await this.leadService.resetProcessedOrder(this.lead.id, validStones);
              if (orderRes) {
                this.spinnerService.hide();
                this.utilityService.showNotification('Order reset successfully!');
                if (this.listOrderInventoryItems.filter(x => !x.isRejected && this.mySelection.includes(x.stoneId)).length == this.listOrderInventoryItems.filter(x => this.mySelection.includes(x.stoneId)).length)
                  this.toggleOrderDialog();
                this.listOrderInventoryItems = new Array<InvItem>();
                this.gridOrderInventoryData = new Array<InvItem>();
                this.gridViewOrderInventory = null as any;
                this.loadOrderAllInv();
                this.mySelection = [];
              }
              else {
                this.spinnerService.hide();
                this.alertDialogService.show('Order not reset, Please contact administrator!');
              }

            }
            else {
              this.spinnerService.hide();
              this.alertDialogService.show("Cannot Reset Order, Transaction Already Created! <br /> StoneId(s): " + invalidStoneIds.join(", "));
            }

          } catch (error: any) {
            this.spinnerService.hide();
            console.error(error);
            this.alertDialogService.show('Something went wrong, Try again later!');
          }
        }
        else
          this.mySelection = [];
      });
  }

  public async deleteValidOrder(suppliers: SupplierDNorm, stoneIdsReq: Array<string>): Promise<boolean> {
    try {
      const element = suppliers;
      let stoneIds = this.listOrderInventoryItems.filter(x => stoneIdsReq.includes(x.stoneId)).map(x => x.stoneId);
      if (stoneIds && stoneIds.length > 0) {
        let supplierApi = (await this.supplierService.getSupplierById(element.id)).apiPath;
        if (supplierApi) {
          let res = await this.commuteService.deleteOrder(this.lead.leadNo.toString(), supplierApi, stoneIds);
          if (!res.isSuccess) {
            return false;
          }
        }
        else {
          return false;
        }
      }
    } catch (error: any) {
      console.error(error);
      this.alertDialogService.show('Something went wrong, Try again later!');
      return false;
    }
    return true;
  }
}

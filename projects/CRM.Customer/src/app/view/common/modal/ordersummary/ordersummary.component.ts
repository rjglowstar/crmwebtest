import { Component, EventEmitter, Input, OnInit, Output, Renderer2, ViewEncapsulation } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { DbLog } from 'shared/enitites';
import { LeadStatus, LogService, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { Lead, LeadSummary, Scheme } from '../../../../entities';
import { AppPreloadService, CartService, CustomerDashboardService, CustomerService, InventoryService, LeadService, SchemeService, SystemUserService } from '../../../../services';

@Component({
  selector: 'app-ordersummary',
  templateUrl: './ordersummary.component.html',
  styleUrl: './ordersummary.component.css',
  encapsulation: ViewEncapsulation.None
})
export class OrdersummaryComponent implements OnInit {
  @Output() toggle: EventEmitter<boolean> = new EventEmitter();
  @Output() childEvent = new EventEmitter();

  @Input() invIds: string[] = Array<string>();
  @Input() cartIds: string[] = Array<string>();
  @Input() totalAmount: number = 0.00;
  @Input() pageFrom: string = "";

  public lastPurchase: number = 0.00;
  public totalVowValue: number = 0.00;
  public appliedVowDisc: number = 0.00;
  public appliedVowAmt: number = 0.00;
  public paybleAmount: number = 0.00;
  public pickUpLocation: string = "";
  public pickupLocations: any[] = [
    { id: 1, name: 'Hong Kong', isChecked: false },
    { id: 2, name: 'Mumbai', isChecked: false },
    { id: 3, name: 'Belgium', isChecked: false },
    { id: 4, name: 'Dubai', isChecked: false },
    { id: 5, name: 'Other', isChecked: false }
  ];
  public isShowOtherLocation: boolean = false;
  public otherLocation: string = '';
  public isContinuBtnDisabled = false;
  private scheme: Scheme = new Scheme();
  private customerName: string = '';
  private customerId: string = '';
  private sellerId: string = '';
  private customerCity: string = '';

  constructor(
    public utilityService: UtilityService,
    private alertDialogService: AlertdialogService,
    private spinnerService: NgxSpinnerService,
    private appPreloadService: AppPreloadService,
    private schemeService: SchemeService,
    private customerService: CustomerService,
    private systeUserService: SystemUserService,
    private inventoryService: InventoryService,
    private cartService: CartService,
    private leadService: LeadService,
    private logService: LogService,
    public customerDashboardService: CustomerDashboardService,
    private renderer: Renderer2
  ) { }

  ngOnInit(): void {
    this.calculateVow();
    this.isBodyScrollHidden(true);
  }

  public async calculateVow() {
    try {
      this.spinnerService.show();
      let credential = await this.appPreloadService.fetchFxCredentials("");
      this.customerId = credential.id;
      this.customerName = credential.fullName;
      this.customerCity = credential.city;
      this.sellerId = credential.sellerId;

      //Online Vow Disocount
      this.scheme = await this.schemeService.getOnlineSchemeAsync(true);
      this.lastPurchase = await this.leadService.getLastPurchaseAmountForVow(credential.id);

      if (this.scheme) {
        let todayAmount = this.totalAmount;
        let todayPurchase = Number(todayAmount.toFixed(2));
        this.totalVowValue = Number((todayPurchase + this.lastPurchase).toFixed(2));
        let schemeDetail = this.scheme.details.find(c => c.from <= this.totalVowValue && this.totalVowValue <= c.to);
        if (schemeDetail)
          this.appliedVowDisc = schemeDetail?.discount;
        this.paybleAmount = Number((todayPurchase - ((todayPurchase * this.appliedVowDisc) / 100)).toFixed(2));
        this.appliedVowAmt = Number((todayPurchase - this.paybleAmount).toFixed(2));
        this.spinnerService.hide();
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public addPickupLocation(pickupLocation: any, event: any): void {
    this.pickUpLocation = pickupLocation.name;

    if (this.pickUpLocation == "Other") {
      this.isShowOtherLocation = true;
      this.pickUpLocation = this.customerCity;
    }
    else
      this.isShowOtherLocation = false;
  }

  public async continueCheckOut() {
    try {
      this.spinnerService.show();

      if (this.customerName && this.sellerId && this.invIds && this.invIds.length) {
        this.isContinuBtnDisabled = true;

        let customer = await this.customerService.getCustomerDNormByIdAsync(this.customerId);
        if (customer) {
          let seller = await this.systeUserService.getSystemUserDNormAsync(this.sellerId);
          if (seller) {

            let lead = new Lead();
            lead.customer = customer;
            lead.seller = seller;
            lead.leadStatus = LeadStatus.Hold.toString();
            lead.pickupLocation = (this.pickUpLocation == "Other") ? this.otherLocation : this.pickUpLocation;
            lead.platform = "online";

            let invItems = await this.inventoryService.getInvItemsAsync(this.invIds);
            if (invItems && invItems.length > 0) {

              lead.leadInventoryItems = invItems;

              lead.leadInventoryItems.forEach(x => {
                x.perCarat = this.utilityService.ConvertToFloatWithDecimal((((x.price.rap) ?? 0) + (((x.price.rap) ?? 0) * ((x.price.discount ?? 0)) / 100)));
                x.netAmount = this.utilityService.ConvertToFloatWithDecimal(x.perCarat * x.weight);
                x.vowDiscount = this.appliedVowDisc
                x.vowAmount = Number((this.utilityService.ConvertToFloatWithDecimal((((x.netAmount ?? 0)) * this.appliedVowDisc / 100))).toFixed(2));
                x.fAmount = Number(((x.netAmount ?? 0) - (x.vowAmount ?? 0)).toFixed(2));
              })

              let summary = new LeadSummary();
              summary.totalPcs = invItems.length;
              summary.totalCarat = Number(invItems.reduce((ty, u) => ty + u.weight, 0).toFixed(2));
              summary.totalAmount = this.totalAmount;
              summary.totalVOWDiscPer = this.appliedVowDisc;
              summary.totalVOWDiscAmount = this.appliedVowAmt;
              summary.totalPayableAmount = this.paybleAmount;
              summary.perCarat = summary.totalAmount / summary.totalCarat;
              summary.totalRAP = invItems.reduce((acc, cur) => acc + ((cur.price.rap ?? 0) * (cur.weight)), 0) ?? 0;
              summary.avgRap = Number((summary.totalRAP / summary.totalCarat).toFixed(2));
              summary.avgDiscPer = Number((((this.totalAmount / summary.totalRAP) * 100) - 100).toFixed(2));
              summary.discPer = summary.totalPayableAmount / summary.totalRAP * 100 - 100;
              summary.pricePerCarat = Number((summary.totalPayableAmount / summary.totalCarat).toFixed(2));
              lead.leadSummary = summary;
            }

            var result = await this.leadService.insertLeadAsync(lead);
            if (result && result.isSuccess) {
              if (this.pageFrom == "MyCart") {
                await this.cartService.deleteCartsAsync(this.cartIds, true);
                await this.customerDashboardService.deleteRecByCustomerId(this.customerId, this.cartIds);
              }
              this.alertDialogService.show(result.message);
              this.spinnerService.hide();
              this.parentMethodCall();
            }
            else {
              this.alertDialogService.show(result.message);
              this.spinnerService.hide();
              return;
            }
          }
        }
      }
      this.spinnerService.hide();
      this.closeCheckoutDialog();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
      this.closeCheckoutDialog();
    }
  }

  public parentMethodCall(): void {
    this.childEvent.emit();
  }

  public closeCheckoutDialog() {
    this.toggle.emit(false);
    this.isBodyScrollHidden(false);
  }


  /* #region  Add log */
  private addDbLog(action: string, request: string, response: string, error: string) {
    try {
      let log: DbLog = new DbLog();
      log.action = action;
      log.category = "Customer";
      log.controller = "OrderSummary";
      log.userName = this.customerName;
      log.ident = this.customerId;
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

  public isBodyScrollHidden(isScrollHide: boolean) {
    const action = isScrollHide ? 'addClass' : 'removeClass'
    this.renderer[action](document.body, 'hiddenScroll');
  }
  /* #endregion */

}

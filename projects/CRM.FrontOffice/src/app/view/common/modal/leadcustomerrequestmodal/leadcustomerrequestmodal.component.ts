import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { NgxSpinnerService } from 'ngx-spinner';
import { Notifications } from 'shared/enitites';
import { AppPreloadService, LeadHistoryAction, NotificationService, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { Configurations, CustomerDNorm, fxCredential, InvItem, Lead, LeadHistory, LeadSummary, Scheme, SystemUser } from '../../../../entities';
import { ConfigurationService, CustomerService, LeadService, SchemeService, LeadHistoryService, SystemUserService } from '../../../../services';

@Component({
  selector: 'app-leadcustomerrequestmodal',
  templateUrl: './leadcustomerrequestmodal.component.html',
  styleUrls: ['./leadcustomerrequestmodal.component.css']
})
export class LeadcustomerrequestmodalComponent implements OnInit {

  @Input() public leadId!: string;
  @Input() public notificationId!: string;

  @Output() toggle: EventEmitter<{ changePartyReqId: string, isOpen: boolean }> = new EventEmitter();
  public isAdmin: boolean = false;
  public leadObj = new Lead();
  public gridDetailSummary = new LeadSummary();
  public fxCredential!: fxCredential;
  public listCustomerItems: Array<{ text: string; companyName: string, value: string }> = [];
  public customerItems: CustomerDNorm[] = [];
  public selectedCustomerItem: string = "";
  public customerEditObj: CustomerDNorm = new CustomerDNorm();
  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains'
  };
  public configurationObj: Configurations = new Configurations();
  public selectedAdminUser: SystemUser = new SystemUser();
  public message: Notifications = new Notifications();
  public schemes: Scheme = new Scheme();
  public lastPurchase: number = 0;

  constructor(
    public customerService: CustomerService,
    private alertDialogService: AlertdialogService,
    public utilityService: UtilityService,
    private spinnerService: NgxSpinnerService,
    public appPreloadService: AppPreloadService,
    public leadService: LeadService,
    public configurationService: ConfigurationService,
    public router: Router,
    public notificationService: NotificationService,
    public schemeService: SchemeService,
    private leadHistoryService: LeadHistoryService,
    private systemUserService: SystemUserService
  ) { }

  async ngOnInit() {
    await this.loadDefaultMethods();
  }

  public async loadDefaultMethods() {
    try {
      this.spinnerService.show();
      this.fxCredential = await this.appPreloadService.fetchFxCredentials();
      if (!this.fxCredential)
        this.router.navigate(["login"]);
      await this.loadBusinessConfiguration();

      if (this.leadId) {
        this.leadObj = new Lead();
        this.leadObj = await this.leadService.getLeadById(this.leadId);
        this.leadObj.leadInventoryItems = await this.leadService.getStonesByLeadId(this.leadId, false);
        this.schemes = await this.getSchemes(this.leadObj.platform.toLowerCase() == "online" ? true : false);
        this.lastPurchase = await this.leadService.getLastPurchaseAmountForVow(this.leadObj.customer.id);
        this.gridDetailSummary = new LeadSummary();
        this.gridDetailSummary = this.calculateSummaryAll(this.leadObj.leadInventoryItems);
        if (this.isAdmin) {
          this.customerEditObj = new CustomerDNorm();
          this.customerEditObj = await this.customerService.getCustomerDNormByIdAsync(this.leadObj.changePartyId);
        }
      }
      this.spinnerService.hide();

    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async getSchemes(isOnline: boolean) {
    return await this.schemeService.getOnlineSchemeAsync(isOnline);
  }

  public async loadBusinessConfiguration() {
    try {
      this.configurationObj = await this.configurationService.getConfiguration();
      this.selectedAdminUser = this.configurationObj?.leadPartyChangeUser?.id ? this.configurationObj?.leadPartyChangeUser : this.configurationObj?.adminUser;
      this.isAdmin = this.fxCredential.origin == "Admin" ? true : false;

    } catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public customerEditChange(e: any) {
    if (e) {
      let fetchCustomer = this.customerItems.find(x => x.id == e);
      if (fetchCustomer) {
        setTimeout(() => {
          this.selectedCustomerItem = fetchCustomer?.companyName + '-' + fetchCustomer?.name ?? '' as any;
        }, 0);
        this.customerEditObj = { ...fetchCustomer } ?? new CustomerDNorm();

      }
    }
    else
      this.customerEditObj = new CustomerDNorm();

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

  public closeEditCustomer(changePartyId: string = '') {
    let response = {
      changePartyReqId: changePartyId ? changePartyId : "",
      isOpen: false
    }

    this.toggle.emit(response);
  }

  /* #region  Submit actions */
  public requestToChangeParty() {
    this.alertDialogService.ConfirmYesNo(`Are you want to apply for change party detail to Admin?`, "Update Party Detail").subscribe(async (res: any) => {
      if (res.flag) {
        try {
          let lead = await this.leadService.getLeadById(this.leadId);
          this.leadObj.changePartyId = this.customerEditObj.id;
          lead.changePartyId = this.leadObj.changePartyId;
          //await this.updateLead();
          if (lead.changePartyId) {
            if (lead.customer.id != lead.changePartyId) {
              let updateResponse: boolean = await this.leadService.leadUpdate(lead);
              if (updateResponse) {
                this.insertLeadHistoryAction(LeadHistoryAction.LeadChangeParty, `Change Lead Party Request by ${this.leadObj.seller.name}`)
                await this.sendMessage(lead, !this.isAdmin);
                this.closeEditCustomer(lead.changePartyId);
              }
            }
            else
              this.alertDialogService.show("You can not make change request, because you current party and changeable party is same!")
          }
          else
            this.alertDialogService.show("Something went wrong with Requesting to Change Party")
        } catch (error: any) {
          console.error(error);
          this.spinnerService.hide();
          this.alertDialogService.show(error.error);
        }

      }
    })
  }

  public requestAcceptOrReject(isAccept: boolean) {
    this.alertDialogService.ConfirmYesNo(`Are you want to ${isAccept ? "accept" : "reject"} party detail?`, "Update Party Detail").subscribe(async (res: any) => {
      if (res.flag) {
        try {
          if (this.customerEditObj && this.customerEditObj.id) {
            let lead = await this.leadService.getLeadById(this.leadId);
            if (isAccept) {
              this.leadObj.customer = this.customerEditObj;
              lead.customer = this.customerEditObj;
              this.leadObj.leadChangePartyFlag = true;
              lead.leadChangePartyFlag = true;

            }
            else {
              this.leadObj.leadChangePartyFlag = false;
              lead.leadChangePartyFlag = false;

            }
            // await this.updateLead();
            let updateResponse: boolean = await this.leadService.leadUpdate(lead);
            if (updateResponse) {
              this.insertLeadHistoryAction(LeadHistoryAction.LeadChangeParty, `Change Lead Party Request has been ${(this.leadObj.leadChangePartyFlag ? "accepted" : "rejected")} by ${this.selectedAdminUser?.fullName}`)
              await this.sendMessage(lead, !this.isAdmin);
              if (this.notificationId) {
                let response = await this.notificationService.deleteMessage(this.notificationId);
                if (response)
                  this.notificationService.MessageLoadSub();
              }
              this.closeEditCustomer();
            }
          }
          else
            this.alertDialogService.show("Party not found on Lead. Kindly, contact to administrator!")

        } catch (error: any) {
          console.error(error);
          this.spinnerService.hide();
          this.alertDialogService.show(error.error);
        }
      }
    }
    );

  }

  public async updateLead() {
    let updateResponse: boolean = await this.leadService.leadUpdate(this.leadObj);
    if (updateResponse) {
      await this.sendMessage(this.leadObj, !this.isAdmin);
      if (this.notificationId) {
        let response = await this.notificationService.deleteMessage(this.notificationId);
        if (response)
          this.notificationService.MessageLoadSub();
      }
      this.closeEditCustomer();
    }

  }

  public async insertLeadHistoryAction(action: string, desc: string) {
    try {
      var leadHistoryObj = new LeadHistory()
      leadHistoryObj.leadId = this.leadObj.id;
      leadHistoryObj.leadNo = this.leadObj.leadNo;
      leadHistoryObj.action = action;
      leadHistoryObj.description = desc;
      leadHistoryObj.stoneIds = this.leadObj.leadInventoryItems?.map(e => e.stoneId) ?? [];
      leadHistoryObj.customer = this.leadObj.customer;
      leadHistoryObj.broker = this.leadObj.broker;
      leadHistoryObj.seller = this.leadObj.seller;
      leadHistoryObj.createdBy = this.fxCredential.fullName;
      await this.leadHistoryService.InsertLeadHistory(leadHistoryObj)
    }
    catch (error: any) {
      this.alertDialogService.show(error.error);
    }
  }

  /* #endregion */
  /* #region  Notification section */
  public async sendMessage(leadObj: Lead, isSeller = true) {
    if (this.selectedAdminUser && this.selectedAdminUser?.id) {
      this.message.title = `${leadObj.leadNo}`;
      if (isSeller) {
        this.message.description = `Change Lead Party Request by ${this.leadObj.seller.name}`;
        this.message.icon = "icon-erroricon";
        this.message.categoryType = "modal";
      }
      else {
        this.message.icon = "icon-info";
        this.message.categoryType = "information";
        this.message.description = `Change Lead Party Request has been ${(leadObj.leadChangePartyFlag ? "accepted" : "rejected")} by ${this.selectedAdminUser?.fullName}`;
      }
      this.message.action = "LeadChangeParty";
      this.message.param = leadObj.id;
      this.message.senderId = JSON.parse(sessionStorage.getItem("userToken") ?? "").ident;
      this.message.receiverId = isSeller ? this.selectedAdminUser?.id : this.leadObj.seller.id;

      let notificationResponse = await this.notificationService.insertNotification(this.message);
      if (notificationResponse) {
        this.message.id = notificationResponse;
        this.notificationService.messages.next(this.message);
      }
    }
    else
      this.alertDialogService.show("Kindly configure default admin in configuration");
  }
  /* #endregion */


  //#region Summary Calculation 
  public calculateSummaryAll(inventoryItems: InvItem[]) {
    let leadSummaryLocal = new LeadSummary();
    leadSummaryLocal.totalCarat = inventoryItems.reduce((acc, cur) => acc + cur.weight, 0);
    leadSummaryLocal.totalAmount = inventoryItems.reduce((acc, cur) => acc + (cur.price.netAmount ? cur.price.netAmount : 0), 0);
    leadSummaryLocal.totalRAP = inventoryItems.reduce((acc, cur) => acc + ((cur.price.rap ?? 0) * (cur.weight)), 0) ?? 0;
    leadSummaryLocal.totalPcs = inventoryItems.length;
    leadSummaryLocal.avgRap = (leadSummaryLocal.totalRAP / leadSummaryLocal.totalCarat) ?? 0;

    leadSummaryLocal.avgDiscPer = (((leadSummaryLocal.totalAmount / leadSummaryLocal.totalRAP) * 100) - 100);
    leadSummaryLocal.perCarat = leadSummaryLocal.totalAmount / leadSummaryLocal.totalCarat;

    //#region  VOW calculation
    let totalVowValue = Number((leadSummaryLocal.totalAmount + this.lastPurchase).toFixed(2));
    let vowDiscount = 0;
    if (this.schemes) {
      let schemeDetail = this.schemes.details.find(c => c.from <= totalVowValue && totalVowValue <= c.to);
      if (schemeDetail)
        vowDiscount = schemeDetail?.discount;
      leadSummaryLocal.totalVOWDiscPer = vowDiscount;
    }
    //#endregion
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

}

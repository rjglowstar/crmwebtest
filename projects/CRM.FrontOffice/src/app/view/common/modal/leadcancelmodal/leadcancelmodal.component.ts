import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { DataResult, process } from '@progress/kendo-data-query';
import { NgxSpinnerService } from 'ngx-spinner';
import { Configurations, InvHistory, InvItem, Lead, LeadRejectedOffer, LeadSummary, Scheme, Supplier, SystemUser } from '../../../../entities';
import { Notifications, fxCredential } from 'shared/enitites';
import { AppPreloadService, InvHistoryAction, LeadStatus, NotificationService, RejectionType, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { CommuteService, ConfigurationService, InvHistoryService, InventoryService, LeadService, SchemeService, SupplierService } from '../../../../services';
import { LeadRejectedOfferItem } from 'projects/CRM.FrontOffice/src/app/entities/business/base/leadrejectofferitem';

@Component({
  selector: 'app-leadcancelmodal',
  templateUrl: './leadcancelmodal.component.html',
  styleUrls: ['./leadcancelmodal.component.css']
})
export class LeadcancelmodalComponent implements OnInit {

  @Output() public toggle = new EventEmitter<any>();
  @Input() notificationId!: string;
  @Input() selectedIds!: string[];
  @Input() leadNo!: Number;

  public fxCredential!: fxCredential;
  public gridViewInvItemList!: DataResult;

  public supplierItems: Supplier[] = [];
  public configurationObj: Configurations = new Configurations();
  public leadObj: Lead = new Lead();
  public cancelInvItems: InvItem[] = [];
  public cancelStoneLeadSummary: LeadSummary = new LeadSummary();

  public lastPurchase: number = 0;
  public filterComment: string = null as any;
  public ReasonMsg: string = null as any;

  public schemes: Scheme = new Scheme();
  public creditNoteMessageUserIds: string[] = [];

  public isAdmin: boolean = false;
  public isFullCancel: boolean = false;

  constructor(
    private spinnerService: NgxSpinnerService,
    public appPreloadService: AppPreloadService,
    public inventoryService: InventoryService,
    public router: Router,
    public leadService: LeadService,
    private alertDialogService: AlertdialogService,
    private formBuilder: UntypedFormBuilder,
    public configurationService: ConfigurationService,
    public utilityService: UtilityService,
    public notificationService: NotificationService,
    private schemeService: SchemeService,
    private supplierService: SupplierService,
    private commuteService: CommuteService,
    private invHistoryService: InvHistoryService
  ) { }

  async ngOnInit() {
    await this.defaultMethodload();
  }

  //#region Init Data
  public async defaultMethodload() {
    try {
      this.fxCredential = await this.appPreloadService.fetchFxCredentials();
      this.configurationObj = await this.configurationService.getConfiguration();
      
      this.isAdmin = this.fxCredential.origin == "Admin" ? true : false;

      if (!this.fxCredential)
        this.router.navigate(["login"]);

      await this.loadSuppliersDNorm();
      if (this.notificationId)
        await this.bindLeadData();

      if (this.leadNo)
        await this.bindLead();

    } catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Something went wrong, Try again later!');
    }
  }

  public async bindLeadData() {
    try {
      this.spinnerService.show();
      let notification = await this.notificationService.getMessgeById(this.notificationId);
      if (notification != null) {
        let lead = await this.leadService.getLeadByNo(notification.title);
        if (lead != null) {
          this.leadObj = lead;
          this.lastPurchase = await this.leadService.getLastPurchaseAmountForVow(this.leadObj.customer.id);
          this.schemes = await this.getSchemes(this.leadObj.platform == "online" ? true : false);

          let cancelInvIds = notification.param.split(',');
          if (cancelInvIds.length == lead.leadInventoryItems.length) {
            this.cancelStoneLeadSummary = lead.leadSummary;
            this.cancelInvItems = lead.leadInventoryItems;
            if (notification?.reason)
              this.cancelInvItems.forEach(x => x.reason = notification?.reason);
            this.loadInventoryGrid(lead.leadInventoryItems);
            this.isFullCancel = true;
          }
          else {
            //Bind only cancel stones data in grid
            this.cancelInvItems = lead.leadInventoryItems.filter(z => cancelInvIds.includes(z.invId));
            if (this.cancelInvItems.length > 0) {
              this.cancelStoneLeadSummary = this.calculateSummaryAll(this.cancelInvItems);
              if (notification?.reason)
                this.cancelInvItems.forEach(x => x.reason = notification?.reason);
              this.loadInventoryGrid(this.cancelInvItems);
            }
            this.isFullCancel = false;
          }

          this.spinnerService.hide();
        }
        else {
          this.spinnerService.hide();
          this.alertDialogService.show('Lead data not found, Please contact administrator!');
          this.closeLeadCancel();
        }
      }
      else {
        this.spinnerService.hide();
        this.alertDialogService.show('Notification data not found, Please contact administrator!');
        this.closeLeadCancel();
      }
    } catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Something went wrong, Try again later!');
    }
  }

  public async bindLead() {
    try {
      this.spinnerService.show();
      let lead = await this.leadService.getLeadByNo(this.leadNo.toString());
      if (lead != null) {
        this.leadObj = lead;
        this.lastPurchase = await this.leadService.getLastPurchaseAmountForVow(this.leadObj.customer.id);
        this.schemes = await this.getSchemes(this.leadObj.platform == "online" ? true : false);

        let cancelInvIds = this.selectedIds;
        if (cancelInvIds.length == lead.leadInventoryItems.length) {
          this.cancelStoneLeadSummary = lead.leadSummary;
          this.cancelInvItems = lead.leadInventoryItems;
          this.loadInventoryGrid(lead.leadInventoryItems);
          this.isFullCancel = true;
        }
        else {
          //Bind only cancel stones data in grid
          this.cancelInvItems = lead.leadInventoryItems.filter(z => cancelInvIds.includes(z.invId));
          if (this.cancelInvItems.length > 0) {
            this.cancelStoneLeadSummary = this.calculateSummaryAll(this.cancelInvItems);
            this.loadInventoryGrid(this.cancelInvItems);
          }
          this.isFullCancel = false;
        }

        this.spinnerService.hide();
      }
      else {
        this.spinnerService.hide();
        this.alertDialogService.show('Lead data not found, Please contact administrator!');
        this.closeLeadCancel();
      }

    } catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Something went wrong, Try again later!');
    }
  }

  public updateCommentOrOffer() {
    try {

      let filterStoneIds = this.cancelInvItems.map(z => z.stoneId);
      this.ReasonMsg = this.filterComment;
      this.cancelInvItems.forEach(z => {
        if (this.filterComment?.trim())
          z.reason = this.filterComment;
      });

      let filterSaleCancelListData = this.cancelInvItems.filter(z => filterStoneIds.includes(z.stoneId));
      this.cancelInvItems = JSON.parse(JSON.stringify(filterSaleCancelListData));
      this.loadInventoryGrid(this.cancelInvItems);
      this.utilityService.showNotification('Added or updated !');

      this.filterComment = null as any;
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Update fail, Try again later!');
    }
  }

  public loadInventoryGrid(invItems: InvItem[]) {
    this.gridViewInvItemList = process(invItems, {});
    this.gridViewInvItemList.total = invItems.length;
    this.spinnerService.hide();
  }

  public async saveSaleCancel(isUpdate: boolean = false) {

    if (!this.ReasonMsg) {
      this.alertDialogService.show('Required to put comment, kindly add comment!');
      return;
    }

    let closeAction = {
      isUpdate: isUpdate,
      isClose: false,
      invItem: isUpdate ? this.cancelInvItems : [],
      reason: this.ReasonMsg
    }

    this.toggle.emit(closeAction);
  }

  public async getSchemes(isOnline: boolean) {
    return await this.schemeService.getOnlineSchemeAsync(isOnline);
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
  //#endregion

  public calculateSummaryAll(inventoryItems: InvItem[]) {
    let leadSummaryLocal = new LeadSummary();
    leadSummaryLocal.totalCarat = inventoryItems.reduce((acc, cur) => acc + cur.weight, 0);
    leadSummaryLocal.totalAmount = inventoryItems.reduce((acc, cur) => acc + (cur.netAmount ? cur.netAmount : (cur.price.netAmount ? cur.price.netAmount : 0)), 0);
    leadSummaryLocal.totalRAP = inventoryItems.reduce((acc, cur) => acc + ((cur.price.rap ?? 0) * (cur.weight)), 0) ?? 0;
    leadSummaryLocal.totalPcs = inventoryItems.length;
    leadSummaryLocal.avgRap = (leadSummaryLocal.totalRAP / leadSummaryLocal.totalCarat) ?? 0;

    leadSummaryLocal.avgDiscPer = (((leadSummaryLocal.totalAmount / leadSummaryLocal.totalRAP) * 100) - 100) ?? 0;
    leadSummaryLocal.perCarat = (leadSummaryLocal.totalAmount / leadSummaryLocal.totalCarat) ?? 0;

    //#region  VOW calculation
    let totalVowValue = Number((leadSummaryLocal.totalAmount + this.lastPurchase).toFixed(2));
    let vowDiscount = 0;
    if ((this.schemes && this.leadObj.isVolDiscFlag)) {
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
          if (this.leadObj.broker?.brokrage)
            x.brokerAmount = Number((((discAmt * (this.leadObj.broker?.brokrage / 100)) ?? 0) ?? 0).toFixed(2));
        }
      });

      if (this.leadObj.broker?.brokrage)
        leadSummaryLocal.totalBrokerAmount = inventoryItems.reduce((acc, cur) => acc + cur.brokerAmount, 0);

    }
    else {
      inventoryItems.forEach(x => {
        x.fAmount = Number(((x.netAmount ?? 0)).toFixed(2));
        x.vowDiscount = 0;
        x.vowAmount = 0;
        if (this.leadObj.platform.toLowerCase() == 'offline') {
          let discAmt = (x.netAmount ?? 0);
          if (this.leadObj.broker?.brokrage)
            x.brokerAmount = Number((((discAmt * (this.leadObj.broker?.brokrage / 100)) ?? 0) ?? 0).toFixed(2));
        }
      })
      if (this.leadObj.broker?.brokrage)
        leadSummaryLocal.totalBrokerAmount = inventoryItems.reduce((acc, cur) => acc + cur.brokerAmount, 0);
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

  //#region Accept / Reject
  public async acceptOrRejectSalesCancel(isAccept: boolean) {
    try {
      this.alertDialogService.ConfirmYesNo(`Are you sure you want to ${isAccept ? 'accept' : 'reject'}  ${this.leadObj.leadStatus == "Order" ? 'order cancel' : 'sales cancel'}?`, `${this.leadObj.leadStatus == "Order" ? 'order cancel' : 'sales cancel'}`)
        .subscribe(async (res: any) => {
          if (res.flag) {
            if (isAccept) {
              if (this.leadObj.leadStatus == "Order")
                //Update Lead Data for Order cancel
                await this.UpdateLeadDataAsRejection();
              else
                await this.acceptSalesCancel();
            }
            else
              await this.rejectSalesCancel();
          }
        });
    } catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Something went wrong, Try again later!');
    }
  }

  public async acceptSalesCancel() {
    try {
      this.spinnerService.show();
      //Check if Receipt created, store UserIds of accountants (Employees) for send notification
      let checkReceiptRes = await this.checkReceiptCreated();

      if (checkReceiptRes) {
        //Remove Stone & Update Transaction Data in each BackOffice
        let updateSupplierRes = await this.updateSuppliersTransaction();
        if (updateSupplierRes) {

          //Update Lead Data for sales cancel
          await this.UpdateLeadDataAsRejection();
        }
        else
          this.spinnerService.hide();

      }
      else
        this.spinnerService.hide();

    } catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Something went wrong, Try again later!');
    }
  }

  public async checkReceiptCreated(): Promise<boolean> {
    try {
      let supplierCodes = this.cancelInvItems.map(z => z.primarySupplier.code);
      let suppliers: Supplier[] = [];

      this.supplierItems.forEach(supMain => {
        supplierCodes.forEach(supIner => {
          if (supIner == supMain.code)
            suppliers.push(supMain);
        });
      });

      suppliers = suppliers.map(u => u).filter((x, i, a) => x && a.indexOf(x) === i);

      for (let index = 0; index < suppliers.length; index++) {
        const element = suppliers[index];
        let supplierApi = element.apiPath;
        if (supplierApi) {
          let res = await this.commuteService.checkForReceiptCreate(this.leadObj.id.toString(), supplierApi);
          if (!res.isSuccess) {
            this.alertDialogService.show(res.message + " <br /> Supplier: " + element.name);
            return false;
          }
          else {
            if (res.message)
              this.creditNoteMessageUserIds = res.message.split(',');
          }
        }
        else {
          this.alertDialogService.show('Backoffice URL not found for supplier ' + element.name);
          return false;
        }
      }

    } catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Something went wrong, Try again later!');
      return false;
    }

    return true;
  }

  public async updateSuppliersTransaction(): Promise<boolean> {
    try {
      let supplierCodes = this.cancelInvItems.map(z => z.primarySupplier.code);

      let suppliers: Supplier[] = [];

      this.supplierItems.forEach(supMain => {
        supplierCodes.forEach(supIner => {
          if (supIner == supMain.code)
            suppliers.push(supMain);
        });
      });

      suppliers = suppliers.map(u => u).filter((x, i, a) => x && a.indexOf(x) === i);

      for (let index = 0; index < suppliers.length; index++) {
        const element = suppliers[index];
        let supplierApi = element.apiPath;
        if (supplierApi) {
          let stoneIds = this.cancelInvItems.filter(z => z.primarySupplier.code == element.code).map(z => z.stoneId);
          let res = await this.commuteService.updateSalesCancel(stoneIds, supplierApi);
          if (!res.isSuccess) {
            this.alertDialogService.show(res.message + " <br /> Supplier: " + element.name);
            return false;
          }
        }
        else {
          this.alertDialogService.show('Backoffice URL not found for supplier ' + element.name);
          return false;
        }
      }

    } catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Something went wrong, Try again later!');
      return false;
    }

    return true;
  }

  public async UpdateLeadDataAsRejection() {
    try {
      let response = await this.leadUpdatewithRejectedStones();
      if (response) {
        let leadRejectedOfferObj = new LeadRejectedOffer();
        leadRejectedOfferObj.leadNo = this.leadObj.leadNo;
        leadRejectedOfferObj.customer = this.leadObj.customer;
        leadRejectedOfferObj.broker = this.leadObj.broker;
        leadRejectedOfferObj.seller = this.leadObj.seller;
        leadRejectedOfferObj.rejectionType = this.leadObj.leadStatus == "Order" ? RejectionType.OrderCancel.toString() : RejectionType.SaleCancel.toString();
        leadRejectedOfferObj.rejectedInvItems = this.mappingForRejectedInvItem();

        //Insert Rejected Stone
        let insertOfferResponse = await this.leadService.leadRejectedOfferInsert(leadRejectedOfferObj);
        if (insertOfferResponse) {
          // Remove Sales Cancel Notification
          await this.notificationService.deleteMessage(this.notificationId);
          //Notification to seller for sales cancel accepted
          await this.sendNotification(true);

          this.utilityService.showNotification('Sales Cancel data updated successfully!');
          this.spinnerService.hide();
          this.closeLeadCancel();
        }
        else {
          this.alertDialogService.show('Rejection update fail, Please contact administrator');
          this.spinnerService.hide();
        }
      }
      else
        this.spinnerService.hide();

    } catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Rejection update fail, Please contact administrator');
    }
  }

  public async leadUpdatewithRejectedStones() {
    let responseReturn: boolean = false;
    try {
      //Partial Rejection
      if (this.cancelInvItems.length != this.leadObj.leadInventoryItems.filter(x => !x.isRejected).length) {
        this.leadObj.leadInventoryItems.filter(a => this.cancelInvItems.map(z => z.invId).includes(a.invId)).forEach(x => { x.isHold = false; x.isRejected = true, x.holdBy = "" });
        this.leadObj.leadSummary = this.calculateSummaryAll(this.leadObj.leadInventoryItems.filter(x => !x.isRejected));
      }
      //Full Lead Rejection
      else {
        this.leadObj.leadStatus = LeadStatus.Rejected.toString();
        this.leadObj.leadInventoryItems.forEach(x => { x.isHold = false; x.isRejected = true, x.holdBy = "" });
        this.leadObj.leadSummary = this.calculateSummaryAll(this.leadObj.leadInventoryItems.filter(x => x.isRejected));
      }

      //Updated Lead
      responseReturn = await this.leadService.leadUpdate(this.leadObj);
      if (responseReturn) {
        let stoneIds = this.cancelInvItems.map(z => z.stoneId);
        //Updated Stones To Unhold & Status > Stock
        responseReturn = await this.leadService.updateSalesCancelStones(stoneIds);
        if (!responseReturn)
          this.alertDialogService.show('Stone update Fail, Please contact administrator');
        else
          await this.insertInvItemHistoryList(stoneIds, InvHistoryAction.UnHold, "Updated the stone to UnHold and Status Stock from the Lead Cancel Modal for stone");

      }
      else
        this.alertDialogService.show('lead update Fail, Please contact administrator');
    }
    catch (error: any) {
      console.error(error);
      this.alertDialogService.show('Lead updation fail, Please contact administrator');
    }
    return responseReturn;
  }

  public mappingForRejectedInvItem(): LeadRejectedOfferItem[] {
    let data: LeadRejectedOfferItem[] = [];
    this.cancelInvItems.forEach(z => {
      let item: LeadRejectedOfferItem = new LeadRejectedOfferItem();
      item.stoneId = z.stoneId;
      item.shape = z.shape;
      item.weight = z.weight;
      item.price = z.price;
      item.comment = `${this.leadObj.leadStatus == "Order" ? "Order Cancel" : "Sales Cancel"}`;
      data.push(item);
    });
    return data;
  }

  public async rejectSalesCancel() {
    try {
      this.spinnerService.show();
      let res = await this.notificationService.deleteMessage(this.notificationId);
      if (res) {
        await this.sendNotification(false);
        this.utilityService.showNotification(`You have rejected ${this.leadObj.leadStatus == "Order" ? "Order Cancel" : "Sales Cancel"} request!`);
        this.spinnerService.hide();
        this.closeLeadCancel();
      }
      else
        this.spinnerService.hide();
    } catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Something went wrong, Try again later!');
    }
  }
  //#endregion

  public async sendNotification(isAccepted: boolean) {
    let message = new Notifications();

    message.icon = "icon-info";
    message.title = `${this.leadObj.leadNo}`;
    message.categoryType = "information";
    message.description = `${this.leadObj.leadStatus == "Order" ? "Order Cancel" : "Sales Cancel"} ${isAccepted ? 'Accepted' : 'Rejected'} by ${this.fxCredential.fullName}`;
    message.action = `${this.leadObj.leadStatus == "Order" ? "ordercancelupdated" : "salescancelupdated"}`;
    message.param = this.leadObj.id;
    message.senderId = this.fxCredential.id;
    message.receiverId = this.leadObj.seller.id;

    let notificationResponse = await this.notificationService.insertNotification(message);
    if (notificationResponse) {
      message.id = notificationResponse;
      this.notificationService.messages.next(message);
    }
  }

  public async sendCreditNoteNotification() {
    if (this.creditNoteMessageUserIds.length > 0) {
      for (let index = 0; index < this.creditNoteMessageUserIds.length; index++) {
        const z = this.creditNoteMessageUserIds[index];
        let message = new Notifications();

        message.icon = "icon-info";
        message.title = `Sales Cancel`;
        message.categoryType = "information";
        message.description = `New Sales Cancel generated, Create Credit Note for Stone Id(s): ${this.cancelInvItems.map(a => a.stoneId).join(',')}`;
        message.action = "salescancelcreditnote";
        message.param = this.leadObj.id;
        message.senderId = this.fxCredential.id;
        message.receiverId = z;

        let notificationResponse = await this.notificationService.insertNotification(message);
        if (notificationResponse) {
          message.id = notificationResponse;
          this.notificationService.messages.next(message);
        }
      }
    }
  }

  //insert invLogItem
  public async insertInvItemHistoryList(invIds: string[], action: string, desc: string) {
    try {
      var invHistorys: InvHistory[] = [];
      this.leadObj?.leadInventoryItems?.map((item) => {
        if (invIds.includes(item.stoneId) || invIds.includes(item.invId)) {
          const invHistory = new InvHistory()
          invHistory.stoneId = item.stoneId;
          invHistory.invId = item.invId;
          invHistory.action = action;
          invHistory.price = item.price;
          invHistory.userName = this.fxCredential.fullName;
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

  public closeLeadCancel() {
    let closeAction = {
      isClose: true,
    }
    this.toggle.emit(closeAction);
  }

}

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import * as moment from 'moment';
import { DragulaService } from 'ng2-dragula';
import { CountdownConfig } from 'ngx-countdown';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subject, Subscription } from 'rxjs';
import { DbLog, fxCredential, Notifications } from 'shared/enitites';
import { AppPreloadService, FrontStoneStatus, InvHistoryAction, LeadStatus, LogService, NotificationService, OriginValue, StoneStatus, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import * as xlsx from 'xlsx';
import { LeadCartItem, LeadOrderMailConfig, LeadResponse, LeadSearchCriteria } from '../../businessobjects';
import { CartSearchCriteria, Configurations, CustomerDNorm, InventoryItems, InvHistory, InvItem, Lead, LeadHistory, LeadRejectedOffer, LeadSummary, Scheme, SystemUser, SystemUserDNorm } from '../../entities';
import { BrokerService, CartService, CommuteService, ConfigurationService, CustomerService, InvHistoryService, InventoryService, LeadService, MailService, PricingRequestService, SchemeService, SystemUserService } from '../../services';
import { ExpoMasterDNorm } from '../../entities/organization/dnorm/expomasterdnorm';
import { Expomaster } from '../../entities/organization/expomaster';
import { ExpomasterService } from '../../services/expomaster/expomaster.service';
import { ExpoMasterSearchCriteria } from '../../businessobjects/organizations/expomastersearchcriteria ';
import { LeadHistoryService } from '../../services/business/leadhistory.service';

@Component({
  selector: 'app-lead',
  templateUrl: './lead.component.html',
  styleUrls: ['./lead.component.css']
})

export class LeadComponent implements OnInit, OnDestroy {

  public config!: CountdownConfig;
  public disabledFlag: boolean = false;
  public fxCredential!: fxCredential;
  public isAddLead: boolean = false;
  public dragBoard = 'LeadBoard';
  public tasksQualificationList: LeadResponse[] = new Array<LeadResponse>();
  public tasksProposalList: LeadResponse[] = new Array<LeadResponse>();
  public tasksHoldList: LeadResponse[] = new Array<LeadResponse>();
  public tasksOrderList: LeadResponse[] = new Array<LeadResponse>();
  public tasksDeliveredList: LeadResponse[] = new Array<LeadResponse>();
  public tasksRejectedList: LeadResponse[] = new Array<LeadResponse>();
  public leadSearchCriteria: LeadSearchCriteria = new LeadSearchCriteria();
  public collapeQualification: boolean = true;
  public collapeRejected: boolean = true;
  public collapeDelivered: boolean = false;
  public listInventoryItems: InvItem[] = [];
  public sellerObj = new SystemUserDNorm();
  public subs = new Subscription();
  public isEditLead: boolean = false;
  public allLeads: LeadResponse[] = new Array<LeadResponse>();
  public subjectReqDis: Subject<InvItem> = new Subject();
  public editCardStatus: string = "";
  public cloneStatus: string = "";
  public leadTitle: string = "";
  public leadItem: Lead = new Lead();
  public leadListInvInput: InvItem[] = [];
  public tasksCartList: LeadCartItem[] = new Array<LeadCartItem>();
  public cartSearchCriteria: CartSearchCriteria = new CartSearchCriteria();
  public collapeCart: boolean = false;
  public listCartInventoryItems: InventoryItems[] = [];
  public leadCartItem: LeadCartItem = new LeadCartItem();
  public isViewCart: boolean = false;
  public schemes: Scheme = new Scheme();
  public lastPurchase: number = 0;

  public isAdminRole = false;
  public isFilter: boolean = false;
  public seller: SystemUserDNorm = new SystemUserDNorm();
  public expoMaster: ExpoMasterDNorm = new ExpoMasterDNorm();
  public listSellerDNormItems: Array<{ text: string; value: string }> = [];
  public listExpoMasterDNormItems: Array<{ text: string; value: string }> = [];
  public sellerDNormItems!: SystemUserDNorm[];
  public expoMasterDNormItems!: ExpoMasterDNorm[];
  public expomastersearchcriteria: ExpoMasterSearchCriteria = new ExpoMasterSearchCriteria();
  public selectedSellerDNormItem?: { text: string; value: string };
  public selectedExpoMasterDNormItem?: { text: string; value: string };
  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains',
  };
  public isQcReason: boolean = false;
  public qcReasonModel!: string
  public leadId!: string;
  public leadRejectedObj: Lead = new Lead();
  public isRejectedOffer: boolean = false;
  public dragula$!: Subscription;
  public listCustomerItems: Array<{ text: string; companyName: string, value: string }> = [];
  public selectedCustomerItem: string = "";
  public customerItems: CustomerDNorm[] = [];
  public leadNo!: string;
  public certificateNo!: string;
  public stoneId!: string;
  public isLeadCancel: boolean = false;

  constructor(public dragulaService: DragulaService,
    public customerService: CustomerService,
    public brokerService: BrokerService,
    private alertDialogService: AlertdialogService,
    public utilityService: UtilityService,
    private spinnerService: NgxSpinnerService,
    public appPreloadService: AppPreloadService,
    public inventoryService: InventoryService,
    public router: Router,
    public leadService: LeadService,
    public notificationService: NotificationService,
    public cartService: CartService,
    public schemeService: SchemeService,
    private pricingRequestService: PricingRequestService,
    private systemUserService: SystemUserService,
    private expoMasterService: ExpomasterService,
    public configurationService: ConfigurationService,
    private mailService: MailService,
    private commuteService: CommuteService,
    private logService: LogService,
    private leadHistoryService: LeadHistoryService,
    private invHistoryService: InvHistoryService
  ) {
    this.loadLeadDragSeriveMethods();
  }

  async ngOnInit() {
    await this.loadDefaultMethods()
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.dragulaService.destroy(this.dragBoard);
  }

  public async loadDefaultMethods() {
    try {
      this.spinnerService.show();
      this.fxCredential = await this.appPreloadService.fetchFxCredentials();
      if (!this.fxCredential)
        this.router.navigate(["login"]);
      if (this.fxCredential?.origin == 'Admin')
        this.isAdminRole = true;

      this.sellerObj = await this.leadService.getSellerDNormById(this.fxCredential.id);
      await this.loadLeads();
      await this.loadCarts();
      await this.loadExpoMasterDNorm();
      if (this.isAdminRole)
        await this.loadSellerDNorm();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  //#region Lead kanban Board
  public loadLeadDragSeriveMethods() {


    this.dragulaService.createGroup(this.dragBoard, {
      //#region code to disable dragging of the element
      moves: function (el, source, handle, sibling) {
        if (window.screen.width > 991)
          return true; // elements are always draggable by default
        else
          return false;
      },
      //#endregion
      accepts: (el, target, source, sibling) => {
        let accepted: boolean = true;
        if (source?.id != LeadStatus.Qualification.toString().toLowerCase())
          accepted = (target?.id != LeadStatus.Qualification.toString().toLowerCase());

        return accepted;
      }
    });

    this.subs.add(this.dragulaService.dropModel(this.dragBoard)
      .subscribe(async (value) => {
        try {
          this.spinnerService.show();
          this.leadItem = value.item;
          let holdStones: InvItem[] = new Array<InvItem>();
          this.cloneStatus = value.item.leadStatus.toLowerCase().trim();
          let leadInvItems = await this.leadService.getStonesByLeadId(value.item.id);
          if (value.target.id.toLowerCase() == this.cloneStatus)
            return;

          if (value.target.id.toLowerCase() == LeadStatus.Rejected.toString().toLowerCase()) {
            if (this.leadItem.processDate)
              return this.loadLeadWithAlert("you can't reject the lead because it is already in process");
          }


          if (value.target.id.toLowerCase() == LeadStatus.Order.toString().toLowerCase()) {
            if (value.item.leadAdminFlag == false)
              return this.loadLeadWithAlert("Kindly, wait for admin approval about additional discount");
            if (value.item.changePartyId && value.item.leadChangePartyFlag == null)
              return this.loadLeadWithAlert("Kindly, wait for admin approval about party details changes");
          }

          if (this.cloneStatus == LeadStatus.Rejected.toString().toLowerCase())
            return this.loadLeadWithAlert("Lead is rejected, So you can't make any changes");

          if (value.target.id.toLowerCase() == LeadStatus.Proposal.toString().toLowerCase())
            return this.loadLeadWithAlert("You can not move lead to proposal");

          if (this.cloneStatus == LeadStatus.Order.toString().toLowerCase() && value.target.id.toLowerCase() == LeadStatus.Hold.toString().toLowerCase())
            return this.loadLeadWithAlert("You can not move lead to Hold");

          if (this.cloneStatus == LeadStatus.Order.toString().toLowerCase() && value.target.id.toLowerCase() == LeadStatus.Rejected.toString().toLowerCase())
            return this.loadLeadWithAlert("You can not move lead from order to Reject");


          if (leadInvItems.length > 0) {

            if (value.target.id.toLowerCase() != LeadStatus.Rejected.toString().toLowerCase()) {
              var soldStoneIds = leadInvItems.filter(x => !x.isRejected && x.status == StoneStatus.Sold.toString()).map(c => c.stoneId);
              if (soldStoneIds && soldStoneIds.length > 0) {
                this.alertDialogService.show(`${soldStoneIds.length == 1 ? `<b>` + soldStoneIds.toString() + `</b> Stone is` : `<b>` + soldStoneIds.join(", ") + `</b> Stones are`}  Sold, so you can not procced further.`);
                this.loadLeads();
                return;
              }
            }

            if ((this.cloneStatus == LeadStatus.Proposal.toString().toLowerCase() && value.target.id.toLowerCase() == LeadStatus.Hold.toString().toLowerCase())
              || (this.cloneStatus == LeadStatus.Proposal.toString().toLowerCase() && value.target.id.toLowerCase() == LeadStatus.Order.toString().toLowerCase())) {
              var stoneIds = leadInvItems.filter(x => !x.isRejected).map(c => c.stoneId);
              var returnedIds = await this.pricingRequestService.getPricingRequestStoneIds(stoneIds);
              if (returnedIds.length > 0) {
                this.alertDialogService.show(`${returnedIds.length == 1 ? returnedIds.toString() + ' Stone is' : returnedIds.join(", ") + ' Stones are'}  in Pricing Requests.`);
                this.loadLeads();
                return;
              }
            }

            if (value.target.id.toLowerCase() != LeadStatus.Rejected.toString().toLowerCase() && value.target.id.toLowerCase() != LeadStatus.Proposal.toString().toLowerCase() && !(this.cloneStatus == LeadStatus.Hold.toString().toLowerCase() && value.target.id.toLowerCase() == LeadStatus.Order.toString().toLowerCase()) && !(this.cloneStatus == LeadStatus.Order.toString().toLowerCase() && value.target.id.toLowerCase() == LeadStatus.Hold.toString().toLowerCase())) {
              holdStones = leadInvItems.filter(x => x.isHold && !x.isRejected);
              if (holdStones.length > 0)
                return this.getHoldByOtherSeller(holdStones);
            }

            if (this.cloneStatus == LeadStatus.Proposal.toString().toLowerCase() && (value.target.id.toLowerCase() == LeadStatus.Hold.toString().toLowerCase() || value.target.id.toLowerCase() == LeadStatus.Order.toString().toLowerCase())) {
              if (!value.item.qcCriteria) {
                this.leadId = value.item.id
                if (this.leadId) {
                  this.toggleQcReasonDialog();
                  this.loadLeads();
                  return this.utilityService.showNotification("Kindly add qc criteria", "warning");
                }
              }
            }

            if (value.target.id.toLowerCase() == LeadStatus.Qualification.toString().toLowerCase())
              value.item.leadStatus = LeadStatus.Qualification.toString();
            else if (value.target.id.toLowerCase() == LeadStatus.Proposal.toString().toLowerCase())
              value.item.leadStatus = LeadStatus.Proposal.toString();
            else if (value.target.id.toLowerCase() == LeadStatus.Hold.toString().toLowerCase())
              value.item.leadStatus = LeadStatus.Hold.toString();
            else if (value.target.id.toLowerCase() == LeadStatus.Order.toString().toLowerCase())
              value.item.leadStatus = LeadStatus.Order.toString();
            else if (value.target.id.toLowerCase() == LeadStatus.Rejected.toString().toLowerCase())
              value.item.leadStatus = LeadStatus.Rejected.toString();

            let leadObj = new Lead();
            leadObj = value.item;
            leadObj.leadInventoryItems = new Array<InvItem>();
            if (value.item.platform && value.item.platform.toLowerCase().trim() == "offline") {
              if (value.target.id.toLowerCase() == LeadStatus.Order.toString().toLowerCase()) {
                if (value.item.leadAdminFlag == false)
                  leadInvItems.forEach(x => { x.aDiscount = 0, x.fDiscount = 0 });
                await this.loadScheme(value.item.platform.toLowerCase().trim())
                if (this.cloneStatus == LeadStatus.Proposal.toString().toLowerCase()) {
                  leadInvItems.forEach(x => {
                    x.isRejected ? x.isHold = false : x.isHold = true;
                    x.isRejected ? x.holdBy = "" : x.holdBy = this.fxCredential.fullName;
                  });
                  holdStones = leadInvItems.filter(x => x.isHold);
                }
                else
                  holdStones = leadInvItems.filter(x => x.isHold);
                leadObj.leadSummary = this.calculateSummaryAll(holdStones);
              }
              else if (value.target.id.toLowerCase() == LeadStatus.Hold.toString().toLowerCase()) {
                await this.loadScheme(value.item.platform.toLowerCase().trim())
                holdStones = leadInvItems.filter(x => !x.isRejected);
                let leadSummaryDragHoldLocal = new LeadSummary();
                leadSummaryDragHoldLocal = this.calculateSummaryAll(holdStones);
                leadSummaryDragHoldLocal.totalCarat = leadSummaryDragHoldLocal.totalCarat;
                leadSummaryDragHoldLocal.totalAmount = leadSummaryDragHoldLocal.totalAmount;
                leadSummaryDragHoldLocal.totalPcs = leadSummaryDragHoldLocal.totalPcs;
                leadSummaryDragHoldLocal.totalPayableAmount = leadSummaryDragHoldLocal.totalPayableAmount;
                leadObj.leadSummary = leadSummaryDragHoldLocal;
              }
              else {
                holdStones = leadInvItems.filter(x => !x.isRejected);
                let leadSummaryDragLocal = new LeadSummary();
                leadSummaryDragLocal.totalCarat = holdStones.reduce((acc, cur) => acc + cur.weight, 0);
                leadSummaryDragLocal.totalAmount = holdStones.reduce((acc, cur) => acc + (cur.price.netAmount ? cur.price.netAmount : 0), 0);
                leadSummaryDragLocal.totalPcs = holdStones.length;

                leadSummaryDragLocal.totalRAP = holdStones.reduce((acc, cur) => acc + ((cur.price.rap ?? 0) * (cur.weight)), 0) ?? 0;
                leadSummaryDragLocal.avgRap = (leadSummaryDragLocal.totalRAP / leadSummaryDragLocal.totalCarat) ?? 0;
                leadSummaryDragLocal.avgDiscPer = (((leadSummaryDragLocal.totalAmount / leadSummaryDragLocal.totalRAP) * 100) - 100);
                leadSummaryDragLocal.perCarat = leadSummaryDragLocal.totalAmount / leadSummaryDragLocal.totalCarat;
                leadObj.leadSummary = leadSummaryDragLocal;
              }
            }

            if ((this.cloneStatus == LeadStatus.Hold.toString().toLowerCase() && value.target.id.toLowerCase() == LeadStatus.Order.toString().toLowerCase()) || (this.cloneStatus == LeadStatus.Proposal.toString().toLowerCase() && value.target.id.toLowerCase() == LeadStatus.Order.toString().toLowerCase())) {
              leadInvItems.forEach(x => {
                x.isRejected ? x.isHold = false : x.isHold = true;
                x.isRejected ? x.holdBy = "" : x.holdBy = this.fxCredential.fullName;
                this.calculateInvAmount(x);
              });
              leadObj.leadInventoryItems = leadInvItems;
              let summaryInventory = leadInvItems.filter(x => !x.isRejected);
              leadObj.leadSummary = this.calculateSummaryAll(summaryInventory);
            }
            else if (value.target.id.toLowerCase() == LeadStatus.Rejected.toString().toLowerCase()) {
              leadInvItems.forEach(x => { x.isRejected = true; x.isHold = false; x.holdBy = "" });
              leadObj.leadInventoryItems = leadInvItems;
              leadObj.leadSummary = this.calculateSummaryAll(leadObj.leadInventoryItems);
            }
            else {
              if (leadInvItems.length > 0)
                for (let index = 0; index < leadInvItems.length; index++) {
                  const element = leadInvItems[index];
                  let invItem = new InvItem();
                  invItem.invId = element.invId;
                  invItem.isRejected = element.isRejected;
                  invItem.aDiscount = element.aDiscount;
                  leadObj.leadInventoryItems.push(invItem);
                }
            }

            if ((this.cloneStatus == LeadStatus.Proposal.toString().toLowerCase() && value.target.id.toLowerCase() == LeadStatus.Order.toString().toLowerCase()) || (this.cloneStatus == LeadStatus.Hold.toString().toLowerCase() && value.target.id.toLowerCase() == LeadStatus.Order.toString().toLowerCase()))
              leadObj.orderDate = this.utilityService.setLiveUTCDate();
            else
              leadObj.orderDate = '' as any;

            if (leadObj.id) {
              if (value.item.platform && value.item.platform.toLowerCase().trim() == "online") {
                await this.loadScheme(value.item.platform.toLowerCase().trim())
                if (value.target.id.toLowerCase() == LeadStatus.Order.toString().toLowerCase()) {
                  let invItems = leadInvItems.filter(x => !x.isRejected);
                  if (invItems && invItems.length > 0)
                    leadObj.leadSummary = this.calculateSummaryAll(invItems);

                }
              }

              leadObj.leadStatus = value.item.leadStatus;
              if ((this.cloneStatus == LeadStatus.Hold.toString().toLowerCase() && value.target.id.toLowerCase() == LeadStatus.Rejected.toString().toLowerCase()) || (this.cloneStatus == LeadStatus.Order.toString().toLowerCase() && value.target.id.toLowerCase() == LeadStatus.Rejected.toString().toLowerCase())) {
                this.leadRejectedObj = new Lead();
                this.leadRejectedObj = leadObj;
                await this.loadLeads();

                //Do not ask for reject offer if lead is online
                if (this.leadRejectedObj.platform?.toLowerCase() == 'online') {
                  this.alertDialogService.ConfirmYesNo("Are you sure you want to reject lead?", "Reject Lead")
                    .subscribe(async (res: any) => {
                      if (res.flag) {
                        this.spinnerService.show();
                        await this.leadUpdateWithSetData(this.leadRejectedObj);
                        await this.sendOrderRejectMailToCustomer(this.leadRejectedObj);
                        await this.loadLeads();
                        this.spinnerService.hide();
                      }
                    });
                  return;
                }
                else
                  this.isRejectedOffer = true;

                return;
              }
              await this.leadUpdateWithSetData(leadObj);
            }

          }
          this.spinnerService.hide();
        }
        catch (error: any) {
          console.error(error);
          this.alertDialogService.show(error.error);
        }
      })
    );

  }

  //#region Online Lead Mail
  public async sendOrderApproveMailToCustomer(leadObj: Lead) {
    try {
      let req: LeadOrderMailConfig = new LeadOrderMailConfig();
      req.leadId = leadObj.id;
      let systemUser = await this.systemUserService.getSystemUserById(leadObj.seller.id);
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

    } catch (error: any) {
      console.error(error);
      this.alertDialogService.show('Order approve mail not send to customer, Please contact administrator!');
      this.spinnerService.hide();
    }
  }

  public async sendOrderRejectMailToCustomer(leadObj: Lead) {
    try {
      let req: LeadOrderMailConfig = new LeadOrderMailConfig();
      req.leadId = leadObj.id;
      let systemUser = await this.systemUserService.getSystemUserById(leadObj.seller.id);
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

    } catch (error: any) {
      console.error(error);
      this.alertDialogService.show('Order approve mail not send to customer, Please contact administrator!');
      this.spinnerService.hide();
    }
  }
  //#endregion

  public async leadUpdateWithSetData(leadObj: Lead) {
    this.listInventoryItems = leadObj.leadInventoryItems;
    let returnResponse: boolean = false;
    let leadInvItems: Array<InvItem> = new Array<InvItem>();
    let invIds: string[] = new Array<string>();

    if (leadObj.leadStatus.toLowerCase() == LeadStatus.Rejected.toString().toLowerCase()) {
      this.insertLeadHistoryAction(leadObj.id, `${this.cloneStatus.charAt(0).toUpperCase() + this.cloneStatus.slice(1) + "To" + leadObj.leadStatus}`, `Lead has been move from ${this.cloneStatus} to ${leadObj.leadStatus}`)
      leadInvItems = await this.leadService.getStonesByLeadId(leadObj.id, false);
      invIds = leadInvItems.map(x => x.invId);
    }
    let responseUpdate: boolean = await this.leadService.leadUpdate(leadObj);
    if (responseUpdate) {
      returnResponse = true;
      if (leadObj.leadStatus.toLowerCase() != LeadStatus.Rejected.toString().toLowerCase())
        invIds = leadObj.leadInventoryItems.filter(a => !a.isRejected).map(x => x.invId);

      if (leadObj.leadStatus.toLowerCase() == LeadStatus.Order.toString().toLowerCase() || leadObj.leadStatus.toLowerCase() == LeadStatus.Hold.toString().toLowerCase()) {
        let flag: number = 0;
        if (this.cloneStatus.toLowerCase() == LeadStatus.Proposal.toString().toLowerCase() && leadObj.leadStatus.toLowerCase() == LeadStatus.Order.toString().toLowerCase()) {
          flag = await this.inventoryService.updateInventoryHoldUnHoldById(invIds, true, true);
          if (flag > 0)
            this.insertInvItemHistoryList(invIds, InvHistoryAction.Hold, "Updated the stone to Hold from the Lead Page for stone");
        }
        else if (this.cloneStatus.toLowerCase() == LeadStatus.Proposal.toString().toLowerCase() && leadObj.leadStatus.toLowerCase() == LeadStatus.Hold.toString().toLowerCase()) {
          flag = await this.inventoryService.updateInventoryHoldUnHoldById(invIds, true);
          if (flag > 0)
            this.insertInvItemHistoryList(invIds, InvHistoryAction.Hold, "Updated the stone to Hold from the Lead Page for stone");
        }
        else if (this.cloneStatus.toLowerCase() == LeadStatus.Hold.toString().toLowerCase() && leadObj.leadStatus.toLowerCase() == LeadStatus.Order.toString().toLowerCase()) {
          flag = await this.inventoryService.updateInventoryRapNetHoldById(invIds);
          if (flag > 0)
            this.insertInvItemHistoryList(invIds, InvHistoryAction.RapnetHold, `Updated the stone to RapnetHold from the Lead Page for stone`);
        }

        if (flag > 0) {
          let invItemsLead: InvItem[] = new Array<InvItem>();
          if (leadObj.leadStatus.toLowerCase() == LeadStatus.Hold.toString().toLowerCase()) {
            invItemsLead = await this.leadService.getStonesByLeadId(leadObj.id);
            invItemsLead = invItemsLead.filter(a => !a.isRejected);
          }
          else
            invItemsLead = leadObj.leadInventoryItems.filter(a => !a.isRejected)
        }
      }
      else {
        if (this.cloneStatus.toLowerCase() == LeadStatus.Hold.toString().toLowerCase() || this.cloneStatus.toLowerCase() == LeadStatus.Order.toString().toLowerCase()) {
          if (leadObj.leadStatus.toLowerCase() == LeadStatus.Rejected.toString().toLowerCase()) {
            await this.inventoryService.updateInventoryHoldUnHoldById(invIds, false);
            this.insertInvItemHistoryList(invIds, InvHistoryAction.UnHold, "Updated the stone to UnHold from the Lead Page for stone");
            //Get pending pricing data from diamanto for update price
            let selectedStoneIds: string[] = leadObj.leadInventoryItems.map(z => z.stoneId);
            let getAllInventoryDetails: InventoryItems[] = await this.inventoryService.getInventoryByStoneIds(selectedStoneIds);
            if (getAllInventoryDetails && getAllInventoryDetails.length > 0) {
              for (let index = 0; index < getAllInventoryDetails.length; index++) {
                let element = getAllInventoryDetails[index];
                if (!element.identity.id) {
                  element.identity.id = this.fxCredential.id;
                  element.identity.name = this.fxCredential.fullName;
                  element.identity.type = this.fxCredential.origin;
                }
              }
              await this.pricingRequestService.updatePricingOnReleaseStones(getAllInventoryDetails, 'Lead Reject');
            }
            if (this.cloneStatus.toLowerCase() == LeadStatus.Order.toString().toLowerCase()) {
              let stockIds = leadInvItems.filter(x => x.status != StoneStatus.Transit.toString()).map(x => x.invId);
              await this.inventoryService.updateInventoryStatusById(stockIds, FrontStoneStatus.Stock.toString());
              this.insertInvItemHistoryList(stockIds, InvHistoryAction.Stock, `Updated the stone status is ${FrontStoneStatus.Stock.toString()} from the Lead Page for stone`);
            }
          }
        }
      }

      // // Don't remove it 
      // if (value.item.leadStatus.toLowerCase() == LeadStatus.Order.toString().toLowerCase())
      //   await this.inventoryService.updateInventoryStatusById(invIds, FrontStoneStatus.Sold.toString());
      // else
      //   await this.inventoryService.updateInventoryStatusById(invIds, FrontStoneStatus.Stock.toString());

      if (leadObj.leadStatus.toLowerCase() == LeadStatus.Order.toString().toLowerCase()) {
        await this.inventoryService.updateInventoryStatusById(invIds, FrontStoneStatus.Order.toString());
        this.insertInvItemHistoryList(invIds, InvHistoryAction.Order, `Updated the stone status is ${FrontStoneStatus.Order.toString()} from the Lead Page for stone`);
        this.insertLeadHistoryAction(leadObj.id, `${this.cloneStatus.charAt(0).toUpperCase() + this.cloneStatus.slice(1) + "To" + leadObj.leadStatus}`, `Lead has been move from ${this.cloneStatus} to ${leadObj.leadStatus}`);
        if (leadObj.platform?.toLowerCase() == 'online')
          await this.sendOrderApproveMailToCustomer(leadObj);
      }

      if (leadObj.leadStatus.toLowerCase() == LeadStatus.Hold.toString().toLowerCase()) {
        let leadData: Lead = await this.leadService.getLeadById(leadObj.id)
        if (leadData) {
          let index = this.tasksHoldList.findIndex(x => x.id == leadObj.id);
          if (index >= 0) {
            this.tasksHoldList[index].orderExpiredDate = leadData.orderExpiredDate;

            var startDate = new Date();
            var endDate = this.getConvertedDate(this.tasksHoldList[index].orderExpiredDate);
            var seconds = Math.floor((endDate.getTime() - startDate.getTime()) / 1000);
            this.tasksHoldList[index].config = {
              leftTime: seconds,
            };
          }
        }
      }
    }
    return returnResponse
  }

  public async closeRejectedDialog(event: any) {
    this.isRejectedOffer = event.isClose;
    if (event.isUpdate) {
      let response = await this.leadUpdateWithSetData(this.leadRejectedObj);
      if (response) {
        let leadRejectedOfferObj = new LeadRejectedOffer();
        leadRejectedOfferObj.leadNo = this.leadRejectedObj.leadNo;
        leadRejectedOfferObj.customer = this.leadRejectedObj.customer;
        leadRejectedOfferObj.broker = this.leadRejectedObj.broker;
        leadRejectedOfferObj.seller = this.leadRejectedObj.seller;
        leadRejectedOfferObj.rejectedInvItems = event.invItem;
        let insertOfferResponse = await this.leadService.leadRejectedOfferInsert(leadRejectedOfferObj);
        if (insertOfferResponse) {
          leadRejectedOfferObj.id = insertOfferResponse;
          await this.sendRejectedLeadMessage(leadRejectedOfferObj);
        }
        await this.loadLeads();
      }
    }
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

  public groupBy(list: any[], keyGetter: any) {
    const map = new Map();
    list.forEach((item) => {
      const key = keyGetter(item);
      const collection = map.get(key);
      if (!collection) {
        map.set(key, [item]);
      } else {
        collection.push(item);
      }
    });
    return map;
  }

  public openFilterDialog(): void {
    this.isFilter = true;
  }

  public closeFilterDialog(): void {
    this.isFilter = false;
    if (!this.isAdminRole) {
      this.leadSearchCriteria.sellerId = this.fxCredential.id;
      this.cartSearchCriteria.sellerId = this.fxCredential.id;
    }
  }

  private async loadSellerDNorm() {
    try {
      let sellers: SystemUser[] = await this.systemUserService.getSystemUserByOrigin(OriginValue.Seller.toString());
      this.sellerDNormItems = new Array<SystemUserDNorm>();
      for (let index = 0; index < sellers.length; index++) {
        const element = sellers[index];
        this.sellerDNormItems.push({
          id: element.id,
          name: element.fullName,
          mobile: element.mobile,
          email: element.email,
          address: element.address
        });
      }

      this.sellerDNormItems.forEach((item) => {
        this.listSellerDNormItems.push({ text: item.name, value: item.id });
      });
    }
    catch (error: any) {
      console.error(error);
      this.alertDialogService.show(error.error);
    }
  }


  public onSellerDNormChange(changeValue: any) {
    if (changeValue) {
      const sellerDNorm = this.sellerDNormItems.find(z => z.id == changeValue.value);
      if (sellerDNorm != undefined && sellerDNorm != null) {
        this.seller = sellerDNorm;
        this.leadSearchCriteria.sellerId = sellerDNorm.id;
        this.cartSearchCriteria.sellerId = sellerDNorm.id;
      }
    }
    else
      this.clearSeller();
  }
  //expo master
  private async loadExpoMasterDNorm() {
    try {
      var expoMaster: Expomaster = await this.expoMasterService.getExpoMaster(this.expomastersearchcriteria);
      var expoMasterData = JSON.parse(JSON.stringify(expoMaster))
      this.expoMasterDNormItems = new Array<ExpoMasterDNorm>();
      for (let index = 0; index < expoMasterData.length; index++) {
        const element = expoMasterData[index];
        this.expoMasterDNormItems.push({
          id: element.id,
          name: element.name,
          country: element.country
        });
      }

      this.expoMasterDNormItems.forEach((item) => {
        this.listExpoMasterDNormItems.push({ text: item.name, value: item.id });
      });
    }
    catch (error: any) {
      console.error(error);
      this.alertDialogService.show(error.error);
    }
  }
  public onExpoMasterDNormChange(changeValue: any) {
    if (changeValue) {
      const expoMasterDNorm = this.expoMasterDNormItems.find(z => z.name == changeValue.value);
      if (expoMasterDNorm != undefined && expoMasterDNorm != null) {
        this.expoMaster = expoMasterDNorm;
        this.leadSearchCriteria.expoName = expoMasterDNorm.name;
      }
    }
    else
      this.clearExpoMasterr();
  }

  public clearExpoMasterr() {
    this.selectedExpoMasterDNormItem = undefined;
    this.leadSearchCriteria.expoName = "";
  }
  // end expo master

  public clearSeller() {
    this.selectedSellerDNormItem = undefined;
    this.selectedExpoMasterDNormItem = undefined;
    this.leadSearchCriteria.sellerId = "";
    this.cartSearchCriteria.sellerId = "";
  }

  public async loadLeads() {
    try {
      this.spinnerService.show();
      this.tasksQualificationList = new Array<LeadResponse>();
      this.tasksProposalList = new Array<LeadResponse>();
      this.tasksHoldList = new Array<LeadResponse>();
      this.tasksOrderList = new Array<LeadResponse>();
      this.tasksDeliveredList = new Array<LeadResponse>();
      this.tasksRejectedList = new Array<LeadResponse>();

      if (!this.isAdminRole)
        this.leadSearchCriteria.sellerId = this.fxCredential.id;

      if (this.leadNo) {
        let leadNos: Array<number> = (this.utilityService.checkCertificateIds(this.leadNo).map(x => (this.utilityService.containsOnlyNumbers(x)) ? Number(x) : 0)).filter(a => a != 0) ?? new Array<number>();
        this.leadSearchCriteria.leadNos = leadNos.length > 0 ? leadNos : new Array<number>();
      }
      else
        this.leadSearchCriteria.leadNos = new Array<number>();

      if (this.certificateNo) {
        let certificateNos: Array<string> = this.utilityService.checkCertificateIds(this.certificateNo);
        this.leadSearchCriteria.certificateNos = certificateNos.length > 0 ? certificateNos : new Array<string>();
      }
      else
        this.leadSearchCriteria.certificateNos = new Array<string>();

      this.leadSearchCriteria.stoneIds = this.stoneId ? this.utilityService.CheckStoneIds(this.stoneId).map(x => x.toUpperCase()) : [];
      this.allLeads = await this.leadService.getAllLeads(this.leadSearchCriteria);

      this.setTimerOnLead();

      if (this.allLeads && this.allLeads.length > 0) {

        this.allLeads = this.allLeads.sort(
          (leftObj, rightObj) => Number(rightObj.leadNo) - Number(leftObj.leadNo),
        );

        for (let index = 0; index < this.allLeads.length; index++) {
          const element = this.allLeads[index];
          element.platform = element.platform.toLowerCase();
          if (element.leadStatus.trim().toLowerCase() == LeadStatus.Qualification.toString().toLowerCase())
            this.tasksQualificationList.push(element);
          else if (element.leadStatus.trim().toLowerCase() == LeadStatus.Proposal.toString().toLowerCase())
            this.tasksProposalList.push(element);
          else if (element.leadStatus.trim().toLowerCase() == LeadStatus.Hold.toString().toLowerCase())
            this.tasksHoldList.push(element);
          else if (element.leadStatus.trim().toLowerCase() == LeadStatus.Order.toString().toLowerCase())
            this.tasksOrderList.push(element);
          else if (element.leadStatus.trim().toLowerCase() == LeadStatus.Delivered.toString().toLowerCase())
            this.tasksDeliveredList.push(element);
          else if (element.leadStatus.trim().toLowerCase() == LeadStatus.Rejected.toString().toLowerCase())
            this.tasksRejectedList.push(element);
        }

        this.tasksHoldList.sort((a: LeadResponse, b: LeadResponse) => {
          return new Date(b.holdDate).getTime() - new Date(a.holdDate).getTime();
        });

        this.tasksOrderList.sort((a: LeadResponse, b: LeadResponse) => {
          return new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime();
        });

      }
      this.spinnerService.hide();


    } catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show("Something went wrong to load leads, Kindly contact administrator !!");
      console.error(error.error);

    }

  }

  public async loadScheme(platform: string) {
    this.schemes = await this.getSchemes(platform.toLowerCase() == "online" ? true : false);
    if (platform && platform.toLowerCase() == "online")
      this.lastPurchase = await this.leadService.getLastPurchaseAmountForVow(this.leadItem.customer.id);
    else
      this.lastPurchase = 0;
  }

  public async getSchemes(isOnline: boolean) {
    return await this.schemeService.getOnlineSchemeAsync(isOnline);
  }

  public async loadCarts() {
    let cartValue: LeadCartItem[] = new Array<LeadCartItem>();

    if (!this.isAdminRole)
      this.cartSearchCriteria.sellerId = this.fxCredential.id;
    this.cartSearchCriteria.stoneIds = this.stoneId ? this.utilityService.CheckStoneIds(this.stoneId).map(x => x.toUpperCase()) : [];
    this.cartSearchCriteria.isLeadNo = !this.leadNo ? false : true;
    this.cartSearchCriteria.isDoNotRejected = this.leadSearchCriteria.isDoNotRejected;
    if (this.certificateNo) {
      let certificateNos: Array<string> = this.utilityService.checkCertificateIds(this.certificateNo);
      this.cartSearchCriteria.certificateNos = certificateNos.length > 0 ? certificateNos : new Array<string>();
    }
    else
      this.cartSearchCriteria.certificateNos = new Array<string>();

    cartValue = await this.cartService.getCartLeadItems(this.cartSearchCriteria);

    if (cartValue && cartValue.length > 0)
      this.tasksCartList = cartValue;
    else
      this.tasksCartList = new Array<LeadCartItem>();
  }


  //#endregion

  //#region Dialog Methods
  public visiableQualification() {
    this.collapeQualification = !this.collapeQualification;
  }

  public visiableRejected() {
    this.collapeRejected = !this.collapeRejected;
  }

  public visiableDelivered() {
    this.collapeDelivered = !this.collapeDelivered;
  }

  public visiableCart() {
    this.collapeCart = !this.collapeCart;
  }

  public async toggleAddLeadDialog(value: boolean = true) {
    if (value)
      this.isAddLead = !this.isAddLead;
    else
      this.isAddLead = !value;

    this.leadItem = new Lead();
    this.leadListInvInput = Array<InvItem>();
    this.leadTitle = "";
    if (!this.isAddLead || !value) {
      await this.loadLeads();
      this.leadItem = undefined as any
    }

  }

  public async editLead(leadItem: LeadResponse, action: boolean, leadTitle: string, isNegotiate: boolean = false) {
    try {
      this.leadTitle = leadTitle;
      this.isAddLead = !this.isAddLead;
      this.leadItem = JSON.parse(JSON.stringify(leadItem));
      this.isEditLead = action;
    } catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }

  }


  //#endregion

  //#region Generate Lead from Excel
  public async onSelectExcelFile(event: Event) {
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
          var inventoryFetchExcelItems = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: Heading }) as any;
          let stoneIds: Array<string> = new Array<string>();
          let finalInventoryItems: Array<{ stoneNo: string, disc: number }> = new Array<{ stoneNo: string, disc: number }>();

          for (let index = 0; index < inventoryFetchExcelItems.length; index++) {
            let element = inventoryFetchExcelItems[index];
            if (element.hasOwnProperty("stoneNo")) {
              if (element.stoneNo)
                element.stoneNo = element.stoneNo.toLowerCase();
              finalInventoryItems.push(element);
            }

          }
          stoneIds = finalInventoryItems.map(x => x.stoneNo).filter((x: any, i: any) => (x != undefined && x != null && x != ''));

          if (stoneIds && stoneIds.length > 0) {
            this.leadListInvInput = new Array<InvItem>();
            this.spinnerService.show();
            let fetchData: InvItem[] = await this.inventoryService.getInventoryDNormsByStones(stoneIds, " " as any);
            if (fetchData && fetchData.length > 0) {

              for (let index = 0; index < fetchData.length; index++) {
                let oi = new InvItem();
                const element: InvItem = fetchData[index];
                element.aDiscount = Number(((Number((finalInventoryItems.find(x => x.stoneNo.toLowerCase() == element.stoneId.toLowerCase())?.disc)?.toFixed(4)) ?? 0) - Number(element.price.discount)).toFixed(4));
                if (element.aDiscount != 0)
                  this.calculateInvAmount(element)
                oi = element;
                this.leadListInvInput.push(oi)
              }

              if (fetchData.length != stoneIds.length) {
                let fetchStoneIds = fetchData.map(x => x.stoneId.toLowerCase());
                let notFoundStoneIds = stoneIds.filter(z => !fetchStoneIds.includes(z))
                if (notFoundStoneIds[0].toLowerCase() != finalInventoryItems[0].stoneNo.toLowerCase())
                  this.alertDialogService.show(`${notFoundStoneIds.length == 1 ? notFoundStoneIds.toString() + ' Stone is' : notFoundStoneIds.join(", ") + ' Stones are'} not found in inventory for selected file.`);
              }
            }
            else
              this.alertDialogService.show(`${stoneIds.length == 1 ? stoneIds.toString() + ' Stone is' : stoneIds.join(", ") + ' Stones are'} not found in inventory for selected file.`);

            this.isAddLead = true;
          }
          else
            this.alertDialogService.show(`Stone Ids are not found in excel sheet.`);

          this.spinnerService.hide();
        }

        fileReader.readAsArrayBuffer(file);
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error)
    }
  }
  //#endregion

  /* #region  Cart Method */
  public viewCart(leadCartItem: LeadCartItem) {
    this.isViewCart = true;
    this.leadCartItem = leadCartItem;
  }
  /* #endregion */

  /* #region Summary Calculation  */
  public calculateSummaryAll(inventoryItems: InvItem[]) {
    let leadSummaryLocal = new LeadSummary();
    leadSummaryLocal.totalCarat = inventoryItems.reduce((acc, cur) => acc + cur.weight, 0);
    leadSummaryLocal.totalAmount = inventoryItems.reduce((acc, cur) => acc + (cur.netAmount ? cur.netAmount : (cur.price.netAmount ? cur.price.netAmount : 0)), 0);
    leadSummaryLocal.totalRAP = inventoryItems.reduce((acc, cur) => acc + ((cur.price.rap ?? 0) * (cur.weight)), 0) ?? 0;
    leadSummaryLocal.totalPcs = inventoryItems.length;
    leadSummaryLocal.avgRap = (leadSummaryLocal.totalRAP / leadSummaryLocal.totalCarat) ?? 0;

    leadSummaryLocal.avgDiscPer = (((leadSummaryLocal.totalAmount / leadSummaryLocal.totalRAP) * 100) - 100);
    leadSummaryLocal.perCarat = leadSummaryLocal.totalAmount / leadSummaryLocal.totalCarat;

    /* #region  VOW calculation */
    let totalVowValue = Number((leadSummaryLocal.totalAmount + this.lastPurchase).toFixed(2));
    let vowDiscount = 0;
    if (this.schemes && this.leadItem.isVolDiscFlag) {
      let schemeDetail = this.schemes.details.find(c => c.from <= totalVowValue && totalVowValue <= c.to);
      if (schemeDetail) {
        vowDiscount = schemeDetail?.discount;
        if (this.leadItem && this.leadItem.platform && this.leadItem.platform.toLowerCase() == "online") {
          if (this.leadItem.leadSummary.totalVOWDiscPer && this.leadItem.leadSummary.totalVOWDiscPer < vowDiscount)
            vowDiscount = JSON.parse(JSON.stringify(this.leadItem.leadSummary.totalVOWDiscPer))
        }
      }
      leadSummaryLocal.totalVOWDiscPer = vowDiscount;

      inventoryItems.forEach(x => {
        x.vowDiscount = vowDiscount;
        x.vowAmount = Number((this.utilityService.ConvertToFloatWithDecimal(((x.netAmount ?? 0) * vowDiscount / 100))).toFixed(2));
        x.fAmount = Number(((x.netAmount ?? 0) - (x.vowAmount ?? 0)).toFixed(2));
        if (this.leadItem.platform.toLowerCase() == 'offline') {
          let discAmt = (x.netAmount ?? 0) - this.utilityService.ConvertToFloatWithDecimal(x.vowAmount ?? 0);
          if (this.leadItem.broker?.brokrage)
            x.brokerAmount = Number((((discAmt * (this.leadItem.broker?.brokrage / 100)) ?? 0) ?? 0).toFixed(2));
        }
      })

      if (this.leadItem.broker?.brokrage)
        leadSummaryLocal.totalBrokerAmount = inventoryItems.reduce((acc, cur) => acc + cur.brokerAmount, 0);
    }
    else {
      inventoryItems.forEach(x => {
        x.fAmount = Number(((x.netAmount ?? 0)).toFixed(2));
        x.vowDiscount = 0;
        x.vowAmount = 0;
        if (this.leadItem.platform.toLowerCase() == 'offline') {
          let discAmt = (x.netAmount ?? 0);
          if (this.leadItem.broker?.brokrage)
            x.brokerAmount = Number((((discAmt * (this.leadItem.broker?.brokrage / 100)) ?? 0) ?? 0).toFixed(2));
        }
      })
      if (this.leadItem.broker?.brokrage)
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
  /* #endregion */

  /* #region  Countdown Section */
  public setTimerOnLead() {
    if (this.allLeads.length > 0) {
      var startDate = new Date();
      // Do your operations
      for (let index = 0; index < this.allLeads.length; index++) {
        const element = this.allLeads[index];
        var endDate = this.getConvertedDate(element.orderExpiredDate);
        var seconds = Math.floor((endDate.getTime() - startDate.getTime()) / 1000);
        element.config = {
          leftTime: seconds,
          format: 'DD HH:mm:ss',
          formatDate: ({ date, formatStr }) => {
            let duration = Number(date || 0);
      
            return CountdownTimeUnits.reduce((current, [name, unit]) => {
              if (current.indexOf(name) !== -1) {
                const v = Math.floor(duration / unit);
                duration -= v * unit;
                return current.replace(new RegExp(`${name}+`, 'g'), (match: string) => {
                  // When days is empty
                  if (name === 'D' && v <= 0) {
                    return '';
                  }
                  return v.toString().padStart(match.length, '0');
                });
              }
              return current;
            }, formatStr);
          },
        };
      }
    }
  }

  public async handleEvent(e: any, item: any) {
    if (e.status == 3) {
      if (item.leadStatus.toLowerCase() == LeadStatus.Hold.toLowerCase().toString()) {
        let response = await this.leadService.updateLeadTimeoutExpired(item.id);
        if (response)
          this.loadLeads();
      }
    }
  }

  public getConvertedDate(date: any): Date {
    const day = moment(date).date();
    const month = moment(date).month();
    const year = moment(date).year();
    const hours = moment(date).hours();
    const minutes = moment(date).minutes();
    const seconds = moment(date).seconds();

    var newDate = new Date(year, month, day, hours, minutes, seconds);
    return newDate;
  }

  public loadLeadWithAlert(message: string) {
    this.loadLeads();
    return this.alertDialogService.show(message);
  }

  public daysCount(date: Date) {
    let currentDate = new Date();
    let leadDate: Date = new Date(date);
    let timeInMilisec: number = currentDate.getTime() - leadDate.getTime();
    let daysBetweenDates: number = Math.ceil(timeInMilisec / (1000 * 60 * 60 * 24));
    if (daysBetweenDates > 0)
      return daysBetweenDates + " days ago";
    else
      return "";
  }

  /* #endregion */

  //#region Qc Criteria section
  public toggleQcReasonDialog() {
    this.isQcReason = !this.isQcReason;
    if (this.isQcReason == false)
      this.qcReasonModel = '';
  }

  public async submitQCReason() {
    try {
      let confirmationMessage = `Are you sure you want to ${this.leadItem.qcCriteria ? "update" : "add"} a Qc Criteria?`;
      this.alertDialogService.ConfirmYesNo(confirmationMessage, "Lead")
        .subscribe(async (res: any) => {
          if (res.flag) {
            if (this.qcReasonModel) {
              this.spinnerService.show();
              let leadObj = new Lead();
              leadObj = await this.leadService.getLeadById(this.leadId);
              if (leadObj.id) {
                leadObj.qcCriteria = this.qcReasonModel;
                let response = await this.leadService.leadUpdate(leadObj);
                if (response) {
                  this.toggleQcReasonDialog();
                  this.utilityService.showNotification(`You have been ${this.leadItem.qcCriteria ? "updated" : "added"} Qc Criteria successfully!`);
                  if (leadObj.leadInventoryItems.length > 0) {
                    let invItemsLead: InvItem[] = await this.leadService.getStonesByLeadId(leadObj.id);
                    let holdStones = invItemsLead.filter(x => x.isHold && !x.isRejected);
                    if (holdStones.length > 0)
                      return this.getHoldByOtherSeller(holdStones);
                    else
                      leadObj.leadInventoryItems.forEach(x => { x.isHold = true, x.holdBy = this.fxCredential.fullName })
                  }

                  leadObj.leadStatus = LeadStatus.Hold;
                  let statusUpdate = await this.leadService.leadUpdate(leadObj);
                  if (statusUpdate) {
                    this.leadItem.leadInventoryItems = leadObj.leadInventoryItems;
                    this.insertLeadHistoryAction(leadObj.id, `${this.cloneStatus.charAt(0).toUpperCase() + this.cloneStatus.slice(1) + "To" + leadObj.leadStatus}`, `Lead has been move from ${this.cloneStatus} to ${leadObj.leadStatus}`);
                    let invIds = leadObj.leadInventoryItems.map(x => x.invId);
                    this.listInventoryItems = leadObj.leadInventoryItems;
                    let invresponse = await this.inventoryService.updateInventoryHoldUnHoldById(invIds, true);
                    if (invresponse > 0) {
                      this.insertInvItemHistoryList(invIds, InvHistoryAction.Hold, "Updated the stone to Hold from the Lead Page for stone");
                      let invItemsLead: InvItem[] = new Array<InvItem>();
                      invItemsLead = await this.leadService.getStonesByLeadId(leadObj.id);
                      invItemsLead = invItemsLead.filter(a => !a.isRejected);
                      this.utilityService.showNotification(`Lead have been successfully placed on the Hold !`);
                      this.loadLeads();
                    }
                  }
                }
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

  //insert invLogItem
  public async insertInvItemHistoryList(invIds: string[], action: string, desc: string) {
    try {
      var invHistorys: InvHistory[] = [];
      this.listInventoryItems?.map((item) => {
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
      this.alertDialogService.show(error);
    }
  }

  public async insertLeadHistoryAction(id: string, action: string, desc: string) {
    try {
      var leadHistoryObj = new LeadHistory()
      leadHistoryObj.leadId = id;
      leadHistoryObj.leadNo = this.leadItem.leadNo;
      leadHistoryObj.action = action;
      leadHistoryObj.description = desc;
      leadHistoryObj.stoneIds = this.leadItem.leadInventoryItems?.map((item) => item.stoneId) ?? [];
      leadHistoryObj.customer = this.leadItem.customer;
      leadHistoryObj.broker = this.leadItem.broker;
      leadHistoryObj.seller = this.leadItem.seller;
      leadHistoryObj.createdBy = this.fxCredential.fullName;
      this.leadHistoryService.InsertLeadHistory(leadHistoryObj)
    }
    catch (error: any) {
      this.alertDialogService.show(error);
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
      return this.loadLeadWithAlert(message);

  }

  public async sendRejectedLeadMessage(leadRejecetdOfferObj: LeadRejectedOffer) {
    let message = new Notifications();
    let configurationObj: Configurations = await this.configurationService.getConfiguration();

    const selectedAdminUser = configurationObj?.leadRejectedUser?.id ? configurationObj.leadRejectedUser : configurationObj?.adminUser;
    if (selectedAdminUser && selectedAdminUser?.id) {
      message.icon = "icon-info";
      message.title = `${leadRejecetdOfferObj.leadNo}`;
      message.categoryType = "modal";
      message.description = `Lead Rejected by ${leadRejecetdOfferObj.seller.name}`;
      message.action = "leadrejected";
      message.param = leadRejecetdOfferObj.id;
      message.senderId = this.fxCredential.id;
      message.receiverId = selectedAdminUser?.id;

      let notificationResponse = await this.notificationService.insertNotification(message);
      if (notificationResponse) {
        message.id = notificationResponse;
        this.notificationService.messages.next(message)
      }

    }
    else
      this.alertDialogService.show("Kindly configure default admin in configuration");
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

  public async customerChange(e: any) {
    if (e) {
      let fetchCustomer = this.customerItems.find(x => x.id == e);
      if (fetchCustomer) {
        setTimeout(() => {
          this.selectedCustomerItem = fetchCustomer?.companyName + '-' + fetchCustomer?.name ?? '' as any;
        }, 0);
        this.leadSearchCriteria.customerId = fetchCustomer.id;
        this.cartSearchCriteria.customerId = fetchCustomer.id;
      }
    }
    else {
      this.leadSearchCriteria.customerId = undefined as any;
      this.cartSearchCriteria.customerId = undefined as any;
      await this.loadLeads();
      await this.loadCarts();
    }


  }

  public async submitFilter() {

    // ((this.isAdminRole && !this.leadSearchCriteria.sellerId) || (!this.isAdminRole && this.leadSearchCriteria.sellerId)) &&
    if (!this.leadSearchCriteria.customerId && !this.leadSearchCriteria.fromDate && !this.leadSearchCriteria.toDate && !this.leadNo && !this.stoneId && !this.certificateNo)
      this.leadSearchCriteria.isFilter = false;
    else
      this.leadSearchCriteria.isFilter = true;

    // && ((this.isAdminRole && !this.cartSearchCriteria.sellerId) || (!this.isAdminRole && this.cartSearchCriteria.sellerId))
    if (!this.cartSearchCriteria.customerId && !this.cartSearchCriteria.fromDate && !this.cartSearchCriteria.toDate && !this.stoneId && !this.certificateNo)
      this.cartSearchCriteria.isFilter = false;
    else
      this.cartSearchCriteria.isFilter = true;

    await this.loadLeads();
    await this.loadCarts();
  }

  public async clearFilters() {
    this.leadSearchCriteria = new LeadSearchCriteria();
    this.cartSearchCriteria = new CartSearchCriteria();
    this.selectedCustomerItem = undefined as any;
    this.leadNo = undefined as any;
    this.stoneId = undefined as any;
    this.certificateNo = undefined as any;
    this.selectedSellerDNormItem = undefined;
    this.selectedExpoMasterDNormItem = undefined;
    await this.loadLeads();
    await this.loadCarts();
    this.isFilter = false;
  }

  public openLeadcancel() {
    this.isLeadCancel = true;
  }

  public closeLeadCancel() {
    this.isLeadCancel = false;
  }


  /* #region  Add log */
  private addDbLog(action: string, request: string, response: string, error: string) {
    try {
      let log: DbLog = new DbLog();
      log.action = action;
      log.category = "FrontOffice";
      log.controller = "LeadModal";
      log.userName = this.fxCredential?.fullName;
      log.ident = this.fxCredential?.id;
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
  /* #endregion */

}

const CountdownTimeUnits: Array<[string, number]> = [
  ['Y', 1000 * 60 * 60 * 24 * 365], // years
  ['M', 1000 * 60 * 60 * 24 * 30], // months
  ['D', 1000 * 60 * 60 * 24], // days
  ['H', 1000 * 60 * 60], // hours
  ['m', 1000 * 60], // minutes
  ['s', 1000], // seconds
  ['S', 1], // million seconds
];
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { PageChangeEvent } from '@progress/kendo-angular-grid';
import { AggregateDescriptor, DataResult, GroupDescriptor, process } from '@progress/kendo-data-query';
import { NgxSpinnerService } from 'ngx-spinner';
import { GridDetailConfig } from 'shared/businessobjects';
import { Notifications } from 'shared/enitites';
import { NotificationService, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { fxCredential, Lead, LeadHistory, LeadStoneReleaseItem, LeadStoneReleaseRequest } from '../../../../entities';
import { AppPreloadService, GridPropertiesService, LeadHistoryService, LeadService } from '../../../../services';

@Component({
  selector: 'app-leadstonereleasemodal',
  templateUrl: './leadstonereleasemodal.component.html',
  styleUrls: ['./leadstonereleasemodal.component.css']
})
export class LeadstonereleasemodalComponent implements OnInit {

  @Input() requestId!: string;
  @Input() notificationId!: string;
  @Input() releaseStonesRequest: Array<LeadStoneReleaseItem> = new Array<LeadStoneReleaseItem>();
  @Output() public toggle = new EventEmitter<any>();

  public sellerId!: string;
  public gridViewInvItemList!: DataResult;
  public leadObj!: Lead;
  public releaseAllList: Array<LeadStoneReleaseItem> = new Array<LeadStoneReleaseItem>();
  public releaseCloneAllList: Array<LeadStoneReleaseItem> = new Array<LeadStoneReleaseItem>();
  public releaseShowList: Array<LeadStoneReleaseItem> = new Array<LeadStoneReleaseItem>();
  public pageSize = 15;
  public skip = 0;
  public groups: GroupDescriptor[] = [];
  public fxCredential!: fxCredential;
  public message: Notifications = new Notifications();
  public leadStoneReleaseRequestObj = new LeadStoneReleaseRequest();
  public isDisabledSave: boolean = false;
  public aggregates: AggregateDescriptor[] = [];
  public fields!: GridDetailConfig[];
  public mySelection: Array<string> = new Array<string>();
  public isShowCheckBoxAll: boolean = true;

  constructor(public leadService: LeadService,
    public utilityService: UtilityService,
    public alertDialogService: AlertdialogService,
    public spinnerService: NgxSpinnerService,
    public appPreloadService: AppPreloadService,
    public notificationService: NotificationService,
    private gridPropertiesService: GridPropertiesService,
    private leadHistoryService: LeadHistoryService,
    public router: Router,) { }

  async ngOnInit() {
    await this.defaultMethodload();
  }

  public async defaultMethodload() {
    this.fxCredential = await this.appPreloadService.fetchFxCredentials();
    if (!this.fxCredential)
      this.router.navigate(["login"]);
    this.fields = this.gridPropertiesService.getLeadStoneReleaseGrid();

    if (this.requestId)
      await this.getStoneReleaseRequest();
    if (this.releaseStonesRequest && this.releaseStonesRequest.length > 0)
      await this.getStonesReleaseData();
  }

  public async getStoneReleaseRequest() {
    try {
      this.spinnerService.show();
      this.leadStoneReleaseRequestObj = await this.leadService.getLeadReleaseStoneById(this.requestId);
      this.leadObj = await this.leadService.getLeadByNo(this.leadStoneReleaseRequestObj?.leadStoneReleaseItems[0]?.leadNo.toString());
      this.sellerId = this.leadStoneReleaseRequestObj.identity.id;
      if (this.sellerId == this.fxCredential.id)
        this.sellerId = "";
      if (this.sellerId)
        this.fields.forEach(x =>
          (x.propertyName == "status" || x.propertyName == "seller.name") ? x.isSelected = false : x.isSelected = true
        );
      this.spinnerService.hide();

      if (this.leadStoneReleaseRequestObj.id) {
        if (this.leadStoneReleaseRequestObj.leadStoneReleaseItems.length > 0) {
          if (this.leadStoneReleaseRequestObj.leadStoneReleaseItems.length == this.leadStoneReleaseRequestObj.leadStoneReleaseItems.filter(x => x.status.toLowerCase() == 'accepted').length)
            this.isDisabledSave = true;
          this.releaseCloneAllList = JSON.parse(JSON.stringify(this.leadStoneReleaseRequestObj.leadStoneReleaseItems));
          this.releaseAllList = this.leadStoneReleaseRequestObj.leadStoneReleaseItems.filter(x => x.seller.id != this.sellerId)
          this.loadInvListPaging();
        }
      }

    } catch (error) {
      this.spinnerService.hide();
      console.error(error);
      this.alertDialogService.show('Something went wrong on get inventory data!');
    }
  }

  public async getStonesReleaseData() {
    try {
      this.leadObj = await this.leadService.getLeadByNo(this.releaseStonesRequest[0]?.leadNo.toString());
      this.releaseAllList = this.releaseStonesRequest;
      this.releaseAllList.forEach(x => { x.status = 'Awaited'; x.sellerName = x.seller.name });
      this.loadInvListPaging();
    }
    catch (error: any) {
      this.spinnerService.hide();
      console.error(error);
      this.alertDialogService.show('Something went wrong on get inventory data!');
    }
  }

  public async loadInvListPaging() {
    this.releaseShowList = new Array<LeadStoneReleaseItem>();
    if (this.releaseAllList.length > 0) {
      for (let i = this.skip; i < this.pageSize + this.skip; i++) {
        const element = this.releaseAllList[i];
        if (element)
          this.releaseShowList.push(element);
      }
    }
    this.loadInventoryGrid(this.releaseAllList);

  }

  public loadInventoryGrid(invItems: LeadStoneReleaseItem[]) {
    if (!this.sellerId) {
      this.aggregates = [
        { field: 'sellerName', aggregate: 'max' },
        { field: 'sellerCount', aggregate: 'count' },
      ];
      this.groups = [{ field: "seller.name", aggregates: this.aggregates }];

    }
    else {
      this.aggregates = [
        { field: 'leadNo', aggregate: 'max' },
        { field: 'leadCount', aggregate: 'count' },
      ];
      this.groups = [{ field: "leadNo", aggregates: this.aggregates }];
    }

    this.gridViewInvItemList = process(this.releaseShowList, { group: this.groups });
    this.gridViewInvItemList.total = invItems.length;
    this.spinnerService.hide();
  }

  public pageChange(event: PageChangeEvent): void {
    this.spinnerService.show();
    this.releaseShowList = new Array<LeadStoneReleaseItem>();
    this.skip = event.skip;
    this.loadInvListPaging();
  }

  public groupChange(groups: GroupDescriptor[]): void {
    try {
      this.groups = groups;
      this.loadInventoryGrid(this.releaseAllList);
    }
    catch (error: any) {
      console.error(error);
      this.alertDialogService.show(error.error)
    }
  }

  public async onSubmit(form: NgForm) {
    let selectedStones: Array<LeadStoneReleaseItem> = new Array<LeadStoneReleaseItem>();

    if (this.sellerId)
      selectedStones = this.releaseAllList.filter(x => this.mySelection.map(a => a.toLowerCase()).includes(x.stoneId.toLowerCase()))

    let alertMessage = `Are you want to send stone(s) request for release`;
    if (this.sellerId)
      alertMessage = `Are you want to release those stone(s)?`
    this.alertDialogService.ConfirmYesNo(alertMessage, "Release Stones").subscribe(async (res: any) => {
      if (res.flag) {
        try {
          if (form.valid) {
            this.spinnerService.show();
            if (!this.sellerId) {

              let leadStoneReleaseRequestInsertObj = new LeadStoneReleaseRequest();
              leadStoneReleaseRequestInsertObj.identity.id = this.fxCredential.id;
              leadStoneReleaseRequestInsertObj.identity.name = this.fxCredential.fullName;
              leadStoneReleaseRequestInsertObj.identity.type = this.fxCredential.origin;
              leadStoneReleaseRequestInsertObj.leadStoneReleaseItems = this.releaseAllList.filter(x => x.status.toLowerCase() != "accepted");
              let responseInsert = await this.leadService.leadLeadReleaseStoneInsert(leadStoneReleaseRequestInsertObj);
              if (responseInsert) {
                this.insertLeadHistoryAction(`Release stone request requested by ${this.fxCredential.fullName}`, leadStoneReleaseRequestInsertObj.leadStoneReleaseItems.map(item => item.stoneId));
                leadStoneReleaseRequestInsertObj.id = responseInsert;
                let sellerIds = this.releaseAllList.map(u => u.seller.id).filter((x, i, a) => x && a.indexOf(x) === i);
                for (let index = 0; index < sellerIds.length; index++) {
                  const sellerId = sellerIds[index];
                  await this.sendMessage(leadStoneReleaseRequestInsertObj, sellerId);
                }
              }
            }
            else {
              let leadRejectedStoneResponse = await this.leadService.leadLeadRejectStoneByLeadNo(selectedStones);
              if (leadRejectedStoneResponse) {
                this.releaseCloneAllList.forEach(x => selectedStones.some(a => a.stoneId.toLowerCase() == x.stoneId.toLowerCase()) ? x.status = "Accepted" : x.status = x.status);
                this.leadStoneReleaseRequestObj.leadStoneReleaseItems = this.releaseCloneAllList;
                let responseUpdate = await this.leadService.leadLeadReleaseStoneUpdate(this.leadStoneReleaseRequestObj);
                if (responseUpdate)
                  this.insertLeadHistoryAction(`Release stone request accepted by ${this.sellerId}`, this.leadStoneReleaseRequestObj.leadStoneReleaseItems.map(item => item.stoneId));
                await this.sendMessage(this.leadStoneReleaseRequestObj, this.sellerId);
                if (this.notificationId) {
                  let response = await this.notificationService.deleteMessage(this.notificationId);
                  if (response)
                    this.notificationService.MessageLoadSub();
                }
              }
            }
            this.closeStoneReleaseDialog();
            this.spinnerService.hide();
          }
        }
        catch (error: any) {
          this.spinnerService.hide();
          this.alertDialogService.show(error.error);
        }
      }
      else {
        try {
          if (this.sellerId) {
            this.releaseCloneAllList.forEach(x => selectedStones.some(a => a.stoneId.toLowerCase() == x.stoneId.toLowerCase()) ? x.status = "Rejected" : x.status = x.status);
            this.leadStoneReleaseRequestObj.leadStoneReleaseItems = this.releaseCloneAllList;
            let responseUpdate = await this.leadService.leadLeadReleaseStoneUpdate(this.leadStoneReleaseRequestObj, false);
            if (responseUpdate)
              this.insertLeadHistoryAction(`Release stone request rejected by ${this.sellerId}`, this.leadStoneReleaseRequestObj.leadStoneReleaseItems.map(item => item.stoneId));
            await this.sendMessage(this.leadStoneReleaseRequestObj, this.sellerId);
            if (this.notificationId) {
              let response = await this.notificationService.deleteMessage(this.notificationId);
              if (response)
                this.notificationService.MessageLoadSub();
            }
            this.closeStoneReleaseDialog();
          }
        }
        catch (error: any) {
          this.spinnerService.hide();
          this.alertDialogService.show(error.error);
        }
      }
    })


  }

  public closeStoneReleaseDialog() {
    this.toggle.emit(false);
  }

  public async insertLeadHistoryAction(desc: string, stroneIds: string[]) {
    try {
      const leadHistoryObj = new LeadHistory()
      leadHistoryObj.leadId = this.leadObj.id;
      leadHistoryObj.leadNo = this.leadObj.leadNo;
      leadHistoryObj.action = "LeadRelease";
      leadHistoryObj.description = desc;
      leadHistoryObj.stoneIds = stroneIds;
      leadHistoryObj.customer = this.leadObj.customer;
      leadHistoryObj.broker = this.leadObj.broker;
      leadHistoryObj.seller = this.leadObj.seller;
      leadHistoryObj.createdBy = this.fxCredential.fullName;
      await this.leadHistoryService.InsertLeadHistory(leadHistoryObj);
    }
    catch (error: any) {
      this.alertDialogService.show(error.error);
    }
  }

  public async sendMessage(leadStoneReleaseObj: LeadStoneReleaseRequest, receiverId: string, isRequest: boolean = true) {
    this.message = new Notifications();
    this.message.icon = "icon-erroricon";
    this.message.title = `Stone Release ${isRequest ? "Request" : "Response"}`;
    this.message.categoryType = "modal";
    this.message.description = `Stone Release notification by ${isRequest ? leadStoneReleaseObj.identity.name : this.fxCredential.fullName}`;
    this.message.action = "LeadRelease";
    this.message.param = leadStoneReleaseObj.id;
    this.message.senderId = isRequest ? this.fxCredential.id : receiverId;
    this.message.receiverId = isRequest ? receiverId : this.fxCredential.id;
    let notificationResponse = await this.notificationService.insertNotification(this.message);
    if (notificationResponse) {
      this.message.id = notificationResponse;
      this.notificationService.messages.next(this.message)
    }
  }
}

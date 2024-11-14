import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PageChangeEvent } from '@progress/kendo-angular-grid';
import { DataResult, SortDescriptor, orderBy } from '@progress/kendo-data-query';
import { NgxSpinnerService } from 'ngx-spinner';
import { QcCommuteItem } from 'projects/CRM.BackOffice/src/app/businessobjects';
import { GridDetailConfig } from 'shared/businessobjects';
import { fxCredential, Notifications } from 'shared/enitites';
import { NotificationService, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { InvItem, QcRequest } from '../../../../entities';
import { CommuteService, GridPropertiesService, QcrequestService } from '../../../../services';

@Component({
  selector: 'app-qcrequest-modal',
  templateUrl: './qcrequest-modal.component.html',
  styleUrls: ['./qcrequest-modal.component.css']
})
export class QcrequestModalComponent implements OnInit {
  @Input() public qcRequestObj: QcRequest = new QcRequest();
  @Input() public qcRequestBOId!: string;

  @Output() toggle: EventEmitter<boolean> = new EventEmitter();

  public qcInvItems: Array<InvItem> = new Array<InvItem>();
  public pageSize = 26;
  public skip = 0
  public detailPageSize = 20;
  public detailSkip = 0
  public gridView!: DataResult;
  public gridDetailView!: DataResult;
  public mySelection: Array<string> = new Array<string>();
  public selectedInvList: Array<InvItem> = new Array<InvItem>();
  public message: Notifications = new Notifications();
  public fxCredentials!: fxCredential;
  public isShowCheckBoxAll: boolean = true;
  public detailFields!: GridDetailConfig[];
  public qcRequestStoneReject: string = '';
  public sort: SortDescriptor[] = [
    {
      field: "stoneId",
      dir: "asc",
    },
  ];

  constructor(
    public utilityService: UtilityService,
    private alertDialogService: AlertdialogService,
    private spinnerService: NgxSpinnerService,
    private commuteService: CommuteService,
    private qcRequestService: QcrequestService,
    public notificationService: NotificationService,
    private gridPropertiesService: GridPropertiesService,
  ) { }

  async ngOnInit(): Promise<void> {
    await this.defaultMethodsLoad();
  }


  public async defaultMethodsLoad() {
    try {
      this.fxCredentials = JSON.parse(sessionStorage.getItem("fxCredentials") ?? '') as fxCredential;
      this.detailFields = await this.gridPropertiesService.getQcRequestMasterDetailGrid();

      if (this.qcRequestBOId != null)
        this.qcRequestObj = await this.qcRequestService.getQcRequest(this.qcRequestBOId);

      this.loadDetailGrid();
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Something went wrong, Data not load!');
    }
  }

  public pageChangeDetail(event: PageChangeEvent): void {
    this.spinnerService.show();
    this.detailSkip = event.skip;
    this.loadDetailGrid();
  }

  public async loadDetailGrid() {
    this.spinnerService.show();
    this.qcInvItems = new Array<InvItem>();
    this.qcInvItems = this.qcRequestObj.qcStoneIds;

    if (this.qcInvItems && this.qcInvItems.length > 0) {
      let filterQcRequestItemDetail = this.qcInvItems.slice(this.detailSkip, this.detailSkip + this.detailPageSize);
      this.gridDetailView = {
        data: orderBy(filterQcRequestItemDetail, this.sort),
        total: this.qcInvItems.length,
      }
    }
    this.spinnerService.hide();
  }

  public closeDetailsDialog() {
    this.toggle.emit(false);
  }


  public selectedRowChange(event: any) {
    if (event.selectedRows.length > 0) {
      for (let index = 0; index < event.selectedRows.length; index++) {
        const element = event.selectedRows[index];
        let indexFind = this.mySelection.findIndex(x => x == element.dataItem.stoneId);
        if (indexFind > -1)
          this.selectedInvList.push(element.dataItem);

      }
    }

    if (event.deselectedRows.length > 0) {
      for (let indexRmove = 0; indexRmove < event.deselectedRows.length; indexRmove++) {
        const element = event.deselectedRows[indexRmove];
        let indexFind = this.selectedInvList.findIndex(x => x.stoneId == element.dataItem.stoneId);
        if (indexFind > -1)
          this.selectedInvList.splice(indexFind, 1);

      }
    }
  }

  public approveOrRejectQcstones(action: string) {
    try {
      this.alertDialogService.ConfirmYesNo(`Are you want to ${action == 'accept' ? 'Approve' : 'Reject'} <b>${this.selectedInvList.map(x => x.stoneId).join(",")}</b> stone(s) ?`, "Qc Request")
        .subscribe(async (res: any) => {
          if (res.flag) {
            this.spinnerService.show();

            let qcCommuteObj = new QcCommuteItem();
            qcCommuteObj.leadId = this.qcRequestObj.leadId;
            qcCommuteObj.ident = this.qcRequestObj.ident;

            if (action == 'accept')
              qcCommuteObj.acceptedStones = this.selectedInvList.map(x => x.stoneId);
            else if (action == 'reject')
              qcCommuteObj.rejectedStones = this.selectedInvList.map(x => x.stoneId);

            let cloneQcRequest: QcRequest = JSON.parse(JSON.stringify(this.qcRequestObj))
            cloneQcRequest.qcStoneIds.forEach(x => {
              if (action == 'accept') {
                if (qcCommuteObj.acceptedStones.includes(x.stoneId))
                  x.status = "Accepted";
              }
              else if (action == 'reject') {
                if (qcCommuteObj.rejectedStones.includes(x.stoneId)) {
                  x.status = "Rejected";
                  x.comment = this.qcRequestStoneReject;
                }
              }

            })
            cloneQcRequest.isRequest = !cloneQcRequest.qcStoneIds.some(a => a.status == 'Viewing');

            let responseBo = await this.qcRequestService.updateQcRequest(cloneQcRequest);
            if (responseBo) {
              qcCommuteObj.isRequest = cloneQcRequest.isRequest;
              qcCommuteObj.comment = this.qcRequestStoneReject;
              
              let responseFO = await this.commuteService.updateQcRequestFO(qcCommuteObj);
              if (responseFO) {
                this.spinnerService.hide();
                this.qcRequestObj = cloneQcRequest;
                this.loadDetailGrid();
                this.mySelection = new Array<string>();
                this.selectedInvList = new Array<InvItem>();
                this.utilityService.showNotification("Qc Request has been procced successfully");
                await this.sendMessageOnFO('Qc Request', `Qc Request of ${cloneQcRequest.leadNo} approved from ${this.fxCredentials.organization} by ${this.fxCredentials.fullName}`, cloneQcRequest.ident, cloneQcRequest.seller.id, 'QcRequestFO');
              }
            }
            else
              this.alertDialogService.show("Something went wrong while updating Qc request, kindly try again later!")

            this.qcRequestStoneReject = "";
            this.spinnerService.hide();

          }
        });

    } catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(error.error)
    }
  }

  public async sendMessageOnFO(messageText: string, description: string, param: any, receiverId: string, actionType: string = "modal") {
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

}

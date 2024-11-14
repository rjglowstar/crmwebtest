import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { DataResult, GroupDescriptor, process } from '@progress/kendo-data-query';
import { NgxSpinnerService } from 'ngx-spinner';
import { CompanyDNorm, Employee, Ledger, LedgerDNorm, LedgerGroup, MemoRequest } from 'projects/CRM.BackOffice/src/app/entities';
import { EmployeeService, LedgerService, MemorequestService } from 'projects/CRM.BackOffice/src/app/services';
import { GridDetailConfig, NotificationResponse, NotificationSearchCriteria } from 'shared/businessobjects';
import { Notifications, fxCredential } from 'shared/enitites';
import { AppPreloadService, NotificationService, UtilityService } from 'shared/services';
import { AlertdialogService } from '../alertdialog/alertdialog.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {

  private fxCredentials!: fxCredential;
  public notifications!: NotificationResponse;
  public groups: GroupDescriptor[] = [];
  public pageSize = 26;
  public skip = 0
  public fields!: GridDetailConfig[];
  public gridView!: DataResult;
  public skeletonArray = new Array(18);
  public mySelection: string[] = [];
  public selectableSettings: SelectableSettings = {
    mode: 'single',
  };
  public notificationCriteria = new NotificationSearchCriteria();
  public filterFlag = true;
  public notificationObj = new Notifications();
  public notificationActionMStoneFlag: boolean = false;
  public notificationActionFlag = false;
  public isEditableCustomer: boolean = false;
  public leadId!: string;

  public notificationMemoActionFlag = false;
  public param!: string;
  public ledgerIdent: string = '';
  public isLedgerFlag: boolean = false;
  public fetchMemoRequest: MemoRequest = new MemoRequest();
  public ledgerObj = new Ledger();
  public listLedgerGroupItems: Array<LedgerGroup> = new Array<LedgerGroup>();
  public leadReleaseId!: string;
  public isStoneRelease: boolean = false;
  public companyItems: CompanyDNorm[] = new Array<CompanyDNorm>();
  public listCompanyItems: Array<{ text: string; value: string }> = new Array<{ text: string; value: string }>();
  public ledgerType: string = '';

  public leadRejectedId!: string;
  public qcRequestId!: string;
  public qcRequestBoId!: string;
  public isRejectedOffer: boolean = false;
  public isSalesCancel: boolean = false;
  public isQcShowDetails: boolean = false;
  public qcRequestDialog: boolean = false;

  constructor(private router: Router,
    public utilityService: UtilityService,
    public notificationService: NotificationService,
    private alertDialogService: AlertdialogService,
    private spinnerService: NgxSpinnerService,
    private appPreloadService: AppPreloadService,
    private empService: EmployeeService,
    public memoRequestService: MemorequestService,
    public ledgerService: LedgerService,
  ) { }

  async ngOnInit() {
    await this.defaultMethodsLoad();
  }

  public async defaultMethodsLoad() {
    try {
      this.fxCredentials = await this.appPreloadService.fetchFxCredentials();
      if (!this.fxCredentials)
        this.router.navigate(["login"]);

      this.fields = [
        { propertyName: "title", title: "Title", width: 80, sortOrder: 1, isSelected: true },
        { propertyName: "categoryType", title: "Category Type", width: 80, sortOrder: 2, isSelected: true },
        { propertyName: "description", title: "Description", width: 280, sortOrder: 3, isSelected: true },
        { propertyName: "createdDate", title: "Created Date", width: 80, sortOrder: 4, isSelected: true },
      ];

      await this.loadNotifications();

      this.utilityService.filterToggleSubject.subscribe(flag => {
        this.filterFlag = flag;
      });

    } catch (error: any) {
      this.alertDialogService.show(error);
      this.spinnerService.hide();
    }

  }

  public async loadNotifications() {
    try {

      this.spinnerService.show();
      this.notificationCriteria.ident = this.fxCredentials.id;
      this.notificationCriteria.isReceived = true;
      this.notificationCriteria.isSent = true;

      this.notifications = await this.notificationService.getNotifications(this.notificationCriteria, this.skip, this.pageSize);
      let data: any = this.notifications.notifications;
      this.gridView = process(data, { group: this.groups });
      this.gridView.total = this.notifications.totalCount;
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.alertDialogService.show(error);
      this.spinnerService.hide();
    }
  }

  public groupChange(groups: GroupDescriptor[]): void {
    try {
      this.groups = groups;
      this.loadNotifications();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error)
    }
  }

  public pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.loadNotifications();
  }

  public selectedRowChange(e: any) {
    this.notificationObj = e.selectedRows[0].dataItem
  }

  public deleteNotificationReasonDialog() {
    this.alertDialogService.ConfirmYesNo("Are you sure you want to delete?", "Delete")
      .subscribe(async (res: any) => {
        try {
          if (res.flag) {
            this.spinnerService.show();
            if (this.notificationObj.id) {
              let responseDelete: any = await this.notificationService.deleteMessage(this.notificationObj.id);
              if (responseDelete !== undefined && responseDelete !== null) {
                this.loadNotifications();
                this.utilityService.showNotification(`You have been deleted notification successfully!`)
              }
            }
            this.spinnerService.hide();
          }
        }
        catch (error: any) {
          this.spinnerService.hide();
          this.alertDialogService.show(error.error);
        }
      });

  }

  public async dblClickNotification() {
    // if (this.notificationObj.action.toLowerCase() == "manualissuemodal")
    //   this.notificationActionMStoneFlag = !this.notificationActionMStoneFlag;
    if (this.notificationObj.categoryType == 'modal') {
      switch (this.notificationObj.action.toLowerCase()) {
        case "memorequest":
          if (this.notificationObj.senderId == this.fxCredentials.id)
            return this.alertDialogService.show(`Kindly wait, Memo will be Approve soon by Operational Manager`);

          this.notificationObj.param ? this.param = this.notificationObj.param : undefined;
          if (this.param) {
            this.fetchMemoRequest = await this.memoRequestService.getMemoRequest(this.param);
            if (this.fetchMemoRequest) {
              if (!this.fetchMemoRequest.party.id) {

                let ledgerDNorm: LedgerDNorm = await this.ledgerService.getLedgerDNormByIdent(this.fetchMemoRequest.party.idents[0]);
                if (!ledgerDNorm) {
                  this.alertDialogService.ConfirmYesNo("Kindly add customer as a Ledger", "Memo")
                    .subscribe(async (res: any) => {
                      if (res.flag) {
                        this.ledgerIdent = this.fetchMemoRequest.party.idents[0] ?? '';
                        this.isLedgerFlag = true;
                        this.ledgerType = "Party";
                      }
                    });
                  return;
                }
                else {
                  this.fetchMemoRequest.party = ledgerDNorm;
                  await this.memoRequestService.updateMemoRequest(this.fetchMemoRequest);
                }
              }
              if (this.fetchMemoRequest.broker.idents[0] && !this.fetchMemoRequest.broker.id) {

                let ledgerDNorm: LedgerDNorm = await this.ledgerService.getLedgerDNormByIdent(this.fetchMemoRequest.broker.idents[0]);
                if (!ledgerDNorm) {
                  this.alertDialogService.ConfirmYesNo("Kindly add broker as a Ledger", "Memo")
                    .subscribe(async (res: any) => {
                      if (res.flag) {
                        this.ledgerIdent = this.fetchMemoRequest.broker.idents[0] ?? '';
                        this.isLedgerFlag = true;
                        this.ledgerType = "Broker";
                      }
                    });
                  return;
                }
                else {
                  this.fetchMemoRequest.broker = ledgerDNorm;
                  await this.memoRequestService.updateMemoRequest(this.fetchMemoRequest);
                }
              }

              if (this.fetchMemoRequest.party.id || this.fetchMemoRequest.broker.id)
                this.notificationMemoActionFlag = true;
            }
            else
              this.alertDialogService.show("you already proceeded this memo request or someone has been removed your request", "Memo");

          }
          break;
        case "lead":
          this.leadId = this.notificationObj.param;
          if (this.notificationObj.action)
            this.notificationActionFlag = !this.notificationActionFlag;
          break;
        case "leadchangeparty":
          this.leadId = this.notificationObj.param;
          if (this.notificationObj.action)
            this.isEditableCustomer = !this.isEditableCustomer;
          break;
        case "leadrejected":
          this.leadRejectedId = this.notificationObj.param;
          if (this.notificationObj.action)
            this.isRejectedOffer = !this.isRejectedOffer;
          break;
        case "leadrelease":
          this.leadReleaseId = this.notificationObj.param;
          if (this.notificationObj.action)
            this.isStoneRelease = !this.isStoneRelease;
          break;
        case "leadsalescancel":
          if (this.notificationObj.action)
            this.isSalesCancel = !this.isSalesCancel;
          break;
        case "leadordercancel":
          if (this.notificationObj.action)
            this.isSalesCancel = !this.isSalesCancel;
          break;
        case "qcrequestfo":
          this.qcRequestId = this.notificationObj.param;
          this.isQcShowDetails = true;
          break;
        case "qcrequestbo":
          this.qcRequestBoId = this.notificationObj.param;
          this.qcRequestDialog = true;
          break;
      }
    }
  }

  public async employeeName(dataItem: any) {
    try {
      if (dataItem == this.fxCredentials.id)
        return this.fxCredentials.fullName;
      else {
        let emp: Employee = await this.empService.getEmployeeById(dataItem);
        if (emp && emp.fullName)
          return emp.fullName;
        else
          return dataItem;
      }
    }
    catch (error: any) {
      this.alertDialogService.show(error);
      this.spinnerService.hide();
    }
  }

  public filterPartToggle() {
    this.utilityService.setfilterToggleValue(this.filterFlag);
  }

  public closeDialogLead(event: boolean) {
    this.notificationActionFlag = event;
    this.loadNotifications();
  }

  public async updateLedgers(value: any) {
    if (value.flag) {
      let getMemoRequest: MemoRequest = await this.memoRequestService.getMemoRequest(this.param);

      if (value.ledger) {
        let ledger: Ledger = value.ledger;

        if (value.ledger.group.name.toLowerCase() == "customer" || value.ledger.group.name.toLowerCase() == "party") {
          let party: LedgerDNorm = JSON.parse(JSON.stringify(getMemoRequest.party));

          party.id = ledger.id;

          getMemoRequest.party = party;
        }

        if (value.ledger.group.name.toLowerCase() == "broker") {
          let broker: LedgerDNorm = JSON.parse(JSON.stringify(getMemoRequest.broker));

          broker.id = ledger.id;

          getMemoRequest.broker = broker;
        }

        let updateResponse = await this.memoRequestService.updateMemoRequest(getMemoRequest);
        if (updateResponse) {
          this.utilityService.showNotification(`Ledger has been registered successfully!`);
          this.isLedgerFlag = false;
        }
      }
    }
  }

  public closeMemoDialog(event: boolean) {
    this.notificationMemoActionFlag = event;
    this.loadNotifications();
  }

  public async closeRejectedDialog(event: any) {
    this.isRejectedOffer = event.isClose;
    this.loadNotifications();
  }

  public async closeLeadCancel() {
    this.isSalesCancel = false;
    this.loadNotifications();
  }

  public async closeQcDetailsDialog() {
    this.isQcShowDetails = false;
    this.loadNotifications();

  }

  public async closeQcRequestDialog() {
    this.qcRequestDialog = false;
    this.loadNotifications();

  }

}

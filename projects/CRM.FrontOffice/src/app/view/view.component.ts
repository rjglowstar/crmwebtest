import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { keys } from 'shared/auth';
import { Notifications } from 'shared/enitites';
import { AppPreloadService, NotificationService } from 'shared/services';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css']
})

export class ViewComponent implements OnInit {

  public notificationActionFlag: boolean = false;
  public leadId!: string;
  public leadRejectedId!: string;
  public leadReleaseId!: string;
  public isEditableCustomer: boolean = false;
  public isCustVerification: boolean = false;
  public isRejectedOffer: boolean = false;
  public isStoneRelease: boolean = false;
  public isSalesCancel: boolean = false;
  public isQcShowDetails: boolean = false;
  public registerCustomerId: string = '';
  public qcRequestId!: string;
  public notificationObj = new Notifications();

  constructor(private router: Router, public notificationService: NotificationService,
    public appPreloadService: AppPreloadService,
  ) {
    if (sessionStorage.getItem("userToken") != null) {
      this.notificationService.connectWebsocket(JSON.parse(sessionStorage.getItem("userToken") ?? "").ident);
      this.notificationService.getMessage();
    }

    notificationService.notificationAction.subscribe(async (msg: Notifications) => {
      if (msg && msg.action) {
        this.toggleNotification(msg);
      }
    });
  }

  async ngOnInit(): Promise<void> {
    if (!sessionStorage.getItem("fxCredentials"))
      this.router.navigate(["login"]);
    else {
      let fxCredential = await this.appPreloadService.fetchFxCredentials();
      if (fxCredential && fxCredential.fullName)
        keys.loginUserIdent = fxCredential.fullName;
    }
  }

  public toggleNotification(event: Notifications) {
    this.notificationObj = event;
    if (this.notificationObj.categoryType == 'modal') {
      switch (this.notificationObj.action.toLowerCase()) {
        case "customerverification":
          this.registerCustomerId = this.notificationObj.param;
          this.isCustVerification = true;
          break;
        case "lead":
          this.leadId = event.param;
          if (event.action)
            this.notificationActionFlag = !this.notificationActionFlag;
          break;
        case "leadchangeparty":
          this.leadId = event.param;
          if (event.action)
            this.isEditableCustomer = !this.isEditableCustomer;
          break;
        case "leadrejected":
          this.leadRejectedId = event.param;
          if (event.action)
            this.isRejectedOffer = !this.isRejectedOffer;
          break;
        case "leadrelease":
          this.leadReleaseId = event.param;
          if (event.action)
            this.isStoneRelease = !this.isStoneRelease;
          break;
        case "leadsalescancel":
          if (event.action)
            this.isSalesCancel = !this.isSalesCancel;
          break;
        case "leadordercancel":
          if (event.action)
            this.isSalesCancel = !this.isSalesCancel;
          break;
        case "qcrequestfo":
          this.qcRequestId = this.notificationObj.param;
          this.isQcShowDetails = true;
          break;
      }
    }
  }

  public closeDialogLead(event: boolean) {
    this.notificationActionFlag = event;
  }

  public async closeRejectedDialog(event: any) {
    this.isRejectedOffer = event.isClose;
  }

  public async closeLeadCancel() {
    this.isSalesCancel = false;
  }

  public async closeQcDetailsDialog() {
    this.isQcShowDetails = false;
  }

}
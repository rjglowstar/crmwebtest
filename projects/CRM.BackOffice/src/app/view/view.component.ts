import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { keys } from 'shared/auth';
import { fxCredential, Notifications } from 'shared/enitites';
import { NotificationService, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { CompanyDNorm, Ledger, LedgerDNorm, LedgerGroup, MemoRequest } from '../entities';
import { AccountingconfigService, CompanyService, LedgerService, MemorequestService } from '../services';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css']
})

export class ViewComponent implements OnInit {

  public notificationMemoActionFlag = false;
  public param!: string;
  public ledgerIdent: string = '';
  public ledgerType: string = '';
  public isLedgerFlag: boolean = false;
  public qcRequestDialog: boolean = false;
  public fetchMemoRequest: MemoRequest = new MemoRequest();
  public ledgerObj = new Ledger();
  public listLedgerGroupItems: Array<LedgerGroup> = new Array<LedgerGroup>();
  public companyItems: CompanyDNorm[] = new Array<CompanyDNorm>();
  public listCompanyItems: Array<{ text: string; value: string }> = new Array<{ text: string; value: string }>();
  public qcRequestBoId!: string;

  constructor(private router: Router,
    public notificationService: NotificationService,
    public memoRequestService: MemorequestService,
    public ledgerService: LedgerService,
    public alertDialogService: AlertdialogService,
    public utilityService: UtilityService,
    private accountingconfigService: AccountingconfigService,
    private companyService: CompanyService,
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

  async ngOnInit() {
    if (!sessionStorage.getItem("fxCredentials"))
      this.router.navigate(["login"]);
    else {
      let fxCredentials = JSON.parse(sessionStorage.getItem("fxCredentials") ?? '') as fxCredential;
      if (fxCredentials && fxCredentials.organization)
        this.utilityService.setTitle(fxCredentials.organization + " BackOffice");
      if (fxCredentials && fxCredentials.fullName)
        keys.loginUserIdent = fxCredentials.fullName;
    }
  }

  public async toggleNotification(event: Notifications) {
    let notificationObj = event;
    if (notificationObj.categoryType == 'modal') {
      switch (notificationObj.action.toLowerCase()) {
        case "memorequest":
          event.param ? this.param = event.param : undefined;
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
        case "qcrequestbo":
          this.qcRequestBoId = notificationObj.param;
          this.qcRequestDialog = true;
          break;
      }
    }
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
  }

  public async closeQcRequestDialog() {
    this.qcRequestDialog = false;
  }

  public async setLedgerObj(obj: any) {
    await this.loadLedgerGroup();
    if (obj.companyName)
      await this.loadCompany();
    this.ledgerObj = new Ledger();
    this.ledgerObj.name = obj.name;
    this.ledgerObj.email = obj.email;
    this.ledgerObj.mobileNo = obj.mobileNo;
    this.ledgerObj.group = this.listLedgerGroupItems.find(x => x.name.toLowerCase() == obj.group.toLowerCase()) ?? new LedgerGroup();
  }

  public async loadLedgerGroup() {
    try {
      this.listLedgerGroupItems = new Array<LedgerGroup>();
      let listLedgerGroups: LedgerGroup[] = await this.accountingconfigService.getLedgerGroups();
      if (listLedgerGroups.length > 0) {
        listLedgerGroups.forEach((item) => {
          if (item.name)
            this.listLedgerGroupItems.push(item)
        })
      }
    }
    catch (error: any) {
      this.alertDialogService.show(error.error)
    }
  }

  public async loadCompany() {
    try {
      this.companyItems = new Array<CompanyDNorm>();
      let companies = await this.companyService.getAllCompanys();
      for (let index = 0; index < companies.length; index++) {
        const element = companies[index];
        let cDnormObj = new CompanyDNorm();
        cDnormObj.id = element.id;
        cDnormObj.email = element.email;
        cDnormObj.mobileNo = element.mobileNo;
        cDnormObj.name = element.name;
        cDnormObj.phoneNo = element.phoneNo;
        cDnormObj.taxNo = element.taxNo;
        this.companyItems.push(cDnormObj);
      }
    }
    catch (error: any) {
      this.alertDialogService.show(error.error);
    }
  }


}
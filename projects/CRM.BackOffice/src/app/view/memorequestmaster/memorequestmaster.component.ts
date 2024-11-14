import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { DataResult, GroupDescriptor, process } from '@progress/kendo-data-query';
import { NgxSpinnerService } from 'ngx-spinner';
import { GridDetailConfig } from 'shared/businessobjects';
import { GridConfig, GridMasterConfig, SystemUserPermission, fxCredential } from 'shared/enitites';
import { AppPreloadService, ConfigService, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { MemoRequestResponse, MemoRequestSerchCriteria } from '../../businessobjects';
import { CompanyDNorm, InvItem, Ledger, LedgerDNorm, LedgerGroup, MemoRequest } from '../../entities';
import { CommuteService, GridPropertiesService, InventoryService, LedgerService, MemorequestService } from '../../services';

@Component({
  selector: 'app-memorequestmaster',
  templateUrl: './memorequestmaster.component.html',
  styleUrls: ['./memorequestmaster.component.css']
})
export class MemorequestmasterComponent implements OnInit {

  public memoRequestSerchCriteria: MemoRequestSerchCriteria = new MemoRequestSerchCriteria();
  public stoneId: string = '';
  public groups: GroupDescriptor[] = [];
  public pageSize = 26;
  public skip = 0
  public detailPageSize = 20;
  public detailSkip = 0
  public fields!: GridDetailConfig[];
  public detailFields!: GridDetailConfig[];
  public gridView!: DataResult;
  public gridDetailView!: DataResult;
  public filterFlag = true;
  public selectableSettings: SelectableSettings = {
    checkboxOnly: true
  };
  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains'
  };
  public mySelection: string[] = [];
  public invItemDetail: InvItem[] = [];
  public selectedMemoRequest: MemoRequest = new MemoRequest();
  public isGridConfig: boolean = false;
  private fxCredential!: fxCredential;
  public gridConfig!: GridConfig;
  public gridMasterConfigResponse!: GridMasterConfig;
  public listPartyItems: Array<{ text: string, value: string }> = [];
  public partyItems: LedgerDNorm[] = [];
  public selectedParty: string = "";
  public partyObj: LedgerDNorm = new LedgerDNorm();
  public listBrokerItems: Array<{ text: string; value: string }> = [];
  public brokerItems: LedgerDNorm[] = [];
  public selectedBroker: string = "";
  public brokerObj: LedgerDNorm = new LedgerDNorm();
  public memoIssueDialog: boolean = false;
  public memoRequestObj: MemoRequest = new MemoRequest();
  public ledgerObj = new Ledger();
  public listLedgerGroupItems: Array<LedgerGroup> = new Array<LedgerGroup>();
  public ledgerIdent: string = '';
  public isLedgerFlag: boolean = false;
  public isShowDetails: boolean = false;
  public memoRequestItemDetail: MemoRequest[] = [];
  public isCanDeleteMemo: boolean = false;

  public isViewButtons: boolean = false;
  public companyItems: CompanyDNorm[] = new Array<CompanyDNorm>();
  public listCompanyItems: Array<{ text: string; value: string }> = new Array<{ text: string; value: string }>();
  public ledgerType: string = '';
  public selectedMemoRequestList: Array<MemoRequest> = new Array<MemoRequest>();
  public memoInvItems: Array<InvItem> = new Array<InvItem>();
  public certificateNo!:string;

  constructor(
    private memoRequestService: MemorequestService,
    private router: Router,
    private gridPropertiesService: GridPropertiesService,
    public utilityService: UtilityService,
    private alertDialogService: AlertdialogService,
    private spinnerService: NgxSpinnerService,
    private configService: ConfigService,
    private appPreloadService: AppPreloadService,
    public inventoryService: InventoryService,
    public ledgerService: LedgerService,
    public commuteService: CommuteService,
  ) { }

  async ngOnInit() {
    await this.defaultMethodsLoad();
  }

  public async defaultMethodsLoad() {
    this.fxCredential = await this.appPreloadService.fetchFxCredentials();
    if (!this.fxCredential)
      this.router.navigate(["login"]);

    if (this.fxCredential && this.fxCredential.origin && (this.fxCredential.origin.toLowerCase() == 'admin' || this.fxCredential.origin.toLowerCase() == 'accounts'))
      this.isViewButtons = true;

    await this.getGridConfiguration();
    await this.loadMemoRequests();
    await this.loadBrokers();
    await this.loadParties();
    await this.setUserRights();

    this.utilityService.filterToggleSubject.subscribe(flag => {
      this.filterFlag = flag;
    });
  }

  public async setUserRights() {
    let userPermissions: SystemUserPermission = new SystemUserPermission();
    let sesValue = sessionStorage.getItem("userPermission");
    if (sesValue)
      userPermissions = JSON.parse(sesValue) as SystemUserPermission;
    if (userPermissions.actions.length > 0) {
      let CanDeleteMemo = userPermissions.actions.find(z => z.name == "CanDeleteMemo");
      if (CanDeleteMemo != null)
        this.isCanDeleteMemo = true;
    }
  }

  public async getGridConfiguration() {
    try {
      this.gridConfig = await this.configService.getGridConfig(this.fxCredential.id, "MemoRequestMaster", "MemoRequestMasterGrid", this.gridPropertiesService.getMemoRequestMasterGrid());
      if (this.gridConfig && this.gridConfig.id != '') {
        let dbObj: GridDetailConfig[] = this.gridConfig.gridDetail;
        if (dbObj && dbObj.some(c => c.isSelected)) {
          this.fields = dbObj;
          this.fields.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        }
        else
          this.fields.forEach(c => c.isSelected = true);
      }
      else {
        this.gridMasterConfigResponse = await this.configService.getMasterGridConfig("MemoRequestMaster", "MemoRequestMasterGrid");
        if (this.gridMasterConfigResponse)
          this.fields = this.gridMasterConfigResponse.gridDetail;
        else
          this.fields = await this.gridPropertiesService.getMemoRequestMasterGrid();

        // this.fxCredential.origin.toLowerCase() == 'admin' ? this.fields : this.fields = this.fields.filter(c => c.title.toLowerCase() != "seller");
      }
      this.detailFields = await this.gridPropertiesService.getMemoRequestMasterDetailGrid();
    } catch (error: any) {
      this.alertDialogService.show(error.error)
      this.spinnerService.hide();
    }
  }

  public async loadMemoRequests() {
    try {
      this.spinnerService.show();      
      this.memoRequestSerchCriteria.stoneIds = this.stoneId ? this.utilityService.CheckStoneIds(this.stoneId).map(x => x.toUpperCase()) : []; 
      this.memoRequestSerchCriteria.certificateNos = this.certificateNo ? this.utilityService.checkCertificateIds(this.certificateNo) : [];
      
      let memoRequests: MemoRequestResponse = await this.memoRequestService.getMemoRequestPaginated(this.memoRequestSerchCriteria, this.skip, this.pageSize);
      this.memoRequestItemDetail = memoRequests.memoRequests;
      this.gridView = process(memoRequests.memoRequests, { group: this.groups });
      this.gridView.total = memoRequests.totalCount;
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.alertDialogService.show(error.error)
      this.spinnerService.hide();
    }
  }

  public selectedRowChange(event: any) {
    if (event.selectedRows.length > 0) {
      for (let index = 0; index < event.selectedRows.length; index++) {
        const element = event.selectedRows[index];
        let findIndex = this.selectedMemoRequestList.some(x => x.party.idents[0] != element.dataItem.party.idents[0])
        if (!findIndex)
          this.selectedMemoRequestList.push(element.dataItem);
        else {
          let indexFind = this.mySelection.findIndex(x => x == element.dataItem.id);
          if (indexFind > -1)
            this.mySelection.splice(indexFind, 1);
          this.alertDialogService.show("You can not select diffrent party while creating memo!")
        }
      }
    }

    if (event.deselectedRows.length > 0) {
      for (let indexRmove = 0; indexRmove < event.deselectedRows.length; indexRmove++) {
        const element = event.deselectedRows[indexRmove];
        let indexFind = this.selectedMemoRequestList.findIndex(x => x.id == element.dataItem.id);
        if (indexFind > -1)
          this.selectedMemoRequestList.splice(indexFind, 1);

      }
    }
  }

  public groupChange(groups: GroupDescriptor[]): void {
    try {
      this.groups = groups;
      this.loadMemoRequests();
    }
    catch (error: any) {
      this.alertDialogService.show(error.error)
    }
  }

  public pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.loadMemoRequests();
  }

  public filterPartToggle() {
    this.utilityService.setfilterToggleValue(this.filterFlag);
  }

  public onFilterSubmit(form: NgForm) {
    this.mySelection = [];
    this.selectedMemoRequestList = new Array<MemoRequest>();
    this.skip = 0
    this.loadMemoRequests()
  }

  public clearFilter(form: NgForm) {
    form.reset()
    this.memoRequestSerchCriteria = new MemoRequestSerchCriteria()
    this.stoneId = '';
    this.mySelection = [];
    this.selectedMemoRequestList = new Array<MemoRequest>();
    this.loadMemoRequests();
  }

  public openGridConfigDialog(): void {
    this.isGridConfig = true;
  }

  public async setNewGridConfig(gridConfig: GridConfig) {
    if (gridConfig) {
      this.fields = gridConfig.gridDetail;
      this.gridConfig = new GridConfig();
      this.gridConfig.id = gridConfig.id
      this.gridConfig.gridDetail = gridConfig.gridDetail;
      this.gridConfig.gridName = gridConfig.gridName;
      this.gridConfig.pageName = gridConfig.pageName;
      this.gridConfig.empID = gridConfig.empID;
    }
  }

  public deleteMemoMaster() {
    try {
      this.alertDialogService.ConfirmYesNo('Are you sure you want to delete?', 'Delete')
        .subscribe(async (res: any) => {
          if (res.flag) {
            this.spinnerService.show();
            if (this.mySelection && this.mySelection.length > 0) {
              let memoRequestIdents = this.selectedMemoRequestList.map(x => x.ident);
              let foResponse = await this.commuteService.deleteMemoRequestFO(memoRequestIdents);
              if (foResponse) {
                let response: any = await this.memoRequestService.deleteMemoRequests(this.mySelection);
                this.spinnerService.hide();

                if (response) {
                  this.selectedMemoRequest = new MemoRequest();
                  this.mySelection = [];
                  this.selectedMemoRequestList = new Array<MemoRequest>();
                  this.loadMemoRequests();
                  this.utilityService.showNotification('Memo Request deleted successfully');
                }
              }
              else
                this.alertDialogService.show('Something went wrong to delete MemoRequest in FO !!');
            }
            else
              this.alertDialogService.show('Please select a row to delete');

            this.spinnerService.hide();
          }
        });
    } catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(error.error)
    }
  }

  public async loadBrokers() {
    try {
      let ledgerType: string[] = ['Broker']
      let brokers = await this.ledgerService.getAllLedgersByType(ledgerType);
      for (let index = 0; index < brokers.length; index++) {
        const element = brokers[index];
        this.brokerItems.push({
          id: element.id,
          group: element.group.name,
          name: element.name,
          code: element.code,
          contactPerson: element.contactPerson,
          email: element.email,
          mobileNo: element.mobileNo,
          phoneNo: element.phoneNo,
          faxNo: element.faxNo,
          address: element.address,
          idents: element.idents,
          incomeTaxNo: element.incomeTaxNo,
          taxNo: element.taxNo
        });
      }

      this.listBrokerItems = [];
      this.brokerItems.forEach(z => { this.listBrokerItems.push({ text: z.name, value: z.id }); });
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Broker not load, Try gain later!');
    }
  }

  public async loadParties() {
    try {
      let ledgerType: string[] = ['Customer']
      let partys = await this.ledgerService.getAllLedgersByType(ledgerType);
      for (let index = 0; index < partys.length; index++) {
        const element = partys[index];
        this.partyItems.push({
          id: element.id,
          group: element.group.name,
          name: element.name,
          code: element.code,
          contactPerson: element.contactPerson,
          email: element.email,
          mobileNo: element.mobileNo,
          phoneNo: element.phoneNo,
          faxNo: element.faxNo,
          address: element.address,
          idents: element.idents,
          incomeTaxNo: element.incomeTaxNo,
          taxNo: element.taxNo
        });
      }
      this.listPartyItems = [];
      this.partyItems.forEach(z => { this.listPartyItems.push({ text: z.name, value: z.id }); });
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Party not load, Try again later!');
    }
  }

  public handlePartyFilter(value: any) {
    this.listPartyItems = [];
    let partyItems = this.partyItems.filter(z => z.name.toLowerCase().includes(value.toLowerCase()))
    partyItems.reverse().forEach(z => { this.listPartyItems.push({ text: z.name, value: z.id }); });
  }

  public partyChange(e: any) {
    if (e) {
      let fetchCustomer = this.partyItems.find(x => x.id == e);
      if (fetchCustomer) {
        setTimeout(() => {
          this.selectedParty = fetchCustomer?.name ?? '' as any;
        }, 0);
        this.memoRequestSerchCriteria.partyId = fetchCustomer.idents[0] ?? "";
      }
    }
  }

  public handleBrokerFilter(value: any) {
    this.listBrokerItems = [];
    let brokerItems = this.brokerItems.filter(z => z.name.toLowerCase().includes(value.toLowerCase()))
    brokerItems.reverse().forEach(z => { this.listBrokerItems.push({ text: z.name, value: z.id }); });
  }

  public brokerChange(e: any) {
    if (e) {
      let fetchBroker = this.brokerItems.find(x => x.id == e);
      if (fetchBroker) {
        setTimeout(() => {
          this.selectedBroker = fetchBroker?.name ?? '' as any;
        }, 0);
        this.memoRequestSerchCriteria.brokerId = fetchBroker.idents[0] ?? "";
      }
    }
  }

  public async issueMemo() {
    try {
      if (this.selectedMemoRequestList && this.selectedMemoRequestList.length > 0) {
        this.memoInvItems = new Array<InvItem>();
        this.fetchSelectedInvItems();

        this.selectedMemoRequest = { ...this.selectedMemoRequestList[0] };
        this.selectedMemoRequest.memoStoneIds = this.memoInvItems;

        if (this.selectedMemoRequest && this.selectedMemoRequest.memoStoneIds.length > 0 && this.mySelection.length > 0) {

          var stoneIds = this.selectedMemoRequest.memoStoneIds.map(c => c.stoneId);
          var validStoneIds = await this.memoRequestService.validateMemoStones(stoneIds);

          this.memoRequestObj = this.selectedMemoRequest;
          if (this.memoRequestObj && stoneIds.length == validStoneIds.length) {
            if (!this.memoRequestObj.party.id) {

              let ledgerDNorm: LedgerDNorm = await this.ledgerService.getLedgerDNormByIdent(this.memoRequestObj.party.idents[0]);
              if (!ledgerDNorm) {
                this.alertDialogService.ConfirmYesNo("Kindly add customer as a Ledger", "Memo")
                  .subscribe(async (res: any) => {
                    if (res.flag) {
                      this.ledgerIdent = this.memoRequestObj.party.idents[0] ?? '';
                      this.isLedgerFlag = true;
                      this.ledgerType = "Party";
                    }
                  });
                return;
              }
              else {
                this.memoRequestObj.party = ledgerDNorm;
                await this.memoRequestService.updateMemoRequest(this.memoRequestObj);
              }
            }

            if (this.memoRequestObj.broker.idents[0] && !this.memoRequestObj.broker.id) {

              let ledgerDNorm: LedgerDNorm = await this.ledgerService.getLedgerDNormByIdent(this.memoRequestObj.broker.idents[0]);
              if (!ledgerDNorm) {
                this.alertDialogService.ConfirmYesNo("Kindly add broker as a Ledger", "Memo")
                  .subscribe(async (res: any) => {
                    if (res.flag) {
                      this.ledgerIdent = this.memoRequestObj.broker.idents[0] ?? '';
                      this.isLedgerFlag = true;
                      this.ledgerType = "Broker";
                    }
                  });
                return;
              }
              else {
                this.memoRequestObj.broker = ledgerDNorm;
                await this.memoRequestService.updateMemoRequest(this.memoRequestObj);
              }
            }
            if (this.memoRequestObj.party.id  || this.memoRequestObj.broker.id )
              this.memoIssueDialog = true;
          }
          else
            this.alertDialogService.show("you already have proceeded this memo request or someone has been removed your request", "Memo");
        }
      }
    } catch (error) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Something went wrong in issue memo, Try again later!');
    }

  }

  public fetchSelectedInvItems() {
    let stoneList = this.selectedMemoRequestList.map(x => x.memoStoneIds.filter((v, i, a) => a.findIndex(v2 => (v2.stoneId === v.stoneId)) === i));
    for (let index = 0; index < stoneList.length; index++) {
      let element = stoneList[index];
      for (let index1 = 0; index1 < element.length; index1++) {
        let elementSub = element[index1];
        this.memoInvItems.push(elementSub)
      }

    }

  }


  public async updateLedgers(value: any) {
    try {
      if (value.flag) {
        let getMemoRequest: MemoRequest = await this.memoRequestService.getMemoRequest(this.selectedMemoRequest.id);
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
            await this.loadMemoRequests();
          }
        }
      }
      this.mySelection = [];
      this.selectedMemoRequestList = new Array<MemoRequest>();
    } catch (error) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Ledger not added, Try again later!');
    }
  }

  public openDetailsDialog() {
    this.isShowDetails = true;
    this.loadDetailGrid();
  }

  public closeDetailsDialog() {
    this.isShowDetails = false;
    this.detailSkip = 0;
  }

  public pageChangeDetail(event: PageChangeEvent): void {
    this.spinnerService.show();
    this.detailSkip = event.skip;
    this.loadDetailGrid();
  }

  public async loadDetailGrid() {
    this.spinnerService.show();
    this.memoInvItems = new Array<InvItem>();
    this.fetchSelectedInvItems();
    if (this.memoInvItems && this.memoInvItems.length > 0) {
      // let findIssue: MemoRequest = this.memoRequestItemDetail.find(c => c.id == this.mySelection[0]) ?? new MemoRequest;
      this.invItemDetail = this.memoInvItems;
      let filtermemoRequestItemDetail = this.invItemDetail.slice(this.detailSkip, this.detailSkip + this.detailPageSize);
      this.gridDetailView = process(filtermemoRequestItemDetail, {});
      this.gridDetailView.total = this.invItemDetail.length;
    }
    this.spinnerService.hide();
  }

}
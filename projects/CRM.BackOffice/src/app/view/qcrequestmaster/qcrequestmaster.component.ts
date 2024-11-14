import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { DataResult, GroupDescriptor, process } from '@progress/kendo-data-query';
import { NgxSpinnerService } from 'ngx-spinner';
import { GridDetailConfig } from 'shared/businessobjects';
import { fxCredential, GridConfig, GridMasterConfig, SystemUserPermission } from 'shared/enitites';
import { AppPreloadService, ConfigService, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { QcRequestResponse, QcRequestSerchCriteria } from '../../businessobjects';
import { CompanyDNorm, InvItem, Ledger, LedgerDNorm, LedgerGroup, QcRequest } from '../../entities';
import { CommuteService, GridPropertiesService, InventoryService, LedgerService, QcrequestService } from '../../services';
import { Align } from '@progress/kendo-angular-popup';

@Component({
  selector: 'app-qcrequestmaster',
  templateUrl: './qcrequestmaster.component.html',
  styleUrls: ['./qcrequestmaster.component.css']
})
export class QcrequestmasterComponent implements OnInit {

  public qcRequestSerchCriteria: QcRequestSerchCriteria = new QcRequestSerchCriteria();
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
    checkboxOnly: false
  };
  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains'
  };

  @ViewChild("anchor") public anchor!: ElementRef;
  @ViewChild("popup", { read: ElementRef }) public popup!: ElementRef;
  public anchorAlign: Align = { horizontal: "right", vertical: "bottom" };
  public popupAlign: Align = { horizontal: "center", vertical: "top" };
  public copyOption: string | null = 'selected';

  public mySelection: string[] = [];
  public mySelectionDetail: string[] = [];
  public invItemDetail: InvItem[] = [];
  public selectedQcRequest: QcRequest = new QcRequest();
  public selectedDetailQcRequest: InvItem = new InvItem();
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
  public selectedBroker?: { text: string, value: string };
  public brokerObj: LedgerDNorm = new LedgerDNorm();
  public qcRequestDialog: boolean = false;
  public qcRequestObj: QcRequest = new QcRequest();
  public ledgerObj = new Ledger();
  public listLedgerGroupItems: Array<LedgerGroup> = new Array<LedgerGroup>();
  public ledgerIdent: string = '';
  public isLedgerFlag: boolean = false;
  public isShowDetails: boolean = false;
  public qcRequestItemDetail: QcRequest[] = [];
  public filterQcRequestItemDetail: InvItem[] = [];
  public isCanDeleteMemo: boolean = false;

  public isViewButtons: boolean = true;
  public companyItems: CompanyDNorm[] = new Array<CompanyDNorm>();
  public listCompanyItems: Array<{ text: string; value: string }> = new Array<{ text: string; value: string }>();
  public ledgerType: string = '';
  public qcInvItems: Array<InvItem> = new Array<InvItem>();
  public certificateNo!: string;

  public filterStoneId: string = '';

  public filterCertiNo: string = '';

  constructor(
    private qcRequestService: QcrequestService,
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
    this.detailFields = await this.gridPropertiesService.getQcRequestMasterDetailGrid();

    // if (this.fxCredential && this.fxCredential.origin && (this.fxCredential.origin.toLowerCase() == 'admin' || this.fxCredential.origin.toLowerCase() == 'accounts'))
    //   this.isViewButtons = true;

    await this.getGridConfiguration();
    await this.loadQcRequests();
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
      this.gridConfig = await this.configService.getGridConfig(this.fxCredential.id, "QcRequestMaster", "QcRequestMasterGrid", this.gridPropertiesService.getQcRequestMasterDetailGrid());
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
        this.gridMasterConfigResponse = await this.configService.getMasterGridConfig("QcRequestMaster", "QcRequestMasterGrid");
        if (this.gridMasterConfigResponse)
          this.fields = this.gridMasterConfigResponse.gridDetail;
        else
          this.fields = await this.gridPropertiesService.getQcRequestMasterGrid();

      }
    } catch (error: any) {
      this.alertDialogService.show(error.error)
      this.spinnerService.hide();
    }
  }

  public async loadQcRequests() {
    try {
      this.spinnerService.show();
      this.qcRequestSerchCriteria.stoneIds = this.stoneId ? this.utilityService.CheckStoneIds(this.stoneId).map(x => x.toUpperCase()) : [];
      this.qcRequestSerchCriteria.certificateNos = this.certificateNo ? this.utilityService.checkCertificateIds(this.certificateNo) : [];
      let qcRequests: QcRequestResponse = await this.qcRequestService.getQcRequestPaginated(this.qcRequestSerchCriteria, this.skip, this.pageSize);
      this.qcRequestItemDetail = qcRequests.qcRequests;
      this.gridView = process(qcRequests.qcRequests, { group: this.groups });
      this.gridView.total = qcRequests.totalCount;
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.alertDialogService.show(error.error)
      this.spinnerService.hide();
    }
  }

  public selectedRowChange(event: any) {
    if (event.selectedRows[0].dataItem)
      this.selectedQcRequest = event.selectedRows[0].dataItem;
  }


  public async getAllDataForCopy(): Promise<QcRequest[]> {
    let data: QcRequest[] = [];
    try {
      this.spinnerService.show();
      this.qcRequestSerchCriteria.stoneIds = this.stoneId ? this.utilityService.CheckStoneIds(this.stoneId).map(x => x.toUpperCase()) : [];
      let res = await this.qcRequestService.getQcRequestPaginated(this.qcRequestSerchCriteria, 0, this.gridView.total);
      if (res) {
        data = res.qcRequests;
        this.spinnerService.hide();
      }
      else
        this.spinnerService.hide();

    } catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Copy data not get, Try again later!');
    }
    return data;
  }

  public async copyToClipboard(type: string) {
    try {
      let res: string[] = [];
      let allData = [];
      if (this.gridView.total <= this.pageSize)
        allData = this.gridDetailView.data;
      else
        allData = await this.getAllDataForCopy();
      if (allData.length == 0)
        return;
      if (type == 'stoneId')
        res = allData.map(z => z.stoneId);
      if (res.length > 0) {
        this.spinnerService.show();

        if (res) {
          let stoneIdString = res.join(' ');
          navigator.clipboard.writeText(stoneIdString);
          this.utilityService.showNotification(`Copy to clipboard successfully!`);
          this.spinnerService.hide();
        }
        else
          this.spinnerService.hide();
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }


  public groupChange(groups: GroupDescriptor[]): void {
    try {
      this.groups = groups;
      this.loadQcRequests();
    }
    catch (error: any) {
      this.alertDialogService.show(error.error)
    }
  }

  public pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.loadQcRequests();
  }

  public filterPartToggle() {
    this.utilityService.setfilterToggleValue(this.filterFlag);
  }


  public onFilterSubmit(form: NgForm) {
    this.mySelection = [];
    // this.selectedQcRequestList = new Array<QcRequest>();
    this.selectedQcRequest = new QcRequest();
    this.skip = 0
    this.loadQcRequests()
  }


  public clearFilter(form: NgForm) {
    form.reset()
    this.qcRequestSerchCriteria = new QcRequestSerchCriteria()
    this.stoneId = '';
    this.mySelection = [];
    // this.selectedQcRequestList = new Array<QcRequest>();
    this.selectedQcRequest = new QcRequest();
    this.loadQcRequests();
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
              let qcRequestIdents = this.selectedQcRequest.ident;

              let foResponse = await this.commuteService.deleteQcRequestFO(qcRequestIdents);
              if (foResponse) {
                let response: any = await this.qcRequestService.deleteQcRequests(this.mySelection);
                this.spinnerService.hide();

                if (response) {
                  this.selectedQcRequest = new QcRequest();
                  this.mySelection = [];
                  this.loadQcRequests();
                  this.utilityService.showNotification('Memo Request deleted successfully');
                }
              }
              else
                this.alertDialogService.show('Something went wrong to delete QcRequest in FO !!');
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

  public async qcRequest() {
    this.qcRequestDialog = true;
  }

  public openDetailsDialog() {
    this.isShowDetails = true;
    this.loadDetailGrid();
  }

  public closeDetailsDialog() {
    this.isShowDetails = false;
    this.detailSkip = 0;
    this.mySelection = [];
    this.selectedQcRequest = new QcRequest();
  }

  public pageChangeDetail(event: PageChangeEvent): void {
    this.spinnerService.show();
    this.detailSkip = event.skip;
    this.loadDetailGrid();
  }

  public async loadDetailGrid() {
    this.spinnerService.show();
    this.qcInvItems = new Array<InvItem>();
    this.qcInvItems = this.selectedQcRequest.qcStoneIds;
    if (this.qcInvItems && this.qcInvItems.length > 0) {
      this.invItemDetail = this.qcInvItems;

      if (this.filterStoneId) {
        var filterStoneIds = this.filterStoneId ? this.utilityService.CheckStoneIds(this.filterStoneId).map(x => x.toUpperCase()) : [];
        if (filterStoneIds && filterStoneIds.length > 0)
          this.invItemDetail = this.invItemDetail.filter(c => filterStoneIds.includes(c.stoneId));
      }
      if (this.filterCertiNo) {
        var filterCertiNos = this.filterCertiNo ? this.utilityService.checkCertificateIds(this.filterCertiNo).map(x => x.toUpperCase()) : [];
        if (filterCertiNos && filterCertiNos.length > 0)
          this.invItemDetail = this.invItemDetail.filter(c => filterCertiNos.includes(c.certificateNo));
      }

      this.filterQcRequestItemDetail = this.invItemDetail.slice(this.detailSkip, this.detailSkip + this.detailPageSize);
      this.gridDetailView = process(this.filterQcRequestItemDetail, {});
      this.gridDetailView.total = this.invItemDetail.length;
    }
    this.spinnerService.hide();

  }

  public onFilterDetailSubmit(form: NgForm) {
    this.mySelection = [];
    this.selectedDetailQcRequest = new InvItem();
    this.skip = 0
    this.loadDetailGrid()
  }

  public clearDetailFilter(form: NgForm) {
    form.reset()
    this.loadDetailGrid();
  }
  public closeQcRequestDialog(value: boolean) {
    this.qcRequestDialog = value;
    this.loadQcRequests();
    this.mySelection = [];
    this.selectedQcRequest = new QcRequest();
  }

}
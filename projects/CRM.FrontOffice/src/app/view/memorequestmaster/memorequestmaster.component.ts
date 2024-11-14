import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { GridComponent, PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { DataResult, GroupDescriptor, process } from '@progress/kendo-data-query';
import { NgxSpinnerService } from 'ngx-spinner';
import { GridDetailConfig } from 'shared/businessobjects';
import { GridConfig, GridMasterConfig } from 'shared/enitites';
import { ConfigService, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { MemoRequestResponse, MemoRequestSerchCriteria } from '../../businessobjects';
import { BrokerDNrom, CustomerDNorm, fxCredential, InvItem, MemoRequest } from '../../entities';
import { AppPreloadService, BrokerService, CustomerService, GridPropertiesService, InventoryService, MemorequestService, SupplierService } from '../../services';

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
    mode: 'single',
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
  public listCustomerItems: Array<{ text: string; companyName: string, value: string }> = [];
  public customerItems: CustomerDNorm[] = [];
  public selectedCustomerItem: string = "";
  public customerObj: CustomerDNorm = new CustomerDNorm();
  public listBrokerItems: Array<{ text: string; value: string }> = [];
  public brokerItems: BrokerDNrom[] = [];
  public selectedBrokerItem?: { text: string, value: string };
  public brokerObj: BrokerDNrom = new BrokerDNrom();
  public isShowDetails: boolean = false;
  public memoRequestItemDetail: MemoRequest[] = [];
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
    public supplierService: SupplierService,
    public customerService: CustomerService,
    public brokerService: BrokerService,
  ) { }

  async ngOnInit() {
    await this.defaultMethodsLoad();
  }

  public async defaultMethodsLoad() {
    this.fxCredential = await this.appPreloadService.fetchFxCredentials();
    if (!this.fxCredential)
      this.router.navigate(["login"]);

    await this.getGridConfiguration();
    await this.loadMemoRequests();
    await this.loadBrokers();

    this.utilityService.filterToggleSubject.subscribe(flag => {
      this.filterFlag = flag;
    });
  }

  public async getGridConfiguration() {
    try {
      this.gridConfig = await this.configService.getGridConfig(this.fxCredential.id, "MemoRequestMaster", "MemoRequestMasterGrid", this.gridPropertiesService.getMemoRequestMasterDetailGrid());
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

        this.fxCredential.origin.toLowerCase() == 'admin' ? this.fields : this.fields = this.fields.filter(c => c.title.toLowerCase() != "seller");
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
      if (this.fxCredential == null || this.fxCredential?.origin == null || (this.fxCredential?.origin.toLowerCase() != 'admin'))
        this.memoRequestSerchCriteria.sellerId = this.fxCredential.id;
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
    if (event.selectedRows[0].dataItem)
      this.selectedMemoRequest = event.selectedRows[0].dataItem;
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

  public pageChange(memoRequest: GridComponent, event: PageChangeEvent): void {
    this.skip = event.skip;

    for (let index = this.skip; index < this.pageSize + this.skip; index++) {
      memoRequest.collapseRow(index);
    }
    this.loadMemoRequests();
  }

  public filterPartToggle() {
    this.utilityService.setfilterToggleValue(this.filterFlag);
  }

  public customerChange(e: any) {
    if (e) {
      let fetchCustomer = this.customerItems.find(x => x.id == e);
      if (fetchCustomer) {
        setTimeout(() => {
          this.selectedCustomerItem = fetchCustomer?.companyName + '-' + fetchCustomer?.name ?? '' as any;
        }, 0);
        this.customerObj = fetchCustomer ?? new CustomerDNorm();

      }
    }
    else
      this.customerObj = new CustomerDNorm();
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
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async loadBrokers() {
    try {
      this.brokerItems = await this.brokerService.getAllBrokerDNorms();
      this.listBrokerItems = [];
      this.brokerItems.forEach(z => { this.listBrokerItems.push({ text: z.name, value: z.id }); });
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }

  }

  public brokerChange() {
    let fetchBroker = this.brokerItems.find(x => x.id == this.selectedBrokerItem?.value);
    if (fetchBroker)
      this.brokerObj = fetchBroker;
  }

  public onFilterSubmit(form: NgForm) {
    this.skip = 0
    this.memoRequestSerchCriteria.customerId = this.customerObj.id;
    this.memoRequestSerchCriteria.brokerId = this.brokerObj.id;
    this.loadMemoRequests()
  }

  public clearFilter(form: NgForm) {
    form.reset()
    this.memoRequestSerchCriteria = new MemoRequestSerchCriteria();
    this.selectedMemoRequest = new MemoRequest();
    this.mySelection = new Array<string>();
    this.stoneId = '';
    this.certificateNo = undefined as any;
    this.loadMemoRequests();
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
    if (this.mySelection[0]) {
      let findIssue: MemoRequest = this.memoRequestItemDetail.find(c => c.id == this.mySelection[0]) ?? new MemoRequest;
      this.invItemDetail = findIssue.memoStoneIds;
      let filtermemoRequestItemDetail = this.invItemDetail.slice(this.detailSkip, this.detailSkip + this.detailPageSize);
      this.gridDetailView = process(filtermemoRequestItemDetail, {});
      this.gridDetailView.total = this.invItemDetail.length;
    }
    this.spinnerService.hide();
  }

  public openGridConfigDialog(): void {
    this.isGridConfig = true;
  }

  public dblClick() {
    this.isShowDetails = true;
    this.loadDetailGrid();
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
            if (this.selectedMemoRequest.id) {
              let response: any = await this.memoRequestService.deleteMemoRequest(this.selectedMemoRequest.id);
              this.spinnerService.hide();

              if (response) {
                let supplierObj = (await this.supplierService.getSupplierById(this.selectedMemoRequest.supplier.id));
                if (supplierObj.apiPath) {
                  await this.memoRequestService.deleteMemoRequestBackOffice(supplierObj.apiPath, this.selectedMemoRequest.id);
                  this.selectedMemoRequest = new MemoRequest();
                  this.mySelection = [];
                  this.loadMemoRequests();
                  this.utilityService.showNotification('Memo Request deleted successfully');
                }
              }
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

}
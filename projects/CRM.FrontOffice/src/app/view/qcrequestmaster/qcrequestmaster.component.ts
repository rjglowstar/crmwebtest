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
import { QcRequestResponse, QcRequestSerchCriteria } from '../../businessobjects';
import { CustomerDNorm, fxCredential, InvItem, QcRequest } from '../../entities';
import { AppPreloadService, BrokerService, CustomerService, GridPropertiesService, InventoryService, QcrequestService, SupplierService } from '../../services';

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
  public selectedQcRequest: QcRequest = new QcRequest();
  public isGridConfig: boolean = false;
  private fxCredential!: fxCredential;
  public gridConfig!: GridConfig;
  public gridMasterConfigResponse!: GridMasterConfig;
  public listCustomerItems: Array<{ text: string; companyName: string, value: string }> = [];
  public customerItems: CustomerDNorm[] = [];
  public selectedCustomerItem: string = "";
  public customerObj: CustomerDNorm = new CustomerDNorm();
  public isShowDetails: boolean = false;
  public qcRequestItemDetail: QcRequest[] = [];
  public certificateNo!: string;

  constructor(
    private qcRequestService: QcrequestService,
    private router: Router,
    private gridPropertiesService: GridPropertiesService,
    public utilityService: UtilityService,
    private alertDialogService: AlertdialogService,
    private spinnerService: NgxSpinnerService,
    private configService: ConfigService,
    private appPreloadService: AppPreloadService,
    public supplierService: SupplierService,
    public customerService: CustomerService,
  ) { }

  async ngOnInit() {
    await this.defaultMethodsLoad();
  }

  public async defaultMethodsLoad() {
    this.fxCredential = await this.appPreloadService.fetchFxCredentials();
    if (!this.fxCredential)
      this.router.navigate(["login"]);

    await this.getGridConfiguration();
    await this.loadQcRequests();

    this.utilityService.filterToggleSubject.subscribe(flag => {
      this.filterFlag = flag;
    });
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

        this.fxCredential.origin.toLowerCase() == 'admin' ? this.fields : this.fields = this.fields.filter(c => c.title.toLowerCase() != "seller");
      }


    } catch (error: any) {
      this.alertDialogService.show(error.error)
      this.spinnerService.hide();
    }
  }

  public async loadQcRequests() {
    try {
      this.spinnerService.show();
      if (this.fxCredential == null || this.fxCredential?.origin == null || (this.fxCredential?.origin.toLowerCase() != 'admin'))
        this.qcRequestSerchCriteria.sellerId = this.fxCredential.id;
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

  public groupChange(groups: GroupDescriptor[]): void {
    try {
      this.groups = groups;
      this.loadQcRequests();
    }
    catch (error: any) {
      this.alertDialogService.show(error.error)
    }
  }

  public pageChange(qcRequest: GridComponent, event: PageChangeEvent): void {
    this.skip = event.skip;

    for (let index = this.skip; index < this.pageSize + this.skip; index++) {
      qcRequest.collapseRow(index);
    }
    this.loadQcRequests();
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

  public onFilterSubmit(form: NgForm) {
    this.skip = 0;
    this.selectedQcRequest = new QcRequest();
    this.mySelection = new Array<string>();
    this.qcRequestSerchCriteria.customerId = this.customerObj.id;
    this.loadQcRequests()
  }

  public clearFilter(form: NgForm) {
    form.reset()
    this.qcRequestSerchCriteria = new QcRequestSerchCriteria();
    this.selectedQcRequest = new QcRequest();
    this.mySelection = new Array<string>();
    this.stoneId = '';
    this.certificateNo = undefined as any;
    this.loadQcRequests();
  }

  public openDetailsDialog() {
    this.isShowDetails = true;
  }

  public closeDetailsDialog(value: boolean) {
    this.isShowDetails = false;
    this.detailSkip = 0;
  }

  public openGridConfigDialog(): void {
    this.isGridConfig = true;
  }

  public dblClick() {
    this.openDetailsDialog();
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
            if (this.selectedQcRequest.id) {
              let response: any = await this.qcRequestService.deleteQcRequest(this.selectedQcRequest.id);
              this.spinnerService.hide();

              if (response) {
                let supplierObj = (await this.supplierService.getSupplierById(this.selectedQcRequest.supplier.id));
                if (supplierObj.apiPath) {
                  await this.qcRequestService.deleteQcRequestBackOffice(supplierObj.apiPath, this.selectedQcRequest.id);
                  this.selectedQcRequest = new QcRequest();
                  this.mySelection = [];
                  this.loadQcRequests();
                  this.utilityService.showNotification('Qc Request deleted successfully');
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
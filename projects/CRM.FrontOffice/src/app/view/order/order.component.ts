import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { DataResult, GroupDescriptor, process } from '@progress/kendo-data-query';
import { NgxSpinnerService } from 'ngx-spinner';
import { GridDetailConfig } from 'shared/businessobjects';
import { UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { LeadOrderItem, OrderResponse, OrderSearchCriteria } from '../../businessobjects';
import { BrokerDNrom, CustomerDNorm, fxCredential } from '../../entities';
import { AppPreloadService, BrokerService, CustomerService, GridPropertiesService, LeadService } from '../../services';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styles: [
  ]
})
export class OrderComponent implements OnInit {

  public fxCredential!: fxCredential;
  public groups: GroupDescriptor[] = [];
  public pageSize = 26;
  public skip = 0
  public fields!: GridDetailConfig[];
  public gridOrderView!: DataResult;
  public mySelection: string[] = [];
  public orderSearchCriteria: OrderSearchCriteria = new OrderSearchCriteria();
  public selectableSettings: SelectableSettings = {
    mode: 'single',
  };
  public lead: LeadOrderItem = new LeadOrderItem();
  public isVisibleOrderDetail: boolean = false;
  public filterFlag = true;
  public listCustomerItems: Array<{ text: string; companyName: string, value: string }> = [];
  public customerItems: CustomerDNorm[] = [];
  public selectedCustomerItem: string = "";
  public customerObj: CustomerDNorm = new CustomerDNorm();
  public listBrokerItems: Array<{ text: string; value: string }> = [];
  public brokerItems: BrokerDNrom[] = [];
  public selectedBrokerItem?: { text: string, value: string };
  public brokerObj: BrokerDNrom = new BrokerDNrom();
  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains'
  };
  public stoneId!: string;
  public leadNo!: string;
  public certificateNo!: string;

  constructor(
    public leadService: LeadService,
    private router: Router,
    private gridPropertiesService: GridPropertiesService,
    private alertDialogService: AlertdialogService,
    private spinnerService: NgxSpinnerService,
    private appPreloadService: AppPreloadService,
    private utilityService: UtilityService,
    public customerService: CustomerService,
    public brokerService: BrokerService,) { }

  async ngOnInit() {
    await this.loadDefaultMethods();
  }

  public async loadDefaultMethods() {
    this.fxCredential = await this.appPreloadService.fetchFxCredentials();
    if (!this.fxCredential)
      this.router.navigate(["login"]);

    this.utilityService.filterToggleSubject.subscribe(flag => {
      this.filterFlag = flag;
    });

    this.orderSearchCriteria = new OrderSearchCriteria();
    this.fields = this.gridPropertiesService.getLeadOrderApprovedListGrid();

    if (this.fxCredential.origin.toLowerCase() != 'admin')
      this.fields = this.fields.filter(x => x.title.toLowerCase() != 'seller');

    await this.loadOrdersFromApprovedLead();
    await this.loadBrokers();
  }

  public filterPartToggle() {
    this.utilityService.setfilterToggleValue(this.filterFlag);
  }

  public async onFilterSubmit(form: NgForm) {
    if (form.valid) {
      await this.loadOrdersFromApprovedLead();
    }
  }

  public async clearFilter(form: NgForm) {
    form.reset();
    this.skip = 0;
    this.orderSearchCriteria = new OrderSearchCriteria();
    this.leadNo = undefined as any;
    this.stoneId = undefined as any;
    this.certificateNo = undefined as any;
    await this.loadOrdersFromApprovedLead();
    this.mySelection = [];
  }

  public async loadOrdersFromApprovedLead() {
    try {
      this.spinnerService.show();

      if (this.fxCredential.origin.toLowerCase() != 'admin')
        this.orderSearchCriteria.sellerId = this.fxCredential.id;

      this.orderSearchCriteria.stoneIds = this.stoneId ? this.utilityService.CheckStoneIds(this.stoneId).map(x => x.toUpperCase()) : [];
      if (this.leadNo) {
        let leadNos: Array<number> = (this.utilityService.checkCertificateIds(this.leadNo).map(x => (this.utilityService.containsOnlyNumbers(x)) ? Number(x) : 0)).filter(a => a != 0) ?? new Array<number>();
        this.orderSearchCriteria.leadNos = this.leadNo ? leadNos : [];
      }
      else
        this.orderSearchCriteria.leadNos = new Array<number>();

      this.orderSearchCriteria.certificateNos = this.certificateNo ? this.utilityService.checkCertificateIds(this.certificateNo) : [];
      let orderResponse: OrderResponse = await this.leadService.getOrderFromLeadPaginated(this.orderSearchCriteria, this.skip, this.pageSize);      
      this.gridOrderView = process(orderResponse.orders, { group: this.groups });
      this.gridOrderView.total = orderResponse.totalCount;
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.alertDialogService.show(error.error)
      this.spinnerService.hide();
    }
  }

  public groupChange(groups: GroupDescriptor[]): void {
    try {
      this.groups = groups;
      this.loadOrdersFromApprovedLead();
    }
    catch (error: any) {
      this.alertDialogService.show(error.error)
    }
  }

  public pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.loadOrdersFromApprovedLead();
  }

  public selectedRowChange(event: any) {
    this.lead = event.selectedRows[0].dataItem as LeadOrderItem;
    this.isVisibleOrderDetail = true;
  }

  public customerChange(e: any) {
    if (e) {
      let fetchCustomer = this.customerItems.find(x => x.id == e);
      if (fetchCustomer) {
        setTimeout(() => {
          this.selectedCustomerItem = fetchCustomer?.companyName + '-' + fetchCustomer?.name ?? '' as any;
        }, 0);
        this.customerObj = fetchCustomer ?? new CustomerDNorm();
        if (this.customerObj.id)
          this.orderSearchCriteria.customerId = this.customerObj.id;
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
      console.error(error);
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
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public brokerChange() {
    let fetchBroker = this.brokerItems.find(x => x.id == this.selectedBrokerItem?.value);
    if (fetchBroker)
      this.brokerObj = fetchBroker;
    if (this.brokerObj.id)
      this.orderSearchCriteria.brokerId = this.brokerObj.id;
  }

}

import { Component, OnInit } from '@angular/core';
import { BrokerService, CustomerService, LeadHistoryService, SystemUserService } from '../../services';
import { GridConfig, GridMasterConfig, fxCredential } from 'shared/enitites';
import { NgxSpinnerService } from 'ngx-spinner';
import { OriginValue, UtilityService } from 'shared/services';
import { GridDetailConfig } from 'shared/businessobjects';
import { AlertdialogService } from 'shared/views';
import { DataResult, GroupDescriptor, SortDescriptor, process } from '@progress/kendo-data-query';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { BrokerDNrom, CustomerDNorm, LeadHistory, SystemUser } from '../../entities';
import { SortFieldDescriptor } from 'projects/CRM.BackOffice/src/app/businessobjects';
import { LeadHistorySearchCriteria } from '../../businessobjects/analysis/leadhistorysearchcriteria';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { Router } from '@angular/router';

@Component({
  selector: 'app-leadhistory',
  templateUrl: './leadhistory.component.html'
})
export class LeadhistoryComponent implements OnInit {
  public groups: GroupDescriptor[] = [];
  public pageSize = 25;
  public skip = 0;
  public sort: SortDescriptor[] = [];
  public fields!: GridDetailConfig[];
  public gridView?: DataResult;
  public isRegEmployee: boolean = false;
  public filterFlag = true;
  public selectableSettings: SelectableSettings = { mode: 'multiple' };
  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains',
  };
  public leadNo!: string;
  public skeletonArray = new Array(18);
  public mySelection: string[] = [];
  public isShowCheckBoxAll: boolean = true;
  public leadHistoryItem: LeadHistory[] = [];
  public leadHistorySearchCriteria: LeadHistorySearchCriteria = new LeadHistorySearchCriteria();
  public listCustomerItems: Array<{ name: string; value: string, isChecked: boolean }> = [];
  public selectedCustomer: string[] = [];
  public isGridConfig: boolean = false;
  private fxCredential!: fxCredential;
  public gridConfig!: GridConfig;
  public gridMasterConfigResponse!: GridMasterConfig;
  public sortFieldDescriptors!: SortFieldDescriptor[];
  public isAdminRole!: boolean;
  public customerItems: CustomerDNorm[] = [];
  public sellerItems: SystemUser[] = [];
  public brokerItems: BrokerDNrom[] = [];

  constructor(
    private spinnerService: NgxSpinnerService,
    private alertDialogService: AlertdialogService,
    private leadHistoryService: LeadHistoryService,
    private customerService: CustomerService,
    private systemUserService: SystemUserService,
    private brokerservice: BrokerService,
    public utilityService: UtilityService,
    private router: Router) {
  }

  public async ngOnInit() {
    await this.defaultMethodsLoad();
  }

  public async defaultMethodsLoad() {
    try {
      this.fxCredential = JSON.parse(sessionStorage.getItem("fxCredentials") ?? '') as fxCredential;
      if (!this.fxCredential)
        this.router.navigate(["login"]);
      this.spinnerService.show();
      await this.loadLeadHistoryData()
      await this.loadBrokers();
      await this.getCustomerData();
      if (this.isAdminRole)
        await this.loadSellers();
      this.utilityService.filterToggleSubject.subscribe(flag => {
        this.filterFlag = flag;
      });
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Something went wrong, Data not load!');
    }
  }

  public filterPartToggle() {
    this.utilityService.setfilterToggleValue(this.filterFlag);
  }

  public async loadLeadHistoryData() {
    try {
      this.spinnerService.show();
      if (this.leadNo) {
        let leadNos: Array<number> = (this.utilityService.checkCertificateIds(this.leadNo).map(x => (this.utilityService.containsOnlyNumbers(x)) ? Number(x) : 0)).filter(a => a != 0) ?? new Array<number>();
        this.leadHistorySearchCriteria.leadNos = leadNos.length > 0 ? leadNos : new Array<number>();
      }
      else
        this.leadHistorySearchCriteria.leadNos = new Array<number>();
      let res = await this.leadHistoryService.getPaginatedLeadHistories(this.leadHistorySearchCriteria, this.skip, this.pageSize);
      this.leadHistoryItem = res.leadHistories;
      if (res) {
        this.gridView = process(this.leadHistoryItem, { group: this.groups, sort: this.sort });
        this.gridView.total = res.counts;
        this.spinnerService.hide();
      }
      else
        this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }


  public customerValueChange(val: string[]) {
    if (val && val.length > 0)
      this.selectedCustomer = this.listCustomerItems.filter(c => val.includes(c.value) && c.isChecked).map(d => d.name);
  }

  public sortChange(sort: SortDescriptor[]): void {
    this.sort = sort;
    this.sortFieldDescriptors = new Array<SortFieldDescriptor>();
    this.loadLeadHistoryData();
  }

  public pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.loadLeadHistoryData();
  }

  public groupChange(groups: GroupDescriptor[]): void {
    try {
      this.groups = groups;
      this.loadLeadHistoryData();
    }
    catch (error: any) {
      this.alertDialogService.show(error.error);
    }
  }

  private async getCustomerData() {
    try {
      let customers: CustomerDNorm[] = await this.customerService.getAllCustomerDNormsByName('');
      this.listCustomerItems = [];
      this.customerItems = customers;
      this.customerItems.reverse().forEach(z => { this.listCustomerItems.push({ name: z.companyName, value: z.id, isChecked: false }); });
    }
    catch (error: any) {
      this.alertDialogService.show(error.error);
    }
  }

  public onMultiSelectCustChange(val: Array<{ value: string, name: string; isChecked: boolean }>, selectedData: string[]): void {
    val.forEach(element => {
      element.isChecked = false;
    });

    if (selectedData && selectedData.length > 0) {
      val.forEach(element => {
        selectedData.forEach(item => {
          if (element.value.toLocaleLowerCase() == item.toLocaleLowerCase())
            element.isChecked = true;
        });
      });
    }
  }

  private async loadBrokers() {
    try {
      let res = await this.brokerservice.getAllBrokerDNorms();
      if (res)
        this.brokerItems = res;
      else
        this.alertDialogService.show('Broker not load, Try again later!');
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Broker not load, Try again later!');
    }
  }

  public async loadSellers() {
    try {
      let res = await this.systemUserService.getSystemUserByOrigin(OriginValue.Seller.toString());
      if (res)
        this.sellerItems = res;
      else
        this.alertDialogService.show('Seller not load, Try again later!');
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Seller not load, Try again later!');
    }
  }

  /* #region Filter Section */
  public async onFilterSubmit() {
    this.skip = 0;
    await this.loadLeadHistoryData();
  }

  public async clearFilter() {
    this.skip = 0;
    this.leadHistorySearchCriteria = new LeadHistorySearchCriteria();
    this.listCustomerItems.forEach(z => { z.isChecked = false });
    this.leadNo = undefined as any;
    await this.loadLeadHistoryData();
  }
}

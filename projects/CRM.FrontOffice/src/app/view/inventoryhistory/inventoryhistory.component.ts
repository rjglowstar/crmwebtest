import { Component, OnInit } from '@angular/core';
import { InvHistoryService, LeadService, PricingRequestService } from '../../services';
import { GridConfig, GridMasterConfig, fxCredential } from 'shared/enitites';
import { NgxSpinnerService } from 'ngx-spinner';
import { UtilityService, invHistoryActions } from 'shared/services';
import { GridDetailConfig } from 'shared/businessobjects';
import { AlertdialogService } from 'shared/views';
import { DataResult, GroupDescriptor, SortDescriptor, process } from '@progress/kendo-data-query';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { InvHistory, LeadHistory, PricingHistory } from '../../entities';
import { SortFieldDescriptor } from 'projects/CRM.BackOffice/src/app/businessobjects';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { Router } from '@angular/router';
import { InvHistorySearchCriteria } from '../../businessobjects/analysis/invhistorysearchcriteria';
import { StoneHistory } from '../../businessobjects/analysis/stonehistory';

@Component({
  selector: 'app-inventoryhistory',
  templateUrl: './inventoryhistory.component.html',
  styleUrl: './inventoryhistory.component.css'
})
export class InventoryhistoryComponent implements OnInit {
  public invGroups: GroupDescriptor[] = [];
  public pricingGroups: GroupDescriptor[] = [];
  public pageSize = 25;
  public skip = 0;
  public invSort: SortDescriptor[] = [];
  public pricingSort: SortDescriptor[] = [];
  public fields!: GridDetailConfig[];
  public gridViewInvAndLead!: DataResult;
  public gridViewPriceing!: DataResult;
  public isRegEmployee: boolean = false;
  public filterFlag = true;
  public selectableSettings: SelectableSettings = { mode: 'multiple' };
  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains',
  };
  public stoneId!: string;
  public invHistoryItems: InvHistory[] = [];
  public leadHistoriesItem: LeadHistory[] = [];
  public pricingHistoriesItem: PricingHistory[] = [];
  public invHistorySearchCriteria: InvHistorySearchCriteria = new InvHistorySearchCriteria();
  public selectedCustomer: string[] = [];
  public isGridConfig: boolean = false;
  private fxCredential!: fxCredential;
  public gridConfig!: GridConfig;
  public gridMasterConfigResponse!: GridMasterConfig;
  public sortFieldDescriptors!: SortFieldDescriptor[];
  public selectedAction: string = "";
  public actionList = invHistoryActions;
  public isPanel: boolean = false;
  public stoneHoldCount: number = 0;
  public stoneRapnetHoldCount: number = 0;
  public stoneRapChangedCount: number = 0;

  constructor(
    private spinnerService: NgxSpinnerService,
    private alertDialogService: AlertdialogService,
    private invHistoryService: InvHistoryService,
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

  public async FilterChanges() {
    if (this.stoneId) {
      this.utilityService.CheckStoneIds(this.stoneId).map(x => x.toUpperCase()).forEach(e => {
        this.invHistorySearchCriteria.stoneId = e;
        this.loadInvHistoryData();
        this.isPanel = true;
      })
    }

  }

  public resetFilter() {
    this.stoneId = "";
    this.invHistorySearchCriteria.stoneId = "";
    this.invHistoryItems = [];
    this.pricingHistoriesItem = [];
    this.leadHistoriesItem = [];
    this.isPanel = false;
    this.loadInvHistoryData()
    this.stoneRapnetHoldCount = 0;
    this.stoneRapChangedCount = 0;
    this.stoneHoldCount = 0;
  }

  public async loadInvHistoryData() {
    try {
      this.spinnerService.show();

      if (!this.invHistorySearchCriteria.stoneId) {
        this.spinnerService.hide();
        return
      };

      const res = await this.invHistoryService.GetByStoneIds(this.invHistorySearchCriteria.stoneId);
      if (!res) return;

      let { invHistories, pricingHistories, leadHistories } = res;
      invHistories = invHistories.filter(x=>x.action != "update-bo-inv" && x.action != "update-after-bo-inv");
      const merageData = [...invHistories.map(history => ({ ...history, historyType: 'Inventory', createdBy: history.userName })), ...leadHistories.map(history => ({ ...history, historyType: 'Lead', createdBy: history?.createdBy || history?.seller?.name, stoneIds: history.stoneIds.filter(stoneId => stoneId === this.invHistorySearchCriteria.stoneId) }))];
      this.invHistoryItems = invHistories;
      this.pricingHistoriesItem = pricingHistories;
      this.leadHistoriesItem = leadHistories;
      this.stoneHoldCount = this.invHistoryItems.filter(res => res.action === "Hold" || res.action === "StoneStatusInHold").length ?? 0
      this.stoneRapChangedCount = this.invHistoryItems.filter(res => res.action === "RapChanged" || res.action === "RapChangedByPrice").length ?? 0;
      this.stoneRapnetHoldCount = this.invHistoryItems.filter(res => res.action === "RapnetHold" || res.action === "StoneStatusIsRapnetHold").length ?? 0;

      this.gridViewInvAndLead = process(this.sortDataByCreatedDate(merageData), { group: this.invGroups, sort: this.invSort });
      this.gridViewInvAndLead.total = merageData.length;

      this.gridViewPriceing = process(this.sortDataByCreatedDate(pricingHistories), { group: this.pricingGroups, sort: this.pricingSort });
      this.gridViewPriceing.total = pricingHistories.length;

      this.spinnerService.hide();
    } catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public sortDataByCreatedDate(data: any[]): any[] {
    return data?.sort((a: any, b: any) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()) || [];
  }

  public invSortChange(sort: SortDescriptor[]): void {
    this.invSort = sort;
    this.sortFieldDescriptors = new Array<SortFieldDescriptor>();
    this.loadInvHistoryData();
  }

  public pricingSortChange(sort: SortDescriptor[]): void {
    this.pricingSort = sort;
    this.sortFieldDescriptors = new Array<SortFieldDescriptor>();
    this.loadInvHistoryData();
  }

  public pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.loadInvHistoryData();
  }

  public invGroupChange(groups: GroupDescriptor[]): void {
    try {
      this.invGroups = groups;
      this.loadInvHistoryData();
    }
    catch (error: any) {
      this.alertDialogService.show(error.error);
    }
  }

  public pricingGroupChange(groups: GroupDescriptor[]): void {
    try {
      this.pricingGroups = groups;
      this.loadInvHistoryData();
    }
    catch (error: any) {
      this.alertDialogService.show(error.error);
    }
  }

  /* #region Filter Section */
  public async onFilterSubmit() {
    this.skip = 0;
    await this.loadInvHistoryData();
  }

  public async clearFilter() {
    this.skip = 0;
    this.invHistorySearchCriteria = new InvHistorySearchCriteria();
    this.stoneId = undefined as any;
    await this.loadInvHistoryData();
  }
}

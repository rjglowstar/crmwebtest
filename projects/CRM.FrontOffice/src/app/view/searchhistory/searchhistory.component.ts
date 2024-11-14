import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { GridDataResult, PageChangeEvent } from '@progress/kendo-angular-grid';
import { GroupDescriptor, process } from '@progress/kendo-data-query';
import { NgxSpinnerService } from 'ngx-spinner';
import { MasterDNorm } from 'shared/enitites';
import { CommonService, OriginValue, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { CustomerSearchHistoryCriteria } from '../../businessobjects';
import { ParseCustomerSearchHistory } from '../../businessobjects/customer/parsecustomersearchhistory';
import { CustomerDNorm, CustomerSearchHistory, fxCredential, InventoryItems, SystemUser } from '../../entities';
import { AppPreloadService, CustomerSearchHistoryService, CustomerService, InventoryService, MasterConfigService, SystemUserService } from '../../services';

@Component({
  selector: 'app-searchhistory',
  templateUrl: './searchhistory.component.html',
  styleUrls: ['./searchhistory.component.css']
})
export class SearchhistoryComponent implements OnInit {
  //#region Grid Config
  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains',
  };
  public defaultPageSize = 10;
  public pageSize = 10;
  public skip = 0;
  public totalRecords = 0;

  public gridView!: GridDataResult;
  public invPageSize = 25;
  public invSkip = 0;
  public groups: GroupDescriptor[] = [];
  //#endregion
  public filterFlag = true;
  //#region Master Config
  public allTheLab?: MasterDNorm[];
  public allTheShapes?: MasterDNorm[];
  public allColors?: MasterDNorm[];
  public allClarities?: MasterDNorm[];
  public allTheFluorescences?: MasterDNorm[];
  public allTheCPS?: MasterDNorm[];
  //#endregion

  //#region List & Objects
  private fxCredential!: fxCredential;
  public searchHistorySearchCriteria: CustomerSearchHistoryCriteria = new CustomerSearchHistoryCriteria();

  public customerSearchHistoryData: CustomerSearchHistory[] = [];
  public parseCustomerSearchHistory: ParseCustomerSearchHistory[] = [];

  public searchInventoryItems: InventoryItems[] = [];
  public filterInventoryItems: InventoryItems[] = [];

  public customerItems: CustomerDNorm[] = [];
  public sellerItems: SystemUser[] = [];
  //#endregion
  public stoneId: string = "";
  public isSearchhistory: boolean = false;

  constructor(private router: Router,
    private spinnerService: NgxSpinnerService,
    private alertDialogService: AlertdialogService,
    private appPreloadService: AppPreloadService,
    private masterConfigService: MasterConfigService,
    private systemUserService: SystemUserService,
    private commonService: CommonService,
    private inventoryService: InventoryService,
    private utilityService: UtilityService,
    private customerService: CustomerService,
    private customerSearchHistoryService: CustomerSearchHistoryService) { }

  public async ngOnInit() {
    await this.defaultMethodsLoad();
    this.utilityService.filterToggleSubject.subscribe(flag => {
      this.filterFlag = flag;
    });
  }


  //#region Initialize Data
  public async defaultMethodsLoad() {
    this.fxCredential = await this.appPreloadService.fetchFxCredentials();
    if (!this.fxCredential)
      this.router.navigate(["login"]);
    else {
      this.spinnerService.show();
      await this.loadCustomers();
      await this.loadSellers();
      await this.getMasterConfigData();
      if (this.fxCredential?.origin != 'Admin')
        this.searchHistorySearchCriteria.sellerId = this.fxCredential.id;

      var currentDate = new Date();
      var sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(currentDate.getDate() - 7)
      this.searchHistorySearchCriteria.fromDate = sevenDaysAgo;
      this.searchHistorySearchCriteria.toDate = currentDate;
      
      await this.loadSearchHistory();
      this.spinnerService.hide();
    }
  }

  private async loadCustomers() {
    try {
      let res = await this.customerService.getAllCustomerDNormsByName('');
      if (res) {
        if (this.fxCredential && this.fxCredential.origin.toLowerCase() == 'seller') {
          this.customerItems = res.filter(x => x.sellerId == this.fxCredential.id)
        }
        else
          this.customerItems = res;
      }
      else
        this.alertDialogService.show('Customer not load, Try again later!');
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Customer not load, Try again later!');
    }
  }

  public async loadSellers() {
    try {
      let res = await this.systemUserService.getSystemUserByOrigin(OriginValue.Seller.toString());
      if (res) {
        if (this.fxCredential && this.fxCredential.origin.toLowerCase() == 'seller') {
          this.sellerItems = res.filter(x => x.id == this.fxCredential.id)
          this.searchHistorySearchCriteria.sellerId = this.sellerItems[0].id;
        }
        else
          this.sellerItems = res;
      }
      else
        this.alertDialogService.show('Seller not load, Try again later!');
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Seller not load, Try again later!');
    }
  }

  public async getMasterConfigData() {
    //Master Config
    let masterConfigList = await this.masterConfigService.getAllMasterConfig();
    this.allTheShapes = this.utilityService.sortingMasterDNormPriority(masterConfigList.shape);
    this.allColors = this.utilityService.sortingMasterDNormPriority(masterConfigList.colors);
    this.allClarities = this.utilityService.sortingMasterDNormPriority(masterConfigList.clarities);
    this.allTheFluorescences = this.utilityService.sortingMasterDNormPriority(masterConfigList.fluorescence);
    this.allTheCPS = this.utilityService.sortingMasterDNormPriority(masterConfigList.cps);
    this.allTheLab = this.utilityService.sortingMasterDNormPriority(masterConfigList.lab);
  }

  public async loadSearchHistory() {
    try {
      this.spinnerService.show();
      this.searchHistorySearchCriteria.stoneIds = this.stoneId ? this.utilityService.CheckStoneIds(this.stoneId).map(x => x.toUpperCase()) : [];
      let res = await this.customerSearchHistoryService.getByCriteria(this.searchHistorySearchCriteria, this.skip, this.pageSize);
      if (res) {
        this.customerSearchHistoryData = res.customerSearchHistories;
        this.parseCustomerSearchHistory = [];
        this.customerSearchHistoryData.forEach(z => {
          let obj = new ParseCustomerSearchHistory();
          obj.customer = z.customer;
          obj.searchQuery = JSON.parse(z.searchQuery);
          obj.searchStoneIds = z.searchStoneIds;
          obj.createdDate = z.createdDate;
          this.parseCustomerSearchHistory.push(obj);
        });
        this.totalRecords = res.totalCount;
        this.spinnerService.hide();
      }
      else {
        this.spinnerService.hide();
        this.alertDialogService.show('Search data not load, Try again later!');
      }
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Search data not load, Try again later!');
    }
  }
  //#endregion

  //#region On Changes
  public loadMoreSearchHistory() {
    this.pageSize = this.pageSize + this.defaultPageSize;
    this.loadSearchHistory();
  }

  public clearSearchCriteria() {
    this.searchHistorySearchCriteria = new CustomerSearchHistoryCriteria();
    this.stoneId = "";
    this.parseCustomerSearchHistory = [];
    this.pageSize = JSON.parse(JSON.stringify(this.defaultPageSize));
  }

  public async getInventoryForSearch(stoneIds: string[]) {
    try {
      this.spinnerService.show();
      let res = await this.inventoryService.getInventoryByStoneIds(stoneIds);
      if (res) {
        this.searchInventoryItems = JSON.parse(JSON.stringify(res));
        this.filterInventoryItems = JSON.parse(JSON.stringify(res));
        this.loadInvGridData();
        this.spinnerService.hide();
      }
      else {
        this.spinnerService.hide();
        this.alertDialogService.show('Stone(s) not load, Try again later!');
      }
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Stone(s) not load, Try again later!');
    }
  }

  public loadInvGridData() {
    let data = this.filterInventoryItems.slice(this.invSkip, this.invSkip + this.invPageSize);
    this.gridView = process(data, { group: this.groups });
    this.gridView.total = this.filterInventoryItems.length;
  }

  public pageChange({ skip, take }: PageChangeEvent): void {
    this.invSkip = skip;
    this.invPageSize = take;
    this.loadInvGridData();
  }

  public groupChange(groups: GroupDescriptor[]): void {
    try {
      this.groups = groups;
      this.loadInvGridData();
    }
    catch (error: any) {
      this.alertDialogService.show(error.error);
    }
  }
  //#endregion

  //#region Modal Changes
  public async openSearchhistoryDialog(history: ParseCustomerSearchHistory) {
    await this.getInventoryForSearch(history.searchStoneIds);
    this.isSearchhistory = true;
  }

  public closeSearchhistoryDialog(): void {
    this.isSearchhistory = false;
  }
  //#endregion

  public filterPartToggle() {
    this.utilityService.setfilterToggleValue(this.filterFlag);
  }

}

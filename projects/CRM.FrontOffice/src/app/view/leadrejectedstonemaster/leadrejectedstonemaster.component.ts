import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { DataResult, GroupDescriptor, process } from '@progress/kendo-data-query';
import { NgxSpinnerService } from 'ngx-spinner';
import { GridDetailConfig } from 'shared/businessobjects';
import { OriginValue, RejectionType, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { LeadRejectedStoneResponse, LeadRejectedStoneSearchCriteria } from '../../businessobjects';
import { CustomerDNorm, LeadRejectedOfferItem, SystemUser, SystemUserDNorm, fxCredential } from '../../entities';
import { CustomerService, GridPropertiesService, LeadService, SystemUserService } from '../../services';
import { Router } from '@angular/router';

@Component({
  selector: 'app-leadrejectedstonemaster',
  templateUrl: './leadrejectedstonemaster.component.html',
  styleUrls: ['./leadrejectedstonemaster.component.css']
})
export class LeadrejectedstonemasterComponent implements OnInit {

  public groups: GroupDescriptor[] = [];
  public gridView!: DataResult;
  public pageSize = 27;
  public skip = 0
  public fields!: GridDetailConfig[];
  public fxCredentials!: fxCredential;
  public rejectedSearchCriteria: LeadRejectedStoneSearchCriteria = new LeadRejectedStoneSearchCriteria();
  public rejectedStonResponse: LeadRejectedStoneResponse = new LeadRejectedStoneResponse();
  public filterFlag = true;
  public stoneId: string = '';
  public leadNo!: string;
  public typeList: Array<{ name: string; isChecked: boolean }> = [];
  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains',
  };
  public mySelection: Array<string> = new Array<string>();
  public isShowDetails: boolean = false;
  public rejectedInvItems = new Array<LeadRejectedOfferItem>();
  public detailFields!: GridDetailConfig[];
  public isAdminRole: boolean = false;
  public seller: SystemUserDNorm = new SystemUserDNorm();
  public listSellerDNormItems: Array<{ text: string; value: string }> = [];
  public sellerDNormItems!: SystemUserDNorm[];
  public selectedSellerDNormItem?: { text: string; value: string };
  public listCustomerItems: Array<{ text: string; companyName: string, value: string }> = [];
  public selectedCustomerItem: string = "";
  public customerItems: CustomerDNorm[] = [];
  public selectableSettings: SelectableSettings = {
    mode: 'single',
  };

  constructor(
    public router: Router,
    private alertDialogService: AlertdialogService,
    private spinnerService: NgxSpinnerService,
    public utilityService: UtilityService,
    private gridPropertiesService: GridPropertiesService,
    private leadService: LeadService,
    private systemUserService: SystemUserService,
    public customerService: CustomerService,
  ) { }

  public async ngOnInit(): Promise<void> {
    await this.defaultMethodsLoad();
  }

  //#region Default Method
  public async defaultMethodsLoad() {
    try {
      this.fxCredentials = JSON.parse(sessionStorage.getItem("fxCredentials") ?? '') as fxCredential;

      if (!this.fxCredentials)
        this.router.navigate(["login"]);
      if (this.fxCredentials?.origin == 'Admin')
        this.isAdminRole = true;

      if (this.isAdminRole)
        await this.loadSellerDNorm();

      this.utilityService.filterToggleSubject.subscribe(flag => {
        this.filterFlag = flag;
      });

      this.spinnerService.show();
      this.preLoadTypeFilter();

      await this.getGridConfiguration();
      await this.loadRejectedInventory();
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Something went wrong, Data not load!');
    }
  }
  //#endregion

  //#region Grid Config 
  public async getGridConfiguration() {
    try {
      this.spinnerService.show();

      this.fields = await this.gridPropertiesService.getLeadRejectedStoneItems();
      if (!this.isAdminRole)
        this.fields = this.fields.filter(x => x.title != "Seller");

      this.detailFields = await this.gridPropertiesService.getLeadRejectedStoneItemsDetailGrid();

      this.spinnerService.hide();
    }
    catch (error: any) {
      this.alertDialogService.show(error);
      this.spinnerService.hide();
    }
  }

  public async groupChange(groups: GroupDescriptor[]): Promise<void> {
    try {
      this.groups = groups;
      await this.loadRejectedInventory();
    }
    catch (error: any) {
      this.alertDialogService.show(error.error)
    }
  }

  public async pageChange(event: PageChangeEvent): Promise<void> {
    this.skip = event.skip;
    await this.loadRejectedInventory();
  }

  //#endregion

  public async loadRejectedInventory() {
    try {
      this.spinnerService.show();
      if (this.leadNo) {
        let leadNos: Array<number> = (this.utilityService.checkCertificateIds(this.leadNo).map(x => (this.utilityService.containsOnlyNumbers(x)) ? Number(x) : 0)).filter(a => a != 0) ?? new Array<number>();
        this.rejectedSearchCriteria.leadNos = leadNos.length > 0 ? leadNos : new Array<number>();
      }
      else
        this.rejectedSearchCriteria.leadNos = new Array<number>();

      this.rejectedSearchCriteria.stoneIds = this.stoneId ? this.utilityService.CheckStoneIds(this.stoneId).map(x => x.toUpperCase()) : [];
      if (!this.isAdminRole)
        this.rejectedSearchCriteria.sellerId = this.fxCredentials.id;

      let res = await this.leadService.getRejectedLeadPaginated(this.rejectedSearchCriteria, this.skip, this.pageSize);
      if (res) {
        this.rejectedStonResponse = JSON.parse(JSON.stringify(res));
        this.gridView = process(res.leadRejectedOffers, { group: this.groups });
        this.gridView.total = res.totalCount;

        this.spinnerService.hide();
      }
      else
        this.spinnerService.hide();
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Data not load, Try gain later!');
    }
  }

  public filterPartToggle() {
    this.utilityService.setfilterToggleValue(this.filterFlag);
  }

  public async onFilterSubmit(form: NgForm) {
    if (form.valid) {
      await this.loadRejectedInventory();
    }
  }

  public async clearFilter(form: NgForm) {
    this.spinnerService.show();
    form.reset();
    this.skip = 0;
    this.rejectedSearchCriteria = new LeadRejectedStoneSearchCriteria();
    this.leadNo = undefined as any;
    this.stoneId = undefined as any;
    this.typeList = Array<{ name: string; isChecked: boolean }>();
    this.preLoadTypeFilter();
    await this.loadRejectedInventory();
  }

  private async loadSellerDNorm() {
    try {
      let sellers: SystemUser[] = await this.systemUserService.getSystemUserByOrigin(OriginValue.Seller.toString());
      this.sellerDNormItems = new Array<SystemUserDNorm>();
      for (let index = 0; index < sellers.length; index++) {
        const element = sellers[index];
        this.sellerDNormItems.push({
          id: element.id,
          name: element.fullName,
          mobile: element.mobile,
          email: element.email,
          address: element.address
        });
      }

      this.sellerDNormItems.forEach((item) => {
        this.listSellerDNormItems.push({ text: item.name, value: item.id });
      });
    }
    catch (error: any) {
      console.error(error);
      this.alertDialogService.show(error.error);
    }
  }

  public onSellerDNormChange(changeValue: any) {
    if (changeValue) {
      const sellerDNorm = this.sellerDNormItems.find(z => z.id == changeValue.value);
      if (sellerDNorm != undefined && sellerDNorm != null) {
        this.seller = sellerDNorm;
        this.rejectedSearchCriteria.sellerId = sellerDNorm.id;
      }
    }
    else
      this.clearSeller();
  }

  public clearSeller() {
    this.selectedSellerDNormItem = undefined;
    this.rejectedSearchCriteria.sellerId = '';

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

  public async customerChange(e: any) {
    if (e) {
      let fetchCustomer = this.customerItems.find(x => x.id == e);
      if (fetchCustomer) {
        setTimeout(() => {
          this.selectedCustomerItem = fetchCustomer?.companyName + '-' + fetchCustomer?.name ?? '' as any;
        }, 0);
        this.rejectedSearchCriteria.customerId = fetchCustomer.id;
      }
    }
    else
      this.rejectedSearchCriteria.customerId = undefined as any;
  }


  public preLoadTypeFilter() {
    Object.values(RejectionType).forEach(z => { this.typeList.push({ name: z.toString(), isChecked: false }); });
    this.rejectedSearchCriteria.rejectionTypes.push(RejectionType.SaleCancel.toString());
    this.utilityService.onMultiSelectChange(this.typeList, this.rejectedSearchCriteria.rejectionTypes);
  }

  public async openDetailsDialog() {
    if (this.mySelection[0]) {
      this.isShowDetails = true;
      await this.loadDetailGrid();
    }
  }

  public closeDetailsDialog() {
    this.isShowDetails = false;
    this.mySelection = new Array<string>();
  }

  public async loadDetailGrid() {
    this.spinnerService.show();
    this.rejectedInvItems = new Array<LeadRejectedOfferItem>();

    if (this.mySelection[0])
      this.rejectedInvItems = await this.leadService.getLeadRejecetdInvItemsByOfferId(this.mySelection[0]);

    this.spinnerService.hide();
  }

  public async deleteOffer() {
    this.alertDialogService.ConfirmYesNo('Are you sure you want to delete?', 'Delete')
      .subscribe(async (res: any) => {
        if (res.flag) {
          this.spinnerService.show();
          let response: boolean = await this.leadService.deleteLeadRejectedOffer(this.mySelection[0]);
          if (response) {
            await this.loadRejectedInventory();
            this.mySelection = new Array<string>();
            this.utilityService.showNotification("Rejected detail has been deleted successfully!!");

          }
          else
            this.alertDialogService.show("Something went wrong, while deleting rejected detail");

          this.spinnerService.hide();
        }
      });

  }

}

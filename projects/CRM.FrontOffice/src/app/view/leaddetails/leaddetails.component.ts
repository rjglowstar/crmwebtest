import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { DataResult, GroupDescriptor, process, SortDescriptor } from '@progress/kendo-data-query';
import { NgxSpinnerService } from 'ngx-spinner';
import { GridDetailConfig } from 'shared/businessobjects';
import { GridConfig, GridMasterConfig } from 'shared/enitites';
import { ConfigService, LeadStatus, OriginValue, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { LeadDetailResponse, LeadDetailSearchCriteria } from '../../businessobjects';
import { CustomerDNorm, fxCredential, SingularLead, SystemUser, SystemUserDNorm } from '../../entities';
import { CustomerService, GridPropertiesService, LeadService, SystemUserService } from '../../services';
import { Expomaster } from '../../entities/organization/expomaster';
import { ExpomasterService } from '../../services/expomaster/expomaster.service';
import { ExpoMasterSearchCriteria } from '../../businessobjects/organizations/expomastersearchcriteria ';
import { ExpoMasterDNorm } from '../../entities/organization/dnorm/expomasterdnorm';
import { LeadDetailSummary } from '../../businessobjects/business/leaddetailsummary';

@Component({
  selector: 'app-leaddetails',
  templateUrl: './leaddetails.component.html',
  styleUrls: ['./leaddetails.component.css']
})
export class LeaddetailsComponent implements OnInit {

  public sort: SortDescriptor[] = [];
  public groups: GroupDescriptor[] = [];
  public gridView!: DataResult;
  public pageSize = 26;
  public skip = 0
  public fields!: GridDetailConfig[];
  public gridMasterConfigResponse!: GridMasterConfig;
  public isGridConfig: boolean = false;
  public gridConfig!: GridConfig;
  public fxCredentials!: fxCredential;
  public filterFlag = true;
  public leadDetailSearchCriteria: LeadDetailSearchCriteria = new LeadDetailSearchCriteria();
  public leadDetailSummary: LeadDetailSummary = new LeadDetailSummary();
  public leadNo!: string;
  public stoneId!: string;
  public isAdminRole!: boolean;
  public mySelection: string[] = [];

  public excelOption!: string | null;
  public excelFile: any[] = [];
  //expo 
  public expomastersearchcriteria: ExpoMasterSearchCriteria = new ExpoMasterSearchCriteria();
  public listExpoMasterDNormItems: Array<{ text: string; value: string }> = [];
  public expoMasterDNormItems!: ExpoMasterDNorm[];
  public selectedExpoMasterDNormItem?: { text: string; value: string };
  public expoMaster: ExpoMasterDNorm = new ExpoMasterDNorm();
  //end expo
  public seller: SystemUserDNorm = new SystemUserDNorm();
  public listSellerDNormItems: Array<{ text: string; value: string }> = [];
  public sellerDNormItems!: SystemUserDNorm[];
  public selectedSellerDNormItem?: { text: string; value: string };
  public listCustomerItems: Array<{ text: string; companyName: string, value: string }> = [];
  public selectedCustomerItem: string = "";
  public customerItems: CustomerDNorm[] = [];
  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains',
  };
  public leadStatusList: Array<{ name: string; isChecked: boolean }> = [];
  public certificateNo!: string;


  constructor(private router: Router,
    private alertDialogService: AlertdialogService,
    private spinnerService: NgxSpinnerService,
    public utilityService: UtilityService,
    private gridPropertiesService: GridPropertiesService,
    private configService: ConfigService,
    private leadService: LeadService,
    private systemUserService: SystemUserService,
    public customerService: CustomerService,
    private expoMasterService: ExpomasterService,
    private datepipe: DatePipe
  ) { }

  async ngOnInit() {
    await this.defaultMethodsLoad();
  }

  /* #region DefaultMethod */
  public async defaultMethodsLoad() {
    try {
      this.fxCredentials = JSON.parse(sessionStorage.getItem("fxCredentials") ?? '') as fxCredential;
      if (!this.fxCredentials)
        this.router.navigate(["login"]);

      if (this.fxCredentials?.origin == 'Admin')
        this.isAdminRole = true;

      this.spinnerService.show();
      await this.getGridConfiguration();
      this.preLoadLeadStatusFilter();
      await this.loadLeadDetails();
      await this.loadExpoMasterDNorm();
      await this.initLeadDetailSummary();
      if (this.isAdminRole)
        await this.loadSellerDNorm();

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

  /* #endregion */

  /* #region Grid methods */
  public async loadLeadDetails() {
    try {
      this.spinnerService.show();

      if (!this.isAdminRole)
        this.leadDetailSearchCriteria.sellerId = this.fxCredentials.id;

      if (this.leadNo) {
        let leadNos: Array<number> = (this.utilityService.checkCertificateIds(this.leadNo).map(x => (this.utilityService.containsOnlyNumbers(x)) ? Number(x) : 0)).filter(a => a != 0) ?? new Array<number>();
        this.leadDetailSearchCriteria.leadNos = leadNos.length > 0 ? leadNos : new Array<number>();
      }
      else
        this.leadDetailSearchCriteria.leadNos = new Array<number>();

      if (this.certificateNo) {
        let certificateNos: Array<string> = this.utilityService.checkCertificateIds(this.certificateNo);
        this.leadDetailSearchCriteria.certificateNos = certificateNos.length > 0 ? certificateNos : new Array<string>();
      }
      else
        this.leadDetailSearchCriteria.certificateNos = new Array<string>();

      this.leadDetailSearchCriteria.stoneIds = this.stoneId ? this.utilityService.CheckStoneIds(this.stoneId).map(x => x.toUpperCase()) : [];

      let response: LeadDetailResponse = await this.leadService.getLeadsDetailPaginated(this.leadDetailSearchCriteria, this.skip, this.pageSize);
      if (response && response.singularLeads.length > 0) {
        this.gridView = process(response.singularLeads, { group: this.groups, sort: this.sort });
        this.gridView.total = response.totalCount;
        this.leadDetailSummary.totalPcs = response.totalCount;
        this.spinnerService.hide();
      }
      else {
        this.gridView = process([], { group: this.groups, sort: this.sort });
        this.gridView.total = 0;
        this.spinnerService.hide();
      }
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Data not load, Try gain later!');
    }
  }

  public async initLeadDetailSummary() {
    try {
      this.spinnerService.show();
      let leadDetailSummary = await this.leadService.getLeadDetailSummary(this.leadDetailSearchCriteria);
      if (leadDetailSummary) 
        this.leadDetailSummary = leadDetailSummary;
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      console.error(error);
      this.alertDialogService.show('Summary data not fetch, Try again later!');
    }
  }

  public async groupChange(groups: GroupDescriptor[]): Promise<void> {
    try {
      this.groups = groups;
      await this.loadLeadDetails();
    }
    catch (error: any) {
      this.alertDialogService.show(error.error)
    }
  }

  public async sortChange(sort: SortDescriptor[]): Promise<void> {
    this.sort = sort;
    await this.loadLeadDetails();
  }

  public async pageChange(event: PageChangeEvent): Promise<void> {
    this.skip = event.skip;
    await this.loadLeadDetails();
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
        this.leadDetailSearchCriteria.sellerId = sellerDNorm.id;
      }
    }
    else
      this.clearSeller();
  }

  public clearSeller() {
    this.selectedSellerDNormItem = undefined;
    this.leadDetailSearchCriteria.sellerId = "";
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
        this.leadDetailSearchCriteria.customerId = fetchCustomer.id;
      }
    }
    else
      this.leadDetailSearchCriteria.customerId = undefined as any;
  }


  /* #endregion */

  /* #region Grid Config */
  public async getGridConfiguration() {
    try {
      this.spinnerService.show();
      this.gridConfig = await this.configService.getGridConfig(this.fxCredentials?.id ?? '', "LeadDetail", "LeadDetailGrid", this.gridPropertiesService.getLeadDetailGrid());
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
        this.gridMasterConfigResponse = await this.configService.getMasterGridConfig("LeadDetail", "LeadDetailGrid");
        if (this.gridMasterConfigResponse)
          this.fields = this.gridMasterConfigResponse.gridDetail;
        else
          this.fields = await this.gridPropertiesService.getLeadDetailGrid();

      }

      if (!this.isAdminRole)
        this.fields = this.fields.filter(x => x.title.toLowerCase() != 'seller');

      this.spinnerService.hide();
    }
    catch (error: any) {
      this.alertDialogService.show(error);
      this.spinnerService.hide();
    }
  }

  public openGridConfigDialog(): void {
    this.isGridConfig = true;
  }

  public setNewGridConfig(gridConfig: GridConfig) {
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
  /* #endregion */

  /* #region Filter Section */

  public async onFilterSubmit() {
    this.skip = 0;
    await this.loadLeadDetails();
    await this.initLeadDetailSummary();
  }

  public async clearFilter() {
    this.skip = 0;
    this.leadDetailSearchCriteria = new LeadDetailSearchCriteria();
    this.leadNo = undefined as any;
    this.stoneId = undefined as any;
    this.certificateNo = undefined as any;
    this.preLoadLeadStatusFilter();
    await this.loadLeadDetails();
    await this.initLeadDetailSummary();
  }

  public filterPartToggle() {
    this.utilityService.setfilterToggleValue(this.filterFlag);
  }

  public preLoadLeadStatusFilter() {
    Object.values(LeadStatus).filter(x => x != LeadStatus.Cart.toString()).forEach(z => { this.leadStatusList.push({ name: z.toString(), isChecked: false }); });
    this.leadDetailSearchCriteria.leadStatus.push(LeadStatus.Proposal.toString());
    this.leadDetailSearchCriteria.leadStatus.push(LeadStatus.Hold.toString());
    this.leadDetailSearchCriteria.leadStatus.push(LeadStatus.Order.toString());
    this.utilityService.onMultiSelectChange(this.leadStatusList, this.leadDetailSearchCriteria.leadStatus);
  }

  /* #endregion */

  //expo master
  private async loadExpoMasterDNorm() {

    try {
      var expoMaster: Expomaster = await this.expoMasterService.getExpoMaster(this.expomastersearchcriteria);
      var expoMasterData = JSON.parse(JSON.stringify(expoMaster))
      this.expoMasterDNormItems = new Array<ExpoMasterDNorm>();
      for (let index = 0; index < expoMasterData.length; index++) {
        const element = expoMasterData[index];
        this.expoMasterDNormItems.push({
          id: element.id,
          name: element.name,
          country: element.country
        });
      }

      this.expoMasterDNormItems.forEach((item) => {
        this.listExpoMasterDNormItems.push({ text: item.name, value: item.id });

      });
    }
    catch (error: any) {
      console.error(error);
      this.alertDialogService.show(error.error);
    }
  }
  public onExpoMasterDNormChange(changeValue: any) {
    if (changeValue) {
      const expoMasterDNorm = this.expoMasterDNormItems.find(z => z.id == changeValue.value);
      if (expoMasterDNorm != undefined && expoMasterDNorm != null) {
        this.expoMaster = expoMasterDNorm;

        this.leadDetailSearchCriteria.expoName = expoMasterDNorm.name;
      }
    }
    else
      this.clearExpoMaster();
  }
  // end expo master

  public clearExpoMaster() {
    this.selectedExpoMasterDNormItem = undefined;
    // this.expomastersearchcriteria.sellerId = "";
  }

  public async exportToExcel() {
    this.excelFile = [];
    this.spinnerService.show();
    let exportData: SingularLead[] = [];

    let data = await this.leadService.getLeadsDetailPaginated(this.leadDetailSearchCriteria, 0, this.leadDetailSummary.totalPcs);
    if (data)
      exportData = data.singularLeads;
    else {
      this.spinnerService.hide();
      this.alertDialogService.show('Export to excel not working, Try again later!');
      return;
    }

    if (exportData && exportData.length > 0) {
      exportData.forEach(element => {
        var excel = this.convertArrayToObject(this.fields, element);
        this.excelFile.push(excel);
      });

      if (this.excelFile.length > 0) {
        let isExport: boolean = this.utilityService.exportAsExcelFile(this.excelFile, "Sale_Sheet");
        if (isExport) {
          this.excelOption = null;
        }
      }
      this.spinnerService.hide();
    }
    else {
      this.alertDialogService.show('No Data Found!');
      this.spinnerService.hide();
    }
  }


  public convertArrayToObject(fields: GridDetailConfig[], element: any): any {
    var obj: any = {};
    for (let i = 0; i < fields.length; i++) {
      let field = fields[i];
      if (!(field.title == "Checkbox")) {
        if (field.title == "P.Email") {
          let propertyname = field.propertyName.split(".")[1];
          obj[field.title] = element.customer[propertyname];
        }
        else if (field.title == "P.Code") {
          let propertyname = field.propertyName.split(".")[1];
          obj[field.title] = element.customer[propertyname];
        }
        else if (field.title == "P.Mobile") {
          let propertyname = field.propertyName.split(".")[1];
          obj[field.title] = element.customer[propertyname];
        }
        else if (field.title == "Seller Name") {
          let propertyname = field.propertyName.split(".")[1];
          obj[field.title] = element.seller[propertyname];
        }
        else if (field.title == "Supplier") {
          let propertyname = field.propertyName.split(".")[2];
          obj[field.title] = element.supplier[propertyname];
        }
        else if (field.title == "Expo Name") {
          let propertyname = field.propertyName.split(".")[1];
          obj[field.title] = element.leadInventoryItems[propertyname];
        }
        else if (field.title == "Stone Id") {
          let propertyname = field.propertyName.split(".")[1];
          obj[field.title] = element.leadInventoryItems[propertyname];
        }
        else if (field.title == "Broker") {
          let propertyname = field.propertyName.split(".")[1];
          obj[field.title] = element.broker[propertyname];
        }
        else if (field.title == "B.Mobile") {
          let propertyname = field.propertyName.split(".")[1];
          obj[field.title] = element.broker[propertyname];
        }
        else if (field.title == "Party") {
          var customername = field.propertyName.concat(".name")
          let propertyname = customername.split(".")[1];
          obj[field.title] = element.customer[propertyname];
        }
        else if (field.title == "Rap" || field.title == "Disc") {
          let propertyname = field.propertyName.split(".")[2];
          obj[field.title] = element.leadInventoryItems.price[propertyname];
        }
        else if (field.title == "P. Supplier") {
          let propertyname = field.propertyName.split(".")[2];
          obj[field.title] = element.leadInventoryItems.primarySupplier[propertyname];
        }
        else if (field.title == "Via Supplier") {
          let propertyname = field.propertyName.split(".")[2];
          obj[field.title] = element.leadInventoryItems.viaSupplier[propertyname];
        }
        else if (field.propertyName.includes("leadInventoryItems")) {
          let propertyname = field.propertyName.split(".")[1];
          obj[field.title] = element.leadInventoryItems[propertyname];
        }
        else if (field.propertyName.includes("holdDate"))
          obj[field.title] = this.datepipe.transform(element[field.propertyName], 'dd-MM-yyyy');
        else if (field.propertyName.includes("orderDate"))
          obj[field.title] = this.datepipe.transform(element[field.propertyName], 'dd-MM-yyyy');
        else if (field.propertyName.includes("createdDate"))
          obj[field.title] = this.datepipe.transform(element[field.propertyName], 'dd-MM-yyyy');
        else if (field.propertyName.includes("processDate"))
          obj[field.title] = this.datepipe.transform(element[field.propertyName], 'dd-MM-yyyy');
        else
          obj[field.title] = element[field.propertyName];
      }

    }
    return obj;

  }


}

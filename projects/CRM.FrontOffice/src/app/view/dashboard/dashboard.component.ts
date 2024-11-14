import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { SelectableSettings } from '@progress/kendo-angular-grid';
import { AggregateResult, GroupDescriptor, SortDescriptor } from '@progress/kendo-data-query';
import { NgxSpinnerService } from 'ngx-spinner';
import { fxCredential } from 'shared/enitites';
import { OriginValue, StoneStatus, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { InventorySearchCriteria, InventorySelectAllItems, StoneProposalMailData } from '../../businessobjects';
import { CustomerActiveData } from '../../businessobjects/customer/CustomerActiveData';
import { AppointmentItem, Customer, CustomerDNorm, DayWiseSummary, InventoryItems, InvItem, Lead, SellPurchaseDetail, SystemUser, SystemUserDNorm } from '../../entities';
import { AiSuggestions } from '../../entities/business/aisuggestion';
import { CustomerService, DashboardService, InventoryService, LeadService, StoneProposalService, SystemUserService } from '../../services';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit {

  public fxCredentials!: fxCredential;
  public originValue = OriginValue;
  public sellerId!: string;
  public dayWiseSummary: DayWiseSummary = new DayWiseSummary();
  public buyerpieData!: any[];
  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains'
  };
  public sellerpieData!: any[];
  public chartSeries!: any[];
  public daycattegory!: any[];

  public orderData: Lead[] = new Array<Lead>();
  public holdData: Lead[] = new Array<Lead>();
  private buyerCriteria: string = "Weekly";
  private buyerPurchasePeriod: string = "Weekly";
  public isBuyerFilterClick!: boolean;
  public isSellerFilterClick!: boolean;
  private sellerCriteria: string = "Weekly";
  private sellerPurchasePeriod: string = "Weekly";
  private tFCriteria: string = "Weekly";
  public isTFFilterClick!: boolean;
  public appointmentList: AppointmentItem[] = new Array<AppointmentItem>();
  public today: boolean = true;
  public pageSize = 26;
  public groups: GroupDescriptor[] = [];
  public sort: SortDescriptor[] = [];
  public skip = 0;
  public customerGridView: CustomerActiveData[] = new Array<CustomerActiveData>();
  public total_AvgSales: any | undefined = 0;
  public totalAvgLength: any;
  public secFullScreen = 0;
  public aiSuggestions: AiSuggestions[] = new Array<AiSuggestions>();
  public customerWiseSuggestions: Array<any> = [];
  public gridData: Array<any> = [];
  public showExcelOption = false;

  public buyerPurchase: Array<{ text: string; value: number }> = [
    { text: "Daily", value: 1 },
    { text: "Weekly", value: 2 },
    { text: "Monthly", value: 3 },
  ];

  public selectedValue: { text: string; value: number } = {
    text: this.sellerCriteria,
    value: 2,
  };
  public value = 10;
  public isFilterDashboard = false;
  public isFilterDashboards = false;
  public isFilterDash = false;
  public pieColor: string[] = ["#7b7b7b", "#8f8f8f", "#999999", "#a3a3a3", "#c0c0c0", "#d4d4d4", "#e8e8e8", "#f2f2f2", "#d6d6d6", "#e0e0e0", "#eaeaea", "#f4f4f4"];

  public group: GroupDescriptor[] = [{ field: 'fullName', aggregates: [{ field: 'stoneId', aggregate: 'count' }] }];
  public selectableSettings: SelectableSettings = {
    mode: 'multiple',
  };
  public mySelection: string[] = [];
  public allInventoryItems: InventorySelectAllItems[] = [];
  public inventorySearchCriteriaObj: InventorySearchCriteria = new InventorySearchCriteria();
  public inventoryItems: InventoryItems[] = [];
  public leadListInvInput: InvItem[] = [];
  public isLeadModal: boolean = false;
  public sellerObj = new SystemUserDNorm();
  private currentlyExpandedGroupIndex: string | null = null;
  public customerId!: string;
  public customerList: Customer[] = [];
  public excelOption!: string | null;
  public exportData: InventoryItems[] = [];
  public aDiscount!: number;
  public stoneProposalMail: StoneProposalMailData = new StoneProposalMailData();
  public prapoCust: Array<{ text: string; value: string; isCheckedPro: boolean }> = [];
  public praposalCust: CustomerDNorm[] = [];
  public filterStoneByCerID!: string;
  public systemUserItems!: SystemUser[];
  public proposalSuccMsg!: string;
  public isProposalSuccess: boolean = false;
  public listEmpItems: Array<{ text: string; value: string }> = [];
  public allHoldBy: string[] = [];
  public listHoldByItems: Array<{ name: string; isChecked: boolean }> = [];

  @ViewChild('grid') grid: any;
  constructor(
    private alertDialogService: AlertdialogService,
    private spinnerService: NgxSpinnerService,
    private dashboardService: DashboardService,
    private inventoryService: InventoryService,
    private leadService: LeadService,
    private customerService: CustomerService,
    public utilityService: UtilityService,
    private stoneProposalService: StoneProposalService,
    private systemUserService: SystemUserService,
  ) {
  }

  async ngOnInit() {
    this.fxCredentials = JSON.parse(sessionStorage.getItem("fxCredentials") ?? '') as fxCredential;
    if (this.fxCredentials && this.fxCredentials.origin.toLowerCase() == this.originValue.Seller.toString().toLowerCase())
      this.sellerId = this.fxCredentials?.id;
    else
      this.sellerId = this.fxCredentials?.id;

    await this.onLoadAiSuggestions()

    if (this.fxCredentials.isLoadDash) {
      await this.getCustomer();
      await this.loadData();
    }
  }

  public async initInventoryData() {
    try {
      this.spinnerService.show();
      let res = await this.inventoryService.getInventoryItemsBySearch(this.inventorySearchCriteriaObj, this.skip, this.inventorySearchCriteriaObj.stoneIds.length);
      if (res) {
        this.inventoryItems = res;
        this.inventoryItems.forEach(z => {
          let index = this.allInventoryItems.findIndex(a => a.stoneId == z.stoneId);
          if (index == -1)
            this.allInventoryItems.push({ id: z.id, stoneId: z.stoneId, certificateNo: z.certificateNo, status: z.status });
        });
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

  getStoneCount(group: any): number {
    const aggregateResult: AggregateResult = group.aggregates;
    return aggregateResult.stoneId ? aggregateResult.stoneId.count ?? 0 : 0;
  }

  public copyToClipboard(cName: string) {
    try {
      var stoneIds = "";
      if (this.mySelection.length > 0)
        stoneIds = this.mySelection.join(", ")
      else
        stoneIds = this.gridData.filter(x => x.fullName == cName).map(x => x.stoneId).join(", ")
      if (stoneIds != null && stoneIds != "") {
        navigator.clipboard.writeText(stoneIds);
        this.utilityService.showNotification(`Copy to clipboard successfully!`);
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }


  public async openLeadDialog(cusName: string) {
    this.customerId = this.customerList.find(c => c.companyName == cusName)?.id.toString() ?? "";
    let stoneIds: string[] = []
    this.inventorySearchCriteriaObj.stoneIds = this.mySelection;
    this.inventorySearchCriteriaObj.status.push(StoneStatus.Stock, StoneStatus.Transit);
    if (this.inventorySearchCriteriaObj.stoneIds.length > 0) {
      await this.initInventoryData();
    }
    if (this.allInventoryItems && this.allInventoryItems.length > 0)
      stoneIds = this.allInventoryItems.filter(item => this.mySelection.includes(item.stoneId)).map(z => z.stoneId);
    else
      stoneIds = this.inventoryItems.filter(item => this.mySelection.includes(item.stoneId)).map(z => z.stoneId);

    if (stoneIds && stoneIds.length > 0) {
      this.leadListInvInput = new Array<InvItem>();
      this.spinnerService.show();
      let fetchData: InvItem[] = await this.inventoryService.getInventoryDNormsByStones(stoneIds, " " as any);
      let soldStonesInv: InvItem[] = fetchData.filter(x => x.status == StoneStatus.Sold.toString());
      if (fetchData && fetchData.length > 0) {
        fetchData = fetchData.filter(x => x.status != StoneStatus.Sold.toString());

        for (let index = 0; index < fetchData.length; index++) {
          let oi = new InvItem();
          const element: any = fetchData[index];
          oi = element;
          this.leadListInvInput.push(oi)
        }
        if (soldStonesInv && soldStonesInv.length > 0)
          this.alertDialogService.show(`${soldStonesInv.length == 1 ? soldStonesInv[0].stoneId.toString() + ' Stone is' : soldStonesInv.map(x => x.stoneId).join(", ") + ' Stones are'} on <b>Sold</b>.`);
        else
          this.isLeadModal = true;
      }
      else
        this.alertDialogService.show(`${stoneIds.length == 1 ? stoneIds.toString() + ' Stone is' : stoneIds.join(", ") + ' Stones are'} not found in inventory.`);
    }
    else
      this.alertDialogService.show(`Stone Ids are not found.`);
    this.spinnerService.hide();
  }

  public async onLoadAiSuggestions() {
    this.customerList = await this.customerService.getCustomerBySellerId(this.sellerId)
    let custIds = this.customerList.map(c => c.id);
    await this.leadService.aiGeneratedLead(this.sellerId, custIds);
    await this.loadAiSuggestions(this.sellerId);
    this.sellerObj = await this.leadService.getSellerDNormById(this.fxCredentials.id);
    const customerIdToFullName = new Map<string, string>();
    const customerIds = new Set<string>();

    this.customerList.forEach(customer => {
      customerIdToFullName.set(customer.id, customer.companyName);
      customerIds.add(customer.id);
    });

    this.customerWiseSuggestions = this.aiSuggestions.reduce((acc: any, suggestion) => {
      if (customerIds.has(suggestion.customerId)) {
        const fullName = customerIdToFullName.get(suggestion.customerId) || 'Unknown';
        if (!acc[suggestion.customerId]) {
          acc[suggestion.customerId] = [];
        }
        if (!acc[suggestion.customerId].some((item: any) => item.stoneId === suggestion.stoneId)) {
          acc[suggestion.customerId].push({
            ...suggestion,
            fullName
          });
        }
      }
      return acc;
    }, {});

    this.gridData = Object.keys(this.customerWiseSuggestions)
      .map((customerId: any) => {
        const customerSuggestions = this.customerWiseSuggestions[customerId];
        return customerSuggestions.map((suggestion: any) => ({
          customerId: suggestion.customerId,
          fullName: suggestion.fullName,
          stoneId: suggestion.stoneId,
          shape: suggestion.shape,
          color: suggestion.color,
          clarity: suggestion.clarity,
          cut: suggestion.cut,
          weight: suggestion.weight
        }));
      })
      .reduce((acc: any[], val: any[]) => acc.concat(val), []);
    this.onDataStateChange()
  }

  public async closeLeadDialog(flag: any): Promise<void> {
    if (flag) {
      this.currentlyExpandedGroupIndex = null;
      await this.onLoadAiSuggestions()
      this.isLeadModal = false;
    }
    if (flag == undefined)
      this.isLeadModal = false;
    await this.initInventoryData();
    this.mySelection = [];
  }

  onGroupChange(event: any) {
    const groupIndex = event.groupIndex;
    if (this.currentlyExpandedGroupIndex === groupIndex) {
      this.grid.collapseGroup(groupIndex);
      this.currentlyExpandedGroupIndex = null;
    } else {
      if (this.currentlyExpandedGroupIndex !== null) {
        this.grid.collapseGroup(this.currentlyExpandedGroupIndex);
        this.mySelection = [];
      }
      this.grid.expandGroup(groupIndex);
      this.currentlyExpandedGroupIndex = groupIndex;
    }
  }

  onDataStateChange() {
    setTimeout(() => {
      if (this.currentlyExpandedGroupIndex === null) {
        const groups = this.gridData.reduce((acc: any[], item: any, idx: number) => {
          if (!acc.includes(item.customerId)) {
            acc.push({ index: idx.toString(), id: item.customerId });
          }
          return acc;
        }, []);

        groups.forEach(group => {
          this.grid.collapseGroup(group.index);
        });
      }
    }, 0);
  }

  public async loadAiSuggestions(sellerId: string) {
    try {
      this.spinnerService.show();
      this.aiSuggestions = await this.dashboardService.getAiSuggestions(sellerId);
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.alertDialogService.show(error);
      this.spinnerService.hide();
    }
  }

  public async loadData() {
    try {
      this.spinnerService.show();
      if (!localStorage.getItem("DashboardBuyerData"))
        await this.getBuyerData();
      else {
        let storage = localStorage.getItem("DashboardBuyerData");
        if (storage != null) {
          let buyerData = JSON.parse(storage) as SellPurchaseDetail[];
          this.buyerpieData = [];
          if (buyerData && buyerData.length > 0) {
            buyerData.forEach(element => {
              this.buyerpieData.push({ category: element.companyName, value: element.netAmount.toFixed(2) });
            });
          }
        }
        else
          await this.getBuyerData();
      }
      if (!localStorage.getItem("DashboardDailySummary"))
        await this.getDayWiseSummary();
      else {
        let storage = localStorage.getItem("DashboardDailySummary");
        if (storage != null)
          this.dayWiseSummary = JSON.parse(storage) as DayWiseSummary;
        else
          await this.getDayWiseSummary();
      }


      if (!localStorage.getItem("DashboardSellerData"))
        await this.getSellerData();
      else {
        let storage = localStorage.getItem("DashboardSellerData");
        if (storage != null) {
          let sellerData = JSON.parse(storage) as SellPurchaseDetail[];
          this.sellerpieData = [];
          this.chartSeries = [];
          this.daycattegory = [];
          var DataAmount: number[] = [];
          if (sellerData && sellerData.length > 0) {
            sellerData.forEach(element => {
              this.selectedValue.text = this.sellerCriteria
              DataAmount.push(element.netAmount);

              var datePipe = new DatePipe('en-US');
              if (element.soldDate != null) {
                if (element.critearea == "Weekly" || element.critearea == "Daily") {
                  var dateData = datePipe.transform(element.soldDate, 'dd MMM yyyy');
                } else {
                  var dateData = datePipe.transform(element.soldDate, 'MMM yyyy');
                }

                this.chartSeries.push({ category: dateData, value: element.diamondCount });
              }
              this.sellerpieData.push({ category: element.companyName, value: element.netAmount.toFixed() });
            });
            var avg_total = DataAmount.reduce((acc, curr, _, { length }) => acc + curr / length, 0)
            this.total_AvgSales = avg_total ?? 0;
            this.totalAvgLength = this.total_AvgSales.length;
          }
        }
        else
          await this.getSellerData();
      }

      if (!localStorage.getItem("DashboardOrderData"))
        await this.getOrderData();
      else {
        let storage = localStorage.getItem("DashboardOrderData");
        if (storage != null)
          this.orderData = JSON.parse(storage) as Lead[];
        else
          await this.getOrderData();
      }

      if (!localStorage.getItem("DashboardHoldData"))
        await this.getHoldData();
      else {
        let storage = localStorage.getItem("DashboardHoldData");
        if (storage != null)
          this.holdData = JSON.parse(storage) as Lead[];
        else
          await this.getHoldData();
      }

      if (!localStorage.getItem("DashboardCustomerActiveData"))
        await this.getCustomer();
      else {
        let storage = localStorage.getItem("DashboardCustomerActiveData");
        if (storage != null)
          this.customerGridView = JSON.parse(storage) as CustomerActiveData[];
        else
          await this.getCustomer();
      }

      if (!localStorage.getItem("Appointment"))
        await this.getAppointment();
      else {
        let storage = localStorage.getItem("Appointment");
        let storageBool = localStorage.getItem("AppointmentCriteria");
        if (storage != null && storageBool != null) {
          this.appointmentList = JSON.parse(storage) as AppointmentItem[];
          this.today = JSON.parse(storageBool) as boolean;
        }
        else
          await this.getAppointment();
      }

      this.spinnerService.hide();
    }
    catch (error: any) {
      this.alertDialogService.show(error);
      this.spinnerService.hide();
    }
  }

  public async getCustomer() {
    try {
      this.customerGridView = await this.customerService.GetCustomersActive(this.sellerId);
      window.localStorage.setItem("DashboardCustomerActiveData", JSON.stringify(this.customerGridView));

    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async getDayWiseSummary() {
    try {
      this.dayWiseSummary = await this.dashboardService.GetDayWiseSummaryAsync(this.sellerId);
      window.localStorage.setItem("DashboardDailySummary", JSON.stringify(this.dayWiseSummary));
    }
    catch (error: any) {
      this.alertDialogService.show(error);
      this.spinnerService.hide();
    }
  }

  private async getBuyerData() {
    try {
      let buyerData = await this.dashboardService.getBuyerPurchaseData(this.buyerCriteria, this.sellerId);
      window.localStorage.setItem("DashboardBuyerData", JSON.stringify(buyerData));

      this.buyerpieData = [];
      if (buyerData && buyerData.length > 0) {
        buyerData.forEach(element => {
          this.buyerpieData.push({ category: element.companyName, value: element.netAmount.toFixed(2) });
        });
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error);
    }
  }

  public async addSellerPurchasePeriod(period: any) {
    try {
      this.sellerPurchasePeriod = period.text;
      if (this.sellerPurchasePeriod == "Daily") {
        this.sellerCriteria = "Daily";
        this.buyerCriteria = "Daily";
      }

      else if (this.sellerPurchasePeriod == "Weekly") {
        this.sellerCriteria = "Weekly";
        this.buyerCriteria = "Weekly";
      }
      else if (this.sellerPurchasePeriod == "Monthly") {
        this.sellerCriteria = "Monthly";
        this.buyerCriteria = "Monthly";
      }
      await this.getSellerData();
      await this.getBuyerData();
      this.isSellerFilterClick = false;
      this.isBuyerFilterClick = false;
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error);
    }
  }

  private async getSellerData() {
    try {
      let sellerData = await this.dashboardService.getSellerPurchaseData(this.sellerCriteria, this.sellerId);
      window.localStorage.setItem("DashboardSellerData", JSON.stringify(sellerData));
      this.sellerpieData = [];
      this.chartSeries = [];
      this.daycattegory = [];
      var DataAmount: number[] = [];
      if (sellerData && sellerData.length > 0) {
        sellerData.forEach(element => {
          this.selectedValue.text = this.sellerCriteria;
          DataAmount.push(element.netAmount);
          var datePipe = new DatePipe('en-US');
          if (element.soldDate != null) {
            if (element.critearea == "Weekly" || element.critearea == "Daily") {
              var dateData = datePipe.transform(element.soldDate, 'dd MMM yyyy');
            } else {
              var dateData = datePipe.transform(element.soldDate, 'MMM yyyy');
            }

            this.chartSeries.push({ category: dateData, value: element.diamondCount });
          }
          this.sellerpieData.push({ category: element.companyName, value: element.netAmount.toFixed() });
        });

        var avg_total = DataAmount.reduce((acc, curr, _, { length }) => acc + curr / length, 0)
        this.total_AvgSales = avg_total ?? 0;
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error);
    }
  }


  private async getOrderData() {
    try {
      this.orderData = await this.dashboardService.getOrderAsync(this.tFCriteria, this.sellerId);
      window.localStorage.setItem("DashboardOrderData", JSON.stringify(this.orderData));
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error);
    }
  }

  private async getHoldData() {
    try {
      this.holdData = await this.dashboardService.getHoldData(this.tFCriteria, this.sellerId);
      window.localStorage.setItem("DashboardHoldData", JSON.stringify(this.holdData));
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error);
    }
  }

  public async getAppointment() {
    try {
      this.appointmentList = await this.dashboardService.getAdminAppointment(this.today, this.sellerId);
      window.localStorage.setItem("Appointment", JSON.stringify(this.appointmentList));
      window.localStorage.setItem("AppointmentCriteria", JSON.stringify(this.today));
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error);
    }
  }

  public async refreshData() {
    try {
      this.isBuyerFilterClick = false;
      this.isSellerFilterClick = false;
      this.isTFFilterClick = false;
      this.buyerPurchasePeriod = "Weekly";
      this.sellerPurchasePeriod = "Weekly";
      localStorage.removeItem("DashboardDailySummary");
      localStorage.removeItem("DashboardBuyerData");
      localStorage.removeItem("DashboardSellerData");
      localStorage.removeItem("DashboardOrderData");
      localStorage.removeItem("DashboardHoldData");
      localStorage.removeItem("Appointment");
      localStorage.removeItem("AppointmentCriteria");
      localStorage.removeItem("DashboardCustomerActiveData");
      await this.loadData();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error);
    }
  }

  public async exportToExcel(type: string, cusName : string) {

    if (this.mySelection.length == 0) {
      this.alertDialogService.show('Select at least one stone for export!');
      this.showExcelOption = false;
      return;
    }

    this.spinnerService.show();

    this.exportData = [];
    this.prapoCust = [];
    this.inventorySearchCriteriaObj.stoneIds = this.mySelection;
    this.inventorySearchCriteriaObj.status.push(StoneStatus.Stock, StoneStatus.Transit);
    if (this.inventorySearchCriteriaObj.stoneIds.length > 0) {
      await this.initInventoryData();
    }
    let selectedStoneIds = this.allInventoryItems.filter(z => this.mySelection).map(z => z.stoneId);
    this.exportData = await this.inventoryService.getInventoryByStoneIds(selectedStoneIds);

    if (this.exportData && this.exportData.length > 0) {
      if (type == "proposal") {
        await this.getSystemUserData();

        this.stoneProposalMail.stoneIds = this.mySelection.length > 0 ? this.allInventoryItems.filter(x=> this.mySelection.includes(x.stoneId)).map(z => z.stoneId) : this.allInventoryItems.map(z => z.stoneId)
        this.stoneProposalMail.aDiscount = this.aDiscount;
        var customerId= this.customerList.find(c => c.companyName == cusName)?.id ?? "";
        this.prapoCust.push({
          text : cusName,
          value : customerId, 
          isCheckedPro : true
        });
        this.showExcelOption = false;
        this.stoneProposalMail.subject = "Proposal for Diamonds: Tailored to Your Needs";
        await this.sendProposal();
      }
    
      this.spinnerService.hide();
    }
    else {
      this.alertDialogService.show('No Data Found!');
      this.spinnerService.hide();
    }
  }

  public async sendProposal() {
    try {
      this.praposalCust = [];
      this.prapoCust.forEach(item => {

        const customer = this.customerList.find(z => z.id == item.value);
        if (customer != undefined && customer != null) {

          let cust = new CustomerDNorm();
          cust.id = customer.id;
          cust.name = customer.fullName;
          cust.code = customer.code;
          cust.email = customer.email;
          cust.mobile = customer.mobile1;
          cust.companyName = customer.companyName;
          cust.city = customer.address.city;

          this.praposalCust.push(cust);
        }
      });

      if (this.filterStoneByCerID && this.filterStoneByCerID.length > 0) {
        let certificateIds: string[] = this.utilityService.CheckStoneIdsAndCertificateIds(this.filterStoneByCerID);
        if (certificateIds.length > 0) {
          if (this.excelOption == 'selected') {
            let stoneIds = this.exportData.filter(item => this.mySelection.includes(item.id) && !certificateIds.includes(item.certificateNo)).map(z => z.stoneId);
            this.stoneProposalMail.stoneIds = stoneIds;
          }
          else {
            this.stoneProposalMail.stoneIds = this.exportData.filter(item => !certificateIds.includes(item.certificateNo)).map(z => z.stoneId);
          }
        }
      }

      this.stoneProposalMail.customerDNorms = this.praposalCust;

      let proposalUrl = environment.proposalUrl;
      this.stoneProposalMail.proposalUrl = proposalUrl + 'proposal';

      let systemUserData = this.systemUserItems.find(z => z.id == this.fxCredentials?.id);
      if (systemUserData) {
        let systemUser = new SystemUserDNorm();
        systemUser.id = systemUserData.id;
        systemUser.name = systemUserData.fullName;
        systemUser.email = systemUserData.emailConfig.emailId;
        systemUser.mobile = systemUserData.mobile;
        systemUser.address = systemUserData.address;

        this.stoneProposalMail.systemUser = systemUser;
        this.stoneProposalMail.companyname = systemUserData.companyName;
      }
      else {
        this.alertDialogService.show("Your session Expired, Try login again!");
        return;
      }

      this.spinnerService.show();
      let res = await this.stoneProposalService.sendStoneProposal(this.stoneProposalMail);

      if (res && res.isSuccess) {
        this.proposalSuccMsg = res.message;
        this.mySelection = [];
        this.isProposalSuccess = true;
        this.aDiscount = null as any;
        this.stoneProposalMail = new StoneProposalMailData();
      }
      else {
        this.stoneProposalMail = new StoneProposalMailData();
        this.mySelection = [];
        if (res && res.message)
          this.alertDialogService.show(res.message);
        else
          this.alertDialogService.show("Mail not send, Kindly check your email config.");
      }
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.mySelection = [];
      this.stoneProposalMail = new StoneProposalMailData();
      this.alertDialogService.show("Mail not send, Kindly check your email config.");
      this.spinnerService.hide();
    }
  }

  public async getSystemUserData() {
    try {
      this.systemUserItems = await this.systemUserService.getAllSystemUsers();
      this.systemUserItems.forEach((z) => { this.listEmpItems.push({ text: z.fullName, value: z.id }); });
      this.allHoldBy = this.systemUserItems.map(z => z.fullName);
      this.systemUserItems.filter(z => z.origin.toLowerCase() == 'seller').forEach((z) => { this.listHoldByItems.push({ name: z.fullName, isChecked: false }); });
      this.utilityService.onMultiSelectChange(this.listHoldByItems, this.inventorySearchCriteriaObj.holdBy);
    }
    catch (error: any) {
      this.alertDialogService.show(error.error);
    }
  }

  copyText() {
    let selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = this.proposalSuccMsg;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
  }

  public closeProposalSuccess() {
    this.isProposalSuccess = false;
    this.proposalSuccMsg = '';
  }

  toggleClass(e: any) {
    if (e == this.secFullScreen)
      this.secFullScreen = 10;
    else
      this.secFullScreen = e;
  }

}
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CategoryAxis, ValueAxis } from '@progress/kendo-angular-charts';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { GridDataResult, PageChangeEvent } from '@progress/kendo-angular-grid';
import { DataResult, groupBy, GroupResult } from '@progress/kendo-data-query';
import { environment } from 'environments/environment';
import { NgxSpinnerService } from 'ngx-spinner';
import { fxCredential } from 'shared/enitites';
import { AppPreloadService, LeadStatus, OriginValue } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { LeadSearchCriteria, OrderDetailResponse } from '../../businessobjects';
import { SellerLeadAnalysis } from '../../businessobjects/analysis/sellerleadanalysis';
import { InvItem, SingularLead, SystemUser, SystemUserDNorm } from '../../entities';
import { LeadService, SystemUserService } from '../../services';
import { ExpomasterService } from '../../services/expomaster/expomaster.service';
import { ExpoMasterSearchCriteria } from '../../businessobjects/organizations/expomastersearchcriteria ';
import { ExpoMasterDNorm } from '../../entities/organization/dnorm/expomasterdnorm';
import { Expomaster } from '../../entities/organization/expomaster';

@Component({
  selector: 'app-leadanalysis',
  templateUrl: './leadanalysis.component.html',
  styleUrls: ['./leadanalysis.component.css']
})
export class LeadanalysisComponent implements OnInit {

  public isFilter: boolean = false;
  public isAnalysis: boolean = false;
  public leadAnalysisData: SellerLeadAnalysis[] = new Array<SellerLeadAnalysis>();
  public leadSearchCriteria: LeadSearchCriteria = new LeadSearchCriteria();
  public isAdminRole = false;
  public fxCredential!: fxCredential;
  public sellerObj = new SystemUserDNorm();
  public sellerDNormItems!: SystemUserDNorm[];
  public isLeadAnalysis: boolean = false;
  public pieColor: string[] = ["#7b7b7b", "#8f8f8f", "#999999", "#a3a3a3", "#c0c0c0", "#d4d4d4", "#e8e8e8", "#f2f2f2", "#d6d6d6", "#e0e0e0", "#eaeaea", "#f4f4f4"];
  public listSellerDNormItems: Array<{ text: string; value: string }> = [];
  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains',
  };
  //expo 
  public expomastersearchcriteria: ExpoMasterSearchCriteria = new ExpoMasterSearchCriteria();
  public listExpoMasterDNormItems: Array<{ text: string; value: string }> = [];
  public expoMasterDNormItems!: ExpoMasterDNorm[];
  public selectedExpoMasterDNormItem?: { text: string; value: string };
  public expoMaster: ExpoMasterDNorm = new ExpoMasterDNorm();
  //end expo
  public defaultStatus: string = "";
  public singularLeads: OrderDetailResponse[] = new Array<OrderDetailResponse>();
  public singularLeadsCopy: OrderDetailResponse[] = new Array<OrderDetailResponse>();
  public leads: SingularLead[] = new Array<SingularLead>();
  public leadCopy: SingularLead[] = new Array<SingularLead>();
  public listStatus: string[] = ["Proposal", "Rejected", "Order"];
  public skip: number = 0;
  public pageSize: number = 50;
  public gridView!: GridDataResult;
  public partyWiseList!: Array<{ partyName: string; amount: number }>;
  public autofit = true;
  public labelAlign: any = "column";
  public uniqueColors: string[] = new Array<string>();
  public uniqueClarities: string[] = new Array<string>();
  public ccGraphData: Array<{ color: string, clarity: string, stoneCount: number, disc: number, bdisc: number, amt: number, baseamt: number, weight: number, rapamt: number, avgDays: number, avgADays: number, barColor: string }> = new Array<{ color: string, clarity: string, stoneCount: number, disc: number, bdisc: number, amt: number, baseamt: number, weight: number, rapamt: number, avgDays: number, avgADays: number, barColor: string }>();
  public claritySort: string[] = ["FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2", "SI3", "I1", "I2", "I3"];
  public ccSeries!: GroupResult[];

  public detailPageSize = 10;
  public detailSkip = 0
  public leadDetail: InvItem[] = new Array<InvItem>();
  public gridDetailView!: DataResult;
  public mediaTitle!: string
  public mediaSrc!: string
  public mediaType!: string


  constructor(private leadService: LeadService,
    private alertDialogService: AlertdialogService,
    private spinnerService: NgxSpinnerService,
    public appPreloadService: AppPreloadService,
    private systemUserService: SystemUserService,
    private expoMasterService: ExpomasterService,
    public router: Router,) { }

  async ngOnInit() {
    await this.loadDefaultData();
    await this.getLeadAnalysisData();
  }


  public async loadDefaultData() {
    try {
      this.spinnerService.show();
      this.fxCredential = await this.appPreloadService.fetchFxCredentials();
      if (!this.fxCredential)
        this.router.navigate(["login"]);
      if (this.fxCredential?.origin == 'Admin')
        this.isAdminRole = true;
      else
        this.leadSearchCriteria.sellerId = this.fxCredential.id;

      this.sellerObj = await this.leadService.getSellerDNormById(this.fxCredential.id);
      this.loadExpoMasterDNorm();
      if (this.isAdminRole)
        await this.loadSellerDNorm();

    }
    catch (error: any) {
      this.alertDialogService.show(error);
      this.spinnerService.hide();
    }
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

  public async getLeadAnalysisData() {
    try {
      this.spinnerService.show();

      this.leadAnalysisData = await this.leadService.getLeadsBySellerWise(this.leadSearchCriteria);
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.alertDialogService.show(error);
      this.spinnerService.hide();
    }
  }

  public async openLeadAnalysisModal(defaultStatus: string, sellerName: string) {
    try {
      this.spinnerService.show();
      let filterCriteria: LeadSearchCriteria = new LeadSearchCriteria();
      filterCriteria.fromDate = this.leadSearchCriteria.fromDate;
      filterCriteria.toDate = this.leadSearchCriteria.toDate;
      filterCriteria.sellerId = sellerName;
      this.singularLeads = await this.leadService.getAllFilteredLeads(filterCriteria);
      this.singularLeadsCopy = JSON.parse(JSON.stringify(this.singularLeads));
      this.leads = JSON.parse(JSON.stringify(this.singularLeads.filter((elem, index, arr) => arr.findIndex(e => e.leadNo === elem.leadNo) === index)));
      this.defaultStatus = defaultStatus;
      if (defaultStatus != undefined && defaultStatus != "" && defaultStatus != "Created") {
        this.leadCopy = JSON.parse(JSON.stringify(this.leads.filter(c => c.leadStatus == defaultStatus)));
        this.singularLeadsCopy = JSON.parse(JSON.stringify(this.singularLeads.filter(c => c.leadStatus == defaultStatus)));
      }
      else {
        this.leadCopy = JSON.parse(JSON.stringify(this.leads));
        this.singularLeadsCopy = JSON.parse(JSON.stringify(this.singularLeads));
      }

      this.loadItems();
      this.loadGraphs();
      this.spinnerService.hide();
      this.isLeadAnalysis = true;
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error);
    }
  }

  public onLeadStatusChange(status: string) {
    if (status != undefined && status != "" && status != "Created") {
      this.leadCopy = JSON.parse(JSON.stringify(this.leads.filter(c => c.leadStatus == status)));
      this.singularLeadsCopy = JSON.parse(JSON.stringify(this.singularLeads.filter(c => c.leadStatus == status)));
    }
    else {
      this.leadCopy = JSON.parse(JSON.stringify(this.leads));
      this.singularLeadsCopy = JSON.parse(JSON.stringify(this.singularLeads));
    }

    this.skip = 0;
    this.loadItems();
    this.loadGraphs();
  }

  private loadItems(): void {
    this.gridView = {
      data: this.leadCopy.slice(this.skip, this.skip + this.pageSize),
      total: this.leadCopy.length,
    };
  }

  public dailySalesDates: Date[] = new Array<Date>();
  public dailySalesCategory: string[] = new Array<string>();
  public dailySalesData: number[] = new Array<number>();
  public categoryAxis: CategoryAxis = {
    max: new Date(2021, 1, 0),
    maxDivisions: 10,
  };

  public valueAxis: ValueAxis = {
    labels: {
      format: "N2",
    },
  };
  public dailySalesList: Array<{ value: number, category: Date }> = new Array<{ value: number, category: Date }>();

  public loadGraphs() {
    this.partyWiseList = new Array<{ partyName: string; amount: number }>();
    this.dailySalesList = new Array<{ value: number, category: Date }>();
    this.ccGraphData = new Array<{ color: string, clarity: string, stoneCount: number, disc: number, bdisc: number, amt: number, baseamt: number, weight: number, rapamt: number, avgDays: number, avgADays: number, barColor: string }>();
    this.uniqueColors = JSON.parse(JSON.stringify(this.singularLeadsCopy.filter((elem, index, arr) => arr.findIndex(e => e.leadInventoryItems.color === elem.leadInventoryItems.color) === index).map(v => v.leadInventoryItems.color)));
    this.uniqueClarities = JSON.parse(JSON.stringify(this.singularLeadsCopy.filter((elem, index, arr) => arr.findIndex(e => e.leadInventoryItems.clarity === elem.leadInventoryItems.clarity) === index).map(v => v.leadInventoryItems.clarity)));
    this.uniqueColors = this.uniqueColors.filter(function (el) { return el != ''; }).sort();
    this.uniqueClarities = this.uniqueClarities.filter(function (el) { return el != ''; });
    this.uniqueClarities.sort((a, b) => { return this.claritySort.indexOf(a) - this.claritySort.indexOf(b) });
    //for CC Graph
    for (let col = 0; col < this.uniqueColors.length; col++) {
      let color = this.uniqueColors[col];
      for (let cla = 0; cla < this.uniqueClarities.length; cla++) {
        let barColor = this.pieColor[cla];
        const clarity = this.uniqueClarities[cla];
        this.ccGraphData.push({ color: color, clarity: clarity, stoneCount: 0, disc: 0, bdisc: 0, amt: 0, baseamt: 0, weight: 0, rapamt: 0, avgDays: 0, avgADays: 0, barColor: barColor });
      }
    }

    //for daily sales graph
    this.categoryAxis = {
      max: (this.leadSearchCriteria.toDate != null) ? new Date(this.leadSearchCriteria.toDate) : new Date(),
      maxDivisions: 10,
    };
    this.dailySalesDates = this.getDates((this.leadSearchCriteria.fromDate != null) ? new Date(this.leadSearchCriteria.fromDate) : new Date(), (this.leadSearchCriteria.toDate != null) ? new Date(this.leadSearchCriteria.toDate) : new Date());
    for (let d = 0; d < this.dailySalesDates.length; d++) {
      const dt = this.dailySalesDates[d];
      this.dailySalesList.push({ value: 0, category: dt })
    }

    for (let i = 0; i < this.singularLeadsCopy.length; i++) {
      this.partyWiseList.findIndex(x => x.partyName == this.singularLeadsCopy[i].customer.companyName) == -1 ? this.partyWiseList.push({ partyName: this.singularLeadsCopy[i].customer.companyName, amount: this.singularLeadsCopy[i].leadInventoryItems.fAmount }) : this.partyWiseList[this.partyWiseList.findIndex(x => x.partyName == this.singularLeadsCopy[i].customer.companyName)].amount += this.singularLeadsCopy[i].leadInventoryItems.fAmount;

      let ccIndex = this.ccGraphData.findIndex(c => c.color == this.singularLeadsCopy[i].leadInventoryItems.color && c.clarity == this.singularLeadsCopy[i].leadInventoryItems.clarity)
      if (ccIndex != -1) {

        this.ccGraphData[ccIndex].stoneCount += 1;
        this.ccGraphData[ccIndex].weight += this.singularLeadsCopy[i].leadInventoryItems.weight;
        let baseDisc = this.singularLeadsCopy[i].basePrice.discount ?? 0;
        this.ccGraphData[ccIndex].baseamt += (this.singularLeadsCopy[i].price.rap ?? 0 + (this.singularLeadsCopy[i].price.rap ?? 0 * baseDisc / 100)) * this.singularLeadsCopy[i].leadInventoryItems.weight;

        if (this.singularLeadsCopy[i].leadStatus == LeadStatus.Order.toString() || this.singularLeadsCopy[i].leadStatus == LeadStatus.Rejected.toString())
          this.ccGraphData[ccIndex].amt += this.singularLeadsCopy[i].leadInventoryItems.fAmount;
        else
          this.ccGraphData[ccIndex].amt += this.singularLeadsCopy[i].price.netAmount ?? 0;

        this.ccGraphData[ccIndex].rapamt += this.singularLeadsCopy[i].price.rap ?? 0 * this.singularLeadsCopy[i].leadInventoryItems.weight;
        this.ccGraphData[ccIndex].avgDays += this.singularLeadsCopy[i].days;
        this.ccGraphData[ccIndex].avgADays += this.singularLeadsCopy[i].availableDays;



        this.dailySalesData = new Array<number>(this.dailySalesDates.length).fill(0);

        if ((this.singularLeadsCopy[i].leadStatus == LeadStatus.Order.toString() || this.singularLeadsCopy[i].leadStatus == LeadStatus.Rejected.toString()) && this.singularLeadsCopy[i].orderDate != null) {
          let compareDate = new Date(this.singularLeadsCopy[i].orderDate ?? new Date());
          let dateIndex = this.dailySalesDates.findIndex(c => (new Date(c).getDate() + "-" + new Date(c).getMonth()) == (compareDate.getDate() + "-" + compareDate.getMonth()));
          if (dateIndex != -1)
            this.dailySalesData[dateIndex] += this.singularLeadsCopy[i].leadInventoryItems.fAmount;


          this.dailySalesList.findIndex(c => (new Date(c.category).getDate() + "-" + new Date(c.category).getMonth()) == (compareDate.getDate() + "-" + compareDate.getMonth()));
          if (dateIndex != -1)
            this.dailySalesList[dateIndex].value += this.singularLeadsCopy[i].leadInventoryItems.fAmount;
        }
        else {
          let compareDate = new Date(this.singularLeadsCopy[i].createdDate);
          let dateIndex = this.dailySalesDates.findIndex(c => (new Date(c).getDate() + "-" + new Date(c).getMonth()) == (compareDate.getDate() + "-" + compareDate.getMonth()));
          if (dateIndex != -1)
            this.dailySalesData[dateIndex] += this.singularLeadsCopy[i].price.netAmount ?? 0

          this.dailySalesList.findIndex(c => (new Date(c.category).getDate() + "-" + new Date(c.category).getMonth()) == (compareDate.getDate() + "-" + compareDate.getMonth()));
          if (dateIndex != -1)
            this.dailySalesList[dateIndex].value += this.singularLeadsCopy[i].leadInventoryItems.fAmount;
        }
      }
    }

    for (let k = 0; k < this.ccGraphData.length; k++) {
      let cData = this.ccGraphData[k];
      cData.disc = Number((cData.amt / cData.rapamt * 100 - 100).toFixed(2));
      cData.bdisc = Number((cData.baseamt / cData.rapamt * 100 - 100).toFixed(2));
      cData.avgDays = Number((cData.avgDays / cData.stoneCount).toFixed(2));
      cData.avgADays = Number((cData.avgADays / cData.stoneCount).toFixed(2));
    }

    for (let d = 0; d < this.dailySalesDates.length; d++) {
      let dt = this.dailySalesDates[d] ?? new Date();
      this.dailySalesCategory.push(dt.getDate() + "-" + dt.getMonth());
    }

    this.partyWiseList.forEach(x => { x.amount = Number(x.amount.toFixed(2)); });
    this.dailySalesList.forEach(d => { d.value = Number(d.value.toFixed(2)); });
    this.ccSeries = groupBy(this.ccGraphData, [{ field: 'clarity' }]) as GroupResult[];
  }



  public getDates(startDate: Date, endDate: Date) {

    let dates: Date[] = []
    //to avoid modifying the original date
    const theDate = new Date(startDate)
    while (theDate <= endDate) {
      dates = [...dates, new Date(theDate)]
      theDate.setDate(theDate.getDate() + 1)
    }
    return dates;
  }

  public labelContent(e: any): string {
    return e.category;
  }

  public pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.loadItems();
  }

  public resetFilter() {
    this.leadSearchCriteria = new LeadSearchCriteria();
  }

  public openFilterDialog(): void {
    this.isFilter = true;
  }

  public closeFilterDialog(): void {
    this.isFilter = false;
  }

  public openLeadAnalysisDialog(): void {
    this.isLeadAnalysis = true;
  }

  public closeLeadAnalysisDialog(): void {
    this.isLeadAnalysis = false;
  }

  public openAnalysisDialog(): void {
    this.isAnalysis = true;
  }

  public closeAnalysisDialog(): void {
    this.isAnalysis = false;
  }

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


  public clearExpoMaster() {
    this.selectedExpoMasterDNormItem = undefined;
    // this.expomastersearchcriteria.sellerId = "";
  }
  // end expo

}

import { Component, ElementRef, OnInit, Renderer2, ViewChild, ViewEncapsulation } from '@angular/core';
import { NgForm } from '@angular/forms';
import { DataStateChangeEvent, PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { AggregateDescriptor, DataResult, GroupDescriptor, State } from '@progress/kendo-data-query';
import { NgxSpinnerService } from 'ngx-spinner';
import { MasterConfig, MasterDNorm } from 'shared/enitites';
import { UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { CartSearchCriteria, ExportToExcelMailData, InvDetailData, InvItem, LeadInvExport } from '../../businessobjects';
import { Lead } from '../../entities';
import { AppPreloadService, CustomerInvSearchService, EmailService, LeadService, MasterConfigService } from '../../services';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { CustomOrderData } from '../../businessobjects/businesses/customerorderData';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-myorder',
  templateUrl: './myorder.component.html',
  styleUrl: './myorder.component.css',
  encapsulation: ViewEncapsulation.None
})
export class MyorderComponent implements OnInit {
  @ViewChild('scrollpanel', { static: false }) public scrollpanel!: ElementRef;
  public filterFlag: boolean = false;
  public isSendMail: boolean = false;
  public ShapesList: MasterDNorm[] = [];
  public LabList: MasterDNorm[] = [];
  public ColorList: MasterDNorm[] = [];
  public ClarityList: MasterDNorm[] = [];
  public FluorList: MasterDNorm[] = [];
  public CPSList: MasterDNorm[] = [];
  public searchCriteria: CartSearchCriteria = new CartSearchCriteria();
  public masterConfigList!: MasterConfig;
  public allTheLab: Array<{ name: string; isChecked: boolean }> = [];
  public allTheShapes: Array<{ name: string; isChecked: boolean }> = [];
  public Status: Array<{ name: string; isChecked: boolean }> = [];
  public allColors: Array<{ name: string; isChecked: boolean }> = [];
  public allClarities: Array<{ name: string; isChecked: boolean }> = [];
  public allTheFluorescences: Array<{ name: string; isChecked: boolean }> = [];
  public allTheCPS: Array<{ name: string; isChecked: boolean }> = [];
  public allCuts: Array<{ name: string; isChecked: boolean }> = [];
  public allPolish: Array<{ name: string; isChecked: boolean }> = [];
  public allSymm: Array<{ name: string; isChecked: boolean }> = [];
  public filterShape: string = '';
  public filterShapeChk: boolean = true;
  public filterLab: string = '';
  public filterLabChk: boolean = true;
  public filterColor: string = '';
  public filterColorChk: boolean = true;
  public filterClarity: string = '';
  public filterClarityChk: boolean = true;
  public filterCut: string = '';
  public filterCutChk: boolean = true;
  public filterPolish: string = '';
  public filterPolishChk: boolean = true;
  public filterSymm: string = '';
  public filterSymmChk: boolean = true;
  public filterFlour: string = '';
  public filterFlourChk: boolean = true;
  public leads: Lead[] = new Array<Lead>();
  public gridView!: DataResult;
  public gridDetailView!: DataResult[];
  public mySelection: string[] = new Array<string>();
  public leadStatusList: Array<{ name: string; isChecked: boolean }> = [];
  public selectedLead: CustomOrderData = new CustomOrderData();
  public exportToExcelMailObj: ExportToExcelMailData = new ExportToExcelMailData();
  public excelFile: any[] = [];
  public OrderLeadStatus = {
    Order: "Order",
    Delivered: "Delivered",
  }
  public selected_order: boolean = false;
  public pageSize: number = 20;
  public skip: number = 0;
  public count: number = 0;
  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains',
  };
  public selectableSettings: SelectableSettings = { mode: 'multiple', };
  public customLeadInventoryItems: InvItem = new InvItem();
  public aggregates: AggregateDescriptor[] = [
    { field: 'totalPcs', aggregate: 'count' },
    { field: 'weight', aggregate: 'sum' },
    { field: 'netAmount', aggregate: 'sum' },
    { field: 'totalVOWDiscAmount', aggregate: 'sum' },
    { field: 'totalVowDiscper', aggregate: 'sum' },
    { field: 'totalPayableAmount', aggregate: 'sum' },
    { field: 'avgDiscPer', aggregate: 'sum' },
    { field: 'avgRap', aggregate: 'sum' },
  ];
  public groups: GroupDescriptor[] = [];
  public customOrderData: CustomOrderData[] = [];
  public state: State = {};
  public loading = false;
  public groupCustomer!: { value: string; customerData: any; }[];

  constructor(
    public utilityService: UtilityService,
    private emailService: EmailService,
    private masterConfigService: MasterConfigService,
    private appPreloadService: AppPreloadService,
    private leadService: LeadService,
    private spinnerService: NgxSpinnerService,
    private alertDialogService: AlertdialogService,
    private renderer: Renderer2,
    private customerInvSearchService: CustomerInvSearchService,
  ) { }


  async ngOnInit() {
    this.spinnerService.show();
    let credential = await this.appPreloadService.fetchFxCredentials("");
    this.searchCriteria.customerId = credential.id;

    await this.loadMasterData();
    await this.loadLeadData();

  }


  public onScrollLoadData() {
    const scrollTop = this.scrollpanel.nativeElement.scrollTop;
    const scrollHeight = this.scrollpanel.nativeElement.scrollHeight;
    const clientHeight = this.scrollpanel.nativeElement.clientHeight;
    if (scrollTop + clientHeight >= scrollHeight - 50) {
      this.loading = true;
      if (this.searchCriteria) {
        this.skip += this.pageSize;
      }
      this.loadLeadData();
      this.loading = false;
    }
  }

  public async loadMasterData() {
    try {
      this.masterConfigList = await this.masterConfigService.getAllMasterConfig();
      this.ShapesList = this.masterConfigList.shape;
      let allTheShapes = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.shape);
      allTheShapes.forEach(z => { this.allTheShapes.push({ name: z.displayName, isChecked: false }); });

      this.ColorList = this.masterConfigList.colors;
      let allColors = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.colors);
      allColors.forEach(z => { this.allColors.push({ name: z.name, isChecked: false }); });

      this.ClarityList = this.masterConfigList.clarities;
      let allClarities = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.clarities);
      allClarities.forEach(z => { this.allClarities.push({ name: z.name, isChecked: false }); });

      this.FluorList = this.masterConfigList.fluorescence;
      let allTheFluorescences = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.fluorescence);
      allTheFluorescences.forEach(z => { this.allTheFluorescences.push({ name: z.name, isChecked: false }); });

      this.CPSList = this.masterConfigList.cps;
      let allTheCPS = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.cps);
      allTheCPS.forEach(z => { this.allTheCPS.push({ name: z.name, isChecked: false }); });

      let allCuts = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.cps);
      allCuts.forEach(z => { this.allCuts.push({ name: z.name, isChecked: false }); });

      let allPolish = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.cps);
      allPolish.forEach(z => { this.allPolish.push({ name: z.name, isChecked: false }); });

      let allSymm = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.cps);
      allSymm.forEach(z => { this.allSymm.push({ name: z.name, isChecked: false }); });

      this.LabList = this.masterConfigList.lab;
      let allTheLab = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.lab);
      allTheLab.forEach(z => { this.allTheLab.push({ name: z.name, isChecked: false }); });
      this.preLoadLeadStatusFilter();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async loadLeadData() {
    try {
      this.spinnerService.show();
      let fData = this.searchCriteria.fromDate;
      this.searchCriteria.fromDate = fData ? this.utilityService.setUTCDateFilter(fData) : null;
      let tData = this.searchCriteria.toDate;
      this.searchCriteria.toDate = tData ? this.utilityService.setUTCDateFilter(tData) : null;

      let searchCriteria: CartSearchCriteria = JSON.parse(JSON.stringify(this.searchCriteria));
      searchCriteria.shapes = [];
      this.searchCriteria.shapes.forEach(z => {
        if (this.masterConfigList.shape) {
          var obj = this.masterConfigList.shape.find(c => c.name.toLowerCase() == z.toLowerCase() || c.displayName.toLowerCase() == z.toLowerCase() || c.optionalWords && c.optionalWords.map(u => u.toLowerCase().trim()).includes(z.toLowerCase()));
          if (obj) {
            searchCriteria.shapes.push(obj.name);
          }
        }
      });

      this.count = await this.leadService.getCountForCustomerAsync(this.searchCriteria.customerId);
      this.leads = await this.leadService.getLeadsForCustomerAsync(searchCriteria, this.skip, this.pageSize);
      if (this.leads && this.leads.length > 0) {
        this.leads.forEach(a => {

          a.leadInventoryItems.forEach(z => {
            if (z.shape.toLowerCase() != 'rbc' && z.shape.toLowerCase() != 'round')
              z.cut = '';

            if (this.masterConfigList.shape) {
              var obj = this.masterConfigList.shape.find(c => c.name.toLowerCase() == z.shape.toLowerCase() || c.displayName.toLowerCase() == z.shape.toLowerCase() || c.optionalWords && c.optionalWords.map(u => u.toLowerCase().trim()).includes(z.shape.toLowerCase()));
              if (obj)
                z.shape = obj.displayName;
            }
          });
          a.leadSummary.avgDiscPer = this.utilityService.ConvertToFloatWithDecimal(a.leadSummary.avgDiscPer);
          a.leadSummary.totalAmount = this.utilityService.ConvertToFloatWithDecimal(a.leadSummary.totalAmount);
          a.leadSummary.totalVOWDiscAmount = this.utilityService.ConvertToFloatWithDecimal(a.leadSummary.totalVOWDiscAmount);
          a.leadSummary.totalPayableAmount = this.utilityService.ConvertToFloatWithDecimal((a.leadSummary.totalPayableAmount ?? 0));

          for (let index = 0; index < a.leadInventoryItems.length; index++) {
            this.customOrderData.push({
              leadId: a.id,
              invId: a.leadInventoryItems[index].invId,
              orderNo: a.leadNo,
              totalPcs: a.leadSummary.totalPcs,
              totalCarat: a.leadSummary.totalCarat,
              avgDiscPer: a.leadSummary.avgDiscPer,
              totalAmount: a.leadSummary.totalAmount,
              totalVowDiscper: a.leadSummary.totalVOWDiscPer,
              totalVOWDiscAmount: a.leadSummary.totalVOWDiscAmount,
              totalPayableAmount: a.leadSummary.totalPayableAmount,
              pickupLocation: a.pickupLocation,
              location: a.leadInventoryItems[index].location,
              stoneid: a.leadInventoryItems[index].stoneId,
              certifcateNo: a.leadInventoryItems[index].certificateNo,
              shape: a.leadInventoryItems[index].shape,
              weight: a.leadInventoryItems[index].weight,
              color: a.leadInventoryItems[index].color,
              clarity: a.leadInventoryItems[index].clarity,
              cut: a.leadInventoryItems[index].cut,
              polish: a.leadInventoryItems[index].polish,
              symmetry: a.leadInventoryItems[index].symmetry,
              flurescence: a.leadInventoryItems[index].fluorescence,
              rap: a.leadInventoryItems[index].price.rap,
              discount: a.leadInventoryItems[index].price.discount,
              vowDiscount: a.leadInventoryItems[index].vowDiscount,
              netAmount: a.leadInventoryItems[index].price.netAmount,
              perCarat: a.leadInventoryItems[index].perCarat,
              status: a.leadInventoryItems[index].status,
              leadstatus: a.leadStatus,
              deliveredDate: a.leadInventoryItems[index].deliveredDate,
              orderDate: a.orderDate,
              avgRap: a.leadSummary.avgRap,
              platform: a.platform
            })
          }
        });

        const group = this.customOrderData.reduce((acc: any, curr) => {
          let key = curr.orderNo;
          if (!acc[key]) {
            acc[key] = [];
          }
          acc[key].push(curr);
          return acc;
        }, {});

        this.groupCustomer = Object.keys(group).map(key => ({
          value: key,
          customerData: group[key]
        }));

        this.groupCustomer.sort((a, b) => (a.value >b.value ? -1 : 1));
      }
      this.loading = false;
      this.spinnerService.hide();
    } catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Order data not load, Try again later');
    }
  }

  public getTotalpcs(item: any, data: any) {
    if (data == 'totalPcs') {
      return item.length;
    } else if (data == 'weight') {
      return item.reduce((acc: any, curr: any) => acc + curr.weight, 0).toFixed(2);
    } else if (data == 'AvgD') {
      let avgDiscPerCt = 0;
      item.forEach((e: any) => {
        avgDiscPerCt = e.avgDiscPer;
      });
      return avgDiscPerCt;
    } else if (data == 'AvgC') {
      let avgrap = 0;
      item.forEach((e: any) => {
        avgrap = e.avgRap.toFixed(2);
      });
      return avgrap;
    }
    else if (data == 'tAmt') {
      return item.reduce((acc: any, curr: any) => acc + curr.netAmount, 0).toFixed(2);
    }
    else if (data == 'TVD') {
      let vowDiscount = 0;
      item.forEach((e: any) => {
        vowDiscount = e.totalVowDiscper;
      });
      return vowDiscount;
    } else if (data == 'TVA') {
      var vowAmt = 0;
      item.forEach((e: any) => {
        vowAmt = e.totalVOWDiscAmount;
      });
      return vowAmt;
    } else if (data == 'PaybaleAmt') {
      var PayableAmount = 0;
      item.forEach((e: any) => {
        PayableAmount = e.totalPayableAmount;
      });
      return PayableAmount;
    } else
      return;
  }

  public getAvgDiscPerCt(orderNo: number) {
    var avgDiscPerCt = this.customOrderData.filter(c => c.orderNo == orderNo)[0].avgDiscPer;
    return avgDiscPerCt;
  }

  public getavgRap(orderNo: number) {
    var avgrap = this.customOrderData.filter(c => c.orderNo == orderNo)[0].avgRap.toFixed(2);
    return avgrap;
  }

  public getVoowAmt(orderNo: number) {
    var vowAmt = this.customOrderData.filter(c => c.orderNo == orderNo)[0].totalVOWDiscAmount;
    return vowAmt;
  }

  public getVOWDiscount(orderNo: number) {
    var vowDiscount = this.customOrderData.filter(c => c.orderNo == orderNo)[0].totalVowDiscper;
    return vowDiscount;
  }

  public getFinalPayableAmt(orderNo: number) {
    var PayableAmount = this.customOrderData.filter(c => c.orderNo == orderNo)[0].totalPayableAmount;
    return PayableAmount;
  }

  private handleGridGrouping() {
    if (!this.state.group || this.state.group.length <= 1) {
      this.state.skip = this.skip;
      this.state.take = this.pageSize;
      this.state.group = [{ field: "orderNo", aggregates: this.aggregates, dir: 'desc' }];
    }
  }


  public onScroll(event: any): void {
    const scrollTop = event.sender.ariaRoot.nativeElement.scrollTop;
    const scrollHeight = event.sender.ariaRoot.nativeElement.scrollHeight;
    const clientHeight = event.sender.ariaRoot.nativeElement.clientHeight;
    if (scrollTop + clientHeight >= scrollHeight) {
      this.loading = true;
      if (this.searchCriteria)
        this.skip = this.pageSize + this.skip;
      this.loadLeadData();
      this.loading = false;
    }
  }

  public dataStateChange(state: DataStateChangeEvent): void {
    if (state && state.group)
      state.group.map(group => group.aggregates = this.aggregates);
    this.state = state;
  }

  public pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.loadLeadData();
  }

  public selectedRowChange(event: any) {
    if (event.selectedRows != null && event.selectedRows.length > 0) {
      this.selectedLead = event.selectedRows[0].dataItem
      this.selectedLead?this.selected_order:""
    }
    else {
      event.deselectedRows.forEach((element: any) => {
        if (!element.dataItem.isDisabled) {
          this.selectedLead = new CustomOrderData();
        }
      });
    }
  }

  public async sendMail(form: NgForm) {
    try {
      if (!form.valid)
        return;

      let isEmailValid = this.checkValidEmail(this.exportToExcelMailObj.toEmail);
      if (!isEmailValid) {
        this.alertDialogService.show('Not valid email address in Mail To');
        return;
      }

      let isCCValid = this.checkValidEmail(this.exportToExcelMailObj.cC);
      if (!isCCValid) {
        this.alertDialogService.show('Not valid email address in CC');
        return;
      }

      let isBccValid = this.checkValidEmail(this.exportToExcelMailObj.bcc);
      if (!isBccValid) {
        this.alertDialogService.show('Not valid email address in Bcc');
        return;
      }
      
      if (this.mySelection.length === 0) {
        this.spinnerService.hide();
        this.alertDialogService.show('No selected stone(s) found!');
        return;
      }

      this.spinnerService.show();
      let data = await this.customerInvSearchService.getInvDetailByStoneIdsAsync(this.mySelection);

      let fileName = "Diamond_Excel";
      this.generateExcelData(data);
      this.exportToExcelMailObj.systemUserId = this.searchCriteria.customerId ?? '';
      this.exportToExcelMailObj.excelBase64String = this.utilityService.exportAsExcelFileBase64(this.excelFile);;
      this.exportToExcelMailObj.excelFileName = this.utilityService.exportFileName(fileName);
      this.exportToExcelMailObj.excelMediaType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      this.exportToExcelMailObj.companyName = this.utilityService.getCompanyNameFromUrl(window.location.href);

      let res = await this.emailService.sendEmailAsync(this.exportToExcelMailObj);
      if (res && res.isSuccess) {
        this.utilityService.showNotification(res.message);
        this.closeSendMailDialog();
      }
      else {
        console.error(res);
        if (res) {
          this.alertDialogService.show(res.message);
        }
        else
          this.alertDialogService.show("Something went wrong, Try again later");
      }
      this.spinnerService.hide();
    }
    catch (error: any) {
      console.error(error);
      this.alertDialogService.show("Something went wrong, Try again later");
      this.spinnerService.hide();
    }
  }

  private async generateExcelData(data: InvDetailData[]) {
    this.excelFile = [];
    let i = 0;
    var totalWeight = 0;
    var totalNetAmount = 0;
    data.forEach(z => {
      totalWeight += z.weight;
      totalNetAmount += (z.price.netAmount ? z.price.netAmount : 0);

      var excel = {
        CertificateUrl: z.media.isCertificate ? environment.certiURL.replace('{certiNo}', z.certificateNo) : '',
        ImageUrl: z.media.isPrimaryImage ? environment.imageURL.replace('{stoneId}', z.stoneId) : '',
        VideoUrl: z.media.isHtmlVideo ? environment.videoURL.replace('{stoneId}', z.stoneId) : '',
        'Stock Id': z.stoneId,
        'Certificate No': z.certificateNo,
        'Shape': z.shape,
        Size: z.weight,
        Color: z.color,
        Clarity: z.clarity,
        Cut: z.cut,
        Polish: z.polish,
        Symmetry: z.symmetry,
        Flouresence: z.fluorescence,
        Length: z.measurement.length,
        Width: z.measurement.width,
        Height: z.measurement.height,
        Depth: z.measurement.depth,
        Table: z.measurement.table,
        Lab: z.lab,
        Rap: z.price.rap,
        'Disc%': z.price.discount + "%",
        '$/Ct': z.price.perCarat,
        'Net Amount': z.price.netAmount,
        Location: z.location
      }
      this.excelFile.push(excel);

      i++;
    });

    let obj: any = {
      CertificateUrl: '',
      ImageUrl: '',
      VideoUrl: '',
      'Stock Id': '',
      'Certificate No': '',
      'Shape': '',
      Size: totalWeight,
      Color: '',
      Clarity: '',
      Cut: '',
      Polish: '',
      Symmetry: '',
      Flouresence: '',
      Length: '',
      Width: '',
      Height: '',
      Depth: '',
      Table: '',
      Lab: '',
      Rap: '',
      'Disc%': '',
      '$/Ct': '',
      'Net Amount': "$" + totalNetAmount.toFixed(2),
      Location: ''
    }
    this.excelFile.push(obj);
  }

  public checkValidEmail(email: string): boolean {
    let flag = true;
    if (email && email.length > 0) {
      let emailArray = email.split(",");
      if (emailArray && emailArray.length > 0) {
        emailArray.forEach(z => {
          if (flag)
            flag = this.validateEmail(z.trim());
        });
      }
    }
    return flag;
  }

  public validateEmail(email: string): boolean {
    let regexp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    return regexp.test(email);
  }

  public async searchData() {
    try {
      this.spinnerService.show();
      this.customOrderData = [];
      this.skip = 0;
      await this.loadLeadData();
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async clearSearch() {
    try {
      this.spinnerService.show();
      let customerId = this.searchCriteria.customerId;
      this.searchCriteria = new CartSearchCriteria();
      this.searchCriteria.customerId = customerId;
      this.allTheShapes.forEach(c => c.isChecked = false);
      this.leadStatusList.forEach(c => c.isChecked = false);
      this.allColors.forEach(c => c.isChecked = false);
      this.allClarities.forEach(c => c.isChecked = false);
      this.allTheCPS.forEach(c => c.isChecked = false);
      this.allTheFluorescences.forEach(c => c.isChecked = false);
      this.allTheLab.forEach(c => c.isChecked = false);
      this.customOrderData = [];

      await this.loadLeadData();
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public preLoadLeadStatusFilter() {
    Object.values(this.OrderLeadStatus).filter(x => x != this.OrderLeadStatus.toString()).forEach(z => { this.leadStatusList.push({ name: z.toString(), isChecked: false }); });
    this.utilityService.onMultiSelectChange(this.leadStatusList, this.searchCriteria.leadStatus);
  }

  public filterSidebar() {
    this.filterFlag = !this.filterFlag;
  }

  public openSendMailDialog(): void {
    this.isSendMail = true;
    this.isBodyScrollHidden(true);
  }

  public closeSendMailDialog(): void {
    this.isSendMail = false;
    this.clearSendMail();
    this.isBodyScrollHidden(false);
  }
  public clearSendMail(): void {
    this.exportToExcelMailObj = new ExportToExcelMailData();
  }

  public async downLoadExcelFile() {
    try {

      this.spinnerService.show();

      let response = await this.leadService.downloadLeadInvItemsByInvIdExcel(this.searchCriteria.customerId, this.mySelection);
      if (response) {
        var downloadURL = window.URL.createObjectURL(response);
        var link = document.createElement('a');
        link.href = downloadURL;
        link.download = `${this.utilityService.exportFileName(this.selectedLead.orderNo.toString())}`;
        link.click();
      }

      this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async downloadAttachment() {
    try {
      this.spinnerService.show();
      await this.exportExcelNew(this.selectedLead.leadId, this.selectedLead.orderNo, [this.selectedLead.invId])
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async exportExcelNew(leadId: string, leadnNo: number, invIds: Array<string>) {
    try {
      let response = await this.leadService.downloadLeadInvItemsByInvIdExcel(this.searchCriteria.customerId, this.mySelection);
      if (response) {
        var downloadURL = window.URL.createObjectURL(response);
        var link = document.createElement('a');
        link.href = downloadURL;
        link.download = `${this.utilityService.exportFileName("Order")}`;
        link.click();
      }
    } catch (error: any) {
      this.alertDialogService.show("something went wrong in export Excel, please try again or contact administrator");
      this.spinnerService.hide();
    }
  }

  public onPanelChange(event: any): void { }

  public isBodyScrollHidden(isScrollHide: boolean) {
    const action = isScrollHide ? 'addClass' : 'removeClass'
    this.renderer[action](document.body, 'hiddenScroll');
  }
}
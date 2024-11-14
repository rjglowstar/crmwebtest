import { Component, OnInit } from '@angular/core';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { PageChangeEvent } from '@progress/kendo-angular-dropdowns/common/models/page-change-event';
import { SelectableSettings } from '@progress/kendo-angular-treeview';
import { DataResult, GroupDescriptor, SortDescriptor, process } from '@progress/kendo-data-query';
import { NgxSpinnerService } from 'ngx-spinner';
import { SortFieldDescriptor } from 'projects/CRM.BackOffice/src/app/businessobjects';
import { GridDetailConfig } from 'shared/businessobjects';
import { AlertdialogService } from 'shared/views';
import { fxCredential, GridConfig, GridMasterConfig } from 'shared/enitites';
import { ConfigService, UtilityService } from 'shared/services';
import { GridPropertiesService, MailService, SystemUserService } from '../../services';
import { BidingSummaryService } from '../../services/biding/bidingSummary.service';
import { BidSearchFilter } from '../../businessobjects/biding/bidSearchFilter';
import { BidingSummary } from '../../entities/biding/bidingSummary';
import { BidingResultDropDownData } from '../../businessobjects/biding/bidingResultDropdownData';
import * as moment from 'moment-timezone';
import { BidingItemService } from '../../services/biding/bidingItem.service';
import { ExportToExcelMailData } from '../../businessobjects';
import { environment } from 'environments/environment.prod';
import { BidingItems } from '../../entities/biding/bidingItems';

@Component({
  selector: 'app-bidingresult',
  templateUrl: './bidingResult.component.html',
  styleUrls: ['./bidingResult.component.css']
})
export class BidingResultComponent implements OnInit {

  //#region Grid Init
  public sort: SortDescriptor[] = [];
  public groups: GroupDescriptor[] = [];
  public pageSize = 26;
  public skip = 0;
  public fields!: GridDetailConfig[];
  public gridView?: DataResult;
  public gridConfig!: GridConfig;
  public isGridConfig: boolean = false;
  public isActiveBid: boolean = false;
  public isFilterBidingResult: boolean = false;
  public gridMasterConfigResponse!: GridMasterConfig;
  public selectableSettings: SelectableSettings = {
    mode: 'single',
  };
  public mySelection: string[] = [];
  public sortFieldDescriptors!: SortFieldDescriptor[];
  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains',
  };
  //#endregion

  //#region Biding Data
  private fxCredentials!: fxCredential;
  public bidingResultDropDownData: BidingResultDropDownData[] = new Array<BidingResultDropDownData>();
  public bidingSummary: BidingSummary = new BidingSummary();
  public bidSearchFilter: BidSearchFilter = new BidSearchFilter();
  public bidStartDate!: string;
  public bidEndDate!: string;
  public excelFile: any[] = [];
  //#endregion Biding Data

  constructor(
    private alertDialogService: AlertdialogService,
    private spinnerService: NgxSpinnerService,
    private bidingSummaryService: BidingSummaryService,
    private gridPropertiesService: GridPropertiesService,
    private configService: ConfigService,
    private bidingItemService: BidingItemService,
    public utilityService: UtilityService,
    private systemUserService: SystemUserService,
    private mailService: MailService,) { }

  async ngOnInit() {
    await this.defaultMethodsLoad();
  }

  //#region DefaultMethods
  async defaultMethodsLoad() {
    try {
      this.fxCredentials = JSON.parse(sessionStorage.getItem("fxCredentials") ?? '') as fxCredential;
      this.getGridConfiguration();
      await this.loadBidDropDownData();
      await this.initBidInventoryData();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async loadBidDropDownData() {
    try {
      this.spinnerService.show();
      this.bidingResultDropDownData = await this.bidingSummaryService.getBidingNumbers();
      this.bidSearchFilter.bidNumber = this.bidingResultDropDownData[0]?.bidNumber;
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async initBidInventoryData() {
    try {
      this.spinnerService.show();
      if (this.bidSearchFilter?.bidNumber) {
        this.gridView = process([], { group: this.groups, sort: this.sort });
        let res = await this.bidingSummaryService.getBidByBidNumber(this.bidSearchFilter.bidNumber);
        if (res) {
          this.bidingSummary = res;
          const { invDetailItems, bidTimer, isActiveBid } = res;
          this.isActiveBid = isActiveBid;

          let dataToProcess = invDetailItems;

          // Filtering logic
          if (this.isFilterBidingResult) {
            const bidingItems = await this.bidingItemService.getBidItemsByNumber(this.bidSearchFilter.bidNumber);
            const uniqueStoneIds = [...new Set(bidingItems.map(s => s.stoneId))];
            dataToProcess = invDetailItems.filter(item => uniqueStoneIds.includes(item.stoneId));
          }

          this.gridView = process(dataToProcess, { group: this.groups, sort: this.sort, skip: this.skip, take: this.pageSize });
          this.gridView.total = dataToProcess.length;

          if (bidTimer) {
            this.bidStartDate = this.formatDate(bidTimer.bidStart);
            this.bidEndDate = this.formatDate(bidTimer.bidEnd);
          }
        }
      }
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public formatDate(dateString: Date): string {
    return moment(dateString)
      .tz('Asia/Kolkata')
      .format('MMM D YYYY, h:mm A');
  }

  isCurrentDateWithinRange(): boolean {
    const currentDate = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
    const currentDateIST = new Date(currentDate);

    const start = new Date(this.bidStartDate);
    const end = new Date(this.bidEndDate);

    return currentDateIST >= start && currentDateIST <= end;
  }

  public async sendBidApprovalMail() {
    try {
      this.spinnerService.show();

      if (this.bidingSummary.bidNumber != null && this.bidingSummary.isActiveBid) {
        let bidresultItems = await this.bidingItemService.getBidItemsByNumber(this.bidingSummary?.bidNumber);

        let unapprovedStoneIds = await this.findUnapprovedStoneIds(bidresultItems);
        if (unapprovedStoneIds.length > 0) {
          this.spinnerService.hide();
          this.alertDialogService.show(`Please approve the following stoneIds <b>${unapprovedStoneIds.join(', ')}</b> before sending the approval email.`);
          return;
        }

        const approvedBidingItems = await this.bidingItemService.getAllApprovedBiddingItems(this.bidingSummary?.bidNumber);
        if (approvedBidingItems.length === 0) {
          this.spinnerService.hide();
          this.alertDialogService.show("There is no approved stones data found!");
          return;
        }

        // Group approved bidding items by customer
        const groupedItems = approvedBidingItems.reduce((acc, item) => {
          const customerId = item.customer.id;
          if (!acc.has(customerId)) {
            acc.set(customerId, { customer: item.customer, stoneIds: [] });
          }
          acc.get(customerId).stoneIds.push({ stoneId: item.stoneId, discount: item.discount });
          return acc;
        }, new Map());

        const result = Array.from(groupedItems.values());

        if (result.length > 0) {
          let cIds = result.map(r => r.customer.id);
          let informationalMailIds = [...new Set(bidresultItems.filter(r => !cIds.includes(r.customer.id)).map(r => r.customer.id))];

          const emailPromises = await Promise.all(result.map(async (element) => {
            const exportToExcelMailObj: ExportToExcelMailData = new ExportToExcelMailData();

            const stoneIdDiscountMap = new Map(element.stoneIds.map((item: any) => [item.stoneId, item.discount]));
            const invDetailItems = this.bidingSummary.invDetailItems
              .filter(res => stoneIdDiscountMap.has(res?.stoneId))
              .map(res => ({
                ...res,
                bidingDisc: stoneIdDiscountMap.get(res.stoneId) || null
              }));

            const uniqueExcelFile = await this.generateExcelData(invDetailItems);

            const fileName = "Approved_Bid_Excel";
            exportToExcelMailObj.systemUserId = element.customer?.id ?? '';
            exportToExcelMailObj.excelBase64String = this.utilityService.exportAsExcelFileBase64(uniqueExcelFile);
            exportToExcelMailObj.excelFileName = this.utilityService.exportFileName(fileName) + '.xlsx';
            exportToExcelMailObj.excelMediaType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            exportToExcelMailObj.stoneCount = invDetailItems.length.toString();
            //   // exportToExcelMailObj.companyName = this.utilityService.getCompanyNameFromUrl(window.location.href);
            exportToExcelMailObj.companyName = "Glowstar";

            return exportToExcelMailObj;
          }));

          // Send the bid approval emails
          const res = await this.mailService.SendBidApprovalMail(emailPromises);
          if (res && res.isSuccess) {
            if (informationalMailIds.length > 0) {
              await this.mailService.SendBidInformationalMail(informationalMailIds);
            }
            this.utilityService.showNotification('Bid approval mail sent successfully!');
          } else {
            this.handleMailError(res);
          }
        }
      }
      this.spinnerService.hide();
    } catch (error: any) {
      console.error(error);
      this.alertDialogService.show("Something went wrong, Try again later");
      this.spinnerService.hide();
    }
  }

  public async findUnapprovedStoneIds(items: BidingItems[]): Promise<string[]> {
    let unSoldStoneIds = this.bidingSummary.invDetailItems.filter(r => r.isKeepUnsold).map(s => s.stoneId);

    if (!items || items.length === 0) {
      return [];
    }

    const groupedByStoneId: { [stoneId: string]: BidingItems[] } = items.reduce(
      (acc, item) => {
        if (!acc[item.stoneId]) {
          acc[item.stoneId] = [];
        }
        acc[item.stoneId].push(item);
        return acc;
      },
      {} as { [stoneId: string]: BidingItems[] }
    );

    const unapprovedStoneIds = Object.keys(groupedByStoneId).filter(stoneId => {
      const stoneRecords = groupedByStoneId[stoneId];
      return stoneRecords.every(record => !record.isApproved);
    });

    const filteredUnapprovedStoneIds = unapprovedStoneIds.filter(stoneId => !unSoldStoneIds.includes(stoneId));

    return filteredUnapprovedStoneIds;
  }

  private handleMailError(res: any) {
    if (res.errorMessage) {
      console.error(res.errorMessage);
    }
    if (res.message) {
      this.alertDialogService.show(res.message);
    } else {
      this.alertDialogService.show('Bid approval mail not sent to customer, Please contact administrator!');
    }
  }

  private async generateExcelData(data: any[]) {
    this.excelFile = [];

    data.forEach(z => {
      let netAmount = 0;
      let bidPerCarat = 0;

      if (z.bidingDisc) {
        var offerDisc = parseFloat(z.bidingDisc?.toString() || "0");
        let weight = z?.weight;
        let stoneRap = weight * (z.price?.rap ?? 0);
        let calDiscount = 100 + offerDisc;
        netAmount = (calDiscount * stoneRap) / 100;
        bidPerCarat = netAmount / weight;
      }
      var excel = {
        'Location': z.location,
        'StoneId': z.stoneId,
        'ImageUrl': z.media.isPrimaryImage
          ? { f: '=HYPERLINK("' + environment.imageURL.replace('{stoneId}', z.stoneId.toLowerCase()) + '", "Image")' }
          : '',
        'videoUrl': z.media.isHtmlVideo
          ? { f: '=HYPERLINK("' + environment.videoURL.replace('{stoneId}', z.stoneId.toLowerCase()) + '", "Video")' }
          : '',
        'Shape': z.shape,
        'Weight': z.weight,
        'Color': z.color,
        'Clarity': z.clarity,
        'Cut': z.cut,
        'Polish': z.polish,
        'Symmetry': z.symmetry,
        'Fluorescence': z.fluorescence,
        'Lab': z.lab,
        'CertificateNo': z.certificateNo,
        'Rap': z.price.rap,
        'Bid Pr/Ct': bidPerCarat,
        'Bid Amt$': netAmount,
        'Cur. Bid Disc%': z.curBidDisc,
        'Bid Disc%': z.bidingDisc,
        'Measurement': z.measurement?.length + '*' + z.measurement?.width + '*' + z.measurement?.height,
        'Depth': z.measurement.depth,
        'Height': z.measurement.height,
        'Table': z.measurement.table,
        'C. Height': z.measurement.crownHeight,
        'C. Angle': z.measurement.crownAngle,
        'P. Depth': z.measurement.pavilionDepth,
        'P. Angle': z.measurement.pavilionAngle,
        'Ratio': z.measurement.ratio,
        'Gridle': z.measurement.minGirdle && z.measurement.maxGirdle ? (z.measurement.minGirdle + ' - ' + z.measurement.maxGirdle) : '',
        'Brown': z.inclusion.brown,
        'Green': z.inclusion.green,
        'Milky': z.inclusion.milky,
        'Shade': z.inclusion.shade,
        'B. Table': z.inclusion.centerBlack,
        'B. Crown': z.inclusion.sideBlack,
        'W. Table': z.inclusion.sideWhite,
        'W. Crown': z.inclusion.centerWhite,
        'Open Crown': z.inclusion.openCrown,
        'Open Table': z.inclusion.openTable,
        'EFOC': z.inclusion.efoc,
        'EFOP': z.inclusion.efop,
        'Girdle Con.': z.inclusion.girdleCondition,
        'Culet': z.inclusion.culet,
        'NOP': z.inclusion.naturalOnPavillion,
        'NOC': z.inclusion.naturalOnCrown,
        'NOG': z.inclusion.naturalOnGirdle,
        'HNA': z.inclusion.hna,
        'Eye Clean': z.inclusion.eyeClean,
        'Ktos': z.inclusion.ktoS,
      }
      this.excelFile.push(excel);
    });
    return this.excelFile;
  }

  public async onKeepUnsoldStone(stoneId: string, isKeepUnsold: boolean) {
    try {
      this.spinnerService.show();

      const toggledIsKeepUnsold = !isKeepUnsold;

      let res = await this.bidingSummaryService.keepUnsoldStone(this.bidSearchFilter.bidNumber, stoneId, toggledIsKeepUnsold);

      if (res) {
        await this.initBidInventoryData();
        this.utilityService.showNotification(`Updated stone as ${toggledIsKeepUnsold ? 'keep unsold' : 'sold'} successfully!`);
      }

      this.spinnerService.hide();
    }
    catch (error: any) {
      this.alertDialogService.show(error);
      this.spinnerService.hide();
    }
  }
  //#endregion DefaultMethods

  //#region Grid methods
  public async getGridConfiguration() {
    try {
      this.gridConfig = await this.configService.getGridConfig(this.fxCredentials?.id ?? '', "BidingUpload", "BidingUploadGrid", this.gridPropertiesService.getBidingMasterGrid());
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
        this.gridMasterConfigResponse = await this.configService.getMasterGridConfig("BidingUpload", "BidingUploadGrid");
        if (this.gridMasterConfigResponse)
          this.fields = this.gridMasterConfigResponse.gridDetail;
        else
          this.fields = await this.gridPropertiesService.getBidingMasterGrid();
      }
    }
    catch (error: any) {
      this.alertDialogService.show(error);
      this.spinnerService.hide();
    }
  }

  public openGridConfigDialog(): void {
    this.isGridConfig = !this.isGridConfig;
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

  public sortChange(sort: SortDescriptor[]): void {
    this.sort = sort;
    this.sortFieldDescriptors = new Array<SortFieldDescriptor>();
    this.initBidInventoryData();
  }

  public groupChange(groups: GroupDescriptor[]): void {
    try {
      this.groups = groups;
      this.initBidInventoryData();
    }
    catch (error: any) {
      this.alertDialogService.show(error.error);
    }
  }

  public pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.initBidInventoryData();
  }
  //#endregion
}
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { FilterService, PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { CompositeFilterDescriptor, DataResult, SortDescriptor, process, filterBy } from '@progress/kendo-data-query';
import { NgxSpinnerService } from 'ngx-spinner';
import { GridDetailConfig } from 'shared/businessobjects';
import { GridConfig, GridMasterConfig } from 'shared/enitites';
import { ConfigService, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { CustFxCredential } from '../../entities';
import { EmailService, GridPropertiesService } from '../../services';
import { BidingSummary } from '../../entities/biding/bidingSummary';
import { BidingSummaryService } from '../../services/biding/bidingSummary.service';
import { BidingItemService } from '../../services/biding/bidingItem.service';
import { BidingItems } from '../../entities/biding/bidingItems';
import { environment } from 'environments/environment.prod';
import * as xlsx from 'xlsx';
import * as moment from 'moment-timezone';
import { ExportToExcelMailData } from '../../businessobjects';
import { BidCategory } from '../../entities/biding/bidCategory';
import { InvDetailItem } from '../../entities/inventory/invDetailItem';
import { BidHistoryItems } from '../../businessobjects/biding/bidHistoryItems';

@Component({
  selector: 'app-ebiding',
  templateUrl: './ebiding.component.html',
  styleUrl: './ebiding.component.css',
  encapsulation: ViewEncapsulation.None
})
export class EbidingComponent implements OnInit {
  //#region Grid Init
  public skip = 0;
  public pageSize = 26;
  public gridView!: DataResult;
  public gridAcitveBidView!: DataResult;
  public gridConfig!: GridConfig;
  public isGridConfig: boolean = false;
  public fields!: GridDetailConfig[];
  public sort: SortDescriptor[] = [];
  public gridMasterConfigResponse!: GridMasterConfig;
  public selectableSettings: SelectableSettings = {
    mode: 'multiple', checkboxOnly: true
  };
  //#endregion Grid Init

  //#region Biding
  days: string = '00';
  hours: string = '00';
  minutes: string = '00';
  seconds: string = '00';
  bidTab: number = 1;
  public stoneTotalCount = '0';
  public stoneActiveBidTotalCount = '0';
  public bidHistoryTotalCount = '0';
  public stoneTotalWeight = '0.00';
  public selectedStoneTotalCount = '0';
  public selectedStoneTotalWeight = '0.00';

  public bidStartDate!: string;
  public bidEndDate!: string;
  public remainingTime: string = '';
  public timerInterval: any;
  public stoneId: string = "";
  public bidNumber: string = "";
  public exportType: string = ' ';

  public excelFile: any[] = [];
  public mySelection: string[] = [];
  public selectedInventoryItems: InvDetailItem[] = [];
  public activeBidInvDetailItems: InvDetailItem[] = [];

  isBidEnded: boolean = false;
  isGreater: boolean = false;
  isActiveBid: boolean = false;
  public isExcelModal: boolean = false;
  isBidAnnouncementEnded: boolean = false;
  public showDiamonddetailModal: boolean = false;

  public fxCredentials?: CustFxCredential;
  public bidingItems: BidingItems = new BidingItems();
  public bidingSummary: BidingSummary = new BidingSummary();
  public bidHistoryItems: BidHistoryItems[] = [];
  public categories: BidCategory[] = [];
  public activeBidCategories: BidCategory[] = [];
  public filter!: CompositeFilterDescriptor;
  public exportToExcelMailObj: ExportToExcelMailData = new ExportToExcelMailData();
  //#endregion Biding

  constructor(
    public sanitizer: DomSanitizer,
    private alertDialogService: AlertdialogService,
    public utilityService: UtilityService,
    private spinnerService: NgxSpinnerService,
    private configService: ConfigService,
    private gridPropertiesService: GridPropertiesService,
    private bidingSummaryService: BidingSummaryService,
    private bidingItemService: BidingItemService,
    private emailService: EmailService
  ) { }

  public async ngOnInit() {
    window.scrollTo(0, 0);
    await this.defaultMethodsLoad();
    return;
  }

  //#region Init Data
  public async defaultMethodsLoad() {
    this.spinnerService.show();
    this.fxCredentials = JSON.parse(sessionStorage.getItem("fxCredentials") ?? '') as CustFxCredential;
    await this.getGridConfiguration();
    await this.initBidingData();
    this.startTimer();
    await this.initActiveBidingData();
    await this.initBidingHistoryData();
  }

  public async initBidingData(): Promise<void> {
    try {
      this.spinnerService.show();
      const res = await this.bidingSummaryService.getBidByIsActiveBid(true, false);

      if (res) {
        const { invDetailItems, bidTimer, isGreater, bidNumber, isActiveBid } = res;
        const stoneIds = invDetailItems.map(item => item.stoneId);
        const bidingItems = await this.bidingItemService.getBidingItemByStoneId(this.fxCredentials?.id, res.bidNumber, stoneIds);

        // Merge data with bidding items
        const mergedData = invDetailItems.map(item => {
          let netAmount = 0;
          let bidPerCarat = 0;
          const bidingItem = bidingItems.find(b => b.stoneId === item.stoneId);
          let bidDiscount = bidingItem ? bidingItem.discount : item.curBidDisc;

          if (bidDiscount) {
            var offerDisc = parseFloat(bidDiscount?.toString() || "0");
            let weight = item?.weight;
            let stoneRap = weight * (item.price?.rap ?? 0);
            let calDiscount = 100 + offerDisc;
            netAmount = (calDiscount * stoneRap) / 100;
            bidPerCarat = netAmount / weight;
          }

          return {
            ...item,
            bidingDisc: bidingItem ? bidingItem.discount : item.curBidDisc,
            bidNetAmount: parseFloat(netAmount.toFixed(2)),
            bidPerCT: parseFloat(bidPerCarat.toFixed(2))
          };
        });

        // Update properties
        this.bidingSummary = { ...res, invDetailItems: mergedData };
        this.gridView = process(this.bidingSummary.invDetailItems, { sort: this.sort });
        this.stoneTotalCount = invDetailItems.length.toString();
        this.stoneTotalWeight = this.utilityService.ConvertToFloatWithDecimal(invDetailItems.map(z => z.weight).reduce((ty, u) => ty + u, 0)).toString();
        this.isGreater = isGreater;
        this.bidNumber = bidNumber;
        this.isActiveBid = isActiveBid;

        // Format dates
        if (bidTimer) {
          this.bidStartDate = this.formatDate(bidTimer?.bidStart);
          this.bidEndDate = this.formatDate(bidTimer?.bidEnd);
        }
      }
      else {
        this.stoneTotalCount = '0';
        this.stoneTotalWeight = '0';
        this.selectedStoneTotalCount = '0';
        this.selectedStoneTotalWeight = '0.00';
        this.isActiveBid = false;
        this.bidingSummary.invDetailItems = [];
        this.gridView = process(this.bidingSummary.invDetailItems, { sort: this.sort });
      }
      this.spinnerService.hide();
    } catch (error: any) {
      this.alertDialogService.show(error.error || 'An error occurred');
      this.spinnerService.hide();
    }
  }

  public async initActiveBidingData(): Promise<void> {
    try {
      this.spinnerService.show();
      if (this.bidingSummary.invDetailItems.length > 0) {
        const bidingItems = await this.bidingItemService.getCustomerActiveBidItems(this.bidNumber, this.fxCredentials?.id);
        if (bidingItems.length > 0) {
          const mergedData = this.bidingSummary.invDetailItems
            .filter(item => bidingItems.some(b => b.stoneId === item.stoneId))
            .map(item => {
              let netAmount = 0;
              let bidPerCarat = 0;

              const bidingItem = bidingItems.find(b => b.stoneId === item.stoneId);
              let bidDiscount = bidingItem ? bidingItem.discount : item.curBidDisc;

              if (bidDiscount) {
                var offerDisc = parseFloat(bidDiscount?.toString() || "0");
                let weight = item?.weight;
                let stoneRap = weight * (item.price?.rap ?? 0);
                let calDiscount = 100 + offerDisc;
                netAmount = (calDiscount * stoneRap) / 100;
                bidPerCarat = netAmount / weight;
              }

              return {
                ...item,
                bidingDisc: bidingItem ? bidingItem.discount : item.curBidDisc,
                bidNetAmount: parseFloat(netAmount.toFixed(2)),
                bidPerCT: parseFloat(bidPerCarat.toFixed(2)),
                isApproved: bidingItem?.isApproved
              };
            });

          this.activeBidInvDetailItems = mergedData;
          this.gridAcitveBidView = process(mergedData, { sort: this.sort });
          this.stoneActiveBidTotalCount = mergedData.length.toString();
        }
      }
      this.spinnerService.hide();
    } catch (error: any) {
      this.alertDialogService.show(error.error || 'An error occurred');
      this.spinnerService.hide();
    }
  }

  public async initBidingHistoryData(): Promise<void> {
    try {
      this.spinnerService.show();

      const customerId = this.fxCredentials?.id ?? "";
      if (!customerId) return;

      this.bidHistoryItems = await this.bidingSummaryService.getBidingHistoryAsync(customerId);
      this.bidHistoryTotalCount = this.bidHistoryItems.length.toString();

      this.spinnerService.hide();
    } catch (error: any) {
      this.alertDialogService.show(error.error || 'An error occurred');
      this.spinnerService.hide();
    }
  }

  getGridCategoriesData(fieldName: any) {
    this.categories = this.distinctCategories(this.bidingSummary.invDetailItems, fieldName);
  }

  getActiveBidGridCategoriesData(fieldName: any) {
    this.activeBidCategories = this.distinctCategories(this.activeBidInvDetailItems, fieldName);
  }

  getNestedFieldValue(obj: any, fieldPath: string): any {
    return fieldPath.split('.').reduce((acc, key) => acc && acc[key], obj);
  }

  distinctCategories(data: InvDetailItem[], fieldName: keyof InvDetailItem) {
    const categories = new Map<string, BidCategory>();

    data.forEach(product => {
      const fieldValue = this.getNestedFieldValue(product, fieldName);

      if (fieldValue && (typeof fieldValue === 'string' || typeof fieldValue === 'number')) {
        const key = String(fieldValue);
        if (!categories.has(key)) {
          categories.set(key, {
            CategoryID: key,
            CategoryName: key,
            Description: ''
          });
        }
      }
    });

    return Array.from(categories.values());
  }

  public filterChange(filter: CompositeFilterDescriptor): void {
    this.filter = filter;
    this.gridView = process(filterBy(this.bidingSummary.invDetailItems, filter), { sort: this.sort });
  }

  public activeBidFilterChange(filter: CompositeFilterDescriptor): void {
    this.filter = filter;
    this.gridAcitveBidView = process(filterBy(this.activeBidInvDetailItems, filter), { sort: this.sort });
  }

  public categoryChange(values: string[], filterService: FilterService, fieldName: string): void {
    filterService.filter({
      filters: values.map((value) => ({
        field: fieldName,
        operator: "eq",
        value,
      })),
      logic: "or",
    });
  }

  public async bidSelectTab(tabIndex: number) {
    this.bidTab = tabIndex;
    this.filter = {
      logic: "and", filters: []

    }
    if (tabIndex == 1)
      await this.initBidingData();
    else if (tabIndex == 2)
      this.gridAcitveBidView = process(this.activeBidInvDetailItems, { sort: this.sort });
    else
      await this.initBidingHistoryData();
  }

  incrementDiscount(dataItem: any) {
    dataItem.bidingDisc = parseFloat(dataItem.bidingDisc);
    if (dataItem.bidingDisc > -99) {
      if (this.isGreater) {
        if (dataItem.curBidDisc < dataItem.bidingDisc) {
          dataItem.bidingDisc -= 0.25;
        }
      } else {
        dataItem.bidingDisc -= 0.25;
      }
    }

    // Ensure it doesn't go below -99
    if (dataItem.bidingDisc < -99) {
      dataItem.bidingDisc = -99;
    }
    this.calculatePerCtAmount(dataItem);
  }

  decrementDiscount(dataItem: any) {
    dataItem.bidingDisc = parseFloat(dataItem.bidingDisc);

    if (dataItem.bidingDisc < 99) {
      if (this.isGreater) {
        if (dataItem.curBidDisc == dataItem.bidingDisc)
          dataItem.bidingDisc += 0.25;
        else if (dataItem.curBidDisc < dataItem.bidingDisc)
          dataItem.bidingDisc += 0.25;
        else if (dataItem.curBidDisc > dataItem.bidingDisc)
          dataItem.bidingDisc += 0.25;
      } else {
        dataItem.bidingDisc += 0.25;
      }
    }

    if (dataItem.bidingDisc > 99) {
      dataItem.bidingDisc = 99;
    }
    this.calculatePerCtAmount(dataItem);
  }

  calculatePerCtAmount(item: any) {
    if (item) {
      const offerDisc = parseFloat(item.bidingDisc?.toString() || item.curBidDisc);
      const weight = item?.weight;
      const stoneRap = weight * (item.price?.rap ?? 0);
      const calDiscount = 100 + offerDisc;

      const netAmount = (calDiscount * stoneRap) / 100;
      const bidPerCarat = netAmount / weight;

      item.bidNetAmount = parseFloat(netAmount.toFixed(2));
      item.bidPerCT = parseFloat(bidPerCarat.toFixed(2));
    }
  }

  //#region Bid Timer methods
  private startTimer(): void {
    const now = moment().utcOffset("+05:30");
    const end = moment(this.bidingSummary.bidTimer.bidEnd).utcOffset("+05:30");
    if (now.isBefore(end)) {
      this.timerInterval = setInterval(() => {
        this.updateRemainingTime();
      }, 1000);
    }
  }

  private async updateRemainingTime(): Promise<void> {
    const now = moment().utcOffset("+05:30");
    const end = moment(this.bidingSummary.bidTimer.bidEnd).utcOffset("+05:30");
    if (now.isBefore(end)) {
      this.isBidEnded = false;
      const duration = moment.duration(end.diff(now));
      this.remainingTime = this.formatDuration(duration);
    } else {
      this.isBidEnded = true;
      this.isBidAnnouncementEnded = true;
      this.remainingTime = 'Bid Ended';
      await this.initBidingData();
      this.bidingSummary.invDetailItems = [];
      this.activeBidInvDetailItems = [];
      this.stoneActiveBidTotalCount = "0";
      this.gridAcitveBidView = process(this.activeBidInvDetailItems, { sort: this.sort });
      clearInterval(this.timerInterval);
    }
  }

  private formatDuration(duration: moment.Duration): string {
    this.days = Math.floor(duration.asDays()).toString().padStart(2, '0');
    this.hours = duration.hours().toString().padStart(2, '0');
    this.minutes = duration.minutes().toString().padStart(2, '0');
    this.seconds = duration.seconds().toString().padStart(2, '0');

    return `${this.days}d ${this.hours}h ${this.minutes}m ${this.seconds}s`;
  }

  public formatDate(dateString: Date): string {
    return moment(dateString)
      .tz('Asia/Kolkata')
      .format('MMM D YYYY, h:mm A');
  }

  public openDiamonddetailSidebar(stoneId: string) {
    this.showDiamonddetailModal = false;
    this.stoneId = stoneId;
    setTimeout(() => { this.showDiamonddetailModal = true; }, 0);
  }
  //#endregion

  //#region Grid Methods
  public async getGridConfiguration() {
    try {
      this.gridConfig = await this.configService.getGridConfig(this.fxCredentials?.id ?? '', "BidingInventory", "BidingInventoryGrid", this.gridPropertiesService.getBidingMasterGrid());
      if (this.gridConfig && this.gridConfig.id != '') {
        let dbObj: GridDetailConfig[] = this.gridConfig.gridDetail.filter(x => this.gridPropertiesService.getBidingMasterGrid().map(x => x.propertyName).includes(x.propertyName));
        if (dbObj && dbObj.some(c => c.isSelected)) {
          this.fields = dbObj;
          this.fields.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        }
        else
          this.fields.forEach(c => c.isSelected = true);
      }
      else {
        this.gridMasterConfigResponse = await this.configService.getMasterGridConfig("BidingInventory", "BidingInventoryGrid");
        if (this.gridMasterConfigResponse)
          this.fields = this.gridMasterConfigResponse.gridDetail;
        else
          this.fields = await this.gridPropertiesService.getBidingMasterGrid();
      }
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.alertDialogService.show(error);
      this.spinnerService.hide();
    }
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

  public openGridConfigDialog(): void {
    this.isGridConfig = true;
  }

  public pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.initBidingData();
  }

  public sortChange(sort: SortDescriptor[]): void {
    this.sort = sort;
    this.initBidingData();
  }

  public selectedRowChange(e: any) {
    this.selectedInventoryItems = [];
    if (this.mySelection.length > 0)
      this.selectedInventoryItems = this.bidingSummary.invDetailItems.filter(z => this.mySelection.includes(z.stoneId));
    this.calculateTotalAndAvg();
  }

  public calculateTotalAndAvg() {
    if (this.bidingSummary.invDetailItems.length > 0) {
      this.selectedStoneTotalCount = this.selectedInventoryItems.length.toString();
      this.selectedStoneTotalWeight = this.utilityService.ConvertToFloatWithDecimal(this.selectedInventoryItems.map(z => z.weight).reduce((ty, u) => ty + u, 0)).toString();
    }
    else {
      this.selectedStoneTotalCount = '0';
      this.selectedStoneTotalWeight = '0.00';
    }
  }

  public openExcelFile() {
    this.isExcelModal = true;
  }

  public closeExcelDialog() {
    this.isExcelModal = false;
    this.exportType = ' ';
  }
  //#endregion Grid Methods

  //#region Biding Methods
  public closeImageDialog(): void {
    this.isBidAnnouncementEnded = false;
  }

  public applyBidingByExcel(event: Event) {
    try {
      let acceptedFiles: string[] = [];
      const target = event.target as HTMLInputElement;
      if (target.accept) {
        acceptedFiles = target.accept.split(',').map(item => item.trim());
      }

      if (target.files && target.files.length) {
        const file = target.files[0];
        if (acceptedFiles.includes(file.type)) {
          const fileReader = new FileReader();
          this.spinnerService.show();

          fileReader.onload = async () => {
            try {
              const arrayBuffer: ArrayBuffer = fileReader.result as ArrayBuffer;
              const data = new Uint8Array(arrayBuffer);
              const arr = Array.from(data, byte => String.fromCharCode(byte));

              const workbook = xlsx.read(arr.join(""), { type: "binary" });
              let fetchExcelItems = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]) as any[];

              if (fetchExcelItems && fetchExcelItems.length > 0) {
                const requiredFields = ['StoneId', 'Bid Disc%'];
                const invalidItems = fetchExcelItems.filter(item => {
                  return !requiredFields.every(field => field in item);
                });

                if (invalidItems.length > 0) {
                  this.spinnerService.hide();
                  this.alertDialogService.show("The file format is incorrect. Please download the correct file format using the export button.");
                  target.value = '';
                  return;
                }

                const invalidStoneIds = fetchExcelItems
                  .filter((res) => {
                    const invItem = this.bidingSummary.invDetailItems.find(
                      (bidingItem) => bidingItem?.stoneId === res?.StoneId
                    );

                    if (invItem) {
                      const invItemDiscount = invItem?.curBidDisc;
                      const resDiscount = res['Bid Disc%'];

                      const isInvalidDiscount = resDiscount === null || resDiscount === undefined || resDiscount === '' || resDiscount < -99 || resDiscount > 99;

                      if (isInvalidDiscount) {
                        return true;
                      }

                      if (this.isGreater) {
                        return resDiscount < invItemDiscount;
                      } else {
                        return false;
                      }
                    }

                    return false;
                  })
                  .map((r) => r.StoneId);

                if (!invalidStoneIds.length) {
                  const { fullName = "", id } = this.fxCredentials || {};
                  const stoneIdSet = new Set(this.bidingSummary.invDetailItems.map(r => r.stoneId));

                  const mergedData = fetchExcelItems
                    .filter(res => stoneIdSet.has(res.StoneId))
                    .map(res => {
                      let netAmount = 0;
                      let bidPerCarat = 0;

                      const bidItem = this.bidingSummary.invDetailItems.find(b => b.stoneId === res.StoneId);
                      if (bidItem) {
                        var offerDisc = parseFloat(res['Bid Disc%']?.toString() || "0");
                        let weight = bidItem?.weight;
                        let stoneRap = weight * (bidItem.price?.rap ?? 0);
                        let calDiscount = 100 + offerDisc;
                        netAmount = (calDiscount * stoneRap) / 100;
                        bidPerCarat = netAmount / weight;
                      }

                      const bidingItem = new BidingItems();
                      bidingItem.stoneId = res.StoneId;
                      bidingItem.createdBy = fullName;
                      bidingItem.updatedBy = fullName;
                      bidingItem.bidPerCT = bidPerCarat;
                      bidingItem.bidAmount = netAmount;
                      bidingItem.discount = res['Bid Disc%'] != "" ? res['Bid Disc%'] : null;
                      bidingItem.bidNumber = this.bidingSummary.bidNumber;
                      return bidingItem;
                    });

                  if (mergedData?.length > 0) {
                    let filterMergedData = mergedData.filter(r => r.discount !== null);
                    const bidingItems = await this.bidingItemService.getBidingItemByStoneId(this.fxCredentials?.id, this.bidingSummary.bidNumber, filterMergedData.map(r => r.stoneId));

                    let filterStoneIds = filterMergedData.filter((res: BidingItems) => {
                      let bidingItem = bidingItems.find(bi => bi.stoneId === res.stoneId);
                      return !bidingItem || (bidingItem.discount !== res.discount);
                    }).map(s => s.stoneId);

                    const result = await this.bidingItemService.updateBidsByExcelAsync(mergedData, id);
                    if (result) {
                      await this.initBidingData();
                      await this.initActiveBidingData();
                      let sendMailInvDetailItems = this.bidingSummary.invDetailItems.filter(res => filterStoneIds.includes(res.stoneId));
                      await this.generateExcelData(sendMailInvDetailItems);
                      this.sendMailPlaceBid();
                      this.utilityService.showNotification('Your Bid is placed successfully!');
                    }
                  } else
                    this.alertDialogService.show("No Bid Items were found in the Excel file.");
                } else {
                  fetchExcelItems = [];
                  this.alertDialogService.show(`Stones with invalid discounts: <b>${invalidStoneIds.join(', ')}</b>. Please correct and try again.`);
                }
              }

              this.spinnerService.hide();
            } catch (e) {
              this.spinnerService.hide();
              this.alertDialogService.show("Error processing the file.");
            }
          };

          fileReader.readAsArrayBuffer(file);
        } else {
          this.alertDialogService.show(`Please select only .xlsx or .xls file.`);
        }
      }
    } catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.message || "An error occurred.");
    }
  }

  public async exportDataFromExcel() {
    try {
      this.spinnerService.show();
      this.excelFile = [];
      if (this.exportType == 'Selected') {
        if (this.mySelection.length == 0) {
          this.spinnerService.hide();
          this.alertDialogService.show('No selected stone(s) found!');
          return;
        }
        this.generateExcelData(this.selectedInventoryItems, true)
      }
      else if (this.exportType == 'Search') {
        this.generateExcelData(this.bidingSummary.invDetailItems, true)
      } else {
        this.spinnerService.hide();
        this.alertDialogService.show('Select type for export to excel!');
        return;
      }

      this.utilityService.exportAsExcelFile(this.excelFile, "Biding_Excel_");
      this.closeExcelDialog();
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async placeBid(stoneId: string, bidingDisc: number, invItemData: any): Promise<void> {
    if (!bidingDisc) {
      this.alertDialogService.show('Bid discount must be provided.');
      return;
    }

    if (this.remainingTime == "Bid Ended") {
      this.alertDialogService.show('Sorry, you cannot place a bid because the bidding period has ended.');
      return;
    }

    try {
      this.spinnerService.show();
      const { fullName = "", id } = this.fxCredentials || {};
      this.bidingItems = {
        ...this.bidingItems,
        stoneId,
        createdBy: fullName,
        updatedBy: fullName,
        discount: bidingDisc,
        bidAmount: invItemData.bidNetAmount,
        bidPerCT: invItemData.bidPerCT,
        bidNumber: this.bidingSummary.bidNumber,
      };

      const result = await this.bidingItemService.insertBidingItemAsync(this.bidingItems, id);
      if (result) {
        let data = [invItemData];

        if (data.length > 0) {
          await this.initActiveBidingData();
          await this.generateExcelData(data);
          this.sendMailPlaceBid()
        }

        this.utilityService.showNotification('Your Bid is placed successfully!');
      }
      this.spinnerService.hide();
    } catch (error: any) {
      this.alertDialogService.show(error);
      this.spinnerService.hide();
    }
  }

  private async generateExcelData(data: any[], isDiscShow: boolean = false) {
    this.excelFile = [];

    data.forEach(z => {
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
        'Weight': z.weight.toFixed(2),
        'Color': z.color,
        'Clarity': z.clarity,
        'Cut': z.cut,
        'Polish': z.polish,
        'Symmetry': z.symmetry,
        'Fluorescence': z.fluorescence,
        'Lab': z.lab,
        'CertificateNo': z.certificateNo,
        'Rap': z.price.rap,
        'Bid Pr/Ct': z.bidPerCT,
        'Bid Amt$': z.bidNetAmount,
        'Cur. Bid Disc%': z.curBidDisc,
        'Bid Disc%': isDiscShow ? '' : z.bidingDisc,
        'Measurement': z.measurement?.length + '*' + z.measurement?.width + '*' + z.measurement?.height,
        'Depth': z.measurement.depth.toFixed(2),
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
  }

  public async sendMailPlaceBid() {
    try {
      this.spinnerService.show();

      let fileName = "Place_Bid_Excel";
      this.exportToExcelMailObj.systemUserId = this.fxCredentials?.id ?? '';
      this.exportToExcelMailObj.excelBase64String = this.utilityService.exportAsExcelFileBase64(this.excelFile);
      this.exportToExcelMailObj.excelFileName = this.utilityService.exportFileName(fileName) + '.xlsx';
      this.exportToExcelMailObj.excelMediaType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      this.exportToExcelMailObj.companyName = this.utilityService.getCompanyNameFromUrl(window.location.href);

      let res = await this.emailService.sendPlaceBidEmailAsync(this.exportToExcelMailObj);
      if (res && res.isSuccess) {
        this.utilityService.showNotification(res.message);
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

  public getcountryFlag(location: string) {
    return location.toLowerCase().replace(/\s+/g, '');
  }
  //#endregion Biding Methods
}

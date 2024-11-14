import { Component, OnDestroy, OnInit } from '@angular/core';
import { PageChangeEvent } from '@progress/kendo-angular-dropdowns/common/models/page-change-event';
import { SelectableSettings } from '@progress/kendo-angular-treeview';
import { DataResult, GroupDescriptor, SortDescriptor, process } from '@progress/kendo-data-query';
import { NgxSpinnerService } from 'ngx-spinner';
import { SortFieldDescriptor } from 'projects/CRM.BackOffice/src/app/businessobjects';
import { GridDetailConfig } from 'shared/businessobjects';
import { AlertdialogService } from 'shared/views';
import * as xlsx from 'xlsx';
import { fxCredential, GridConfig, GridMasterConfig } from 'shared/enitites';
import { NgForm } from '@angular/forms';
import { ConfigService, UtilityService } from 'shared/services';
import { GridPropertiesService, InventoryService } from '../../services';
import * as moment from 'moment-timezone';
import { BidingSummary } from '../../entities/biding/bidingSummary';
import { BidingSummaryService } from '../../services/biding/bidingSummary.service';
import { InvDetailItem } from '../../entities/inventory/invDetailItem';
import { InvItem } from '../../entities';

@Component({
  selector: 'app-bidingUpload',
  templateUrl: './bidingUpload.component.html',
  styleUrls: ['./bidingUpload.component.css']
})
export class BidingUploadComponent implements OnInit, OnDestroy {

  //#region Grid varibales
  public skip = 0;
  public pageSize = 26;
  public gridView?: DataResult;
  public gridConfig!: GridConfig;
  public isGridConfig: boolean = false;
  public gridMasterConfigResponse!: GridMasterConfig;
  public fields!: GridDetailConfig[];
  public sort: SortDescriptor[] = [];
  public groups: GroupDescriptor[] = [];
  public sortFieldDescriptors!: SortFieldDescriptor[];
  public selectableSettings: SelectableSettings = {
    mode: 'multiple',
  };
  //#endregion Grid varibales

  //#region Biding varibales
  public isGreater: boolean = false;
  public isActiveBid: boolean = false;
  public isFileSelect: boolean = false;
  public isBidUploadDialog: boolean = false;
  public isBidEditDialog: boolean = false;
  public ftpUpfileName: string = '';
  public fxCredentials?: fxCredential;
  public bidStartDate!: string;
  public bidEndDate!: string;
  public remainingBidEndTime: string = '';
  public timerInterval: any;
  disabledDates = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };
  public bidingObj: BidingSummary = new BidingSummary();
  public bidingSummary: BidingSummary = new BidingSummary();
  //#endregion Biding varibales

  constructor(
    private alertDialogService: AlertdialogService,
    private spinnerService: NgxSpinnerService,
    private bidingSummaryService: BidingSummaryService,
    private utilityService: UtilityService,
    private inventoryService: InventoryService,
    private gridPropertiesService: GridPropertiesService,
    private configService: ConfigService) { }

  async ngOnInit() {
    await this.defaultMethodsLoad();
  }

  ngOnDestroy(): void {
    clearInterval(this.timerInterval);
  }

  //#region Default Methods
  async defaultMethodsLoad() {
    try {
      this.fxCredentials = JSON.parse(sessionStorage.getItem("fxCredentials") ?? '') as fxCredential;
      this.getGridConfiguration();
      await this.initBidInventoryData();
      this.startTimer();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async initBidInventoryData() {
    try {
      this.spinnerService.show();
      let res = await this.bidingSummaryService.getBidByIsActiveBid(true, true);
      if (res) {
        this.bidingSummary = res;
        const { invDetailItems, bidTimer, isGreater, isActiveBid } = res;

        this.gridView = process(invDetailItems, { group: this.groups, sort: this.sort, skip: this.skip, take: this.pageSize });
        this.gridView.total = invDetailItems.length;
        this.isGreater = isGreater;
        this.isActiveBid = isActiveBid;

        if (bidTimer) {
          this.bidStartDate = this.formatDate(bidTimer.bidStart);
          this.bidEndDate = this.formatDate(bidTimer.bidEnd);
        }
      }
      this.startTimer();
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }
  //#endregion Default Methods

  //#region Bid Timer methods
  private startTimer(): void {
    this.timerInterval = setInterval(() => {
      this.updateRemainingTime();
    }, 1000);
  }

  private updateRemainingTime(): void {
    const now = this.getIndianTime();
    const start = this.getIndianTime(new Date(this.bidingSummary.bidTimer.bidStart));
    const end = this.getIndianTime(new Date(this.bidingSummary.bidTimer.bidEnd));

    if (now.isSameOrAfter(start) && now.isSameOrBefore(end)) {
      const duration = end.diff(now);
      this.remainingBidEndTime = this.formatDuration(duration);
    } else {
      this.remainingBidEndTime = 'Bid Ended';
      clearInterval(this.timerInterval);
    }
  }

  private getIndianTime(date: Date = new Date()): moment.Moment {
    // Convert date to IST (UTC+5:30) and return as a moment object
    return moment.utc(date).utcOffset(330); // Indian Standard Time (IST) is UTC+5:30
  }

  private formatDuration(duration: number): string {
    const days = Math.floor(duration / (24 * 60 * 60 * 1000));
    const hours = Math.floor((duration % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((duration % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((duration % (60 * 1000)) / 1000);

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
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
  //#endregion

  //#region Grid methods
  public async getGridConfiguration() {
    try {
      this.gridConfig = await this.configService.getGridConfig(this.fxCredentials?.id ?? '', "BidingUpload", "BidingUploadGrid", this.gridPropertiesService.getBidingMasterGrid());
      if (this.gridConfig && this.gridConfig.id != '') {
        let dbObj: GridDetailConfig[] = this.gridConfig.gridDetail;
        if (dbObj && dbObj.some(c => c.isSelected)) {
          this.fields = dbObj.filter(r => r.propertyName != "isKeepUnsold");;
          this.fields.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        }
        else
          this.fields.forEach(c => c.isSelected = true);
      }
      else {
        this.gridMasterConfigResponse = await this.configService.getMasterGridConfig("BidingUpload", "BidingUploadGrid");
        if (this.gridMasterConfigResponse)
          this.fields = this.gridMasterConfigResponse.gridDetail.filter(r => r.propertyName != "isKeepUnsold");
        else {
          var fields = await this.gridPropertiesService.getBidingMasterGrid();
          this.fields = fields.filter(r => r.propertyName != "isKeepUnsold");
        }
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

  //#region Dialogs Methods
  public openBidUploadDialog(): void {
    this.isBidUploadDialog = true;
  }

  public async openBidEditDialog(): Promise<void> {
    this.isBidUploadDialog = true;
    this.isBidEditDialog = true;
    this.bidingObj.bidTimer.offerTime = this.bidingSummary.bidTimer?.offerTime;
    this.bidingObj.isGreater = this.bidingSummary.isGreater;
    this.bidingObj.bidTimer.bidStart = new Date(this.bidingSummary.bidTimer?.bidStart);
    this.bidingObj.bidTimer.bidEnd = new Date(this.bidingSummary.bidTimer?.bidEnd);
  }

  public closeBidUploadDialog(form: NgForm): void {
    form.resetForm();
    this.bidingObj.invDetailItems = [];
    this.isFileSelect = false;
    this.isBidUploadDialog = false;
    this.isBidEditDialog = false;
  }

  public async onSelectExcelFile(event: Event) {
    try {
      let acceptedFiles: string[] = [];
      const target = event.target as HTMLInputElement;
      if (target.accept) {
        acceptedFiles = target.accept.split(',').map(item => item.trim());
      }

      if (target.files && target.files.length) {
        this.isFileSelect = true;
        const file = target.files[0];
        this.ftpUpfileName = file.name;
        if (acceptedFiles.includes(file.type)) {
          const fileReader = new FileReader();
          this.spinnerService.show();

          fileReader.onload = async () => {
            try {
              const arrayBuffer: ArrayBuffer = fileReader.result as ArrayBuffer;
              const data = new Uint8Array(arrayBuffer);
              const arr = Array.from(data, byte => String.fromCharCode(byte));

              const workbook = xlsx.read(arr.join(""), { type: "binary" });
              const fetchExcelItems = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]) as any[];

              if (fetchExcelItems && fetchExcelItems.length > 0) {
                const requiredFields = ['StoneId', 'CurBidDisc'];
                const invalidItems = fetchExcelItems.filter(item => {
                  return !requiredFields.every(field => field in item);
                });

                if (invalidItems.length > 0) {
                  this.spinnerService.hide();
                  this.alertDialogService.show("Missing required data for <b>StoneId</b> and <b>CurBidDisc</b>. Please upload the correct file format.");
                  target.value = '';
                  this.isFileSelect = false;
                  return;
                }

                const stoneIds = fetchExcelItems.map(s => s.StoneId);

                if (stoneIds.length > 0) {
                  this.bidingObj.invDetailItems = fetchExcelItems.map(s => {
                    let invDetailItem: Partial<InvDetailItem> = {
                      stoneId: s.StoneId,
                      curBidDisc: s.CurBidDisc
                    };

                    return invDetailItem as InvDetailItem;
                  });
                } else
                  this.alertDialogService.show("No stoneIDs were found in the Excel file.");
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

  public validateStartEndDate(form: NgForm) {
    const { bidStart, bidEnd } = this.bidingObj.bidTimer;

    if (!bidStart) {
      form.controls.bidStart.setErrors({ 'invalid': true });
      this.alertDialogService.show('Please select a start date before selecting the end date.');
      return;
    }

    if (bidEnd && new Date(bidEnd) < new Date(bidStart)) {
      form.controls.bidEnd.setErrors({ 'invalid': true });
      this.alertDialogService.show('The end date cannot be earlier than the start date. Please select a valid end date.');
      return;
    }

    this.bidingObj.bidTimer.offerTime = this.calculateOfferTime(this.bidingObj.bidTimer.bidStart, this.bidingObj.bidTimer.bidEnd);
  }

  public calculateOfferTime(bidStart: Date, bidEnd: Date) {
    if (bidStart && bidEnd) {
      const start = new Date(bidStart).getTime();
      const end = new Date(bidEnd).getTime();

      // Calculate the difference in milliseconds
      const differenceInMs = end - start;

      // Convert milliseconds to seconds
      var offerTime = Math.floor(differenceInMs / 1000);
      return offerTime;
    }

    return 0;
  }

  public async saveBidingData(form: NgForm) {
    try {
      let stoneIds = this.bidingObj.invDetailItems.map(s => s.stoneId);

      let fetchData: InvItem[] = await this.inventoryService.getInventoryDNormsByStones(stoneIds, " " as any);

      if (fetchData && fetchData.length > 0) {
        let isHoldFalseStoneIds = fetchData.filter(item => !item.isHold).map(item => item.stoneId);

        if (isHoldFalseStoneIds.length > 0) {
          this.alertDialogService.show(`The following StoneIds are not on hold: <b>${isHoldFalseStoneIds.join(', ')}</b>. Please check the inventory.`);
          return;
        }

        let fetchedStoneIds = fetchData.map(item => item.stoneId);
        let missingStoneIds = stoneIds.filter(id => !fetchedStoneIds.includes(id));

        if (missingStoneIds.length > 0) {
          this.alertDialogService.show(`These StoneIds <b>${missingStoneIds.join(', ')}</b> are not found in the inventory.`);
          return;
        }
      }

      if (stoneIds.length > 0) {
        this.alertDialogService.ConfirmYesNo("Are you sure you want to insert the Bid data?", "Insert")
          .subscribe(async (res: any) => {
            if (res.flag) {
              this.spinnerService.show();
              this.bidingObj.createdBy = this.fxCredentials?.fullName ?? "";

              let insertResult = await this.bidingSummaryService.insertBidingAsync(this.bidingObj);

              if (insertResult) {
                this.closeBidUploadDialog(form);
                await this.initBidInventoryData();
                this.utilityService.showNotification(`Bid data has been inserted successfully!`);
              }

              this.spinnerService.hide();
            }
          });
      }
    } catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(error.error || "An unexpected error occurred.");
    }
  }

  public async updateBidingData(form: NgForm) {
    try {
      let stoneIds = this.bidingObj.invDetailItems.map(s => s.stoneId);

      let fetchData: InvItem[] = await this.inventoryService.getInventoryDNormsByStones(stoneIds, " " as any);

      if (fetchData && fetchData.length > 0) {
        let isHoldFalseStoneIds = fetchData.filter(item => !item.isHold).map(item => item.stoneId);

        if (isHoldFalseStoneIds.length > 0) {
          this.alertDialogService.show(`The following StoneIds are not on hold: <b>${isHoldFalseStoneIds.join(', ')}</b>. Please check the inventory.`);
          return;
        }

        let fetchedStoneIds = fetchData.map(item => item.stoneId);
        let missingStoneIds = stoneIds.filter(id => !fetchedStoneIds.includes(id));

        if (missingStoneIds.length > 0) {
          this.alertDialogService.show(`These StoneIds <b>${missingStoneIds.join(', ')}</b> are not found in the inventory.`);
          return;
        }
      }

      if (stoneIds.length > 0) {
        this.alertDialogService.ConfirmYesNo("Are you sure you want to update the Bid data?", "Update")
          .subscribe(async (res: any) => {
            if (res.flag) {
              this.spinnerService.show();
              this.bidingObj.updatedBy = this.fxCredentials?.fullName ?? "";

              let res = await this.bidingSummaryService.updateBidingAsync(this.bidingSummary?.bidNumber, this.bidingObj);
              if (res) {
                this.closeBidUploadDialog(form);
                await this.initBidInventoryData();
                this.spinnerService.hide();
                this.utilityService.showNotification(`Bid data has been updated successfully!`)
              }
              this.spinnerService.hide();
            }
          });
      }
    } catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }
  //#endregion Dialogs Methods
}

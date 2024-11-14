import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { GridConfig, fxCredential } from 'shared/enitites';
import { NgxSpinnerService } from 'ngx-spinner';
import { UtilityService } from 'shared/services';
import { GridDetailConfig } from 'shared/businessobjects';
import { AlertdialogService } from 'shared/views';
import { DataResult, GroupDescriptor, SortDescriptor } from '@progress/kendo-data-query';
import { SelectableSettings } from '@progress/kendo-angular-grid';
import { SortFieldDescriptor } from 'projects/CRM.BackOffice/src/app/businessobjects';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { Router } from '@angular/router';
import { BidingResultDropDownData } from '../../businessobjects/biding/bidingResultDropdownData';
import { BidingSummaryService } from '../../services/biding/bidingSummary.service';
import { BidSearchFilter } from '../../businessobjects/biding/bidSearchFilter';
import { BidingItemService } from '../../services/biding/bidingItem.service';
import { BidingHistory } from '../../businessobjects/biding/bidingHistory';
import { environment } from 'environments/environment.prod';

@Component({
  selector: 'app-bidingHistory',
  templateUrl: './bidingHistory.component.html',
  styleUrl: './bidingHistory.component.css',
  encapsulation: ViewEncapsulation.None
})
export class BidingHistoryComponent implements OnInit {
  public groups: GroupDescriptor[] = [];
  public pageSize = 25;
  public skip = 0;
  public sort: SortDescriptor[] = [];
  public fields!: GridDetailConfig[];
  public gridView!: DataResult;
  public filterFlag = true;
  public selectableSettings: SelectableSettings = { mode: 'multiple' };
  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains',
  };

  //Start - Biding
  public excelFile: any[] = [];
  public totalStones = '0';
  public totalStonesPerCarat = '0';
  public totalStonesWeight = '0';
  public totalStonesAmount = '0';
  public bidHistoryItems: BidingHistory[] = [];
  public isPanel: boolean = false;
  public gridConfig!: GridConfig;
  private fxCredential!: fxCredential;
  public bidingResultDropDownData: BidingResultDropDownData[] = new Array<BidingResultDropDownData>();
  public bidSearchFilter: BidSearchFilter = new BidSearchFilter();
  public sortFieldDescriptors!: SortFieldDescriptor[];
  //End - Biding

  constructor(
    private bidingSummaryService: BidingSummaryService,
    private spinnerService: NgxSpinnerService,
    private alertDialogService: AlertdialogService,
    public utilityService: UtilityService,
    private bidingItemService: BidingItemService,
    private router: Router) {
  }

  public async ngOnInit() {
    await this.loadBidDropDownData();
    await this.defaultMethodsLoad();
    await this.loadApproveHistoryData();
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

  public async loadBidDropDownData() {
    try {
      this.spinnerService.show();
      this.bidingResultDropDownData = await this.bidingSummaryService.getBidingNumbers();
      this.bidSearchFilter.bidNumber = this.bidingResultDropDownData[0]?.bidNumber;
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async loadApproveHistoryData() {
    try {
      this.spinnerService.show();
      if (this.bidSearchFilter?.bidNumber) {
        let { invDetailItems } = await this.bidingSummaryService.getBidByBidNumber(this.bidSearchFilter.bidNumber);
        const approvedBidingItems = await this.bidingItemService.getAllApprovedBiddingItems(this.bidSearchFilter.bidNumber);

        let bidingData = Array.from(approvedBidingItems.reduce((acc, item) => {
          const customerId = item.customer.id;
          const invItems = invDetailItems
            .filter(invItem => invItem.stoneId === item.stoneId)
            .map(invItem => {
              let bidAmount = 0;
              let bidPerCT = 0;

              if (item.discount) {
                const offerDisc = parseFloat(item.discount?.toString() || "0");
                const weight = invItem?.weight || 0;
                const stoneRap = weight * (invItem.price?.rap ?? 0);
                const calDiscount = 100 + offerDisc;
                bidAmount = (calDiscount * stoneRap) / 100;
                bidPerCT = weight > 0 ? bidAmount / weight : 0;
              }

              return {
                ...invItem,
                discount: item.discount,
                bidAmount,
                bidPerCT,
                approvedBy: item.approvedBy,
                approvedDate: item.approvedDate,
                isApproved: item.isApproved,
              };
            });

          if (!acc.has(customerId)) {
            acc.set(customerId, new BidingHistory());
            acc.get(customerId).customer = item.customer;
          }
          acc.get(customerId).invDetailItems.push(...invItems);

          return acc;
        }, new Map()).values()) as BidingHistory[];

        this.bidHistoryItems = bidingData.map((res) => {
          const totalStones = res.invDetailItems.length;
          const totalWeight = res.invDetailItems.reduce((sum, item) => sum + (item.weight || 0), 0);
          const totalAmount = res.invDetailItems.reduce((sum, item: any) => sum + (item?.bidAmount || 0), 0);
          const totalPerCarat = totalWeight > 0 ? Math.round((totalAmount / totalWeight) * 100) / 100 : 0;

          return {
            ...res,
            totalStones,
            totalWeight,
            totalAmount,
            totalPerCarat
          };
        });
        this.totalStones = this.bidHistoryItems.reduce((sum, item) => sum + item.invDetailItems.length, 0).toFixed(2);
        this.totalStonesWeight = this.bidHistoryItems.reduce((sum, item) => {
          const invDetailWeight = item.invDetailItems.reduce((invSum, invItem) => invSum + (invItem.weight || 0), 0);
          return sum + invDetailWeight;
        }, 0).toFixed(2);;

        this.totalStonesAmount = this.bidHistoryItems.reduce((sum, item) => {
          const invDetailNetAmount = item.invDetailItems.reduce((invSum, invItem: any) => invSum + (invItem.bidAmount || 0), 0);
          return sum + invDetailNetAmount;
        }, 0).toFixed(2);
        this.totalStonesPerCarat = Number(this.totalStonesWeight) > 0
          ? Number((Number(this.totalStonesAmount) / Number(this.totalStonesWeight)).toFixed(2)).toString()
          : '0';
      }
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public sortChange(sort: SortDescriptor[]): void {
    this.sort = sort;
    this.sortFieldDescriptors = new Array<SortFieldDescriptor>();
    this.loadApproveHistoryData();
  }

  public groupChange(groups: GroupDescriptor[]): void {
    try {
      this.groups = groups;
      this.loadApproveHistoryData();
    }
    catch (error: any) {
      this.alertDialogService.show(error.error);
    }
  }

  public downloadExcel() {
    try {
      this.spinnerService.show();
      let data: any[] = [];
      this.excelFile = [];

      data = this.bidHistoryItems.reduce((acc: any[], element: BidingHistory) => {
        const invDetails = element.invDetailItems.map(invElement => ({
          ...invElement,
          customerName: element.customer.name,
          companyName: element.customer.companyName,
          email: element.customer.email
        }));
        return acc.concat(invDetails);
      }, []);

      if (data.length > 0) {
        this.generateExcelData(data);
        this.utilityService.exportAsExcelFile(this.excelFile, `Biding_History_Excel_${this.bidSearchFilter.bidNumber}_`);
      } else
        this.alertDialogService.show("No Data Found.");

      this.spinnerService.hide();
    }
    catch (error: any) {
      this.alertDialogService.show(error.error);
    }
  }

  private async generateExcelData(data: any[]) {
    this.excelFile = [];

    data.forEach(z => {
      var excel = {
        'Location': z.location,
        'StoneId': z.stoneId,
        'CustomerName': z.customerName,
        'CompanyName': z.companyName,
        'Email': z.email,
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
        'Bid Amt$': z.bidAmount,
        'Cur. Bid Disc%': z.curBidDisc,
        'Bid Disc%': z.discount,
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
}

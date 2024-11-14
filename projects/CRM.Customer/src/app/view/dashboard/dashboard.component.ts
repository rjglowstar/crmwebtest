import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { environment } from 'environments/environment';
import { NgxSpinnerService } from 'ngx-spinner';
import { SystemUser } from 'projects/CRM.FrontOffice/src/app/entities';
import { MasterConfig } from 'shared/enitites';
import { UtilityService } from 'shared/services';
import { CustomerDashboard, CustomerLanguageData, GraphData, InvDetailData, ParseCustomerSearchHistory, ParseSearchQuery, SchemeDetails, WatchListResponse, WatchListSearchCriteria } from '../../businessobjects';
import { CustFxCredential, Customer, ManageEvent, Scheme } from '../../entities';
import { AppPreloadService, CustomerDashboardService, CustomerPreferenceService, CustomerService, EventService, MasterConfigService, SchemeService, WatchlistService } from '../../services';
import { UserImageService } from '../../services/organization/userimage.service';
import { AlertdialogService } from 'shared/views';
import SwiperCore, { Autoplay, Navigation, Pagination } from 'swiper';
import { BidingSummaryService } from '../../services/biding/bidingSummary.service';
import * as moment from 'moment-timezone';

SwiperCore.use([Autoplay, Navigation, Pagination]);
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class DashboardComponent implements OnInit {

  private custFxCredential!: CustFxCredential;
  public custDashObj: CustomerDashboard = new CustomerDashboard();
  public customerLanguageDataObj: CustomerLanguageData = new CustomerLanguageData();
  public saveSearchData: ParseSearchQuery[] = [];
  public listWatchListResponse: WatchListResponse[] = [];
  public customerObj: Customer = new Customer();
  public chartShapeDispValue: number[] = [];
  public chartShapeDispText: string[] = [];
  public shapeData: any[] = [];
  public chartColor: string = '#6c757d';
  public invItemObj: InvDetailData = new InvDetailData();
  public showDiamonddetailModal = false;
  public watchlistItemCount: number = 0;
  public aiRecDiamondsCount: number = 0;
  public activeEventCount: number = 0;
  public newDiamondCount: number = 0;
  public eventObj: ManageEvent[] = [];
  public customerSellerObj: SystemUser = new SystemUser;
  public newDiamonds: InvDetailData[] = [];
  public aiRecommDiamonds: InvDetailData[] = [];
  public pieColor: string[] = ["#7b7b7b", "#8f8f8f", "#999999", "#a3a3a3", "#c0c0c0", "#d4d4d4", "#e8e8e8", "#f2f2f2", "#d6d6d6", "#e0e0e0", "#eaeaea", "#f4f4f4"];
  public language: string = 'en';
  public isWvdDialog: boolean = false;
  public Profilephoto: string = '';
  public aboutusPath: string = "";
  public voiwLevelDisc = 0;
  public schemeDetails: SchemeDetails[] = [];
  public vowTotalAmount = 0;
  public vowPercentage = 0;
  public vowDaysLeft = 0;
  public vowLevel = 0;
  public toLeastAmount = 0;
  public currentSchema: SchemeDetails = new SchemeDetails();
  public scheme: Scheme = new Scheme();
  public parseCustomerSearchHistory: ParseCustomerSearchHistory[] = [];
  public masterConfigList!: MasterConfig;
  public companyName: string = ""
  public companyMobileNumber: string = ""

  isBidEnded: boolean = false;
  public bidActive: boolean = false;
  public stoneTotalCount = '0';
  public timerInterval: any;
  public bidEndDate: Date = new Date();
  public orderDate: Date = new Date();
  public bidTimer = { days: '00', hours: '00', minutes: '00', seconds: '00' };
  public vowDayTimer = { days: '00', hours: '00', minutes: '00', seconds: '00' };

  public lastpurchaseAmt: number = 0;
  public eligibleWVD: number = 0;
  public nextEligibleWVD: number = 0;
  public isVowBannerDisplay: boolean = false;

  constructor(
    public customerDashboardService: CustomerDashboardService,
    private appPreloadService: AppPreloadService,
    private masterConfigService: MasterConfigService,
    private router: Router,
    private sanitizer: DomSanitizer,
    private spinnerService: NgxSpinnerService,
    private watchListService: WatchlistService,
    private customerService: CustomerService,
    private eventService: EventService,
    private translateService: TranslateService,
    public utilityService: UtilityService,
    public schemeService: SchemeService,
    public userImageService: UserImageService,
    private alertDialogService: AlertdialogService,
    private customerPreferenceService: CustomerPreferenceService,
    private bidingSummaryService: BidingSummaryService,
  ) { }

  async ngOnInit() {
    this.spinnerService.show();
    this.language = localStorage.getItem('language') ?? 'en';
    await this.initBidingData();
    this.startTimer();
    this.openWvdBannerDialog();
    this.companyName = this.utilityService.getCompanyNameFromUrl(window.location.href);
    this.aboutusPath = this.utilityService.getAboutUsPath(window.location.href);
    this.companyMobileNumber = this.utilityService.getCompanyMobileNumberFromUrl(window.location.href);
    await this.defaultMethods();
    this.startVOWTimer();
  }

  public async defaultMethods() {
    try {
      this.custFxCredential = await this.appPreloadService.fetchFxCredentials("");
      if (!this.custFxCredential)
        this.router.navigate(["login"]);

      await this.loadUserProfile();
      await this.getMasterConfigData();
      await this.getWatchListData();
      await this.loadSearchHistory();
      await this.getVowData();
      await this.loadCustomersData();
      this.spinnerService.hide();
      await this.setEvent();
      await this.setNewDiamond();
      await this.setRecDiamond()

    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
    }
  }

  public async loadUserProfile() {
    try {
      const res = await this.userImageService.getUserImageByIdent(this.custFxCredential.sellerId);
      if (res && res.image != "")
        this.Profilephoto = 'data:image/jpeg;base64,' + res?.image;
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }

  }
  public async getMasterConfigData() {
    //Master Config
    this.masterConfigList = await this.masterConfigService.getAllMasterConfig();
  }

  public async loadCustomersData() {
    try {
      this.customerObj = await this.customerService.getCustomerById(this.custFxCredential?.id);
      this.custDashObj = await this.customerDashboardService.getCustomerDashBoardById(this.custFxCredential?.id);

      this.saveSearchData = [];
      this.custDashObj.savedSearches.forEach(z => {
        let obj: ParseSearchQuery = new ParseSearchQuery();
        obj.name = z.name;
        obj.query = JSON.parse(z.query);
        obj.expiryDate = z.expiryDate;
        obj.createdAt = z.createdAt;
        this.saveSearchData.push(obj);
      });

      this.saveSearchData.forEach(a => {
        let shape: string[] = [];
        a.query.shape.forEach(z => {
          var config = this.masterConfigList.shape.find(c => c.name.toLowerCase() == z.toLowerCase() || c.displayName.toLowerCase() == z.toLowerCase() || c.optionalWords && c.optionalWords.map(u => u.toLowerCase().trim()).includes(z.toLowerCase()));
          if (config)
            z = config.displayName;
          shape.push(z);
        });
        a.query.shape = shape;
      });

      this.language = this.custDashObj.selectedLanguage;
      if (this.language) {
        this.translateService.setDefaultLang(this.language);
        window.localStorage.setItem('language', this.language);
      }
      else {
        this.language = 'en';
        this.translateService.setDefaultLang(this.language);
        window.localStorage.setItem('language', this.language);
        this.customerLanguageDataObj.customerID = this.custFxCredential?.id ?? '';
        this.customerLanguageDataObj.newLanguage = this.language;
        await this.customerService.updateCustomerLanguage(this.customerLanguageDataObj);
      }
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
    }
  }

  public async getWatchListData() {
    try {
      let watchListSearchCriteria: WatchListSearchCriteria = new WatchListSearchCriteria();
      watchListSearchCriteria.customerId = this.custFxCredential?.id;
      this.listWatchListResponse = await this.watchListService.getAllWatchLists(watchListSearchCriteria);
      if (this.listWatchListResponse) {
        this.listWatchListResponse.forEach(z => {
          this.utilityService.changeAdditionalDataForCustomerInv(z.inventoryDetail, this.masterConfigList.shape ?? []);
          z.inventoryDetail.imageURL = this.getSanitizeImage(z.inventoryDetail);
        });
        this.watchlistItemCount = this.listWatchListResponse.length;
      }
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
    }
  }

  public getSanitizeImage(inv: InvDetailData): SafeResourceUrl {
    let url = inv.media.isPrimaryImage
      ? environment.imageURL.replace('{stoneId}', inv.stoneId.toLowerCase())
      : "commonAssets/images/image-not-found.jpg";

    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  private async getVowData() {
    try {
      this.scheme = await this.schemeService.getOnlineSchemeAsync(true);
      if (this.scheme)
        this.schemeDetails = this.sortingSchemeDetail(this.scheme.details);
      let data = await this.customerDashboardService.getLatestVowData(this.custFxCredential?.id);

      if (data && data.length > 0) {
        this.vowTotalAmount = this.utilityService.ConvertToFloatWithDecimal(data.map(z => z.amount).reduce((ty, u) => ty + u, 0));
        if (this.scheme) {
          let schemeDetail = this.schemeDetails.find(c => c.from <= this.vowTotalAmount && this.vowTotalAmount <= c.to);
          if (schemeDetail) {
            this.currentSchema = schemeDetail;

            let leastAmount = (this.vowTotalAmount - schemeDetail.from);
            let toLeastAmount = (schemeDetail.to);
            this.toLeastAmount = toLeastAmount;
            this.voiwLevelDisc = schemeDetail.discount;
            this.vowPercentage = parseInt(((leastAmount / toLeastAmount) * 100).toString());
            this.vowLevel = this.schemeDetails.findIndex(z => z.id == schemeDetail?.id) + 1;
          }

          if (this.vowTotalAmount > 0) {
            var index = this.schemeDetails.findIndex(c => c.from <= this.vowTotalAmount && this.vowTotalAmount <= c.to);
            if (index >= 0) {
              this.eligibleWVD = this.schemeDetails[index].discount;
              if (this.schemeDetails.length >= index + 1)
                this.nextEligibleWVD = this.schemeDetails[index + 1].discount;
            }
          }
          else {
            var index = 0;
            if (index >= 0) {
              this.eligibleWVD = this.schemeDetails[index].discount;
              if (this.schemeDetails.length >= index + 1)
                this.nextEligibleWVD = this.schemeDetails[index + 1].discount;
            }
          }
        }
        let orderDate = data[0].orderDate;
        this.orderDate = orderDate;
        let daysdiff = this.utilityService.calculateDayDiff(orderDate);
        this.vowDaysLeft = (7 - daysdiff);
      }
      else {
        var index = 0;
        if (index >= 0) {
          this.eligibleWVD = this.schemeDetails[index].discount;
          if (this.schemeDetails.length >= index + 1)
            this.nextEligibleWVD = this.schemeDetails[index].discount;
        }
      }

      if (this.vowTotalAmount == 0) {
        this.vowLevel = 1;
      }

    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
    }
  }

  public sortingSchemeDetail(data: SchemeDetails[]) {
    data = data.sort((n1, n2) => {
      let np1 = n1.from;
      let np2 = n2.from;

      if (np1 > np2)
        return 1;

      if (np1 < np2)
        return -1;

      return 0;
    });
    return data;
  }

  public async loadSearchHistory() {
    try {
      let res = await this.customerDashboardService.getHistoryByCustomer(this.custFxCredential?.id, 0, 5);
      if (res) {
        let customerSearchHistoryData = res;
        this.parseCustomerSearchHistory = [];
        customerSearchHistoryData.forEach(z => {
          let obj = new ParseCustomerSearchHistory();
          obj.id = z.id;
          obj.customer = z.customer;
          obj.searchQuery = JSON.parse(z.searchQuery);
          obj.searchStoneIds = z.searchStoneIds;
          obj.createdDate = z.createdDate;
          this.parseCustomerSearchHistory.push(obj);
        });

        this.parseCustomerSearchHistory.forEach(a => {
          let shape: string[] = [];
          a.searchQuery.Shape.forEach((z: string) => {
            var config = this.masterConfigList.shape.find(c => c.name.toLowerCase() == z.toLowerCase() || c.displayName.toLowerCase() == z.toLowerCase() || c.optionalWords && c.optionalWords.map(u => u.toLowerCase().trim()).includes(z.toLowerCase()));
            if (config)
              z = config.displayName;
            shape.push(z);
          });
          a.searchQuery.Shape = shape;
        });
      }
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
    }
  }

  public goToSearchResultNewDiamond(): void {
    sessionStorage.setItem("NewDiamonds", "true");
    this.router.navigate(["searchresult"]);
  }

  public goToAiRecommendedDiamond(): void {
    let stoneIds = this.aiRecommDiamonds.map(s => s.stoneId);
    if (stoneIds.length > 0) {
      sessionStorage.setItem("AIRecommended", JSON.stringify(stoneIds));
      this.router.navigate(["searchresult"]);
    }
  }

  public goToSearchResultSaveSearch(e: any) {
    sessionStorage.setItem("SaveSearch", e);
    this.router.navigate(["searchresult"]);
  }

  public editSaveSearchInfo(e: any) {
    sessionStorage.setItem("SaveSearch", e);
    sessionStorage.setItem("IsEditSaveSearch", "true");
    this.router.navigate(["searchresult"]);
  }

  public async removeSaveSearch(name: string) {
    try {
      this.alertDialogService.ConfirmYesNo("Are you sure you want to delete save info?", "Delete Save Information")
        .subscribe(async (res: any) => {
          if (res.flag) {
            var customerPreference = await this.customerPreferenceService.getCustomerPreferenceByCustomer(this.custFxCredential?.id ?? '');
            if (customerPreference) {
              var index = this.saveSearchData.findIndex(z => z.name == name)

              customerPreference.savedSearches.splice(index, 1);
              var result = await this.customerPreferenceService.updateCustomerPreference(customerPreference);
              if (result) {
                await this.loadCustomersData();
                this.utilityService.showNotification('Save search removed!');
                this.spinnerService.hide();
              }
              else
                this.spinnerService.hide();
            }
          }
        });
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Something went wrong, Try again later!');
    }
  }

  public goToSearchResultHistory(e: any): void {
    sessionStorage.setItem("SearchHistory", e);
    this.router.navigate(["searchresult"]);
  }

  public openDiamonddetailSidebar(invObj: InvDetailData) {
    this.invItemObj = invObj;
    this.showDiamonddetailModal = true;
  }

  public navigateToSearchResult(shape: string): void {
    sessionStorage.setItem("SearchByShape", shape);
    this.router.navigate(["searchresult"]);
  }

  private async setEvent() {
    try {
      this.eventObj = await this.eventService.getAllUpcomingEvents();
      this.activeEventCount = this.eventObj.length;
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
    }
  }

  private async setNewDiamond() {
    try {
      this.newDiamonds = await this.customerDashboardService.getNewInventories();
      if (this.newDiamonds) {
        this.newDiamonds.forEach(z => {
          this.utilityService.changeAdditionalDataForCustomerInv(z, this.masterConfigList.shape ?? []);
          z.imageURL = this.getSanitizeImage(z);
        });
        this.newDiamondCount = this.newDiamonds.length;
      }
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
    }
  }

  private async setRecDiamond() {
    try {
      this.aiRecommDiamonds = await this.customerDashboardService.getCustomerAiSuggestions(this.custFxCredential?.id);
      this.aiRecDiamondsCount = this.aiRecommDiamonds.length;
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
    }
  }

  // VOW Section
  public pieData: any[] = [
    { category: '', value: 1500 },
    { category: '', value: 2000 },
    { category: '', value: 3000 },
    { category: '', value: 4000 },
    { category: '', value: 5000 },
    { category: '', value: 6000 },
    { category: '', value: 7000 },
    { category: '', value: 8000 },
    { category: '', value: 9000 },
    { category: '', value: 10000 },
    { category: '', value: 11000 }
  ];

  public openWvdBannerDialog(isBannerTrue?: boolean): void {
    const storedValue = localStorage.getItem('isVowBannerDisplay');
    if (storedValue !== null) {
      this.isVowBannerDisplay = JSON.parse(storedValue);
    }

    if (this.isVowBannerDisplay || isBannerTrue) {
      this.language = window.localStorage.getItem('language') ?? 'en';
      this.isWvdDialog = true;
    }
  }

  public closeWvdBannerDialog(): void {
    this.isWvdDialog = false;
    localStorage.removeItem('isVowBannerDisplay');
  }

  featureTab: number = 1;
  saveInfoTab: number = 1;

  // Custome tab index wise hide show -rj
  featuredSelectTab(tabIndex: number) {
    this.featureTab = tabIndex;
  }

  saveInfoSelectTab(tabIndex: number) {
    this.saveInfoTab = tabIndex;
  }

  getClassObject(shape: string): { [key: string]: boolean } {
    const classObject: { [key: string]: boolean } = {};
    if (shape) {
      classObject['icon_' + shape.replace(/[_ ]/g, '_').toLowerCase()] = true;
    } else {
      classObject['no_icon'] = true;
    }
    return classObject;
  }

  feaStoneSlider: any = {
    slidesPerView: 1,
    dot: false,
    navigation: true,
    grabCursor: false,
    speed: 800,
    effect: 'fade',
    fadeEffect: {
      crossFade: true,
    },
    autoplay: false,
    on: {
      init: (swiper: any) => {
        setTimeout(() => {
          swiper.autoplay.start();
        }, 5000);
      }
    },
  };

  allShapeSlider: any = {
    slidesPerView: 1,
    spaceBetween: 20,
    loop: true,
    speed: 5000,
    autoplay: {
      delay: 1,
      disableOnInteraction: false,
    },
    grabCursor: false,
    allowTouchMove: true,
    loopedSlides: 6,
    navigation: false,
    pagination: false,
    breakpoints: {
      550: {
        slidesPerView: 2,
      },
      991: {
        slidesPerView: 3,
        speed: 8000,
      },
      1200: {
        slidesPerView: 4
      },
      1600: {
        slidesPerView: 5,
        speed: 10000,
      },
      1800: {
        slidesPerView: 6,
        speed: 10000,
      }
    },
  };

  upComingEvent: any = {
    slidesPerView: 1,
    loop: true,
    speed: 1000,
    effect: 'fade',
    fadeEffect: {
      crossFade: true,
    },
    loopedSlides: 1,
    navigation: true,
    pagination: false,
  };

  //#region Bid Timer methods
  public async initBidingData(): Promise<void> {
    try {
      this.spinnerService.show();
      const res = await this.bidingSummaryService.getBidByIsActiveBid(true, false);
      if (res) {
        const { invDetailItems, isActiveBid, bidTimer } = res;
        this.bidActive = isActiveBid;
        this.bidEndDate = bidTimer.bidEnd;
        this.stoneTotalCount = invDetailItems?.length.toString();
      }
      this.spinnerService.hide();
    } catch (error: any) {
      this.alertDialogService.show(error.error || 'An error occurred');
      this.spinnerService.hide();
    }
  }

  private startTimer(): void {
    this.timerInterval = setInterval(() => {
      this.updateRemainingTime();
    }, 1000);
  }
  private startVOWTimer(): void {
    this.timerInterval = setInterval(() => {
      this.updateVowRemainingTime();
    }, 1000);
  }

  private updateRemainingTime(): void {
    const now = moment().utcOffset("+05:30");
    const end = moment(this.bidEndDate).utcOffset("+05:30");

    if (now.isBefore(end)) {
      const duration = moment.duration(end.diff(now));
      this.bidTimer = {
        days: Math.floor(duration.asDays()).toString().padStart(2, '0'),
        hours: duration.hours().toString().padStart(2, '0'),
        minutes: duration.minutes().toString().padStart(2, '0'),
        seconds: duration.seconds().toString().padStart(2, '0')
      };
    } else {
      this.isBidEnded = true;
      clearInterval(this.timerInterval);
    }
  }

  private updateVowRemainingTime(): void {
    if (this.vowTotalAmount > 0) {
      let now = moment();
      let vowEndDate = moment(this.orderDate).add(7, 'days');
      let duration = moment.duration(vowEndDate.diff(now));

      this.vowDayTimer = {
        days: Math.floor(duration.asDays()).toString().padStart(2, '0'),
        hours: duration.hours().toString().padStart(2, '0'),
        minutes: duration.minutes().toString().padStart(2, '0'),
        seconds: duration.seconds().toString().padStart(2, '0')
      };
    }
  }
  //#endregion Bid Timer methods

  // Method to format date range
  public getFormattedDateRange(startDate: Date, endDate: Date): string {
    const sDate = new Date(startDate);
    const eDate = new Date(endDate);

    if (sDate.getMonth() === eDate.getMonth())
      return `${sDate.getDate()}th - ${eDate.getDate()}th ${eDate.toLocaleString('default', { month: 'short' })} ${eDate.getFullYear()}`;
    else
      return `${sDate.getDate()}th ${sDate.toLocaleString('default', { month: 'short' })} - ${eDate.getDate()}th ${eDate.toLocaleString('default', { month: 'short' })} ${eDate.getFullYear()}`;
  }
}
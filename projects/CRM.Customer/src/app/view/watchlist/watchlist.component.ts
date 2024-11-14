import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from 'environments/environment';
import { NgxSpinnerService } from 'ngx-spinner';
import { MasterConfig, MasterDNorm } from 'shared/enitites';
import { UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { InvDetailData, WatchListResponse, WatchListSearchCriteria } from '../../businessobjects';
import { Cart, Customer } from '../../entities';
import { AppPreloadService, CartService, CustomerInvSearchService, CustomerService, MasterConfigService, WatchlistService } from '../../services';

@Component({
  selector: 'app-watchlist',
  templateUrl: './watchlist.component.html',
  styleUrl: './watchlist.component.css',
  encapsulation: ViewEncapsulation.None
})
export class WatchlistComponent implements OnInit {

  public customerId!: string;
  public watchListData: WatchListResponse = new WatchListResponse();
  public watchLists: WatchListResponse[] = new Array<WatchListResponse>();
  public selectedWatch: string[] = new Array<string>();
  public invItemObj: InvDetailData = new InvDetailData();
  public searchCriteria: WatchListSearchCriteria = new WatchListSearchCriteria();
  public totalRecord: number = 0;
  public addCart: Cart = new Cart();
  public selectedInventoryItems: WatchListResponse[] = [];
  public excelFile: any[] = [];
  public isExcelModal = false;
  public exportType: string = '';
  public masterConfigList!: MasterConfig;
  public allTheLab: Array<{ name: string; isChecked: boolean }> = [];
  public allTheShapes: Array<{ name: string; isChecked: boolean }> = [];
  public allColors: Array<{ name: string; isChecked: boolean }> = [];
  public allClarities: Array<{ name: string; isChecked: boolean }> = [];
  public allTheFluorescences: Array<{ name: string; isChecked: boolean }> = [];
  public allTheCPS: Array<{ name: string; isChecked: boolean }> = [];
  public shapesList: MasterDNorm[] = [];
  public labList: MasterDNorm[] = [];
  public colorList: MasterDNorm[] = [];
  public clarityList: MasterDNorm[] = [];
  public fluorList: MasterDNorm[] = [];
  public CPSList: MasterDNorm[] = [];
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
  public filterFlag = false;
  public showDiamonddetailModal = false;
  public stoneId = "";
  public certificateNo = "";

  constructor(
    public sanitizer: DomSanitizer,
    private alertDialogService: AlertdialogService,
    private spinnerService: NgxSpinnerService,
    private watchlistService: WatchlistService,
    private customerService: CustomerService,
    private cartService: CartService,
    public utilityService: UtilityService,
    private appPreloadService: AppPreloadService,
    private masterConfigService: MasterConfigService,
    private customerInvSearchService: CustomerInvSearchService
  ) { }

  async ngOnInit() {
    this.spinnerService.show();
    await this.getMasterConfigData();
    await this.getAllWatchlist();
  }

  public async getMasterConfigData() {
    try {
      let credential = await this.appPreloadService.fetchFxCredentials("");
      this.customerId = credential.id;

      this.masterConfigList = await this.masterConfigService.getAllMasterConfig();
      this.shapesList = this.masterConfigList.shape;
      let allTheShapes = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.shape);
      allTheShapes.forEach(z => { this.allTheShapes.push({ name: z.displayName, isChecked: false }); });

      this.colorList = this.masterConfigList.colors;
      let allColors = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.colors);
      allColors.forEach(z => { this.allColors.push({ name: z.name, isChecked: false }); });

      this.clarityList = this.masterConfigList.clarities;
      let allClarities = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.clarities);
      allClarities.forEach(z => { this.allClarities.push({ name: z.name, isChecked: false }); });

      this.fluorList = this.masterConfigList.fluorescence;
      let allTheFluorescences = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.fluorescence);
      allTheFluorescences.forEach(z => { this.allTheFluorescences.push({ name: z.name, isChecked: false }); });

      this.CPSList = this.masterConfigList.cps;
      let allTheCPS = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.cps);
      allTheCPS.forEach(z => { this.allTheCPS.push({ name: z.name, isChecked: false }); });

      this.labList = this.masterConfigList.lab;
      let allTheLab = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.lab);
      allTheLab.forEach(z => { this.allTheLab.push({ name: z.name, isChecked: false }); });
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async getAllWatchlist() {
    try {
      if (this.customerId) {
        this.spinnerService.show();

        this.searchCriteria.customerId = this.customerId;
        this.searchCriteria.stoneIds = this.stoneId ? this.utilityService.CheckStoneIds(this.stoneId).map(x => x.toUpperCase()) : [];
        this.searchCriteria.certificateNos = this.certificateNo ? this.utilityService.checkCertificateIds(this.certificateNo) : [];

        let searchCriteria: WatchListSearchCriteria = JSON.parse(JSON.stringify(this.searchCriteria));

        searchCriteria.shapes = [];
        this.searchCriteria.shapes.forEach(z => {
          if (this.masterConfigList.shape) {
            var obj = this.masterConfigList.shape.find(c => c.name.toLowerCase() == z.toLowerCase() || c.displayName.toLowerCase() == z.toLowerCase() || c.optionalWords && c.optionalWords.map(u => u.toLowerCase().trim()).includes(z.toLowerCase()));
            if (obj) {
              searchCriteria.shapes.push(obj.name);
            }
          }
        });

        this.watchLists = await this.watchlistService.getAllWatchLists(searchCriteria);
        this.watchLists.forEach(z => {
          if (this.masterConfigList.shape)
            this.utilityService.changeAdditionalDataForCustomerInv(z.inventoryDetail, this.masterConfigList.shape ?? []);

        });
        this.spinnerService.hide();
      }
    } catch (error: any) {
      this.alertDialogService.show(error);
      this.spinnerService.hide();
    }
  }

  public selectWatch(id: string) {
    if (!this.selectedWatch.some(x => x == id)) {
      this.selectedWatch.push(id);
      this.selectedInventoryItems = this.watchLists.filter(z => this.selectedWatch.includes(z.id));
    }
    else {
      let index = this.selectedWatch.findIndex(x => x == id);
      this.selectedWatch.splice(index, 1);
    }
  }

  public async addToCart(invItemId: string) {
    if (invItemId && this.watchLists.some(c => c.invItemId == invItemId)) {
      this.alertDialogService.ConfirmYesNo("Are you sure you want to add to cart?", "Cart")
        .subscribe(async (res: any) => {
          if (res.flag) {
            try {
              this.spinnerService.show();
              this.addCart = new Cart();
              let watch = this.watchLists.find(c => c.invItemId == invItemId);
              if (watch) {
                this.addCart.customer = watch.customer;
                this.addCart.invId = watch.invItemId;
                this.addCart.stoneId = watch.invItemNumber;
                this.addCart.WebPlatform = "Online";

                // get seller details
                let customerDetail: Customer = await this.customerService.getCustomerById(watch.customer.id);
                if (customerDetail && customerDetail.seller)
                  this.addCart.seller = customerDetail.seller;

                //call add to cart
                let id = await this.cartService.insertCartAsync(this.addCart);
                if (id) {
                  this.selectedWatch = [watch.id];
                  let flag = await this.watchlistService.removeFromWatchList(this.selectedWatch);
                  if (flag) {
                    await this.getAllWatchlist();
                    this.selectedWatch = [];
                    this.spinnerService.hide();
                  }
                  this.utilityService.showNotification(`Successfully added in Cart`);
                }
              }
              this.spinnerService.hide();
            } catch (error: any) {
              console.error(error);
              this.spinnerService.hide();
              if (error && error.error && error.error.includes('hold proccess') || error.error.includes('already added'))
                this.alertDialogService.show(error.error);
              else
                this.alertDialogService.show('Something went wrong, Try again later!');
            }
          }
        });
    }
  }

  public removeWatchlist() {
    try {
      if (this.selectedWatch.length > 0) {
        this.alertDialogService.ConfirmYesNo("Are you sure you want to delete?", "Delete")
          .subscribe(async (res: any) => {
            if (res.flag) {
              this.spinnerService.show();
              let flag = await this.watchlistService.removeFromWatchList(this.selectedWatch);
              if (flag) {
                await this.getAllWatchlist();
                this.selectedWatch = [];
                this.spinnerService.hide();
              }
            }
          });
      }
    } catch (error: any) {
      this.alertDialogService.show(error);
      this.spinnerService.hide();
    }
  }

  public async clearSearch() {
    try {
      this.spinnerService.show();

      this.searchCriteria = new WatchListSearchCriteria();
      this.allTheShapes.forEach(c => c.isChecked = false);
      this.allColors.forEach(c => c.isChecked = false);
      this.allClarities.forEach(c => c.isChecked = false);
      this.allTheCPS.forEach(c => c.isChecked = false);
      this.allTheFluorescences.forEach(c => c.isChecked = false);
      this.allTheLab.forEach(c => c.isChecked = false);

      this.stoneId = "";
      this.certificateNo = "";

      await this.getAllWatchlist();
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public openDiamonddetailSidebar(invObj: InvDetailData) {
    this.invItemObj = invObj;
    this.showDiamonddetailModal = true;
  }

  public filterSidebar() {
    this.filterFlag = !this.filterFlag;
  }

  public sanitizeURL(invObj: InvDetailData) {
    let url = (invObj && invObj.media && invObj.media.isPrimaryImage)
      ? environment.imageURL.replace('{stoneId}', invObj.stoneId.toLowerCase())
      : "commonAssets/images/image-not-found.jpg";
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  public async exportExcelNew(watchData: WatchListResponse[]) {
    try {
      if (this.watchLists.length > 0) {
        let stoneIds: any[] = [];
        watchData.forEach(z => {
          stoneIds.push(z.inventoryDetail.stoneId)
        });

        let data = await this.customerInvSearchService.getInvDetailByStoneIdsAsync(stoneIds);

        data.forEach(z => {
          z.imageURL = environment.imageURL;
          z.videoURL = environment.videoURL;
          z.certiURL = environment.certiURL;
          z.otherImageBaseURL = environment.otherImageBaseURL;
        })

        let response = await this.customerService.downloadExcel(data);
        if (response) {
          var downloadURL = window.URL.createObjectURL(response);
          var link = document.createElement('a');
          link.href = downloadURL;
          link.download = `${this.utilityService.exportFileName(this.utilityService.replaceSymbols('WatchList_Excel'))}`;
          link.click();
        }
      }
    } catch (error: any) {
      this.alertDialogService.show("something went wrong, please try again or contact administrator");
      this.spinnerService.hide();
    }
  }

  public openExcelFile() {
    this.isExcelModal = true;
  }
  public closeExcelDialog() {
    this.isExcelModal = false;
  }

  public async exportToExcel() {
    try {
      this.spinnerService.show();
      let data: WatchListResponse[] = [];
      if (this.exportType == 'Selected') {
        if (this.selectedWatch.length == 0) {
          this.spinnerService.hide();
          this.alertDialogService.show('No selected stone(s) found!');
          return;
        }
        data = this.selectedInventoryItems;
      }
      else if (this.exportType == 'Search') {
        let res = await this.watchlistService.getAllWatchLists(this.searchCriteria);
        if (res)
          data = res;
      } else {
        this.spinnerService.hide();
        this.alertDialogService.show('Select type for export to excel!');
        return;
      }

      await this.exportExcelNew(data);
      this.closeExcelDialog();
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

}
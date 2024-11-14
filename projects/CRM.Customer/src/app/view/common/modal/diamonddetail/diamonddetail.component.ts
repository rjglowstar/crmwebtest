import { Component, EventEmitter, Input, OnInit, Output, Renderer2, ViewEncapsulation } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { environment } from 'environments/environment';
import { NgxSpinnerService } from 'ngx-spinner';
import { RapPriceRequest } from 'shared/businessobjects';
import { MasterDNorm } from 'shared/enitites';
import { UtilityService, ViewActionImageType } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { InvDetailData } from '../../../../businessobjects';
import { Cart, CustFxCredential, Customer, CustomerDNorm, WatchList } from '../../../../entities';
import { CartService, CustomerInvSearchService, CustomerService, InventoryService, MasterConfigService, WatchlistService } from '../../../../services';
import { Router } from '@angular/router';

@Component({
  selector: 'app-diamonddetail',
  templateUrl: './diamonddetail.component.html',
  styleUrl: './diamonddetail.component.css',
  encapsulation: ViewEncapsulation.None
})
export class DiamondDetailComponent implements OnInit {
  @Input() stoneId: string = '';
  @Input() diamonddetailFlag: boolean = false;
  @Input() bidingFlag: boolean = false;
  @Input() isWatchList: boolean = false;
  @Output() closeDialog = new EventEmitter();

  public invItemObj: InvDetailData = new InvDetailData();
  public fxCredentials?: CustFxCredential;
  public customer: CustomerDNorm = new CustomerDNorm();
  public ViewActionImageType = ViewActionImageType;
  public calInvItemObj: InvDetailData = new InvDetailData();

  public isCheckout = false;
  public pageFrom: string = "DiamondDetail";
  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains',
  };

  public invIds: string[] = [];
  public totalAmount: number = 0;

  public showVideo = false;
  public showImage = false;
  public showCertificate = false;
  public isCalcDialog: boolean = false;

  public imageType = '';

  public allTheShapes: MasterDNorm[] = [];
  public allTheColor: MasterDNorm[] = [];
  public allTheClarity: MasterDNorm[] = [];

  public totalRap: number = 0;

  constructor(public sanitizer: DomSanitizer,
    public utilityService: UtilityService,
    private spinnerService: NgxSpinnerService,
    private alertdialogService: AlertdialogService,
    private customerService: CustomerService,
    private inventoryService: CustomerInvSearchService,
    private invService: InventoryService,
    private cartService: CartService,
    private masterConfigService: MasterConfigService,
    private watchlistService: WatchlistService,
    private router: Router,
    private renderer: Renderer2,) { }

  public async ngOnInit() {
    this.fxCredentials = JSON.parse(sessionStorage.getItem("fxCredentials") ?? '') as CustFxCredential;
    this.spinnerService.show();
    await this.getMasterConfigData();
    await this.getCustomer();
    await this.getInvDetailData();
    this.isBodyScrollHidden(true);
  }

  public async getInvDetailData() {
    try {
      if (this.stoneId.length > 0) {
        var res = await this.inventoryService.getInvDetailByStoneIdAsync(this.stoneId);
        if (res) {
          if (this.allTheShapes)
            this.utilityService.changeAdditionalDataForCustomerInv(res, this.allTheShapes ?? []);

          this.invItemObj = res;

          this.invItemObj.videoURL = await this.sanitizeURL('video');
          this.showVideo = true;
          this.invItemObj.imageURL = this.sanitizeURL('image');
          this.invItemObj.certiURL = this.sanitizeURL('cert');
        }
        else
          this.alertdialogService.show('Invetory not found, Try again later');
      }
      this.spinnerService.hide();
    } catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertdialogService.show('Invetory not found, Try again later');
    }
  }

  public async getCustomer() {
    try {
      var res = await this.customerService.getCustomerDNormByIdAsync(this.fxCredentials?.id ?? '');
      if (res)
        this.customer = res;
      else
        this.alertdialogService.show('Customer not found, Try login again');
    } catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertdialogService.show('Customer not found, Try login again');
    }
  }

  //#region Master Config Data
  public async getMasterConfigData() {
    //Master Config
    let masterConfigList = await this.masterConfigService.getAllMasterConfig();
    this.allTheShapes = this.utilityService.sortingMasterDNormPriority(masterConfigList.shape);
    this.allTheColor = this.utilityService.sortingMasterDNormPriority(masterConfigList.colors);
    this.allTheClarity = this.utilityService.sortingMasterDNormPriority(masterConfigList.clarities);
  }
  //#endregion

  public async addToWatchList() {
    try {
      this.spinnerService.show();
      var obj = this.mappingToWatchList(this.invItemObj);
      var res = await this.watchlistService.insertWatchList(obj);
      if (res) {
        this.alertdialogService.show(res);
        this.spinnerService.hide();
      } else {
        this.spinnerService.hide();
        this.alertdialogService.show('Something went wrong, Try again later!');
      }
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertdialogService.show('Something went wrong, Try again later!');
    }
  }

  private mappingToWatchList(inv: InvDetailData): WatchList {
    let obj = new WatchList();
    obj.invItemId = inv.invId;
    obj.invItemNumber = inv.stoneId;
    obj.oldDiscount = inv.price?.discount ?? 0;
    obj.customer = this.customer;
    obj.addedAt = new Date();
    return obj;
  }

  public async addToCart() {
    this.alertdialogService.ConfirmYesNo("Are you sure you want to add to cart?", "Cart")
      .subscribe(async (res: any) => {
        if (res.flag) {
          try {
            this.spinnerService.show();
            let cart = new Cart();
            cart.customer = this.customer;
            cart.invId = this.invItemObj.invId;
            cart.stoneId = this.invItemObj.stoneId;
            cart.WebPlatform = "Online";

            // get seller details
            let customerDetail: Customer = await this.customerService.getCustomerById(this.customer.id);
            if (customerDetail && customerDetail.seller)
              cart.seller = customerDetail.seller;

            //call add to cart
            let id = await this.cartService.insertCartAsync(cart);
            if (id)
              this.alertdialogService.show(`Successfully added in Cart`);

            this.spinnerService.hide();
          } catch (error: any) {
            console.error(error);
            this.spinnerService.hide();
            if (error && error.error && error.error.includes('hold proccess') || error.error.includes('already added'))
              this.alertdialogService.show(error.error);
            else
              this.alertdialogService.show('Something went wrong, Try again later!');
          }
        }
      });

  }

  public async openCheckoutDialog(): Promise<void> {
    this.invIds = [];
    this.invIds.push(this.invItemObj.invId);
    if (this.invIds && this.invIds.length > 0) {
      let validationMessage = await this.cartService.getCheckCartValidInventoryAsync(this.invIds);
      if (validationMessage)
        return this.alertdialogService.show(validationMessage);

      this.totalAmount = (this.invItemObj.price.netAmount ?? 0);

      this.isCheckout = true;
    }
  }

  public async parentMethodCall() {
    this.isCheckout = false;
  }

  closeMediaDialog() {
    this.closeDialog.emit(false);
  }

  public closeDiamonddetailSidebar() {
    this.closeDialog.emit(false);
    this.isBodyScrollHidden(false);
  }

  public sanitizeURL(type: string) {
    let url: string = "commonAssets/images/image-not-found.jpg";
    switch (type.toLowerCase()) {
      case "image":
        if (this.imageType == ViewActionImageType.Primary) {
          url = this.invItemObj.media.isPrimaryImage
            ? environment.imageURL.replace('{stoneId}', this.invItemObj.stoneId.toLowerCase())
            : "commonAssets/images/image-not-found.jpg";
        }
        else if (this.imageType == ViewActionImageType.Heart) {
          url = this.invItemObj.media.isHeartBlack
            ? environment.otherImageBaseURL.replace('{stoneId}', this.invItemObj.stoneId.toLowerCase()) + environment.invStoneHeartBlackImageUrl
            : "commonAssets/images/image-not-found.jpg";
        }
        else if (this.imageType == ViewActionImageType.Arrow) {
          url = this.invItemObj.media.isArrowBlack
            ? environment.otherImageBaseURL.replace('{stoneId}', this.invItemObj.stoneId.toLowerCase()) + environment.invStoneArrowBlackImageUrl
            : "commonAssets/images/image-not-found.jpg";
        }
        break;
      case "video":
        url = this.invItemObj.media.isHtmlVideo
          ? environment.videoURL.replace('{stoneId}', this.invItemObj.stoneId.toLowerCase())
          : "commonAssets/images/video-not-found.png";
        break;
      case "cert":
        url = this.invItemObj.media.isCertificate
          ? environment.certiURL.replace('{certiNo}', this.invItemObj.certificateNo)
          : "commonAssets/images/certi-not-found.png";
        break;
      case "download":
        url = this.invItemObj.media.isDownloadableVideo
          ? environment.otherImageBaseURL.replace('{stoneId}', this.invItemObj.stoneId.toLowerCase()) + "/video.mp4"
          : "commonAssets/images/video-not-found.png";
        break;
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  public async onDataChanges() {
    var shape = this.allTheShapes.find(z => z.displayName == this.calInvItemObj.shape)?.name ?? 'rbc';
    let rapPrice: RapPriceRequest = {
      shape: shape,
      weight: this.calInvItemObj.weight,
      color: this.calInvItemObj.color,
      clarity: this.calInvItemObj.clarity
    }
    let res = await this.invService.getRapPrice(rapPrice);
    if (res) {
      this.calInvItemObj.price.rap = res.price;
      this.calculatePricingData();
    }
  }

  public calculatePricingData() {
    let rap = this.calInvItemObj.price.rap;
    let disc = this.calInvItemObj.price.discount ?? 0;
    disc = ((disc.toString() == '' || disc.toString() == '-') ? 0 : disc);
    if (rap != null && disc != null) {
      rap = parseFloat(rap.toString() ?? 0);
      disc = parseFloat(disc.toString() ?? 0);

      let stoneRap = this.calInvItemObj.weight * rap;
      let calDiscount = 100 + disc;
      let netAmount = (calDiscount * stoneRap) / 100;

      this.calInvItemObj.price.netAmount = this.utilityService.ConvertToFloatWithDecimal(netAmount);
      let perCarat = netAmount / this.calInvItemObj.weight;
      this.calInvItemObj.price.perCarat = this.utilityService.ConvertToFloatWithDecimal(perCarat);
      this.totalRap = ((this.calInvItemObj.price.rap ?? 0) * this.calInvItemObj.weight);
      this.totalRap = this.utilityService.ConvertToFloatWithDecimal(this.totalRap);
    }
  }

  public discountChanges(type: string) {
    if (this.calInvItemObj.price.discount?.toString() != "-" && this.calInvItemObj.price.discount?.toString() != "") {
      if (type == 'plus')
        this.calInvItemObj.price.discount = Number(this.calInvItemObj.price.discount ?? 0) + 0.5;
      else
        this.calInvItemObj.price.discount = Number(this.calInvItemObj.price.discount ?? 0) - 0.5;
      this.calculatePricingData();
    }
  }

  public viewImage(type: string) {
    this.imageType = type;
    this.invItemObj.imageURL = this.sanitizeURL('image');
    this.showVideo = false;
    this.showImage = true;
    this.showCertificate = false;
  }

  public viewVideo() {
    this.showVideo = true;
    this.showImage = false;
    this.showCertificate = false;
  }

  public DownloadVideo() {
    this.invItemObj.videoURL = this.sanitizeURL('download');
    this.showVideo = true;
    this.showImage = false;
    this.showCertificate = false;
  }

  public viewCertificate() {
    this.showVideo = false;
    this.showImage = false;
    this.showCertificate = true;
  }

  public async openCalcDialog() {
    this.isCalcDialog = true;
    this.calInvItemObj = JSON.parse(JSON.stringify(this.invItemObj));
    await this.onDataChanges();
  }

  public closeCalcDialog(): void {
    this.isCalcDialog = false;
  }

  public openDiamondDetails(inv: InvDetailData) {
    const stateData = { isBiding: this.bidingFlag };
    const encodedData = btoa(JSON.stringify(stateData));
    sessionStorage.setItem('diamondStateData', encodedData);
    
    const url = this.router.serializeUrl(
      this.router.createUrlTree(['/diamond-detail/', inv.stoneId])
    );
    window.open(url, '_blank');
    sessionStorage.removeItem('diamondStateData');
  }

  public isBodyScrollHidden(isScrollHide: boolean) {
    const action = isScrollHide ? 'addClass' : 'removeClass'
    this.renderer[action](document.body, 'hiddenScroll');
  }

}

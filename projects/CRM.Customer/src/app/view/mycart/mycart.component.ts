import { Component, OnInit, Renderer2, ViewEncapsulation } from '@angular/core';
import { NgForm } from '@angular/forms';
import { DataResult, process } from '@progress/kendo-data-query';
import { environment } from 'environments/environment';
import { NgxSpinnerService } from 'ngx-spinner';
import { DbLog, MasterConfig, MasterDNorm } from 'shared/enitites';
import { LogService, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { CartItem, CartSearchCriteria, ExportToExcelMailData, InvDetailData, InvItem } from '../../businessobjects';
import { Cart, Customer, CustomerDNorm, Scheme } from '../../entities';
import { AppPreloadService, CartService, CustomerDashboardService, CustomerInvSearchService, CustomerService, EmailService, LeadService, MasterConfigService, SchemeService } from '../../services';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-mycart',
  templateUrl: './mycart.component.html',
  styleUrl: 'mycart.component.css',
  encapsulation: ViewEncapsulation.None
})
export class MycartComponent implements OnInit {
  public filterFlag = false;
  public isDiamondDialog = false;
  public isImageDialog = false;
  public isCertiDialog = false;
  public isSendMail = false;
  public isCheckout = false;
  public pageFrom: string = "MyCart";
  public totalPcs: number = 0;
  public totalWt: number = 0.00;
  public totalAmt: number = 0;
  public selectedPcs: number = 0;
  public selectedWt: number = 0.00;
  public selectedAmt: number = 0;
  public lastPurchase: number = 0.00;
  public totalVowValue: number = 0.00;
  public appliedVowDisc: number = 0.00;
  public appliedVowAmt: number = 0.00;
  public paybleAmount: number = 0.00;
  public isCompareDialog: boolean = false;
  public showDiamonddetailModal: boolean = false;
  public stoneId: string = "";
  public selectedCartItems: CartItem[] = [];
  public filterStoneId = "";
  public filterCertificateNo = "";
  public masterConfigList!: MasterConfig;

  public mediaSrc: string = "";
  public mediaType: string = "";
  public isShowMedia: boolean = false;
  public ShapesList: MasterDNorm[] = [];
  public LabList: MasterDNorm[] = [];
  public ColorList: MasterDNorm[] = [];
  public ClarityList: MasterDNorm[] = [];
  public FluorList: MasterDNorm[] = [];
  public CPSList: MasterDNorm[] = [];
  public searchCriteria: CartSearchCriteria = new CartSearchCriteria();
  public allTheLab: Array<{ name: string; isChecked: boolean }> = [];
  public allTheShapes: Array<{ name: string; isChecked: boolean }> = [];
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
  private scheme: Scheme = new Scheme();
  public gridView!: DataResult;
  public mySelection: string[] = new Array<string>();
  public stoneIds: string[] = new Array<string>();
  public exportToExcelMailObj: ExportToExcelMailData = new ExportToExcelMailData();
  public excelFile: any[] = [];
  public invIds: string[] = new Array<string>();
  private customerName: string = '';
  private customerId: string = '';
  public isExcelModal: boolean = false;
  public exportType: string = ' ';
  public cartData: CartItem[] = [];
  public aiRecommDiamonds: InvDetailData[] = [];
  public addCart: Cart = new Cart();

  constructor(public utilityService: UtilityService,
    private masterConfigService: MasterConfigService,
    private appPreloadService: AppPreloadService,
    private cartService: CartService,
    private leadService: LeadService,
    private schemeService: SchemeService,
    private customerInvSearchService: CustomerInvSearchService,
    private alertDialogService: AlertdialogService,
    private spinnerService: NgxSpinnerService,
    private customerService: CustomerService,
    private emailService: EmailService,
    private logService: LogService,
    public customerDashboardService: CustomerDashboardService,
    private sanitizer: DomSanitizer,
    private renderer: Renderer2
  ) { }

  async ngOnInit() {
    this.spinnerService.show();
    await this.getMasterConfigData();
    await this.LoadCartItemsAsync();
    await this.getRecDiamond()
    this.spinnerService.hide();
  }

  public async getMasterConfigData() {
    try {

      let credential = await this.appPreloadService.fetchFxCredentials("");
      this.searchCriteria.customerId = credential.id;
      this.customerId = credential.id;
      this.customerName = credential.fullName;

      //Master Config
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

      //Online Vow Disocount
      this.scheme = await this.schemeService.getOnlineSchemeAsync(true);
      this.lastPurchase = await this.leadService.getLastPurchaseAmountForVow(credential.id);

    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async LoadCartItemsAsync() {
    try {

      this.searchCriteria.stoneIds = this.filterStoneId ? this.utilityService.CheckStoneIds(this.filterStoneId) : [];
      this.searchCriteria.certificateNos = this.filterCertificateNo ? this.utilityService.checkCertificateIds(this.filterCertificateNo) : [];
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

      let response: CartItem[] = await this.cartService.getCartItemsByCriteriaAsync(searchCriteria);
      this.cartData = response;
      if (response && response.length > 0) {
        response.forEach(z => {
          if (z.invItem.shape.toLowerCase() != 'rbc' && z.invItem.shape.toLowerCase() != 'round')
            z.invItem.cut = '';

          if (this.masterConfigList.shape) {
            var obj = this.masterConfigList.shape.find(c => c.name.toLowerCase() == z.invItem.shape.toLowerCase() || c.displayName.toLowerCase() == z.invItem.shape.toLowerCase() || c.optionalWords && c.optionalWords.map(u => u.toLowerCase().trim()).includes(z.invItem.shape.toLowerCase()));
            if (obj)
              z.invItem.shape = obj.displayName;
          }
        });
      }
      this.gridView = process(response, {});
      this.gridView.total = response.length;

      this.totalPcs = response.length;
      this.totalWt = Number(parseFloat(response.reduce((ty, u) => ty + u.invItem.weight, 0).toFixed(2)));
      this.totalAmt = Number(parseFloat(response.reduce((ty, u) => ty + (u.invItem.price.netAmount ? u.invItem.price.netAmount : 0), 0).toFixed(2)));

    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async getMyCartItem() {
    try {
      this.spinnerService.show();
      await this.LoadCartItemsAsync();
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
      this.allColors.forEach(c => c.isChecked = false);
      this.allClarities.forEach(c => c.isChecked = false);
      this.allTheCPS.forEach(c => c.isChecked = false);
      this.allTheFluorescences.forEach(c => c.isChecked = false);
      this.allTheLab.forEach(c => c.isChecked = false);
      await this.LoadCartItemsAsync();
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async exportExcelNew(cartdata: CartItem[]) {
    try {
      let stoneIds = cartdata.map(z => z.invItem.stoneId);
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
        link.download = `${this.utilityService.exportFileName(this.utilityService.replaceSymbols('Cart_Excel'))}`;
        link.click();
      }
    } catch (error: any) {
      this.alertDialogService.show("something went wrong, please try again or contact administrator");
      this.spinnerService.hide();
    }
  }

  public async downloadAttachment() {
    try {
      let stoneIds: string[] = [];

      if (this.exportType === 'Selected') {
        if (this.mySelection.length === 0) {
          this.spinnerService.hide();
          this.alertDialogService.show('No selected stone(s) found!');
          return;
        }

        stoneIds = this.selectedCartItems.map(r => r.invItem.stoneId);
      }
      else if (this.exportType === 'Search') {
        stoneIds = this.gridView.data.map(z => z.invItem.stoneId);
      }
      else {
        this.spinnerService.hide();
        this.alertDialogService.show('Please select an export type!');
        return;
      }

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
        link.download = `${this.utilityService.exportFileName(this.utilityService.replaceSymbols('Diamond_Excel'))}`;
        link.click();
      }
    } catch (error: any) {
      this.alertDialogService.show("something went wrong, please try again or contact administrator");
      this.spinnerService.hide();
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

      this.spinnerService.show();
      let data: InvDetailData[] = [];
      if (this.exportType === 'Selected') {
        if (this.mySelection.length === 0) {
          this.spinnerService.hide();
          this.alertDialogService.show('No selected stone(s) found!');
          return;
        }

        const stoneIds = this.selectedCartItems.map(r => r.invItem.stoneId);
        data = await this.customerInvSearchService.getInvDetailByStoneIdsAsync(stoneIds);
      }
      else if (this.exportType === 'Search') {
        const stoneIds = this.cartData.map(s => s.invItem.stoneId);
        data = await this.customerInvSearchService.getInvDetailByStoneIdsAsync(stoneIds);
      }
      else {
        this.spinnerService.hide();
        this.alertDialogService.show('Please select an export type!');
        return;
      }

      if (!data || data.length === 0) {
        this.spinnerService.hide();
        this.alertDialogService.show('No data found for the selected criteria!');
        return;
      }

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

  public removeCart() {
    if (this.mySelection && this.mySelection.length > 0) {
      this.alertDialogService.ConfirmYesNo("You Sure You Want To Remove From Cart", "Cart").subscribe(async (result: any) => {
        if (result.flag) {

          try {
            this.spinnerService.show();
            if (this.mySelection && this.mySelection.length > 0) {
              var flag = await this.cartService.deleteCartsAsync(this.mySelection);
              if (flag) {

                let cartItems: Array<CartItem> = JSON.parse(JSON.stringify(this.gridView.data.filter(c => this.mySelection.includes(c.id))));
                let invItems: Array<InvItem> = new Array<InvItem>();
                if (cartItems && cartItems.length > 0) {
                  for (let index = 0; index < cartItems.length; index++) {
                    const element = cartItems[index];
                    invItems.push(element.invItem);
                  }
                }

                this.alertDialogService.show('Stone(s) removed successfully!');
                for (let index = 0; index < this.mySelection.length; index++) {
                  let cartId = this.mySelection[index];
                  this.gridView.data.splice(this.gridView.data.findIndex(c => c.id == cartId), 1);
                }
              }
            }
            this.mySelection = [];
            this.getSelectedRowID();
            this.spinnerService.hide();
          }
          catch (error: any) {
            console.error(error);
            this.spinnerService.hide();
            this.alertDialogService.show(error.error);
          }
        }
      });
    }
  }

  public getSelectedRowID(): void {
    if (this.mySelection.length > 0) {
      this.selectedCartItems = this.gridView.data.filter(z => this.mySelection.includes(z.id));
      this.selectedPcs = this.mySelection.length;
      this.selectedWt = Number(parseFloat(this.gridView.data.filter(c => this.mySelection.includes(c.id)).reduce((ty, u) => ty + u.invItem.weight, 0).toFixed(2)));
      this.selectedAmt = Number(parseFloat(this.gridView.data.filter(c => this.mySelection.includes(c.id)).reduce((ty, u) => ty + u.invItem.price.netAmount, 0).toFixed(2)));
      this.stoneIds = this.gridView.data.filter(c => this.mySelection.includes(c.id)).map(j => j.invItem.stoneId);
      this.CalculateVow();
    }
    else {
      this.selectedPcs = 0;
      this.selectedWt = 0;
      this.selectedAmt = 0;
      this.appliedVowDisc = 0;
      this.appliedVowAmt = 0;
      this.paybleAmount = 0;
      this.stoneIds = new Array<string>();
    }

    if (this.gridView.data.length > 0) {
      this.totalPcs = this.gridView.data.length;
      this.totalWt = Number(parseFloat(this.gridView.data.reduce((ty, u) => ty + u.invItem.weight, 0).toFixed(2)));
      this.totalAmt = Number(parseFloat(this.gridView.data.reduce((ty, u) => ty + (u.invItem.price.netAmount ? u.invItem.price.netAmount : 0), 0).toFixed(2)));
    }
    else {
      this.totalPcs = 0;
      this.totalWt = 0;
      this.totalAmt = 0;
    }
  }

  public async CalculateVow() {
    try {
      if (this.mySelection && this.mySelection.length > 0) {
        this.appliedVowDisc = 0;
        this.appliedVowAmt = 0;
        this.paybleAmount = 0;

        if (this.scheme) {
          var cartItems = this.gridView.data.filter(c => this.mySelection.includes(c.id));
          if (cartItems && cartItems.length > 0) {

            let todayAmount = cartItems.reduce((ty, u) => ty + u.invItem.price.netAmount, 0);
            let todayPurchase = Number(todayAmount.toFixed(2));
            this.totalVowValue = Number((todayPurchase + this.lastPurchase).toFixed(2));

            let schemeDetail = this.scheme.details.find(c => c.from <= this.totalVowValue && this.totalVowValue <= c.to);
            if (schemeDetail)
              this.appliedVowDisc = schemeDetail?.discount;

            this.paybleAmount = Number((todayPurchase - ((todayPurchase * this.appliedVowDisc) / 100)).toFixed(2));
            this.appliedVowAmt = Number((todayPurchase - this.paybleAmount).toFixed(2));
          }
        }
      }
    }
    catch (error: any) {
      this.alertDialogService.show(error.error);
    }
  }

  public filterSidebar() {
    this.filterFlag = !this.filterFlag;
  }

  public openCompareDialog(): void {
    this.isCompareDialog = true;
  }

  public closeCompareDialog(): void {
    this.isCompareDialog = false;
  }

  public openDiamonddetailSidebar(stoneId: string) {
    this.showDiamonddetailModal = false;
    this.stoneId = stoneId;
    setTimeout(() => { this.showDiamonddetailModal = true; }, 0);
  }

  public openMediaDialog(type: string, inv: InvItem): void {
    let src = 'commonAssets/images/image-not-found.jpg';
    switch (type.toLowerCase()) {
      case "img":
        src = inv.media.isPrimaryImage
          ? environment.imageURL.replace('{stoneId}', inv.stoneId.toLowerCase())
          : "commonAssets/images/image-not-found.jpg";
        break;
      case "iframe":
        src = inv.media.isHtmlVideo
          ? environment.videoURL.replace('{stoneId}', inv.stoneId.toLowerCase())
          : "commonAssets/images/video-not-found.png";
        break;
      case "cert":
        src = inv.media.isCertificate
          ? environment.certiURL.replace('{certiNo}', inv.certificateNo)
          : "commonAssets/images/certi-not-found.png";
        break;
      case "download":
        src = inv.media.isDownloadableVideo
          ? environment.otherImageBaseURL.replace('{stoneId}', inv.stoneId.toLowerCase()) + "/video.mp4"
          : "commonAssets/images/video-not-found.png";
        break;
    }

    this.mediaSrc = src;
    this.mediaType = type;
    this.isShowMedia = true;
  }

  //Send mail view
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

  // Checkout
  public openCheckoutDialog(): void {
    this.invIds = this.gridView.data.filter(c => this.mySelection.includes(c.id)).map(z => z.invItem.invId);
    this.isCheckout = true;
  }

  public parentMethodCall(): void {
    this.isCheckout = false;
    this.stoneIds = new Array<string>();
    this.LoadCartItemsAsync();
    this.mySelection = [];
    this.getSelectedRowID();
  }

  public isCheckShape(shape: string): boolean {
    return (shape.toLowerCase() == 'round')
  }

  /* #region  Add log */
  private addDbLog(action: string, request: string, response: string, error: string) {
    try {
      let log: DbLog = new DbLog();
      log.action = action;
      log.category = "Customer";
      log.controller = "MyCart";
      log.userName = this.customerName;
      log.ident = this.customerId;
      log.payLoad = request;
      log.eventTime = new Date().toDateString();
      log.text = response;
      log.errorText = error;
      this.logService.insertLog(log);

    } catch (error: any) {
      console.error(error);
      this.alertDialogService.show('Log not created, Please contact administrator!', "error");
    }
  }
  /* #endregion */


  public openExcelFile() {
    this.isExcelModal = true;
  }
  public closeExcelDialog() {
    this.isExcelModal = false;
  }

  public async exportToExcel() {
    try {
      this.spinnerService.show();
      let data: CartItem[] = [];
      if (this.exportType == 'Selected') {
        if (this.mySelection.length == 0) {
          this.spinnerService.hide();
          this.alertDialogService.show('No selected stone(s) found!');
          return;
        }
        data = this.selectedCartItems;
      }
      else if (this.exportType == 'Search') {
        let res = await this.cartService.getCartItemsByCriteriaAsync(this.searchCriteria);
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

  private async getRecDiamond() {
    try {
      this.aiRecommDiamonds = await this.customerDashboardService.getCustomerAiSuggestions(this.customerId);
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

  public async addToCart(stoneId: string) {
    if (this.aiRecommDiamonds && this.aiRecommDiamonds.some(c => c.stoneId == stoneId)) {
      this.alertDialogService.ConfirmYesNo("Are you sure you want to add to cart?", "Cart")
        .subscribe(async (res: any) => {
          if (res.flag) {
            try {
              this.spinnerService.show();
              this.addCart = new Cart();
              let recDiamond = this.aiRecommDiamonds.find(c => c.stoneId == stoneId);
              if (recDiamond) {
                this.addCart.invId = recDiamond.invId;
                this.addCart.stoneId = recDiamond.stoneId;
                this.addCart.WebPlatform = "Online";

                // get seller details
                let customerDetail: Customer = await this.customerService.getCustomerById(this.customerId);
                if (customerDetail && customerDetail.seller) {
                  let dnorm: CustomerDNorm = new CustomerDNorm();
                  dnorm.city = customerDetail.address.city;
                  dnorm.companyName = customerDetail.companyName;
                  dnorm.name = customerDetail.fullName;
                  dnorm.code = customerDetail.code;
                  dnorm.email = customerDetail.email;
                  dnorm.id = customerDetail.id;
                  dnorm.mobile = customerDetail.mobile1;
                  dnorm.sellerId = customerDetail.seller.id;
                  this.addCart.customer = dnorm;

                  this.addCart.seller = customerDetail.seller;
                }

                //call add to cart
                let id = await this.cartService.insertCartAsync(this.addCart);
                if (id) {
                  await this.LoadCartItemsAsync();
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

  public getcountryFlag(location: string) {
    return location.toLowerCase().replace(/\s+/g, '');
  }

  public isBodyScrollHidden(isScrollHide: boolean) {
    const action = isScrollHide ? 'addClass' : 'removeClass'
    this.renderer[action](document.body, 'hiddenScroll');
  }
}
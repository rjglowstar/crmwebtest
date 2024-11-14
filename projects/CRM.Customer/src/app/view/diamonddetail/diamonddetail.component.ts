import { Component, OnInit } from '@angular/core';
import { InvDetailData } from '../../businessobjects';
import { CustomerDNorm } from '../../entities';
import { environment } from 'environments/environment';
import { DomSanitizer } from '@angular/platform-browser';
import { NgxSpinnerService } from 'ngx-spinner';
import { AlertdialogService } from 'shared/views';
import { CustomerInvSearchService, MasterConfigService } from '../../services';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { UtilityService, ViewActionImageType, ViewActionType } from 'shared/services';
import { MasterDNorm } from 'shared/enitites';

@Component({
  selector: 'app-diamonddetail',
  templateUrl: './diamonddetail.component.html',
  styleUrl: './diamonddetail.component.css'
})
export class DiamonddetailComponent implements OnInit {

  public ViewActionType = ViewActionType;
  public ViewActionImageType = ViewActionImageType;
  public stoneId: string = '';  //ZRP-105
  public invItemObj: InvDetailData = new InvDetailData();
  public customer: CustomerDNorm = new CustomerDNorm();
  public showVideo = true;
  public showImage = false;
  public showCertificate = false;
  public isStoneDetails: boolean = false;
  public imageType = '';
  public language: string = 'en';
  public showLangList: boolean = false;
  public placeholder: string = 'Select';
  public selectedItem: string = "";
  public languageList: Array<{ text: string; value: string }> = [];
  public logoPath: string = ""
  public isBiding: boolean = false;

  public allTheShapes?: MasterDNorm[];

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private spinnerService: NgxSpinnerService,
    public sanitizer: DomSanitizer,
    private alertdialogService: AlertdialogService,
    private inventoryService: CustomerInvSearchService,
    private translateService: TranslateService,
    private masterConfigService: MasterConfigService,
    private utilityService: UtilityService
  ) { }

  public async ngOnInit() {
    this.spinnerService.show();
    this.languageList = [{ text: 'English', value: 'en' }, { text: 'Chinese', value: 'ch' }]
    this.language = localStorage.getItem('language') ?? 'en';
    this.selectedItem = this.languageList.find(x => x.value == this.language)?.text.toString() ?? '';
    this.stoneId = this.activatedRoute.snapshot.paramMap.get('id')?.toString() ?? '';

    const encodedData = sessionStorage.getItem('diamondStateData');
    if (encodedData) {
      try {
        const decodedData = JSON.parse(atob(encodedData));
        if (typeof decodedData.isBiding === 'boolean') {
          this.isBiding = decodedData.isBiding;
        }
      } catch (error) {
        console.error('Invalid or tampered data');
      }
    }

    await this.getMasterConfigData();
    if (this.stoneId)
      await this.getStoneDetailsById(this.stoneId);

    this.logoPath = this.utilityService.getCusLogoPath(window.location.href);
  }

  public async getStoneDetailsById(id: string) {
    try {
      if (this.stoneId) {
        var res = await this.inventoryService.getStoneDetailsByIdAsync(id);
        if (res) {
          if (this.allTheShapes)
            this.utilityService.changeAdditionalDataForCustomerInv(res, this.allTheShapes ?? []);

          this.invItemObj = res;

          this.invItemObj.imageURL = this.sanitizeURL('image');
          this.invItemObj.videoURL = this.sanitizeURL('video');
          this.invItemObj.certiURL = this.sanitizeURL('cert');

          this.isStoneDetails = true;
        }
        else
          this.alertdialogService.show('Stone not found, Try again later');
      }
      this.spinnerService.hide();
    } catch (error: any) {
      this.spinnerService.hide();
      this.alertdialogService.show('Stone not found!!, Try again later')
    }
  }

  //#region Master Config Data
  public async getMasterConfigData() {
    //Master Config
    let masterConfigList = await this.masterConfigService.getAllMasterConfig();
    this.allTheShapes = this.utilityService.sortingMasterDNormPriority(masterConfigList.shape);
  }
  //#endregion

  //#region assets methods
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

  public viewAction(action: string, type: string) {
    if (action === ViewActionType.Image) {
      this.invItemObj.imageURL = this.sanitizeURL('image');
      this.imageType = type;
      this.showVideo = false;
      this.showImage = true;
      this.showCertificate = false;
    }
    else if (action === ViewActionType.Video) {
      this.showVideo = true;
      this.showImage = false;
      this.showCertificate = false;
    }
    else if (action === ViewActionType.Certificate) {
      this.showVideo = false;
      this.showImage = false;
      this.showCertificate = true;
    }
    else if (action === ViewActionType.VideoDownload) {
      this.invItemObj.videoURL = this.sanitizeURL('download');
      this.showVideo = true;
      this.showImage = false;
      this.showCertificate = false;
    }
  }
  //#endregion

  public async languageChange(language: any) {
    this.translateService.setDefaultLang(language.target.value);
  }

  //#region  Language 
  public showLanguageList() {
    this.showLangList = !this.showLangList;
  }

  public async changeLanguage(event: any) {
    this.selectedItem = event.text;
    this.showLangList = false;
    this.translateService.setDefaultLang(event.value);
  }

  public onClickedOutside(event: Event) {
    if (this.showLangList)
      this.showLangList = false;
  }
  //#endregion

}

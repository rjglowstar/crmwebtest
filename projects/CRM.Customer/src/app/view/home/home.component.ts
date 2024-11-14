
import { Component, OnInit, ElementRef, Renderer2, ViewEncapsulation, AfterViewInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { UtilityService, listAnnounceType } from 'shared/services';
import { AzureFileStore } from 'shared/enitites';
import { FileStoreService } from '../../services/common/filestore.service';

import SwiperCore, { Autoplay, Navigation, Pagination } from 'swiper';
declare var $: any

SwiperCore.use([Autoplay, Navigation, Pagination]);

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class HomeComponent implements OnInit {

  public events!: any[];
  public count!: number;
  public eventItem1: number = 0;
  public eventItem2: number = 0;
  public eventItem3: number = 0;
  public aboutusPath: string = "";
  public logoPath: string = "";
  public companyName: string = ""
  public newLogo: string = "";
  public isShowAnnounceImg: boolean = false;
  public announcementImgPath: string = "";
  public listAnnounceType = listAnnounceType;
  public announcmentType: string = "";
  public isWvdDialog: boolean = false;
  public language: string = 'en';

  constructor(private router: Router,
    private sanitizer: DomSanitizer,
    private utilityService: UtilityService,
    private renderer: Renderer2,
    private elementRef: ElementRef,
    private fileStoreService: FileStoreService) { }

  async ngOnInit() {
    this.language = localStorage.getItem('language') ?? 'en';
    this.checkUser();
    this.aboutusPath = this.utilityService.getAboutUsPath(window.location.href);
    this.logoPath = this.utilityService.getCusLogoPath(window.location.href);
    this.companyName = this.utilityService.getCompanyNameFromUrl(window.location.href);
    this.announcmentType = this.utilityService.getAnnouncmentType(window.location.href);
    this.getImagePath();
  }

  private async checkUser() {
    if (sessionStorage.getItem("userToken") != null) {
      if (sessionStorage.getItem("fxCredentials") != null)
        this.router.navigate(["dashboard"]);
    }
  }

  scrollToSection(sectionId: string, offset: number = 150) {
    const element = this.elementRef.nativeElement.querySelector(sectionId);
    if (element) {
      const yOffset = element.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: yOffset, behavior: 'smooth' });
    }
  }

  private showAnnounceImage() {
    const isCheck = this.showModalIfFirstTime();
    if (!isCheck) {
      let image = new Image();
      image.src = this.announcementImgPath;
      image.onload = () => { this.isShowAnnounceImg = true; };
      image.onerror = () => { this.isShowAnnounceImg = false; };
    }
  }

  public closeImageDialog(): void {
    this.isShowAnnounceImg = false;
  }

  public async getImagePath() {
    const imageList: AzureFileStore[] = await this.fileStoreService.getAzureFileByName(this.announcmentType);
    if (imageList && imageList.length > 0) {
      const firstImageSrc = imageList[0]?.fileThumbnail;
      let imgBase64 = this.loadImage(firstImageSrc) as any;
      this.announcementImgPath = imgBase64;
      this.showAnnounceImage();
    } else
      this.openWvdBannerDialog()
  }

  private loadImage(imageSrc: string): string | null {
    return (imageSrc && imageSrc.trim() !== "") ? `data:image/jpeg;base64,${imageSrc}` : null;
  }

  public openWvdBannerDialog() {
    const isCheck = this.showModalIfFirstTime();
    if (!isCheck) {
      this.language = window.localStorage.getItem('language') ?? 'en';
      this.isWvdDialog = true;
    }
  }

  public closeWvdBannerDialog(): void {
    this.isWvdDialog = false;
  }

  public showModalIfFirstTime(): boolean {
    if (window.sessionStorage.getItem('modalShown')) {
      return true;
    }
    window.sessionStorage.setItem('modalShown', 'true');
    return false;
  }

  policySlider: any = {
    loop: true,
    slidesPerView: 1,
    spaceBetween: 0,
    dot: false,
    navigation: true,
    grabCursor: false,
    speed: 600,
    autoplay: {
      delay: 4000,
    },
    breakpoints: {
      768: {
        slidesPerView: 3,
        centeredSlides: true,
      }
    },
  };

  digitalSlider: any = {
    loop: true,
    slidesPerView: 1,
    spaceBetween: 0,
    centeredSlides: true,
    dot: false,
    navigation: false,
    grabCursor: false,
    speed: 700,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
    },
    breakpoints: {
      768: {
        slidesPerView: 3,
        centeredSlides: true,
      }
    },
  };

}
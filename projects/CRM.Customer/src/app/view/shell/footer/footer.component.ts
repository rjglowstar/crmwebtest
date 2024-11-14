import { Component, ElementRef, HostListener, Inject, OnInit, Renderer2, ViewChild, ViewEncapsulation } from '@angular/core';
import { SuggestionService, UtilityService } from 'shared/services';
import { DOCUMENT } from '@angular/common';
import { ContactUsDetail } from '../../../businessobjects';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
  encapsulation: ViewEncapsulation.None
})
export class FooterComponent implements OnInit {
  public isLogin: boolean = false;
  public logoPath: string = "";
  public socialPath: any;
  public logoPathWhite: string = "";
  public companyName: string = '';
  public contactUsDetail: ContactUsDetail = new ContactUsDetail();
  copyRightYear = new Date().getFullYear();
  @ViewChild('backToTop') elementRef!: ElementRef;

  constructor(
    private suggestionSharedService: SuggestionService,
    private utilityService: UtilityService,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) { }

  @HostListener('document:scroll', ['$event'])
  public onScroll(event: Event) {
    if (this.document.documentElement.scrollTop > 400) {
      event.preventDefault();
      this.renderer.addClass(this.elementRef.nativeElement, 'btt_show')
    } else {
      this.renderer.removeClass(this.elementRef.nativeElement, 'btt_show')
    }
  }

  public async ngOnInit() {
    this.logoPath = this.utilityService.getCusLogoPath(window.location.href);
    this.logoPathWhite = this.utilityService.getLogoPathWhite(window.location.href);
    this.socialPath = this.utilityService.getSocialPath(window.location.href);
    this.contactUsDetail = this.utilityService.getContactUsDetails(window.location.href);
    this.companyName = this.utilityService.getCompanyNameFromUrl(window.location.href);
    this.defaultMethodsLoad();
  }  

  defaultMethodsLoad() {
    if (sessionStorage.getItem("fxCredentials"))
      this.isLogin = true;
    else
      this.isLogin = false;
  }

  public async showSuggestionDialog() {
    this.suggestionSharedService.setSuggestion(true);
  }
  
  scrollToTop(): void {
    window.scrollTo(0, 0);
  }
}

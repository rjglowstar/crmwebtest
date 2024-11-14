import { Component, ElementRef, EventEmitter, HostListener, Inject, OnInit, Output, Renderer2, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { AlertdialogService } from 'shared/views';
import { SuggestionService, UtilityService } from 'shared/services';
import { CustomerService, LoginhistoryService } from '../../../services';
import { TranslateService } from '@ngx-translate/core';
import { CustFxCredential } from '../../../entities';
import { CustomerLanguageData } from '../../../businessobjects';
import { DOCUMENT } from '@angular/common';
@Component({
  selector: 'app-customer-header-landing',
  templateUrl: './header-landing.component.html',
  styleUrl: './header-landing.component.css',
  encapsulation: ViewEncapsulation.None
})

export class HeaderLandingComponent implements OnInit {
  public isLogin: boolean = false;
  @Output() isLogincheck: EventEmitter<any> = new EventEmitter();
  public navMenuBar = false;
  public language: string = 'en';
  public fxCredentials?: CustFxCredential;
  public customerLanguageDataObj: CustomerLanguageData = new CustomerLanguageData();
  public showLangList: boolean = false;
  public placeholder: string = 'Select';
  public selectedItem: string = "";
  public languageList: Array<{ text: string; value: string }> = [];
  @ViewChild('nav') elementRef!: ElementRef;
  public logoPath: string = "";
  public logoPathWhite: string = "";
  public usearSearchString: string = "";
  public profileName: string = "C";
  public companyName: string = '';
  private lastScrollTop = 0;

  constructor(
    private router: Router,
    private alertdialogService: AlertdialogService,
    private suggestionSharedService: SuggestionService,
    private loginhistoryService: LoginhistoryService,
    private translateService: TranslateService,
    private customerService: CustomerService,
    private utilityService: UtilityService,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) { }


  public async ngOnInit() {
    this.languageList = [{ text: 'English', value: 'en' }, { text: 'Chinese', value: 'ch' }]
    this.logoPath = this.utilityService.getCusLogoPath(window.location.href);
    this.logoPathWhite = this.utilityService.getLogoPathWhite(window.location.href);
    this.companyName = this.utilityService.getCompanyNameFromUrl(window.location.href);
    this.defaultMethodsLoad();
  }

  defaultMethodsLoad() {

    if (sessionStorage.getItem("userToken"))
      this.isLogin = true;
    else
      this.isLogin = false;

    this.fxCredentials = sessionStorage.getItem("fxCredentials") ? JSON.parse(sessionStorage.getItem("fxCredentials") ?? '') as CustFxCredential : undefined;

    if (this.fxCredentials && this.fxCredentials.selectedLanguage != null) {
      this.language = this.fxCredentials.selectedLanguage;
      this.profileName = this.fxCredentials.fullName[0];
      window.localStorage.setItem('language', this.language);
    }
    else
      this.getLanguage();

    this.selectedItem = this.languageList.find(x => x.value == this.language)?.text.toString() ?? '';
  }

  private previousScrollPosition: number = 0;

  @HostListener('window:scroll', ['$event'])
  public onScroll(event: Event) {
    const currentScrollPosition = this.document.documentElement.scrollTop || this.document.body.scrollTop;
    const isScrollingDown = currentScrollPosition > this.previousScrollPosition;

    let action: 'addClass' | 'removeClass';

    if (isScrollingDown || currentScrollPosition <= (window.innerHeight / 1.5)) {
      action = 'removeClass';
    } else {
      action = 'addClass';
    }

    this.renderer[action](this.elementRef.nativeElement, 'nav-fixed');

    this.previousScrollPosition = currentScrollPosition;
  }

  loadScripts() {
    let documentNotificationBar: any = document;
    documentNotificationBar.querySelector(".o-click").addEventListener("click", function () {
      documentNotificationBar.querySelector(".noti-wrap").classList.toggle("active");
    });
  }

  public logoutClick(): void {
    this.alertdialogService.ConfirmYesNo("Are you sure you want to Logout?", "Logout").subscribe((res: any) => {
      if (res.flag) {
        //let loginDetails: any = JSON.parse(sessionStorage.getItem("userToken")?.toString() ?? "");
        //this.loginhistoryService.updateLoginHistory(loginDetails.ident)
        this.logOut();
      }
    });
  }

  public logOut(): void {
    this.isLogin = false;
    sessionStorage.clear();
    localStorage.clear();
    this.isLogincheck.emit(false);
    this.router.navigate(["/home"]);
  }

  // Navigation panel
  public navpanelBar(isSideMenu: boolean = false): void {
    this.navMenuBar = isSideMenu;

    const action = isSideMenu ? 'addClass' : 'removeClass';
    this.renderer[action](document.body, 'menu_show');
  }


  public async showSuggestionDialog() {
    this.suggestionSharedService.setSuggestion(true);
  }

  public async languageChange(language: any) {
    this.translateService.setDefaultLang(language.target.value);
    window.localStorage.setItem('language', language.target.value);
    this.customerLanguageDataObj.customerID = this.fxCredentials?.id ?? '';
    this.customerLanguageDataObj.newLanguage = language.target.value;

    if (this.fxCredentials) {
      this.fxCredentials.selectedLanguage = language.target.value;
      sessionStorage.setItem("fxCredentials", JSON.stringify(this.fxCredentials));
    }

    await this.customerService.updateCustomerLanguage(this.customerLanguageDataObj);
  }

  //#region  Language 
  public showLanguageList() {
    this.showLangList = !this.showLangList;
  }

  public getLanguage() {
    this.language = localStorage.getItem('language') ?? 'en';
  }

  public async changeLanguage(event: any) {
    this.selectedItem = event.text;
    this.showLangList = false;
    this.translateService.setDefaultLang(event.value);
    localStorage.setItem('language', event.value);
    this.renderer.removeClass(document.body, 'chLan');
    if (event.value === 'ch')
      this.renderer.addClass(document.body, 'chLan');


    if (this.fxCredentials) {
      if (this.fxCredentials?.id) {
        this.customerLanguageDataObj.customerID = this.fxCredentials?.id ?? '';
        this.customerLanguageDataObj.newLanguage = event.value;
        await this.customerService.updateCustomerLanguage(this.customerLanguageDataObj);
      }

      if (this.fxCredentials?.selectedLanguage) {
        this.fxCredentials.selectedLanguage = event.value;
        sessionStorage.setItem("fxCredentials", JSON.stringify(this.fxCredentials));
      }
    }
    this.getLanguage();
  }

  public onClickedOutside(event: Event) {
    if (this.showLangList)
      this.showLangList = false;
  }
  //#endregion

  public toggleClass(event: any, className: string) {
    const hasClass = event.target.classList.contains(className);
    if (hasClass)
      this.renderer.removeClass(event.target, className);
    else
      this.renderer.addClass(event.target, className);
  }

  public navigateToSearchResult(): void {
    if (this.usearSearchString) {
      sessionStorage.setItem("dashboardSearchString", this.usearSearchString);
      this.router.navigate(["searchresult"]);
    }
  }
}
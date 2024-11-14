import { Component, ElementRef, EventEmitter, HostListener, Inject, OnInit, Output, Renderer2, ViewChild, ViewEncapsulation } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AlertdialogService } from 'shared/views';
import { SuggestionService, UtilityService } from 'shared/services';
import { CustomerService, LoginhistoryService } from '../../../services';
import { TranslateService } from '@ngx-translate/core';
import { CustFxCredential } from '../../../entities';
import { CustomerLanguageData } from '../../../businessobjects';
import { DOCUMENT } from '@angular/common';
@Component({
  selector: 'app-customer-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  encapsulation: ViewEncapsulation.None
})

export class HeaderComponent implements OnInit {
  public isLogin: boolean = false;
  @Output() isLogincheck: EventEmitter<any> = new EventEmitter();
  public navpanelFlag = false;
  public language: string = 'en';
  public fxCredentials?: CustFxCredential;
  public customerLanguageDataObj: CustomerLanguageData = new CustomerLanguageData();
  public showLangList: boolean = false;
  public showLangList2: boolean = false;
  public placeholder: string = 'Select';
  public selectedItem: string = "";
  public languageList: Array<{ text: string; value: string }> = [];
  @ViewChild('nav') elementRef!: ElementRef;
  public logoPath: string = "";
  public usearSearchString: string = "";
  public profileName: string = "C";
  public companyName: string = '';

  constructor(
    private router: Router,
    private alertdialogService: AlertdialogService,
    private suggestionSharedService: SuggestionService,
    private loginhistoryService: LoginhistoryService,
    private translateService: TranslateService,
    private customerService: CustomerService,
    private renderer: Renderer2,
    private utilityService: UtilityService,
    @Inject(DOCUMENT) private document: Document
  ) { }

  @HostListener('document:scroll', ['$event'])
  public onScroll(event: Event) {
    // this.navpanelFlag = false;
    // if (this.document.documentElement.scrollTop > 90) {
    //   event.preventDefault();
    //   this.renderer.addClass(this.elementRef.nativeElement, 'nav-fixed')
    // } else {
    //   this.renderer.removeClass(this.elementRef.nativeElement, 'nav-fixed')
    // }
  }

  public async ngOnInit() {
    this.languageList = [{ text: 'English', value: 'en' }]
    // this.languageList = [{ text: 'English', value: 'en' }, { text: 'Chinese', value: 'ch' }]
    this.logoPath = this.utilityService.getCusLogoPath(window.location.href);
    this.companyName = this.utilityService.getCompanyNameFromUrl(window.location.href);
    this.defaultMethodsLoad();
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (!event.url.includes('/searchresult')) {
          this.usearSearchString = "";
        }
      }
    });
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
      this.language = localStorage.getItem('language') ?? 'en';

    this.selectedItem = this.languageList.find(x => x.value == this.language)?.text.toString() ?? '';
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
    this.renderer.removeClass(document.body, 'cLogIn');
    this.renderer.addClass(document.body, 'default');
    this.renderer.removeAttribute(document.body, 'data-lenis-prevent');
    this.router.navigate(["/home"]);
  }

  // Navigation panel
  public navpanelSidebar() {
    this.navpanelFlag = !this.navpanelFlag;
  }

  public async showSuggestionDialog() {
    this.navpanelFlag = false;
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
  public showLanguageList2() {
    this.showLangList2 = !this.showLangList2;
  }

  public async changeLanguage(event: any) {
    this.selectedItem = event.text;
    this.showLangList = false;
    this.showLangList2 = false;
    this.translateService.setDefaultLang(event.value);
    localStorage.setItem('language', event.value);


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

  }

  public onClickedOutside(event: Event) {
    if (this.showLangList)
      this.showLangList = false;
  }

  public onClickedOutside2(event: Event) {
    if (this.showLangList2)
      this.showLangList2 = false;
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
      this.router.navigate(['/searchresult', { dashboardSearchString: this.usearSearchString }]);
      this.usearSearchString = "";
    }
  }
}
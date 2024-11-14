import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { environment } from 'environments/environment';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth/keys';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  public title: string = 'CRMCustomer';
  public showHeaderFooter: boolean = true;

  constructor(private http: HttpClient,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title,
    public translate: TranslateService
  ) {
    router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        var title = this.getTitle(router.routerState, router.routerState.root)[0];
        titleService.setTitle(title);
      }
    });

    let language = localStorage.getItem('language');
    if (language == null || language == undefined || language.length == 0) {
      language = 'en';
      window.localStorage.setItem('language', 'en');
    }
    translate.setDefaultLang(language);

    if (window.location.href.includes("/login"))
      this.showHeaderFooter = false;
    else
      this.showHeaderFooter = true;

  }

  async ngOnInit() {
    const get$ = this.http.get('commonAssets/variable/variable.json');
    let obj = await lastValueFrom(get$) as any;
    if (obj && obj.frontOfficeBaseUrl) {
      environment.frontOfficeBaseUrl = keys.apiUrl = obj.frontOfficeBaseUrl;
      environment.apiIdentityUrl = obj.apiIdentityUrl;
      environment.apiFrontOfficeFileUploadUrl = obj.apiFrontOfficeFileUploadUrl;
      environment.apiFileUploadUrl = obj.apiFrontOfficeFileUploadUrl;
      environment.apiPricingUrl = obj.apiPricingUrl;
      environment.notificationBaseUrl = obj.notificationBaseUrl;
      environment.notificationSocketUrl = obj.notificationSocketUrl;

      environment.imageURL = obj.imageURL;
      environment.videoURL = obj.videoURL;
      environment.certiURL = obj.certiURL;
      environment.otherImageBaseURL = obj.otherImageBaseURL;
    }

    //transfer session storage to another Tab with event listener (trigger by authentication refresh token service & login)
    window.addEventListener("storage", this.sessionStorage_transfer, false);
  }

  getTitle(state: any, parent: any): any {
    var data = [];

    if (parent && parent.snapshot.data && parent.snapshot.data.title) {
      data.push(parent.snapshot.data.title);
    }

    if (state && parent) {
      data.push(... this.getTitle(state, state.firstChild(parent)));
    }

    return data;
  }

  public sessionStorage_transfer(event: any = null) {
    if (!event) { event = window.event; } // ie suq
    if (!event.newValue) return;          // do nothing if no value to work with
    if (event.key == 'userToken') {
      var userToken = JSON.parse(event.newValue);
      var currentUserToken = sessionStorage.getItem('userToken') ?? null as any;
      if (currentUserToken) {
        currentUserToken = JSON.parse(currentUserToken);
        //check if login user same or not
        if (currentUserToken.ident == userToken.ident)
          sessionStorage.setItem(event.key, JSON.stringify(userToken));
      }
    }
  };

}

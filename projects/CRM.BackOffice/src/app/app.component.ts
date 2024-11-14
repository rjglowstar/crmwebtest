import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { environment } from 'environments/environment';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'CRM-BackOffice';

  constructor(private http: HttpClient) {
  }

  async ngOnInit() {
    const get$=this.http.get('commonAssets/variable/variable.json');
    let obj = await lastValueFrom(get$) as any;
    if (obj && obj.backOffliceBaseUrl) {
      environment.backOffliceBaseUrl = keys.apiUrl = obj.backOffliceBaseUrl;
      environment.frontOfficeBaseUrl = obj.frontOfficeBaseUrl;
      environment.apiIdentityUrl = obj.apiIdentityUrl;
      environment.apiFrontOfficeFileUploadUrl = obj.apiFrontOfficeFileUploadUrl;
      environment.apiBackOfficeFileUploadUrl = obj.apiBackOfficeFileUploadUrl;
      environment.apiFileUploadUrl = obj.apiBackOfficeFileUploadUrl;
      environment.notificationBaseUrl = obj.notificationBaseUrl;
      environment.notificationSocketUrl = obj.notificationSocketUrl;
      environment.apiPricingUrl = obj.apiPricingUrl;

      environment.imageURL = obj.imageURL;
      environment.videoURL = obj.videoURL;
      environment.certiURL = obj.certiURL;
      environment.otherImageBaseURL = obj.otherImageBaseURL;
    }

    //transfer session storage to another Tab with event listener (trigger by authentication refresh token service & login)
    window.addEventListener("storage", this.sessionStorage_transfer, false);
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

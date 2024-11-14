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
  title = 'CRM-FrontOffice';

  constructor(private http: HttpClient) {
  }

  async ngOnInit() {
    const get$ = this.http.get('commonAssets/variable/variable.json');
    let obj = await lastValueFrom(get$) as any;
    if (obj && obj.frontOfficeBaseUrl) {
      environment.apiIdentityUrl = obj.apiIdentityUrl;
      keys.rfidAPIUrlFO = obj.rfidAPIUrlFO;
      environment.apiFrontOfficeFileUploadUrl = obj.apiFrontOfficeFileUploadUrl;
      environment.apiFileUploadUrl = obj.apiFrontOfficeFileUploadUrl;
      environment.apiPricingUrl = obj.apiPricingUrl;
      environment.notificationBaseUrl = obj.notificationBaseUrl;
      environment.notificationSocketUrl = obj.notificationSocketUrl;

      environment.imageURL = obj.imageURL;
      environment.videoURL = obj.videoURL;
      environment.certiURL = obj.certiURL;
      environment.proposalUrl = obj.proposalUrl;
      environment.otherImageBaseURL = obj.otherImageBaseURL;
      keys.apiUrl = obj.frontOfficeBaseUrl;
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

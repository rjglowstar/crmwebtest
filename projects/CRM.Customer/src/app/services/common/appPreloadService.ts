import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { lastValueFrom } from "rxjs";
import { keys } from "shared/auth";
import { CustFxCredential } from "../../entities";

@Injectable()
export class AppPreloadService {

  constructor(private http: HttpClient) { }

  async getPublicIP(): Promise<any> {
    const get$ = this.http.get("https://ipapi.co/json/");

    var result=await lastValueFrom(get$) as any;
    return result;
  }

  async fetchFxCredentials(customerId?: string): Promise<CustFxCredential> {
    let credential = new CustFxCredential();
    let sesValue = sessionStorage.getItem("fxCredentials");

    if (sesValue)
      credential = JSON.parse(sesValue) as CustFxCredential;
    else {
      const get$ = this.http.get(keys.apiUrl + "Customer/GetCredential/" + customerId);

      credential = await lastValueFrom(get$) as CustFxCredential
      if (credential)
        sessionStorage.setItem("fxCredentials", JSON.stringify(credential));
    }

    return credential;
  }
}
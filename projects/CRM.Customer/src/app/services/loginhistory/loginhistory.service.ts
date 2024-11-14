import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { CustomerLoginHistory } from '../../entities';

@Injectable({
  providedIn: 'root'
})
export class LoginhistoryService {

  private baseUrl: string;

  constructor(private http: HttpClient) {
    this.baseUrl = keys.apiUrl + "CustomerLoginHistory/";
  }

  public async insertLoginHistory(customerLoginHistory: CustomerLoginHistory): Promise<string> {
    const post$ = this.http.post(this.baseUrl + "InsertCustomerLoginHistory", customerLoginHistory, {
      observe: "body",
      responseType: "text"
    });

    var result = await lastValueFrom(post$) as string;
    return result;
  }

  public async updateLoginHistory(id: string): Promise<string> {
    const get$ = this.http.get(this.baseUrl + "UpdateCustomerLogoutHistory/" + id, { responseType: 'text' });

    var result=await lastValueFrom(get$) as string;
    return result;
  }
}

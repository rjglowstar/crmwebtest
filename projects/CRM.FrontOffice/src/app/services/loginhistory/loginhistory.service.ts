import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { CustomerLoginHistoryCriteria, CustomerLoginHistoryResponse } from '../../businessobjects';

@Injectable({
  providedIn: 'root'
})
export class LoginhistoryService {

  private baseUrl: string;

  constructor(private http: HttpClient) {
    this.baseUrl = keys.apiUrl + "CustomerLoginHistory/";
  }

  public async getPaginatedLoginHistory(customerLoginHistoryCriteria: CustomerLoginHistoryCriteria, skip: number, take: number): Promise<CustomerLoginHistoryResponse> {
    const post$ = this.http.post(this.baseUrl + "GetPaginated/" + skip + "/" + take, customerLoginHistoryCriteria);

    var result = await lastValueFrom(post$) as CustomerLoginHistoryResponse;
    return result;
  }
}

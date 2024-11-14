import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { BalanceSheet, BalanceSheetSearchCriteria } from '../../businessobjects';

@Injectable({
  providedIn: 'root'
})
export class BalanceSheetService {

  private baseUrl: string;

  constructor(private http: HttpClient) {
    this.baseUrl = keys.apiUrl + 'BalanceSheet/'
  }

  public async getBySearch(criteria: BalanceSheetSearchCriteria): Promise<BalanceSheet[]> {
    const post$ = this.http.post(this.baseUrl + "GetBySearch", criteria);

    var result = await lastValueFrom(post$) as BalanceSheet[];
    return result;
  }

}

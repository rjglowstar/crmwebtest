import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { DaysData, InvPurchaseAnalysis } from '../../businessobjects';

@Injectable({
  providedIn: 'root'
})

export class PurchaseAnalysisService {

  constructor(private http: HttpClient) { }

  public async getAvgDays(invPurchaseAnalysis: InvPurchaseAnalysis[]): Promise<DaysData[]> {
    const post$ = this.http.post(keys.apiUrl + "PurchaseAnalysis/GetAvgDays", invPurchaseAnalysis);

    var result = await lastValueFrom(post$) as DaysData[];
    return result;
  }

  public async getMAvgDays(invPurchaseAnalysis: InvPurchaseAnalysis[]): Promise<DaysData[]> {
    const post$ = this.http.post(keys.apiUrl + "PurchaseAnalysis/GetMAvgDays", invPurchaseAnalysis);

    var result = await lastValueFrom(post$) as DaysData[];
    return result;
  }

  public async getSAvgDays(invPurchaseAnalysis: InvPurchaseAnalysis[]): Promise<DaysData[]> {
    const post$ = this.http.post(keys.apiUrl + "PurchaseAnalysis/GetSAvgDays", invPurchaseAnalysis);

    var result = await lastValueFrom(post$) as DaysData[];
    return result;
  }

}

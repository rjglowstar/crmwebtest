import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { CustomerDashboard, CustomerVowData, GraphData, InvDetailData } from '../../businessobjects';
import { CustomerSearchHistory } from '../../entities/customer/customersearchhistory';

@Injectable({
  providedIn: 'root'
})

export class CustomerDashboardService {
  private api = keys.apiUrl + 'CustomerDashboard/';

  constructor(private http: HttpClient) { }

  public async getCustomerDashBoardById(id: string): Promise<CustomerDashboard> {
    const get$ = this.http.get(this.api + "GetUserDashboard/" + id);

    var result = await lastValueFrom(get$) as CustomerDashboard;
    return result;
  }

  public async getNewInventories(): Promise<InvDetailData[]> {
    const get$ = this.http.get(this.api + "GetNewInventories");

    var result = await lastValueFrom(get$) as InvDetailData[];
    return result;
  }

  public async getRecInventories(id: string): Promise<InvDetailData[]> {
    const get$ = this.http.get(this.api + "GetRecInventories/" + id);

    var result = await lastValueFrom(get$) as InvDetailData[];
    return result;
  }

  public async deleteRecByCustomerId(custId: string, stoneIds: string[]): Promise<boolean> {
    const post$ = this.http.post(this.api + "DeleteRecByCustomerId/" + custId, stoneIds);

    var result = await lastValueFrom(post$) as boolean;
    return result;
  }

  public async getShapeGraphData(): Promise<GraphData[]> {
    const get$ = this.http.get(this.api + "GetShapeGraphData");

    var result = await lastValueFrom(get$) as GraphData[];
    return result;
  }

  public async getDayPurchaseGraphData(custId: string): Promise<GraphData[]> {
    const get$ = this.http.get(this.api + "GetDayPurchaseGraphData/" + custId);

    var result = await lastValueFrom(get$) as GraphData[];
    return result;
  }

  public async getMonthPurchaseGraphData(custId: string): Promise<GraphData[]> {
    const get$ = this.http.get(this.api + "GetMonthPurchaseGraphData/" + custId);

    var result = await lastValueFrom(get$) as GraphData[];
    return result;
  }

  public async getLatestVowData(custId: string): Promise<CustomerVowData[]> {
    const get$ = this.http.get(this.api + "GetLatestVowData/" + custId);

    var result = await lastValueFrom(get$) as CustomerVowData[];
    return result;
  }

  public async getHistoryByCustomer(custId: string, skip: number, take: number): Promise<CustomerSearchHistory[]> {
    const get$ = this.http.get(keys.apiUrl + "CustomerSearchHistory/GetHistoryByCustomer/" + skip + "/" + take + "/" + custId);

    var result=await lastValueFrom(get$) as CustomerSearchHistory[];
    return result;
  }

  public async getCustomerAiSuggestions(customerId: string): Promise<InvDetailData[]> {
    const get$ = this.http.get(this.api + "GetCustomerAISuggestions/" + customerId);

    var result = await lastValueFrom(get$) as InvDetailData[];
    return result;
  }
}
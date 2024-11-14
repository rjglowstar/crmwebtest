import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { CustomerInvSearchCriteria, CustomerInvSearchResponse, CustomerInvSummary, InvDetailData } from '../../businessobjects';
import { CustomerSearchHistory } from '../../entities/customer/customersearchhistory';

@Injectable({
  providedIn: 'root'
})

export class CustomerInvSearchService {
  api: string = keys.apiUrl + "Customer/InvSearch/";

  constructor(private http: HttpClient) { }

  public async getInventoryItemsBySearch(inventoryCriteria: CustomerInvSearchCriteria, skip: number, take: number): Promise<CustomerInvSearchResponse> {
    const post$ = this.http.post(this.api + "PaginatedByCriteria/" + skip + "/" + take, inventoryCriteria);

    var result = await lastValueFrom(post$) as CustomerInvSearchResponse;
    return result;
  }

  public async getInvSummary(inventoryCriteria: CustomerInvSearchCriteria): Promise<CustomerInvSummary> {
    const post$ = this.http.post(this.api + "Summary", inventoryCriteria);

    var result = await lastValueFrom(post$) as CustomerInvSummary;
    return result;
  }

  public async getAllInventoryItemsBySearch(inventoryCriteria: CustomerInvSearchCriteria): Promise<InvDetailData[]> {
    const post$ = this.http.post(this.api + "ByCriteria", inventoryCriteria);

    var result = await lastValueFrom(post$) as InvDetailData[];
    return result;
  }

  public async getInvDetailByStoneIdsAsync(stoneIds: string[]): Promise<InvDetailData[]> {
    const post$ = this.http.post(this.api + "ByStoneIds", stoneIds);

    var result = await lastValueFrom(post$) as InvDetailData[];
    return result;
  }

  public async getInvDetailByStoneIdAsync(stoneId: string): Promise<InvDetailData> {
    const get$ = this.http.get(this.api + "ByStoneId/" + stoneId);

    var result = await lastValueFrom(get$) as InvDetailData;
    return result;
  }

  // Anonymous Method for diamond details page.
  public async getStoneDetailsByIdAsync(stoneId: string): Promise<InvDetailData> {
    const get$ = this.http.get(this.api + "StoneDetailsById/" + stoneId);

    var result = await lastValueFrom(get$) as InvDetailData;
    return result;
  }

  public async getInventoryLocationList(): Promise<string[]> {
    const get$ = this.http.get(keys.apiUrl + "Inventory/GetInventoryLocations");

    var result = await lastValueFrom(get$) as string[];
    return result;
  }

  public async getHistoryById(id: string): Promise<CustomerSearchHistory> {
    const get$ = this.http.get(keys.apiUrl + "CustomerSearchHistory/GetHistoryById/" + id);

    var result=await lastValueFrom(get$) as CustomerSearchHistory;
    return result;
  }

}
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { lastValueFrom } from "rxjs";
import { keys } from "shared/auth";
import { CommonResponse } from "shared/businessobjects";
import { CartSearchCriteria, LeadInvExport } from "../../businessobjects";
import { Lead } from "../../entities";

@Injectable({
  providedIn: "root"
})
export class LeadService {
  public apiUrl = keys.apiUrl + "Lead/";

  constructor(private http: HttpClient) { }

  public async getLastPurchaseAmountForVow(customerId: string): Promise<number> {
    const get$ = this.http.get(this.apiUrl + "GetLastPurchaseAmountForVow/" + customerId);

    var result = await lastValueFrom(get$) as number;
    return result;
  }

  public async getCountForCustomerAsync(customerId: string): Promise<number> {
    const get$ = this.http.get(this.apiUrl + "GetCountForCustomer/" + customerId);

    var result = await lastValueFrom(get$) as number;
    return result;
  }

  public async getLeadsForCustomerAsync(criteria: CartSearchCriteria, skip: number, take: number): Promise<Lead[]> {
    const post$ = this.http.post(this.apiUrl + "GetForCustomer/" + skip + "/" + take, criteria);

    var result = await lastValueFrom(post$) as Lead[];
    return result;
  }

  public async insertLeadAsync(lead: Lead): Promise<CommonResponse> {
    const post$ = this.http.post(this.apiUrl + "InsertLeadForCustomer", lead);

    var result = await lastValueFrom(post$) as CommonResponse;
    return result;
  }

  public async downloadLeadInvItemsExcel(leadInvExport: LeadInvExport): Promise<any> {
    const url = this.apiUrl + "DownloadLeadInvItemsExcel";
    const post$ = this.http.post(url, leadInvExport, { responseType: 'blob' });

    var result = await lastValueFrom(post$) as any;
    return result;
  }

  public async downloadLeadInvItemsByInvIdExcel(customerId: string, invIds: string[]): Promise<any> {
    const url = this.apiUrl + "DownloadLeadInvByInvIds";
    const post$ = this.http.post(url + "/" + customerId, invIds, { responseType: 'blob' });

    var result=await lastValueFrom(post$) as any;
    return result;
  }



}
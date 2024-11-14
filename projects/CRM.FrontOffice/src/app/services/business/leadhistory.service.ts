import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { LeadHistoryResponse } from '../../businessobjects/analysis/leadhistoryresponse';
import { LeadHistorySearchCriteria } from '../../businessobjects/analysis/leadhistorysearchcriteria';
import { LeadHistory } from '../../entities/business/leadhistory';

@Injectable({
  providedIn: 'root'
})
export class LeadHistoryService {

  public controllerName: string = "LeadHistory/";

  constructor(private http: HttpClient) { }

  public async InsertLeadHistory(Data: LeadHistory): Promise<string> {
    const post$ = this.http.post(keys.apiUrl + this.controllerName + "Insert", Data, {
      observe: "body",
      responseType: "text"
    });

    var result = await lastValueFrom(post$) as string;
    return result;
  }

  public async GetLeadHistoryByLeadId(leadId: string): Promise<LeadHistory[]> {
    const get$ = this.http.get(keys.apiUrl + this.controllerName + "GetLeadHistories/" + leadId);

    var result = await lastValueFrom(get$) as LeadHistory[];
    return result;
  }

  public async getPaginatedLeadHistories(LeadHistoryCriteria: LeadHistorySearchCriteria, skip: number, take: number): Promise<LeadHistoryResponse> {
    const post$ = this.http.post(keys.apiUrl + this.controllerName + "GetPaginatedLeadHistories/" + skip + "/" + take, LeadHistoryCriteria);

    var result=await lastValueFrom(post$) as LeadHistoryResponse;
    return result;
  }
}

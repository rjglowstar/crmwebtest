import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { InvHistoryResponse } from '../../businessobjects/analysis/invhistoryresponse';
import { InvHistorySearchCriteria } from '../../businessobjects/analysis/invhistorysearchcriteria';
import { StoneHistory } from '../../businessobjects/analysis/stonehistory';
import { InvLogItem } from '../../businessobjects/logging/invlogitem';
import { InvHistory } from '../../entities/business/invhistory';

@Injectable({
    providedIn: 'root'
})
export class InvHistoryService {

    public controllerName: string = "InvHistory/";

    constructor(private http: HttpClient) { }

    public async GetInvHistoryByStoneId(StoneId: string): Promise<InvHistory[]> {
        const get$ = this.http.get(keys.apiUrl + this.controllerName + "Get/" + StoneId);

        var result = await lastValueFrom(get$) as InvHistory[];
        return result;
    }

    public async GetPaginatedInvHistories(InvHistoryCriteria: InvHistorySearchCriteria, skip: number, take: number): Promise<InvHistoryResponse> {
        const post$ = this.http.post(keys.apiUrl + this.controllerName + "GetPaginatedInvHistory/" + skip + "/" + take, InvHistoryCriteria);

        var result = await lastValueFrom(post$) as InvHistoryResponse;
        return result;
    }

    public async InsertInvHistory(Data: InvHistory): Promise<string> {
        const post$ = this.http.post(keys.apiUrl + this.controllerName + "Insert", Data, {
            observe: "body",
            responseType: "text"
        });

        var result = await lastValueFrom(post$) as string;
        return result;
    }

    public async InsertInvHistoryList(Data: InvHistory[]): Promise<InvHistory[]> {
        const post$ = this.http.post(keys.apiUrl + this.controllerName + "InsertList", Data);

        var result = await lastValueFrom(post$) as InvHistory[];
        return result;
    }

    public async InsertInvHistorybyStoneList(InvLogItem: InvLogItem): Promise<boolean> {
        const post$ = this.http.post(keys.apiUrl + this.controllerName + "InsertListbyStoneId", InvLogItem);

        var result = await lastValueFrom(post$) as boolean;
        return result;
    }

    public async GetLeadInvHistoryByLeadIdStoneId(LeadId: string, StoneId: string): Promise<InvHistory[]> {
        const get$ = this.http.get(keys.apiUrl + this.controllerName + "GetLeadInvHistory/" + LeadId + "/" + StoneId);

        var result = await lastValueFrom(get$) as InvHistory[];
        return result;
    }
    public async GetByStoneIds(stoneId: string): Promise<StoneHistory> {
        const get$ = this.http.get(keys.apiUrl + this.controllerName + "GetByStoneIds/" + stoneId);

        var result=await lastValueFrom(get$) as StoneHistory;
        return result;
    }

}

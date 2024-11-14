import { HttpClient } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { lastValueFrom } from "rxjs";
import { keys } from 'shared/auth';
import { StoneProposalHistory } from "../../entities/stoneproposal/stoneproposalhistory";

@Injectable({
    providedIn: 'root'
})
export class StoneProposalHistoryService {

    public apiUrl = keys.apiUrl + "StoneProposalHistory/";

    constructor(private http: HttpClient) { }

    public async InsertStoneProposalHistory(Data: StoneProposalHistory): Promise<string> {
        const post$ = this.http.post(this.apiUrl + "Insert", Data, {
            observe: "body",
            responseType: "text"
        });

        var result = await lastValueFrom(post$) as string;
        return result;
    }

    public async GetStoneProposalHistoryById(StoneProposalId: string): Promise<StoneProposalHistory[]> {
        const get$ = this.http.get(this.apiUrl + "GetStoneProposalHistories/" + StoneProposalId);

        var result = await lastValueFrom(get$) as StoneProposalHistory[];
        return result;
    }

    public async getPaginatedStoneProposalHistories(StoneProposalHistoryCriteria: any, skip: number, take: number): Promise<any> {
        const post$ = this.http.post(this.apiUrl + "GetPaginatedLeadHistories/" + skip + "/" + take, StoneProposalHistoryCriteria);

        var result=await lastValueFrom(post$) as any;
        return result;
    }
}
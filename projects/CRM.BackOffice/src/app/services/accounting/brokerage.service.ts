import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { lastValueFrom } from "rxjs";
import { keys } from "shared/auth";
import { BrokerageSearchCriteria, BrokerageSearchResult } from "../../businessobjects";
import { Brokerage } from "../../entities";

@Injectable({
    providedIn: 'root'
})

export class BrokerageService {
    private baseUrl: string;

    constructor(private http: HttpClient) {
        this.baseUrl = keys.apiUrl + 'Brokerage/'
    }

    public async getBrokerageById(id: string): Promise<Brokerage> {
        const get$ = this.http.get(this.baseUrl + "Get/" + id);

        var result = await lastValueFrom(get$) as Brokerage;
        return result;
    }

    public async getBrokerageFiltered(criteria: BrokerageSearchCriteria): Promise<Array<Brokerage>> {
        const post$ = this.http.post(this.baseUrl + "GetFiltered", criteria);

        var result = await lastValueFrom(post$) as Array<Brokerage>;
        return result;
    }

    public async getBrokerageByCriteria(criteria: BrokerageSearchCriteria, skip: number, take: number): Promise<BrokerageSearchResult> {
        const post$ = this.http.post(this.baseUrl + "GetPaginated/" + skip + "/" + take, criteria);

        var result = await lastValueFrom(post$) as BrokerageSearchResult;
        return result;
    }

    public async update(brokerage: Brokerage): Promise<boolean> {
        brokerage.updatedBy = keys.loginUserIdent;
        const put$ = this.http.put(this.baseUrl + "Update", brokerage);

        var result = await lastValueFrom(put$) as boolean;
        return result;
    }

    public async updatePaidAmtDate(ids: string[]): Promise<boolean> {
        const post$ = this.http.post(this.baseUrl + "UpdatePaidAmtAndDate", ids);

        var result = await lastValueFrom(post$) as boolean;
        return result;
    }

    public async deleteWeeklyBrokeragsAsync(ids: string[]): Promise<boolean> {
        const post$ = this.http.post(this.baseUrl + "DeleteMany", ids);

        var result = await lastValueFrom(post$) as boolean;
        return result;
    }

}
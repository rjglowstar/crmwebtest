import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { lastValueFrom } from "rxjs";
import { keys } from "shared/auth";
import { SalesStatistics, SalesStatisticsSearchCriteria } from "../../businessobjects";

@Injectable({
    providedIn: 'root'
})

export class SalesStatisticsService {
    private baseUrl: string;

    constructor(private http: HttpClient) {
        this.baseUrl = keys.apiUrl + 'SalesStatistics/'
    }

    public async getSalesStatistics(criteria: SalesStatisticsSearchCriteria): Promise<SalesStatistics[]> {
        const post$ = this.http.post(this.baseUrl + "GetFiltered", criteria);

        var result = await lastValueFrom(post$) as SalesStatistics[];
        return result;
    }
}
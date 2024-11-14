import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { InventorySearchCriteria, PendingPricingResponse } from '../../businessobjects';
import { TempPricing } from '../../entities';
import { PendingPricing } from '../../entities/pricing/pendingpricing';

@Injectable({
    providedIn: 'root'
})
export class PendingPricingService {
    private url = keys.apiUrl + 'PendingPricing/';

    constructor(private http: HttpClient) { }

    public async insertPendingPricing(data: TempPricing[]): Promise<boolean> {
        const post$ = this.http.post(this.url + "InsertPendingPricing", data);

        var result = await lastValueFrom(post$) as boolean;
        return result;
    }

    public async deletePendingPrice(stoneIds: string[]): Promise<boolean> {
        const post$ = this.http.post(this.url + "Delete", stoneIds);

        var result = await lastValueFrom(post$) as boolean;
        return result;
    }

    public async getPendingPricingData(invFilter: InventorySearchCriteria, skip: number, take: number): Promise<PendingPricingResponse> {
        const post$ = this.http.post(this.url + "GetPaginated/" + skip + "/" + take, invFilter);

        var result = await lastValueFrom(post$) as PendingPricingResponse;
        return result;
    }

    public async getPendingPricingbyStoneIdsData(stoneIds: string[]): Promise<PendingPricing[]> {
        const post$ = this.http.post(this.url + "GetByStoneIds", stoneIds);

        var result=await lastValueFrom(post$) as PendingPricing[];
        return result;
    }
}


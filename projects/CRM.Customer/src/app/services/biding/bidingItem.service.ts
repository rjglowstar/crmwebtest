import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { BidingItems } from '../../entities/biding/bidingItems';

@Injectable({
    providedIn: 'root'
})

export class BidingItemService {
    constructor(private http: HttpClient) { }

    public async getBidingItemByStoneId(customerId?: string, bidNumber?: string, stoneIds?: string[]): Promise<BidingItems[]> {
        const get$ = this.http.post(keys.apiUrl + "BidingItem/GetItemByStoneId/" + customerId + "/" + bidNumber,  stoneIds);

        var result = await lastValueFrom(get$) as BidingItems[];
        return result;
    }

    public async getCustomerActiveBidItems(bidNumber?: string, customerId?: string): Promise<BidingItems[]> {
        const get$ = this.http.get(keys.apiUrl + "BidingItem/GetCustomerActiveBidItems/" + bidNumber + "/" + customerId);

        var result = await lastValueFrom(get$) as BidingItems[];
        return result;
    }

    public async insertBidingItemAsync(bidingItems: BidingItems, customerId?: string): Promise<boolean> {
        const post$ = this.http.post(keys.apiUrl + "BidingItem/Insert/" + customerId, bidingItems);

        const result = await lastValueFrom(post$) as boolean;
        return result;
    }

    public async updateBidsByExcelAsync(bidingItems: BidingItems[], customerId?: string): Promise<boolean> {
        const post$ = this.http.post(keys.apiUrl + "BidingItem/UpdateBidsByExcel/" + customerId, bidingItems);

        const result = await lastValueFrom(post$) as boolean;
        return result;
    }
}
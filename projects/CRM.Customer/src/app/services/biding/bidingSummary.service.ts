import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { BidingSummary } from '../../entities/biding/bidingSummary';
import { BidHistoryItems } from '../../businessobjects/biding/bidHistoryItems';

@Injectable({
    providedIn: 'root'
})

export class BidingSummaryService {
    constructor(private http: HttpClient) { }

    public async getBidByIsActiveBid(isActiveBid: boolean, isAdmin: boolean): Promise<BidingSummary> {
        const get$ = this.http.get(keys.apiUrl + "BidingSummary/Get/" + isActiveBid + "/" + isAdmin);

        var result = await lastValueFrom(get$) as BidingSummary;
        return result;
    }

    public async insertBidingAsync(bidingSummary: BidingSummary): Promise<boolean> {
        const post$ = this.http.post(keys.apiUrl + "BidingSummary/Insert", bidingSummary);

        const result = await lastValueFrom(post$) as boolean;
        return result;
    }

    public async getBidingHistoryAsync(customerId: string): Promise<BidHistoryItems[]> {
        const post$ = this.http.get(keys.apiUrl + "BidingSummary/GetBidHistory/" + customerId);

        const result = await lastValueFrom(post$) as BidHistoryItems[];
        return result;
    }
}
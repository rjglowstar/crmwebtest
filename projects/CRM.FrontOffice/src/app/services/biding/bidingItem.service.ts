import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { BidResultItems } from '../../businessobjects/biding/bidResultItems';
import { BidingItems } from '../../entities/biding/bidingItems';

@Injectable({
    providedIn: 'root'
})

export class BidingItemService {
    constructor(private http: HttpClient) { }

    public async getBidItemsByNumber(bidNumber?: string): Promise<BidingItems[]> {
        const get$ = this.http.get(keys.apiUrl + "BidingItem/GetBidItemsByNumber/" + bidNumber);

        var result = await lastValueFrom(get$) as BidingItems[];
        return result;
    }

    public async getBidingResultItems(bidNumber?: string, stoneId?: string): Promise<BidResultItems[]> {
        const get$ = this.http.get(keys.apiUrl + "BidingItem/GetBidingResultItems/" + bidNumber + "/" + stoneId);

        var result = await lastValueFrom(get$) as BidResultItems[];
        return result;
    }

    public async getAllApprovedBiddingItems(bidNumber?: string): Promise<BidingItems[]> {
        const get$ = this.http.get(keys.apiUrl + "BidingItem/GetApprovedBiddingItems/" + bidNumber);

        var result = await lastValueFrom(get$) as BidingItems[];
        return result;
    }

    public async approveBidStone(approvedBy?: string, bidResultItem?: BidResultItems, isApproved?: boolean): Promise<boolean> {
        const post$ = this.http.post(keys.apiUrl + "BidingItem/ApproveBidStone/" + approvedBy + "/" + isApproved, bidResultItem);

        var result = await lastValueFrom(post$) as boolean;
        return result;
    }
}
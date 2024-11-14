import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { BidingSummary } from '../../entities/biding/bidingSummary';
import { BidingResultDropDownData } from '../../businessobjects/biding/bidingResultDropdownData';

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

    public async getBidByBidNumber(bidNumber: string): Promise<BidingSummary> {
        const get$ = this.http.get(keys.apiUrl + "BidingSummary/GetBidByBidNumber/" + bidNumber);

        var result = await lastValueFrom(get$) as BidingSummary;
        return result;
    }

    public async getBidingNumbers(): Promise<BidingResultDropDownData[]> {
        const get$ = this.http.get(keys.apiUrl + "BidingSummary/GetBidNumbers");

        var result = await lastValueFrom(get$) as BidingResultDropDownData[];
        return result;
    }

    public async insertBidingAsync(bidingSummary: BidingSummary): Promise<boolean> {
        const post$ = this.http.post(keys.apiUrl + "BidingSummary/Insert", bidingSummary);

        const result = await lastValueFrom(post$) as boolean;
        return result;
    }

    public async updateBidingAsync(bidNumber: string, bidingSummary: BidingSummary): Promise<boolean> {
        const put$ = this.http.put(keys.apiUrl + "BidingSummary/Update/" + bidNumber, bidingSummary);

        const result = await lastValueFrom(put$) as boolean;
        return result;
    }

    public async keepUnsoldStone(bidNumber: string, stoneId: string, isKeepUnsold: boolean): Promise<boolean> {
        const get$ = this.http.get(keys.apiUrl + "BidingSummary/KeepUnsoldStone/" + bidNumber + "/" + stoneId + "/" + isKeepUnsold);

        var result = await lastValueFrom(get$) as boolean;
        return result;
    }
}
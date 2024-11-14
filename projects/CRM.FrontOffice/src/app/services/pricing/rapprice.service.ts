import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { RapPrice } from 'shared/enitites';
import { RapPriceRequest, RapUploadData, UpdateRap } from '../../businessobjects';

@Injectable({
    providedIn: 'root'
})

export class RapPriceService {

    constructor(private http: HttpClient) { }

    public async getAllData(): Promise<RapPrice[]> {
        const get$ = this.http.get(keys.apiUrl + "RapPrice/GetAll");

        var result = await lastValueFrom(get$) as RapPrice[];
        return result;
    }

    public async get(req: RapPriceRequest): Promise<RapPrice> {
        const post$ = this.http.post(keys.apiUrl + "RapPrice/Get", req);

        var result = await lastValueFrom(post$) as RapPrice;
        return result;
    }

    public async saveRapPriceFile(data: RapPrice[]): Promise<boolean> {
        const post$ = this.http.post(keys.apiUrl + "RapPrice/UploadRapPriceFile", data);

        var result = await lastValueFrom(post$) as boolean;
        return result;
    }

    public async getInvStoneIds(): Promise<string[]> {
        const get$ = this.http.get(keys.apiUrl + "RapPrice/GetInventoryItemStoneIds");

        var result = await lastValueFrom(get$) as string[];
        return result;
    }

    public async applyRapPrice(data: UpdateRap): Promise<RapUploadData[]> {
        const post$ = this.http.post(keys.apiUrl + "RapPrice/ApplyRap", data);

        var result = await lastValueFrom(post$) as RapUploadData[];
        return result;
    }

    public async getPricingRequestRapStoneIds(): Promise<string[]> {
        const get$ = this.http.get(keys.apiUrl + "RapPrice/GetPricingRequestRapStoneIds");

        var result = await lastValueFrom(get$) as string[];
        return result;
    }

    public async updatePricingRequestRap(data: UpdateRap): Promise<boolean> {
        const post$ = this.http.post(keys.apiUrl + "RapPrice/UpdatePricingRequestRap", data);

        var result = await lastValueFrom(post$) as boolean;
        return result;
    }

    public async getPendingPricingRapStoneIds(): Promise<string[]> {
        const get$ = this.http.get(keys.apiUrl + "RapPrice/GetPendingPricingRapStoneIds");

        var result = await lastValueFrom(get$) as string[];
        return result;
    }

    public async updatePendingPricingRap(data: UpdateRap): Promise<boolean> {
        const post$ = this.http.post(keys.apiUrl + "RapPrice/UpdatePendingPricingRap", data);

        var result = await lastValueFrom(post$) as boolean;
        return result;
    }

    public async getTempPricingRapStoneIds(): Promise<string[]> {
        const get$ = this.http.get(keys.apiUrl + "RapPrice/GetTempPricingRapStoneIds");

        var result = await lastValueFrom(get$) as string[];
        return result;
    }

    public async updateTempPricingRap(data: UpdateRap): Promise<boolean> {
        const post$ = this.http.post(keys.apiUrl + "RapPrice/UpdateTempPricingRap", data);

        var result = await lastValueFrom(post$) as boolean;
        return result;
    }
}
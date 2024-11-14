import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { CommonDataResponse, CommonResponse } from 'shared/businessobjects';
import { CommuteItem, ExportRequestData, MediaInput, MediaStatus, RapUploadData, RapUploadResponse, TempPricingRequest, UpdateHoldReleaseInventory } from '../../businessobjects';
import { KapanPacketItem } from '../../businessobjects/common/kapanpacketitem';
import { StoneNameChangeItem } from '../../businessobjects/common/stonenamechangeitem';
import { StoneNameResultItem } from '../../businessobjects/common/stonenameresultitem';
import { FancyCutItem } from '../../businessobjects/commute/fancycutitem';
import { UpdateBaseDisc } from '../../businessobjects/commute/updatebasedis';

@Injectable({
    providedIn: 'root'
})
export class CommuteService {

    constructor(private http: HttpClient) { }

    public async updateStoneHold(data: CommuteItem, orgApi: string): Promise<boolean> {
        const put$ = this.http.put(orgApi + "Commute/UpdateStoneHold", data);

        var result = await lastValueFrom(put$) as boolean;
        return result;
    }

    public async updateStoneCut(data: FancyCutItem[], orgApi: string): Promise<boolean> {
        const put$ = this.http.put(orgApi + "Commute/UpdateStoneCut", data);

        var result = await lastValueFrom(put$) as boolean;
        return result;
    }

    public async updatePricingRequest(data: TempPricingRequest[], orgApi: string): Promise<CommonDataResponse> {
        const put$ = this.http.put(orgApi + "Commute/UpdateInventoryPricing", data);

        var result = await lastValueFrom(put$) as CommonDataResponse;
        return result;
    }

    public async updateTempPricing(data: TempPricingRequest[], orgApi: string): Promise<CommonDataResponse> {
        const put$ = this.http.put(orgApi + "Commute/UpdateInventoryPricingFromTempPricing", data);

        var result = await lastValueFrom(put$) as CommonDataResponse;
        return result;
    }

    public async updateInventoryOnHoldRelease(data: UpdateHoldReleaseInventory[], orgApi: string): Promise<number> {
        const put$ = this.http.put(orgApi + "Commute/UpdateInventoryForHoldRelease", data);

        var result = await lastValueFrom(put$) as number;
        return result;
    }

    public async reverseUpdatePricingRequest(data: TempPricingRequest[], orgApi: string): Promise<CommonDataResponse> {
        const put$ = this.http.put(orgApi + "Commute/ReverseUpdateInventoryPricing", data);

        var result = await lastValueFrom(put$) as CommonDataResponse;
        return result;
    }

    public async applyRapPrice(data: RapUploadData[], orgApi: string): Promise<RapUploadResponse> {
        const post$ = this.http.post(orgApi + "Commute/ApplyRap", data);

        var result = await lastValueFrom(post$) as RapUploadResponse;
        return result;
    }

    public async checkOrder(leadNo: string, orgApi: string, stoneIds: Array<string>): Promise<string[]> {
        const post$ = this.http.post(orgApi + "Commute/CheckValidOrderForDelete/" + leadNo, stoneIds);

        var result = await lastValueFrom(post$) as string[];
        return result;
    }

    public async deleteOrder(leadNo: string, orgApi: string, stoneIds: Array<string>): Promise<CommonDataResponse> {
        const post$ = this.http.post(orgApi + "Commute/DeleteValidOrder/" + leadNo, stoneIds);

        var result = await lastValueFrom(post$) as CommonDataResponse;
        return result;
    }

    public async deleteIntraCompanyOrder(leadNo: string, orgApi: string, stoneIds: Array<string>): Promise<CommonDataResponse> {
        const post$ = this.http.post(orgApi + "Commute/DeleteValidOrderForIntraCompany/" + leadNo, stoneIds);

        var result = await lastValueFrom(post$) as CommonDataResponse;
        return result;
    }

    public async checkForReceiptCreate(leadId: string, orgApi: string): Promise<CommonDataResponse> {
        const get$ = this.http.get(orgApi + "Commute/GetReceiptGeneratedUserIdsForSalesCancel/" + leadId);

        var result = await lastValueFrom(get$) as CommonDataResponse;
        return result;
    }

    public async checkForPaidTransaction(leadId: string, orgApi: string): Promise<CommonDataResponse> {
        const get$ = this.http.get(orgApi + "Commute/CheckPaidTranasction/" + leadId);

        var result = await lastValueFrom(get$) as CommonDataResponse;
        return result;
    }

    public async updateSalesCancel(stoneIds: string[], orgApi: string): Promise<CommonDataResponse> {
        const put$ = this.http.put(orgApi + "Commute/UpdateSalesCancel", stoneIds);

        var result = await lastValueFrom(put$) as CommonDataResponse;
        return result;
    }

    public async updateMediaStatus(mediaInput: MediaInput[]): Promise<Array<MediaStatus>> {
        const post$ = this.http.post(keys.apiUrl + "Commute/UpdateMediaStatus", mediaInput);

        var result = await lastValueFrom(post$) as MediaStatus[];
        return result;
    }

    public async updateMediaStatusInInventory(mediaStatus: MediaStatus[]): Promise<boolean> {
        const post$ = this.http.post(keys.apiUrl + "Commute/UpdateMediaStatusInInventory", mediaStatus);

        var result = await lastValueFrom(post$) as boolean;
        return result;
    }

    public async insertExportRequest(data: ExportRequestData, orgApi: string): Promise<CommonResponse> {
        const post$ = this.http.post(orgApi + "Commute/InsertExportRequest", data);

        var result = await lastValueFrom(post$) as CommonResponse;
        return result;
    }

    public async stoneNameChange(stoneNameChangeItems: StoneNameChangeItem[], orgApi: string): Promise<StoneNameResultItem[]> {
        const post$ = this.http.post(orgApi + "Config/ChangeStoneName", stoneNameChangeItems);

        var result = await lastValueFrom(post$) as StoneNameResultItem[];
        return result;
    }

    public async changeKapanSoldStone(kapans: string[], orgApi: string): Promise<KapanPacketItem[]> {
        const post$ = this.http.post(orgApi + "Config/ChangeKapanSoldStone", kapans);

        var result = await lastValueFrom(post$) as KapanPacketItem[];
        return result;
    }

    public async updateBaseDiscount(updateBaseDisc: UpdateBaseDisc, orgApi: string): Promise<boolean> {
        const put$ = this.http.put(orgApi + "Commute/UpdateBaseDisc", updateBaseDisc);

        var result = await lastValueFrom(put$) as boolean;
        return result;
    }

}
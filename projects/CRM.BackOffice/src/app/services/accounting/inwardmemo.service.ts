import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { lastValueFrom } from "rxjs";
import { keys } from "shared/auth";
import { InWardMemoSearchCriteria, InWardMemoSearchResult, MemoSearchCriteria } from "../../businessobjects";
import { InWardMemo, InventoryItems } from "../../entities";

@Injectable({
    providedIn: 'root'
})

export class InwardMemoService {
    private baseUrl: string;

    constructor(private http: HttpClient) {
        this.baseUrl = keys.apiUrl + 'InwardMemo/'
    }

    public async getbyId(memoId: string): Promise<InWardMemo> {
        const get$ = this.http.get(this.baseUrl + "GetbyId/" + memoId);

        var result = await lastValueFrom(get$) as InWardMemo;
        return result;
    }

    public async getAll(): Promise<InWardMemo[]> {
        const get$ = this.http.get(this.baseUrl + "GetAll");

        var result = await lastValueFrom(get$) as InWardMemo[];
        return result;
    }

    public async getCount(includeReceived: boolean): Promise<number> {
        const get$ = this.http.get(this.baseUrl + "GetCount/" + includeReceived);

        var result = await lastValueFrom(get$) as number;
        return result;
    }

    public async getPaginated(skip: number, take: number): Promise<InWardMemo[]> {
        const get$ = this.http.get(this.baseUrl + "GetPaginated/" + skip + "/" + take);

        var result = await lastValueFrom(get$) as InWardMemo[];
        return result;
    }

    public async getPaginatedByCriteria(criteria: InWardMemoSearchCriteria, skip: number, take: number): Promise<InWardMemoSearchResult> {
        const post$ = this.http.post(this.baseUrl + "GetPaginatedByCriteria/" + skip + "/" + take, criteria);

        var result = await lastValueFrom(post$) as InWardMemoSearchResult;
        return result;
    }

    public async getFiltered(criteria: MemoSearchCriteria): Promise<InWardMemo[]> {
        const post$ = this.http.post(this.baseUrl + "GetFiltered", criteria)

        var result = await lastValueFrom(post$) as InWardMemo[];
        return result;
    }

    public async getInwardMemoInvsByStoneIds(stoneIds: string[], partyId: string): Promise<InventoryItems[]> {
        const post$ = this.http.post(this.baseUrl + "GetInwardMemoInventoryByStoneIds/" + partyId, stoneIds);

        var result = await lastValueFrom(post$) as InventoryItems[]
        return result;
    }

    public async getInwardMemoInvsByCertificateIds(certificateIds: string[], partyId: string): Promise<InventoryItems[]> {
        const post$ = this.http.post(this.baseUrl + "GetInwardMemoInventoryByCertificateNo/" + partyId, certificateIds);

        var result = await lastValueFrom(post$) as InventoryItems[];
        return result;
    }

    public async insert(inwardMemo: InWardMemo): Promise<string> {
        const post$ = this.http.post(this.baseUrl + "Insert", inwardMemo, {
            observe: "body",
            responseType: "text"
        });

        var result = await lastValueFrom(post$) as string;
        return result;
    }

    public async insertInwardMemoInventory(invItems: InventoryItems[]): Promise<boolean> {
        const post$ = this.http.post(this.baseUrl + "InsertMemoInvs", invItems);

        var result = await lastValueFrom(post$) as boolean;
        return result;
    }

    public async update(inwardMemo: InWardMemo): Promise<boolean> {
        inwardMemo.updatedBy = keys.loginUserIdent;
        const put$ = this.http.put(this.baseUrl + "Update", inwardMemo);

        var result = await lastValueFrom(put$) as boolean;
        return result;
    }

    public async updateForReturnStones(stoneIds: string[]): Promise<boolean> {
        const put$ = this.http.put(this.baseUrl + "UpdateForReturnStone", stoneIds);

        var result = await lastValueFrom(put$) as boolean;
        return result;
    }

    public async updateForPurchasedStones(stoneIds: string[]): Promise<boolean> {
        const put$ = this.http.put(this.baseUrl + "UpdateForPurchaseStone", stoneIds);

        var result = await lastValueFrom(put$) as boolean;
        return result;
    }

    public async delete(memoId: string): Promise<boolean> {
        const delete$ = this.http.delete(this.baseUrl + "Delete/" + memoId);

        var result = await lastValueFrom(delete$) as boolean;
        return result;
    }

    public async validateMemoNoExits(memoNo: string): Promise<boolean> {
        const get$ = this.http.get(this.baseUrl + "ValidateMemoNoExits/" + memoNo);

        var result = await lastValueFrom(get$) as boolean;
        return result;
    }

}
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { MemoReceiveInventoryItems, MemoReceiveItems, MemoReceiveResponse, MemoResponse, MemoSearchCriteria } from '../../businessobjects';
import { MemoInventoryPrice } from '../../businessobjects/memo/memoinventroyprice';
import { MemoReceive } from '../../businessobjects/memo/memoreceive';
import { MemoSummary } from '../../businessobjects/memo/memosummary';
import { SaleMemo } from '../../businessobjects/memo/salememo';
import { InventoryItems, Memo, TakenBy } from '../../entities';

@Injectable({
    providedIn: 'root'
})

export class MemoService {

    constructor(private http: HttpClient) { }

    public async getMemoInventoryUpdate(memoData: MemoReceiveItems): Promise<boolean> {
        const post$ = this.http.post(keys.apiUrl + "Memo/UpdateInventoryMemo", memoData);

        var result = await lastValueFrom(post$) as boolean;
        return result;
    }

    public async getMemos(memoSearchCriteria: MemoSearchCriteria, skip: number, take: number): Promise<MemoResponse> {
        const post$ = this.http.post(keys.apiUrl + "Memo/GetPaginated/" + skip + "/" + take, memoSearchCriteria);

        var result = await lastValueFrom(post$) as MemoResponse;
        return result;
    }

    public async getMemoSummary(criteria: MemoSearchCriteria): Promise<MemoSummary> {
        const post$ = this.http.post(keys.apiUrl + "Memo/GetMemoSummary", criteria);

        var result = await lastValueFrom(post$) as MemoSummary;
        return result;
    }

    public async insertMemo(memo: Memo, isRepairProcess: boolean): Promise<string> {
        const post$ = this.http.post(keys.apiUrl + "Memo/Insert/" + isRepairProcess, memo, {
            observe: "body",
            responseType: "text"
        });

        var result = await lastValueFrom(post$) as string;
        return result;
    }

    public async updateMemo(memo: Memo): Promise<string> {
        memo.updatedBy = keys.loginUserIdent;
        const put$ = this.http.put(keys.apiUrl + "Memo/Update", memo, {
            observe: "body",
            responseType: "text"
        });

        var result = await lastValueFrom(put$) as string;
        return result;
    }

    public async deleteMemo(Id: string): Promise<boolean> {
        const delete$ = this.http.delete(keys.apiUrl + "Memo/Delete/" + Id);

        var result = await lastValueFrom(delete$) as boolean;
        return result;
    }

    public async fetchMemoByStone(memoReceiveObj: MemoReceive): Promise<MemoReceiveResponse[]> {
        const post$ = this.http.post(keys.apiUrl + "Memo/MemoStones", memoReceiveObj);

        var result = await lastValueFrom(post$) as MemoReceiveResponse[];
        return result;
    }

    public async removeMemoStones(stoneIds: string[]): Promise<boolean> {
        const put$ = this.http.put(keys.apiUrl + "Memo/RemoveStones", stoneIds);

        var result = await lastValueFrom(put$) as boolean;
        return result;
    }

    public async getInventoriesByIdentId(identId: string): Promise<InventoryItems[]> {
        const get$ = this.http.get(keys.apiUrl + "Memo/GetInventoriesByIdent/" + identId);

        var result = await lastValueFrom(get$) as InventoryItems[];
        return result;
    }

    public async getvalidStoneIdForSales(stoneIds: string[], partyId: string): Promise<string[]> {
        const post$ = this.http.post(keys.apiUrl + "Memo/GetValidMemoStone/" + partyId, stoneIds);

        var result = await lastValueFrom(post$) as string[];
        return result;
    }

    public async getSaleMemo(stoneId: string[], partyId: string): Promise<SaleMemo[]> {
        const post$ = this.http.post(keys.apiUrl + "Memo/GetSaleMemo/" + partyId, stoneId);

        var result = await lastValueFrom(post$) as SaleMemo[];
        return result;
    }

    public async getStonePriceFromMemo(stoneIds: string[], partyId: string): Promise<MemoInventoryPrice[]> {
        const post$ = this.http.post(keys.apiUrl + "Memo/GetMemoStonePrice/" + partyId, stoneIds);

        var result = await lastValueFrom(post$) as MemoInventoryPrice[];
        return result;
    }

    public async getInventoriesByStoneID(stoneId: string): Promise<InventoryItems[]> {
        const get$ = this.http.get(keys.apiUrl + "Memo/GetInventoriesByStone/" + stoneId);

        var result = await lastValueFrom(get$) as InventoryItems[];
        return result;
    }

    public async updateInventoryListData(inventoryItems: InventoryItems[]): Promise<boolean> {
        inventoryItems.forEach(z => { z.updatedBy = keys.loginUserIdent; });
        const put$ = this.http.put(keys.apiUrl + "Memo/UpdateInventoryList", inventoryItems);

        var result = await lastValueFrom(put$) as boolean;
        return result;
    }

    public async updateInventoryListMRData(memoInventoryItems: Array<MemoReceiveInventoryItems>): Promise<boolean> {
        memoInventoryItems.forEach(z => { z.updatedBy = keys.loginUserIdent; });
        const post$ = this.http.post(keys.apiUrl + "Memo/UpdateMRInventoryList", memoInventoryItems);

        var result = await lastValueFrom(post$) as boolean;
        return result;
    }

    public async getTakenByName(name: string): Promise<TakenBy[]> {
        const get$ = this.http.get(keys.apiUrl + "Memo/GetTakenByName/" + name);

        var result = await lastValueFrom(get$) as TakenBy[];
        return result;
    }

    public async insertTakenBy(takenBy: TakenBy): Promise<TakenBy> {
        const post$ = this.http.post(keys.apiUrl + "Memo/InsertTakenBy", takenBy);

        var result = await lastValueFrom(post$) as TakenBy;
        return result;
    }

    public async getDataByMemoNo(memoNo: string): Promise<Memo> {
        const get$ = this.http.get(keys.apiUrl + "Memo/GetDataByMemoNo/" + memoNo);

        var result = await lastValueFrom(get$) as Memo;
        return result;
    }

    public async getById(Id: string): Promise<Memo> {
        const get$=this.http.get(keys.apiUrl + "Memo/Get/" + Id);

        var result=await lastValueFrom(get$) as Memo;
        return result;
    }

}
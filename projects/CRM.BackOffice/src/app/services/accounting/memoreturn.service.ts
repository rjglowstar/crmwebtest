import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { lastValueFrom } from "rxjs";
import { keys } from "shared/auth";
import { MemoReturnInwardNo, MemoReturnSearchCriteria, MemoReturnSearchResult } from "../../businessobjects";
import { InWardMemo, Memoreturn } from "../../entities";
@Injectable({
    providedIn: 'root'
})

export class MemoReturnService {
    private baseUrl: string;

    constructor(private http: HttpClient) {
        this.baseUrl = keys.apiUrl + 'MemoReturn/'
    }

    public async getPaginatedByCriteria(criteria: MemoReturnSearchCriteria, skip: number, take: number): Promise<MemoReturnSearchResult> {
        const post$ = this.http.post(this.baseUrl + "GetPaginatedByCriteria/" + skip + "/" + take, criteria);

        var result = await lastValueFrom(post$) as MemoReturnSearchResult;
        return result;
    }

    public async getInwardMemoFromMemoNo(memoReturnInwardNo: MemoReturnInwardNo): Promise<InWardMemo> {
        const post$ = this.http.post(this.baseUrl + "GetInwardMemoFromMemoNo", memoReturnInwardNo);

        var result = await lastValueFrom(post$) as InWardMemo;
        return result;
    }

    public async getMemoReturnFromMemoNo(id: string): Promise<Memoreturn> {
        const get$ = this.http.get(this.baseUrl + "GetMemoReturnFromMemoNo/" + id);

        var result = await lastValueFrom(get$) as Memoreturn;
        return result;
    }

    public async insert(memoReturn: Memoreturn): Promise<string> {
        const post$ = this.http.post(this.baseUrl + "Insert", memoReturn, {
            observe: "body",
            responseType: "text"
        });

        var result = await lastValueFrom(post$) as string;
        return result;
    }

    public async delete(Id: string): Promise<boolean> {
        const delete$ = this.http.delete(this.baseUrl + "Delete/" + Id)

        var result = await lastValueFrom(delete$) as boolean;
        return result;
    }
}
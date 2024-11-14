import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { lastValueFrom } from "rxjs";
import { keys } from "shared/auth";
import { Scheme } from "../../entities";

@Injectable({
    providedIn: "root"
})
export class SchemeService {
    public apiUrl = keys.apiUrl + "Schemes/";

    constructor(private http: HttpClient) { }

    public async getOnlineSchemeAsync(isOnLine: boolean): Promise<Scheme> {
        const get$ = this.http.get(this.apiUrl + "GetByType/" + isOnLine);

        var result=await lastValueFrom(get$) as Scheme;
        return result;
    }
}
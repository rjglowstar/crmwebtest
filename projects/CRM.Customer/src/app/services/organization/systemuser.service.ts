import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { lastValueFrom } from "rxjs";
import { keys } from "shared/auth";
import { SystemUserDNorm } from "../../entities";

@Injectable({
    providedIn: 'root'
})
export class SystemUserService {
    public apiUrl = keys.apiUrl + "SystemUser/";

    constructor(private http: HttpClient) { }

    public async getSystemUserDNormAsync(userId: string): Promise<SystemUserDNorm> {
        const get$ = this.http.get(this.apiUrl + "GetEmpDNormById/" + userId);

        var result = await lastValueFrom(get$) as SystemUserDNorm;
        return result;
    }

    public async getAllSupportersAsync(): Promise<SystemUserDNorm[]> {
        const get$ = this.http.get(this.apiUrl + "GetSupporterSystemUserDNorm");

        var result=await lastValueFrom(get$) as SystemUserDNorm[]
        return result;
    }

}
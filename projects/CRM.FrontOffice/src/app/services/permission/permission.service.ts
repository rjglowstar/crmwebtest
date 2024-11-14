import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { OriginPermission, SystemUserPermission } from 'shared/enitites';

@Injectable({
    providedIn: 'root'
})

export class PermissionService {

    constructor(private http: HttpClient) { }

    async getOriginPermission(origin: string): Promise<OriginPermission> {
        const get$ = this.http.get(keys.apiUrl + "Permission/Origin/Get/" + origin);

        var result = await lastValueFrom(get$) as OriginPermission;
        return result;
    }

    async insertOriginPermission(orgPermission: OriginPermission): Promise<string> {
        const post$ = this.http.post(keys.apiUrl + "Permission/Origin/Insert", orgPermission, {
            observe: "body",
            responseType: "text"
        });

        var result = await lastValueFrom(post$) as string;
        return result;
    }

    async updateOriginPermission(orgPermission: OriginPermission): Promise<boolean> {
        orgPermission.updatedBy = keys.loginUserIdent;
        const put$ = this.http.put(keys.apiUrl + "Permission/Origin/Update", orgPermission);

        var result = await lastValueFrom(put$) as boolean;
        return result;
    }

    async getSystemUserPermission(systemUserId: string): Promise<SystemUserPermission> {
        const get$ = this.http.get(keys.apiUrl + "Permission/SystemUser/Get/" + systemUserId);

        var result = await lastValueFrom(get$) as SystemUserPermission;
        return result;
    }

    async insertSystemUserPermission(systemUserPermission: SystemUserPermission): Promise<string> {
        const post$ = this.http.post(keys.apiUrl + "Permission/SystemUser/Insert", systemUserPermission, {
            observe: "body",
            responseType: "text"
        });

        var result = await lastValueFrom(post$) as string;
        return result;
    }

    async updateSystemUserPermission(systemUserPermission: SystemUserPermission): Promise<boolean> {
        systemUserPermission.updatedBy = keys.loginUserIdent;
        const put$ = this.http.put(keys.apiUrl + "Permission/SystemUser/Update", systemUserPermission);

        var result = await lastValueFrom(put$) as boolean;
        return result;
    }
}
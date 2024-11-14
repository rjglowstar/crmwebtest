import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { DeptPermission, EmpPermission, OriginPermission } from 'shared/enitites';

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

    async getDepartmentPermission(deptId: string): Promise<DeptPermission> {
        const get$ = this.http.get(keys.apiUrl + "Permission/Department/Get/" + deptId);

        var result = await lastValueFrom(get$) as DeptPermission;
        return result;
    }

    async insertDeptPermission(deptPermission: DeptPermission): Promise<string> {
        const post$ = this.http.post(keys.apiUrl + "Permission/Department/Insert", deptPermission, {
            observe: "body",
            responseType: "text"
        });

        var result = await lastValueFrom(post$) as string;
        return result;
    }

    async updateDeptPermission(deptPermission: DeptPermission): Promise<boolean> {
        deptPermission.updatedBy = keys.loginUserIdent;
        const put$ = this.http.put(keys.apiUrl + "Permission/Department/Update", deptPermission);

        var result = await lastValueFrom(put$) as boolean;
        return result;
    }

    async getEmployeePermission(deptId: string): Promise<EmpPermission> {
        const get$ = this.http.get(keys.apiUrl + "Permission/Employee/Get/" + deptId);

        var result = await lastValueFrom(get$) as EmpPermission;
        return result;
    }

    async insertEmpPermission(empPermission: EmpPermission): Promise<string> {
        const post$ = this.http.post(keys.apiUrl + "Permission/Employee/Insert", empPermission, {
            observe: "body",
            responseType: "text"
        });

        var result = await lastValueFrom(post$) as string;
        return result;
    }

    async updateEmpPermission(empPermission: EmpPermission): Promise<boolean> {
        empPermission.updatedBy = keys.loginUserIdent;
        const put$ = this.http.put(keys.apiUrl + "Permission/Employee/Update", empPermission);

        var result = await lastValueFrom(put$) as boolean;
        return result;
    }
}
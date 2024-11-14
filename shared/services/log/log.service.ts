import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { DbLog } from 'shared/enitites';

@Injectable({
    providedIn: 'root'
})

export class LogService {
    controllerPath: string = 'Commute/';

    constructor(private http: HttpClient) { }

    public async insertLog(log: DbLog): Promise<boolean> {
        const post$ = this.http.post(keys.apiUrl + this.controllerPath + "AddDBLog", log);

        var result = await lastValueFrom(post$) as boolean;
        return result;
    }
}
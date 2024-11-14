import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { MasterConfig, MasterDNorm } from 'shared/enitites';

@Injectable({
    providedIn: 'root'
})

export class MasterConfigService {
    controllerPath: string = 'MasterConfig/';

    constructor(private http: HttpClient) { }

    //#region Get
    async getAllMasterConfig(): Promise<MasterConfig> {
        let masterConfig = JSON.parse(sessionStorage.getItem("MasterConfig")!) as MasterConfig;
        if (!masterConfig) {
            const get$ = this.http.get(keys.apiUrl + this.controllerPath + "Get")
            masterConfig = await lastValueFrom(get$) as MasterConfig;
            if (masterConfig)
                sessionStorage.setItem("MasterConfig", JSON.stringify(masterConfig));

        }
        return masterConfig
    }

    async getMasterConfigById(masterConfigId: string): Promise<MasterConfig> {
        const get$ = this.http.get(keys.apiUrl + this.controllerPath + "Get/" + masterConfigId);

        var result = await lastValueFrom(get$) as MasterConfig;
        return result;
    }

    async getAllInclusions(): Promise<MasterDNorm[]> {
        const get$ = this.http.get(keys.apiUrl + this.controllerPath + "Get/Inclusions");

        var result = await lastValueFrom(get$) as MasterDNorm[];
        return result;
    }

    async getAllMeasurements(): Promise<MasterDNorm[]> {
        const get$ = this.http.get(keys.apiUrl + this.controllerPath + "Get/Measurements");

        var result=await lastValueFrom(get$) as MasterDNorm[];
        return result;
    }
    //#endregion
}
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { CutDetailDNorm, FancyCutDetailDNorm, MasterConfig, MasterConfigType, MasterDNorm } from 'shared/enitites';

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
            const get$ = this.http.get(keys.apiUrl + this.controllerPath + "Get");
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

        var result = await lastValueFrom(get$) as MasterDNorm[];
        return result;
    }
    //#endregion

    //#region Insert
    async insertLab(lab: MasterDNorm): Promise<boolean> {
        const post$ = this.http.post(keys.apiUrl + this.controllerPath + "InsertLab", lab);

        var result = await lastValueFrom(post$) as boolean;
        return result;
    }

    async insertShape(shape: MasterDNorm): Promise<boolean> {
        const post$ = this.http.post(keys.apiUrl + this.controllerPath + "InsertShape", shape);

        var result = await lastValueFrom(post$) as boolean;
        return result;
    }

    async insertColors(colors: MasterDNorm): Promise<boolean> {
        const post$ = this.http.post(keys.apiUrl + this.controllerPath + "InsertColors", colors);

        var result = await lastValueFrom(post$) as boolean;
        return result;
    }

    async insertClarities(clarities: MasterDNorm): Promise<boolean> {
        const post$ = this.http.post(keys.apiUrl + this.controllerPath + "InsertClarities", clarities);

        var result = await lastValueFrom(post$) as boolean;
        return result;
    }

    async insertCPS(cps: MasterDNorm): Promise<boolean> {
        const post$ = this.http.post(keys.apiUrl + this.controllerPath + "InsertCPS", cps);

        var result = await lastValueFrom(post$) as boolean;
        return result;
    }

    async insertFluorescence(fluorescence: MasterDNorm): Promise<boolean> {
        const post$ = this.http.post(keys.apiUrl + this.controllerPath + "InsertFluorescence", fluorescence);

        var result = await lastValueFrom(post$) as boolean;
        return result;
    }

    async insertCut(cut: MasterDNorm): Promise<boolean> {
        const post$ = this.http.post(keys.apiUrl + this.controllerPath + "InsertCut", cut);

        var result = await lastValueFrom(post$) as boolean;
        return result;
    }

    async insertCutDetails(cutDetails: CutDetailDNorm[]): Promise<boolean> {
        const post$ = this.http.post(keys.apiUrl + this.controllerPath + "InsertCutDetails", cutDetails);

        var result = await lastValueFrom(post$) as boolean;
        return result;
    }

    async insertFancyCutDetails(fancyCutDetail: FancyCutDetailDNorm): Promise<boolean> {
        const post$ = this.http.post(keys.apiUrl + this.controllerPath + "InsertFancyCutDetail", fancyCutDetail);

        var result = await lastValueFrom(post$) as boolean;
        return result;
    }

    async insertInclusion(inclusion: MasterDNorm): Promise<boolean> {
        const post$ = this.http.post(keys.apiUrl + this.controllerPath + "InsertInclusion", inclusion);

        var result = await lastValueFrom(post$) as boolean;
        return result;
    }

    async insertMeasurement(measurement: MasterDNorm): Promise<boolean> {
        const post$ = this.http.post(keys.apiUrl + this.controllerPath + "InsertMeasurement", measurement);

        var result = await lastValueFrom(post$) as boolean;
        return result;
    }
    //#endregion

    //#region Update
    async updateLab(lab: MasterDNorm): Promise<boolean> {
        const put$ = this.http.put(keys.apiUrl + this.controllerPath + "UpdateLab", lab);

        var result = await lastValueFrom(put$) as boolean;
        return result;
    }

    async updateShape(shape: MasterDNorm): Promise<boolean> {
        const put$ = this.http.put(keys.apiUrl + this.controllerPath + "UpdateShape", shape);

        var result = await lastValueFrom(put$) as boolean;
        return result;
    }

    async updateColors(colors: MasterDNorm): Promise<boolean> {
        const put$ = this.http.put(keys.apiUrl + this.controllerPath + "UpdateColors", colors);

        var result = await lastValueFrom(put$) as boolean;
        return result;
    }

    async updateClarities(clarities: MasterDNorm): Promise<boolean> {
        const put$ = this.http.put(keys.apiUrl + this.controllerPath + "UpdateClarities", clarities);

        var result = await lastValueFrom(put$) as boolean;
        return result
    }

    async updateCPS(cps: MasterDNorm): Promise<boolean> {
        const put$ = this.http.put(keys.apiUrl + this.controllerPath + "UpdateCPS", cps);

        var result = await lastValueFrom(put$) as boolean;
        return result;
    }

    async updateFluorescence(fluorescence: MasterDNorm): Promise<boolean> {
        const put$ = this.http.put(keys.apiUrl + this.controllerPath + "UpdateFluorescence", fluorescence);

        var result = await lastValueFrom(put$) as boolean;
        return result;
    }

    async updateCut(cut: MasterDNorm): Promise<boolean> {
        const put$ = this.http.put(keys.apiUrl + this.controllerPath + "UpdateCut", cut);

        var result = await lastValueFrom(put$) as boolean;
        return result;
    }

    async updateCutDetails(cutDetails: CutDetailDNorm): Promise<boolean> {
        const put$ = this.http.put(keys.apiUrl + this.controllerPath + "UpdateCutDetails", cutDetails);

        var result = await lastValueFrom(put$) as boolean;
        return result;
    }

    async updateInclusion(inclusion: MasterDNorm): Promise<boolean> {
        const put$ = this.http.put(keys.apiUrl + this.controllerPath + "UpdateInclusion", inclusion);

        var result = await lastValueFrom(put$) as boolean;
        return result;
    }

    async updateActiveInclusion(inclusionType: MasterConfigType): Promise<boolean> {
        const put$ = this.http.put(keys.apiUrl + this.controllerPath + "UpdateInclusionActive", inclusionType);

        var result = await lastValueFrom(put$) as boolean;
        return result;
    }

    async updateFancyCut(data: FancyCutDetailDNorm): Promise<boolean> {
        const put$ = this.http.put(keys.apiUrl + this.controllerPath + "UpdateFancyCut", data);

        var result = await lastValueFrom(put$) as boolean;
        return result;
    }

    async updateMeasurement(measurement: MasterDNorm): Promise<boolean> {
        const put$ = this.http.put(keys.apiUrl + this.controllerPath + "UpdateMeasurement", measurement);

        var result = await lastValueFrom(put$) as boolean;
        return result;
    }

    async updateActiveMeasurement(measurementType: MasterConfigType): Promise<boolean> {
        const put$ = this.http.put(keys.apiUrl + this.controllerPath + "UpdateMeasurementActive", measurementType);

        var result = await lastValueFrom(put$) as boolean;
        return result;
    }
    //#endregion

    //#region Delete
    async deleteLab(labId: string): Promise<boolean> {
        const delete$ = this.http.delete(keys.apiUrl + this.controllerPath + "DeleteLab/" + labId);

        var result = await lastValueFrom(delete$) as boolean;
        return result;
    }

    async deleteShape(shapeId: string): Promise<boolean> {
        const delete$ = this.http.delete(keys.apiUrl + this.controllerPath + "DeleteShape/" + shapeId);

        var result = await lastValueFrom(delete$) as boolean;
        return result;
    }

    async deleteColors(colorsId: string): Promise<boolean> {
        const delete$ = this.http.delete(keys.apiUrl + this.controllerPath + "DeleteColors/" + colorsId);

        var result = await lastValueFrom(delete$) as boolean;
        return result;
    }

    async deleteClarities(claritiesId: string): Promise<boolean> {
        const delete$ = this.http.delete(keys.apiUrl + this.controllerPath + "DeleteClarities/" + claritiesId);

        var result = await lastValueFrom(delete$) as boolean;
        return result;
    }

    async deleteCPS(cpsId: string): Promise<boolean> {
        const delete$ = this.http.delete(keys.apiUrl + this.controllerPath + "DeleteCPS/" + cpsId);

        var result = await lastValueFrom(delete$) as boolean;
        return result;
    }

    async deleteFluorescence(fluorescenceId: string): Promise<boolean> {
        const delete$ = this.http.delete(keys.apiUrl + this.controllerPath + "DeleteFluorescence/" + fluorescenceId);

        var result = await lastValueFrom(delete$) as boolean;
        return result;
    }

    async deleteCut(cutId: string): Promise<boolean> {
        const delete$ = this.http.delete(keys.apiUrl + this.controllerPath + "DeleteCut/" + cutId);

        var result = await lastValueFrom(delete$) as boolean;
        return result;
    }

    async deleteCutDetails(cutDetailsId: string): Promise<boolean> {
        const delete$ = this.http.delete(keys.apiUrl + this.controllerPath + "DeleteCutDetails/" + cutDetailsId);

        var result = await lastValueFrom(delete$) as boolean;
        return result;
    }

    async deleteInclusion(inclusionId: string): Promise<boolean> {
        const delete$ = this.http.delete(keys.apiUrl + this.controllerPath + "DeleteInclusion/" + inclusionId);

        var result = await lastValueFrom(delete$) as boolean;
        return result;
    }

    async deleteFancyCutDetails(fancyCutDetailsId: string): Promise<boolean> {
        const delete$ = this.http.delete(keys.apiUrl + this.controllerPath + "DeleteFancyCutDetails/" + fancyCutDetailsId);

        var result = await lastValueFrom(delete$) as boolean;
        return result;
    }

    async deleteMeasurement(measurementId: string): Promise<boolean> {
        const delete$ = this.http.delete(keys.apiUrl + this.controllerPath + "DeleteMeasurement/" + measurementId);

        var result = await lastValueFrom(delete$) as boolean;
        return result;
    }
    //#endregion
}
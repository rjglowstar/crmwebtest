import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { GradingMaster } from '../../businessobjects/grading/gradingmaster';
import { InventorySelectAllItems } from '../../businessobjects/inventory/inventoryselectallitem';
import { InventoryItems } from '../../entities';

@Injectable({
    providedIn: 'root'
})

export class GradingService {

    constructor(private http: HttpClient) { }

    public async GetGrading(stoneId: string): Promise<GradingMaster[]> {
        const get$ = this.http.get(keys.apiUrl + "Grading/Get/" + stoneId);

        var result = await lastValueFrom(get$) as GradingMaster[];
        return result;
    }

    public async InsertGrading(inventoryItems: InventoryItems[], RapVer: String): Promise<InventoryItems[]> {
        const post$ = this.http.post(keys.apiUrl + "Grading/InsertGrading/" + RapVer, inventoryItems);

        var result = await lastValueFrom(post$) as InventoryItems[];
        return result;
    }

    public async UpdateGrading(gradingMaster: GradingMaster): Promise<boolean> {
        gradingMaster.updatedBy = keys.loginUserIdent;
        const put$ = this.http.put(keys.apiUrl + "Grading/UpdateGrading", gradingMaster);

        var result = await lastValueFrom(put$) as boolean;
        return result;
    }

    public async getInventoryItemsBySearchStoneId(searchStoneId: string): Promise<InventorySelectAllItems[]> {
        const get$ = this.http.get(keys.apiUrl + "Grading/GetSelectAllBySearchStoneId/" + searchStoneId);

        var result = await lastValueFrom(get$) as InventorySelectAllItems[];
        return result;
    }

    public async getInventoryByStoneId(stoneId: string): Promise<InventoryItems> {
        const get$ = this.http.get(keys.apiUrl + "Grading/GetByStoneId/" + stoneId);

        var result = await lastValueFrom(get$) as InventoryItems;
        return result;
    }

    public async updateInventoryData(inventory: InventoryItems): Promise<boolean> {
        inventory.updatedBy = keys.loginUserIdent;
        const put$ = this.http.put(keys.apiUrl + "Grading/Update", inventory);

        var result = await lastValueFrom(put$) as boolean;
        return result;
    }

}
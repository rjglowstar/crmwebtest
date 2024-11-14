import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { MasterConfig } from 'shared/enitites';
import { InventorySearchCriteria } from '../../businessobjects';
import { InventorySelectAllItems } from '../../businessobjects/inventory/inventoryselectallitem';
import { InventorySummary } from '../../businessobjects/inventory/inventorysummary';
import { Customer, InventoryItems, SupplierDNorm } from '../../entities';
import { ExpoTickets } from '../../entities/inventory/expotickets';
import { Supplier } from '../../entities/supplier/supplier';

@Injectable({
    providedIn: 'root'
})

export class ExpoTicketService {
    api: string = keys.apiUrl + "ExpoTicket/";

    constructor(private http: HttpClient) { }

    public async insertExpoTicket(expoTicket: ExpoTickets): Promise<number> {
        const post$ = this.http.post(this.api + "InsertExpoTicket/", expoTicket);

        var result = await lastValueFrom(post$) as number;
        return result;
    }

    async getAllMasterConfig(): Promise<MasterConfig> {
        let masterConfig = JSON.parse(sessionStorage.getItem("MasterConfig")!) as MasterConfig;
        if (!masterConfig) {
            const get$ = this.http.get(this.api + "Get")
            masterConfig = await lastValueFrom(get$) as MasterConfig;
            if (masterConfig)
                sessionStorage.setItem("MasterConfig", JSON.stringify(masterConfig));

        }
        return masterConfig
    }

    public async getInvSummaryBySearch(inventoryCriteria: InventorySearchCriteria): Promise<InventorySummary> {
        const post$ = this.http.post(this.api + "GetSummary", inventoryCriteria);

        var result = await lastValueFrom(post$) as InventorySummary;
        return result;
    }

    public async getInventoryItemsBySearch(inventoryCriteria: InventorySearchCriteria, skip: number, take: number): Promise<InventoryItems[]> {
        const post$ = this.http.post(this.api + "GetPaginated/" + skip + "/" + take, inventoryCriteria);

        var result = await lastValueFrom(post$) as InventoryItems[];
        return result;
    }

    public async getOrgKapanList(): Promise<string[]> {
        const get$ = this.http.get(this.api + "GetKapan");

        var result = await lastValueFrom(get$) as string[];
        return result;
    }

    public async getOrgIGradeList(): Promise<string[]> {
        const get$ = this.http.get(this.api + "GetIGrade");

        var result = await lastValueFrom(get$) as string[];
        return result;
    }

    public async getOrgMGradeList(): Promise<string[]> {
        const get$ = this.http.get(this.api + "GetMGrade");

        var result = await lastValueFrom(get$) as string[];
        return result;
    }

    public async getInventoryLocationList(): Promise<string[]> {
        const get$ = this.http.get(this.api + "GetInventoryLocations");

        var result = await lastValueFrom(get$) as string[];
        return result;
    }

    public async getAllCustomers(): Promise<Customer[]> {
        const get$ = this.http.get(this.api + "GetAll/");

        var result = await lastValueFrom(get$) as Customer[];
        return result;
    }

    async getSupplierDNorm(): Promise<SupplierDNorm[]> {
        const get$ = this.http.get(this.api + "GetDNorms/");

        var result = await lastValueFrom(get$) as Supplier[];
        return result;
    }

    public async getInvItemsAsync(invIds: string[]): Promise<InventoryItems[]> {
        const post$ = this.http.post(this.api + "GetByStoneIds/", invIds);

        var result = await lastValueFrom(post$) as InventoryItems[];
        return result;
    }

    public async getInventoryItemsForSelectAll(inventoryCriteria: InventorySearchCriteria): Promise<InventorySelectAllItems[]> {
        const post$ = this.http.post(this.api + "GetSelectAllByFilter", inventoryCriteria);

        var result = await lastValueFrom(post$) as InventorySelectAllItems[];
        return result;
    }

    public async copyToClipboardStoneId(inventoryCriteria: InventorySearchCriteria): Promise<string> {
        const post$ = this.http.post(this.api + "CopyToClipboardStoneIds", inventoryCriteria, {
            observe: "body",
            responseType: "text"
        });

        var result = await lastValueFrom(post$) as string;
        return result;
    }

}
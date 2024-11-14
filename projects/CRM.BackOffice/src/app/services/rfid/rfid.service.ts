import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { InventoryExcelItems, InventorySearchCriteria, InventorySearchResponse, InventorySelectAllItems } from '../../businessobjects';
import { InventoryItems } from '../../entities';

@Injectable({
  providedIn: 'root'
})
export class RfidService {
  public controllerName: string = "Rfid";
  constructor(private http: HttpClient) { }

  public async getStoneIdsExistOrNotAsync(ids: string[]): Promise<InventoryItems[]> {
    const post$ = this.http.post(keys.apiUrl + this.controllerName + "/GetStoneIdsExistOrNotAsync/", ids);

    var result = await lastValueFrom(post$) as InventoryItems[];
    return result;
  }

  public async getrfIdsExistOrNotAsync(rfids: string[]): Promise<InventoryItems[]> {
    const post$ = this.http.post(keys.apiUrl + this.controllerName + "/GetRFIdsExistOrNotAsync/", rfids);

    var result = await lastValueFrom(post$) as InventoryItems[];
    return result;
  }

  public async getInventoryItemsBySearch(inventoryCriteria: InventorySearchCriteria, skip: number, take: number): Promise<InventorySearchResponse> {
    const post$ = this.http.post(keys.apiUrl + this.controllerName + "/GetPaginated/" + skip + "/" + take, inventoryCriteria);

    var result = await lastValueFrom(post$) as InventorySearchResponse;
    return result;
  }

  public async updateInventoryData(inventory: InventoryItems): Promise<boolean> {
    inventory.updatedBy = keys.loginUserIdent;
    const put$ = this.http.put(keys.apiUrl + this.controllerName + "/Update", inventory);

    var result = await lastValueFrom(put$) as boolean;
    return result;
  }

  public async getInventoriesWithOutRFID(): Promise<InventoryExcelItems[]> {
    const get$ = this.http.get(keys.apiUrl + this.controllerName + "/GetInventoriesWithOutRFID");

    var result = await lastValueFrom(get$) as InventoryExcelItems[];
    return result;
  }

  public async getInventoryItems(): Promise<InventoryItems[]> {
    const get$ = this.http.get(keys.apiUrl + this.controllerName + "/GetAll/");

    var result = await lastValueFrom(get$) as InventoryItems[];
    return result;
  }

  public async updateInventoryListData(inventoryItems: InventoryItems[]): Promise<boolean> {
    inventoryItems.forEach(z => { z.updatedBy = keys.loginUserIdent; });
    const put$ = this.http.put(keys.apiUrl + this.controllerName + "/UpdateInventoryList", inventoryItems);

    var result = await lastValueFrom(put$) as boolean;
    return result;
  }

  public async getInventoryItemsForSelectAll(inventoryCriteria: InventorySearchCriteria): Promise<InventorySelectAllItems[]> {
    const post$ = this.http.post(keys.apiUrl + this.controllerName + "/GetSelectAllByFilter", inventoryCriteria);

    var result = await lastValueFrom(post$) as InventorySelectAllItems[];
    return result;
  }

  public async removeRFIDFromInventory(ids: Array<string>): Promise<boolean> {
    const post$ = this.http.post(keys.apiUrl + this.controllerName + "/RemoveInventoryRFID", ids)

    var result = await lastValueFrom(post$) as boolean;
    return result;
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { InventorySearchCriteria, InventorySearchResponse, InventorySelectAllItems, InventorySummary, UpdateNCInventory } from '../../businessobjects';
import { MediaStatus } from '../../businessobjects/common/mediastatus';
import { InventoryItems } from '../../entities';
import { RapPrice } from 'shared/enitites';
import { InvUpdateRapResponse } from '../../businessobjects/inventory/invupdaterapresponse';

@Injectable({
  providedIn: 'root'
})

export class InventoryService {

  constructor(private http: HttpClient) { }

  public async insertInventories(invItems: InventoryItems[]): Promise<boolean> {
    const post$ = this.http.post(keys.apiUrl + "Inventory/InsertInvs", invItems);

    var result = await lastValueFrom(post$) as boolean;
    return result;
  }

  public async getStockById(id: string): Promise<InventoryItems> {
    const get$ = this.http.get(keys.apiUrl + "Inventory/Get/" + id);

    var result = await lastValueFrom(get$) as InventoryItems;
    return result;
  }

  public async getStockByIdentId(identId: string): Promise<InventoryItems[]> {
    const get$ = this.http.get(keys.apiUrl + "Inventory/GetByIdent/" + identId);

    var result = await lastValueFrom(get$) as InventoryItems[];
    return result;
  }

  public async getCertificateIdsByStoneIds(): Promise<InventoryItems[]> {
    const get$ = this.http.get(keys.apiUrl + "Inventory/GetCertificateIdsByStoneIds");

    var result = await lastValueFrom(get$) as InventoryItems[];

    return result
  }

  public async getStockForStoneMedia(inventorysearchcriteria: InventorySearchCriteria, skip: number, take: number): Promise<InventorySearchResponse> {
    const post$ = this.http.post(keys.apiUrl + "Inventory/GetPaginatedForStoneMedia/" + skip + "/" + take, inventorysearchcriteria);

    var result = await lastValueFrom(post$) as InventorySearchResponse;
    return result;
  }

  public async getAllStock(): Promise<InventoryItems[]> {
    const get$ = this.http.get(keys.apiUrl + "Inventory/GetAll/");

    var result = await lastValueFrom(get$) as InventoryItems[];
    return result;
  }

  public async updateStock(inventoryItems: InventoryItems[]): Promise<InventoryItems[]> {
    const put$ = this.http.put(keys.apiUrl + "Inventory/UpdateStock", inventoryItems);

    var result = await lastValueFrom(put$) as InventoryItems[];
    return result;
  }

  public async getOrgKapanList(): Promise<string[]> {
    const get$ = this.http.get(keys.apiUrl + "Inventory/GetKapan/");

    var result = await lastValueFrom(get$) as string[];
    return result;
  }

  public async getHtmlVideoExist(stoneId:string[]):Promise<boolean> {
    const post$ = this.http.post(keys.apiUrl + "Inventory/checkHtmlVideoExist",stoneId)

    var result = await lastValueFrom(post$) as boolean;
    return result;
  }

  public async updateInventoryListData(inventoryItems: InventoryItems[]): Promise<boolean> {
    inventoryItems.forEach(z => { z.updatedBy = keys.loginUserIdent; });
    const put$ = this.http.put(keys.apiUrl + "Inventory/UpdateInventoryList", inventoryItems);

    var result = await lastValueFrom(put$) as boolean;
    return result;
  }

  public async getInventoryByStoneIds(stoneIds: string[]): Promise<InventoryItems[]> {
    const post$ = this.http.post(keys.apiUrl + "Inventory/GetByStoneIds", stoneIds);

    var result = await lastValueFrom(post$) as InventoryItems[]
    return result;
  }

  public async getInventoryByStoneIdsToGenLink(): Promise<InventoryItems[]> {
    const post$ = this.http.get(keys.apiUrl + "Inventory/GetByStoneIdsToGenLink");

    var result = await lastValueFrom(post$) as InventoryItems[];
    return result;
  }

  public async getInventoryByStoneIdsWithLowercase(stoneIds: string[]): Promise<InventoryItems[]> {
    const post$ = this.http.post(keys.apiUrl + "Inventory/GetByStoneIdsLowercase", stoneIds);

    var result = await lastValueFrom(post$) as InventoryItems[];
    return result;
  }

  public async getInLabInventoryByStoneId(stoneIds: string[]): Promise<string[]> {
    const post$ = this.http.post(keys.apiUrl + "Inventory/GetInLabInventoryByStoneId", stoneIds);

    var result = await lastValueFrom(post$) as string[];
    return result;
  }

  public async updateInventoryHoldData(inventories: InventoryItems[]): Promise<InventoryItems[]> {
    inventories.forEach(z => { z.updatedBy = keys.loginUserIdent; });
    const put$ = this.http.put(keys.apiUrl + "Inventory/UpdateInventoryHold", inventories);

    var result = await lastValueFrom(put$) as InventoryItems[];
    return result;
  }

  public async getInvSummary(criteria: InventorySearchCriteria): Promise<InventorySummary> {
    const post$ = this.http.post(keys.apiUrl + "Inventory/GetInvSummary", criteria);

    var result = await lastValueFrom(post$) as InventorySummary;
    return result;
  }

  public async getPaginatedInvItem(criteria: InventorySearchCriteria, skip: number, take: number): Promise<InventoryItems[]> {
    const post$ = this.http.post(keys.apiUrl + "Inventory/GetPaginatedInvItems/" + skip + "/" + take, criteria);

    var result = await lastValueFrom(post$) as InventoryItems[];
    return result;
  }

  public async getInventoryItemsBySearch(inventoryCriteria: InventorySearchCriteria, skip: number, take: number): Promise<InventorySearchResponse> {
    const post$ = this.http.post(keys.apiUrl + "Inventory/GetPaginated/" + skip + "/" + take, inventoryCriteria);

    var result = await lastValueFrom(post$) as InventorySearchResponse;
    return result;
  }

  public async getAvailableInvIds(stoneIds: string[]): Promise<string[]> {
    const post$ = this.http.post(keys.apiUrl + "Inventory/GetAvailableInvIds", stoneIds);

    var result = await lastValueFrom(post$) as string[];
    return result;
  }

  public async getIsMemoStone(stoneIds: string[]): Promise<string[]> {
    const post$ = this.http.post(keys.apiUrl + "Inventory/GetMemoStone", stoneIds);

    var result = await lastValueFrom(post$) as string[];
    return result;
  }

  public async getInventoryItemsForSelectAll(inventoryCriteria: InventorySearchCriteria): Promise<InventorySelectAllItems[]> {
    const post$ = this.http.post(keys.apiUrl + "Inventory/GetSelectAllByFilter", inventoryCriteria);

    var result = await lastValueFrom(post$) as InventorySelectAllItems[];
    return result;
  }

  public async copyToClipboardStoneId(inventoryCriteria: InventorySearchCriteria): Promise<string> {
    const post$ = this.http.post(keys.apiUrl + "Inventory/CopyToClipboardStoneIds", inventoryCriteria, {
      observe: "body",
      responseType: "text"
    });

    var result = await lastValueFrom(post$) as string;
    return result;
  }

  public async updateMediaStatus(mediaStatus: MediaStatus[]): Promise<boolean> {
    const post$ = this.http.post(keys.apiUrl + "Inventory/UpdateMediaStatus", mediaStatus);

    var result = await lastValueFrom(post$) as boolean;
    return result;
  }

  public async getInventoryItemsBySearchForExcel(inventoryCriteria: InventorySearchCriteria): Promise<InventoryItems[]> {
    const post$ = this.http.post(keys.apiUrl + "Inventory/GetFilter", inventoryCriteria);

    var result = await lastValueFrom(post$) as InventoryItems[];
    return result;
  }

  public async updateInventoryLabToNC(data: UpdateNCInventory): Promise<InventoryItems[]> {
    const put$ = this.http.put(keys.apiUrl + "Inventory/UpdateInventoryLabToNC", data);

    var result = await lastValueFrom(put$) as InventoryItems[];
    return result;
  }

  public async updateBulkInventoryItemsForCreditNote(stoneIds: string[]): Promise<boolean> {
    const put$ = this.http.put(keys.apiUrl + "Inventory/UpdateForCreditNote", stoneIds);

    var result = await lastValueFrom(put$) as boolean;
    return result;
  }

  public async deleteInventoryData(id: string): Promise<number> {
    const delete$ = this.http.delete(keys.apiUrl + "Inventory/Delete/" + id);

    var result = await lastValueFrom(delete$) as number;
    return result;
  }

  public async deleteInventoriesData(stoneIds: string[]): Promise<number> {
    const post$ = this.http.post(keys.apiUrl + "Inventory/DeleteMany", stoneIds);

    var result = await lastValueFrom(post$) as number;
    return result;
  }

  public async updateInventoryData(inventory: InventoryItems): Promise<boolean> {
    inventory.updatedBy = keys.loginUserIdent;
    const put$ = this.http.put(keys.apiUrl + "Inventory/Update", inventory);

    var result = await lastValueFrom(put$) as boolean;
    return result;
  }

  public async getOrgIGradeList(orgId: string): Promise<string[]> {
    const get$ = this.http.get(keys.apiUrl + "Inventory/GetIGrade/" + orgId);

    var result = await lastValueFrom(get$) as string[];
    return result;
  }

  public async getOrgMGradeList(orgId: string): Promise<string[]> {
    const get$ = this.http.get(keys.apiUrl + "Inventory/GetMGrade/" + orgId);

    var result = await lastValueFrom(get$) as string[];
    return result;
  }

  public async getInventoryResponse(inventoryCriteria: InventorySearchCriteria, skip: number, take: number): Promise<InventorySearchResponse> {
    const post$ = this.http.post(keys.apiUrl + "Inventory/GetInventoryResponse/" + skip + "/" + take, inventoryCriteria);

    var result = await lastValueFrom(post$) as InventorySearchResponse;
    return result;
  }

  public async downloadBarcodeExcel(inventoryItems: string[]): Promise<any> {
    const url = keys.apiUrl + "Inventory/ExportExcelBarcode";
    const post$ = this.http.post(url, inventoryItems, { responseType: 'blob' });

    var result = await lastValueFrom(post$) as any;
    return result;
  }

  public async getHeldByList(): Promise<string[]> {
    const get$ = this.http.get(keys.apiUrl + "Inventory/GetHeldBy");

    var result = await lastValueFrom(get$) as string[];
    return result;
  }

  public async getInventoryLocationList(): Promise<string[]> {
    const get$ = this.http.get(keys.apiUrl + "Inventory/GetInventoryLocations");

    var result = await lastValueFrom(get$) as string[];
    return result;
  }

  public async removeRFIDByStoneIds(stoneIds: string[]): Promise<boolean> {
    const post$ = this.http.post(keys.apiUrl + "Inventory/RemoveRFIDFromInventory", stoneIds);

    var result = await lastValueFrom(post$) as boolean;
    return result;
  }

  public async updateInventoriesToStockStatus(stoneIds: Array<string>, status: string): Promise<boolean> {
    const post$ = this.http.post(keys.apiUrl + "Inventory/UpdateInventoriesToStockStatus/" + status, stoneIds);

    var result = await lastValueFrom(post$) as boolean;
    return result;
  }

  public async exportExcel(criteria: InventorySearchCriteria, type: string): Promise<any> {
    const post$ = this.http.post(keys.apiUrl + "Inventory/ExportExcel/" + type, criteria, { responseType: 'blob' });

    var result = await lastValueFrom(post$) as any;
    return result;
  }

  public async updateRap(rapPrices: RapPrice[]): Promise<InvUpdateRapResponse> {
    const post$ = this.http.post(keys.apiUrl + "Inventory/UpdateRap", rapPrices);

    var result = await lastValueFrom(post$) as InvUpdateRapResponse;
    return result;
  }

}
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { CommonResponse, IncMeasureGradeLookup } from 'shared/businessobjects';
import { ExportToExcelMailData, HoldStoneData, InvHoldOrRapnetHoldItems, InventorySearchCriteria, InventorySearchResponse, InventorySelectAllItems, InventorySummary } from '../../businessobjects';
import { FancyCutItem } from '../../businessobjects/commute/fancycutitem';
import { UpdateBaseDisc } from '../../businessobjects/commute/updatebasedis';
import { InvItem, InventoryItems } from '../../entities';
import { CustInventoryCriteria } from '../../entities/inventory/custinventorycriteria';

@Injectable({
  providedIn: 'root'
})

export class InventoryService {
  private getOrgKapanListData: string[] | null = null;
  private getOrgIGradeListData: string[] | null = null;
  private getOrgMGradeListData: string[] | null = null;
  private getInventoryLocationListData: string[] | null = null;

  constructor(private http: HttpClient) { }

  public async getInventoryItemsBySearch(inventoryCriteria: InventorySearchCriteria, skip: number, take: number): Promise<InventoryItems[]> {
    const post$ = this.http.post(keys.apiUrl + "Inventory/GetPaginated/" + skip + "/" + take, inventoryCriteria);

    var result = await lastValueFrom(post$) as InventoryItems[];
    return result;
  }

  public async getInvSummaryBySearch(inventoryCriteria: InventorySearchCriteria): Promise<InventorySummary> {
    const post$ = this.http.post(keys.apiUrl + "Inventory/GetSummary", inventoryCriteria);

    var result = await lastValueFrom(post$) as InventorySummary;
    return result;
  }

  public async getInventoryResponse(inventoryCriteria: InventorySearchCriteria, skip: number, take: number): Promise<InventorySearchResponse> {
    const post$ = this.http.post(keys.apiUrl + "Inventory/GetInventoryResponse/" + skip + "/" + take, inventoryCriteria);

    var result = await lastValueFrom(post$) as InventorySearchResponse;
    return result;
  }

  public async getHtmlVideoExist(stoneId:string):Promise<boolean> {
    const get$ = this.http.get(keys.apiUrl + "Inventory/CheckHtmlVideoExist/"  + stoneId)

    var result = await lastValueFrom(get$) as boolean;
    return result;
  }

  public async getOrgKapanList(): Promise<string[]> {

    if (this.getOrgKapanListData)
      return this.getOrgKapanListData;

    try {
      const get$ = this.http.get<string[]>(keys.apiUrl + 'Inventory/GetKapan');
      const response = await lastValueFrom(get$) as string[];
      this.getOrgKapanListData = response;
      return response;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public async getOrgIGradeList(): Promise<string[]> {

    if (this.getOrgIGradeListData)
      return this.getOrgIGradeListData;

    try {
      const get$ = this.http.get(keys.apiUrl + "Inventory/GetIGrade");
      const response = await lastValueFrom(get$) as string[];
      this.getOrgIGradeListData = response;
      return response;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public async getOrgMGradeList(): Promise<string[]> {

    if (this.getOrgMGradeListData)
      return this.getOrgMGradeListData;

    try {
      const get$ = this.http.get(keys.apiUrl + "Inventory/GetMGrade");
      const response = await lastValueFrom(get$) as string[];
      this.getOrgMGradeListData = response;
      return response;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public async getInventoryByStoneIds(stoneIds: string[]): Promise<InventoryItems[]> {
    const post$ = this.http.post(keys.apiUrl + "Inventory/GetByStoneIds", stoneIds);

    var result = await lastValueFrom(post$) as InventoryItems[];
    return result;
  }

  public async getInventoryByInvIds(invIds: string[]): Promise<InventoryItems[]> {
    const post$ = this.http.post(keys.apiUrl + "Inventory/GetByInvIds", invIds);

    var result = await lastValueFrom(post$) as InventoryItems[];
    return result;
  }

  public async getInventoryItemsBySearchForExcel(inventoryCriteria: InventorySearchCriteria): Promise<InventoryItems[]> {
    const post$ = this.http.post(keys.apiUrl + "Inventory/GetFilter", inventoryCriteria);

    var result = await lastValueFrom(post$) as InventoryItems[];
    return result;
  }

  public async getInventoryItemsForSelectAll(inventoryCriteria: InventorySearchCriteria): Promise<InventorySelectAllItems[]> {
    const post$ = this.http.post(keys.apiUrl + "Inventory/GetSelectAllByFilter", inventoryCriteria);

    var result = await lastValueFrom(post$) as InventorySelectAllItems[];
    return result;
  }

  public async getCheckHoldStones(stoneIds: string[]): Promise<HoldStoneData[]> {
    const post$ = this.http.post(keys.apiUrl + "Inventory/CheckHoldStones", stoneIds);

    var result = await lastValueFrom(post$) as HoldStoneData[];
    return result;
  }

  public async getHoldStoneForPriceRequest(stoneIds: string[]): Promise<string[]> {
    const post$ = this.http.post(keys.apiUrl + "Inventory/CheckHoldStonesForPriceRequest", stoneIds);

    var result = await lastValueFrom(post$) as string[];
    return result;
  }

  public async ExportToExcelMail(data: ExportToExcelMailData): Promise<CommonResponse> {
    const post$ = this.http.post(keys.apiUrl + "Inventory/ExportToExcelMail", data);

    var result = await lastValueFrom(post$) as CommonResponse;
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

  public async updateInventoryHoldData(inventories: InvHoldOrRapnetHoldItems): Promise<boolean> {
    inventories.updatedBy = keys.loginUserIdent;
    const put$ = this.http.put(keys.apiUrl + "Inventory/UpdateInventoryHold", inventories);

    var result = await lastValueFrom(put$) as boolean;
    return result;
  }

  public async updateInventoryGrading(data: IncMeasureGradeLookup[]): Promise<string[]> {
    data.forEach(z => { z.updatedBy = keys.loginUserIdent });;
    const put$ = this.http.put(keys.apiUrl + "Inventory/UpdateInventoryGrading", data);

    var result = await lastValueFrom(put$) as string[];
    return result;
  }

  public async deleteInventoryData(id: string): Promise<number> {
    const delete$ = this.http.delete(keys.apiUrl + "Inventory/Delete/" + id);

    var result = await lastValueFrom(delete$) as number;
    return result;
  }

  public async getInventoryDNormsByStones(stoneIds: string[], isHold: boolean): Promise<InvItem[]> {
    const post$ = this.http.post(keys.apiUrl + "Inventory/GetInvItemsByStones/" + isHold, stoneIds);

    var result = await lastValueFrom(post$) as InvItem[];
    return result;
  }

  public async getInventoryDNormsByCertificateIds(certificateIds: string[], isHold: boolean): Promise<InvItem[]> {
    const post$ = this.http.post(keys.apiUrl + "Inventory/GetInvItemsByCertificateIds/" + isHold, certificateIds);

    var result = await lastValueFrom(post$) as InvItem[];
    return result;
  }

  public async getInventoryDNormsByStonesAndCertificateIds(ids: string[], isHold: boolean): Promise<InvItem[]> {
    const post$ = this.http.post(keys.apiUrl + "Inventory/GetInvItemsByStonesAndCertificateIds/" + isHold, ids);

    var result = await lastValueFrom(post$) as InvItem[];
    return result;
  }

  public async updateOnlyInventoryList(inventoryItems: InventoryItems[]): Promise<boolean> {
    inventoryItems.forEach(z => { z.updatedBy = keys.loginUserIdent; });
    const put$ = this.http.put(keys.apiUrl + "Inventory/UpdateOnlyInventoryList", inventoryItems);

    var result = await lastValueFrom(put$) as boolean;
    return result;
  }

  public async updateInventoryCutList(data: FancyCutItem[]): Promise<boolean> {
    const put$ = this.http.put(keys.apiUrl + "Inventory/UpdateStoneCut", data);

    var result = await lastValueFrom(put$) as boolean;
    return result;
  }

  public async updateInventoryHoldUnHoldById(inventoryIds: string[], isHold: boolean, isRapnetHold: boolean = false): Promise<number> {
    const put$ = this.http.put(keys.apiUrl + "Inventory/UpdateInventoryHoldUnHoldById/" + isHold + "/" + isRapnetHold + "/" + keys.loginUserIdent, inventoryIds);

    var result = await lastValueFrom(put$) as number;
    return result;
  }

  public async updateInventoryRapNetHoldById(inventoryIds: string[]): Promise<number> {
    const post$ = this.http.post(keys.apiUrl + "Inventory/UpdateInventoryRapnetHoldById", inventoryIds);

    var result = await lastValueFrom(post$) as number;
    return result;
  }

  public async updateInventoryStatusById(inventoryIds: string[], status: string): Promise<boolean> {
    const post$ = this.http.post(keys.apiUrl + "Inventory/UpdateInventoryStatus/" + status, inventoryIds);

    var result = await lastValueFrom(post$) as boolean;
    return result;
  }

  public async updateInventoryPricingFlag(stoneIds: string[]): Promise<boolean> {
    const put$ = this.http.put(keys.apiUrl + "Inventory/UpdateInventoryPricingFlag", stoneIds);

    var result = await lastValueFrom(put$) as boolean;
    return result;
  }

  public async updateExpoFlag(invIds: string[], expoName: string): Promise<boolean> {
    const put$ = this.http.put(keys.apiUrl + "Inventory/UpdateExpoFlag/" + expoName, invIds);

    var result = await lastValueFrom(put$) as boolean;
    return result;
  }

  public async updateInventoryHoldBy(inventoryIds: string[], sellerName: string): Promise<boolean> {
    const put$ = this.http.put(keys.apiUrl + "Inventory/UpdateInventoryHoldBy/" + sellerName, inventoryIds);

    var result = await lastValueFrom(put$) as boolean;
    return result;
  }

  public async updateInventoryBaseDisc(updateBaseDisc: UpdateBaseDisc): Promise<boolean> {
    const put$ = this.http.put(keys.apiUrl + "Inventory/UpdateBaseDisc", updateBaseDisc);

    var result = await lastValueFrom(put$) as boolean;
    return result;
  }

  public async downloadBarcodeExcel(inventoryItems: string[]): Promise<any> {
    const url = keys.apiUrl + "Inventory/ExportExcelBarcode";
    const post$ = this.http.post(url, inventoryItems, { responseType: 'blob' });

    var result = await lastValueFrom(post$) as any;
    return result;
  }

  public async exportExcel(criteria: InventorySearchCriteria, type: string, aDiscount: number): Promise<any> {
    if (aDiscount == undefined || aDiscount == null)
      aDiscount = 0;

    const post$ = this.http.post(keys.apiUrl + "Inventory/ExportExcel/" + type + '/' + aDiscount, criteria, { responseType: 'blob' });

    var result = await lastValueFrom(post$) as any;
    return result;
  }

  public async getInventoryLocationList(): Promise<string[]> {

    if (this.getInventoryLocationListData)
      return this.getInventoryLocationListData;

    try {
      const get$ = this.http.get(keys.apiUrl + "Inventory/GetInventoryLocations");
      const response = await lastValueFrom(get$) as string[];
      this.getInventoryLocationListData = response;
      return response;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public async InsertCustInventoryCriteria(custInventoryCriteria: CustInventoryCriteria): Promise<string> {
    const post$ = this.http.post(keys.apiUrl + "CustInventoryCriteria/Insert", custInventoryCriteria, {
      observe: "body",
      responseType: "text"
    });

    var result = await lastValueFrom(post$) as string;
    return result;
  }

  public async addExpoInvRemark(ids: string[], expoRemark: string): Promise<boolean> {
    const post$ = this.http.post(keys.apiUrl + "Inventory/UpdateExpoInvRemark/" + expoRemark, ids);

    var result = await lastValueFrom(post$) as boolean;
    return result;
  }

}
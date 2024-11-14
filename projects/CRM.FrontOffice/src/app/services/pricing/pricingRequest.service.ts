import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { InventorySummary, PriceAnalyticsRequest, PriceAnalyticsSalesResponse, PriceReqResponse, PriceRequestApiModel, TempPriceData, UpdateTempPricingRequest } from '../../businessobjects';
import { InventoryItems, PricingHistory, PricingRequest, TempPricing } from '../../entities';

@Injectable({
  providedIn: 'root'
})
export class PricingRequestService {
  private getPriceRequestKapanListData: string[] | null = null;
  private controllerUrl = 'PriceRequest/';

  constructor(private http: HttpClient) { }

  public async insertTempPricing(data: TempPricing[], canUpdateColor: boolean = false): Promise<boolean> {
    const post$ = this.http.post(keys.apiUrl + this.controllerUrl + "InsertTempPricing/" + canUpdateColor, data);

    var result = await lastValueFrom(post$) as boolean;
    return result;
  }

  public async insertOneTempPricing(data: TempPricing): Promise<string> {
    const post$ = this.http.post(keys.apiUrl + this.controllerUrl + "InsertSingleTempPricing", data, {
      observe: "body",
      responseType: "text"
    });

    var result = await lastValueFrom(post$) as string;
    return result;
  }

  public async removeTempPricing(data: TempPricing[]): Promise<number> {
    const put$ = this.http.put(keys.apiUrl + this.controllerUrl + "RemoveTempPricing", data);

    var result = await lastValueFrom(put$) as number;
    return result;
  }

  public async insertInventoryItem(data: InventoryItems[]): Promise<boolean> {
    const post$ = this.http.post(keys.apiUrl + this.controllerUrl + "InsertInventory", data);

    var result = await lastValueFrom(post$) as boolean;
    return result;
  }

  public async insertPricingRequest(data: PricingRequest[], requestedBy: string): Promise<boolean> {
    const post$ = this.http.post(keys.apiUrl + this.controllerUrl + "InsertPricingRequest/" + requestedBy, data);

    var result = await lastValueFrom(post$) as boolean;
    return result;
  }

  public async removePricingRequest(data: PricingRequest[]): Promise<number> {
    const put$ = this.http.put(keys.apiUrl + this.controllerUrl + "RemovePricingRequest", data);

    var result = await lastValueFrom(put$) as number;
    return result;
  }

  public async getPricingRequest(req: PriceRequestApiModel): Promise<PriceReqResponse> {
    const post$ = this.http.post(keys.apiUrl + this.controllerUrl + "Get", req);

    var result = await lastValueFrom(post$) as PriceReqResponse;
    return result;
  }

  public async getPricingInvRequest(req: PriceRequestApiModel): Promise<PriceReqResponse> {
    const post$ = this.http.post(keys.apiUrl + this.controllerUrl + "GetInvPricing", req);
    var result = await lastValueFrom(post$) as PriceReqResponse;
    return result;
  }

  public async getPricingInvByCriteriaRange(req: PriceRequestApiModel): Promise<PriceReqResponse> {
    const post$ = this.http.post(keys.apiUrl + this.controllerUrl + "GetInvPricingStonesIds", req);

    var result = await lastValueFrom(post$) as PriceReqResponse;
    return result;
  }

  public async getSummary(req: PriceRequestApiModel): Promise<InventorySummary> {
    const post$ = this.http.post(keys.apiUrl + this.controllerUrl + "GetSummary", req);

    var result = await lastValueFrom(post$) as InventorySummary;
    return result;
  }

  public async getPricingHistory(stoneId: string): Promise<PricingHistory[]> {
    const get$ = this.http.get(keys.apiUrl + this.controllerUrl + "GetPricingHsitory/" + stoneId);

    var result = await lastValueFrom(get$) as PricingHistory[];
    return result;
  }

  public async getPricingHistoryBulk(stoneIds: string[]): Promise<PricingHistory[]> {
    const post$ = this.http.post(keys.apiUrl + this.controllerUrl + "GetPricingHsitoryBulk", stoneIds);

    var result = await lastValueFrom(post$) as PricingHistory[];
    return result;
  }

  public async getPriceAnalytics(data: PriceAnalyticsRequest): Promise<InventoryItems[]> {
    const post$ = this.http.post(keys.apiUrl + this.controllerUrl + "GetInventoryForPriceAnalytics", data);

    var result = await lastValueFrom(post$) as InventoryItems[];
    return result;
  }

  public async getPriceAnalyticsSalesData(data: string[]): Promise<PriceAnalyticsSalesResponse[]> {
    const post$ = this.http.post(keys.apiUrl + this.controllerUrl + "GetPriceAnalyticsSalesData", data);

    var result = await lastValueFrom(post$) as PriceAnalyticsSalesResponse[];
    return result;
  }

  public async getInventoryByStoneId(stoneId: string): Promise<InventoryItems> {
    const get$ = this.http.get(keys.apiUrl + this.controllerUrl + "GetByStoneId/" + stoneId);

    var result = await lastValueFrom(get$) as InventoryItems;
    return result;
  }

  public async getInventoryByStoneIds(stoneIds: string[]): Promise<InventoryItems[]> {
    const post$ = this.http.post(keys.apiUrl + this.controllerUrl + "GetByStoneIds", stoneIds);

    var result = await lastValueFrom(post$) as InventoryItems[];
    return result;
  }

  public async getPricingRequestStoneIds(stoneIds: string[]): Promise<string[]> {
    const put$ = this.http.put(keys.apiUrl + this.controllerUrl + "GetPricingRequestStoneIds", stoneIds);

    var result = await lastValueFrom(put$) as string[];
    return result;
  }

  public async updatePricingOnReleaseStones(data: InventoryItems[], action: string): Promise<boolean> {
    const put$ = this.http.put(keys.apiUrl + this.controllerUrl + "UpdatePricingOnReleaseStone/" + action, data);

    var result = await lastValueFrom(put$) as boolean;
    return result;
  }

  public async updatePricingRequest(data: UpdateTempPricingRequest[]): Promise<boolean> {
    const put$ = this.http.put(keys.apiUrl + this.controllerUrl + "UpdatePricingRequest", data);

    var result = await lastValueFrom(put$) as boolean;
    return result;
  }

  public async updateOnePricingRequest(data: UpdateTempPricingRequest): Promise<boolean> {
    const put$ = this.http.put(keys.apiUrl + this.controllerUrl + "UpdateSinglePricingRequest", data);

    var result = await lastValueFrom(put$) as boolean;
    return result;
  }

  public async getPriceRequestKapanList(): Promise<string[]> {

    if (this.getPriceRequestKapanListData)
      return this.getPriceRequestKapanListData;

    try {
      const get$ = this.http.get(keys.apiUrl + this.controllerUrl + "GetPricingRequestKapan");
      const response = await lastValueFrom(get$) as string[];
      this.getPriceRequestKapanListData = response;
      return response;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public async getTempDatasByStoneId(stoneIds: string[]): Promise<TempPriceData[]> {
    const post$ = this.http.post(keys.apiUrl + this.controllerUrl + "GetTempPricingInv", stoneIds);

    var result = await lastValueFrom(post$) as TempPriceData[];
    return result;
  }

  public async syncInvSpecialStones(): Promise<boolean> {
    const put$ = this.http.put(keys.apiUrl + this.controllerUrl + "SyncInvSpecialStones", {});

    var result = await lastValueFrom(put$) as boolean;
    return result;
  }

  public async syncPricingReqSpecialStones(): Promise<boolean> {
    const put$ = this.http.put(keys.apiUrl + this.controllerUrl + "SyncPricingReqSpecialStones", {});

    var result = await lastValueFrom(put$) as boolean;
    return result;
  }
}

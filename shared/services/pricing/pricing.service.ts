import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { lastValueFrom } from 'rxjs';
import { MfgPricingRequest, PricingDiscountApiResponse, PricingMarketSheetRequest, PricingMarketSheetResponse } from 'shared/businessobjects';

@Injectable({
  providedIn: 'root'
})

export class PricingService {
  private url: string = environment.apiPricingUrl;

  constructor(private http: HttpClient) { }

  public async getBasePrice(data: MfgPricingRequest[]): Promise<PricingDiscountApiResponse[]> {
    var reqHeader = new HttpHeaders({ "Content-Type": "application/json", "Cache-Control": "no-cache" });
    let jsonData = JSON.stringify(data);
    const post$ = this.http.post(this.url + 'Back/GetKapanDisc', jsonData, { headers: reqHeader });

    var result = await lastValueFrom(post$) as PricingDiscountApiResponse[];
    return result;
  }

  public async getMarketSheetPrice(data: PricingMarketSheetRequest[]): Promise<PricingMarketSheetResponse[]> {
    var reqHeader = new HttpHeaders({ "Content-Type": "application/json", "Cache-Control": "no-cache" });
    let jsonData = JSON.stringify(data);
    const post$ = this.http.post(this.url + 'Back/Glow/GetSalesBestDisc/true', jsonData, { headers: reqHeader });

    var result = await lastValueFrom(post$) as PricingMarketSheetResponse[];
    return result;
  }

  public async getPurchaseDisc(data: PricingMarketSheetRequest[]): Promise<PricingMarketSheetResponse[]> {
    var reqHeader = new HttpHeaders({ "Content-Type": "application/json", "Cache-Control": "no-cache" });
    let jsonData = JSON.stringify(data);
    const post$ = this.http.post(this.url + 'Back/Glow/GetPurchaseDisc', jsonData, { headers: reqHeader });

    var result = await lastValueFrom(post$) as PricingMarketSheetResponse[];
    return result;
  }
}
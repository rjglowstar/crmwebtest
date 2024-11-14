import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { AppointmentItem, DayWiseSummary, Lead, SellPurchaseDetail } from '../../entities';
import { AiSuggestions } from '../../entities/business/aisuggestion';

@Injectable({
  providedIn: 'root'
})

export class DashboardService {
  private controllerUrl = 'Dashboard/';

  constructor(private http: HttpClient) { }

  public async GetDayWiseSummaryAsync(sellerId: string): Promise<DayWiseSummary> {
    const get$ = this.http.get(keys.apiUrl + this.controllerUrl + "GetDayWiseSummary/" + sellerId);

    var result = await lastValueFrom(get$) as DayWiseSummary;
    return result;
  }

  async getBuyerPurchaseData(buyerCriteria: string, sellerId: string): Promise<SellPurchaseDetail[]> {
    let sellerStr = sellerId ? sellerId : "";
    const get$ = this.http.get(keys.apiUrl + this.controllerUrl + "GetBuyerPurchaseData/" + buyerCriteria + "/" + sellerStr);

    var result = await lastValueFrom(get$) as SellPurchaseDetail[];
    return result;
  }

  async getSellerPurchaseData(sellerCriteria: string, sellerId: string): Promise<SellPurchaseDetail[]> {
    let sellerStr = sellerId ? sellerId : "";
    const get$ = this.http.get(keys.apiUrl + this.controllerUrl + "GetSellerPurchaseData/" + sellerCriteria + "/" + sellerStr);

    var result = await lastValueFrom(get$) as SellPurchaseDetail[];
    return result;
  }

  async getOrderAsync(orderCriteria: string, sellerId: string): Promise<Lead[]> {
    let sellerStr = sellerId ? sellerId : "";
    const get$ = this.http.get(keys.apiUrl + this.controllerUrl + "GetOrderData/" + orderCriteria + "/" + sellerStr);

    var result = await lastValueFrom(get$) as Lead[];
    return result;
  }
  async getHoldData(HoldCriteria: string, sellerId: string): Promise<Lead[]> {
    let sellerStr = sellerId ? sellerId : "";
    const get$ = this.http.get(keys.apiUrl + this.controllerUrl + "GetHoldData/" + HoldCriteria + "/" + sellerStr);

    var result = await lastValueFrom(get$) as Lead[];
    return result;
  }

  async getAdminAppointment(isToday: boolean, sellerId: string): Promise<AppointmentItem[]> {
    let sellerStr = sellerId ? sellerId : "";
    const get$ = this.http.get(keys.apiUrl + "Dashboard/GetAppointments/" + isToday + "/" + sellerStr);

    var result = await lastValueFrom(get$) as AppointmentItem[];
    return result;
  }
  public async getAiSuggestions(sellerId: string): Promise<AiSuggestions[]> {
    const get$ = this.http.get(keys.apiUrl + this.controllerUrl + "GetAISuggestions/" + sellerId);

    var result = await lastValueFrom(get$) as AiSuggestions[];
    return result;
  }
}
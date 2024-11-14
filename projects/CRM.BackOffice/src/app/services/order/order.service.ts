import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth/keys';
import { OrderSearchCriteria, OrderSearchResult } from '../../businessobjects';
import { IdentityDNorm, LedgerDNorm, OrderItem } from '../../entities';

@Injectable({
  providedIn: 'root'
})

export class OrderService {

  constructor(private http: HttpClient) { }

  public async getOrderItemById(id: string): Promise<OrderItem> {
    const get$ = this.http.get(keys.apiUrl + "Order/Get/" + id);

    var result = await lastValueFrom(get$) as OrderItem;
    return result;
  }

  public async getOrderStonesByStoneIds(stoneIds: string[]): Promise<string[]> {
    const post$ = this.http.post(keys.apiUrl + "Order/GetOrderStoneIdsByStoneIds", stoneIds);

    var result = await lastValueFrom(post$) as string[];
    return result;
  }

  public async getOrderItemsByStoneIds(stoneIds: string[]): Promise<OrderItem[]> {
    const post$ = this.http.post(keys.apiUrl + "Order/GetOrderItemsByStoneIds", stoneIds);

    var result = await lastValueFrom(post$) as OrderItem[];
    return result;
  }

  public async checkOrderIsLocked(stoneIds: string[]): Promise<string[]> {
    const post$ = this.http.post(keys.apiUrl + "Order/checkOrderIsLocked", stoneIds);

    var result = await lastValueFrom(post$) as string[];
    return result;
  }

  public async getOrderItemsByCriteria(orderSearchCriteria: OrderSearchCriteria, skip: number, take: number): Promise<OrderSearchResult> {
    const post$ = this.http.post(keys.apiUrl + "Order/GetbyCriteria/" + skip + "/" + take, orderSearchCriteria);

    var result = await lastValueFrom(post$) as OrderSearchResult;
    return result;
  }

  public async getOrderItemsByOnlyCriteria(orderSearchCriteria: OrderSearchCriteria): Promise<OrderSearchResult> {
    const post$ = this.http.post(keys.apiUrl + "Order/GetbyOnlyCriteria", orderSearchCriteria);

    var result = await lastValueFrom(post$) as OrderSearchResult;
    return result;
  }

  public async getOrderItemsByTransactionIds(transactionIds: string[]): Promise<OrderItem[]> {
    const post$ = this.http.post(keys.apiUrl + "Order/GetbyTransactionIds", transactionIds);

    var result = await lastValueFrom(post$) as OrderItem[];
    return result;
  }

  public async checkOrderIsDelivered(transactionId: string): Promise<boolean> {
    const get$ = this.http.get(keys.apiUrl + "Order/CheckIsDelivered/" + transactionId);

    var result = await lastValueFrom(get$) as boolean;
    return result;
  }

  public async checkStoneInMemo(stoneIds: string[]): Promise<string[]> {
    const post$ = this.http.post(keys.apiUrl + "Order/CheckStoneInMemo", stoneIds);

    var result = await lastValueFrom(post$) as string[];
    return result;
  }

  public async orderRequest(orderData: OrderItem): Promise<string> {
    const post$ = this.http.post(keys.apiUrl + "Order/Insert", orderData, {
      observe: "body",
      responseType: "text"
    });

    var result = await lastValueFrom(post$) as string;
    return result;
  }

  public async orderUpdate(orderData: OrderItem): Promise<string> {
    orderData.updatedBy = keys.loginUserIdent;
    const put$ = this.http.put(keys.apiUrl + "Order/Update", orderData, {
      observe: "body",
      responseType: "text"
    });

    var result = await lastValueFrom(put$) as string;
    return result;
  }

  public async deleteOrderItem(orderId: string): Promise<boolean> {
    const delete$ = this.http.delete(keys.apiUrl + "Order/Delete/" + orderId);

    var result = await lastValueFrom(delete$) as boolean;
    return result;
  }

  public async deleteOrderItemByStoneIds(stoneIds: string[]): Promise<boolean> {
    const post$ = this.http.post(keys.apiUrl + "Order/DeleteOrderItemByStoneIds", stoneIds);

    var result = await lastValueFrom(post$) as boolean;
    return result;
  }

  public async updatePartyDetailsOrder(ledgerDnorm: LedgerDNorm) {
    const put$ = this.http.put(keys.apiUrl + "Order/UpdatePartyDetails", ledgerDnorm);

    var result = await lastValueFrom(put$) as boolean;
    return result;
  }

  public async updateBrokerDetailsOrder(ledgerDnorm: LedgerDNorm) {
    const put$ = this.http.put(keys.apiUrl + "Order/UpdateBrokerDetails", ledgerDnorm);

    var result = await lastValueFrom(put$) as boolean;
    return result;
  }

  public async orderMarkedAsDelivered(ids: string[], takenBy: string, deliveryBy: string) {
    const put$ = this.http.put(keys.apiUrl + "Order/OrderMarkedAsDelivered/" + takenBy + "/" + deliveryBy, ids);

    var result = await lastValueFrom(put$) as boolean;
    return result;
  }

  public async updateTrasactionIdOrderItem(stoneIds: Array<string>): Promise<boolean> {
    const post$ = this.http.post(keys.apiUrl + "Order/UpdateTrasactionIdOrderItem", stoneIds);

    var result = await lastValueFrom(post$) as boolean;
    return result;
  }

  public async getGetSellerFromOrderList(): Promise<IdentityDNorm[]> {
    const get$ = this.http.get(keys.apiUrl + "Order/GetSellerFromOrderList");

    var result = await lastValueFrom(get$) as IdentityDNorm[];
    return result;
  }

  public async toggleOrderItemColor(ids: Array<string>, isColor: boolean): Promise<boolean> {
    const put$ = this.http.put(keys.apiUrl + "Order/ToggleOrderItemColor/" + isColor, ids);

    var result = await lastValueFrom(put$) as boolean;
    return result;
  }

}
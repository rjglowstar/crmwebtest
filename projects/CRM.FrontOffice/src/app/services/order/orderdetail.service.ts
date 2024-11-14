import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { OrderDetailFilter, OrderDetailSummary } from '../../businessobjects';
import { OrderDetailResponse } from '../../businessobjects/business/orderdetailresponse';

@Injectable({
  providedIn: 'root'
})

export class OrderDetailService {

  constructor(private http: HttpClient) { }

  public async getOrderDetailSummary(filter: OrderDetailFilter): Promise<OrderDetailSummary> {
    const post$ = this.http.post(keys.apiUrl + "Lead/GetOrderDetailSummary", filter);

    var result = await lastValueFrom(post$) as OrderDetailSummary;
    return result;
  }

  public async getOrderDetails(skip: number, take: number, filter: OrderDetailFilter): Promise<OrderDetailResponse[]> {
    const post$ = this.http.post(keys.apiUrl + "Lead/GetOrderList/GetPaginated/" + skip + "/" + take, filter);

    var result=await lastValueFrom(post$) as OrderDetailResponse[];
    return result;
  }

  public async getOrderDetailsForFilter(filter: OrderDetailFilter): Promise<OrderDetailResponse[]> {
    const post$ = this.http.post(keys.apiUrl + "Lead/GetOrderList/ForFilter", filter);

    var result=await lastValueFrom(post$) as OrderDetailResponse[];
    return result;
  }

}
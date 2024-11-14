import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { OrderRequest } from '../../businessobjects';

@Injectable({
  providedIn: 'root'
})

export class OrderService {

  constructor(private http: HttpClient) { }

  public async orderRequest(backOfficeBaseUrl: string, orderRequest: OrderRequest): Promise<string> {
    const post$ = this.http.post(backOfficeBaseUrl + "Order/InsertOrderFromFO", orderRequest, {
      observe: "body",
      responseType: "text"
    });

    var result = await lastValueFrom(post$) as string;
    return result;
  }

}
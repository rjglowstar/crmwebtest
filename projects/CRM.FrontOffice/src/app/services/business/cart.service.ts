import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { CartItem, LeadCartItem } from '../../businessobjects';
import { CartSearchCriteria } from '../../entities';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private baseUrl: string;

  constructor(private http: HttpClient) {
    this.baseUrl = keys.apiUrl + 'Cart/'
  }

  public async getPaginatedCartItems(skip: number, take: number): Promise<CartItem[]> {
    const get$ = this.http.get(this.baseUrl + "GetPaginatedItems/" + skip + "/" + take);

    var result = await lastValueFrom(get$) as CartItem[];
    return result;
  }

  public async getCartLeadItems(searchCriteria: CartSearchCriteria): Promise<LeadCartItem[]> {
    const post$ = this.http.post(this.baseUrl + "GetLeadItems", searchCriteria);

    var result = await lastValueFrom(post$) as LeadCartItem[];
    return result;
  }

  public async getCartItemsByCriteria(searchCriteria: CartSearchCriteria): Promise<CartItem[]> {
    const post$ = this.http.post(this.baseUrl + "GetItemsByCriteria", searchCriteria);

    var result = await lastValueFrom(post$) as CartItem[];
    return result;
  }


  public async deleteCartItem(cartId: string): Promise<boolean> {
    const delete$ = this.http.delete(this.baseUrl + "Delete/" + cartId);

    var result=await lastValueFrom(delete$) as boolean;
    return result;
  }

}

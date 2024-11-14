import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { CartItem, CartSearchCriteria } from '../../businessobjects';
import { Cart } from '../../entities';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  public apiUrl = keys.apiUrl + "Cart/";

  constructor(private http: HttpClient) { }

  public async getCartItem(id: string): Promise<CartItem> {
    const get$ = this.http.get(this.apiUrl + "Get/" + id);

    var result = await lastValueFrom(get$) as CartItem;
    return result;
  }

  public async getCartItemsForCustomerAsync(customerId: string): Promise<CartItem[]> {
    const get$ = this.http.get(this.apiUrl + "GetItemsForCustomer/" + customerId);

    var result = await lastValueFrom(get$) as CartItem[];
    return result;
  }

  public async getCartItemsByCriteriaAsync(criteria: CartSearchCriteria): Promise<CartItem[]> {
    const post$ = this.http.post(this.apiUrl + "GetItemsByCriteria", criteria);

    var result = await lastValueFrom(post$) as CartItem[];
    return result;
  }

  public async getCheckCartValidInventoryAsync(invIds: Array<string>): Promise<string> {
    const post$ = this.http.post(this.apiUrl + "GetCheckCartValidInventory", invIds, {
      observe: "body",
      responseType: "text"
    });

    var result = await lastValueFrom(post$) as string;
    return result;
  }


  public async insertCartAsync(cart: Cart): Promise<string> {
    const post$ = this.http.post(this.apiUrl + "Insert", cart, {
      observe: "body",
      responseType: "text"
    });

    var result = await lastValueFrom(post$) as string;
    return result;
  }

  public async insertCartsAsync(carts: Cart[]): Promise<string> {
    const post$ = this.http.post(this.apiUrl + "InsertMultiple", carts, {
      observe: "body",
      responseType: "text"
    });

    var result = await lastValueFrom(post$) as string;
    return result;
  }

  public async updateCartAsync(cart: Cart): Promise<string> {
    const put$ = this.http.put(this.apiUrl + "Update", cart, {
      observe: "body",
      responseType: "text"
    });

    var result = await lastValueFrom(put$) as string
    return result;
  }

  public async deleteCartsAsync(cartIds: string[], isLead: boolean = false): Promise<boolean> {
    const post$ = this.http.post(this.apiUrl + "DeleteMany/" + isLead, cartIds);

    var result = await lastValueFrom(post$) as boolean;
    return result;
  }
}
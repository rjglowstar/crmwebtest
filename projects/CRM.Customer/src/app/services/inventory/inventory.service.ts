import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { RapPriceRequest } from 'shared/businessobjects';
import { RapPrice } from 'shared/enitites';
import { InvItem } from '../../businessobjects';

@Injectable({
  providedIn: 'root'
})

export class InventoryService {
  api: string = keys.apiUrl + "Inventory/";

  constructor(private http: HttpClient) { }

  public async getInvItemsAsync(invIds: string[]): Promise<InvItem[]> {
    const post$ = this.http.post(this.api + "GetInvItems/", invIds);

    var result = await lastValueFrom(post$) as InvItem[];
    return result;
  }

  public async updateInventoryHoldUnHoldById(inventoryIds: string[], isHold: boolean, holdBy: string): Promise<number> {
    const put$ = this.http.put(this.api + "UpdateInventoryHoldUnHoldById/" + isHold + "/" + holdBy, inventoryIds);

    var result = await lastValueFrom(put$) as number;
    return result;
  }

  public async getRapPrice(req: RapPriceRequest): Promise<RapPrice> {
    const post$ = this.http.post(this.api + "RapPrice/Get", req);

    var result=await lastValueFrom(post$) as RapPrice;
    return result;
  }
}
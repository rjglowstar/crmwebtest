import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { WatchListResponse, WatchListSearchCriteria } from '../../businessobjects';
import { InventoryItems } from '../../entities';

@Injectable({
  providedIn: 'root'
})
export class WatchListService {
  private controllerUrl = 'WatchList/';

  constructor(private http: HttpClient) { }

  public async getInvItemsByCustomer(id: string): Promise<InventoryItems[]> {
    const get$ = this.http.get(keys.apiUrl + this.controllerUrl + "GetInvItemsByCustomer/" + id);

    var result = await lastValueFrom(get$) as InventoryItems[];
    return result;
  }

  public async deleteWatchListFromInventoryItem(stoneId: string, customerId: string): Promise<boolean> {
    const delete$ = this.http.delete(keys.apiUrl + this.controllerUrl + "DeleteFromInvItem/" + stoneId + "/" + customerId);

    var result = await lastValueFrom(delete$) as boolean;
    return result;
  }

  public async deleteWatchList(ids: string[]): Promise<boolean> {
    const post$ = this.http.post(keys.apiUrl + this.controllerUrl + "Delete", ids);

    var result = await lastValueFrom(post$) as boolean;
    return result;
  }

  public async getAllWatchLists(searchCriteria: WatchListSearchCriteria): Promise<WatchListResponse[]> {
    const post$ = this.http.post(keys.apiUrl + this.controllerUrl + "FilterWatchList", searchCriteria);

    var result=await lastValueFrom(post$) as WatchListResponse[];
    return result;
  }
}

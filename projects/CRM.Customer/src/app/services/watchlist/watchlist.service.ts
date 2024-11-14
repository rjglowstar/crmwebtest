import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { WatchListResponse, WatchListSearchCriteria } from '../../businessobjects';
import { WatchList } from '../../entities';

@Injectable({
  providedIn: 'root'
})
export class WatchlistService {
  public apiUrl = keys.apiUrl + "WatchList/";

  constructor(private http: HttpClient) { }

  public async getAllWatchLists(searchCriteria: WatchListSearchCriteria): Promise<WatchListResponse[]> {
    const post$ = this.http.post(this.apiUrl + "FilterWatchList", searchCriteria);

    var result = await lastValueFrom(post$) as WatchListResponse[];
    return result;
  }

  public async insertWatchList(watchlist: WatchList): Promise<string> {
    const post$ = this.http.post(this.apiUrl + "Insert", watchlist, {
      observe: "body",
      responseType: "text"
    });

    var result = await lastValueFrom(post$) as string;
    return result;
  }

  public async insertWatchListsFromInvIds(ids: string[], customerId: string): Promise<string> {
    const post$ = this.http.post(this.apiUrl + "InsertFromInvItems/" + customerId, ids, {
      observe: "body",
      responseType: "text"
    });

    var result = await lastValueFrom(post$) as string;
    return result;
  }

  public async removeFromWatchList(ids: string[]): Promise<boolean> {
    const post$ = this.http.post(this.apiUrl + "Delete", ids);

    var result=await lastValueFrom(post$) as boolean;
    return result;
  }
}
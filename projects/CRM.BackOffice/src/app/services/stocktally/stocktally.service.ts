import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { StockTallyBoxSearchCritria, StockTallyDate, StockTallyItems } from '../../businessobjects';
import { InventoryItems, StockTally, StockTallyBox, StockTallyHistory } from '../../entities';

@Injectable({
  providedIn: 'root'
})
export class StocktallyService {

  constructor(private http: HttpClient) { }

  public async GetAllStockTallyAsync(): Promise<StockTally[]> {
    const get$ = this.http.get(keys.apiUrl + "StockTally/Get");

    var result = await lastValueFrom(get$) as StockTally[];
    return result;
  }

  public async getInventoryItemsByRFids(rfids: string[]): Promise<InventoryItems[]> {
    const post$ = this.http.post(keys.apiUrl + "StockTally/GetInventoriesByRFID/", rfids);

    var result = await lastValueFrom(post$) as InventoryItems[];
    return result;
  }

  public async getStockTallyItemsByRFIDs(rfids: string[]): Promise<StockTallyItems[]> {
    const post$ = this.http.post(keys.apiUrl + "StockTally/GetStockTallyItemsByRFID/", rfids);

    var result = await lastValueFrom(post$) as StockTallyItems[];
    return result;
  }

  public async GetAllStockTallyItems(): Promise<StockTallyItems[]> {
    const get$ = this.http.get(keys.apiUrl + "StockTally/GetAllStockTallyItems");

    var result = await lastValueFrom(get$) as StockTallyItems[];
    return result;
  }


  public async getExistDateHistoryStockTally(): Promise<Array<StockTallyDate>> {
    const get$ = this.http.get(keys.apiUrl + "StockTally/GetExistDateHistoryStockTally");

    var result = await lastValueFrom(get$) as Array<StockTallyDate>;
    return result;
  }

  public async getStockTallyHistoryByDate(date: Date): Promise<StockTallyHistory> {
    const post$ = this.http.post(keys.apiUrl + "StockTally/GetStockTallyHistoryByDate", date);

    var result = await lastValueFrom(post$) as StockTallyHistory;
    return result;
  }

  public async addOrUpdateStockTally(stocktallyhistory: StockTallyHistory): Promise<string> {
    const post$ = this.http.post(keys.apiUrl + "StockTally/AddORUpdateStockTally/", stocktallyhistory, {
      observe: "body",
      responseType: "text"
    });

    var result = await lastValueFrom(post$) as string;
    return result;
  }

  public async getStockTallyBoxFiltered(criteria: StockTallyBoxSearchCritria): Promise<Array<StockTallyBox>> {
    const post$ = this.http.post(keys.apiUrl + "StockTally/GetFiltered", criteria);

    var result = await lastValueFrom(post$) as Array<StockTallyBox>;
    return result;
  }

  public async addStockTallyBox(stockTallyBox: StockTallyBox): Promise<string> {
    const post$ = this.http.post(keys.apiUrl + "StockTally/AddStockTallyBox/", stockTallyBox, {
      observe: "body",
      responseType: "text"
    });

    var result = await lastValueFrom(post$) as string;
    return result;
  }


}

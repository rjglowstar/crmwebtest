import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { defaultIfEmpty, lastValueFrom, Subject, takeUntil } from 'rxjs';
import { keys } from 'shared/auth';
import { InventorySearchCriteria, SalesSheetResponse, SalesSheetSummary } from '../../businessobjects';

@Injectable({
  providedIn: 'root'
})

export class SalesSheetService {
  public url = keys.apiUrl + "SalesSheet/";
  private cancelRequest$ = new Subject<void>();

  constructor(private http: HttpClient) { }

  public async getSalesSheetSummary(inventoryCriteria: InventorySearchCriteria): Promise<SalesSheetSummary> {
    this.cancelRequest$.next();

    const post$ = this.http.post<SalesSheetSummary>(this.url + "GetSummary", inventoryCriteria, {
      responseType: 'json'
    }).pipe(
      takeUntil(this.cancelRequest$),
      defaultIfEmpty(new SalesSheetSummary())
    );

    try {
      const result = await lastValueFrom(post$);
      return result;
    } catch (error) {
      console.error('Error fetching sales sheet summary:', error);
      return new SalesSheetSummary();
    }
  }

  public async getSalesSheetBySearch(inventoryCriteria: InventorySearchCriteria, skip: number, take: number): Promise<SalesSheetResponse> {
    const post$ = this.http.post(this.url + "GetFilter/" + skip + "/" + take, inventoryCriteria);

    var result = await lastValueFrom(post$) as SalesSheetResponse;
    return result;
  }

  public async getCopyToClipboard(inventoryCriteria: InventorySearchCriteria): Promise<string[]> {
    const post$ = this.http.post(this.url + "GetCopyToClipboard", inventoryCriteria);

    var result = await lastValueFrom(post$) as string[];
    return result;
  }

}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { InvAnalysis } from '../../businessobjects/analysis/invanalysis';
import { KapanSummary } from '../../businessobjects/analysis/kapansummary';
import { InventorySearchCriteria } from '../../businessobjects/inventory/inventorysearchcriteria';

@Injectable({
  providedIn: 'root'
})

export class KapanAnalysisService {

  constructor(private http: HttpClient) { }

  public async getKapanSummary(inventoryCriteria: InventorySearchCriteria): Promise<KapanSummary[]> {
    const post$ = this.http.post(keys.apiUrl + "KapanAnalysis/GetSummary", inventoryCriteria);

    var result = await lastValueFrom(post$) as KapanSummary[];
    return result;
  }

  public async getInventoryItemsBySearch(inventoryCriteria: InventorySearchCriteria, skip: number, take: number): Promise<InvAnalysis[]> {
    const post$ = this.http.post(keys.apiUrl + "KapanAnalysis/GetResult/" + skip + "/" + take, inventoryCriteria);

    var result = await lastValueFrom(post$) as InvAnalysis[];
    return result;
  }

}

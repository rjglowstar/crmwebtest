import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { InventorySearchCriteria } from '../../businessobjects';
import { FinalStockSaleAnalysis } from '../../businessobjects/analysis/finalstocksaleanalysis';

@Injectable({
  providedIn: 'root'
})

export class SaleAnalysisService {
  public url = keys.apiUrl + "SaleAnalysis/";

  constructor(private http: HttpClient) { }

  public async getSalesAnalysisBySearch(inventoryCriteria: InventorySearchCriteria): Promise<FinalStockSaleAnalysis> {
    const post$ = this.http.post(this.url + "GetFilter", inventoryCriteria);

    var result=await lastValueFrom(post$) as FinalStockSaleAnalysis;
    return result;
  }

}
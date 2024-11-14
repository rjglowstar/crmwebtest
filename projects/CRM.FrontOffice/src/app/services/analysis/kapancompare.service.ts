import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { KapanCompareFilter, KapanFilterData } from '../../businessobjects';

@Injectable({
  providedIn: 'root'
})

export class KapanCompareService {

  constructor(private http: HttpClient) { }

  public async getKapanCompareData(kapanCompareFilter: KapanCompareFilter): Promise<KapanFilterData[]> {
    const post$ = this.http.post(keys.apiUrl + "KapanCompare/GetFilter", kapanCompareFilter);

    var result=await lastValueFrom(post$) as KapanFilterData[];
    return result;
  }
}

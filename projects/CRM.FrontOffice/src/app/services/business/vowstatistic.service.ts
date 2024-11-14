import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { VowStatisticSearchCriteria, VowStatisticSearchResponse } from '../../businessobjects';

@Injectable({
  providedIn: 'root'
})
export class VowStatisticService {

  private baseUrl: string;

  constructor(private http: HttpClient) {
    this.baseUrl = keys.apiUrl + 'VowStatistic/'
  }

  public async getBySearch(criteria: VowStatisticSearchCriteria, skip: number, take: number): Promise<VowStatisticSearchResponse> {
    const post$ = this.http.post(this.baseUrl + "GetPaginated/" + skip + "/" + take, criteria);

    var result=await lastValueFrom(post$) as VowStatisticSearchResponse;
    return result;
  }

}

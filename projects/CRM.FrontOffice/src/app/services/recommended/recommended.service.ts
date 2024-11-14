import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { RecommendedData, RecommendedResponse, RecommendedSearchCriteria } from '../../businessobjects';

@Injectable({
  providedIn: 'root'
})
export class RecommendedService {
  private controllerUrl = 'Recommended/';

  constructor(private http: HttpClient) { }

  public async getAllRecommendeds(searchCriteria: RecommendedSearchCriteria): Promise<RecommendedResponse[]> {
    const post$ = this.http.post(keys.apiUrl + this.controllerUrl + "Filter", searchCriteria);

    var result = await lastValueFrom(post$) as RecommendedResponse[];
    return result;
  }

  public async deleteRecommended(ids: string[]): Promise<boolean> {
    const post$ = this.http.post(keys.apiUrl + this.controllerUrl + "Delete", ids);

    var result = await lastValueFrom(post$) as boolean;
    return result;
  }

  public async insertRecommended(data: RecommendedData): Promise<string> {
    const post$ = this.http.post(keys.apiUrl + this.controllerUrl + "InsertRecommended", data, {
      observe: "body",
      responseType: "text"
    });

    var result = await lastValueFrom(post$) as string;
    return result;
  }

}
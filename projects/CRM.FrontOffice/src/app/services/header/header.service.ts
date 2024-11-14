import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { StoneSearchRequest, StoneSearchResponse } from '../../businessobjects';

@Injectable({
  providedIn: 'root'
})

export class HeaderService {

  constructor(private http: HttpClient) { }

  public async getInventoryItemsByStoneSearch(request: StoneSearchRequest): Promise<StoneSearchResponse[]> {
    const post$ = this.http.post(keys.apiUrl + "Header/GetSearchStones", request);

    var result=await lastValueFrom(post$) as StoneSearchResponse[];
    return result;
  }

}
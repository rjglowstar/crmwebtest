import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { OfferStoneSearchCriteria } from '../../businessobjects/analysis/offerstonesearchcriteria';
import { OfferStoneResponse } from '../../businessobjects/business/offerstoneresponse';

@Injectable({
  providedIn: 'root'
})
export class OfferstoneService {

  constructor(private http: HttpClient) {
  }


  public async getOfferstoneBySearch(offerstoneCriteria: OfferStoneSearchCriteria, skip: number, take: number): Promise<OfferStoneResponse> {
    const post$ = this.http.post(keys.apiUrl + "OfferStone/GetOfferStoneResponse/" + skip + "/" + take, offerstoneCriteria);

    var result = await lastValueFrom(post$) as OfferStoneResponse;
    return result;
  }


}

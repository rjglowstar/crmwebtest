import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { ExpoRequestCriteria } from '../../businessobjects/Businesses/exporequestcriteria';
import { ExpoRequestResponse } from '../../businessobjects/Businesses/exporequestresponse';

@Injectable()
export class ExpoRequestService {
  private url = keys.apiUrl + 'ExpoRequest/';

  constructor(private http: HttpClient) { }

  public async getExpoRequestPaginated(criteria: ExpoRequestCriteria, skip: number, take: number): Promise<ExpoRequestResponse> {
    const post$ = this.http.post(this.url + "GetPaginatedItems/" + skip + "/" + take, criteria);

    var result=await lastValueFrom(post$) as ExpoRequestResponse;
    return result;
  }
}
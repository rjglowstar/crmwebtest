import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { ExpoRequestCriteria, ExpoRequestResponse, ExpoRequestSummary, ExpoUpdate } from '../../businessobjects';
import { ExpoInvItem, ExpoRequests } from '../../entities';

@Injectable()
export class ExpoRequestService {
  private url = keys.apiUrl + 'ExpoRequest/';

  constructor(private http: HttpClient) { }

  public async getById(id: string): Promise<ExpoRequests> {
    const get$ = this.http.get(this.url + "GetById/" + id);

    var result = await lastValueFrom(get$) as ExpoRequests;
    return result;
  }

  public async checkOtherIssueStones(stoneIds: string[], id: string): Promise<string[]> {
    const post$ = this.http.post(this.url + "CheckOtherIssueStones/" + id, stoneIds);

    var result = await lastValueFrom(post$) as string[];
    return result;
  }

  public async getOtherSellerRequests(stoneIds: string[], expoReqId: string): Promise<ExpoRequests[]> {
    const post$ = this.http.post(this.url + "GetOtherSellerRequest/" + expoReqId, stoneIds);

    var result = await lastValueFrom(post$) as ExpoRequests[];
    return result;
  }

  public async getExpoRequestPaginated(criteria: ExpoRequestCriteria, skip: number, take: number): Promise<ExpoRequestResponse> {
    const post$ = this.http.post(this.url + "GetPaginatedItems/" + skip + "/" + take, criteria);

    var result = await lastValueFrom(post$) as ExpoRequestResponse;
    return result;
  }

  public async getExpoRequestSummary(criteria: ExpoRequestCriteria): Promise<ExpoRequestSummary> {
    const post$ = this.http.post(this.url + "GetSummary", criteria);

    var result = await lastValueFrom(post$) as ExpoRequestSummary;
    return result;
  }

  public async insertExpoRequest(req: ExpoRequests): Promise<number> {
    const post$ = this.http.post(this.url + "InsertExpoRequest", req);

    var result = await lastValueFrom(post$) as number;
    return result;
  }

  public async updateExpoRequest(req: ExpoRequests): Promise<boolean> {
    const put$ = this.http.put(this.url + "UpdateExpoRequest", req);

    var result = await lastValueFrom(put$) as boolean;
    return result;
  }

  public async updateInventoriesInExporequest(expoUpdate: ExpoUpdate): Promise<ExpoInvItem[]> {
    const put$ = this.http.put(this.url + "UpdateInventories", expoUpdate);

    var result = await lastValueFrom(put$) as ExpoInvItem[];
    return result;
  }

  public async removeExpoRequest(id: string): Promise<number> {
    const delete$ = this.http.delete(this.url + "RemoveExpoRequest/" + id);

    var result=await lastValueFrom(delete$) as number;
    return result;
  }

}

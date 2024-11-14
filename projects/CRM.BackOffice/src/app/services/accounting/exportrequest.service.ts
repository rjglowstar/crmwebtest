import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { CommonResponse, ExportRequestCriteria, ExportRequestResponse } from '../../businessobjects';
import { ExportRequest } from '../../entities';

@Injectable({
  providedIn: 'root'
})
export class ExportRequestService {
  private baseUrl: string;

  constructor(private http: HttpClient) {
    this.baseUrl = keys.apiUrl + 'ExportRequest/'
  }

  public async getRequestByData(): Promise<string[]> {
    const get$ = this.http.get(this.baseUrl + "GetRequestByData")

    var result = await lastValueFrom(get$) as string[];
    return result;
  }

  public async buildExportReqDataByInv(invIds: string[]): Promise<ExportRequest[]> {
    const post$ = this.http.post(this.baseUrl + "BuildExportRequestByInvIds", invIds);

    var result = await lastValueFrom(post$) as ExportRequest[]
    return result;
  }

  public async getPaginatedByCriteria(criteria: ExportRequestCriteria, skip: number, take: number): Promise<ExportRequestResponse> {
    const post$ = this.http.post(this.baseUrl + "GetPaginated/" + skip + "/" + take, criteria);

    var result = await lastValueFrom(post$) as ExportRequestResponse;
    return result;
  }

  public async insertExportRequest(data: ExportRequest[]): Promise<CommonResponse> {
    const post$ = this.http.post(this.baseUrl + "InsertMany", data);

    var result = await lastValueFrom(post$) as CommonResponse;
    return result;
  }

  public async notValidExpoRequestForRInwardMemo(criteria: ExportRequestCriteria): Promise<string[]> {
    const post$ = this.http.post(this.baseUrl + "NotValidExportRequestForRInwardMemo", criteria);

    var result = await lastValueFrom(post$) as string[];
    return result;
  }

  public async deleteExportRequestByStoneIds(data: string[]): Promise<number> {
    const post$ = this.http.post(this.baseUrl + "DeleteByStoneId", data);

    var result = await lastValueFrom(post$) as number;
    return result;
  }

}

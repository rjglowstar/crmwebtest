import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { LeadMemoRequest, MemoRequestResponse, MemoRequestSerchCriteria } from '../../businessobjects';
import { MemoRequest } from '../../entities';

@Injectable({
  providedIn: 'root'
})
export class MemorequestService {

  private controllerUrl = 'MemoRequest/';

  constructor(private http: HttpClient) { }

  public async getMemoRequestByLeadId(leadId: string): Promise<MemoRequest[]> {
    const get$ = this.http.get(keys.apiUrl + this.controllerUrl + "GetMemoRequestListByLeadId/" + leadId);

    var result = await lastValueFrom(get$) as MemoRequest[];
    return result;
  }

  public async getMemoRequestPaginated(memoRequestCriteria: MemoRequestSerchCriteria, skip: number, take: number): Promise<MemoRequestResponse> {
    const post$ = this.http.post(keys.apiUrl + this.controllerUrl + "GetMemoRequestPaginated/" + skip + "/" + take, memoRequestCriteria);

    var result = await lastValueFrom(post$) as MemoRequestResponse;
    return result;
  }

  public async memoRequest(memoRequest: MemoRequest): Promise<string> {
    const post$ = this.http.post(keys.apiUrl + this.controllerUrl + "InsertMemoRequest", memoRequest, {
      observe: "body",
      responseType: "text"
    });

    var result = await lastValueFrom(post$) as string;
    return result;
  }

  public async memoRequestForBackOffice(apiBackOfficeUrl: string, memoRequestBackOffice: LeadMemoRequest): Promise<string> {
    const post$ = this.http.post(apiBackOfficeUrl + "MemoRequest/InsertMemoRequest", memoRequestBackOffice, {
      observe: "body",
      responseType: "text"
    });

    var result = await lastValueFrom(post$) as string;
    return result;
  }

  public async deleteMemoRequest(id: string): Promise<boolean> {
    const delete$ = this.http.delete(keys.apiUrl + this.controllerUrl + "Delete/" + id);

    var result = await lastValueFrom(delete$) as boolean;
    return result;
  }

  public async deleteMemoRequestBackOffice(apiBackOfficeUrl: string, ident: string): Promise<boolean> {
    const delete$ = this.http.delete(apiBackOfficeUrl + "MemoRequest/DeleteIdentMemoRequest/" + ident);

    var result=await lastValueFrom(delete$) as boolean;
    return result;
  }
}

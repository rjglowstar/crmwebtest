import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { MemoRequestResponse, MemoRequestSerchCriteria } from '../../businessobjects';
import { MemoRequest } from '../../entities';

@Injectable({
  providedIn: 'root'
})
export class MemorequestService {

  public controllerUrl: string = "MemoRequest/";

  constructor(private http: HttpClient) { }

  /* #region  Memo Request */

  public async getMemoRequestPaginated(memoRequestCriteria: MemoRequestSerchCriteria, skip: number, take: number): Promise<MemoRequestResponse> {
    const post$ = this.http.post(keys.apiUrl + this.controllerUrl + "GetMemoRequestPaginated/" + skip + "/" + take, memoRequestCriteria);

    var result = await lastValueFrom(post$) as MemoRequestResponse;
    return result;
  }

  public async getMemoRequest(memoReqId: string): Promise<MemoRequest> {
    const get$ = this.http.get(keys.apiUrl + this.controllerUrl + "GetMemoRequest/" + memoReqId);

    var result = await lastValueFrom(get$) as MemoRequest;
    return result;
  }

  public async validateMemoStones(stoneIds: Array<string>): Promise<string[]> {
    const post$ = this.http.post(keys.apiUrl + this.controllerUrl + "ValidateMemoStones", stoneIds);

    var result = await lastValueFrom(post$) as string[];
    return result;
  }

  public async updateMemoRequest(memoRequest: MemoRequest): Promise<boolean> {
    const put$ = this.http.put(keys.apiUrl + this.controllerUrl + "UpdateMemoRequest", memoRequest);

    var result = await lastValueFrom(put$) as boolean;
    return result;
  }

  public async deleteMemoRequest(id: string): Promise<boolean> {
    const delete$ = this.http.delete(keys.apiUrl + this.controllerUrl + "DeleteMemoRequest/" + id);

    var result = await lastValueFrom(delete$) as boolean;
    return result;
  }

  public async deleteMemoRequests(ids: Array<string>): Promise<boolean> {
    const post$ = this.http.post(keys.apiUrl + this.controllerUrl + "DeleteMemoRequests", ids);

    var result = await lastValueFrom(post$) as boolean;
    return result;
  }

  /* #endregion */
}

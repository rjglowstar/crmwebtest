import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { QcRequestResponse, QcRequestSerchCriteria } from '../../businessobjects';
import { QcRequest } from '../../entities';

@Injectable({
  providedIn: 'root'
})
export class QcrequestService {

  public controllerUrl: string = "QcRequest/";

  constructor(private http: HttpClient) { }

  /* #region  Memo Request */

  public async getQcRequestPaginated(QcRequestCriteria: QcRequestSerchCriteria, skip: number, take: number): Promise<QcRequestResponse> {
    const post$ = this.http.post(keys.apiUrl + this.controllerUrl + "GetQcRequestPaginated/" + skip + "/" + take, QcRequestCriteria);

    var result = await lastValueFrom(post$) as QcRequestResponse;
    return result;
  }

  public async getQcRequest(qcRequestId: string): Promise<QcRequest> {
    const get$ = this.http.get(keys.apiUrl + this.controllerUrl + "GetQcRequest/" + qcRequestId)

    var result = await lastValueFrom(get$) as QcRequest;
    return result;
  }

  public async updateQcRequest(QcRequest: QcRequest): Promise<boolean> {
    const put$ = this.http.put(keys.apiUrl + this.controllerUrl + "UpdateQcRequest", QcRequest);

    var result = await lastValueFrom(put$) as boolean;
    return result;
  }

  public async deleteQcRequest(id: string): Promise<boolean> {
    const delete$ = this.http.delete(keys.apiUrl + this.controllerUrl + "DeleteQcRequest/" + id);

    var result = await lastValueFrom(delete$) as boolean;
    return result;
  }

  public async deleteQcRequests(ids: Array<string>): Promise<boolean> {
    const post$ = this.http.post(keys.apiUrl + this.controllerUrl + "DeleteQcRequests", ids);

    var result = await lastValueFrom(post$) as boolean;
    return result;
  }

  /* #endregion */
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { LeadQcRequest, QcRequestResponse, QcRequestSerchCriteria } from '../../businessobjects';
import { QcRequest } from '../../entities';

@Injectable({
  providedIn: 'root'
})
export class QcrequestService {

  private controllerUrl = 'QcRequest/';

  constructor(private http: HttpClient) { }

  public async getQcRequestByLeadId(leadId: string): Promise<QcRequest[]> {
    const get$ = this.http.get(keys.apiUrl + this.controllerUrl + "GetQcRequestListByLeadId/" + leadId);

    var result = await lastValueFrom(get$) as QcRequest[];
    return result;
  }

  public async getQcRequestById(id: string): Promise<QcRequest> {
    const get$ = this.http.get(keys.apiUrl + this.controllerUrl + "GetQcRequestById/" + id);

    var result = await lastValueFrom(get$) as QcRequest;
    return result;
  }

  public async getQcRequestPaginated(QcRequestCriteria: QcRequestSerchCriteria, skip: number, take: number): Promise<QcRequestResponse> {
    const post$ = this.http.post(keys.apiUrl + this.controllerUrl + "GetQcRequestPaginated/" + skip + "/" + take, QcRequestCriteria);

    var result = await lastValueFrom(post$) as QcRequestResponse;
    return result;
  }

  public async qcRequestForFo(qcRequest: QcRequest): Promise<string> {
    const post$ = this.http.post(keys.apiUrl + this.controllerUrl + "InsertQcRequest", qcRequest, {
      observe: "body",
      responseType: "text"
    });

    var result = await lastValueFrom(post$) as string;
    return result;
  }

  public async qcRequestForBo(apiBackOfficeUrl: string, memoQcBackOffice: LeadQcRequest): Promise<string> {
    const post$ = this.http.post(apiBackOfficeUrl + this.controllerUrl + "InsertQcRequest", memoQcBackOffice, {
      observe: "body",
      responseType: "text"
    });

    var result = await lastValueFrom(post$) as string;
    return result;
  }

  public async deleteQcRequest(id: string): Promise<boolean> {
    const delete$ = this.http.delete(keys.apiUrl + this.controllerUrl + "Delete/" + id);

    var result = await lastValueFrom(delete$) as boolean;
    return result;
  }

  public async deleteQcRequestBackOffice(apiBackOfficeUrl: string, ident: string): Promise<boolean> {
    const delete$ = this.http.delete(apiBackOfficeUrl + "QcRequest/DeleteIdentQcRequest/" + ident);

    var result=await lastValueFrom(delete$) as boolean;
    return result;
  }
}

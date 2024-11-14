import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { LogisticDNorm, LogisticResponse, LogisticSearchCriteria } from '../../businessobjects';
import { Logistic } from '../../entities';

@Injectable({
  providedIn: 'root'
})
export class LogisticService {
  private controllerUrl = 'Logistic/';

  constructor(private http: HttpClient) { }

  async logisticRequest(logisticData: Logistic): Promise<string> {
    const post$=this.http.post(keys.apiUrl + this.controllerUrl + "Insert", logisticData, {
      observe: "body",
      responseType: "text"
    });

    var result=await lastValueFrom(post$) as string;
    return result;
  }

  async logisticUpdate(logisticData: Logistic): Promise<boolean> {
    logisticData.updatedBy = keys.loginUserIdent;
    const put$=this.http.put(keys.apiUrl + this.controllerUrl + "Update", logisticData);

    var result=await lastValueFrom(put$) as boolean;
    return result;
  }

  async getLogistics(labCriteria: LogisticSearchCriteria, skip: number, take: number): Promise<LogisticResponse> {
    const post$=this.http.post(keys.apiUrl + this.controllerUrl + "GetPaginated/" + skip + "/" + take, labCriteria);

    var result=await lastValueFrom(post$) as LogisticResponse;
    return result;
  }

  async getAllLogistics(): Promise<Logistic[]> {
    const get$=this.http.get(keys.apiUrl + this.controllerUrl + "GetAll/");

    var result=await lastValueFrom(get$) as Logistic[];
    return result;
  }

  async deleteLogistic(id: string): Promise<boolean> {
    const delete$=this.http.delete(keys.apiUrl + this.controllerUrl + "Delete/" + id);

    var result=await lastValueFrom(delete$) as boolean;
    return result;
  }

  async getGetLogisticDNormForMemo(): Promise<LogisticDNorm[]> {
    const get$=this.http.get(keys.apiUrl + this.controllerUrl + "GetLogisticDNormForMemo/");

    var result=await lastValueFrom(get$) as LogisticDNorm[];
    return result;
  }

}

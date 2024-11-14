import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { ChequeResponse, ChequeSearchCriteria } from '../../businessobjects';
import { ChequeReconciliation } from '../../entities';

@Injectable({
  providedIn: 'root'
})

export class ChequeService {
  private controllerUrl = 'Cheque/';

  constructor(private http: HttpClient) { }

  async getCheque(labCriteria: ChequeSearchCriteria, skip: number, take: number): Promise<ChequeResponse> {
    const post$ = this.http.post(keys.apiUrl + this.controllerUrl + "GetPaginated/" + skip + "/" + take, labCriteria);

    var result = await lastValueFrom(post$) as ChequeResponse;
    return result;
  }

  async getAllCheques(): Promise<ChequeReconciliation[]> {
    const get$ = this.http.get(keys.apiUrl + this.controllerUrl + "GetAll/");

    var result = await lastValueFrom(get$) as ChequeReconciliation[];
    return result;
  }

  async chequeReturnUpdate(chequeId: string): Promise<boolean> {
    const get$ = this.http.get(keys.apiUrl + this.controllerUrl + "ReturnUpdate/" + chequeId);

    var result = await lastValueFrom(get$) as boolean;
    return result;
  }

  async chequeClearUpdate(chequeId: string): Promise<boolean> {
    const get$ = this.http.get(keys.apiUrl + this.controllerUrl + "ClearUpdate/" + chequeId);

    var result = await lastValueFrom(get$) as boolean;
    return result;
  }

  async chequeResetUpdate(chequeId: string): Promise<boolean> {
    const get$ = this.http.get(keys.apiUrl + this.controllerUrl + "ResetUpdate/" + chequeId);

    var result = await lastValueFrom(get$) as boolean;
    return result;
  }

}

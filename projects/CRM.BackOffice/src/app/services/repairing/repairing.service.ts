import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { RepairingResponse, RepairingSearchCriteria } from '../../businessobjects';
import { InventoryItems, Repairing } from '../../entities';

@Injectable({
  providedIn: 'root'
})
export class RepairingService {

  public controllerName: string = "Repairing";
  constructor(private http: HttpClient) { }

  public async getRepairing(repairingSearchCriteria: RepairingSearchCriteria, skip: number, take: number): Promise<RepairingResponse> {
    const post$ = this.http.post(keys.apiUrl + this.controllerName + "/GetPaginated/" + skip + "/" + take, repairingSearchCriteria);

    var result = await lastValueFrom(post$) as RepairingResponse;
    return result;
  }

  public async Insert(repairing: Repairing): Promise<string> {
    const post$ = this.http.post(keys.apiUrl + this.controllerName + "/Insert", repairing, {
      observe: "body",
      responseType: "text"
    });

    var result = await lastValueFrom(post$) as string;
    return result;
  }

  public async InsertList(repairingList: Repairing[]): Promise<string> {
    const post$ = this.http.post(keys.apiUrl + this.controllerName + "/InsertRepairings", repairingList, {
      observe: "body",
      responseType: "text"
    });

    var result = await lastValueFrom(post$) as string;
    return result;
  }

  public async Update(repairing: Repairing): Promise<string> {
    repairing.updatedBy = keys.loginUserIdent;
    const put$ = this.http.put(keys.apiUrl + this.controllerName + "/Update", repairing, {
      observe: "body",
      responseType: "text"
    });

    var result = await lastValueFrom(put$) as string;
    return result;
  }

  public async delete(id: string): Promise<boolean> {
    const delete$ = this.http.delete(keys.apiUrl + this.controllerName + "/Delete/" + id);

    var result = await lastValueFrom(delete$) as boolean;
    return result;
  }

  public async isExistStoneRepair(stoneId: string, type: string): Promise<boolean> {
    const get$ = this.http.get(keys.apiUrl + this.controllerName + "/GetExistRecord/" + stoneId + "/" + type);

    var result = await lastValueFrom(get$) as boolean;
    return result;
  }

  public async isExistStonesRepair(stoneIds: string[]): Promise<string[]> {
    const post$ = this.http.post(keys.apiUrl + this.controllerName + "/GetExistRecords", stoneIds);

    var result = await lastValueFrom(post$) as string[];
    return result;
  }

  public async updateCompleteStatus(stoneIds: string[]): Promise<boolean> {
    const put$ = this.http.put(keys.apiUrl + this.controllerName + "/UpdateCompleteStatus", stoneIds);

    var result = await lastValueFrom(put$) as boolean;
    return result;
  }

  public async updateInventoryIsPricingRequestBool(inventory: InventoryItems[]): Promise<boolean> {
    inventory.forEach(z => { z.updatedBy = keys.loginUserIdent; });
    const put$=this.http.put(keys.apiUrl + this.controllerName + "/UpdateInventoryIsPricingRequestBool", inventory);

    var result=await lastValueFrom(put$) as boolean;
    return result;
  }

}

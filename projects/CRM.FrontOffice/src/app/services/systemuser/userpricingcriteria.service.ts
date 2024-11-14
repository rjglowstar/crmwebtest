import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { UserPricingCriteria } from '../../entities';

@Injectable({
  providedIn: 'root'
})
export class UserPricingCriteriaService {
  private getUserPricingCriteriaData: UserPricingCriteria[] | null = null;
  private controllerUrl = 'UserPricingCriteria/';

  constructor(private http: HttpClient) { }

  public async criteriaInsert(employeeData: UserPricingCriteria): Promise<string> {
    const post$ = this.http.post(keys.apiUrl + this.controllerUrl + "Insert", employeeData, {
      observe: "body",
      responseType: "text"
    });

    var result = await lastValueFrom(post$) as string;
    return result;
  }

  public async criteriaUpdate(employeeData: UserPricingCriteria): Promise<boolean> {
    employeeData.updatedBy = keys.loginUserIdent;
    const put$ = this.http.put(keys.apiUrl + this.controllerUrl + "Update", employeeData);

    var result = await lastValueFrom(put$) as boolean;
    return result;
  }

  public async getUserPricingCriteriaBySystemUser(id: string): Promise<UserPricingCriteria[]> {
    const get$ = this.http.get(keys.apiUrl + this.controllerUrl + "GetBySystemUser/" + id);

    var result = await lastValueFrom(get$) as UserPricingCriteria[];
    return result;
  }

  public async getUserInvPricingCriteriaBySystemUser(id: string): Promise<UserPricingCriteria[]> {

    if (this.getUserPricingCriteriaData)
      return this.getUserPricingCriteriaData;

    try {
      const get$ = this.http.get(keys.apiUrl + this.controllerUrl + "GetBySystemUser/" + id)
      const response = await lastValueFrom(get$) as UserPricingCriteria[];
      this.getUserPricingCriteriaData = response;
      return response;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public async deleteCriteria(id: string): Promise<boolean> {
    const delete$ = this.http.delete(keys.apiUrl + this.controllerUrl + "Delete/" + id);

    var result=await lastValueFrom(delete$) as boolean;
    return result;
  }
}

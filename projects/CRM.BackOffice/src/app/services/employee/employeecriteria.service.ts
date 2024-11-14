import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { EmployeeCriteria } from '../../businessobjects/employee/empcriteria';
import { InventoryItems } from '../../entities';

@Injectable({
  providedIn: 'root'
})
export class EmployeeCriteriaService {
  private controllerUrl = 'EmployeeCriteria/';

  constructor(private http: HttpClient) { }

  public async criteriaInsert(employeeData: EmployeeCriteria): Promise<string> {
    const post$ = this.http.post(keys.apiUrl + this.controllerUrl + "Insert", employeeData, {
      observe: "body",
      responseType: "text"
    });

    var result = await lastValueFrom(post$) as string;
    return result;
  }

  public async criteriaUpdate(employeeData: EmployeeCriteria): Promise<boolean> {
    employeeData.updatedBy = keys.loginUserIdent;
    const put$ = this.http.put(keys.apiUrl + this.controllerUrl + "Update", employeeData);

    var result = await lastValueFrom(put$) as boolean;
    return result;
  }

  public async getEmpCriteriaByEmp(id: string): Promise<EmployeeCriteria[]> {
    const get$ = this.http.get(keys.apiUrl + this.controllerUrl + "GetByEmployee/" + id);

    var result = await lastValueFrom(get$) as EmployeeCriteria[];
    return result;
  }

  public async getEmpIdsForNotification(InvItems: InventoryItems[]): Promise<string[]> {
    const post$ = this.http.post(keys.apiUrl + this.controllerUrl + "GetEmpIdsForNotificationFromInvItems/", InvItems);

    var result = await lastValueFrom(post$) as string[];
    return result;
  }

  public async getEmpIdsForNotificationFromStoneIds(stoneIds: string[]): Promise<string[]> {
    const post$ = this.http.post(keys.apiUrl + this.controllerUrl + "GetEmpIdsForNotificationFromStoneIds/", stoneIds);

    var result = await lastValueFrom(post$) as string[];
    return result;
  }

  public async deleteCriteria(id: string): Promise<boolean> {
    const delete$ = this.http.delete(keys.apiUrl + this.controllerUrl + "Delete/" + id);

    var result = await lastValueFrom(delete$) as boolean;
    return result;
  }
}

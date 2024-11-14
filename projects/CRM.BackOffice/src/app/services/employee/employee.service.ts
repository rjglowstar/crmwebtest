import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { CommonResponse } from 'shared/businessobjects';
import { EmployeeSearchCriteria } from '../../businessobjects';
import { Employee, EmployeeDNorm, MarketingEmail } from '../../entities';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private controllerUrl = 'Employee/';

  constructor(private http: HttpClient) { }

  public async employeeRequest(employeeData: Employee): Promise<CommonResponse> {
    const post$ = this.http.post(keys.apiUrl + this.controllerUrl + "Insert", employeeData);

    var result = await lastValueFrom(post$) as CommonResponse;
    return result;
  }

  public async employeeUpdate(employeeData: Employee): Promise<CommonResponse> {
    employeeData.updatedBy = keys.loginUserIdent;
    const put$ = this.http.put(keys.apiUrl + this.controllerUrl + "Update", employeeData);

    var result = await lastValueFrom(put$) as CommonResponse;
    return result;
  }

  public async getEmployees(employeeCriteria: EmployeeSearchCriteria, skip: number, take: number): Promise<Employee[]> {
    const post$ = this.http.post(keys.apiUrl + this.controllerUrl + "GetPaginated/" + skip + "/" + take, employeeCriteria);

    var result = await lastValueFrom(post$) as Employee[];
    return result;
  }

  public async getAllEmployees(): Promise<Employee[]> {
    const get$ = this.http.get(keys.apiUrl + this.controllerUrl + "GetAll");

    var result = await lastValueFrom(get$) as Employee[];
    return result;
  }

  public async getEmpFromDept(id: string): Promise<Employee[]> {
    const get$=this.http.get(keys.apiUrl + this.controllerUrl + "GetEmpFromDept/" + id);

    var result=await lastValueFrom(get$) as Employee[];
    return result;
  }

  public async deleteEmployee(id: string): Promise<boolean> {
    const delete$=this.http.delete(keys.apiUrl + this.controllerUrl + "Delete/" + id);

    var result=await lastValueFrom(delete$) as boolean;
    return result;
  }

  public async updateMarketingEmail(data: MarketingEmail, empId: string): Promise<boolean> {
    const put$=this.http.put(keys.apiUrl + this.controllerUrl + "UpdateMarketingEmail/" + empId, data);

    var result=await lastValueFrom(put$) as boolean;
    return result;
  }

  public async getEmployeeById(id: string): Promise<Employee> {
    const get$=this.http.get(keys.apiUrl + this.controllerUrl + "Get/" + id);

    var result=await lastValueFrom(get$) as Employee;
    return result;
  }

  public async getEmployeeDNorm(): Promise<EmployeeDNorm[]> {
    const get$=this.http.get(keys.apiUrl + this.controllerUrl + "GetEmployeeDNorms");

    var result=await lastValueFrom(get$) as EmployeeDNorm[];
    return result;
  }

  public async getEmployeeDNormByOriginType(origin: string): Promise<EmployeeDNorm[]> {
    const get$=this.http.get(keys.apiUrl + this.controllerUrl + "GetEmployeeDNormsByOrigin/" + origin);

    var result=await lastValueFrom(get$) as EmployeeDNorm[]
    return result;
  }

}

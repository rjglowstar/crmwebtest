import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { Address } from 'shared/businessobjects';
import { BranchDNorm, OrganizationDNorm } from '../../businessobjects';
import { Branch, Department, Organization } from '../../entities';


@Injectable({
  providedIn: 'root'
})

export class OrganizationService {

  constructor(private http: HttpClient) { }

  public async getOrganizationAddressByEmployee(employeeId: string): Promise<Address> {
    const get$ = this.http.get(keys.apiUrl + "Organization/GetOrganizationAddressByEmployeeIdAsync/" + employeeId);

    var result = await lastValueFrom(get$) as Address;
    return result;
  }

  public async getOrganizationDNorm(): Promise<OrganizationDNorm[]> {
    const get$ = this.http.get(keys.apiUrl + "Organization/GetDNorms/");

    var result = await lastValueFrom(get$) as OrganizationDNorm[];
    return result;
  }

  public async getOrganizationById(id: string): Promise<Organization> {
    const get$ = this.http.get(keys.apiUrl + "Organization/Get/" + id);

    var result = await lastValueFrom(get$) as Organization;
    return result;
  }

  // Branch Endpoints
  public async branchInsert(organizationId: string, branchData: Branch): Promise<string> {
    const post$ = this.http.post(keys.apiUrl + "Organization/InsertBranch/" + organizationId, branchData, {
      observe: "body",
      responseType: "text"
    });

    var result = await lastValueFrom(post$) as string;
    return result;
  }

  public async branchUpdate(organizationId: string, branchData: Branch): Promise<string> {
    const put$ = this.http.put(keys.apiUrl + "Organization/UpdateBranch/" + organizationId, branchData, {
      observe: "body",
      responseType: "text"
    });

    var result = await lastValueFrom(put$) as string;
    return result;
  }

  public async deleteBranch(organizationId: string, branchId: string): Promise<boolean> {
    const delete$ = this.http.delete(keys.apiUrl + "Organization/DeleteBranch/" + organizationId + "/" + branchId);

    var result = await lastValueFrom(delete$) as boolean;
    return result;
  }

  // Department Endpoints
  public async departmentInsert(organizationId: string, departmentData: Department): Promise<string> {
    const post$ = this.http.post(keys.apiUrl + "Organization/InsertDepartment/" + organizationId, departmentData, {
      observe: "body",
      responseType: "text"
    });

    var result = await lastValueFrom(post$) as string;
    return result;
  }

  public async departmentUpdate(organizationId: string, departmentData: Department): Promise<string> {
    const put$ = this.http.put(keys.apiUrl + "Organization/UpdateDepartment/" + organizationId, departmentData, {
      observe: "body",
      responseType: "text"
    });

    var result = await lastValueFrom(put$) as string;
    return result;
  }

  public async deleteDepartment(organizationId: string, departmentId: string): Promise<boolean> {
    const delete$ = this.http.delete(keys.apiUrl + "Organization/DeleteDepartment/" + organizationId + "/" + departmentId);

    var result = await lastValueFrom(delete$) as boolean;
    return result;
  }

  public async getBranchDNormByOrganizationId(id: string): Promise<BranchDNorm[]> {
    const get$ = this.http.get(keys.apiUrl + "Organization/GetBranchDNormByOrganization/" + id);

    var result = await lastValueFrom(get$) as BranchDNorm[];
    return result;
  }

  public async getDepartmentByOrganizationId(id: string): Promise<Department[]> {
    const get$ = this.http.get(keys.apiUrl + "Organization/GetDepartmentByOrganization/" + id);

    var result = await lastValueFrom(get$) as Department[];
    return result;
  }

}
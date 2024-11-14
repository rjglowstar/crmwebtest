import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { SystemUserSearchCriteria } from '../../businessobjects';
import { EmailConfig, SystemUser, SystemUserDNorm } from '../../entities';

@Injectable({
  providedIn: 'root'
})
export class SystemUserService {
  private controllerUrl = 'SystemUser/';
  private getAllSystemUsersData: SystemUser[] | null = null;

  constructor(private http: HttpClient) { }

  public async systemUserRequest(systemUserData: SystemUser): Promise<boolean> {
    const post$ = this.http.post(keys.apiUrl + this.controllerUrl + "Insert", systemUserData);

    var result = await lastValueFrom(post$) as boolean;
    return result;
  }

  public async systemUserUpdate(systemUserData: SystemUser): Promise<boolean> {
    systemUserData.updatedBy = keys.loginUserIdent;
    const put$ = this.http.put(keys.apiUrl + this.controllerUrl + "Update", systemUserData);

    var result = await lastValueFrom(put$) as boolean;
    return result;
  }

  public async getSystemUsers(systemUserCriteria: SystemUserSearchCriteria, skip: number, take: number): Promise<SystemUser[]> {
    const post$ = this.http.post(keys.apiUrl + this.controllerUrl + "GetPaginated/" + skip + "/" + take, systemUserCriteria);

    var result = await lastValueFrom(post$) as SystemUser[];
    return result;
  }

  public async getAllSystemUsers(): Promise<SystemUser[]> {

    if (this.getAllSystemUsersData)
      return this.getAllSystemUsersData;

    try {
      const get$ = this.http.get(keys.apiUrl + this.controllerUrl + "GetAll");
      const response = await lastValueFrom(get$) as SystemUser[];
      this.getAllSystemUsersData = response;
      return response;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public async deleteSystemUser(id: string): Promise<boolean> {
    const delete$ = this.http.delete(keys.apiUrl + this.controllerUrl + "Delete/" + id);

    var result = await lastValueFrom(delete$) as boolean;
    return result;
  }

  public async updateMarketingEmail(data: EmailConfig, empId: string): Promise<boolean> {
    const put$ = this.http.put(keys.apiUrl + this.controllerUrl + "UpdateMarketingEmail/" + empId, data);

    var result = await lastValueFrom(put$) as boolean;
    return result;
  }

  public async getSystemUserById(id: string): Promise<SystemUser> {
    const get$ = this.http.get(keys.apiUrl + this.controllerUrl + "Get/" + id);

    var result = await lastValueFrom(get$) as SystemUser;
    return result;
  }

  public async getSystemUserByOrigin(origin: string): Promise<SystemUser[]> {
    const get$ = this.http.get(keys.apiUrl + this.controllerUrl + "GetByOrigin/" + origin);

    var result = await lastValueFrom(get$) as SystemUser[];
    return result;
  }

  public async getSystemUserDNormByIdAsync(userId: string): Promise<SystemUserDNorm> {
    const get$ = this.http.get(keys.apiUrl + this.controllerUrl + "GetEmpDNormById/" + userId);

    var result = await lastValueFrom(get$) as SystemUserDNorm;
    return result;
  }

  public async getSystemUserDNormAsync(): Promise<SystemUserDNorm[]> {
    const get$ = this.http.get(keys.apiUrl + this.controllerUrl + "GetSystemUserDNorm");

    var result=await lastValueFrom(get$) as SystemUserDNorm[];
    return result;
  }
}

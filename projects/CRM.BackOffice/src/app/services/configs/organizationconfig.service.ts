import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { OrgConfig } from '../../entities';

@Injectable({
  providedIn: 'root'
})

export class OrganizationconfigService {

  constructor(private http: HttpClient) { }

  public async getOrganizationConfigByOrgId(id: string): Promise<OrgConfig> {
    const get$=this.http.get(keys.apiUrl + "OrganizationConfig/Get/" + id);

    var result=await lastValueFrom(get$) as OrgConfig;
    return result;
  }

  public async organizationConfigInsert(orgConfigData: OrgConfig): Promise<string> {
    const post$= this.http.post(keys.apiUrl + "OrganizationConfig/Insert", orgConfigData, {
      observe: "body",
      responseType: "text"
    });

    var result=await lastValueFrom(post$) as string;
    return result;
  }

  public async organizationConfigUpdate(orgConfigData: OrgConfig): Promise<boolean> {
    orgConfigData.updatedBy = keys.loginUserIdent;
    const put$=this.http.put(keys.apiUrl + "OrganizationConfig/Update", orgConfigData);

    var result=await lastValueFrom(put$) as boolean;
    return result;
  }

  public async deleteOrganizationConfig(id: string): Promise<boolean> {
    const delete$=this.http.delete(keys.apiUrl + "OrganizationConfig/Delete/" + id);

    var result=await lastValueFrom(delete$) as boolean;
    return result;
  }
}

import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { lastValueFrom } from "rxjs";
import { keys } from "shared/auth";
import { SystemUserPermission } from "shared/enitites";
import { fxCredential } from "../../entities";

@Injectable()
export class AppPreloadService {

  constructor(private http: HttpClient) { }

  async fetchFxCredentials(systemUserId?: string, type: string = "any"): Promise<fxCredential> {
    try {
      let credential = new fxCredential();
      let sesValue = sessionStorage.getItem("fxCredentials");

      if (sesValue)
        credential = JSON.parse(sesValue) as fxCredential;
      else {
        const get$ = this.http.get(keys.apiUrl + "SystemUser/Credential/" + systemUserId);
        if (type == "any")
          credential = await lastValueFrom(get$) as fxCredential

        if (systemUserId) {
          if (credential)
            sessionStorage.setItem("fxCredentials", JSON.stringify(credential));
        }
      }

      return credential;
    } catch (error: any) {
      console.error(error);
      return new fxCredential();
    }
  }

  async fetchUserPermission(systemUserId: string): Promise<SystemUserPermission> {
    let userPermissions: SystemUserPermission = new SystemUserPermission();
    let sesValue = sessionStorage.getItem("userPermission");

    if (sesValue)
      userPermissions = JSON.parse(sesValue) as SystemUserPermission;
    else {
      const get$ = this.http.get(keys.apiUrl + "Permission/SystemUser/Get/" + systemUserId);
      userPermissions = await lastValueFrom(get$) as SystemUserPermission;

      if (userPermissions)
        sessionStorage.setItem("userPermission", JSON.stringify(userPermissions));
    }

    return userPermissions;
  }

}
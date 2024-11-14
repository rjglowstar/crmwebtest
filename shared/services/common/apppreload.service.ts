import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { lastValueFrom } from "rxjs";
import { keys } from "shared/auth";
import { EmpPermission, fxCredential } from "shared/enitites";

@Injectable()
export class AppPreloadService {

  constructor(private http: HttpClient) { }

  public async fetchFxCredentials(empId?: string, type: string = "any"): Promise<fxCredential> {
    let credential = new fxCredential();
    let sesValue = sessionStorage.getItem("fxCredentials");

    if (sesValue)
      credential = JSON.parse(sesValue) as fxCredential;
    else {
      const get$ = this.http.get(keys.apiUrl + "Employee/Credential/" + empId)
      if (type == "any")
        credential = await lastValueFrom(get$) as fxCredential
     
      if (empId) {
        if (credential)
          sessionStorage.setItem("fxCredentials", JSON.stringify(credential));
      }
    }

    return credential;
  }

  public async fetchUserPermission(empId: string): Promise<EmpPermission> {
    let userPermissions: EmpPermission = new EmpPermission();
    let sesValue = sessionStorage.getItem("userPermission");

    if (sesValue)
      userPermissions = JSON.parse(sesValue) as EmpPermission;
    else {
      const get$ = this.http.get(keys.apiUrl + "Permission/Employee/Get/" + empId);
      userPermissions = await lastValueFrom(get$) as EmpPermission;

      if (userPermissions)
        sessionStorage.setItem("userPermission", JSON.stringify(userPermissions));
    }

    return userPermissions;
  }

}
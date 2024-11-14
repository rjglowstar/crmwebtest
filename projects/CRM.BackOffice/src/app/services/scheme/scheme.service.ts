import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { Scheme } from '../../entities';

@Injectable({
  providedIn: 'root'
})
export class SchemeService {

  public controllerName: string = "Schemes";

  constructor(private http: HttpClient) { }

  public async getAllSchemes(): Promise<Scheme[]> {
    const get$ = this.http.get(keys.apiUrl + this.controllerName + "/GetAll");

    var result=await lastValueFrom(get$) as Scheme[];
    return result;
  }

  public async schemeInsert(schemeObj: Scheme): Promise<string> {
    const post$=this.http.post(keys.apiUrl + this.controllerName + "/Insert", schemeObj, {
      observe: "body",
      responseType: "text"
    });

    var result=await lastValueFrom(post$) as string;
    return result;
  }

  public async schemeUpdate(schemeObj: Scheme): Promise<boolean> {
    schemeObj.updatedBy = keys.loginUserIdent;
    const put$=this.http.put(keys.apiUrl + this.controllerName + "/Update", schemeObj);

    var result=await lastValueFrom(put$) as boolean;
    return result;
  }

  public async deleteScheme(id: string): Promise<boolean> {
    const delete$=this.http.delete(keys.apiUrl + this.controllerName + "/Delete/" + id);

    var result=await lastValueFrom(delete$) as boolean;
    return result;
  }

}

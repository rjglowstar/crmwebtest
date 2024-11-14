import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { ExpoMasterSearchCriteria } from '../../businessobjects/organizations/expomastersearchcriteria ';
import { Expomaster } from '../../entities/organization/expomaster';

@Injectable({
  providedIn: 'root'
})
export class ExpomasterService {

  constructor(private http: HttpClient) { }

  async expoMasterRequest(expoMasterData: Expomaster): Promise<string> {
    const post$ = this.http.post(keys.apiUrl + "ExpoMaster/Insert", expoMasterData, {
      observe: "body",
      responseType: "text"
    });

    var result = await lastValueFrom(post$) as string;
    return result;
  }

  async expoMasterUpdate(expoMasterData: Expomaster): Promise<string> {
    const put$ = this.http.put(keys.apiUrl + "ExpoMaster/Update", expoMasterData, {
      observe: "body",
      responseType: "text"
    });

    var result = await lastValueFrom(put$) as string;
    return result;
  }

  async getExpoMaster(expomastersearchcriteria: ExpoMasterSearchCriteria): Promise<Expomaster> {
    const post$ = this.http.post(keys.apiUrl + "ExpoMaster/GetFiltered/", expomastersearchcriteria);

    var result = await lastValueFrom(post$) as Expomaster;
    return result;
  }
  async deleteExpoMaster(id: string): Promise<boolean> {
    const delete$ = this.http.delete(keys.apiUrl + "ExpoMaster/Delete/" + id);

    var result = await lastValueFrom(delete$) as boolean;
    return result;
  }

}

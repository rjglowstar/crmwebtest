import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { BusinessConfig } from '../../entities';

@Injectable({
  providedIn: 'root'
})
export class BusinessconfigurationService {

  constructor(private http: HttpClient) { }

  public async getBusinessConfigurationGetStoneIds(channelPatnerId: string, includeInBusiness: boolean): Promise<BusinessConfig> {
    const get$ = this.http.get(keys.apiUrl + "BusinessConfig/GetStoneIds/" + channelPatnerId + "/" + includeInBusiness);

    var result = await lastValueFrom(get$) as BusinessConfig;
    return result;
  }

  public async getBusinessConfiguration(): Promise<BusinessConfig> {
    const get$ = this.http.get(keys.apiUrl + "BusinessConfig/Get");

    var result = await lastValueFrom(get$) as BusinessConfig;
    return result;
  }

  public async insertBusinessConfig(businessConfig: BusinessConfig): Promise<string> {
    const post$ = this.http.post(keys.apiUrl + "BusinessConfig/Insert", businessConfig, {
      observe: "body",
      responseType: "text"
    });

    var result = await lastValueFrom(post$) as string;
    return result;
  }

  public async updateBusinessConfig(businessConfig: BusinessConfig): Promise<boolean> {
    businessConfig.updatedBy = keys.loginUserIdent;
    const put$ = this.http.put(keys.apiUrl + "BusinessConfig/Update", businessConfig);

    var result=await lastValueFrom(put$) as boolean;
    return result;
  }

}

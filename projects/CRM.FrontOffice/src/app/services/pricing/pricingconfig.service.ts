import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { PricingConfig } from '../../entities';

@Injectable({
  providedIn: 'root'
})
export class PricingConfigService {
  private url = keys.apiUrl + 'PricingConfig/';

  constructor(private http: HttpClient) { }

  public async getPricingConfigData(): Promise<PricingConfig> {
    const get$ = this.http.get(this.url + "Get");

    var result = await lastValueFrom(get$) as PricingConfig;
    return result;
  }

  public async updatePricingConfig(data: PricingConfig): Promise<boolean> {
    data.updatedBy = keys.loginUserIdent;
    const put$ = this.http.put(this.url + "UpdatePricingConfig/", data);

    var result=await lastValueFrom(put$) as boolean;
    return result;
  }
}


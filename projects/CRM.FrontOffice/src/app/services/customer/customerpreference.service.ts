import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { CustomerPreference } from '../../entities';

@Injectable({
  providedIn: 'root'
})
export class CustomerPreferenceService {
  private controllerUrl = 'CustomerPreference/';

  constructor(private http: HttpClient) { }

  public async getCustomerPreferenceByCustomer(id: string): Promise<CustomerPreference> {
    const get$ = this.http.get(keys.apiUrl + this.controllerUrl + "Get/" + id);

    var result = await lastValueFrom(get$) as CustomerPreference;
    return result;
  }

  public async changeSellerId(customerId: string, sellerId: string): Promise<boolean> {
    const get$ = this.http.get(keys.apiUrl + this.controllerUrl + "ChangeSeller/" + customerId + "/" + sellerId);

    var result = await lastValueFrom(get$) as boolean;
    return result;
  }

  public async updateCustomerPreference(preference: CustomerPreference): Promise<boolean> {
    const put$ = this.http.put(keys.apiUrl + this.controllerUrl + "Update", preference);

    var result = await lastValueFrom(put$) as boolean;
    return result;
  }
}

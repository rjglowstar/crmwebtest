import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { CustomerPreference } from '../../entities';
import { SearchQuery } from 'shared/enitites';

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

  public async updateCustomerPreference(preference: CustomerPreference): Promise<boolean> {
    preference.updatedBy = keys.loginUserIdent;
    const put$ = this.http.put(keys.apiUrl + this.controllerUrl + "Update", preference);

    var result = await lastValueFrom(put$) as boolean;
    return result;
  }

  public async insertCustomerPreference(preference: CustomerPreference): Promise<string> {
    const post$ = this.http.post(keys.apiUrl + this.controllerUrl + "Insert", preference, {
      observe: "body",
      responseType: "text"
    });

    var result=await lastValueFrom(post$) as string;
    return result;
  }
  
  public async UpdateSavedSearchQuery(customerId: string, searchQueryData: SearchQuery): Promise<boolean> {
    const put$ = this.http.put(keys.apiUrl + this.controllerUrl + "UpdateSavedSearchQuery/" + customerId, searchQueryData);

    var result = await lastValueFrom(put$) as boolean;
    return result;
  }
}

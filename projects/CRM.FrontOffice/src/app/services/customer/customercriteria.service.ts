import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { CustomerCriteria, InventoryItems } from '../../entities';
import { custAddDisc } from '../../entities/customer/customerAddDisc';
import { CustAddDiscCriteria } from '../../businessobjects/customer/customerAddDiscCriteria';

@Injectable({
  providedIn: 'root'
})
export class CustomerCriteriaService {
  private controllerUrl = 'CustomerCriteria/';

  constructor(private http: HttpClient) { }

  public async criteriaInsert(customerData: CustomerCriteria): Promise<string> {
    const post$ = this.http.post(keys.apiUrl + this.controllerUrl + "Insert", customerData, {
      observe: "body",
      responseType: "text"
    });

    var result = await lastValueFrom(post$) as string;
    return result;
  }

  public async criteriaUpdate(customerData: CustomerCriteria): Promise<boolean> {
    customerData.updatedBy = keys.loginUserIdent;
    const put$ = this.http.put(keys.apiUrl + this.controllerUrl + "Update", customerData);

    var result = await lastValueFrom(put$) as boolean;
    return result;
  }

  public async getInventoryItemsByCustomerCriteria(customerCriteria: CustomerCriteria[]): Promise<InventoryItems[]> {
    const post$ = this.http.post(keys.apiUrl + this.controllerUrl + "InventoryByCustomerCriteria", customerCriteria);

    var result = await lastValueFrom(post$) as InventoryItems[];
    return result;
  }

  public async getCustomerCriteriaByCustomer(id: string): Promise<CustomerCriteria[]> {
    const get$ = this.http.get(keys.apiUrl + this.controllerUrl + "GetByCustomer/" + id);

    var result = await lastValueFrom(get$) as CustomerCriteria[];
    return result;
  }

  public async deleteCriteria(id: string): Promise<boolean> {
    const delete$ = this.http.delete(keys.apiUrl + this.controllerUrl + "Delete/" + id);

    var result = await lastValueFrom(delete$) as boolean;
    return result;
  }

  public async insertCustomerAddiDisc(custAddDiscData: custAddDisc[]): Promise<boolean> {
    const post$ = this.http.post(keys.apiUrl + this.controllerUrl + "InsertCustomerAddiDisc", custAddDiscData);    

    var result = await lastValueFrom(post$) as boolean;
    return result;
  }

  public async getCustAddDisc(custAddDiscCriteria: CustAddDiscCriteria, skip: number, take: number): Promise<custAddDisc[]> {
    const post$ = this.http.post(keys.apiUrl + this.controllerUrl + "GetCustAddDiscPaginated/" + skip + "/" + take, custAddDiscCriteria);

    var result = await lastValueFrom(post$) as custAddDisc[];
    return result;
  }

  public async getAllCustAddDiscIds(): Promise<string[]> {
    const get$ = this.http.get(keys.apiUrl + this.controllerUrl + "GetAllCustAddDiscIds");

    var result = await lastValueFrom(get$) as string[];
    return result;
  }

  public async deleteCustAddDisc(ids: string[]): Promise<boolean> {
    const post$ = this.http.post(keys.apiUrl + this.controllerUrl + "DeleteCustAddDisc" , ids);

    var result = await lastValueFrom(post$) as boolean;
    return result;
  }

  public async updateCustAddDisc(id: string, discount: number): Promise<boolean> {
    const post$ = this.http.post(keys.apiUrl + this.controllerUrl + "UpdateCustAddDisc/" + id, {discount});

    var result = await lastValueFrom(post$) as boolean;
    return result;
  }
}

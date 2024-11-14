import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { CommonResponse } from 'shared/businessobjects';
import { RegisterModel } from 'shared/enitites';
import { CustomerVerificationResponse, CustomerVerificationSearchCriteria } from '../../businessobjects';
import { Customer, RegisterCustomer } from '../../entities';

@Injectable({
  providedIn: 'root'
})
export class CustomerVerificationService {
  private controllerUrl = 'CustomerRegistration/';

  constructor(private http: HttpClient) { }

  public async getCustomers(customerVerificationCriteria: CustomerVerificationSearchCriteria, skip: number, take: number): Promise<CustomerVerificationResponse> {
    const post$ = this.http.post(keys.apiUrl + this.controllerUrl + "GetPaginated/" + skip + "/" + take, customerVerificationCriteria);

    var result = await lastValueFrom(post$) as CustomerVerificationResponse;
    return result;
  }

  public async getCustomersById(id: string): Promise<RegisterCustomer> {
    const get$ = this.http.get(keys.apiUrl + this.controllerUrl + "Get/" + id);

    var result = await lastValueFrom(get$) as RegisterCustomer;
    return result;
  }

  async updateRegisterCustomer(registerCustomer: RegisterCustomer): Promise<CommonResponse> {
    const post$ = this.http.post(keys.apiUrl + this.controllerUrl + "Update", registerCustomer);

    var result = await lastValueFrom(post$) as CommonResponse;
    return result;
  }

  public async acceptOrRejectCustomer(customer: Customer, isAccept: boolean): Promise<CommonResponse> {
    const post$ = this.http.post(keys.apiUrl + this.controllerUrl + "AcceptOrReject/" + isAccept, customer);

    var result = await lastValueFrom(post$) as CommonResponse;
    return result;
  }

  public async revertAcceptedCustomer(id: string): Promise<CommonResponse> {
    const get$ = this.http.get(keys.apiUrl + this.controllerUrl + "RevertAcceptRegistration/" + id);

    var result = await lastValueFrom(get$) as CommonResponse;
    return result;
  }

  public async sendApprovalMailToCustomer(data: RegisterModel): Promise<boolean> {
    const post$ = this.http.post(keys.apiUrl + this.controllerUrl + "SendApprovalMail", data);

    var result=await lastValueFrom(post$) as boolean;
    return result;
  }
}
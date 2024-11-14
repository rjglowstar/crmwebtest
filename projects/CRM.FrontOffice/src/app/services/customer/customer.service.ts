import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from "environments/environment";
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { CommonResponse, Country } from 'shared/businessobjects';
import { CustomerSearchCriteria, CustomerSearchResponse, InvExcel } from '../../businessobjects';
import { CustLookUp } from '../../businessobjects/customer/CustLookUp';
import { CustomerActiveData } from '../../businessobjects/customer/CustomerActiveData';
import { CustomerItemData } from '../../businessobjects/customer/CustomerItemData';
import { Customer, CustomerDNorm, RegisterCustomer } from '../../entities';
@Injectable({
  providedIn: 'root'
})

export class CustomerService {
  private api = keys.apiUrl + 'Customer/';
  private apiCR = keys.apiUrl + 'CustomerRegistration/';

  constructor(private http: HttpClient) { }

  public async getCustomerById(customerId: string): Promise<any> {
    const get$ = this.http.get(this.api + "Get/" + customerId);

    var result = await lastValueFrom(get$) as any;
    return result;
  }

  public async getCustomerBySellerId(sellerId: string): Promise<Customer[]> {
    const get$ = this.http.get(this.api + "GetAll/" + sellerId);

    var result = await lastValueFrom(get$) as Customer[];
    return result;
  }

  public async getCustomers(customerCriteria: CustomerSearchCriteria, skip: number, take: number): Promise<CustomerSearchResponse> {
    const post$ = this.http.post(this.api + "GetPaginated/" + skip + "/" + take, customerCriteria);

    var result = await lastValueFrom(post$) as CustomerSearchResponse;
    return result;
  }

  public async getCustomerByCountry(): Promise<Country[]> {
    const get$ = this.http.get(this.api + "GetCustomerByCountry");
    var result = await lastValueFrom(get$) as Country[];
    return result;
  }

  public async getAllCustomers(): Promise<CustLookUp[]> {
    const get$ = this.http.get(this.api + "GetAll/");

    var result = await lastValueFrom(get$) as CustLookUp[];
    return result;
  }

  public async getAllCustomersbySearchCriteria(customerCriteria: CustomerSearchCriteria): Promise<Customer[]> {
    const post$ = this.http.post(this.api + "GetAllBySearchCriteria", customerCriteria);

    var result = await lastValueFrom(post$) as Customer[];
    return result;
  }

  public async GetCustomersActive(sellerId: string): Promise<CustomerActiveData[]> {
    const get$ = this.http.get(this.api + "GetActiveAll/" + sellerId);

    var result = await lastValueFrom(get$) as CustomerActiveData[];
    return result;
  }

  public async getAllCustomersName(name: string): Promise<Customer[]> {
    const get$ = this.http.get(this.api + "GetAll/" + name);

    var result = await lastValueFrom(get$) as Customer[];
    return result;
  }

  public async updateCustomer(customer: Customer): Promise<boolean> {
    customer.updatedBy = keys.loginUserIdent;
    const put$ = this.http.put(this.api + "Update", customer);

    var result = await lastValueFrom(put$) as boolean;
    return result;
  }

  public async updateCustomerStatus(customer: CustomerItemData): Promise<boolean> {
    customer.updatedBy = keys.loginUserIdent;
    const put$ = this.http.put(this.api + "UpdateCustomerStatus", customer);

    var result = await lastValueFrom(put$) as boolean;
    return result;
  }

  public async updateCustomerUserId(customer: CustomerItemData): Promise<boolean> {
    customer.updatedBy = keys.loginUserIdent;
    const put$ = this.http.put(this.api + "UpdateCustomerUserId", customer);

    var result = await lastValueFrom(put$) as boolean;
    return result;
  }

  public async insertCustomer(customer: RegisterCustomer): Promise<CommonResponse> {
    const post$ = this.http.post(this.apiCR + "Insert", customer);

    var result = await lastValueFrom(post$) as CommonResponse;
    return result;
  }

  public async deleteCustomerRegistration(id: string): Promise<number> {
    const delete$ = this.http.delete(this.apiCR + "Delete/" + id);

    var result = await lastValueFrom(delete$) as number;
    return result;
  }

  public async deleteCustomer(id: string): Promise<number> {
    const delete$ = this.http.delete(this.api + "Delete/" + id);

    var result = await lastValueFrom(delete$) as number;
    return result;
  }

  public async getAllCustomerDNormsByName(name: string): Promise<CustomerDNorm[]> {
    const get$ = this.http.get(this.api + "GetCustomerDNorms/" + name);

    var result = await lastValueFrom(get$) as CustomerDNorm[];
    return result;
  }

  public async getCustomerDNormByIdAsync(customerId: string): Promise<CustomerDNorm> {
    const get$ = this.http.get(this.api + "GetCustomerDNormById/" + customerId);

    var result = await lastValueFrom(get$) as CustomerDNorm;
    return result;
  }

  public async downloadEmployeeExcel(invExcel: InvExcel): Promise<any> {
    const url = environment.apiFrontOfficeFileUploadUrl + "fileupload/DownloadEmployeeExcel";
    const post$ = this.http.post(url, invExcel, { responseType: 'blob' });

    var result = await lastValueFrom(post$) as any;
    return result;
  }

  public async sendMailToCustomer(customer: Customer): Promise<boolean> {
    const post$ = this.http.post(this.api + "SendMailToCustomer", customer);

    var result = await lastValueFrom(post$) as boolean;
    return result;
  }
}
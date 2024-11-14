import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "environments/environment";
import { lastValueFrom } from "rxjs";
import { keys } from "shared/auth";
import { CustomerLanguageData, InvDetailData } from "../../businessobjects";
import { Customer, CustomerDNorm } from "../../entities";
import { Country } from "shared/businessobjects";

@Injectable({
    providedIn: 'root'
})
export class CustomerService {
    public apiUrl = keys.apiUrl + "Customer/";

    constructor(private http: HttpClient) { }

    public async getCustomerDNormsAsync(fullName: string): Promise<CustomerDNorm[]> {
        const get$ = this.http.get(this.apiUrl + "GetCustomerDNorms/" + fullName);

        var result = await lastValueFrom(get$) as CustomerDNorm[];
        return result;
    }

    public async getCustomerDNormByIdAsync(customerId: string): Promise<CustomerDNorm> {
        const get$ = this.http.get(this.apiUrl + "GetCustomerDNormById/" + customerId);

        var result = await lastValueFrom(get$) as CustomerDNorm;
        return result;
    }

    public async getCustomerDNormDataAsync(fullName: string): Promise<CustomerDNorm> {
        const get$ = this.http.get(this.apiUrl + "GetCustomerDNorm/" + fullName);

        var result = await lastValueFrom(get$) as CustomerDNorm;
        return result;
    }

    public async getCustomerById(customerId: string): Promise<Customer> {
        const get$ = this.http.get(this.apiUrl + "Get/" + customerId);

        var result = await lastValueFrom(get$) as Customer;
        return result;
    }

    public async updateCustomerLanguage(data: CustomerLanguageData): Promise<boolean> {
        const post$ = this.http.post(this.apiUrl + "UpdateCustomerLanguage", data);

        var result = await lastValueFrom(post$) as boolean;
        return result;
    }

    public async downloadExcel(invDetailData: InvDetailData[]): Promise<any> {
        const url = environment.apiFrontOfficeFileUploadUrl + "fileupload/DownloadCustomerExcel";
        const post$ = this.http.post(url, invDetailData, { responseType: 'blob' });

        var result = await lastValueFrom(post$) as any;
        return result;
    }

    public async downloadProposalExcel(invDetailData: InvDetailData[]): Promise<any> {
        const url = environment.apiFrontOfficeFileUploadUrl + "fileupload/DownloadProposalExcel";
        const post$ = this.http.post(url, invDetailData, { responseType: 'blob' });

        var result=await lastValueFrom(post$) as any;
        return result;
    }

    public async getCustomerByCountry(): Promise<Country[]> {
      const get$ = this.http.get(this.apiUrl + "GetCustomerByCountry");
      var result = await lastValueFrom(get$) as Country[];
      return result;
    }
}
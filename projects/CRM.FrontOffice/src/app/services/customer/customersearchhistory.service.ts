import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { CustomerSearchHistoryCriteria, CustomerSearchHistoryResponse } from '../../businessobjects';

@Injectable({
    providedIn: 'root'
})
export class CustomerSearchHistoryService {
    private api = keys.apiUrl + 'CustomerSearchHistory/';

    constructor(private http: HttpClient) { }

    public async getByCriteria(customerCriteria: CustomerSearchHistoryCriteria, skip: number, take: number): Promise<CustomerSearchHistoryResponse> {
        const post$ = this.http.post(this.api + "GetPaginated/" + skip + "/" + take, customerCriteria);

        var result=await lastValueFrom(post$) as CustomerSearchHistoryResponse;
        return result;
    }
}

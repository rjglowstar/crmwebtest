import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { CompanyResponse, CompanySearchCriteria } from '../../businessobjects';
import { Company } from '../../entities';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private controllerUrl = 'Company/';

  constructor(private http: HttpClient) { }

  async getCompany(labCriteria: CompanySearchCriteria, skip: number, take: number): Promise<CompanyResponse> {
    const post$ = this.http.post(keys.apiUrl + this.controllerUrl + "GetPaginated/" + skip + "/" + take, labCriteria);

    var result = await lastValueFrom(post$) as CompanyResponse;
    return result;
  }

  async getAllCompanys(): Promise<Company[]> {
    const get$ = this.http.get(keys.apiUrl + this.controllerUrl + "GetAll/");

    var result = await lastValueFrom(get$) as Company[];
    return result;
  }

  async companyRequest(data: Company): Promise<string> {
    const post$ = this.http.post(keys.apiUrl + this.controllerUrl + "Insert", data, {
      observe: "body",
      responseType: "text"
    });

    var result = await lastValueFrom(post$) as string;
    return result;
  }

  async companyUpdate(data: Company): Promise<boolean> {
    data.updatedBy = keys.loginUserIdent;
    const put$ = this.http.put(keys.apiUrl + this.controllerUrl + "Update", data);

    var result = await lastValueFrom(put$) as boolean;
    return result;
  }

  async deleteCompany(id: string): Promise<boolean> {
    const delete$ = this.http.delete(keys.apiUrl + this.controllerUrl + "Delete/" + id);

    var result = await lastValueFrom(delete$) as boolean;
    return result;
  }

}

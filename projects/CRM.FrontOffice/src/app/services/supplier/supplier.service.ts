import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { SupplierResponse, SupplierSearchCriteria } from '../../businessobjects';
import { Supplier, SupplierDNorm } from '../../entities';

@Injectable({
  providedIn: 'root'
})

export class SupplierService {
  private getSupplierDNormData: SupplierDNorm[] | null = null;

  constructor(private http: HttpClient) { }

  async supplierRequest(organizationData: Supplier): Promise<string> {
    const post$ = this.http.post(keys.apiUrl + "Supplier/Insert", organizationData, {
      observe: "body",
      responseType: "text"
    });

    var result = await lastValueFrom(post$) as string;
    return result;
  }

  async supplierUpdate(organizationData: Supplier): Promise<string> {
    organizationData.updatedBy = keys.loginUserIdent;
    const put$ = this.http.put(keys.apiUrl + "Supplier/Update", organizationData, {
      observe: "body",
      responseType: "text"
    });

    var result = await lastValueFrom(put$) as string;
    return result;
  }

  async getsuppliers(supplierCriteria: SupplierSearchCriteria, skip: number, take: number): Promise<SupplierResponse> {
    const post$ = this.http.post(keys.apiUrl + "Supplier/GetPaginated/" + skip + "/" + take, supplierCriteria);

    var result = await lastValueFrom(post$) as SupplierResponse;
    return result;
  }

  async deleteSupplier(id: string): Promise<boolean> {
    const delete$ = this.http.delete(keys.apiUrl + "Supplier/Delete/" + id);

    var result = await lastValueFrom(delete$) as boolean;
    return result;
  }

  async getSupplierDNorm(): Promise<SupplierDNorm[]> {

    if (this.getSupplierDNormData)
      return this.getSupplierDNormData;

    try {
      const get$ = this.http.get(keys.apiUrl + "Supplier/GetDNorms/");

      const response = await lastValueFrom(get$) as Supplier[];
      this.getSupplierDNormData = response;
      return response;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getSupplierById(id: string): Promise<Supplier> {
    const get$ = this.http.get(keys.apiUrl + "Supplier/Get/" + id);

    var result = await lastValueFrom(get$) as Supplier;
    return result;
  }

  async getSupplierByName(name: string): Promise<Supplier> {
    const get$ = this.http.get(keys.apiUrl + "Supplier/Search/" + name);

    var result = await lastValueFrom(get$) as Supplier;
    return result;
  }

  async getAllSuppliers(): Promise<Supplier[]> {
    const get$ = this.http.get(keys.apiUrl + "Supplier/GetAll");

    var result = await lastValueFrom(get$) as Supplier[];
    return result;
  }
}
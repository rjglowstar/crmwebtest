import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { TransactItem, TransactItemDNorm } from '../../entities';

@Injectable({
  providedIn: 'root'
})
export class TransactItemService {

  private baseUrl: string;
  constructor(
    private http: HttpClient
  ) {
    this.baseUrl = keys.apiUrl + 'TransactItem/'
  }

  public async getTransactItemById(id: string): Promise<TransactItem> {
    const get$ = this.http.get(this.baseUrl + "Get/" + id);

    var result = await lastValueFrom(get$) as TransactItem;
    return result;
  }

  public async getTransactItemByGroup(group: string): Promise<TransactItem[]> {
    const get$ = this.http.get(this.baseUrl + "GetByGroup/" + group);

    var result = await lastValueFrom(get$) as TransactItem[];
    return result;
  }

  public async getTransactItemByName(name: string): Promise<TransactItem[]> {
    const get$ = this.http.get(this.baseUrl + "GetByName/" + name);

    var result = await lastValueFrom(get$) as TransactItem[];
    return result;
  }

  public async getTransactItemDNorm(): Promise<TransactItemDNorm[]> {
    const get$ = this.http.get(this.baseUrl + "GetDNorm");

    var result = await lastValueFrom(get$) as TransactItemDNorm[];
    return result;
  }

  public async getTransactItemByNameWithSkipTake(name: string, skip: number, take: number): Promise<TransactItem> {
    const get$ = this.http.get(this.baseUrl + "GetByName/" + name + "/" + skip + "/" + take);

    var result = await lastValueFrom(get$) as TransactItem;
    return result;
  }

  public async getTransactItemPaginated(skip: number, take: number): Promise<TransactItem[]> {
    const get$ = this.http.get(this.baseUrl + "GetPaginated/" + skip + "/" + take);

    var result = await lastValueFrom(get$) as TransactItem[];
    return result;
  }

  public async insertTransactItem(Data: TransactItem): Promise<string> {
    const post$ = this.http.post(this.baseUrl + "Insert", Data, { observe: "body", responseType: "text" })

    var result = await lastValueFrom(post$) as string;
    return result;
  }

  public async updateTransactItem(Data: TransactItem): Promise<string> {
    Data.updatedBy = keys.loginUserIdent;
    const put$ = this.http.put(this.baseUrl + "Update", Data, { observe: "body", responseType: "text" });

    var result = await lastValueFrom(put$) as string;
    return result;
  }

  public async deleteTransactItem(Id: string): Promise<boolean> {
    const delete$ = this.http.delete(this.baseUrl + "Delete/" + Id);

    var result = await lastValueFrom(delete$) as boolean;
    return result;
  }

}

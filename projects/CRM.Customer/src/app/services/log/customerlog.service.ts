import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { CustomerLog } from '../../entities';

@Injectable({
  providedIn: 'root'
})
export class CustomerLogService {
  public apiUrl = keys.apiUrl + "CustomerLog/";

  constructor(private http: HttpClient) { }

  async addCustomerLog(log: CustomerLog): Promise<string> {
    const post$ = this.http.post(this.apiUrl + "AddLog", log, {
      observe: "body",
      responseType: "text"
    });

    var result=await lastValueFrom(post$) as string;
    return result;
  }
}
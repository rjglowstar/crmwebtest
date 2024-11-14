import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { CommonResponse } from 'shared/businessobjects';
import { ExportToExcelMailData, LeadOrderMailConfig } from '../../businessobjects';

@Injectable({
  providedIn: 'root'
})

export class MailService {
  private api = keys.apiUrl + 'Email/';

  constructor(private http: HttpClient) { }

  public async sendOrderApproveMail(data: LeadOrderMailConfig): Promise<CommonResponse> {
    const post$ = this.http.post(this.api + "SendOrderApprove", data);

    var result = await lastValueFrom(post$) as CommonResponse;
    return result;
  }

  public async sendOrderRejectedMail(data: LeadOrderMailConfig): Promise<CommonResponse> {
    const post$ = this.http.post(this.api + "SendOrderReject", data);

    var result = await lastValueFrom(post$) as CommonResponse;
    return result;
  }

  public async SendBidApprovalMail(data: ExportToExcelMailData[]): Promise<CommonResponse> {
    const post$ = this.http.post(this.api + "SendBidApproval", data);

    var result = await lastValueFrom(post$) as CommonResponse;
    return result;
  }

  public async SendBidInformationalMail(customerIds: string[]): Promise<CommonResponse> {
    const post$ = this.http.post(this.api + "SendBidInformational", customerIds);

    var result = await lastValueFrom(post$) as CommonResponse;
    return result;
  }
}
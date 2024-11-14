import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth';
import { CommonResponse } from 'shared/businessobjects';
import { StoneProposalMailData } from '../../businessobjects';

@Injectable({
  providedIn: 'root'
})

export class StoneProposalService {
  public apiUrl = keys.apiUrl + "StoneProposal/";

  constructor(private http: HttpClient) { }

  public async sendStoneProposal(data: StoneProposalMailData): Promise<CommonResponse> {
    const post$ = this.http.post(this.apiUrl + "SendStoneProposal", data);

    var result=await lastValueFrom(post$) as CommonResponse;
    return result;
  }

  public async sendCustomerInvitation(data: StoneProposalMailData): Promise<CommonResponse> {
    const post$ = this.http.post(this.apiUrl + "SendCustomerInvitation", data);

    var result=await lastValueFrom(post$) as CommonResponse;
    return result;
  }

}
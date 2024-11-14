import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { lastValueFrom } from 'rxjs';
import { ForgotPasswordModel, ResetPasswordModel } from '../../entities';
import { OTPItem } from '../../entities/forgetpassword/otpitem';

@Injectable({
  providedIn: 'root'
})
export class ForgetpasswordService {

  private baseUrl: string;
  constructor(private http: HttpClient) {
    this.baseUrl = environment.apiIdentityUrl + 'Account/'
  }

  public async forgetPassword(forgetPassword: ForgotPasswordModel): Promise<string> {
    const post$ = this.http.post(this.baseUrl + "ForgotPassword", forgetPassword, {
      observe: "body",
      responseType: "text"
    });

    var result = await lastValueFrom(post$) as string;
    return result;
  }

  public async OtpVerification(otpItem: OTPItem): Promise<string> {
    const post$ = this.http.post(this.baseUrl + "OtpVerification", otpItem, {
      observe: "body",
      responseType: "text"
    });

    var result = await lastValueFrom(post$) as string;
    return result;
  }

  public async ResendOtp(otpItem: OTPItem): Promise<string> {
    const post$ = this.http.post(this.baseUrl + "ResendOtp", otpItem, {
      observe: "body",
      responseType: "text"
    });

    var result = await lastValueFrom(post$) as string;
    return result;
  }

  public async ResetPassword(ResePasswordItem: ResetPasswordModel): Promise<string> {
    const post$ = this.http.post(this.baseUrl + "ResetPassword", ResePasswordItem, {
      observe: "body",
      responseType: "text"
    });

    var result = await lastValueFrom(post$) as string;
    return result;
  }


  public async LinkValidation(otpItem: OTPItem): Promise<string> {
    const post$ = this.http.post(this.baseUrl + "LinkValidation", otpItem, {
      observe: "body",
      responseType: "text"
    });

    var result=await lastValueFrom(post$) as string;
    return result;
  }

}

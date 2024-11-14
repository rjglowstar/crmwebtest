import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { keys } from 'shared/auth/keys';
import { CommonResponse } from 'shared/businessobjects';
import { RegisterCustomer } from '../../entities/register/register-customer';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {

  private baseUrl: string;
  constructor(private http: HttpClient) {
    this.baseUrl = keys.apiUrl + 'CustomerRegistration/'
  }

  async registerCustomer(registerCustomer: RegisterCustomer): Promise<CommonResponse> {
    const post$ = this.http.post(this.baseUrl + "Insert", registerCustomer);

    var result = await lastValueFrom(post$) as CommonResponse;
    return result;
  }

  /**
   * TODO : The following code need to update as per requirement.
   */
  async registerNotVerifiedUser(registerCustomer: RegisterCustomer): Promise<string> {
    const post$ = this.http.post(this.baseUrl + "Register/InsertRequest", registerCustomer, {
      observe: "body",
      responseType: "text"
    });

    var result = await lastValueFrom(post$) as string;
    return result;
  }

  async setCredential(registerCustomer: RegisterCustomer): Promise<boolean> {
    const post$ = this.http.post(this.baseUrl + "Authenticate/CodeCredential", registerCustomer);

    var result = await lastValueFrom(post$) as boolean;
    return result;
  }

  async resetCredential(oldPassword: string, registerCustomer: RegisterCustomer): Promise<string> {
    const post$ = this.http.post(this.baseUrl + "Authenticate/ResetPassword/" + oldPassword, registerCustomer, {
      observe: "body",
      responseType: "text"
    });

    var result = await lastValueFrom(post$) as string;
    return result;
  }

  async resetNewPassword(registerCustomer: RegisterCustomer): Promise<string> {
    const post$= this.http.post(this.baseUrl + "Authenticate/ForgotPassword", registerCustomer, {
      observe: "body",
      responseType: "text"
    });
    
    var result=await lastValueFrom(post$) as string;
    return result;
  }
}
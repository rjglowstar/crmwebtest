import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { lastValueFrom } from 'rxjs';
import { retry } from 'rxjs/operators';
import { LoginModel, LoginResponse, RegisterModel } from 'shared/enitites';

@Injectable({
    providedIn: 'root'
})

export class AccountService {
    controllerPath: string = 'Account/';

    constructor(private http: HttpClient) { }

    async insertUser(registerModel: RegisterModel): Promise<string> {
        const post$ = this.http.post(environment.apiIdentityUrl + this.controllerPath + "Register", registerModel, {
            observe: "body",
            responseType: "text"
        });

        var result = await lastValueFrom(post$) as string;
        return result;
    }

    async insertCustomerUser(registerModel: RegisterModel): Promise<string> {
        const post$ = this.http.post(environment.apiIdentityUrl + this.controllerPath + "RegisterCustomer", registerModel, {
            observe: "body",
            responseType: "text"
        });

        var result = await lastValueFrom(post$) as string;
        return result;
    }

    async loginUser(login: LoginModel): Promise<LoginResponse> {
        var reqHeader = new HttpHeaders({ "Content-Type": "application/x-www-form-urlencoded", "No-Auth": "True" });
        var data = "client_id=" + encodeURIComponent(login.client_id) + "&user_id=" + encodeURIComponent(login.user_id) + "&password=" + encodeURIComponent(login.password);
        const post$ = this.http.post(environment.apiIdentityUrl + "token", data, { headers: reqHeader }).pipe(
            retry(3));

        var result = await lastValueFrom(post$) as LoginResponse;
        return result;
    }

    async removeUser(email: string): Promise<string> {
        const delete$ = this.http.delete(environment.apiIdentityUrl + this.controllerPath + "Delete/" + email, {
            observe: "body",
            responseType: "text"
        });

        var result = await lastValueFrom(delete$) as string;
        return result;
    }

}
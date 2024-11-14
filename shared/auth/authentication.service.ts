import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest } from "@angular/common/http";

import { environment } from '../../environments/environment';
import { Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { catchError, switchMap } from 'rxjs/operators';

@Injectable()
export class AuthenticationService {

    constructor(private http: HttpClient, private router: Router) { }

    public observableRefreshToken(next: any, req: HttpRequest<any>, refresh_token: string): Observable<any> {
        var reqHeader = new HttpHeaders({ "Content-Type": "application/x-www-form-urlencoded", "No-Auth": "True" });
        var body = "refreshToken=" + refresh_token + "&client_id=ngAuthApp";

        return this.http.post(environment.apiIdentityUrl + "refreshtoken", body, { headers: reqHeader }).pipe(switchMap((data: any) => {
            if (data) {
                sessionStorage.setItem("userToken", JSON.stringify(data));
                //Update userToken in other tabs
                this.sessionStorageTransferWithlocalStorage(data);
                const refreshReq = req.clone({
                    headers: req.headers.set("Authorization", "Bearer " + data.access_token)
                });
                return next.handle(refreshReq);
            } else {
                sessionStorage.clear();
                this.router.navigate(["login"]);
                return throwError('Refresh Token not found!');
            }
        }), catchError((err: any) => {
            sessionStorage.clear();
            this.router.navigate(["login"]);
            return throwError('Refresh Token not found!');
        }));
    }

    private sessionStorageTransferWithlocalStorage(userToken: any) {
        //Trigger event listner in view component
        window.localStorage.setItem('userToken', JSON.stringify(userToken));

        //remove session storage data from local storage
        setTimeout(() => {
            window.localStorage.removeItem('userToken');
        }, 500);
    }

}
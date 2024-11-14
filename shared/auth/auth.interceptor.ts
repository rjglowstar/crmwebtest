import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthenticationService } from './authentication.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(private router: Router, private authenticationService: AuthenticationService) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (req.headers && req.headers.has("Content-Type") && req.headers.get("No-Auth") == "True")
            return next.handle(req.clone());

        if (sessionStorage.getItem("userToken") != null) {
            let token = JSON.parse(sessionStorage.getItem("userToken") ?? '');
            const clonedreq = req.clone({
                headers: req.headers.set("Authorization", "Bearer " + token.access_token)
            });

            return next.handle(clonedreq).pipe(
                catchError((err: any) => {
                    if (err.status === 401) {
                        if (token.refresh_token)
                            return this.authenticationService.observableRefreshToken(next, req, token.refresh_token);
                        else {
                            sessionStorage.clear();
                            this.router.navigate(["login"]);
                            return throwError(err);
                        }
                    }
                    else
                        return throwError(err);
                }));
        }
        else
            return next.handle(req);
    }
}
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable()
export class RouteAuthGuard {
  constructor(private router: Router) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    const url: string = state.url;
    if (url.includes('home') && (window.location.href.includes("diamarthk") || window.location.href.includes("diamanto"))) {
      this.router.navigate(['/login']);
      return false;
    } else if ((url.includes('aboutus') || url.includes('contactus') || url.includes('products') || url.includes('craftsmanship') || url.includes('sustainability') || url.includes('craftsmanship') || url.includes('csr') || url.includes('eventnew')) && (window.location.href.includes("diamarthk") || window.location.href.includes("diamanto"))) {
      this.router.navigate(['/']);
      return false;
    } else
      return true;
  }
}
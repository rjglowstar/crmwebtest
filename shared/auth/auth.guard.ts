import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { SystemUserPermission } from 'shared/enitites';

@Injectable()
export class AuthGuard  {
  constructor(private router: Router) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    if (sessionStorage.getItem("userToken") != null) {
      let userPermissions: SystemUserPermission = new SystemUserPermission();
      let sesValue = sessionStorage.getItem("userPermission");
      if (sesValue)
        userPermissions = JSON.parse(sesValue) as SystemUserPermission;

      if (state.url.toString().split('/')[1] == "dashboard") {
        return true;
      }
      else if (sesValue) {
        var navPermission: string[] = [];
        userPermissions.navItems.forEach(z => navPermission.push(z.path.replace("/", "")));
        if (navPermission) {
          let splitValue = state.url.toString().split('/')[1];
          let isAccessed = navPermission.includes(splitValue);
          if (isAccessed || state.url.toString().includes("?"))
            return true;
          else {
            this.router.navigate(['/not-found']);
            return false;
          }
        }
        else {
          this.router.navigate(['/not-found']);
          return false;
        }
      }
      else {
        //True For Customer Portal      
        return true;
      }

    }
    else {
      this.router.navigate(['/login']);
      return false;
    }


  }
}
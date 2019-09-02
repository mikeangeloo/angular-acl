import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router
} from '@angular/router';

import { Observable } from 'rxjs';
import {AuthenticationService} from '../services/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const currentUser = this.authenticationService.currentUserValue;
    if (currentUser) {
      // verificamos si la ruta esta protegida por algún rol
      if (route.data.roles && route.data.roles.indexOf(currentUser.role) === -1) {
        // rol no autorizado redigimos a home
        this.router.navigate(['/']);
        return false;
      }
      // esta logeado y autorizado, retornamos true
      return true;
    }

    // no esta logeado, redirigimos a la página de login
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url}});
    return false;
  }
}

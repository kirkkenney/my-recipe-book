import { AuthService } from './auth.service';
import { Injectable } from "@angular/core";
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

// AuthGuard protects specified front-end routes from unauthorised users

@Injectable()

export class AuthGuard implements CanActivate {
    
    constructor(private authService: AuthService, private router: Router) {}

    canActivate(router: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {
        // get user's auth status from auth service
        const isAuth = this.authService.getIsAuth();
        // if user is not authorised, automatically redirect them to the login page
        if (!isAuth) {
            this.router.navigate(['/login']);
        }
        return isAuth;
    }
}
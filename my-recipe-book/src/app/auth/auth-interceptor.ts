import { AuthService } from './auth.service';
import { Injectable } from "@angular/core";
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';

// Interceptor automatically gets user's credentials and appends them to any outgoing HTTP requests

@Injectable()

export class AuthInterceptor implements HttpInterceptor {
    
    constructor(private authService: AuthService) {}

    intercept(req: HttpRequest<any>, next: HttpHandler) {
        // get user's auth token for the auth service
        const authToken = this.authService.getToken();
        // set HTTP headers using the auth credentials obtains from the auth service
        const authRequest = req.clone({
            headers: req.headers.set('Authorization', `Bearer ${authToken}`)
        });
        return next.handle(authRequest)
    }
}
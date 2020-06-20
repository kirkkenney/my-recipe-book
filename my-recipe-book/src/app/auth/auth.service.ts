import { Router } from '@angular/router';
import { environment } from "../../environments/environment";
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthData } from './auth-data.model';
import { Subject } from 'rxjs';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';


const BACKEND_URL = `${environment.apiUrl}/user`

@Injectable({
    providedIn: 'root'
})

export class AuthService {

    private authStatusListener = new Subject<boolean>();
    private token: string;
    private userIsAuthenticated = false;
    private username: string = null;
    private userId: string;
    private tokenTimer: any;

    constructor(private http: HttpClient, private router: Router) {}

    createUser(username: string, email: string, password: string) {
        // init new user data to send to backend. Is constructed from the AuthData model, which required createdRecipes ad savedRecipes properties, so these must be passed as null
        const authData: AuthData = { username, email, password, createdRecipes: null, savedRecipes: null }
        this.http.post(`${BACKEND_URL}/signup`, authData)
        .subscribe(() => {
            // if successfully created, redirect user to login page
            this.router.navigate(['/login'])
        }, error => {
            this.authStatusListener.next(false);
        })
    }

    // method used on the signup form to asynchronously check if desired username is already taken
    checkUserNameAvailable(username: string) {
        return this.http.get<{user: string, message: string}>(`${BACKEND_URL}/checkusername/${username}`)
    }

    loginUser(email: string, password: string) {
        const authData: {} = { email, password }
        this.http.post<{message: string, token: string, expiresIn: number, userId: string, username: string}>
        (`${BACKEND_URL}/login`, authData)
        .subscribe(response => {
            // get authorization token from backend if login successful
            const token = response.token;
            this.token = token;
            if (token) {
                // if token received from backend, set properties, methods etc:
                // 1. token expiration for auth localStorage
                const expiresInDuration = response.expiresIn;
                // call setAuthTimer method to init a setTimeout function that will automatically log user out after token has expired
                this.setAuthTimer(expiresInDuration);
                // pass authorization data to service's properties, which can later be called to check authorization state
                this.userIsAuthenticated = true;
                this.userId = response.userId;
                this.username = response.username;
                this.authStatusListener.next(true);
                // init variables/properties for monitoring authorization timeout
                const now = new Date();
                const expirationDate = new Date(now.getTime() + expiresInDuration*1000);
                this.saveAuthData(token, expirationDate, this.userId, this.username);
                this.router.navigate(['/'])
            }
        })
    }

    // on logout, clear all authorization properties and clear timeout function that auto-logs out after timer expiration
    logoutUser() {
        this.token = null;
        this.userId = null;
        this.username = null;
        this.userIsAuthenticated = false;
        this.authStatusListener.next(false);
        clearTimeout(this.tokenTimer);
        this.clearAuthData();
        this.router.navigate(['/login'])
    }

    getAuthStatusListener() {
        return this.authStatusListener.asObservable();
    }

    getToken() {
        return this.token;
    }

    getUserId() {
        return this.userId;
    }

    getUsername() {
        return this.username;
    }

    getIsAuth() {
        return this.userIsAuthenticated;
    }

    // autoAuthUser is called from app.component.ts to ensure that auth state persists on app load, reload, navigation etc
    autoAuthUser() {
        const authInfo = this.getAuthData();
        // if getAuthData method does not return data, user is not authorized
        if (!authInfo) {
            return;
        }
        // re-initialise expiration timer from app load/re-load
        const now = new Date();
        const expiresIn = authInfo.expirationDate.getTime() - now.getTime();
        // if existing expiration is in the future, set timer to automatically log user out once that time is reached
        if (expiresIn > 0) {
            this.token = authInfo.token;
            this.userIsAuthenticated = true;
            this.userId = authInfo.userId;
            this.username = authInfo.username;
            this.setAuthTimer(expiresIn / 1000);
            this.authStatusListener.next(true);
        }
    }

    private saveAuthData(token: string, expiration: Date, userId: string, username: string) {
        localStorage.setItem('app-token', token);
        localStorage.setItem('app-expiration', expiration.toISOString());
        localStorage.setItem('app-user', userId);
        localStorage.setItem('app-username', username)
    }

    private clearAuthData() {
        localStorage.removeItem('app-token');
        localStorage.removeItem('app-expiration');
        localStorage.removeItem('app-user');
        localStorage.removeItem('app-username');
    }

    private setAuthTimer(duration: number) {
        this.tokenTimer = setTimeout(() => {
            this.logoutUser();
        }, duration*1000)
    }

    private getAuthData() {
        const token = localStorage.getItem('app-token');
        const expirationDate = localStorage.getItem('app-expiration');
        const userId = localStorage.getItem('app-user');
        const username = localStorage.getItem('app-username');
        if (!token || !expirationDate) {
            return 
        }
        return {
            token: token,
            expirationDate: new Date(expirationDate),
            userId: userId,
            username: username
        }
    }

}
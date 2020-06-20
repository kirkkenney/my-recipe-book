import { ErrorComponent } from './error/error.component';
import { Injectable } from "@angular/core";
import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';


@Injectable()

export class ErrorInterceptor implements HttpInterceptor {
    
    constructor(private dialog: MatDialog) {}

    intercept(req: HttpRequest<any>, next: HttpHandler) {
        return next.handle(req).pipe(
            catchError((error: HttpErrorResponse) => {
                let errorMsg = 'An unknown error occurred'
                if (error.error.message) {
                    errorMsg = error.error.message
                }
                this.dialog.open(ErrorComponent, {
                    data: { message: errorMsg },
                    panelClass: 'error-modal'
                })
                return throwError(error)
            })
        )
    }
}
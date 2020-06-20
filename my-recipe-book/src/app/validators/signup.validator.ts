import { AbstractControl } from '@angular/forms';
import { AuthService } from '../auth/auth.service';
import { timer } from 'rxjs';
import { switchMap, map } from 'rxjs/operators'


export function passwordMatchValidator(control: AbstractControl) {
    let parent = control.parent;
    if (parent) {
        let password = parent.get('password').value;
        let confirmPassword = control.value;

        if (password != confirmPassword) {
            return { mismatch: true };
        } else {
            return null;
        }
    } else {
        return null;
    }
}

export function checkUserNameAvailable(authService: AuthService) {
    return (control: AbstractControl) => {
        return timer(1000).pipe(
            switchMap(() => authService.checkUserNameAvailable(control.value)),
            map(res => {
                return res.user ? { usernametaken: true } : null
            })
        );
    }
}

export function checkUserNameNoSpaces(control: AbstractControl) {
    if (control.value) {
        if (control.value.indexOf(' ') > 0) {
            return { spaces: true }
        } else {
            return null
        }
    }
    return null
}

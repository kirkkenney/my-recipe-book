import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { passwordMatchValidator, checkUserNameAvailable, checkUserNameNoSpaces } from '../../validators/signup.validator';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  form: FormGroup;
  userIsAuthenticated: boolean;
  isLoading: boolean;

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
    this.isLoading = true;
    this.userIsAuthenticated = this.authService.getIsAuth();
    if (this.userIsAuthenticated) {
      this.router.navigate(['/'])
    }
    this.initForm();
  }

  private initForm() {
    this.form = new FormGroup({
      'username': new FormControl(null, [Validators.required, Validators.maxLength(15), checkUserNameNoSpaces], checkUserNameAvailable(this.authService)),
      'email': new FormControl(null, 
        [Validators.required, Validators.email]),
        'password': new FormControl(null, [Validators.required, Validators.minLength(7)]),
        'confirmPassword': new FormControl(null, [Validators.required, passwordMatchValidator])
    })
    this.isLoading = false;
  }

  onSignUp() {
    if (!this.form.valid) {
      return;
    }
    this.authService.createUser(this.form.value.username, this.form.value.email, this.form.value.password)
  }

}

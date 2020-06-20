import { AuthService } from './../auth.service';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

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
    this.isLoading = false;
  }

  private initForm() {
    this.form = new FormGroup({
      'email': new FormControl(null, [Validators.required, Validators.email]),
      'password': new FormControl(null, Validators.required)
    })
  }

  onLogin() {
    if (!this.form.valid) {
      return
    }
    this.authService.loginUser(this.form.value.email, this.form.value.password)
  }

}

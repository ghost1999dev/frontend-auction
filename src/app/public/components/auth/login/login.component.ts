import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/auth/auth.service';
import { LayoutService } from 'src/app/core/services/layout.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  
  emailPattern = "^[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,4}$";
  loginForm!: FormGroup;
  submitted: boolean = false;

  constructor(
    private router: Router,
    public layoutService: LayoutService,
    private fb: FormBuilder,
    public notificationServices: NotificationService,
    public authSvc: AuthService
  ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.pattern(this.emailPattern)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onLogin(): void {
    const formValue = this.loginForm.value;

    this.authSvc.login(formValue)
    .subscribe((res: any) => {
      if(res){        
        this.onLoggedin()
        this.router.navigate(['/main/dashboard']);
        this.notificationServices.showSuccessCustom('Bienvenido a CodeBid');
      }
    })

  }

  onLoggedin() {
    localStorage.setItem('isLoggedin', 'true');
  }

  loginWithGoogle() {
    window.location.href = `${environment.server_url}passport/auth/google/callback`;
  }

  loginWithGitHub() {
    window.location.href = `${environment.server_url}passport/auth/github/callback`;
  }
}
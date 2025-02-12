import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LayoutService } from 'src/app/core/services/layout.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  
  emailPattern: string = "^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$"; // Fixed regex
  loginForm!: FormGroup;
  submitted: boolean = false;

  constructor(
    private router: Router,
    public layoutService: LayoutService,
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.pattern(this.emailPattern)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    this.submitted = true;
    // Stop if the form is invalid
    if (this.loginForm.invalid) {
      return;
    }
    // Form is valid, proceed with login
    this.onLoggedin();
  }

  onLoggedin() {
    localStorage.setItem('isLoggedin', 'true');
    if (localStorage.getItem('isLoggedin')) {
      const formValue = this.loginForm.value;
      console.log(formValue);
      this.router.navigate(['/main/dashboard']);
    }
  }
}
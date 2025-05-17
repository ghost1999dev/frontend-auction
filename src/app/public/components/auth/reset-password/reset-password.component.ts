import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LayoutService } from 'src/app/core/services/layout.service';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  loading = false;
  email: string = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    public layoutService: LayoutService,
  ) {
    this.resetForm = this.fb.group({
      code: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'];
    });
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get('password')?.value === form.get('confirmPassword')?.value 
      ? null : { mismatch: true };
  }

  onSubmit(): void {
    if (this.resetForm.invalid) {
      return;
    }

    this.loading = true;
    const { code, password } = this.resetForm.value;

    this.userService.resetPassword({ 
      email: this.email, 
      code,
      password 
    }).subscribe({
      next: (response) => {
        this.loading = false;
        this.router.navigate(['/auth/login']);
      },
      error: (error) => {
        this.loading = false;
      }
    });
  }
}
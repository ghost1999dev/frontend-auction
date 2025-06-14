import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LayoutService } from 'src/app/core/services/layout.service';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  forgotForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    public layoutService: LayoutService,
    private router: Router
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.forgotForm.invalid) {
      return;
    }

    this.loading = true;
    const email = this.forgotForm.get('email')?.value;

    this.userService.forgotPassword({ email })
      .subscribe({
        next: (response) => {
          this.loading = false;
          // Navigate to reset password with email as query param
          this.router.navigate(['/auth/reset-password'], { 
            queryParams: { email } 
          });
        },
        error: (error) => {
          this.loading = false;
        }
      });
  }
}
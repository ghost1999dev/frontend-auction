import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { addUser } from 'src/app/core/models/users';
import { LayoutService } from 'src/app/core/services/app.layout.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-activate-account',
  templateUrl: './activate-account.component.html',
  styleUrls: ['./activate-account.component.scss']
})
export class ActivateAccountComponent {
  activateForm: FormGroup;
  submitted = false;
  userData: any; // Para almacenar datos del localStorage

  constructor(
    public layoutService: LayoutService,
    private fb: FormBuilder,
    private router: Router,
    private usersService: UserService,
    private notificationServices: NotificationService 
  ) {
    this.loadUserData();
    
    this.activateForm = this.fb.group({
      code: ['', Validators.required],
    });
  }

  private loadUserData(): void {
    const savedData = localStorage.getItem('developerFormData');
    if (savedData) {
      this.userData = JSON.parse(savedData);
      console.log('Datos cargados desde localStorage:', this.userData);
    } else {
      console.warn('No se encontraron datos de registro en localStorage');
      this.router.navigate(['/auth/register']);
    }
  }

  onSubmit() {
    this.submitted = true;

    if (this.activateForm.invalid || !this.userData) {
      return;
    }

    const userToCreate: any = {
      role_id: 1, 
      name: this.userData.name,
      email: this.userData.email,
      code: this.activateForm.value.code,
      password: this.userData.password,
      address: this.userData.address,
      phone: this.userData.phone,
      image: '', 
      account_type: 1
    };

    this.usersService.createUsers(userToCreate).subscribe({
      next: (response: any) => {
        localStorage.removeItem('developerFormData');
        this.router.navigate(['/auth/login']);
        this.notificationServices.showSuccessCustom("¡Felicidades! Tu cuenta ha sido verificada exitosamente.")
      },
      error: (err: any) => {
        this.notificationServices.showErrorCustom("Error, al verificar tu cuenta")
      }
    });
  }
}
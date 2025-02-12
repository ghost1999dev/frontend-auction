import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LayoutService } from 'src/app/core/services/layout.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {

  userType: 'developer' | 'company' | null = null; // Tipo de usuario seleccionado
  developerForm!: FormGroup; // Formulario para Developer
  companyForm!: FormGroup;   // Formulario para Company
  submitted: boolean = false; // Indica si el formulario ha sido enviado

  constructor(
    private fb: FormBuilder,
    private router: Router,
    public layoutService: LayoutService
  ) {
    this.initForms();
  }

  // Inicializa los formularios con validaciones
  initForms() {
    // Formulario para Developer
    this.developerForm = this.fb.group({
      devName: ['', Validators.required],
      devEmail: ['', [Validators.required, Validators.email]],
      devPassword: ['', [Validators.required, Validators.minLength(6)]],
      devImage: [null, Validators.required]
    });

    // Formulario para Company
    this.companyForm = this.fb.group({
      companyUserName: ['', Validators.required],
      companyName: ['', Validators.required],
      companyEmail: ['', [Validators.required, Validators.email]],
      companyPassword: ['', [Validators.required, Validators.minLength(6)]],
      companyImage: [null, Validators.required],
      companyLogo: [null, Validators.required]
    });
  }

  // Selecciona el tipo de usuario (Developer o Company)
  selectUserType(userType: 'developer' | 'company') {
    this.userType = userType;
    this.submitted = false; // Reinicia el estado de envío al cambiar el tipo de usuario
  }

  // Maneja la selección de la imagen de perfil para Developer
  onFileSelectProfilePhoto(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.developerForm.get('devImage')?.setValue(file);
    }
  }

  // Maneja la selección de la imagen de perfil para Company
  onFileSelectProfilePhotoCompany(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.companyForm.get('companyImage')?.setValue(file);
    }
  }

  // Maneja la selección del logo de la empresa
  onFileSelectProfilePhotoLogo(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.companyForm.get('companyLogo')?.setValue(file);
    }
  }

  // Envía el formulario de Developer
  onSubmitDeveloper() {
    this.submitted = true;

    // Detiene el proceso si el formulario es inválido
    if (this.developerForm.invalid) {
      return;
    }

    // Formulario válido, procede con el registro
    const formValue = this.developerForm.value;
    console.log('Developer Form Submitted:', formValue);
    // Aquí podrías hacer una solicitud HTTP para registrar al desarrollador
    this.router.navigate(['/auth/login']); // Redirige al login después del registro
  }

  // Envía el formulario de Company
  onSubmitCompany() {
    this.submitted = true;

    // Detiene el proceso si el formulario es inválido
    if (this.companyForm.invalid) {
      return;
    }

    // Formulario válido, procede con el registro
    const formValue = this.companyForm.value;
    console.log('Company Form Submitted:', formValue);
    // Aquí podrías hacer una solicitud HTTP para registrar la empresa
    this.router.navigate(['/auth/login']); // Redirige al login después del registro
  }
}
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LayoutService } from 'src/app/core/services/layout.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {

  userType: 'developer' | 'company' | null = null; 
  developerForm!: FormGroup; 
  companyForm!: FormGroup;   
  submitted: boolean = false; 
  public formData: any = new FormData();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    public layoutService: LayoutService,
    public UserSrv: UserService,
    private notificationServices: NotificationService 
          
  ) {
    this.initForms();
  }

  initForms() {
    this.developerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      image: [''],
      address: ['', Validators.required],
      phone: ['', Validators.required]
    });

    this.companyForm = this.fb.group({
      companyUserName: ['', Validators.required],
      companyName: ['', Validators.required],
      companyEmail: ['', [Validators.required, Validators.email]],
      companyPassword: ['', [Validators.required, Validators.minLength(6)]],
      companyImage: [null, Validators.required],
      companyLogo: [null, Validators.required]
    });
  }

  selectUserType(userType: 'developer' | 'company') {
    this.userType = userType;
    this.submitted = false; 
  }

  onFileSelectProfilePhoto(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.developerForm.get('image')?.setValue(file);
    }
  }

  onFileSelectProfilePhotoCompany(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.companyForm.get('companyImage')?.setValue(file);
    }
  }

  onFileSelectProfilePhotoLogo(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.companyForm.get('companyLogo')?.setValue(file);
    }
  }

  onSubmitDeveloper() {
    this.submitted = true;

    if (this.developerForm.invalid) {
      return;
    }

    const formValue = this.developerForm.value;

    this.formData.append("email", this.developerForm.get('email')!.value);

    var data: any = {
      email: this.developerForm.get('email')!.value
    }

    this.UserSrv.validateEmailUser(data)
      .subscribe((res: any) => {
        if(res.status === 200){
          this.saveDeveloperData(formValue);
          this.router.navigate(['/auth/activate-account']); 
          this.notificationServices.showSuccessCustom("Felicidades, cuenta creado exitosamente")
        }else{
          this.notificationServices.showErrorCustom("Error, al crear el usuario");
        }
      })


  }

  onSubmitCompany() {
    this.submitted = true;

    if (this.companyForm.invalid) {
      return;
    }

    const formValue = this.companyForm.value;
    this.router.navigate(['/auth/login']);
  }

    private saveDeveloperData(formData: any): void {
      try {
        localStorage.setItem('developerFormData', JSON.stringify(formData));
      } catch (error) {
        console.error('Error al guardar en localStorage:', error);
      }
    }

}
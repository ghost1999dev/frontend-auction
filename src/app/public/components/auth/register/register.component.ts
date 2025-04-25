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

  emailPattern = "^[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,4}$";
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
      phone: ['', Validators.required],
      bio: [''],
      linkedin: [''],
      occupation: [''],
      portfolio: [''],
      role_id: [2]
    });

    this.companyForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      image: [''],
      address: ['', Validators.required],
      phone: ['', Validators.required],
      nrc_number: ['', Validators.required],
      business_type: ['', Validators.required],
      web_site: ['', Validators.required],
      nit_number: ['', Validators.required],
      role_id: [1]
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

    var data: any = {
      email: this.developerForm.get('email')!.value
    }

    this.UserSrv.validateEmailUser(data)
      .subscribe((res: any) => {
        if(res.status === 200){
          this.saveData(formValue);
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


    var data: any = {
      email: this.companyForm.get('email')!.value
    }

    this.UserSrv.validateEmailUser(data)
      .subscribe((res: any) => {
        if(res.status === 200){
          this.saveDataCompanies(formValue);
          this.router.navigate(['/auth/activate-account']); 
          this.notificationServices.showSuccessCustom("Felicidades, cuenta creado exitosamente")
        }else{
          this.notificationServices.showErrorCustom("Error, al crear la company");
        }
      })
  }

    private saveData(formData: any): void {
      try {
        localStorage.setItem('FormData', JSON.stringify(formData));
      } catch (error) {
        console.error('Error al guardar en localStorage:', error);
      }
    }
    private saveDataCompanies(formData: any): void {
      try {
        localStorage.setItem('FormDataCompanies', JSON.stringify(formData));
      } catch (error) {
        console.error('Error al guardar en localStorage:', error);
      }
    }

}
import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, of, delay, map } from 'rxjs';
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
      phone: ['', [Validators.required, Validators.pattern(/^\+\(503\) \d{4}-\d{4}$/)]],
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
      phone: ['', [Validators.required, Validators.pattern(/^\+\(503\) \d{4}-\d{4}$/)]],
      nrc_number: ['', {
        validators: [Validators.required, Validators.pattern(/^\d{6}-\d$/)],
        asyncValidators: [this.nrcValidator.bind(this)],
        updateOn: 'blur' // Opcional: para que no valide con cada tecla presionada
      }],   
      business_type: ['', Validators.required],
      web_site: ['', Validators.required],
      nit_number: ['', [
        Validators.required,
      ]], 
      role_id: [1]
    });
  }

  selectUserType(userType: 'developer' | 'company') {
    this.userType = userType;
    this.submitted = false; 
  }

  nrcValidator(control: AbstractControl): Observable<ValidationErrors | null> {
    return of(control.value).pipe(
      delay(500), // Simula llamada a API
      map(value => {
        return value && value.match(/^\d{6}-\d$/) ? null : { invalidNrc: true };
      })
    );
  }

  formatNitNumber(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/[^0-9]/g, '');
  
    // Permitir borrado completo
    if (value.length === 0) {
      this.companyForm.get('nit_number')?.setValue('');
      return;
    }
  
    let formattedValue = '';
  
    if (value.length <= 9) {
      // DUI: 00000000-0
      formattedValue = value.substring(0, 8);
      if (value.length > 8) {
        formattedValue += '-' + value.substring(8, 9);
      }
    } else {
      // NIT: 0000-000000-000-00
      const a = value.substring(0, 4);   // 4 dígitos
      const b = value.substring(4, 10);  // 6 dígitos
      const c = value.substring(10, 13); // 3 dígitos
      const d = value.substring(13, 15); // 2 dígitos
  
      formattedValue = a;
      if (b) formattedValue += '-' + b;
      if (c) formattedValue += '-' + c;
      if (d) formattedValue += '-' + d;
    }
  
    // Actualizar en form y DOM
    this.companyForm.get('nit_number')?.setValue(formattedValue, { emitEvent: false });
    input.value = formattedValue;
  
    // Posicionar cursor al final
    requestAnimationFrame(() => {
      const len = input.value.length;
      input.setSelectionRange(len, len);
    });
  }
    
  formatPhone(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    
    // Permitir borrado completo
    if (value.length === 0) {
      this.developerForm.get('phone')?.setValue('', { emitEvent: false });
      return;
    }
    
    // Asegurar que el código de país sea 503
    const countryCode = '503';
    let mainNumber = value;
    
    // Si el valor comienza con 503, lo usamos
    if (value.startsWith('503')) {
      mainNumber = value.substring(3);
    }
    // Si no, asumimos que es parte del número principal
    
    let formattedValue = `+(${countryCode})`;
    
    if (mainNumber.length > 0) {
      formattedValue += ` ${mainNumber.substring(0, 4)}`;
      if (mainNumber.length > 4) {
        formattedValue += `-${mainNumber.substring(4, 8)}`;
      }
    }

    this.developerForm.get('phone')?.setValue(formattedValue, { emitEvent: false });
    
    // Manejo básico del cursor
    setTimeout(() => {
      const newCursorPosition = formattedValue.length;
      input.setSelectionRange(newCursorPosition, newCursorPosition);
    });
  }

  formatPhoneCompany(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    
    // Permitir borrado completo
    if (value.length === 0) {
      this.companyForm.get('phone')?.setValue('', { emitEvent: false });
      return;
    }
    
    // Asegurar que el código de país sea 503
    const countryCode = '503';
    let mainNumber = value;
    
    // Si el valor comienza con 503, lo usamos
    if (value.startsWith('503')) {
      mainNumber = value.substring(3);
    }
    // Si no, asumimos que es parte del número principal
    
    let formattedValue = `+(${countryCode})`;
    
    if (mainNumber.length > 0) {
      formattedValue += ` ${mainNumber.substring(0, 4)}`;
      if (mainNumber.length > 4) {
        formattedValue += `-${mainNumber.substring(4, 8)}`;
      }
    }

    this.companyForm.get('phone')?.setValue(formattedValue, { emitEvent: false });
    
    // Manejo básico del cursor
    setTimeout(() => {
      const newCursorPosition = formattedValue.length;
      input.setSelectionRange(newCursorPosition, newCursorPosition);
    });
  }

  formatNrcNumber(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    
    // Permitir borrado completo
    if (value.length === 0) {
      this.companyForm.get('nrc_number')?.setValue('');
      return;
    }
    
    // Aplicar formato
    let formattedValue = value.substring(0, 6);
    if (value.length > 6) {
      formattedValue += '-' + value.substring(6, 7);
    }
    this.companyForm.get('nrc_number')?.setValue(formattedValue);
    
    // Manejar posición del cursor
    setTimeout(() => {
      const newCursorPosition = formattedValue.length;
      input.setSelectionRange(newCursorPosition, newCursorPosition);
    });
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
          this.notificationServices.showSuccessCustom("Congratulations, account created successfully")
        }else{
          this.notificationServices.showErrorCustom("Error creating user");
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
          this.notificationServices.showSuccessCustom("Congratulations, account created successfully")
        }else{
          this.notificationServices.showErrorCustom("Error when creating the company");
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

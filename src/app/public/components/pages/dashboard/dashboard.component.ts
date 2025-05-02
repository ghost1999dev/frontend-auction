import { Component, OnInit, OnDestroy } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MenuItem, MessageService } from 'primeng/api';
import { delay, forkJoin, map, Observable, of, Subscription } from 'rxjs';
import { AuthService } from 'src/app/core/auth/auth.service';
import { Product } from 'src/app/core/models/product';
import { LayoutService } from 'src/app/core/services/app.layout.service';
import { CompaniesService } from 'src/app/core/services/companies.service';
import { DeveloperService } from 'src/app/core/services/developer.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { ProductService } from 'src/app/core/services/product.service';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  providers: [MessageService]
})
export class DashboardComponent implements OnInit, OnDestroy {

  items!: MenuItem[];

  products!: Product[];

  chartData: any;

  chartOptions: any;

  public user: any;

  subscription!: Subscription;

  displayAlert = false; // Control para mostrar el diálogo

  userType: 'developer' | 'company' | null = null;
  developerForm!: FormGroup;
  companyForm!: FormGroup;
  submitted = false
  clicked = false
  businessTypeTags: string[] = [];

  constructor(
    public layoutService: LayoutService,
    public developerService: DeveloperService,
    public companyService: CompaniesService,
    public userRoleService: UserService,
		private router: Router,
    private fb: FormBuilder,
    private authSvc: AuthService,
    private usersService: UserService,
    private developerSrv: DeveloperService,
    private notificationServices: NotificationService,
    private companiesServices: CompaniesService,
    private messageService: MessageService) {
      this.subscription = this.layoutService.configUpdate$.subscribe(() => {
          this.initChart();
      });

      this.developerForm = this.fb.group({
        password: ['', [Validators.required, Validators.minLength(6)]],
        address: ['', Validators.required],
        phone: ['', [Validators.required, Validators.pattern(/^\+\(503\) \d{4}-\d{4}$/)]],
        bio: [''],
        linkedin: [''],
        occupation: [''],
        portfolio: ['']
      });

      this.companyForm = this.fb.group({
        password: ['', [Validators.required, Validators.minLength(6)]],
        image: [''],
        address: ['', Validators.required],
        phone: ['', [Validators.required, Validators.pattern(/^\+\(503\) \d{4}-\d{4}$/)]],
        business_type: ['', Validators.required],
        nrc_number: ['', {
          validators: [Validators.required, Validators.pattern(/^\d{6}-\d$/)],
          asyncValidators: [this.nrcValidator.bind(this)],
          updateOn: 'blur' // Opcional: para que no valide con cada tecla presionada
        }],           
        web_site: ['', Validators.required],
        nit_number: ['', [
          Validators.required,
        ]],       
      });
  } 

  ngOnInit() {
    this.initChart();
    //this.productService.getProductsSmall().then(data => this.products = data);
    this.validateUserRole(); // Nueva función para validar developers
    this.getUserById(this.id)
    this.items = [
      { label: 'Add New', icon: 'pi pi-fw pi-plus' },
      { label: 'Remove', icon: 'pi pi-fw pi-minus' }
    ];
  }

  public getUserById(id: any){
    this.usersService.getUsersById(id)
    .subscribe((next: any) => {
      if(next){
        this.user = next;
      }
    })
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
    this.companyForm.get('nit_number')?.setValue(formattedValue);
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
      this.developerForm.get('phone')?.setValue('');
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
    
    this.developerForm.get('phone')?.setValue(formattedValue);
    
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
      this.companyForm.get('phone')?.setValue('');
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
    
    this.companyForm.get('phone')?.setValue(formattedValue);
    
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

  onBusinessTypeAdd(event: any) {
      // Validar el input antes de agregar
      const value = event.value;
      if (value && /^[a-zA-ZÑñ\s,]+$/.test(value)) {
          // Actualizar el formControl
          this.companyForm.get('business_type')?.setValue(value);
      } else {
          // Mostrar error o revertir
          this.businessTypeTags = this.businessTypeTags.filter(tag => tag !== value);
      }
  }

  onBusinessTypeRemove(event: any) {
      this.companyForm.get('business_type')?.setValue(this.businessTypeTags);
  }

  validateUserRole() {
    this.displayAlert = false;
    const userId = this.getUserInfo();
    
    if (!userId) {
      this.showError('No se pudo identificar al usuario');
      this.displayAlert = false;
      return;
    }

    this.userRoleService.checkUserRoles(userId).subscribe({
      next: ({ hasRole }) => {
        if (!hasRole) {
          this.displayAlert = true;
          this.showWarning('Complete su registro para acceder a todas las funciones');
        }
      },
      error: (err) => {
        this.showError('Error al verificar tus permisos');
        console.error('Error:', err);
      }
    });
  }

  selectUserType(type: 'developer' | 'company') {
    this.userType = type;
    this.submitted = false;
  }

  private showWarning(message: string) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Advertencia',
      detail: message
    });
  }

  private showError(message: string) {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: message
    });
  }

  onSubmitDeveloper() {
    this.submitted = true;
    const password = this.developerForm.get('password')?.value;
    const address = this.developerForm.get('address')?.value;
    const phone = this.developerForm.get('phone')?.value;
    const bio = this.developerForm.get('bio')?.value;
    const linkedin = this.developerForm.get('linkedin')?.value;
    const occupation = this.developerForm.get('occupation')?.value;
    const portfolio = this.developerForm.get('portfolio')?.value;

    const userToCreate: any = {
      role_id: 2, 
      password: password,
      address: address,
      phone: phone,
    };

    this.usersService.updatedUsersPassport(userToCreate, this.id)
    .subscribe({
      next: (response: any) => {

        const developerAdd: any = {
          bio: bio, 
          user_id: this.id, 
          linkedin: linkedin, 
          occupation: occupation, 
          portfolio: portfolio
        }

        this.developerSrv.createDeveloper(developerAdd)
        .subscribe((next: any) => {
          if(next){
            this.displayAlert = false;
            this.notificationServices.showSuccessCustom("Congratulations! Your account has been successfully updated.")
          }else{
            this.notificationServices.showErrorCustom("Error Creating Developer.")
          }
        })
      },
      error: (err: any) => {
        //this.notificationServices.showErrorCustom("Error verifying your account")
      }
    });
  
  }

  onSubmitCompany() {
    this.submitted = true;
    const password = this.companyForm.get('password')?.value;
    const address = this.companyForm.get('address')?.value;
    const phone = this.companyForm.get('phone')?.value;
    const business_type = this.companyForm.get('business_type')?.value;
    const nrc_number = this.companyForm.get('nrc_number')?.value;
    const web_site = this.companyForm.get('web_site')?.value;
    const nit_number = this.companyForm.get('nit_number')?.value;

    const userToCreate: any = {
      role_id: 1, 
      password: password,
      address: address,
      phone: phone,
    };

    this.usersService.updatedUsersPassport(userToCreate, this.id)
    .subscribe({
      next: (response: any) => {

        const adminAdd: any = {
          user_id: this.id, 
          nrc_number: nrc_number, 
          business_type: business_type,
          web_site: web_site, 
          nit_number: nit_number
        }

        this.companiesServices.createCompanies(adminAdd)
        .subscribe((next: any) => {
          if(next){
            this.displayAlert = false;
            this.notificationServices.showSuccessCustom("Congratulations! Your account has been successfully updated.")
          }else{
            //this.notificationServices.showErrorCustom("Error Creating Developer.")
          }
        })
      },
      error: (err: any) => {
        //this.notificationServices.showErrorCustom("Error verifying your account")
      }
    });

  }

    goBack() {
        if (this.userType) {
            // Si ya seleccionó un tipo de usuario, volver a la selección
            this.userType = null;
        } else {
            // Si no hay tipo de usuario seleccionado, cerrar el diálogo
            this.displayAlert = false;
            this.authSvc.logout();
        }
    }

    register() {
        if (this.userType === 'developer') {
          if(this.developerForm.valid){
            this.clicked = true
            this.onSubmitDeveloper();
          }
        } else if (this.userType === 'company') {
          if(this.companyForm.valid){
            this.clicked = true
            this.onSubmitCompany();
          }
        } else {
            this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'Por favor seleccione un tipo de usuario'
            });
        }
    }

  initChart() {
      const documentStyle = getComputedStyle(document.documentElement);
      const textColor = documentStyle.getPropertyValue('--text-color');
      const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
      const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

      this.chartData = {
          labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
          datasets: [
              {
                  label: 'First Dataset',
                  data: [65, 59, 80, 81, 56, 55, 40],
                  fill: false,
                  backgroundColor: documentStyle.getPropertyValue('--bluegray-700'),
                  borderColor: documentStyle.getPropertyValue('--bluegray-700'),
                  tension: .4
              },
              {
                  label: 'Second Dataset',
                  data: [28, 48, 40, 19, 86, 27, 90],
                  fill: false,
                  backgroundColor: documentStyle.getPropertyValue('--green-600'),
                  borderColor: documentStyle.getPropertyValue('--green-600'),
                  tension: .4
              }
          ]
      };

      this.chartOptions = {
          plugins: {
              legend: {
                  labels: {
                      color: textColor
                  }
              }
          },
          scales: {
              x: {
                  ticks: {
                      color: textColorSecondary
                  },
                  grid: {
                      color: surfaceBorder,
                      drawBorder: false
                  }
              },
              y: {
                  ticks: {
                      color: textColorSecondary
                  },
                  grid: {
                      color: surfaceBorder,
                      drawBorder: false
                  }
              }
          }
      };
  }

  ngOnDestroy() {
      if (this.subscription) {
          this.subscription.unsubscribe();
      }
  }

  getUserInfo() {
    const token = this.getTokens();
    let payload;
    if (token) {
      payload = token.split(".")[1];
      payload = window.atob(payload);
      return JSON.parse(payload)['id'];
    } else {
      return null;
    }
  }
  
  getTokens() {
    return localStorage.getItem("login-token");
  }

  id: any = this.getUserInfo();

}

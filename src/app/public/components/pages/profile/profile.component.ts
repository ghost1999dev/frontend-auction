import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable, of, delay, map } from 'rxjs';
import { AuthService } from 'src/app/core/auth/auth.service';
import { CompanyWithRelations } from 'src/app/core/models/companies';
import { DeveloperWithRelations, UpdateDeveloper } from 'src/app/core/models/developer';
import { updatePasswordUser, updatePasswordUserResponse, updateUser, usersWithImage } from 'src/app/core/models/users';
import { CompaniesService } from 'src/app/core/services/companies.service';
import { DeveloperService } from 'src/app/core/services/developer.service';
import { ImageUploadService } from 'src/app/core/services/image-upload.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  public loading: boolean = false;
  public developer: any;
  public company: any;
  public user: any;

  showImageUploadDialog: boolean = false;
  imagePreview: string | null = null;
  selectedImageFile: File | null = null;
  uploadingImage: boolean = false;

  roleNames: { [key: number]: string } = {
    1: 'Company',
    2: 'Developer'
  };

  accountSources: { [key: number]: string } = {
    1: 'Imagen directa',
    2: 'GitHub',
    3: 'Google'
  };

  passwordDialog: boolean = false;
  userDialog: boolean = false;
  submitted: boolean = false;
  currentUserId: any;
  confirmPassword: string = '';

  userUpdate: updateUser = {
    name: '',
    address: '',
    phone: ''
  };

  passwordData: updatePasswordUser = {
    currentPassword: '',
    Newpassword: ''
  };

  developerData: UpdateDeveloper = {
    bio: '',
    linkedin: '',
    occupation: '',
    portfolio: ''
  };

  companyUpdate = {
    nrc_number: '',
    business_type: '',
    web_site: '',
    nit_number: ''
  };

  constructor(
    private notificationServices: NotificationService,
    private authService: AuthService,
    private companiesService: CompaniesService,
    private userService: UserService,
    private developerService: DeveloperService,
    private sanitizer: DomSanitizer,
    private imageUploadService: ImageUploadService,

  ){

  }

  ngOnInit() {
    this.getUserById(this.id)
  }

    nrcValidator(control: AbstractControl): Observable<ValidationErrors | null> {
      return of(control.value).pipe(
        delay(500), // Simula llamada a API
        map(value => {
          return value && value.match(/^\d{6}-\d$/) ? null : { invalidNrc: true };
        })
      );
    }
  
    onKeyDown(event: KeyboardEvent) {
      // Permitir teclas de control (backspace, delete, flechas, etc.)
      if (event.ctrlKey || event.altKey || 
          [8, 9, 13, 16, 17, 18, 20, 27, 35, 36, 37, 38, 39, 40, 45, 46, 91, 93].includes(event.keyCode)) {
        return;
      }
      
      // Permitir solo números
      if (event.keyCode < 48 || event.keyCode > 57) {
        if (event.keyCode < 96 || event.keyCode > 105) {
          event.preventDefault();
        }
      }
    }
    
    formatNitNumber(event: Event) {
      const input = event.target as HTMLInputElement;
      let value = input.value.replace(/[^0-9]/g, '');
    
      // Permitir borrado completo
      if (value.length === 0) {
        this.companyUpdate.nit_number = '';
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
      this.companyUpdate.nit_number = formattedValue;
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
        this.userUpdate.phone = '';
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

      this.userUpdate.phone = formattedValue;
      
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
        this.companyUpdate.nrc_number = "";
        return;
      }
      
      // Aplicar formato
      let formattedValue = value.substring(0, 6);
      if (value.length > 6) {
        formattedValue += '-' + value.substring(6, 7);
      }
      
      this.companyUpdate.nrc_number = formattedValue ;
      
      // Manejar posición del cursor
      setTimeout(() => {
        const newCursorPosition = formattedValue.length;
        input.setSelectionRange(newCursorPosition, newCursorPosition);
      });
    }

  loadCompany(userId: number): void {
    this.loading = true;
    this.companiesService.getCompanyByUserId(userId)
    .subscribe({
      next: (data: any) => {
        this.company = data;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading company:', error);
        this.loading = false;
      }
    });
  }

  showDialogPassword(): void {
    this.currentUserId = this.id;
    this.passwordDialog = true;
    this.resetForm();
  }

  showDialog(): void {
    this.currentUserId = this.id;
    this.loading = true;
    this.userDialog = true;
    
      if(this.user.id === this.id){
        this.loading = false;
        this.userUpdate = {
          name: this.user.name || '',
          address: this.user.address || '',
          phone: this.user.phone || ''
        };
      }if(this.developer?.user_id === this.id){
        this.loading = false;
        this.developerData = {
          bio: this.developer.bio || '',
          linkedin: this.developer.linkedin || '',
          occupation: this.developer.occupation || '',
          portfolio: this.developer.portfolio || ''
        };
      }if(this.company?.user_id === this.id){
        this.companyUpdate = {
          nrc_number: this.company.nrc_number || '',
          business_type: this.company.business_type || '',
          web_site: this.company.web_site || '',
          nit_number: this.company.nit_number || ''
        };
      }
  }

  

  hideDialog(): void {
    this.userDialog = false;
    this.passwordDialog = false;
    this.submitted = false;
    this.resetForm();
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validar tipo de archivo
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        this.notificationServices.showErrorCustom('Only JPEG, PNG or GIF images are allowed.')
        return;
      }

      // Validar tamaño (ejemplo: máximo 2MB)
      if (file.size > 2 * 1024 * 1024) {
        this.notificationServices.showErrorCustom('The image cannot exceed 2MB')
        return;
      }

      this.selectedImageFile = file;
      
      // Crear vista previa
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
        this.showImageUploadDialog = true;
      };
      reader.readAsDataURL(file);
    }
  }

  cancelImageUpload(): void {
    this.showImageUploadDialog = false;
    this.imagePreview = null;
    this.selectedImageFile = null;
    // Resetear el input de archivo
    const fileInput = document.getElementById('avatarUpload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  uploadImage(): void {
    if (!this.selectedImageFile || !this.user?.id) {
      this.cancelImageUpload();
      return;
    }

    this.uploadingImage = true;
    
    this.imageUploadService.uploadUserImage(this.user.id, this.selectedImageFile).subscribe({
      next: (response: any) => {
        this.notificationServices.showSuccessCustom('Profile picture updated successfully')

        // Actualizar la imagen del usuario localmente
        if (this.user) {
          this.user.image = response.imagePath;
        }
        
        this.cancelImageUpload();
      },
      error: (error) => {
        console.error('Error uploading image:', error);
        this.notificationServices.showErrorCustom('The image could not be uploaded. Please try again.')
      },
      complete: () => {
        this.uploadingImage = false;
      }
    });
  }

  resetForm(): void {
    this.passwordData = { currentPassword: '', Newpassword: '' };
    this.confirmPassword = '';
    this.submitted = false;
    this.loading = false;
  }

  public getUserById(id: any){
    this.userService.getUsersById(id)
    .subscribe((next: any) => {
      if(next){
        this.user = next;
        this.userUpdate = {
          name: next.name || '',
          address: next.address || '',
          phone: next.phone || ''
        };

        if(next.role_id === 1){
          this.loadCompany(next.id)
        }else if(next.role_id === 2){
          this.loadDeveloper(next.id)
        }
      }else{
        
      }
    })
  }

  loadDeveloper(id: number): void {
    this.loading = true;
    this.developerService.getDeveloperByIdUser(id)
    .subscribe({
      next: (data) => {
        this.developer = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading developer:', error);
        this.loading = false;
      }
    });
  }

  updateUser(): void {
    this.submitted = true;
    
    if (this.user) {
      this.userService.updatedUsers(this.userUpdate, this.id)
        .subscribe({
          next: (response) => {
            if(this.user.role_id === 1){
              this.companiesService.updateCompany(Number(this.company.id), this.companyUpdate).subscribe({
                next: () => {
                  this.userDialog = false;
                  this.notificationServices.showSuccessCustom("Congratulations! Your account has been successfully updated.")
                },
                error: (err) => {
                  this.loading = false;
                  this.notificationServices.showErrorCustom("Error! Your account has not been updated.")
                }
              });
            }if(this.user.role_id === 2){
              this.developerService.updateDeveloper(Number(this.developer?.id), this.developerData)
              .subscribe({
                next: (updatedDeveloper) => {
                  this.userDialog = false;
                  this.notificationServices.showSuccessCustom("Congratulations! Your account has been successfully updated.")              
                },
                error: (err) => {
                  this.loading = false;
                  this.notificationServices.showErrorCustom("Error! Your account has not been updated.")
                }
              });
            }
          },
          error: (err) => {
            console.error('Error updating user:', err);
          }
        });
    }
  }

  updatePassword(): void {
    this.submitted = true;
    
    if (this.isFormValid()) {
      this.loading = true;
      
      this.userService.updatedPasswordUsers(this.passwordData, this.currentUserId)
        .subscribe({
          next: (response: any) => {
            this.passwordDialog = false;
            this.authService.logout();
            this.notificationServices.showSuccessCustom("Password updated successfully.")
          },
          error: (err) => {
            console.error('Error updating password:', err);
            this.loading = false;
            this.notificationServices.showErrorCustom("Current Password is incorrect")
          }
        });
    }
  }

  private isFormValid(): boolean {
    const hasCurrentPassword = !!this.passwordData.currentPassword;
    const hasNewPassword = !!this.passwordData.Newpassword;
    const passwordsMatch = this.passwordData.Newpassword === this.confirmPassword;
    
    return hasCurrentPassword && hasNewPassword && passwordsMatch;
  }

  getRoleName(roleId: number): string {
    return this.roleNames[roleId] || `Rol ${roleId}`;
  }

  getAccountSource(accountType: number): string {
    return this.accountSources[accountType] || `Tipo ${accountType}`;
  }

  getStatusSeverity(status: boolean): string {
    return status ? 'success' : 'danger';
  }

  getStatusText(status: boolean): string {
    return status ? 'Activo' : 'Inactivo';
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'Nunca';
    
    const date = new Date(dateString);
    return date.toLocaleString();
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

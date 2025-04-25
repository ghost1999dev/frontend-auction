import { Component, Input, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/auth/auth.service';
import { CompanyWithRelations } from 'src/app/core/models/companies';
import { DeveloperWithRelations, UpdateDeveloper } from 'src/app/core/models/developer';
import { updatePasswordUser, updatePasswordUserResponse, updateUser, usersWithImage } from 'src/app/core/models/users';
import { CompaniesService } from 'src/app/core/services/companies.service';
import { DeveloperService } from 'src/app/core/services/developer.service';
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
    private developerService: DeveloperService

  ){

  }

  ngOnInit() {
    this.getUserById(this.id)
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
          nrc_number: '',
          business_type: this.company.business_type || '',
          web_site: this.company.web_site || '',
          nit_number: ''
        };
      }
  }

  hideDialog(): void {
    this.userDialog = false;
    this.passwordDialog = false;
    this.submitted = false;
    this.resetForm();
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
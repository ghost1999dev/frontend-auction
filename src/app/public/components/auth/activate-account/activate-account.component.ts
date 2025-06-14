import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { addDeveloper } from 'src/app/core/models/developer';
import { addUser } from 'src/app/core/models/users';
import { LayoutService } from 'src/app/core/services/app.layout.service';
import { CompaniesService } from 'src/app/core/services/companies.service';
import { DeveloperService } from 'src/app/core/services/developer.service';
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
  userDataCompanies: any; 

  constructor(
    public layoutService: LayoutService,
    private fb: FormBuilder,
    private router: Router,
    private usersService: UserService,
    private notificationServices: NotificationService,
    private developerSrv: DeveloperService,
    private companiesSrv: CompaniesService
  ) {
    this.loadUserData();
  
    this.activateForm = this.fb.group({
      code: ['', Validators.required],
    });
  }

  private loadUserData(): void {
    const savedData = localStorage.getItem('FormData');
    const savedDataCompanies = localStorage.getItem('FormDataCompanies');

    if (savedData) {
      this.userData = JSON.parse(savedData);
    }else if (savedDataCompanies) {
      this.userDataCompanies = JSON.parse(savedDataCompanies);
    }else {
      this.router.navigate(['/auth/register']);
    }
  }

  onSubmit() {
    this.submitted = true;

    if (this.activateForm.invalid) {
      return;
    }
    const savedData = localStorage.getItem('FormData');
    const savedDataCompanies = localStorage.getItem('FormDataCompanies');

    if(savedData){
      const userToCreate: any = {
        role_id: this.userData.role_id, 
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
  
          const developerAdd: addDeveloper = {
            bio: this.userData.bio, 
            user_id: response.id, 
            linkedin: this.userData.linkedin, 
            occupation: this.userData.occupation, 
            portfolio: this.userData.portfolio
          }
  
          this.developerSrv.createDeveloper(developerAdd)
          .subscribe((next: any) => {
            if(next){
              next.status = false

              localStorage.removeItem('FormData');
              this.router.navigate(['/auth/login']);
              this.notificationServices.showSuccessCustom(next.message)
            }
          })
        }
      });
    }else if(savedDataCompanies){
      const userToCreate: any = {
        role_id: this.userDataCompanies.role_id, 
        name: this.userDataCompanies.name,
        email: this.userDataCompanies.email,
        code: this.activateForm.value.code,
        password: this.userDataCompanies.password,
        address: this.userDataCompanies.address,
        phone: this.userDataCompanies.phone,
        image: '', 
        account_type: 1
      };
  
      this.usersService.createUsers(userToCreate).subscribe({
        next: (response: any) => {
  
          const companyAdd: any = {
            user_id: response.id,
            nrc_number: this.userDataCompanies. nrc_number, 
            business_type: this.userDataCompanies.business_type, 
            web_site: this.userDataCompanies.web_site,
            nit_number: this.userDataCompanies.nit_number
          }
  
          this.companiesSrv.createCompanies(companyAdd)
          .subscribe((next: any) => {
            if(next){
              localStorage.removeItem('FormDataCompanies');
              this.router.navigate(['/auth/login']);
              this.notificationServices.showSuccessCustom('¡Felicitaciones! Su cuenta de empresa ha sido verificada exitosamente.')
            }
          })
        }
      });
    }
    
  }
}
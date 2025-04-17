import { Component, Input, OnInit } from '@angular/core';
import { usersWithImage } from 'src/app/core/models/users';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  public user: any;
  public loading: boolean = false;

  roleNames: { [key: number]: string } = {
    1: 'Company',
    2: 'Developer'
  };

  accountSources: { [key: number]: string } = {
    1: 'Imagen directa',
    2: 'GitHub',
    3: 'Google'
  };

  constructor(
    private userService: UserService
  ){

  }

  ngOnInit() {
    this.getUserById(this.id)
  }

  public getUserById(id: any){
    this.userService.getUsersById(id)
    .subscribe((next: any) => {
      if(next){
        this.user = next
      }else{
        
      }
    })
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
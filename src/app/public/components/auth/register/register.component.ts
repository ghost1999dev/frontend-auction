import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { LayoutService } from 'src/app/core/services/layout.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {

  valCheck: string[] = ['remember'];
  userType: string = ''; // Valor por defecto
  password!: string;

  CreateFormDev: any = FormGroup;
  CreateFormCompany: any = FormGroup;

  constructor(public layoutService: LayoutService) { }

  selectUserType(type: string) {
    this.userType = type;
  }

  public onFileSelectProfilePhoto(event: any) {
    if (event.target.files && event.target.files[0]) {
      for (let i = 0; i < event.target.files.length; i++) {
        var reader = new FileReader();
        reader.onload = (event: any) => {};
        reader.readAsDataURL(event.target.files[0]);
      }
    }
  }
  
  public onFileSelectProfilePhotoLogo(event: any) {
    if (event.target.files && event.target.files[0]) {
      for (let i = 0; i < event.target.files.length; i++) {
        var reader = new FileReader();
        reader.onload = (event: any) => {};
        reader.readAsDataURL(event.target.files[0]);
      }
    }
  }

  public onFileSelectProfilePhotoCompany(event: any) {
    if (event.target.files && event.target.files[0]) {
      for (let i = 0; i < event.target.files.length; i++) {
        var reader = new FileReader();
        reader.onload = (event: any) => {};
        reader.readAsDataURL(event.target.files[0]);
      }
    }
  }
}

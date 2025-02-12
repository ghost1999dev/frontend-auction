import { Component, OnInit } from '@angular/core';
import { LayoutService } from 'src/app/core/services/app.layout.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent {
  
  valCheck: string[] = ['remember'];

  password!: string;

  constructor(public layoutService: LayoutService) { }

}

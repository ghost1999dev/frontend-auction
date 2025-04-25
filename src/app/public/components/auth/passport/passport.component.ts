import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from 'src/app/core/services/notification.service';

@Component({
  selector: 'app-passport',
  templateUrl: './passport.component.html',
  styleUrls: ['./passport.component.scss']
})
export class PassportComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      
      if (token) {
        this.handleToken(token);
      } else {
        this.router.navigate(['/auth/login']);
      }
    });
  }

  private handleToken(token: string): void {
    this.saveToken(token);
    this.onLoggedin();
    this.router.navigate(['/main/dashboard']);
        this.notificationService.showSuccessCustom('Welcome to CodeBind');
  }

  private saveToken(token: string): void {
    localStorage.setItem('login-token', token);
  }

  private onLoggedin(): void {
    localStorage.setItem('isLoggedin', 'true');
  }
}
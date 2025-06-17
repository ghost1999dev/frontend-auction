import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { usersWithImage } from 'src/app/core/models/users';
import { LayoutService } from 'src/app/core/services/layout.service';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {

  users: usersWithImage[] = [];
  subscription!: Subscription;

  constructor(
    private userSrv: UserService,
    public layoutService: LayoutService
  ) { }

  ngOnInit(): void {
    this.getAllUsers()
  }

  public getAllUsers(){
    this.userSrv.getUsers().subscribe({
      next: (data) => this.users = data,
      error: (err) => {
        console.error('Error loading products:', err);
      }
    });
  }

}

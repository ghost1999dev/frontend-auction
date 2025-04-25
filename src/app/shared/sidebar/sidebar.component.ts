import { Component, ElementRef, OnInit } from '@angular/core';
import { LayoutService } from 'src/app/core/services/app.layout.service';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  model: any[] = [];
  public user: any;

  constructor(
    public layoutService: LayoutService, 
    public el: ElementRef,     
    private userService: UserService,
  ) { }

  ngOnInit() {
    this.getUserById(this.id)
  }

  private initializeMenuBasedOnRole() {
    if (this.user?.role_id === 1) { // Company - mostrar todo
      this.model = [
        {
          label: 'Home',
          items: [
            { label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/main/dashboard'] }
          ]
        },
        {
          label: 'Menu',
          items: [
            //{ label: 'Auctions', icon: 'pi pi-fw pi-id-card', routerLink: ['/main/auctions'] },
            { label: 'Projects', icon: 'pi pi-fw pi-check-square', routerLink: ['/main/projects'] },
            //{ label: 'Favorites', icon: 'pi pi-fw pi-bookmark', routerLink: ['/main/favorites'] },
            //{ label: 'Users', icon: 'pi pi-fw pi-bookmark', routerLink: ['/main/users'] }
          ]
        },
      ];
    } else if (this.user?.role_id === 2) { // Developer - no mostrar nada o menú reducido
      this.model = [
        {
          label: 'Home',
          items: [
            { label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/main/dashboard'] }
          ]
        },
        {
          label: 'Menu',
          items: [
            //{ label: 'Auctions', icon: 'pi pi-fw pi-id-card', routerLink: ['/main/auctions'] },
            { label: 'Projects', icon: 'pi pi-fw pi-check-square', routerLink: ['/main/projects'] },
            //{ label: 'Favorites', icon: 'pi pi-fw pi-bookmark', routerLink: ['/main/favorites'] },
            //{ label: 'Users', icon: 'pi pi-fw pi-bookmark', routerLink: ['/main/users'] }
          ]
        },
      ];
    }
  }

  public getUserById(id: any){
    this.userService.getUsersById(id)
    .subscribe((next: any) => {
      if(next){
        this.user = next;
        this.initializeMenuBasedOnRole();
      }else{
        
      }
    })
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

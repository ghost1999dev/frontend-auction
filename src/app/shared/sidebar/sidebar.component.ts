import { companies } from './../../core/models/companies';
import { Component, ElementRef, OnInit } from '@angular/core';
import { LayoutService } from 'src/app/core/services/app.layout.service';
import { CompaniesService } from 'src/app/core/services/companies.service';
import { ProjectsService } from 'src/app/core/services/projects.service';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  projects: any[] = [];
  model: any[] = [];
  public user: any;
  project_availables: any[] = []

  constructor(
    private projectsService: ProjectsService,
    public layoutService: LayoutService, 
    public el: ElementRef,     
    private userService: UserService,
    private companiesService: CompaniesService,
  ) { }

  ngOnInit() {
    this.getUserById(this.id)
  }

  private initializeMenuBasedOnRoleDev(){
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

  private initializeMenuBasedOnRole(number: number) {
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
            { label: `Projects - ${number}/5`, icon: 'pi pi-fw pi-check-square', routerLink: ['/main/projects'] },
            //{ label: 'Favorites', icon: 'pi pi-fw pi-bookmark', routerLink: ['/main/favorites'] },
            //{ label: 'Users', icon: 'pi pi-fw pi-bookmark', routerLink: ['/main/users'] }
          ]
        },
      ];
  }

  loadProjects(id: any): void {
    this.projectsService.getProjectsByCompany(id)
    .subscribe({
      next: (data) => {
        this.projects = data;
        localStorage.setItem('lenght_projects', `${this.projects.length}`)
      },
      error: (error) => {
      }
    });
  }

  loadCompany(userId: number): void {
    this.companiesService.getCompanyByUserId(userId)
    .subscribe({
      next: (data: any) => {
        this.loadProjects(data.id)
      },
      error: (error: any) => {
        console.error('Error loading company:', error);
      }
    });
  }

    public getUserById(id: any){
    this.userService.getUsersById(id)
    .subscribe((next: any) => {
      if(next){
        this.user = next;
        if(next.role_id === 1){
          this.loadCompany(next.id)
          const length = localStorage.getItem('lenght_projects');
          setTimeout(() => {
            this.initializeMenuBasedOnRole(Number(length))
          }, 100)
        }else if(next.role_id === 2){
          this.initializeMenuBasedOnRoleDev()
        }
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

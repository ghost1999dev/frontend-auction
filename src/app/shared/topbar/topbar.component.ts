import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { LayoutService } from 'src/app/core/services/app.layout.service';
import { AuthService } from 'src/app/core/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss']
})
export class TopbarComponent {

  items!: MenuItem[];

  @ViewChild('menubutton') menuButton!: ElementRef;

  @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;

  @ViewChild('topbarmenu') menu!: ElementRef;

  constructor(public layoutService: LayoutService, public authSvc: AuthService, public router: Router) { }

  onLogout(): void{
    this.authSvc.logout();
  }
  
    get isDarkMode(): boolean {
      return this.layoutService.config.colorScheme === 'dark';
    }
  
    toggleTheme() {
      const newScheme = this.isDarkMode ? 'light' : 'dark';
      localStorage.setItem('themePreference', newScheme);
      this.changeTheme(
        newScheme === 'dark' ? 'bootstrap4-dark-blue' : 'lara-light-indigo',
        newScheme
      );
    }
  
    changeTheme(theme: string, colorScheme: string) {
      const themeLink = <HTMLLinkElement>document.getElementById('theme-css');
      const newHref = themeLink.getAttribute('href')!.replace(this.layoutService.config.theme, theme);
      this.replaceThemeLink(newHref, () => {
        this.layoutService.config.theme = theme;
        this.layoutService.config.colorScheme = colorScheme;
        this.layoutService.onConfigUpdate();
      });
    }
  
    replaceThemeLink(href: string, onComplete: Function) {
      const id = 'theme-css';
      const themeLink = <HTMLLinkElement>document.getElementById('theme-css');
      const cloneLinkElement = <HTMLLinkElement>themeLink.cloneNode(true);
  
      cloneLinkElement.setAttribute('href', href);
      cloneLinkElement.setAttribute('id', id + '-clone');
  
      themeLink.parentNode!.insertBefore(cloneLinkElement, themeLink.nextSibling);
  
      cloneLinkElement.addEventListener('load', () => {
        themeLink.remove();
        cloneLinkElement.setAttribute('id', id);
        onComplete();
      });
    }
  
    navigateTo(route: string) {
      this.router.navigate([route]);
      return false;
    }
  
    getTokens() {
      return localStorage.getItem("login-token");
    }
}

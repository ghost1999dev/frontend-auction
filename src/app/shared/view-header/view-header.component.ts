import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LayoutService } from 'src/app/core/services/layout.service';

@Component({
  selector: 'app-view-header',
  templateUrl: './view-header.component.html',
  styleUrls: ['./view-header.component.scss']
})
export class ViewHeaderComponent implements OnInit {

  constructor(public layoutService: LayoutService, public router: Router) {}

  isDarkMode = false; // Valor por defecto, será sobrescrito en ngOnInit

  ngOnInit() {
    // Al iniciar el componente, leemos el tema guardado en localStorage
    const savedTheme = localStorage.getItem('themePreference');
    if (savedTheme) {
      this.isDarkMode = savedTheme === 'dark';
      this.applyTheme(); // Aplicamos el tema guardado
    }
  }

  applyTheme() {
    if (this.isDarkMode) {
      this.changeTheme('bootstrap4-dark-blue', 'dark');
    } else {
      this.changeTheme('lara-light-indigo', 'light')
    }
  }

  toggleTheme() {
    const newScheme = this.isDarkMode ? 'light' : 'dark';
    localStorage.setItem('themePreference', newScheme);
    this.changeTheme(
      newScheme === 'dark' ? 'bootstrap4-dark-blue' : 'lara-light-indigo',
      newScheme
    );
    window.location.reload()
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
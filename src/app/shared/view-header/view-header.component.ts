import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LayoutService } from 'src/app/core/services/layout.service';

@Component({
  selector: 'app-view-header',
  templateUrl: './view-header.component.html',
  styleUrls: ['./view-header.component.scss']
})
export class ViewHeaderComponent {

  constructor(public layoutService: LayoutService, public router: Router) { }

  isDarkMode = false; // Estado inicial: modo claro

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode; // Cambia entre claro y oscuro
    this.applyTheme();
  }

  changeTheme(theme: string, colorScheme: string) {
    const themeLink = <HTMLLinkElement>document.getElementById('theme-css');
    const newHref = themeLink.getAttribute('href')!.replace(this.layoutService.config.theme, theme);
    this.layoutService.config.colorScheme
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

  applyTheme() {
    if (this.isDarkMode) {
      console.log("Aplica modo Oscuro")
      this.changeTheme('bootstrap4-dark-blue', 'dark');
    } else {
      console.log("Aplica modo claro")
      this.changeTheme('bootstrap4-light-blue', 'light')
    }
  }



}

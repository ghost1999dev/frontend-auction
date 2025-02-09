import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from '../core/core.module';
import { PublicModule } from '../public/public.module';
import { ConfigComponent } from './config/config.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SidebarModule } from 'primeng/sidebar';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ButtonModule } from 'primeng/button';
import { InputSwitchModule } from 'primeng/inputswitch';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations'; // Importar este módulo
import { BrowserModule } from '@angular/platform-browser';
import { TopbarComponent } from './topbar/topbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { FooterComponent } from './footer/footer.component';
import { MenuitemComponent } from './menuitem/menuitem.component';
import { RouterModule } from '@angular/router'; // Import RouterModule

@NgModule({
  declarations: [
    ConfigComponent,
    TopbarComponent,
    SidebarComponent,
    FooterComponent,
    MenuitemComponent
  ],
  imports: [
    CommonModule,
    CoreModule,
    FormsModule,
    ReactiveFormsModule,
    SidebarModule,
    RadioButtonModule,
    ButtonModule,
    RouterModule,
    InputSwitchModule,
  ],
  exports: [
    ConfigComponent,
    TopbarComponent,
    SidebarComponent,
    FooterComponent,
    MenuitemComponent
  ]
})
export class SharedModule { }

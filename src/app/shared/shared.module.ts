import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
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
import { RouterModule } from '@angular/router';
import { ViewHeaderComponent } from './view-header/view-header.component'; // Import RouterModule
import { ChartModule } from 'primeng/chart';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { PanelModule } from 'primeng/panel';
import { StyleClassModule } from 'primeng/styleclass';
import { ViewFooterComponent } from './view-footer/view-footer.component';

@NgModule({
  declarations: [
    ConfigComponent,
    TopbarComponent,
    SidebarComponent,
    FooterComponent,
    MenuitemComponent,
    ViewHeaderComponent,
    ViewFooterComponent
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
    DividerModule,
    StyleClassModule,
    ChartModule,
    PanelModule,
    InputTextModule,
    InputTextareaModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // Add this lin
  exports: [
    ConfigComponent,
    TopbarComponent,
    SidebarComponent,
    FooterComponent,
    MenuitemComponent,
    ViewHeaderComponent,
    ViewFooterComponent
  ]
})
export class SharedModule { }

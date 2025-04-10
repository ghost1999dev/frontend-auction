import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicComponent } from './public.component';
import { SharedModule } from '../shared/shared.module';
import { CoreModule } from '../core/core.module';
import { OutletContext, RouterModule } from '@angular/router';
import { AuthModule } from './components/auth/auth.module';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

@NgModule({
  schemas: [NO_ERRORS_SCHEMA], // <-- Oculta los errores de propiedades desconocidas
  declarations: [
    PublicComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    CommonModule,
    CoreModule,
    SharedModule,
    RouterModule,
    AuthModule
  ],
  providers: [
    OutletContext
  ]
})
export class PublicModule { }

import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicComponent } from './public.component';
import { SharedModule } from '../shared/shared.module';
import { CoreModule } from '../core/core.module';
import { OutletContext, RouterModule } from '@angular/router';
import { AuthModule } from './components/auth/auth.module';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { ViewModule } from './components/view/view.module';
import { PagesModule } from './components/pages/pages.module';
import { ErrorModule } from './components/error/error.module';
import { CompanyModule } from './components/company/company.module';
import { HttpClientModule } from '@angular/common/http';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { PdfViewerModule } from 'ng2-pdf-viewer';

@NgModule({
  schemas: [NO_ERRORS_SCHEMA], // <-- Oculta los errores de propiedades desconocidas
  declarations: [
    PublicComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    CommonModule,
    RouterModule,

    CoreModule,
    SharedModule,
    AuthModule,
    ViewModule,
    PagesModule,
    ErrorModule,
    CompanyModule,

    AngularEditorModule,
    PdfViewerModule,

    HttpClientModule,
  ],
  providers: [
  ]
})
export class PublicModule { }

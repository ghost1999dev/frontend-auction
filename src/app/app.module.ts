import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpInterceptorModule } from './core/services/http-interceptor.module';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { OutletContext, RouterModule } from '@angular/router';
import { CoreModule } from './core/core.module';
import { PublicModule } from './public/public.module';
import { SharedModule } from './shared/shared.module';
import { AuthGuard } from './core/guards/auth.guard';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { CommonModule, HashLocationStrategy, LocationStrategy } from '@angular/common';
import { CountryService } from './core/services/country.service';
import { CustomerService } from './core/services/customer.service';
import { EventService } from './core/services/event.service';
import { IconService } from './core/services/icon.service';
import { NodeService } from './core/services/node.service';
import { PhotoService } from './core/services/photo.service';
import { ProductService } from './core/services/product.service';
import { UserService } from './core/services/user.service';
import { JWT_OPTIONS, JwtHelperService } from '@auth0/angular-jwt';
import { SimplePhoneMaskDirective } from './core/directives/number-mask.directive';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';

@NgModule({
  declarations: [
    SimplePhoneMaskDirective,
    AppComponent,
  ],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    CoreModule,
    PublicModule,
    SharedModule,
    HttpInterceptorModule,
    NgxMaskDirective,
    RouterModule.forRoot([], {
      // Configuración especial para Angular 18
      paramsInheritanceStrategy: 'always',
      enableTracing: false
    })
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
  providers: [
    { provide: JWT_OPTIONS, useValue: JWT_OPTIONS }, 
    JwtHelperService,
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    AuthGuard,

    CountryService, CustomerService, EventService, IconService, NodeService,
        PhotoService, ProductService, UserService,
    provideNgxMask(),
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

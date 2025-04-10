import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { OutletContext } from '@angular/router';
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

@NgModule({
  declarations: [
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
    SharedModule
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
  providers: [
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    AuthGuard,
    OutletContext,

    CountryService, CustomerService, EventService, IconService, NodeService,
        PhotoService, ProductService, UserService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

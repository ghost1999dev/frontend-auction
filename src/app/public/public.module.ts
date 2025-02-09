import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicComponent } from './public.component';
import { SharedModule } from '../shared/shared.module';
import { CoreModule } from '../core/core.module';
import { OutletContext, RouterModule } from '@angular/router';
import { AuthModule } from './components/auth/auth.module';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    PublicComponent,
  ],
  imports: [
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

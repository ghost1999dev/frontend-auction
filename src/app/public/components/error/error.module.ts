import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainErrorComponent } from './main-error/main-error.component';
import { OutletContext, RouterModule, Routes } from '@angular/router';
import { ErrorComponent } from './error.component';

const routes: Routes = [
  {
    path: '',
    component: ErrorComponent,
    children: [
      {
        path: '',
        redirectTo: 'main',
        pathMatch: 'full'
      },
      {
        path: 'main',
        component: MainErrorComponent
      }
    ]
  },
]

@NgModule({
  declarations: [
    ErrorComponent,
    MainErrorComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    RouterModule.forChild(routes)
  ],
   providers: [
  ],
})
export class ErrorModule { }

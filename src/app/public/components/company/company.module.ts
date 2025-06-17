import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { StyleClassModule } from 'primeng/styleclass';
import { DividerModule } from 'primeng/divider';
import { ChartModule } from 'primeng/chart';
import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { CompanyComponent } from './company.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { ContactComponent } from './contact/contact.component';
import { UserGuideComponent } from './user-guide/user-guide.component';
import { DocumentationComponent } from './documentation/documentation.component';

const routes: Routes = [
  {
    path: '',
    component: CompanyComponent,
    children: [
      {
        path: '',
        redirectTo: 'about-us',
        pathMatch: 'full'
      },
      {
        path: 'about-us',
        component: AboutUsComponent,
      },
      {
        path: 'contact',
        component: ContactComponent
      },
      {
        path: 'user-guide',
        component: UserGuideComponent
      },
      {
        path: 'documentation',
        component: DocumentationComponent
      }
    ]
  },
]

@NgModule({
  declarations: [
    CompanyComponent,
    AboutUsComponent,
    ContactComponent,
    UserGuideComponent,
    DocumentationComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule,
    DividerModule,
    StyleClassModule,
    ChartModule,
    PanelModule,
    ButtonModule,
    FormsModule,
    InputTextModule,
    InputTextareaModule,
    RouterModule.forChild(routes)
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA] // Add this line
})
export class CompanyModule { }

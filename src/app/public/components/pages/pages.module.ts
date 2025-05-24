import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { PagesComponent } from './pages.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { OutletContext, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { BrowserModule } from '@angular/platform-browser';
import { TableModule } from 'primeng/table';
import { MenuModule } from 'primeng/menu'; // Import MenuModule
import { ChartModule } from 'primeng/chart'; // Import ChartModule
import { AuctionsComponent } from './auctions/auctions.component';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { InputTextModule } from 'primeng/inputtext';
import { SidebarModule } from 'primeng/sidebar';
import { BadgeModule } from 'primeng/badge';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputSwitchModule } from 'primeng/inputswitch';
import { RippleModule } from 'primeng/ripple';
import { StyleClassModule } from 'primeng/styleclass';
import { PanelMenuModule } from 'primeng/panelmenu';
import { ProjectComponent } from './project/project.component';
import { FavoritesComponent } from './favorites/favorites.component';
import { UsersComponent } from './users/users.component';
import { ButtonModule } from 'primeng/button';
import { ProfileComponent } from './profile/profile.component';
import { AvatarModule } from 'primeng/avatar';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { SkeletonModule } from 'primeng/skeleton';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { PasswordModule } from 'primeng/password';
import { RoleGuard } from 'src/app/core/guards/role.guard';
import { MessageService } from 'primeng/api';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule } from 'primeng/paginator';
import { ToolbarModule } from 'primeng/toolbar';

import { ChipsModule } from 'primeng/chips';

import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { AddEditProjectComponent } from './project/add-edit-project/add-edit-project.component';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { HttpClientModule } from '@angular/common/http';
import { CheckboxModule } from 'primeng/checkbox';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { NumbersOnlyDirective } from 'src/app/core/directives/numbers-only-directive.directive';
import { ProjectsApplicationComponent } from './projects-application/projects-application.component';
import { AddEditProjectsApplicationComponent } from './projects-application/add-edit-projects-application/add-edit-projects-application.component';
import { AddEditAuctionComponent } from './auctions/add-edit-auction/add-edit-auction.component';
import { PublicAuctionViewComponent } from './auctions/public-auction-view/public-auction-view.component';
import { BidsComponent } from './bids/bids.component';
import { AddEditBidComponent } from './bids/add-edit-bid/add-edit-bid.component';

const routes: Routes = [
  {
    path: '',
    component: PagesComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [RoleGuard],
        data: { allowedRoles: [1, 2] } 
      },
      {
        path: 'profile',
        component: ProfileComponent,
        canActivate: [RoleGuard],
        data: { allowedRoles: [1, 2] } 
      },
      {
        path: 'auctions',
        component: AuctionsComponent,
        canActivate: [RoleGuard],
        data: { allowedRoles: [1, 2] } 
      },
      {
        path: 'projects',
        component: ProjectComponent,
        canActivate: [RoleGuard],
        data: { allowedRoles: [1, 2] } 
      },
      {
        path: 'favorites',
        component: FavoritesComponent,
        canActivate: [RoleGuard],
        data: { allowedRoles: [1] } 
      },
      {
        path: 'users',
        component: UsersComponent,
        canActivate: [RoleGuard],
        data: { allowedRoles: [0] } 
      },
      {
        path: 'projects-application',
        component: ProjectsApplicationComponent,
        canActivate: [RoleGuard],
        data: { allowedRoles: [1, 2] } 
      },
      {
        path: 'auctions/public/:id', 
        component: PublicAuctionViewComponent,
        canActivate: [RoleGuard],
        data: { allowedRoles: [1, 2] } 
      },
      {
        path: 'bids', 
        component: BidsComponent,
        canActivate: [RoleGuard],
        data: { allowedRoles: [1, 2] } 
      }
    ]
  },
]

@NgModule({
  schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA], // <-- Oculta los errores de propiedades desconocidas
  declarations: [
    PagesComponent,
    DashboardComponent,
    AuctionsComponent,
    ProjectComponent,
    FavoritesComponent,
    UsersComponent,
    ProfileComponent,
    AddEditProjectComponent,
    NumbersOnlyDirective,
    ProjectsApplicationComponent,
    AddEditProjectsApplicationComponent,
    AddEditAuctionComponent,
    PublicAuctionViewComponent,
    BidsComponent,
    AddEditBidComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule,
    TableModule,
    MenuModule,
    ChartModule,
    CheckboxModule,
    DialogModule,
    ButtonModule,
    PasswordModule,
    ToolbarModule,
    InputTextareaModule,
    ChipsModule,

    DropdownModule,
    PaginatorModule,
    AngularEditorModule,
    PdfViewerModule,

    HttpClientModule,
    
    StyleClassModule,
    PanelMenuModule,

    InputTextModule,
    SidebarModule,
    BadgeModule,
    RadioButtonModule,
    InputSwitchModule,
    RippleModule,
    ReactiveFormsModule,
    NgxMaskDirective,
    NgxMaskPipe,    
    AvatarModule,
    BadgeModule,
    ButtonModule,
    CardModule,
    DividerModule,
    TagModule,
    TooltipModule,
    SkeletonModule,
    FormsModule,
    ProgressSpinnerModule,
    RouterModule.forChild(routes)
  ],
  providers: [
    provideNgxMask(),
    MessageService, // Add this line
  ]
})
export class PagesModule { }

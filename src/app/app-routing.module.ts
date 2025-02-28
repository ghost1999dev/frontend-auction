import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PublicComponent } from './public/public.component';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  {path: '', redirectTo: 'view', pathMatch: 'full'},
  {path: 'view', loadChildren: () => import('./public/components/view/view.module').then(m => m.ViewModule)},
  {path: 'main', loadChildren: () => import('./public/components/pages/pages.module').then(m => m.PagesModule)
    //, canActivate: [AuthGuard]
  },
  { 
    path: 'error',
    loadChildren: () => import('./public/components/error/error.module').then(m => m.ErrorModule),    
    data: {
      'type': 404,
      'title': 'Page Not Found',
      'desc': 'Oopps!! The page you were looking for doesn\'t exist.'
    }
  },
  {path: 'company', loadChildren: () => import('./public/components/company/company.module').then(m => m.CompanyModule)},
  {path: 'auth', loadChildren: () => import('./public/components/auth/auth.module').then(m => m.AuthModule)},
  {path: '**', redirectTo: 'error', pathMatch: 'full' }

];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled', onSameUrlNavigation: 'reload' , useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }

// src/app/core/guards/role.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> {
    
    // Ahora esperamos un array de roles permitidos
    const allowedRoles = next.data['allowedRoles'] as number[];
    const token = this.getToken();
    
    if (!token) {
      this.router.navigate(['/auth/login']);
      return of(false);
    }

    const userId = this.getUserIdFromToken(token);
    return this.userService.getUsersById(userId)
    .pipe(
      map((user: any) => {
        if (user && allowedRoles.includes(user.role_id)) {
          return true;
        } else {
          this.router.navigate(['/error/main']);
          return false;
        }
      }),
      catchError(() => {
        this.router.navigate(['/auth/login']);
        return of(false);
      })
    );
  }

  private getToken(): string | null {
    return localStorage.getItem("login-token");
  }

  private getUserIdFromToken(token: string): number {
    const payload = token.split(".")[1];
    const decodedPayload = window.atob(payload);
    return JSON.parse(decodedPayload)['id'];
  }
}
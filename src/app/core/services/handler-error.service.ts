import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class HandlerErrorService {

  
  constructor(
    private notificationService: NotificationService
  ) { }

  public handlerError(err: any): Observable<never> {
  if (!err) {
    this.notificationService.showErrorCustom('Error desconocido');
    return throwError('Error desconocido');
  }

  let fullErrorMessage = '';

  // Procesar el error (como antes)
  if (err instanceof HttpErrorResponse) {
    if (err.error && typeof err.error === 'object') {
      const apiError = err.error;
      if (apiError.message) fullErrorMessage += apiError.message + '\n';
      if (apiError.errors) {
        apiError.errors.forEach((error: any) => {
          fullErrorMessage += `• Campo ${error.field ? `${error.field}: ` : ''}${error.message}\n`;
        });
      }
    } else {
      fullErrorMessage = err.message || `Error ${err.status}: ${err.statusText}`;
    }
  } else {
    fullErrorMessage = err.message || 'Error en la aplicación';
  }

  // 👇 Ajuste para saltos de línea (elige una opción)
  const formattedMessage = fullErrorMessage.trim()
    .replace(/\n/g, '<br>'); // Para Toastr con enableHtml
    // .replace(/\n/g, '\n');  // Para MatSnackBar

  this.notificationService.showErrorCustom(formattedMessage);
  return throwError(err);
}
}

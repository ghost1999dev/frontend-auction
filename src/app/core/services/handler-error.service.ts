import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HandlerErrorService {

  
  constructor(
  ) { }

  public handlerError(err: { message: any; }): Observable<never> {
    let errorMessage = 'An errror occured retrienving data';
    if (err) {
      errorMessage = `Error: code ${err.message}`;
      if(err.message == "Http failure response for https://aventu-back-end-devs.herokuapp.com/employer/login: 500 OK"){
        console.log('Error, email o contraseña incorrectas');
      }
    }
    return throwError('');
  }


}

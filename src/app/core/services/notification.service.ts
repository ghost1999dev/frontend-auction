import { Injectable } from '@angular/core';
import * as Noty from 'noty';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor() { }

  showErrorCustom(info: any){
    new Noty({
      type: 'error',
      layout: 'topRight',
      text: `${info}`,
      timeout: 3000,
      progressBar: true,
      closeWith: ['click'],
      killer: true,
    }).show();
  }

  showSuccessCustom(info: any){
    new Noty({
      type: 'success',
      layout: 'topRight',
      text: `${info}`,
      timeout: 3000,
      progressBar: true,
      closeWith: ['click'],
      killer: true,
    }).show();
  }


}

import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appSimplePhoneMask]'
})
export class SimplePhoneMaskDirective {
  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event'])
  onInput(event: InputEvent) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, ''); // Remueve todos los no-dígitos
    
    // Aplica el formato +(XXX) XXXX-XXXX
    if (value.length > 0) {
      value = `+(${value.substring(0, 3)}) ${value.substring(3, 7)}-${value.substring(7, 11)}`;
    }
    
    input.value = value;
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    // Permitir teclas de control
    const allowedKeys = [
      'Backspace', 'Tab', 'End', 'Home', 'ArrowLeft', 'ArrowRight', 'Delete'
    ];
    
    if (allowedKeys.includes(event.key)) {
      return;
    }

    // Permitir sólo números y '+'
    if (!/[0-9+]/.test(event.key)) {
      event.preventDefault();
    }
  }
}
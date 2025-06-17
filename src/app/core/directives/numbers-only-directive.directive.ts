import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appNumbersOnly]'
})
export class NumbersOnlyDirective {
  constructor(private el: ElementRef) {}

  @HostListener('keydown', ['$event']) onKeyDown(event: KeyboardEvent) {
    const allowedKeys = [
      8,  // Backspace
      9,  // Tab
      13, // Enter
      37, // Left arrow
      38, // Up arrow
      39, // Right arrow
      40, // Down arrow
      46  // Delete
    ];

    if (allowedKeys.includes(event.keyCode) || 
        (event.keyCode >= 48 && event.keyCode <= 57) || // Números 0-9
        (event.keyCode >= 96 && event.keyCode <= 105)) { // Números en teclado numérico
      return;
    }
    event.preventDefault();
  }
}
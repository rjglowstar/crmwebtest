/**
 * Usage  : This directive is use to allow only english keyboard.
 * Example:
 *    1. <input type="text" [alphaNumericSpecial]="'postal'"> --> like this will allow only enlgish character and number.
 *    2. <input type="text" alphaNumericSpecial>              --> like this will allow english character, number with special character (in-short english keyboard).
 */

import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[alphaNumericSpecial]'
})
export class AlphanumericSpecialDirective {

  @Input('alphaNumericSpecial') option: any;

  constructor(private el: ElementRef) { }

  @HostListener('input', ['$event']) onInputChange(event: any) {
    const initalValue = this.el.nativeElement.value;
    if (this.option == '')
      this.el.nativeElement.value = initalValue.replace(/[^a-zA-Z0-9 !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*/g, '')
    else
      this.el.nativeElement.value = initalValue.replace(/[^a-zA-Z0-9 ]*/g, '')

    if (initalValue !== this.el.nativeElement.value)
      event.stopPropagation();

  }
}

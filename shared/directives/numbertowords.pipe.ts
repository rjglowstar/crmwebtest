import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numberToWords',
})
export class NumberToWordsPipe implements PipeTransform {
  a = [
    '',
    'one ',
    'two ',
    'three ',
    'four ',
    'five ',
    'six ',
    'seven ',
    'eight ',
    'nine ',
    'ten ',
    'eleven ',
    'twelve ',
    'thirteen ',
    'fourteen ',
    'fifteen ',
    'sixteen ',
    'seventeen ',
    'eighteen ',
    'nineteen ',
  ];

  b = [
    '',
    '',
    'twenty',
    'thirty',
    'forty',
    'fifty',
    'sixty',
    'seventy',
    'eighty',
    'ninety',
  ];

  transform(value: any, currency: string = 'rupee'): any {
    if (value) {
      let num: any = Number(value);
      let num2: any = 0;
      if (num) {
        if (num.toString().includes('.')) {
          let amt = num.toString().split('.');
          num = Number(amt[0]);
          num2 = Number(amt[1]);
        }
        if ((num = num.toString()).length > 9) {
          return 'We are not the Iron Bank, you can lower down the stakes :)';
        }
        const n: any = ('000000000' + num)
          .substr(-9)
          .match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
        if (!n) {
          return '';
        }
        let str = '';
        str +=
          Number(n[1]) !== 0
            ? (this.a[Number(n[1])] ||
                this.b[n[1][0]] + ' ' + this.a[n[1][1]]) + 'crore '
            : '';
        str +=
          Number(n[2]) !== 0
            ? (this.a[Number(n[2])] ||
                this.b[n[2][0]] + ' ' + this.a[n[2][1]]) + 'lakh '
            : '';
        str +=
          Number(n[3]) !== 0
            ? (this.a[Number(n[3])] ||
                this.b[n[3][0]] + ' ' + this.a[n[3][1]]) + 'thousand '
            : '';
        str +=
          Number(n[4]) !== 0
            ? (this.a[Number(n[4])] ||
                this.b[n[4][0]] + ' ' + this.a[n[4][1]]) + 'hundred '
            : '';
        str +=
          Number(n[5]) !== 0
            ? (str !== '' ? '' : '') +
              (this.a[Number(n[5])] || this.b[n[5][0]] + ' ' + this.a[n[5][1]])
            : '';
        if (num2) {
          const n: any = ('000000000' + num2)
            .substr(-9)
            .match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
          if (!n) {
            return '';
          }
          str += ' & cent ';
          str +=
            Number(n[1]) !== 0
              ? (this.a[Number(n[1])] ||
                  this.b[n[1][0]] + ' ' + this.a[n[1][1]]) + 'crore '
              : '';
          str +=
            Number(n[2]) !== 0
              ? (this.a[Number(n[2])] ||
                  this.b[n[2][0]] + ' ' + this.a[n[2][1]]) + 'lakh '
              : '';
          str +=
            Number(n[3]) !== 0
              ? (this.a[Number(n[3])] ||
                  this.b[n[3][0]] + ' ' + this.a[n[3][1]]) + 'thousand '
              : '';
          str +=
            Number(n[4]) !== 0
              ? (this.a[Number(n[4])] ||
                  this.b[n[4][0]] + ' ' + this.a[n[4][1]]) + 'hundred '
              : '';
          str +=
            Number(n[5]) !== 0
              ? (str !== '' ? '' : '') +
                (this.a[Number(n[5])] ||
                  this.b[n[5][0]] + ' ' + this.a[n[5][1]]) +
                  currency + ' only'
              : '';
        } else {
          str += currency + ' only';
        }

        return str;
      } else {
        return '';
      }
    } else {
      return '';
    }
  }
}

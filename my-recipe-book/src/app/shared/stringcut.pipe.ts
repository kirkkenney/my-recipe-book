import { Pipe, PipeTransform } from '@angular/core';

// Pipe used to slice any string in HTML templates by the specificed length

@Pipe({
  name: 'stringcut'
})
export class StringcutPipe implements PipeTransform {

  transform(value: string, length: number): string {
    if (value.length > length) {
      return `${value.slice(0, length)}...`
    }
    return value;
  }

}

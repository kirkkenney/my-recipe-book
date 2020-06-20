import { Pipe, PipeTransform } from '@angular/core';

// Pipe used to trim form input fields to handle edge cases where user enters information with leading or trailing whitespaces

@Pipe({
  name: 'trim'
})
export class TrimPipe implements PipeTransform {

  transform(value: any): string {
    return value.trim()
  }

}

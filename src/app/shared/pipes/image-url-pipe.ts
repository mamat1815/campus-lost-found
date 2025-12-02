import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'imageUrl',
  standalone: true
})
export class ImageUrlPipe implements PipeTransform {

  transform(value: string | undefined | null): string {
    if (!value) {
      return 'assets/placeholder-image.png';
    }
    if (value.startsWith('http')) {
      return value;
    }
    if (value.startsWith('/')) {
      return `http://157.10.161.213:3000${value}`;
    }
    return `http://157.10.161.213:3000/${value}`;
  }

}

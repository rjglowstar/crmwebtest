import { Pipe, PipeTransform } from '@angular/core';
import { MasterDNorm } from 'shared/enitites';

@Pipe({
      name: 'typefilter',
      pure: false
})
export class TypeFilterPipe implements PipeTransform {
      transform(items: MasterDNorm[], type: string): any {
            if (!items || !type) {
                  return items;
            }
            // type items array, items which match and return true will be
            // kept, false will be filtered out
            return items.filter(item => item.type.toLowerCase().indexOf(type.toLowerCase()) !== -1);
      }
}

import { Injectable } from '@angular/core';
import { InventoryItems } from '../../entities';

@Injectable({
  providedIn: 'root'
})
export class FoUtilityService {

  constructor() { }

  public orderByStoneIdInventoryItems(inv: InventoryItems[]): void {
    inv = inv.sort(function (a, b) {
      return a.stoneId.localeCompare(b.stoneId, undefined, {
        numeric: true,
        sensitivity: 'base'
      });
    });
  }

}
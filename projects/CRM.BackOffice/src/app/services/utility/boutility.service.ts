import { Injectable } from '@angular/core';
import { InventoryItems, PackingItem } from '../../entities';
import { LabIssueItem } from '../../businessobjects/lab/labissueitem';

@Injectable({
  providedIn: 'root'
})
export class BoUtilityService {

  constructor() { }

  // public orderByInventoryItems(inv: InventoryItems[]): InventoryItems[] {
  //   let invItems: InventoryItems[] = [];
  //   if (inv.length > 0) {
  //     let smallStone = inv.filter(x => x.weight < 1);
  //     let bigStone = inv.filter(x => x.weight > 0.99);
  //     let so: SortDescriptor[] = [{ dir: 'asc', field: 'stoneId' }]
  //     let smallOderbyItems = orderBy(smallStone, so)
  //     let bigOderbyItems = orderBy(bigStone, so)
  //     invItems.push(...smallOderbyItems);
  //     invItems.push(...bigOderbyItems);
  //   }
  //   else
  //     invItems.push(...inv);
  //   return invItems;
  // }

  public orderByStoneIdInventoryItems(inv: InventoryItems[]): void {
    inv = inv.sort(function (a, b) {
      return a.stoneId.localeCompare(b.stoneId, undefined, {
        numeric: true,
        sensitivity: 'base'
      });
    });
  }

  public orderByStoneIdPackingItems(inv: PackingItem[]): void {
    inv = inv.sort(function (a, b) {
      return a.stoneId.localeCompare(b.stoneId, undefined, {
        numeric: true,
        sensitivity: 'base'
      });
    });
  }

  public orderByStoneIdLabIssueItems(inv: LabIssueItem[]): void {
    inv = inv.sort(function (a, b) {
      return a.stoneId.localeCompare(b.stoneId, undefined, {
        numeric: true,
        sensitivity: 'base'
      });
    });
  }

  public orderByInventoryLikeFOD(invItems: Array<InventoryItems>) {
    let shapeKeys = ["RBC", "CMB", "EM", "SMB", "SQEM", "PB", "MB", "OB", "HB", "CCRMB", "MTRIB"];
    let clarities = ["IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2", "SI3", "I1", "I2", "I3"];
    let cuts = ["EX", "VG", "GD", "FR", "PR"];
    let polishes = ["EX", "VG", "GD", "FR", "PR"];
    let symes = ["EX", "VG", "GD", "FR", "PR"];
    let flues = ["VSTG", "STG", "MED", "FAINT", "NON", "SLT", "VSL"];
    if (invItems && invItems.length > 0) {
      invItems = invItems.sort((a, b) => {
        let shapeIndexA = shapeKeys.indexOf(a.shape);
        let shapeIndexB = shapeKeys.indexOf(b.shape);

        if (shapeIndexA !== shapeIndexB) {
          return shapeIndexA - shapeIndexB;
        }

        let clarityIndexA = clarities.indexOf(a.clarity);
        let clarityIndexB = clarities.indexOf(b.clarity);

        if (clarityIndexA !== clarityIndexB) {
          return clarityIndexA - clarityIndexB;
        }

        let cutIndexA = cuts.indexOf(a.cut);
        let cutIndexB = cuts.indexOf(b.cut);

        if (cutIndexA !== cutIndexB) {
          return cutIndexA - cutIndexB;
        }

        let symeIndexA = symes.indexOf(a.symmetry);
        let symeIndexB = symes.indexOf(b.symmetry);

        if (symeIndexA !== symeIndexB) {
          return symeIndexA - symeIndexB;
        }

        let polishIndexA = polishes.indexOf(a.polish);
        let polishIndexB = polishes.indexOf(b.polish);

        if (polishIndexA !== polishIndexB) {
          return polishIndexA - polishIndexB;
        }

        let flueIndexA = flues.indexOf(a.fluorescence);
        let flueIndexB = flues.indexOf(b.fluorescence);

        if (flueIndexA !== flueIndexB) {
          return flueIndexA - flueIndexB;
        }

        return a.weight - b.weight;
      });
    }

    return invItems;
  }

}
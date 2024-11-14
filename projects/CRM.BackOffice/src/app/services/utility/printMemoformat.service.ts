import { Injectable } from '@angular/core';
import { MasterConfig, MasterDNorm } from 'shared/enitites';
import { UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { InventoryItems, Memo } from '../../entities';
import { MasterConfigService } from '../masterconfig/masterconfig.service';
import { IndiaMemoPrint } from './memoPrint/indiaMemoPrint.service';
import { HKMemoPrint } from './memoPrint/hkMemoPrint.service';
import { UAEMemoPrint } from './memoPrint/uaeMemoPrint.service';
import { LabMemoPrint } from './memoPrint/labMemoPrint.service';
import { BelgiumMemoPrint } from './memoPrint/belgiumMemoPrint.service';

@Injectable({
  providedIn: 'root'
})

export class PrintMemoFormat {
  public allTheShapes!: MasterDNorm[];
  public masterConfigList!: MasterConfig;

  constructor(
    public utilityService: UtilityService,
    private masterConfigService: MasterConfigService,
    private alertDialogService: AlertdialogService,
    public indiaMemoPrint: IndiaMemoPrint,
    public hKMemoPrint: HKMemoPrint,
    public uAEMemoPrint: UAEMemoPrint,
    public labMemoPrint: LabMemoPrint,
    public belgiumMemoPrint: BelgiumMemoPrint
  ) { }

  public async getMasterConfigData() {
    try {
      this.masterConfigList = await this.masterConfigService.getAllMasterConfig();
      this.allTheShapes = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.shape);
    }
    catch (error: any) {
      this.alertDialogService.show(error.error)
    }
  }

  public getDisplayNameFromMasterDNorm(name: string): string {
    if (name && name.length > 0)
      var obj = this.allTheShapes.find(c => c.name.toLowerCase() == name.toLowerCase() || c.displayName?.toLowerCase() == name.toLowerCase() || (c.optionalWords && c.optionalWords.length > 0 && c.optionalWords.map(u => u.toLowerCase().trim()).includes(name.toLowerCase())));
    return obj?.name ?? null as any;
  }

  public async getMemoPrint(memoObj: Memo) {
    var htmlString: string = "";
    var memoType: string = "";

    if (memoObj.organization.address?.country.toLowerCase() == 'india') {
      if (!memoObj.isOverseas)
        memoType = 'INDIALOCAL';
      else
        memoType = 'INDIAOVERSEAS';
    }
    else if (memoObj.organization.address?.country.toLowerCase() == 'hong kong') {
      if (!memoObj.isOverseas)
        memoType = 'HKLOCAL';
      else
        memoType = 'HKOVERSEAS';
    }
    else if (memoObj.organization.address?.country.toLowerCase() == 'belgium') {
      if (!memoObj.isOverseas)
        memoType = 'BELGIUMLOCAL';
      else
        memoType = 'BELGIUMOVERSEAS';
    }
    else if (memoObj.organization.address?.country.toLowerCase() == 'united arab emirates') {
      if (!memoObj.isOverseas)
        memoType = 'UAELOCAL';
      else
        memoType = 'UAEOVERSEAS';
    }

    if (memoObj.party.group.toLowerCase() == "lab")
      memoType = 'OVERSEASLAB';

    if (memoType == "INDIALOCAL" || memoType == "INDIAOVERSEAS")
      htmlString = await this.indiaMemoPrint.getMemoPrint(memoObj, memoType)
    else if (memoType == "HKLOCAL" || memoType == "HKOVERSEAS")
      htmlString = await this.hKMemoPrint.getMemoPrint(memoObj, memoType)
    else if (memoType == "UAELOCAL" || memoType == "UAEOVERSEAS")
      htmlString = await this.uAEMemoPrint.getMemoPrint(memoObj, memoType)
    else if (memoType == "BELGIUMLOCAL" || memoType == "BELGIUMOVERSEAS")
      htmlString = await this.belgiumMemoPrint.getMemoPrint(memoObj, memoType)
    else if (memoType == "OVERSEASLAB")
      htmlString = await this.labMemoPrint.getMemoPrint(memoObj, memoType)

    return htmlString;
  }

  public async getAbovePointFiveCentMemoPrint(memoObj: Memo) {
    var htmlString: string = "";
    var memoType: string = "";

    if (memoObj.organization.address?.country.toLowerCase() == 'india') {
      if (!memoObj.isOverseas)
        memoType = 'INDIALOCAL';
      else
        memoType = 'INDIAOVERSEAS';
    }
    else if (memoObj.organization.address?.country.toLowerCase() == 'hong kong') {
      if (!memoObj.isOverseas)
        memoType = 'HKLOCAL';
      else
        memoType = 'HKOVERSEAS';
    }
    else if (memoObj.organization.address?.country.toLowerCase() == 'belgium') {
      if (!memoObj.isOverseas)
        memoType = 'BELGIUMLOCAL';
      else
        memoType = 'BELGIUMOVERSEAS';
    }
    else if (memoObj.organization.address?.country.toLowerCase() == 'united arab emirates') {
      if (!memoObj.isOverseas)
        memoType = 'UAELOCAL';
      else
        memoType = 'UAEOVERSEAS';
    }

    if (memoObj.party.group.toLowerCase() == "lab")
      memoType = 'OVERSEASLAB';

    if (memoType == "INDIALOCAL" || memoType == "INDIAOVERSEAS")
      htmlString = await this.indiaMemoPrint.getAbovePointFiveCentMemoPrint(memoObj, memoType)
    else if (memoType == "HKLOCAL" || memoType == "HKOVERSEAS")
      htmlString = await this.hKMemoPrint.getAbovePointFiveCentMemoPrint(memoObj, memoType)
    else if (memoType == "UAELOCAL" || memoType == "UAEOVERSEAS")
      htmlString = await this.uAEMemoPrint.getAbovePointFiveCentMemoPrint(memoObj, memoType)
    else if (memoType == "BELGIUMLOCAL" || memoType == "BELGIUMOVERSEAS")
      htmlString = await this.belgiumMemoPrint.getAbovePointFiveCentMemoPrint(memoObj, memoType)
    else if (memoType == "OVERSEASLAB")
      htmlString = await this.labMemoPrint.getAbovePointFiveCentMemoPrint(memoObj, memoType)

    return htmlString;
  }
}
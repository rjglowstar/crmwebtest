import { Injectable } from '@angular/core';
import { MasterConfig, MasterDNorm } from 'shared/enitites';
import { UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { AccountingConfig, PackingItem, Transaction } from '../../entities';
import { AccountingconfigService } from '../accounting/accountingconfig.service';
import { MasterConfigService } from '../masterconfig/masterconfig.service';
import { IndiaInvoiceFormatService } from './invoicesPrints/indiaInvoiceFormat.service';
import { HkInvoiceFormatService } from './invoicesPrints/hKInvoiceFormat.service';
import { BelgiumInvoiceFormatService } from './invoicesPrints/belgiumInvoiceFormat.service';
import { UaeInvoiceFormatService } from './invoicesPrints/uaeInvoiceFormat.service';

@Injectable({
  providedIn: 'root'
})

export class PrintInvoiceFormat {
  public allTheShapes!: MasterDNorm[];
  public masterConfigList!: MasterConfig;
  public accountingConfigData: AccountingConfig = new AccountingConfig();
  public EuroToUSDRate: number = 0;

  constructor(
    public utilityService: UtilityService,
    private masterConfigService: MasterConfigService,
    private alertDialogService: AlertdialogService,
    public accountingconfigService: AccountingconfigService,
    public indiaInvoiceFormatService: IndiaInvoiceFormatService,
    public hkInvoiceFormatService: HkInvoiceFormatService,
    public belgiumInvoiceFormatService: BelgiumInvoiceFormatService,
    public uaeInvoiceFormatService: UaeInvoiceFormatService
  ) { }

  public async getMasterConfigData() {
    try {
      this.masterConfigList = await this.masterConfigService.getAllMasterConfig();
      this.allTheShapes = this.utilityService.sortingMasterDNormPriority(this.masterConfigList.shape);
      this.accountingConfigData = await this.accountingconfigService.getAccoutConfig();
      let res = await this.accountingconfigService.getFromToCurrencyRate('EURO', 'USD', this.accountingConfigData.currencyConfigs);
      this.EuroToUSDRate = res.toRate ?? 0;
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

  public async getInvoice(transaction: Transaction, isCGMail: boolean = false) {
    let htmlString: string = "";
    let invoiceType = "";

    if (transaction.transactionDetail.organization.address?.country.toLowerCase() == 'india') {
      if (!transaction.transactionDetail.isOverseas && !transaction.transactionDetail.isDDA)
        invoiceType = 'INDIALOCAL';
      else if (!transaction.transactionDetail.isOverseas && transaction.transactionDetail.isDDA)
        invoiceType = 'INDIALOCALDDA';
      else if (transaction.transactionDetail.isOverseas)
        invoiceType = 'INDIAOVERSEAS';
    }
    else if (transaction.transactionDetail.organization.address?.country.toLowerCase() == 'hong kong') {
      if (!transaction.transactionDetail.isOverseas)
        invoiceType = 'HKLOCAL';
      else
        invoiceType = 'HKOVERSEAS';
    }
    else if (transaction.transactionDetail.organization.address?.country.toLowerCase() == 'belgium') {
      if (!transaction.transactionDetail.isOverseas)
        invoiceType = 'BELGIUMLOCAL';
      else
        invoiceType = 'BELGIUMOVERSEAS';
    }
    else if (transaction.transactionDetail.organization.address?.country.toLowerCase() == 'united arab emirates') {
      if (!transaction.transactionDetail.isOverseas)
        invoiceType = 'UAELOCAL';
      else
        invoiceType = 'UAEOVERSEAS';
    }
    
    if (invoiceType == "INDIALOCAL" || invoiceType == "INDIALOCALDDA" || invoiceType == "INDIAOVERSEAS")
      htmlString = await this.indiaInvoiceFormatService.getInvoicePrint(transaction, isCGMail , invoiceType);
    else if (invoiceType == "HKLOCAL" || invoiceType == "HKOVERSEAS")
      htmlString = await this.hkInvoiceFormatService.getInvoicePrint(transaction, isCGMail , invoiceType);
    else if (invoiceType == "BELGIUMLOCAL" || invoiceType == "BELGIUMOVERSEAS")
      htmlString = await this.belgiumInvoiceFormatService.getInvoicePrint(transaction, isCGMail , invoiceType);
    else if (invoiceType == "UAELOCAL" || invoiceType == "UAEOVERSEAS")
      htmlString = await this.uaeInvoiceFormatService.getInvoicePrint(transaction, isCGMail , invoiceType);

    return htmlString;
  }

  public async getAboveFiveCentInvoice(transaction: Transaction, isCGMail: boolean = false) {
    let htmlString: string = "";
    let invoiceType = "";

    if (transaction.transactionDetail.organization.address?.country.toLowerCase() == 'india') {
      if (!transaction.transactionDetail.isOverseas && !transaction.transactionDetail.isDDA)
        invoiceType = 'INDIALOCAL';
      else if (!transaction.transactionDetail.isOverseas && transaction.transactionDetail.isDDA)
        invoiceType = 'INDIALOCALDDA';
      else if (transaction.transactionDetail.isOverseas)
        invoiceType = 'INDIAOVERSEAS';
    }
    else if (transaction.transactionDetail.organization.address?.country.toLowerCase() == 'hong kong') {
      if (!transaction.transactionDetail.isOverseas)
        invoiceType = 'HKLOCAL';
      else
        invoiceType = 'HKOVERSEAS';
    }
    else if (transaction.transactionDetail.organization.address?.country.toLowerCase() == 'belgium') {
      if (!transaction.transactionDetail.isOverseas)
        invoiceType = 'BELGIUMLOCAL';
      else
        invoiceType = 'BELGIUMOVERSEAS';
    }
    else if (transaction.transactionDetail.organization.address?.country.toLowerCase() == 'united arab emirates') {
      if (!transaction.transactionDetail.isOverseas)
        invoiceType = 'UAELOCAL';
      else
        invoiceType = 'UAEOVERSEAS';
    }
    
    if (invoiceType == "INDIALOCAL" || invoiceType == "INDIALOCALDDA" || invoiceType == "INDIAOVERSEAS")
      htmlString = await this.indiaInvoiceFormatService.getAboveFiveCentInvoicePrint(transaction, isCGMail , invoiceType);
    else if (invoiceType == "HKLOCAL" || invoiceType == "HKOVERSEAS")
      htmlString = await this.hkInvoiceFormatService.getAboveFiveCentInvoicePrint(transaction, isCGMail , invoiceType);
    else if (invoiceType == "BELGIUMLOCAL" || invoiceType == "BELGIUMOVERSEAS")
      htmlString = await this.belgiumInvoiceFormatService.getAboveFiveCentInvoicePrint(transaction, isCGMail , invoiceType);
    else if (invoiceType == "UAELOCAL" || invoiceType == "UAEOVERSEAS")
      htmlString = await this.uaeInvoiceFormatService.getAboveFiveCentInvoicePrint(transaction, isCGMail , invoiceType);

    return htmlString;
  }
}
import { Injectable } from '@angular/core';
import { AccountingConfig, PackingItem, Transaction } from '../../../entities';
import { UtilityService } from 'shared/services';
import { MasterConfigService } from '../../masterconfig/masterconfig.service';
import { AlertdialogService } from 'shared/views';
import { AccountingconfigService } from '../../accounting/accountingconfig.service';
import { MasterConfig, MasterDNorm } from 'shared/enitites';

@Injectable({
  providedIn: 'root'
})
export class UaeInvoiceFormatService {
  public allTheShapes!: MasterDNorm[];
  public masterConfigList!: MasterConfig;
  public accountingConfigData: AccountingConfig = new AccountingConfig();
  public EuroToUSDRate: number = 0;

  constructor(
    public utilityService: UtilityService,
    private masterConfigService: MasterConfigService,
    private alertDialogService: AlertdialogService,
    public accountingconfigService: AccountingconfigService,
  ) {

  }

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

  public async getInvoicePrint(transaction: Transaction, isCGMail: boolean = false, invoiceType: string) {
    await this.getMasterConfigData();
    let htmlString: string = "";
    let taxNameOne: string = "";
    let taxPerOne: number = 0;
    let taxNameTwo: string = "";
    let taxPerTwo: number = 0;
    let totalStone = 0;
    let totalWeight = 0;
    let totalAmount = 0;
    let totalPerCarat = 0;
    let totalPayableAmount = 0;
    let convertTotalPayableAmount = 0;
    let contain49Down = false;
    let contain49Up = false;
    let blankHKLocal = 19;
    let isIGST = false;

    let contain49UpIndex = transaction.packingList.findIndex(x => x.weight > 0.49);
    if (contain49UpIndex > -1)
      contain49Up = true;

    let contain49DownIndex = transaction.packingList.findIndex(x => x.weight <= 0.49);
    if (contain49DownIndex > -1)
      contain49Down = true;

    if (transaction.transactionDetail.taxTypes.length > 0) {
      if (transaction.transactionDetail.taxTypes.length == 2) {
        taxNameOne = transaction.transactionDetail.taxTypes[0].name;
        taxPerOne = transaction.transactionDetail.taxTypes[0].rate;
        taxNameTwo = transaction.transactionDetail.taxTypes[1].name;
        taxPerTwo = transaction.transactionDetail.taxTypes[1].rate;
        blankHKLocal -= 2;
      }
      if (transaction.transactionDetail.taxTypes.length == 1) {
        taxNameOne = transaction.transactionDetail.taxTypes[0].name;
        taxPerOne = transaction.transactionDetail.taxTypes[0].rate;
        blankHKLocal -= 1;
      }
    }

    if (transaction.transactionDetail.shippingCharge > 0) {
      blankHKLocal -= 1;
    }

    if (transaction.packingList.length > 0) {
      totalStone = this.utilityService.ConvertToFloatWithDecimal(transaction.packingList.length);
      totalWeight = this.utilityService.ConvertToFloatWithDecimal(transaction.packingList.reduce((acc, cur) => acc + (cur.weight ? cur.weight : 0), 0));
      totalAmount = this.utilityService.ConvertToFloatWithDecimal(transaction.packingList.reduce((acc, cur) => acc + (cur.price.netAmount ? cur.price.netAmount : 0), 0));
      totalPerCarat = this.utilityService.ConvertToFloatWithDecimal(totalAmount / totalWeight);
      totalPayableAmount = this.utilityService.ConvertToFloatWithDecimal(totalAmount + (transaction.transactionDetail.shippingCharge ?? 0) + (Number(transaction.transactionDetail.expense) ?? 0) + (totalPayableAmount ?? 0));
      convertTotalPayableAmount = this.utilityService.ConvertToFloatWithDecimal(totalPayableAmount * (transaction.transactionDetail.toCurRate ?? 1))
    }

    if (transaction.transactionDetail.termType == 'Due')
      transaction.transactionDetail.terms = transaction.transactionDetail.terms + ' Days.';
    else
      transaction.transactionDetail.terms = transaction.transactionDetail.termType ?? "";

    if (taxNameOne.toLowerCase() == "igst" || taxNameTwo.toLowerCase() == "igst")
      isIGST = true

    if (invoiceType == "UAELOCAL" || invoiceType == "UAEOVERSEAS") {
      let maxRow = 14;
      if (invoiceType == "UAEOVERSEAS")
        maxRow = 15;

      htmlString += `<body onload="window.print(); window.close();">
      <div class="dmcc-main">
        <div class="dmcc-head">
          <div class="head-left">
            <img src="assets/billimage/dmcc.png" alt="logo" />
            <p><b>Rough & Polished Diamonds - Import & Export</b></p>
          </div>
          <div class="head-right">
            <span><b>TRN No :</b>` + transaction.number + `</span>
            <span><b>Invoice No :</b>` + transaction.refNumber?.replace('-', '') + `</span>
            <span><b>Invoice Date :</b>` + this.utilityService.getISOtoStringDate(transaction.transactionDate) + `</span>`;

      if (invoiceType == "UAELOCAL")
        htmlString += `<span><b>Delivery :</b> hand to hand</span>`;

      if (transaction.transactionDetail.termType == 'Due')
        htmlString += `<span><b>Terms :</b>` + transaction.transactionDetail.terms + ` Days</span>`;
      else
        htmlString += `<span><b>Terms :</b>` + (transaction.transactionDetail.termType != null ? transaction.transactionDetail.termType : '') + `</span>`;
      if (transaction.transactionDetail.dueDate)
        htmlString += `<span><b>Due Date :</b>` + this.utilityService.getISOtoStringDate(transaction.transactionDetail.dueDate) + `</span>`;
      else
        htmlString += `<span><b>Due Date :</b></span>`;

      if (invoiceType == "UAEOVERSEAS") {
        htmlString += `<span><b>CIF :</b>` + transaction.toLedger.address.country + `</span>
              <span><b>Shipped By :</b>` + (transaction.transactionDetail.logistic.name != null ? transaction.transactionDetail.logistic.name : '') + `</span>
              <span><b>Insured By :</b>` + (transaction.transactionDetail.logistic.name != null ? transaction.transactionDetail.logistic.name : '') + `</span>`;
      }
      else {
        htmlString += `<span><b>Destination :</b>Dubai</span>
          <span><b>&nbsp;</b>Ref.=LOCAL</span>
          <span>&nbsp;</span>`;
      }

      htmlString += `</div>
        </div>
    
        <div class="buyer-detail">
          <strong>Buyer :</strong>
          <p>
            <b>` + transaction.toLedger.name + `</b><br>
            ` + (transaction.toLedger.address == null || transaction.toLedger.address?.line1 == null ? '<br>' : transaction.toLedger.address.line1 + '<br>') + `
            ` + (transaction.toLedger.address == null || transaction.toLedger.address?.line2 == null ? '' : transaction.toLedger.address.line2 + '<br>') + `
            ` + (transaction.toLedger.address == null || transaction.toLedger.address?.city == null ? transaction.toLedger.address.country + '<br>' : (transaction.toLedger.address.city + ` ` + transaction.toLedger.address.zipCode + '<br>'));

      //We are using Add. Declaration as TRN No. in SD invoice
      if (invoiceType == "UAELOCAL")
        htmlString += `TRN NO : ` + (transaction.transactionDetail.additionalDeclaration != null ? transaction.transactionDetail.additionalDeclaration : '');
      else
        htmlString += `PHONE : ` + transaction.toLedger.mobileNo;

      htmlString += `</p>
        </div>
    
        <div class="tbl-detail">
          <strong>TAX INVOICE</strong>
          <strong>NATURAL POLISHED DIAMOND</strong>
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Description</th>
                <th>Carats</th>
                <th>Rate In US $</th>
                <th>Amt In US $</th>
                <th>Amt In AED</th>
              </tr>
            </thead>
            <tbody>`;

      if (transaction.packingList.length > maxRow) {
        if (transaction.items && transaction.items.length > 0) {
          htmlString += `
                <tr>
                <td>#1</td>
                <td>CUT & POLISHED DIAMONDS</td>
                <td>` + this.utilityService.ConvertToFloatWithDecimalTwoDigitRound(transaction.items[0].weight) + `</td>
                <td>` + this.utilityService.ConvertToFloatWithDecimalTwoDigitRound(transaction.items[0].rate) + `</td>
                <td>` + this.utilityService.ConvertToFloatWithDecimalTwoDigitRound(transaction.items[0].amount) + `</td>
                <td>` + this.utilityService.ConvertToFloatWithDecimalTwoDigitRound(this.accountingconfigService.getFromToCurrencyRate('USD', 'AED', this.accountingConfigData.currencyConfigs).toRate * transaction.items[0].amount) + `</td>
              </tr>`;
        }
        else {
          htmlString += `
                <tr>
                <td>#1</td>
                <td>CUT & POLISHED DIAMONDS</td>
                <td>0</td>
                <td>0</td>
                <td>` + this.utilityService.ConvertToFloatWithDecimalTwoDigitRound(transaction.netTotal) + `</td>
                <td>0</td>
              </tr>`;
        }

        for (let index = 0; index < (maxRow - 1); index++) {
          htmlString += `
                <tr>
                <td>&nbsp;</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>`;
        }
      }
      else if (transaction.packingList.length <= maxRow) {
        for (let i = 0; i < transaction.packingList.length; i++) {
          const element = transaction.packingList[i];
          htmlString += `
                <tr>
                <td>#` + (i + 1) + `</td>
                <td>` + element.lab + ` ` + element.certificateNo + `</td>
                <td>` + this.utilityService.ConvertToFloatWithDecimalTwoDigitRound(element.weight) + `</td>
                <td>` + this.utilityService.ConvertToFloatWithDecimalTwoDigitRound(element.price.rap ?? 0) + `</td>
                <td>` + this.utilityService.ConvertToFloatWithDecimalTwoDigitRound(element.price.netAmount ?? 0) + `</td>
                <td>` + this.utilityService.ConvertToFloatWithDecimalTwoDigitRound(this.accountingconfigService.getFromToCurrencyRate('USD', 'AED', this.accountingConfigData.currencyConfigs).toRate * (element.price?.netAmount ?? 0)) + `</td>
              </tr>`;
        }

        if (transaction.packingList.length != maxRow) {
          for (let index = 0; index < (maxRow - transaction.packingList.length); index++) {
            htmlString += `
                  <tr>
                  <td>&nbsp;</td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>`;
          }
        }
      }
      else {
        if (transaction.items && transaction.items.length > 0) {
          htmlString += `
                <tr>
                <td>#1</td>
                <td>` + transaction.items[0].item.name + `</td>
                <td>` + this.utilityService.ConvertToFloatWithDecimalTwoDigitRound(transaction.items[0].weight) + `</td>
                <td>` + this.utilityService.ConvertToFloatWithDecimalTwoDigitRound(transaction.items[0].rate) + `</td>
                <td>` + this.utilityService.ConvertToFloatWithDecimalTwoDigitRound(transaction.items[0].amount) + `</td>
                <td>` + this.utilityService.ConvertToFloatWithDecimalTwoDigitRound(this.accountingconfigService.getFromToCurrencyRate('USD', 'AED', this.accountingConfigData.currencyConfigs).toRate * transaction.items[0].amount) + `</td>
              </tr>`;
        }
        else {
          htmlString += `
                <tr>
                <td>#1</td>
                <td>CUT & POLISHED DIAMONDS</td>
                <td>0</td>
                <td>0</td>
                <td>` + this.utilityService.ConvertToFloatWithDecimalTwoDigitRound(transaction.netTotal) + `</td>
                <td>0</td>
              </tr>`;
        }

        for (let index = 0; index < (maxRow - 1); index++) {
          htmlString += `
                      <tr>
                      <td>&nbsp;</td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>`;
        }
      }

      htmlString += `<tr class="brd-remove">
                <th colspan="2" style="text-align: right;">Total Weight</th>
                <th>` + this.utilityService.ConvertToFloatWithDecimalTwoDigitRound(transaction.items[0].weight) + `</th>
                <th></th>
                <th style="border: 1px solid !important;">` + this.utilityService.ConvertToFloatWithDecimalTwoDigitRound(transaction.amount) + `</th>
                <th style="border: 1px solid !important;">` + this.utilityService.ConvertToFloatWithDecimalTwoDigitRound(this.accountingconfigService.getFromToCurrencyRate('USD', 'AED', this.accountingConfigData.currencyConfigs).toRate * transaction.items[0].amount) + `</th>
              </tr>
              <tr class="brd-remove">
                <th></th>
                <th>VAT : N/A</th>
                <th colspan="2" style="text-align: right;"></th>
                <th></th>
              </tr>
              <tr class="brd-remove">
                <th></th>`;

      if (invoiceType == "UAEOVERSEAS")
        htmlString += `<th style="text-align: right;color: red;">Payable Only in US $</th>`;
      else
        htmlString += `<th></th>`;

      htmlString += `<th colspan="2" style="color: red;">1 US$= ` + this.accountingconfigService.getFromToCurrencyRate('USD', 'AED', this.accountingConfigData.currencyConfigs).toRate + ` AED</th>
                <th></th>
                <th></th>
              </tr>
            </tbody>
          </table>
        </div>
    
        <strong style="padding-left: 20px;">PAYMENT INSTRUCTION</strong>
        <div class="payment-detail">
          <div class="payment-grid">
            <div class="grid">
              <p><u>BANK NAME</u></p>
              <p><b>NATIONAL BANK OF FUJAIRAH</b></p>
            </div>
            <div class="grid">
              <p><u>IBAN NO</u></p>
              <p><b>NATIONAL BANK OF FUJAIRAH</b></p>
            </div>
            <div class="grid">
              <p><u>SWIFT</u></p>
              <p><b>NBFUAEAF</b></p>
            </div>
    
            <div class="grid">
              <p><u>INTERMEDIARY BANK</u></p>
              <p><b>STANDARD CHARTERED BANK NY</b></p>
            </div>
            <div class="grid">
            </div>
            <div class="grid">
              <p><u>SWIFT</u></p>
              <p><b>SCBLUS33</b></p>
            </div>`;

      if (invoiceType == "UAELOCAL") {
        htmlString += `<div class="grid">
                    </div>
                    <div class="grid" style="text-align:center;">
                      <p><b>(AED) A/C #  0342030993001</b></p>
                    </div>
                    <div class="grid">
                    </div>`;
      }
      else {
        htmlString += `<div class="grid">
                    </div>
                    <div class="grid">
                    </div>
                    <div class="grid">
                    </div>`;
      }

      htmlString += `</div>`;

      if (invoiceType == "UAEOVERSEAS")
        htmlString += `<strong>* TERMS: [Part payment allowed before or after due date ]</strong>`;
      else
        htmlString += `<div style="text-align:center;"><b>IBAN NO: </b>AE85 0400 0003 42030993001 AED</div><br/>`;


      htmlString += `</div>
    
        <div class="td-detail">
          <p>The diamonds here in invoiced are exclusively of natural origin and untreated based on personal knowledge
            and/or written guarantees provided by the supplier of these diamonds.</p>
          <span><b>Declaration</b></span>
          <p>"The diamonds herein invoiced have been sourced from legitimate sources not involved in funding conflict, in
            compliance with United Nations Resolutions and corresponding national laws. The seller hereby guarantees that
            these diamonds are conflict free and confirms adherence to the WDC SoW Guidelines."</p>
        </div>
    
        <div class="dmcc-footer">
          <div class="grid">
            <p><strong>DIAMOON DMCC</strong></p>
            <p>
              Unit No. 18-B, ALMAS TOWER,<br>
              JUMEIRAH LAKE TOWER,<br>
              Dubai, United Arab Emirates.
            </p>
          </div>
          <div class="grid">
            <p><br></p>
            <p>
              <span><b>Phone No. :</b>+971 505961453</span>
              <span><b>E-mail :</b>info@diamoondmcc.com</span>
            </p>
          </div>
          <div class="grid">
            <strong class="sign">FOR DIAMOON DMCC</strong>
          </div>
        </div>
    
      </div>`;

      if (transaction.packingList.length > maxRow) {
        htmlString += `
          <div class="body-middle">

          <table>
            <tr>
            <td><b>INV. NO : </b>` + transaction.refNumber?.replace('-', '') + `</td>
            </tr>
          </table>

          <table>
            <thead>
              <th>No</th>
              <th>STONE ID</th>
              <th>SHAPE</th>
              <th>CARATS</th>
              <th>COLOR</th>
              <th>CLARITY</th>
              <th>LAB</th>  
              <th>CERTI. NO</th>          
              <th>RATE `+ transaction.transactionDetail.fromCurrency + ` PER CT</th>
              <th>TOTAL AMOUNT `+ transaction.transactionDetail.fromCurrency + `</th>
            </thead>
            <tbody>`

        for (let index = 0; index <= transaction.packingList.length; index++) {
          let obj = transaction.packingList[index];
          if (obj) {
            htmlString += `
                    <tr>
                    <td>`+ (index + 1) + `</td>
                    <td>`+ (obj.stoneId ?? "") + `</td>
                    <td>`+ (obj.shape ?? "") + `</td>
                    <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.weight ?? 0) ?? "") + `</td>
                    <td>`+ (obj.color ?? "") + `</td>
                    <td>`+ (obj.clarity ?? "") + `</td>
                    <td>`+ (obj.lab ?? "") + `</td>
                    <td>`+ (obj.certificateNo ?? "") + `</td>
                    <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.perCarat ?? 0) ?? "") + `</td>
                    <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.netAmount ?? 0) ?? "") + `</td>
                    </tr>`
          }
        }

        htmlString += `
            </tbody>
            </table>
            </div>`
      }

      htmlString += `
        </body>
        </html>
        `;
    }

    return htmlString;
  }

  public async getAboveFiveCentInvoicePrint(transaction: Transaction, isCGMail: boolean = false, invoiceType: string) {
    await this.getMasterConfigData();
    let htmlString: string = "";
    let taxNameOne: string = "";
    let taxPerOne: number = 0;
    let taxNameTwo: string = "";
    let taxPerTwo: number = 0;
    let totalStone = 0;
    let totalWeight = 0;
    let totalAmount = 0;
    let totalPerCarat = 0;
    let totalPayableAmount = 0;
    let convertTotalPayableAmount = 0;
    let contain49Down = false;
    let contain49Up = false;
    let blankHKLocal = 19;
    let isIGST = false;
    let totalValueTaxed1ctPlusStones = 0;
    let above1ctTax1 = 0;
    let above1ctTax2 = 0;
    let aboveFiveCentTotalWeight = 0;
    let aboveFiveCentAmont = 0;
    let aboveTotalPerCarat = 0;
    let totalValueTaxedBelow1ctPlusStones = 0;
    let below1ctTax1 = 0;
    let below1ctTax2 = 0;
    let belowFiveCentTotalWeight= 0;
    let belowFiveCentTotalAmount = 0;
    let aboveFiveCentTotalStone = 0;
    let belowFiveCentTotalStone= 0;
    let belowTotalPerCarat = 0;

    let contain49UpIndex = transaction.packingList.findIndex(x => x.weight > 0.49);
    if (contain49UpIndex > -1)
      contain49Up = true;

    let contain49DownIndex = transaction.packingList.findIndex(x => x.weight <= 0.49);
    if (contain49DownIndex > -1)
      contain49Down = true;

    if (transaction.transactionDetail.taxTypes.length > 0) {
      if (transaction.transactionDetail.taxTypes.length == 2) {
        taxNameOne = transaction.transactionDetail.taxTypes[0].name;
        taxPerOne = transaction.transactionDetail.taxTypes[0].rate;
        taxNameTwo = transaction.transactionDetail.taxTypes[1].name;
        taxPerTwo = transaction.transactionDetail.taxTypes[1].rate;
        blankHKLocal -= 2;
      }
      if (transaction.transactionDetail.taxTypes.length == 1) {
        taxNameOne = transaction.transactionDetail.taxTypes[0].name;
        taxPerOne = transaction.transactionDetail.taxTypes[0].rate;
        blankHKLocal -= 1;
      }
    }

    if (transaction.transactionDetail.shippingCharge > 0) {
      blankHKLocal -= 1;
    }

    if (transaction.packingList.length > 0) {
      totalStone = this.utilityService.ConvertToFloatWithDecimal(transaction.packingList.length);
      totalWeight = this.utilityService.ConvertToFloatWithDecimal(transaction.packingList.reduce((acc, cur) => acc + (cur.weight ? cur.weight : 0), 0));
      totalAmount = this.utilityService.ConvertToFloatWithDecimal(transaction.packingList.reduce((acc, cur) => acc + (cur.price.netAmount ? cur.price.netAmount : 0), 0));
      totalPerCarat = this.utilityService.ConvertToFloatWithDecimal(totalAmount / totalWeight);
      totalPayableAmount = this.utilityService.ConvertToFloatWithDecimal(totalAmount + (transaction.transactionDetail.shippingCharge ?? 0) + (Number(transaction.transactionDetail.expense) ?? 0) + (totalPayableAmount ?? 0));
      convertTotalPayableAmount = this.utilityService.ConvertToFloatWithDecimal(totalPayableAmount * (transaction.transactionDetail.toCurRate ?? 1))
    }

    if (transaction.transactionDetail.termType == 'Due')
      transaction.transactionDetail.terms = transaction.transactionDetail.terms + ' Days.';
    else
      transaction.transactionDetail.terms = transaction.transactionDetail.termType ?? "";

    if (taxNameOne.toLowerCase() == "igst" || taxNameTwo.toLowerCase() == "igst")
      isIGST = true

    //Above & Below Point Five Cent Carat Calculation
    const abovePointFiveCentData = transaction.packingList.filter((item: PackingItem) => item.weight > 0.49);
    const belowPointFiveCentData = transaction.packingList.filter((item: PackingItem) => item.weight <= 0.49);

    //Above 0.5 CT stones sum total
    if (abovePointFiveCentData.length > 0) {
      aboveFiveCentTotalStone = this.utilityService.ConvertToFloatWithDecimal(abovePointFiveCentData.length);
      aboveFiveCentTotalWeight = this.utilityService.ConvertToFloatWithDecimal(abovePointFiveCentData.reduce((acc, cur) => acc + (cur.weight ? cur.weight : 0), 0));
      aboveFiveCentAmont = this.utilityService.ConvertToFloatWithDecimal(abovePointFiveCentData.reduce((acc, cur) => acc + (cur.price.netAmount ? cur.price.netAmount : 0), 0));
      aboveTotalPerCarat = this.utilityService.ConvertToFloatWithDecimal(aboveFiveCentAmont / aboveFiveCentTotalWeight);
    }
    let above1ctSumTotalAmtConverted = (aboveFiveCentAmont ?? 0) * (transaction.transactionDetail.toCurRate ?? 1);

    if (taxPerOne > 0)
      above1ctTax1 = Number(parseFloat(parseFloat(this.utilityService.ConvertToFloatWithDecimal((taxPerOne * (above1ctSumTotalAmtConverted ?? 0)) / 100).toString()).toFixed(0)));

    if (taxPerTwo > 0)
      above1ctTax2 = Number(parseFloat(parseFloat(this.utilityService.ConvertToFloatWithDecimal((taxPerTwo * (above1ctSumTotalAmtConverted ?? 0)) / 100).toString()).toFixed(0)));

    totalValueTaxed1ctPlusStones = this.utilityService.ConvertToFloatWithDecimal(above1ctSumTotalAmtConverted + above1ctTax1 + above1ctTax2, 0);

    //Below 0.5 CT stones sum total
    if (belowPointFiveCentData.length > 0) {
      belowFiveCentTotalStone= this.utilityService.ConvertToFloatWithDecimal(belowPointFiveCentData.length);
      belowFiveCentTotalWeight= this.utilityService.ConvertToFloatWithDecimal(belowPointFiveCentData.reduce((acc, cur) => acc + (cur.weight ? cur.weight : 0), 0));
      belowFiveCentTotalAmount = this.utilityService.ConvertToFloatWithDecimal(belowPointFiveCentData.reduce((acc, cur) => acc + (cur.price.netAmount ? cur.price.netAmount : 0), 0));
      belowTotalPerCarat = this.utilityService.ConvertToFloatWithDecimal(belowFiveCentTotalAmount / belowFiveCentTotalWeight);
    }
    let belowFiveCentSumTotalAmtConverted = (belowFiveCentTotalAmount ?? 0) * (transaction.transactionDetail.toCurRate ?? 1);

    if (taxPerOne > 0)
      below1ctTax1 = Number(parseFloat(parseFloat(this.utilityService.ConvertToFloatWithDecimal((taxPerOne * (belowFiveCentSumTotalAmtConverted ?? 0)) / 100).toString()).toFixed(0)));

    if (taxPerTwo > 0)
      below1ctTax2 = Number(parseFloat(parseFloat(this.utilityService.ConvertToFloatWithDecimal((taxPerTwo * (belowFiveCentSumTotalAmtConverted ?? 0)) / 100).toString()).toFixed(0)));

    totalValueTaxedBelow1ctPlusStones = this.utilityService.ConvertToFloatWithDecimal(belowFiveCentSumTotalAmtConverted + below1ctTax1 + below1ctTax2, 0);

    if (invoiceType == "UAELOCAL" || invoiceType == "UAEOVERSEAS") {
      let maxRow = 14;
      if (invoiceType == "UAEOVERSEAS")
        maxRow = 15;

      htmlString += `<body onload="window.print(); window.close();">
      <div class="dmcc-main">
        <div class="dmcc-head">
          <div class="head-left">
            <img src="assets/billimage/dmcc.png" alt="logo" />
            <p><b>Rough & Polished Diamonds - Import & Export</b></p>
          </div>
          <div class="head-right">
            <span><b>TRN No :</b>` + transaction.number + `</span>
            <span><b>Invoice No :</b>` + transaction.refNumber?.replace('-', '') + `</span>
            <span><b>Invoice Date :</b>` + this.utilityService.getISOtoStringDate(transaction.transactionDate) + `</span>`;

      if (invoiceType == "UAELOCAL")
        htmlString += `<span><b>Delivery :</b> hand to hand</span>`;

      if (transaction.transactionDetail.termType == 'Due')
        htmlString += `<span><b>Terms :</b>` + transaction.transactionDetail.terms + ` Days</span>`;
      else
        htmlString += `<span><b>Terms :</b>` + (transaction.transactionDetail.termType != null ? transaction.transactionDetail.termType : '') + `</span>`;
      if (transaction.transactionDetail.dueDate)
        htmlString += `<span><b>Due Date :</b>` + this.utilityService.getISOtoStringDate(transaction.transactionDetail.dueDate) + `</span>`;
      else
        htmlString += `<span><b>Due Date :</b></span>`;

      if (invoiceType == "UAEOVERSEAS") {
        htmlString += `<span><b>CIF :</b>` + transaction.toLedger.address.country + `</span>
              <span><b>Shipped By :</b>` + (transaction.transactionDetail.logistic.name != null ? transaction.transactionDetail.logistic.name : '') + `</span>
              <span><b>Insured By :</b>` + (transaction.transactionDetail.logistic.name != null ? transaction.transactionDetail.logistic.name : '') + `</span>`;
      }
      else {
        htmlString += `<span><b>Destination :</b>Dubai</span>
          <span><b>&nbsp;</b>Ref.=LOCAL</span>
          <span>&nbsp;</span>`;
      }

      htmlString += `</div>
        </div>
    
        <div class="buyer-detail">
          <strong>Buyer :</strong>
          <p>
            <b>` + transaction.toLedger.name + `</b><br>
            ` + (transaction.toLedger.address == null || transaction.toLedger.address?.line1 == null ? '<br>' : transaction.toLedger.address.line1 + '<br>') + `
            ` + (transaction.toLedger.address == null || transaction.toLedger.address?.line2 == null ? '' : transaction.toLedger.address.line2 + '<br>') + `
            ` + (transaction.toLedger.address == null || transaction.toLedger.address?.city == null ? transaction.toLedger.address.country + '<br>' : (transaction.toLedger.address.city + ` ` + transaction.toLedger.address.zipCode + '<br>'));

      //We are using Add. Declaration as TRN No. in SD invoice
      if (invoiceType == "UAELOCAL")
        htmlString += `TRN NO : ` + (transaction.transactionDetail.additionalDeclaration != null ? transaction.transactionDetail.additionalDeclaration : '');
      else
        htmlString += `PHONE : ` + transaction.toLedger.mobileNo;

      htmlString += `</p>
        </div>
    
        <div class="tbl-detail">
          <strong>TAX INVOICE</strong>
          <strong>NATURAL POLISHED DIAMOND</strong>
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Description</th>
                <th>Carats</th>
                <th>Rate In US $</th>
                <th>Amt In US $</th>
                <th>Amt In AED</th>
              </tr>
            </thead>
            <tbody>`;

      if (transaction.packingList.length > maxRow) {
        if (transaction.items && transaction.items.length > 0) {
          htmlString += `
                <tr>
                <td>#1</td>
                <td>0.50 CT ABOVE SIZE</td>
                <td>` + this.utilityService.ConvertToFloatWithDecimalTwoDigitRound(aboveFiveCentTotalWeight) + `</td>
                <td>` + this.utilityService.ConvertToFloatWithDecimalTwoDigitRound(aboveTotalPerCarat) + `</td>
                <td>` + this.utilityService.ConvertToFloatWithDecimalTwoDigitRound(aboveFiveCentAmont) + `</td>
                <td>` + this.utilityService.ConvertToFloatWithDecimalTwoDigitRound(this.accountingconfigService.getFromToCurrencyRate('USD', 'AED', this.accountingConfigData.currencyConfigs).toRate * aboveFiveCentAmont) + `</td>
              </tr>`;

          htmlString += `
                <tr>
                <td></td>
                <td>CUT & POLISHED DIAMONDS </td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>`;

          htmlString += `
                <tr>
                <td></td>
                <td>AS PER PACKING LIST 1</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>`;

          htmlString += `
                <tr>
                <td>&nbsp</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>`;

          htmlString += `
                <tr>
                <td>#2</td>
                <td>0.50 CT BELOW SIZE</td>
                <td>` + this.utilityService.ConvertToFloatWithDecimalTwoDigitRound(belowFiveCentTotalWeight) + `</td>
                <td>` + this.utilityService.ConvertToFloatWithDecimalTwoDigitRound(belowTotalPerCarat) + `</td>
                <td>` + this.utilityService.ConvertToFloatWithDecimalTwoDigitRound(belowFiveCentTotalAmount) + `</td>
                <td>` + this.utilityService.ConvertToFloatWithDecimalTwoDigitRound(this.accountingconfigService.getFromToCurrencyRate('USD', 'AED', this.accountingConfigData.currencyConfigs).toRate * belowFiveCentTotalAmount) + `</td>
              </tr>`;

          htmlString += `
                <tr>
                <td></td>
                <td>CUT & POLISHED DIAMONDS </td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>`;

          htmlString += `
                <tr>
                <td></td>
                <td>AS PER PACKING LIST 2</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>`;
        }
        else {
          htmlString += `
                <tr>
                <td>#1</td>
                <td>CUT & POLISHED DIAMONDS</td>
                <td>0</td>
                <td>0</td>
                <td>` + this.utilityService.ConvertToFloatWithDecimalTwoDigitRound(transaction.netTotal) + `</td>
                <td>0</td>
              </tr>`;
        }

        for (let index = 0; index < (maxRow - 7); index++) {
          htmlString += `
                <tr>
                <td>&nbsp;</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>`;
        }
      }
      else if (transaction.packingList.length <= maxRow) {
        for (let i = 0; i < transaction.packingList.length; i++) {
          const element = transaction.packingList[i];
          htmlString += `
                <tr>
                <td>#` + (i + 1) + `</td>
                <td>` + element.lab + ` ` + element.certificateNo + `</td>
                <td>` + this.utilityService.ConvertToFloatWithDecimalTwoDigitRound(element.weight) + `</td>
                <td>` + this.utilityService.ConvertToFloatWithDecimalTwoDigitRound(element.price.rap ?? 0) + `</td>
                <td>` + this.utilityService.ConvertToFloatWithDecimalTwoDigitRound(element.price.netAmount ?? 0) + `</td>
                <td>` + this.utilityService.ConvertToFloatWithDecimalTwoDigitRound(this.accountingconfigService.getFromToCurrencyRate('USD', 'AED', this.accountingConfigData.currencyConfigs).toRate * (element.price?.netAmount ?? 0)) + `</td>
              </tr>`;
        }

        if (transaction.packingList.length != maxRow) {
          for (let index = 0; index < (maxRow - transaction.packingList.length); index++) {
            htmlString += `
                  <tr>
                  <td>&nbsp;</td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>`;
          }
        }
      }
      else {
        if (transaction.items && transaction.items.length > 0) {
          htmlString += `
                <tr>
                <td>#1</td>
                <td>0.50 CT ABOVE SIZE</td>
                <td>` + this.utilityService.ConvertToFloatWithDecimalTwoDigitRound(aboveFiveCentTotalWeight) + `</td>
                <td>` + this.utilityService.ConvertToFloatWithDecimalTwoDigitRound(aboveTotalPerCarat) + `</td>
                <td>` + this.utilityService.ConvertToFloatWithDecimalTwoDigitRound(aboveFiveCentAmont) + `</td>
                <td>` + this.utilityService.ConvertToFloatWithDecimalTwoDigitRound(this.accountingconfigService.getFromToCurrencyRate('USD', 'AED', this.accountingConfigData.currencyConfigs).toRate * aboveFiveCentAmont) + `</td>
              </tr>`;

          htmlString += `
                <tr>
                <td></td>
                <td>CUT & POLISHED DIAMONDS </td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>`;

          htmlString += `
                <tr>
                <td></td>
                <td>AS PER PACKING LIST 1</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>`;

          htmlString += `
                <tr>
                <td>&nbsp</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>`;

          htmlString += `
                <tr>
                <td>#2</td>
                <td>0.50 CT BELOW SIZE</td>
                <td>` + this.utilityService.ConvertToFloatWithDecimalTwoDigitRound(belowFiveCentTotalWeight) + `</td>
                <td>` + this.utilityService.ConvertToFloatWithDecimalTwoDigitRound(belowTotalPerCarat) + `</td>
                <td>` + this.utilityService.ConvertToFloatWithDecimalTwoDigitRound(belowFiveCentTotalAmount) + `</td>
                <td>` + this.utilityService.ConvertToFloatWithDecimalTwoDigitRound(this.accountingconfigService.getFromToCurrencyRate('USD', 'AED', this.accountingConfigData.currencyConfigs).toRate * belowFiveCentTotalAmount) + `</td>
              </tr>`;

          htmlString += `
                <tr>
                <td></td>
                <td>CUT & POLISHED DIAMONDS </td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>`;

          htmlString += `
                <tr>
                <td></td>
                <td>AS PER PACKING LIST 2</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>`;
        }
        else {
          htmlString += `
                <tr>
                <td>#1</td>
                <td>CUT & POLISHED DIAMONDS</td>
                <td>0</td>
                <td>0</td>
                <td>` + this.utilityService.ConvertToFloatWithDecimalTwoDigitRound(transaction.netTotal) + `</td>
                <td>0</td>
              </tr>`;
        }

        for (let index = 0; index < (maxRow - 7); index++) {
          htmlString += `
                      <tr>
                      <td>&nbsp;</td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>`;
        }
      }

      htmlString += `<tr class="brd-remove">
                <th colspan="2" style="text-align: right;">Total Weight</th>
                <th>` + this.utilityService.ConvertToFloatWithDecimalTwoDigitRound(transaction.items[0].weight) + `</th>
                <th></th>
                <th style="border: 1px solid !important;">` + this.utilityService.ConvertToFloatWithDecimalTwoDigitRound(transaction.amount) + `</th>
                <th style="border: 1px solid !important;">` + this.utilityService.ConvertToFloatWithDecimalTwoDigitRound(this.accountingconfigService.getFromToCurrencyRate('USD', 'AED', this.accountingConfigData.currencyConfigs).toRate * transaction.items[0].amount) + `</th>
              </tr>
              <tr class="brd-remove">
                <th></th>
                <th>VAT : N/A</th>
                <th colspan="2" style="text-align: right;"></th>
                <th></th>
              </tr>
              <tr class="brd-remove">
                <th></th>`;

      if (invoiceType == "UAEOVERSEAS")
        htmlString += `<th style="text-align: right;color: red;">Payable Only in US $</th>`;
      else
        htmlString += `<th></th>`;

      htmlString += `<th colspan="2" style="color: red;">1 US$= ` + this.accountingconfigService.getFromToCurrencyRate('USD', 'AED', this.accountingConfigData.currencyConfigs).toRate + ` AED</th>
                <th></th>
                <th></th>
              </tr>
            </tbody>
          </table>
        </div>
    
        <strong style="padding-left: 20px;">PAYMENT INSTRUCTION</strong>
        <div class="payment-detail">
          <div class="payment-grid">
            <div class="grid">
              <p><u>BANK NAME</u></p>
              <p><b>NATIONAL BANK OF FUJAIRAH</b></p>
            </div>
            <div class="grid">
              <p><u>IBAN NO</u></p>
              <p><b>NATIONAL BANK OF FUJAIRAH</b></p>
            </div>
            <div class="grid">
              <p><u>SWIFT</u></p>
              <p><b>NBFUAEAF</b></p>
            </div>
    
            <div class="grid">
              <p><u>INTERMEDIARY BANK</u></p>
              <p><b>STANDARD CHARTERED BANK NY</b></p>
            </div>
            <div class="grid">
            </div>
            <div class="grid">
              <p><u>SWIFT</u></p>
              <p><b>SCBLUS33</b></p>
            </div>`;

      if (invoiceType == "UAELOCAL") {
        htmlString += `<div class="grid">
                    </div>
                    <div class="grid" style="text-align:center;">
                      <p><b>(AED) A/C #  0342030993001</b></p>
                    </div>
                    <div class="grid">
                    </div>`;
      }
      else {
        htmlString += `<div class="grid">
                    </div>
                    <div class="grid">
                    </div>
                    <div class="grid">
                    </div>`;
      }

      htmlString += `</div>`;

      if (invoiceType == "UAEOVERSEAS")
        htmlString += `<strong>* TERMS: [Part payment allowed before or after due date ]</strong>`;
      else
        htmlString += `<div style="text-align:center;"><b>IBAN NO: </b>AE85 0400 0003 42030993001 AED</div><br/>`;


      htmlString += `</div>
    
        <div class="td-detail">
          <p>The diamonds here in invoiced are exclusively of natural origin and untreated based on personal knowledge
            and/or written guarantees provided by the supplier of these diamonds.</p>
          <span><b>Declaration</b></span>
          <p>"The diamonds herein invoiced have been sourced from legitimate sources not involved in funding conflict, in
            compliance with United Nations Resolutions and corresponding national laws. The seller hereby guarantees that
            these diamonds are conflict free and confirms adherence to the WDC SoW Guidelines."</p>
        </div>
    
        <div class="dmcc-footer">
          <div class="grid">
            <p><strong>DIAMOON DMCC</strong></p>
            <p>
              Unit No. 18-B, ALMAS TOWER,<br>
              JUMEIRAH LAKE TOWER,<br>
              Dubai, United Arab Emirates.
            </p>
          </div>
          <div class="grid">
            <p><br></p>
            <p>
              <span><b>Phone No. :</b>+971 505961453</span>
              <span><b>E-mail :</b>info@diamoondmcc.com</span>
            </p>
          </div>
          <div class="grid">
            <strong class="sign">FOR DIAMOON DMCC</strong>
          </div>
        </div>
    
      </div>`;

      if (transaction.packingList.length > maxRow) {
        //Above 1 CT PL
        htmlString += `
          <div class="body-middle">

          <table>
            <tr>
            <td><b>INV. NO : </b>` + transaction.refNumber?.replace('-', '') + `</td>
            </tr>
            <tr>
            <td colspan="3"><b>Packing List 1</b></td>
            </tr>
          </table>

          <table>
            <thead>
              <th>No</th>
              <th>STONE ID</th>
              <th>SHAPE</th>
              <th>CARATS</th>
              <th>COLOR</th>
              <th>CLARITY</th>
              <th>LAB</th>  
              <th>CERTI. NO</th>          
              <th>RATE `+ transaction.transactionDetail.fromCurrency + ` PER CT</th>
              <th>TOTAL AMOUNT `+ transaction.transactionDetail.fromCurrency + `</th>
            </thead>
            <tbody>`

        for (let index = 0; index <= abovePointFiveCentData.length; index++) {
          let obj = abovePointFiveCentData[index];
          if (obj) {
            htmlString += `
                    <tr>
                    <td>`+ (index + 1) + `</td>
                    <td>`+ (obj.stoneId ?? "") + `</td>
                    <td>`+ (obj.shape ?? "") + `</td>
                    <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.weight ?? 0) ?? "") + `</td>
                    <td>`+ (obj.color ?? "") + `</td>
                    <td>`+ (obj.clarity ?? "") + `</td>
                    <td>`+ (obj.lab ?? "") + `</td>
                    <td>`+ (obj.certificateNo ?? "") + `</td>
                    <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.perCarat ?? 0) ?? "") + `</td>
                    <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.netAmount ?? 0) ?? "") + `</td>
                    </tr>`
          }
        }

        htmlString += `
            </tbody>
            </table>
            </div>`

        //Below 1 CT PL    
        htmlString += `
          <div class="body-middle" style="page-break-before: always;">

          <table>
            <tr>
            <td><b>INV. NO : </b>` + transaction.refNumber?.replace('-', '') + `</td>
            </tr>
            <tr>
            <td colspan="3"><b>Packing List 2</b></td>
            </tr>
          </table>

          <table>
            <thead>
              <th>No</th>
              <th>STONE ID</th>
              <th>SHAPE</th>
              <th>CARATS</th>
              <th>COLOR</th>
              <th>CLARITY</th>
              <th>LAB</th>  
              <th>CERTI. NO</th>          
              <th>RATE `+ transaction.transactionDetail.fromCurrency + ` PER CT</th>
              <th>TOTAL AMOUNT `+ transaction.transactionDetail.fromCurrency + `</th>
            </thead>
            <tbody>`

        for (let index = 0; index <= belowPointFiveCentData.length; index++) {
          let obj = belowPointFiveCentData[index];
          if (obj) {
            htmlString += `
                    <tr>
                    <td>`+ (index + 1) + `</td>
                    <td>`+ (obj.stoneId ?? "") + `</td>
                    <td>`+ (obj.shape ?? "") + `</td>
                    <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.weight ?? 0) ?? "") + `</td>
                    <td>`+ (obj.color ?? "") + `</td>
                    <td>`+ (obj.clarity ?? "") + `</td>
                    <td>`+ (obj.lab ?? "") + `</td>
                    <td>`+ (obj.certificateNo ?? "") + `</td>
                    <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.perCarat ?? 0) ?? "") + `</td>
                    <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.netAmount ?? 0) ?? "") + `</td>
                    </tr>`
          }
        }

        htmlString += `
            </tbody>
            </table>
            </div>`
      }

      htmlString += `
        </body>
        </html>
        `;
    }

    return htmlString;
  }
}
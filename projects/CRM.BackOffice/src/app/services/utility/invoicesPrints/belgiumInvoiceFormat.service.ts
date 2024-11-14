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
export class BelgiumInvoiceFormatService {
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
    const colspanValue = transaction.transactionDetail.isShowOrigin ? 7 : 6;

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

    if (invoiceType == "BELGIUMLOCAL") {
      let SumTotalAmtWithTax = 0;
      let tax1 = 0;
      let tax2 = 0;

      if (taxPerOne > 0)
        tax1 = Number(parseFloat(parseFloat(this.utilityService.ConvertToFloatWithDecimal((taxPerOne * (totalAmount ?? 0)) / 100).toString()).toFixed(2)));

      if (taxPerTwo > 0)
        tax2 = Number(parseFloat(parseFloat(this.utilityService.ConvertToFloatWithDecimal((taxPerTwo * (totalAmount ?? 0)) / 100).toString()).toFixed(2)));

      SumTotalAmtWithTax += this.utilityService.ConvertToFloatWithDecimalTwoDigitRoundWithNum(totalAmount + tax1 + tax2 + (transaction.transactionDetail.shippingCharge ?? 0) + (Number(transaction.transactionDetail.expense) ?? 0));

      htmlString += `    
  <body onload="window.print(); window.close();">   
    <div class="chal-wrap con-inv di-inv">
      <div class="chal-head">
        <div class="logo">
        <img src="assets/billimage/CGNew.png" alt="logo">
        </div>

        <div class="di-info cg-local">
        <span>Rough & Polished Diamonds - Import & Export</span>                
        </div>

        <div class="cd-details">            
            <p><b>BTW: ` + (transaction.transactionDetail.organization.incomeTaxNo ?? "") + `</b></p> 
            <p style="flex-basis: 248px;"><b>HRAnt: -351.856</b></p>
		    </div>
      </div>
      <div class="chal-body">
      <span class="c-st border-bottom-2" style="display: block;margin: auto;width: 150px;text-align: center;margin-top: 10px;
      margin-bottom: 20px;"> `+ ((transaction.transactionType.toLowerCase() == "proforma") ? "PROFORMA INVOICE" : "DELIVERY INVOICE") + `</span>
        <div class="body-top ps-1 border-bottom-0">
          <div class="bo-left">
          <span class="c-st text-start"><b>BUYER</b> ` + transaction.toLedger.name + `</span>          
          <span><b style="float:left">ADDRESS</b> 
          <span class="txt-left">&nbsp;` + (transaction.toLedger.address.line1 ? transaction.toLedger.address.line1 + `,` : "") + `
          </br>`
      if (transaction.toLedger.address.line2) {
        htmlString += `          
        &nbsp;&nbsp`+ (transaction.toLedger.address.line2 ?? "") + `</br>
          `
      }
      htmlString += `                
      &nbsp;&nbsp`+ (transaction.toLedger.address.zipCode ? transaction.toLedger.address.zipCode + `, ` : "") + " " + (transaction.toLedger.address.city ? transaction.toLedger.address.city + `, ` : "") + `
          </br>
          &nbsp;&nbsp`+ (transaction.toLedger.address.country ?? "") + `
          </span>
          </span>`
      if (transaction.toLedger.taxNo || transaction.toLedger.incomeTaxNo) {
        if (transaction.transactionDetail.organization.address?.country.toLowerCase() == transaction.toLedger.address.country.toLowerCase()) {
          htmlString += `
          <span><b>BTW</b> ` + (transaction.toLedger.taxNo ?? "") + ` ` + (transaction.toLedger.incomeTaxNo ?? "") + `</span>  
          `}
        else {
          htmlString += `
          <span><b>VAT NO</b> ` + (transaction.toLedger.taxNo ?? "") + ` ` + (transaction.toLedger.incomeTaxNo ?? "") + `</span>  
          `}
      }

      if (transaction.toLedger.mobileNo || transaction.toLedger.phoneNo) {
        htmlString += `
          <span><b>TEL</b> ` + (transaction.toLedger.mobileNo ? transaction.toLedger.mobileNo + `,` : "") + (transaction.toLedger.phoneNo ? transaction.toLedger.phoneNo + `,` : "") + `</span>                                        
          </div>
          `
      }
      else {
        htmlString += `
        <span>&nbsp</span>                                        
        </div>
        `
      }

      if (transaction.transactionDetail.consigneeName) {
        htmlString += `
          <div class="di-bor-0 ship-section">
          <span class="c-st text-start"><b>SHIP TO</b><strong>&nbsp;` + (transaction.transactionDetail.consigneeName ?? "") + `</strong></span>
          <span class="c-st text-start"><b style="float:left;">SHIP ADDRESS</b><span class="txt-left">&nbsp;` + (transaction.transactionDetail.consigneeAddress ?? "") + `</span></span>
          </div>`
      }

      htmlString += `
        <div class="di-bor-0 inv-section">
        <span class="c-st text-start"><b>INVOICE NO</b> ` + transaction.refNumber + `</span>
        <span class="c-st text-start"><b>DATE</b> ` + this.utilityService.getISOtoStringDate(transaction.transactionDate) + `</span>
        <span class="c-st text-start"><b style="float:left">TERMS </b> <span class="txt-left">&nbsp;` + (transaction.transactionDetail.terms ?? "") + `</span></span> 
        <span class="c-st text-start"><b style="float:left">ORIGIN </b> <span class="txt-left">&nbsp;`+ 'INDIA' + `</span></span> 
        `
      if (transaction.transactionDetail.dueDate) {
        htmlString += `
        <span class="c-st text-start"><b>DUE DATE</b> ` + this.utilityService.getISOtoStringDate(transaction.transactionDetail.dueDate) + `</span> 
        `
      }

      htmlString += `
          </div>
          </div>
          `

      if (transaction.packingList.length > 10 || (transaction.transactionDetail.isPackingList)) {
        htmlString += `
        <div class="body-middle" style="margin-top: 10px;">
          <table>
            <thead>
              <th>No</th>                       
              <th colspan="8">DESCRIPTION</th>              
              <th>CARATS</th>
              <th>RATE `+ transaction.transactionDetail.fromCurrency + ` PER CT</th>
              <th>TOTAL AMOUNT `+ transaction.transactionDetail.fromCurrency + `</th>
            </thead>
            <tbody>`

        htmlString += `
                <tr>
                <td></td>
                <td colspan="8">CUT & POLISHED DIAMONDS</td>  
                <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(totalWeight) + `</td>
                <td>`+ totalPerCarat + `</td>
                <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(totalAmount) + `</td>
                </tr>`
      }

      else if (transaction.packingList.length < 11) {
        htmlString += `
        <div class="body-middle" style="margin-top: 10px;">
          <table>
          <thead>
          <th colspan="2">No</th>
          <th>STONE ID</th>
          <th>SHAPE</th>          
          <th>COLOR</th>
          <th>CLARITY</th>
          <th>LAB</th>       
          <th colspan="2">CERTI. NO</th> 
          <th>CARATS</th>  
          <th>RATE `+ (transaction.transactionDetail.fromCurrency ?? "") + ` /PER CT</th>
          <th>TOTAL AMOUNT `+ (transaction.transactionDetail.fromCurrency ?? "") + `</th>            
          </thead>
          <tbody>`

        for (let index = 0; index <= transaction.packingList.length; index++) {
          let obj = transaction.packingList[index];
          if (obj) {
            htmlString += `            
              <tr>
              <td colspan="2">`+ (index + 1) + `</td>
              <td>`+ (obj.stoneId ?? "") + `</td>
              <td>`+ (obj.shape ?? "") + `</td>
              <td>`+ (obj.color ?? "") + `</td>
              <td>`+ (obj.clarity ?? "") + `</td>
              <td>`+ (obj.lab ?? "") + `</td>
              <td colspan="2">`+ (obj.certificateNo ?? "") + `</td>             
              <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.weight ?? 0) ?? "") + `</td>
              <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.perCarat ?? 0) ?? "") + `</td>
              <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.netAmount ?? 0) ?? "") + `</td>
              </tr>`
          }
        }
      }

      htmlString += ` 
      <tr>
      <td colspan="9" style="text-align:right; padding-right:10px;"><strong>Sub Total</strong></td>      
      <td><strong>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(totalWeight) + `</strong></td>
      <td><strong>`+ totalPerCarat + `</strong></td>
      <td><strong>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(totalAmount) + ` (` + transaction.transactionDetail.fromCurrency + `)</strong></td>
      </tr>`

      if (taxPerOne) {
        htmlString += `
                <tr>
                <td colspan="11" style="text-align:right; padding-right:10px;" >`+ taxNameOne + ` ( ` + taxPerOne + ` % ) </td>
                <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit((taxPerOne * (totalAmount ?? 0)) / 100) + `</td>
                </tr>`
      }
      if (transaction.transactionDetail.shippingCharge > 0 || Number(transaction.transactionDetail.expense) > 0) {
        htmlString += `
                <tr>
                <td colspan="11" style="text-align:right; padding-right:10px;">Charges</td> 
                <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigitRoundWithNum((transaction.transactionDetail.shippingCharge ?? 0) + (Number(transaction.transactionDetail.expense) ?? 0)) + `</td>
                </tr>`
      }

      htmlString += `                        
            </tbody>
            <tfoot>
            <tr class="border-left-0 border-bottom-0">`

      /*if (transaction.transactionDetail.toCurrency && (transaction.transactionDetail.fromCurrency != transaction.transactionDetail.toCurrency)) {
        htmlString += `                     
                    <td colspan="9" style="color:red">`+ transaction.transactionDetail.fromCurRate + ` (` + transaction.transactionDetail.toCurrency + `) ` + `= ` + (1 / (transaction.transactionDetail.toCurRate ?? 0)).toFixed(4) + ` (` + transaction.transactionDetail.fromCurrency + `)` + `</td>
                    <td style="color:red">`+ (totalPayableAmount * (transaction.transactionDetail.toCurRate ?? 0)).toFixed(2) + ` (` + transaction.transactionDetail.toCurrency + `)</td>                  
                  `
      }
      else {
        htmlString += `<td colspan="10" class="border-left-0 border-bottom-0 border-top-0"></td>`
      }*/

      htmlString += `                     
                    <td colspan="9" style="color:red">1 (EURO) = ` + ((this.EuroToUSDRate ?? 0)).toFixed(4) + ` (USD)` + `</td>
                    <td style="color:red">`+ (Number(this.utilityService.ConvertToFloatWithDecimalTwoDigit(SumTotalAmtWithTax)) * (1 / this.EuroToUSDRate ?? 0)).toFixed(2) + ` (EURO)</td>                  
                  `

      htmlString += `
            <td  style="text-align:right; padding-right:10px;"><strong>TOTAL TO PAY</strong></td>                          
            <td class="clr-yellow" style="font-size:18px"><strong>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(SumTotalAmtWithTax) + ` (` + transaction.transactionDetail.fromCurrency + `)</strong></td>                         
            </tr> ` ;

      htmlString += `  
            </tfoot>
          </table>
          </div>
          `

      htmlString += ` 
        <div class="body-fotter">  

        <div class="body-middle" style="margin: 20px 0;"> 
        </div> 

        <div class="border-left-2 border-right-2" style="border-top: 2px solid;">
        <div class="bo-left border-bottom-2 ps-1">       
              <span class="c-st text-start"><strong>Payment instructions:</strong></span>
              <table class="cg-tbl">
              <tbody>
              `
      if (transaction.transactionDetail.bank.accountName) {
        htmlString += `  
              <tr>
              <td>ACCOUNT NAME</td>
              <td>: <b>`+ (transaction.transactionDetail.bank.accountName ?? "") + `</b></td>
              </tr>
              `
      }
      if (transaction.transactionDetail.bank.bankName) {
        htmlString += `
              <tr>
              <td>BANK NAME</td>
              <td>: <b>`+ (transaction.transactionDetail.bank.bankName ?? "") + `</b></td>
              </tr>
              `
      }
      if (transaction.transactionDetail.bank.iBan) {
        htmlString += `
              <tr>
              <td>IBAN NO</td>
              <td>: <b>`+ (transaction.transactionDetail.bank.iBan ?? "") + `</b></td>
              </tr>
              `
      }
      if (transaction.transactionDetail.bank.accountNo) {
        htmlString += `
              <tr>
              <td>A/C NO</td>
              <td>: <b>`+ (transaction.transactionDetail.bank.accountNo ?? "") + `</b></td>
              </tr>
              `
      }
      if (transaction.transactionDetail.bank.swift) {
        htmlString += `
              <tr>              
              <td>SWIFT CODE</td>
              <td>: <b>`+ (transaction.transactionDetail.bank.swift ?? "") + `</b></td>
              </tr>
              `
      }
      if (transaction.transactionDetail.bank.address.line1) {
        htmlString += `
              <tr>
              <td>BANK ADDRESS</td>
              <td>: <b>`+ (transaction.transactionDetail.bank.address.line1 ? transaction.transactionDetail.bank.address.line1 + `,` : "") + (transaction.transactionDetail.bank.address.line2 ? transaction.transactionDetail.bank.address.line2 + `,` : "") + (transaction.transactionDetail.bank.address.city ? transaction.transactionDetail.bank.address.city + `,` : "")
          + (transaction.transactionDetail.bank.address.country ? transaction.transactionDetail.bank.address.country + `,` : "") + (transaction.transactionDetail.bank.address.zipCode ?? "") + `</b></td>
              </tr>   
              `
      }
      if (transaction.transactionDetail.bank.intermediaryBankName) {
        htmlString += `
              <tr>
                <td>INTERMEDIATE BANK</td>
                <td>: <b>`+ (transaction.transactionDetail.bank.intermediaryBankName ?? "") + `</b></td>                        
              </tr>  
              `
      }
      if (transaction.transactionDetail.bank.intermediaryBankswift) {
        htmlString += `
              <tr>
                <td>INTERMEDIATE SWIFTCODE</td>                      
                <td>: <b>`+ (transaction.transactionDetail.bank.intermediaryBankswift ?? "") + `</b></td>
              </tr>     
              `
      }
      if (transaction.transactionDetail.bank.intermediaryBankAddress) {
        htmlString += `   
              <tr>
                <td>INTERMEDIATE ADDRESS</td>                       
                <td>: <b>`+ (transaction.transactionDetail.bank.intermediaryBankAddress ?? "") + `</b></td>                        
              </tr>  
              `
      }
      htmlString += `
            </tbody>
            </table>
            </div>   
            </div>
          </div>
          `

      htmlString += ` 
        <div class="body-f-footer">
        <span class="c-st border-bottom-2">GUIDELINES</span>
        <ul>
        <li><b>Bank Charges On Buyer Only : Payment Must Include All Bank Charges (Including Intermediatary Bank Charges)</b></li>
        <li><b>ONLY US$ PAYMENT : Buyer have to pay in USD($) only, As we have USD($) account in related Bank. We will be not responsible for payments made in any other currencies.</b></li>
        <li>This sale is done with retention of title. The buyer will only become owner of the goods after full payment of this
        invoice. The buyer acknowledged that this invoice is pledged to ` + (transaction.transactionDetail.bank.bankName ?? "") + ` and that releases can
        only be obtained through payment on the account of the seller at ` + (transaction.transactionDetail.bank.bankName ?? "") + ` as mentioned on this
        invoice. This invoice may never be compensated with claims from the buyer on the seller.</li>
        <li>The diamonds here in invoiced are exclusively of natural origin and untreated based on personal knowledge and/or
        written guarantees provided by the supplier of these diamonds.</li>
        <li>The diamonds herein invoiced have been purchased from legitimate sources not involved in funding conflict and in
        compliance with United Nation resolutions. The seller hereby guarantees that these diamonds are conflict free, based
        on personal knowledge and/or written guarantees provided by the supplier of these diamonds. </li>      
        <b style="text-decoration: underline;">H.R.A 351 856, BTW BE 0478 554 943 </b>      
       `+ (transaction.toLedger.address.country.toLowerCase() == 'belgium' ? `<li>The Antwerp Tribunal of Commerce is solely competent in case of litigation Vrij van B.T.W. Art. 42§4 van het Wetboek. Above mentioned good will be consignment until receipt of the payment of this invoice.</li>` : `<li>The Antwerp Tribunal of Commerce is solely competent in case of litigation Vrij van B.T.W. Art. 39 van het Wetboek. Above mentioned good will be consignment until receipt of the payment of this invoice. </li>`)

      if (transaction.transactionDetail.additionalDeclaration) {
        htmlString += `<li>` + (transaction.transactionDetail.additionalDeclaration ?? "") + `</li>`
      }
      htmlString += `  
        </ul>
        </div>
        `
      var startCount: number;
      var endCount: number;
      startCount = 0;
      endCount = 0;

      if (transaction.packingList.length > 10 || transaction.transactionDetail.isPackingList) {//Summary
        startCount = 5;
        if (isCGMail)
          endCount = 12;
        else
          endCount = 15;
      }
      else if (transaction.packingList.length < 11) {//PL
        startCount = transaction.packingList.length;
        if (isCGMail)
          endCount = 11 - transaction.packingList.length;
        else
          endCount = 14 - transaction.packingList.length;
      }

      if (transaction.transactionDetail.taxTypes.length > 0)
        endCount = endCount - 1
      if (transaction.transactionDetail.shippingCharge > 0)
        endCount = endCount - 1
      if (transaction.transactionDetail.consigneeName)
        endCount = endCount - 2
      if (transaction.toLedger.address.line2)
        endCount = endCount - 2
      if (transaction.transactionDetail.additionalDeclaration)
        endCount = endCount - 1
      if (transaction.toLedger.mobileNo || transaction.toLedger.phoneNo)
        endCount = endCount - 1
      if (transaction.transactionDetail.bank.address.line1)
        endCount = endCount - 1
      if (transaction.transactionDetail.bank.intermediaryBankAddress)
        endCount = endCount - 1
      if (transaction.toLedger.taxNo || transaction.toLedger.incomeTaxNo)
        endCount = endCount - 1
      if (!transaction.transactionDetail.bank.iBan)
        endCount = endCount + 1
      if (taxPerOne)
        endCount = endCount - 2

      for (let index = startCount; index <= endCount; index++) {
        htmlString += `
                            <table class="border-remove">
                            <tr>
                            <td>&nbsp</td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            </tr>   
                            </table>               
                            `
      }

      htmlString += `
      <span class="dt-last">Date : ` + this.utilityService.getISOtoStringDate(transaction.transactionDate) + `</span>
        <div class="di-info cg-local border-top-2">
        <span>
        <b>` + (transaction.transactionDetail.organization.name ?? "") + ` : </b>&nbsp` + (transaction.transactionDetail.organization.address?.line1 ?? "") + `,&nbsp` + (transaction.transactionDetail.organization.address?.line2 ?? "") + ",&nbsp" + (transaction.transactionDetail.organization.address?.zipCode ?? "") + ",&nbsp" + (transaction.transactionDetail.organization.address?.city ?? "") + `,&nbsp` + (transaction.transactionDetail.organization.address?.country ?? "") + `
        </span>
        <span><b>GSM :</b> ` + (transaction.transactionDetail.organization.mobileNo ?? "") + `, <b>TEL :</b>` + (transaction.transactionDetail.organization.phoneNo ?? "") + `&nbsp;&nbsp;<b>Email :</b>
        ` + (transaction.transactionDetail.organization.email ?? "") + `</span>
        </div>
        </div>
        </div>
      </div>
    </div>
    `

      if (transaction.packingList.length > 10 || (transaction.transactionDetail.isPackingList)) {
        htmlString += `
      <div class="body-middle" style="margin: 0 45px;">
      <table>
      <tr>
      <td>Organization :<b> ` + (transaction.transactionDetail.organization.name ?? "") + `</b></td>
      <td>INVOICE No : <b>` + (transaction.refNumber ?? "") + `</b></td>
      <td>Date : <b>` + this.utilityService.getISOtoStringDate(transaction.createdDate) + `</b></td>
      </tr>
      <tr>
      <td colspan="3"><b>Packing List</b></td>
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
          <th>CERTI. NO</th>  
          ` + (transaction.transactionDetail.isShowOrigin ? `<th>ORIGIN</th>` : ``) + `   
          <th>RAP</th>
          <th>DISC %</th>           
          <th>RATE PER CT</th>
          <th>TOTAL AMOUNT</th>
        </thead>
        <tbody>`

        for (let index = 0; index <= transaction.packingList.length; index++) {
          let obj = transaction.packingList[index];
          if (obj) {
            htmlString += `
                <tr>
                <td>`+ (index + 1) + `</td>
                <td>`+ obj.stoneId + `</td>
                <td>`+ obj.shape + `</td>
                <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.weight ?? 0) ?? "") + `</td>
                <td>`+ obj.color + `</td>
                <td>`+ obj.clarity + `</td>
                <td>`+ obj.lab + ` ` + obj.certificateNo + `</td>
                 ` + (transaction.transactionDetail.isShowOrigin ? `<td>` + (obj.origin ?? "") + `</td>` : ``) + `
                <td>`+ obj.price.rap + `</td>
                <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.discount ?? 0) ?? "") + `</td> 
                <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.perCarat ?? 0) ?? "") + `</td>
                <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.netAmount ?? 0) ?? "") + `</td>
                </tr>`
          }
        }

        htmlString += `
        </tbody>
        <tfoot>
                <tr>
                  <td colspan="3">TOTAL TO PAY</td>
                  <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(totalWeight) + `</td>
                  <td colspan="` + colspanValue + `">&nbsp;</td>                  
                  <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(SumTotalAmtWithTax) + `</td>
                </tr>`
        htmlString += `</tfoot>
        </table>
        </div>`
      }

      htmlString += `
    </body>
    </html>
    `;
    }
    else if (invoiceType == "BELGIUMOVERSEAS") {
      let SumTotalAmtWithTax = 0;
      let tax1 = 0;
      let tax2 = 0;

      if (taxPerOne > 0)
        tax1 = Number(parseFloat(parseFloat(this.utilityService.ConvertToFloatWithDecimal((taxPerOne * (totalAmount ?? 0)) / 100).toString()).toFixed(2)));

      if (taxPerTwo > 0)
        tax2 = Number(parseFloat(parseFloat(this.utilityService.ConvertToFloatWithDecimal((taxPerTwo * (totalAmount ?? 0)) / 100).toString()).toFixed(2)));

      SumTotalAmtWithTax += this.utilityService.ConvertToFloatWithDecimalTwoDigitRoundWithNum(totalAmount + tax1 + tax2 + (transaction.transactionDetail.shippingCharge ?? 0) + (Number(transaction.transactionDetail.expense) ?? 0));

      htmlString += `    
  <body onload="window.print(); window.close();">   
    <div class="chal-wrap con-inv di-inv">
      <div class="chal-head">
        <div class="logo">
        <img src="assets/billimage/CGNew.png" alt="logo">
        </div>

        <div class="di-info cg-local">
        <span>Rough & Polished Diamonds - Import & Export</span>                
        </div>

        <div class="cd-details">            
            <p><b>BTW: ` + (transaction.transactionDetail.organization.incomeTaxNo ?? "") + `</b></p> 
            <p style="flex-basis: 248px;"><b>HRAnt: -351.856</b></p>
		    </div>
      </div>
      <div class="chal-body">
      <span class="c-st border-bottom-2" style="display: block;margin: auto;width: 135px;text-align: center;margin-top: 10px;
      margin-bottom: 20px;"> `+ ((transaction.transactionType.toLowerCase() == "proforma") ? "PROFORMA INVOICE" : "EXPORT INVOICE") + `</span>
        <div class="body-top ps-1 border-bottom-0">
          <div class="bo-left">
          <span class="c-st text-start"><b>BUYER</b> ` + transaction.toLedger.name + `</span>                    
          <span><b style="float:left">ADDRESS</b> 
          <span class="txt-left">&nbsp;` + (transaction.toLedger.address.line1 ? transaction.toLedger.address.line1 + `,` : "") + `
          </br>`
      if (transaction.toLedger.address.line2) {
        htmlString += `          
          &nbsp;&nbsp`+ (transaction.toLedger.address.line2 ?? "") + `</br>
          `
      }
      htmlString += `                
      &nbsp;&nbsp`+ (transaction.toLedger.address.zipCode ? transaction.toLedger.address.zipCode + `, ` : "") + " " + (transaction.toLedger.address.city ? transaction.toLedger.address.city + `, ` : "") + `
          </br>
          &nbsp;&nbsp`+ (transaction.toLedger.address.country ?? "") + `
          </span>
          </span>`
      if (transaction.toLedger.taxNo || transaction.toLedger.incomeTaxNo) {
        if (transaction.transactionDetail.organization.address?.country.toLowerCase() == transaction.toLedger.address.country.toLowerCase()) {
          htmlString += `
          <span><b>BTW</b> ` + (transaction.toLedger.taxNo ?? "") + ` ` + (transaction.toLedger.incomeTaxNo ?? "") + `</span>  
          `}
        else {
          htmlString += `
          <span><b>VAT NO</b> ` + (transaction.toLedger.taxNo ?? "") + ` ` + (transaction.toLedger.incomeTaxNo ?? "") + `</span>  
          `}
      }

      if (transaction.toLedger.mobileNo || transaction.toLedger.phoneNo) {
        htmlString += `
          <span><b>TEL</b> ` + (transaction.toLedger.mobileNo ? transaction.toLedger.mobileNo + `,` : "") + (transaction.toLedger.phoneNo ? transaction.toLedger.phoneNo + `,` : "") + `</span>                                        
          </div>
          `
      }

      if (transaction.transactionDetail.consigneeName) {
        htmlString += `
          <div class="di-bor-0 ship-section">
          <span class="c-st text-start"><b>SHIP TO</b><strong>&nbsp;` + (transaction.transactionDetail.consigneeName ?? "") + `</strong></span>
          <span class="c-st text-start"><b style="float:left;">SHIP ADDRESS</b><span class="txt-left">&nbsp;` + (transaction.transactionDetail.consigneeAddress ?? "") + `</span></span>
          </div>`
      }

      htmlString += `
        <div class="di-bor-0 inv-section">
        <span class="c-st text-start"><b>INVOICE NO</b> ` + transaction.refNumber + `</span>
        <span class="c-st text-start"><b>DATE</b> ` + this.utilityService.getISOtoStringDate(transaction.transactionDate) + `</span>
        <span class="c-st text-start"><b style="float:left">TERMS </b> <span class="txt-left">&nbsp;` + (transaction.transactionDetail.terms ?? "") + `</span></span> 
        <span class="c-st text-start"><b style="float:left">ORIGIN </b> <span class="txt-left">&nbsp;`+ 'INDIA' + `</span></span> 
        `
      if (transaction.transactionDetail.dueDate) {
        htmlString += `
        <span class="c-st text-start"><b>DUE DATE</b> ` + this.utilityService.getISOtoStringDate(transaction.transactionDetail.dueDate) + `</span> 
        `
      }

      htmlString += `
          </div>
          </div>
          `

      if (transaction.packingList.length > 10 || (transaction.transactionDetail.isPackingList)) {
        htmlString += `
        <div class="body-middle" style="margin-top: 10px;">
          <table>
            <thead>
              <th>No</th>                       
              <th colspan="6">DESCRIPTION</th>
              <th>PCS</th>
              <th>CARATS</th>
              <th>RATE `+ transaction.transactionDetail.fromCurrency + ` PER CT</th>
              <th>TOTAL AMOUNT `+ transaction.transactionDetail.fromCurrency + `</th>
            </thead>
            <tbody>`

        htmlString += `
                <tr>
                <td></td>
                <td colspan="6">CUT & POLISHED DIAMONDS</td>                
                <td>`+ totalStone + `</td>
                <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(totalWeight) + `</td>
                <td>`+ totalPerCarat + `</td>
                <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(totalAmount) + `</td>
                </tr>`
      }

      else if (transaction.packingList.length < 11) {
        htmlString += `
        <div class="body-middle" style="margin-top: 10px;">
          <table>
          <thead>
          <th>No</th>
          <th>STONE ID</th>
          <th>SHAPE</th>          
          <th>COLOR</th>
          <th>CLARITY</th>
          <th>LAB</th>       
          <th colspan="2">CERTI. NO</th> 
          <th>CARATS</th>  
          <th>RATE `+ (transaction.transactionDetail.fromCurrency ?? "") + ` /PER CT</th>
          <th>TOTAL AMOUNT `+ (transaction.transactionDetail.fromCurrency ?? "") + `</th>            
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
              <td>`+ (obj.color ?? "") + `</td>
              <td>`+ (obj.clarity ?? "") + `</td>
              <td>`+ (obj.lab ?? "") + `</td>
              <td colspan="2">`+ (obj.certificateNo ?? "") + `</td>             
              <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.weight ?? 0) ?? "") + `</td>
              <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.perCarat ?? 0) ?? "") + `</td>
              <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.netAmount ?? 0) ?? "") + `</td>
              </tr>`
          }
        }
      }

      htmlString += ` 
      <tr>
      <td colspan="8" style="text-align:right; padding-right:10px;"><strong>Sub Total</strong></td>      
      <td><strong>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(totalWeight) + `</strong></td>
      <td><strong>`+ totalPerCarat + `</strong></td>
      <td><strong>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(totalAmount) + ` (` + transaction.transactionDetail.fromCurrency + `)</strong></td>
      </tr>`
      if (taxPerOne) {
        htmlString += `
                <tr>
                <td colspan="10" style="text-align:right; padding-right:10px;" >`+ taxNameOne + ` ( ` + taxPerOne + ` % ) </td>
                <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit((taxPerOne * (totalAmount ?? 0)) / 100) + `</td>
                </tr>`
      }
      if (transaction.transactionDetail.shippingCharge > 0 || Number(transaction.transactionDetail.expense) > 0) {
        htmlString += `
                <tr>
                <td colspan="10" style="text-align:right; padding-right:10px;">Charges</td> 
                <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigitRoundWithNum((transaction.transactionDetail.shippingCharge ?? 0) + (Number(transaction.transactionDetail.expense) ?? 0)) + `</td>
                </tr>`
      }

      htmlString += `                        
      </tbody>
      <tfoot>
      <tr class="border-left-0 border-bottom-0">`

      /*if (transaction.transactionDetail.toCurrency && (transaction.transactionDetail.fromCurrency != transaction.transactionDetail.toCurrency)) {
        htmlString += `                     
              <td colspan="8" style="color:red">`+ transaction.transactionDetail.fromCurRate + ` (` + transaction.transactionDetail.toCurrency + `) ` + `= ` + (1 / (transaction.transactionDetail.toCurRate ?? 0)).toFixed(4) + ` (` + transaction.transactionDetail.fromCurrency + `)` + `</td>
              <td style="color:red">`+ (totalPayableAmount * (transaction.transactionDetail.toCurRate ?? 0)).toFixed(2) + ` (` + transaction.transactionDetail.toCurrency + `)</td>                  
            `
      }
      else {
        htmlString += `<td colspan="9" class="border-left-0 border-bottom-0 border-top-0"></td>`
      }*/

      htmlString += `                     
      <td colspan="8" style="color:red">1 (EURO) = ` + ((this.EuroToUSDRate ?? 0)).toFixed(4) + ` (USD)` + `</td>
      <td style="color:red">`+ (Number(this.utilityService.ConvertToFloatWithDecimalTwoDigit(SumTotalAmtWithTax)) * (1 / this.EuroToUSDRate ?? 0)).toFixed(2) + ` (EURO)</td>                  
    `

      htmlString += `
      <td  style="text-align:right; padding-right:10px;"><strong>TOTAL TO PAY</strong></td>                          
      <td class="clr-yellow" style="font-size:18px"><strong>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(SumTotalAmtWithTax) + ` (` + transaction.transactionDetail.fromCurrency + `)</strong></td>                         
      </tr> ` ;

      htmlString += `  
      </tfoot>
    </table>
    </div>
    `

      htmlString += ` 
        <div class="body-fotter">  
        <div class="body-middle" style="margin: 20px 0;">           
        <table class="cif-brd">          
        <tr>
          <td><b>CIF : </b>`+ (transaction.transactionDetail.cifCityName ?? "") + `</td>
          <td><b>PORT : </b>`+ (transaction.transactionDetail.portOfLoading ?? "") + `</td>
          <td><b>SHIPPED VIA : </b>`+ (transaction.transactionDetail.logistic.name ?? "") + `</td>
          <td><b>INSURED BY : </b>`+ (transaction.transactionDetail.logistic.name ?? "") + `</td>
        </tr>             
        </tfoot>
      </table>
      </div> 

      <div class="border-left-2 border-right-2" style="border-top: 2px solid;">
        <div class="bo-left border-bottom-2 ps-1">       
              <span class="c-st text-start"><strong>Payment instructions:</strong></span>
              <table class="cg-tbl">
              <tbody>
              `
      if (transaction.transactionDetail.bank.accountName) {
        htmlString += `  
              <tr>
              <td>ACCOUNT NAME</td>
              <td>: <b>`+ (transaction.transactionDetail.bank.accountName ?? "") + `</b></td>
              </tr>
              `
      }
      if (transaction.transactionDetail.bank.bankName) {
        htmlString += `
              <tr>
              <td>BANK NAME</td>
              <td>: <b>`+ (transaction.transactionDetail.bank.bankName ?? "") + `</b></td>
              </tr>
              `
      }
      if (transaction.transactionDetail.bank.iBan) {
        htmlString += `
              <tr>
              <td>IBAN NO</td>
              <td>: <b>`+ (transaction.transactionDetail.bank.iBan ?? "") + `</b></td>
              </tr>
              `
      }
      if (transaction.transactionDetail.bank.accountNo) {
        htmlString += `
              <tr>
              <td>A/C NO</td>
              <td>: <b>`+ (transaction.transactionDetail.bank.accountNo ?? "") + `</b></td>
              </tr>
              `
      }
      if (transaction.transactionDetail.bank.swift) {
        htmlString += `
              <tr>              
              <td>SWIFT CODE</td>
              <td>: <b>`+ (transaction.transactionDetail.bank.swift ?? "") + `</b></td>
              </tr>
              `
      }
      if (transaction.transactionDetail.bank.address.line1) {
        htmlString += `
              <tr>
              <td>BANK ADDRESS</td>
              <td>: <b>`+ (transaction.transactionDetail.bank.address.line1 ? transaction.transactionDetail.bank.address.line1 + `,` : "") + (transaction.transactionDetail.bank.address.line2 ? transaction.transactionDetail.bank.address.line2 + `,` : "") + (transaction.transactionDetail.bank.address.city ? transaction.transactionDetail.bank.address.city + `,` : "")
          + (transaction.transactionDetail.bank.address.country ? transaction.transactionDetail.bank.address.country + `,` : "") + (transaction.transactionDetail.bank.address.zipCode ?? "") + `</b></td>
              </tr>   
              `
      }
      if (transaction.transactionDetail.bank.intermediaryBankName) {
        htmlString += `
              <tr>
                <td>INTERMEDIATE BANK</td>
                <td>: <b>`+ (transaction.transactionDetail.bank.intermediaryBankName ?? "") + `</b></td>                        
              </tr>  
              `
      }
      if (transaction.transactionDetail.bank.intermediaryBankswift) {
        htmlString += `
              <tr>
                <td>INTERMEDIATE SWIFTCODE</td>                      
                <td>: <b>`+ (transaction.transactionDetail.bank.intermediaryBankswift ?? "") + `</b></td>
              </tr>     
              `
      }
      if (transaction.transactionDetail.bank.intermediaryBankAddress) {
        htmlString += `   
              <tr>
                <td>INTERMEDIATE ADDRESS</td>                       
                <td>: <b>`+ (transaction.transactionDetail.bank.intermediaryBankAddress ?? "") + `</b></td>                        
              </tr>  
              `
      }
      htmlString += `
            </tbody>
            </table>
            </div> 
            </div>
          </div>
          `

      htmlString += ` 
        <div class="body-f-footer">
        <span class="c-st border-bottom-2">GUIDELINES</span>
        <ul>
        <li><b>Bank Charges On Buyer Only : Payment Must Include All Bank Charges (Including Intermediatary Bank Charges)</b></li>
        <li><b>ONLY US$ PAYMENT : Buyer have to pay in USD($) only, As we have USD($) account in related Bank. We will be not responsible for payments made in any other currencies.</b></li>
        <li>This sale is done with retention of title. The buyer will only become owner of the goods after full payment of this
        invoice. The buyer acknowledged that this invoice is pledged to ` + (transaction.transactionDetail.bank.bankName ?? "") + ` and that releases can
        only be obtained through payment on the account of the seller at ` + (transaction.transactionDetail.bank.bankName ?? "") + ` as mentioned on this
        invoice. This invoice may never be compensated with claims from the buyer on the seller.</li>
        <li>The diamonds here in invoiced are exclusively of natural origin and untreated based on personal knowledge and/or
        written guarantees provided by the supplier of these diamonds.</li>
        <li>The diamonds herein invoiced have been purchased from legitimate sources not involved in funding conflict and in
        compliance with United Nation resolutions. The seller hereby guarantees that these diamonds are conflict free, based
        on personal knowledge and/or written guarantees provided by the supplier of these diamonds. </li>      
        <b style="text-decoration: underline;">H.R.A 351 856, BTW BE 0478 554 943 </b>      
        `+ (transaction.toLedger.address.country.toLowerCase() == 'belgium' ? `<li>The Antwerp Tribunal of Commerce is solely competent in case of litigation Vrij van B.T.W. Art. 42§4 van het Wetboek. Above mentioned good will be consignment until receipt of the payment of this invoice.</li>` : `<li>The Antwerp Tribunal of Commerce is solely competent in case of litigation Vrij van B.T.W. Art. 39 van het Wetboek. Above mentioned good will be consignment until receipt of the payment of this invoice. </li>`)

      if (transaction.transactionDetail.additionalDeclaration) {
        htmlString += `<li>` + (transaction.transactionDetail.additionalDeclaration ?? "") + `</li>`
      }
      htmlString += `  
        </ul>
        </div>
        `

      var startCount: number;
      var endCount: number;
      startCount = 0;
      endCount = 0;

      if (transaction.packingList.length > 10 || transaction.transactionDetail.isPackingList) {//Summary
        startCount = 5;
        if (isCGMail)
          endCount = 12;
        else
          endCount = 15;
      }
      else if (transaction.packingList.length < 11) {//PL
        startCount = transaction.packingList.length;
        endCount = 14 - transaction.packingList.length;
        if (isCGMail)
          endCount = 11 - transaction.packingList.length;
        else
          endCount = 14 - transaction.packingList.length;
      }

      if (transaction.transactionDetail.taxTypes.length > 0)
        endCount = endCount - 1
      if (transaction.transactionDetail.shippingCharge > 0)
        endCount = endCount - 1
      if (transaction.transactionDetail.consigneeName)
        endCount = endCount - 2
      if (transaction.toLedger.address.line2)
        endCount = endCount - 2
      if (transaction.transactionDetail.additionalDeclaration)
        endCount = endCount - 1
      if (transaction.toLedger.mobileNo || transaction.toLedger.phoneNo)
        endCount = endCount - 1
      if (transaction.transactionDetail.bank.address.line1)
        endCount = endCount - 1
      if (transaction.transactionDetail.bank.intermediaryBankAddress)
        endCount = endCount - 1
      if (transaction.toLedger.taxNo || transaction.toLedger.incomeTaxNo)
        endCount = endCount - 1
      if (!transaction.transactionDetail.bank.iBan)
        endCount = endCount + 1
      if (taxPerOne)
        endCount = endCount - 2

      for (let index = startCount; index <= endCount; index++) {
        htmlString += `
                        <table class="border-remove">
                        <tr>
                        <td>&nbsp</td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        </tr>   
                        </table>               
                        `
      }

      htmlString += `
      <span class="dt-last">Date : ` + this.utilityService.getISOtoStringDate(transaction.transactionDate) + `</span>
        <div class="di-info cg-local border-top-2">
        <span>
          <b>` + (transaction.transactionDetail.organization.name ?? "") + ` : </b>&nbsp` + (transaction.transactionDetail.organization.address?.line1 ?? "") + `,&nbsp` + (transaction.transactionDetail.organization.address?.line2 ?? "") + ",&nbsp" + (transaction.transactionDetail.organization.address?.zipCode ?? "") + ",&nbsp" + (transaction.transactionDetail.organization.address?.city ?? "") + `,&nbsp` + (transaction.transactionDetail.organization.address?.country ?? "") + `
        </span>
        <span><b>GSM :</b> ` + (transaction.transactionDetail.organization.mobileNo ?? "") + `, <b>TEL :</b>` + (transaction.transactionDetail.organization.phoneNo ?? "") + `&nbsp;&nbsp;<b>Email :</b>
        ` + (transaction.transactionDetail.organization.email ?? "") + `</span>
        </div>
        </div>
        </div>
      </div>
    </div>
    `

      if (transaction.packingList.length > 10 || (transaction.transactionDetail.isPackingList)) {
        htmlString += `
        <div class="body-middle" style="margin: 0 45px;">
      <table>
      <tr>
      <td>Organization :<b> ` + (transaction.transactionDetail.organization.name ?? "") + `</b></td>
      <td>INVOICE No : <b>` + (transaction.refNumber ?? "") + `</b></td>
      <td>Date : <b>` + this.utilityService.getISOtoStringDate(transaction.createdDate) + `</b></td>
      </tr>
      <tr>
      <td colspan="3"><b>Packing List</b></td>
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
          <th>CERTI. NO</th>    
          ` + (transaction.transactionDetail.isShowOrigin ? `<th>ORIGIN</th>` : ``) + ` 
          <th>RAP</th>
          <th>DISC %</th>           
          <th>RATE PER CT</th>
          <th>TOTAL AMOUNT</th>
        </thead>
        <tbody>`

        for (let index = 0; index <= transaction.packingList.length; index++) {
          let obj = transaction.packingList[index];
          if (obj) {
            htmlString += `
                <tr>
                <td>`+ (index + 1) + `</td>
                <td>`+ obj.stoneId + `</td>
                <td>`+ obj.shape + `</td>
                <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.weight ?? 0) ?? "") + `</td>
                <td>`+ obj.color + `</td>
                <td>`+ obj.clarity + `</td>
                <td>`+ obj.lab + ` ` + obj.certificateNo + `</td>
                 ` + (transaction.transactionDetail.isShowOrigin ? `<td>` + (obj.origin ?? "") + `</td>` : ``) + `
                <td>`+ obj.price.rap + `</td>
                <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.discount ?? 0) ?? "") + `</td> 
                <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.perCarat ?? 0) ?? "") + `</td>
                <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.netAmount ?? 0) ?? "") + `</td>
                </tr>`
          }
        }

        htmlString += `
        </tbody>
        <tfoot>
                <tr>
                  <td colspan="3">TOTAL TO PAY</td>
                  <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(totalWeight) + `</td>
                  <td colspan="` + colspanValue + `">&nbsp;</td>                  
                  <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(SumTotalAmtWithTax) + `</td>
                </tr>`
        htmlString += `</tfoot>
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
    const colspanValue = transaction.transactionDetail.isShowOrigin ? 7 : 6;

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

    if (invoiceType == "BELGIUMLOCAL") {
      let SumTotalAmtWithTax = 0;
      let tax1 = 0;
      let tax2 = 0;

      if (taxPerOne > 0)
        tax1 = Number(parseFloat(parseFloat(this.utilityService.ConvertToFloatWithDecimal((taxPerOne * (totalAmount ?? 0)) / 100).toString()).toFixed(2)));

      if (taxPerTwo > 0)
        tax2 = Number(parseFloat(parseFloat(this.utilityService.ConvertToFloatWithDecimal((taxPerTwo * (totalAmount ?? 0)) / 100).toString()).toFixed(2)));

      SumTotalAmtWithTax += this.utilityService.ConvertToFloatWithDecimalTwoDigitRoundWithNum(totalAmount + tax1 + tax2 + (transaction.transactionDetail.shippingCharge ?? 0) + (Number(transaction.transactionDetail.expense) ?? 0));

      htmlString += `    
  <body onload="window.print(); window.close();">   
    <div class="chal-wrap con-inv di-inv">
      <div class="chal-head">
        <div class="logo">
        <img src="assets/billimage/CGNew.png" alt="logo">
        </div>

        <div class="di-info cg-local">
        <span>Rough & Polished Diamonds - Import & Export</span>                
        </div>

        <div class="cd-details">            
            <p><b>BTW: ` + (transaction.transactionDetail.organization.incomeTaxNo ?? "") + `</b></p> 
            <p style="flex-basis: 248px;"><b>HRAnt: -351.856</b></p>
		    </div>
      </div>
      <div class="chal-body">
      <span class="c-st border-bottom-2" style="display: block;margin: auto;width: 150px;text-align: center;margin-top: 10px;
      margin-bottom: 20px;"> `+ ((transaction.transactionType.toLowerCase() == "proforma") ? "PROFORMA INVOICE" : "DELIVERY INVOICE") + `</span>
        <div class="body-top ps-1 border-bottom-0">
          <div class="bo-left">
          <span class="c-st text-start"><b>BUYER</b> ` + transaction.toLedger.name + `</span>          
          <span><b style="float:left">ADDRESS</b> 
          <span class="txt-left">&nbsp;` + (transaction.toLedger.address.line1 ? transaction.toLedger.address.line1 + `,` : "") + `
          </br>`
      if (transaction.toLedger.address.line2) {
        htmlString += `          
        &nbsp;&nbsp`+ (transaction.toLedger.address.line2 ?? "") + `</br>
          `
      }
      htmlString += `                
      &nbsp;&nbsp`+ (transaction.toLedger.address.zipCode ? transaction.toLedger.address.zipCode + `, ` : "") + " " + (transaction.toLedger.address.city ? transaction.toLedger.address.city + `, ` : "") + `
          </br>
          &nbsp;&nbsp`+ (transaction.toLedger.address.country ?? "") + `
          </span>
          </span>`
      if (transaction.toLedger.taxNo || transaction.toLedger.incomeTaxNo) {
        if (transaction.transactionDetail.organization.address?.country.toLowerCase() == transaction.toLedger.address.country.toLowerCase()) {
          htmlString += `
          <span><b>BTW</b> ` + (transaction.toLedger.taxNo ?? "") + ` ` + (transaction.toLedger.incomeTaxNo ?? "") + `</span>  
          `}
        else {
          htmlString += `
          <span><b>VAT NO</b> ` + (transaction.toLedger.taxNo ?? "") + ` ` + (transaction.toLedger.incomeTaxNo ?? "") + `</span>  
          `}
      }

      if (transaction.toLedger.mobileNo || transaction.toLedger.phoneNo) {
        htmlString += `
          <span><b>TEL</b> ` + (transaction.toLedger.mobileNo ? transaction.toLedger.mobileNo + `,` : "") + (transaction.toLedger.phoneNo ? transaction.toLedger.phoneNo + `,` : "") + `</span>                                        
          </div>
          `
      }
      else {
        htmlString += `
        <span>&nbsp</span>                                        
        </div>
        `
      }

      if (transaction.transactionDetail.consigneeName) {
        htmlString += `
          <div class="di-bor-0 ship-section">
          <span class="c-st text-start"><b>SHIP TO</b><strong>&nbsp;` + (transaction.transactionDetail.consigneeName ?? "") + `</strong></span>
          <span class="c-st text-start"><b style="float:left;">SHIP ADDRESS</b><span class="txt-left">&nbsp;` + (transaction.transactionDetail.consigneeAddress ?? "") + `</span></span>
          </div>`
      }

      htmlString += `
        <div class="di-bor-0 inv-section">
        <span class="c-st text-start"><b>INVOICE NO</b> ` + transaction.refNumber + `</span>
        <span class="c-st text-start"><b>DATE</b> ` + this.utilityService.getISOtoStringDate(transaction.transactionDate) + `</span>
        <span class="c-st text-start"><b style="float:left">TERMS </b> <span class="txt-left">&nbsp;` + (transaction.transactionDetail.terms ?? "") + `</span></span> 
        <span class="c-st text-start"><b style="float:left">ORIGIN </b> <span class="txt-left">&nbsp;`+ 'INDIA' + `</span></span> 
        `
      if (transaction.transactionDetail.dueDate) {
        htmlString += `
        <span class="c-st text-start"><b>DUE DATE</b> ` + this.utilityService.getISOtoStringDate(transaction.transactionDetail.dueDate) + `</span> 
        `
      }

      htmlString += `
          </div>
          </div>
          `

      if (transaction.packingList.length > 10 || (transaction.transactionDetail.isPackingList)) {
        htmlString += `
        <div class="body-middle" style="margin-top: 10px;">
          <table>
            <thead>
              <th>No</th>                       
              <th colspan="8">DESCRIPTION</th>              
              <th>CARATS</th>
              <th>RATE `+ transaction.transactionDetail.fromCurrency + ` PER CT</th>
              <th>TOTAL AMOUNT `+ transaction.transactionDetail.fromCurrency + `</th>
            </thead>
            <tbody>`

        htmlString += `
                <tr>
                <td>1</td>
                <td colspan="8">0.50 CT ABOVE SIZE</td>  
                <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(aboveFiveCentTotalWeight) + `</td>
                <td>`+ aboveTotalPerCarat + `</td>
                <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(aboveFiveCentAmont) + `</td>
                </tr>`

        htmlString += `
                <tr>
                <td></td>
                <td colspan="8">CUT & POLISHED DIAMONDS</td>  
                <td></td>
                <td></td>
                <td></td>
                </tr>`

        htmlString += `
                <tr>
                <td></td>
                <td colspan="8">AS PER PACKING LIST 1</td>  
                <td></td>
                <td></td>
                <td></td>
                </tr>`

        htmlString += `
                <tr>
                <td>&nbsp</td>
                <td colspan="8"></td>  
                <td></td>
                <td></td>
                <td></td>
                </tr>`

        htmlString += `
                <tr>
                <td>2</td>
                <td colspan="8">0.50 CT BELOW SIZE</td>  
                <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(belowFiveCentTotalWeight) + `</td>
                <td>`+ belowTotalPerCarat + `</td>
                <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(belowFiveCentTotalAmount) + `</td>
                </tr>`

        htmlString += `
                <tr>
                <td></td>
                <td colspan="8">CUT & POLISHED DIAMONDS</td>  
                <td></td>
                <td></td>
                <td></td>
                </tr>`

        htmlString += `
                <tr>
                <td></td>
                <td colspan="8">AS PER PACKING LIST 2</td>  
                <td></td>
                <td></td>
                <td></td>
                </tr>`
      }

      else if (transaction.packingList.length < 11) {
        htmlString += `
        <div class="body-middle" style="margin-top: 10px;">
          <table>
          <thead>
          <th colspan="2">No</th>
          <th>STONE ID</th>
          <th>SHAPE</th>          
          <th>COLOR</th>
          <th>CLARITY</th>
          <th>LAB</th>       
          <th colspan="2">CERTI. NO</th> 
          <th>CARATS</th>  
          <th>RATE `+ (transaction.transactionDetail.fromCurrency ?? "") + ` /PER CT</th>
          <th>TOTAL AMOUNT `+ (transaction.transactionDetail.fromCurrency ?? "") + `</th>            
          </thead>
          <tbody>`

        for (let index = 0; index <= transaction.packingList.length; index++) {
          let obj = transaction.packingList[index];
          if (obj) {
            htmlString += `            
              <tr>
              <td colspan="2">`+ (index + 1) + `</td>
              <td>`+ (obj.stoneId ?? "") + `</td>
              <td>`+ (obj.shape ?? "") + `</td>
              <td>`+ (obj.color ?? "") + `</td>
              <td>`+ (obj.clarity ?? "") + `</td>
              <td>`+ (obj.lab ?? "") + `</td>
              <td colspan="2">`+ (obj.certificateNo ?? "") + `</td>             
              <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.weight ?? 0) ?? "") + `</td>
              <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.perCarat ?? 0) ?? "") + `</td>
              <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.netAmount ?? 0) ?? "") + `</td>
              </tr>`
          }
        }
      }

      htmlString += ` 
      <tr>
      <td colspan="9" style="text-align:right; padding-right:10px;"><strong>Sub Total</strong></td>      
      <td><strong>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(totalWeight) + `</strong></td>
      <td><strong>`+ totalPerCarat + `</strong></td>
      <td><strong>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(totalAmount) + ` (` + transaction.transactionDetail.fromCurrency + `)</strong></td>
      </tr>`

      if (taxPerOne) {
        htmlString += `
                <tr>
                <td colspan="11" style="text-align:right; padding-right:10px;" >`+ taxNameOne + ` ( ` + taxPerOne + ` % ) </td>
                <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit((taxPerOne * (totalAmount ?? 0)) / 100) + `</td>
                </tr>`
      }
      if (transaction.transactionDetail.shippingCharge > 0 || Number(transaction.transactionDetail.expense) > 0) {
        htmlString += `
                <tr>
                <td colspan="11" style="text-align:right; padding-right:10px;">Charges</td> 
                <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigitRoundWithNum((transaction.transactionDetail.shippingCharge ?? 0) + (Number(transaction.transactionDetail.expense) ?? 0)) + `</td>
                </tr>`
      }

      htmlString += `                        
            </tbody>
            <tfoot>
            <tr class="border-left-0 border-bottom-0">`

      /*if (transaction.transactionDetail.toCurrency && (transaction.transactionDetail.fromCurrency != transaction.transactionDetail.toCurrency)) {
        htmlString += `                     
                    <td colspan="9" style="color:red">`+ transaction.transactionDetail.fromCurRate + ` (` + transaction.transactionDetail.toCurrency + `) ` + `= ` + (1 / (transaction.transactionDetail.toCurRate ?? 0)).toFixed(4) + ` (` + transaction.transactionDetail.fromCurrency + `)` + `</td>
                    <td style="color:red">`+ (totalPayableAmount * (transaction.transactionDetail.toCurRate ?? 0)).toFixed(2) + ` (` + transaction.transactionDetail.toCurrency + `)</td>                  
                  `
      }
      else {
        htmlString += `<td colspan="10" class="border-left-0 border-bottom-0 border-top-0"></td>`
      }*/

      htmlString += `                     
                    <td colspan="9" style="color:red">1 (EURO) = ` + ((this.EuroToUSDRate ?? 0)).toFixed(4) + ` (USD)` + `</td>
                    <td style="color:red">`+ (Number(this.utilityService.ConvertToFloatWithDecimalTwoDigit(SumTotalAmtWithTax)) * (1 / this.EuroToUSDRate ?? 0)).toFixed(2) + ` (EURO)</td>                  
                  `

      htmlString += `
            <td  style="text-align:right; padding-right:10px;"><strong>TOTAL TO PAY</strong></td>                          
            <td class="clr-yellow" style="font-size:18px"><strong>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(SumTotalAmtWithTax) + ` (` + transaction.transactionDetail.fromCurrency + `)</strong></td>                         
            </tr> ` ;

      htmlString += `  
            </tfoot>
          </table>
          </div>
          `

      htmlString += ` 
        <div class="body-fotter">  

        <div class="body-middle" style="margin: 20px 0;"> 
        </div> 

        <div class="border-left-2 border-right-2" style="border-top: 2px solid;">
        <div class="bo-left border-bottom-2 ps-1">       
              <span class="c-st text-start"><strong>Payment instructions:</strong></span>
              <table class="cg-tbl">
              <tbody>
              `
      if (transaction.transactionDetail.bank.accountName) {
        htmlString += `  
              <tr>
              <td>ACCOUNT NAME</td>
              <td>: <b>`+ (transaction.transactionDetail.bank.accountName ?? "") + `</b></td>
              </tr>
              `
      }
      if (transaction.transactionDetail.bank.bankName) {
        htmlString += `
              <tr>
              <td>BANK NAME</td>
              <td>: <b>`+ (transaction.transactionDetail.bank.bankName ?? "") + `</b></td>
              </tr>
              `
      }
      if (transaction.transactionDetail.bank.iBan) {
        htmlString += `
              <tr>
              <td>IBAN NO</td>
              <td>: <b>`+ (transaction.transactionDetail.bank.iBan ?? "") + `</b></td>
              </tr>
              `
      }
      if (transaction.transactionDetail.bank.accountNo) {
        htmlString += `
              <tr>
              <td>A/C NO</td>
              <td>: <b>`+ (transaction.transactionDetail.bank.accountNo ?? "") + `</b></td>
              </tr>
              `
      }
      if (transaction.transactionDetail.bank.swift) {
        htmlString += `
              <tr>              
              <td>SWIFT CODE</td>
              <td>: <b>`+ (transaction.transactionDetail.bank.swift ?? "") + `</b></td>
              </tr>
              `
      }
      if (transaction.transactionDetail.bank.address.line1) {
        htmlString += `
              <tr>
              <td>BANK ADDRESS</td>
              <td>: <b>`+ (transaction.transactionDetail.bank.address.line1 ? transaction.transactionDetail.bank.address.line1 + `,` : "") + (transaction.transactionDetail.bank.address.line2 ? transaction.transactionDetail.bank.address.line2 + `,` : "") + (transaction.transactionDetail.bank.address.city ? transaction.transactionDetail.bank.address.city + `,` : "")
          + (transaction.transactionDetail.bank.address.country ? transaction.transactionDetail.bank.address.country + `,` : "") + (transaction.transactionDetail.bank.address.zipCode ?? "") + `</b></td>
              </tr>   
              `
      }
      if (transaction.transactionDetail.bank.intermediaryBankName) {
        htmlString += `
              <tr>
                <td>INTERMEDIATE BANK</td>
                <td>: <b>`+ (transaction.transactionDetail.bank.intermediaryBankName ?? "") + `</b></td>                        
              </tr>  
              `
      }
      if (transaction.transactionDetail.bank.intermediaryBankswift) {
        htmlString += `
              <tr>
                <td>INTERMEDIATE SWIFTCODE</td>                      
                <td>: <b>`+ (transaction.transactionDetail.bank.intermediaryBankswift ?? "") + `</b></td>
              </tr>     
              `
      }
      if (transaction.transactionDetail.bank.intermediaryBankAddress) {
        htmlString += `   
              <tr>
                <td>INTERMEDIATE ADDRESS</td>                       
                <td>: <b>`+ (transaction.transactionDetail.bank.intermediaryBankAddress ?? "") + `</b></td>                        
              </tr>  
              `
      }
      htmlString += `
            </tbody>
            </table>
            </div>   
            </div>
          </div>
          `

      htmlString += ` 
        <div class="body-f-footer">
        <span class="c-st border-bottom-2">GUIDELINES</span>
        <ul>
        <li><b>Bank Charges On Buyer Only : Payment Must Include All Bank Charges (Including Intermediatary Bank Charges)</b></li>
        <li><b>ONLY US$ PAYMENT : Buyer have to pay in USD($) only, As we have USD($) account in related Bank. We will be not responsible for payments made in any other currencies.</b></li>
        <li>This sale is done with retention of title. The buyer will only become owner of the goods after full payment of this
        invoice. The buyer acknowledged that this invoice is pledged to ` + (transaction.transactionDetail.bank.bankName ?? "") + ` and that releases can
        only be obtained through payment on the account of the seller at ` + (transaction.transactionDetail.bank.bankName ?? "") + ` as mentioned on this
        invoice. This invoice may never be compensated with claims from the buyer on the seller.</li>
        <li>The diamonds here in invoiced are exclusively of natural origin and untreated based on personal knowledge and/or
        written guarantees provided by the supplier of these diamonds.</li>
        <li>The diamonds herein invoiced have been purchased from legitimate sources not involved in funding conflict and in
        compliance with United Nation resolutions. The seller hereby guarantees that these diamonds are conflict free, based
        on personal knowledge and/or written guarantees provided by the supplier of these diamonds. </li>      
        <b style="text-decoration: underline;">H.R.A 351 856, BTW BE 0478 554 943 </b>      
       `+ (transaction.toLedger.address.country.toLowerCase() == 'belgium' ? `<li>The Antwerp Tribunal of Commerce is solely competent in case of litigation Vrij van B.T.W. Art. 42§4 van het Wetboek. Above mentioned good will be consignment until receipt of the payment of this invoice.</li>` : `<li>The Antwerp Tribunal of Commerce is solely competent in case of litigation Vrij van B.T.W. Art. 39 van het Wetboek. Above mentioned good will be consignment until receipt of the payment of this invoice. </li>`)

      if (transaction.transactionDetail.additionalDeclaration) {
        htmlString += `<li>` + (transaction.transactionDetail.additionalDeclaration ?? "") + `</li>`
      }
      htmlString += `  
        </ul>
        </div>
        `
      var startCount: number;
      var endCount: number;
      startCount = 0;
      endCount = 0;

      if (transaction.packingList.length > 10 || transaction.transactionDetail.isPackingList) {//Summary
        startCount = 5;
        if (isCGMail)
          endCount = 12;
        else
          endCount = 15;
      }
      else if (transaction.packingList.length < 11) {//PL
        startCount = transaction.packingList.length;
        if (isCGMail)
          endCount = 11 - transaction.packingList.length;
        else
          endCount = 14 - transaction.packingList.length;
      }

      if (transaction.transactionDetail.taxTypes.length > 0)
        endCount = endCount - 1
      if (transaction.transactionDetail.shippingCharge > 0)
        endCount = endCount - 1
      if (transaction.transactionDetail.consigneeName)
        endCount = endCount - 2
      if (transaction.toLedger.address.line2)
        endCount = endCount - 2
      if (transaction.transactionDetail.additionalDeclaration)
        endCount = endCount - 1
      if (transaction.toLedger.mobileNo || transaction.toLedger.phoneNo)
        endCount = endCount - 1
      if (transaction.transactionDetail.bank.address.line1)
        endCount = endCount - 1
      if (transaction.transactionDetail.bank.intermediaryBankAddress)
        endCount = endCount - 1
      if (transaction.toLedger.taxNo || transaction.toLedger.incomeTaxNo)
        endCount = endCount - 1
      if (!transaction.transactionDetail.bank.iBan)
        endCount = endCount + 1
      if (taxPerOne)
        endCount = endCount - 2

      if (transaction.packingList.length > 10 || (transaction.transactionDetail.isPackingList)) {
        for (let index = startCount; index <= endCount - 3; index++) {
          htmlString += `
                              <table class="border-remove">
                              <tr>
                              <td>&nbsp</td>
                              <td></td>
                              <td></td>
                              <td></td>
                              <td></td>
                              <td></td>
                              <td></td>
                              <td></td>
                              <td></td>
                              <td></td>
                              <td></td>
                              </tr>   
                              </table>               
                              `
        }
      } else {
        for (let index = startCount; index <= endCount; index++) {
          htmlString += `
                              <table class="border-remove">
                              <tr>
                              <td>&nbsp</td>
                              <td></td>
                              <td></td>
                              <td></td>
                              <td></td>
                              <td></td>
                              <td></td>
                              <td></td>
                              <td></td>
                              <td></td>
                              <td></td>
                              </tr>   
                              </table>               
                              `
        }
      }

      htmlString += `
      <span class="dt-last">Date : ` + this.utilityService.getISOtoStringDate(transaction.transactionDate) + `</span>
        <div class="di-info cg-local border-top-2">
        <span>
        <b>` + (transaction.transactionDetail.organization.name ?? "") + ` : </b>&nbsp` + (transaction.transactionDetail.organization.address?.line1 ?? "") + `,&nbsp` + (transaction.transactionDetail.organization.address?.line2 ?? "") + ",&nbsp" + (transaction.transactionDetail.organization.address?.zipCode ?? "") + ",&nbsp" + (transaction.transactionDetail.organization.address?.city ?? "") + `,&nbsp` + (transaction.transactionDetail.organization.address?.country ?? "") + `
        </span>
        <span><b>GSM :</b> ` + (transaction.transactionDetail.organization.mobileNo ?? "") + `, <b>TEL :</b>` + (transaction.transactionDetail.organization.phoneNo ?? "") + `&nbsp;&nbsp;<b>Email :</b>
        ` + (transaction.transactionDetail.organization.email ?? "") + `</span>
        </div>
        </div>
        </div>
      </div>
    </div>
    `

      if (transaction.packingList.length > 10 || (transaction.transactionDetail.isPackingList)) {
        //Above 1 CT Packing List
        htmlString += `
      <div class="body-middle" style="margin: 0 45px;">
      <table>
      <tr>
      <td>Organization :<b> ` + (transaction.transactionDetail.organization.name ?? "") + `</b></td>
      <td>INVOICE No : <b>` + (transaction.refNumber ?? "") + `</b></td>
      <td>Date : <b>` + this.utilityService.getISOtoStringDate(transaction.createdDate) + `</b></td>
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
          <th>CERTI. NO</th>
        ` + (transaction.transactionDetail.isShowOrigin ? `<th>ORIGIN</th>` : ``) + `     
          <th>RAP</th>
          <th>DISC %</th>           
          <th>RATE PER CT</th>
          <th>TOTAL AMOUNT</th>
        </thead>
        <tbody>`

        for (let index = 0; index <= abovePointFiveCentData.length; index++) {
          let obj = abovePointFiveCentData[index];
          if (obj) {
            htmlString += `
                <tr>
                <td>`+ (index + 1) + `</td>
                <td>`+ obj.stoneId + `</td>
                <td>`+ obj.shape + `</td>
                <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.weight ?? 0) ?? "") + `</td>
                <td>`+ obj.color + `</td>
                <td>`+ obj.clarity + `</td>
                <td>`+ obj.lab + ` ` + obj.certificateNo + `</td>
                 ` + (transaction.transactionDetail.isShowOrigin ? `<td>` + (obj.origin ?? "") + `</td>` : ``) + `
                <td>`+ obj.price.rap + `</td>
                <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.discount ?? 0) ?? "") + `</td> 
                <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.perCarat ?? 0) ?? "") + `</td>
                <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.netAmount ?? 0) ?? "") + `</td>
                </tr>`
          }
        }

        htmlString += `
        </tbody>
        <tfoot>
                <tr>
                  <td colspan="3">TOTAL TO PAY</td>
                  <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(aboveFiveCentTotalWeight) + `</td>
                  <td colspan="` + colspanValue + `">&nbsp;</td>                  
                  <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(aboveFiveCentAmont) + `</td>
                </tr>`
        htmlString += `</tfoot>
        </table>
        </div>`

        //Below 1 CT Packing List
        htmlString += `
      <div class="body-middle" style="margin: 0 45px;page-break-before: always;">
      <table>
      <tr>
      <td>Organization :<b> ` + (transaction.transactionDetail.organization.name ?? "") + `</b></td>
      <td>INVOICE No : <b>` + (transaction.refNumber ?? "") + `</b></td>
      <td>Date : <b>` + this.utilityService.getISOtoStringDate(transaction.createdDate) + `</b></td>
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
          <th>CERTI. NO</th>    
          ` + (transaction.transactionDetail.isShowOrigin ? `<th>ORIGIN</th>` : ``) + ` 
          <th>RAP</th>
          <th>DISC %</th>           
          <th>RATE PER CT</th>
          <th>TOTAL AMOUNT</th>
        </thead>
        <tbody>`

        for (let index = 0; index <= belowPointFiveCentData.length; index++) {
          let obj = belowPointFiveCentData[index];
          if (obj) {
            htmlString += `
                <tr>
                <td>`+ (index + 1) + `</td>
                <td>`+ obj.stoneId + `</td>
                <td>`+ obj.shape + `</td>
                <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.weight ?? 0) ?? "") + `</td>
                <td>`+ obj.color + `</td>
                <td>`+ obj.clarity + `</td>
                <td>`+ obj.lab + ` ` + obj.certificateNo + `</td>
                 ` + (transaction.transactionDetail.isShowOrigin ? `<td>` + (obj.origin ?? "") + `</td>` : ``) + `
                <td>`+ obj.price.rap + `</td>
                <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.discount ?? 0) ?? "") + `</td> 
                <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.perCarat ?? 0) ?? "") + `</td>
                <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.netAmount ?? 0) ?? "") + `</td>
                </tr>`
          }
        }

        htmlString += `
        </tbody>
        <tfoot>
                <tr>
                  <td colspan="3">TOTAL TO PAY</td>
                  <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(belowFiveCentTotalWeight) + `</td>
                  <td colspan="` + colspanValue + `">&nbsp;</td>                  
                  <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(belowFiveCentTotalAmount) + `</td>
                </tr>`
        htmlString += `</tfoot>
        </table>
        </div>`
      }

      htmlString += `
    </body>
    </html>
    `;
    }
    else if (invoiceType == "BELGIUMOVERSEAS") {
      let SumTotalAmtWithTax = 0;
      let tax1 = 0;
      let tax2 = 0;

      if (taxPerOne > 0)
        tax1 = Number(parseFloat(parseFloat(this.utilityService.ConvertToFloatWithDecimal((taxPerOne * (totalAmount ?? 0)) / 100).toString()).toFixed(2)));

      if (taxPerTwo > 0)
        tax2 = Number(parseFloat(parseFloat(this.utilityService.ConvertToFloatWithDecimal((taxPerTwo * (totalAmount ?? 0)) / 100).toString()).toFixed(2)));

      SumTotalAmtWithTax += this.utilityService.ConvertToFloatWithDecimalTwoDigitRoundWithNum(totalAmount + tax1 + tax2 + (transaction.transactionDetail.shippingCharge ?? 0) + (Number(transaction.transactionDetail.expense) ?? 0));

      htmlString += `    
  <body onload="window.print(); window.close();">   
    <div class="chal-wrap con-inv di-inv">
      <div class="chal-head">
        <div class="logo">
        <img src="assets/billimage/CGNew.png" alt="logo">
        </div>

        <div class="di-info cg-local">
        <span>Rough & Polished Diamonds - Import & Export</span>                
        </div>

        <div class="cd-details">            
            <p><b>BTW: ` + (transaction.transactionDetail.organization.incomeTaxNo ?? "") + `</b></p> 
            <p style="flex-basis: 248px;"><b>HRAnt: -351.856</b></p>
		    </div>
      </div>
      <div class="chal-body">
      <span class="c-st border-bottom-2" style="display: block;margin: auto;width: 135px;text-align: center;margin-top: 10px;
      margin-bottom: 20px;"> `+ ((transaction.transactionType.toLowerCase() == "proforma") ? "PROFORMA INVOICE" : "EXPORT INVOICE") + `</span>
        <div class="body-top ps-1 border-bottom-0">
          <div class="bo-left">
          <span class="c-st text-start"><b>BUYER</b> ` + transaction.toLedger.name + `</span>                    
          <span><b style="float:left">ADDRESS</b> 
          <span class="txt-left">&nbsp;` + (transaction.toLedger.address.line1 ? transaction.toLedger.address.line1 + `,` : "") + `
          </br>`
      if (transaction.toLedger.address.line2) {
        htmlString += `          
          &nbsp;&nbsp`+ (transaction.toLedger.address.line2 ?? "") + `</br>
          `
      }
      htmlString += `                
      &nbsp;&nbsp`+ (transaction.toLedger.address.zipCode ? transaction.toLedger.address.zipCode + `, ` : "") + " " + (transaction.toLedger.address.city ? transaction.toLedger.address.city + `, ` : "") + `
          </br>
          &nbsp;&nbsp`+ (transaction.toLedger.address.country ?? "") + `
          </span>
          </span>`
      if (transaction.toLedger.taxNo || transaction.toLedger.incomeTaxNo) {
        if (transaction.transactionDetail.organization.address?.country.toLowerCase() == transaction.toLedger.address.country.toLowerCase()) {
          htmlString += `
          <span><b>BTW</b> ` + (transaction.toLedger.taxNo ?? "") + ` ` + (transaction.toLedger.incomeTaxNo ?? "") + `</span>  
          `}
        else {
          htmlString += `
          <span><b>VAT NO</b> ` + (transaction.toLedger.taxNo ?? "") + ` ` + (transaction.toLedger.incomeTaxNo ?? "") + `</span>  
          `}
      }

      if (transaction.toLedger.mobileNo || transaction.toLedger.phoneNo) {
        htmlString += `
          <span><b>TEL</b> ` + (transaction.toLedger.mobileNo ? transaction.toLedger.mobileNo + `,` : "") + (transaction.toLedger.phoneNo ? transaction.toLedger.phoneNo + `,` : "") + `</span>                                        
          </div>
          `
      }

      if (transaction.transactionDetail.consigneeName) {
        htmlString += `
          <div class="di-bor-0 ship-section">
          <span class="c-st text-start"><b>SHIP TO</b><strong>&nbsp;` + (transaction.transactionDetail.consigneeName ?? "") + `</strong></span>
          <span class="c-st text-start"><b style="float:left;">SHIP ADDRESS</b><span class="txt-left">&nbsp;` + (transaction.transactionDetail.consigneeAddress ?? "") + `</span></span>
          </div>`
      }

      htmlString += `
        <div class="di-bor-0 inv-section">
        <span class="c-st text-start"><b>INVOICE NO</b> ` + transaction.refNumber + `</span>
        <span class="c-st text-start"><b>DATE</b> ` + this.utilityService.getISOtoStringDate(transaction.transactionDate) + `</span>
        <span class="c-st text-start"><b style="float:left">TERMS </b> <span class="txt-left">&nbsp;` + (transaction.transactionDetail.terms ?? "") + `</span></span> 
        <span class="c-st text-start"><b style="float:left">ORIGIN </b> <span class="txt-left">&nbsp;`+ 'INDIA' + `</span></span> 
        `
      if (transaction.transactionDetail.dueDate) {
        htmlString += `
        <span class="c-st text-start"><b>DUE DATE</b> ` + this.utilityService.getISOtoStringDate(transaction.transactionDetail.dueDate) + `</span> 
        `
      }

      htmlString += `
          </div>
          </div>
          `

      if (transaction.packingList.length > 10 || (transaction.transactionDetail.isPackingList)) {
        htmlString += `
        <div class="body-middle" style="margin-top: 10px;">
          <table>
            <thead>
              <th>No</th>                       
              <th colspan="6">DESCRIPTION</th>
              <th>PCS</th>
              <th>CARATS</th>
              <th>RATE `+ transaction.transactionDetail.fromCurrency + ` PER CT</th>
              <th>TOTAL AMOUNT `+ transaction.transactionDetail.fromCurrency + `</th>
            </thead>
            <tbody>`

        htmlString += `
                <tr>
                <td>1</td>
                <td colspan="6">0.50 CT ABOVE SIZE</td>                
                <td>`+ aboveFiveCentTotalStone + `</td>
                <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(aboveFiveCentTotalWeight) + `</td>
                <td>`+ aboveTotalPerCarat + `</td>
                <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(aboveFiveCentAmont) + `</td>
                </tr>`

        htmlString += `
                <tr>
                <td></td>
                <td colspan="6">CUT & POLISHED DIAMONDS</td>                
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                </tr>`

        htmlString += `
                <tr>
                <td></td>
                <td colspan="6">AS PER PACKING LIST 1</td>                
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                </tr>`

        htmlString += `
                <tr>
                <td>&nbsp</td>
                <td colspan="6"></td>                
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                </tr>`

        htmlString += `
                <tr>
                <td>2</td>
                <td colspan="6">0.50 CT BELOW SIZE</td>                
                <td>`+ belowFiveCentTotalStone+ `</td>
                <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(belowFiveCentTotalWeight) + `</td>
                <td>`+ belowTotalPerCarat + `</td>
                <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(belowFiveCentTotalAmount) + `</td>
                </tr>`

        htmlString += `
                <tr>
                <td></td>
                <td colspan="6">CUT & POLISHED DIAMONDS</td>                
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                </tr>`

        htmlString += `
                <tr>
                <td></td>
                <td colspan="6">AS PER PACKING LIST 2</td>                
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                </tr>`
      }

      else if (transaction.packingList.length < 11) {
        htmlString += `
        <div class="body-middle" style="margin-top: 10px;">
          <table>
          <thead>
          <th>No</th>
          <th>STONE ID</th>
          <th>SHAPE</th>          
          <th>COLOR</th>
          <th>CLARITY</th>
          <th>LAB</th>       
          <th colspan="2">CERTI. NO</th> 
          <th>CARATS</th>  
          <th>RATE `+ (transaction.transactionDetail.fromCurrency ?? "") + ` /PER CT</th>
          <th>TOTAL AMOUNT `+ (transaction.transactionDetail.fromCurrency ?? "") + `</th>            
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
              <td>`+ (obj.color ?? "") + `</td>
              <td>`+ (obj.clarity ?? "") + `</td>
              <td>`+ (obj.lab ?? "") + `</td>
              <td colspan="2">`+ (obj.certificateNo ?? "") + `</td>             
              <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.weight ?? 0) ?? "") + `</td>
              <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.perCarat ?? 0) ?? "") + `</td>
              <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.netAmount ?? 0) ?? "") + `</td>
              </tr>`
          }
        }
      }

      htmlString += ` 
      <tr>
      <td colspan="8" style="text-align:right; padding-right:10px;"><strong>Sub Total</strong></td>      
      <td><strong>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(totalWeight) + `</strong></td>
      <td><strong>`+ totalPerCarat + `</strong></td>
      <td><strong>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(totalAmount) + ` (` + transaction.transactionDetail.fromCurrency + `)</strong></td>
      </tr>`
      if (taxPerOne) {
        htmlString += `
                <tr>
                <td colspan="10" style="text-align:right; padding-right:10px;" >`+ taxNameOne + ` ( ` + taxPerOne + ` % ) </td>
                <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit((taxPerOne * (totalAmount ?? 0)) / 100) + `</td>
                </tr>`
      }
      if (transaction.transactionDetail.shippingCharge > 0 || Number(transaction.transactionDetail.expense) > 0) {
        htmlString += `
                <tr>
                <td colspan="10" style="text-align:right; padding-right:10px;">Charges</td> 
                <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigitRoundWithNum((transaction.transactionDetail.shippingCharge ?? 0) + (Number(transaction.transactionDetail.expense) ?? 0)) + `</td>
                </tr>`
      }

      htmlString += `                        
      </tbody>
      <tfoot>
      <tr class="border-left-0 border-bottom-0">`

      /*if (transaction.transactionDetail.toCurrency && (transaction.transactionDetail.fromCurrency != transaction.transactionDetail.toCurrency)) {
        htmlString += `                     
              <td colspan="8" style="color:red">`+ transaction.transactionDetail.fromCurRate + ` (` + transaction.transactionDetail.toCurrency + `) ` + `= ` + (1 / (transaction.transactionDetail.toCurRate ?? 0)).toFixed(4) + ` (` + transaction.transactionDetail.fromCurrency + `)` + `</td>
              <td style="color:red">`+ (totalPayableAmount * (transaction.transactionDetail.toCurRate ?? 0)).toFixed(2) + ` (` + transaction.transactionDetail.toCurrency + `)</td>                  
            `
      }
      else {
        htmlString += `<td colspan="9" class="border-left-0 border-bottom-0 border-top-0"></td>`
      }*/

      htmlString += `                     
      <td colspan="8" style="color:red">1 (EURO) = ` + ((this.EuroToUSDRate ?? 0)).toFixed(4) + ` (USD)` + `</td>
      <td style="color:red">`+ (Number(this.utilityService.ConvertToFloatWithDecimalTwoDigit(SumTotalAmtWithTax)) * (1 / this.EuroToUSDRate ?? 0)).toFixed(2) + ` (EURO)</td>                  
    `

      htmlString += `
      <td  style="text-align:right; padding-right:10px;"><strong>TOTAL TO PAY</strong></td>                          
      <td class="clr-yellow" style="font-size:18px"><strong>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(SumTotalAmtWithTax) + ` (` + transaction.transactionDetail.fromCurrency + `)</strong></td>                         
      </tr> ` ;

      htmlString += `  
      </tfoot>
    </table>
    </div>
    `

      htmlString += ` 
        <div class="body-fotter">  
        <div class="body-middle" style="margin: 20px 0;">           
        <table class="cif-brd">          
        <tr>
          <td><b>CIF : </b>`+ (transaction.transactionDetail.cifCityName ?? "") + `</td>
          <td><b>PORT : </b>`+ (transaction.transactionDetail.portOfLoading ?? "") + `</td>
          <td><b>SHIPPED VIA : </b>`+ (transaction.transactionDetail.logistic.name ?? "") + `</td>
          <td><b>INSURED BY : </b>`+ (transaction.transactionDetail.logistic.name ?? "") + `</td>
        </tr>             
        </tfoot>
      </table>
      </div> 

      <div class="border-left-2 border-right-2" style="border-top: 2px solid;">
        <div class="bo-left border-bottom-2 ps-1">       
              <span class="c-st text-start"><strong>Payment instructions:</strong></span>
              <table class="cg-tbl">
              <tbody>
              `
      if (transaction.transactionDetail.bank.accountName) {
        htmlString += `  
              <tr>
              <td>ACCOUNT NAME</td>
              <td>: <b>`+ (transaction.transactionDetail.bank.accountName ?? "") + `</b></td>
              </tr>
              `
      }
      if (transaction.transactionDetail.bank.bankName) {
        htmlString += `
              <tr>
              <td>BANK NAME</td>
              <td>: <b>`+ (transaction.transactionDetail.bank.bankName ?? "") + `</b></td>
              </tr>
              `
      }
      if (transaction.transactionDetail.bank.iBan) {
        htmlString += `
              <tr>
              <td>IBAN NO</td>
              <td>: <b>`+ (transaction.transactionDetail.bank.iBan ?? "") + `</b></td>
              </tr>
              `
      }
      if (transaction.transactionDetail.bank.accountNo) {
        htmlString += `
              <tr>
              <td>A/C NO</td>
              <td>: <b>`+ (transaction.transactionDetail.bank.accountNo ?? "") + `</b></td>
              </tr>
              `
      }
      if (transaction.transactionDetail.bank.swift) {
        htmlString += `
              <tr>              
              <td>SWIFT CODE</td>
              <td>: <b>`+ (transaction.transactionDetail.bank.swift ?? "") + `</b></td>
              </tr>
              `
      }
      if (transaction.transactionDetail.bank.address.line1) {
        htmlString += `
              <tr>
              <td>BANK ADDRESS</td>
              <td>: <b>`+ (transaction.transactionDetail.bank.address.line1 ? transaction.transactionDetail.bank.address.line1 + `,` : "") + (transaction.transactionDetail.bank.address.line2 ? transaction.transactionDetail.bank.address.line2 + `,` : "") + (transaction.transactionDetail.bank.address.city ? transaction.transactionDetail.bank.address.city + `,` : "")
          + (transaction.transactionDetail.bank.address.country ? transaction.transactionDetail.bank.address.country + `,` : "") + (transaction.transactionDetail.bank.address.zipCode ?? "") + `</b></td>
              </tr>   
              `
      }
      if (transaction.transactionDetail.bank.intermediaryBankName) {
        htmlString += `
              <tr>
                <td>INTERMEDIATE BANK</td>
                <td>: <b>`+ (transaction.transactionDetail.bank.intermediaryBankName ?? "") + `</b></td>                        
              </tr>  
              `
      }
      if (transaction.transactionDetail.bank.intermediaryBankswift) {
        htmlString += `
              <tr>
                <td>INTERMEDIATE SWIFTCODE</td>                      
                <td>: <b>`+ (transaction.transactionDetail.bank.intermediaryBankswift ?? "") + `</b></td>
              </tr>     
              `
      }
      if (transaction.transactionDetail.bank.intermediaryBankAddress) {
        htmlString += `   
              <tr>
                <td>INTERMEDIATE ADDRESS</td>                       
                <td>: <b>`+ (transaction.transactionDetail.bank.intermediaryBankAddress ?? "") + `</b></td>                        
              </tr>  
              `
      }
      htmlString += `
            </tbody>
            </table>
            </div> 
            </div>
          </div>
          `

      htmlString += ` 
        <div class="body-f-footer">
        <span class="c-st border-bottom-2">GUIDELINES</span>
        <ul>
        <li><b>Bank Charges On Buyer Only : Payment Must Include All Bank Charges (Including Intermediatary Bank Charges)</b></li>
        <li><b>ONLY US$ PAYMENT : Buyer have to pay in USD($) only, As we have USD($) account in related Bank. We will be not responsible for payments made in any other currencies.</b></li>
        <li>This sale is done with retention of title. The buyer will only become owner of the goods after full payment of this
        invoice. The buyer acknowledged that this invoice is pledged to ` + (transaction.transactionDetail.bank.bankName ?? "") + ` and that releases can
        only be obtained through payment on the account of the seller at ` + (transaction.transactionDetail.bank.bankName ?? "") + ` as mentioned on this
        invoice. This invoice may never be compensated with claims from the buyer on the seller.</li>
        <li>The diamonds here in invoiced are exclusively of natural origin and untreated based on personal knowledge and/or
        written guarantees provided by the supplier of these diamonds.</li>
        <li>The diamonds herein invoiced have been purchased from legitimate sources not involved in funding conflict and in
        compliance with United Nation resolutions. The seller hereby guarantees that these diamonds are conflict free, based
        on personal knowledge and/or written guarantees provided by the supplier of these diamonds. </li>      
        <b style="text-decoration: underline;">H.R.A 351 856, BTW BE 0478 554 943 </b>      
        `+ (transaction.toLedger.address.country.toLowerCase() == 'belgium' ? `<li>The Antwerp Tribunal of Commerce is solely competent in case of litigation Vrij van B.T.W. Art. 42§4 van het Wetboek. Above mentioned good will be consignment until receipt of the payment of this invoice.</li>` : `<li>The Antwerp Tribunal of Commerce is solely competent in case of litigation Vrij van B.T.W. Art. 39 van het Wetboek. Above mentioned good will be consignment until receipt of the payment of this invoice. </li>`)

      if (transaction.transactionDetail.additionalDeclaration) {
        htmlString += `<li>` + (transaction.transactionDetail.additionalDeclaration ?? "") + `</li>`
      }
      htmlString += `  
        </ul>
        </div>
        `

      var startCount: number;
      var endCount: number;
      startCount = 0;
      endCount = 0;

      if (transaction.packingList.length > 10 || transaction.transactionDetail.isPackingList) {//Summary
        startCount = 5;
        if (isCGMail)
          endCount = 12;
        else
          endCount = 15;
      }
      else if (transaction.packingList.length < 11) {//PL
        startCount = transaction.packingList.length;
        endCount = 14 - transaction.packingList.length;
        if (isCGMail)
          endCount = 11 - transaction.packingList.length;
        else
          endCount = 14 - transaction.packingList.length;
      }

      if (transaction.transactionDetail.taxTypes.length > 0)
        endCount = endCount - 1
      if (transaction.transactionDetail.shippingCharge > 0)
        endCount = endCount - 1
      if (transaction.transactionDetail.consigneeName)
        endCount = endCount - 2
      if (transaction.toLedger.address.line2)
        endCount = endCount - 2
      if (transaction.transactionDetail.additionalDeclaration)
        endCount = endCount - 1
      if (transaction.toLedger.mobileNo || transaction.toLedger.phoneNo)
        endCount = endCount - 1
      if (transaction.transactionDetail.bank.address.line1)
        endCount = endCount - 1
      if (transaction.transactionDetail.bank.intermediaryBankAddress)
        endCount = endCount - 1
      if (transaction.toLedger.taxNo || transaction.toLedger.incomeTaxNo)
        endCount = endCount - 1
      if (!transaction.transactionDetail.bank.iBan)
        endCount = endCount + 1
      if (taxPerOne)
        endCount = endCount - 2

      if (transaction.packingList.length > 10 || (transaction.transactionDetail.isPackingList)) {
        for (let index = startCount; index <= endCount - 5; index++) {
          htmlString += `
                          <table class="border-remove">
                          <tr>
                          <td>&nbsp</td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          </tr>   
                          </table>               
                          `
        }
      } else {
        for (let index = startCount; index <= endCount; index++) {
          htmlString += `
                          <table class="border-remove">
                          <tr>
                          <td>&nbsp</td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          </tr>   
                          </table>               
                          `
        }
      }

      htmlString += `
      <span class="dt-last">Date : ` + this.utilityService.getISOtoStringDate(transaction.transactionDate) + `</span>
        <div class="di-info cg-local border-top-2">
        <span>
          <b>` + (transaction.transactionDetail.organization.name ?? "") + ` : </b>&nbsp` + (transaction.transactionDetail.organization.address?.line1 ?? "") + `,&nbsp` + (transaction.transactionDetail.organization.address?.line2 ?? "") + ",&nbsp" + (transaction.transactionDetail.organization.address?.zipCode ?? "") + ",&nbsp" + (transaction.transactionDetail.organization.address?.city ?? "") + `,&nbsp` + (transaction.transactionDetail.organization.address?.country ?? "") + `
        </span>
        <span><b>GSM :</b> ` + (transaction.transactionDetail.organization.mobileNo ?? "") + `, <b>TEL :</b>` + (transaction.transactionDetail.organization.phoneNo ?? "") + `&nbsp;&nbsp;<b>Email :</b>
        ` + (transaction.transactionDetail.organization.email ?? "") + `</span>
        </div>
        </div>
        </div>
      </div>
    </div>
    `

      if (transaction.packingList.length > 10 || (transaction.transactionDetail.isPackingList)) {
        //Above 1 Carat PL
        htmlString += `
        <div class="body-middle" style="margin: 0 45px;">
      <table>
      <tr>
      <td>Organization :<b> ` + (transaction.transactionDetail.organization.name ?? "") + `</b></td>
      <td>INVOICE No : <b>` + (transaction.refNumber ?? "") + `</b></td>
      <td>Date : <b>` + this.utilityService.getISOtoStringDate(transaction.createdDate) + `</b></td>
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
          <th>CERTI. NO</th>    
          ` + (transaction.transactionDetail.isShowOrigin ? `<th>ORIGIN</th>` : ``) + ` 
          <th>RAP</th>
          <th>DISC %</th>           
          <th>RATE PER CT</th>
          <th>TOTAL AMOUNT</th>
        </thead>
        <tbody>`

        for (let index = 0; index <= abovePointFiveCentData.length; index++) {
          let obj = abovePointFiveCentData[index];
          if (obj) {
            htmlString += `
                <tr>
                <td>`+ (index + 1) + `</td>
                <td>`+ obj.stoneId + `</td>
                <td>`+ obj.shape + `</td>
                <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.weight ?? 0) ?? "") + `</td>
                <td>`+ obj.color + `</td>
                <td>`+ obj.clarity + `</td>
                <td>`+ obj.lab + ` ` + obj.certificateNo + `</td>
                 ` + (transaction.transactionDetail.isShowOrigin ? `<td>` + (obj.origin ?? "") + `</td>` : ``) + `
                <td>`+ obj.price.rap + `</td>
                <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.discount ?? 0) ?? "") + `</td> 
                <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.perCarat ?? 0) ?? "") + `</td>
                <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.netAmount ?? 0) ?? "") + `</td>
                </tr>`
          }
        }

        htmlString += `
        </tbody>
        <tfoot>
                <tr>
                  <td colspan="3">TOTAL TO PAY</td>
                  <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(aboveFiveCentTotalWeight) + `</td>
                  <td colspan="` + colspanValue + `">&nbsp;</td>                  
                  <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(aboveFiveCentAmont) + `</td>
                </tr>`
        htmlString += `</tfoot>
        </table>
        </div>`

        //Below 1 Carat PL
        htmlString += `
        <div class="body-middle" style="margin: 0 45px;page-break-before: always;">
      <table>
      <tr>
      <td>Organization :<b> ` + (transaction.transactionDetail.organization.name ?? "") + `</b></td>
      <td>INVOICE No : <b>` + (transaction.refNumber ?? "") + `</b></td>
      <td>Date : <b>` + this.utilityService.getISOtoStringDate(transaction.createdDate) + `</b></td>
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
          <th>CERTI. NO</th>    
          ` + (transaction.transactionDetail.isShowOrigin ? `<th>ORIGIN</th>` : ``) + ` 
          <th>RAP</th>
          <th>DISC %</th>           
          <th>RATE PER CT</th>
          <th>TOTAL AMOUNT</th>
        </thead>
        <tbody>`

        for (let index = 0; index <= belowPointFiveCentData.length; index++) {
          let obj = belowPointFiveCentData[index];
          if (obj) {
            htmlString += `
                <tr>
                <td>`+ (index + 1) + `</td>
                <td>`+ obj.stoneId + `</td>
                <td>`+ obj.shape + `</td>
                <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.weight ?? 0) ?? "") + `</td>
                <td>`+ obj.color + `</td>
                <td>`+ obj.clarity + `</td>
                <td>`+ obj.lab + ` ` + obj.certificateNo + `</td>
                 ` + (transaction.transactionDetail.isShowOrigin ? `<td>` + (obj.origin ?? "") + `</td>` : ``) + `
                <td>`+ obj.price.rap + `</td>
                <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.discount ?? 0) ?? "") + `</td> 
                <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.perCarat ?? 0) ?? "") + `</td>
                <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.netAmount ?? 0) ?? "") + `</td>
                </tr>`
          }
        }

        htmlString += `
        </tbody>
        <tfoot>
                <tr>
                  <td colspan="3">TOTAL TO PAY</td>
                  <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(belowFiveCentTotalWeight) + `</td>
                  <td colspan="` + colspanValue + `">&nbsp;</td>                  
                  <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(belowFiveCentTotalAmount) + `</td>
                </tr>`
        htmlString += `</tfoot>
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
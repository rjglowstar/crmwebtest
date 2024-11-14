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
export class HkInvoiceFormatService {
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
    const colspanValue = transaction.transactionDetail.isShowOrigin ? 5 : 4;
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

    if (invoiceType == "HKLOCAL") {
      htmlString += `  
          <body onload="window.print(); window.close();">       
            <div class="chal-wrap con-inv di-inv">
            <div class="chal-head">
            <div class="logo">
              <img src="assets/billimage/diamarthk1.png" alt="logo">
            </div>
            <div class="di-info">
            <span>` + (transaction.transactionDetail.organization.address?.line1 ? transaction.transactionDetail.organization.address?.line1 + `,` : "") + (transaction.transactionDetail.organization.address?.line2 ? transaction.transactionDetail.organization.address?.line2 + "," : "") + `</span>            
            <span>` + (transaction.transactionDetail.organization.address?.city ? transaction.transactionDetail.organization.address?.city + `,` : "") + (transaction.transactionDetail.organization.address?.state ? transaction.transactionDetail.organization.address?.state + `,` : "") + (transaction.transactionDetail.organization.address?.country ?? "") + `</span> 
            <span>Email: ` + (transaction.transactionDetail.organization.email ?? "") + `</span>    
            <span>Contact No: ` + (transaction.transactionDetail.organization.phoneNo ?? "") + `</span>   
            </div>        
          </div>
              <div class="chal-body">
                <span class="c-st border-left-2 border-right-2">`+ ((transaction.transactionType.toLowerCase() == "proforma") ? "Proforma INVOICE" : "INVOICE") + `</span>
                <div class="body-top ps-1 border-bottom-0">
                  <div class="bo-left w-50">
                    <span class="c-st text-start">To.: ` + (transaction.toLedger.name ?? "") + `</span>
                    <span>` + (transaction.toLedger.address.line1 ? transaction.toLedger.address.line1 + `,` : "") + (transaction.toLedger.address.line2 ?? "") + `</span>            
                    <span>` + (transaction.toLedger.address.city ? transaction.toLedger.address.city + `,` : "") + (transaction.toLedger.address.state ? transaction.toLedger.address.state + `,` : "") + (transaction.toLedger.address.country ?? "") + `</span>                                                   
                    <span>TEL: ` + (transaction.toLedger.mobileNo ? transaction.toLedger.mobileNo + `,` : "") + (transaction.toLedger.phoneNo ? transaction.toLedger.phoneNo + `,` : "") + `FAX: ` + (transaction.toLedger.faxNo ?? "") + `</span>           
                  </div>
                  <div class="di-bor-0">
                    <table>
                      <tbody>
                        <tr>
                          <td><b>INVOICE NO.</b></td>
                          <td>` + transaction.refNumber + `</td>
                        </tr>
                        <tr>
                          <td><b>DATE:</b></td>
                          <td>` + this.utilityService.getISOtoStringDate(transaction.transactionDate) + `</td>
                        </tr>
                        <tr>
                          <td><b>TERMS:</b></td>
                          <td>` + (transaction.transactionDetail.terms ?? "") + `</td>
                        </tr>
                        `
      if (transaction.transactionDetail.dueDate) {
        htmlString += `
                        <tr>
                          <td><b>Due Date:</b></td>
                          <td>` + this.utilityService.getISOtoStringDate(transaction.transactionDetail.dueDate) + `</td>
                        </tr>`
      }
      htmlString += `   
                      </tbody>
                    </table>
                  </div>
                </div>
                <div class="body-middle">
                  <table>
                    <thead>
                      <th>No</th>                       
                      <th>DESCRIPTION</th>
                      <th>PCS</th>
                      <th>CARATS</th>
                      <th>RATE `+ transaction.transactionDetail.fromCurrency + ` PER CT</th>
                      <th>TOTAL AMOUNT `+ transaction.transactionDetail.fromCurrency + `</th>
                    </thead>
                    <tbody>`

      htmlString += `
                        <tr>
                        <td></td>
                        <td>CUT & POLISHED DIAMONDS</td>                
                        <td>`+ totalStone + `</td>
                        <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(totalWeight) + `</td>
                        <td>`+ totalPerCarat + `</td>
                        <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(totalAmount) + `</td>
                        </tr>`

      for (let index = 2; index <= blankHKLocal; index++) {
        htmlString += `
                        <tr>
                        <td>&nbsp</td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        </tr>`
      }

      if (transaction.transactionDetail.shippingCharge > 0) {
        htmlString += `
                        <tr>
                        <td colspan="5" style="text-align:right" >Shipping Charges </td>       
                        <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(transaction.transactionDetail.shippingCharge ?? 0) + `</td>
                        </tr>`
      }

      if (taxPerOne) {
        htmlString += `
                    <tr>
                    <td colspan="5" style="text-align:right; padding-right:10px;" >`+ taxNameOne + ` ( ` + taxPerOne + ` % ) </td>
                    <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit((taxPerOne * (totalAmount ?? 0)) / 100) + `</td>
                    </tr>`
      }
      if (taxPerTwo) {
        htmlString += `
                    <tr>
                    <td colspan="5" style="text-align:right; padding-right:10px;" >`+ taxNameTwo + ` ( ` + taxPerTwo + ` % ) </td>
                    <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit((taxPerTwo * (totalAmount ?? 0)) / 100) + `</td>
                    </tr>`
      }
      if (Number(transaction.transactionDetail.expense) > 0) {
        htmlString += `
                        <tr>
                        <td colspan="5" style="text-align:right" >Other Charges </td>       
                        <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(Number(transaction.transactionDetail.expense) ?? 0) + `</td>
                        </tr>`
      }

      htmlString += `                        
                    </tbody>
                    <tfoot>
                    <tr>
                      <td colspan="2" style="text-align:right"><b>Grand Total</b>  </td>
                      <td>`+ totalStone + `</td>
                      <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(totalWeight) + `</td>
                      <td>`+ totalPerCarat + `</td>
                      <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(totalPayableAmount) + ` (` + transaction.transactionDetail.fromCurrency + `)</td>
                    </tr>`
      if (transaction.transactionDetail.toCurrency) {
        htmlString += `
                      <tr>
                      <td colspan="4"></td>
                      <td>`+ transaction.transactionDetail.fromCurRate + ` (` + transaction.transactionDetail.fromCurrency + `) ` + `= ` + transaction.transactionDetail.toCurRate + ` (` + transaction.transactionDetail.toCurrency + `)` + `</td>
                      <td>`+ (totalPayableAmount * (transaction.transactionDetail.toCurRate ?? 0)).toFixed(2) + ` (` + transaction.transactionDetail.toCurrency + `)</td>
                    </tr>`
      }
      htmlString += `
    
                    <tr>
                    <td colspan="6" style="text-align:right"><b>Amount in Words : </b>`+ this.utilityService.convertAmoutToWord(this.utilityService.ConvertToFloatWithDecimalTwoDigitRoundWithNum(totalPayableAmount), "USD") + `</td>                
                    </tr>  
        
                    </tfoot>
                  </table>
                </div>
                <div class="body-fotter">
                  <div class="body-top border-top-0 border-bottom-2 ps-1">
                    <div class="bo-left w-50 border-right-2">             
                      <span class="c-st text-start">Our Bank Details</span>
                      <table>
                        <tbody>
                          <tr>
                            <td><b>BENEFICIARY BANK : </b></td>
                            <td>`+ (transaction.transactionDetail.bank.bankName ?? "") + `</td>
                          </tr>
                          <tr>
                            <td><b>BANK CODE : </b></td>
                            <td>`+ (transaction.transactionDetail.bank.ifsc ?? "") + `</td>
                          </tr>
                          <tr>
                            <td><b>ADDRESS :</b></td>
                            <td>`+ (transaction.transactionDetail.bank.address.line1 ? transaction.transactionDetail.bank.address.line1 + `,` : "") + (transaction.transactionDetail.bank.address.line2 ? transaction.transactionDetail.bank.address.line2 + `,` : "") + (transaction.transactionDetail.bank.address.city ? transaction.transactionDetail.bank.address.city + `,` : "")
        + (transaction.transactionDetail.bank.address.state ? transaction.transactionDetail.bank.address.state + `,` : "") + (transaction.transactionDetail.bank.address.country ? transaction.transactionDetail.bank.address.country + `,` : "") + (transaction.transactionDetail.bank.address.zipCode ?? "") + `</td>
                          </tr>
                          <tr>
                            <td><b>ACCOUNT NAME :</b></td>
                            <td>`+ (transaction.transactionDetail.bank.accountName ?? "") + `</td>
                          </tr>
                          <tr>
                            <td><b>A/C NO :</b></td>
                            <td>`+ (transaction.transactionDetail.bank.accountNo ?? "") + `</td>
                          </tr>
                          <tr>
                            <td><b>SWIFT CODE :</b></td>
                            <td>`+ (transaction.transactionDetail.bank.swift ?? "") + `</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    
                    <div class="bo-left w-50" style="display: grid;">
                    <div class="border-bottom-2">&nbsp</div>
                    <div class="border-bottom-2">&nbsp</div>
                    <div>&nbsp</div>
                    </div>
                    
                  </div>
        
                  <div class="body-f-mid">
                    <div class="body-f-left">
                      <span class="c-st di">FOR ,`+ (transaction.transactionDetail.organization.name ?? "") + `</span>
                      <div class="ch-sig">  
                      <span>&nbsp</span>
                      <span>&nbsp</span>
                      <span>&nbsp</span>                             
                      <span>Authorized Signature(S)</span>
                      </div>
                    </div>
                    <div class="body-f-right">
                      <span class="c-st di">Purchaser For and on behalf of</span>
                      <div class="ch-sig">
                      <span>&nbsp</span>
                      <span>&nbsp</span>
                      <span>&nbsp</span>   
                      <span>Chop & Signature</span>
                      </div>
                    </div>
                  </div>
        
                  <div class="body-f-footer">
                  <span class="c-st border-bottom-2">Terms of Service / Declaration</span>          
                  <ul>  
                  <li><b> Goods once sold are not ruturnable.</b></li>
                  <li><b> All goods are sold & Delivered in HONG KONG </b></li>
                  <li><b> This contract is governed by the laws of HKSAR.</b></li>
                  <li> The diamonds herein invoiced have been purchased from legitimate sources not invoived in funding conflict and in compliance with united nations resolution.</li> 
                  <li> The seller hereby Guarantees that these diamonds are conflict free base on personal knowledge and/or written guarantees provided by the supplier of these diamonds.</li>            
                  <li> The ownership of the goods set out in this invoice will not pass until payment in full of the purchase price.Before then, the purchaser holds the goods as a bailee and must return the goods immediately to the seller upon demand and shall store them separately and in a manner to enable them to be identified.</li> 
                  <li> Until such goods are returned to us and actually received by us, they are at your risk from all hazards.</li> 
                  <li> Until such time as title in the goods has passed to the purchaser, the seller shall be entitled to seek a court order against the purchaser for delivery up of the goods and/or an injunction to prevent the purchaser from dealing or otherwise disposing of the goods.</li>`
      if (transaction.transactionDetail.additionalDeclaration)
        htmlString += `<li>` + (transaction.transactionDetail.additionalDeclaration ?? "") + `</li> `
      htmlString += `</ul>   
                  </div>
                </div>
              </div>
            </div>`

      if (transaction.packingList.length > 0) {
        htmlString += `
              <div class="body-middle">
    
              <table>
              <tr>
              <td>Organization :<b> ` + (transaction.transactionDetail.organization.name ?? "") + `</b></td>
              <td>INVOICE No : <b>` + (transaction.refNumber ?? "") + `</b></td>
              <td>Date : <b>` + this.utilityService.getISOtoStringDate(transaction.transactionDate) + `</b></td>
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
                  <th>LAB</th>  
                  <th>CERTI. NO</th>          
                  ` + (transaction.transactionDetail.isShowOrigin ? `<th>ORIGIN</th>` : ``) + `  
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
                         ` + (transaction.transactionDetail.isShowOrigin ? `<td>` + (obj.origin ?? "") + `</td>` : ``) + `
                        <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.perCarat ?? 0) ?? "") + `</td>
                        <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.netAmount ?? 0) ?? "") + `</td>
                        </tr>`
          }
        }

        htmlString += `
               
             
                        <tr>
                          <td colspan="3">Grand Total</td>
                          <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(totalWeight) + `</td>
                          <td colspan="` + colspanValue + `">&nbsp;</td>
                          <td>`+ totalPerCarat + `</td>
                          <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(totalAmount) + `</td>
                        </tr>`
        if (transaction.transactionDetail.toCurrency) {
          htmlString += `     
                        <tr>
                          <td colspan="3">`+ transaction.transactionDetail.toCurrency + ` @ ` + transaction.transactionDetail.toCurRate + `</td>
                          <td colspan="` + (colspanValue+2) + `"></td> 
                          <td>`+ (totalAmount * (transaction.transactionDetail.toCurRate ?? 0)).toFixed(2) + `</td>             
                        </tr>`
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
    else if (invoiceType == "HKOVERSEAS") {
      htmlString += `
          <body onload="window.print(); window.close();">       
            <div class="chal-wrap con-inv di-inv">
              <div class="chal-head">
                <div class="logo">
                  <img src="assets/billimage/diamarthk1.png" alt="logo">
                </div>
                <div class="di-info">
                <span>` + (transaction.transactionDetail.organization.address?.line1 ?? "") + `,` + (transaction.transactionDetail.organization.address?.line2 ?? "") + `</span>            
                <span>` + (transaction.transactionDetail.organization.address?.city ?? "") + `,` + (transaction.transactionDetail.organization.address?.state ?? "") + `,` + (transaction.transactionDetail.organization.address?.country ?? "") + `</span> 
                <span>Email: ` + (transaction.transactionDetail.organization.email ?? "") + `</span>  
                <span>Contact No: ` + (transaction.transactionDetail.organization.phoneNo ?? "") + `</span>               
                </div>        
              </div>
              <div class="chal-body">
          <span class="c-st border-left-2 border-right-2 border-bottom-2">`+ ((transaction.transactionType.toLowerCase() == "proforma") ? "Proforma INVOICE" : "INVOICE") + `</span>
          <div class="body-top ps-1 border-bottom-0">
    
            <div class="bo-left border-right-2" style="flex-basis: 70%;">
    
              <div class="di-bor-0 border-bottom-2">
                    <span class="c-st text-start">Buyer (If other than consignee):</span>
                    <span>` + (transaction.toLedger.name ?? "") + `</span>
                    <span>` + (transaction.toLedger.address.line1 ?? "") + `&nbsp` + (transaction.toLedger.address.line2 ?? "") + (transaction.toLedger.address.city ?? "") + `,&nbsp` + (transaction.toLedger.address.state ?? "") + `,&nbsp` + (transaction.toLedger.address.country ?? "") + `</span>            
                    <span>ZipCode : ` + (transaction.toLedger.address.zipCode ?? "") + `, &nbsp TEL: ` + (transaction.toLedger.mobileNo ?? "") + `, &nbsp Tax No: ` + (transaction.toLedger.taxNo ?? "") + ` ` + (transaction.toLedger.incomeTaxNo ?? "") + `</span>                
                    </div>
                    `

      if (transaction.transactionDetail.consignee.name || transaction.transactionDetail.consigneeName) {
        htmlString += `
                              <span class="c-st text-start">Ship To:</span>
                              <span>` + (transaction.transactionDetail.consignee.name ? transaction.transactionDetail.consignee.name ?? "" : transaction.transactionDetail.consigneeName ?? "") + `</span>
                              <span>` + (transaction.transactionDetail.consignee.address.line1 ? transaction.transactionDetail.consignee.address.line1 ?? "" : transaction.transactionDetail.consigneeAddress ?? "") + `&nbsp` + (transaction.transactionDetail.consignee.address.line2 ?? "") + (transaction.transactionDetail.consignee.address.city ?? "") + `,&nbsp` + (transaction.transactionDetail.consignee.address.state ?? "") + `,&nbsp` + (transaction.transactionDetail.consignee.address.country ?? "") + `</span>            
                              <span>ZipCode : ` + (transaction.transactionDetail.consignee.address.zipCode ?? "") + `,&nbsp TEL: ` + (transaction.transactionDetail.consignee.mobileNo ?? "") + `,&nbsp Tax No: ` + (transaction.transactionDetail.consignee.taxNo ?? "") + ` ` + (transaction.transactionDetail.consignee.incomeTaxNo ?? "") + `</span>                
                              `
      }
      else {
        htmlString += `
                              <span class="c-st text-start"></span>
                              <span> &nbsp </span>
                              <span> &nbsp </span>
                              `
      }

      htmlString += `
                </div>
                <div class="di-bor-0 p-1">
                    <table>
                      <tbody>
                        <tr>
                          <td><b>Invoice NO.</b></td>
                          <td>` + transaction.refNumber + `</td>
                        </tr>
                        <tr>
                          <td><b>Date:</b></td>
                          <td>` + this.utilityService.getISOtoStringDate(transaction.transactionDate) + `</td>
                        </tr>                    
                        <tr>
                          <td><b>Terms:</b></td>
                          <td>` + (transaction.transactionDetail.terms ?? "") + `</td>
                        </tr>                    
                        <tr>
                        <td><b>ORIGIN:</b></td>
                          <td>INDIA</td>                    
                        </tr>  
                        `
      if (transaction.transactionDetail.cifCityName) {
        htmlString += `
                                        <tr>
                                        <td><b>CIF:</b></td>     
                                        <td>`+ transaction.transactionDetail.cifCityName + `</td>
                                        </tr>`
      } `              
                        `
      if (contain49Down)
        htmlString += `<tr><td><b>HSN CODE:</b></td>
                           <td>71023910</td></tr>`

      if (contain49Up)
        htmlString += `<tr><td><b>HSN CODE:</b></td>
                           <td>71023920</td></tr>`

      htmlString += `      
                      </tbody>
                    </table>
                  </div>
                </div> 
                
    
                <div class="body-middle">
                  `
      if (transaction.packingList.length < 21) {
        htmlString += `
            <table><tr><td><b>DESCRIPTION : CUT & POLISHED DIAMONDS</b></td></tr></table>
              <table>        
              <thead>
              <th>No</th>
              <th>STONE ID</th>
              <th>SHAPE</th>          
              <th>COLOR</th>
              <th>CLARITY</th>
              <th>LAB</th>       
              <th>CERTI. NO</th>   
              <th>PCS</th>     
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
                    <td>`+ (obj.certificateNo ?? "") + `</td>
                    <td>1</td>
                    <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.weight ?? 0) ?? "") + `</td>
                    <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.perCarat ?? 0) ?? "") + `</td>
                    <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.netAmount ?? 0) ?? "") + `</td>
                    </tr>`
          }
        }
        for (let index = transaction.packingList.length; index <= 18; index++) {
          htmlString += `
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
                    </tr>`
        }
      }
      else {
        htmlString += `
                <table>
                <thead>
                  <th>No</th>         
                  <th colspan="6">DESCRIPTION</th>
                  <th>PCS</th>
                  <th>CARATS</th>
                  <th>RATE `+ transaction.transactionDetail.fromCurrency + ` PER CT</th>
                  <th>TOTAL AMOUNT `+ transaction.transactionDetail.fromCurrency + `</th>
                </thead>
                <tbody>
                        <tr>      
                        <td></td>          
                        <td colspan="6">CUT & POLISHED DIAMONDS</td>                
                        <td> `+ totalStone + `</td>
                        <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(totalWeight) + `</td>
                        <td>`+ totalPerCarat + `</td>
                        <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(totalAmount) + `</td>
                        </tr>`

        htmlString += `
                        <tr>         
                        <td></td>       
                        <td colspan="6">AS PER PACKING LIST</td>               
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        </tr>`
        for (let index = 3; index <= 20; index++) {
          htmlString += `
                        <tr>
                        <td>&nbsp</td>                
                        <td colspan="6"></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        </tr>`
        }
      }

      if (transaction.transactionDetail.shippingCharge > 0) {
        htmlString += `
                        <tr>
                        <td colspan="10" style="text-align:right" >Shipping Charge : </td>       
                        <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(transaction.transactionDetail.shippingCharge ?? 0) + `</td>
                        </tr>`
      }

      if (taxPerOne) {
        htmlString += `
                    <tr>
                    <td colspan="10" style="text-align:right; padding-right:10px;" >`+ taxNameOne + ` ( ` + taxPerOne + ` % ) </td>
                    <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit((taxPerOne * (totalAmount ?? 0)) / 100) + `</td>
                    </tr>`
      }
      if (taxPerTwo) {
        htmlString += `
                    <tr>
                    <td colspan="10" style="text-align:right; padding-right:10px;" >`+ taxNameTwo + ` ( ` + taxPerTwo + ` % ) </td>
                    <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit((taxPerTwo * (totalAmount ?? 0)) / 100) + `</td>
                    </tr>`
      }
      if (Number(transaction.transactionDetail.expense) > 0) {
        htmlString += `
            <tr>
            <td colspan="10" style="text-align:right; padding-right:10px;" >Other Charges</td>
            <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(Number(transaction.transactionDetail.expense) ?? 0) + `</td>
            </tr>`
      }
      htmlString += `                        
                    </tbody>
                    <tfoot>
                    <tr>
                      <td colspan="7">Grand Total</td>
                      <td>`+ totalStone + `</td>
                      <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(totalWeight) + `</td>
                      <td>`+ totalPerCarat + `</td>
                      <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(totalPayableAmount) + ` (` + transaction.transactionDetail.fromCurrency + `) ` + transaction.transactionDetail.exportType + `</td>
                    </tr>`
      if (transaction.transactionDetail.toCurrency) {
        htmlString += `
                                <tr>
                                <td colspan="9"></td>
                                <td>`+ transaction.transactionDetail.fromCurRate + ` (` + transaction.transactionDetail.fromCurrency + `) ` + `= ` + transaction.transactionDetail.toCurRate + ` (` + transaction.transactionDetail.toCurrency + `)` + `</td>
                                <td>`+ (totalPayableAmount * (transaction.transactionDetail.toCurRate ?? 0)).toFixed(2) + ` (` + transaction.transactionDetail.toCurrency + `)</td>
                              </tr>`
      }
      htmlString += `                
                    </tr>  
                    <tr>
                      <td colspan="11" style="text-align:right"><b>Amount in Words</b> : `+ this.utilityService.convertAmoutToWord(this.utilityService.ConvertToFloatWithDecimalTwoDigitRoundWithNum(totalPayableAmount), "USD") + `</td>                  
                    </tr>    
                    </tfoot>
                  </table>
                </div>
    
                <span class="c-st border-bottom-2 border-left-2 border-right-2">Terms of Service / Declaration</span>     
                <div class="body-f-footer">                       
                <ul style="margin: 0;">  
                <li>The diamonds herein invoiced have been purchased from legitimate sources not involved in funding conflict and in compliance with						
                United Nations Resolution. The Seller hereby guarantees that these diamonds are conflicts free, based on personal knowledge						
                and/or written guarantees provided by the supplier of these diamond.</li>
                <li>The goods described and valued as above are delivered to you for examination, inspection and showing to prospective buyers only and remain our property subject to our order and shall be returned to us on demand.</li>  
                <li>Until such goods are returned to us and actually received by us, they are at your risk from all hazards.</li>
                <li>No right or power is given to you to sell, pledge, hypothecate or otherwise dispose of the goods or anyone of them regardless of any prior course of transactions between us.</li>                
                <li>A sale of any of these goods can only be effected and title pass to you if, as and when we as owner shall agree to such sale and a bill of sale is rendered therefor.</li>          
                `
      if (transaction.transactionDetail.additionalDeclaration) {
        htmlString += `      
                                  <li>`+ (transaction.transactionDetail.additionalDeclaration ?? "") + `</li>
                                  `
      }
      htmlString += `            
                </div>
    
                <div class="body-fotter">  
                    <div class="body-top border-top-0 ps-1">
                    <div class="bo-left w-70">
                      <span class="c-st text-start">Bankers:</span>
                      <table>
                        <tbody>
                        <tr>
                        <td><b>BENEFICIARY BANK : </b></td>
                        <td>`+ (transaction.transactionDetail.bank.bankName ?? "") + `</td>
                      </tr>
                      <tr>
                        <td><b>BANK CODE : </b></td>
                        <td>`+ (transaction.transactionDetail.bank.ifsc ?? "") + `</td>
                      </tr>
                      <tr>
                        <td><b>ADDRESS :</b></td>
                        <td>`+ (transaction.transactionDetail.bank.address.line1 ? transaction.transactionDetail.bank.address.line1 + `,` : "") + (transaction.transactionDetail.bank.address.line2 ? transaction.transactionDetail.bank.address.line2 + `,` : "") + (transaction.transactionDetail.bank.address.city ? transaction.transactionDetail.bank.address.city + `,` : "")
        + (transaction.transactionDetail.bank.address.state ? transaction.transactionDetail.bank.address.state + `,` : "") + (transaction.transactionDetail.bank.address.country ? transaction.transactionDetail.bank.address.country + `,` : "") + (transaction.transactionDetail.bank.address.zipCode ?? "") + `</td>
                      </tr>
                      <tr>
                        <td><b>ACCOUNT NAME :</b></td>
                        <td>`+ (transaction.transactionDetail.bank.accountName ?? "") + `</td>
                      </tr>
                      <tr>
                        <td><b>A/C NO :</b></td>
                        <td>`+ (transaction.transactionDetail.bank.accountNo ?? "") + `</td>
                      </tr>
                      <tr>
                        <td><b>SWIFT CODE :</b></td>
                        <td>`+ (transaction.transactionDetail.bank.swift ?? "") + `</td>
                      </tr>
             
                        <tr>
                        <td><b>INTERMEDIATE BANK:</b></td>
                        <td>`+ (transaction.transactionDetail.bank.intermediaryBankName ?? "") + `</td>                        
                        </tr>         
                        <tr>
                        <td><b>INTERMEDIATE ADDRESS:</b></td>                       
                        <td>`+ (transaction.transactionDetail.bank.intermediaryBankAddress ?? "") + `</td>                        
                        </tr>  
                        <tr>
                        <td><b>INTERMEDIATE SWIFTCODE:</b></td>                      
                        <td>`+ (transaction.transactionDetail.bank.intermediaryBankswift ?? "") + `</td>
                        </tr>            
                      </tbody>
                    </table>
    
                    </div>
                    <div class="bo-right w-30 p-2">
                      <span class="c-st text-start">Signature & Date:</span>
                      <img src="assets/billimage/diamarthk4.png" alt="logo">
                    </div>
                  </div>
        
                  </div>
                </div>
              </div>
            </div>`

      if (transaction.packingList.length > 20) {
        htmlString += `
                <div class="body-middle">
    
                <table>
                <tr>
                <td>Organization :<b> ` + (transaction.transactionDetail.organization.name ?? "") + `</b></td>
                <td>OVERSEAS INVOICE No : <b>` + (transaction.refNumber ?? "") + `</b></td>
                <td>Date : <b>` + this.utilityService.getISOtoStringDate(transaction.transactionDate) + `</b></td>
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
                    <th>LAB</th>       
                    <th>CERTI. NO</th>
                    ` + (transaction.transactionDetail.isShowOrigin ? `<th>ORIGIN</th>` : ``) + `          
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
                           ` + (transaction.transactionDetail.isShowOrigin ? `<td>` + (obj.origin ?? "") + `</td>` : ``) + `
                          <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.perCarat ?? 0) ?? "") + `</td>
                          <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.netAmount ?? 0) ?? "") + `</td>
                          </tr>`
          }
        }

        htmlString += `
                          <tr>
                            <td colspan="3">Grand Total Amount</td>
                            <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(totalWeight) + `</td>
                            <td colspan="` + colspanValue + `">&nbsp;</td>
                            <td>`+ totalPerCarat + `</td>
                            <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(totalAmount) + `</td>
                          </tr>`
        if (transaction.transactionDetail.toCurrency) {
          htmlString += `     
                                      <tr>
                                        <td colspan="3">`+ transaction.transactionDetail.toCurrency + ` @ ` + this.utilityService.ConvertToFloatWithDecimalTwoDigit(transaction.transactionDetail.toCurRate ?? 0) + `</td>
                                        <td colspan="` + (colspanValue+2) + `"></td> 
                                        <td>`+ (totalAmount * (transaction.transactionDetail.toCurRate ?? 0)).toFixed(2) + `</td>             
                                      </tr>`
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
    const colspanValue = transaction.transactionDetail.isShowOrigin ? 5 : 4;

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

    if (invoiceType == "HKLOCAL") {
      htmlString += `  
      <body onload="window.print(); window.close();">       
        <div class="chal-wrap con-inv di-inv">
        <div class="chal-head">
        <div class="logo">
          <img src="assets/billimage/diamarthk1.png" alt="logo">
        </div>
        <div class="di-info">
        <span>` + (transaction.transactionDetail.organization.address?.line1 ? transaction.transactionDetail.organization.address?.line1 + `,` : "") + (transaction.transactionDetail.organization.address?.line2 ? transaction.transactionDetail.organization.address?.line2 + "," : "") + `</span>            
        <span>` + (transaction.transactionDetail.organization.address?.city ? transaction.transactionDetail.organization.address?.city + `,` : "") + (transaction.transactionDetail.organization.address?.state ? transaction.transactionDetail.organization.address?.state + `,` : "") + (transaction.transactionDetail.organization.address?.country ?? "") + `</span> 
        <span>Email: ` + (transaction.transactionDetail.organization.email ?? "") + `</span>    
        <span>Contact No: ` + (transaction.transactionDetail.organization.phoneNo ?? "") + `</span>   
        </div>        
      </div>
          <div class="chal-body">
            <span class="c-st border-left-2 border-right-2">`+ ((transaction.transactionType.toLowerCase() == "proforma") ? "Proforma INVOICE" : "INVOICE") + `</span>
            <div class="body-top ps-1 border-bottom-0">
              <div class="bo-left w-50">
                <span class="c-st text-start">To.: ` + (transaction.toLedger.name ?? "") + `</span>
                <span>` + (transaction.toLedger.address.line1 ? transaction.toLedger.address.line1 + `,` : "") + (transaction.toLedger.address.line2 ?? "") + `</span>            
                <span>` + (transaction.toLedger.address.city ? transaction.toLedger.address.city + `,` : "") + (transaction.toLedger.address.state ? transaction.toLedger.address.state + `,` : "") + (transaction.toLedger.address.country ?? "") + `</span>                                                   
                <span>TEL: ` + (transaction.toLedger.mobileNo ? transaction.toLedger.mobileNo + `,` : "") + (transaction.toLedger.phoneNo ? transaction.toLedger.phoneNo + `,` : "") + `FAX: ` + (transaction.toLedger.faxNo ?? "") + `</span>           
              </div>
              <div class="di-bor-0">
                <table>
                  <tbody>
                    <tr>
                      <td><b>INVOICE NO.</b></td>
                      <td>` + transaction.refNumber + `</td>
                    </tr>
                    <tr>
                      <td><b>DATE:</b></td>
                      <td>` + this.utilityService.getISOtoStringDate(transaction.transactionDate) + `</td>
                    </tr>
                    <tr>
                      <td><b>TERMS:</b></td>
                      <td>` + (transaction.transactionDetail.terms ?? "") + `</td>
                    </tr>
                    `
      if (transaction.transactionDetail.dueDate) {
        htmlString += `
                    <tr>
                      <td><b>Due Date:</b></td>
                      <td>` + this.utilityService.getISOtoStringDate(transaction.transactionDetail.dueDate) + `</td>
                    </tr>`
      }
      htmlString += `   
                  </tbody>
                </table>
              </div>
            </div>
            <div class="body-middle">
              <table>
                <thead>
                  <th>No</th>                       
                  <th>DESCRIPTION</th>
                  <th>PCS</th>
                  <th>CARATS</th>
                  <th>RATE `+ transaction.transactionDetail.fromCurrency + ` PER CT</th>
                  <th>TOTAL AMOUNT `+ transaction.transactionDetail.fromCurrency + `</th>
                </thead>
                <tbody>`

      htmlString += `
                    <tr>
                    <td>1</td>
                    <td>0.50 CT ABOVE SIZE</td>                
                    <td>`+ aboveFiveCentTotalStone + `</td>
                    <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(aboveFiveCentTotalWeight) + `</td>
                    <td>`+ aboveTotalPerCarat + `</td>
                    <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(aboveFiveCentAmont) + `</td>
                    </tr>`

      htmlString += `
                    <tr>
                    <td></td>
                    <td>CUT & POLISHED DIAMONDS</td>                
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    </tr>`

      htmlString += `
                    <tr>
                    <td></td>
                    <td>AS PER PACKING LIST 1</td>                
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    </tr>`

      htmlString += `
                    <tr>
                    <td>&nbsp</td>
                    <td></td>                
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    </tr>`

      htmlString += `
                    <tr>
                    <td>2</td>
                    <td>0.50 CT BELOW SIZE</td>                
                    <td>`+ belowFiveCentTotalStone+ `</td>
                    <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(belowFiveCentTotalWeight) + `</td>
                    <td>`+ belowTotalPerCarat + `</td>
                    <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(belowFiveCentTotalAmount) + `</td>
                    </tr>`

      htmlString += `
                    <tr>
                    <td></td>
                    <td>CUT & POLISHED DIAMONDS</td>                
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    </tr>`

      htmlString += `
                    <tr>
                    <td></td>
                    <td>AS PER PACKING LIST 2</td>                
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    </tr>`

      for (let index = 2; index <= blankHKLocal - 3; index++) {
        htmlString += `
                    <tr>
                    <td>&nbsp</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    </tr>`
      }

      if (transaction.transactionDetail.shippingCharge > 0) {
        htmlString += `
                    <tr>
                    <td colspan="5" style="text-align:right" >Shipping Charges </td>       
                    <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(transaction.transactionDetail.shippingCharge ?? 0) + `</td>
                    </tr>`
      }

      if (taxPerOne) {
        htmlString += `
                <tr>
                <td colspan="5" style="text-align:right; padding-right:10px;" >`+ taxNameOne + ` ( ` + taxPerOne + ` % ) </td>
                <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit((taxPerOne * (totalAmount ?? 0)) / 100) + `</td>
                </tr>`
      }
      if (taxPerTwo) {
        htmlString += `
                <tr>
                <td colspan="5" style="text-align:right; padding-right:10px;" >`+ taxNameTwo + ` ( ` + taxPerTwo + ` % ) </td>
                <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit((taxPerTwo * (totalAmount ?? 0)) / 100) + `</td>
                </tr>`
      }
      if (Number(transaction.transactionDetail.expense) > 0) {
        htmlString += `
                    <tr>
                    <td colspan="5" style="text-align:right" >Other Charges </td>       
                    <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(Number(transaction.transactionDetail.expense) ?? 0) + `</td>
                    </tr>`
      }

      htmlString += `                        
                </tbody>
                <tfoot>
                <tr>
                  <td colspan="2" style="text-align:right"><b>Grand Total</b>  </td>
                  <td>`+ totalStone + `</td>
                  <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(totalWeight) + `</td>
                  <td>`+ totalPerCarat + `</td>
                  <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(totalPayableAmount) + ` (` + transaction.transactionDetail.fromCurrency + `)</td>
                </tr>`
      if (transaction.transactionDetail.toCurrency) {
        htmlString += `
                  <tr>
                  <td colspan="4"></td>
                  <td>`+ transaction.transactionDetail.fromCurRate + ` (` + transaction.transactionDetail.fromCurrency + `) ` + `= ` + transaction.transactionDetail.toCurRate + ` (` + transaction.transactionDetail.toCurrency + `)` + `</td>
                  <td>`+ (totalPayableAmount * (transaction.transactionDetail.toCurRate ?? 0)).toFixed(2) + ` (` + transaction.transactionDetail.toCurrency + `)</td>
                </tr>`
      }
      htmlString += `

                <tr>
                <td colspan="6" style="text-align:right"><b>Amount in Words : </b>`+ this.utilityService.convertAmoutToWord(this.utilityService.ConvertToFloatWithDecimalTwoDigitRoundWithNum(totalPayableAmount), "USD") + `</td>                
                </tr>  
    
                </tfoot>
              </table>
            </div>
            <div class="body-fotter">
              <div class="body-top border-top-0 border-bottom-2 ps-1">
                <div class="bo-left w-50 border-right-2">             
                  <span class="c-st text-start">Our Bank Details</span>
                  <table>
                    <tbody>
                      <tr>
                        <td><b>BENEFICIARY BANK : </b></td>
                        <td>`+ (transaction.transactionDetail.bank.bankName ?? "") + `</td>
                      </tr>
                      <tr>
                        <td><b>BANK CODE : </b></td>
                        <td>`+ (transaction.transactionDetail.bank.ifsc ?? "") + `</td>
                      </tr>
                      <tr>
                        <td><b>ADDRESS :</b></td>
                        <td>`+ (transaction.transactionDetail.bank.address.line1 ? transaction.transactionDetail.bank.address.line1 + `,` : "") + (transaction.transactionDetail.bank.address.line2 ? transaction.transactionDetail.bank.address.line2 + `,` : "") + (transaction.transactionDetail.bank.address.city ? transaction.transactionDetail.bank.address.city + `,` : "")
        + (transaction.transactionDetail.bank.address.state ? transaction.transactionDetail.bank.address.state + `,` : "") + (transaction.transactionDetail.bank.address.country ? transaction.transactionDetail.bank.address.country + `,` : "") + (transaction.transactionDetail.bank.address.zipCode ?? "") + `</td>
                      </tr>
                      <tr>
                        <td><b>ACCOUNT NAME :</b></td>
                        <td>`+ (transaction.transactionDetail.bank.accountName ?? "") + `</td>
                      </tr>
                      <tr>
                        <td><b>A/C NO :</b></td>
                        <td>`+ (transaction.transactionDetail.bank.accountNo ?? "") + `</td>
                      </tr>
                      <tr>
                        <td><b>SWIFT CODE :</b></td>
                        <td>`+ (transaction.transactionDetail.bank.swift ?? "") + `</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div class="bo-left w-50" style="display: grid;">
                <div class="border-bottom-2">&nbsp</div>
                <div class="border-bottom-2">&nbsp</div>
                <div>&nbsp</div>
                </div>
                
              </div>
    
              <div class="body-f-mid">
                <div class="body-f-left">
                  <span class="c-st di">FOR ,`+ (transaction.transactionDetail.organization.name ?? "") + `</span>
                  <div class="ch-sig">  
                  <span>&nbsp</span>
                  <span>&nbsp</span>
                  <span>&nbsp</span>                             
                  <span>Authorized Signature(S)</span>
                  </div>
                </div>
                <div class="body-f-right">
                  <span class="c-st di">Purchaser For and on behalf of</span>
                  <div class="ch-sig">
                  <span>&nbsp</span>
                  <span>&nbsp</span>
                  <span>&nbsp</span>   
                  <span>Chop & Signature</span>
                  </div>
                </div>
              </div>
    
              <div class="body-f-footer">
              <span class="c-st border-bottom-2">Terms of Service / Declaration</span>          
              <ul>  
              <li><b> Goods once sold are not ruturnable.</b></li>
              <li><b> All goods are sold & Delivered in HONG KONG </b></li>
              <li><b> This contract is governed by the laws of HKSAR.</b></li>
              <li> The diamonds herein invoiced have been purchased from legitimate sources not invoived in funding conflict and in compliance with united nations resolution.</li> 
              <li> The seller hereby Guarantees that these diamonds are conflict free base on personal knowledge and/or written guarantees provided by the supplier of these diamonds.</li>            
              <li> The ownership of the goods set out in this invoice will not pass until payment in full of the purchase price.Before then, the purchaser holds the goods as a bailee and must return the goods immediately to the seller upon demand and shall store them separately and in a manner to enable them to be identified.</li> 
              <li> Until such goods are returned to us and actually received by us, they are at your risk from all hazards.</li> 
              <li> Until such time as title in the goods has passed to the purchaser, the seller shall be entitled to seek a court order against the purchaser for delivery up of the goods and/or an injunction to prevent the purchaser from dealing or otherwise disposing of the goods.</li>             
              </ul>   
              </div>
            </div>
          </div>
        </div>`

      if (transaction.packingList.length > 0) {
        //Above 1 Carat Packing List
        htmlString += `
          <div class="body-middle">

          <table>
          <tr>
          <td>Organization :<b> ` + (transaction.transactionDetail.organization.name ?? "") + `</b></td>
          <td>INVOICE No : <b>` + (transaction.refNumber ?? "") + `</b></td>
          <td>Date : <b>` + this.utilityService.getISOtoStringDate(transaction.transactionDate) + `</b></td>
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
              ` + (transaction.transactionDetail.isShowOrigin ? `<th>ORIGIN</th>` : ``) + `          
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
                     ` + (transaction.transactionDetail.isShowOrigin ? `<td>` + (obj.origin ?? "") + `</td>` : ``) + `
                    <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.perCarat ?? 0) ?? "") + `</td>
                    <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.netAmount ?? 0) ?? "") + `</td>
                    </tr>`
          }
        }

        htmlString += `
              <tr>
                <td colspan="3">Grand Total</td>
                <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(aboveFiveCentTotalWeight) + `</td>
                <td colspan="` + colspanValue + `">&nbsp;</td>
                <td>`+ aboveTotalPerCarat + `</td>
                <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(aboveFiveCentAmont) + `</td>
              </tr>`
        if (transaction.transactionDetail.toCurrency) {
          htmlString += `     
              <tr>
                <td colspan="3">`+ transaction.transactionDetail.toCurrency + ` @ ` + transaction.transactionDetail.toCurRate + `</td>
                <td colspan="` + (colspanValue+2) + `"></td> 
                <td>`+ (aboveFiveCentAmont * (transaction.transactionDetail.toCurRate ?? 0)).toFixed(2) + `</td>             
              </tr>`
        }
        htmlString += `</tbody>
            </table>
            </div>`

        //Below 1 Carat Packing List    
        htmlString += `
          <div class="body-middle" style="page-break-before: always;">

          <table>
          <tr>
          <td>Organization :<b> ` + (transaction.transactionDetail.organization.name ?? "") + `</b></td>
          <td>INVOICE No : <b>` + (transaction.refNumber ?? "") + `</b></td>
          <td>Date : <b>` + this.utilityService.getISOtoStringDate(transaction.transactionDate) + `</b></td>
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
              ` + (transaction.transactionDetail.isShowOrigin ? `<th>ORIGIN</th>` : ``) + `         
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
                     ` + (transaction.transactionDetail.isShowOrigin ? `<td>` + (obj.origin ?? "") + `</td>` : ``) + `
                    <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.perCarat ?? 0) ?? "") + `</td>
                    <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.netAmount ?? 0) ?? "") + `</td>
                    </tr>`
          }
        }

        htmlString += `
              <tr>
                <td colspan="3">Grand Total</td>
                <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(belowFiveCentTotalWeight) + `</td>
                <td colspan="` + colspanValue + `">&nbsp;</td>
                <td>`+ belowTotalPerCarat + `</td>
                <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(belowFiveCentTotalAmount) + `</td>
              </tr>`
        if (transaction.transactionDetail.toCurrency) {
          htmlString += `     
              <tr>
                <td colspan="3">`+ transaction.transactionDetail.toCurrency + ` @ ` + transaction.transactionDetail.toCurRate + `</td>
                <td colspan="` + (colspanValue+2) + `"></td> 
                <td>`+ (belowFiveCentTotalAmount * (transaction.transactionDetail.toCurRate ?? 0)).toFixed(2) + `</td>             
              </tr>`
        }
        htmlString += `</tbody>
            </table>
            </div>`
      }

      htmlString += `
        </body>
        </html>
        `;
    }
    else if (invoiceType == "HKOVERSEAS") {
      htmlString += `
      <body onload="window.print(); window.close();">       
        <div class="chal-wrap con-inv di-inv">
          <div class="chal-head">
            <div class="logo">
              <img src="assets/billimage/diamarthk1.png" alt="logo">
            </div>
            <div class="di-info">
            <span>` + (transaction.transactionDetail.organization.address?.line1 ?? "") + `,` + (transaction.transactionDetail.organization.address?.line2 ?? "") + `</span>            
            <span>` + (transaction.transactionDetail.organization.address?.city ?? "") + `,` + (transaction.transactionDetail.organization.address?.state ?? "") + `,` + (transaction.transactionDetail.organization.address?.country ?? "") + `</span> 
            <span>Email: ` + (transaction.transactionDetail.organization.email ?? "") + `</span>  
            <span>Contact No: ` + (transaction.transactionDetail.organization.phoneNo ?? "") + `</span>               
            </div>        
          </div>
          <div class="chal-body">
      <span class="c-st border-left-2 border-right-2 border-bottom-2">`+ ((transaction.transactionType.toLowerCase() == "proforma") ? "Proforma INVOICE" : "INVOICE") + `</span>
      <div class="body-top ps-1 border-bottom-0">

        <div class="bo-left border-right-2" style="flex-basis: 70%;">

          <div class="di-bor-0 border-bottom-2">
                <span class="c-st text-start">Buyer (If other than consignee):</span>
                <span>` + (transaction.toLedger.name ?? "") + `</span>
                <span>` + (transaction.toLedger.address.line1 ?? "") + `&nbsp` + (transaction.toLedger.address.line2 ?? "") + (transaction.toLedger.address.city ?? "") + `,&nbsp` + (transaction.toLedger.address.state ?? "") + `,&nbsp` + (transaction.toLedger.address.country ?? "") + `</span>            
                <span>ZipCode : ` + (transaction.toLedger.address.zipCode ?? "") + `, &nbsp TEL: ` + (transaction.toLedger.mobileNo ?? "") + `, &nbsp Tax No: ` + (transaction.toLedger.taxNo ?? "") + ` ` + (transaction.toLedger.incomeTaxNo ?? "") + `</span>                
                </div>
                `

      if (transaction.transactionDetail.consignee.name || transaction.transactionDetail.consigneeName) {
        htmlString += `
                          <span class="c-st text-start">Ship To:</span>
                          <span>` + (transaction.transactionDetail.consignee.name ? transaction.transactionDetail.consignee.name ?? "" : transaction.transactionDetail.consigneeName ?? "") + `</span>
                          <span>` + (transaction.transactionDetail.consignee.address.line1 ? transaction.transactionDetail.consignee.address.line1 ?? "" : transaction.transactionDetail.consigneeAddress ?? "") + `&nbsp` + (transaction.transactionDetail.consignee.address.line2 ?? "") + (transaction.transactionDetail.consignee.address.city ?? "") + `,&nbsp` + (transaction.transactionDetail.consignee.address.state ?? "") + `,&nbsp` + (transaction.transactionDetail.consignee.address.country ?? "") + `</span>            
                          <span>ZipCode : ` + (transaction.transactionDetail.consignee.address.zipCode ?? "") + `,&nbsp TEL: ` + (transaction.transactionDetail.consignee.mobileNo ?? "") + `,&nbsp Tax No: ` + (transaction.transactionDetail.consignee.taxNo ?? "") + ` ` + (transaction.transactionDetail.consignee.incomeTaxNo ?? "") + `</span>                
                          `
      }
      else {
        htmlString += `
                          <span class="c-st text-start"></span>
                          <span> &nbsp </span>
                          <span> &nbsp </span>
                          `
      }

      htmlString += `
            </div>
            <div class="di-bor-0 p-1">
                <table>
                  <tbody>
                    <tr>
                      <td><b>Invoice NO.</b></td>
                      <td>` + transaction.refNumber + `</td>
                    </tr>
                    <tr>
                      <td><b>Date:</b></td>
                      <td>` + this.utilityService.getISOtoStringDate(transaction.transactionDate) + `</td>
                    </tr>                    
                    <tr>
                      <td><b>Terms:</b></td>
                      <td>` + (transaction.transactionDetail.terms ?? "") + `</td>
                    </tr>                    
                    <tr>
                    <td><b>ORIGIN:</b></td>
                      <td>INDIA</td>                    
                    </tr>  
                    `
      if (transaction.transactionDetail.cifCityName) {
        htmlString += `
                                    <tr>
                                    <td><b>CIF:</b></td>     
                                    <td>`+ transaction.transactionDetail.cifCityName + `</td>
                                    </tr>`
      } `              
                    `
      if (contain49Down)
        htmlString += `<tr><td><b>HSN CODE:</b></td>
                       <td>71023910</td></tr>`

      if (contain49Up)
        htmlString += `<tr><td><b>HSN CODE:</b></td>
                       <td>71023920</td></tr>`

      htmlString += `      
                  </tbody>
                </table>
              </div>
            </div> 
            

            <div class="body-middle">
              `
      if (transaction.packingList.length < 21) {
        htmlString += `
        <table><tr><td><b>DESCRIPTION : CUT & POLISHED DIAMONDS</b></td></tr></table>
          <table>        
          <thead>
          <th>No</th>
          <th>STONE ID</th>
          <th>SHAPE</th>          
          <th>COLOR</th>
          <th>CLARITY</th>
          <th>LAB</th>       
          <th>CERTI. NO</th>   
          <th>PCS</th>     
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
                <td>`+ (obj.certificateNo ?? "") + `</td>
                <td>1</td>
                <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.weight ?? 0) ?? "") + `</td>
                <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.perCarat ?? 0) ?? "") + `</td>
                <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.netAmount ?? 0) ?? "") + `</td>
                </tr>`
          }
        }
        for (let index = transaction.packingList.length; index <= 18; index++) {
          htmlString += `
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
                </tr>`
        }
      }
      else {
        htmlString += `
            <table>
            <thead>
              <th>No</th>         
              <th colspan="6">DESCRIPTION</th>
              <th>PCS</th>
              <th>CARATS</th>
              <th>RATE `+ transaction.transactionDetail.fromCurrency + ` PER CT</th>
              <th>TOTAL AMOUNT `+ transaction.transactionDetail.fromCurrency + `</th>
            </thead>
            <tbody>
                    <tr>      
                    <td>1</td>          
                    <td colspan="6">0.50 CT ABOVE SIZE</td>                
                    <td> `+ aboveFiveCentTotalStone + `</td>
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
                    <td> `+ belowFiveCentTotalStone+ `</td>
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

        for (let index = 3; index <= 17; index++) {
          htmlString += `
                    <tr>
                    <td>&nbsp</td>                
                    <td colspan="6"></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    </tr>`
        }
      }

      if (transaction.transactionDetail.shippingCharge > 0) {
        htmlString += `
                    <tr>
                    <td colspan="10" style="text-align:right" >Shipping Charge : </td>       
                    <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(transaction.transactionDetail.shippingCharge ?? 0) + `</td>
                    </tr>`
      }

      if (taxPerOne) {
        htmlString += `
                <tr>
                <td colspan="10" style="text-align:right; padding-right:10px;" >`+ taxNameOne + ` ( ` + taxPerOne + ` % ) </td>
                <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit((taxPerOne * (totalAmount ?? 0)) / 100) + `</td>
                </tr>`
      }
      if (taxPerTwo) {
        htmlString += `
                <tr>
                <td colspan="10" style="text-align:right; padding-right:10px;" >`+ taxNameTwo + ` ( ` + taxPerTwo + ` % ) </td>
                <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit((taxPerTwo * (totalAmount ?? 0)) / 100) + `</td>
                </tr>`
      }
      if (Number(transaction.transactionDetail.expense) > 0) {
        htmlString += `
        <tr>
        <td colspan="10" style="text-align:right; padding-right:10px;" >Other Charges</td>
        <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(Number(transaction.transactionDetail.expense) ?? 0) + `</td>
        </tr>`
      }
      htmlString += `                        
                </tbody>
                <tfoot>
                <tr>
                  <td colspan="7">Grand Total</td>
                  <td>`+ totalStone + `</td>
                  <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(totalWeight) + `</td>
                  <td>`+ totalPerCarat + `</td>
                  <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(totalPayableAmount) + ` (` + transaction.transactionDetail.fromCurrency + `) ` + transaction.transactionDetail.exportType + `</td>
                </tr>`
      if (transaction.transactionDetail.toCurrency) {
        htmlString += `
                            <tr>
                            <td colspan="9"></td>
                            <td>`+ transaction.transactionDetail.fromCurRate + ` (` + transaction.transactionDetail.fromCurrency + `) ` + `= ` + transaction.transactionDetail.toCurRate + ` (` + transaction.transactionDetail.toCurrency + `)` + `</td>
                            <td>`+ (totalPayableAmount * (transaction.transactionDetail.toCurRate ?? 0)).toFixed(2) + ` (` + transaction.transactionDetail.toCurrency + `)</td>
                          </tr>`
      }
      htmlString += `                
                </tr>  
                <tr>
                  <td colspan="11" style="text-align:right"><b>Amount in Words</b> : `+ this.utilityService.convertAmoutToWord(this.utilityService.ConvertToFloatWithDecimalTwoDigitRoundWithNum(totalPayableAmount), "USD") + `</td>                  
                </tr>    
                </tfoot>
              </table>
            </div>

            <span class="c-st border-bottom-2 border-left-2 border-right-2">Terms of Service / Declaration</span>     
            <div class="body-f-footer">                       
            <ul style="margin: 0;">  
            <li>The diamonds herein invoiced have been purchased from legitimate sources not involved in funding conflict and in compliance with						
            United Nations Resolution. The Seller hereby guarantees that these diamonds are conflicts free, based on personal knowledge						
            and/or written guarantees provided by the supplier of these diamond.</li>
            <li>The goods described and valued as above are delivered to you for examination, inspection and showing to prospective buyers only and remain our property subject to our order and shall be returned to us on demand.</li>  
            <li>Until such goods are returned to us and actually received by us, they are at your risk from all hazards.</li>
            <li>No right or power is given to you to sell, pledge, hypothecate or otherwise dispose of the goods or anyone of them regardless of any prior course of transactions between us.</li>                
            <li>A sale of any of these goods can only be effected and title pass to you if, as and when we as owner shall agree to such sale and a bill of sale is rendered therefor.</li>          
            `
      if (transaction.transactionDetail.additionalDeclaration) {
        htmlString += `      
                              <li>`+ (transaction.transactionDetail.additionalDeclaration ?? "") + `</li>
                              `
      }
      htmlString += `            
            </div>

            <div class="body-fotter">  
                <div class="body-top border-top-0 ps-1">
                <div class="bo-left w-70">
                  <span class="c-st text-start">Bankers:</span>
                  <table>
                    <tbody>
                    <tr>
                    <td><b>BENEFICIARY BANK : </b></td>
                    <td>`+ (transaction.transactionDetail.bank.bankName ?? "") + `</td>
                  </tr>
                  <tr>
                    <td><b>BANK CODE : </b></td>
                    <td>`+ (transaction.transactionDetail.bank.ifsc ?? "") + `</td>
                  </tr>
                  <tr>
                    <td><b>ADDRESS :</b></td>
                    <td>`+ (transaction.transactionDetail.bank.address.line1 ? transaction.transactionDetail.bank.address.line1 + `,` : "") + (transaction.transactionDetail.bank.address.line2 ? transaction.transactionDetail.bank.address.line2 + `,` : "") + (transaction.transactionDetail.bank.address.city ? transaction.transactionDetail.bank.address.city + `,` : "")
        + (transaction.transactionDetail.bank.address.state ? transaction.transactionDetail.bank.address.state + `,` : "") + (transaction.transactionDetail.bank.address.country ? transaction.transactionDetail.bank.address.country + `,` : "") + (transaction.transactionDetail.bank.address.zipCode ?? "") + `</td>
                  </tr>
                  <tr>
                    <td><b>ACCOUNT NAME :</b></td>
                    <td>`+ (transaction.transactionDetail.bank.accountName ?? "") + `</td>
                  </tr>
                  <tr>
                    <td><b>A/C NO :</b></td>
                    <td>`+ (transaction.transactionDetail.bank.accountNo ?? "") + `</td>
                  </tr>
                  <tr>
                    <td><b>SWIFT CODE :</b></td>
                    <td>`+ (transaction.transactionDetail.bank.swift ?? "") + `</td>
                  </tr>
         
                    <tr>
                    <td><b>INTERMEDIATE BANK:</b></td>
                    <td>`+ (transaction.transactionDetail.bank.intermediaryBankName ?? "") + `</td>                        
                    </tr>         
                    <tr>
                    <td><b>INTERMEDIATE ADDRESS:</b></td>                       
                    <td>`+ (transaction.transactionDetail.bank.intermediaryBankAddress ?? "") + `</td>                        
                    </tr>  
                    <tr>
                    <td><b>INTERMEDIATE SWIFTCODE:</b></td>                      
                    <td>`+ (transaction.transactionDetail.bank.intermediaryBankswift ?? "") + `</td>
                    </tr>            
                  </tbody>
                </table>

                </div>
                <div class="bo-right w-30 p-2">
                  <span class="c-st text-start">Signature & Date:</span>
                  <img src="assets/billimage/diamarthk4.png" alt="logo">
                </div>
              </div>
    
              </div>
            </div>
          </div>
        </div>`

      if (transaction.packingList.length > 20) {
        //Above 1 Carat Packing List
        htmlString += `
            <div class="body-middle">

            <table>
            <tr>
            <td>Organization :<b> ` + (transaction.transactionDetail.organization.name ?? "") + `</b></td>
            <td>OVERSEAS INVOICE No : <b>` + (transaction.refNumber ?? "") + `</b></td>
            <td>Date : <b>` + this.utilityService.getISOtoStringDate(transaction.transactionDate) + `</b></td>
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
                ` + (transaction.transactionDetail.isShowOrigin ? `<th>ORIGIN</th>` : ``) + `           
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
                       ` + (transaction.transactionDetail.isShowOrigin ? `<td>` + (obj.origin ?? "") + `</td>` : ``) + `
                      <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.perCarat ?? 0) ?? "") + `</td>
                      <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.netAmount ?? 0) ?? "") + `</td>
                      </tr>`
          }
        }

        htmlString += `
              <tr>
                <td colspan="3">Grand Total Amount</td>
                <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(aboveFiveCentTotalWeight) + `</td>
                        <td colspan="` + colspanValue + `">&nbsp;</td>
                <td>`+ aboveTotalPerCarat + `</td>
                <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(aboveFiveCentAmont) + `</td>
              </tr>`
        if (transaction.transactionDetail.toCurrency) {
          htmlString += `     
              <tr>
                <td colspan="3">`+ transaction.transactionDetail.toCurrency + ` @ ` + this.utilityService.ConvertToFloatWithDecimalTwoDigit(transaction.transactionDetail.toCurRate ?? 0) + `</td>
               <td colspan="` + (colspanValue+2) + `"></td> 
                <td>`+ (aboveFiveCentAmont * (transaction.transactionDetail.toCurRate ?? 0)).toFixed(2) + `</td>             
              </tr>`
        }
        htmlString += `</tbody>
              </table>
              </div>`

        //Below 1 Carat Packing List      
        htmlString += `
            <div class="body-middle" style="page-break-before: always;">

            <table>
            <tr>
            <td>Organization :<b> ` + (transaction.transactionDetail.organization.name ?? "") + `</b></td>
            <td>OVERSEAS INVOICE No : <b>` + (transaction.refNumber ?? "") + `</b></td>
            <td>Date : <b>` + this.utilityService.getISOtoStringDate(transaction.transactionDate) + `</b></td>
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
                ` + (transaction.transactionDetail.isShowOrigin ? `<th>ORIGIN</th>` : ``) + `
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
                       ` + (transaction.transactionDetail.isShowOrigin ? `<td>` + (obj.origin ?? "") + `</td>` : ``) + `
                      <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.perCarat ?? 0) ?? "") + `</td>
                      <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.netAmount ?? 0) ?? "") + `</td>
                      </tr>`
          }
        }

        htmlString += `
              <tr>
                <td colspan="3">Grand Total Amount</td>
                <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(belowFiveCentTotalWeight) + `</td>
                <td colspan="` + colspanValue + `">&nbsp;</td>
                <td>`+ belowTotalPerCarat + `</td>
                <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(belowFiveCentTotalAmount) + `</td>
              </tr>`
        if (transaction.transactionDetail.toCurrency) {
          htmlString += `     
              <tr>
                <td colspan="3">`+ transaction.transactionDetail.toCurrency + ` @ ` + this.utilityService.ConvertToFloatWithDecimalTwoDigit(transaction.transactionDetail.toCurRate ?? 0) + `</td>
                <td colspan="` + (colspanValue+2) + `"></td> 
                <td>`+ (belowFiveCentTotalAmount * (transaction.transactionDetail.toCurRate ?? 0)).toFixed(2) + `</td>             
              </tr>`
        }
        htmlString += `</tbody>
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
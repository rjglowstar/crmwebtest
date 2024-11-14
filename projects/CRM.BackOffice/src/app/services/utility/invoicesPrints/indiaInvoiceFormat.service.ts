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
export class IndiaInvoiceFormatService {
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

    if (invoiceType == "INDIALOCAL") {
      let SumTotalAmtConverted = (totalAmount ?? 0) * (transaction.transactionDetail.toCurRate ?? 1);
      let SumTotalAmtConvertedWithTax = 0;
      let tax1 = 0;
      let tax2 = 0;

      if (taxPerOne > 0)
        tax1 = Number(parseFloat(parseFloat(this.utilityService.ConvertToFloatWithDecimal((taxPerOne * (SumTotalAmtConverted ?? 0)) / 100).toString()).toFixed(0)));

      if (taxPerTwo > 0)
        tax2 = Number(parseFloat(parseFloat(this.utilityService.ConvertToFloatWithDecimal((taxPerTwo * (SumTotalAmtConverted ?? 0)) / 100).toString()).toFixed(0)));

      SumTotalAmtConvertedWithTax = this.utilityService.ConvertToFloatWithDecimal(SumTotalAmtConverted + tax1 + tax2, 0);

      htmlString += `  
            <body onload="window.print(); window.close();">        
                <div style="height: 210px;"></div>
                <div class="chal-body">
      
                  <span class="c-st border-top-2 border-left-2 border-right-2">TAX INVOICE</span>            
                  <div class="body-top ps-1 border-bottom-0">
                    <div class="bo-left w-50">
                      <span class="c-st text-start">To.: ` + (transaction.toLedger.name ?? "") + `</span>
                      <span>` + (transaction.toLedger.address.line1 ? transaction.toLedger.address.line1 + `,` : "") + (transaction.toLedger.address.line2 ?? "") + `</span>            
                      <span>` + (transaction.toLedger.address.city ? transaction.toLedger.address.city + `,` : "") + (transaction.toLedger.address.state ? transaction.toLedger.address.state + `,` : "") + (transaction.toLedger.address.country ?? "") + `</span>            
                      <span>ZipCode : ` + (transaction.toLedger.address.zipCode ?? "") + `</span>
                      <span>PAN Number : ` + (transaction.toLedger.incomeTaxNo ?? "") + `</span>
                      <span>GST Number : ` + (transaction.toLedger.taxNo ?? "") + `</span> 
                      <span>PLACE OF SUPPLY : ` + (transaction.toLedger.address.state ?? "") + `</span> 
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
                            <td>` + this.utilityService.getISOtoStringDate(transaction.createdDate) + `</td>
                          </tr>
                          <tr>
                            <td><b>DISTRICT OF ORIGIN:</b></td>
                            <td>483</td>
                          </tr>
                          <tr>
                            <td><b>OUR STATE:</b></td>
                            <td>` + (transaction.transactionDetail.organization.address.state ?? "") + `</td>
                            <td><b>CODE:</b></td>
                            <td>` + (transaction.transactionDetail.organization.address.stateCode ?? "") + `</td>
                          </tr>
                          <tr>
                            <td><b>OUR GST NO:</b></td>
                            <td>` + transaction.transactionDetail.organization.gstNo + `</td>                      
                          </tr>
                          <tr>
                            <td><b>OUR PAN NO:</b></td>
                            <td>` + transaction.transactionDetail.organization.incomeTaxNo + `</td>                      
                          </tr>
                          <tr>
                           <td><b>HSN CODE:</b></td>
                           <td>71023910</td>                      
                          </tr>
                          <tr>
                           <td><b>TERMS:</b></td>
                           <td><b>` + (transaction.transactionDetail.terms ?? "") + `</b></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <span class="c-st border-top-2 border-left-2 border-right-2">IRN No: ` + (transaction.transactionDetail.irnNo ?? "") + `</span>
                  <div class="body-middle">
                    <table>
                      <thead>
                        <th>Sr.No.</th> 
                        <th>Ref.No.</th>                                 
                        <th>DESCRIPTION</th>
                        <th>Avg.Pcs/Carats</th>
                        <th>Wgt.in Carats</th>
                        <th>Rate /Carat</th>
                        <th>Sales Value in (`+ transaction.transactionDetail.toCurrency + `)</th>
                      </thead>
                      <tbody>`

      if (transaction.packingList.length < 11) {
        if (transaction.transactionDetail.isPackingList) {
          htmlString += `
                          <tr>
                          <td>1</td> 
                          <td></td>
                          <td>CUT & POLISHED DIAMOND</td>  
                          `
          htmlString += `           
                          <td></td>
                          <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(totalWeight) ?? "") + `</td>
                          <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit((totalPerCarat ?? 0) * (transaction.transactionDetail.toCurRate ?? 1)) + `</td>
                          <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigitRound((totalAmount ?? 0) * (transaction.transactionDetail.toCurRate ?? 1)) + `</td>
                          </tr>`
          htmlString += `
                          <tr>
                          <td></td>
                          <td></td>
                          <td>AS PER PACKING LIST</td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          </tr>`

          for (let index = 1; index < 9; index++) {
            htmlString += `
                          <tr>
                          <td>&nbsp</td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          </tr>`
          }
          htmlString += `
              <tr>
              <td colspan="3" style="text-align:right;">Total Taxable (`+ transaction.transactionDetail.toCurrency + `)</td>
              <td></td>
              <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(totalWeight) + `</td>
              <td></td>
              <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigitRound(SumTotalAmtConverted) + `</td>
            </tr>`
        } else {
          for (let indexS = 0; indexS < transaction.packingList.length; indexS++) {
            let obj = transaction.packingList[indexS];
            htmlString += `
                          <tr>
                          <td>`+ (indexS + 1) + `</td> 
                          <td></td>
                          `
            if (transaction.transactionDetail.isWithCertiNo) {
              htmlString += `
                          <td>CUT & POLISHED DIAMOND (`+ (obj.certificateNo ?? "") + `)</td>     
                          `
            }
            else {
              htmlString += `
                  <td>CUT & POLISHED DIAMOND</td>     
                  `
            }
            htmlString += `           
                          <td></td>
                          <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.weight) ?? "") + `</td>
                          <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit((obj.price.perCarat ?? 0) * (transaction.transactionDetail.toCurRate ?? 1)) + `</td>
                          <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigitRound((obj.price.netAmount ?? 0) * (transaction.transactionDetail.toCurRate ?? 1)) + `</td>
                          </tr>`
          }

          for (let index = transaction.packingList.length; index < 10; index++) {
            htmlString += `
                          <tr>
                          <td>&nbsp</td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          </tr>`
          }
          htmlString += `
              <tr>
              <td colspan="3" style="text-align:right;">Total Taxable (`+ transaction.transactionDetail.toCurrency + `)</td>
              <td></td>
              <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(totalWeight) + `</td>
              <td></td>
              <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigitRound(SumTotalAmtConverted) + `</td>
            </tr>`
        }
      }
      else {
        htmlString += `
              <tr>
              <td>1</td>
              <td></td>
              <td>CUT & POLISHED DIAMONDS</td>                
              <td></td>
              <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(totalWeight) ?? "") + `</td>
              <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(((totalAmount * (transaction.transactionDetail.toCurRate ?? 0)) / totalWeight ?? 0)) + `</td>
              <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigitRound(SumTotalAmtConverted) + `</td>
              </tr>  
              `

        htmlString += `
              <tr>         
              <td></td>     
              <td></td>  
              <td>AS PER PACKING LIST</td>               
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              </tr>`

        for (let index = 1; index < 9; index++) {
          htmlString += `
                          <tr>
                          <td>&nbsp</td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          </tr>`
        }

        htmlString += `
              <tr>
              <td colspan="3" style="text-align:right;">Total Taxable (`+ transaction.transactionDetail.toCurrency + `)</td>
              <td></td>
              <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(totalWeight) + `</td>
              <td></td>
              <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigitRound(SumTotalAmtConverted) + `</td>
            </tr>`

      }

      if (taxPerOne) {
        htmlString += `
                      <tr>
                      <td colspan="6" style="text-align:right; padding-right:10px;" >`+ taxNameOne + ` ( ` + taxPerOne + ` % ) </td>
                      <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigitRound(tax1) + `</td>
                      </tr>`
      }
      if (taxPerTwo) {
        htmlString += `
                      <tr>
                      <td colspan="6" style="text-align:right; padding-right:10px;" >`+ taxNameTwo + ` ( ` + taxPerTwo + ` % ) </td>
                      <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigitRound(tax2) + `</td>
                      </tr>`
      }

      htmlString += `                        
                      </tbody>
                      <tfoot>
                      <tr>
                        <td colspan="3" style="text-align:right;">Grand Total (`+ transaction.transactionDetail.toCurrency + `)</td>
                        <td></td>
                        <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(totalWeight) + `</td>
                        <td></td>
                        <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigitRound(SumTotalAmtConvertedWithTax) + `</td>
                      </tr>`

      htmlString += `               
                      <tr>
                        <td colspan="3" style="text-align:right;">Amount in Words:</td>
                        <td colspan="4" class="text-start ps-1">` + this.utilityService.convertAmoutToWord(this.utilityService.ConvertToFloatWithDecimalTwoDigitRoundWithNum(SumTotalAmtConvertedWithTax), "INR") + `</td>
                      </tr>
          
                      </tfoot>
                    </table>
                  </div>
                  <div class="body-fotter">
                    <div class="body-top border-top-0 border-bottom-0 ps-1">
                      <div class="bo-left w-50">                 
                        <table>
                          <tbody>
                            <tr>
                              <td style="width: 160px;"><b>BENEFICIARY BANK : </b></td>
                              <td>`+ (transaction.transactionDetail.bank.bankName ?? "") + `</td>
                            </tr>
                            <tr>
                              <td><b>ADDRESS :</b></td>
                              <td>`+ (transaction.transactionDetail.bank.address.line1 ? transaction.transactionDetail.bank.address.line1 + `,` : "") + (transaction.transactionDetail.bank.address.line2 ? transaction.transactionDetail.bank.address.line2 + `,` : "") + (transaction.transactionDetail.bank.address.city ? transaction.transactionDetail.bank.address.city + `,` : "")
        + (transaction.transactionDetail.bank.address.state ? transaction.transactionDetail.bank.address.state + `,` : "") + (transaction.transactionDetail.bank.address.country ? transaction.transactionDetail.bank.address.country + `,` : "") + (transaction.transactionDetail.bank.address.zipCode ?? "") + `</td>
                            </tr> 
                          </tbody>
                        </table>
                        </div>
                        <div class="bo-left w-50">  
                        <table>
                          <tbody> 
                            <tr>
                              <td><b>ACCOUNT NAME :</b></td>
                              <td>`+ (transaction.transactionDetail.bank.accountName ?? "") + `</td>
                            </tr>
                            <tr>
                              <td><b>A/C NO :</b></td>
                              <td>`+ (transaction.transactionDetail.bank.accountNo ?? "") + `</td>
                            </tr>
                            <tr>
                              <td><b>IFSC CODE :</b></td>
                              <td>`+ (transaction.transactionDetail.bank.ifsc ?? "") + `</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>  
                    </div>    
                
                    <div class="body-f-footer" style="border:2px solid">
                    <span class="border-bottom-2">Terms of Service / Declaration</span>  
                    <li>WE DON'T ACCEPT CHEQUE , PLEASE REMIT BY ELECTRONIC MODE ONLY.</li>
                    <li>PLEASE MAKE IMMEDIATE PAYMENT FOR GST .</li>
                    <li>SUBJECT TO MUMBAI JURISDICTION</li>
                    <li>GOODS SOLD AND DELIVERED AT MUMBAI</li>
        
                    <li>The Diamonds herein invoiced have been purchased from legitimate sources not involved in
                    funding conflict , in compliance with United Nations resolutions and corresponding national
                    laws.The Seller hereby guarantees that these diamonds are conflict free and confirms
                    adherence to the WDC SoW Guidelines.</li>
      
                    <li>To the best of our knowledge and/or written assurance from our suppliers, we state that
                      "Diamonds herein Invoiced have not been obtained in violation of applicable National laws
                      and/or sanctions by the U.S.Department of Treasury's office of Foreign Assets Control(OFAC)
                      and have not originated from the Mbada and Marange Resources of Zimbabwe."</li>
      
                    <li>The Diamonds herein invoiced are exclusively of natural origin and untreated based on personal
                    knowledge and/or written guarantees provided by the supplier of these diamonds.
                    The acceptance of goods herein invoiced will be as per WFDB guidelines.</li>
      
                    <li>NOTIFICATION : E WAY BILL EXEMPTION UNDER NOTIFICATION NO 27/2017 - CENTRAL TAX
                        DATED 31/08/2017 FOR GOODS MENTIONED IN ANNEXURE UNDER SERIAL NO. 150 & 151
                        UNDER RULE NO.138(14) FOR GOODS SPECIFIED UNDER CHAPTER 71.</li>
      
                    <li>I/Wehereby certify that my/our registration certificate under the Goods and Service Tax Act 2017, is in force on
                        the date on which the sales of the goods specified in this tax invoice is made by me/us and that the transaction
                        of sale covered by this tax invoice has been effected by me/us and it shall be accounted for in the turnover of
                        sales while filing of return and the due tax,if any,payble on the sale has been paid or shall be paid.</li>  
                        `
      if (transaction.transactionDetail.additionalDeclaration) {
        htmlString += `      
                              <li>`+ (transaction.transactionDetail.additionalDeclaration ?? "") + `</li>
                              `
      }
      htmlString += `</div>
      
                    <div class="body-f-mid">
                      <div class="body-f-left">
                        <span class="c-st di"></span>
                        <div class="ch-sig">    
                        <span>&nbsp</span>
                        <span>&nbsp</span>
                        <span>&nbsp</span>     
                        <span>&nbsp</span>               
                        <span>(SIGNATURE OF THE RECEIVER)</span>
                        </div>
                      </div>
                      <div class="body-f-right">
                        <span class="c-st di">FOR `+ (transaction.transactionDetail.organization.name ?? "") + `</span>                  
                        <div class="ch-sig">      
                        <br>                   
                        `
      if (transaction.transactionDetail.organization.name == "GLOWSTAR") {
        htmlString += `<img width="100" src="assets/billimage/hardiksign.png">`
      }
      else if (transaction.transactionDetail.organization.name == "SarjuImpex") {
        htmlString += `<img width="100" src="assets/billimage/pravinbhaisign.png">`
      }
      htmlString += `
                        <span>Partner/Auth.Sign.</span>
                        </div>                                 
                      </div>
                    </div>   
                  </div>
                </div>
              </div>`

      if (transaction.packingList.length > 10 || transaction.transactionDetail.isPackingList) {
        htmlString += `
              <div style="height: 100px;"></div>
                <div class="body-middle">
      
                <table>
                <tr>
                <td>Organization :<b> ` + (transaction.transactionDetail.organization.name ?? "") + `</b></td>
                <td>Invoice No : <b>` + (transaction.refNumber ?? "") + `</b></td>
                <td>Invoice Date : <b>` + this.utilityService.getISOtoStringDate(transaction.createdDate) + `</b></td>
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
                    <th>ORIGIN</th>
                    <th>RATE `+ transaction.transactionDetail.toCurrency + ` PER CT</th>
                    <th>TOTAL AMOUNT `+ transaction.transactionDetail.toCurrency + `</th>
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
                          <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.weight) ?? "") + `</td>
                          <td>`+ obj.color + `</td>
                          <td>`+ obj.clarity + `</td>
                          `
            if (transaction.transactionDetail.isWithCertiNo) {
              htmlString += `
                            <td>`+ obj.lab + ` ` + obj.certificateNo + `</td>
                                    `
            }
            else {
              htmlString += `
                            <td></td>     
                            `
            }
            htmlString += `      
                          <td>`+ (obj.origin ?? "") + `</td>
                          <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit((obj.price.perCarat ?? 0) * (transaction.transactionDetail.toCurRate ?? 1)) + `</td>
                          <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigitRound((obj.price.netAmount ?? 0) * (transaction.transactionDetail.toCurRate ?? 1)) + `</td>
                          </tr>`
          }
        }

        htmlString += `
              <tr>
              <td colspan="9" style="text-align:right;">Total Taxable (`+ transaction.transactionDetail.toCurrency + `)</td>        
              <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigitRound(SumTotalAmtConverted) + `</td>
              </tr>`

        if (taxPerOne) {
          htmlString += `
                        <tr>
                        <td colspan="9" style="text-align:right; padding-right:10px;" >`+ taxNameOne + ` ( ` + taxPerOne + ` % ) </td>
                        <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigitRound(tax1) + `</td>
                        </tr>`
        }
        if (taxPerTwo) {
          htmlString += `
                        <tr>
                        <td colspan="9" style="text-align:right; padding-right:10px;" >`+ taxNameTwo + ` ( ` + taxPerTwo + ` % ) </td>
                        <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigitRound(tax2) + `</td>
                        </tr>`
        }

        htmlString += `
                  </tbody>
                  <tfoot>
                          <tr>
                            <td colspan="3">Grand Total</td>
                            <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(totalWeight) + `</td>
                            <td colspan="5">&nbsp</td>                      
                            <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(SumTotalAmtConvertedWithTax) + `</td>
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
    else if (invoiceType == "INDIALOCALDDA") {

      let SumTotalAmtConverted = (totalAmount ?? 0) * (transaction.transactionDetail.toCurRate ?? 1);
      let SumTotalAmtConvertedWithTax = 0;
      let tax1 = 0;
      let tax2 = 0;

      if (taxPerOne > 0)
        tax1 = this.utilityService.ConvertToFloatWithDecimal((taxPerOne * (SumTotalAmtConverted ?? 0)) / 100);

      if (taxPerTwo > 0)
        tax2 += this.utilityService.ConvertToFloatWithDecimal((taxPerTwo * (SumTotalAmtConverted ?? 0)) / 100);

      SumTotalAmtConvertedWithTax = SumTotalAmtConverted + tax1 + tax2;

      htmlString += `
        <body onload="window.print(); window.close();">      
        <p style="margin: 0;font-size: 14px;text-align: center;"><b>TAX INVOICE</b></p> 
        <div class="challan-new">
          <div class="challan-leftside">
            <div class="lefstside-subgrid">
              <div class="grid-1">
                <small>Exporter</small><span style="margin-left: 10px;"><b></b></span>
                `
      if (transaction.transactionDetail.organization.name == "GLOWSTAR") {
        htmlString += `<img src="assets/billimage/GlowstareG.png">`
      }
      else if (transaction.transactionDetail.organization.name == "SarjuImpex") {
        htmlString += `<img src="assets/billimage/SarjuS.png"/>`
      }
      htmlString += `
              </div>
              <div class="grid-1">
              <p><b>` + (transaction.transactionDetail.organization.name ?? "") + `</b></p>
              <p>` + (transaction.transactionDetail.organization.address?.line1 ?? "") + `,` + (transaction.transactionDetail.organization.address?.line2 ?? "") + `<br>
              ` + (transaction.transactionDetail.organization.address?.city ?? "") + `,` + (transaction.transactionDetail.organization.address?.state ?? "") + `,` + (transaction.transactionDetail.organization.address?.country ?? "") + `</p>          
                <p>Tele No.` + (transaction.transactionDetail.organization.phoneNo ?? "") + `,` + (transaction.transactionDetail.organization.mobileNo ?? "") + `</p>
                <p>Email.` + (transaction.transactionDetail.organization.email ?? "") + `</p> 
              </div>
            </div> 
      
              <div class="lefstside-subgrid border-top-2" style="height:210px;">
              <div class="grid-1">
              `
      if (transaction.transactionDetail.consigneeName) {
        htmlString += `
              <p>Consignee</p>     
                <p><b>` + (transaction.transactionDetail.consigneeName ?? "") + `</b></p>          
                <p> ` + (transaction.transactionDetail.consigneeAddress ?? "") + `</p>
                `
      }
      else {
        htmlString += `
                  <p>Consignee</p>     
                    <p><b>*** Direct Parcel ***</b></p> 
                    `
      }
      htmlString += `
              </div>
            </div>
            <div class="box-two border-top-2">
              <div class="box-1 p-1 border-right-2 border-bottom-2">
                <small>Pre-Carriage by</small>
                <p>` + (transaction.transactionDetail.logistic.name ?? "") + `</p>
              </div>
              <div class="box-1 p-1 border-bottom-2">
                <small>Place of Receipt by Pre-carrier</small>
                <p>N.A.</p>
              </div>
              <div class="box-1 p-1 border-right-2 border-bottom-2">
                <small>Vessel/Flight No</small>
                <p>AIR FREIGHT</p>
              </div>
              <div class="box-1 p-1 border-bottom-2">
                <small>Port of Loading</small>
                <p>` + (transaction.transactionDetail.portOfLoading ?? "") + `</p>
              </div>
              <div class="box-1 p-1 border-right-2">
                <small>Port of Discharge</small>
                <p>` + (transaction.toLedger.address?.city ?? "") + `</p>
              </div>
              <div class="box-1 p-1">
                <small>Final Destination</small>
                <p>` + (transaction.toLedger.address?.country ?? "") + `</p>
              </div>
            </div>
          </div>
      
          <div class="challan-rightside">
          <div class="box-two">
          <div class="box-1 p-1 border-bottom-2 border-right-2">
            <small>Invoice.No.& Date</small><span style="margin-left: 10px;">` + this.utilityService.getISOtoStringDate(transaction.createdDate) + `</span>
            <p>` + transaction.refNumber + `</p>
          </div>
          <div class="box-1 p-1 border-bottom-2">
            <small>Exporter's Ref</small>
            <p><b>IEC No :</b> ` + (transaction.transactionDetail.organization.iecNo ?? "") + `</p>
          </div>
          </div>
      
          <div class="box-full p-1 border-bottom-2" style="padding-bottom: 21px;">
            <small>Buyer's Order no. & Date</small>
          </div>
      
          <div class="box-full p-1 border-bottom-2">
            <small>Other Reference (s)</small><span style="margin-left: 25px;"><b>GST No : ` + (transaction.transactionDetail.organization.gstNo ?? "") + `</b></span>         
          </div>
      
          <div class="box-full p-1 border-bottom-2">      
            <span><b>OUR STATE : ` + (transaction.transactionDetail.organization.address.state ?? "") + `   CODE : ` + (transaction.transactionDetail.organization.address.stateCode ?? "") + `</b></span>
          </div>
      
            <div class="box-full p-1">
              <small>Buyer (If other than consignee)</small>
              <p><b>` + (transaction.toLedger.name ?? "") + `</b></p>
              <p>` + (transaction.toLedger.address.line1 ?? "") + `,` + (transaction.toLedger.address.line2 ?? "") + `, <br>
              ` + (transaction.toLedger.address.city ?? "") + `,` + (transaction.toLedger.address.state ?? "") + `,` + (transaction.toLedger.address.country) + `,
              ZipCode : ` + (transaction.toLedger.address.zipCode ?? "") + `
              </p>
              <p>TEL: ` + (transaction.toLedger.mobileNo ?? "") + `, FAX : ` + (transaction.toLedger.faxNo ?? "") + `</p>
            </div>
      
            <div class="box-two border-top-2">
              <div class="box-1 p-1 border-right-2 border-bottom-2">
                <small>Country of Origin of Goods</small>
                <p>` + (transaction.transactionDetail.organization.address?.country ?? "") + `</p>
              </div>
              <div class="box-1 p-1 border-bottom-2">
                <small>Country of Final Destination</small>
                <p>` + (transaction.toLedger.address.country ?? "") + `</p>
              </div>
            </div>
      
            <div class="box-full p-1">
              <small>Terms of Delivery and Payment : ` + (transaction.transactionDetail.terms ?? "") + `</small>           
              <p><b>OUR BANKERS : `+ (transaction.transactionDetail.bank.bankName ?? "") + `</b></p>        
              <p><small>` + (transaction.transactionDetail.bank.address?.line1 ?? "") + `,` + (transaction.transactionDetail.bank.address?.line2 ?? "") + `,
              ` + (transaction.transactionDetail.bank.address?.city ?? "") + `,` + (transaction.transactionDetail.bank.address?.state ?? "") + `,` + (transaction.transactionDetail.bank.address?.country ?? "") + `</small></p>
              <p>A/C Name: `+ (transaction.transactionDetail.bank.accountName ?? "") + `</p>
              <p>A/C No: `+ (transaction.transactionDetail.bank.accountNo ?? "") + `  SWIFT Code: ` + (transaction.transactionDetail.bank.swift ?? "") + `</p>         
              <p><b>AD CODE: `+ (transaction.transactionDetail.bank.adCode ?? "") + `</b></p>
            </div>
        </div>
        </div>`

      if (transaction.packingList.length > 0) {
        htmlString += `
        <div class="record">
          <table>
            <tbody>
      
            <tr>
            <td colspan="1">Container No.  </td>
            <td colspan="1">No. & Kind of Pkgs.</td>
            <td colspan="3">Description of Goods</td>
            <td colspan="1"><b>HSN CODE : 71023910</b></td>
            <td colspan="4"></td>
            </tr>
      
            <tr>
            <td colspan="1"></td>
            <td colspan="1"><b>ONE</b></td>
            <td colspan="3"><b>DIAMONDS , CUT & POLISHED IN INDIA</b></td>
            <td colspan="1"></td>
            <td colspan="4"></td>
            </tr>
      
              <tr>       
                <th>Marks & Nos.</th>            
                <th>ADD.PARCEL</th>          
                <th>Measurment</th>
                <th>Cert.No.</th>
                <th>Pcs</th>
                <th>Quantity/Crts</th>
                <th>Rate ` + (transaction.transactionDetail.fromCurrency ?? "") + `  $</th>
                <th>Amount `+ (transaction.transactionDetail.fromCurrency ?? "") + ` $</th>
              </tr>
              `

        htmlString += `            
                  <tr style="height:50px;">
                  <td>1</td>   
                  <td colspan="3">`+ (transaction.transactionDetail.plDeclaration ?? "") + `</td>           
                  <td>`+ transaction.packingList.length + `</td>                  
                  <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit((totalWeight ?? "")) + `</td>
                  <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit((totalPerCarat ?? 0)) + `</td>
                  <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(totalAmount) ?? "") + `</td>
                  </tr>`

        htmlString += ` 
                  <tr>
                    <th colspan="3">CONVERSION RATE : `+ (transaction.transactionDetail.fromCurRate ?? "") + ` ` + (transaction.transactionDetail.fromCurrency ?? "") + ` = ` + (transaction.transactionDetail.toCurRate ?? "") + ` ` + (transaction.transactionDetail.toCurrency ?? "") + `</th>  
                    <th>Total</th>
                    <th>CRTS</th>
                    <th>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(totalWeight) + `</th>
                    <th>` + (transaction.transactionDetail.exportType ?? "") + ` ` + (transaction.transactionDetail.fromCurrency ?? "") + ` $</th>
                    <th>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(totalAmount) + `</th>
                  </tr>   `

        htmlString += ` 
                      <tr>               
                      <th colspan="7" style="text-align:right">Amount ` + (transaction.transactionDetail.toCurrency ?? "") + `</th>     
                      <th>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(SumTotalAmtConverted) + `</th>
                      </tr>  
      
                      <tr>                
                      <th colspan="7" style="text-align:right">` + taxNameOne + ` (` + taxPerOne + ` %) ` + (transaction.transactionDetail.toCurrency ?? "") + `</th>     
                      <th>`+ tax1.toFixed(0) + `</th>
                      </tr>  
      
                      <tr>                
                      <th colspan="7" style="text-align:right">` + taxNameTwo + ` (` + taxPerTwo + ` %) ` + (transaction.transactionDetail.toCurrency ?? "") + `</th>         
                      <th>`+ tax2.toFixed(0) + `</th>
                      </tr>  
      
                      <tr>               
                      <th colspan="7" style="text-align:right">Total Amount ` + (transaction.transactionDetail.toCurrency ?? "") + `</th>     
                      <th>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(SumTotalAmtConvertedWithTax) + `</th>
                      </tr>
                      
                </tbody>
              </table>
            </div>`
      }


      htmlString += ` 
              <div class="chargable">
              <div class="details p-1">
      
                <p>I/Wehereby certify that my/our registration certificate under the Goods and Service Tax Act 2017, is in force on the date on which
                the sales of the goods specified in this tax invoice is made by me/us and that the transaction of sale covered by this tax invoice
                has been effected by me/us and it shall be accounted for in the turnover of sales while filing of return and the due tax,if
                any,payble on the sale has been paid or shall be paid.</p>
      
                <p>To the best of our knowledge and/or written assurance from our suppliers, we state that "Diamonds herein Invoiced have not been obtained in violation
                of applicable National laws and/or sanctions by the U.S.Department of Treasury's office of Foreign Assets Control(OFAC) and have not originated from
                the Mbada and Marange Resources of Zimbabwe.</p>
      
                <p>The Diamonds herein invoiced are exclusively of natural origin and untreated based on personal knowledge and/or written guarantees provided by the
                supplier of these diamonds.The acceptance of goods herein invoiced will be as per WFDB guidelines.</p>
      
                <p>NOTIFICATION : E WAY BILL EXEMPTION UNDER NOTIFICATION NO 27/2017 - CENTRAL TAX DATED 31/08/2017 FOR GOODS MENTIONED IN ANNEXURE UNDER
                SERIAL NO. 150 & 151 UNDER RULE NO.138(14) FOR GOODS SPECIFIED UNDER CHAPTER 71.</p>          
      
                <p><b>PLEASE MAKE IMMEDIATE PAYMENT FOR TAX . WE DON'T ACCEPT CHEQUE , PLEASE REMIT BY ELECTRONIC MODE ONLY.</b></p>
      
              </div>  
      
              <div class="inv-details">
              <p>
      
              <small style="margin-left: 10px;">Amount Chargeable(In Words)@:</small>
      
              <b style="margin-right: 20px;">` + (this.utilityService.ConvertToFloatWithDecimalTwoDigit(transaction.transactionDetail.toCurRate ?? 0) ?? "") + `</b>
      
              <b>Taxable ` + (transaction.transactionDetail.toCurrency ?? "") + `. : ` + this.utilityService.ConvertToFloatWithDecimalTwoDigit(SumTotalAmtConverted ?? 0) + `</b>
              
              <span><b>` + (transaction.transactionDetail.exportType ?? "") + `  ` + (transaction.transactionDetail.fromCurrency ?? "") + ` $ Total</b>
              <b>` + this.utilityService.ConvertToFloatWithDecimalTwoDigit(totalAmount) + `</b>
              </span>
      
              </p>    
              
              <p class="inv-p" style="font-size: 16px;">
              Total ` + (transaction.transactionDetail.exportType ?? "") + `  ` + (transaction.transactionDetail.fromCurrency ?? "") + ` $   
              ` + this.utilityService.convertAmoutToWord(this.utilityService.ConvertToFloatWithDecimalTwoDigitRoundWithNum(totalAmount), "USD") + `</p>
              <p style="height:7px;">&nbsp</p>
              <p class="inv-p">"The Diamonds herein invoiced have been purchased from legitimate sources not involved in funding
                conflict , in compliance with United Nations resolutions and corresponding national laws .</p>
              <p class="inv-p">The Seller hereby guarantees that these diamonds are conflict free and confirms adherence to the
                WDC SoW Guidelines."</p>        
              <p class="inv-p">The acceptance of goods herein invoiced will be as per WFDB guidelines.</p>        
              <p style="margin-left: 10px;"><b>PAYMENT INSTRUCTION :</b>BENEFICIARY : `+ (transaction.transactionDetail.bank.accountName ?? "") + `</p>
              <p style="margin-left: 10px;">OUR BANK : ` + (transaction.transactionDetail.bank.address?.line1 ?? "") + `,` + (transaction.transactionDetail.bank.address?.line2 ?? "") + `,
              ` + (transaction.transactionDetail.bank.address?.city ?? "") + `,` + (transaction.transactionDetail.bank.address?.state ?? "") + `,` + (transaction.transactionDetail.bank.address?.country ?? "") + `</p>
              <p style="margin-left: 10px;">A/C NO. `+ (transaction.transactionDetail.bank.accountNo ?? "") + `, SWIFT CODE : ` + (transaction.transactionDetail.bank.swift ?? "") + `</p>
              <p style="margin-left: 10px;">INTERMEDIARY BANK : `+ (transaction.transactionDetail.bank.intermediaryBankName ?? "") + ` ,SWIFT CODE: ` + (transaction.transactionDetail.bank.intermediaryBankswift ?? "") + `</p>        
              <p style="margin-left: 10px;margin-top: 15px;""><b>STATE OF ORIGIN : `+ (transaction.transactionDetail.organization.address.stateCode ?? "") + `, DISTRICT OF ORIGIN : ` + (transaction.transactionDetail.organization.address.districtCode ?? "") + `</b></p>
              <p style="margin-left: 10px;margin-top: 15px;""><b>SUBJECT TO MUMBAI JURISDICTION</b></p>
              <p style="margin-left: 10px;margin-top: 15px;""><b>GOODS SOLD AND DELIVERED AT MUMBAI (HAND DELIVERY)</b></p>
              </div>
              `;

      htmlString += `
          <div class="inv-details" style="page-break-after: always;">
            <div class="sign-div">
              <div class="grid-1 p-1"> 
                <p>
                <h5>On Confirmed outright sale basis</h5>
                </p>
                <p>Declaration :
                <h5>PAN : ` + (transaction.transactionDetail.organization.incomeTaxNo ?? "") + `</h5>
</p>
                <p><small>We declare that this Invoice shows the actual price of the goods described and that all particulars
                    are true and correct.</small></p>
                    <p><b>IRN No </b>: ` + (transaction.transactionDetail.irnNo ?? "") + `</p>
                         `
      if (transaction.transactionDetail.additionalDeclaration) {
        htmlString += `      
                              <li>`+ (transaction.transactionDetail.additionalDeclaration ?? "") + `</li>
                              `
      }
      htmlString += `
              </div>
              <div class="grid-2">
                <p>Signature & Date<br>` + this.utilityService.getISOtoStringDate(transaction.createdDate) + `</p>
                <p><b>For ` + (transaction.transactionDetail.organization.name ?? "") + `<br>Partner/Auth.Sign.</b></p>
              </div>
            </div>   
          </div>
        </div>
      </body>`

      if (transaction.transactionDetail.isPackingList) {
        htmlString += `
                <div class="body-middle">
      
                <table>
                <tr>
                <td>Organization :<b> ` + (transaction.transactionDetail.organization.name ?? "") + `</b></td>
                <td>Invoice No : <b>` + (transaction.refNumber ?? "") + `</b></td>
                <td>Invoice Date : <b>` + this.utilityService.getISOtoStringDate(transaction.createdDate) + `</b></td>
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
                    <th>ORIGIN</th>
                    <th>REPORT NO</th>      
                    <th>RAPAPORT</th>     
                    <th>PRICE `+ (transaction.transactionDetail.fromCurrency ?? "") + ` /PER CT</th>
                    <th>NET AMT `+ (transaction.transactionDetail.fromCurrency ?? "") + `</th>
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
                          <td>`+ (obj.origin ?? "") + `</td>
                          <td>`+ (obj.certificateNo ?? "") + `</td>
                          <td>`+ (obj.price.rap ?? "") + `</td>
                          <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.perCarat ?? 0) ?? "") + `</td>
                          <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.netAmount ?? 0) ?? "") + `</td>
                          </tr>`
          }
        }

        htmlString += `
                  </tbody>
                  <tfoot>
                          <tr>
                            <td colspan="3"><b>Grand Total</b></td>
                            <td><b>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(totalWeight ?? 0) + `</b></td>
                            <td colspan="7">&nbsp</td>                      
                            <td><b>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(totalAmount ?? 0) + `</b></td>
                          </tr>  
                  </tfoot>
                  </table>
                  </div>`
      }

      htmlString += `
              </body>
              </html>
              `;
    }
    else if (invoiceType == "INDIAOVERSEAS") {

      let SumTotalAmtConverted = (totalAmount ?? 0) * (transaction.transactionDetail.toCurRate ?? 1);
      let tax1 = 0;
      let tax2 = 0;

      if (taxPerOne > 0)
        tax1 = this.utilityService.ConvertToFloatWithDecimal((taxPerOne * (SumTotalAmtConverted ?? 0)) / 100);

      if (taxPerTwo > 0)
        tax2 += this.utilityService.ConvertToFloatWithDecimal((taxPerTwo * (SumTotalAmtConverted ?? 0)) / 100);

      var firstPageCount: number = 22;
      var midPageCount: number = 41;
      var lastPageCount: number = 22;
      var totalPageCount: number;
      var skip: number = 0;

      var numOfStone = transaction.packingList.length;
      var withoutFirstAndLast = numOfStone - firstPageCount - lastPageCount;
      var pageCount = withoutFirstAndLast / midPageCount;
      pageCount = pageCount + 2;//+2 For First and Last Page.

      const roundedPageCount = Math.floor(pageCount);
      totalPageCount = roundedPageCount < pageCount ? roundedPageCount + 1 : roundedPageCount;

      if (transaction.packingList.length > 7 && totalPageCount == 1)
        totalPageCount = 2
      if (transaction.transactionDetail.isPackingList)
        totalPageCount = 1

      var lastpagedeclaration: boolean = false;

      for (let index = 1; index <= totalPageCount; index++) {

        if (lastpagedeclaration == true)
          break

        htmlString += `        
      <body onload="window.print(); window.close();">      
      <p style="margin: 0;font-size: 14px;text-align: center;"><b>INVOICE</b></p>  
    
      <div class="challan-new">
        <div class="challan-leftside">
          <div class="lefstside-subgrid">
            <div class="grid-1">
              <small>Exporter</small><span style="margin-left: 10px;"><b></b></span>
              `
        if (transaction.transactionDetail.organization.name == "GLOWSTAR") {
          htmlString += `<img src="assets/billimage/GlowstareG.png">`
        }
        else if (transaction.transactionDetail.organization.name == "SarjuImpex") {
          htmlString += `<img src="assets/billimage/SarjuS.png"/>`
        }
        htmlString += `
    
            </div>
            <div class="grid-1">
            <p><b>` + (transaction.transactionDetail.organization.name ?? "") + `</b></p>
            <p>` + (transaction.transactionDetail.organization.address?.line1 ?? "") + `,` + (transaction.transactionDetail.organization.address?.line2 ?? "") + `<br>
            ` + (transaction.transactionDetail.organization.address?.city ?? "") + `,` + (transaction.transactionDetail.organization.address?.state ?? "") + `,` + (transaction.transactionDetail.organization.address?.country ?? "") + `</p>          
              <p>Tele No.` + (transaction.transactionDetail.organization.phoneNo ?? "") + `,` + (transaction.transactionDetail.organization.mobileNo ?? "") + `</p>
              <p>Email.` + (transaction.transactionDetail.organization.email ?? "") + `</p> 
            </div>
          </div>
          `
        if (index == 1)//First Page 
        {
          htmlString += `
            <div class="lefstside-subgrid border-top-2" style="height:254px;">
            <div class="grid-1">
            `
          if (transaction.transactionDetail.consigneeName) {
            htmlString += `
            <p>Consignee</p>     
              <p><b>` + (transaction.transactionDetail.consigneeName ?? "") + `</b></p>          
              <p> ` + (transaction.transactionDetail.consigneeAddress ?? "") + `</p>
              `
          }
          else {
            htmlString += `
                <p>Consignee</p>     
                  <p><b>*** Direct Parcel ***</b></p> 
                  `
          }
          htmlString += `
            </div>
          </div>
          <div class="box-two border-top-2">
            <div class="box-1 p-1 border-right-2 border-bottom-2">
              <small>Pre-Carriage by</small>
              <p>` + (transaction.transactionDetail.logistic.name ?? "") + `</p>
            </div>
            <div class="box-1 p-1 border-bottom-2">
              <small>Place of Receipt by Pre-carrier</small>
              <p>N.A.</p>
            </div>
            <div class="box-1 p-1 border-right-2 border-bottom-2">
              <small>Vessel/Flight No</small>
              <p>AIR FREIGHT</p>
            </div>
            <div class="box-1 p-1 border-bottom-2">
              <small>Port of Loading</small>
              <p>` + (transaction.transactionDetail.portOfLoading ?? "") + `</p>
            </div>
            <div class="box-1 p-1 border-right-2">
              <small>Port of Discharge</small>
              <p>` + (transaction.toLedger.address?.city ?? "") + `</p>
            </div>
            <div class="box-1 p-1">
              <small>Final Destination</small>
              <p>` + (transaction.toLedger.address?.country ?? "") + `</p>
            </div>
          </div>`
        }
        htmlString += ` 
        </div>
    
        <div class="challan-rightside">
        <div class="box-two">
        <div class="box-1 p-1 border-bottom-2 border-right-2">
          <small>Invoice.No.& Date</small><span style="margin-left: 10px;">` + this.utilityService.getISOtoStringDate(transaction.createdDate) + `</span>
          <p>` + transaction.refNumber + `</p>
        </div>
        <div class="box-1 p-1 border-bottom-2">
          <small>Exporter's Ref</small>
          <p><b>IEC No :</b> ` + (transaction.transactionDetail.organization.iecNo ?? "") + `</p>
        </div>
        </div>
    
        <div class="box-full p-1 border-bottom-2" style="padding-bottom: 10px;">
          <small>Buyer's Order no. & Date</small>
        </div>
    
        <div class="box-full p-1 border-bottom-2">
          <small>Other Reference (s)</small><span style="margin-left: 25px;"><b>GST No : ` + (transaction.transactionDetail.organization.gstNo ?? "") + `</b></span>   
        </div>`
        if (index == 1)//First Page 
        {
          htmlString += `      
          <div class="box-full p-1">
            <small>Buyer (If other than consignee)</small>
            <p><b>` + (transaction.toLedger.name ?? "") + `</b></p>
            <p>` + (transaction.toLedger.address.line1 ?? "") + `,` + (transaction.toLedger.address.line2 ?? "") + `, <br>
            ` + (transaction.toLedger.address.city ?? "") + `,` + (transaction.toLedger.address.state ?? "") + `,` + (transaction.toLedger.address.country) + `,
            ZipCode : ` + (transaction.toLedger.address.zipCode ?? "") + `
            </p>
            <p>TEL: ` + (transaction.toLedger.mobileNo ?? "") + `, FAX : ` + (transaction.toLedger.faxNo ?? "") + `</p>
          </div>
    
          <div class="box-two border-top-2">
            <div class="box-1 p-1 border-right-2 border-bottom-2">
              <small>Country of Origin of Goods</small>
              <p>` + (transaction.transactionDetail.organization.address?.country ?? "") + `</p>
            </div>
            <div class="box-1 p-1 border-bottom-2">
              <small>Country of Final Destination</small>
              <p>` + (transaction.toLedger.address.country ?? "") + `</p>
            </div>
          </div>
    
          <div class="box-full p-1">
            <small>Terms of Delivery and Payment</small>
            <p>` + (transaction.transactionDetail.terms ?? "") + `</p>
            <br>
            
            `
          if (isIGST == true) {
            htmlString += `  
                <p>Supply Meant for Export With payment of IGST.</p>        
            `
          }
          else {
            htmlString += `  
                <p>Supply Meant for Export Under Bond or Letter of Undertaking without payment of IGST.</p>
            `
          }

          htmlString += `  
            <p><b>OUR BANKERS :</b></p>
            <p><b>`+ (transaction.transactionDetail.bank.bankName ?? "") + `</b></p>
            <p><small>` + (transaction.transactionDetail.bank.address?.line1 ?? "") + `,` + (transaction.transactionDetail.bank.address?.line2 ?? "") + `,
            ` + (transaction.transactionDetail.bank.address?.city ?? "") + `,` + (transaction.transactionDetail.bank.address?.state ?? "") + `,` + (transaction.transactionDetail.bank.address?.country ?? "") + `</small></p>
            <p>A/C Name: `+ (transaction.transactionDetail.bank.accountName ?? "") + `</p>
            <p>A/C No: `+ (transaction.transactionDetail.bank.accountNo ?? "") + `</p>
            <p>SWIFT Code: `+ (transaction.transactionDetail.bank.swift ?? "") + `</p>        
            <p><b>AD CODE: `+ (transaction.transactionDetail.bank.adCode ?? "") + `</b></p>
          </div>`
        }
        htmlString += `
      </div>
      </div>`
        var thispagecount = 0
        if (index == 1)
          thispagecount = firstPageCount;
        else if (index == totalPageCount)
          thispagecount = lastPageCount;
        else
          thispagecount = midPageCount;

        let filterInventoryItems = transaction.packingList.slice(skip, skip + thispagecount);

        if (filterInventoryItems.length > 0) {
          htmlString += `
      <div class="record">
        <table>
          <tbody>
    
          <tr>
          <td colspan="1">Container No.  </td>
          <td colspan="1">No. & Kind of Pkgs.</td>
          <td colspan="3">Description of Goods</td>
          <td colspan="1"><b>HSN CODE : 71023910</b></td>
          <td colspan="4"></td>
          </tr>
    
          <tr>
          <td colspan="1"></td>
          <td colspan="1"><b>ONE</b></td>
          <td colspan="3"><b>DIAMONDS , CUT & POLISHED IN INDIA</b></td>
          <td colspan="1"></td>
          <td colspan="4"></td>
          </tr>
    
            <tr>       
              <th>Marks & Nos.</th>            
              <th>ADD.PARCEL</th>          
              <th>Measurment</th>
              <th>Cert.No.</th>
              <th>Pcs</th>
              <th>Quantity/Crts</th>
              <th>Rate ` + (transaction.transactionDetail.fromCurrency ?? "") + `  $</th>
              <th>Amount `+ (transaction.transactionDetail.fromCurrency ?? "") + ` $</th>
            </tr>
            `

          var totweight: number = 0;
          var totnetAmount: number = 0

          if (!transaction.transactionDetail.isPackingList) {

            for (let indexS = 0; indexS <= filterInventoryItems.length; indexS++) {
              let obj = filterInventoryItems[indexS];

              if (obj) {
                htmlString += `            
                      <tr>
                      <td>`+ (indexS + 1 + skip) + `</td>                  
                      <td>`+ (this.getDisplayNameFromMasterDNorm(obj.shape.trim()) ?? "") + `-` + (obj.color ?? "") + `-` + (obj.clarity ?? "") + `</td>
                      <td>&nbsp</td>
                      <td>` + (obj.lab ?? "") + ` ` + (obj.certificateNo ?? "") + `</td>
                      <td>Pcs 1</td>                  
                      <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit((obj.weight ?? "")) + `</td>
                      <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.perCarat ?? 0) ?? "") + `</td>
                      <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.netAmount ?? 0) ?? "") + `</td>
                      </tr>`
              }
            }
            skip = skip + thispagecount;
            filterInventoryItems.forEach(z => { totweight += z.weight });
            filterInventoryItems.forEach(z => { totnetAmount += z.price.netAmount ?? 0 });

            var data = 0//Add Extra Lines In Page.
            if (index == 1 && filterInventoryItems.length > 7)
              data = firstPageCount;
            if (index != 1 && filterInventoryItems.length > 15)
              data = midPageCount;
            if (index != 1 && index == totalPageCount && lastpagedeclaration == false) {
              data = lastPageCount;
            }

            if (filterInventoryItems.length > 1) {
              for (let index = filterInventoryItems.length; index < data; index++) {
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
                  </tr>`
              }
            }
            htmlString += ` 
                <tr>
                  <th colspan="3">Gross Weight: ` + transaction.transactionDetail.boxWeight + ` Kgs.</th>  
                  <th>Page Total</th>
                  <th>CRTS</th>
                  <th>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(totweight) + `</th>
                  <th>` + (transaction.transactionDetail.exportType ?? "") + ` ` + (transaction.transactionDetail.fromCurrency ?? "") + ` $</th>
                  <th>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(totnetAmount) + `</th>
                </tr>  
                <tr>
                <th colspan="3"></th>  
                <th>Grand Total</th>
                <th>CRTS</th>
                <th>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(totalWeight) + `</th>
                <th>` + (transaction.transactionDetail.exportType ?? "") + ` ` + (transaction.transactionDetail.fromCurrency ?? "") + ` $</th>
                <th>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(totalAmount) + `</th>
              </tr>       
              </tbody>
            </table>
          </div>`
          }

          else if (transaction.transactionDetail.isPackingList) {
            htmlString += `            
                <tr style="height:50px;">
                <td>1</td>   
                <td colspan="3">`+ (transaction.transactionDetail.plDeclaration ?? "") + (transaction.transactionDetail.plDeclaration ? '<br>' : "") + "AS PER PACKING LIST ATTACHED" + `</td>           
                <td>`+ transaction.packingList.length + `</td>                  
                <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit((totalWeight ?? "")) + `</td>
                <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit((totalPerCarat ?? 0)) + `</td>
                <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(totalPayableAmount ?? 0) ?? "") + `</td>
                </tr>`

            htmlString += ` 
                <tr>
                  <th colspan="3">Gross Weight: ` + (transaction.transactionDetail.boxWeight ?? "") + ` Kgs.</th>  
                  <th>Total</th>
                  <th>CRTS</th>
                  <th>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(totalWeight) + `</th>
                  <th>` + (transaction.transactionDetail.exportType ?? "") + ` ` + (transaction.transactionDetail.fromCurrency ?? "") + ` $</th>
                  <th>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(totalPayableAmount) + `</th>
                </tr>        
              </tbody>
            </table>
          </div>`
          }
        }

        htmlString += ` 
            <div class="chargable">`
        if (
          (index == totalPageCount)
          ||
          (index != 1 && index != 2 && index == totalPageCount - 1 && filterInventoryItems.length < 15)
          ||
          (index == 2 && totalPageCount == 2 && transaction.packingList.length < 6)
          && lastpagedeclaration == false
        )//Last Page Declaration
        {
          lastpagedeclaration = true;

          if (transaction.transactionDetail.shippingCharge) {
            if (transaction.transactionDetail.exportType == "CIF") {
              htmlString += `
            <div style="overflow:hidden">
            <p><span style="text-align:right"><b>Add Freight & Insurance :` + transaction.transactionDetail.shippingCharge + `</b></span></p> 
            </div>                 
            `
            }
            else if (transaction.transactionDetail.exportType == "CFR") {
              htmlString += `
                  <div style="overflow:hidden">
                  <p><span style="text-align:right"><b>Add Freight :` + transaction.transactionDetail.shippingCharge + `</b></span></p> 
                  </div>                 
                  `
            }
          }

          htmlString += `
            <div class="inv-details">
            <p>
            <small style="margin-left: 10px;">Amount Chargeable(In Words)@:</small>
    
            <b style="margin-right: 20px;">` + (this.utilityService.ConvertToFloatWithDecimalTwoDigit(transaction.transactionDetail.toCurRate ?? 0) ?? "") + `</b>
    
            <b>Taxable ` + (transaction.transactionDetail.toCurrency ?? "") + `. : ` + this.utilityService.ConvertToFloatWithDecimalTwoDigit(convertTotalPayableAmount ?? 0) + `</b>
            `
          if (isIGST == true)
            htmlString += `
                &nbsp&nbsp&nbsp&nbsp&nbsp&nbsp<b>` + taxNameOne + ` @: ` + taxPerOne + `  ` + (transaction.transactionDetail.toCurrency ?? "") + ` : ` + this.utilityService.ConvertToFloatWithDecimalTwoDigit(tax1 ?? 0) + `</b>
            `
          htmlString += `
            <span><b>` + (transaction.transactionDetail.exportType ?? "") + `  ` + (transaction.transactionDetail.fromCurrency ?? "") + ` $ Total</b>
            <b>` + this.utilityService.ConvertToFloatWithDecimalTwoDigit(totalPayableAmount) + `</b>
            </span>
            </p>    
            
            <p class="inv-p" style="font-size: 16px;">
            Total ` + (transaction.transactionDetail.exportType ?? "") + `  ` + (transaction.transactionDetail.fromCurrency ?? "") + ` $   
            ` + this.utilityService.convertAmoutToWord(this.utilityService.ConvertToFloatWithDecimalTwoDigitRoundWithNum(totalPayableAmount), "USD") + `</p>
            <p style="height:7px;">&nbsp</p>
            <p class="inv-p">"The Diamonds herein invoiced have been purchased from legitimate sources not involved in funding
              conflict , in compliance with United Nations resolutions and corresponding national laws .</p>
            <p class="inv-p">The Seller hereby guarantees that these diamonds are conflict free and confirms adherence to the
              WDC SoW Guidelines."</p>
            <p class="inv-p">The Diamonds herein invoiced are exclusively of natural origin and untreated based on personal
              knowledge and/or written guarantees provided by the supplier of these diamonds.</p>
            <p class="inv-p">The acceptance of goods herein invoiced will be as per WFDB guidelines.</p>
            <p style="margin-left: 10px;"><b>WE INTEND TO CLAIM RoDTEP ON THE EXPORT ITEMS LISTED UNDER THIS INVOICE NO.</b></p>
            <p style="margin-left: 10px;"><b>PAYMENT INSTRUCTION :</b>BENEFICIARY : `+ (transaction.transactionDetail.bank.accountName ?? "") + `</p>
            <p style="margin-left: 10px;">OUR BANK : ` + (transaction.transactionDetail.bank.address?.line1 ?? "") + `,` + (transaction.transactionDetail.bank.address?.line2 ?? "") + `,
            ` + (transaction.transactionDetail.bank.address?.city ?? "") + `,` + (transaction.transactionDetail.bank.address?.state ?? "") + `,` + (transaction.transactionDetail.bank.address?.country ?? "") + `</p>
            <p style="margin-left: 10px;">A/C NO. `+ (transaction.transactionDetail.bank.accountNo ?? "") + `, SWIFT CODE : ` + (transaction.transactionDetail.bank.swift ?? "") + `</p>
            <p style="margin-left: 10px;">INTERMEDIARY BANK : `+ (transaction.transactionDetail.bank.intermediaryBankName ?? "") + ` ,SWIFT CODE: ` + (transaction.transactionDetail.bank.intermediaryBankswift ?? "") + `</p>                
            <p style="margin-left: 10px;margin-top: 15px;""><b>STATE OF ORIGIN : `+ (transaction.transactionDetail.organization.address.stateCode ?? "") + `, DISTRICT OF ORIGIN : ` + (transaction.transactionDetail.organization.address.districtCode ?? "") + `</b></p>
            `
          if (isIGST == false) {
            htmlString += `
            <p style="margin-left: 10px;margin-top: 15px;""><b>ARN : AD270322054945Y</b></p>
            `}

          htmlString += `
            <p style="margin-left: 10px;margin-top: 15px;""><b>DOOR TO DOOR INSURANCE COVERED BY `+ (transaction.transactionDetail.logistic.name ?? "") + `</b></p>
            </div>
            `;
        }

        //style="page-break-after: always" For Break The Page
        htmlString += `
        <div class="inv-details" style="page-break-after: always;">
          <div class="sign-div">
            <div class="grid-1 p-1">
              <p><b>Details of preferential agreements under which the goods are being exported : NCPTI</b></p>
              <p><b>SQC-CTM</b></p>
              <p>
              <h5>On Confirmed outright sale basis</h5>
              </p>
              <p>Declaration :
              <h5>PAN : ` + (transaction.transactionDetail.organization.incomeTaxNo ?? "") + `</h5>
              </p>
              <p><small>We declare that this Invoice shows the actual price of the goods described and that all particulars
                  are true and correct.</small></p>
              <p>IRN No: ` + (transaction.transactionDetail.irnNo ?? "") + `</p>
                   `
      if (transaction.transactionDetail.additionalDeclaration) {
        htmlString += `      
                              <li>`+ (transaction.transactionDetail.additionalDeclaration ?? "") + `</li>
                              `
      }
      htmlString += `
            </div>
            <div class="grid-2">
              <p>Signature & Date<br>` + this.utilityService.getISOtoStringDate(transaction.createdDate) + `</p>
              <p><b>For ` + (transaction.transactionDetail.organization.name ?? "") + `<br>Partner/Auth.Sign.</b></p>
            </div>
          </div>
        <div class="pager border-top-2 border-bottom-2 border-left-2 border-right-2 " style="overflow:hidden; padding-right:20px;">
          <span>Page `+ index + ` of ` + totalPageCount + `</span>
          </div>       
        </div>
      </div>
    </body>`

      }//Main Foor Loop End

      if (transaction.transactionDetail.isPackingList) {
        htmlString += `
              <div class="body-middle">
    
              <table>
              <tr>
              <td>Organization :<b> ` + (transaction.transactionDetail.organization.name ?? "") + `</b></td>
              <td>Invoice No : <b>` + (transaction.refNumber ?? "") + `</b></td>
              <td>Invoice Date : <b>` + this.utilityService.getISOtoStringDate(transaction.createdDate) + `</b></td>
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
                  <th>REPORT NO</th>      
                  <th>RAPAPORT</th>     
                  <th>PRICE `+ (transaction.transactionDetail.fromCurrency ?? "") + ` /PER CT</th>
                  <th>NET AMT `+ (transaction.transactionDetail.fromCurrency ?? "") + `</th>
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
                        <td>`+ (obj.price.rap ?? "") + `</td>
                        <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.perCarat ?? 0) ?? "") + `</td>
                        <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.netAmount ?? 0) ?? "") + `</td>
                        </tr>`
          }
        }

        htmlString += `
                </tbody>
                <tfoot>
                        <tr>
                          <td colspan="3"><b>Grand Total</b></td>
                          <td><b>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(totalWeight ?? 0) + `</b></td>
                          <td colspan="6">&nbsp</td>                      
                          <td><b>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(totalPayableAmount ?? 0) + `</b></td>
                        </tr>  
                </tfoot>
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
    let belowFiveCentTotalWeight = 0;
    let belowFiveCentTotalAmount = 0;
    let aboveFiveCentTotalStone = 0;
    let belowFiveCentTotalStone = 0;
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
      belowFiveCentTotalStone = this.utilityService.ConvertToFloatWithDecimal(belowPointFiveCentData.length);
      belowFiveCentTotalWeight = this.utilityService.ConvertToFloatWithDecimal(belowPointFiveCentData.reduce((acc, cur) => acc + (cur.weight ? cur.weight : 0), 0));
      belowFiveCentTotalAmount = this.utilityService.ConvertToFloatWithDecimal(belowPointFiveCentData.reduce((acc, cur) => acc + (cur.price.netAmount ? cur.price.netAmount : 0), 0));
      belowTotalPerCarat = this.utilityService.ConvertToFloatWithDecimal(belowFiveCentTotalAmount / belowFiveCentTotalWeight);
    }
    let belowFiveCentSumTotalAmtConverted = (belowFiveCentTotalAmount ?? 0) * (transaction.transactionDetail.toCurRate ?? 1);

    if (taxPerOne > 0)
      below1ctTax1 = Number(parseFloat(parseFloat(this.utilityService.ConvertToFloatWithDecimal((taxPerOne * (belowFiveCentSumTotalAmtConverted ?? 0)) / 100).toString()).toFixed(0)));

    if (taxPerTwo > 0)
      below1ctTax2 = Number(parseFloat(parseFloat(this.utilityService.ConvertToFloatWithDecimal((taxPerTwo * (belowFiveCentSumTotalAmtConverted ?? 0)) / 100).toString()).toFixed(0)));

    totalValueTaxedBelow1ctPlusStones = this.utilityService.ConvertToFloatWithDecimal(belowFiveCentSumTotalAmtConverted + below1ctTax1 + below1ctTax2, 0);

    if (invoiceType == "INDIALOCAL") {
      let SumTotalAmtConverted = (totalAmount ?? 0) * (transaction.transactionDetail.toCurRate ?? 1);
      let SumTotalAmtConvertedWithTax = 0;
      let tax1 = 0;
      let tax2 = 0;

      if (taxPerOne > 0)
        tax1 = Number(parseFloat(parseFloat(this.utilityService.ConvertToFloatWithDecimal((taxPerOne * (SumTotalAmtConverted ?? 0)) / 100).toString()).toFixed(0)));

      if (taxPerTwo > 0)
        tax2 = Number(parseFloat(parseFloat(this.utilityService.ConvertToFloatWithDecimal((taxPerTwo * (SumTotalAmtConverted ?? 0)) / 100).toString()).toFixed(0)));

      SumTotalAmtConvertedWithTax = this.utilityService.ConvertToFloatWithDecimal(SumTotalAmtConverted + tax1 + tax2, 0);

      htmlString += `  
      <body onload="window.print(); window.close();">        
          <div style="height: 210px;"></div>
          <div class="chal-body">

            <span class="c-st border-top-2 border-left-2 border-right-2">TAX INVOICE</span>            
            <div class="body-top ps-1 border-bottom-0">
              <div class="bo-left w-50">
                <span class="c-st text-start">To.: ` + (transaction.toLedger.name ?? "") + `</span>
                <span>` + (transaction.toLedger.address.line1 ? transaction.toLedger.address.line1 + `,` : "") + (transaction.toLedger.address.line2 ?? "") + `</span>            
                <span>` + (transaction.toLedger.address.city ? transaction.toLedger.address.city + `,` : "") + (transaction.toLedger.address.state ? transaction.toLedger.address.state + `,` : "") + (transaction.toLedger.address.country ?? "") + `</span>            
                <span>ZipCode : ` + (transaction.toLedger.address.zipCode ?? "") + `</span>
                <span>PAN Number : ` + (transaction.toLedger.incomeTaxNo ?? "") + `</span>
                <span>GST Number : ` + (transaction.toLedger.taxNo ?? "") + `</span> 
                <span>PLACE OF SUPPLY : ` + (transaction.toLedger.address.state ?? "") + `</span> 
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
                      <td>` + this.utilityService.getISOtoStringDate(transaction.createdDate) + `</td>
                    </tr>
                    <tr>
                      <td><b>DISTRICT OF ORIGIN:</b></td>
                      <td>483</td>
                    </tr>
                    <tr>
                      <td><b>OUR STATE:</b></td>
                      <td>` + (transaction.transactionDetail.organization.address.state ?? "") + `</td>
                      <td><b>CODE:</b></td>
                      <td>` + (transaction.transactionDetail.organization.address.stateCode ?? "") + `</td>
                    </tr>
                    <tr>
                      <td><b>OUR GST NO:</b></td>
                      <td>` + transaction.transactionDetail.organization.gstNo + `</td>                      
                    </tr>
                    <tr>
                      <td><b>OUR PAN NO:</b></td>
                      <td>` + transaction.transactionDetail.organization.incomeTaxNo + `</td>                      
                    </tr>
                    <tr>
                     <td><b>HSN CODE:</b></td>
                     <td>71023910</td>                      
                    </tr>
                    <tr>
                     <td><b>TERMS:</b></td>
                     <td><b>` + (transaction.transactionDetail.terms ?? "") + `</b></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <span class="c-st border-top-2 border-left-2 border-right-2">IRN No: ` + (transaction.transactionDetail.irnNo ?? "") + `</span>
            <div class="body-middle">
              <table>
                <thead>
                  <th>Sr.No.</th> 
                  <th>Ref.No.</th>                                 
                  <th>DESCRIPTION</th>
                  <th>Avg.Pcs/Carats</th>
                  <th>Pcs</th>
                  <th>Wgt.in Carats</th>
                  <th>Rate /Carat</th>
                  <th>Sales Value in (`+ transaction.transactionDetail.toCurrency + `)</th>
                </thead>
                <tbody>`

      if (transaction.packingList.length < 11) {
        if (transaction.transactionDetail.isPackingList) {

          //Above 1 CARAT Size Packing list  
          htmlString += `
                    <tr>
                    <td>1</td> 
                    <td></td>
                    `
          htmlString += `
            <td>0.50 CT ABOVE SIZE</td>    
            `
          htmlString += `           
                    <td></td>
                    <td>` + (aboveFiveCentTotalStone ?? "") + `</td>
                    <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(aboveFiveCentTotalWeight) ?? "") + `</td>
                    <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(((aboveFiveCentAmont * (transaction.transactionDetail.toCurRate ?? 0)) / aboveFiveCentTotalWeight ?? 0)) + `</td>
                    <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigitRound(above1ctSumTotalAmtConverted) + `</td>
                    </tr>`

          htmlString += `
                <tr>         
                <td></td>     
                <td></td>  
                <td>CUT & POLISHED DIAMONDS</td>               
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                </tr>`

          htmlString += `
                  <tr>         
                  <td></td>     
                  <td></td>  
                  <td>AS PER PACKING LIST 1</td>               
                  <td></td>
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
                <td></td>
                <td></td>
                </tr>`

          //Below 1 CARAT Size Packing list                
          htmlString += `
                          <tr>
                          <td>2</td> 
                          <td></td>
                          `
          htmlString += `
                  <td>0.50 CT BELOW SIZE</td>    
                  `
          htmlString += `           
                          <td></td>
                          <td>` + (belowFiveCentTotalStone ?? "") + `</td>
                          <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(belowFiveCentTotalWeight) ?? "") + `</td>
                          <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(((belowFiveCentTotalAmount * (transaction.transactionDetail.toCurRate ?? 0)) / belowFiveCentTotalWeight ?? 0)) + `</td>
                          <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigitRound(belowFiveCentSumTotalAmtConverted) + `</td>
                          </tr>`

          htmlString += `
                      <tr>         
                      <td></td>     
                      <td></td>  
                      <td>CUT & POLISHED DIAMONDS</td>               
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      </tr>`

          htmlString += `
                        <tr>         
                        <td></td>     
                        <td></td>  
                        <td>AS PER PACKING LIST 2</td>               
                        <td></td>
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
                      <td></td>
                      <td></td>
                      </tr>`

          for (let index = transaction.packingList.length; index < 5; index++) {
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
                    </tr>`
          }
          htmlString += `
        <tr>
        <td colspan="3" style="text-align:right;">Total Taxable (`+ transaction.transactionDetail.toCurrency + `)</td>
        <td></td>
        <td></td>
        <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(totalWeight) + `</td>
        <td></td>
        <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigitRound(SumTotalAmtConverted) + `</td>
      </tr>`
        } else {
          for (let indexS = 0; indexS < transaction.packingList.length; indexS++) {
            let obj = transaction.packingList[indexS];
            htmlString += `
                    <tr>
                    <td>`+ (indexS + 1) + `</td> 
                    <td></td>
                    `
            if (transaction.transactionDetail.isWithCertiNo) {
              htmlString += `
                    <td style="font-size:14px">CUT & POLISHED DIAMOND (`+ (obj.certificateNo ?? "") + `)</td>     
                    `
            }
            else {
              htmlString += `
            <td>CUT & POLISHED DIAMOND</td>     
            `
            }
            htmlString += `           
                    <td></td>
                    <td>1</td>
                    <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.weight) ?? "") + `</td>
                    <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit((obj.price.perCarat ?? 0) * (transaction.transactionDetail.toCurRate ?? 1)) + `</td>
                    <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigitRound((obj.price.netAmount ?? 0) * (transaction.transactionDetail.toCurRate ?? 1)) + `</td>
                    </tr>`
          }

          for (let index = transaction.packingList.length; index < 10; index++) {
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
                    </tr>`
          }
          htmlString += `
        <tr>
        <td colspan="3" style="text-align:right;">Total Taxable (`+ transaction.transactionDetail.toCurrency + `)</td>
        <td></td>
        <td></td>
        <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(totalWeight) + `</td>
        <td></td>
        <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigitRound(SumTotalAmtConverted) + `</td>
      </tr>`
        }
      }
      else {
        //Above 1 Carat Stones Format
        htmlString += `
      <tr>
      <td>1</td>
      <td></td>
      <td>0.50 CT ABOVE SIZE</td>                
      <td></td>
      <td>` + (aboveFiveCentTotalStone ?? "") + `</td>
      <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(aboveFiveCentTotalWeight) ?? "") + `</td>
      <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(((aboveFiveCentAmont * (transaction.transactionDetail.toCurRate ?? 0)) / aboveFiveCentTotalWeight ?? 0)) + `</td>
      <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigitRound(above1ctSumTotalAmtConverted) + `</td>
      </tr>  
      `

        htmlString += `
    <tr>         
    <td></td>     
    <td></td>  
    <td>CUT & POLISHED DIAMONDS</td>               
    <td></td>
    <td></td>
    <td></td>
    <td></td>
    <td></td>
    </tr>`

        htmlString += `
      <tr>         
      <td></td>     
      <td></td>  
      <td>AS PER PACKING LIST 1</td>               
      <td></td>
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
      <td></td>
      <td></td>
      </tr>`

        htmlString += `
        <tr>
        <td>2</td>
        <td></td>
        <td>0.50 CT BELOW SIZE</td>                
        <td></td>
        <td>` + (belowFiveCentTotalStone?? "") + `</td>
        <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(belowFiveCentTotalWeight) ?? "") + `</td>
        <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(((belowFiveCentTotalAmount * (transaction.transactionDetail.toCurRate ?? 0)) / belowFiveCentTotalWeight ?? 0)) + `</td>
        <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigitRound(belowFiveCentSumTotalAmtConverted) + `</td>
        </tr>  
        `

        htmlString += `
        <tr>         
        <td></td>     
        <td></td>  
        <td>CUT & POLISHED DIAMONDS</td>               
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        </tr>`

        htmlString += `
        <tr>         
        <td></td>     
        <td></td>  
        <td>AS PER PACKING LIST 2</td>               
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        </tr>`

        for (let index = 1; index < 5; index++) {
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
                    </tr>`
        }

        htmlString += `
        <tr>
        <td colspan="3" style="text-align:right;">Total Taxable (`+ transaction.transactionDetail.toCurrency + `)</td>
        <td></td>
        <td></td>
        <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(totalWeight) + `</td>
        <td></td>
        <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigitRound(SumTotalAmtConverted) + `</td>
      </tr>`
      }

      if (taxPerOne) {
        htmlString += `
                <tr>
                <td colspan="7" style="text-align:right; padding-right:10px;" >`+ taxNameOne + ` ( ` + taxPerOne + ` % ) </td>
                <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigitRound(tax1) + `</td>
                </tr>`
      }
      if (taxPerTwo) {
        htmlString += `
                <tr>
                <td colspan="7" style="text-align:right; padding-right:10px;" >`+ taxNameTwo + ` ( ` + taxPerTwo + ` % ) </td>
                <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigitRound(tax2) + `</td>
                </tr>`
      }

      htmlString += `                        
                </tbody>
                <tfoot>
                <tr>
                  <td colspan="3" style="text-align:right;">Grand Total (`+ transaction.transactionDetail.toCurrency + `)</td>
                  <td></td>
                  <td></td>
                  <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(totalWeight) + `</td>
                  <td></td>
                  <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigitRound(SumTotalAmtConvertedWithTax) + `</td>
                </tr>`

      htmlString += `               
                <tr>
                  <td colspan="3" style="text-align:right;">Amount in Words:</td>
                  <td colspan="4" class="text-start ps-1">` + this.utilityService.convertAmoutToWord(this.utilityService.ConvertToFloatWithDecimalTwoDigitRoundWithNum(SumTotalAmtConvertedWithTax), "INR") + `</td>
                </tr>
    
                </tfoot>
              </table>
            </div>
            <div class="body-fotter">
              <div class="body-top border-top-0 border-bottom-0 ps-1">
                <div class="bo-left w-50">                 
                  <table>
                    <tbody>
                      <tr>
                        <td style="width: 160px;"><b>BENEFICIARY BANK : </b></td>
                        <td>`+ (transaction.transactionDetail.bank.bankName ?? "") + `</td>
                      </tr>
                      <tr>
                        <td><b>ADDRESS :</b></td>
                        <td>`+ (transaction.transactionDetail.bank.address.line1 ? transaction.transactionDetail.bank.address.line1 + `,` : "") + (transaction.transactionDetail.bank.address.line2 ? transaction.transactionDetail.bank.address.line2 + `,` : "") + (transaction.transactionDetail.bank.address.city ? transaction.transactionDetail.bank.address.city + `,` : "")
        + (transaction.transactionDetail.bank.address.state ? transaction.transactionDetail.bank.address.state + `,` : "") + (transaction.transactionDetail.bank.address.country ? transaction.transactionDetail.bank.address.country + `,` : "") + (transaction.transactionDetail.bank.address.zipCode ?? "") + `</td>
                      </tr> 
                    </tbody>
                  </table>
                  </div>
                  <div class="bo-left w-50">  
                  <table>
                    <tbody> 
                      <tr>
                        <td><b>ACCOUNT NAME :</b></td>
                        <td>`+ (transaction.transactionDetail.bank.accountName ?? "") + `</td>
                      </tr>
                      <tr>
                        <td><b>A/C NO :</b></td>
                        <td>`+ (transaction.transactionDetail.bank.accountNo ?? "") + `</td>
                      </tr>
                      <tr>
                        <td><b>IFSC CODE :</b></td>
                        <td>`+ (transaction.transactionDetail.bank.ifsc ?? "") + `</td>
                      </tr>
                    </tbody>
                  </table>
                </div>  
              </div>    
          
              <div class="body-f-footer" style="border:2px solid">
              <span class="border-bottom-2">Terms of Service / Declaration</span>  
              <li>WE DON'T ACCEPT CHEQUE , PLEASE REMIT BY ELECTRONIC MODE ONLY.</li>
              <li>PLEASE MAKE IMMEDIATE PAYMENT FOR GST .</li>
              <li>SUBJECT TO MUMBAI JURISDICTION</li>
              <li>GOODS SOLD AND DELIVERED AT MUMBAI</li>
  
              <li>The Diamonds herein invoiced have been purchased from legitimate sources not involved in
              funding conflict , in compliance with United Nations resolutions and corresponding national
              laws.The Seller hereby guarantees that these diamonds are conflict free and confirms
              adherence to the WDC SoW Guidelines.</li>

              <li>To the best of our knowledge and/or written assurance from our suppliers, we state that
                "Diamonds herein Invoiced have not been obtained in violation of applicable National laws
                and/or sanctions by the U.S.Department of Treasury's office of Foreign Assets Control(OFAC)
                and have not originated from the Mbada and Marange Resources of Zimbabwe."</li>

              <li>The Diamonds herein invoiced are exclusively of natural origin and untreated based on personal
              knowledge and/or written guarantees provided by the supplier of these diamonds.
              The acceptance of goods herein invoiced will be as per WFDB guidelines.</li>

              <li>NOTIFICATION : E WAY BILL EXEMPTION UNDER NOTIFICATION NO 27/2017 - CENTRAL TAX
                  DATED 31/08/2017 FOR GOODS MENTIONED IN ANNEXURE UNDER SERIAL NO. 150 & 151
                  UNDER RULE NO.138(14) FOR GOODS SPECIFIED UNDER CHAPTER 71.</li>

              <li>I/Wehereby certify that my/our registration certificate under the Goods and Service Tax Act 2017, is in force on
                  the date on which the sales of the goods specified in this tax invoice is made by me/us and that the transaction
                  of sale covered by this tax invoice has been effected by me/us and it shall be accounted for in the turnover of
                  sales while filing of return and the due tax,if any,payble on the sale has been paid or shall be paid.</li>`
                 if (transaction.transactionDetail.additionalDeclaration) {
        htmlString += `      
                              <li>`+ (transaction.transactionDetail.additionalDeclaration ?? "") + `</li>
                              `
      }  
        htmlString += `   </div>

              <div class="body-f-mid">
                <div class="body-f-left">
                  <span class="c-st di"></span>
                  <div class="ch-sig">    
                  <span>&nbsp</span>
                  <span>&nbsp</span>
                  <span>&nbsp</span>     
                  <span>&nbsp</span>               
                  <span>(SIGNATURE OF THE RECEIVER)</span>
                  </div>
                </div>
                <div class="body-f-right">
                  <span class="c-st di">FOR `+ (transaction.transactionDetail.organization.name ?? "") + `</span>                  
                  <div class="ch-sig">      
                  <br>                   
                  `
      if (transaction.transactionDetail.organization.name == "GLOWSTAR") {
        htmlString += `<img width="100" src="assets/billimage/hardiksign.png">`
      }
      else if (transaction.transactionDetail.organization.name == "SarjuImpex") {
        htmlString += `<img width="100" src="assets/billimage/pravinbhaisign.png">`
      }
      htmlString += `
                  <span>Partner/Auth.Sign.</span>
                  </div>                                 
                </div>
              </div>   
            </div>
          </div>
        </div>`

      if (transaction.packingList.length > 10 || transaction.transactionDetail.isPackingList) {
        htmlString += `
        <div style="height: 100px;"></div>
          <div class="body-middle">

          <table>
          <tr>
          <td>Organization :<b> ` + (transaction.transactionDetail.organization.name ?? "") + `</b></td>
          <td>Invoice No : <b>` + (transaction.refNumber ?? "") + `</b></td>
          <td>Invoice Date : <b>` + this.utilityService.getISOtoStringDate(transaction.createdDate) + `</b></td>
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
              <th>ORIGIN</th>
              <th>RATE `+ transaction.transactionDetail.toCurrency + ` PER CT</th>
              <th>TOTAL AMOUNT `+ transaction.transactionDetail.toCurrency + `</th>
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
                    <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.weight) ?? "") + `</td>
                    <td>`+ obj.color + `</td>
                    <td>`+ obj.clarity + `</td>
                    <td>`+ obj.lab + `</td>
                    `
            if (transaction.transactionDetail.isWithCertiNo) {
              htmlString += `
                      <td>`+ obj.lab + ` ` + obj.certificateNo + `</td>
                              `
            }
            else {
              htmlString += `
                      <td></td>     
                      `
            }
            htmlString += `      
                    <td>`+ (obj.origin ?? "") + `</td>
                    <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit((obj.price.perCarat ?? 0) * (transaction.transactionDetail.toCurRate ?? 1)) + `</td>
                    <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigitRound((obj.price.netAmount ?? 0) * (transaction.transactionDetail.toCurRate ?? 1)) + `</td>
                    </tr>`
          }
        }

        htmlString += `
        <tr>
        <td colspan="10" style="text-align:right;">Total Taxable (`+ transaction.transactionDetail.toCurrency + `)</td>        
        <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigitRound(above1ctSumTotalAmtConverted) + `</td>
        </tr>`

        if (taxPerOne) {
          htmlString += `
                  <tr>
                  <td colspan="10" style="text-align:right; padding-right:10px;" >`+ taxNameOne + ` ( ` + taxPerOne + ` % ) </td>
                  <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigitRound(above1ctTax1) + `</td>
                  </tr>`
        }
        if (taxPerTwo) {
          htmlString += `
                  <tr>
                  <td colspan="10" style="text-align:right; padding-right:10px;" >`+ taxNameTwo + ` ( ` + taxPerTwo + ` % ) </td>
                  <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigitRound(above1ctTax2) + `</td>
                  </tr>`
        }

        htmlString += `
            </tbody>
            <tfoot>
                    <tr>
                      <td colspan="3">Grand Total</td>
                      <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(aboveFiveCentTotalWeight) + `</td>
                      <td colspan="6">&nbsp</td>                      
                      <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(totalValueTaxed1ctPlusStones) + `</td>
                    </tr>`
        htmlString += `</tfoot>
            </table>
            </div>`

        //Below one carat PackaginList Print
        htmlString += `
            <div style="height: 100px;"></div>
              <div class="body-middle" style="page-break-before: always;">
    
              <table>
              <tr>
              <td>Organization :<b> ` + (transaction.transactionDetail.organization.name ?? "") + `</b></td>
              <td>Invoice No : <b>` + (transaction.refNumber ?? "") + `</b></td>
              <td>Invoice Date : <b>` + this.utilityService.getISOtoStringDate(transaction.createdDate) + `</b></td>
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
                  <th>ORIGIN</th>
                  <th>RATE `+ transaction.transactionDetail.toCurrency + ` PER CT</th>
                  <th>TOTAL AMOUNT `+ transaction.transactionDetail.toCurrency + `</th>
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
                        <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.weight) ?? "") + `</td>
                        <td>`+ obj.color + `</td>
                        <td>`+ obj.clarity + `</td>
                        <td>`+ obj.lab + `</td>
                        `
            if (transaction.transactionDetail.isWithCertiNo) {
              htmlString += `
                          <td>`+ obj.lab + ` ` + obj.certificateNo + `</td>
                                  `
            }
            else {
              htmlString += `
                          <td></td>     
                          `
            }
            htmlString += `      
                        <td>`+ (obj.origin ?? "") + `</td>
                        <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit((obj.price.perCarat ?? 0) * (transaction.transactionDetail.toCurRate ?? 1)) + `</td>
                        <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigitRound((obj.price.netAmount ?? 0) * (transaction.transactionDetail.toCurRate ?? 1)) + `</td>
                        </tr>`
          }
        }

        htmlString += `
            <tr>
            <td colspan="10" style="text-align:right;">Total Taxable (`+ transaction.transactionDetail.toCurrency + `)</td>        
            <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigitRound(belowFiveCentSumTotalAmtConverted) + `</td>
            </tr>`

        if (taxPerOne) {
          htmlString += `
                      <tr>
                      <td colspan="10" style="text-align:right; padding-right:10px;" >`+ taxNameOne + ` ( ` + taxPerOne + ` % ) </td>
                      <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigitRound(below1ctTax1) + `</td>
                      </tr>`
        }
        if (taxPerTwo) {
          htmlString += `
                      <tr>
                      <td colspan="10" style="text-align:right; padding-right:10px;" >`+ taxNameTwo + ` ( ` + taxPerTwo + ` % ) </td>
                      <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigitRound(below1ctTax2) + `</td>
                      </tr>`
        }

        htmlString += `
                </tbody>
                <tfoot>
                        <tr>
                          <td colspan="3">Grand Total</td>
                          <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(belowFiveCentTotalWeight) + `</td>
                          <td colspan="6">&nbsp</td>                      
                          <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(totalValueTaxedBelow1ctPlusStones) + `</td>
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
    else if (invoiceType == "INDIALOCALDDA") {

      let SumTotalAmtConverted = (totalAmount ?? 0) * (transaction.transactionDetail.toCurRate ?? 1);
      let SumTotalAmtConvertedWithTax = 0;
      let tax1 = 0;
      let tax2 = 0;

      if (taxPerOne > 0)
        tax1 = this.utilityService.ConvertToFloatWithDecimal((taxPerOne * (SumTotalAmtConverted ?? 0)) / 100);

      if (taxPerTwo > 0)
        tax2 += this.utilityService.ConvertToFloatWithDecimal((taxPerTwo * (SumTotalAmtConverted ?? 0)) / 100);

      SumTotalAmtConvertedWithTax = SumTotalAmtConverted + tax1 + tax2;

      htmlString += `
  <body onload="window.print(); window.close();">      
  <p style="margin: 0;font-size: 14px;text-align: center;"><b>TAX INVOICE</b></p> 
  <div class="challan-new">
    <div class="challan-leftside">
      <div class="lefstside-subgrid">
        <div class="grid-1">
          <small>Exporter</small><span style="margin-left: 10px;"><b></b></span>
          `
      if (transaction.transactionDetail.organization.name == "GLOWSTAR") {
        htmlString += `<img src="assets/billimage/GlowstareG.png">`
      }
      else if (transaction.transactionDetail.organization.name == "SarjuImpex") {
        htmlString += `<img src="assets/billimage/SarjuS.png"/>`
      }
      htmlString += `
        </div>
        <div class="grid-1">
        <p><b>` + (transaction.transactionDetail.organization.name ?? "") + `</b></p>
        <p>` + (transaction.transactionDetail.organization.address?.line1 ?? "") + `,` + (transaction.transactionDetail.organization.address?.line2 ?? "") + `<br>
        ` + (transaction.transactionDetail.organization.address?.city ?? "") + `,` + (transaction.transactionDetail.organization.address?.state ?? "") + `,` + (transaction.transactionDetail.organization.address?.country ?? "") + `</p>          
          <p>Tele No.` + (transaction.transactionDetail.organization.phoneNo ?? "") + `,` + (transaction.transactionDetail.organization.mobileNo ?? "") + `</p>
          <p>Email.` + (transaction.transactionDetail.organization.email ?? "") + `</p> 
        </div>
      </div> 

        <div class="lefstside-subgrid border-top-2" style="height:210px;">
        <div class="grid-1">
        `
      if (transaction.transactionDetail.consigneeName) {
        htmlString += `
        <p>Consignee</p>     
          <p><b>` + (transaction.transactionDetail.consigneeName ?? "") + `</b></p>          
          <p> ` + (transaction.transactionDetail.consigneeAddress ?? "") + `</p>
          `
      }
      else {
        htmlString += `
            <p>Consignee</p>     
              <p><b>*** Direct Parcel ***</b></p> 
              `
      }
      htmlString += `
        </div>
      </div>
      <div class="box-two border-top-2">
        <div class="box-1 p-1 border-right-2 border-bottom-2">
          <small>Pre-Carriage by</small>
          <p>` + (transaction.transactionDetail.logistic.name ?? "") + `</p>
        </div>
        <div class="box-1 p-1 border-bottom-2">
          <small>Place of Receipt by Pre-carrier</small>
          <p>N.A.</p>
        </div>
        <div class="box-1 p-1 border-right-2 border-bottom-2">
          <small>Vessel/Flight No</small>
          <p>AIR FREIGHT</p>
        </div>
        <div class="box-1 p-1 border-bottom-2">
          <small>Port of Loading</small>
          <p>` + (transaction.transactionDetail.portOfLoading ?? "") + `</p>
        </div>
        <div class="box-1 p-1 border-right-2">
          <small>Port of Discharge</small>
          <p>` + (transaction.toLedger.address?.city ?? "") + `</p>
        </div>
        <div class="box-1 p-1">
          <small>Final Destination</small>
          <p>` + (transaction.toLedger.address?.country ?? "") + `</p>
        </div>
      </div>
    </div>

    <div class="challan-rightside">
    <div class="box-two">
    <div class="box-1 p-1 border-bottom-2 border-right-2">
      <small>Invoice.No.& Date</small><span style="margin-left: 10px;">` + this.utilityService.getISOtoStringDate(transaction.createdDate) + `</span>
      <p>` + transaction.refNumber + `</p>
    </div>
    <div class="box-1 p-1 border-bottom-2">
      <small>Exporter's Ref</small>
      <p><b>IEC No :</b> ` + (transaction.transactionDetail.organization.iecNo ?? "") + `</p>
    </div>
    </div>

    <div class="box-full p-1 border-bottom-2" style="padding-bottom: 21px;">
      <small>Buyer's Order no. & Date</small>
    </div>

    <div class="box-full p-1 border-bottom-2">
      <small>Other Reference (s)</small><span style="margin-left: 25px;"><b>GST No : ` + (transaction.transactionDetail.organization.gstNo ?? "") + `</b></span>         
    </div>

    <div class="box-full p-1 border-bottom-2">      
      <span><b>OUR STATE : ` + (transaction.transactionDetail.organization.address.state ?? "") + `   CODE : ` + (transaction.transactionDetail.organization.address.stateCode ?? "") + `</b></span>
    </div>

      <div class="box-full p-1">
        <small>Buyer (If other than consignee)</small>
        <p><b>` + (transaction.toLedger.name ?? "") + `</b></p>
        <p>` + (transaction.toLedger.address.line1 ?? "") + `,` + (transaction.toLedger.address.line2 ?? "") + `, <br>
        ` + (transaction.toLedger.address.city ?? "") + `,` + (transaction.toLedger.address.state ?? "") + `,` + (transaction.toLedger.address.country) + `,
        ZipCode : ` + (transaction.toLedger.address.zipCode ?? "") + `
        </p>
        <p>TEL: ` + (transaction.toLedger.mobileNo ?? "") + `, FAX : ` + (transaction.toLedger.faxNo ?? "") + `</p>
      </div>

      <div class="box-two border-top-2">
        <div class="box-1 p-1 border-right-2 border-bottom-2">
          <small>Country of Origin of Goods</small>
          <p>` + (transaction.transactionDetail.organization.address?.country ?? "") + `</p>
        </div>
        <div class="box-1 p-1 border-bottom-2">
          <small>Country of Final Destination</small>
          <p>` + (transaction.toLedger.address.country ?? "") + `</p>
        </div>
      </div>

      <div class="box-full p-1">
        <small>Terms of Delivery and Payment : ` + (transaction.transactionDetail.terms ?? "") + `</small>           
        <p><b>OUR BANKERS : `+ (transaction.transactionDetail.bank.bankName ?? "") + `</b></p>        
        <p><small>` + (transaction.transactionDetail.bank.address?.line1 ?? "") + `,` + (transaction.transactionDetail.bank.address?.line2 ?? "") + `,
        ` + (transaction.transactionDetail.bank.address?.city ?? "") + `,` + (transaction.transactionDetail.bank.address?.state ?? "") + `,` + (transaction.transactionDetail.bank.address?.country ?? "") + `</small></p>
        <p>A/C Name: `+ (transaction.transactionDetail.bank.accountName ?? "") + `</p>
        <p>A/C No: `+ (transaction.transactionDetail.bank.accountNo ?? "") + `  SWIFT Code: ` + (transaction.transactionDetail.bank.swift ?? "") + `</p>         
        <p><b>AD CODE: `+ (transaction.transactionDetail.bank.adCode ?? "") + `</b></p>
      </div>
  </div>
  </div>`

      if (transaction.packingList.length > 0) {
        htmlString += `
  <div class="record">
    <table>
      <tbody>

      <tr>
      <td colspan="1">Container No.  </td>
      <td colspan="1">No. & Kind of Pkgs.</td>
      <td colspan="3">Description of Goods</td>
      <td colspan="1"><b>HSN CODE : 71023910</b></td>
      <td colspan="4"></td>
      </tr>

      <tr>
      <td colspan="1"></td>
      <td colspan="1"><b>TWO</b></td>
      <td colspan="3"><b>DIAMONDS , CUT & POLISHED IN INDIA</b></td>
      <td colspan="1"></td>
      <td colspan="4"></td>
      </tr>

        <tr>       
          <th>Marks & Nos.</th>            
          <th>ADD.PARCEL</th>          
          <th>Measurment</th>
          <th>Cert.No.</th>
          <th>Pcs</th>
          <th>Quantity/Crts</th>
          <th>Rate ` + (transaction.transactionDetail.fromCurrency ?? "") + `  $</th>
          <th>Amount `+ (transaction.transactionDetail.fromCurrency ?? "") + ` $</th>
        </tr>
        `

        htmlString += `            
            <tr style="height:30px;">
            <td>1</td>   
            <td colspan="3">0.50 CT ABOVE SIZE & AS PER PACKING LIST 1</td>           
            <td>`+ aboveFiveCentTotalStone + `</td>                  
            <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit((aboveFiveCentTotalWeight ?? "")) + `</td>
            <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit((aboveTotalPerCarat ?? 0)) + `</td>
            <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(aboveFiveCentAmont) ?? "") + `</td>
            </tr>`

        htmlString += `            
            <tr style="height:30px;">
            <td>2</td>   
            <td colspan="3">0.50 CT BELOW SIZE & AS PER PACKING LIST 2</td>           
            <td>`+ belowFiveCentTotalStone + `</td>                  
            <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit((belowFiveCentTotalWeight ?? "")) + `</td>
            <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit((belowTotalPerCarat ?? 0)) + `</td>
            <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(belowFiveCentTotalAmount) ?? "") + `</td>
            </tr>`

        htmlString += ` 
            <tr>
              <th colspan="3">CONVERSION RATE : `+ (transaction.transactionDetail.fromCurRate ?? "") + ` ` + (transaction.transactionDetail.fromCurrency ?? "") + ` = ` + (transaction.transactionDetail.toCurRate ?? "") + ` ` + (transaction.transactionDetail.toCurrency ?? "") + `</th>  
              <th>Total</th>
              <th>CRTS</th>
              <th>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(totalWeight) + `</th>
              <th>` + (transaction.transactionDetail.exportType ?? "") + ` ` + (transaction.transactionDetail.fromCurrency ?? "") + ` $</th>
              <th>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(totalAmount) + `</th>
            </tr>   `

        htmlString += ` 
                <tr>               
                <th colspan="7" style="text-align:right">Amount ` + (transaction.transactionDetail.toCurrency ?? "") + `</th>     
                <th>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(SumTotalAmtConverted) + `</th>
                </tr>  

                <tr>                
                <th colspan="7" style="text-align:right">` + taxNameOne + ` (` + taxPerOne + ` %) ` + (transaction.transactionDetail.toCurrency ?? "") + `</th>     
                <th>`+ tax1.toFixed(0) + `</th>
                </tr>  

                <tr>                
                <th colspan="7" style="text-align:right">` + taxNameTwo + ` (` + taxPerTwo + ` %) ` + (transaction.transactionDetail.toCurrency ?? "") + `</th>         
                <th>`+ tax2.toFixed(0) + `</th>
                </tr>  

                <tr>               
                <th colspan="7" style="text-align:right">Total Amount ` + (transaction.transactionDetail.toCurrency ?? "") + `</th>     
                <th>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(SumTotalAmtConvertedWithTax) + `</th>
                </tr>
                
          </tbody>
        </table>
      </div>`
      }


      htmlString += ` 
        <div class="chargable">
        <div class="details p-1">

          <p>I/Wehereby certify that my/our registration certificate under the Goods and Service Tax Act 2017, is in force on the date on which
          the sales of the goods specified in this tax invoice is made by me/us and that the transaction of sale covered by this tax invoice
          has been effected by me/us and it shall be accounted for in the turnover of sales while filing of return and the due tax,if
          any,payble on the sale has been paid or shall be paid.</p>

          <p>To the best of our knowledge and/or written assurance from our suppliers, we state that "Diamonds herein Invoiced have not been obtained in violation
          of applicable National laws and/or sanctions by the U.S.Department of Treasury's office of Foreign Assets Control(OFAC) and have not originated from
          the Mbada and Marange Resources of Zimbabwe.</p>

          <p>The Diamonds herein invoiced are exclusively of natural origin and untreated based on personal knowledge and/or written guarantees provided by the
          supplier of these diamonds.The acceptance of goods herein invoiced will be as per WFDB guidelines.</p>

          <p>NOTIFICATION : E WAY BILL EXEMPTION UNDER NOTIFICATION NO 27/2017 - CENTRAL TAX DATED 31/08/2017 FOR GOODS MENTIONED IN ANNEXURE UNDER
          SERIAL NO. 150 & 151 UNDER RULE NO.138(14) FOR GOODS SPECIFIED UNDER CHAPTER 71.</p>          

          <p><b>PLEASE MAKE IMMEDIATE PAYMENT FOR TAX . WE DON'T ACCEPT CHEQUE , PLEASE REMIT BY ELECTRONIC MODE ONLY.</b></p>

        </div>  

        <div class="inv-details">
        <p>

        <small style="margin-left: 10px;">Amount Chargeable(In Words)@:</small>

        <b style="margin-right: 20px;">` + (this.utilityService.ConvertToFloatWithDecimalTwoDigit(transaction.transactionDetail.toCurRate ?? 0) ?? "") + `</b>

        <b>Taxable ` + (transaction.transactionDetail.toCurrency ?? "") + `. : ` + this.utilityService.ConvertToFloatWithDecimalTwoDigit(SumTotalAmtConverted ?? 0) + `</b>
        
        <span><b>` + (transaction.transactionDetail.exportType ?? "") + `  ` + (transaction.transactionDetail.fromCurrency ?? "") + ` $ Total</b>
        <b>` + this.utilityService.ConvertToFloatWithDecimalTwoDigit(totalAmount) + `</b>
        </span>

        </p>    
        
        <p class="inv-p" style="font-size: 16px;">
        Total ` + (transaction.transactionDetail.exportType ?? "") + `  ` + (transaction.transactionDetail.fromCurrency ?? "") + ` $   
        ` + this.utilityService.convertAmoutToWord(this.utilityService.ConvertToFloatWithDecimalTwoDigitRoundWithNum(totalAmount), "USD") + `</p>
        <p style="height:4px;">&nbsp</p>
        <p class="inv-p">"The Diamonds herein invoiced have been purchased from legitimate sources not involved in funding
          conflict , in compliance with United Nations resolutions and corresponding national laws .</p>
        <p class="inv-p">The Seller hereby guarantees that these diamonds are conflict free and confirms adherence to the
          WDC SoW Guidelines."</p>        
        <p class="inv-p">The acceptance of goods herein invoiced will be as per WFDB guidelines.</p>        
        <p style="margin-left: 10px;"><b>PAYMENT INSTRUCTION :</b>BENEFICIARY : `+ (transaction.transactionDetail.bank.accountName ?? "") + `</p>
        <p style="margin-left: 10px;">OUR BANK : ` + (transaction.transactionDetail.bank.address?.line1 ?? "") + `,` + (transaction.transactionDetail.bank.address?.line2 ?? "") + `,
        ` + (transaction.transactionDetail.bank.address?.city ?? "") + `,` + (transaction.transactionDetail.bank.address?.state ?? "") + `,` + (transaction.transactionDetail.bank.address?.country ?? "") + `</p>
        <p style="margin-left: 10px;">A/C NO. `+ (transaction.transactionDetail.bank.accountNo ?? "") + `, SWIFT CODE : ` + (transaction.transactionDetail.bank.swift ?? "") + `</p>
        <p style="margin-left: 10px;">INTERMEDIARY BANK : `+ (transaction.transactionDetail.bank.intermediaryBankName ?? "") + ` ,SWIFT CODE: ` + (transaction.transactionDetail.bank.intermediaryBankswift ?? "") + `</p>        
        <p style="margin-left: 10px;margin-top: 15px;""><b>STATE OF ORIGIN : `+ (transaction.transactionDetail.organization.address.stateCode ?? "") + `, DISTRICT OF ORIGIN : ` + (transaction.transactionDetail.organization.address.districtCode ?? "") + `</b></p>
        <p style="margin-left: 10px;margin-top: 15px;""><b>SUBJECT TO MUMBAI JURISDICTION</b></p>
        <p style="margin-left: 10px;margin-top: 15px;""><b>GOODS SOLD AND DELIVERED AT MUMBAI (HAND DELIVERY)</b></p>
        </div>
        `;

      htmlString += `
    <div class="inv-details" style="page-break-after: always;">
      <div class="sign-div">
        <div class="grid-1 p-1"> 
          <p>
          <h5>On Confirmed outright sale basis</h5>
          </p>
          <p>Declaration :
          <h5>PAN : ` + (transaction.transactionDetail.organization.incomeTaxNo ?? "") + `</h5>
          </p>
          <p><small>We declare that this Invoice shows the actual price of the goods described and that all particulars
              are true and correct.</small></p>
              <p><b>IRN No </b>: ` + (transaction.transactionDetail.irnNo ?? "") + `</p>
        </div>
        <div class="grid-2">
          <p>Signature & Date<br>` + this.utilityService.getISOtoStringDate(transaction.createdDate) + `</p>
          <p><b>For ` + (transaction.transactionDetail.organization.name ?? "") + `<br>Partner/Auth.Sign.</b></p>
        </div>
      </div>   
    </div>
  </div>
</body>`

      if (transaction.transactionDetail.isPackingList) {
        //Above 1 Carat Packing List
        htmlString += `
          <div class="body-middle">

          <table>
          <tr>
          <td>Organization :<b> ` + (transaction.transactionDetail.organization.name ?? "") + `</b></td>
          <td>Invoice No : <b>` + (transaction.refNumber ?? "") + `</b></td>
          <td>Invoice Date : <b>` + this.utilityService.getISOtoStringDate(transaction.createdDate) + `</b></td>
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
              <th>ORIGIN</th>
              <th>REPORT NO</th>      
              <th>RAPAPORT</th>     
              <th>PRICE `+ (transaction.transactionDetail.fromCurrency ?? "") + ` /PER CT</th>
              <th>NET AMT `+ (transaction.transactionDetail.fromCurrency ?? "") + `</th>
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
                    <td>`+ (obj.origin ?? "") + `</td>
                    <td>`+ (obj.certificateNo ?? "") + `</td>
                    <td>`+ (obj.price.rap ?? "") + `</td>
                    <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.perCarat ?? 0) ?? "") + `</td>
                    <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.netAmount ?? 0) ?? "") + `</td>
                    </tr>`
          }
        }

        htmlString += `
            </tbody>
            <tfoot>
                    <tr>
                      <td colspan="3"><b>Grand Total</b></td>
                      <td><b>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(aboveFiveCentTotalWeight ?? 0) + `</b></td>
                      <td colspan="7">&nbsp</td>                      
                      <td><b>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(aboveFiveCentAmont ?? 0) + `</b></td>
                    </tr>  
            </tfoot>
            </table>
            </div>`

        //Below 1 Carat Packing Lsit    
        htmlString += `
          <div class="body-middle" style="page-break-before: always;">

          <table>
          <tr>
          <td>Organization :<b> ` + (transaction.transactionDetail.organization.name ?? "") + `</b></td>
          <td>Invoice No : <b>` + (transaction.refNumber ?? "") + `</b></td>
          <td>Invoice Date : <b>` + this.utilityService.getISOtoStringDate(transaction.createdDate) + `</b></td>
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
              <th>ORIGIN</th>
              <th>REPORT NO</th>      
              <th>RAPAPORT</th>     
              <th>PRICE `+ (transaction.transactionDetail.fromCurrency ?? "") + ` /PER CT</th>
              <th>NET AMT `+ (transaction.transactionDetail.fromCurrency ?? "") + `</th>
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
                    <td>`+ (obj.origin ?? "") + `</td>
                    <td>`+ (obj.certificateNo ?? "") + `</td>
                    <td>`+ (obj.price.rap ?? "") + `</td>
                    <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.perCarat ?? 0) ?? "") + `</td>
                    <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.netAmount ?? 0) ?? "") + `</td>
                    </tr>`
          }
        }

        htmlString += `
            </tbody>
            <tfoot>
                    <tr>
                      <td colspan="3"><b>Grand Total</b></td>
                      <td><b>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(belowFiveCentTotalWeight ?? 0) + `</b></td>
                      <td colspan="7">&nbsp</td>                      
                      <td><b>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(belowFiveCentTotalAmount ?? 0) + `</b></td>
                    </tr>  
            </tfoot>
            </table>
            </div>`
      }

      htmlString += `
        </body>
        </html>
        `;
    }
    else if (invoiceType == "INDIAOVERSEAS") {

      let SumTotalAmtConverted = (totalAmount ?? 0) * (transaction.transactionDetail.toCurRate ?? 1);
      let tax1 = 0;
      let tax2 = 0;

      if (taxPerOne > 0)
        tax1 = this.utilityService.ConvertToFloatWithDecimal((taxPerOne * (SumTotalAmtConverted ?? 0)) / 100);

      if (taxPerTwo > 0)
        tax2 += this.utilityService.ConvertToFloatWithDecimal((taxPerTwo * (SumTotalAmtConverted ?? 0)) / 100);

      var firstPageCount: number = 22;
      var midPageCount: number = 41;
      var lastPageCount: number = 22;
      var totalPageCount: number;
      var skip: number = 0;

      var numOfStone = transaction.packingList.length;
      var withoutFirstAndLast = numOfStone - firstPageCount - lastPageCount;
      var pageCount = withoutFirstAndLast / midPageCount;
      pageCount = pageCount + 2;//+2 For First and Last Page.

      const roundedPageCount = Math.floor(pageCount);
      totalPageCount = roundedPageCount < pageCount ? roundedPageCount + 1 : roundedPageCount;

      if (transaction.packingList.length > 7 && totalPageCount == 1)
        totalPageCount = 2
      if (transaction.transactionDetail.isPackingList)
        totalPageCount = 1

      var lastpagedeclaration: boolean = false;

      for (let index = 1; index <= totalPageCount; index++) {

        if (lastpagedeclaration == true)
          break

        htmlString += `        
  <body onload="window.print(); window.close();">      
  <p style="margin: 0;font-size: 14px;text-align: center;"><b>INVOICE</b></p>  

  <div class="challan-new">
    <div class="challan-leftside">
      <div class="lefstside-subgrid">
        <div class="grid-1">
          <small>Exporter</small><span style="margin-left: 10px;"><b></b></span>
          `
        if (transaction.transactionDetail.organization.name == "GLOWSTAR") {
          htmlString += `<img src="assets/billimage/GlowstareG.png">`
        }
        else if (transaction.transactionDetail.organization.name == "SarjuImpex") {
          htmlString += `<img src="assets/billimage/SarjuS.png"/>`
        }
        htmlString += `

        </div>
        <div class="grid-1">
        <p><b>` + (transaction.transactionDetail.organization.name ?? "") + `</b></p>
        <p>` + (transaction.transactionDetail.organization.address?.line1 ?? "") + `,` + (transaction.transactionDetail.organization.address?.line2 ?? "") + `<br>
        ` + (transaction.transactionDetail.organization.address?.city ?? "") + `,` + (transaction.transactionDetail.organization.address?.state ?? "") + `,` + (transaction.transactionDetail.organization.address?.country ?? "") + `</p>          
          <p>Tele No.` + (transaction.transactionDetail.organization.phoneNo ?? "") + `,` + (transaction.transactionDetail.organization.mobileNo ?? "") + `</p>
          <p>Email.` + (transaction.transactionDetail.organization.email ?? "") + `</p> 
        </div>
      </div>
      `
        if (index == 1)//First Page 
        {
          htmlString += `
        <div class="lefstside-subgrid border-top-2" style="height:254px;">
        <div class="grid-1">
        `
          if (transaction.transactionDetail.consigneeName) {
            htmlString += `
        <p>Consignee</p>     
          <p><b>` + (transaction.transactionDetail.consigneeName ?? "") + `</b></p>          
          <p> ` + (transaction.transactionDetail.consigneeAddress ?? "") + `</p>
          `
          }
          else {
            htmlString += `
            <p>Consignee</p>     
              <p><b>*** Direct Parcel ***</b></p> 
              `
          }
          htmlString += `
        </div>
      </div>
      <div class="box-two border-top-2">
        <div class="box-1 p-1 border-right-2 border-bottom-2">
          <small>Pre-Carriage by</small>
          <p>` + (transaction.transactionDetail.logistic.name ?? "") + `</p>
        </div>
        <div class="box-1 p-1 border-bottom-2">
          <small>Place of Receipt by Pre-carrier</small>
          <p>N.A.</p>
        </div>
        <div class="box-1 p-1 border-right-2 border-bottom-2">
          <small>Vessel/Flight No</small>
          <p>AIR FREIGHT</p>
        </div>
        <div class="box-1 p-1 border-bottom-2">
          <small>Port of Loading</small>
          <p>` + (transaction.transactionDetail.portOfLoading ?? "") + `</p>
        </div>
        <div class="box-1 p-1 border-right-2">
          <small>Port of Discharge</small>
          <p>` + (transaction.toLedger.address?.city ?? "") + `</p>
        </div>
        <div class="box-1 p-1">
          <small>Final Destination</small>
          <p>` + (transaction.toLedger.address?.country ?? "") + `</p>
        </div>
      </div>`
        }
        htmlString += ` 
    </div>

    <div class="challan-rightside">
    <div class="box-two">
    <div class="box-1 p-1 border-bottom-2 border-right-2">
      <small>Invoice.No.& Date</small><span style="margin-left: 10px;">` + this.utilityService.getISOtoStringDate(transaction.createdDate) + `</span>
      <p>` + transaction.refNumber + `</p>
    </div>
    <div class="box-1 p-1 border-bottom-2">
      <small>Exporter's Ref</small>
      <p><b>IEC No :</b> ` + (transaction.transactionDetail.organization.iecNo ?? "") + `</p>
    </div>
    </div>

    <div class="box-full p-1 border-bottom-2" style="padding-bottom: 10px;">
      <small>Buyer's Order no. & Date</small>
    </div>

    <div class="box-full p-1 border-bottom-2">
      <small>Other Reference (s)</small><span style="margin-left: 25px;"><b>GST No : ` + (transaction.transactionDetail.organization.gstNo ?? "") + `</b></span>   
    </div>`
        if (index == 1)//First Page 
        {
          htmlString += `      
      <div class="box-full p-1">
        <small>Buyer (If other than consignee)</small>
        <p><b>` + (transaction.toLedger.name ?? "") + `</b></p>
        <p>` + (transaction.toLedger.address.line1 ?? "") + `,` + (transaction.toLedger.address.line2 ?? "") + `, <br>
        ` + (transaction.toLedger.address.city ?? "") + `,` + (transaction.toLedger.address.state ?? "") + `,` + (transaction.toLedger.address.country) + `,
        ZipCode : ` + (transaction.toLedger.address.zipCode ?? "") + `
        </p>
        <p>TEL: ` + (transaction.toLedger.mobileNo ?? "") + `, FAX : ` + (transaction.toLedger.faxNo ?? "") + `</p>
      </div>

      <div class="box-two border-top-2">
        <div class="box-1 p-1 border-right-2 border-bottom-2">
          <small>Country of Origin of Goods</small>
          <p>` + (transaction.transactionDetail.organization.address?.country ?? "") + `</p>
        </div>
        <div class="box-1 p-1 border-bottom-2">
          <small>Country of Final Destination</small>
          <p>` + (transaction.toLedger.address.country ?? "") + `</p>
        </div>
      </div>

      <div class="box-full p-1">
        <small>Terms of Delivery and Payment</small>
        <p>` + (transaction.transactionDetail.terms ?? "") + `</p>
        <br>
        
        `
          if (isIGST == true) {
            htmlString += `  
            <p>Supply Meant for Export With payment of IGST.</p>        
        `
          }
          else {
            htmlString += `  
            <p>Supply Meant for Export Under Bond or Letter of Undertaking without payment of IGST.</p>
        `
          }

          htmlString += `  
        <p><b>OUR BANKERS :</b></p>
        <p><b>`+ (transaction.transactionDetail.bank.bankName ?? "") + `</b></p>
        <p><small>` + (transaction.transactionDetail.bank.address?.line1 ?? "") + `,` + (transaction.transactionDetail.bank.address?.line2 ?? "") + `,
        ` + (transaction.transactionDetail.bank.address?.city ?? "") + `,` + (transaction.transactionDetail.bank.address?.state ?? "") + `,` + (transaction.transactionDetail.bank.address?.country ?? "") + `</small></p>
        <p>A/C Name: `+ (transaction.transactionDetail.bank.accountName ?? "") + `</p>
        <p>A/C No: `+ (transaction.transactionDetail.bank.accountNo ?? "") + `</p>
        <p>SWIFT Code: `+ (transaction.transactionDetail.bank.swift ?? "") + `</p>        
        <p><b>AD CODE: `+ (transaction.transactionDetail.bank.adCode ?? "") + `</b></p>
      </div>`
        }
        htmlString += `
  </div>
  </div>`
        var thispagecount = 0
        if (index == 1)
          thispagecount = firstPageCount;
        else if (index == totalPageCount)
          thispagecount = lastPageCount;
        else
          thispagecount = midPageCount;

        let filterInventoryItems = transaction.packingList.slice(skip, skip + thispagecount);

        if (filterInventoryItems.length > 0) {
          htmlString += `
  <div class="record">
    <table>
      <tbody>

      <tr>
      <td colspan="1">Container No.  </td>
      <td colspan="1">No. & Kind of Pkgs.</td>
      <td colspan="3">Description of Goods</td>
      <td colspan="1"><b>HSN CODE : 71023910</b></td>
      <td colspan="4"></td>
      </tr>

      <tr>
      <td colspan="1"></td>
      <td colspan="1"><b>TWO</b></td>
      <td colspan="3"><b>DIAMONDS , CUT & POLISHED IN INDIA</b></td>
      <td colspan="1"></td>
      <td colspan="4"></td>
      </tr>

        <tr>       
          <th>Marks & Nos.</th>            
          <th>ADD.PARCEL</th>          
          <th>Measurment</th>
          <th>Cert.No.</th>
          <th>Pcs</th>
          <th>Quantity/Crts</th>
          <th>Rate ` + (transaction.transactionDetail.fromCurrency ?? "") + `  $</th>
          <th>Amount `+ (transaction.transactionDetail.fromCurrency ?? "") + ` $</th>
        </tr>
        `

          var totweight: number = 0;
          var totnetAmount: number = 0

          if (!transaction.transactionDetail.isPackingList) {

            for (let indexS = 0; indexS <= filterInventoryItems.length; indexS++) {
              let obj = filterInventoryItems[indexS];

              if (obj) {
                htmlString += `            
                  <tr>
                  <td>`+ (indexS + 1 + skip) + `</td>                  
                  <td>`+ (this.getDisplayNameFromMasterDNorm(obj.shape.trim()) ?? "") + `-` + (obj.color ?? "") + `-` + (obj.clarity ?? "") + `</td>
                  <td>&nbsp</td>
                  <td>` + (obj.lab ?? "") + ` ` + (obj.certificateNo ?? "") + `</td>
                  <td>Pcs 1</td>                  
                  <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit((obj.weight ?? "")) + `</td>
                  <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.perCarat ?? 0) ?? "") + `</td>
                  <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.netAmount ?? 0) ?? "") + `</td>
                  </tr>`
              }
            }
            skip = skip + thispagecount;
            filterInventoryItems.forEach(z => { totweight += z.weight });
            filterInventoryItems.forEach(z => { totnetAmount += z.price.netAmount ?? 0 });

            var data = 0//Add Extra Lines In Page.
            if (index == 1 && filterInventoryItems.length > 7)
              data = firstPageCount;
            if (index != 1 && filterInventoryItems.length > 15)
              data = midPageCount;
            if (index != 1 && index == totalPageCount && lastpagedeclaration == false) {
              data = lastPageCount;
            }

            if (filterInventoryItems.length > 1) {
              for (let index = filterInventoryItems.length; index < data; index++) {
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
              </tr>`
              }
            }
            htmlString += ` 
            <tr>
              <th colspan="3">Gross Weight: ` + transaction.transactionDetail.boxWeight + ` Kgs.</th>  
              <th>Page Total</th>
              <th>CRTS</th>
              <th>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(totweight) + `</th>
              <th>` + (transaction.transactionDetail.exportType ?? "") + ` ` + (transaction.transactionDetail.fromCurrency ?? "") + ` $</th>
              <th>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(totnetAmount) + `</th>
            </tr>  
            <tr>
            <th colspan="3"></th>  
            <th>Grand Total</th>
            <th>CRTS</th>
            <th>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(totalWeight) + `</th>
            <th>` + (transaction.transactionDetail.exportType ?? "") + ` ` + (transaction.transactionDetail.fromCurrency ?? "") + ` $</th>
            <th>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(totalAmount) + `</th>
          </tr>       
          </tbody>
        </table>
      </div>`
          }

          else if (transaction.transactionDetail.isPackingList) {
            htmlString += `            
            <tr style="height:50px;">
            <td>1</td>   
            <td colspan="3">0.50 CT ABOVE SIZE & AS PER PACKING LIST 1</td>           
            <td>`+ aboveFiveCentTotalStone + `</td>                  
            <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit((aboveFiveCentTotalWeight ?? "")) + `</td>
            <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit((aboveTotalPerCarat ?? 0)) + `</td>
            <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(aboveFiveCentAmont ?? 0) ?? "") + `</td>
            </tr>`
            htmlString += `            
            <tr style="height:50px;">
            <td>2</td>   
            <td colspan="3">0.50 CT BELOW SIZE & AS PER PACKING LIST 2</td>           
            <td>`+ belowFiveCentTotalStone + `</td>                  
            <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit((belowFiveCentTotalWeight ?? "")) + `</td>
            <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit((belowTotalPerCarat ?? 0)) + `</td>
            <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(belowFiveCentTotalAmount ?? 0) ?? "") + `</td>
            </tr>`

            htmlString += ` 
            <tr>
              <th colspan="3">Gross Weight: ` + (transaction.transactionDetail.boxWeight ?? "") + ` Kgs.</th>  
              <th>Total</th>
              <th>CRTS</th>
              <th>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(totalWeight) + `</th>
              <th>` + (transaction.transactionDetail.exportType ?? "") + ` ` + (transaction.transactionDetail.fromCurrency ?? "") + ` $</th>
              <th>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(totalPayableAmount) + `</th>
            </tr>        
          </tbody>
        </table>
      </div>`
          }
        }

        htmlString += ` 
        <div class="chargable">`
        if (
          (index == totalPageCount)
          ||
          (index != 1 && index != 2 && index == totalPageCount - 1 && filterInventoryItems.length < 15)
          ||
          (index == 2 && totalPageCount == 2 && transaction.packingList.length < 6)
          && lastpagedeclaration == false
        )//Last Page Declaration
        {
          lastpagedeclaration = true;

          if (transaction.transactionDetail.shippingCharge) {
            if (transaction.transactionDetail.exportType == "CIF") {
              htmlString += `
        <div style="overflow:hidden">
        <p><span style="text-align:right"><b>Add Freight & Insurance :` + transaction.transactionDetail.shippingCharge + `</b></span></p> 
        </div>                 
        `
            }
            else if (transaction.transactionDetail.exportType == "CFR") {
              htmlString += `
              <div style="overflow:hidden">
              <p><span style="text-align:right"><b>Add Freight :` + transaction.transactionDetail.shippingCharge + `</b></span></p> 
              </div>                 
              `
            }
          }

          htmlString += `
        <div class="inv-details">
        <p>
        <small style="margin-left: 10px;">Amount Chargeable(In Words)@:</small>

        <b style="margin-right: 20px;">` + (this.utilityService.ConvertToFloatWithDecimalTwoDigit(transaction.transactionDetail.toCurRate ?? 0) ?? "") + `</b>

        <b>Taxable ` + (transaction.transactionDetail.toCurrency ?? "") + `. : ` + this.utilityService.ConvertToFloatWithDecimalTwoDigit(convertTotalPayableAmount ?? 0) + `</b>
        `
          if (isIGST == true)
            htmlString += `
            &nbsp&nbsp&nbsp&nbsp&nbsp&nbsp<b>` + taxNameOne + ` @: ` + taxPerOne + `  ` + (transaction.transactionDetail.toCurrency ?? "") + ` : ` + this.utilityService.ConvertToFloatWithDecimalTwoDigit(tax1 ?? 0) + `</b>
        `
          htmlString += `
        <span><b>` + (transaction.transactionDetail.exportType ?? "") + `  ` + (transaction.transactionDetail.fromCurrency ?? "") + ` $ Total</b>
        <b>` + this.utilityService.ConvertToFloatWithDecimalTwoDigit(totalPayableAmount) + `</b>
        </span>
        </p>    
        
        <p class="inv-p" style="font-size: 16px;">
        Total ` + (transaction.transactionDetail.exportType ?? "") + `  ` + (transaction.transactionDetail.fromCurrency ?? "") + ` $   
        ` + this.utilityService.convertAmoutToWord(this.utilityService.ConvertToFloatWithDecimalTwoDigitRoundWithNum(totalPayableAmount), "USD") + `</p>
        <p style="height:7px;">&nbsp</p>
        <p class="inv-p">"The Diamonds herein invoiced have been purchased from legitimate sources not involved in funding
          conflict , in compliance with United Nations resolutions and corresponding national laws .</p>
        <p class="inv-p">The Seller hereby guarantees that these diamonds are conflict free and confirms adherence to the
          WDC SoW Guidelines."</p>
        <p class="inv-p">The Diamonds herein invoiced are exclusively of natural origin and untreated based on personal
          knowledge and/or written guarantees provided by the supplier of these diamonds.</p>
        <p class="inv-p">The acceptance of goods herein invoiced will be as per WFDB guidelines.</p>
        <p style="margin-left: 10px;"><b>WE INTEND TO CLAIM RoDTEP ON THE EXPORT ITEMS LISTED UNDER THIS INVOICE NO.</b></p>
        <p style="margin-left: 10px;"><b>PAYMENT INSTRUCTION :</b>BENEFICIARY : `+ (transaction.transactionDetail.bank.accountName ?? "") + `</p>
        <p style="margin-left: 10px;">OUR BANK : ` + (transaction.transactionDetail.bank.address?.line1 ?? "") + `,` + (transaction.transactionDetail.bank.address?.line2 ?? "") + `,
        ` + (transaction.transactionDetail.bank.address?.city ?? "") + `,` + (transaction.transactionDetail.bank.address?.state ?? "") + `,` + (transaction.transactionDetail.bank.address?.country ?? "") + `</p>
        <p style="margin-left: 10px;">A/C NO. `+ (transaction.transactionDetail.bank.accountNo ?? "") + `, SWIFT CODE : ` + (transaction.transactionDetail.bank.swift ?? "") + `</p>
        <p style="margin-left: 10px;">INTERMEDIARY BANK : `+ (transaction.transactionDetail.bank.intermediaryBankName ?? "") + ` ,SWIFT CODE: ` + (transaction.transactionDetail.bank.intermediaryBankswift ?? "") + `</p>                
        <p style="margin-left: 10px;margin-top: 15px;""><b>STATE OF ORIGIN : `+ (transaction.transactionDetail.organization.address.stateCode ?? "") + `, DISTRICT OF ORIGIN : ` + (transaction.transactionDetail.organization.address.districtCode ?? "") + `</b></p>
        `
          if (isIGST == false) {
            htmlString += `
        <p style="margin-left: 10px;margin-top: 15px;""><b>ARN : AD270322054945Y</b></p>
        `}

          htmlString += `
        <p style="margin-left: 10px;margin-top: 15px;""><b>DOOR TO DOOR INSURANCE COVERED BY `+ (transaction.transactionDetail.logistic.name ?? "") + `</b></p>
        </div>
        `;
        }

        //style="page-break-after: always" For Break The Page
        htmlString += `
    <div class="inv-details" style="page-break-after: always;">
      <div class="sign-div">
        <div class="grid-1 p-1">
          <p><b>Details of preferential agreements under which the goods are being exported : NCPTI</b></p>
          <p><b>SQC-CTM</b></p>
          <p>
          <h5>On Confirmed outright sale basis</h5>
          </p>
          <p>Declaration :
          <h5>PAN : ` + (transaction.transactionDetail.organization.incomeTaxNo ?? "") + `</h5>
          </p>
          <p><small>We declare that this Invoice shows the actual price of the goods described and that all particulars
              are true and correct.</small></p>
          <p>IRN No: ` + (transaction.transactionDetail.irnNo ?? "") + `</p>
        </div>
        <div class="grid-2">
          <p>Signature & Date<br>` + this.utilityService.getISOtoStringDate(transaction.createdDate) + `</p>
          <p><b>For ` + (transaction.transactionDetail.organization.name ?? "") + `<br>Partner/Auth.Sign.</b></p>
        </div>
      </div>
    <div class="pager border-top-2 border-bottom-2 border-left-2 border-right-2 " style="overflow:hidden; padding-right:20px;">
      <span>Page `+ index + ` of ` + totalPageCount + `</span>
      </div>       
    </div>
  </div>
</body>`

      }//Main Foor Loop End

      if (transaction.transactionDetail.isPackingList) {
        //Above 1 Carat Packing List
        htmlString += `
          <div class="body-middle">

          <table>
          <tr>
          <td>Organization :<b> ` + (transaction.transactionDetail.organization.name ?? "") + `</b></td>
          <td>Invoice No : <b>` + (transaction.refNumber ?? "") + `</b></td>
          <td>Invoice Date : <b>` + this.utilityService.getISOtoStringDate(transaction.createdDate) + `</b></td>
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
              <th>REPORT NO</th>      
              <th>RAPAPORT</th>     
              <th>PRICE `+ (transaction.transactionDetail.fromCurrency ?? "") + ` /PER CT</th>
              <th>NET AMT `+ (transaction.transactionDetail.fromCurrency ?? "") + `</th>
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
                    <td>`+ (obj.price.rap ?? "") + `</td>
                    <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.perCarat ?? 0) ?? "") + `</td>
                    <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.netAmount ?? 0) ?? "") + `</td>
                    </tr>`
          }
        }

        htmlString += `
            </tbody>
            <tfoot>
                    <tr>
                      <td colspan="3"><b>Grand Total</b></td>
                      <td><b>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(aboveFiveCentTotalWeight ?? 0) + `</b></td>
                      <td colspan="6">&nbsp</td>                      
                      <td><b>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(aboveFiveCentAmont ?? 0) + `</b></td>
                    </tr>  
            </tfoot>
            </table>
            </div>`

        //Below 1 Carat Packing List    
        htmlString += `
        <div class="body-middle" style="page-break-before: always;">

        <table>
        <tr>
        <td>Organization :<b> ` + (transaction.transactionDetail.organization.name ?? "") + `</b></td>
        <td>Invoice No : <b>` + (transaction.refNumber ?? "") + `</b></td>
        <td>Invoice Date : <b>` + this.utilityService.getISOtoStringDate(transaction.createdDate) + `</b></td>
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
            <th>REPORT NO</th>      
            <th>RAPAPORT</th>     
            <th>PRICE `+ (transaction.transactionDetail.fromCurrency ?? "") + ` /PER CT</th>
            <th>NET AMT `+ (transaction.transactionDetail.fromCurrency ?? "") + `</th>
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
                  <td>`+ (obj.price.rap ?? "") + `</td>
                  <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.perCarat ?? 0) ?? "") + `</td>
                  <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.netAmount ?? 0) ?? "") + `</td>
                  </tr>`
          }
        }

        htmlString += `
          </tbody>
          <tfoot>
                  <tr>
                    <td colspan="3"><b>Grand Total</b></td>
                    <td><b>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(belowFiveCentTotalWeight ?? 0) + `</b></td>
                    <td colspan="6">&nbsp</td>                      
                    <td><b>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(belowFiveCentTotalAmount ?? 0) + `</b></td>
                  </tr>  
          </tfoot>
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
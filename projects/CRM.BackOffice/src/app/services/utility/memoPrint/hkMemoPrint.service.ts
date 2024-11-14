import { Injectable } from '@angular/core';
import { MasterConfig, MasterDNorm } from 'shared/enitites';
import { UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { MasterConfigService } from '../../masterconfig/masterconfig.service';
import { InventoryItems, Memo } from '../../../entities';

@Injectable({
  providedIn: 'root'
})

export class HKMemoPrint {
  public allTheShapes!: MasterDNorm[];
  public masterConfigList!: MasterConfig;

  constructor(
    public utilityService: UtilityService,
    private masterConfigService: MasterConfigService,
    private alertDialogService: AlertdialogService,
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

  public async getMemoPrint(memoObj: Memo, memoType: string) {
    await this.getMasterConfigData();
    var htmlString: string = "";
    let sumWeight = 0;
    var taxNameOne: string = "";
    var taxPerOne: number = 0;
    var taxNameTwo: string = "";
    var taxPerTwo: number = 0;
    let sumGrandTotalPlusTax = memoObj.totalAmount ?? 0;
    let sumConvGrandTotalPlusTax = 0;
    let contain49Down = false;
    let contain49Up = false;

    let contain49UpIndex = memoObj.inventoryItems.findIndex(x => x.weight > 0.49);
    if (contain49UpIndex > -1)
      contain49Up = true;

    let contain49DownIndex = memoObj.inventoryItems.findIndex(x => x.weight <= 0.49);
    if (contain49DownIndex > -1)
      contain49Down = true;

    for (let index = 0; index <= memoObj.inventoryItems.length; index++) {
      let obj = memoObj.inventoryItems[index];
      if (obj) {
        sumWeight += (obj.weight ?? "");
      }
    }

    if (memoObj.taxTypes.length > 0) {
      if (memoObj.taxTypes.length == 2) {
        taxNameOne = memoObj.taxTypes[0].name;
        taxPerOne = memoObj.taxTypes[0].rate;
        taxNameTwo = memoObj.taxTypes[1].name;
        taxPerTwo = memoObj.taxTypes[1].rate;
      }
      if (memoObj.taxTypes.length == 1) {
        taxNameOne = memoObj.taxTypes[0].name;
        taxPerOne = memoObj.taxTypes[0].rate;
      }
    }

    if (memoObj.shippingCharge > 0)
      sumGrandTotalPlusTax += memoObj.shippingCharge ?? 0;

    if (taxPerOne > 0)
      sumGrandTotalPlusTax += this.utilityService.ConvertToFloatWithDecimal((taxPerOne * (memoObj.totalAmount ?? 0)) / 100);

    if (taxPerTwo > 0)
      sumGrandTotalPlusTax += this.utilityService.ConvertToFloatWithDecimal((taxPerTwo * (memoObj.totalAmount ?? 0)) / 100);

    sumConvGrandTotalPlusTax = sumGrandTotalPlusTax * (memoObj.toCurRate ?? 1)

    if (memoType == "HKLOCAL") {
      htmlString += `<body onload="window.print(); window.close();">`
      let SumTotalAmtConverted = this.utilityService.ConvertToFloatWithDecimal((memoObj.totalAmount ?? 0) * (memoObj.toCurRate ?? 1));

      for (let Copyindex = 1; Copyindex <= 2; Copyindex++) {//Duplicate Copy Loop start       

        htmlString += `  
          <div class="chal-wrap con-inv di-inv">
            <div class="chal-head">
              <div class="logo">
                <img src="assets/billimage/diamarthk1.png" alt="logo">
              </div>
              <div class="di-info" style="text-align: center;">
              <span>` + (memoObj.organization.address?.line1 ?? "") + `,` + (memoObj.organization.address?.line2 ?? "") + `</span>            
              <span>` + (memoObj.organization.address?.city ?? "") + `,` + (memoObj.organization.address?.state ?? "") + `,` + (memoObj.organization.address?.country ?? "") + `</span> 
              <span>Email: ` + (memoObj.organization.email ?? "") + `</span>   
              <span>Contact No: ` + (memoObj.organization.phoneNo ?? "") + `</span>              
              </div>    
            </div>
  
            <div class="chal-body">          
            <span class="c-st border-left-2 border-right-2 border-bottom-2">ON APPROVAL</span>
              <div class="body-top ps-1 border-bottom-0">
                <div class="bo-left">
                `
        if (memoObj.party.name)
          htmlString +=
            `
                      <span class="c-st text-start" STYLE="font-weight:bold">To.:` + (memoObj.party.name ?? "") + `</span>
                      `
        else
          `
                      <span class="c-st text-start" STYLE="font-weight:bold">To.:` + (memoObj.party.contactPerson ?? "") + `</span>
                      `
        htmlString += `
                  <span>` + (memoObj.party.address.line1 ?? "") + `,` + (memoObj.party.address.line2 ?? "") + `</span>            
                  <span>` + (memoObj.party.address.city ?? "") + `,` + (memoObj.party.address.state ?? "") + `,` + (memoObj.party.address.country ?? "") + `</span>            
                  <span>ZipCode : ` + (memoObj.party.address.zipCode ?? "") + `</span>                
                  <span>TEL: ` + (memoObj.party.mobileNo ?? "") + ` Tax No: ` + (memoObj.party.incomeTaxNo ?? "") + `</span> 
                </div>   
  
                <div class="di-bor-0">
                <table>
                  <tbody>
                    <tr>
                      <td><b>APPROVAL NO. : </b></td>
                      <td>` + memoObj.memoNo + `</td>
                    </tr>
                    <tr>
                      <td><b>Date:</b></td>
                      <td>` + this.utilityService.getISOtoStringDate(memoObj.createdDate) + `</td>
                    </tr>                    
                  </tbody>
                </table>
              </div>           
              </div>
  
        <div class="body-middle">
          `
        if (memoObj.inventoryItems.length < 19) {
          htmlString += `    
            <table>                
            <tbody>
            <table>
            <thead>  
            <th>NO</th>
            <th>StockID</th>       
            <th>Shape</th>
            <th>PCS</th>
            <th>Size</th>
            <th>Color</th>
            <th>Clarity</th>       
            <th>Disc</th>
            <th>LAB</th>
            <th>CertiNo</th>
            <th>Rap</th>
            <th>PerCarat</th>
            <th>NetAmount</th>  
            </thead>
            <tbody>`

          for (let indexS = 0; indexS <= memoObj.inventoryItems.length; indexS++) {
            let obj = memoObj.inventoryItems[indexS];
            if (obj) {
              htmlString += `            
                    <tr>
                    <td>`+ (indexS + 1) + `</td>
                    <td>`+ (obj.stoneId ?? "") + `</td>                  
                    <td>`+ (obj.shape ?? "") + `</td>
                    <td>1</b></td>
                    <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit((obj.weight ?? "")) + `</td>
                    <td>`+ (obj.color ?? "") + `</td>
                    <td>`+ (obj.clarity ?? "") + `</td>                 
                    <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.discount ?? 0) ?? "") + `</td> 
                    <td>`+ (obj.lab ?? "") + `</td>              
                    <td>`+ (obj.certificateNo ?? "") + `</td>      
                    <td>`+ (obj.price.rap ?? "") + `</td>
                    <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.perCarat ?? 0) ?? "") + `</td>
                    <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.netAmount ?? 0) ?? "") + `</td>
                    </tr>`
            }
          }

          for (let index = memoObj.inventoryItems.length; index < 17; index++) {
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
                  <td></td>
                  <td></td>                
                  </tr>`
          }

          htmlString += `                        
            </tbody>
            <tfoot>
            <tr>
              <td colspan="3"><b>Grand Total </b></td>
              <td><b>`+ memoObj.inventoryItems.length + `</b></td>
              <td><b>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(sumWeight ?? 0) + `</b></td>     
              <td colspan="6" style="text-align:right; padding-right:10px;"><b>1 `+ (memoObj.fromCurrency ?? "") + ` = ` + (memoObj.toCurRate ?? "") + ` ` + (memoObj.toCurrency ?? "") + `</b></td>                                    
              <td><b>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(SumTotalAmtConverted ?? 0) + ` ( ` + (memoObj.toCurrency ?? "") + ` )</b></td>
              <td><b>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(memoObj.totalAmount ?? 0) + ` (` + (memoObj.fromCurrency ?? "") + `)</b></td>
            </tr>`
        }


        else {
          htmlString += `
            <table>
            <thead>
              <th>No</th>         
              <th>DESCRIPTION</th>
              <th>PCS</th>
              <th>CARATS</th>
              <th>RATE `+ (memoObj.fromCurrency ?? "") + ` /PER CT</th>
              <th>TOTAL AMOUNT `+ (memoObj.fromCurrency ?? "") + `</th>
            </thead>
            <tbody>
                    <tr>      
                    <td></td>          
                    <td>CUT & POLISHED DIAMONDS</td>                
                    <td> `+ memoObj.inventoryItems.length + `</td>
                    <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(sumWeight ?? 0) + `</td>
                    <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(((memoObj.totalAmount ?? 0) / sumWeight) ?? 0) + `</td>
                    <td>`+ memoObj.totalAmount + `</td>
                    </tr>`

          htmlString += `
                    <tr>
                    <td></td>
                    <td>AS PER PACKING LIST</td>                
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    </tr>`

          for (let index = 2; index < 18; index++) {
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
          htmlString += `                        
            </tbody>
            <tfoot>
            <tr>
              <td colspan="2"><b>Grand Total </b></td>
              <td></td>            
              <td style="text-align:right; padding-right:10px;"><b>1 `+ (memoObj.fromCurrency ?? "") + ` = ` + (memoObj.toCurRate ?? "") + ` ` + (memoObj.toCurrency ?? "") + `</b></td>                                    
              <td><b>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(SumTotalAmtConverted ?? 0) + ` ( ` + (memoObj.toCurrency ?? "") + ` )</b></td>
              <td><b>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(memoObj.totalAmount ?? 0) + ` (` + (memoObj.fromCurrency ?? "") + `)</b></td>
            </tr>`
        }

        htmlString += `        
                  </tfoot>
                </table>
              </div>    
  
              <div class="body-f-footer">  
              
              <div>
                <span class="c-st border-bottom-2" style="font-size:13px;">Terms of Service / Declaration</span>           
                <ul>  
                  <li>The goods described and valued as above are delivered to you for examination, inspection and showing to prospective buyers only and remain our property subject to our order and shall be returned to us on demand.</li>  
                  <li>Until such goods are returned to us and actually received by us, they are at your risk from all hazards.</li>
                  <li>No right or power is given to you to sell, pledge, hypothecate or otherwise dispose of the goods or anyone of them regardless of any prior course of transactions between us.</li>`

        if (memoObj.additionalDeclaration?.length > 270) {
          htmlString += `<li>${memoObj.additionalDeclaration}</li>`;
        }
        else if (memoObj.additionalDeclaration?.length > 135) {
          htmlString += `<li>Received the above goods on the terms and conditions set out above.</li>`;
          htmlString += `<li>${memoObj.additionalDeclaration}</li>`;
        }
        else if (memoObj.additionalDeclaration?.length > 0) {
          htmlString += `<li>A sale of any of these goods can only be effected and title pass to you if, as and when we as owner shall agree to such sale and a bill of sale is rendered therefor.</li>`;
          htmlString += `<li>${memoObj.additionalDeclaration}</li>`;
        }
        else {
          htmlString += `<li>Received the above goods on the terms and conditions set out above.</li>`;
          htmlString += `<li>A sale of any of these goods can only be effected and title pass to you if, as and when we as owner shall agree to such sale and a bill of sale is rendered therefor.</li>`;
        }

        htmlString += `
                  </ul>    
                </div>
                
                <div class="border-left-2">
                  <span class="c-st di" style="font-size:13px;">Buyer's Confirmation</span>
                  <div class="ch-sig">
                  <span>&nbsp</span>
                  <span>&nbsp</span>
                  <span>&nbsp</span>
                  <span>&nbsp</span>
                  <span>&nbsp</span>   
                  <span>Chop & Signature</span>                  
                </div>
                 
                </div>
              </div>
              <div class="body-f-mid">
                </div>
              </div>             
            `
        htmlString += `
            <div class="brd-remove">
            <table>
            <tr>
            <td>&nbsp</td>          
            </tr>
            <tr>
            <td>&nbsp</td>          
            </tr>
            </table>
            </div>  
          `
      } //Duplicate Copy Loop END

      if (memoObj.inventoryItems.length > 18) {
        htmlString += `
            <div class="body-middle">
            <table>
            <tr>
            <td>Organization :<b> ` + (memoObj.organization.name ?? "") + `</b></td>
            <td>On Approval : <b>` + (memoObj.memoNo ?? "") + `</b></td>
            <td>Date : <b>` + this.utilityService.getISOtoStringDate(memoObj.createdDate) + `</b></td>
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
                <th>RATE `+ (memoObj.fromCurrency ?? "") + ` /PER CT</th>
                <th>TOTAL AMOUNT `+ (memoObj.fromCurrency ?? "") + `</th>
              </thead>
              <tbody>`

        for (let index = 0; index <= memoObj.inventoryItems.length; index++) {
          let obj = memoObj.inventoryItems[index];
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
             
                      <tr>
                        <td colspan="3"><b>Grand Total</b></td>
                        <td><b>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(sumWeight ?? 0) + `</b></td>
                        <td colspan="5">&nbsp</td>                      
                        <td><b>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(memoObj.totalAmount ?? 0) + `</b></td>
                      </tr>
                    </tbody>       
              </table>
              </div>`
      }

      htmlString += `</div>
        </body>
          </body>
          </html>
          `;
    }

    else if (memoType == "HKOVERSEAS") {
      htmlString += `  
        <body onload="window.print(); window.close();">       
          <div class="chal-wrap con-inv di-inv">
            <div class="chal-head">
              <div class="logo">
                <img src="assets/billimage/diamarthk1.png" alt="logo">
              </div>
              <div class="di-info">
              <span>` + (memoObj.organization.address?.line1 ?? "") + `,` + (memoObj.organization.address?.line2 ?? "") + `</span>            
              <span>` + (memoObj.organization.address?.city ?? "") + `,` + (memoObj.organization.address?.state ?? "") + `,` + (memoObj.organization.address?.country ?? "") + `</span> 
              <span>Email: ` + (memoObj.organization.email ?? "") + `</span>  
              <span>Contact No: ` + (memoObj.organization.phoneNo ?? "") + `</span>               
              </div>        
            </div>
            <div class="chal-body">
        <span class="c-st border-left-2 border-right-2 border-bottom-2">INVOICE</span>
        <div class="body-top ps-1 border-bottom-0">
  
          <div class="bo-left border-right-2" style="flex-basis: 62%;">
  
            <div class="di-bor-0 border-bottom-2">
                  <span class="c-st text-start">Buyer (If other than consignee):</span>
                  <span>` + (memoObj.party.name ?? "") + `</span>
                  <span>` + (memoObj.party.address.line1 ?? "") + `,` + (memoObj.party.address.line2 ?? "") + `</span>            
                  <span>` + (memoObj.party.address.city ?? "") + `,` + (memoObj.party.address.state ?? "") + `,` + (memoObj.party.address.country ?? "") + `</span>            
                  <span>ZipCode : ` + (memoObj.party.address.zipCode ?? "") + `, &nbsp TEL: ` + ((memoObj.party.mobileNo ?? "") ?? "") + `, &nbsp Tax No: ` + (memoObj.party.incomeTaxNo ?? "") + `</span>
                  </div>
                  `

      if (memoObj.consignee?.name || memoObj.consigneeName) {
        if (memoObj.consignee?.name) {

          htmlString += `
            <span class="c-st text-start">Ship To:</span>
            <span> ` + (memoObj.consignee.name ?? "") + `</span>
            <span> ` + (memoObj.consignee.address.line1 ?? "") + (memoObj.consignee.address.line2 ?? "") + (memoObj.consignee.address.city ?? "") + `,&nbsp` + (memoObj.consignee.address.state ?? "") + `,&nbsp` + (memoObj.consignee.address.country ?? "") + `</span>
            <span>ZipCode : ` + (memoObj.consignee.address.zipCode ?? "") + `,&nbsp TEL: ` + (memoObj.consignee.mobileNo ?? "") + `,&nbsp Tax No: ` + (memoObj.consignee.taxNo ?? "") + ` ` + (memoObj.consignee.incomeTaxNo ?? "") + `</span>                
            `
        } else {
          htmlString += `
            <span class="c-st text-start">Ship To:</span>
            <span> ` + (memoObj.consigneeName ?? "") + `</span>
            <span> ` + (memoObj.consigneeAddress ?? "") + `</span>                
            `
        }
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
                        <td><b>Invoice No.</b></td>
                        <td>` + memoObj.memoNo + `</td>
                      </tr>
                      <tr>
                        <td><b>Date:</b></td>
                        <td>` + this.utilityService.getISOtoStringDate(memoObj.createdDate) + `</td>
                      </tr>                    
                      <tr>
                        <td><b>Terms:</b></td>
                        <td>` + (memoObj.terms ?? "") + `</td>
                      </tr>                    
                      <tr>
                      <td><b>Origin:</b></td>
                        <td>INDIA</td>                    
                      </tr>                     
                      `
      if (memoObj.cifCityName) {
        htmlString += `
                                      <tr>
                                      <td><b>CIF:</b></td>     
                                      <td>`+ memoObj.cifCityName + `</td>
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
                <table>                
                  <tbody>`


      if (memoObj.inventoryItems.length < 24) {

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
            <th>CERTIFICATE</th>
            <th>PCS</th>
            <th>CARATS</th>
            <th>RATE `+ (memoObj.fromCurrency ?? "") + ` /PER CT</th>
            <th>TOTAL AMOUNT `+ (memoObj.fromCurrency ?? "") + `</th>
          </thead>
          <tbody>`

        for (let index = 0; index <= memoObj.inventoryItems.length; index++) {
          let obj = memoObj.inventoryItems[index];
          if (obj) {
            htmlString += `            
                  <tr>
                  <td>`+ (index + 1) + `</td>
                  <td>`+ (obj.stoneId ?? "") + `</td>                
                  <td>`+ (obj.shape ?? "") + `</td>                
                  <td>` + (obj.color ?? "") + `</td>
                  <td>` + (obj.clarity ?? "") + `</td>
                  <td>` + (obj.lab ?? "") + `</td> 
                  <td>` + (obj.certificateNo ?? "") + `</td>    
                  <td>1</td>            
                  <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.weight ?? 0) ?? "") + `</td>
                  <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.perCarat ?? 0) ?? "") + `</td>
                  <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.netAmount ?? 0) ?? "") + `</td>
                  </tr>`
          }
        }
        for (let index = memoObj.inventoryItems.length; index <= 23; index++) {
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
        if (memoObj.shippingCharge > 0) {
          htmlString += `
                          <tr>
                          <td colspan="10" style="text-align:right" >Shipping Charge : </td>       
                          <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(memoObj.shippingCharge ?? 0) + `</td>
                          </tr>`
        }

        htmlString += `                        
                    </tbody>
                    <tfoot>
                    <tr>
                      <td colspan="7" style="text-align:right"><b>Grand Total </b></td>
                      <td><b>`+ memoObj.inventoryItems.length + `</b></td>
                      <td><b>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(sumWeight ?? 0) + `</b></td>          
                      <td>&nbsp</td>    
                      <td><b>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(sumGrandTotalPlusTax ?? 0) + ` (` + (memoObj.fromCurrency ?? "") + `)</b></td>
                    </tr>   
                    <tr>
                    <td colspan="11" style="text-align:right"><b>Amount in Words: </b> `+ this.utilityService.convertAmoutToWord(this.utilityService.ConvertToFloatWithDecimalTwoDigitRoundWithNum(sumGrandTotalPlusTax), "USD") + `
                    </td>
                    </tr>
                    </tfoot>
                  </table>
                </div>  `
      }

      else {
        htmlString += `
          <table>
          <thead>
            <th>No</th>         
            <th colspan="2">DESCRIPTION</th>
            <th>PCS</th>
            <th>CARATS</th>
            <th>RATE `+ (memoObj.fromCurrency ?? "") + ` /PER CT</th>
            <th>TOTAL AMOUNT `+ (memoObj.fromCurrency ?? "") + `</th>
          </thead>
          <tbody>
                  <tr>      
                  <td></td>          
                  <td colspan="2">CUT & POLISHED DIAMONDS</td>                
                  <td> `+ memoObj.inventoryItems.length + `</td>
                  <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(sumWeight ?? 0) + `</td>
                  <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(((memoObj.totalAmount ?? 0) / sumWeight) ?? 0) + `</td>
                  <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(memoObj.totalAmount ?? 0) + `</td>
                  </tr>`

        htmlString += `
                  <tr>
                  <td></td>
                  <td colspan="2">AS PER PACKING LIST </td> 
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  </tr>`

        for (let index = 3; index <= 23; index++) {
          htmlString += `
                  <tr>
                  <td>&nbsp</td>                
                  <td colspan="2"></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  </tr>`
        }

        if (memoObj.shippingCharge > 0) {
          htmlString += `
                          <tr>
                          <td colspan="6" style="text-align:right" >Shipping Charge : </td>       
                          <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(memoObj.shippingCharge ?? 0) + `</td>
                          </tr>`
        }

        htmlString += `                        
                    </tbody>
                    <tfoot>
                    <tr>
                      <td colspan="3" style="text-align:right"><b>Grand Total</b></td>
                      <td><b>`+ memoObj.inventoryItems.length + `</b></td>
                      <td><b>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(sumWeight ?? 0) + `</b></td>          
                      <td>&nbsp</td>    
                      <td><b>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(sumGrandTotalPlusTax ?? 0) + ` (` + (memoObj.fromCurrency ?? "") + `)</b></td>
                    </tr>   
                    <tr>
                    <td colspan="7" style="text-align:right"><b>Amount in Words: </b> `+ this.utilityService.convertAmoutToWord(this.utilityService.ConvertToFloatWithDecimalTwoDigitRoundWithNum(sumGrandTotalPlusTax ?? 0), "USD") + `
                    </td>
                    </tr>
                    </tfoot>
                  </table>
                </div>  `
      }

      htmlString += ` 
              <span class="c-st border-bottom-2 border-left-2 border-right-2">Terms of Service / Declaration</span>     
                <div class="body-f-footer">                       
                <ul style="margin: 0;">  
                <li>The goods described and valued as above are delivered to you for examination, inspection and showing to prospective buyers only and remain our property subject to our order and shall be returned to us on demand.</li>  
                <li>Until such goods are returned to us and actually received by us, they are at your risk from all hazards.</li>
              `
      if (memoObj.additionalDeclaration?.length > 330) {
        htmlString += `<li>${memoObj.additionalDeclaration}</li>`;
      }
      else if (memoObj.additionalDeclaration?.length > 165) {
        htmlString += `<li>A sale of any of these goods can only be effected and title pass to you if, as and when we as owner shall agree to such sale and a bill of sale is rendered therefor.</li>`;
        htmlString += `<li>${memoObj.additionalDeclaration}</li>`;
      }
      else if (memoObj.additionalDeclaration?.length > 0) {
        htmlString += `<li>No right or power is given to you to sell, pledge, hypothecate or otherwise dispose of the goods or anyone of them regardless of any prior course of transactions between us.</li>                `;
        htmlString += `<li>${memoObj.additionalDeclaration}</li>`;
      }
      else {
        htmlString += `<li>No right or power is given to you to sell, pledge, hypothecate or otherwise dispose of the goods or anyone of them regardless of any prior course of transactions between us.</li>                `;
        htmlString += `<li>A sale of any of these goods can only be effected and title pass to you if, as and when we as owner shall agree to such sale and a bill of sale is rendered therefor.</li>`;
      }

      htmlString += `
                </div>
  
                <div class="body-f-mid">
                <div class="p-2 di-bor-0"> 
                      <span class="c-st text-start">Payment instructions:</span>
                      <table>
                        <tbody>
                          <tr>
                            <td><b>BANK : </b></td>
                            <td>`+ (memoObj.bank.bankName ?? "") + `</td>
                          </tr>      
                          <tr>
                            <td><b>ADDRESS :</b></td>  
                            <td>` + (memoObj.bank.address?.line1 ?? "") + `,` + (memoObj.bank.address?.line2 ?? "") + `,
                            ` + (memoObj.bank.address?.city ?? "") + `,` + (memoObj.bank.address?.state ?? "") + `,` + (memoObj.bank.address?.country ?? "") + `</td>
                          </tr>
                          <tr>
                            <td><b>A/C NAME :</b></td>
                            <td>`+ (memoObj.bank.accountName ?? "") + `</td>
                          </tr>
                          <tr>
                            <td><b>A/C NO :</b></td>
                            <td>`+ (memoObj.bank.accountNo ?? "") + `</td>
                          </tr>
                          <tr>
                            <td><b>SWIFT CODE :</b></td>
                            <td>`+ (memoObj.bank.swift ?? "") + `</td>
                          </tr>  
                          <tr>
                          <td><b>INTERMEDIATE BANK:</b></td>
                          <td>`+ (memoObj.bank.intermediaryBankName ?? "") + `</td>                        
                          </tr>         
                          <tr>
                          <td><b>INTERMEDIATE ADDRESS:</b></td>                       
                          <td>`+ (memoObj.bank.intermediaryBankAddress ?? "") + `</td>                        
                          </tr>  
                          <tr>
                          <td><b>INTERMEDIATE SWIFTCODE:</b></td>                      
                          <td>`+ (memoObj.bank.intermediaryBankswift ?? "") + `</td>
                          </tr>            
                        </tbody>
                      </table>
                      </div> 
             
                      <div class="border-left-2" style="width: 30%;">
                      <div class="">
                          <span class="c-st">FOR , ` + (memoObj.organization.name ?? "") + `</span>
                          <div class="ch-sig">                                    
                          <br>
                          <br>
                          <br>
                          <br>
                          <br>  
                          <br>
                          <br>                    
                          <span>Authorized Signature(S)</span>             
                          </div>
                        </div>        
                        </div>
                      </div>
              </div>
            </div>
          </div>`

      if (memoObj.inventoryItems.length > 24) {
        htmlString += `
            <div class="body-middle">
  
            <table>
            <tr>
            <td>Organization :<b> ` + (memoObj.organization.name ?? "") + `</b></td>
            <td>Invoice No : <b>` + (memoObj.memoNo ?? "") + `</b></td>
            <td>Date : <b>` + this.utilityService.getISOtoStringDate(memoObj.createdDate) + `</b></td>
            </tr>
            <tr>
            <td colspan="3"><b>Packing List</b></td>
            </tr>
            </table>
  
            <table>
              <thead>
                <th>No</th>
                <th>STONE ID</th>
                <th>PCS</th>
                <th>SHAPE</th>
                <th>CARATS</th>
                <th>COLOR</th>
                <th>CLARITY</th>
                <th>LAB</th>      
                <th>CERTI. NO</th>          
                <th>RATE `+ (memoObj.fromCurrency ?? "") + ` /PER CT</th>
                <th>TOTAL AMOUNT `+ (memoObj.fromCurrency ?? "") + `</th>
              </thead>
              <tbody>`

        for (let index = 0; index <= memoObj.inventoryItems.length; index++) {
          let obj = memoObj.inventoryItems[index];
          if (obj) {
            htmlString += `
                      <tr>
                      <td>`+ (index + 1) + `</td>
                      <td>`+ (obj.stoneId ?? "") + `</td>
                      <td>1</td>
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
              
              
                      <tr>
                        <td colspan="4"><b>Grand Total</b></td>
                        <td><b>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(sumWeight ?? 0) + `</b></td>
                        <td colspan="5">&nbsp</td>                      
                        <td><b>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(memoObj.totalAmount ?? 0) + `</b></td>
                      </tr>  
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

  public async getAbovePointFiveCentMemoPrint(memoObj: Memo, memoType: string) {
    await this.getMasterConfigData();
    var htmlString: string = "";
    let sumWeight = 0;
    var taxNameOne: string = "";
    var taxPerOne: number = 0;
    var taxNameTwo: string = "";
    var taxPerTwo: number = 0;
    let sumGrandTotalPlusTax = memoObj.totalAmount ?? 0;
    let sumConvGrandTotalPlusTax = 0;
    let contain49Down = false;
    let contain49Up = false;

    let aboveOneCtSumWeight = 0;
    let belowOneCtSumWeight = 0;
    let aboveOneCtTotalStone = 0;
    let belowOneCtTotalStone = 0;
    let aboveFiveCentAmont = 0;
    let belowFiveCentTotalAmount = 0;
    let aboveTotalPerCarat = 0;
    let belowTotalPerCarat = 0;

    let contain49UpIndex = memoObj.inventoryItems.findIndex(x => x.weight > 0.49);
    if (contain49UpIndex > -1)
      contain49Up = true;

    let contain49DownIndex = memoObj.inventoryItems.findIndex(x => x.weight <= 0.49);
    if (contain49DownIndex > -1)
      contain49Down = true;

    for (let index = 0; index <= memoObj.inventoryItems.length; index++) {
      let obj = memoObj.inventoryItems[index];
      if (obj) {
        sumWeight += (obj.weight ?? "");
      }
    }

    if (memoObj.taxTypes.length > 0) {
      if (memoObj.taxTypes.length == 2) {
        taxNameOne = memoObj.taxTypes[0].name;
        taxPerOne = memoObj.taxTypes[0].rate;
        taxNameTwo = memoObj.taxTypes[1].name;
        taxPerTwo = memoObj.taxTypes[1].rate;
      }
      if (memoObj.taxTypes.length == 1) {
        taxNameOne = memoObj.taxTypes[0].name;
        taxPerOne = memoObj.taxTypes[0].rate;
      }
    }

    if (memoObj.shippingCharge > 0)
      sumGrandTotalPlusTax += memoObj.shippingCharge ?? 0;

    if (taxPerOne > 0)
      sumGrandTotalPlusTax += this.utilityService.ConvertToFloatWithDecimal((taxPerOne * (memoObj.totalAmount ?? 0)) / 100);

    if (taxPerTwo > 0)
      sumGrandTotalPlusTax += this.utilityService.ConvertToFloatWithDecimal((taxPerTwo * (memoObj.totalAmount ?? 0)) / 100);

    sumConvGrandTotalPlusTax = sumGrandTotalPlusTax * (memoObj.toCurRate ?? 1)

    //Above & Below Point Five Cent Carat Calculation
    const abovePointFiveCentData = memoObj.inventoryItems.filter((item: InventoryItems) => item.weight > 0.49);
    const belowPointFiveCentData = memoObj.inventoryItems.filter((item: InventoryItems) => item.weight <= 0.49);

    if (abovePointFiveCentData.length > 0) {
      aboveOneCtTotalStone = this.utilityService.ConvertToFloatWithDecimal(abovePointFiveCentData.length);
      aboveOneCtSumWeight = this.utilityService.ConvertToFloatWithDecimal(abovePointFiveCentData.reduce((acc, cur) => acc + (cur.weight ? cur.weight : 0), 0));
      aboveFiveCentAmont = this.utilityService.ConvertToFloatWithDecimal(abovePointFiveCentData.reduce((acc, cur) => acc + (cur.price.netAmount ? cur.price.netAmount : 0), 0));
      aboveTotalPerCarat = this.utilityService.ConvertToFloatWithDecimal(aboveFiveCentAmont / aboveOneCtSumWeight);
    }

    if (belowPointFiveCentData.length > 0) {
      belowOneCtTotalStone = this.utilityService.ConvertToFloatWithDecimal(belowPointFiveCentData.length);
      belowOneCtSumWeight = this.utilityService.ConvertToFloatWithDecimal(belowPointFiveCentData.reduce((acc, cur) => acc + (cur.weight ? cur.weight : 0), 0));
      belowFiveCentTotalAmount = this.utilityService.ConvertToFloatWithDecimal(belowPointFiveCentData.reduce((acc, cur) => acc + (cur.price.netAmount ? cur.price.netAmount : 0), 0));
      belowTotalPerCarat = this.utilityService.ConvertToFloatWithDecimal(belowFiveCentTotalAmount / belowOneCtSumWeight);
    }

    if (memoType == "HKLOCAL") {
      htmlString += `<body onload="window.print(); window.close();">`
      let SumTotalAmtConverted = this.utilityService.ConvertToFloatWithDecimal((memoObj.totalAmount ?? 0) * (memoObj.toCurRate ?? 1));

      for (let Copyindex = 1; Copyindex <= 2; Copyindex++) {//Duplicate Copy Loop start       

        htmlString += `  
          <div class="chal-wrap con-inv di-inv">
            <div class="chal-head">
              <div class="logo">
                <img src="assets/billimage/diamarthk1.png" alt="logo">
              </div>
              <div class="di-info" style="text-align: center;">
              <span>` + (memoObj.organization.address?.line1 ?? "") + `,` + (memoObj.organization.address?.line2 ?? "") + `</span>            
              <span>` + (memoObj.organization.address?.city ?? "") + `,` + (memoObj.organization.address?.state ?? "") + `,` + (memoObj.organization.address?.country ?? "") + `</span> 
              <span>Email: ` + (memoObj.organization.email ?? "") + `</span>   
              <span>Contact No: ` + (memoObj.organization.phoneNo ?? "") + `</span>              
              </div>    
            </div>
  
            <div class="chal-body">          
            <span class="c-st border-left-2 border-right-2 border-bottom-2">ON APPROVAL</span>
              <div class="body-top ps-1 border-bottom-0">
                <div class="bo-left">
                `
        if (memoObj.party.name)
          htmlString +=
            `
                      <span class="c-st text-start" STYLE="font-weight:bold">To.:` + (memoObj.party.name ?? "") + `</span>
                      `
        else
          `
                      <span class="c-st text-start" STYLE="font-weight:bold">To.:` + (memoObj.party.contactPerson ?? "") + `</span>
                      `
        htmlString += `
                  <span>` + (memoObj.party.address.line1 ?? "") + `,` + (memoObj.party.address.line2 ?? "") + `</span>            
                  <span>` + (memoObj.party.address.city ?? "") + `,` + (memoObj.party.address.state ?? "") + `,` + (memoObj.party.address.country ?? "") + `</span>            
                  <span>ZipCode : ` + (memoObj.party.address.zipCode ?? "") + `</span>                
                  <span>TEL: ` + (memoObj.party.mobileNo ?? "") + ` Tax No: ` + (memoObj.party.incomeTaxNo ?? "") + `</span> 
                </div>   
  
                <div class="di-bor-0">
                <table>
                  <tbody>
                    <tr>
                      <td><b>APPROVAL NO. : </b></td>
                      <td>` + memoObj.memoNo + `</td>
                    </tr>
                    <tr>
                      <td><b>Date:</b></td>
                      <td>` + this.utilityService.getISOtoStringDate(memoObj.createdDate) + `</td>
                    </tr>                    
                  </tbody>
                </table>
              </div>           
              </div>
  
        <div class="body-middle">
          `
        if (memoObj.inventoryItems.length < 19) {
          htmlString += `    
            <table>                
            <tbody>
            <table>
            <thead>  
            <th>NO</th>
            <th>StockID</th>       
            <th>Shape</th>
            <th>PCS</th>
            <th>Size</th>
            <th>Color</th>
            <th>Clarity</th>       
            <th>Disc</th>
            <th>LAB</th>
            <th>CertiNo</th>
            <th>Rap</th>
            <th>PerCarat</th>
            <th>NetAmount</th>  
            </thead>
            <tbody>`

          for (let indexS = 0; indexS <= memoObj.inventoryItems.length; indexS++) {
            let obj = memoObj.inventoryItems[indexS];
            if (obj) {
              htmlString += `            
                    <tr>
                    <td>`+ (indexS + 1) + `</td>
                    <td>`+ (obj.stoneId ?? "") + `</td>                  
                    <td>`+ (obj.shape ?? "") + `</td>
                    <td>1</b></td>
                    <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit((obj.weight ?? "")) + `</td>
                    <td>`+ (obj.color ?? "") + `</td>
                    <td>`+ (obj.clarity ?? "") + `</td>                 
                    <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.discount ?? 0) ?? "") + `</td> 
                    <td>`+ (obj.lab ?? "") + `</td>              
                    <td>`+ (obj.certificateNo ?? "") + `</td>      
                    <td>`+ (obj.price.rap ?? "") + `</td>
                    <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.perCarat ?? 0) ?? "") + `</td>
                    <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.netAmount ?? 0) ?? "") + `</td>
                    </tr>`
            }
          }

          for (let index = memoObj.inventoryItems.length; index < 17; index++) {
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
                  <td></td>
                  <td></td>                
                  </tr>`
          }

          htmlString += `                        
            </tbody>
            <tfoot>
            <tr>
              <td colspan="3"><b>Grand Total </b></td>
              <td><b>`+ memoObj.inventoryItems.length + `</b></td>
              <td><b>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(sumWeight ?? 0) + `</b></td>     
              <td colspan="6" style="text-align:right; padding-right:10px;"><b>1 `+ (memoObj.fromCurrency ?? "") + ` = ` + (memoObj.toCurRate ?? "") + ` ` + (memoObj.toCurrency ?? "") + `</b></td>                                    
              <td><b>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(SumTotalAmtConverted ?? 0) + ` ( ` + (memoObj.toCurrency ?? "") + ` )</b></td>
              <td><b>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(memoObj.totalAmount ?? 0) + ` (` + (memoObj.fromCurrency ?? "") + `)</b></td>
            </tr>`
        }


        else {
          htmlString += `
            <table>
            <thead>
              <th>No</th>         
              <th>DESCRIPTION</th>
              <th>PCS</th>
              <th>CARATS</th>
              <th>RATE `+ (memoObj.fromCurrency ?? "") + ` /PER CT</th>
              <th>TOTAL AMOUNT `+ (memoObj.fromCurrency ?? "") + `</th>
            </thead>
            <tbody>
                    <tr>      
                    <td>1</td>          
                    <td>0.50 CT ABOVE SIZE</td>                
                    <td> `+ aboveOneCtTotalStone + `</td>
                    <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(aboveOneCtSumWeight ?? 0) + `</td>
                    <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(((aboveFiveCentAmont ?? 0) / aboveOneCtSumWeight) ?? 0) + `</td>
                    <td>`+ aboveFiveCentAmont + `</td>
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
                    <td> `+ belowOneCtTotalStone + `</td>
                    <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(belowOneCtSumWeight ?? 0) + `</td>
                    <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(((belowFiveCentTotalAmount ?? 0) / belowOneCtSumWeight) ?? 0) + `</td>
                    <td>`+ belowFiveCentTotalAmount + `</td>
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

          for (let index = 2; index < 13; index++) {
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
          htmlString += `                        
            </tbody>
            <tfoot>
            <tr>
              <td colspan="2"><b>Grand Total </b></td>
              <td><b>`+ memoObj.inventoryItems.length + `</b></td>            
              <td style="text-align:right; padding-right:10px;"><b>1 `+ (memoObj.fromCurrency ?? "") + ` = ` + (memoObj.toCurRate ?? "") + ` ` + (memoObj.toCurrency ?? "") + `</b></td>                                    
              <td><b>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(SumTotalAmtConverted ?? 0) + ` ( ` + (memoObj.toCurrency ?? "") + ` )</b></td>
              <td><b>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(memoObj.totalAmount ?? 0) + ` (` + (memoObj.fromCurrency ?? "") + `)</b></td>
            </tr>`
        }

        htmlString += `        
                  </tfoot>
                </table>
              </div>    
  
              <div class="body-f-footer">  
              
              <div>
                <span class="c-st border-bottom-2" style="font-size:13px;">Terms of Service / Declaration</span>           
                <ul>  
                  <li>The goods described and valued as above are delivered to you for examination, inspection and showing to prospective buyers only and remain our property subject to our order and shall be returned to us on demand.</li>  
                  <li>Until such goods are returned to us and actually received by us, they are at your risk from all hazards.</li>
                  <li>No right or power is given to you to sell, pledge, hypothecate or otherwise dispose of the goods or anyone of them regardless of any prior course of transactions between us.</li>                
                  <li>A sale of any of these goods can only be effected and title pass to you if, as and when we as owner shall agree to such sale and a bill of sale is rendered therefor.</li>
                  <li>Received the above goods on the terms and conditions set out above.</li>
                  </ul>    
                </div>
                
                <div class="border-left-2">
                  <span class="c-st di" style="font-size:13px;">Buyer's Confirmation</span>
                  <div class="ch-sig">
                  <span>&nbsp</span>
                  <span>&nbsp</span>
                  <span>&nbsp</span>
                  <span>&nbsp</span>
                  <span>&nbsp</span>   
                  <span>Chop & Signature</span>                  
                </div>
                 
                </div>
              </div>
              <div class="body-f-mid">
                </div>
              </div>             
            `
        htmlString += `
            <div class="brd-remove">
            <table>
            <tr>
            <td>&nbsp</td>          
            </tr>
            <tr>
            <td>&nbsp</td>          
            </tr>
            </table>
            </div>  
          `
      } //Duplicate Copy Loop END

      if (memoObj.inventoryItems.length > 18) {
        //Above 1 Carat PL
        htmlString += `
            <div class="body-middle">
            <table>
            <tr>
            <td>Organization :<b> ` + (memoObj.organization.name ?? "") + `</b></td>
            <td>On Approval : <b>` + (memoObj.memoNo ?? "") + `</b></td>
            <td>Date : <b>` + this.utilityService.getISOtoStringDate(memoObj.createdDate) + `</b></td>
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
                <th>RATE `+ (memoObj.fromCurrency ?? "") + ` /PER CT</th>
                <th>TOTAL AMOUNT `+ (memoObj.fromCurrency ?? "") + `</th>
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
                  <tr>
                    <td colspan="3"><b>Grand Total</b></td>
                    <td><b>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(aboveOneCtSumWeight ?? 0) + `</b></td>
                    <td colspan="5">&nbsp</td>                      
                    <td><b>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(aboveFiveCentAmont ?? 0) + `</b></td>
                  </tr>
              </tbody>
              </table>
              </div>`

        //Below 1 Carat PL    
        htmlString += `
            <div class="body-middle" style="page-break-before: always;">
            <table>
            <tr>
            <td>Organization :<b> ` + (memoObj.organization.name ?? "") + `</b></td>
            <td>On Approval : <b>` + (memoObj.memoNo ?? "") + `</b></td>
            <td>Date : <b>` + this.utilityService.getISOtoStringDate(memoObj.createdDate) + `</b></td>
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
                <th>RATE `+ (memoObj.fromCurrency ?? "") + ` /PER CT</th>
                <th>TOTAL AMOUNT `+ (memoObj.fromCurrency ?? "") + `</th>
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
                  <tr>
                    <td colspan="3"><b>Grand Total</b></td>
                    <td><b>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(belowOneCtSumWeight ?? 0) + `</b></td>
                    <td colspan="5">&nbsp</td>                      
                    <td><b>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(belowFiveCentTotalAmount ?? 0) + `</b></td>
                  </tr>
              </tbody>
              </table>
              </div>`
      }

      htmlString += `</div>
        </body>
          </body>
          </html>
          `;
    }

    else if (memoType == "HKOVERSEAS") {
      htmlString += `  
        <body onload="window.print(); window.close();">       
          <div class="chal-wrap con-inv di-inv">
            <div class="chal-head">
              <div class="logo">
                <img src="assets/billimage/diamarthk1.png" alt="logo">
              </div>
              <div class="di-info">
              <span>` + (memoObj.organization.address?.line1 ?? "") + `,` + (memoObj.organization.address?.line2 ?? "") + `</span>            
              <span>` + (memoObj.organization.address?.city ?? "") + `,` + (memoObj.organization.address?.state ?? "") + `,` + (memoObj.organization.address?.country ?? "") + `</span> 
              <span>Email: ` + (memoObj.organization.email ?? "") + `</span>  
              <span>Contact No: ` + (memoObj.organization.phoneNo ?? "") + `</span>               
              </div>        
            </div>
            <div class="chal-body">
        <span class="c-st border-left-2 border-right-2 border-bottom-2">INVOICE</span>
        <div class="body-top ps-1 border-bottom-0">
  
          <div class="bo-left border-right-2" style="flex-basis: 62%;">
  
            <div class="di-bor-0 border-bottom-2">
                  <span class="c-st text-start">Buyer (If other than consignee):</span>
                  <span>` + (memoObj.party.name ?? "") + `</span>
                  <span>` + (memoObj.party.address.line1 ?? "") + `,` + (memoObj.party.address.line2 ?? "") + `</span>            
                  <span>` + (memoObj.party.address.city ?? "") + `,` + (memoObj.party.address.state ?? "") + `,` + (memoObj.party.address.country ?? "") + `</span>            
                  <span>ZipCode : ` + (memoObj.party.address.zipCode ?? "") + `, &nbsp TEL: ` + ((memoObj.party.mobileNo ?? "") ?? "") + `, &nbsp Tax No: ` + (memoObj.party.incomeTaxNo ?? "") + `</span>
                  </div>
                  `

      if (memoObj.consignee?.name || memoObj.consigneeName) {
        if (memoObj.consignee?.name) {

          htmlString += `
            <span class="c-st text-start">Ship To:</span>
            <span> ` + (memoObj.consignee.name ?? "") + `</span>
            <span> ` + (memoObj.consignee.address.line1 ?? "") + (memoObj.consignee.address.line2 ?? "") + (memoObj.consignee.address.city ?? "") + `,&nbsp` + (memoObj.consignee.address.state ?? "") + `,&nbsp` + (memoObj.consignee.address.country ?? "") + `</span>
            <span>ZipCode : ` + (memoObj.consignee.address.zipCode ?? "") + `,&nbsp TEL: ` + (memoObj.consignee.mobileNo ?? "") + `,&nbsp Tax No: ` + (memoObj.consignee.taxNo ?? "") + ` ` + (memoObj.consignee.incomeTaxNo ?? "") + `</span>                
            `
        } else {
          htmlString += `
            <span class="c-st text-start">Ship To:</span>
            <span> ` + (memoObj.consigneeName ?? "") + `</span>
            <span> ` + (memoObj.consigneeAddress ?? "") + `</span>                
            `
        }
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
                        <td><b>Invoice No.</b></td>
                        <td>` + memoObj.memoNo + `</td>
                      </tr>
                      <tr>
                        <td><b>Date:</b></td>
                        <td>` + this.utilityService.getISOtoStringDate(memoObj.createdDate) + `</td>
                      </tr>                    
                      <tr>
                        <td><b>Terms:</b></td>
                        <td>` + (memoObj.terms ?? "") + `</td>
                      </tr>                    
                      <tr>
                      <td><b>Origin:</b></td>
                        <td>INDIA</td>                    
                      </tr>                     
                      `
      if (memoObj.cifCityName) {
        htmlString += `
                                      <tr>
                                      <td><b>CIF:</b></td>     
                                      <td>`+ memoObj.cifCityName + `</td>
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
                <table>                
                  <tbody>`


      if (memoObj.inventoryItems.length < 24) {

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
            <th>CERTIFICATE</th>
            <th>PCS</th>
            <th>CARATS</th>
            <th>RATE `+ (memoObj.fromCurrency ?? "") + ` /PER CT</th>
            <th>TOTAL AMOUNT `+ (memoObj.fromCurrency ?? "") + `</th>
          </thead>
          <tbody>`

        for (let index = 0; index <= memoObj.inventoryItems.length; index++) {
          let obj = memoObj.inventoryItems[index];
          if (obj) {
            htmlString += `            
                  <tr>
                  <td>`+ (index + 1) + `</td>
                  <td>`+ (obj.stoneId ?? "") + `</td>                
                  <td>`+ (obj.shape ?? "") + `</td>                
                  <td>` + (obj.color ?? "") + `</td>
                  <td>` + (obj.clarity ?? "") + `</td>
                  <td>` + (obj.lab ?? "") + `</td> 
                  <td>` + (obj.certificateNo ?? "") + `</td>    
                  <td>1</td>            
                  <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.weight ?? 0) ?? "") + `</td>
                  <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.perCarat ?? 0) ?? "") + `</td>
                  <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.netAmount ?? 0) ?? "") + `</td>
                  </tr>`
          }
        }
        for (let index = memoObj.inventoryItems.length; index <= 23; index++) {
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
        if (memoObj.shippingCharge > 0) {
          htmlString += `
                          <tr>
                          <td colspan="10" style="text-align:right" >Shipping Charge : </td>       
                          <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(memoObj.shippingCharge ?? 0) + `</td>
                          </tr>`
        }

        htmlString += `                        
                    </tbody>
                    <tfoot>
                    <tr>
                      <td colspan="7" style="text-align:right"><b>Grand Total </b></td>
                      <td><b>`+ memoObj.inventoryItems.length + `</b></td>
                      <td><b>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(sumWeight ?? 0) + `</b></td>          
                      <td>&nbsp</td>    
                      <td><b>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(sumGrandTotalPlusTax ?? 0) + ` (` + (memoObj.fromCurrency ?? "") + `)</b></td>
                    </tr>   
                    <tr>
                    <td colspan="11" style="text-align:right"><b>Amount in Words: </b> `+ this.utilityService.convertAmoutToWord(this.utilityService.ConvertToFloatWithDecimalTwoDigitRoundWithNum(sumGrandTotalPlusTax), "USD") + `
                    </td>
                    </tr>
                    </tfoot>
                  </table>
                </div>  `
      }

      else {
        htmlString += `
          <table>
          <thead>
            <th>No</th>         
            <th colspan="2">DESCRIPTION</th>
            <th>PCS</th>
            <th>CARATS</th>
            <th>RATE `+ (memoObj.fromCurrency ?? "") + ` /PER CT</th>
            <th>TOTAL AMOUNT `+ (memoObj.fromCurrency ?? "") + `</th>
          </thead>
          <tbody>
                  <tr>      
                  <td>1</td>          
                  <td colspan="2">0.50 CT ABOVE SIZE</td>                
                  <td> `+ aboveOneCtTotalStone + `</td>
                  <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(aboveOneCtSumWeight ?? 0) + `</td>
                  <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(((aboveFiveCentAmont ?? 0) / aboveOneCtSumWeight) ?? 0) + `</td>
                  <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(aboveFiveCentAmont ?? 0) + `</td>
                  </tr>`

        htmlString += `
                  <tr>
                  <td></td>
                  <td colspan="2">CUT & POLISHED DIAMONDS</td> 
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  </tr>`

        htmlString += `
                  <tr>
                  <td></td>
                  <td colspan="2">AS PER PACKING LIST 1</td> 
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  </tr>`

        htmlString += `
                  <tr>
                  <td>&nbsp</td>
                  <td colspan="2"></td> 
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  </tr>`

        htmlString += `
                  <tr>      
                  <td>2</td>          
                  <td colspan="2">0.50 CT BELOW SIZE</td>                
                  <td> `+ belowOneCtTotalStone + `</td>
                  <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(belowOneCtSumWeight ?? 0) + `</td>
                  <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(((belowFiveCentTotalAmount ?? 0) / belowOneCtSumWeight) ?? 0) + `</td>
                  <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(belowFiveCentTotalAmount ?? 0) + `</td>
                  </tr>`

        htmlString += `
                  <tr>
                  <td></td>
                  <td colspan="2">CUT & POLISHED DIAMONDS</td> 
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  </tr>`

        htmlString += `
                  <tr>
                  <td></td>
                  <td colspan="2">AS PER PACKING LIST 2</td> 
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  </tr>`

        for (let index = 3; index <= 20; index++) {
          htmlString += `
                  <tr>
                  <td>&nbsp</td>                
                  <td colspan="2"></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  </tr>`
        }

        if (memoObj.shippingCharge > 0) {
          htmlString += `
                          <tr>
                          <td colspan="6" style="text-align:right" >Shipping Charge : </td>       
                          <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(memoObj.shippingCharge ?? 0) + `</td>
                          </tr>`
        }

        htmlString += `                        
                    </tbody>
                    <tfoot>
                    <tr>
                      <td colspan="3" style="text-align:right"><b>Grand Total</b></td>
                      <td><b>`+ memoObj.inventoryItems.length + `</b></td>
                      <td><b>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(sumWeight ?? 0) + `</b></td>          
                      <td>&nbsp</td>    
                      <td><b>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(sumGrandTotalPlusTax ?? 0) + ` (` + (memoObj.fromCurrency ?? "") + `)</b></td>
                    </tr>   
                    <tr>
                    <td colspan="7" style="text-align:right"><b>Amount in Words: </b> `+ this.utilityService.convertAmoutToWord(this.utilityService.ConvertToFloatWithDecimalTwoDigitRoundWithNum(sumGrandTotalPlusTax ?? 0), "USD") + `
                    </td>
                    </tr>
                    </tfoot>
                  </table>
                </div>  `
      }

      htmlString += ` 
              <span class="c-st border-bottom-2 border-left-2 border-right-2">Terms of Service / Declaration</span>     
                <div class="body-f-footer">                       
                <ul style="margin: 0;">  
                <li>The goods described and valued as above are delivered to you for examination, inspection and showing to prospective buyers only and remain our property subject to our order and shall be returned to us on demand.</li>  
                <li>Until such goods are returned to us and actually received by us, they are at your risk from all hazards.</li>
                <li>No right or power is given to you to sell, pledge, hypothecate or otherwise dispose of the goods or anyone of them regardless of any prior course of transactions between us.</li>                
                <li>A sale of any of these goods can only be effected and title pass to you if, as and when we as owner shall agree to such sale and a bill of sale is rendered therefor.</li>
              `
      if (memoObj.additionalDeclaration) {
        htmlString += `      
                          <li>`+ (memoObj.additionalDeclaration ?? "") + `</li>
                          `
      }
      htmlString += `
                </div>
  
                <div class="body-f-mid">
                <div class="p-2 di-bor-0"> 
                      <span class="c-st text-start">Payment instructions:</span>
                      <table>
                        <tbody>
                          <tr>
                            <td><b>BANK : </b></td>
                            <td>`+ (memoObj.bank.bankName ?? "") + `</td>
                          </tr>      
                          <tr>
                            <td><b>ADDRESS :</b></td>  
                            <td>` + (memoObj.bank.address?.line1 ?? "") + `,` + (memoObj.bank.address?.line2 ?? "") + `,
                            ` + (memoObj.bank.address?.city ?? "") + `,` + (memoObj.bank.address?.state ?? "") + `,` + (memoObj.bank.address?.country ?? "") + `</td>
                          </tr>
                          <tr>
                            <td><b>A/C NAME :</b></td>
                            <td>`+ (memoObj.bank.accountName ?? "") + `</td>
                          </tr>
                          <tr>
                            <td><b>A/C NO :</b></td>
                            <td>`+ (memoObj.bank.accountNo ?? "") + `</td>
                          </tr>
                          <tr>
                            <td><b>SWIFT CODE :</b></td>
                            <td>`+ (memoObj.bank.swift ?? "") + `</td>
                          </tr>  
                          <tr>
                          <td><b>INTERMEDIATE BANK:</b></td>
                          <td>`+ (memoObj.bank.intermediaryBankName ?? "") + `</td>                        
                          </tr>         
                          <tr>
                          <td><b>INTERMEDIATE ADDRESS:</b></td>                       
                          <td>`+ (memoObj.bank.intermediaryBankAddress ?? "") + `</td>                        
                          </tr>  
                          <tr>
                          <td><b>INTERMEDIATE SWIFTCODE:</b></td>                      
                          <td>`+ (memoObj.bank.intermediaryBankswift ?? "") + `</td>
                          </tr>            
                        </tbody>
                      </table>
                      </div> 
             
                      <div class="border-left-2" style="width: 30%;">
                      <div class="">
                          <span class="c-st">FOR , ` + (memoObj.organization.name ?? "") + `</span>
                          <div class="ch-sig">                                    
                          <br>
                          <br>
                          <br>
                          <br>
                          <br>  
                          <br>
                          <br>                    
                          <span>Authorized Signature(S)</span>             
                          </div>
                        </div>        
                        </div>
                      </div>
              </div>
            </div>
          </div>`

      if (memoObj.inventoryItems.length > 24) {
        //Above 1 Carat PL
        htmlString += `
            <div class="body-middle">
  
            <table>
            <tr>
            <td>Organization :<b> ` + (memoObj.organization.name ?? "") + `</b></td>
            <td>Invoice No : <b>` + (memoObj.memoNo ?? "") + `</b></td>
            <td>Date : <b>` + this.utilityService.getISOtoStringDate(memoObj.createdDate) + `</b></td>
            </tr>
            <tr>
            <td colspan="3"><b>Packing List 1</b></td>
            </tr>
            </table>
  
            <table>
              <thead>
                <th>No</th>
                <th>STONE ID</th>
                <th>PCS</th>
                <th>SHAPE</th>
                <th>CARATS</th>
                <th>COLOR</th>
                <th>CLARITY</th>
                <th>LAB</th>      
                <th>CERTI. NO</th>          
                <th>RATE `+ (memoObj.fromCurrency ?? "") + ` /PER CT</th>
                <th>TOTAL AMOUNT `+ (memoObj.fromCurrency ?? "") + `</th>
              </thead>
              <tbody>`

        for (let index = 0; index <= abovePointFiveCentData.length; index++) {
          let obj = abovePointFiveCentData[index];
          if (obj) {
            htmlString += `
                      <tr>
                      <td>`+ (index + 1) + `</td>
                      <td>`+ (obj.stoneId ?? "") + `</td>
                      <td>1</td>
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
                  <tr>
                    <td colspan="4"><b>Grand Total</b></td>
                    <td><b>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(aboveOneCtSumWeight ?? 0) + `</b></td>
                    <td colspan="5">&nbsp</td>                      
                    <td><b>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(aboveFiveCentAmont ?? 0) + `</b></td>
                  </tr>  
              </tbody>
              </table>
              </div>`

        //Below 1 Carat PL    
        htmlString += `
            <div class="body-middle" style="page-break-before: always;">
  
            <table>
            <tr>
            <td>Organization :<b> ` + (memoObj.organization.name ?? "") + `</b></td>
            <td>Invoice No : <b>` + (memoObj.memoNo ?? "") + `</b></td>
            <td>Date : <b>` + this.utilityService.getISOtoStringDate(memoObj.createdDate) + `</b></td>
            </tr>
            <tr>
            <td colspan="3"><b>Packing List 2</b></td>
            </tr>
            </table>
  
            <table>
              <thead>
                <th>No</th>
                <th>STONE ID</th>
                <th>PCS</th>
                <th>SHAPE</th>
                <th>CARATS</th>
                <th>COLOR</th>
                <th>CLARITY</th>
                <th>LAB</th>      
                <th>CERTI. NO</th>          
                <th>RATE `+ (memoObj.fromCurrency ?? "") + ` /PER CT</th>
                <th>TOTAL AMOUNT `+ (memoObj.fromCurrency ?? "") + `</th>
              </thead>
              <tbody>`

        for (let index = 0; index <= belowPointFiveCentData.length; index++) {
          let obj = belowPointFiveCentData[index];
          if (obj) {
            htmlString += `
                      <tr>
                      <td>`+ (index + 1) + `</td>
                      <td>`+ (obj.stoneId ?? "") + `</td>
                      <td>1</td>
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
                  <tr>
                    <td colspan="4"><b>Grand Total</b></td>
                    <td><b>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(belowOneCtSumWeight ?? 0) + `</b></td>
                    <td colspan="5">&nbsp</td>                      
                    <td><b>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(belowFiveCentTotalAmount ?? 0) + `</b></td>
                  </tr>  
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
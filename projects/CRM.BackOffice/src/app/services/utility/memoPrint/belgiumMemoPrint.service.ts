import { Injectable } from '@angular/core';
import { MasterConfig, MasterDNorm } from 'shared/enitites';
import { UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { MasterConfigService } from '../../masterconfig/masterconfig.service';
import { InventoryItems, Memo } from '../../../entities';

@Injectable({
    providedIn: 'root'
})

export class BelgiumMemoPrint {
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

        if (memoType == "BELGIUMLOCAL") {
            htmlString += `<body onload="window.print(); window.close();">`

            for (let Copyindex = 1; Copyindex <= 2; Copyindex++) {//Duplicate Copy Loop        
                var perPageCount: number = 14;
                var totalPageCount: number;
                var skip: number = 0;

                const pageCount = memoObj.inventoryItems.length / perPageCount;
                const roundedPageCount = Math.floor(pageCount);
                totalPageCount = roundedPageCount < pageCount ? roundedPageCount + 1 : roundedPageCount;

                for (let index = 1; index <= totalPageCount; index++) {
                    var pageTotalNetAmount = 0;
                    var pageTotalWeight = 0;

                    htmlString += `  
              <div class="chal-wrap con-inv di-inv">
                <div class="chal-head">
                  <div class="logo">
                    <img src="assets/billimage/CGNew.png" alt="logo">
                  </div>
                  <div class="di-info" style="text-align: center;">
                  <span>` + (memoObj.organization.address?.line1 ? memoObj.organization.address.line1 + ',' : "") + (memoObj.organization.address?.line2 ?? "") + `</span>            
                  <span>` + (memoObj.organization.address?.city ? memoObj.organization.address?.city + `,` : "") + (memoObj.organization.address?.country ?? "") + `</span> 
                  <span>Email: ` + (memoObj.organization.email ?? "") + `</span>            
                  </div>
                  <div class="di-info">
                  <span>BTW: ` + (memoObj.organization.taxNo ?? "") + `</span>   
                  <span>Contact No: ` + ('+' + memoObj.organization.phoneNo.slice(1) ?? "") + `</span>        
                  </div>
                </div>
      
                <div class="chal-body">`
                    if (Copyindex == 1) {
                        htmlString += `<span class="c-st border-left-2 border-right-2 border-bottom-2">MEMO DELIVERY NOTE - ORIGINAL </span>`;
                    }
                    if (Copyindex == 2) {
                        htmlString += `<span class="c-st border-left-2 border-right-2 border-bottom-2">MEMO DELIVERY NOTE - DUPLICATE </span>`;
                    }

                    htmlString += `
                  <div class="body-top ps-1 border-bottom-0">
                    <div class="bo-left">
                    `
                    if (memoObj.party.name)
                        htmlString +=
                            `
                      <span class="c-st text-start" STYLE="font-weight:bold">To.: ` + (memoObj.party.name ?? "") + `</span>
                      `
                    else
                        `
                      <span class="c-st text-start" STYLE="font-weight:bold">To.: ` + (memoObj.party.contactPerson ?? "") + `</span>
                      `
                    htmlString += `
                      <span>` + (memoObj.party.address?.line1 ? memoObj.party.address.line1 + ',' : "") + (memoObj.party.address.line2 ?? "") + `</span>            
                      <span>` + (memoObj.party.address?.city ? memoObj.party.address?.city + `,` : "") + (memoObj.party.address?.country ?? "") + `</span>            
                      <span>ZipCode : ` + (memoObj.party.address.zipCode ?? "") + `</span>                
                      <span>TEL: ` + (memoObj.party.mobileNo ?? "") + ` BTW: ` + (memoObj.party.taxNo ?? "") + `</span>                       
                    </div>
      
                    <div class="di-bor-0">
                    <table>
                    <tbody>
                    `
                    if (memoObj?.broker?.name)
                        htmlString += `   
                    <tr>
                    <td><b>Broker:</b></td>
                    <td>` + (memoObj.broker.name ?? "") + `</td>
                    </tr>
                    `
                    if (memoObj.party.name)
                        htmlString +=
                            `
                    <tr>
                    <td><b>Through:</b></td>
                    <td>` + (memoObj.party.contactPerson ?? "") + ` - ` + (memoObj.takenBy ?? "") + `</td>
                    </tr>
                      `
                    else
                        `
                  <tr>
                  <td><b>Through:</b></td>
                  <td>` + (memoObj.takenBy ?? "") + `</td>
                  </tr>
                      `
                    htmlString += `
                    </tbody>
                    </table>
                    </div>
      
                    <div class="di-bor-0">
                    <table>
                      <tbody>
                        <tr>
                          <td><b>Memo NO.</b></td>
                          <td>` + memoObj.memoNo + `</td>
                        </tr>
                        <tr>
                          <td><b>Memo Date:</b></td>
                          <td>` + this.utilityService.getISOtoStringDate(memoObj.createdDate) + `</td>
                        </tr>
                        <tr>
                          <td><b>Memo Expire Days:</b></td>
                          <td>` + memoObj.expiredDays + `</td>
                        </tr>
                        <tr>
                        <td><b>Memo Expire Date:</b></td>
                        <td>` + this.utilityService.getISOtoStringDate(memoObj.expiredDate) + `</td>                    
                        </tr>                  
                      </tbody>
                    </table>
                  </div>
      
                    <div class="di-bor-0">
                      <table>
                        <tbody>                   
                          <tr>
                            <td><b>Place Of Supply:</b></td>
                            <td>` + (memoObj.organization.address?.city ? memoObj.organization.address?.city + `,` : "") + (memoObj.organization.address?.country ?? "") + `</td>
                          </tr> 
                          `
                    htmlString += `                        
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div class="body-middle">
                    <table>                
                      <tbody>
              <table>
              <thead>
      
              <th>NO</th>
              <th>StockID</th>
              <th>PCS</th>
              <th>Shape</th>
              <th>Size</th>
              <th>Color</th>
              <th>Clarity</th>
              <th>Measurement</th>
              <th>Depth</th>
              <th>Table</th>
              <th>LAB</th>
              <th>CertiNo</th>
              <th>Rap</th>
              <th>Disc</th>
              <th>PerCarat ($)</th>
              <th>NetAmount ($)</th>
              <th>Remark</th>
      
              </thead>
              <tbody>`

                    let filterInventoryItems = memoObj.inventoryItems.slice(skip, skip + perPageCount);
                    var totweight: number = 0;
                    var totnetAmount: number = 0

                    for (let indexS = 0; indexS <= filterInventoryItems.length; indexS++) {
                        let obj = filterInventoryItems[indexS];
                        if (obj) {
                            pageTotalNetAmount += obj.price.netAmount ?? 0;
                            pageTotalWeight += obj.weight
                            htmlString += `            
                        <tr>
                        <td>`+ (indexS + 1 + skip) + `</td>
                        <td>`+ (obj.stoneId ?? "") + `</td>
                        <td><b>1</b></td>
                        <td>`+ (obj.shape ?? "") + `</td>
                        <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.weight ?? 0) + `</td>
                        <td>`+ (obj.color ?? "") + `</td>
                        <td>`+ (obj.clarity ?? "") + `</td>
                        <td>`+ this.utilityService.getMesurmentString(obj.shape, obj.measurement.length, obj.measurement.width, obj.measurement.height) + `</td>
                        <td>`+ (obj.measurement.depth ?? "") + `</td>         
                        <td>`+ (obj.measurement.table ?? "") + `</td>   
                        <td>`+ (obj.lab ?? "") + `</td>              
                        <td>`+ (obj.certificateNo ?? "") + `</td>      
                        <td>`+ (obj.price.rap ?? "") + `</td>
                        <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit((obj.price.discount ?? 0)) + `</td> 
                        <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.perCarat ?? 0) + `</td>
                        <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit((obj.price.netAmount ?? 0)) + `</td>  
                        <td style="width: 200px;"></td>
                        </tr>`
                        }
                    }
                    skip = skip + perPageCount;
                    filterInventoryItems.forEach(z => { totweight += z.weight });
                    filterInventoryItems.forEach(z => { totnetAmount += z.price.netAmount ?? 0 });

                    for (let index = filterInventoryItems.length; index < 14; index++) {
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
                      <td></td>
                      <td></td>
                      <td></td>
                      </tr>`
                    }

                    htmlString += `
              <tr>        
              <td colspan="2"><b>Page Total</b></td>
              <td><b>`+ filterInventoryItems.length + `</b></td>
              <td >&nbsp</td>
              <td><b>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(pageTotalWeight ?? 0) + `</b></td>  
              <td colspan="10">&nbsp</td>
              <td ><b>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(pageTotalNetAmount) + ` (` + (memoObj.fromCurrency ?? "") + `)</b></td>
              <td >&nbsp</td>
              </tr>`

                    htmlString += `                        
                  </tbody>
                  <tfoot>`

                    htmlString += ` 
                  <tr>
                    <td colspan="2"><b>Grand Total </b></td>
                    <td><b>`+ memoObj.inventoryItems.length + `</b></td>
                    <td >&nbsp</td>
                    <td><b>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(sumWeight ?? 0) + `</b></td>     
                    <td colspan="10" style="text-align:right; padding-right:10px;"><b></b></td>
                    <td><b>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(memoObj.totalAmount ?? 0) + ` (` + (memoObj.fromCurrency ?? "") + `)</b></td>
                    <td >&nbsp</td>
                    </tr>`

                    htmlString += `        
                      </tfoot>
                    </table>
                  </div>    
                    <div class="body-f-footer">              
                    <ul>
                    <p style="list-style-type:none;text-align:left;font-weight:600;">Memo Receiver Person and Related Company Agreed for Below Terms and Conditions : </p>              
                    <li>The goods are entrusted to me for the sole purpose of being shown to be intended for inspection, assortment, or manufacturing.</li>          
                    <li>The goods remain your property, and I acquire no right to property or interest in them till a sale note signed by you is passed and till the price is paid in respect thereof, even though the reference is made to the rate or price of the particulars or goods herein.</li>          
                    <li>I agree not to sell, pledge, mortgage, or hypothecate the said goods or otherwise deal with them in any manner till a sale not signed by you is passed, or the price is paid by you.</li>            
                    <li>The goods are to be returned to you whenever demanded.</li>               
                    <li>The goods will be at my risk in all respects till a sale note signed by you is passed in respect thereof and till the price is paid to you, or till the goods are returned to you, and I am responsible to you for the return of the said goods in the same condition as when I received them.</li>   
                    </ul>    
                    </div>
                    <div class="body-f-mid">
                    <div class="body-f-left">
                      <span class="c-st">Receiver</span>
                      <div class="ch-sig">      
                      <span>&nbsp</span>
                      <span>&nbsp</span>               
                      </div>
                    </div>
                    <div class="body-f-right">
                      <span class="c-st di">Issue By</span>
                      <div class="ch-sig">
                      <span>&nbsp</span>
                      <span>&nbsp</span>                
                      </div>
                    </div>
                  </div>
                  </div>   
                <div class="pager border-bottom-2 border-left-2 border-right-2">
                <span>Page `+ index + ` of ` + totalPageCount + `</span>
                </div> 
                `
                    htmlString += `
                <div class="brd-remove">
                <table>
                <tr>
                <td>&nbsp</td>          
                </tr>
                </table>
                </div>`
                }//Main Foor Loop End  
            }
            htmlString += `</div>
                          </body>
                          </body>
                          </html>`;
        }
        else if (memoType == "BELGIUMOVERSEAS") {
            htmlString += `    
        <body onload="window.print(); window.close();">   
          <div class="chal-wrap con-inv di-inv">
            <div class="chal-head">
              <div class="logo">
              <img src="assets/billimage/CGNew.png" alt="logo">
              </div>
              <div class="di-info">
              <span>Rough & Polished Diamonds - Import & Export</span>
                <span>
                ` + (memoObj.organization.address?.line1 ?? "") + `,` + (memoObj.organization.address?.line2 ?? "") + `<br>
                ` + (memoObj.organization.address?.city ?? "") + `,` + (memoObj.organization.address?.state ?? "") + `,` + (memoObj.organization.address?.country ?? "") + `
                </span>          
                <span>Tele No.` + (memoObj.organization.phoneNo ?? "") + `,` + (memoObj.organization.mobileNo ?? "") + `</span>          
                <span>Email.` + (memoObj.organization.email ?? "") + `</span>        
              </div>
              <div class="cd-details">
                  <p><b>VAT BE: -0478.554.943</b></p>
                  <p><b>HRAnt: -351.856</b></p>
                  </div>
            </div> 
            
            <div class="chal-body">
              <span class="c-st border-left-2 border-right-2">Consignment Invoice</span>
              <span class="c-st text-start border-left-2 border-right-2">  Buyer (If other than consignee):</span>
              <div class="bo-left body-top ps-1 border-bottom-0">
                <div class="di-bor-0">          
                      <span>` + (memoObj.party.name ?? "") + `</span>
                      <span>` + (memoObj.party.address.line1 ?? "") + `,` + (memoObj.party.address.line2 ?? "") + `</span>            
                      <span>` + (memoObj.party.address.city ?? "") + `,` + (memoObj.party.address.state ?? "") + `,` + (memoObj.party.address.country ?? "") + `</span>            
                      <span>ZipCode : ` + (memoObj.party.address.zipCode ?? "") + `</span>                
                      <span>TEL: ` + (memoObj.party.mobileNo ?? "") + ` Tax No: ` + (memoObj.party.incomeTaxNo ?? "") + `</span>            
                </div>
      
                <div class="di-bor-0">
                  <table>
                    <tbody>
                      <tr>
                        <td><b>INVOICE NO.</b></td>
                        <td>` + memoObj.memoNo + `</td>
                      </tr>
                      <tr>
                        <td><b>DATE</b></td>
                        <td>: ` + this.utilityService.getISOtoStringDate(memoObj.createdDate) + `</td>
                      </tr>
                      <tr>
                        <td><b>TERMS</b></td>
                        <td>` + (memoObj.terms ?? "") + `</td>
                      </tr>   
                    </tbody>
                  </table>
                </div>
              </div>`

            if (memoObj.inventoryItems.length < 15) {

                htmlString += `
              <div class="body-middle">
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
                for (let index = memoObj.inventoryItems.length; index <= 19; index++) {
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
              <div class="body-middle">
                <table>
                  <thead>
                    <th>No</th>                       
                    <th colspan="6">DESCRIPTION</th>
                    <th>PCS</th>
                    <th>CARATS</th>
                    <th>RATE `+ memoObj.fromCurrency + ` PER CT</th>
                    <th>TOTAL AMOUNT `+ memoObj.fromCurrency + `</th>
                  </thead>
                  <tbody>`


                htmlString += `
                      <tr>
                      <td></td>
                      <td colspan="6">CUT & POLISHED DIAMONDS</td>                
                      <td> `+ memoObj.inventoryItems.length + `</td>
                      <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(sumWeight ?? 0) + `</td>
                      <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(((memoObj.totalAmount ?? 0) / sumWeight) ?? 0) + `</td>
                      <td>`+ memoObj.totalAmount + `</td>
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

                for (let index = 3; index <= 14; index++) {
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

            if (memoObj.shippingCharge > 0) {
                htmlString += `
                      <tr>
                      <td colspan="10" style="text-align:right; padding-right:10px;" >Shipping Charge</td> 
                      <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(memoObj.shippingCharge ?? 0) + `</td>
                      </tr>`
            }
            if (taxPerOne) {
                htmlString += `
                      <tr>
                      <td colspan="10" style="text-align:right; padding-right:10px;" >`+ taxNameOne + ` ( ` + taxPerOne + ` % ) </td>
                      <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit((taxPerOne * (memoObj.totalAmount ?? 0)) / 100) + `</td>
                      </tr>`
            }
            if (taxPerTwo) {
                htmlString += `
                      <tr>
                      <td colspan="10" style="text-align:right; padding-right:10px;" >`+ taxNameTwo + ` ( ` + taxPerTwo + ` % ) </td>
                      <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit((taxPerTwo * (memoObj.totalAmount ?? 0)) / 100) + `</td>
                      </tr>`
            }

            htmlString += `                        
                  </tbody>
                  <tfoot>
                  <tr>
                    <td colspan="7">Grand Total </td>
                    <td><b>`+ memoObj.inventoryItems.length + `</b></td>
                    <td><b>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(sumWeight ?? 0) + `</b></td>     
                    <td>&nbsp</td>
                    <td><b>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(memoObj.totalAmount ?? 0) + ` (` + (memoObj.fromCurrency ?? "") + `)</b></td>
                  </tr>
                  <tr>
                    <td colspan="9"></td>  
                    <td>`+ memoObj.fromCurRate + ` (` + memoObj.fromCurrency + `) ` + `= ` + memoObj.toCurRate + ` (` + memoObj.toCurrency + `)` + `</td>
                    <td>`+ (memoObj.totalAmount ?? 0 * (memoObj.toCurRate ?? 0)).toFixed(2) + ` (` + memoObj.toCurrency + `)</td>
                  </tr>             
                  </tfoot>
                </table>
                </div>
              
              <div class="body-fotter">  
              <div class="body-middle">           
              <table>          
              <tr>
                <td><b>CIF : </b>`+ memoObj.portOfLoading + `</td>
                <td><b>PORT : </b>`+ memoObj.portOfLoading + `</td>
                <td><b>SHIPPED VIA : </b>`+ memoObj.courierName.name + `</td>
                <td><b>INSURED BY : </b>`+ memoObj.courierName.name + `</td>
              </tr>             
              </tfoot>
            </table>
            </div> 
      
            <div class="body-top border-top-0 border-bottom-0">
              <div class="bo-left w-70 border-right-2 border-bottom-2 ps-1">       
                    <span class="c-st text-start">Payment instructions:</span>
                    <table>
                    <tbody>
                    <tr>
                    <td><b>BANK NAME: </b></td>
                    <td>`+ (memoObj.bank.bankName ?? "") + `</td>
                  </tr>
                  <tr>
                    <td><b>BANK CODE : </b></td>
                    <td>`+ (memoObj.bank.ifsc ?? "") + `</td>
                  </tr>
                  <tr>
                    <td><b>ADDRESS :</b></td>
                    <td>`+ (memoObj.bank.address.line1 ? memoObj.bank.address.line1 + `,` : "") + (memoObj.bank.address.line2 ? memoObj.bank.address.line2 + `,` : "") + (memoObj.bank.address.city ? memoObj.bank.address.city + `,` : "")
                + (memoObj.bank.address.state ? memoObj.bank.address.state + `,` : "") + (memoObj.bank.address.country ? memoObj.bank.address.country + `,` : "") + (memoObj.bank.address.zipCode ?? "") + `</td>
                  </tr>
                  <tr>
                  <td><b>ACCOUNT NAME :</b></td>
                  <td>`+ (memoObj.bank.accountName ?? "") + `</td>
                  </tr>
                  <tr>
                  <td><b>A/C NO :</b></td>
                  <td>`+ (memoObj.bank.accountNo ?? "") + `</td>
                  </tr>
                  <tr>
                  <tr>
                  <td><b>IBAN NO :</b></td>
                  <td>`+ (memoObj.bank.iBan ?? "") + `</td>
                  </tr>
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
                  <div class="w-30 p-2 border-bottom-2">
                    <div>
                    <span>&nbsp</span>
                    <div class="ch-sig">
                    <span>&nbsp</span>
                    <span>&nbsp</span>
                    <span>&nbsp</span>   
                    <span>&nbsp</span>
                    <span>&nbsp</span>
                    <span>Signature</span>  
                    <span>Date : ` + this.utilityService.getISOtoStringDate(memoObj.createdDate) + `</span>
                    </div>
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
              invoice. The buyer acknowledged that this invoice is pledged to ` + (memoObj.bank.bankName ?? "") + ` and that releases can
              only be obtained through payment on the account of the seller at ` + (memoObj.bank.bankName ?? "") + ` as mentioned on this
              invoice. This invoice may never be compensated with claims from the buyer on the seller.</li>
              <li>The diamonds here in invoiced are exclusively of natural origin and untreated based on personal knowledge and/or
              written guarantees provided by the supplier of these diamonds.</li>
              <li>The diamonds herein invoiced have been purchased from legitimate sources not involved in funding conflict and in
              compliance with United Nation resolutions. The seller hereby guarantees that these diamonds are conflict free, based
              on personal knowledge and/or written guarantees provided by the supplier of these diamonds. </li>      
              <b style="text-decoration: underline;">H.R.A 351 856, BTW BE 0478 554 943 </b>      
              <li>The Antwerp Tribunal of Commerce is solely competent in case of litigation Vrij van B.T.W. Art. 42 van het Wetboek.Above mentioned good will be consignment until receipt of the payment of this invoice </li>
              `
            if (memoObj.additionalDeclaration) {
                htmlString += `<li>` + (memoObj.additionalDeclaration ?? "") + `</li>`
            }
            htmlString += `  
              </ul>
              </div>
              </div>
              </div>
            </div>
          </div>
          `

            if (memoObj.inventoryItems.length > 14) {
                htmlString += `
            <div class="body-middle">
      
            <table>
            <tr>
            <td>Organization :<b> ` + (memoObj.organization.name ?? "") + `</b></td>      
            <td>INVOICE No : <b>` + (memoObj.memoNo ?? "") + `</b></td>
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
                <th>CERTI. NO</th>     
                <th>RAP `+ memoObj.fromCurrency + `</th>
                <th>DISC %</th>           
                <th>RATE `+ memoObj.fromCurrency + ` PER CT</th>
                <th>TOTAL AMOUNT `+ memoObj.fromCurrency + `</th>
              </thead>
              <tbody>`

                for (let index = 0; index <= memoObj.inventoryItems.length; index++) {
                    let obj = memoObj.inventoryItems[index];
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
                      <td>`+ obj.price.rap + `</td>
                      <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.discount ?? 0) ?? "") + `</td> 
                      <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.perCarat ?? 0) ?? "") + `</td>
                      <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.netAmount ?? 0) ?? "") + `</td>
                      </tr>`
                    }
                }
            }

            htmlString += `
          </body>
          </html>
          `;
        }

        return htmlString;
    }

    public async getAbovePointFiveCentMemoPrint(memoObj: Memo, memoType:string) {
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

        if (memoType == "BELGIUMLOCAL") {
            htmlString += `<body onload="window.print(); window.close();">`

            for (let Copyindex = 1; Copyindex <= 2; Copyindex++) {//Duplicate Copy Loop        
                var perPageCount: number = 14;
                var totalPageCount: number;
                var skip: number = 0;

                const pageCount = memoObj.inventoryItems.length / perPageCount;
                const roundedPageCount = Math.floor(pageCount);
                totalPageCount = roundedPageCount < pageCount ? roundedPageCount + 1 : roundedPageCount;

                for (let index = 1; index <= totalPageCount; index++) {
                    var pageTotalNetAmount = 0;
                    var pageTotalWeight = 0;

                    htmlString += `  
              <div class="chal-wrap con-inv di-inv">
                <div class="chal-head">
                  <div class="logo">
                    <img src="assets/billimage/CGNew.png" alt="logo">
                  </div>
                  <div class="di-info" style="text-align: center;">
                  <span>` + (memoObj.organization.address?.line1 ? memoObj.organization.address.line1 + ',' : "") + (memoObj.organization.address?.line2 ?? "") + `</span>            
                  <span>` + (memoObj.organization.address?.city ? memoObj.organization.address?.city + `,` : "") + (memoObj.organization.address?.country ?? "") + `</span> 
                  <span>Email: ` + (memoObj.organization.email ?? "") + `</span>            
                  </div>
                  <div class="di-info">
                  <span>BTW: ` + (memoObj.organization.taxNo ?? "") + `</span>   
                  <span>Contact No: ` + ('+' + memoObj.organization.phoneNo.slice(1) ?? "") + `</span>        
                  </div>
                </div>
      
                <div class="chal-body">`
                    if (Copyindex == 1) {
                        htmlString += `<span class="c-st border-left-2 border-right-2 border-bottom-2">MEMO DELIVERY NOTE - ORIGINAL </span>`;
                    }
                    if (Copyindex == 2) {
                        htmlString += `<span class="c-st border-left-2 border-right-2 border-bottom-2">MEMO DELIVERY NOTE - DUPLICATE </span>`;
                    }

                    htmlString += `
                  <div class="body-top ps-1 border-bottom-0">
                    <div class="bo-left">
                    `
                    if (memoObj.party.name)
                        htmlString +=
                            `
                      <span class="c-st text-start" STYLE="font-weight:bold">To.: ` + (memoObj.party.name ?? "") + `</span>
                      `
                    else
                        `
                      <span class="c-st text-start" STYLE="font-weight:bold">To.: ` + (memoObj.party.contactPerson ?? "") + `</span>
                      `
                    htmlString += `
                      <span>` + (memoObj.party.address?.line1 ? memoObj.party.address.line1 + ',' : "") + (memoObj.party.address.line2 ?? "") + `</span>            
                      <span>` + (memoObj.party.address?.city ? memoObj.party.address?.city + `,` : "") + (memoObj.party.address?.country ?? "") + `</span>            
                      <span>ZipCode : ` + (memoObj.party.address.zipCode ?? "") + `</span>                
                      <span>TEL: ` + (memoObj.party.mobileNo ?? "") + ` BTW: ` + (memoObj.party.taxNo ?? "") + `</span>                       
                    </div>
      
                    <div class="di-bor-0">
                    <table>
                    <tbody>
                    `
                    if (memoObj?.broker?.name)
                        htmlString += `   
                    <tr>
                    <td><b>Broker:</b></td>
                    <td>` + (memoObj.broker.name ?? "") + `</td>
                    </tr>
                    `
                    if (memoObj.party.name)
                        htmlString +=
                            `
                    <tr>
                    <td><b>Through:</b></td>
                    <td>` + (memoObj.party.contactPerson ?? "") + ` - ` + (memoObj.takenBy ?? "") + `</td>
                    </tr>
                      `
                    else
                        `
                  <tr>
                  <td><b>Through:</b></td>
                  <td>` + (memoObj.takenBy ?? "") + `</td>
                  </tr>
                      `
                    htmlString += `
                    </tbody>
                    </table>
                    </div>
      
                    <div class="di-bor-0">
                    <table>
                      <tbody>
                        <tr>
                          <td><b>Memo NO.</b></td>
                          <td>` + memoObj.memoNo + `</td>
                        </tr>
                        <tr>
                          <td><b>Memo Date:</b></td>
                          <td>` + this.utilityService.getISOtoStringDate(memoObj.createdDate) + `</td>
                        </tr>
                        <tr>
                          <td><b>Memo Expire Days:</b></td>
                          <td>` + memoObj.expiredDays + `</td>
                        </tr>
                        <tr>
                        <td><b>Memo Expire Date:</b></td>
                        <td>` + this.utilityService.getISOtoStringDate(memoObj.expiredDate) + `</td>                    
                        </tr>                  
                      </tbody>
                    </table>
                  </div>
      
                    <div class="di-bor-0">
                      <table>
                        <tbody>                   
                          <tr>
                            <td><b>Place Of Supply:</b></td>
                            <td>` + (memoObj.organization.address?.city ? memoObj.organization.address?.city + `,` : "") + (memoObj.organization.address?.country ?? "") + `</td>
                          </tr> 
                          `
                    htmlString += `                        
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div class="body-middle">
                    <table>                
                      <tbody>
              <table>
              <thead>
      
              <th>NO</th>
              <th>StockID</th>
              <th>PCS</th>
              <th>Shape</th>
              <th>Size</th>
              <th>Color</th>
              <th>Clarity</th>
              <th>Measurement</th>
              <th>Depth</th>
              <th>Table</th>
              <th>LAB</th>
              <th>CertiNo</th>
              <th>Rap</th>
              <th>Disc</th>
              <th>PerCarat ($)</th>
              <th>NetAmount ($)</th>
              <th>Remark</th>
      
              </thead>
              <tbody>`

                    let filterInventoryItems = memoObj.inventoryItems.slice(skip, skip + perPageCount);
                    var totweight: number = 0;
                    var totnetAmount: number = 0

                    for (let indexS = 0; indexS <= filterInventoryItems.length; indexS++) {
                        let obj = filterInventoryItems[indexS];
                        if (obj) {
                            pageTotalNetAmount += obj.price.netAmount ?? 0;
                            pageTotalWeight += obj.weight
                            htmlString += `            
                        <tr>
                        <td>`+ (indexS + 1 + skip) + `</td>
                        <td>`+ (obj.stoneId ?? "") + `</td>
                        <td><b>1</b></td>
                        <td>`+ (obj.shape ?? "") + `</td>
                        <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.weight ?? 0) + `</td>
                        <td>`+ (obj.color ?? "") + `</td>
                        <td>`+ (obj.clarity ?? "") + `</td>
                        <td>`+ this.utilityService.getMesurmentString(obj.shape, obj.measurement.length, obj.measurement.width, obj.measurement.height) + `</td>
                        <td>`+ (obj.measurement.depth ?? "") + `</td>         
                        <td>`+ (obj.measurement.table ?? "") + `</td>   
                        <td>`+ (obj.lab ?? "") + `</td>              
                        <td>`+ (obj.certificateNo ?? "") + `</td>      
                        <td>`+ (obj.price.rap ?? "") + `</td>
                        <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit((obj.price.discount ?? 0)) + `</td> 
                        <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.perCarat ?? 0) + `</td>
                        <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit((obj.price.netAmount ?? 0)) + `</td>  
                        <td style="width: 200px;"></td>
                        </tr>`
                        }
                    }
                    skip = skip + perPageCount;
                    filterInventoryItems.forEach(z => { totweight += z.weight });
                    filterInventoryItems.forEach(z => { totnetAmount += z.price.netAmount ?? 0 });

                    for (let index = filterInventoryItems.length; index < 14; index++) {
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
                      <td></td>
                      <td></td>
                      <td></td>
                      </tr>`
                    }

                    htmlString += `
              <tr>        
              <td colspan="2"><b>Page Total</b></td>
              <td><b>`+ filterInventoryItems.length + `</b></td>
              <td >&nbsp</td>
              <td><b>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(pageTotalWeight ?? 0) + `</b></td>  
              <td colspan="10">&nbsp</td>
              <td ><b>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(pageTotalNetAmount) + ` (` + (memoObj.fromCurrency ?? "") + `)</b></td>
              <td >&nbsp</td>
              </tr>`

                    htmlString += `                        
                  </tbody>
                  <tfoot>`

                    htmlString += ` 
                  <tr>
                    <td colspan="2"><b>Grand Total </b></td>
                    <td><b>`+ memoObj.inventoryItems.length + `</b></td>
                    <td >&nbsp</td>
                    <td><b>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(sumWeight ?? 0) + `</b></td>     
                    <td colspan="10" style="text-align:right; padding-right:10px;"><b></b></td>
                    <td><b>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(memoObj.totalAmount ?? 0) + ` (` + (memoObj.fromCurrency ?? "") + `)</b></td>
                    <td >&nbsp</td>
                    </tr>`

                    htmlString += `        
                      </tfoot>
                    </table>
                  </div>    
                    <div class="body-f-footer">              
                    <ul>
                    <p style="list-style-type:none;text-align:left;font-weight:600;">Memo Receiver Person and Related Company Agreed for Below Terms and Conditions : </p>              
                    <li>The goods are entrusted to me for the sole purpose of being shown to be intended for inspection, assortment, or manufacturing.</li>          
                    <li>The goods remain your property, and I acquire no right to property or interest in them till a sale note signed by you is passed and till the price is paid in respect thereof, even though the reference is made to the rate or price of the particulars or goods herein.</li>          
                    <li>I agree not to sell, pledge, mortgage, or hypothecate the said goods or otherwise deal with them in any manner till a sale not signed by you is passed, or the price is paid by you.</li>            
                    <li>The goods are to be returned to you whenever demanded.</li>               
                    <li>The goods will be at my risk in all respects till a sale note signed by you is passed in respect thereof and till the price is paid to you, or till the goods are returned to you, and I am responsible to you for the return of the said goods in the same condition as when I received them.</li>   
                    </ul>    
                    </div>
                    <div class="body-f-mid">
                    <div class="body-f-left">
                      <span class="c-st">Receiver</span>
                      <div class="ch-sig">      
                      <span>&nbsp</span>
                      <span>&nbsp</span>               
                      </div>
                    </div>
                    <div class="body-f-right">
                      <span class="c-st di">Issue By</span>
                      <div class="ch-sig">
                      <span>&nbsp</span>
                      <span>&nbsp</span>                
                      </div>
                    </div>
                  </div>
                  </div>   
                <div class="pager border-bottom-2 border-left-2 border-right-2">
                <span>Page `+ index + ` of ` + totalPageCount + `</span>
                </div> 
                `
                    htmlString += `
                <div class="brd-remove">
                <table>
                <tr>
                <td>&nbsp</td>          
                </tr>
                </table>
                </div>`
                }//Main Foor Loop End  
            }
            htmlString += `</div>
                          </body>
                          </body>
                          </html>`;
        }

        else if (memoType == "BELGIUMOVERSEAS") {
            htmlString += `    
        <body onload="window.print(); window.close();">   
          <div class="chal-wrap con-inv di-inv">
            <div class="chal-head">
              <div class="logo">
              <img src="assets/billimage/CGNew.png" alt="logo">
              </div>
              <div class="di-info">
              <span>Rough & Polished Diamonds - Import & Export</span>
                <span>
                ` + (memoObj.organization.address?.line1 ?? "") + `,` + (memoObj.organization.address?.line2 ?? "") + `<br>
                ` + (memoObj.organization.address?.city ?? "") + `,` + (memoObj.organization.address?.state ?? "") + `,` + (memoObj.organization.address?.country ?? "") + `
                </span>          
                <span>Tele No.` + (memoObj.organization.phoneNo ?? "") + `,` + (memoObj.organization.mobileNo ?? "") + `</span>          
                <span>Email.` + (memoObj.organization.email ?? "") + `</span>        
              </div>
              <div class="cd-details">
                  <p><b>VAT BE: -0478.554.943</b></p>
                  <p><b>HRAnt: -351.856</b></p>
                  </div>
            </div> 
            
            <div class="chal-body">
              <span class="c-st border-left-2 border-right-2">Consignment Invoice</span>
              <span class="c-st text-start border-left-2 border-right-2">  Buyer (If other than consignee):</span>
              <div class="bo-left body-top ps-1 border-bottom-0">
                <div class="di-bor-0">          
                      <span>` + (memoObj.party.name ?? "") + `</span>
                      <span>` + (memoObj.party.address.line1 ?? "") + `,` + (memoObj.party.address.line2 ?? "") + `</span>            
                      <span>` + (memoObj.party.address.city ?? "") + `,` + (memoObj.party.address.state ?? "") + `,` + (memoObj.party.address.country ?? "") + `</span>            
                      <span>ZipCode : ` + (memoObj.party.address.zipCode ?? "") + `</span>                
                      <span>TEL: ` + (memoObj.party.mobileNo ?? "") + ` Tax No: ` + (memoObj.party.incomeTaxNo ?? "") + `</span>            
                </div>
      
                <div class="di-bor-0">
                  <table>
                    <tbody>
                      <tr>
                        <td><b>INVOICE NO.</b></td>
                        <td>` + memoObj.memoNo + `</td>
                      </tr>
                      <tr>
                        <td><b>DATE</b></td>
                        <td>: ` + this.utilityService.getISOtoStringDate(memoObj.createdDate) + `</td>
                      </tr>
                      <tr>
                        <td><b>TERMS</b></td>
                        <td>` + (memoObj.terms ?? "") + `</td>
                      </tr>   
                    </tbody>
                  </table>
                </div>
              </div>`

            if (memoObj.inventoryItems.length < 15) {

                htmlString += `
              <div class="body-middle">
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
                for (let index = memoObj.inventoryItems.length; index <= 19; index++) {
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
              <div class="body-middle">
                <table>
                  <thead>
                    <th>No</th>                       
                    <th colspan="6">DESCRIPTION</th>
                    <th>PCS</th>
                    <th>CARATS</th>
                    <th>RATE `+ memoObj.fromCurrency + ` PER CT</th>
                    <th>TOTAL AMOUNT `+ memoObj.fromCurrency + `</th>
                  </thead>
                  <tbody>`


                htmlString += `
                      <tr>
                      <td></td>
                      <td colspan="6">CUT & POLISHED DIAMONDS</td>                
                      <td> `+ memoObj.inventoryItems.length + `</td>
                      <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(sumWeight ?? 0) + `</td>
                      <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(((memoObj.totalAmount ?? 0) / sumWeight) ?? 0) + `</td>
                      <td>`+ memoObj.totalAmount + `</td>
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

                for (let index = 3; index <= 14; index++) {
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

            if (memoObj.shippingCharge > 0) {
                htmlString += `
                      <tr>
                      <td colspan="10" style="text-align:right; padding-right:10px;" >Shipping Charge</td> 
                      <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(memoObj.shippingCharge ?? 0) + `</td>
                      </tr>`
            }
            if (taxPerOne) {
                htmlString += `
                      <tr>
                      <td colspan="10" style="text-align:right; padding-right:10px;" >`+ taxNameOne + ` ( ` + taxPerOne + ` % ) </td>
                      <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit((taxPerOne * (memoObj.totalAmount ?? 0)) / 100) + `</td>
                      </tr>`
            }
            if (taxPerTwo) {
                htmlString += `
                      <tr>
                      <td colspan="10" style="text-align:right; padding-right:10px;" >`+ taxNameTwo + ` ( ` + taxPerTwo + ` % ) </td>
                      <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit((taxPerTwo * (memoObj.totalAmount ?? 0)) / 100) + `</td>
                      </tr>`
            }

            htmlString += `                        
                  </tbody>
                  <tfoot>
                  <tr>
                    <td colspan="7">Grand Total </td>
                    <td><b>`+ memoObj.inventoryItems.length + `</b></td>
                    <td><b>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(sumWeight ?? 0) + `</b></td>     
                    <td>&nbsp</td>
                    <td><b>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(memoObj.totalAmount ?? 0) + ` (` + (memoObj.fromCurrency ?? "") + `)</b></td>
                  </tr>
                  <tr>
                    <td colspan="9"></td>  
                    <td>`+ memoObj.fromCurRate + ` (` + memoObj.fromCurrency + `) ` + `= ` + memoObj.toCurRate + ` (` + memoObj.toCurrency + `)` + `</td>
                    <td>`+ (memoObj.totalAmount ?? 0 * (memoObj.toCurRate ?? 0)).toFixed(2) + ` (` + memoObj.toCurrency + `)</td>
                  </tr>             
                  </tfoot>
                </table>
                </div>
              
              <div class="body-fotter">  
              <div class="body-middle">           
              <table>          
              <tr>
                <td><b>CIF : </b>`+ memoObj.portOfLoading + `</td>
                <td><b>PORT : </b>`+ memoObj.portOfLoading + `</td>
                <td><b>SHIPPED VIA : </b>`+ memoObj.courierName.name + `</td>
                <td><b>INSURED BY : </b>`+ memoObj.courierName.name + `</td>
              </tr>             
              </tfoot>
            </table>
            </div> 
      
            <div class="body-top border-top-0 border-bottom-0">
              <div class="bo-left w-70 border-right-2 border-bottom-2 ps-1">       
                    <span class="c-st text-start">Payment instructions:</span>
                    <table>
                    <tbody>
                    <tr>
                    <td><b>BANK NAME: </b></td>
                    <td>`+ (memoObj.bank.bankName ?? "") + `</td>
                  </tr>
                  <tr>
                    <td><b>BANK CODE : </b></td>
                    <td>`+ (memoObj.bank.ifsc ?? "") + `</td>
                  </tr>
                  <tr>
                    <td><b>ADDRESS :</b></td>
                    <td>`+ (memoObj.bank.address.line1 ? memoObj.bank.address.line1 + `,` : "") + (memoObj.bank.address.line2 ? memoObj.bank.address.line2 + `,` : "") + (memoObj.bank.address.city ? memoObj.bank.address.city + `,` : "")
                + (memoObj.bank.address.state ? memoObj.bank.address.state + `,` : "") + (memoObj.bank.address.country ? memoObj.bank.address.country + `,` : "") + (memoObj.bank.address.zipCode ?? "") + `</td>
                  </tr>
                  <tr>
                  <td><b>ACCOUNT NAME :</b></td>
                  <td>`+ (memoObj.bank.accountName ?? "") + `</td>
                  </tr>
                  <tr>
                  <td><b>A/C NO :</b></td>
                  <td>`+ (memoObj.bank.accountNo ?? "") + `</td>
                  </tr>
                  <tr>
                  <tr>
                  <td><b>IBAN NO :</b></td>
                  <td>`+ (memoObj.bank.iBan ?? "") + `</td>
                  </tr>
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
                  <div class="w-30 p-2 border-bottom-2">
                    <div>
                    <span>&nbsp</span>
                    <div class="ch-sig">
                    <span>&nbsp</span>
                    <span>&nbsp</span>
                    <span>&nbsp</span>   
                    <span>&nbsp</span>
                    <span>&nbsp</span>
                    <span>Signature</span>  
                    <span>Date : ` + this.utilityService.getISOtoStringDate(memoObj.createdDate) + `</span>
                    </div>
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
              invoice. The buyer acknowledged that this invoice is pledged to ` + (memoObj.bank.bankName ?? "") + ` and that releases can
              only be obtained through payment on the account of the seller at ` + (memoObj.bank.bankName ?? "") + ` as mentioned on this
              invoice. This invoice may never be compensated with claims from the buyer on the seller.</li>
              <li>The diamonds here in invoiced are exclusively of natural origin and untreated based on personal knowledge and/or
              written guarantees provided by the supplier of these diamonds.</li>
              <li>The diamonds herein invoiced have been purchased from legitimate sources not involved in funding conflict and in
              compliance with United Nation resolutions. The seller hereby guarantees that these diamonds are conflict free, based
              on personal knowledge and/or written guarantees provided by the supplier of these diamonds. </li>      
              <b style="text-decoration: underline;">H.R.A 351 856, BTW BE 0478 554 943 </b>      
              <li>The Antwerp Tribunal of Commerce is solely competent in case of litigation Vrij van B.T.W. Art. 42 van het Wetboek.Above mentioned good will be consignment until receipt of the payment of this invoice </li>
              `
            if (memoObj.additionalDeclaration) {
                htmlString += `<li>` + (memoObj.additionalDeclaration ?? "") + `</li>`
            }
            htmlString += `  
              </ul>
              </div>
              </div>
              </div>
            </div>
          </div>
          `

            if (memoObj.inventoryItems.length > 14) {
                htmlString += `
            <div class="body-middle">
      
            <table>
            <tr>
            <td>Organization :<b> ` + (memoObj.organization.name ?? "") + `</b></td>      
            <td>INVOICE No : <b>` + (memoObj.memoNo ?? "") + `</b></td>
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
                <th>CERTI. NO</th>     
                <th>RAP `+ memoObj.fromCurrency + `</th>
                <th>DISC %</th>           
                <th>RATE `+ memoObj.fromCurrency + ` PER CT</th>
                <th>TOTAL AMOUNT `+ memoObj.fromCurrency + `</th>
              </thead>
              <tbody>`

                for (let index = 0; index <= memoObj.inventoryItems.length; index++) {
                    let obj = memoObj.inventoryItems[index];
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
                      <td>`+ obj.price.rap + `</td>
                      <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.discount ?? 0) ?? "") + `</td> 
                      <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.perCarat ?? 0) ?? "") + `</td>
                      <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.netAmount ?? 0) ?? "") + `</td>
                      </tr>`
                    }
                }
            }

            htmlString += `
          </body>
          </html>
          `;
        }
        
        return htmlString;
    }
}
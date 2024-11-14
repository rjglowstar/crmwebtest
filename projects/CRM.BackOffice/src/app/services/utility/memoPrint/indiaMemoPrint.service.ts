import { Injectable } from '@angular/core';
import { MasterConfig, MasterDNorm } from 'shared/enitites';
import { UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { MasterConfigService } from '../../masterconfig/masterconfig.service';
import { InventoryItems, Memo } from '../../../entities';

@Injectable({
    providedIn: 'root'
})

export class IndiaMemoPrint {
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

        if (memoType == "INDIALOCAL") {
            htmlString += `<body onload="window.print(); window.close();">`
            let SumTotalAmtConverted = this.utilityService.ConvertToFloatWithDecimal((memoObj.totalAmount ?? 0) * (memoObj.toCurRate ?? 1));
            let SumTotalAmtConvertedWithTax = 0;
            let tax1 = 0;
            let tax2 = 0;

            if (taxPerOne > 0)
                tax1 = this.utilityService.ConvertToFloatWithDecimal((taxPerOne * (SumTotalAmtConverted ?? 0)) / 100);

            if (taxPerTwo > 0)
                tax2 += this.utilityService.ConvertToFloatWithDecimal((taxPerTwo * (SumTotalAmtConverted ?? 0)) / 100);

            SumTotalAmtConvertedWithTax = SumTotalAmtConverted + tax1 + tax2;

            for (let Copyindex = 1; Copyindex <= 2; Copyindex++) { //All Box Duplicate Copy Loop        
                var perPageCount: number = 14; // 14 stone in one box... 2box in one A4 Page..
                var totalPageCount: number;
                var skip: number = 0;

                const pageCount = memoObj.inventoryItems.length / perPageCount;
                const roundedPageCount = Math.floor(pageCount);
                totalPageCount = roundedPageCount < pageCount ? roundedPageCount + 1 : roundedPageCount;

                for (let index = 1; index <= totalPageCount; index++) {//One By One Box
                    var pageTotalNetAmount = 0;
                    var pageTotalWeight = 0;

                    let isEven = false;
                    let checkNum = 0;
                    checkNum = index % 2;
                    if (checkNum == 0)
                        isEven = true;

                    htmlString += `  
        <div class="chal-wrap con-inv di-inv">
          <div class="chal-head brandText_name">
            <div class="logo">
              `
                    if (memoObj.organization.name == "GLOWSTAR") {
                        htmlString += `<img src="assets/billimage/Glowstar.png" alt="logo">`
                    }
                    else if (memoObj.organization.name == "SarjuImpex") {
                        htmlString += `<span class="brand_name"><img src="assets/billimage/sarju2.png" alt="logo" style="margin:5px 0;"> <br> SARJU IMPEX</span>`
                    }
                    htmlString += `
            </div>
            <div class="di-info" style="text-align: center;">
            <span>` + (memoObj.organization.address?.line1 ?? "") + `,` + (memoObj.organization.address?.line2 ?? "") + `</span>            
            <span>` + (memoObj.organization.address?.city ?? "") + `,` + (memoObj.organization.address?.state ?? "") + `,` + (memoObj.organization.address?.country ?? "") + `</span> 
            <span>Email: ` + (memoObj.organization.email ?? "") + `</span>            
            </div>
            <div class="di-info">
            <span>GSTIN: ` + (memoObj.organization.taxNo ?? "") + `</span>   
            <span>Contact No: ` + (memoObj.organization.phoneNo ?? "") + `</span>            
            </div>
          </div>

          <div class="chal-body">`
                    if (Copyindex == 1) {
                        htmlString += `<span class="c-st border-left-2 border-right-2 border-bottom-2">MEMO - DELIVERY CHALLAN - ORIGINAL </span>`;
                    }
                    if (Copyindex == 2) {
                        htmlString += `<span class="c-st border-left-2 border-right-2 border-bottom-2">MEMO - DELIVERY CHALLAN - DUPLICATE </span>`;
                    }

                    htmlString += `
            <div class="body-top ps-1 border-bottom-0 main-top">
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
              </div> `

                    htmlString += ` 
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
                  <td><b>Broker:</b></td>
                  <td>` + (memoObj.broker.name ?? "") + `</td>
                  </tr>   
                  <tr>
                  <td><b>Through:</b></td>
                  <td>` + (memoObj.takenBy ?? "") + `</td>
                  </tr>                 
                </tbody>
              </table>
            </div>

              <div class="di-bor-0">
                <table>
                  <tbody>
                  <tr>
                    <td><b>Memo Expire Days:</b></td>
                    <td>` + memoObj.expiredDays + `</td>
                  </tr>
                  <tr>
                  <td><b>Memo Expire Date:</b></td>
                  <td>` + this.utilityService.getISOtoStringDate(memoObj.expiredDate) + `</td>                    
                  </tr>
                    <tr>                   
                      <td><b>Terms:</b></td>
                      <td>` + (memoObj.terms ?? "") + `</td>
                    </tr>
                    <tr>
                      <td><b>Place Of Supply:</b></td>
                      <td>` + (memoObj.organization.address?.city ?? "") + `,` + (memoObj.organization.address?.state ?? "") + `,` + (memoObj.organization.address?.country ?? "") + `</td>
                    </tr> 
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
                <tbody>
        <table>
        <thead>

        <th>NO</th>
        <th>StockID</th>
        <th>Mark</th>
        <th>Shape</th>
        <th>PCS</th>
        <th>Size</th>
        <th>Color</th>
        <th>Clarity</th>
        <th>Cut</th>
        <th>Measurement</th>
        <th>Depth</th>
        <th>Table</th>
        <th>Disc</th>
        <th>LAB</th>
        <th>CertiNo</th>
        <th>Rap</th>
        <th>PerCarat</th>
        <th>NetAmount</th>

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
                  <td> </td>
                  <td>`+ (obj.shape ?? "") + `</td>
                  <td>1</b></td>
                  <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.weight ?? 0) + `</td>
                  <td>`+ (obj.color ?? "") + `</td>
                  <td>`+ (obj.clarity ?? "") + `</td>
                  <td>`+ (obj.cut ?? "") + `</td>                  
                  <td>`+ this.utilityService.getMesurmentString(obj.shape, obj.measurement.length, obj.measurement.width, obj.measurement.height) + `</td>
                  <td>`+ (obj.measurement.depth ?? "") + `</td>         
                  <td>`+ (obj.measurement.table ?? "") + `</td>   
                  <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit((obj.price.discount ?? 0)) + `</td> 
                  <td>`+ (obj.lab ?? "") + `</td>              
                  <td>`+ (obj.certificateNo ?? "") + `</td>      
                  <td>`+ (obj.price.rap ?? "") + `</td>
                  <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.perCarat ?? 0) + `</td>
                  <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit((obj.price.netAmount ?? 0)) + `</td>  
                  </tr>`
                        }
                    }
                    skip = skip + perPageCount;
                    filterInventoryItems.forEach(z => { totweight += z.weight });
                    filterInventoryItems.forEach(z => { totnetAmount += z.price.netAmount ?? 0 });

                    for (let indexV = filterInventoryItems.length; indexV < 14; indexV++) {
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
                <td></td>
                <td></td>
                </tr>`
                    }

                    htmlString += `
        <tr>        
        <td colspan="4"><b>Page Total</b></td>
        <td><b>`+ filterInventoryItems.length + `</b></td>
        <td><b>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(pageTotalWeight ?? 0) + `</b></td>  
        <td colspan="11">&nbsp</td>
        <td ><b>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(pageTotalNetAmount) + ` (` + (memoObj.fromCurrency ?? "") + `)</b></td>
        </tr>`

                    if (taxPerOne && index == totalPageCount) {
                        htmlString += `
                <tr>
                <td colspan="15" style="text-align:right;"><b>` + taxNameOne + ` ( ` + taxPerOne + ` % )</b></td>                
                <td style="text-align:right; padding-right:10px;" ><b>`+ SumTotalAmtConverted + ` (` + (memoObj.toCurrency ?? "") + `) * ` + taxPerOne + ` %</b></td>
                <td><b>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit((taxPerOne * (SumTotalAmtConverted ?? 0)) / 100) + ` (` + (memoObj.toCurrency ?? "") + `) </b></td>
                <td>&nbsp</td>
                </tr>`
                    }
                    else {
                        htmlString += `
            <tr>
            <td colspan="17" style="text-align:right; padding-right:10px;" >&nbsp</td>
            <td>&nbsp</td>
            </tr>`
                    }
                    if (taxPerTwo && index == totalPageCount) {
                        htmlString += `
            <tr>
            <td colspan="15" style="text-align:right;"><b>` + taxNameTwo + ` ( ` + taxPerTwo + ` % )<b></td>                
            <td style="text-align:right; padding-right:10px;" ><b>`+ SumTotalAmtConverted + ` (` + (memoObj.toCurrency ?? "") + `) * ` + taxPerTwo + ` %</b></td>
            <td><b>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit((taxPerTwo * (SumTotalAmtConverted ?? 0)) / 100) + ` (` + (memoObj.toCurrency ?? "") + `) </b></td>
            <td>&nbsp</td>
            </tr>`
                    }
                    else {
                        htmlString += `
            <tr>
            <td colspan="17" style="text-align:right; padding-right:10px;" >&nbsp</td>
            <td>&nbsp</td>
            </tr>`
                    }

                    htmlString += `                        
                </tbody>
                <tfoot>`

                    htmlString += ` 
                <tr>
                  <td colspan="4"><b>Grand Total </b></td>
                  <td><b>`+ memoObj.inventoryItems.length + `</b></td>
                  <td><b>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(sumWeight ?? 0) + `</b></td>     
                  <td colspan="10" style="text-align:right; padding-right:10px;"><b>1 `+ (memoObj.fromCurrency ?? "") + ` = ` + (memoObj.toCurRate ?? "") + ` ` + (memoObj.toCurrency ?? "") + `</b></td>                                    
                  <td><b>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(SumTotalAmtConvertedWithTax ?? 0) + ` ( ` + (memoObj.toCurrency ?? "") + ` )</b></td>
                  <td><b>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(memoObj.totalAmount ?? 0) + ` (` + (memoObj.fromCurrency ?? "") + `)</b></td>
                </tr>`

                    htmlString += `        
                </tfoot>
              </table>
            </div>    
              <div class="body-f-footer">
              <span class="c-st">MEMO OF MERCHANDISE MUST BE REPORTED WITHIN ` + memoObj.expiredDays + ` DAYS</span>              
              <ul>                                          
                <b>I HEREBY ACKNOWLEDGE RECEIPT OF THE FOLLOWING GOODS WHICH YOU HAVE ENTRUSTED TO ME AND WHICH CONDITIONS.I HOLD IN TRUST FOR YOU TO THE FOLLOWING PURPOSE AND ON THE FOLLOWING.</b> 
                 <b>(1)</b>THE GOODS HAVE BEEN ENTRUSTED TO ME FOR THE SALE PURPOSE BEING SHOW TO INTENDING PURCHASERS OF INSPECTION.<b> (2)</b>THE GOODS REMAIN YOUR PROPERTY AND I 
                ACQUIRE NO RIGHT TO PROPERTY OR INTEREST IN THEM TILL A SALE NOTE SIGNED BY YOU IS PASSED OR TILL THE PRICE IS PAID IN RESPECT THERE OF NOT WHITHSTANDING THE FACT THAT MENTION IS MADE OF THE RATE OR PRICE IN THE 
                PARTICULARS OF GOODS HEREIN MENTIONED ON THE REVERSE.<b> (3)</b>I AGREE NOT TO SELL OR PLEDGE OR MORTGAGE OR HYPOTHECT THE SAID GOODS OR OTHERWISE DEAL WITH THEM IN ANY AMNNER TILL A SALE NOT SIGNED BY YOU IS PASSED OR 
                THE PRICE IS PAID TO YOU.<b> (4)</b>THE GOODS ARE TO BE RETURNED TO YOU FORTHWITH WHENEVER DEMAND BACK.<b> (5)</b>THE GOODS WILL BE AT MY RISK IN ALL RESPECT TILL SALE NOTE SIGNED BY YOU IS PASSED IN RESPECT THERE OF OR TILL THE PRICE 
                IS NOT PAID TO YOU FOR THE GOODS ARE RETURNED TO YOU AND I AM RESPONSIBLE TO YOU FOR THE RETURN OF THE SIDE GOODS IN THE SAME CONDITIONS AS I HAVE RECEIVED THE SAME<b> (6)</b>SUBJECT TO MUMBAI JURISDICTION
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
          <hr>
          `
                }//Main Foor Loop End  
            }
            htmlString += `</div>
      </body>
        </body>
        </html>
        `;
        }

        else if (memoType == "INDIAOVERSEAS") {

            var firstPageCount: number = 24;
            var midPageCount: number = 41;
            var lastPageCount: number = 24;
            var totalPageCount: number;
            var skip: number = 0;
            var invLength = memoObj.inventoryItems.length;

            var pageCount = memoObj.inventoryItems.length / firstPageCount;
            var roundedPageCount = Math.floor(pageCount);
            totalPageCount = roundedPageCount < pageCount ? roundedPageCount + 1 : roundedPageCount;

            if (invLength > 48) {
                invLength = invLength - firstPageCount - lastPageCount; //minus the 1st and 2nd page stone
                var pageCount = invLength / midPageCount; // Divide with 
                pageCount = pageCount + 2; //Added 1st and last page
                var roundedPageCount = Math.floor(pageCount);
                totalPageCount = roundedPageCount < pageCount ? roundedPageCount + 1 : roundedPageCount;
            }

            if (memoObj.inventoryItems.length > 7 && totalPageCount == 1)
                totalPageCount = 2
            if (memoObj.isPackingList)
                totalPageCount = 1

            var lastpagedeclaration: boolean = false;

            for (let index = 1; index <= totalPageCount; index++) {

                if (lastpagedeclaration == true)
                    break

                htmlString += `        
  <body onload="window.print(); window.close();">      
  <p style="margin: 0;font-size: 14px;text-align: center;"><b>DELIVERY CHALLAN -CONSIGNMENT</b></p>
  <p style="margin: 0;font-size: 12px;font-weight: 600;text-align: center;">IN LIUE OF INVOICE AS PER PROVISION UNDER
    RULE 55 CGST RULE 2017</p>

  <div class="challan-new">
    <div class="challan-leftside">
      <div class="lefstside-subgrid">
        <div class="grid-1">
          <small>Exporter</small><span style="margin-left: 10px;"><b></b></span>
          `
                if (memoObj.organization.name == "GLOWSTAR") {
                    htmlString += `<img src="assets/billimage/GlowstareG.png">`
                }
                else if (memoObj.organization.name == "SarjuImpex") {
                    htmlString += `<img src="assets/billimage/SarjuS.png">`
                }
                htmlString += `
        </div>
        <div class="grid-1">
        <p><b>` + (memoObj.organization.name ?? "") + `</b></p>
        <p>` + (memoObj.organization.address?.line1 ?? "") + `,` + (memoObj.organization.address?.line2 ?? "") + `<br>
        ` + (memoObj.organization.address?.city ?? "") + `,` + (memoObj.organization.address?.state ?? "") + `,` + (memoObj.organization.address?.country ?? "") + `</p>          
          <p>Tele No.` + (memoObj.organization.phoneNo ?? "") + `,` + (memoObj.organization.mobileNo ?? "") + `</p>
          <p>Email.` + (memoObj.organization.email ?? "") + `</p> 
        </div>
      </div>
      `
                if (index == 1)//First Page 
                {
                    htmlString += `
        <div class="lefstside-subgrid border-top-2" style="height:254px;">
        <div class="grid-1">
        <p>Consignee</p>     
          <p><b>` + (memoObj.consigneeName ?? "") + `</b></p>          
          <p> ` + (memoObj.consigneeAddress ?? "") + `</p>
        </div>
      </div>
      <div class="box-two border-top-2">
        <div class="box-1 p-1 border-right-2 border-bottom-2">
          <small>Pre-Carriage by</small>
          <p>` + (memoObj.courierName.name ?? "") + `</p>
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
          <p>` + (memoObj.portOfLoading ?? "") + `</p>
        </div>
        <div class="box-1 p-1 border-right-2">
          <small>Port of Discharge</small>
          <p>` + (memoObj.party.address?.city ?? "") + `</p>
        </div>
        <div class="box-1 p-1">
          <small>Final Destination</small>
          <p>` + (memoObj.party.address?.country ?? "") + `</p>
        </div>
      </div>`
                }
                htmlString += ` 
    </div>

    <div class="challan-rightside">
    <div class="box-two">
    <div class="box-1 p-1 border-bottom-2 border-right-2">
      <small>Del.Challan No.& Dt.</small><span style="margin-left: 10px;">` + this.utilityService.getISOtoStringDate(memoObj.createdDate) + `</span>
      <p>` + memoObj.memoNo + `</p>
    </div>
    <div class="box-1 p-1 border-bottom-2">
      <small>Exporter's Ref</small>
      <p><b>IEC No :</b> ` + (memoObj.organization.iecNo ?? "") + `</p>
    </div>
    </div>

    <div class="box-full p-1 border-bottom-2" style="padding-bottom: 21px;">
      <small>Buyer's Order no. & Date</small>
    </div>

    <div class="box-full p-1 border-bottom-2">
      <small>Other Reference (s)</small><span style="margin-left: 25px;"><b>GST No : ` + (memoObj.organization.gstNo ?? "") + `</b></span>   
    </div>`
                if (index == 1)//First Page 
                {
                    htmlString += `      
      <div class="box-full p-1">
        <small>Buyer (If other than consignee)</small>
        <p><b>` + (memoObj.party.name ?? "") + `</b></p>
        <p>` + (memoObj.party.address.line1 ?? "") + `,` + (memoObj.party.address.line2 ?? "") + `, <br>
        ` + (memoObj.party.address.city ?? "") + `,` + (memoObj.party.address.state ?? "") + `,` + (memoObj.party.address.country) + `,
        ZipCode : ` + (memoObj.party.address.zipCode ?? "") + `
        </p>
        <p>TEL: ` + (memoObj.party.mobileNo ?? "") + `, FAX : ` + (memoObj.party.faxNo ?? "") + `</p>
      </div>

      <div class="box-two border-top-2">
        <div class="box-1 p-1 border-right-2 border-bottom-2">
          <small>Country of Origin of Goods</small>
          <p>` + (memoObj.organization.address?.country ?? "") + `</p>
        </div>
        <div class="box-1 p-1 border-bottom-2">
          <small>Country of Final Destination</small>
          <p>` + (memoObj.party.address.country ?? "") + `</p>
        </div>
      </div>

      <div class="box-full p-1">
        <small>Terms of Delivery and Payment</small>
        <p>` + (memoObj.terms ?? "") + `</p>
        <br>
        <p><b>OUR BANKERS :</b></p>
        <p><b>`+ (memoObj.bank.bankName ?? "") + `</b></p>
        <p><small>` + (memoObj.bank.address?.line1 ?? "") + `,` + (memoObj.bank.address?.line2 ?? "") + `,
        ` + (memoObj.bank.address?.city ?? "") + `,` + (memoObj.bank.address?.state ?? "") + `,` + (memoObj.bank.address?.country ?? "") + `</small></p>
        <p>A/C Name: `+ (memoObj.bank.accountName ?? "") + `</p>
        <p>A/C No: `+ (memoObj.bank.accountNo ?? "") + `</p>
        <p>SWIFT Code: `+ (memoObj.bank.swift ?? "") + `</p>        
        <p><b>AD CODE: `+ (memoObj.bank.adCode ?? "") + `</b></p>
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

                let filterInventoryItems = memoObj.inventoryItems.slice(skip, skip + thispagecount);

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
          <th>Rate ` + (memoObj.fromCurrency ?? "") + `  $</th>
          <th>Amount `+ (memoObj.fromCurrency ?? "") + ` $</th>
        </tr>
        `

                    var totweight: number = 0;
                    var totnetAmount: number = 0

                    if (!memoObj.isPackingList) {

                        for (let indexS = 0; indexS <= filterInventoryItems.length; indexS++) {
                            let obj = filterInventoryItems[indexS];

                            if (obj) {
                                htmlString += `            
                  <tr>
                  <td>`+ (indexS + 1 + skip) + `</td>                  
                  <td>`+ (this.getDisplayNameFromMasterDNorm(obj.shape.trim()) ?? "") + `-` + (obj.color ?? "") + `-` + (obj.clarity ?? "") + `</td>                  
                  <td>`+ this.utilityService.getMesurmentString(obj.shape, obj.measurement.length, obj.measurement.width, obj.measurement.height) + `</td>
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
              <th colspan="3">Gross Weight: ` + memoObj.boxWeight + ` Kgs.</th>  
              <th>Page Total</th>
              <th>CRTS</th>
              <th>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(totweight) + `</th>
              <th>` + (memoObj.fromCurrency ?? "") + ` $</th>
              <th>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(totnetAmount) + `</th>
            </tr>        
          </tbody>
        </table>
      </div>`
                    }

                    else if (memoObj.isPackingList) {
                        htmlString += `            
            <tr style="height:50px;">
            <td>1</td>   
            <td colspan="3">`+ (memoObj.plDeclaration ?? "") + `</td>           
            <td>`+ memoObj.inventoryItems.length + `</td>                  
            <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit((sumWeight ?? "")) + `</td>
            <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit((sumGrandTotalPlusTax / sumWeight ?? 0)) + `</td>
            <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit((sumGrandTotalPlusTax) ?? 0) + `</td>
            </tr>`

                        htmlString += ` 
            <tr>
              <th colspan="3">Gross Weight: ` + memoObj.boxWeight + ` Kgs.</th>  
              <th>Total</th>
              <th>CRTS</th>
              <th>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(sumWeight) + `</th>
              <th>` + (memoObj.fromCurrency ?? "") + ` $</th>
              <th>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(sumGrandTotalPlusTax ?? 0) + `</th>
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
                    (index == 2 && totalPageCount == 2 && memoObj.inventoryItems.length < 6)
                    && lastpagedeclaration == false
                )//Last Page Declaration
                {
                    lastpagedeclaration = true;
                    htmlString += `
        <div class="details p-1">
          <p>We undertake to re import the goods & will produce to RBI documentry evidence such as exchange control copy of
            bill of entry & coustom attested invoice in support there of within 60 days from the date of clearance of the
            consignment in case the goods are sold , the sale proceeds will be repatriated to India through proper banking
            channel & will produce to RBI , bank realisation certificate in support there of further we will re-import unsold
            goods within the prescribed the time limit.</p>
          <p><b>Note : TRANSPORTATION OF THE GOODS FOR THE REASONS OTHER THAN BY WAY OF SUPPLY UNDER RULE 55 CGST READ
            WITH <br> CIRCULAR No.108/27/2019 CGST DT.18/07/2019</b></p>
        </div>        
        `
                    if (memoObj.shippingCharge > 0) {
                        if (memoObj.exportType == "CIF") {
                            htmlString += `
            <div style="overflow:hidden">
            <p><span style="text-align:right"><b>Add Freight & Insurance :` + memoObj.shippingCharge + `</b></span></p> 
            </div>`
                        }
                        else if (memoObj.exportType == "CFR") {
                            htmlString += `
              <div style="overflow:hidden">
              <p><span style="text-align:right"><b>Add Freight :` + memoObj.shippingCharge + `</b></span></p> 
              </div>`
                        }
                    }

                    htmlString += `
        <div class="inv-details">
        <p>

        <small style="margin-left: 10px;">Amount Chargeable(In Words)@:</small>

        <b style="margin-right: 20px;">` + (this.utilityService.ConvertToFloatWithDecimalTwoDigit(memoObj.toCurRate ?? 0) ?? "") + `</b>

        <b>Taxable ` + (memoObj.toCurrency ?? "") + `. : ` + this.utilityService.ConvertToFloatWithDecimalTwoDigit(sumConvGrandTotalPlusTax ?? 0) + `</b>
        
        <span><b>` + (memoObj.exportType ?? "") + `  ` + (memoObj.fromCurrency ?? "") + ` $ Total</b>
        <b>` + this.utilityService.ConvertToFloatWithDecimalTwoDigit(sumGrandTotalPlusTax ?? 0) + `</b>
        </span>

        </p>    
        
        <p class="inv-p" style="font-size: 16px;">
        Total ` + (memoObj.exportType ?? "") + `  ` + (memoObj.fromCurrency ?? "") + ` $   
        ` + this.utilityService.convertAmoutToWord(this.utilityService.ConvertToFloatWithDecimalTwoDigitRoundWithNum(sumGrandTotalPlusTax), "USD") + `</p>
        <p style="height:7px;">&nbsp</p>
        <p class="inv-p">"The Diamonds herein invoiced have been purchased from legitimate sources not involved in funding
          conflict , in compliance with United Nations resolutions and corresponding national laws .</p>
        <p class="inv-p">The Seller hereby guarantees that these diamonds are conflict free and confirms adherence to the
          WDC SoW Guidelines."</p>
        <p class="inv-p">The Diamonds herein invoiced are exclusively of natural origin and untreated based on personal
          knowledge and/or written guarantees provided by the supplier of these diamonds.</p>
        <p class="inv-p">The acceptance of goods herein invoiced will be as per WFDB guidelines.</p>
        <p style="margin-left: 10px;"><b>WE DON'T WANT TO CLAIM RoDTEP ON THE EXPORT ITEMS LISTED UNDER THIS INVOICE NO</b></p>
        <p style="margin-left: 10px;"><b>PAYMENT INSTRUCTION :</b>BENEFICIARY : `+ (memoObj.bank.accountName ?? "") + `</p>
        <p style="margin-left: 10px;">OUR BANK : ` + (memoObj.bank.address?.line1 ?? "") + `,` + (memoObj.bank.address?.line2 ?? "") + `,
        ` + (memoObj.bank.address?.city ?? "") + `,` + (memoObj.bank.address?.state ?? "") + `,` + (memoObj.bank.address?.country ?? "") + `</p>
        <p style="margin-left: 10px;">A/C NO. `+ (memoObj.bank.accountNo ?? "") + `, SWIFT CODE : ` + (memoObj.bank.swift ?? "") + `</p>
        <p style="margin-left: 10px;">INTERMEDIARY BANK : `+ (memoObj.bank.intermediaryBankName ?? "") + ` ,SWIFT CODE: ` + (memoObj.bank.intermediaryBankswift ?? "") + `</p>        
        <p style="margin-left: 10px;margin-top: 15px;""><b>STATE OF ORIGIN : ` + (memoObj.organization.address.stateCode ?? "") + `, DISTRICT OF ORIGIN : ` + (memoObj.organization.address.districtCode ?? "") + `</b></p>
        <p style="margin-left: 10px;margin-top: 15px;""><b>DOOR TO DOOR INSURANCE COVERED BY `+ (memoObj.courierName.name ?? "") + `</b></p>
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
          <h5>PAN : ` + (memoObj.organization.incomeTaxNo ?? "") + `</h5>
          </p>
          <p><small>We declare that this Invoice shows the actual price of the goods described and that all particulars
              are true and correct.</small></p>
        </div>
        <div class="grid-2">
          <p>Signature & Date<br>` + this.utilityService.getISOtoStringDate(memoObj.createdDate) + `</p>
          <p><b>For ` + (memoObj.organization.name ?? "") + `<br>Partner/Auth.Sign.</b></p>
        </div>
      </div>
    <div class="pager border-top-2 border-bottom-2 border-left-2 border-right-2 " style="overflow:hidden; padding-right:20px;">
      <span>Page `+ index + ` of ` + totalPageCount + `</span>
      </div>       
    </div>
  </div>
</body>`

            }//Main Foor Loop End

            if (memoObj.isPackingList) {

                htmlString += `
        <div class="body-middle">
        <table>
        <tr>
        <td>Organization :<b> ` + (memoObj.organization.name ?? "") + `</b></td>
        <td>No : <b>` + (memoObj.memoNo ?? "") + `</b></td>
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
              <th>Measurment</th>
              <th>LAB</th>
              <th>REPORT NO</th>      
              <th>RAPAPORT</th>     
              <th>PRICE `+ (memoObj.fromCurrency ?? "") + ` /PER CT</th>
              <th>NET AMT `+ (memoObj.fromCurrency ?? "") + `</th>
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
                    <td>`+ this.utilityService.getMesurmentString(obj.shape, obj.measurement.length, obj.measurement.width, obj.measurement.height) + `</td>
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
                      <td><b>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(sumWeight ?? 0) + `</b></td>
                      <td colspan="7">&nbsp</td>                      
                      <td><b>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(memoObj.totalAmount ?? 0) + `</b></td>
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

        if (memoType == "INDIALOCAL") {
            htmlString += `<body onload="window.print(); window.close();">`
            let SumTotalAmtConverted = this.utilityService.ConvertToFloatWithDecimal((memoObj.totalAmount ?? 0) * (memoObj.toCurRate ?? 1));
            let SumTotalAmtConvertedWithTax = 0;
            let tax1 = 0;
            let tax2 = 0;

            if (taxPerOne > 0)
                tax1 = this.utilityService.ConvertToFloatWithDecimal((taxPerOne * (SumTotalAmtConverted ?? 0)) / 100);

            if (taxPerTwo > 0)
                tax2 += this.utilityService.ConvertToFloatWithDecimal((taxPerTwo * (SumTotalAmtConverted ?? 0)) / 100);

            SumTotalAmtConvertedWithTax = SumTotalAmtConverted + tax1 + tax2;

            for (let Copyindex = 1; Copyindex <= 2; Copyindex++) { //All Box Duplicate Copy Loop        
                var perPageCount: number = 14; // 14 stone in one box... 2box in one A4 Page..
                var totalPageCount: number;
                var skip: number = 0;

                const pageCount = memoObj.inventoryItems.length / perPageCount;
                const roundedPageCount = Math.floor(pageCount);
                totalPageCount = roundedPageCount < pageCount ? roundedPageCount + 1 : roundedPageCount;

                for (let index = 1; index <= totalPageCount; index++) {//One By One Box
                    var pageTotalNetAmount = 0;
                    var pageTotalWeight = 0;

                    let isEven = false;
                    let checkNum = 0;
                    checkNum = index % 2;
                    if (checkNum == 0)
                        isEven = true;

                    htmlString += `  
              <div class="chal-wrap con-inv di-inv">
                <div class="chal-head brandText_name">
                  <div class="logo">
                    `
                    if (memoObj.organization.name == "GLOWSTAR") {
                        htmlString += `<img src="assets/billimage/Glowstar.png" alt="logo">`
                    }
                    else if (memoObj.organization.name == "SarjuImpex") {
                        htmlString += `<span class="brand_name"><img src="assets/billimage/sarju2.png" alt="logo" style="margin:5px 0;"> <br> SARJU IMPEX</span>`
                    }
                    htmlString += `
                  </div>
                  <div class="di-info" style="text-align: center;">
                  <span>` + (memoObj.organization.address?.line1 ?? "") + `,` + (memoObj.organization.address?.line2 ?? "") + `</span>            
                  <span>` + (memoObj.organization.address?.city ?? "") + `,` + (memoObj.organization.address?.state ?? "") + `,` + (memoObj.organization.address?.country ?? "") + `</span> 
                  <span>Email: ` + (memoObj.organization.email ?? "") + `</span>            
                  </div>
                  <div class="di-info">
                  <span>GSTIN: ` + (memoObj.organization.taxNo ?? "") + `</span>   
                  <span>Contact No: ` + (memoObj.organization.phoneNo ?? "") + `</span>            
                  </div>
                </div>
      
                <div class="chal-body">`
                    if (Copyindex == 1) {
                        htmlString += `<span class="c-st border-left-2 border-right-2 border-bottom-2">MEMO - DELIVERY CHALLAN - ORIGINAL </span>`;
                    }
                    if (Copyindex == 2) {
                        htmlString += `<span class="c-st border-left-2 border-right-2 border-bottom-2">MEMO - DELIVERY CHALLAN - DUPLICATE </span>`;
                    }

                    htmlString += `
                  <div class="body-top ps-1 border-bottom-0 main-top">
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
                    </div> `

                    htmlString += ` 
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
                        <td><b>Broker:</b></td>
                        <td>` + (memoObj.broker.name ?? "") + `</td>
                        </tr>   
                        <tr>
                        <td><b>Through:</b></td>
                        <td>` + (memoObj.takenBy ?? "") + `</td>
                        </tr>                 
                      </tbody>
                    </table>
                  </div>
      
                    <div class="di-bor-0">
                      <table>
                        <tbody>
                        <tr>
                          <td><b>Memo Expire Days:</b></td>
                          <td>` + memoObj.expiredDays + `</td>
                        </tr>
                        <tr>
                        <td><b>Memo Expire Date:</b></td>
                        <td>` + this.utilityService.getISOtoStringDate(memoObj.expiredDate) + `</td>                    
                        </tr>
                          <tr>                   
                            <td><b>Terms:</b></td>
                            <td>` + (memoObj.terms ?? "") + `</td>
                          </tr>
                          <tr>
                            <td><b>Place Of Supply:</b></td>
                            <td>` + (memoObj.organization.address?.city ?? "") + `,` + (memoObj.organization.address?.state ?? "") + `,` + (memoObj.organization.address?.country ?? "") + `</td>
                          </tr> 
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
                      <tbody>
              <table>
              <thead>
      
              <th>NO</th>
              <th>StockID</th>
              <th>Mark</th>
              <th>Shape</th>
              <th>PCS</th>
              <th>Size</th>
              <th>Color</th>
              <th>Clarity</th>
              <th>Cut</th>
              <th>Measurement</th>
              <th>Depth</th>
              <th>Table</th>
              <th>Disc</th>
              <th>LAB</th>
              <th>CertiNo</th>
              <th>Rap</th>
              <th>PerCarat</th>
              <th>NetAmount</th>
      
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
                        <td> </td>
                        <td>`+ (obj.shape ?? "") + `</td>
                        <td>1</b></td>
                        <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.weight ?? 0) + `</td>
                        <td>`+ (obj.color ?? "") + `</td>
                        <td>`+ (obj.clarity ?? "") + `</td>
                        <td>`+ (obj.cut ?? "") + `</td>                  
                        <td>`+ this.utilityService.getMesurmentString(obj.shape, obj.measurement.length, obj.measurement.width, obj.measurement.height) + `</td>
                        <td>`+ (obj.measurement.depth ?? "") + `</td>         
                        <td>`+ (obj.measurement.table ?? "") + `</td>   
                        <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit((obj.price.discount ?? 0)) + `</td> 
                        <td>`+ (obj.lab ?? "") + `</td>              
                        <td>`+ (obj.certificateNo ?? "") + `</td>      
                        <td>`+ (obj.price.rap ?? "") + `</td>
                        <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.price.perCarat ?? 0) + `</td>
                        <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit((obj.price.netAmount ?? 0)) + `</td>  
                        </tr>`
                        }
                    }
                    skip = skip + perPageCount;
                    filterInventoryItems.forEach(z => { totweight += z.weight });
                    filterInventoryItems.forEach(z => { totnetAmount += z.price.netAmount ?? 0 });

                    for (let indexV = filterInventoryItems.length; indexV < 14; indexV++) {
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
                      <td></td>
                      <td></td>
                      </tr>`
                    }

                    htmlString += `
              <tr>        
              <td colspan="4"><b>Page Total</b></td>
              <td><b>`+ filterInventoryItems.length + `</b></td>
              <td><b>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(pageTotalWeight ?? 0) + `</b></td>  
              <td colspan="11">&nbsp</td>
              <td ><b>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(pageTotalNetAmount) + ` (` + (memoObj.fromCurrency ?? "") + `)</b></td>
              </tr>`

                    if (taxPerOne && index == totalPageCount) {
                        htmlString += `
                      <tr>
                      <td colspan="15" style="text-align:right;"><b>` + taxNameOne + ` ( ` + taxPerOne + ` % )</b></td>                
                      <td style="text-align:right; padding-right:10px;" ><b>`+ SumTotalAmtConverted + ` (` + (memoObj.toCurrency ?? "") + `) * ` + taxPerOne + ` %</b></td>
                      <td><b>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit((taxPerOne * (SumTotalAmtConverted ?? 0)) / 100) + ` (` + (memoObj.toCurrency ?? "") + `) </b></td>
                      <td>&nbsp</td>
                      </tr>`
                    }
                    else {
                        htmlString += `
                  <tr>
                  <td colspan="17" style="text-align:right; padding-right:10px;" >&nbsp</td>
                  <td>&nbsp</td>
                  </tr>`
                    }
                    if (taxPerTwo && index == totalPageCount) {
                        htmlString += `
                  <tr>
                  <td colspan="15" style="text-align:right;"><b>` + taxNameTwo + ` ( ` + taxPerTwo + ` % )<b></td>                
                  <td style="text-align:right; padding-right:10px;" ><b>`+ SumTotalAmtConverted + ` (` + (memoObj.toCurrency ?? "") + `) * ` + taxPerTwo + ` %</b></td>
                  <td><b>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit((taxPerTwo * (SumTotalAmtConverted ?? 0)) / 100) + ` (` + (memoObj.toCurrency ?? "") + `) </b></td>
                  <td>&nbsp</td>
                  </tr>`
                    }
                    else {
                        htmlString += `
                  <tr>
                  <td colspan="17" style="text-align:right; padding-right:10px;" >&nbsp</td>
                  <td>&nbsp</td>
                  </tr>`
                    }

                    htmlString += `                        
                      </tbody>
                      <tfoot>`

                    htmlString += ` 
                      <tr>
                        <td colspan="4"><b>Grand Total </b></td>
                        <td><b>`+ memoObj.inventoryItems.length + `</b></td>
                        <td><b>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(sumWeight ?? 0) + `</b></td>     
                        <td colspan="10" style="text-align:right; padding-right:10px;"><b>1 `+ (memoObj.fromCurrency ?? "") + ` = ` + (memoObj.toCurRate ?? "") + ` ` + (memoObj.toCurrency ?? "") + `</b></td>                                    
                        <td><b>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(SumTotalAmtConvertedWithTax ?? 0) + ` ( ` + (memoObj.toCurrency ?? "") + ` )</b></td>
                        <td><b>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(memoObj.totalAmount ?? 0) + ` (` + (memoObj.fromCurrency ?? "") + `)</b></td>
                      </tr>`

                    htmlString += `        
                      </tfoot>
                    </table>
                  </div>    
                    <div class="body-f-footer">
                    <span class="c-st">MEMO OF MERCHANDISE MUST BE REPORTED WITHIN ` + memoObj.expiredDays + ` DAYS</span>              
                    <ul>                                          
                      <b>I HEREBY ACKNOWLEDGE RECEIPT OF THE FOLLOWING GOODS WHICH YOU HAVE ENTRUSTED TO ME AND WHICH CONDITIONS.I HOLD IN TRUST FOR YOU TO THE FOLLOWING PURPOSE AND ON THE FOLLOWING.</b> 
                       <b>(1)</b>THE GOODS HAVE BEEN ENTRUSTED TO ME FOR THE SALE PURPOSE BEING SHOW TO INTENDING PURCHASERS OF INSPECTION.<b> (2)</b>THE GOODS REMAIN YOUR PROPERTY AND I 
                      ACQUIRE NO RIGHT TO PROPERTY OR INTEREST IN THEM TILL A SALE NOTE SIGNED BY YOU IS PASSED OR TILL THE PRICE IS PAID IN RESPECT THERE OF NOT WHITHSTANDING THE FACT THAT MENTION IS MADE OF THE RATE OR PRICE IN THE 
                      PARTICULARS OF GOODS HEREIN MENTIONED ON THE REVERSE.<b> (3)</b>I AGREE NOT TO SELL OR PLEDGE OR MORTGAGE OR HYPOTHECT THE SAID GOODS OR OTHERWISE DEAL WITH THEM IN ANY AMNNER TILL A SALE NOT SIGNED BY YOU IS PASSED OR 
                      THE PRICE IS PAID TO YOU.<b> (4)</b>THE GOODS ARE TO BE RETURNED TO YOU FORTHWITH WHENEVER DEMAND BACK.<b> (5)</b>THE GOODS WILL BE AT MY RISK IN ALL RESPECT TILL SALE NOTE SIGNED BY YOU IS PASSED IN RESPECT THERE OF OR TILL THE PRICE 
                      IS NOT PAID TO YOU FOR THE GOODS ARE RETURNED TO YOU AND I AM RESPONSIBLE TO YOU FOR THE RETURN OF THE SIDE GOODS IN THE SAME CONDITIONS AS I HAVE RECEIVED THE SAME<b> (6)</b>SUBJECT TO MUMBAI JURISDICTION
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
                <hr>
                `
                }//Main Foor Loop End  
            }
            htmlString += `</div>
            </body>
              </body>
              </html>
              `;
        }

        else if (memoType == "INDIAOVERSEAS") {

            var firstPageCount: number = 24;
            var midPageCount: number = 41;
            var lastPageCount: number = 24;
            var totalPageCount: number;
            var skip: number = 0;
            var invLength = memoObj.inventoryItems.length;

            var pageCount = memoObj.inventoryItems.length / firstPageCount;
            var roundedPageCount = Math.floor(pageCount);
            totalPageCount = roundedPageCount < pageCount ? roundedPageCount + 1 : roundedPageCount;

            if (invLength > 48) {
                invLength = invLength - firstPageCount - lastPageCount; //minus the 1st and 2nd page stone
                var pageCount = invLength / midPageCount; // Divide with 
                pageCount = pageCount + 2; //Added 1st and last page
                var roundedPageCount = Math.floor(pageCount);
                totalPageCount = roundedPageCount < pageCount ? roundedPageCount + 1 : roundedPageCount;
            }

            if (memoObj.inventoryItems.length > 7 && totalPageCount == 1)
                totalPageCount = 2
            if (memoObj.isPackingList)
                totalPageCount = 1

            var lastpagedeclaration: boolean = false;

            for (let index = 1; index <= totalPageCount; index++) {

                if (lastpagedeclaration == true)
                    break

                htmlString += `        
        <body onload="window.print(); window.close();">      
        <p style="margin: 0;font-size: 14px;text-align: center;"><b>DELIVERY CHALLAN -CONSIGNMENT</b></p>
        <p style="margin: 0;font-size: 12px;font-weight: 600;text-align: center;">IN LIUE OF INVOICE AS PER PROVISION UNDER
          RULE 55 CGST RULE 2017</p>
      
        <div class="challan-new">
          <div class="challan-leftside">
            <div class="lefstside-subgrid">
              <div class="grid-1">
                <small>Exporter</small><span style="margin-left: 10px;"><b></b></span>
                `
                if (memoObj.organization.name == "GLOWSTAR") {
                    htmlString += `<img src="assets/billimage/GlowstareG.png">`
                }
                else if (memoObj.organization.name == "SarjuImpex") {
                    htmlString += `<img src="assets/billimage/SarjuS.png">`
                }
                htmlString += `
              </div>
              <div class="grid-1">
              <p><b>` + (memoObj.organization.name ?? "") + `</b></p>
              <p>` + (memoObj.organization.address?.line1 ?? "") + `,` + (memoObj.organization.address?.line2 ?? "") + `<br>
              ` + (memoObj.organization.address?.city ?? "") + `,` + (memoObj.organization.address?.state ?? "") + `,` + (memoObj.organization.address?.country ?? "") + `</p>          
                <p>Tele No.` + (memoObj.organization.phoneNo ?? "") + `,` + (memoObj.organization.mobileNo ?? "") + `</p>
                <p>Email.` + (memoObj.organization.email ?? "") + `</p> 
              </div>
            </div>
            `
                if (index == 1)//First Page 
                {
                    htmlString += `
              <div class="lefstside-subgrid border-top-2" style="height:254px;">
              <div class="grid-1">
              <p>Consignee</p>     
                <p><b>` + (memoObj.consigneeName ?? "") + `</b></p>          
                <p> ` + (memoObj.consigneeAddress ?? "") + `</p>
              </div>
            </div>
            <div class="box-two border-top-2">
              <div class="box-1 p-1 border-right-2 border-bottom-2">
                <small>Pre-Carriage by</small>
                <p>` + (memoObj.courierName.name ?? "") + `</p>
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
                <p>` + (memoObj.portOfLoading ?? "") + `</p>
              </div>
              <div class="box-1 p-1 border-right-2">
                <small>Port of Discharge</small>
                <p>` + (memoObj.party.address?.city ?? "") + `</p>
              </div>
              <div class="box-1 p-1">
                <small>Final Destination</small>
                <p>` + (memoObj.party.address?.country ?? "") + `</p>
              </div>
            </div>`
                }
                htmlString += ` 
          </div>
      
          <div class="challan-rightside">
          <div class="box-two">
          <div class="box-1 p-1 border-bottom-2 border-right-2">
            <small>Del.Challan No.& Dt.</small><span style="margin-left: 10px;">` + this.utilityService.getISOtoStringDate(memoObj.createdDate) + `</span>
            <p>` + memoObj.memoNo + `</p>
          </div>
          <div class="box-1 p-1 border-bottom-2">
            <small>Exporter's Ref</small>
            <p><b>IEC No :</b> ` + (memoObj.organization.iecNo ?? "") + `</p>
          </div>
          </div>
      
          <div class="box-full p-1 border-bottom-2" style="padding-bottom: 21px;">
            <small>Buyer's Order no. & Date</small>
          </div>
      
          <div class="box-full p-1 border-bottom-2">
            <small>Other Reference (s)</small><span style="margin-left: 25px;"><b>GST No : ` + (memoObj.organization.gstNo ?? "") + `</b></span>   
          </div>`
                if (index == 1)//First Page 
                {
                    htmlString += `      
            <div class="box-full p-1">
              <small>Buyer (If other than consignee)</small>
              <p><b>` + (memoObj.party.name ?? "") + `</b></p>
              <p>` + (memoObj.party.address.line1 ?? "") + `,` + (memoObj.party.address.line2 ?? "") + `, <br>
              ` + (memoObj.party.address.city ?? "") + `,` + (memoObj.party.address.state ?? "") + `,` + (memoObj.party.address.country) + `,
              ZipCode : ` + (memoObj.party.address.zipCode ?? "") + `
              </p>
              <p>TEL: ` + (memoObj.party.mobileNo ?? "") + `, FAX : ` + (memoObj.party.faxNo ?? "") + `</p>
            </div>
      
            <div class="box-two border-top-2">
              <div class="box-1 p-1 border-right-2 border-bottom-2">
                <small>Country of Origin of Goods</small>
                <p>` + (memoObj.organization.address?.country ?? "") + `</p>
              </div>
              <div class="box-1 p-1 border-bottom-2">
                <small>Country of Final Destination</small>
                <p>` + (memoObj.party.address.country ?? "") + `</p>
              </div>
            </div>
      
            <div class="box-full p-1">
              <small>Terms of Delivery and Payment</small>
              <p>` + (memoObj.terms ?? "") + `</p>
              <br>
              <p><b>OUR BANKERS :</b></p>
              <p><b>`+ (memoObj.bank.bankName ?? "") + `</b></p>
              <p><small>` + (memoObj.bank.address?.line1 ?? "") + `,` + (memoObj.bank.address?.line2 ?? "") + `,
              ` + (memoObj.bank.address?.city ?? "") + `,` + (memoObj.bank.address?.state ?? "") + `,` + (memoObj.bank.address?.country ?? "") + `</small></p>
              <p>A/C Name: `+ (memoObj.bank.accountName ?? "") + `</p>
              <p>A/C No: `+ (memoObj.bank.accountNo ?? "") + `</p>
              <p>SWIFT Code: `+ (memoObj.bank.swift ?? "") + `</p>        
              <p><b>AD CODE: `+ (memoObj.bank.adCode ?? "") + `</b></p>
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

                let filterInventoryItems = memoObj.inventoryItems.slice(skip, skip + thispagecount);

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
                          <th>Rate ` + (memoObj.fromCurrency ?? "") + `  $</th>
                          <th>Amount `+ (memoObj.fromCurrency ?? "") + ` $</th>
                        </tr>
                        `

                    var totweight: number = 0;
                    var totnetAmount: number = 0

                    if (!memoObj.isPackingList) {

                        for (let indexS = 0; indexS <= filterInventoryItems.length; indexS++) {
                            let obj = filterInventoryItems[indexS];

                            if (obj) {
                                htmlString += `            
                        <tr>
                        <td>`+ (indexS + 1 + skip) + `</td>                  
                        <td>`+ (this.getDisplayNameFromMasterDNorm(obj.shape.trim()) ?? "") + `-` + (obj.color ?? "") + `-` + (obj.clarity ?? "") + `</td>                  
                        <td>`+ this.utilityService.getMesurmentString(obj.shape, obj.measurement.length, obj.measurement.width, obj.measurement.height) + `</td>
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
                    <th colspan="3">Gross Weight: ` + memoObj.boxWeight + ` Kgs.</th>  
                    <th>Page Total</th>
                    <th>CRTS</th>
                    <th>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(totweight) + `</th>
                    <th>` + (memoObj.fromCurrency ?? "") + ` $</th>
                    <th>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(totnetAmount) + `</th>
                  </tr>        
                </tbody>
              </table>
            </div>`
                    }

                    else if (memoObj.isPackingList) {
                        htmlString += `            
                  <tr style="height:50px;">
                  <td>1</td>   
                  <td colspan="3">0.50 CT ABOVE SIZE & AS PER PACKING LIST 1</td>           
                  <td>`+ aboveOneCtTotalStone + `</td>                  
                  <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit((aboveOneCtSumWeight ?? "")) + `</td>
                  <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit((aboveFiveCentAmont / aboveOneCtSumWeight ?? 0)) + `</td>
                  <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit((aboveFiveCentAmont) ?? 0) + `</td>
                  </tr>`
                        htmlString += `            
                  <tr style="height:50px;">
                  <td>2</td>   
                  <td colspan="3">0.50 CT BELOW SIZE & AS PER PACKING LIST 2</td>           
                  <td>`+ belowOneCtTotalStone + `</td>                  
                  <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit((belowOneCtSumWeight ?? "")) + `</td>
                  <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit((belowFiveCentTotalAmount / belowOneCtSumWeight ?? 0)) + `</td>
                  <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit((belowFiveCentTotalAmount) ?? 0) + `</td>
                  </tr>`

                        htmlString += ` 
                  <tr>
                    <th colspan="3">Gross Weight: ` + memoObj.boxWeight + ` Kgs.</th>  
                    <th>Total</th>
                    <th>CRTS</th>
                    <th>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(sumWeight) + `</th>
                    <th>` + (memoObj.fromCurrency ?? "") + ` $</th>
                    <th>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(sumGrandTotalPlusTax ?? 0) + `</th>
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
                    (index == 2 && totalPageCount == 2 && memoObj.inventoryItems.length < 6)
                    && lastpagedeclaration == false
                )//Last Page Declaration
                {
                    lastpagedeclaration = true;
                    htmlString += `
              <div class="details p-1">
                <p>We undertake to re import the goods & will produce to RBI documentry evidence such as exchange control copy of
                  bill of entry & coustom attested invoice in support there of within 60 days from the date of clearance of the
                  consignment in case the goods are sold , the sale proceeds will be repatriated to India through proper banking
                  channel & will produce to RBI , bank realisation certificate in support there of further we will re-import unsold
                  goods within the prescribed the time limit.</p>
                <p><b>Note : TRANSPORTATION OF THE GOODS FOR THE REASONS OTHER THAN BY WAY OF SUPPLY UNDER RULE 55 CGST READ
                  WITH <br> CIRCULAR No.108/27/2019 CGST DT.18/07/2019</b></p>
              </div>        
              `
                    if (memoObj.shippingCharge > 0) {
                        if (memoObj.exportType == "CIF") {
                            htmlString += `
                  <div style="overflow:hidden">
                  <p><span style="text-align:right"><b>Add Freight & Insurance :` + memoObj.shippingCharge + `</b></span></p> 
                  </div>`
                        }
                        else if (memoObj.exportType == "CFR") {
                            htmlString += `
                    <div style="overflow:hidden">
                    <p><span style="text-align:right"><b>Add Freight :` + memoObj.shippingCharge + `</b></span></p> 
                    </div>`
                        }
                    }

                    htmlString += `
              <div class="inv-details">
              <p>
      
              <small style="margin-left: 10px;">Amount Chargeable(In Words)@:</small>
      
              <b style="margin-right: 20px;">` + (this.utilityService.ConvertToFloatWithDecimalTwoDigit(memoObj.toCurRate ?? 0) ?? "") + `</b>
      
              <b>Taxable ` + (memoObj.toCurrency ?? "") + `. : ` + this.utilityService.ConvertToFloatWithDecimalTwoDigit(sumConvGrandTotalPlusTax ?? 0) + `</b>
              
              <span><b>` + (memoObj.exportType ?? "") + `  ` + (memoObj.fromCurrency ?? "") + ` $ Total</b>
              <b>` + this.utilityService.ConvertToFloatWithDecimalTwoDigit(sumGrandTotalPlusTax ?? 0) + `</b>
              </span>
      
              </p>    
              
              <p class="inv-p" style="font-size: 16px;">
              Total ` + (memoObj.exportType ?? "") + `  ` + (memoObj.fromCurrency ?? "") + ` $   
              ` + this.utilityService.convertAmoutToWord(this.utilityService.ConvertToFloatWithDecimalTwoDigitRoundWithNum(sumGrandTotalPlusTax), "USD") + `</p>
              <p style="height:7px;">&nbsp</p>
              <p class="inv-p">"The Diamonds herein invoiced have been purchased from legitimate sources not involved in funding
                conflict , in compliance with United Nations resolutions and corresponding national laws .</p>
              <p class="inv-p">The Seller hereby guarantees that these diamonds are conflict free and confirms adherence to the
                WDC SoW Guidelines."</p>
              <p class="inv-p">The Diamonds herein invoiced are exclusively of natural origin and untreated based on personal
                knowledge and/or written guarantees provided by the supplier of these diamonds.</p>
              <p class="inv-p">The acceptance of goods herein invoiced will be as per WFDB guidelines.</p>
              <p style="margin-left: 10px;"><b>WE DON'T WANT TO CLAIM RoDTEP ON THE EXPORT ITEMS LISTED UNDER THIS INVOICE NO</b></p>
              <p style="margin-left: 10px;"><b>PAYMENT INSTRUCTION :</b>BENEFICIARY : `+ (memoObj.bank.accountName ?? "") + `</p>
              <p style="margin-left: 10px;">OUR BANK : ` + (memoObj.bank.address?.line1 ?? "") + `,` + (memoObj.bank.address?.line2 ?? "") + `,
              ` + (memoObj.bank.address?.city ?? "") + `,` + (memoObj.bank.address?.state ?? "") + `,` + (memoObj.bank.address?.country ?? "") + `</p>
              <p style="margin-left: 10px;">A/C NO. `+ (memoObj.bank.accountNo ?? "") + `, SWIFT CODE : ` + (memoObj.bank.swift ?? "") + `</p>
              <p style="margin-left: 10px;">INTERMEDIARY BANK : `+ (memoObj.bank.intermediaryBankName ?? "") + ` ,SWIFT CODE: ` + (memoObj.bank.intermediaryBankswift ?? "") + `</p>        
              <p style="margin-left: 10px;margin-top: 15px;""><b>STATE OF ORIGIN : ` + (memoObj.organization.address.stateCode ?? "") + `, DISTRICT OF ORIGIN : ` + (memoObj.organization.address.districtCode ?? "") + `</b></p>
              <p style="margin-left: 10px;margin-top: 15px;""><b>DOOR TO DOOR INSURANCE COVERED BY `+ (memoObj.courierName.name ?? "") + `</b></p>
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
                <h5>PAN : ` + (memoObj.organization.incomeTaxNo ?? "") + `</h5>
                </p>
                <p><small>We declare that this Invoice shows the actual price of the goods described and that all particulars
                    are true and correct.</small></p>
              </div>
              <div class="grid-2">
                <p>Signature & Date<br>` + this.utilityService.getISOtoStringDate(memoObj.createdDate) + `</p>
                <p><b>For ` + (memoObj.organization.name ?? "") + `<br>Partner/Auth.Sign.</b></p>
              </div>
            </div>
          <div class="pager border-top-2 border-bottom-2 border-left-2 border-right-2 " style="overflow:hidden; padding-right:20px;">
            <span>Page `+ index + ` of ` + totalPageCount + `</span>
            </div>       
          </div>
        </div>
      </body>`

            }//Main Foor Loop End

            if (memoObj.isPackingList) {
                //Above 1 Carat PL
                htmlString += `
              <div class="body-middle">
              <table>
              <tr>
              <td>Organization :<b> ` + (memoObj.organization.name ?? "") + `</b></td>
              <td>No : <b>` + (memoObj.memoNo ?? "") + `</b></td>
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
                    <th>Measurment</th>
                    <th>LAB</th>
                    <th>REPORT NO</th>      
                    <th>RAPAPORT</th>     
                    <th>PRICE `+ (memoObj.fromCurrency ?? "") + ` /PER CT</th>
                    <th>NET AMT `+ (memoObj.fromCurrency ?? "") + `</th>
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
                          <td>`+ this.utilityService.getMesurmentString(obj.shape, obj.measurement.length, obj.measurement.width, obj.measurement.height) + `</td>
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
                            <td><b>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(aboveOneCtSumWeight ?? 0) + `</b></td>
                            <td colspan="7">&nbsp</td>                      
                            <td><b>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(aboveFiveCentAmont ?? 0) + `</b></td>
                          </tr>  
                  </tfoot>
                  </table>
                  </div>`

                //Below 1 Carat PL
                htmlString += `
              <div class="body-middle" style="page-break-before: always;">
              <table>
              <tr>
              <td>Organization :<b> ` + (memoObj.organization.name ?? "") + `</b></td>
              <td>No : <b>` + (memoObj.memoNo ?? "") + `</b></td>
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
                    <th>Measurment</th>
                    <th>LAB</th>
                    <th>REPORT NO</th>      
                    <th>RAPAPORT</th>     
                    <th>PRICE `+ (memoObj.fromCurrency ?? "") + ` /PER CT</th>
                    <th>NET AMT `+ (memoObj.fromCurrency ?? "") + `</th>
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
                          <td>`+ this.utilityService.getMesurmentString(obj.shape, obj.measurement.length, obj.measurement.width, obj.measurement.height) + `</td>
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
                            <td><b>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(belowOneCtSumWeight ?? 0) + `</b></td>
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
        return htmlString;
    }
}
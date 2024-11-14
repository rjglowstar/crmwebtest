import { Injectable } from '@angular/core';
import { MasterConfig, MasterDNorm } from 'shared/enitites';
import { UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { MasterConfigService } from '../../masterconfig/masterconfig.service';
import { InventoryItems, Memo } from '../../../entities';

@Injectable({
    providedIn: 'root'
})

export class LabMemoPrint {
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

        if (memoType == "OVERSEASLAB") {

            htmlString += `        
        <body onload="window.print(); window.close();">      
        <p style="margin: 0;font-size: 14px;text-align: center;"><b>INVOICE</b></p>  
      
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

            htmlString += ` 
          </div>
          <div class="challan-rightside">
          <div class="box-two">
          <div class="box-1 p-1 border-bottom-2 border-right-2">
            <small>Invoice No.& Dt.</small><span style="margin-left: 10px;">` + this.utilityService.getISOtoStringDate(memoObj.createdDate) + `</span>
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
              <p>GR WAIVED FOR CERIFICATION</p>
              <br>
              <p><b>OUR BANKERS :</b></p>
              <p><b>`+ (memoObj.bank.bankName ?? "") + `</b></p>
              <p><small>` + (memoObj.bank.address?.line1 ?? "") + `,` + (memoObj.bank.address?.line2 ?? "") + `,
              ` + (memoObj.bank.address?.city ?? "") + `,` + (memoObj.bank.address?.state ?? "") + `,` + (memoObj.bank.address?.country ?? "") + `</small></p>
              <p>A/C Name: `+ (memoObj.bank.accountName ?? "") + `</p>
              <p>A/C No: `+ (memoObj.bank.accountNo ?? "") + `</p>
              <p>SWIFT Code: `+ (memoObj.bank.swift ?? "") + `</p>        
              <p><b>AD CODE: `+ (memoObj.bank.adCode ?? "") + `</b></p>
            </div>
            </div>
            </div>
      
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

            htmlString += `            
                  <tr style="height:50px;">
                  <td>1</td>   
                  <td colspan="3">`+ (memoObj.plDeclaration ?? "") + `</td>           
                  <td>`+ memoObj.inventoryItems.length + `</td>                  
                  <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit((sumWeight ?? "")) + `</td>
                  <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit((sumGrandTotalPlusTax / sumWeight ?? 0)) + `</td>
                  <td>`+ (sumGrandTotalPlusTax ?? "") + `</td>
                  </tr>`

            htmlString += ` 
                  <tr>
                    <th colspan="3">Gross Weight: ` + memoObj.boxWeight + ` Kgs.</th>  
                    <th>Total</th>
                    <th>CRTS</th>
                    <th>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(sumWeight) + `</th>
                    <th>` + (memoObj.fromCurrency ?? "") + ` $</th>
                    <th>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(sumGrandTotalPlusTax) + `</th>
                  </tr>        
                </tbody>
              </table>
            </div>`

            htmlString += ` 
              <div class="chargable">
              <div class="details p-1">
              <p><b>Certification/Gradation Declaration :</b></p>
              <p>EXPORTER HERE BY DECLARE THAT THE GOODS WILL BE RETURN TO INDIA WITHIN THREE MONTHS FROM THE DATE OF EXPORT AFTER CERTIFICATION AS PER FOREIGN
              TRADE POLICY 2015-2020 PARA 4.43 & 4.44 AND PARA 4.74 OF HAND BOOK OF PROCEDURE 2015-2020.</p>
              </div>
      
              <div class="details p-1">
              <p><b>Declaration:</b></p>
              <p>"The diamonds herein invoiced have been purchased from legitimate sorrces not involved in funding conflict and in compliance with United Nations Resolutions. The sellers guarentees
              that these diamonds are conflict free on personal knowledge/written guarentee provided by the supplier of these diamonds"</p>
              </div>
      
              <div class="details p-1">        
              <p><b>"WE DON'T WANT TO CLAIM RODTEP ON THE EXPORT ITEMS LISTED UNDER THIS INVOICE NO"</b></p>
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
              <small style="margin-left: 10px;">Amount Chargeable (In Words) : </small> 
              <span><b>` + (memoObj.exportType ?? "") + `  ` + (memoObj.fromCurrency ?? "") + ` $ Total</b>
              <b>` + this.utilityService.ConvertToFloatWithDecimalTwoDigit(sumGrandTotalPlusTax ?? 0) + `</b>
              </span>
              </p>            
              <p class="inv-p" style="font-size: 16px;">
              Total ` + (memoObj.exportType ?? "") + `  ` + (memoObj.fromCurrency ?? "") + ` $   
              ` + this.utilityService.convertAmoutToWord(this.utilityService.ConvertToFloatWithDecimalTwoDigitRoundWithNum(sumGrandTotalPlusTax), "USD") + `</p>
              <p style="height:7px;">&nbsp</p>
              </div>
      
              <div class="details p-1">       
              <p style="margin-left: 10px;"><b>PAYMENT INSTRUCTION :</b></p>
              <p style="margin-left: 10px;">BENEFICIARY : `+ (memoObj.bank.accountName ?? "") + `</p>
              <p style="margin-left: 10px;">OUR BANK : `+ (memoObj.bank.bankName ?? "") + `</p>
              <p style="margin-left: 10px;">BANK ADDRESS: ` + (memoObj.bank.address?.line1 ?? "") + `,` + (memoObj.bank.address?.line2 ?? "") + `,
              ` + (memoObj.bank.address?.city ?? "") + `,` + (memoObj.bank.address?.state ?? "") + `,` + (memoObj.bank.address?.country ?? "") + `</p>
              <p style="margin-left: 10px;">A/C NO. `+ (memoObj.bank.accountNo ?? "") + `, SWIFT CODE : ` + (memoObj.bank.swift ?? "") + `</p>        
              <p style="margin-left: 10px;">INTERMEDIARY BANK : `+ (memoObj.bank.intermediaryBankName ?? "") + ` ,SWIFT CODE: ` + (memoObj.bank.intermediaryBankswift ?? "") + `</p>        
              <p style="margin-left: 10px;">INTERMEDIARY BANK ADDRESS: `+ (memoObj.bank.intermediaryBankAddress ?? "") + `</p>
              </div>
      
              <div class="details p-1">  
              <p style="margin-left: 10px;margin-top: 5px;""><b>STATE OF ORIGIN : `+ (memoObj.organization.address.stateCode ?? "") + `, DISTRICT OF ORIGIN : ` + (memoObj.organization.address.districtCode ?? "") + `</b></p>
              <p style="margin-left: 10px;margin-top: 5px;""><b>STANDARD UNIT QUANTINTY CODE: (CTM)</b></p>
              <p style="margin-left: 10px;margin-top: 5px;""><b>DETAILES OF PREFERENTIAL AGREEMENTS: NCPTI</b></p>
              <p style="margin-left: 10px;margin-top: 5px;""><b>DOOR TO DOOR INSURANCE COVERED BY : `+ (memoObj.courierName.name ?? "") + `</b></p>
              </div> 
              `;

            //style="page-break-after: always" For Break The Page
            htmlString += `
          <div class="inv-details" style="page-break-after: always;">
            <div class="sign-div">
              <div class="grid-1 p-1">   
              <p>Declaration :</p>
              <p><small>We declare that this Invoice shows the actual price of the goods described and that all particulars
                    are true and correct.</small></p>
              <p><h3>PAN : ` + (memoObj.organization.incomeTaxNo ?? "") + `</h3></p>
              </div>
              <div class="grid-2">
                <p>Signature & Date<br>` + this.utilityService.getISOtoStringDate(memoObj.createdDate) + `</p>
                <p><b>For ` + (memoObj.organization.name ?? "") + `<br>Partner/Auth.Sign.</b></p>
              </div>
            </div>     
          </div>
        </div>
      </body>`

            htmlString += `
                <div class="body-middle">
      
                <table>
                <tr>
                <td>Organization :<b> ` + (memoObj.organization.name ?? "") + `</b></td>
                <td>Invoice No : <b>` + (memoObj.memoNo ?? "") + `</b></td>
                <td>Invoice Date : <b>` + this.utilityService.getISOtoStringDate(memoObj.createdDate) + `</b></td>
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
                    <th colspan="2">MEASUREMENT</th>       
                    <th>Height</th>             
                    <th>RAPAPORT</th>     
                    <th>PRICE `+ (memoObj.fromCurrency ?? "") + ` /PER CT</th>
                    <th>NET AMT `+ (memoObj.fromCurrency ?? "") + `</th>
                  </thead>
                  <tbody>`

            for (let index = 0; index <= memoObj.inventoryItems.length; index++) {
                let obj = memoObj.inventoryItems[index];
                if (obj) {

                    var V1 = 0;
                    var V2 = 0;
                    var Vlength = obj.measurement.length;
                    var Vwidth = obj.measurement.width;

                    if (obj.shape.toUpperCase() == "RBC" || obj.shape.toUpperCase() == "ROUND") {
                        V2 = Vlength < Vwidth ? Vlength : Vwidth;
                        V1 = Vlength < Vwidth ? Vwidth : Vlength;
                    }
                    else {
                        V1 = Vlength < Vwidth ? Vlength : Vwidth;
                        V2 = Vlength < Vwidth ? Vwidth : Vlength;
                    }

                    htmlString += `
                          <tr>
                          <td>`+ (index + 1) + `</td>
                          <td>`+ (obj.stoneId ?? "") + `</td>
                          <td>`+ (this.getDisplayNameFromMasterDNorm(obj.shape.trim()) ?? "") + `</td>
                          <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.weight ?? 0) ?? "") + `</td>
                          <td>`+ (obj.color ?? "") + `</td>
                          <td>`+ (obj.clarity ?? "") + `</td>  
                          <td>`+ (V1 ?? "") + `</td>
                          <td>`+ (V2 ?? "") + `</td>
                          <td>`+ (obj.measurement.height ?? "") + `</td>
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

        if (memoType == "OVERSEASLAB") {

            htmlString += `        
        <body onload="window.print(); window.close();">      
        <p style="margin: 0;font-size: 14px;text-align: center;"><b>INVOICE</b></p>  
      
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

            htmlString += ` 
          </div>
          <div class="challan-rightside">
          <div class="box-two">
          <div class="box-1 p-1 border-bottom-2 border-right-2">
            <small>Invoice No.& Dt.</small><span style="margin-left: 10px;">` + this.utilityService.getISOtoStringDate(memoObj.createdDate) + `</span>
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
              <p>GR WAIVED FOR CERIFICATION</p>
              <br>
              <p><b>OUR BANKERS :</b></p>
              <p><b>`+ (memoObj.bank.bankName ?? "") + `</b></p>
              <p><small>` + (memoObj.bank.address?.line1 ?? "") + `,` + (memoObj.bank.address?.line2 ?? "") + `,
              ` + (memoObj.bank.address?.city ?? "") + `,` + (memoObj.bank.address?.state ?? "") + `,` + (memoObj.bank.address?.country ?? "") + `</small></p>
              <p>A/C Name: `+ (memoObj.bank.accountName ?? "") + `</p>
              <p>A/C No: `+ (memoObj.bank.accountNo ?? "") + `</p>
              <p>SWIFT Code: `+ (memoObj.bank.swift ?? "") + `</p>        
              <p><b>AD CODE: `+ (memoObj.bank.adCode ?? "") + `</b></p>
            </div>
            </div>
            </div>
      
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

            htmlString += `            
                  <tr style="height:50px;">
                  <td>1</td>   
                  <td colspan="3">0.50 CT ABOVE SIZE & AS PER PACKING LIST 1</td>           
                  <td>`+ aboveOneCtTotalStone + `</td>                  
                  <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit((aboveOneCtSumWeight ?? "")) + `</td>
                  <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit((aboveFiveCentAmont / aboveOneCtSumWeight ?? 0)) + `</td>
                  <td>`+ (aboveFiveCentAmont ?? "") + `</td>
                  </tr>`

            htmlString += `            
                  <tr style="height:50px;">
                  <td>2</td>   
                  <td colspan="3">0.50 CT BELOW SIZE & AS PER PACKING LIST 2</td>           
                  <td>`+ belowOneCtTotalStone + `</td>                  
                  <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit((belowOneCtSumWeight ?? "")) + `</td>
                  <td>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit((belowFiveCentTotalAmount / belowOneCtSumWeight ?? 0)) + `</td>
                  <td>`+ (belowFiveCentTotalAmount ?? "") + `</td>
                  </tr>`

            htmlString += ` 
                  <tr>
                    <th colspan="3">Gross Weight: ` + memoObj.boxWeight + ` Kgs.</th>  
                    <th>Total</th>
                    <th>CRTS</th>
                    <th>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(sumWeight) + `</th>
                    <th>` + (memoObj.fromCurrency ?? "") + ` $</th>
                    <th>`+ this.utilityService.ConvertToFloatWithDecimalTwoDigit(sumGrandTotalPlusTax) + `</th>
                  </tr>        
                </tbody>
              </table>
            </div>`

            htmlString += ` 
              <div class="chargable">
              <div class="details p-1">
              <p><b>Certification/Gradation Declaration :</b></p>
              <p>EXPORTER HERE BY DECLARE THAT THE GOODS WILL BE RETURN TO INDIA WITHIN THREE MONTHS FROM THE DATE OF EXPORT AFTER CERTIFICATION AS PER FOREIGN
              TRADE POLICY 2015-2020 PARA 4.43 & 4.44 AND PARA 4.74 OF HAND BOOK OF PROCEDURE 2015-2020.</p>
              </div>
      
              <div class="details p-1">
              <p><b>Declaration:</b></p>
              <p>"The diamonds herein invoiced have been purchased from legitimate sorrces not involved in funding conflict and in compliance with United Nations Resolutions. The sellers guarentees
              that these diamonds are conflict free on personal knowledge/written guarentee provided by the supplier of these diamonds"</p>
              </div>
      
              <div class="details p-1">        
              <p><b>"WE DON'T WANT TO CLAIM RODTEP ON THE EXPORT ITEMS LISTED UNDER THIS INVOICE NO"</b></p>
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
              <small style="margin-left: 10px;">Amount Chargeable (In Words) : </small> 
              <span><b>` + (memoObj.exportType ?? "") + `  ` + (memoObj.fromCurrency ?? "") + ` $ Total</b>
              <b>` + this.utilityService.ConvertToFloatWithDecimalTwoDigit(sumGrandTotalPlusTax ?? 0) + `</b>
              </span>
              </p>            
              <p class="inv-p" style="font-size: 16px;">
              Total ` + (memoObj.exportType ?? "") + `  ` + (memoObj.fromCurrency ?? "") + ` $   
              ` + this.utilityService.convertAmoutToWord(this.utilityService.ConvertToFloatWithDecimalTwoDigitRoundWithNum(sumGrandTotalPlusTax), "USD") + `</p>
              <p style="height:7px;">&nbsp</p>
              </div>
      
              <div class="details p-1">       
              <p style="margin-left: 10px;"><b>PAYMENT INSTRUCTION :</b></p>
              <p style="margin-left: 10px;">BENEFICIARY : `+ (memoObj.bank.accountName ?? "") + `</p>
              <p style="margin-left: 10px;">OUR BANK : `+ (memoObj.bank.bankName ?? "") + `</p>
              <p style="margin-left: 10px;">BANK ADDRESS: ` + (memoObj.bank.address?.line1 ?? "") + `,` + (memoObj.bank.address?.line2 ?? "") + `,
              ` + (memoObj.bank.address?.city ?? "") + `,` + (memoObj.bank.address?.state ?? "") + `,` + (memoObj.bank.address?.country ?? "") + `</p>
              <p style="margin-left: 10px;">A/C NO. `+ (memoObj.bank.accountNo ?? "") + `, SWIFT CODE : ` + (memoObj.bank.swift ?? "") + `</p>        
              <p style="margin-left: 10px;">INTERMEDIARY BANK : `+ (memoObj.bank.intermediaryBankName ?? "") + ` ,SWIFT CODE: ` + (memoObj.bank.intermediaryBankswift ?? "") + `</p>        
              <p style="margin-left: 10px;">INTERMEDIARY BANK ADDRESS: `+ (memoObj.bank.intermediaryBankAddress ?? "") + `</p>
              </div>
      
              <div class="details p-1">  
              <p style="margin-left: 10px;margin-top: 5px;""><b>STATE OF ORIGIN : `+ (memoObj.organization.address.stateCode ?? "") + `, DISTRICT OF ORIGIN : ` + (memoObj.organization.address.districtCode ?? "") + `</b></p>
              <p style="margin-left: 10px;margin-top: 5px;""><b>STANDARD UNIT QUANTINTY CODE: (CTM)</b></p>
              <p style="margin-left: 10px;margin-top: 5px;""><b>DETAILES OF PREFERENTIAL AGREEMENTS: NCPTI</b></p>
              <p style="margin-left: 10px;margin-top: 5px;""><b>DOOR TO DOOR INSURANCE COVERED BY : `+ (memoObj.courierName.name ?? "") + `</b></p>
              </div> 
              `;

            //style="page-break-after: always" For Break The Page
            htmlString += `
          <div class="inv-details" style="page-break-after: always;">
            <div class="sign-div">
              <div class="grid-1 p-1">   
              <p>Declaration :</p>
              <p><small>We declare that this Invoice shows the actual price of the goods described and that all particulars
                    are true and correct.</small></p>
              <p><h3>PAN : ` + (memoObj.organization.incomeTaxNo ?? "") + `</h3></p>
              </div>
              <div class="grid-2">
                <p>Signature & Date<br>` + this.utilityService.getISOtoStringDate(memoObj.createdDate) + `</p>
                <p><b>For ` + (memoObj.organization.name ?? "") + `<br>Partner/Auth.Sign.</b></p>
              </div>
            </div>     
          </div>
        </div>
      </body>`

            htmlString += `
                <div class="body-middle">
      
                <table>
                <tr>
                <td>Organization :<b> ` + (memoObj.organization.name ?? "") + `</b></td>
                <td>Invoice No : <b>` + (memoObj.memoNo ?? "") + `</b></td>
                <td>Invoice Date : <b>` + this.utilityService.getISOtoStringDate(memoObj.createdDate) + `</b></td>
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
                    <th colspan="2">MEASUREMENT</th>       
                    <th>Height</th>             
                    <th>RAPAPORT</th>     
                    <th>PRICE `+ (memoObj.fromCurrency ?? "") + ` /PER CT</th>
                    <th>NET AMT `+ (memoObj.fromCurrency ?? "") + `</th>
                  </thead>
                  <tbody>`

            for (let index = 0; index <= abovePointFiveCentData.length; index++) {
                let obj = abovePointFiveCentData[index];
                if (obj) {

                    var V1 = 0;
                    var V2 = 0;
                    var Vlength = obj.measurement.length;
                    var Vwidth = obj.measurement.width;

                    if (obj.shape.toUpperCase() == "RBC" || obj.shape.toUpperCase() == "ROUND") {
                        V2 = Vlength < Vwidth ? Vlength : Vwidth;
                        V1 = Vlength < Vwidth ? Vwidth : Vlength;
                    }
                    else {
                        V1 = Vlength < Vwidth ? Vlength : Vwidth;
                        V2 = Vlength < Vwidth ? Vwidth : Vlength;
                    }

                    htmlString += `
                          <tr>
                          <td>`+ (index + 1) + `</td>
                          <td>`+ (obj.stoneId ?? "") + `</td>
                          <td>`+ (this.getDisplayNameFromMasterDNorm(obj.shape.trim()) ?? "") + `</td>
                          <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.weight ?? 0) ?? "") + `</td>
                          <td>`+ (obj.color ?? "") + `</td>
                          <td>`+ (obj.clarity ?? "") + `</td>  
                          <td>`+ (V1 ?? "") + `</td>
                          <td>`+ (V2 ?? "") + `</td>
                          <td>`+ (obj.measurement.height ?? "") + `</td>
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

            htmlString += `
                <div class="body-middle" style="page-break-before: always;">
      
                <table>
                <tr>
                <td>Organization :<b> ` + (memoObj.organization.name ?? "") + `</b></td>
                <td>Invoice No : <b>` + (memoObj.memoNo ?? "") + `</b></td>
                <td>Invoice Date : <b>` + this.utilityService.getISOtoStringDate(memoObj.createdDate) + `</b></td>
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
                    <th colspan="2">MEASUREMENT</th>       
                    <th>Height</th>             
                    <th>RAPAPORT</th>     
                    <th>PRICE `+ (memoObj.fromCurrency ?? "") + ` /PER CT</th>
                    <th>NET AMT `+ (memoObj.fromCurrency ?? "") + `</th>
                  </thead>
                  <tbody>`

            for (let index = 0; index <= belowPointFiveCentData.length; index++) {
                let obj = belowPointFiveCentData[index];
                if (obj) {

                    var V1 = 0;
                    var V2 = 0;
                    var Vlength = obj.measurement.length;
                    var Vwidth = obj.measurement.width;

                    if (obj.shape.toUpperCase() == "RBC" || obj.shape.toUpperCase() == "ROUND") {
                        V2 = Vlength < Vwidth ? Vlength : Vwidth;
                        V1 = Vlength < Vwidth ? Vwidth : Vlength;
                    }
                    else {
                        V1 = Vlength < Vwidth ? Vlength : Vwidth;
                        V2 = Vlength < Vwidth ? Vwidth : Vlength;
                    }

                    htmlString += `
                          <tr>
                          <td>`+ (index + 1) + `</td>
                          <td>`+ (obj.stoneId ?? "") + `</td>
                          <td>`+ (this.getDisplayNameFromMasterDNorm(obj.shape.trim()) ?? "") + `</td>
                          <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.weight ?? 0) ?? "") + `</td>
                          <td>`+ (obj.color ?? "") + `</td>
                          <td>`+ (obj.clarity ?? "") + `</td>  
                          <td>`+ (V1 ?? "") + `</td>
                          <td>`+ (V2 ?? "") + `</td>
                          <td>`+ (obj.measurement.height ?? "") + `</td>
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

            htmlString += `
              </body>
              </html>
              `;
        }



        return htmlString;
    }
}
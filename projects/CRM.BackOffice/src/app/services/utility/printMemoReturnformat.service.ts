import { Injectable } from '@angular/core';
import { UtilityService } from 'shared/services';
import { MemoInvItem, MemoInvReturnItem, Memoreturn } from '../../entities';

@Injectable({
  providedIn: 'root'
})

export class PrintMemoReturnFormat {

  constructor(
    public utilityService: UtilityService
  ) { }

  public getMemoReturnInvoice(transaction: Memoreturn, memoInv: MemoInvItem[]) {
    let htmlString: string = "";
    let totalStone = 0;
    let totalWeight = 0;
    let totalAmount = 0;
    let totalPerCarat = 0;
    let totalPayableAmount = 0;
    let totlFirstTblStones=0;
    let totlFirsTblCarats =0;
    let totlFirstTblAmount=0;
    let totlFirstTblRatePerCt=0;

    let contain49Down = false;
    let contain49Up = false;

    let contain49UpIndex = transaction.returnInvItems.findIndex(x => x.weight > 0.49);
    if (contain49UpIndex > -1)
      contain49Up = true;

    let contain49DownIndex = transaction.returnInvItems.findIndex(x => x.weight <= 0.49);
    if (contain49DownIndex > -1)
      contain49Down = true;

    if (transaction.returnInvItems.length > 0) {
      totalStone = this.utilityService.ConvertToFloatWithDecimal(transaction.returnInvItems.length);
      totalWeight = this.utilityService.ConvertToFloatWithDecimal(transaction.returnInvItems.reduce((acc, cur) => acc + (cur.weight ? cur.weight : 0), 0));
      totalAmount = this.utilityService.ConvertToFloatWithDecimal(transaction.returnInvItems.reduce((acc, cur) => acc + (cur.price.netAmount ? cur.price.netAmount : 0), 0));
      totalPerCarat = this.utilityService.ConvertToFloatWithDecimal(totalAmount / totalWeight);
      totalPayableAmount = this.utilityService.ConvertToFloatWithDecimal(totalAmount);
    }

    let lisSummItems: Array<{ Desc: string; stoneCnt: number; Carats: number; RatePerCt: number; Total: number, inwardMemoNo: string, inwardMemoDate: Date, srNo: number }> = [];

    var distinctInvNo = transaction.returnInvItems.map((u: MemoInvReturnItem) => u.inwardMemoNo).filter((x: any, i: any, a: any) => x && a.indexOf(x) === i);
    for (let i = 0; i < distinctInvNo.length; i++) {
      var z = distinctInvNo[i];
      var data = transaction.returnInvItems.filter(a => a.inwardMemoNo == z);
      if (data) {
        var ttlStone = this.utilityService.ConvertToFloatWithDecimal(data.length);
        var ttlWeight = this.utilityService.ConvertToFloatWithDecimal(data.reduce((acc, cur) => acc + (cur.weight ? cur.weight : 0), 0));
        var ttlAmount = this.utilityService.ConvertToFloatWithDecimal(data.reduce((acc, cur) => acc + (cur.price.netAmount ? cur.price.netAmount : 0), 0));
        var ttlPerCarat = this.utilityService.ConvertToFloatWithDecimal(ttlAmount / ttlWeight);

        lisSummItems.push({
          Desc: data[i].declaration,
          stoneCnt: ttlStone,
          Carats: ttlWeight,
          RatePerCt: ttlPerCarat,
          Total: ttlAmount,
          inwardMemoNo: data[i].inwardMemoNo,
          inwardMemoDate: data[i].inwardMemoDate,
          srNo: data[i].srNo
        });
        totlFirstTblStones = this.utilityService.ConvertToFloatWithDecimal(lisSummItems.reduce((acc, cur) => acc + (cur.stoneCnt ? cur.stoneCnt : 0), 0));
        totlFirsTblCarats = this.utilityService.ConvertToFloatWithDecimal(lisSummItems.reduce((acc, cur) => acc + (cur.Carats ? cur.Carats : 0), 0));
        totlFirstTblAmount = this.utilityService.ConvertToFloatWithDecimal(lisSummItems.reduce((acc, cur) => acc + (cur.Total ? cur.Total : 0), 0));
        totlFirstTblRatePerCt = this.utilityService.ConvertToFloatWithDecimal(totlFirstTblAmount / totlFirsTblCarats);
      }
    }

    //Above & Below Point Five Cent Carat Calculation
    const abovePointFiveCentData = transaction.returnInvItems.filter((item: MemoInvReturnItem) => item.weight > 0.49);
    const belowPointFiveCentData = transaction.returnInvItems.filter((item: MemoInvReturnItem) => item.weight <= 0.49);

    let lisAboveCTSummItems: Array<{ Desc: string; stoneCnt: number; Carats: number; RatePerCt: number; Total: number, inwardMemoNo: string, inwardMemoDate: Date, srNo: number }> = [];

    var distinctAboveCTInvNo = abovePointFiveCentData.map((u: MemoInvReturnItem) => u.inwardMemoNo).filter((x: any, i: any, a: any) => x && a.indexOf(x) === i);
    for (let i = 0; i < distinctAboveCTInvNo.length; i++) {
      var z = distinctAboveCTInvNo[i];
      var aboveCTdata = abovePointFiveCentData.filter(a => a.inwardMemoNo == z);
      if (aboveCTdata) {
        var ttlStone = this.utilityService.ConvertToFloatWithDecimal(aboveCTdata.length);
        var ttlWeight = this.utilityService.ConvertToFloatWithDecimal(aboveCTdata.reduce((acc, cur) => acc + (cur.weight ? cur.weight : 0), 0));
        var ttlAmount = this.utilityService.ConvertToFloatWithDecimal(aboveCTdata.reduce((acc, cur) => acc + (cur.price.netAmount ? cur.price.netAmount : 0), 0));
        var ttlPerCarat = this.utilityService.ConvertToFloatWithDecimal(ttlAmount / ttlWeight);

        lisAboveCTSummItems.push({
          Desc: "0.50 CT ABOVE SIZE & AS PER PACKING LIST 1",
          stoneCnt: ttlStone,
          Carats: ttlWeight,
          RatePerCt: ttlPerCarat,
          Total: ttlAmount,
          inwardMemoNo: aboveCTdata[i].inwardMemoNo,
          inwardMemoDate: aboveCTdata[i].inwardMemoDate,
          srNo: aboveCTdata[i].srNo
        });
      }
    }

    let lisBelowCTSummItems: Array<{ Desc: string; stoneCnt: number; Carats: number; RatePerCt: number; Total: number, inwardMemoNo: string, inwardMemoDate: Date, srNo: number }> = [];

    var distinctBelowCTInvNo = belowPointFiveCentData.map((u: MemoInvReturnItem) => u.inwardMemoNo).filter((x: any, i: any, a: any) => x && a.indexOf(x) === i);
    for (let i = 0; i < distinctBelowCTInvNo.length; i++) {
      var z = distinctBelowCTInvNo[i];
      var BelowCTdata = belowPointFiveCentData.filter(a => a.inwardMemoNo == z);
      if (BelowCTdata) {
        var ttlStone = this.utilityService.ConvertToFloatWithDecimal(BelowCTdata.length);
        var ttlWeight = this.utilityService.ConvertToFloatWithDecimal(BelowCTdata.reduce((acc, cur) => acc + (cur.weight ? cur.weight : 0), 0));
        var ttlAmount = this.utilityService.ConvertToFloatWithDecimal(BelowCTdata.reduce((acc, cur) => acc + (cur.price.netAmount ? cur.price.netAmount : 0), 0));
        var ttlPerCarat = this.utilityService.ConvertToFloatWithDecimal(ttlAmount / ttlWeight);

        lisBelowCTSummItems.push({
          Desc: "0.50 CT BELOW SIZE & AS PER PACKING LIST 2",
          stoneCnt: ttlStone,
          Carats: ttlWeight,
          RatePerCt: ttlPerCarat,
          Total: ttlAmount,
          inwardMemoNo: BelowCTdata[i].inwardMemoNo,
          inwardMemoDate: BelowCTdata[i].inwardMemoDate,
          srNo: BelowCTdata[i].srNo
        });
      }
    }

    var imgHtml = '';
    if (transaction.organization.name == "GLOWSTAR") {
      imgHtml = `<img style="width:250px" src="assets/billimage/Glowstar.png" alt="logo">`
    }
    else if (transaction.organization.name == "SarjuImpex") {
      imgHtml = `<img style="width:250px" src="assets/billimage/SarjuImpex.png" alt="logo">`
    }
    else if (transaction.organization.name == "Diamart (hk) ltd.") {
      imgHtml = `<img style="width:250px" src="assets/billimage/diamarthk1.png" alt="logo">`
    }
    else if (transaction.organization.name == "Diamoon DMCC") {
      imgHtml = `<img style="width:250px" src="assets/billimage/diamoondmcc.png" alt="logo">`
    }
    
    if (transaction.organization.name != "CHINTAN GEMS BV") {
      htmlString += `
      <body onload="window.print(); window.close();">       
        <div class="chal-wrap con-inv di-inv">
          <div class="chal-head">

          <div class="logo"> 
            `

      htmlString += imgHtml;
      htmlString += `
          </div>

            <div class="di-info">
            <span>` + (transaction.organization.address?.line1 ?? "") + `,` + (transaction.organization.address?.line2 ?? "") + `</span>            
            <span>` + (transaction.organization.address?.city ?? "") + `,` + (transaction.organization.address?.state ?? "") + `,` + (transaction.organization.address?.country ?? "") + `</span> 
            <span>Email: ` + (transaction.organization.email ?? "") + `</span>  
            <span>Contact No: ` + (transaction.organization.phoneNo ?? "") + `</span>               
            </div>        
          </div>
          <div class="chal-body">
      <span class="c-st border-left-2 border-right-2 border-bottom-2">INVOICE</span>
      <div class="body-top ps-1 border-bottom-0">

        <div class="bo-left border-right-2" style="flex-basis: 62%;">
          <div class="di-bor-0">                
                <span class="c-st text-start">Buyer (If other than consignee):</span>
                <span>` + (transaction.party.name ?? "") + `</span>
                <span>` + (transaction.party.address.line1 ?? "") + `,` + (transaction.party.address.line2 ?? "") + `</span>            
                <span>` + (transaction.party.address.city ?? "") + `,` + (transaction.party.address.state ?? "") + `,` + (transaction.party.address.country ?? "") + `</span>            
                <span>ZipCode : ` + (transaction.party.address.zipCode ?? "") + `</span>                
                <span>TEL: ` + (transaction.party.mobileNo ?? "") + `</span> 
                </div>  
                
            </div>
            <div class="di-bor-0 p-1">
                <table>
                  <tbody>
                    <tr>
                      <td><b>Invoice NO.</b></td>
                      <td>` + transaction.memoReturnNo + `</td>
                    </tr>
                    <tr>
                      <td><b>Date:</b></td>
                      <td>` + this.utilityService.getISOtoStringDate(transaction.createdDate) + `</td>
                    </tr>                    
                    <tr>
                      <td><b>Terms:</b></td>
                      <td> CONSIGNMENT RETURN </td>
                    </tr>                    
                    <tr>
                    <td><b>ORIGIN:</b></td>
                      <td>INDIA</td>                    
                    </tr>  
                    `
      if (transaction.cifCityName) {
        htmlString += `
                                    <tr>
                                    <td><b>CIF:</b></td>     
                                    <td>`+ transaction.cifCityName + `</td>
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
            <div class="body-middle">`

      htmlString += `
            <table>
            <thead>
              <th>NO</th>    
              <th>VENDOR INVOICE NO</th>         
              <th>VENDOR INVOICE DATE</th>              
              <th colspan="4">DESCRIPTION - CUT & POLISHED DIAMONDS</th>
              <th>PCS</th>
              <th>CARATS</th>
              <th>RATE USD PER CT</th>
              <th>TOTAL AMOUNT USD</th>
            </thead>
            <tbody>
            `

      for (let indexS = 0; indexS < lisAboveCTSummItems.length; indexS++) {
        htmlString += `       
                    <tr>      
                    <td>`+ 1 + `</td>      
                    <td>`+ lisAboveCTSummItems[indexS].inwardMemoNo + `</td>    
                    <td>` + this.utilityService.getISOtoStringDate(lisAboveCTSummItems[indexS].inwardMemoDate) + `</td>                        
                    <td colspan="4">`+ lisAboveCTSummItems[indexS].Desc + `</td>                
                    <td> `+ lisAboveCTSummItems[indexS].stoneCnt + `</td>
                    <td>`+ lisAboveCTSummItems[indexS].Carats + `</td>
                    <td>`+ lisAboveCTSummItems[indexS].RatePerCt + `</td>
                    <td>`+ lisAboveCTSummItems[indexS].Total + `</td>
                    </tr>`
      }

      for (let indexS = 0; indexS < lisBelowCTSummItems.length; indexS++) {
        htmlString += `       
                    <tr>      
                    <td>`+ 2 + `</td>      
                    <td>`+ lisBelowCTSummItems[indexS].inwardMemoNo + `</td>    
                    <td>` + this.utilityService.getISOtoStringDate(lisBelowCTSummItems[indexS].inwardMemoDate) + `</td>                        
                    <td colspan="4">`+ lisBelowCTSummItems[indexS].Desc + `</td>                
                    <td> `+ lisBelowCTSummItems[indexS].stoneCnt + `</td>
                    <td>`+ lisBelowCTSummItems[indexS].Carats + `</td>
                    <td>`+ lisBelowCTSummItems[indexS].RatePerCt + `</td>
                    <td>`+ lisBelowCTSummItems[indexS].Total + `</td>
                    </tr>`
      }

      for (let index = lisSummItems.length; index <= 25; index++) {
        htmlString += `
                    <tr>
                    <td>&nbsp</td>    
                    <td></td>
                    <td></td>            
                    <td colspan="4"></td>
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
                  <td colspan="7" style="text-align:right"><b>Grand Total</b>&nbsp</td>
                  <td>`+ totalStone + `</td>
                  <td>`+ totalWeight + `</td>
                  <td>`+ totalPerCarat + `</td>
                  <td>`+ totalPayableAmount + `</td>
                </tr>`

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
            `
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
                    <td>`+ (transaction.bank.bankName ?? "") + `</td>
                  </tr>
                  <tr>
                    <td><b>BANK CODE : </b></td>
                    <td>`+ (transaction.bank.ifsc ?? "") + `</td>
                  </tr>
                  <tr>
                    <td><b>ADDRESS :</b></td>
                    <td>`+ (transaction.bank.address.line1 ? transaction.bank.address.line1 + `,` : "") + (transaction.bank.address.line2 ? transaction.bank.address.line2 + `,` : "") + (transaction.bank.address.city ? transaction.bank.address.city + `,` : "")
        + (transaction.bank.address.state ? transaction.bank.address.state + `,` : "") + (transaction.bank.address.country ? transaction.bank.address.country + `,` : "") + (transaction.bank.address.zipCode ?? "") + `</td>
                  </tr>
                  <tr>
                    <td><b>ACCOUNT NAME :</b></td>
                    <td>`+ (transaction.bank.accountName ?? "") + `</td>
                  </tr>
                  <tr>
                    <td><b>A/C NO :</b></td>
                    <td>`+ (transaction.bank.accountNo ?? "") + `</td>
                  </tr>
                  <tr>
                    <td><b>SWIFT CODE :</b></td>
                    <td>`+ (transaction.bank.swift ?? "") + `</td>
                  </tr>         
                    <tr>
                    <td><b>INTERMEDIATE BANK:</b></td>
                    <td>`+ (transaction.bank.intermediaryBankName ?? "") + `</td>                        
                    </tr>         
                    <tr>
                    <td><b>INTERMEDIATE ADDRESS:</b></td>                       
                    <td>`+ (transaction.bank.intermediaryBankAddress ?? "") + `</td>                        
                    </tr>  
                    <tr>
                    <td><b>INTERMEDIATE SWIFTCODE:</b></td>                      
                    <td>`+ (transaction.bank.intermediaryBankswift ?? "") + `</td>
                    </tr>            
                  </tbody>
                </table>

                </div>
                <div class="bo-right w-30 p-2">
                  <span class="c-st text-start">Signature & Date:</span>                  
                </div>
              </div>
    
              </div>
            </div>
          </div>
        </div>`

      //Above One CT PL  
      for (let indexS = 0; indexS < lisAboveCTSummItems.length; indexS++) {
        var aboveOneCTdata = abovePointFiveCentData.filter(a => a.inwardMemoNo == distinctInvNo[indexS]);
        var stoneIdSort = this.sortingBySrNo(memoInv).map(z => z.stoneId);
        aboveOneCTdata = this.sortingByStoneIds(aboveOneCTdata, stoneIdSort);

        htmlString += ` 
            <div class="body-middle" style="page-break-after: always;">
            <table>
            <tr>
            <td>EXPORTER : <b> ` + (transaction.organization.name ?? "") + `</b></td>
            <td>INVOICE NO : <b>` + (transaction.memoReturnNo ?? "") + `</b></td>
            <td>INVOICE DATE : <b>` + this.utilityService.getISOtoStringDate(transaction.createdDate) + `</b></td>
            <td>VENDOR INVOICE NO : <b>`+ lisAboveCTSummItems[indexS].inwardMemoNo + `</b></td>
            <td>VENDOR INVOICE DATE : <b>` + this.utilityService.getISOtoStringDate(lisAboveCTSummItems[indexS].inwardMemoDate) + `</b></td>           
            </tr>
            <tr>
            <td colspan="5"><b>Packing List 1</b></td>
            </tr>
            </table>

            <table>
              <thead>
                <th>No</th>
                <th>Sr. No</th>
                <th>STONE ID</th>
                <th>SHAPE</th>
                <th>CARATS</th>
                <th>COLOR</th>
                <th>CLARITY</th>
                <th>MEASUREMENT</th>
                <th>LAB</th>       
                <th>REPORT NO</th>   
                <th>RAP</th>       
                <th>RATE USD PER CT</th>
                <th>TOTAL AMOUNT USD</th>
              </thead>
              <tbody>`

        for (let index = 0; index <= aboveOneCTdata.length; index++) {
          let obj = aboveOneCTdata[index];
          if (obj) {
            htmlString += `
                      <tr>
                      <td>`+ (index + 1) + `</td>
                      <td>`+ (obj.srNo ?? "") + `</td>
                      <td>`+ (obj.stoneId ?? "") + `</td>
                      <td>`+ (obj.shape ?? "") + `</td>
                      <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.weight ?? 0) ?? "") + `</td>
                      <td>`+ (obj.color ?? "") + `</td>
                      <td>`+ (obj.clarity ?? "") + `</td>
                      <td>`+ this.utilityService.getMesurmentString(obj.shape, obj.length, obj.width, obj.height) + `</td>                      
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
                        <td colspan="4"><b>Grand Total</b></td>
                        <td>`+ lisAboveCTSummItems[indexS].Carats + `</td>
                        <td colspan="7">&nbsp</td>
                        <td>`+ lisAboveCTSummItems[indexS].Total + `</td>
                      </tr>`

        htmlString += `
              </tfoot>
              </table>
              </div>`
      }

      //Below One CT PL
      for (let indexS = 0; indexS < lisBelowCTSummItems.length; indexS++) {
        var belowOneCTdata = belowPointFiveCentData.filter(a => a.inwardMemoNo == distinctInvNo[indexS]);
        var stoneIdSort = this.sortingBySrNo(memoInv).map(z => z.stoneId);
        belowOneCTdata = this.sortingByStoneIds(belowOneCTdata, stoneIdSort);

        htmlString += ` 
            <div class="body-middle" style="page-break-before: always;">
            <table>
            <tr>
            <td>EXPORTER : <b> ` + (transaction.organization.name ?? "") + `</b></td>
            <td>INVOICE NO : <b>` + (transaction.memoReturnNo ?? "") + `</b></td>
            <td>INVOICE DATE : <b>` + this.utilityService.getISOtoStringDate(transaction.createdDate) + `</b></td>
            <td>VENDOR INVOICE NO : <b>`+ lisBelowCTSummItems[indexS].inwardMemoNo + `</b></td>
            <td>VENDOR INVOICE DATE : <b>` + this.utilityService.getISOtoStringDate(lisBelowCTSummItems[indexS].inwardMemoDate) + `</b></td>           
            </tr>
            <tr>
            <td colspan="5"><b>Packing List 2</b></td>
            </tr>
            </table>

            <table>
              <thead>
                <th>No</th>
                <th>Sr. No</th>
                <th>STONE ID</th>
                <th>SHAPE</th>
                <th>CARATS</th>
                <th>COLOR</th>
                <th>CLARITY</th>
                <th>MEASUREMENT</th>
                <th>LAB</th>       
                <th>REPORT NO</th>   
                <th>RAP</th>       
                <th>RATE USD PER CT</th>
                <th>TOTAL AMOUNT USD</th>
              </thead>
              <tbody>`

        for (let index = 0; index <= belowOneCTdata.length; index++) {
          let obj = belowOneCTdata[index];
          if (obj) {
            htmlString += `
                      <tr>
                      <td>`+ (index + 1) + `</td>
                      <td>`+ (obj.srNo ?? "") + `</td>
                      <td>`+ (obj.stoneId ?? "") + `</td>
                      <td>`+ (obj.shape ?? "") + `</td>
                      <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.weight ?? 0) ?? "") + `</td>
                      <td>`+ (obj.color ?? "") + `</td>
                      <td>`+ (obj.clarity ?? "") + `</td>
                      <td>`+ this.utilityService.getMesurmentString(obj.shape, obj.length, obj.width, obj.height) + `</td>                      
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
                        <td colspan="4"><b>Grand Total</b></td>
                        <td>`+ lisBelowCTSummItems[indexS].Carats + `</td>
                        <td colspan="7">&nbsp</td>
                        <td>`+ lisBelowCTSummItems[indexS].Total + `</td>
                      </tr>`

        htmlString += `
              </tfoot>
              </table>
              </div>`
      }

      htmlString += `
        </body>
        </html>
        `;
    }
    else {
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
                <p><b>BTW: ` + (transaction.organization.incomeTaxNo ?? "") + `</b></p> 
                <p style="flex-basis: 248px;"><b>HRAnt: -351.856</b></p>
            </div>
          </div>
          <div class="chal-body">
          <span class="c-st border-bottom-2" style="display: block;margin: auto;width: 185px;text-align: center;margin-top: 20px;
          margin-bottom: 20px;"> CONSIGNMENT RETURN </span>
            <div class="body-top ps-1 border-bottom-0">
              <div class="bo-left">
              <span class="c-st text-start"><b>BUYER</b> ` + transaction.party.name + `</span>                    
              <span><b style="float:left">ADDRESS</b> 
              <span class="txt-left">&nbsp;` + (transaction.party.address.line1 ? transaction.party.address.line1 + `,` : "") + `
              </br>`
      if (transaction.party.address.line2) {
        htmlString += `          
              &nbsp;&nbsp`+ (transaction.party.address.line2 ?? "") + `</br>
              `
      }
      htmlString += `                
          &nbsp;&nbsp`+ (transaction.party.address.zipCode ? transaction.party.address.zipCode + `, ` : "") + " " + (transaction.party.address.city ? transaction.party.address.city + `, ` : "") + `
              </br>
              &nbsp;&nbsp`+ (transaction.party.address.country ?? "") + `
              </span>
              </span>`
      if (transaction.party.taxNo || transaction.party.incomeTaxNo) {
        if (transaction.organization.address?.country.toLowerCase() == transaction.party.address.country.toLowerCase()) {
          htmlString += `
              <span><b>BTW</b> ` + (transaction.party.taxNo ?? "") + ` ` + (transaction.party.incomeTaxNo ?? "") + `</span>  
              `}
        else {
          htmlString += `
              <span><b>VAT NO</b> ` + (transaction.party.taxNo ?? "") + ` ` + (transaction.party.incomeTaxNo ?? "") + `</span>  
              `}
      }

      if (transaction.party.mobileNo || transaction.party.phoneNo) {
        htmlString += `
              <span><b>TEL</b> ` + (transaction.party.mobileNo ? transaction.party.mobileNo + `,` : "") + (transaction.party.phoneNo ? transaction.party.phoneNo + `,` : "") + `</span>                                        
              </div>
              `
      }

      htmlString += `
            <div class="di-bor-0 inv-section">
            <span class="c-st text-start"><b>INVOICE NO</b> ` + transaction.memoReturnNo + `</span>
            <span class="c-st text-start"><b>DATE</b> ` + this.utilityService.getISOtoStringDate(transaction.createdDate) + `</span>
            <span class="c-st text-start"><b style="float:left">TERMS </b> <span class="txt-left">&nbsp;CONSIGNMENT RETURN</span></span> 
            <span class="c-st text-start"><b style="float:left">ORIGIN </b> <span class="txt-left">&nbsp;`+ 'INDIA' + `</span></span> 
            `

      htmlString += `
              </div>
              </div>
              `

      htmlString += `
      <div class="body-middle" style="margin-top: 10px;">
        <table>
        <thead>
        <th>No</th>
        <th>Vendor Invoice No</th>
        <th>Description</th>
        <th>Pcs</th>
        <th>CARATS</th>
        <th>RATE /PER CT</th>
        <th>AMOUNT (USD)</th>            
        </thead>
        <tbody>`

      for (let indexS = 0; indexS < lisSummItems.length; indexS++) {
        htmlString += `       
                    <tr>      
                    <td>`+ (indexS + 1) + `</td>
                    <td>`+ lisSummItems[indexS].inwardMemoNo + `</td>
                    <td>CUT AND POLISHED DIAMONDS AS PER PACKING LIST ` + (indexS + 1) + `</td>
                    <td> `+ lisSummItems[indexS].stoneCnt + `</td>
                    <td>`+ lisSummItems[indexS].Carats + `</td>
                    <td>`+ lisSummItems[indexS].RatePerCt + `</td>
                    <td>`+ lisSummItems[indexS].Total + `</td>
                    </tr>`
      }

      htmlString += `
        </tbody>
        <tfoot >
                <tr>
                  <td colspan="3"><b>Grand Total</b></td>
                  <td>`+ totlFirstTblStones + `</td>
                  <td>`+ totlFirsTblCarats + `</td>
                  <td>`+ totlFirstTblRatePerCt + `</td>
                  <td>`+ totlFirstTblAmount + `</td>
                </tr>`

      htmlString += `                        
        </tfoot>
        </table>
        </div>
        `

      htmlString += ` 
            <div class="body-fotter">  
            <div class="body-middle" style="margin: 20px 0;">           
            <table class="cif-brd" style="width="100% !important">          
            <tr>
              <td width="25%" style="text-align:left !important;"><b>CIF : </b>`+ (transaction.cifCityName ?? "") + `</td>
              <td width="25%" style="text-align:left !important;"><b>PORT : </b>`+ (transaction.cifCityName ?? "") + ` </td>
              <td width="25%" style="text-align:left !important;"><b>SHIPPED VIA : </b> </td>
              <td width="25%" style="text-align:left !important;"><b>INSURED BY : </b> </td>
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
      if (transaction.bank.accountName) {
        htmlString += `  
                  <tr>
                  <td>ACCOUNT NAME</td>
                  <td>: <b>`+ (transaction.bank.accountName ?? "") + `</b></td>
                  </tr>
                  `
      }
      if (transaction.bank.bankName) {
        htmlString += `
                  <tr>
                  <td>BANK NAME</td>
                  <td>: <b>`+ (transaction.bank.bankName ?? "") + `</b></td>
                  </tr>
                  `
      }
      if (transaction.bank.iBan) {
        htmlString += `
                  <tr>
                  <td>IBAN NO</td>
                  <td>: <b>`+ (transaction.bank.iBan ?? "") + `</b></td>
                  </tr>
                  `
      }
      if (transaction.bank.accountNo) {
        htmlString += `
                  <tr>
                  <td>A/C NO</td>
                  <td>: <b>`+ (transaction.bank.accountNo ?? "") + `</b></td>
                  </tr>
                  `
      }
      if (transaction.bank.swift) {
        htmlString += `
                  <tr>              
                  <td>SWIFT CODE</td>
                  <td>: <b>`+ (transaction.bank.swift ?? "") + `</b></td>
                  </tr>
                  `
      }
      if (transaction.bank.address.line1) {
        htmlString += `
                  <tr>
                  <td>BANK ADDRESS</td>
                  <td>: <b>`+ (transaction.bank.address.line1 ? transaction.bank.address.line1 + `,` : "") + (transaction.bank.address.line2 ? transaction.bank.address.line2 + `,` : "") + (transaction.bank.address.city ? transaction.bank.address.city + `,` : "")
          + (transaction.bank.address.country ? transaction.bank.address.country + `,` : "") + (transaction.bank.address.zipCode ?? "") + `</b></td>
                  </tr>   
                  `
      }
      if (transaction.bank.intermediaryBankName) {
        htmlString += `
                  <tr>
                    <td>INTERMEDIATE BANK</td>
                    <td>: <b>`+ (transaction.bank.intermediaryBankName ?? "") + `</b></td>                        
                  </tr>  
                  `
      }
      if (transaction.bank.intermediaryBankswift) {
        htmlString += `
                  <tr>
                    <td>INTERMEDIATE SWIFTCODE</td>                      
                    <td>: <b>`+ (transaction.bank.intermediaryBankswift ?? "") + `</b></td>
                  </tr>     
                  `
      }
      if (transaction.bank.intermediaryBankAddress) {
        htmlString += `   
                  <tr>
                    <td>INTERMEDIATE ADDRESS</td>                       
                    <td>: <b>`+ (transaction.bank.intermediaryBankAddress ?? "") + `</b></td>                        
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
            invoice. The buyer acknowledged that this invoice is pledged to ` + (transaction.bank.bankName ?? "") + ` and that releases can
            only be obtained through payment on the account of the seller at ` + (transaction.bank.bankName ?? "") + ` as mentioned on this
            invoice. This invoice may never be compensated with claims from the buyer on the seller.</li>
            <li>The diamonds here in invoiced are exclusively of natural origin and untreated based on personal knowledge and/or
            written guarantees provided by the supplier of these diamonds.</li>
            <li>The diamonds herein invoiced have been purchased from legitimate sources not involved in funding conflict and in
            compliance with United Nation resolutions. The seller hereby guarantees that these diamonds are conflict free, based
            on personal knowledge and/or written guarantees provided by the supplier of these diamonds. </li>      
            <b style="text-decoration: underline;">H.R.A 351 856, BTW BE 0478 554 943 </b>      
            <li>The Antwerp Tribunal of Commerce is solely competent in case of litigation Vrij van B.T.W. Art. 42 van het Wetboek.Above mentioned good will be consignment until receipt of the payment of this invoice </li>
            `

      htmlString += `  
            </ul>
            </div>
            `

      var startCount: number;
      var endCount: number;
      startCount = 0;
      endCount = 0;

      if (lisSummItems.length > 10) {//Summary
        startCount = 5;
        endCount = 16;
      }
      else if (lisSummItems.length < 11) {//PL
        startCount = lisSummItems.length;
        endCount = 15 - lisSummItems.length;
      }

      if (transaction.party.address.line2)
        endCount = endCount - 2
      if (transaction.party.mobileNo || transaction.party.phoneNo)
        endCount = endCount - 1
      if (transaction.bank.address.line1)
        endCount = endCount - 1
      if (transaction.bank.intermediaryBankAddress)
        endCount = endCount - 1
      if (transaction.party.taxNo || transaction.party.incomeTaxNo)
        endCount = endCount - 1
      if (!transaction.bank.iBan)
        endCount = endCount + 1

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
          <span class="dt-last">Date : ` + this.utilityService.getISOtoStringDate(transaction.createdDate) + `</span>
            <div class="di-info cg-local border-top-2">
            <span>
              <b>` + (transaction.organization.name ?? "") + ` : </b>&nbsp` + (transaction.organization.address?.line1 ?? "") + `,&nbsp` + (transaction.organization.address?.line2 ?? "") + ",&nbsp" + (transaction.organization.address?.zipCode ?? "") + ",&nbsp" + (transaction.organization.address?.city ?? "") + `,&nbsp` + (transaction.organization.address?.country ?? "") + `
            </span>
            <span><b>GSM :</b> ` + (transaction.organization.mobileNo ?? "") + `, <b>TEL :</b>` + (transaction.organization.phoneNo ?? "") + `&nbsp;&nbsp;<b>Email :</b>
            ` + (transaction.organization.email ?? "") + `</span>
            </div>
            </div>
            </div>
          </div>
        </div>
        `

      for (let indexS = 0; indexS < lisSummItems.length; indexS++) {
        var data = transaction.returnInvItems.filter(a => a.inwardMemoNo == distinctInvNo[indexS]);
        var stoneIdSort = this.sortingBySrNo(memoInv).map(z => z.stoneId);
        data = this.sortingByStoneIds(data, stoneIdSort);

        htmlString += ` 
              <div class="body-middle" style="page-break-after: always;">
              <table>
              <tr>
              <td>EXPORTER : <b> ` + (transaction.organization.name ?? "") + `</b></td>
              <td>INVOICE NO : <b>` + (transaction.memoReturnNo ?? "") + `</b></td>
              <td>INVOICE DATE : <b>` + this.utilityService.getISOtoStringDate(transaction.createdDate) + `</b></td>
              <td>VENDOR INVOICE NO : <b>`+ lisSummItems[indexS].inwardMemoNo + `</b></td>
              <td>VENDOR INVOICE DATE : <b>` + this.utilityService.getISOtoStringDate(lisSummItems[indexS].inwardMemoDate) + `</b></td>           
              </tr>
              <tr>
              <td colspan="5"><b>Packing List</b></td>
              </tr>
              </table>
  
              <table>
                <thead>
                  <th>No</th>
                  <th>Sr. No</th>
                  <th>STONE ID</th>
                  <th>SHAPE</th>
                  <th>CARATS</th>
                  <th>COLOR</th>
                  <th>CLARITY</th>
                  <th>MEASUREMENT</th>
                  <th>LAB</th>       
                  <th>REPORT NO</th>   
                  <th>RAP</th>       
                  <th>RATE USD PER CT</th>
                  <th>TOTAL AMOUNT USD</th>
                </thead>
                <tbody>`

        for (let index = 0; index <= data.length; index++) {
          let obj = data[index];
          if (obj) {
            htmlString += `
                        <tr>
                        <td>`+ (index + 1) + `</td>
                        <td>`+ (obj.srNo ?? "") + `</td>
                        <td>`+ (obj.stoneId ?? "") + `</td>
                        <td>`+ (obj.shape ?? "") + `</td>
                        <td>`+ (this.utilityService.ConvertToFloatWithDecimalTwoDigit(obj.weight ?? 0) ?? "") + `</td>
                        <td>`+ (obj.color ?? "") + `</td>
                        <td>`+ (obj.clarity ?? "") + `</td>
                        <td>`+ this.utilityService.getMesurmentString(obj.shape, obj.length, obj.width, obj.height) + `</td>                      
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
                          <td>`+ lisSummItems[indexS].Carats + `</td>
                          <td colspan="6">&nbsp</td>
                          <td>`+ lisSummItems[indexS].RatePerCt + `</td>
                          <td>`+ lisSummItems[indexS].Total + `</td>
                        </tr>`

        htmlString += `
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

  public sortingBySrNo(data: MemoInvItem[]) {
    data = data.sort((n1, n2) => {
      let np1 = n1.srNo;
      let np2 = n2.srNo;

      if (np1 > np2)
        return 1;

      if (np1 < np2)
        return -1;

      return 0;
    });
    return data;
  }

  public sortingByStoneIds(data: MemoInvReturnItem[], stoneIds: string[]) {
    data = data.sort((n1, n2) => {
      let stoneIdIndexA = stoneIds.indexOf(n1.stoneId);
      let stoneIdIndexB = stoneIds.indexOf(n2.stoneId);

      if (stoneIdIndexA !== stoneIdIndexB) {
        return stoneIdIndexA - stoneIdIndexB;
      }

      return n1.weight - n2.weight;

    });
    return data;
  }
}
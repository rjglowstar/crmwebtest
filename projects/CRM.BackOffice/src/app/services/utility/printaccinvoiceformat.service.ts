import { Injectable } from '@angular/core';
import { UtilityService } from 'shared/services';
import { Organization, Transaction } from '../../entities';

@Injectable({
  providedIn: 'root'
})

export class PrintAccInvoiceFormat {
  constructor(
    public utilityService: UtilityService
  ) { }

  public getAccInvoicePrint(transactionObj: Transaction, orgObj: Organization) {
    var htmlString: string = "";
    htmlString += `  
    <body onload="window.print(); window.close();">       
      <div class="chal-wrap con-inv di-inv">
        <div class="chal-head">
          <div class="logo"> 
            `
    if (transactionObj.transactionDetail.organization.name == "GLOWSTAR") {
      htmlString += `<img style="width:250px" src="assets/billimage/Glowstar.png" alt="logo">`
    }
    else if (transactionObj.transactionDetail.organization.name == "SarjuImpex") {
      htmlString += `<img style="width:250px" src="assets/billimage/SarjuImpex.png" alt="logo">`
    }
    else if (transactionObj.transactionDetail.organization.name == "Diamart (hk) ltd.") {
      htmlString += `<img style="width:250px" src="assets/billimage/diamarthk1.png" alt="logo">`
    }
    else if (transactionObj.transactionDetail.organization.name == "Diamoon DMCC") {
      htmlString += `<img style="width:250px" src="assets/billimage/diamoondmcc.png" alt="logo">`
    }
    else if (transactionObj.transactionDetail.organization.name == "CHINTAN GEMS BV") {
      htmlString += `<img style="width:250px" src="assets/billimage/CGNew.png" alt="logo">`
    }
    htmlString += `
          </div>
          <div class="di-info">
          <span>` + (orgObj.address?.line1 ?? "") + `,` + (orgObj.address?.line2 ?? "") + `</span>            
          <span>` + (orgObj.address?.city ?? "") + `,` + (orgObj.address?.state ?? "") + `,` + (orgObj.address?.country ?? "") + `</span> 
          <span>Email: ` + orgObj.email + `</span>            
          </div>
          <div class="co-details">
            <table>
              <tbody>
                <tr>
                  <td><b>Contact No:</b></td>
                  <td>` + (orgObj.phoneNo ?? "") + ` </td>
                </tr>
                <tr>
                  <td><b>Fax:</b></td>
                  <td>` + (orgObj.faxNo ?? "") + `</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="chal-body">
          <span class="c-st border-left-2 border-right-2">` + (transactionObj.transactionType ?? "") + ` Transaction </span>
          <div class="body-top ps-1 border-bottom-0">
          <div class="di-bor-0 tbl-size">
            <table>
              <tbody>      
                <tr>
                  <td><b>Date:</b></td>
                  <td>` + this.utilityService.getISOtoStringDate(transactionObj.transactionDate) + `</td>
                </tr>
                <tr>
                  <td><b>Name :</b></td>
                  <td>` + (transactionObj.fromLedger.name ?? "") + `</td>
                </tr>    
                <tr>
              <td><b>Contact Person :</b></td>
              <td>` + (transactionObj.fromLedger.contactPerson ?? "") + `</td>
            </tr>              
            <tr>
            <td><b>Email :</b></td>
            <td>` + (transactionObj.fromLedger.email ?? "") + `</td>
          </tr>      
          <tr>
          <td><b>Mobile No :</b></td>
          <td>` + (transactionObj.fromLedger.mobileNo ?? "") + `</td>
        </tr>    
        <tr>
        <td><b>Phone No :</b></td>
        <td>` + (transactionObj.fromLedger.phoneNo ?? "") + `</td>
      </tr> 
      <tr>
        <td><b>Address :</b></td>
        <td>
        <span>` + (transactionObj.fromLedger.address?.line1 ?? "") + ` ` + (transactionObj.fromLedger.address?.line2 ?? "") + `</span>            
        <span>` + (transactionObj.fromLedger.address?.city ?? "") + ` ` + (transactionObj.fromLedger.address?.state ?? "") + ` ` + (transactionObj.fromLedger.address?.country ?? "") + `</span></td>
      </tr>                         
              </tbody>
            </table>
          </div>
          <div class="di-bor-0 tbl-size">
          <table>
            <tbody>
              <tr>
                <td><b>Name :</b></td>
                <td>` + (transactionObj.toLedger.name ?? "") + `</td>
              </tr>
              <tr>
              <td><b>Contact Person :</b></td>
              <td>` + (transactionObj.toLedger.contactPerson ?? "") + `</td>
            </tr>              
            <tr>
            <td><b>Email :</b></td>
            <td>` + (transactionObj.toLedger.email ?? "") + `</td>
          </tr>      
          <tr>
          <td><b>Mobile No :</b></td>
          <td>` + (transactionObj.toLedger.mobileNo ?? "") + `</td>
        </tr>    
        <tr>
        <td><b>Phone No :</b></td>
        <td>` + (transactionObj.toLedger.phoneNo ?? "") + `</td>
      </tr> 
      <tr>
        <td><b>Address :</b></td>
        <td>
        <span>` + (transactionObj.toLedger.address?.line1 ?? "") + ` ` + (transactionObj.toLedger.address?.line2 ?? "") + `</span>            
        <span>` + (transactionObj.toLedger.address?.city ?? "") + ` ` + (transactionObj.toLedger.address?.state ?? "") + ` ` + (transactionObj.toLedger.address?.country ?? "") + `</span></td>
      </tr>      
            </tbody>
          </table>
        </div>
          </div>
          <div class="body-middle">
            <table>                
              <tbody>`

    htmlString += `
    <span class="c-st border-left-2 border-right-2">Payment Summary</span>
      <table>
      <thead>        
        <th>AMOUNT</th>
        <th>ADD AMOUNT</th>
        <th>TOTAL AMOUNT</th>
      </thead>
      <tbody>
              <tr>  
              <td>`+ this.utilityService.ConvertToFloatWithDecimal(transactionObj.amount) + `</td>
              <td>`+ this.utilityService.ConvertToFloatWithDecimal(transactionObj.addAmount) + `</td>
              <td>`+ this.utilityService.ConvertToFloatWithDecimal(transactionObj.netTotal) + `</td>
              </tr>`

    htmlString += `                                    
              </tbody>
            </table>
          </div>    
            <div class="body-f-mid" style="padding-top: 20px;">
            <div class="body-f-left">
              <span class="c-st">Receiver</span>
              <div class="ch-sig">      
              <span>&nbsp</span>
              <span>&nbsp</span>
              <span>&nbsp</span>    
              <span>Chop & Signature</span>
              </div>
            </div>
            <div class="body-f-right">
              <span class="c-st di">Issue By</span>
              <div class="ch-sig">
              <span>&nbsp</span>
              <span>&nbsp</span>
              <span>&nbsp</span>   
              <span>Chop & Signature</span>
              </div>
            </div>
          </div>
          </div>  
        <div class="chal-wrap con-inv di-inv" style="margin-top:40px">
        <div class="chal-head">
          <div class="logo">
          `
    if (transactionObj.transactionDetail.organization.name == "GLOWSTAR") {
      htmlString += `<img style="width:250px" src="assets/billimage/Glowstar.png" alt="logo">`
    }
    else if (transactionObj.transactionDetail.organization.name == "SarjuImpex") {
      htmlString += `<img style="width:250px" src="assets/billimage/SarjuImpex.png" alt="logo">`
    }
    else if (transactionObj.transactionDetail.organization.name == "Diamart (hk) ltd.") {
      htmlString += `<img style="width:250px" src="assets/billimage/diamarthk1.png" alt="logo">`
    }
    else if (transactionObj.transactionDetail.organization.name == "Diamoon DMCC") {
      htmlString += `<img style="width:250px" src="assets/billimage/diamoondmcc.png" alt="logo">`
    }
    else if (transactionObj.transactionDetail.organization.name == "CHINTAN GEMS BV") {
      htmlString += `<img style="width:250px" src="assets/billimage/CGNew.png" alt="logo">`
    }
    htmlString += `
          </div>
          <div class="di-info">
          <span>` + (orgObj.address?.line1 ?? "") + `,` + (orgObj.address?.line2 ?? "") + `</span>            
          <span>` + (orgObj.address?.city ?? "") + `,` + (orgObj.address?.state ?? "") + `,` + (orgObj.address?.country ?? "") + `</span> 
          <span>Email: ` + (orgObj.email ?? "") + `</span>            
          </div>
          <div class="co-details">
            <table>
              <tbody>
                <tr>
                  <td><b>Contact No:</b></td>
                  <td>` + (orgObj.phoneNo ?? "") + ` </td>
                </tr>
                <tr>
                  <td><b>Fax:</b></td>
                  <td>` + (orgObj.faxNo ?? "") + `</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="chal-body">
          <span class="c-st border-left-2 border-right-2">` + (transactionObj.transactionType ?? "") + ` Transaction </span>
          <div class="body-top ps-1 border-bottom-0">
          <div class="di-bor-0 tbl-size">
            <table>
              <tbody>   
                <tr>
                  <td><b>Date:</b></td>
                  <td>` + this.utilityService.getISOtoStringDate(transactionObj.transactionDate) + `</td>
                </tr>
                <tr>
                  <td><b>Name :</b></td>
                  <td>` + (transactionObj.fromLedger.name ?? "") + `</td>
                </tr>    
                <tr>
              <td><b>Contact Person :</b></td>
              <td>` + (transactionObj.fromLedger.contactPerson ?? "") + `</td>
            </tr>              
            <tr>
            <td><b>Email :</b></td>
            <td>` + (transactionObj.fromLedger.email ?? "") + `</td>
          </tr>      
          <tr>
          <td><b>Mobile No :</b></td>
          <td>` + (transactionObj.fromLedger.mobileNo ?? "") + `</td>
        </tr>    
        <tr>
        <td><b>Phone No :</b></td>
        <td>` + (transactionObj.fromLedger.phoneNo ?? "") + `</td>
      </tr> 
      <tr>
        <td><b>Address :</b></td>
        <td>
        <span>` + (transactionObj.fromLedger.address?.line1 ?? "") + ` ` + (transactionObj.fromLedger.address?.line2 ?? "") + `</span>            
        <span>` + (transactionObj.fromLedger.address?.city ?? "") + ` ` + (transactionObj.fromLedger.address?.state ?? "") + ` ` + (transactionObj.fromLedger.address?.country ?? "") + `</span></td>
      </tr>                         
              </tbody>
            </table>
          </div>

          <div class="di-bor-0 tbl-size">
          <table>
            <tbody>             
              <tr>
                <td><b>Name :</b></td>
                <td>` + (transactionObj.toLedger.name ?? "") + `</td>
              </tr>
              <tr>
              <td><b>Contact Person :</b></td>
              <td>` + (transactionObj.toLedger.contactPerson ?? "") + `</td>
            </tr>              
            <tr>
            <td><b>Email :</b></td>
            <td>` + (transactionObj.toLedger.email ?? "") + `</td>
          </tr>      
          <tr>
          <td><b>Mobile No :</b></td>
          <td>` + (transactionObj.toLedger.mobileNo ?? "") + `</td>
        </tr>    
        <tr>
        <td><b>Phone No :</b></td>
        <td>` + (transactionObj.toLedger.phoneNo ?? "") + `</td>
      </tr> 
      <tr>
        <td><b>Address :</b></td>
        <td>
        <span>` + (transactionObj.toLedger.address?.line1 ?? "") + ` ` + (transactionObj.toLedger.address?.line2 ?? "") + `</span>            
        <span>` + (transactionObj.toLedger.address?.city ?? "") + ` ` + (transactionObj.toLedger.address?.state ?? "") + ` ` + (transactionObj.toLedger.address?.country ?? "") + `</span></td>
      </tr>      
            </tbody>
          </table>
        </div>
          </div>

          <div class="body-middle">
            <table>                
              <tbody>`

    htmlString += `
    <span class="c-st border-left-2 border-right-2">Payment Summary</span>
      <table>
      <thead>        
        <th>AMOUNT</th>
        <th>ADD AMOUNT</th>
        <th>TOTAL AMOUNT</th>
      </thead>
      <tbody>
              <tr>  
              <td>`+ this.utilityService.ConvertToFloatWithDecimal(transactionObj.amount) + `</td>
              <td>`+ this.utilityService.ConvertToFloatWithDecimal(transactionObj.addAmount) + `</td>
              <td>`+ this.utilityService.ConvertToFloatWithDecimal(transactionObj.netTotal) + `</td>
              </tr>`

    htmlString += `                                    
              </tbody>
            </table>
          </div>    
            <div class="body-f-mid" style="padding-top: 20px;">
            <div class="body-f-left">
              <span class="c-st">Receiver</span>
              <div class="ch-sig">      
              <span>&nbsp</span>
              <span>&nbsp</span>
              <span>&nbsp</span>    
              <span>Chop & Signature</span>
              </div>
            </div>
            <div class="body-f-right">
              <span class="c-st di">Issue By</span>
              <div class="ch-sig">
              <span>&nbsp</span>
              <span>&nbsp</span>
              <span>&nbsp</span>   
              <span>Chop & Signature</span>
              </div>
            </div>
          </div>
          </div> 
          </div>
        </div>
      `
    htmlString += `
      </body>
      </html>
      `;

    return htmlString;
  }
}
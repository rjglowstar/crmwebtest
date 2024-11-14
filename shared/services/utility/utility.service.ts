import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DomSanitizer, Title } from '@angular/platform-browser';
import { NotificationService } from '@progress/kendo-angular-notification';
import * as FileSaver from 'file-saver';
import * as moment from 'moment';
import { ContactUsDetail, InvDetailData } from 'projects/CRM.Customer/src/app/businessobjects';
import { BehaviorSubject, lastValueFrom } from 'rxjs';
import { Address, MfgPricingResponse, PricingDiscountApiResponse, PricingMarketSheetResponse } from 'shared/businessobjects';
import { CutDetailDNorm, MasterDNorm } from 'shared/enitites';
import * as XLSX from 'xlsx';
import { listAnnounceType, listCurrencyType } from '../common/staticlookup.service';

@Injectable({
  providedIn: 'root'
})

export class UtilityService {
  datePipe: DatePipe = new DatePipe('en-US');
  possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";

  public filterToggleSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public listAnnounceType = listAnnounceType;

  constructor(private notificationService: NotificationService,
    private http: HttpClient,
    private titleService: Title,
    public sanitizer: DomSanitizer) { }

  public showNotification(message: string, typeStyle?: string): void {
    this.notificationService.show({
      content: `${message}`,
      cssClass: "button-notification",
      hideAfter: 4000,
      animation: { type: "slide", duration: 400 },
      position: { horizontal: "right", vertical: "bottom" },
      type: {
        style: this.getStyle(typeStyle ?? "success"), icon: false
      },
    });
  }

  private getStyle(type: string) {
    let style: "success" | "error" | "info" | "warning" | "none" | undefined;
    switch (type.toLowerCase()) {
      case "success":
        style = "success";
        break;
      case "error":
        style = "error";
        break;
      case "info":
        style = "info";
        break;
      case "warning":
        style = "warning";
        break;
      default:
        style = "none";
        break;
    }
    return style;
  }

  public convertGridleName(girdelData: string) {

    const lowercaseInput = girdelData.toLowerCase();
    // Remove "(Faceted)"
    const step1 = lowercaseInput.replace(/\(faceted\)/g, '');

    // Replace consecutive spaces with a single space
    const step2 = step1.replace(/\s+/g, ' ');;

    return step2;
  }

  public sortingMasterDNormPriority(data: MasterDNorm[]) {
    data = data.sort((n1, n2) => {
      let np1 = parseInt(n1.priority);
      let np2 = parseInt(n2.priority);

      if (np1 > np2)
        return 1;

      if (np1 < np2)
        return -1;

      return 0;
    });
    return data;
  }

  public numberOnly(event: any): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57))
      return false;

    return true;
  }

  public numberWithSpaceOnly(event: any): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode != 32 && (charCode > 31 && (charCode < 48 || charCode > 57)))
      return false;

    return true;
  }

  public numberAddMinusOnly(event: any): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode != 46 && (charCode > 31 && (charCode < 48 || charCode > 57)))
      if (charCode == 45)
        return true;
      else
        return false;
    return true;
  }

  public floatOnly(event: any): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode != 46 && (charCode > 31 && (charCode < 48 || charCode > 57)))
      return false;

    return true;
  }

  public discountfloat(event: any): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if ((charCode != 46 && charCode != 45) && (charCode > 31 && (charCode < 48 || charCode > 57)))
      return false;

    return true;
  }

  public ConvertToFloatWithDecimal(z: number, fix: number = 2) {
    z = Number(parseFloat(parseFloat(z.toString()).toFixed(fix)));
    if (z === -0)
      z = 0;
    return z;
  }

  public ConvertToFloatWithDecimalTwoDigit(z: number) {
    var str: string = "";
    if (isNaN(Number(z)))
      return "0.00";
    z = Number(parseFloat(parseFloat(z.toString()).toFixed(2)));
    str = parseFloat(z.toString()).toFixed(2);
    //str = str.replace(".00", "");
    return str;
  }

  public ConvertToFloatWithDecimalTwoDigitRound(z: number) {
    var str: string = "";
    z = Number(parseFloat(parseFloat(z.toString()).toFixed(0)));
    str = parseFloat(z.toString()).toFixed(0) + '.00';
    return str;
  }

  public ConvertToFloatWithDecimalTwoDigitRoundWithNum(z: number) {
    var str: string = "";
    z = Number(parseFloat(parseFloat(z.toString()).toFixed(2)));
    str = parseFloat(z.toString()).toFixed(2);
    return parseFloat(str);
  }

  public setfilterToggleValue(value: boolean) {
    value = !value;
    this.filterToggleSubject.next(value);
  }

  public onlyUniqueFromStringArray(value: any, index: any, self: any) {
    return self.indexOf(value) === index;
  }

  public getValidDate(date: any): Date {
    const day = moment(date).date();
    const month = moment(date).month();
    const year = moment(date).year();
    var newDate = new Date(year, month, day);
    return newDate;
  }

  public getValidDateWithFormate(date: any): string {
    // const day = moment(date).date();
    // const month = moment(date).month()+1;
    // const year = moment(date).year();
    // var newDate = day + "/" + month + "/" + year;
    var newDate = moment(date.toString()).format("DD-MM-YYYY")
    return newDate;
  }

  public getISOtoStringDate(date: any): string {
    var newDate = moment(date.toString()).format("DD-MMM-YYYY")
    return newDate;
  }

  public setUTCDateFilter(date: Date) {
    var newDate = moment(date.setHours(5)).toDate();
    newDate = moment(newDate.setMinutes(30)).toDate();
    return moment(newDate).toDate();
  }

  public setLiveUTCDate() {
    return moment(Date()).toDate();
  }

  public CheckStoneIds(StoneId: string): string[] {
    let stoneIds: string[] = [];
    if (StoneId !== undefined && StoneId !== null && StoneId !== "") {
      if (StoneId.indexOf(",") > -1) {
        var obj = StoneId.split(",");
        if (obj.length > 0) {
          for (let i = 0; i < obj.length; i++) {
            let item = obj[i];
            if (StoneId.indexOf(" ") > -1) {
              var spaceObj = item.split(" ");
              for (let index = 0; index < spaceObj.length; index++) {
                const element = spaceObj[index];
                if (element.indexOf("-") > -1)
                  stoneIds.push(element.trim());
                else
                  this.generateStoneIds(element, stoneIds);
              }
            }
            else {
              if (item.indexOf("-") > -1)
                stoneIds.push(item.trim());
              else
                this.generateStoneIds(item, stoneIds);
            }
          }
        }
      }
      else if (StoneId.indexOf(" ") > -1) {
        var obj = StoneId.split(" ");
        if (obj.length > 0) {
          for (let i = 0; i < obj.length; i++) {
            let item = obj[i];
            if (StoneId.indexOf(",") > -1) {
              var spaceObj = item.split(",");
              for (let index = 0; index < spaceObj.length; index++) {
                const element = spaceObj[index];
                if (element.indexOf("-") > -1)
                  stoneIds.push(element.trim());
                else
                  this.generateStoneIds(element, stoneIds);
              }
            }
            else {
              if (item.indexOf("-") > -1)
                stoneIds.push(item.trim());
              else
                this.generateStoneIds(item, stoneIds);
            }
          }
        }
      }
      else {
        if (StoneId.indexOf("-") > -1)
          stoneIds.push(StoneId);
        else
          this.generateStoneIds(StoneId, stoneIds);
      }
    }

    stoneIds = stoneIds.map(x => x.replace("/t", "").trim());
    return stoneIds;
  }

  public generateStoneIds(item: string, stoneIds: string[]) {
    if (item?.length !== undefined && item?.length !== null && item?.length > 0) {
      let stone: any = item ? item.trim() : null;
      if (stone.match(/\d+/)) {
        let thenum: string = stone.match(/\d+/)[0];
        let arryStoneName = item.split(thenum)
        arryStoneName[1] = thenum + arryStoneName[1]
        let str = arryStoneName.join('-');
        stoneIds.push(str.trim());
      }

    }
  }

  public checkCertificateIds(certificateId: string): string[] {
    let certificateIds: string[] = [];
    if (certificateId !== undefined && certificateId !== null && certificateId !== "") {
      if (certificateId.indexOf(",") > -1) {
        var obj = certificateId.split(",");
        if (obj.length > 0) {
          for (let i = 0; i < obj.length; i++) {
            let item = obj[i];
            if (item.indexOf(" ") > -1) {
              var objSub = item.split(" ");
              if (objSub.length > 0) {
                for (let i = 0; i < objSub.length; i++) {
                  let itemSub = objSub[i];
                  if (itemSub)
                    certificateIds.push(itemSub.trim());
                }
              }
              else {
                if (item)
                  certificateIds.push(item.trim());
              }
            }
            else {
              if (item)
                certificateIds.push(item.trim());
            }
          }
        }
      }
      else if (certificateId.indexOf(" ") > -1) {
        var obj = certificateId.split(" ");
        if (obj.length > 0) {
          for (let i = 0; i < obj.length; i++) {
            let item = obj[i];
            if (item.indexOf(",") > -1) {
              var objSub = item.split(",");
              if (objSub.length > 0) {
                for (let i = 0; i < objSub.length; i++) {
                  let itemSub = objSub[i];
                  if (itemSub)
                    certificateIds.push(itemSub.trim());
                }
              }
              else {
                if (item)
                  certificateIds.push(item.trim());
              }
            }
            else {
              if (item)
                certificateIds.push(item.trim());
            }
          }
        }
      }
      else
        certificateIds.push(certificateId.trim());
    }
    else
      certificateIds.push(certificateId.trim());

    certificateIds = certificateIds.map(x => x.replace("/t", "").trim());
    return certificateIds;
  }

  public CheckStoneIdsAndCertificateIds(value: string): string[] {
    let values: string[] = [];
    if (value !== undefined && value !== null && value !== "") {
      if (value.indexOf(",") > -1) {
        var obj = value.split(",");
        if (obj.length > 0) {
          for (let i = 0; i < obj.length; i++) {
            let item = obj[i];
            if (value.indexOf(" ") > -1) {
              var spaceObj = item.split(" ");
              for (let index = 0; index < spaceObj.length; index++) {
                const element = spaceObj[index];
                if (element.indexOf("-") > -1)
                  values.push(element.trim());
                else
                  this.generateStoneIdsAndCertificateIds(element, values);
              }
            }
            else {
              if (item.indexOf("-") > -1)
                values.push(item.trim());
              else
                this.generateStoneIdsAndCertificateIds(item, values);
            }
          }
        }
      }
      else if (value.indexOf(" ") > -1) {
        var obj = value.split(" ");
        if (obj.length > 0) {
          for (let i = 0; i < obj.length; i++) {
            let item = obj[i];
            if (value.indexOf(",") > -1) {
              var spaceObj = item.split(",");
              for (let index = 0; index < spaceObj.length; index++) {
                const element = spaceObj[index];
                if (element.indexOf("-") > -1)
                  values.push(element.trim());
                else
                  this.generateStoneIdsAndCertificateIds(element, values);
              }
            }
            else {
              if (item.indexOf("-") > -1)
                values.push(item.trim());
              else
                this.generateStoneIdsAndCertificateIds(item, values);
            }
          }
        }
      }
      else {
        if (value.indexOf("-") > -1)
          values.push(value);
        else
          this.generateStoneIdsAndCertificateIds(value, values);
      }
    }

    values = values.map(x => x.replace("/t", "").trim());
    return values;
  }

  public generateStoneIdsAndCertificateIds(item: string, stoneIds: string[]) {
    if (item?.length !== undefined && item?.length !== null && item?.length > 0) {
      let stone: any = item ? item.trim() : null;
      if (this.containsOnlyNumbers(item))
        stoneIds.push(item.trim());
      else {
        if (stone.match(/\d+/)) {
          let thenum: string = stone.match(/\d+/)[0];
          let arryStoneName = item.split(thenum)
          arryStoneName[1] = thenum + arryStoneName[1]
          let str = arryStoneName.join('-')
          stoneIds.push(str.trim());
        }
      }
    }
  }

  public containsOnlyNumbers(str: string) {
    return /^\d+$/.test(str);
  }

  public ApplyStringFilter(a: string, z: string): boolean {
    let filter = true;
    if ((a == null || a == undefined || a?.length == 0) && (z == null || z == undefined || z?.length == 0))
      filter = true;
    else
      if (a == null || a == undefined || a?.length == 0)
        filter = false;
      else
        if ((a && a.length > 0) && (z && z.length > 0)) {
          let array: string[] = [];
          array = this.CheckStoneIds(z);

          if (array.length > 0)
            filter = array.map(b => b.toLowerCase()).includes(a.toLowerCase());
          else
            filter = z.toLowerCase() == a.toLowerCase();
        }
    return filter;
  }

  public ApplyCertificateFilter(a: string, z: string): boolean {
    let filter = true;
    if ((a == null || a == undefined || a?.length == 0) && (z == null || z == undefined || z?.length == 0))
      filter = true;
    else
      if (a == null || a == undefined || a?.length == 0)
        filter = false;
      else
        if ((a && a.length > 0) && (z && z.length > 0)) {
          let array: string[] = [];
          array = this.checkCertificateIds(z);

          if (array.length > 0)
            filter = array.includes(a);
          else
            filter = z == a;
        }
    return filter;
  }

  public setAmtForPricingResponse(target: MfgPricingResponse, weight: number): MfgPricingResponse {
    if (target && target != null && target.rap != null && target.rap != 0) {
      let rap = target.rap;
      let disc = target.discount;
      if (rap && disc) {
        rap = parseFloat(rap.toString());
        disc = parseFloat(disc.toString());

        let stoneRap = weight * rap;
        let calDiscount = 100 + disc;
        let netAmount = (calDiscount * stoneRap) / 100;

        target.oAmount = this.ConvertToFloatWithDecimal(netAmount);
        let perCarat = netAmount / weight;
        target.dcaret = this.ConvertToFloatWithDecimal(perCarat);
      }
    }
    return target;
  }

  public setAmtForPricingDiscountResponse(target: PricingDiscountApiResponse, weight: number): PricingDiscountApiResponse {
    if (target && target != null && target.rapPrice != null && target.rapPrice != 0) {
      let rap = target.rapPrice;
      let disc = target.discount;
      if (rap && disc) {
        rap = parseFloat(rap.toString());
        disc = parseFloat(disc.toString());

        let stoneRap = weight * rap;
        let calDiscount = 100 + disc;
        let netAmount = (calDiscount * stoneRap) / 100;

        target.amount = this.ConvertToFloatWithDecimal(netAmount);
        let perCarat = netAmount / weight;
        target.dCaret = this.ConvertToFloatWithDecimal(perCarat);
      }
    }
    return target;
  }

  public setAmtForPricingMarketSheetDiscountResponse(target: PricingMarketSheetResponse, weight: number): PricingMarketSheetResponse {
    if (target && target != null && target.rapPrice != null && target.rapPrice != 0) {
      let rap = target.rapPrice;
      let disc = target.discount;
      if (rap && disc) {
        rap = parseFloat(rap.toString());
        disc = parseFloat(disc.toString());

        let stoneRap = weight * rap;
        let calDiscount = 100 + disc;
        let netAmount = (calDiscount * stoneRap) / 100;

        target.amount = this.ConvertToFloatWithDecimal(netAmount);
        let perCarat = netAmount / weight;
        target.dCaret = this.ConvertToFloatWithDecimal(perCarat);
      }
    }
    return target;
  }

  public replaceSymbols(string: string): string {
    string = string.replace(/[^a-zA-Z ]/g, "");
    string = string.replace(/ /g, "_");

    return string;
  }

  public exportFileName(fileName: string): string {
    var today = new Date();
    var date = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate() + "_";
    var time = today.getHours() + "-" + today.getMinutes() + "-" + today.getSeconds();
    var name = fileName + '_' + date + time;
    return name;
  }

  //#region Export to Excel
  public base64ToArrayBuffer(base64: string) {
    let binaryString = window.atob(base64);
    let binaryLength = binaryString.length;
    let bytes = new Uint8Array(binaryLength);

    for (let i = 0; i < binaryLength; i++) {
      let ascii = binaryString.charCodeAt(i);
      bytes[i] = ascii;
    }
    return bytes;
  }

  public exportAsExcelFile(newArray: any, fileName: string) {
    let flag: boolean = false;
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(newArray);
    const workbook: XLSX.WorkBook = { Sheets: { "data": worksheet }, SheetNames: ["data"] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    flag = this.saveAsExcelFile(excelBuffer, fileName);
    return flag;
  }

  public exportAsCsvFile(newArray: any, fileName: string, isSkipHeader: boolean = false) {
    let flag: boolean = false;
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(newArray, { skipHeader: isSkipHeader });
    const workbook: XLSX.WorkBook = { Sheets: { "data": worksheet }, SheetNames: ["data"] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: "csv", type: "array" });
    flag = this.saveAsExcelFile(excelBuffer, fileName, '.csv');
    return flag;
  }

  public exportSaleAsExcelFile(newArray: any, SupplierName: string, toDate: string, fromDate: string, fileName: string) {
    let flag: boolean = false;
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(newArray, { skipHeader: true });
    XLSX.utils.sheet_add_aoa(worksheet, [[SupplierName]], { origin: 'P2' });
    let subHeader = '';
    if (toDate && fromDate)
      subHeader = `e-Invoice Detail Register for the Period ${fromDate} to ${toDate}`;
    else
      subHeader = `e-Invoice Detail`;

    XLSX.utils.sheet_add_aoa(worksheet, [[subHeader]], { origin: 'P3' });
    const workbook: XLSX.WorkBook = { Sheets: { "data": worksheet }, SheetNames: ["data"] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    flag = this.saveAsExcelFile(excelBuffer, fileName);
    return flag;
  }

  public saveAsExcelFile(buffer: any, fileName: string, ext: string = ".xlsx") {
    var blobType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    if (ext == '.csv')
      blobType = 'text/csv';

    const data: Blob = new Blob([buffer], {
      type: blobType
    });
    var name = this.exportFileName(fileName);
    FileSaver.saveAs(data, name + ext);
    return true;
  }

  public exportAsExcelFileBase64(newArray: any) {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(newArray);
    const workbook: XLSX.WorkBook = { Sheets: { "data": worksheet }, SheetNames: ["data"] };
    return XLSX.write(workbook, { bookType: "xlsx", type: "base64" });
  }

  public blobToBase64WithMIME(blob: Blob) {
    return new Promise((resolve, _) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  }

  public getMimeTypeFromFileName(name: string): string {
    let mimeType = 'image/jpeg';
    if (name) {
      let splitName = name.split(".");
      if (splitName.length > 1) {
        let ext = splitName[splitName.length - 1];
        switch (ext.toLowerCase()) {
          case "png":
            mimeType = "image/png";
            break;
          case "pdf":
            mimeType = "application/pdf";
            break;
          case "jpeg":
            mimeType = "image/jpeg";
            break;
          case "jpg":
            mimeType = "image/jpeg";
            break;
          case "gif":
            mimeType = "image/gif";
            break;
          case "xls":
            mimeType = "application/vnd.ms-excel";
            break;
          case "xlsx":
            mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            break;
        }
      }
    }
    return mimeType;
  }
  //#endregion

  //#region MultiSelect DDL
  public onMultiSelectChange(val: Array<{ name: string; isChecked: boolean }>, selectedData: string[]): void {
    val.forEach(element => {
      element.isChecked = false;
    });

    if (selectedData && selectedData.length > 0) {
      val.forEach(element => {
        selectedData.forEach(item => {
          if (element.name.toLocaleLowerCase() == item.toLocaleLowerCase())
            element.isChecked = true;
        });
      });
    }
  }

  public onMultiSelectValueChange(val: Array<{ name: string; value: string; isChecked: boolean }>, selectedData: string[]): void {
    val.forEach(element => {
      element.isChecked = false;
    });

    if (selectedData && selectedData.length > 0) {
      val.forEach(element => {
        selectedData.forEach(item => {
          if (element.value.toLocaleLowerCase() == item.toLocaleLowerCase())
            element.isChecked = true;
        });
      });
    }
  }

  public onOpenDropdown(list: Array<{ name: string; isChecked: boolean }>, e: boolean, selectedData: string[]): boolean {
    if (selectedData?.length == list.map(z => z.name).length)
      e = true;
    else
      e = false;
    return e;
  }

  public handleFilter(e: any): string {
    return e;
  }

  public filterDropdownSearch(allData: MasterDNorm[], e: any, selectedData: string[]): Array<{ name: string; isChecked: boolean }> {
    let filterData: any[] = [];
    allData.forEach(z => { filterData.push({ name: z.name, isChecked: false }); });
    filterData.forEach(z => {
      if (selectedData?.includes(z.name))
        z.isChecked = true;
    });
    if (e?.length > 0)
      return filterData.filter(z => z.name?.toLowerCase().includes(e?.toLowerCase()));
    else
      return filterData;
  }

  public filterDropdownSearchDefault(allData: string[], e: any, selectedData: string[]): Array<{ name: string; isChecked: boolean }> {
    let filterData: any[] = [];
    allData.forEach(z => { filterData.push({ name: z, isChecked: false }); });
    filterData.forEach(z => {
      if (selectedData?.includes(z.name))
        z.isChecked = true;
    });
    if (e?.length > 0)
      return filterData.filter(z => z.name?.toLowerCase().includes(e?.toLowerCase()));
    else
      return filterData;
  }

  public checkAllListItems(list: Array<{ name: string; isChecked: boolean }>, e: boolean, selectedData: string[]): string[] {
    if (e) {
      selectedData = [];
      selectedData = list.map(z => z.name);
      list.forEach(element => {
        element.isChecked = true;
      });
    }
    else {
      selectedData = [];
      list.forEach(element => {
        element.isChecked = false;
      });
    }
    return selectedData;
  }

  public getCommaSapratedString(vals: any[], isAll: boolean = false): string {
    let name = vals.join(',')
    if (!isAll)
      if (name.length > 15)
        name = name.substring(0, 15) + '...';

    return name;
  }

  public getCommaSapratedStringFromData(vals: any[], list: Array<{ name: string; value: string; isChecked: boolean }>, isAll: boolean = false): string {
    let names = list.filter(z => vals.includes(z.value)).map(z => z.name);

    let name = names.join(',')
    if (!isAll)
      if (name.length > 15)
        name = name.substring(0, 15) + '...';

    return name;
  }

  public checkMinMaxValidation(min: any, max: any): string {
    if (min && max) {
      if (parseFloat(min) > parseFloat(max))
        return "min value must greater than max value!";
    }
    else if (min && !max)
      return "max value required!";
    else if (min && !max)
      return "min value required!";

    return '';
  }

  public addRemoveStringInArrayFilter(a: string[], b: string) {
    if (b == 'All') {
      let c = [...a];
      c.forEach(z => { a.splice(0, 1); });
      return;
    }
    if (a.indexOf(b) == -1)
      a.push(b);
    else {
      let index = a.findIndex(x => x == b);
      if (index >= 0)
        a.splice(index, 1)
    }
  }

  public addRemoveStringInArrayFilterColor(a: string[], b: string) {
    if (b == 'All') {
      let c = [...a];
      c.forEach(z => { a.splice(0, 1); });
      return;
    }
    else if (b == '*') {
      let c = [...a];
      c.forEach(z => { a.splice(0, 1); });
      a.push(b);
      return;
    }

    if (a.indexOf(b) == -1) {
      if (a.includes('*')) {
        let index = a.findIndex(x => x == '*');
        if (index >= 0)
          a.splice(index, 1)
      }

      a.push(b);
    }
    else {
      let index = a.findIndex(x => x == b);
      if (index >= 0)
        a.splice(index, 1)
    }

  }

  //#endregion MultiSelect DDL

  //#region Filters

  public filterArrayString(target: string, filter: string[], isOptional: boolean = false): boolean {
    if (filter == null || filter.length == 0)
      return true;
    else if (filter != null && filter.length > 0 && (target == null || target.length == 0))
      return isOptional;
    else
      return filter.map(u => u?.toLowerCase()).includes(target.toLowerCase());
  }

  public filterArrayStringColor(target: string, filter: string[], isOptional: boolean = false): boolean {
    if (filter == null || filter.length == 0)
      return true;
    else if (filter != null && filter.length > 0 && (target == null || target.length == 0))
      return isOptional;
    else if (target != null && target.length > 0)
      return true;
    else
      return filter.map(u => u?.toLowerCase()).includes(target.toLowerCase());
  }

  public filterFromToDecimalValues(target: number | null, filterFrom: number | null | undefined, filterTo: number | null | undefined): boolean {
    if ((filterFrom == null || filterFrom == undefined) && (filterTo == null || filterTo == undefined))
      return true;
    else if ((filterFrom != null && filterFrom != undefined && filterFrom >= 0) && (filterTo != null && filterTo != undefined && filterTo >= 0) && (target == null))
      return false;
    else
      return ((filterFrom ?? 0) <= (target ?? 0) && (filterTo ?? 0) >= (target ?? 0));
  }

  public filterFromToNegativeDecimalValues(target: number | null, filterFrom: number | null | undefined, filterTo: number | null | undefined): boolean {
    if ((filterFrom == null || filterFrom == undefined) && (filterTo == null || filterTo == undefined))
      return true;
    else if ((filterFrom != null && filterFrom != undefined) && (filterTo != null && filterTo != undefined) && (target == null))
      return false;
    else
      return ((filterFrom ?? 0) <= (target ?? 0) && (filterTo ?? 0) >= (target ?? 0));
  }

  public filterFromToDateValues(target: Date | null, filterFrom: Date | null | undefined, filterTo: Date | null | undefined): boolean {
    if (filterFrom == null || filterTo == null || filterFrom == undefined || filterTo == undefined)
      return true;
    else if ((filterFrom != null && filterTo != null && filterFrom != undefined && filterTo != undefined) && target == null)
      return false;
    else
      return (filterFrom?.getDate <= (target?.getDate ?? new Date()) && filterTo?.getDate >= (target?.getDate ?? new Date()));
  }

  public filterCommonString(target: string, filter: string | undefined): boolean {
    if (filter == null || filter == undefined)
      return true;
    else if ((!filter) && (target))
      return false;
    else
      return (target?.toLowerCase() == filter?.toLowerCase());
  }

  public filterCommonBoolen(target: boolean | null, filter: boolean | null | undefined): boolean {
    if (filter == null || filter == undefined)
      return true;
    else if (filter != null && filter != undefined && target == null)
      return false;
    else
      return (target == filter);
  }
  //#endregion

  async getIPAddress(): Promise<any> {
    const get$ = this.http.get("http://api.ipify.org/?format=json");

    var result = await lastValueFrom(get$) as any;
    return result;
  }

  public loadImage(imageSrc: string) {
    if (imageSrc != undefined && imageSrc != null && imageSrc != "")
      return 'data:image/JPEG;base64,' + imageSrc;
    else
      return null
  }

  public addressDtlNullNConcat(address: Address): string {
    var result: string = "";
    result += address.line1 ? address.line1 + ', ' : '';
    result += address.line2 ? address.line2 + ', ' : '';
    result += address.city ? address.city + ', ' : '';
    result += address.state ? address.state + ', ' : '';
    result += address.country ? address.country + ', ' : '';
    result += address.zipCode ? address.zipCode + '' : '';
    return result.toString();
  }

  public getValidTime(date: any): Date {
    const day = moment(date).date();
    const month = moment(date).month();
    const year = moment(date).year();
    const hour = moment(date).hour();
    const min = moment(date).minute();
    const second = moment(date).second();
    var newDate = new Date(year, month, day, hour, min, second);
    return newDate;
  }

  public getLogoPath(path: string): string {
    var result: string = "";
    if (path.toLowerCase().includes("diamarthk"))
      result = "commonAssets/images/Diamart.png"
    else if (path.toLowerCase().includes("glowstaronline") || path.toLowerCase().includes("localhost"))
      result = "commonAssets/images/Glowstar.png"
    else if (path.toLowerCase().includes("diamanto"))
      result = "commonAssets/images/Diamanto.png"
    else
      result = "commonAssets/images/Diamanto.png"
    return result.toString();
  }

  public getCusLogoPath(path: string): string {
    var result: string = "";
    if (path.toLowerCase().includes("diamarthk"))
      result = "commonAssets/images/Diamart_new.png"
    else if (path.toLowerCase().includes("glowstaronline") || path.toLowerCase().includes("localhost"))
      result = "commonAssets/images/Glowstar_newUI-black.svg"
    else if (path.toLowerCase().includes("diamanto"))
      result = "commonAssets/images/Diamanto_newUI.png"
    else
      result = "commonAssets/images/Diamanto_newUI.png"
    return result.toString();
  }

  public getLogoPathWhite(path: string): string {
    var result: string = "";
    if (path.toLowerCase().includes("diamarthk"))
      result = "commonAssets/images/Diamart_newUI_white.png"
    else if (path.toLowerCase().includes("glowstaronline") || path.toLowerCase().includes("localhost"))
      result = "commonAssets/images/Glowstar_newUI_white.png"
    else if (path.toLowerCase().includes("diamanto"))
      result = "commonAssets/images/Diamanto_newUI_white.png"
    else
      result = "commonAssets/images/Diamanto_newUI_white.png"
    return result.toString();
  }

  public getAnnouncmentType(path: string): string {
    var result: string = "";
    if (path.toLowerCase().includes("diamarthk"))
      result = this.listAnnounceType.AnnounceDiamarthk;
    else if (path.toLowerCase().includes("glowstaronline") || path.toLowerCase().includes("localhost"))
      result = this.listAnnounceType.AnnounceGlowstar;
    else if (path.toLowerCase().includes("diamanto"))
      result = this.listAnnounceType.AnnounceDiamanto;
    else
      result = this.listAnnounceType.AnnounceDiamanto;
    return result.toString();
  }

  public getSocialPath(path: string): any {
    var result = {};
    if (path.toLowerCase().includes("glowstaronline"))
      result = {
        fackbook: 'https://www.facebook.com/glowstar.diamond',
        twitter: 'https://twitter.com/glowstardiamond',
        linkedin: 'https://in.linkedin.com/in/glowstardiamond',
        instagram: 'https://www.instagram.com/glowstardiamond',
      }
    else
      result = {
        fackbook: 'https://www.facebook.com',
        twitter: 'https://twitter.com',
        linkedin: 'https://in.linkedin.com',
        instagram: 'https://www.instagram.com',
      }
    return result;
  }

  public getLogoPathBackOffice(path: string): string {
    var result: string = "";
    if (path.toLowerCase().includes("glowstaronline")) {
      result = "commonAssets/images/Glowstar.png"
      this.setTitle("GlowStar Backoffice");
    }
    else if (path.toLowerCase().includes("sarjubackoffice")) {
      result = "commonAssets/images/SarjuImpex.png"
      this.setTitle("SarjuImpex BackOffice");
    }
    else if (path.toLowerCase().includes("srutidiam")) {
      result = "commonAssets/images/diamoondmcc.png"
      this.setTitle("Diamoon DMCC BackOffice");
    }
    else if (path.toLowerCase().includes("chintangems")) {
      result = "commonAssets/images/chintangemsLogo.png"
      this.setTitle("ChintanGems BackOffice");
    }
    else if (path.toLowerCase().includes("diamarthk")) {
      result = "commonAssets/images/DiamartLogo.png"
      this.setTitle("Diamart BackOffice");
    }
    else {
      result = "commonAssets/images/Glowstar.png"
      this.setTitle("GlowStar Backoffice");
    }
    return result.toString();
  }

  public getLogoPathForMail(path: string): string {
    let url = window.location.origin;
    var result: string = "";
    if (path.toLowerCase().includes("gs") || path.toLowerCase().includes("localhost"))
      result = url + "/commonAssets/images/Glowstar.png"
    else if (path.toLowerCase().includes("cg"))
      result = url + "/commonAssets/images/chintangemsLogo.png"
    else if (path.toLowerCase().includes("dm"))
      result = url + "/commonAssets/images/DiamartLogo.png"
    else
      result = url + "/commonAssets/images/Diamanto.png"

    return result.toString();
  }

  public getLoginImagePath(path: string): string {
    var result: string = "";
    if (path.toLowerCase().includes("diamarthk"))
      result = "../assets/images/login_ComponentDM.png"
    else if (path.toLowerCase().includes("glowstaronline") || path.toLowerCase().includes("localhost"))
      result = "../assets/images/login_ComponentGS.png"
    else if (path.toLowerCase().includes("diamanto"))
      result = "../assets/images/login_Component.png"
    else
      result = "../assets/images/login_Component.png"
    return result.toString();
  }

  public getFullFormOfCompanyName(name: string): string {
    var result: string = "";
    if (name.toLowerCase().includes("gs"))
      result = "Glowstar"
    else if (name.toLowerCase().includes("cg"))
      result = "Chintan Gems"
    else if (name.toLowerCase().includes("dm"))
      result = "Diamart"
    else
      result = "Diamanto"

    return result.toString();
  }

  public getCompanyNameFromUrl(path: string): string {
    var result: string = "";
    if (path.toLowerCase().includes("diamarthk"))
      result = "Diamart"
    else if (path.toLowerCase().includes("glowstaronline") || path.toLowerCase().includes("localhost"))
      result = "Glowstar"
    else
      result = "Diamanto"
    return result.toString();
  }

  public getCompanyMobileNumberFromUrl(path: string): string {
    var result: string = "";
    if (path.toLowerCase().includes("diamarthk"))
      result = ""
    else if (path.toLowerCase().includes("glowstaronline") || path.toLowerCase().includes("localhost"))
      result = "+919913153000"
    else
      result = ""
    return result.toString();
  }

  public getAboutUsPath(path: string): string {
    var result: string = "";
    if (path.toLowerCase().includes("diamarthk"))
      result = "commonAssets/images/DiamartBuilding.png"
    else if (path.toLowerCase().includes("glowstaronline") || path.toLowerCase().includes("localhost"))
      result = "commonAssets/images/DiamantoBuilding.jpg"
    else if (path.toLowerCase().includes("diamanto"))
      result = "commonAssets/images/DiamartBuilding.png"
    else
      result = "commonAssets/images/DiamantoBuilding.jpg"
    return result.toString();
  }

  public getCPSValue(shape: string, cut: string, polish: string, symmetry: string, cpsDetails: CutDetailDNorm[]): string {
    if (shape != null && shape != undefined && shape.length > 0) {
      if (shape.toLowerCase() == 'rbc')
        return cpsDetails.find(z => z.cut.toLowerCase() == cut?.toLowerCase() && z.polish.toLowerCase() == polish?.toLowerCase() && z.symmetry.toLowerCase() == symmetry?.toLowerCase() && z.shape.toLowerCase() == 'round')?.cps ?? null as any;
      else
        return cpsDetails.find(z => z.cut.toLowerCase() == cut?.toLowerCase() && z.polish.toLowerCase() == polish?.toLowerCase() && z.symmetry.toLowerCase() == symmetry?.toLowerCase() && z.shape.toLowerCase() == 'fancy')?.cps ?? null as any;
    }
    else
      return null as any;
  }

  public validateAddAmountLimit(amt: number, limit: number): boolean {
    let amount = JSON.parse(JSON.stringify(amt));
    if (amount.toString().includes('-'))
      amount = Number(amount.toString().replace('-', ''))
    return limit >= amount;
  }

  public setadditionalAmountForTransaction(amt: number): number {
    let addAmt = 0;
    if (amt && amt.toString() != '' && amt.toString() != null && amt.toString() != undefined) {
      let amount = JSON.parse(JSON.stringify(amt));
      amount = this.ConvertToFloatWithDecimal(amount);
      let floatNumber = amount.toString().split('.');
      if (floatNumber.length > 1 && floatNumber[floatNumber.length - 1]) {
        let pointNumber = Number('0.' + floatNumber[floatNumber.length - 1].toString());
        if (pointNumber >= 0.5)
          addAmt = 1 - pointNumber;
        else
          addAmt = Number('-' + pointNumber.toString());
      }
    }

    return this.ConvertToFloatWithDecimal(addAmt);
  }

  private hasDecimal(num: number) {
    return !!(num % 1);
  }

  public convertAmoutToWord(amount: number, type: string): string {
    // varibale declaration
    var currencyToWord: string = "";
    var iniDigit: Array<string> = [];
    var fraction: Array<string> = [];
    var str = '';

    // conditionally check for beautification type
    var prefix = type == 'INR' ? ' Rupeess ' : ' Dollars ';
    var suffix = type == 'INR' ? ' Paisa' : ' Cents';

    // check the amount has a fraction or not
    if (this.hasDecimal(amount)) {
      iniDigit = amount.toString().split('.')[0].split('');
      fraction = amount.toString().split('.')[1].split('');
    }
    else {
      iniDigit = amount.toString().split('');
    }

    // convert initial digit to word 
    if (iniDigit.length > 0) {
      str = str + this.convertToWord(iniDigit.toString(), type);
    }


    // add extra word for beautification of word pharse
    str = str + prefix;
    if (this.hasDecimal(amount)) {
      str = str + '  and ';
    }

    // convert fraction to word
    if (fraction != null && fraction.length > 0) {
      if (fraction.length == 1)
        fraction.push("0");

      str = str + this.convertToWord(fraction.toString(), type);
      str = str + ' ' + suffix;
    }

    // add tail word for beautification
    str = str + ' Only';
    currencyToWord = str.replace(/\s+/g, ' ');
    return currencyToWord;
  }

  private convertToWord(amount: string, type: string) {
    /**
     * Ref link : https://math.tools/calculator/currency/words
     */
    var words = new Array();
    words[0] = 'zero';
    words[1] = 'One';
    words[2] = 'Two';
    words[3] = 'Three';
    words[4] = 'Four';
    words[5] = 'Five';
    words[6] = 'Six';
    words[7] = 'Seven';
    words[8] = 'Eight';
    words[9] = 'Nine';
    words[10] = 'Ten';
    words[11] = 'Eleven';
    words[12] = 'Twelve';
    words[13] = 'Thirteen';
    words[14] = 'Fourteen';
    words[15] = 'Fifteen';
    words[16] = 'Sixteen';
    words[17] = 'Seventeen';
    words[18] = 'Eighteen';
    words[19] = 'Nineteen';
    words[20] = 'Twenty';
    words[30] = 'Thirty';
    words[40] = 'Forty';
    words[50] = 'Fifty';
    words[60] = 'Sixty';
    words[70] = 'Seventy';
    words[80] = 'Eighty';
    words[90] = 'Ninety';
    words[100] = 'One Hundred';
    words[200] = 'Two Hundred';
    words[300] = 'Three Hundred';
    words[400] = 'Four Hundred';
    words[500] = 'Five Hundred';
    words[600] = 'Six Hundred';
    words[700] = 'Seven Hundred';
    words[800] = 'Eight Hundred';
    words[900] = 'Nine Hundred';
    var words_string = "";
    var amount = amount.toString();
    var atemp = amount.split(".");
    var number = atemp[0].split(",").join("");
    var n_length = number.length;
    if (type === listCurrencyType.USD) {
      if (n_length <= 11) {
        var n_array = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
        var received_n_array = new Array();
        for (var i = 0; i < n_length; i++) {
          received_n_array[i] = number.substr(i, 1);
        }
        for (var i = 11 - n_length, j = 0; i < 11; i++, j++) {
          n_array[i] = received_n_array[j];
        }
        for (var i = 0, j = 1; i < 11; i++, j++) {
          if (i == 0 || i == 3 || i == 6 || i == 9) {
            if (n_array[i] == 1) {
              n_array[j] = 10 + parseInt(n_array[j].toString());
              n_array[i] = 0;
            }
          }
        }
        var value = 0;
        for (var i = 0; i < 11; i++) {
          if (i == 0 || i == 3 || i == 6 || i == 9) {
            value = n_array[i] * 10;
          } else if (i == 2 || i == 5 || i == 8) {
            value = n_array[i] * 100;
          } else {
            value = n_array[i];
          }

          if (value != 0) {
            words_string += words[value] + ' ';
          }
          if ((i == 1 && value != 0) && (n_array[i - 1] > 0)) {
            words_string += 'Billion ';
          } else if ((i == 1) && value != 0) {
            words_string += 'Biillion ';
          }
          if ((i == 4) && value == 0 && (n_array[i - 1] > 0 || n_array[i - 2] > 0)) {
            words_string += 'Million ';
          } else if ((i == 4) && value != 0) {
            words_string += 'Million ';
          }
          if ((i == 7) && value == 0 && (n_array[i - 1] > 0 || n_array[i - 2] > 0)) {
            words_string += 'Thousand ';
          } else if ((i == 7) && value != 0) {
            words_string += 'Thousand ';
          }
        }
        words_string = words_string.split(' ').join(' ');
      }
    }
    if (type === listCurrencyType.INR) {
      if (n_length <= 11) {
        var n_array = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0);
        var received_n_array = new Array();
        for (var i = 0; i < n_length; i++) {
          received_n_array[i] = number.substr(i, 1);
        }
        for (var i = 9 - n_length, j = 0; i < 9; i++, j++) {
          n_array[i] = received_n_array[j];
        }
        for (var i = 0, j = 1; i < 9; i++, j++) {
          if (i == 0 || i == 2 || i == 4 || i == 7) {
            if (n_array[i] == 1) {
              n_array[j] = 10 + parseInt(n_array[j].toString());
              n_array[i] = 0;
            }
          }
        }
        var value = 0;
        for (var i = 0; i < 9; i++) {
          if (i == 0 || i == 2 || i == 4 || i == 7) {
            value = Number(n_array[i]) * 10;
          }
          else {
            value = Number(n_array[i]);
          }
          if (value != 0) {
            words_string += words[value] + " ";
          }
          if ((i == 1 && value != 0) || (i == 0 && value != 0 && n_array[i + 1] == 0)) {
            words_string += "Crores ";
          }
          if ((i == 3 && value != 0) || (i == 2 && value != 0 && n_array[i + 1] == 0)) {
            words_string += "Lakhs ";
          }
          if ((i == 5 && value != 0) || (i == 4 && value != 0 && n_array[i + 1] == 0)) {
            words_string += "Thousand ";
          }
          if (i == 6 && value != 0 && (n_array[i + 1] != 0 && n_array[i + 2] != 0)) {
            words_string += "Hundred-";
          }
          else if (i == 6 && value != 0) {
            words_string += "Hundred ";
          }
        }
        words_string = words_string.split("  ").join(" ");
      }
    }
    return words_string;
  }

  public getDayDifference(fromDate: Date, toDate?: Date): number {
    const today = new Date();
    fromDate = new Date(fromDate);

    if (!toDate)
      toDate = today;
    else
      toDate = new Date(toDate);

    const timeDifference = toDate.getTime() - fromDate.getTime();
    const dayDifference = Math.round(timeDifference / (1000 * 60 * 60 * 24)); // 1 day = 1000ms * 60s * 60m * 24h
    return dayDifference;
  }

  public makeRandomString(lengthOfCode: number) {
    let text = "";
    for (let i = 0; i < lengthOfCode; i++) {
      text += this.possible.charAt(Math.floor(Math.random() * this.possible.length));
    }
    return text;
  }

  public setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }

  public calculateAvailableDateDiff(date: Date | null, holdDays: number, holdDate: Date | null): number {
    if (date == null)
      return 0;

    let diffDays = this.calculateDayDiff(date);

    let additionalHoldDays = 0;
    if (holdDate)
      additionalHoldDays = this.calculateDayDiff(holdDate);

    return (Number(diffDays) - holdDays - additionalHoldDays);
  }

  public calculateDayDiff(date: Date | null): number {
    if (date == null)
      return 0;

    let today = new Date();
    let calDate = new Date(date);
    calDate = new Date(calDate.getFullYear(), calDate.getMonth(), calDate.getDate());

    var diff = Math.abs(today.getTime() - calDate.getTime());
    var diffDays = Math.ceil(diff / (1000 * 3600 * 24)) - 1;

    if (today.getMonth() == calDate.getMonth() && today.getFullYear() == calDate.getFullYear())
      diffDays = today.getDate() - calDate.getDate();

    return diffDays;
  }

  public changeAdditionalDataForCustomerInv(z: InvDetailData, allShape: MasterDNorm[]): InvDetailData {
    if (z.shape.toLowerCase() != 'rbc' && z.shape.toLowerCase() != 'round')
      z.cut = '-';

    if (allShape) {
      var obj = allShape.find(c => c.name.toLowerCase() == z.shape.toLowerCase() || c.displayName.toLowerCase() == z.shape.toLowerCase() || c.optionalWords && c.optionalWords.map(u => u.toLowerCase().trim()).includes(z.shape.toLowerCase()));
      if (obj)
        z.shape = obj.displayName;
    }

    z.discount = this.ConvertToFloatWithDecimalTwoDigit(z.price.discount ?? 0) ?? '0';
    z.netAmount = this.ConvertToFloatWithDecimalTwoDigit(z.price.netAmount ?? 0) ?? '0';
    z.perCarat = this.ConvertToFloatWithDecimalTwoDigit(z.price.perCarat ?? 0) ?? '0';

    return z;
  }

  public getMesurmentString(shape: string, length: number, width: number, height: number): string {
    var V1: number = 0;
    var V2: number = 0;
    var Vlength: number = length;
    var Vwidth: number = width;
    var returnString = "";
    if (shape.toUpperCase() == "RBC" || shape.toUpperCase() == "ROUND") {
      V1 = Vlength < Vwidth ? Vlength : Vwidth;
      V2 = Vlength < Vwidth ? Vwidth : Vlength;
      returnString = V1 + " - " + V2 + " * " + height;
    }
    else {
      V2 = Vlength < Vwidth ? Vlength : Vwidth;
      V1 = Vlength < Vwidth ? Vwidth : Vlength;
      returnString = V1 + " * " + V2 + " * " + height;
    }
    return returnString;
  }

  public getContactUsDetails(path: string): ContactUsDetail {
    let result = new ContactUsDetail()

    if (path.toLowerCase().includes("glowstaronline") || path.toLowerCase().includes("localhost")) {
      result.address = `CC-7070, Bharat Diamond Bourse,
                        Bandra Kurla Complex, Bandra(E),
                        Mumbai, India-400 051.`;
      result.contactNo = '+91-9913153000';
      result.email = 'info@glowstardiam.com';
      result.websiteUrl = 'https://glowstaronline.com';
      result.locationUrl = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3770.981022100796!2d72.864321!3d19.064572000000002!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x4df38391d36fc095!2sGlowStar%20Diamond!5e0!3m2!1sen!2sin!4v1656322320370!5m2!1sen!2sin')
    }
    else {
      result.address = `Rm. 1104 11/FL., Chevalier House,
      45-51 Chatham Rd S, Tsim Sha Tsui,
      Hong Kong`;
      result.contactNo = '+852 5640 0200';
      result.email = 'sales@diamarthk.com';
      result.websiteUrl = 'https://diamarthk.com';
      result.locationUrl = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d14765.781064617377!2d114.1667058!3d22.298994!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0xb98c829878ae79a5!2sDiaMart%20(HK)%20Ltd!5e0!3m2!1sen!2sin!4v1678079024834!5m2!1sen!2sin')
    }

    return result;
  }

  public checkValidEmail(email: string): boolean {
    let flag = true;
    if (email && email.length > 0) {
      let emailArray = email.split(",");
      if (emailArray && emailArray.length > 0) {
        emailArray.forEach(z => {
          if (flag)
            flag = this.validateEmail(z.trim());
        });
      }
    }
    return flag;
  }

  public validateEmail(email: string): boolean {
    let regexp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    return regexp.test(email);
  }

  public getFixShapeName(name: string) {
    let newShapeName = "";
    if (name !== null && name !== undefined) {
      let lowerName = name.toLowerCase();

      switch (lowerName) {
        case "round":
        case "rbc":
        case "round brilliant":
        case "brilliant":
          newShapeName = "R";
          break;
        case "cushion":
        case "cmb":
        case "cu":
          newShapeName = "CU";
          break;
        case "emerald":
        case "em":
          newShapeName = "E";
          break;
        case "pear":
        case "ps":
        case "pb":
          newShapeName = "PR";
          break;
        case "oval":
        case "ob":
          newShapeName = "OV";
          break;
        case "heart":
        case "hb":
        case "ht":
        case "hr":
          newShapeName = "HT";
          break;
        case "marquise":
        case "mq":
        case "mb":
          newShapeName = "MQ";
          break;
        case "princess":
        case "smb":
          newShapeName = "CCS";
          break;
        default:
          newShapeName = "";
          break;
      }
    }
    return newShapeName;
  }

  public getFixCPSName(name: string) {
    let newName = "";
    if (name !== null && name !== undefined) {
      let lowerName = name.toLowerCase();

      switch (lowerName) {
        case "gd":
          newName = "G";
          break;
        case "fr":
          newName = "F";
          break;
        case "pr":
          newName = "P";
          break;
        default:
          newName = name;
          break;
      }
    }
    return newName;
  }

  public getLocationFromExportRequest(name: string) {
    let newName = ""
    if (name !== null && name !== undefined) {
      if (name == "Hong Kong")
        newName = "HK"
      else if (name == "India")
        newName = "INDIA"
      else if (name == "Belgium")
        newName = "BELGIUM"
      else if (name == "United Arab Emirates")
        newName = "UAE"
      else if (name == "Shenzhen")
        newName = "SHENZHEN"

    }
    return newName;
  }

  public startIntervalCheck() {
    let flag = false;
    const intervalDuration = 24 * 60 * 60 * 1000; // 1 day in milliseconds
      const now = new Date();
      const dayOfWeek = now.getDay(); // 0 for Sunday, 1 for Monday, ..., 6 for Saturday

      // Check condition only on specific days and during specific times
      if (dayOfWeek === 1 || dayOfWeek === 2 || dayOfWeek === 3 || dayOfWeek === 4 || dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 7) { // Example: Sunday, Tuesday, Thursday
        const hours = now.getHours();
        if (hours >= 0 && hours < 24)  // Example: Between 10 AM and 6 PM
          flag = true;
      }
      return flag;
  }

}
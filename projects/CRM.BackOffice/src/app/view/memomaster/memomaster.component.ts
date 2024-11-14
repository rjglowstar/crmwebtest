import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { DataResult, GroupDescriptor, process } from '@progress/kendo-data-query';
import { NgxSpinnerService } from 'ngx-spinner';
import { GridDetailConfig } from 'shared/businessobjects';
import { fxCredential } from 'shared/enitites';
import { AppPreloadService, memoExportExcelFormat, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { MemoResponse, MemoSearchCriteria } from '../../businessobjects';
import { InventoryItems, Ledger, Memo } from '../../entities';
import { BoUtilityService, GridPropertiesService, LedgerService, MemoService, PrintMemoFormat } from '../../services';
import { MemoSummary } from '../../businessobjects/memo/memosummary';
import { Align } from '@progress/kendo-angular-popup';

@Component({
  selector: 'app-memomaster',
  templateUrl: './memomaster.component.html',
  styleUrls: ['./memomaster.component.css']
})
export class MemomasterComponent implements OnInit {

  public stoneIds!: string;
  public groups: GroupDescriptor[] = [];
  public pageSize = 26;
  public skip = 0
  public fields!: GridDetailConfig[];
  public gridView!: DataResult;
  public filterFlag = true;
  public selectableSettings: SelectableSettings = {
    mode: 'single',
  };
  public skeletonArray = new Array(18);
  public mySelection: string[] = [];
  public memoSearchCriteria: MemoSearchCriteria = new MemoSearchCriteria();
  public stoneId?: string = '';
  public certificateNo?: string = '';
  public listPartyItems: Array<{ text: string; value: string }> = [];
  public partyItems: Ledger[] = [];
  public selectedPartyItem?: { text: string, value: string };
  public isMemo: boolean = false;
  public memoResponse: MemoResponse = new MemoResponse();
  public memoSummary: MemoSummary = new MemoSummary();
  public isVisiable: boolean = true;
  public isReceive: boolean = false;
  public isEdit: boolean = false;
  public isViewOnly: boolean = false;
  public memoObj: Memo = new Memo();
  public allowCustom = false;
  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'startsWith'
  };
  dateToday!: string;
  htmlDate: Date = new Date();
  public memoItem: Memo = new Memo;
  public excelFile: any[] = [];
  public aboveOneCaratExcelFile: any[] = [];
  public belowOneCaratExcelFile: any[] = [];
  private fxCredential!: fxCredential;
  public isViewButtons: boolean = false;
  public lpCount?: number;
  public lpWeight?: number;
  public opCount?: number;
  public opWeight?: number;
  public IssueCount?: number;
  public ReciveCount?: number;
  public PandingCount?: number;

  public showExcelOption = false;
  public excelOption: string | null = 'aboveFiveCentCarat';
  @ViewChild("anchor") public anchor!: ElementRef;
  @ViewChild("popup", { read: ElementRef }) public popup!: ElementRef;
  public anchorAlign: Align = { horizontal: "right", vertical: "bottom" };
  public popupAlign: Align = { horizontal: "center", vertical: "top" };

  constructor(
    private alertDialogService: AlertdialogService,
    public utilityService: UtilityService,
    private spinnerService: NgxSpinnerService,
    public appPreloadService: AppPreloadService,
    public router: Router,
    private gridPropertiesService: GridPropertiesService,
    public memoService: MemoService,
    public datePipe: DatePipe,
    private printMemoFormat: PrintMemoFormat,
    public ledgerService: LedgerService,
    private boUtilityService: BoUtilityService,
  ) { }

  async ngOnInit() {
    await this.defaultMethodsLoad();
  }

  public async defaultMethodsLoad() {
    this.fxCredential = await this.appPreloadService.fetchFxCredentials();
    if (!this.fxCredential)
      this.router.navigate(["login"]);

    if (this.fxCredential && this.fxCredential.origin && (this.fxCredential.origin.toLowerCase() == 'admin' || this.fxCredential.origin.toLowerCase() == 'opmanager' || this.fxCredential.origin.toLowerCase() == 'accounts'))
      this.isViewButtons = true;

    this.fields = await this.gridPropertiesService.getMemoMasterGrid();
    await this.loadParties();
    await this.loadMemo();
    await this.getMemoSummaryData()

    this.utilityService.filterToggleSubject.subscribe(flag => {
      this.filterFlag = flag;
    });
  }

  public async loadMemo() {
    try {
      this.spinnerService.show();
      this.memoSearchCriteria.stoneIds = this.stoneId ? this.utilityService.CheckStoneIds(this.stoneId).map(x => x.toUpperCase()) : [];
      this.memoSearchCriteria.certificateNos = this.certificateNo ? this.utilityService.checkCertificateIds(this.certificateNo) : [];
      this.memoResponse = await this.memoService.getMemos(this.memoSearchCriteria, this.skip, this.pageSize);
      this.gridView = process(this.memoResponse.memos, { group: this.groups });
      this.gridView.total = this.memoResponse.totalCount;
      this.opCount = this.memoResponse.opCount;
      this.opWeight = this.memoResponse.opWeight;
      this.lpCount = this.memoResponse.lpCount;
      this.lpWeight = this.memoResponse.lpWeight;
      this.IssueCount = this.memoResponse.issueCount;
      this.ReciveCount = this.memoResponse.reciveCount;
      this.PandingCount = this.memoResponse.pandingCount;
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error)
    }
  }

  //#region Inv Search Filter Data
  public async getMemoSummaryData() {
    try {
      this.memoSummary = await this.memoService.getMemoSummary(this.memoSearchCriteria);
      if (this.memoSummary) {
        this.gridView = process(this.memoResponse.memos, { group: this.groups });
        this.gridView.total = this.memoResponse.totalCount;
      }
    }
    catch (error: any) {
      console.error(error);
      this.alertDialogService.show('Summary not get, Please contact administrator!');
    }
  }

  public dateDiffCountValue(expdate: any) {
    let date1 = new Date(expdate);
    let date2 = new Date();
    let diff = Math.floor(date2.getTime() - date1.getTime());
    let days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return days;
  }

  public async loadParties() {
    try {
      let ledgerType: string[] = ['Boiler', 'Photography', 'Lab', 'Customer']
      this.partyItems = await this.ledgerService.getAllLedgersByType(ledgerType, '');
      this.listPartyItems = [];
      this.partyItems.forEach(z => { this.listPartyItems.push({ text: z.name, value: z.id }); });
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public partyChange() {
    let fetchParty = this.partyItems.find(x => x.id == this.selectedPartyItem?.value);
    if (fetchParty)
      this.memoSearchCriteria.party = fetchParty.id;
  }

  public groupChange(groups: GroupDescriptor[]): void {
    try {
      this.groups = groups;
      this.loadMemo();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error)
    }
  }

  public pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.loadMemo();
  }

  public selectedRowChange(e: any) {
    this.memoObj = e.selectedRows[0].dataItem
    this.isViewOnly = true;
  }

  public dblClick() {
    if (this.isViewOnly) {
      this.isMemo = true;
      this.isReceive = true;
      this.isEdit = false;
    }
  }

  public onFilterSubmit(form: NgForm) {
    this.skip = 0
    this.loadMemo();
    this.getMemoSummaryData();
  }

  public clearFilter(form: NgForm) {
    form.reset()
    this.stoneId = '';
    this.memoSearchCriteria = new MemoSearchCriteria();
    this.stoneIds = '';
    this.certificateNo = '';
    this.mySelection = [];
    this.loadMemo()
    this.getMemoSummaryData();
  }

  public openMemoDialog(): void {
    this.isViewOnly = false;
    this.isMemo = true;
    this.isEdit = false;
  }

  public openEditMemoDialog(): void {
    this.isEdit = true;
    this.isMemo = true;
  }

  public filterPartToggle() {
    this.utilityService.setfilterToggleValue(this.filterFlag);
  }

  public closeMemoDialog(event: boolean) {
    this.isMemo = event;
    this.isViewOnly = false;
    this.mySelection = []
    this.loadMemo();
  }

  public async memoGet(id: string) {
    this.memoItem = new Memo()
    this.memoItem = await this.memoService.getById(id);

    this.alertDialogService.ConfirmYesNo('Are you sure you want to print invoices for above and below 0.50 CT stones?', 'Print Invoice')
      .subscribe(async (res: any) => {
        if (res.flag) {
          await this.processPrintInvoice(this.memoItem, true);
        } else {
          await this.processPrintInvoice(this.memoItem, false);
        }
      });
  }

  public async processPrintInvoice(memoItem: Memo, isAboveOneCarat: boolean = false) {
    try {
      this.spinnerService.show();

      if (memoItem && memoItem.inventoryItems.length > 0) {
        this.boUtilityService.orderByStoneIdInventoryItems(memoItem.inventoryItems);
        let printStone: HTMLIFrameElement = document.createElement("iframe");
        printStone.name = "print_detail";
        printStone.style.position = "absolute";
        printStone.style.top = "-1000000px";
        document.body.appendChild(printStone);
        printStone?.contentWindow?.document.open();

        if ((memoItem.organization.address?.country.toLowerCase() == 'india' && !memoItem.isOverseas)
          || (memoItem.organization.address?.country.toLowerCase() == 'belgium' && !memoItem.isOverseas)) {
          printStone?.contentWindow?.document.write(`<html><head>
          <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <link rel="stylesheet" type="text/css" href="commonAssets/css/printmemo.css" media="print" />

            <style>
            .chal-head {
              display: flex;
              justify-content: space-between;
            }

            .co-details {
              position: static;
            }

            .di-info {
              text-align: right;
            }

            .di-info {
              text-align: right;
            }

            .chal-head .logo img {
              width: 250px;
            }

            .di-info span {
              font-size: 12px;
            }

            .chal-body span.c-st,
            .bo-left span {
              font-size: 10px;
            }

            .di-bor-0 td,
            .body-middle th,
            .body-middle td {
              font-size: 10px;
            }

            .body-f-footer {
              font-size: 10px;
              padding: 0px;
            }

            .body-f-footer ul {
              margin: 0;
            }

            .pager {
              font-size: 10px;
              font-weight: 600;
              text-align: right;
              padding-right: 5px;
            }
            .brd-remove table {
              border-collapse: inherit;
          }
          </style>
          </head>`);
        }
        else if ((memoItem.organization.address?.country.toLowerCase() == 'hong kong'
          || memoItem.organization.address?.country.toLowerCase() == 'united arab emirates') && !memoItem.isOverseas) {
          printStone?.contentWindow?.document.write(`<html><head>
          <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <link rel="stylesheet" type="text/css" href="commonAssets/css/printmemo.css" media="print" />

            <style>
            .chal-head {
              display: flex;
              justify-content: space-between;
            }
            
            .main-top .bo-left:nth-child(1) {
              flex-basis: 45%;
            }
        
            .main-top .di-bor-0:nth-child(2) {
              flex-basis: 30%;
            }
        
            .main-top .di-bor-0:nth-child(3) {
              flex-basis: 30%;
            }

            .co-details {
              position: static;
            }

            .di-info {
              text-align: right;
            }

            .di-info {
              text-align: right;
            }

            .chal-head .logo img {
              width: 250px;
            }

            .di-info span {
              font-size: 12px;
            }

            .chal-body span.c-st,
            .bo-left span {
              font-size: 10px;
            }

            .di-bor-0 td,
            .body-middle th,
            .body-middle td {
              font-size: 10px;
            }

            .body-f-footer {
              font-size: 10px;
              padding: 0px;
            }

            .body-f-footer ul {
              margin: 0;
            }

            .pager {
              font-size: 10px;
              font-weight: 600;
              text-align: right;
              padding-right: 5px;
            }
            .brd-remove table {
              border-collapse: inherit;
          }
          .body-f-footer {
            display: grid;
            grid-template-columns: 1fr 20%;
            }
          </style>
          </head>`);
        }
        else if ((memoItem.organization.address?.country.toLowerCase() == 'hong kong'
          || memoItem.organization.address?.country.toLowerCase() == 'united arab emirates') && memoItem.isOverseas) {
          printStone?.contentWindow?.document.write(`<html><head>
          <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <link rel="stylesheet" type="text/css" href="commonAssets/css/printmemo.css" media="print" />

          <style>
          .chal-head {
              display: flex;
              justify-content: space-between;
            }

              .body-f-mid table {
                  width: 100%;
              }
          </style>
            
          </head>`);
        }
        else {
          printStone?.contentWindow?.document.write(`<html><head>
          <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <link rel="stylesheet" type="text/css" href="commonAssets/css/printmemo.css" media="print" />
          </head>`);
        }

        let printContents: string;
        printContents = isAboveOneCarat ? await this.printMemoFormat.getAbovePointFiveCentMemoPrint(memoItem) : await this.printMemoFormat.getMemoPrint(memoItem);
        //console.log("", printContents);
        printStone?.contentWindow?.document.write(printContents);
        printStone?.contentWindow?.document.close();
      }
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async exportToExcel() {
    this.excelFile = [];
    this.aboveOneCaratExcelFile = [];
    this.belowOneCaratExcelFile = [];

    if (!this.memoObj) {
      this.alertDialogService.show('Select at least one Memo!');
      return;
    }

    this.spinnerService.show();
    let exportData: InventoryItems[] = [];
    exportData = this.memoObj.inventoryItems;
    this.boUtilityService.orderByStoneIdInventoryItems(exportData);

    if (!exportData || exportData.length == 0) {
      this.alertDialogService.show('No Data Found!');
      this.spinnerService.hide();
      return;
    }

    const belowPointFiveCentData = exportData.filter((res) => res.weight <= 0.49);
    const abovePointFiveCentData = exportData.filter((res) => res.weight > 0.49);

    if (this.excelOption === 'aboveFiveCentCarat') {
      if (belowPointFiveCentData.length > 0) {
        belowPointFiveCentData.forEach((element, index) => {
          const excel = this.convertArrayToObjectExcel(memoExportExcelFormat, element, index + 1);
          this.belowOneCaratExcelFile.push(excel);
        });
        this.utilityService.exportAsExcelFile(this.belowOneCaratExcelFile, "Memo_Excel_Below_Five_Cent");
      }

      if (abovePointFiveCentData.length > 0) {
        abovePointFiveCentData.forEach((element, index) => {
          const excel = this.convertArrayToObjectExcel(memoExportExcelFormat, element, index + 1);
          this.aboveOneCaratExcelFile.push(excel);
        });
        this.utilityService.exportAsExcelFile(this.aboveOneCaratExcelFile, "Memo_Excel_Above_Five_Cent");
      }
    } else {
      exportData.forEach((element, index) => {
        const excel = this.convertArrayToObjectExcel(memoExportExcelFormat, element, index + 1);
        this.excelFile.push(excel);
      });

      if (this.excelFile.length > 0) {
        this.utilityService.exportAsExcelFile(this.excelFile, "Memo_Excel");
      }
    }
    this.spinnerService.hide();
  }

  public convertArrayToObjectExcel(fields: Array<{ text: string, value: string }>, element: any, index: number): any {

    var obj: any = {};
    for (let i = 0; i < fields.length; i++) {
      if (fields[i].value.includes("measurement")) {
        let propertyname = fields[i].value.split(".")[1];
        if (fields[i].text == "WIDTH")
          obj[fields[i].text] = element.measurement[propertyname] + ' - ' + element.measurement.length;
        else
          obj[fields[i].text] = element.measurement[propertyname];
      }
      else if (fields[i].value.includes("inclusion")) {
        let propertyname = fields[i].value.split(".")[1];
        obj[fields[i].text] = element.inclusion[propertyname];
      }
      else if (fields[i].value.includes("basePrice")) {
        let propertyname = fields[i].value.split(".")[1];
        obj[fields[i].text] = element.basePrice[propertyname];
      }
      else if (fields[i].value.includes("price")) {
        let propertyname = fields[i].value.split(".")[1];
        obj[fields[i].text] = element.price[propertyname];
      }
      else if (fields[i].value.includes("memoStatus"))
        obj[fields[i].text] = element.isMemo ? "Issue" : "Recieve";
      else if (fields[i].text == "NO")
        obj[fields[i].text] = index;
      else
        obj[fields[i].text] = element[fields[i].value];
    }
    return obj;
  }

  //Toggle excel selection options
  public onExcelToggle(): void {
    this.showExcelOption = !this.showExcelOption;
  }


}

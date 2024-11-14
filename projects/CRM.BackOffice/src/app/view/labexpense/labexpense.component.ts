import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { DataResult, GroupDescriptor, SortDescriptor, process } from '@progress/kendo-data-query';
import { NgxSpinnerService } from 'ngx-spinner';
import { GridDetailConfig } from 'shared/businessobjects';
import { fxCredential, GridConfig, GridMasterConfig, MasterConfig } from 'shared/enitites';
import { ConfigService, listCurrencyType, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import * as xlsx from 'xlsx';
import { CommonResponse, Lab, LabExpense, LabexpenseSearchCriteria, LabexpenseSearchResponse } from '../../businessobjects';
import { CurrencyConfig } from '../../entities';
import { AccountingconfigService, GridPropertiesService, LabService } from '../../services';
@Component({
  selector: 'app-labexpense',
  templateUrl: './labexpense.component.html',
  styleUrls: ['./labexpense.component.css']
})

export class LabexpenseComponent implements OnInit {
  @ViewChild("gridContext") private gridContext: any;

  public pageSize = 26;
  public skip = 0
  public fields!: GridDetailConfig[];
  public fieldsDet!: GridDetailConfig[];
  public fieldsInvoice!: GridDetailConfig[];
  public gridView!: DataResult;
  public gridDetailView!: DataResult;
  public gridViewInvoice!: DataResult;
  public isRegOrganization: boolean = false;
  public filterFlag = true;
  public selectableSettings: SelectableSettings = { mode: 'single', };
  public skeletonArray = new Array(18);
  public sort!: SortDescriptor[];
  public groups: GroupDescriptor[] = [];
  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains',
  };
  public labExpense: LabExpense = new LabExpense();
  public labExpenseItems: LabExpense[] = [];
  public labExpenseDetItems: LabExpense[] = [];
  public selectedExpenseItem: LabExpense[] = [];
  public InsertlabExcelItems: LabExpense[] = [];
  public labexpenseSearchCriteria: LabexpenseSearchCriteria = new LabexpenseSearchCriteria();
  public stoneId?: string = '';
  public certificateNo?: string = '';
  public isGridConfig: boolean = false;
  public gridConfig!: GridConfig;
  public gridMasterConfigResponse!: GridMasterConfig;
  public isGridConfigDet: boolean = false;
  public gridConfigDet!: GridConfig;
  public gridMasterConfigResponseDet!: GridMasterConfig;
  public isGridConfigInvoice: boolean = false;
  public gridConfigInvoice!: GridConfig;
  public gridMasterConfigResponseInvoice!: GridMasterConfig;
  public isSearchFilter: boolean = false;
  public masterConfigList!: MasterConfig;
  public fxCredentials?: fxCredential;
  public InvoiceSummary: boolean = false;
  public isShowCheckBoxAll: boolean = true;
  public organizationId!: string;
  public listCurrencyConfig: CurrencyConfig[] = [];
  public listInvoiceCurrencyType: Array<{ text: string; value: string }> = [];
  public selectedLabItems?: { text: string, value: string };
  public listLabItems: Array<{ text: string; value: string }> = [];
  public labItems: Lab[] = [];
  public totalInvRecords = 0;
  public totalInvStones = 0;
  public totalInvLabFee = 0;
  public totalInvHandCharge = 0;
  public totalShipCharge = 0;
  public totalInvTaxAmt = 0;
  public totalInvExpense = 0;
  public totalInv = 0;
  public isDetails: boolean = false;
  public clickedRowItem: LabExpense = new LabExpense;
  public selectedFromCurrency: string = "";
  public selectedToCurrency: string = "";

  public isViewButtons: boolean = false;

  constructor(
    private labService: LabService,
    private router: Router,
    private gridPropertiesService: GridPropertiesService,
    public utilityService: UtilityService,
    private alertDialogService: AlertdialogService,
    private spinnerService: NgxSpinnerService,
    private configService: ConfigService,
    private accountingconfigService: AccountingconfigService
  ) { }

  //#region Init Data
  async ngOnInit() {
    await this.defaultMethodsLoad();
  }

  public async defaultMethodsLoad() {
    this.fxCredentials = JSON.parse(sessionStorage.getItem("fxCredentials") ?? '') as fxCredential;
    this.organizationId = this.fxCredentials.organizationId;
    if (!this.fxCredentials)
      this.router.navigate(["login"]);

    if (this.fxCredentials && this.fxCredentials.origin && (this.fxCredentials.origin.toLowerCase() == 'admin' || this.fxCredentials.origin.toLowerCase() == 'opmanager'))
      this.isViewButtons = true;

    await this.getGridConfiguration();
    await this.getGridConfigurationDet();
    await this.getGridConfigurationInvoice();

    this.utilityService.filterToggleSubject.subscribe(flag => {
      this.filterFlag = flag;
    });

    Object.values(listCurrencyType).forEach(z => { this.listInvoiceCurrencyType.push({ text: z.toString(), value: z.toString() }); });
    this.listCurrencyConfig = await this.accountingconfigService.getCurrencyConfigsList();
    this.labItems = await this.labService.getAllLabs();
    this.listLabItems = [];
    this.labItems.forEach(z => { this.listLabItems.push({ text: z.name, value: z.name }); });
  }
  //#endregion

  //#region Grid Config
  public async getGridConfiguration() {
    try {
      this.gridConfig = await this.configService.getGridConfig(this.fxCredentials?.id ?? '', "Labexpense", "LabexpenseGrid", this.gridPropertiesService.getLabexpenseItems());
      if (this.gridConfig && this.gridConfig.id != '') {
        let dbObj: GridDetailConfig[] = this.gridConfig.gridDetail;
        if (dbObj && dbObj.some(c => c.isSelected)) {
          this.fields = dbObj;
          this.fields.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        }
        else
          this.fields.forEach(c => c.isSelected = true);
      }
      else {
        this.gridMasterConfigResponse = await this.configService.getMasterGridConfig("Labexpense", "LabexpenseGrid");
        if (this.gridMasterConfigResponse)
          this.fields = this.gridMasterConfigResponse.gridDetail;
        else
          this.fields = await this.gridPropertiesService.getLabexpenseItems();
      }
    } catch (error: any) {
      this.alertDialogService.show(error.error)
      this.spinnerService.hide();
    }
  }

  public groupChange(groups: GroupDescriptor[]): void {
    try {
      this.groups = groups;
      this.load();
    }
    catch (error: any) {
      this.alertDialogService.show(error.error)
    }
  }

  public pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.load();
  }

  public filterPartToggle() {
    this.utilityService.setfilterToggleValue(this.filterFlag);
  }

  public openGridConfigDialog(): void {
    this.isGridConfig = true;
  }

  public onSelect(event: any): void {
    try {
      if (event.selectedRows && event.selectedRows.length > 0) {
        event.selectedRows.forEach((element: any) => {
          let Selectedindex = this.selectedExpenseItem.findIndex(x => x.stoneId == element.dataItem.stoneId);
          if (Selectedindex < 0) {
            this.selectedExpenseItem.push(element.dataItem)
            this.clickedRowItem = new LabExpense;
            this.clickedRowItem = element.dataItem;
          }
        });
      }
      else {
        event.deselectedRows.forEach((element: any) => {
          if (!element.dataItem.isDisabled) {
            let index = this.selectedExpenseItem.findIndex(x => x.stoneId == element.dataItem.stoneId);
            if (index >= 0)
              this.selectedExpenseItem.splice(index, 1)
          }
        });
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public cellClickHandler(e: any) {
    this.selectedExpenseItem = [];
    this.selectedExpenseItem.push(e.dataItem)
    this.clickedRowItem = new LabExpense;
    this.clickedRowItem = e.dataItem;
  }

  public async setNewGridConfig(gridConfig: GridConfig) {
    if (gridConfig) {
      this.fields = gridConfig.gridDetail;
      this.gridConfig = new GridConfig();
      this.gridConfig.id = gridConfig.id
      this.gridConfig.gridDetail = gridConfig.gridDetail;
      this.gridConfig.gridName = gridConfig.gridName;
      this.gridConfig.pageName = gridConfig.pageName;
      this.gridConfig.empID = gridConfig.empID;
    }
  }

  public async getGridConfigurationInvoice() {
    try {
      this.gridConfigInvoice = await this.configService.getGridConfig(this.fxCredentials?.id ?? '', "Labinvoice", "LabinvoiceGrid", this.gridPropertiesService.getLabinvoiceItems());
      if (this.gridConfigInvoice && this.gridConfigInvoice.id != '') {
        let dbObj: GridDetailConfig[] = this.gridConfigInvoice.gridDetail;
        if (dbObj && dbObj.some(c => c.isSelected)) {
          this.fieldsInvoice = dbObj;
          this.fieldsInvoice.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        }
        else
          this.fieldsInvoice.forEach(c => c.isSelected = true);
      }
      else {
        this.gridMasterConfigResponseInvoice = await this.configService.getMasterGridConfig("Labinvoice", "LabinvoiceGrid");
        if (this.gridMasterConfigResponseInvoice)
          this.fieldsInvoice = this.gridMasterConfigResponseInvoice.gridDetail;
        else
          this.fieldsInvoice = await this.gridPropertiesService.getLabinvoiceItems();
      }
    } catch (error: any) {
      this.alertDialogService.show(error.error)
      this.spinnerService.hide();
    }
  }

  public openGridConfigDialogInvoice(): void {
    this.isGridConfigInvoice = true;
  }

  public async setNewGridConfigDet(gridConfigDet: GridConfig) {
    if (gridConfigDet) {
      this.fieldsDet = gridConfigDet.gridDetail;
      this.gridConfigDet = new GridConfig();
      this.gridConfigDet.id = gridConfigDet.id
      this.gridConfigDet.gridDetail = gridConfigDet.gridDetail;
      this.gridConfigDet.gridName = gridConfigDet.gridName;
      this.gridConfigDet.pageName = gridConfigDet.pageName;
      this.gridConfigDet.empID = gridConfigDet.empID;
    }
  }

  public async setNewGridConfigInvoice(gridConfigInvoice: GridConfig) {
    if (gridConfigInvoice) {
      this.fieldsInvoice = gridConfigInvoice.gridDetail;
      this.gridConfigInvoice = new GridConfig();
      this.gridConfigInvoice.id = gridConfigInvoice.id
      this.gridConfigInvoice.gridDetail = gridConfigInvoice.gridDetail;
      this.gridConfigInvoice.gridName = gridConfigInvoice.gridName;
      this.gridConfigInvoice.pageName = gridConfigInvoice.pageName;
      this.gridConfigInvoice.empID = gridConfigInvoice.empID;
    }
  }

  public async getGridConfigurationDet() {
    try {
      this.gridConfigDet = await this.configService.getGridConfig(this.fxCredentials?.id ?? '', "LabExpenseDet", "LabExpenseDetGrid", this.gridPropertiesService.getLabExpenseDetItems());
      if (this.gridConfigDet && this.gridConfigDet.id != '') {
        let dbObj: GridDetailConfig[] = this.gridConfigDet.gridDetail;
        if (dbObj && dbObj.some(c => c.isSelected)) {
          this.fieldsDet = dbObj;
          this.fieldsDet.sort((n1, n2) => n1.sortOrder - n2.sortOrder);
        }
        else
          this.fieldsDet.forEach(c => c.isSelected = true);
      }
      else {
        this.gridMasterConfigResponseDet = await this.configService.getMasterGridConfig("LabExpenseDet", "LabExpenseDetGrid");
        if (this.gridMasterConfigResponseDet)
          this.fieldsDet = this.gridMasterConfigResponseDet.gridDetail;
        else
          this.fieldsDet = await this.gridPropertiesService.getLabExpenseDetItems();
      }
    } catch (error: any) {
      this.alertDialogService.show(error.error)
      this.spinnerService.hide();
    }
  }
  //#endregion

  //#region Search Filter Data
  public async load() {
    try {
      this.labexpenseSearchCriteria.stoneIds = this.stoneId ? this.utilityService.CheckStoneIds(this.stoneId).map(x => x.toUpperCase()) : []; 
      this.labexpenseSearchCriteria.certificateNos = this.certificateNo ? this.utilityService.checkCertificateIds(this.certificateNo) : [];

      let res: LabexpenseSearchResponse = await this.labService.getLabExpense(this.labexpenseSearchCriteria, this.skip, this.pageSize);
      if (res) {
        this.labExpenseItems = res.labExpense;
        this.labExpenseItems.forEach(z => {
          z.invoiceAmount = z.labFees + z.handlingCharge + z.taxAmount;
          z.labName = z.lab.name;
        });
        this.gridView = process(this.labExpenseItems, { group: this.groups });
        this.gridView.total = res.totalCount;
      }
    }
    catch (error: any) {
      this.alertDialogService.show(error.error)
      this.spinnerService.hide();
    }
  }

  public clearFilter(form: NgForm) {
    form.reset();
    this.stoneId = '';
    this.certificateNo = '';
    this.labexpenseSearchCriteria = new LabexpenseSearchCriteria();
    this.load();
  }

  public openSearchDialog(): void {
    this.isSearchFilter = true;
  }

  public closeSearchDialog(): void {
    this.isSearchFilter = false;
  }

  public filterBySearch(): void {
    this.skip = 0;
    this.load();
    this.isSearchFilter = false;
  }

  public clearSearchCriteria(): void {
    this.stoneId = '';
    this.certificateNo = '';
    this.labexpenseSearchCriteria = new LabexpenseSearchCriteria();
  }
  //#endregion

  //#region Save
  public async onInvSubmit(form: NgForm) {
    try {
      if (form.valid) {
        this.spinnerService.show();

        this.InsertlabExcelItems.forEach(element => {
          element.identity.id = this.fxCredentials?.id ?? '';
          element.identity.name = this.fxCredentials?.fullName ?? '';
          element.identity.type = 'Employee' ?? '';
        });

        let response: CommonResponse = new CommonResponse();
        let messageType: string = "";
        messageType = "Inserted";

        response = await this.labService.labInvoiceExpenseInsert(this.InsertlabExcelItems);

        if (response && response.isSuccess) {
          this.utilityService.showNotification(`You have been ${messageType} successfully!`);
          this.InvoiceSummary = false;
          form.reset();
          this.stoneId = '';
          this.certificateNo = '';
          this.labexpenseSearchCriteria = new LabexpenseSearchCriteria();
          this.load();
        }
        else
          this.alertDialogService.show(`Data insert fail, Try again later!`);

        this.spinnerService.hide();
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }
  //#endregion

  //#region Invoice Dialog
  public openInvoiceDialog(): void {
    this.InvoiceSummary = true;
  }

  public closeInvoiceDialog(): void {
    this.InvoiceSummary = false;
    this.InsertlabExcelItems = [];
    this.labExpense = new LabExpense();
    this.totalInvRecords = 0;
    this.totalInvStones = 0;
    this.totalInvLabFee = 0;
    this.totalInvHandCharge = 0;
    this.totalShipCharge = 0;
    this.totalInvTaxAmt = 0;
    this.totalInvExpense = 0;
    this.totalInv = 0;
  }
  //#endregion

  //#region Excel Upload
  public async onSelectExcelFile(event: Event) {
    try {
      this.totalInvStones = 0;
      this.totalInvRecords = 0;
      this.totalInvLabFee = 0;
      this.totalInvHandCharge = 0;
      this.totalShipCharge = 0;
      this.totalInvTaxAmt = 0;
      this.totalInvExpense = 0;
      this.totalInv = 0;

      if (this.selectedLabItems && this.labExpense.invoiceDate && this.selectedFromCurrency && this.labExpense.toCurrency) {
        let acceptedFiles: string[] = []
        const target = event.target as HTMLInputElement;
        if (target.accept) {
          acceptedFiles = target.accept.split(',').map(function (item) {
            return item.trim();
          });
        }

        if (target.files && target.files.length) {
          if (acceptedFiles.indexOf(target.files[0].type) > -1) {

            let file = target.files[0];
            let fileReader = new FileReader();
            this.InsertlabExcelItems = [];
            this.spinnerService.show();
            fileReader.onload = async (e) => {

              var arrayBuffer: any = fileReader.result;
              let data = new Uint8Array(arrayBuffer);
              let arr = new Array();

              for (let i = 0; i != data.length; ++i)
                arr[i] = String.fromCharCode(data[i]);

              let workbook = xlsx.read(arr.join(""), { type: "binary" });
              var fetchExcelItems = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]) as any;

              if (fetchExcelItems && fetchExcelItems.length > 0) {

                this.InsertlabExcelItems = new Array<any>();
                let tempHandlingCharge = 0;
                let tempShipCharge = 0;
                let tempService = "";
                let tempShipTaxCharge = "";

                for (let j = 0; j < fetchExcelItems.length; j++) {

                  Object.keys(fetchExcelItems[j]).map(key => {
                    if (key.toLowerCase().trim() != key) {
                      fetchExcelItems[j][key.toLowerCase().trim()] = fetchExcelItems[j][key];
                      delete fetchExcelItems[j][key];
                    }
                  });

                  tempService = fetchExcelItems[j]["service descr"]?.toString().trim();
                  if (tempService == null || tempService == undefined)
                    tempService = fetchExcelItems[j]["service_desc"]?.toString().trim();

                  if (tempService == "Handling Charge - BKK - HANDLING CHARGES" ||
                    tempService == "Handling Charge - MB - HANDLING CHARGES" ||
                    tempService == "Handling Charge - JP - HANDLING CHARGES" ||
                    tempService == "Handling Charge - CB - HANDLING CHARGES" ||
                    tempService == "Handling Charge - HK - HANDLING CHARGES"
                  ) {
                    tempHandlingCharge = parseFloat(fetchExcelItems[j]["fee"]?.toString().trim());

                    let tempTextHandlingCharge = "";
                    tempTextHandlingCharge = fetchExcelItems[j]["consumption tax"]?.toString().trim();
                    if (tempTextHandlingCharge != null || tempTextHandlingCharge != undefined)
                      tempHandlingCharge += parseFloat(tempTextHandlingCharge)

                    tempTextHandlingCharge = fetchExcelItems[j]["vat"]?.toString().trim();
                    if (tempTextHandlingCharge != null || tempTextHandlingCharge != undefined)
                      tempHandlingCharge += parseFloat(tempTextHandlingCharge)

                    tempTextHandlingCharge = fetchExcelItems[j]["3% tax withholding"]?.toString().trim();
                    if (tempTextHandlingCharge != null || tempTextHandlingCharge != undefined)
                      tempHandlingCharge += parseFloat(tempTextHandlingCharge)

                    tempTextHandlingCharge = fetchExcelItems[j]["cgst"]?.toString().trim();
                    if (tempTextHandlingCharge != null || tempTextHandlingCharge != undefined)
                      tempHandlingCharge += parseFloat(tempTextHandlingCharge)

                    tempTextHandlingCharge = fetchExcelItems[j]["sgst"]?.toString().trim();
                    if (tempTextHandlingCharge != null || tempTextHandlingCharge != undefined)
                      tempHandlingCharge += parseFloat(tempTextHandlingCharge)

                    tempTextHandlingCharge = fetchExcelItems[j]["igst"]?.toString().trim();
                    if (tempTextHandlingCharge != null || tempTextHandlingCharge != undefined)
                      tempHandlingCharge += parseFloat(tempTextHandlingCharge)
                  }

                  let ship = parseFloat(fetchExcelItems[j]["ship"]?.toString().trim());
                  if (ship > 0)
                    tempShipCharge = ship;
                  else
                    tempShipCharge = 0;
                }

                for (let j = 0; j < fetchExcelItems.length; j++) {
                  Object.keys(fetchExcelItems[j]).map(key => {
                    if (key.toLowerCase().trim() != key) {
                      fetchExcelItems[j][key.toLowerCase().trim()] = fetchExcelItems[j][key];
                      delete fetchExcelItems[j][key];
                    }
                  });

                  let newLabExpense: LabExpense = new LabExpense();

                  tempService = fetchExcelItems[j]["service descr"]?.toString().trim();
                  if (tempService == null || tempService == undefined)
                    tempService = fetchExcelItems[j]["service_desc"]?.toString().trim();

                  let tempInvoiceNo = "";
                  tempInvoiceNo = fetchExcelItems[j]["invoice no".toLowerCase()]?.toString().trim();
                  if (tempInvoiceNo == null || tempInvoiceNo == undefined)
                    tempInvoiceNo = fetchExcelItems[j]["invoice_no".toLowerCase()]?.toString().trim();

                  if (tempInvoiceNo == null || tempInvoiceNo == undefined)
                    break;

                  newLabExpense.invoiceNo = tempInvoiceNo;

                  let labObj = new Lab();
                  let Selectedindex = this.labItems.findIndex(x => x.name == this.selectedLabItems?.value);
                  if (Selectedindex >= 0) {
                    labObj = this.labItems[Selectedindex]
                    newLabExpense.lab.id = labObj.id;
                    newLabExpense.lab.email = labObj.email;
                    newLabExpense.lab.mobileNo = labObj.mobileNo;
                    newLabExpense.lab.name = labObj.name;
                    newLabExpense.lab.phoneNo = labObj.phoneNo;
                    newLabExpense.lab.execFormat = labObj.excFormat;
                    newLabExpense.lab.address = labObj.address;
                    newLabExpense.lab.accountNo = labObj.accountNo;
                  }

                  newLabExpense.service = tempService;

                  newLabExpense.jobNo = fetchExcelItems[j]["job no"]?.toString().trim();
                  if (newLabExpense.jobNo == null || newLabExpense.jobNo == undefined)
                    newLabExpense.jobNo = fetchExcelItems[j]["job_no"]?.toString().trim();

                  newLabExpense.controlNo = fetchExcelItems[j]["control no"]?.toString().trim();
                  if (newLabExpense.controlNo == null || newLabExpense.controlNo == undefined)
                    newLabExpense.controlNo = fetchExcelItems[j]["control_no"]?.toString().trim();

                  newLabExpense.fromCurrency = this.labExpense.fromCurrency;
                  newLabExpense.fromRate = this.labExpense.fromRate;
                  newLabExpense.toCurrency = this.labExpense.toCurrency;
                  newLabExpense.toRate = this.labExpense.toRate;

                  newLabExpense.invoiceDate = this.labExpense.invoiceDate;

                  let stoneIdData = fetchExcelItems[j]["item_descr".toLowerCase()]?.toString().trim();
                  if (stoneIdData == null || stoneIdData == undefined)
                    stoneIdData = fetchExcelItems[j]["item_desc".toLowerCase()]?.toString().trim();

                  if (stoneIdData != null || stoneIdData != undefined) {
                    let stoneIdArray = stoneIdData.split("/");
                    if (stoneIdArray.length > 2) {
                      newLabExpense.certificateNo = stoneIdArray[0].trim();
                      newLabExpense.stoneId = stoneIdArray[2].trim();
                    }
                  }
                  newLabExpense.labFees = parseFloat(fetchExcelItems[j]["fee"]?.toString().trim());

                  let tship = parseFloat(fetchExcelItems[j]["ship"]?.toString().trim());
                  if (tship > 0)
                    newLabExpense.shippingCharge = tship;
                  else
                    newLabExpense.shippingCharge = 0;

                  newLabExpense.taxAmount = 0;

                  let tempTextAmt = "";
                  tempTextAmt = fetchExcelItems[j]["consumption tax"]?.toString().trim();
                  if (tempTextAmt != null || tempTextAmt != undefined)
                    newLabExpense.taxAmount += parseFloat(tempTextAmt)

                  tempTextAmt = fetchExcelItems[j]["vat"]?.toString().trim();
                  if (tempTextAmt != null || tempTextAmt != undefined)
                    newLabExpense.taxAmount += parseFloat(tempTextAmt);

                  tempTextAmt = fetchExcelItems[j]["3% tax withholding"]?.toString().trim();
                  if (tempTextAmt != null || tempTextAmt != undefined)
                    newLabExpense.taxAmount += parseFloat(tempTextAmt)

                  tempTextAmt = fetchExcelItems[j]["cgst"]?.toString().trim();
                  if (tempTextAmt != null || tempTextAmt != undefined)
                    newLabExpense.taxAmount += parseFloat(tempTextAmt)

                  tempTextAmt = fetchExcelItems[j]["sgst"]?.toString().trim();
                  if (tempTextAmt != null || tempTextAmt != undefined)
                    newLabExpense.taxAmount += parseFloat(tempTextAmt)

                  tempTextAmt = fetchExcelItems[j]["igst"]?.toString().trim();
                  if (tempTextAmt != null || tempTextAmt != undefined)
                    newLabExpense.taxAmount += parseFloat(tempTextAmt)

                  this.InsertlabExcelItems.push(newLabExpense);
                }

                const uniqueData = [...new Set(this.InsertlabExcelItems.map(item => item.stoneId))];
                this.totalInvStones = uniqueData.length;

                let stoneid = '';
                this.InsertlabExcelItems.forEach(element => {
                  if (stoneid != element.stoneId) {
                    element.handlingCharge = this.utilityService.ConvertToFloatWithDecimal(parseFloat((tempHandlingCharge / uniqueData.length)?.toString().trim()));
                    stoneid = element.stoneId;
                  }
                  else
                    element.handlingCharge = 0;
                });

                this.InsertlabExcelItems.forEach(element => {
                  element.totalExpense = this.utilityService.ConvertToFloatWithDecimal((element.labFees + element.taxAmount + element.handlingCharge + element.shippingCharge) / element.toRate);
                });

                this.InsertlabExcelItems.forEach(element => {
                  this.totalInvRecords += 1;
                  this.totalInvLabFee += element.labFees;
                  this.totalInvHandCharge += element.handlingCharge;
                  this.totalShipCharge += element.shippingCharge;
                  this.totalInvTaxAmt += element.taxAmount;
                  this.totalInvExpense += element.totalExpense;
                  this.totalInv += element.labFees + element.handlingCharge + element.shippingCharge + element.taxAmount;
                });
                this.spinnerService.hide();
              }
            }
            fileReader.readAsArrayBuffer(file);
          }
          else
            this.alertDialogService.show(`Please select only CSV XLSX XLS file.`);
        }
      }
      else
        this.alertDialogService.show(`Please select Lab - Invoice Date - Currency Type - Currency Rate .`);
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error)
    }
  }
  //#endregion

  //#region Detail Dialog
  public async openDetailsDialog() {
    if (this.clickedRowItem != null && this.clickedRowItem.id) {

      this.stoneId = '';
      this.certificateNo = '';
      this.labexpenseSearchCriteria = new LabexpenseSearchCriteria();
      this.labexpenseSearchCriteria.invoiceNo = this.clickedRowItem.invoiceNo;

      let res: LabexpenseSearchResponse = await this.labService.getLabExpenseAll(this.labexpenseSearchCriteria);

      if (res) {
        this.labExpenseDetItems = res.labExpense;

        this.labExpenseDetItems.forEach(z => {
          z.invoiceAmount = z.labFees + z.handlingCharge + z.taxAmount;
          z.labName = z.lab.name;
        });

        this.gridDetailView = process(this.labExpenseDetItems, { group: this.groups });
        this.gridDetailView.total = res.totalCount;

        this.labExpenseDetItems.forEach(element => {
          this.totalInvRecords += 1;
          this.totalInvLabFee += element.labFees;
          this.totalInvHandCharge += element.handlingCharge;
          this.totalShipCharge += element.shippingCharge;
          this.totalInvTaxAmt += element.taxAmount;
          this.totalInvExpense += element.totalExpense;
          this.totalInv += element.labFees + element.handlingCharge + element.shippingCharge + element.taxAmount;
        });

        const uniqueData = [...new Set(this.labExpenseDetItems.map(item => item.stoneId))];
        this.totalInvStones = uniqueData.length;
        this.isDetails = true;
      }
    }
  }

  public closeDetailsDialog(): void {
    this.isDetails = false;
    this.clickedRowItem = new LabExpense;
    this.stoneId = '';
    this.certificateNo = '';
    this.labexpenseSearchCriteria = new LabexpenseSearchCriteria();
    this.labExpenseDetItems = [];
    this.totalInvRecords = 0;
    this.totalInvStones = 0;
    this.totalInvLabFee = 0;
    this.totalInvHandCharge = 0;
    this.totalShipCharge = 0;
    this.totalInvTaxAmt = 0;
    this.totalInvExpense = 0;
    this.totalInv = 0;
  }

  public openGridConfigDialogDet(): void {
    this.isGridConfigDet = true;
  }

  public async labChange(e: any) {
    if (e) {
      let fetch = this.labItems.find(x => x.name == e.text);
      if (fetch) {
        this.labExpense.fromCurrency = listCurrencyType.USD.toString();
        this.selectedFromCurrency = listCurrencyType.USD.toString();
        this.labExpense.toCurrency = fetch.currencyType;
        this.selectedToCurrency = fetch?.currencyType ?? '';
        let res = this.accountingconfigService.getFromToCurrencyRate(listCurrencyType.USD, fetch.currencyType, this.listCurrencyConfig);
        if (res) {
          this.labExpense.fromRate = res.fromRate;
          this.labExpense.toRate = res.toRate;
        }
        else {
          this.alertDialogService.show(`Currency Rate Not Found.`);
        }
      }
    }
  }
  //#endregion
}
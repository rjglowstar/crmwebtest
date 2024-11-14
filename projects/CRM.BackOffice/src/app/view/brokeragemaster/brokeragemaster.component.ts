import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { DataResult, GroupDescriptor, process, SortDescriptor } from '@progress/kendo-data-query';
import { NgxSpinnerService } from 'ngx-spinner';
import { GridDetailConfig } from 'shared/businessobjects';
import { fxCredential, GridConfig, GridMasterConfig } from 'shared/enitites';
import { BrokrageExportFields, ConfigService, TransactionType, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { BrokerageSearchCriteria, BrokerageSearchResult } from '../../businessobjects';
import { Brokerage, LedgerDNorm, Transaction } from '../../entities';
import { BrokerageService, GridPropertiesService, LedgerService } from '../../services';

@Component({
  selector: 'app-brokeragemaster',
  templateUrl: './brokeragemaster.component.html',
  styles: [
  ]
})
export class BrokeragemasterComponent implements OnInit {

  public sort: SortDescriptor[] = [];
  public groups: GroupDescriptor[] = [];
  public selectableSettings: SelectableSettings = { mode: 'multiple' };
  public mySelection: string[] = [];
  public gridView!: DataResult;
  public pageSize = 26;
  public skip = 0
  public fields!: GridDetailConfig[];
  public gridMasterConfigResponse!: GridMasterConfig;
  public isGridConfig: boolean = false;
  public gridConfig!: GridConfig;
  public fxCredentials!: fxCredential;
  public filterFlag = true;
  public brokerageSearchCriteria: BrokerageSearchCriteria = new BrokerageSearchCriteria();
  public isShowCheckBoxAll: boolean = false;
  public listBrokerItems: Array<{ text: string; value: string }> = [];
  public brokerItems: LedgerDNorm[] = [];
  public selectedBroker: string = "";
  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains'
  };
  public isGeneralDialog = false;
  public transactionObj: Transaction = new Transaction();
  public selectedBrokerageItems: Array<Brokerage> = new Array<Brokerage>();


  constructor(private router: Router,
    private alertDialogService: AlertdialogService,
    private spinnerService: NgxSpinnerService,
    public utilityService: UtilityService,
    private gridPropertiesService: GridPropertiesService,
    private configService: ConfigService,
    private brokerageService: BrokerageService,
    private ledgerService: LedgerService
  ) { }

  async ngOnInit() {
    await this.defaultMethodsLoad();
  }

  /* #region DefaultMethod */
  public async defaultMethodsLoad() {
    try {
      this.fxCredentials = JSON.parse(sessionStorage.getItem("fxCredentials") ?? '') as fxCredential;
      if (!this.fxCredentials)
        this.router.navigate(["login"]);

      this.spinnerService.show();
      await this.getGridConfiguration();
      await this.loadBrokerages();
      await this.loadBroker();

      this.utilityService.filterToggleSubject.subscribe(flag => {
        this.filterFlag = flag;
      });
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Something went wrong, Data not load!');
    }
  }

  /* #endregion */

  /* #region Grid methods */
  public async loadBrokerages() {
    try {
      this.spinnerService.show();

      let response: BrokerageSearchResult = await this.brokerageService.getBrokerageByCriteria(this.brokerageSearchCriteria, this.skip, this.pageSize);
      if (response && response.brokerages.length > 0) {
        this.gridView = process(response.brokerages, { group: this.groups, sort: this.sort });
        this.gridView.total = response.totalCount;

        this.spinnerService.hide();
      }
      else {
        this.gridView = process([], { group: this.groups, sort: this.sort });
        this.gridView.total = 0;
        this.spinnerService.hide();
      }
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Data not load, Try gain later!');
    }
  }

  public async groupChange(groups: GroupDescriptor[]): Promise<void> {
    try {
      this.groups = groups;
      await this.loadBrokerages();
    }
    catch (error: any) {
      this.alertDialogService.show(error.error)
    }
  }

  public async sortChange(sort: SortDescriptor[]): Promise<void> {
    this.sort = sort;
    await this.loadBrokerages();
  }

  public async pageChange(event: PageChangeEvent): Promise<void> {
    this.skip = event.skip;
    await this.loadBrokerages();
    await this.loadBroker();
  }

  public selectedRowChange(event: any) {
    if (event.selectedRows.length > 0) {
      for (let index = 0; index < event.selectedRows.length; index++) {
        const element = event.selectedRows[index];
        this.selectedBrokerageItems.push(element.dataItem);
      }

      if (this.selectedBrokerageItems && this.selectedBrokerageItems.length > 0) {
        let existBroker: Brokerage = this.selectedBrokerageItems.find(x => x.id == this.mySelection[0]) ?? new Brokerage();

        if (existBroker && existBroker.brokerId && existBroker.transactionCCType) {
          let isSame = this.selectedBrokerageItems.every(x => x.brokerId == existBroker.brokerId && x.transactionCCType == existBroker.transactionCCType);
          if (!isSame) {
            this.alertDialogService.show('Kindly, select same broker with same Transaction CC Type!', 'warning');
            let selectionIndex = this.mySelection.findIndex(a => a == event.selectedRows[event.selectedRows.length - 1].id);
            this.mySelection.splice(selectionIndex, 1);
            let selectionBrokerIndex = this.selectedBrokerageItems.findIndex(a => a == event.selectedRows[event.selectedRows.length - 1].id);
            this.selectedBrokerageItems.splice(selectionBrokerIndex, 1);
          }
        }
      }

    }

    if (event.deselectedRows.length > 0) {
      for (let indexRmove = 0; indexRmove < event.deselectedRows.length; indexRmove++) {
        const element = event.deselectedRows[indexRmove];
        let indexFind = this.selectedBrokerageItems.findIndex(x => x.id == element.dataItem.id);
        if (indexFind > -1)
          this.selectedBrokerageItems.splice(indexFind, 1);

      }
    }
  }

  /* #endregion */

  /* #region Grid Config */
  public async getGridConfiguration() {
    try {
      this.spinnerService.show();
      this.gridConfig = await this.configService.getGridConfig(this.fxCredentials?.id ?? '', "Brokerage", "BrokerageGrid", this.gridPropertiesService.getBrokerageGrid());
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
        this.gridMasterConfigResponse = await this.configService.getMasterGridConfig("Brokerage", "BrokerageGrid");
        if (this.gridMasterConfigResponse)
          this.fields = this.gridMasterConfigResponse.gridDetail;
        else
          this.fields = await this.gridPropertiesService.getBrokerageGrid();

      }
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.alertDialogService.show(error);
      this.spinnerService.hide();
    }
  }

  public openGridConfigDialog(): void {
    this.isGridConfig = true;
  }

  public setNewGridConfig(gridConfig: GridConfig) {
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
  /* #endregion */

  /* #region Filter Section */
  public async loadBroker() {
    try {
      let ledgerType: string[] = ['Broker']
      let brokers = await this.ledgerService.getAllLedgersByType(ledgerType);
      for (let index = 0; index < brokers.length; index++) {
        const element = brokers[index];
        this.brokerItems.push({
          id: element.id,
          group: element.group.name,
          name: element.name,
          code: element.code,
          contactPerson: element.contactPerson,
          email: element.email,
          mobileNo: element.mobileNo,
          phoneNo: element.phoneNo,
          faxNo: element.faxNo,
          address: element.address,
          idents: element.idents,
          incomeTaxNo: element.incomeTaxNo,
          taxNo: element.taxNo,
        });
      }

      this.listBrokerItems = [];
      this.brokerItems.forEach(z => { this.listBrokerItems.push({ text: z.name, value: z.id }); });
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Broker not load, Try gain later!');
    }
  }

  public handleBrokerFilter(value: any) {
    this.listBrokerItems = [];
    let brokerItems = this.brokerItems.filter(z => z.name.toLowerCase().includes(value.toLowerCase()))
    brokerItems.reverse().forEach(z => { this.listBrokerItems.push({ text: z.name, value: z.id }); });
  }

  public brokerChange(e: any) {
    if (e) {
      let fetchBroker = this.brokerItems.find(x => x.id == e);
      if (fetchBroker) {
        setTimeout(() => {
          this.selectedBroker = fetchBroker?.name ?? '' as any;
        }, 0);
        this.brokerageSearchCriteria.brokerId = fetchBroker.id ?? "";
      }
    }
    else
      this.brokerageSearchCriteria.brokerId = "";
  }

  public async onFilterSubmit() {
    this.skip = 0;
    await this.loadBrokerages();
  }

  public async clearFilter() {
    this.skip = 0;
    this.brokerageSearchCriteria = new BrokerageSearchCriteria();
    this.selectedBrokerageItems = new Array<Brokerage>();
    this.selectedBroker = "";
    this.mySelection = new Array<string>();
    await this.loadBrokerages();
  }

  public filterPartToggle() {
    this.utilityService.setfilterToggleValue(this.filterFlag);
  }

  /* #endregion */

  /* #region General Dialog section */
  public openGeneralDialog(isNew = true): void {

    let hasPaidAmt = this.selectedBrokerageItems.some(x => x.paidAmount > 0);
    if (hasPaidAmt) {
      this.alertDialogService.show("You have selected already paid broker,kindly remove it from selection!");
      return;
    }

    if (isNew)
      this.transactionObj = new Transaction();

    this.transactionObj.transactionType = TransactionType.General.toString();

    if (this.selectedBrokerageItems[0] && this.selectedBrokerageItems[0].id) {
      this.transactionObj.toLedger.id = (this.selectedBrokerageItems[0].brokerId) ?? '';
      this.transactionObj.toLedger.name = (this.selectedBrokerageItems[0].brokerName) ?? '';
      let netTotal = this.selectedBrokerageItems.reduce((acc, cur) => acc + cur.brokerCCAmt, 0);
      this.transactionObj.amount = this.utilityService.ConvertToFloatWithDecimal(netTotal);
      this.transactionObj.transactionDetail.toCurrency = this.selectedBrokerageItems[0].transactionCCType;
    }

    this.isGeneralDialog = true;
  }

  public async closeGeneralDialog() {
    try {
      if (this.mySelection && this.mySelection.length > 0) {
        let updateResponse = await this.brokerageService.updatePaidAmtDate(this.mySelection);
        if (updateResponse) {
          this.selectedBrokerageItems = new Array<Brokerage>();
          this.mySelection = new Array<string>();
          this.isGeneralDialog = false;
          this.loadBrokerages();
        }
        else
          this.alertDialogService.show('Broker Data not updated!');
      }
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Something went wrong updating Broker Data!');
    }
  }

  /* #endregion */

  /* #region Export excel sections */
  public async exportToExcel() {
    this.alertDialogService.ConfirmYesNo(`Are you want to Export Excel?`, "Brokerage").subscribe(async (res: any) => {
      if (res.flag) {
        try {
          this.spinnerService.show();

          let excelFile = [];
          let brokerages: Array<Brokerage> = await this.brokerageService.getBrokerageFiltered(this.brokerageSearchCriteria);
          if (brokerages && brokerages.length > 0) {
            for (let index = 0; index < brokerages.length; index++) {
              let element = brokerages[index]

              var excel = await this.convertBrokerageToObjectExcel(BrokrageExportFields, element);
              excelFile.push(excel);
            }

            if (excelFile.length > 0)
              this.utilityService.exportAsExcelFile(excelFile, "Brokerage_Excel");
          }
          else
            this.alertDialogService.show("Data not found to export!");

          this.spinnerService.hide();
        }
        catch (error: any) {
          console.error(error);
          this.spinnerService.hide();
          this.alertDialogService.show("Something went wrong while exporting excel, contact administrator!");
        }
      }
    })
  }

  public async convertBrokerageToObjectExcel(fields: Array<string>, brokerageItem: Brokerage) {

    var obj: any = {};
    for (let i = 0; i < fields.length; i++) {

      if (brokerageItem) {
        if (fields[i] == "BROKER NAME")
          obj[fields[i]] = brokerageItem?.brokerName;
        if (fields[i] == "BROKER AMOUNT")
          obj[fields[i]] = brokerageItem?.brokerAmt;
        if (fields[i] == "BROKER CCAMOUNT")
          obj[fields[i]] = brokerageItem?.brokerCCAmt;
        if (fields[i] == "BROKERAGE PERCENTAGE")
          obj[fields[i]] = ((brokerageItem?.brokerAmt * 100) / brokerageItem?.transactionAmt).toFixed(2);
        if (fields[i] == "PARTY")
          obj[fields[i]] = brokerageItem?.partyName;
        if (fields[i] == "TRANSACTION NO")
          obj[fields[i]] = brokerageItem?.transactionNumber;
        if (fields[i] == "TRANSACTION AMOUNT")
          obj[fields[i]] = brokerageItem?.transactionAmt;
        if (fields[i] == "TRANSACTION NETAMOUNT")
          obj[fields[i]] = brokerageItem?.transactionNetAmt;
        if (fields[i] == "TRANSACTION CCTYPE")
          obj[fields[i]] = brokerageItem?.transactionCCType;
        if (fields[i] == "TRANSACTION CCRATE")
          obj[fields[i]] = brokerageItem?.transactionCCRate;
        if (fields[i] == "TRANSACTION DATE")
          obj[fields[i]] = ((brokerageItem?.transactionDate) ? this.format(new Date(brokerageItem?.transactionDate)) : "") ?? "";
        if (fields[i] == "RECEIPT NO")
          obj[fields[i]] = brokerageItem?.receiptNumber;
        if (fields[i] == "RECEIPT DATE")
          obj[fields[i]] = ((brokerageItem?.receiptDate) ? this.format(new Date(brokerageItem?.receiptDate)) : "") ?? "";
        if (fields[i] == "PAID AMOUNT")
          obj[fields[i]] = brokerageItem?.paidAmount;
        if (fields[i] == "PAID DATE")
          obj[fields[i]] = ((brokerageItem?.paidDate) ? this.format(new Date(brokerageItem?.paidDate)) : "") ?? "";


      }

    }
    return obj;
  }

  public format(inputDate: Date) {
    let date, month, year;
    date = new Date(inputDate).getDate();
    month = new Date(inputDate).getMonth() + 1;
    year = new Date(inputDate).getFullYear();
    date = date
      .toString()
      .padStart(2, '0');

    month = month
      .toString()
      .padStart(2, '0');
    return `${date}/${month}/${year}`;
  }

  /* #endregion */
}
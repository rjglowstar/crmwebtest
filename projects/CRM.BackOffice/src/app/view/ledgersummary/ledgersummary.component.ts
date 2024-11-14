import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { PageChangeEvent } from '@progress/kendo-angular-grid';
import { DateRangePopupComponent } from '@progress/kendo-angular-dateinputs';
import { DataResult, GroupDescriptor, process } from '@progress/kendo-data-query';
import { NgxSpinnerService } from 'ngx-spinner';
import { GridDetailConfig } from 'shared/businessobjects';
import { fxCredential, GridConfig, GridMasterConfig } from 'shared/enitites';
import { AppPreloadService, ConfigService, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { LedgerSummaryAnalysis, LedgerSummaryReportReq, LedgerSummaryReportRes } from '../../businessobjects';
import { LedgerGroup, LedgerSummary } from '../../entities';
import { AccountingconfigService, GridPropertiesService, LedgerService, LedgerSummaryService } from '../../services';
import { LedgerSummaryCriteria } from '../../businessobjects/accounting/ledgersummarycriteria';

@Component({
  selector: 'app-ledgersummary',
  templateUrl: './ledgersummary.component.html',
  styleUrls: ['./ledgersummary.component.css']
})
export class LedgerSummaryComponent implements OnInit {

  public pageName: string = 'Ledger Summary';
  public isTransctItemMaster: boolean = false;
  public isEditMode: boolean = false;

  public gridView!: DataResult;
  public fields!: GridDetailConfig[];
  public skeletonArray = new Array(18);
  public filterFlag = true;

  public groups: GroupDescriptor[] = [];
  public pageSize = 26;
  public skip = 0;
  public mySelection: string[] = [];

  public isSummary = false;

  public fDate: string = '';
  public tDate: string = '';
  public selectedLG: string = '';

  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains'
  };

  //#region Filter Data
  @ViewChild("anchor") public anchor!: ElementRef<any>;
  @ViewChild("popup", { read: DateRangePopupComponent }) public popup!: DateRangePopupComponent; public showFilterRange = false;

  // Grid Configuration
  public isGridConfig: boolean = false;
  private fxCredential!: fxCredential;
  public gridConfig!: GridConfig;
  public gridMasterConfigResponse!: GridMasterConfig;

  public ledgerSummarySearchCriteria: LedgerSummaryReportReq = new LedgerSummaryReportReq();
  public ledgerSummaryCriteria: LedgerSummaryCriteria = new LedgerSummaryCriteria()
  public ledgerSummaryData: LedgerSummary[] = [];
  public ledgerSummaryRes: LedgerSummaryReportRes = new LedgerSummaryReportRes();

  public listLedgerGroupItems: Array<LedgerGroup> = new Array<LedgerGroup>();

  public isViewButtons: boolean = false;
  public isLedgerSummaryDetail = false;
  public selectedledgerSummaryData: LedgerSummary = new LedgerSummary();
  public ledgerSummaryAnalysisData: LedgerSummaryAnalysis = new LedgerSummaryAnalysis();
  public range = { start: this.ledgerSummaryCriteria.fromDate, end: this.ledgerSummaryCriteria.toDate };

  //#region Custome Pagination Variables
  public detailPageSize = 18;

  public detailSkip = 0;
  public take = this.pageSize;

  public activePage = 1;
  public pageCount: number[] = [];
  public pageCountString = '0 - 0 of 0';
  //#endregion

  constructor(
    private gridPropertiesService: GridPropertiesService,
    private router: Router,
    private alertDialogService: AlertdialogService,
    private spinnerService: NgxSpinnerService,
    private configService: ConfigService,
    private appPreloadService: AppPreloadService,
    public utilityService: UtilityService,
    private ledgerSummaryService: LedgerSummaryService,
    private ledgerService: LedgerService,
    private accountingconfigService: AccountingconfigService,
  ) { }

  async ngOnInit() {
    await this.defaultMethodsLoad();
  }

  //#region Init Data
  public async defaultMethodsLoad() {
    this.fxCredential = await this.appPreloadService.fetchFxCredentials();
    if (!this.fxCredential)
      this.router.navigate(["login"]);

    if (this.fxCredential && this.fxCredential.origin && (this.fxCredential.origin.toLowerCase() == 'admin' || this.fxCredential.origin.toLowerCase() == 'accounts'))
      this.isViewButtons = true;

    this.spinnerService.show();
    await this.getGridConfiguration();
    await this.loadLedgerGroup();
    await this.loadLedgerSummaryReportSummary();
    await this.loadLedgerSummaryReport();
    this.spinnerService.hide();

    this.utilityService.filterToggleSubject.subscribe(flag => {
      this.filterFlag = flag;
    });
  }

  public async getGridConfiguration() {
    try {
      this.gridConfig = await this.configService.getGridConfig(this.fxCredential.id, "LedgerSummary", "LedgerSummaryGrid", this.gridPropertiesService.getLedgerSummaryGrid());
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
        this.gridMasterConfigResponse = await this.configService.getMasterGridConfig("LedgerSummary", "LedgerSummaryGrid");
        if (this.gridMasterConfigResponse)
          this.fields = this.gridMasterConfigResponse.gridDetail;
        else
          this.fields = await this.gridPropertiesService.getLedgerSummaryGrid();
      }
    } catch (error: any) {
      console.error(error);
      this.alertDialogService.show('Grid not load!')
    }
  }

  public async loadLedgerSummaryReportSummary() {
    try {
      this.spinnerService.show();
      if (this.selectedLG)
        this.ledgerSummarySearchCriteria.ledgerGroup.push(this.selectedLG);
      let data = await this.ledgerSummaryService.getLedgerSummaryReportSummary(this.ledgerSummarySearchCriteria);
      if (data) {
        this.ledgerSummaryRes = data;
        this.gridView = process(this.ledgerSummaryData, { group: this.groups });
        this.gridView.total = this.ledgerSummaryRes.totalCount;
      }

    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Ledger Summary not load, Try again later');
    }
  }

  public async loadLedgerSummaryReport() {
    try {
      this.spinnerService.show();
      if (this.selectedLG)
        this.ledgerSummarySearchCriteria.ledgerGroup.push(this.selectedLG);
      let data = await this.ledgerSummaryService.getPaginatedLedgerSummaryReportByCriteria(this.ledgerSummarySearchCriteria, this.skip, this.pageSize);
      if (data) {
        this.ledgerSummaryData = data.summary;
        this.gridView = process(this.ledgerSummaryData, { group: this.groups });
        this.gridView.total = data.totalCount;

        this.spinnerService.hide();
      }
      else
        this.spinnerService.hide();
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Ledger Summary not load, Try again later');
    }
  }

  public pageChange(event: PageChangeEvent): void {
    this.spinnerService.show();
    this.ledgerSummaryData = [];
    this.skip = event.skip;
    this.loadLedgerSummaryReport();
  }

  public async loadLedgerGroup() {
    try {
      this.listLedgerGroupItems = [];
      let listLedgerGroups: LedgerGroup[] = await this.accountingconfigService.getLedgerGroups();
      if (listLedgerGroups.length > 0) {
        listLedgerGroups.forEach((item) => {
          if (item.name)
            this.listLedgerGroupItems.push(item)
        })
      }
    }
    catch (error: any) {
      this.alertDialogService.show(error.error)
    }
  }
  //#endregion

  //#region Dialog Summary
  public openSummary(): void {
    this.isSummary = true;
  }

  public closeSummary(): void {
    this.isSummary = false;
  }
  //#endregion

  //#region Filter section
  public filterPartToggle() {
    this.utilityService.setfilterToggleValue(this.filterFlag);
  }

  public async filterLedgerSummary() {
    await this.loadLedgerSummaryReportSummary();
    await this.loadLedgerSummaryReport();
  }

  public async clearFilter(form: NgForm) {
    form.reset();
    this.ledgerSummarySearchCriteria = new LedgerSummaryReportReq();
    this.selectedLG = undefined as any;
    await this.loadLedgerSummaryReportSummary();
    await this.loadLedgerSummaryReport();
  }

  public dateChangeFunction(e: any, type: string): void {
    if (type == 'from')
      this.ledgerSummarySearchCriteria.fromDate = e ? this.utilityService.setUTCDateFilter(e) : null;
    else
      this.ledgerSummarySearchCriteria.toDate = e ? this.utilityService.setUTCDateFilter(e) : null;
  }
  //#endregion Filter section

  //#region Grid Configuration
  public openGridConfigDialog(): void {
    this.isGridConfig = true;
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
  //#endregion Grid Configuration

  //#region Multiselection 
  public getCommaSapratedString(vals: any[], isAll: boolean = false): string {
    let name = vals.join(',')
    if (!isAll)
      if (name.length > 15)
        name = name.substring(0, 15) + '...';

    return name;
  }

  public onOpenDropdown(list: Array<{ name: string; isChecked: boolean }>, e: boolean, selectedData: string[]): boolean {
    if (selectedData?.length == list.map(z => z.name).length)
      e = true;
    else
      e = false;
    return e;
  }

  public onMultiSelectChange(val: Array<{ id: string, name: string; isChecked: boolean }>, selectedData: string[]): void {

    val.forEach(element => {
      element.isChecked = false;
    });

    if (selectedData && selectedData.length > 0) {

      val.forEach(element => {
        selectedData.forEach((item) => {
          if (element.name.toString().toLowerCase() == item.toString().toLowerCase())
            element.isChecked = true;
        });
      });
    }
  }

  public onLedgerGChanges(selectedValue: string) {
    if (!selectedValue) {
      this.ledgerSummarySearchCriteria.ledgerGroup = new Array<string>();
      this.selectedLG = selectedValue;
    }
  }
  //#endregion

  public async loadLedgerSummary() {
    try {
      this.spinnerService.show();
      this.ledgerSummaryCriteria.ledgerId = this.selectedledgerSummaryData.ledger.id;
      let data = await this.ledgerService.getLedgerSummaryAnalysis(this.ledgerSummaryCriteria, this.detailSkip, this.detailPageSize);
      if (data) {
        this.ledgerSummaryAnalysisData = data;
        this.setPageCount(data.totalRecords);
        this.spinnerService.hide();
      }
      else {
        this.ledgerSummaryAnalysisData = new LedgerSummaryAnalysis();
        this.spinnerService.hide();
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public dateFilterChanges() {
    this.ledgerSummaryCriteria.fromDate = this.utilityService.setUTCDateFilter(this.range.start);
    this.ledgerSummaryCriteria.toDate = this.utilityService.setUTCDateFilter(this.range.end);
  }

  private setPageCount(totalRecords: number) {
    const pageCount = this.getPageCount(totalRecords);
    this.pageCount = this.getArrayOfPage(pageCount);

    let take = this.take > totalRecords ? totalRecords : this.take;
    this.pageCountString = (this.detailSkip + 1).toString() + ' - ' + take + ' of ' + totalRecords;
  }

  private getPageCount(totalRecords: number): number {
    let totalPage = 0;

    if (totalRecords > 0 && this.detailPageSize > 0) {
      const pageCount = totalRecords / this.detailPageSize;
      const roundedPageCount = Math.floor(pageCount);

      totalPage = roundedPageCount < pageCount ? roundedPageCount + 1 : roundedPageCount;
    }

    return totalPage;
  }

  private getArrayOfPage(pageCount: number): number[] {
    const pageArray = [];

    if (pageCount > 0) {
      for (let i = 1; i <= pageCount; i++) {
        pageArray.push(i);
      }
    }

    return pageArray;
  }

  public async openLedgerDetailModal(data: LedgerSummary) {
    this.selectedledgerSummaryData = data;
    this.isLedgerSummaryDetail = true;
    await this.loadLedgerSummary();
  }

  public closeLedgerDetailModal() {
    this.selectedledgerSummaryData = new LedgerSummary();
    this.ledgerSummaryCriteria = new LedgerSummaryCriteria();
    this.isLedgerSummaryDetail = false;
  }

  public async onClickPage(pageNumber: number) {
    if (pageNumber >= 1 && pageNumber <= this.pageCount.length) {
      this.spinnerService.show();

      this.activePage = pageNumber;
      this.detailSkip = (pageNumber - 1) * this.detailPageSize;
      this.take = pageNumber * this.detailPageSize;
      await this.loadLedgerSummary();

      this.spinnerService.hide();
    }
  }

}
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { ExcelExportComponent, ExcelExportData } from '@progress/kendo-angular-excel-export';
import { GridComponent, GroupableSettings } from '@progress/kendo-angular-grid';
import { AggregateDescriptor, DataResult, GroupDescriptor, process } from '@progress/kendo-data-query';
import { NgxSpinnerService } from 'ngx-spinner';
import { GridDetailConfig } from 'shared/businessobjects';
import { fxCredential, GridConfig, GridMasterConfig } from 'shared/enitites';
import { AppPreloadService, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { LedgerSummaryReportReq, LedgerSummaryReportRes } from '../../../businessobjects';
import { LedgerGroup, LedgerSummary } from '../../../entities';
import { AccountingconfigService, GridPropertiesService, LedgerSummaryService } from '../../../services';

@Component({
  selector: 'app-ledgeroutstandingmodal',
  templateUrl: './ledgeroutstandingmodal.component.html',
  styleUrls: ['./ledgeroutstandingmodal.component.css']

})
export class LedgeroutstandingmodalComponent implements OnInit {

  @ViewChild("ledgerAssetsGrid") private ledgerAssetsGrid!: GridComponent;
  @ViewChild("ledgerLiabilitesGrid") private ledgerLiabilitesGrid!: GridComponent;

  @Output() toggle: EventEmitter<boolean> = new EventEmitter();

  public gridAssetsView!: DataResult;
  public gridLiabilityView!: DataResult;
  public fields!: GridDetailConfig[];
  public groups: GroupDescriptor[] = [];
  public groupSettings: GroupableSettings = {
    enabled: false,
    showFooter: true
  }
  // Grid Configuration
  public isGridConfig: boolean = false;
  private fxCredential!: fxCredential;
  public gridConfig!: GridConfig;
  public gridMasterConfigResponse!: GridMasterConfig;
  public ledgerSummarySearchCriteria: LedgerSummaryReportReq = new LedgerSummaryReportReq();
  public ledgerSummaryData: LedgerSummary[] = [];
  public listLedgerGroupNames: Array<{ name: string; isChecked: boolean }> = new Array<{ name: string; isChecked: boolean }>();
  public listLedgerGroupItems: Array<LedgerGroup> = new Array<LedgerGroup>();
  public ledgerSummaryRes: LedgerSummaryReportRes = new LedgerSummaryReportRes();
  public selectedLG: string = '';
  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains'
  };
  public aggregates: AggregateDescriptor[] = [{ field: 'credit', aggregate: 'sum' },
  { field: 'debit', aggregate: 'sum' },
  { field: 'total', aggregate: 'sum' },
  { field: 'credit', aggregate: 'count' },];
  public creditAssetsTotal: number = 0;
  public debitAssetsTotal: number = 0;
  public assetsTotal: number = 0;
  public creditLiabilitesTotal: number = 0;
  public debitLiabilitesTotal: number = 0;
  public liabilitesTotal: number = 0;
  public isCheckedAll = false;
  public gridView!: DataResult;

  constructor(
    private gridPropertiesService: GridPropertiesService,
    private router: Router,
    private alertDialogService: AlertdialogService,
    private spinnerService: NgxSpinnerService,
    private appPreloadService: AppPreloadService,
    public utilityService: UtilityService,
    private ledgerSummaryService: LedgerSummaryService,
    private accountingconfigService: AccountingconfigService,
  ) { }

  async ngOnInit() {
    await this.defaultMethodsLoad();
  }

  public async defaultMethodsLoad() {

    this.fxCredential = await this.appPreloadService.fetchFxCredentials();
    if (!this.fxCredential)
      this.router.navigate(["login"]);

    this.spinnerService.show();
    await this.getGridConfiguration();
    await this.loadLedgerGroup();
    this.spinnerService.hide();

  }

  public async getGridConfiguration() {
    try {

      this.fields = await this.gridPropertiesService.getLedgerOutStandingSummaryGrid();
    } catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Grid not load!')
    }
  }

  public getTitle(field: string) {
    return this.fields.find(f => f.propertyName.toLowerCase() == field.toLowerCase())?.title ?? field;
  }

  public async loadLedgerGroup() {
    try {
      this.listLedgerGroupItems = new Array<LedgerGroup>();
      this.listLedgerGroupNames = new Array<{ name: string; isChecked: boolean }>();
      let listLedgerGroups: LedgerGroup[] = await this.accountingconfigService.getLedgerGroups();
      if (listLedgerGroups.length > 0) {
        listLedgerGroups.forEach((item) => {
          if (item.name) {
            this.listLedgerGroupNames.push({ name: item.name, isChecked: false })
            this.listLedgerGroupItems.push(item)

          }
        })
      }
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show("Something went wrong to load legerGroup!!")
    }
  }

  public async loadLedgerSummaryReportSummary() {
    try {
      this.spinnerService.show();
      if (this.ledgerSummarySearchCriteria.ledgerGroup && this.ledgerSummarySearchCriteria.ledgerGroup.length > 0) {

        let response: LedgerSummaryReportRes = await this.ledgerSummaryService.getLedgerOutStandingReportSummary(this.ledgerSummarySearchCriteria);
        if (response) {
          this.ledgerSummaryRes = response;
          this.clearTotal();
          let assetsNatureSummary = this.ledgerSummaryRes.summary.filter(x => this.listLedgerGroupItems.filter(x => x.nature.toLowerCase() == 'assets').map(a => a.name).includes(x.ledger.group));
          let liabilityNatureSummary = this.ledgerSummaryRes.summary.filter(x => this.listLedgerGroupItems.filter(x => x.nature.toLowerCase() == 'liabilities').map(a => a.name).includes(x.ledger.group));

          this.groups = [{ field: "ledger.group", aggregates: this.aggregates }]

          if (this.groups && this.groups.length > 0) {
            assetsNatureSummary.forEach((_, idx) => {
              this.ledgerAssetsGrid.collapseGroup(idx.toString());
            });

            liabilityNatureSummary.forEach((_, idx) => {
              this.ledgerLiabilitesGrid.collapseGroup(idx.toString());
            });
          }

          if (assetsNatureSummary && assetsNatureSummary.length > 0) {
            this.gridAssetsView = process(assetsNatureSummary, { group: this.groups });

            assetsNatureSummary.forEach(x => { this.creditAssetsTotal += x.credit; this.debitAssetsTotal += x.debit; this.assetsTotal += x.total });
            this.creditAssetsTotal = Number(this.utilityService.ConvertToFloatWithDecimal(this.creditAssetsTotal));
            this.debitAssetsTotal = Number(this.utilityService.ConvertToFloatWithDecimal(this.debitAssetsTotal));
            this.assetsTotal = Number(this.utilityService.ConvertToFloatWithDecimal(this.assetsTotal));

            this.excelAssetsData = this.excelAssetsData.bind(this);

          }
          else
            this.gridAssetsView = undefined as any;

          if (liabilityNatureSummary && liabilityNatureSummary.length > 0) {
            this.gridLiabilityView = process(liabilityNatureSummary, { group: this.groups });

            liabilityNatureSummary.forEach(x => { this.creditLiabilitesTotal += x.credit; this.debitLiabilitesTotal += x.debit; this.liabilitesTotal += x.total });
            this.creditLiabilitesTotal = this.utilityService.ConvertToFloatWithDecimal(this.creditLiabilitesTotal);
            this.debitLiabilitesTotal = this.utilityService.ConvertToFloatWithDecimal(this.debitLiabilitesTotal);
            this.liabilitesTotal = this.utilityService.ConvertToFloatWithDecimal(this.liabilitesTotal);

            this.excelLiabilitesData = this.excelLiabilitesData.bind(this);

          }
          else
            this.gridLiabilityView = undefined as any;
        }
      }
      else {
        this.ledgerSummaryRes = new LedgerSummaryReportRes();
        this.gridLiabilityView = undefined as any;
        this.gridAssetsView = undefined as any;
        this.clearTotal();
      }

      this.spinnerService.hide();

    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Ledger Summary not load, Try again later');
    }
  }

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

      if (val.every(x => x.isChecked))
        this.isCheckedAll = true;
      else
        this.isCheckedAll = false;
    }
    else {
      this.ledgerSummaryRes = new LedgerSummaryReportRes();
      this.gridLiabilityView = undefined as any;
      this.gridAssetsView = undefined as any;
      this.clearTotal();
      this.isCheckedAll = false;
      this.toggleAllText;
    }
  }

  public closeDialog() {
    this.clearTotal();
    this.toggle.emit(false);
  }

  public clearTotal() {
    this.creditAssetsTotal = 0;
    this.debitAssetsTotal = 0;
    this.assetsTotal = 0;

    this.creditLiabilitesTotal = 0;
    this.debitLiabilitesTotal = 0;
    this.liabilitesTotal = 0;
  }

  public excelAssetsData(): ExcelExportData {
    const result: ExcelExportData = {
      data: this.gridAssetsView.data,
      group: this.groups
    };

    return result;
  }

  public excelLiabilitesData(): ExcelExportData {
    const result: ExcelExportData = {
      data: this.gridLiabilityView.data,
      group: this.groups
    };

    return result;
  }

  public get toggleAllText() {
    return this.isCheckedAll ? 'Deselect All' : 'Select All';
  }

  public onSelectAllClick() {
    this.isCheckedAll = !this.isCheckedAll;
    this.listLedgerGroupNames.forEach(x => x.isChecked = this.isCheckedAll);
    if (this.isCheckedAll)
      this.ledgerSummarySearchCriteria.ledgerGroup = this.listLedgerGroupNames.filter(x => x.isChecked == this.isCheckedAll).map(x => x.name);
    else
      this.ledgerSummarySearchCriteria.ledgerGroup = new Array<string>();
    this.onMultiSelectChange(this.listLedgerGroupNames, this.ledgerSummarySearchCriteria.ledgerGroup)
  }

  public exportExcel(): void {
    if (this.gridAssetsView && this.gridAssetsView.data && this.gridAssetsView.data.length > 0)
      this.ledgerAssetsGrid.saveAsExcel();
    if (this.gridLiabilityView && this.gridLiabilityView.data && this.gridLiabilityView.data.length > 0)
      this.ledgerLiabilitesGrid.saveAsExcel();
  }
 
}

import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { DataResult, GroupDescriptor, process } from '@progress/kendo-data-query';
import { NgxSpinnerService } from 'ngx-spinner';
import { GridDetailConfig } from 'shared/businessobjects';
import { fxCredential, GridConfig, GridMasterConfig } from 'shared/enitites';
import { AppPreloadService, ConfigService, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { LabIssueResponse, LabIssueSearchCriteria } from '../../businessobjects';
import { BoUtilityService, GridPropertiesService, InventoryService, LabService } from '../../services';
import { LabIssue } from '../../businessobjects/lab/labIssue';
import { LabIssueItem } from '../../businessobjects/lab/labissueitem';
@Component({
  selector: 'app-labissuemaster',
  templateUrl: './labissuemaster.component.html',
  styles: [
  ]
})
export class LabissuemasterComponent implements OnInit {

  public labIssueSearchCriteria: LabIssueSearchCriteria = new LabIssueSearchCriteria();
  public stoneId: string = '';
  public groups: GroupDescriptor[] = [];
  public pageSize = 26;
  public skip = 0
  public detailPageSize = 20;
  public detailSkip = 0
  public fields!: GridDetailConfig[];
  public detailFields!: GridDetailConfig[];
  public gridView!: DataResult;
  public gridDetailView!: DataResult;
  public isRegOrganization: boolean = false;
  public filterFlag = true;
  public selectableSettings: SelectableSettings = {
    mode: 'single',
  };
  public skeletonArray = new Array(18);
  public mySelection: string[] = [];
  public labIssueItemDetail: LabIssueItem[] = [];
  public isShowCheckBoxAll: boolean = true;
  public isGridConfig: boolean = false;
  private fxCredential!: fxCredential;
  public gridConfig!: GridConfig;
  public gridMasterConfigResponse!: GridMasterConfig;
  public isShowDetails: boolean = false;
  public showDollarOption = false;
  public labIssuesItems: LabIssue[] = [];
  public excelFile: any[] = [];

  public isViewButtons: boolean = false;

  constructor(
    private labService: LabService,
    private router: Router,
    private gridPropertiesService: GridPropertiesService,
    public utilityService: UtilityService,
    private alertDialogService: AlertdialogService,
    private spinnerService: NgxSpinnerService,
    private configService: ConfigService,
    private appPreloadService: AppPreloadService,
    private inventoryService: InventoryService,
    private boUtilityService: BoUtilityService) { }

  async ngOnInit() {
    await this.defaultMethodsLoad();
  }

  public async defaultMethodsLoad() {
    this.fxCredential = await this.appPreloadService.fetchFxCredentials();
    if (!this.fxCredential)
      this.router.navigate(["login"]);

    if (this.fxCredential && this.fxCredential.origin && (this.fxCredential.origin.toLowerCase() == 'admin' || this.fxCredential.origin.toLowerCase() == 'opmanager'))
      this.isViewButtons = true;

    await this.getGridConfiguration();
    await this.loadLabIssues();
    this.utilityService.filterToggleSubject.subscribe(flag => {
      this.filterFlag = flag;
    });
  }

  public async getGridConfiguration() {
    try {
      this.gridConfig = await this.configService.getGridConfig(this.fxCredential.id, "LabIssueMaster", "LabIssueMasterGrid", await this.gridPropertiesService.getLabIssueMasterGrid());
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
        this.gridMasterConfigResponse = await this.configService.getMasterGridConfig("LabIssueMaster", "LabIssueMasterGrid");
        if (this.gridMasterConfigResponse)
          this.fields = this.gridMasterConfigResponse.gridDetail;
        else
          this.fields = await this.gridPropertiesService.getLabIssueMasterGrid();
      }
      this.detailFields = await this.gridPropertiesService.getLabIssueItems();
    } catch (error: any) {
      this.alertDialogService.show(error.error)
      this.spinnerService.hide();
    }
  }

  public async loadLabIssues() {
    try {
      this.labIssueSearchCriteria.stoneIds = this.stoneId ? this.utilityService.CheckStoneIds(this.stoneId).map(x => x.toUpperCase()) : [];
      let labIssues: LabIssueResponse = await this.labService.getLabIssue(this.labIssueSearchCriteria, this.skip, this.pageSize);
      this.labIssuesItems = labIssues.labIssues;
      this.gridView = process(labIssues.labIssues, { group: this.groups });
      this.gridView.total = labIssues.totalCount;
    }
    catch (error: any) {
      this.alertDialogService.show(error.error)
      this.spinnerService.hide();
    }
  }

  public groupChange(groups: GroupDescriptor[]): void {
    try {
      this.groups = groups;
      this.loadLabIssues();
    }
    catch (error: any) {
      this.alertDialogService.show(error.error)
    }
  }

  public async pageChange(event: PageChangeEvent) {
    this.skip = event.skip;
    this.mySelection = [];
    this.loadLabIssues();
  }

  public filterPartToggle() {
    this.utilityService.setfilterToggleValue(this.filterFlag);
  }

  public onFilterSubmit(form: NgForm) {
    this.skip = 0;
    this.loadLabIssues()
  }

  public clearFilter(form: NgForm) {
    form.reset()
    this.labIssueSearchCriteria = new LabIssueSearchCriteria()
    this.stoneId = '';
    this.loadLabIssues();
  }

  public async loadDetailGrid() {
    this.spinnerService.show();
    if (this.mySelection[0]) {
      let findIssue: LabIssue = this.labIssuesItems.find(c => c.id == this.mySelection[0]) ?? new LabIssue;
      this.labIssueItemDetail = findIssue.labIssueItems;
      let filterLabIssueItemDetail = this.labIssueItemDetail.slice(this.detailSkip, this.detailSkip + this.detailPageSize);
      this.boUtilityService.orderByStoneIdLabIssueItems(filterLabIssueItemDetail);
      this.gridDetailView = process(filterLabIssueItemDetail, {});
      this.gridDetailView.total = this.labIssueItemDetail.length;
    }
    this.spinnerService.hide();
  }

  public pageChangeDetail(event: PageChangeEvent): void {
    this.spinnerService.show();
    this.labIssueItemDetail = [];
    this.detailSkip = event.skip;
    this.loadDetailGrid();
  }

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

  public async exportExcelForLab() {
    try {
      if (this.mySelection[0]) {
        this.spinnerService.show();
        let findIssue: LabIssue = this.gridView.data.find(c => c.id == this.mySelection[0]);
        let response = await this.labService.downloadExcel(this.fxCredential.organizationId, findIssue);
        if (response) {
          var downloadURL = window.URL.createObjectURL(response);
          var link = document.createElement('a');
          link.href = downloadURL;
          link.download = `${this.utilityService.exportFileName(this.utilityService.replaceSymbols(findIssue.lab.name))}`;
          link.click();
          this.spinnerService.hide();
          if (findIssue.lab.name.includes("GIA")) {
            this.spinnerService.show();
            await this.exportGiaCsv(findIssue);
          }
        }
        else
          this.spinnerService.hide();
      }
    } catch (error: any) {
      this.alertDialogService.show("something went wrong, please try again or contact administrator");
      this.spinnerService.hide();
    }
  }

  public async exportGiaCsv(findIssue: LabIssue) {
    try {
      let response = await this.labService.exportGiaCsvData(this.fxCredential.organizationId, findIssue);
      if (response) {
        var downloadURL = window.URL.createObjectURL(response);
        var link = document.createElement('a');
        link.href = downloadURL;
        link.download = `${this.utilityService.exportFileName(this.utilityService.replaceSymbols(findIssue.lab.name + "Csv"))}`;
        link.click();
        this.spinnerService.hide();
      }
      else
        this.spinnerService.hide();
    } catch (error: any) {
      this.alertDialogService.show("something went wrong, please try again or contact administrator");
      this.spinnerService.hide();
    }
  }

  public openDetailsDialog() {
    this.isShowDetails = true;
    this.loadDetailGrid();
  }

  public closeDetailsDialog() {
    this.isShowDetails = false;
    this.detailSkip = 0;
  }

  public dblClick() {
    this.isShowDetails = true;
    this.loadDetailGrid();
  }

  public calculateStoneCount(labIssueItem: LabIssueItem[], flag: string): number {
    let stonecount = 0;
    if (flag == 'Receive') {
      var stone = labIssueItem.filter(z => z.receiveDate != null);
      stonecount = stone.length;
    }
    else if (flag == 'Pending') {
      var stone = labIssueItem.filter(z => z.receiveDate == null);
      stonecount = stone.length;
    }
    return stonecount;
  }

}
import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { PageChangeEvent, SelectableSettings } from '@progress/kendo-angular-grid';
import { Align } from '@progress/kendo-angular-popup';
import { DataResult, GroupDescriptor, process } from '@progress/kendo-data-query';
import { NgxSpinnerService } from 'ngx-spinner';
import { GridDetailConfig } from 'shared/businessobjects';
import { fxCredential, GridConfig, GridMasterConfig } from 'shared/enitites';
import { ConfigService, listExportRequestFilterLocation, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { ExportRequestResponse, ExportRequestCriteria } from '../../businessobjects';
import { ExportRequest } from '../../entities';
import { GridPropertiesService, ExportRequestService } from '../../services';

@Component({
  selector: 'app-exportrequest',
  templateUrl: './exportrequest.component.html',
  styleUrls: ['./exportrequest.component.css']
})
export class ExportRequestComponent implements OnInit {

  public groups: GroupDescriptor[] = [];
  public gridView!: DataResult;
  public pageSize = 26;
  public skip = 0
  public fields!: GridDetailConfig[];
  public fxCredentials!: fxCredential;
  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains'
  };
  public gridMasterConfigResponse!: GridMasterConfig;
  public isGridConfig: boolean = false;
  public gridConfig!: GridConfig;

  public showCopyOption = false;
  @ViewChild("anchor") public anchor!: ElementRef;
  @ViewChild("popup", { read: ElementRef }) public popup!: ElementRef;
  public anchorAlign: Align = { horizontal: "right", vertical: "bottom" };
  public popupAlign: Align = { horizontal: "center", vertical: "top" };
  public copyOption: string | null = 'selected';

  public exportrequestSearchCriteriaObj: ExportRequestCriteria = new ExportRequestCriteria();
  public exportrequestResponse: ExportRequestResponse = new ExportRequestResponse();

  public filterFlag = true;
  public stoneId: string = '';
  public certNo: string = '';

  public selectableSettings: SelectableSettings = { mode: 'multiple' };
  public mySelection: any[] = [];

  requestByList: Array<{ name: string; isChecked: boolean }> = [];
  locationList: Array<{ name: string; isChecked: boolean }> = [];

  constructor(
    private router: Router,
    private alertDialogService: AlertdialogService,
    private spinnerService: NgxSpinnerService,
    public utilityService: UtilityService,
    private gridPropertiesService: GridPropertiesService,
    private configService: ConfigService,
    private exportrequestService: ExportRequestService
  ) { }

  public async ngOnInit(): Promise<void> {
    await this.defaultMethodsLoad();
  }

  //#region Default Method
  public async defaultMethodsLoad() {
    try {
      this.fxCredentials = JSON.parse(sessionStorage.getItem("fxCredentials") ?? '') as fxCredential;
      if (!this.fxCredentials)
        this.router.navigate(["login"]);

      this.utilityService.filterToggleSubject.subscribe(flag => {
        this.filterFlag = flag;
      });

      this.spinnerService.show();
      await this.getGridConfiguration();
      await this.getDropdownData();
      await this.loadData();
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Something went wrong, Data not load!');
    }
  }
  //#endregion

  //#region Grid Config
  public async getGridConfiguration() {
    try {
      this.gridConfig = await this.configService.getGridConfig(this.fxCredentials?.id ?? '', "ExportRequest", "ExportRequestGrid", this.gridPropertiesService.getExportRequestGrid());
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
        this.gridMasterConfigResponse = await this.configService.getMasterGridConfig("ExportRequest", "ExportRequestGrid");
        if (this.gridMasterConfigResponse)
          this.fields = this.gridMasterConfigResponse.gridDetail;
        else
          this.fields = await this.gridPropertiesService.getExportRequestGrid();
      }
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

  public async getDropdownData() {
    try {
      this.spinnerService.show();
      let reqBy = await this.exportrequestService.getRequestByData();
      if (reqBy)
        reqBy.forEach(z => { this.requestByList.push({ name: z.toString(), isChecked: false }); });

      Object.values(listExportRequestFilterLocation).forEach(z => { this.locationList.push({ name: z.toString(), isChecked: false }); });
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.alertDialogService.show(error);
      this.spinnerService.hide();
    }
  }

  public groupChange(groups: GroupDescriptor[]): void {
    try {
      this.groups = groups;
      this.loadData();
    }
    catch (error: any) {
      this.alertDialogService.show(error.error)
    }
  }

  public pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.loadData();
  }
  //#endregion

  public async loadData() {
    try {
      this.spinnerService.show();
      this.exportrequestSearchCriteriaObj.stoneIds = this.stoneId ? this.utilityService.CheckStoneIds(this.stoneId).map(x => x.toUpperCase()) : [];
      this.exportrequestSearchCriteriaObj.certificateNos = this.certNo ? this.utilityService.checkCertificateIds(this.certNo).map(x => x.toLowerCase()) : [];
      let res = await this.exportrequestService.getPaginatedByCriteria(this.exportrequestSearchCriteriaObj, this.skip, this.pageSize);
      if (res) {
        this.exportrequestResponse = JSON.parse(JSON.stringify(res));
        this.gridView = process(this.exportrequestResponse.exportRequests, { group: this.groups });
        this.gridView.total = res.totalCount;

        this.spinnerService.hide();
      }
      else
        this.spinnerService.hide();
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Data not load, Try gain later!');
    }
  }

  public filterPartToggle() {
    this.utilityService.setfilterToggleValue(this.filterFlag);
  }

  public async onFilterSubmit(form: NgForm) {
    if (form.valid) {
      await this.loadData();
    }
  }

  public async clearFilter(form: NgForm) {
    this.spinnerService.show();
    form.reset();
    this.skip = 0;
    this.exportrequestSearchCriteriaObj = new ExportRequestCriteria();
    this.stoneId = '';
    this.mySelection = [];
    await this.loadData();
  }

  public async copyToClipboard(type: string) {
    try {
      let res: string[] = [];
      if (this.copyOption == 'selected' && this.mySelection.length == 0) {
        this.utilityService.showNotification('Please select at least one entry for copy!', 'warning');
        return;
      }

      let allData: ExportRequest[] = [];
      if (this.copyOption == 'searched') {
        if (this.gridView.total <= this.pageSize)
          allData = this.exportrequestResponse.exportRequests;
        else
          allData = await this.getAllDataForCopy();

        if (allData.length == 0)
          return
      }

      if (type == 'stoneId') {
        if (this.copyOption == 'selected')
          res = JSON.parse(JSON.stringify(this.mySelection));
        else
          res = JSON.parse(JSON.stringify(allData.map(z => z.stoneId)));
      }
      else if (type == 'certNo') {
        if (this.copyOption == 'selected') {
          let selectedCertNo = this.exportrequestResponse.exportRequests.filter(z => this.mySelection.includes(z.stoneId)).map(z => z.certificateNo);
          if (selectedCertNo.length == this.mySelection.length)
            res = JSON.parse(JSON.stringify(selectedCertNo));
          else {
            allData = await this.getAllDataForCopy();
            if (allData.length == 0)
              return
            res = JSON.parse(JSON.stringify(allData.filter(z => this.mySelection.includes(z.stoneId)).map(z => z.certificateNo)));
          }
        }
        else
          res = JSON.parse(JSON.stringify(allData.map(z => z.certificateNo)));
      }

      if (res.length > 0) {
        this.spinnerService.show();
        if (res) {
          let stoneIdString = res.join(' ');
          navigator.clipboard.writeText(stoneIdString);
          this.utilityService.showNotification(`Copy to clipboard successfully!`);
          this.onCopyToggle();
          this.spinnerService.hide();
        }
        else
          this.spinnerService.hide();
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async getAllDataForCopy(): Promise<ExportRequest[]> {
    let data: ExportRequest[] = [];
    try {
      this.spinnerService.show();
      this.exportrequestSearchCriteriaObj.stoneIds = this.stoneId ? this.utilityService.CheckStoneIds(this.stoneId).map(x => x.toUpperCase()) : [];
      this.exportrequestSearchCriteriaObj.certificateNos = this.certNo ? this.utilityService.checkCertificateIds(this.certNo).map(x => x.toLowerCase()) : [];
      let res = await this.exportrequestService.getPaginatedByCriteria(this.exportrequestSearchCriteriaObj, 0, this.gridView.total);
      if (res) {
        data = res.exportRequests;
        this.spinnerService.hide();
      }
      else
        this.spinnerService.hide();

    } catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Copy data not get, Try again later!');
    }
    return data;
  }

  public deleteExportRequest() {
    this.alertDialogService.ConfirmYesNo("Are you sure you want to delete", "Remove Export Request")
      .subscribe(async (res: any) => {
        if (res.flag) {
          try {
            this.spinnerService.show();
            let res = await this.exportrequestService.deleteExportRequestByStoneIds(this.mySelection);
            if (res) {
              this.utilityService.showNotification('ExportRequest Stone deleted successfully!');
              this.loadData();
            }
            else
              this.alertDialogService.show('Something went wrong, Try gain later!', 'error');

            this.spinnerService.hide();
          }
          catch (error: any) {
            console.error(error);
            this.spinnerService.hide();
            this.alertDialogService.show('Something went wrong, Try gain later!');
          }
        }
      });
  }

  public refreshData() {
    this.loadData();
    this.mySelection = [];
  }

  public onCopyToggle(): void {
    this.showCopyOption = !this.showCopyOption;
  }

  //#region Popup Close
  @HostListener("document:click", ["$event"])
  public documentClick(event: any): void {
    if (!this.contains(event.target)) {
      this.showCopyOption = false;
    }
  }

  private contains(target: any): boolean {
    return (
      this.anchor.nativeElement.contains(target) ||
      (this.popup ? this.popup.nativeElement.contains(target) : false)
    );
  }
  //#endregion

}
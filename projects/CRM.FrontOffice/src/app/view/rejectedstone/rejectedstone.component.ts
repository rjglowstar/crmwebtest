import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { PageChangeEvent } from '@progress/kendo-angular-grid';
import { GroupDescriptor, DataResult, process } from '@progress/kendo-data-query';
import { NgxSpinnerService } from 'ngx-spinner';
import { GridDetailConfig } from 'shared/businessobjects';
import { UtilityService, ConfigService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { RejectedStoneResponse, RejectedStoneSearchCriteria } from '../../businessobjects';
import { fxCredential } from '../../entities';
import { GridPropertiesService, RejectedstoneService } from '../../services';

@Component({
  selector: 'app-rejectedstone',
  templateUrl: './rejectedstone.component.html',
  styles: [
  ]
})
export class RejectedstoneComponent implements OnInit {

  //#region Grid Data
  public groups: GroupDescriptor[] = [];
  public gridView!: DataResult;
  public pageSize = 27;
  public skip = 0
  public fields!: GridDetailConfig[];
  //#endregion
  public fxCredentials!: fxCredential;
  public rejectedStoneSearchCriteria: RejectedStoneSearchCriteria = new RejectedStoneSearchCriteria();
  public rejectedStonResponse: RejectedStoneResponse = new RejectedStoneResponse;
  public filterFlag = true;
  public stoneId: string = '';

  constructor(private router: Router,
    private alertDialogService: AlertdialogService,
    private spinnerService: NgxSpinnerService,
    private utilityService: UtilityService,
    private gridPropertiesService: GridPropertiesService,
    private configService: ConfigService,
    private rejectedStoneService: RejectedstoneService,) { }

  public async ngOnInit(): Promise<void> {
    await this.defaultMethodsLoad();
  }

  //#region Default Method
  public async defaultMethodsLoad() {
    try {
      this.fxCredentials = JSON.parse(sessionStorage.getItem("fxCredentials") ?? '') as fxCredential;

      this.utilityService.filterToggleSubject.subscribe(flag => {
        this.filterFlag = flag;
      });

      this.spinnerService.show();
      await this.getGridConfiguration();
      await this.loadRejectedInventory();
    }
    catch (error: any) {
      console.error(error);
      this.spinnerService.hide();
      this.alertDialogService.show('Something went wrong, Data not load!');
    }
  }
  //#endregion

  //#region Grid Config | On Change
  public async getGridConfiguration() {
    try {
      this.spinnerService.show();

      this.fields = await this.gridPropertiesService.getRejectedStoneItems();

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
      this.loadRejectedInventory();
    }
    catch (error: any) {
      this.alertDialogService.show(error.error)
    }
  }

  public pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.loadRejectedInventory();
  }

  //#endregion

  public async loadRejectedInventory() {
    try {
      this.spinnerService.show();
      this.rejectedStoneSearchCriteria.stoneIds = this.stoneId ? this.utilityService.CheckStoneIds(this.stoneId).map(x => x.toUpperCase()) : [];
      let res = await this.rejectedStoneService.getRejectedStone(this.rejectedStoneSearchCriteria, this.skip, this.pageSize);
      if (res) {
        this.rejectedStonResponse = JSON.parse(JSON.stringify(res));
        this.gridView = process(res.rejectedStones, { group: this.groups });
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
      await this.loadRejectedInventory();
    }
  }

  public async clearFilter(form: NgForm) {
    this.spinnerService.show();
    form.reset();
    this.skip = 0;
    this.rejectedStoneSearchCriteria = new RejectedStoneSearchCriteria();
    this.stoneId = '';
    await this.loadRejectedInventory();
  }


}

import { Component, Input, OnInit } from '@angular/core';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { SelectableSettings } from '@progress/kendo-angular-treeview';
import { DataResult, GroupDescriptor, SortDescriptor, process } from '@progress/kendo-data-query';
import { NgxSpinnerService } from 'ngx-spinner';
import { SortFieldDescriptor } from 'projects/CRM.BackOffice/src/app/businessobjects';
import { GridDetailConfig } from 'shared/businessobjects';
import { AlertdialogService } from 'shared/views';
import { fxCredential, GridConfig, GridMasterConfig } from 'shared/enitites';
import { BidingItemService } from '../../services/biding/bidingItem.service';
import { PageChangeEvent } from '@progress/kendo-angular-grid';
import * as moment from 'moment-timezone';
import { BidResultItems } from '../../businessobjects/biding/bidResultItems';
import { UtilityService } from 'shared/services';

@Component({
  selector: 'app-bidingdetails',
  templateUrl: './bidingDetails.component.html',
  styleUrls: ['./bidingDetails.component.css']
})
export class BidingDetailsComponent implements OnInit {

  //#region Inputs
  @Input() bidNumber!: string;
  @Input() stoneId!: string;
  @Input() mainDiscount!: string;
  @Input() bidEndDate!: Date;
  @Input() isKeepUnsold!: boolean;
  //#endregion Inputs

  //#region Grid Init
  public sort: SortDescriptor[] = [];
  public groups: GroupDescriptor[] = [];
  public pageSize = 26;
  public skip = 0;
  public fields!: GridDetailConfig[];
  public gridView?: DataResult;
  public gridConfig!: GridConfig;
  public isGridConfig: boolean = false;
  public gridMasterConfigResponse!: GridMasterConfig;
  public selectableSettings: SelectableSettings = {
    mode: 'multiple',
  };
  public sortFieldDescriptors!: SortFieldDescriptor[];
  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains',
  };
  //#endregion Grid Init

  //#region other
  private fxCredentials!: fxCredential;
  public bidResultItems: BidResultItems[] = [];
  //#endregion

  constructor(
    private alertDialogService: AlertdialogService,
    private spinnerService: NgxSpinnerService,
    private bidingItemService: BidingItemService,
    private utilityService: UtilityService) { }

  async ngOnInit() {
    await this.defaultMethodsLoad();
  }

  //#region DefaultMethod
  async defaultMethodsLoad() {
    try {
      this.fxCredentials = JSON.parse(sessionStorage.getItem("fxCredentials") ?? '') as fxCredential;
      await this.initBidingResultData();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public async initBidingResultData() {
    try {
      this.spinnerService.show();
      if (this.bidNumber && this.stoneId) {
        let res = await this.bidingItemService.getBidingResultItems(this.bidNumber, this.stoneId);
        if (res) {
          this.bidResultItems = res;
          this.gridView = process(res, { group: this.groups, sort: this.sort, skip: this.skip, take: this.pageSize });
          this.gridView.total = res.length;
        }
      }
      this.spinnerService.hide();
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public isAnyItemApproved(isApproved: boolean): boolean {
    return isApproved ? false : this.bidResultItems.some(item => item.isApproved);
  }

  public async onClickBidApproved(dataItem: BidResultItems, isApproved: boolean) {
    try {
      this.alertDialogService.ConfirmYesNo(`Are you sure you want to ${isApproved ? 'approved': 'disapproved'} stone?`, `${isApproved ? 'Approved Stone':  'Disapproved Stone'}`)
        .subscribe(async (res: any) => {
          if (res.flag) {
            let res = await this.bidingItemService.approveBidStone(this.fxCredentials.fullName, dataItem, isApproved);
            if (res) {
              await this.initBidingResultData();
              this.utilityService.showNotification(`Bid stone is ${isApproved ? "approved" : "disapproved"} successfully!`)
            }
          }
        })
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }
  //#endregion DefaultMethod

  //#region Grid Methods
  public sortChange(sort: SortDescriptor[]): void {
    this.sort = sort;
    this.sortFieldDescriptors = new Array<SortFieldDescriptor>();
    this.initBidingResultData();
  }

  public groupChange(groups: GroupDescriptor[]): void {
    try {
      this.groups = groups;
      this.initBidingResultData();
    }
    catch (error: any) {
      this.alertDialogService.show(error.error);
    }
  }

  public pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.initBidingResultData();
  }
  //#endregion Grid Methods
}
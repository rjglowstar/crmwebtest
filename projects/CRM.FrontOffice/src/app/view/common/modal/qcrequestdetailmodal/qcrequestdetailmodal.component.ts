import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PageChangeEvent } from '@progress/kendo-angular-grid';
import { DataResult, process } from '@progress/kendo-data-query';
import { NgxSpinnerService } from 'ngx-spinner';
import { InvItem, QcRequest } from '../../../../entities';
import { GridDetailConfig } from 'shared/businessobjects';
import { UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { GridPropertiesService, QcrequestService } from '../../../../services';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-qcrequestdetailmodal',
  templateUrl: './qcrequestdetailmodal.component.html',
  styleUrls: ['./qcrequestdetailmodal.component.css']
})
export class QcrequestdetailmodalComponent implements OnInit {

  @Input() public qcRequestObj: QcRequest = new QcRequest();
  @Input() public qcRequestId!: string;

  @Output() toggle: EventEmitter<boolean> = new EventEmitter();

  public detailPageSize = 20;
  public detailSkip = 0
  public gridDetailView!: DataResult;
  public invItemDetail: InvItem[] = [];
  public detailFields!: GridDetailConfig[];
  public filterStoneId: string = '';
  public filterCertiNo: string = '';
  public filterIsApprover?: any=true;
  public selectedDetailQcRequest: InvItem = new InvItem();

  constructor(
    public utilityService: UtilityService,
    private alertDialogService: AlertdialogService,
    private spinnerService: NgxSpinnerService,
    private qcRequestService: QcrequestService,
    private gridPropertiesService: GridPropertiesService
  ) { }

  async ngOnInit(): Promise<void> {
    await this.defaultMethodsLoad();
  }

  public async defaultMethodsLoad() {
    this.detailFields = await this.gridPropertiesService.getQcRequestMasterDetailGrid();
    if (this.qcRequestId != null) {
      this.qcRequestObj = await this.qcRequestService.getQcRequestById(this.qcRequestId);
    }

    this.loadDetailGrid();
  }

  public pageChangeDetail(event: PageChangeEvent): void {
    this.spinnerService.show();
    this.detailSkip = event.skip;
    this.loadDetailGrid();
  }
  public chekisRejected() {
    this.loadDetailGrid();
  }
  public async loadDetailGrid() {
    this.spinnerService.show();
    // if (this.mySelection[0]) {
    // let findQcRequest: QcRequest = this.qcRequestItemDetail.find(c => c.id == this.mySelection[0]) ?? new QcRequest;
    this.invItemDetail = this.qcRequestObj.qcStoneIds;
    if (this.filterStoneId) {
      var filterStoneIds = this.filterStoneId ? this.utilityService.CheckStoneIds(this.filterStoneId).map(x => x.toUpperCase()) : [];
      if (filterStoneIds && filterStoneIds.length > 0)
        this.invItemDetail = this.invItemDetail.filter(c => filterStoneIds.includes(c.stoneId));
    }
    if (this.filterCertiNo) {
      var filterCertiNos = this.filterCertiNo ? this.utilityService.checkCertificateIds(this.filterCertiNo).map(x => x.toUpperCase()) : [];
      if (filterCertiNos && filterCertiNos.length > 0)
        this.invItemDetail = this.invItemDetail.filter(c => filterCertiNos.includes(c.certificateNo));
    }

    if (this.filterIsApprover == true) {
      this.invItemDetail = this.invItemDetail.filter(c => c.status == 'Approved');
    }
    else if (this.filterIsApprover == false) {
      this.invItemDetail = this.invItemDetail.filter(c => c.status == 'Rejecetd');
    }
    let filterQcRequestItemDetail = this.invItemDetail.slice(this.detailSkip, this.detailSkip + this.detailPageSize);
    this.gridDetailView = process(filterQcRequestItemDetail, {});
    this.gridDetailView.total = this.invItemDetail.length;
    // }
    this.spinnerService.hide();
  }

  public copyRejectedToClipboard() {
    try {
      let res = this.qcRequestObj.qcStoneIds.filter(x => x.status != 'Approved').map(x => x.stoneId).join(", ");
      if (res.length > 0) {
        navigator.clipboard.writeText(res);
        this.utilityService.showNotification(`Copy to clipboard successfully!`);
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      this.alertDialogService.show(error.error);
    }
  }

  public closeDetailsDialog() {
    this.toggle.emit(false);
  }


  public onFilterDetailSubmit(form: NgForm) {
    this.selectedDetailQcRequest = new InvItem();
    this.loadDetailGrid()
  }


  public clearDetailFilter(form: NgForm) {
    form.reset()
    this.loadDetailGrid();
  }
}

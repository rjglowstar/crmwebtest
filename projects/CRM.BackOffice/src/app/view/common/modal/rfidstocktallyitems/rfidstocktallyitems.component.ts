import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DropDownFilterSettings } from '@progress/kendo-angular-dropdowns';
import { PageChangeEvent } from '@progress/kendo-angular-grid';
import { DataResult, process } from '@progress/kendo-data-query';
import { NgxSpinnerService } from 'ngx-spinner';
import { UtilityService } from 'shared/services';
import { StockTallyItems } from '../../../../businessobjects';

@Component({
  selector: 'app-rfidstocktallyitems',
  templateUrl: './rfidstocktallyitems.component.html',
  styleUrls: ['./rfidstocktallyitems.component.css']
})
export class RfidstocktallyitemsComponent implements OnInit {
  @Input() items: Array<StockTallyItems> = new Array<StockTallyItems>();
  @Output() public toggle = new EventEmitter<boolean>();

  public detailPageSize = 20;
  public detailSkip = 0
  public gridDetailView!: DataResult;
  public cloneStockTallyItems: Array<StockTallyItems> = new Array<StockTallyItems>();
  public filterStoneId!: string
  public filterRFID!: string
  public filterKapan!: string[];
  public filterStatus!: string[];
  public listKapanItems: Array<{ name: string; isChecked: boolean }> = [];
  public listStatusItems: Array<{ name: string; isChecked: boolean }> = [];
  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'contains',
  };
  public filterHold: boolean = null as any;
  public filterLabReturn: boolean = null as any;
  public filterMemo: boolean = null as any;
  public filterTallied: boolean = null as any;

  constructor(private spinnerService: NgxSpinnerService,
    public utilityService: UtilityService,
  ) { }

  ngOnInit(): void {
    this.defaultMethodLoad();
  }

  public defaultMethodLoad() {
    this.cloneStockTallyItems = JSON.parse(JSON.stringify(this.items));
    this.loadDetailGrid();
  }

  public loadDetailGrid() {
    this.spinnerService.show();
    if (this.items && this.items.length > 0) {
      this.items = this.items.sort((a, b) => a.kapan.localeCompare(b.kapan))

      let distinctKapan = this.items.filter(
        (thing, i, arr) => arr.findIndex(t => t.kapan === thing.kapan) === i
      );
      distinctKapan.map(x => x.kapan).forEach(z => { this.listKapanItems.push({ name: z, isChecked: false }); });

      let distinctStatus = this.items.filter(
        (thing, i, arr) => arr.findIndex(t => t.status === thing.status) === i
      );
      distinctStatus.map(x => x.status).forEach(z => { this.listStatusItems.push({ name: z, isChecked: false }); });

      let itemDetail = this.items.slice(this.detailSkip, this.detailSkip + this.detailPageSize);
      this.gridDetailView = process(itemDetail, {});
      this.gridDetailView.total = this.items.length;
    }
    this.spinnerService.hide();
  }

  public pageChangeDetail(event: PageChangeEvent): void {
    this.spinnerService.show();
    this.detailSkip = event.skip;
    this.loadDetailGrid();
  }

  public closeDetailsDialog() {
    this.toggle.emit(false);
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
    }
  }

  public filterItemsList() {
    this.spinnerService.show();

    this.detailSkip = 0;
    this.items = this.cloneStockTallyItems;
    this.items = this.items.sort((a, b) => a.kapan.localeCompare(b.kapan))
    
    if (this.filterKapan && this.filterKapan.length > 0)
      this.items = this.items.filter(z => this.filterKapan.includes(z.kapan))

    if (this.filterStoneId && this.filterStoneId.length > 0) {
      let stoneIds = this.filterStoneId ? this.utilityService.CheckStoneIds(this.filterStoneId) : [];
      let lowerCaseStoneIds: string[] = []
      stoneIds.forEach(z => { lowerCaseStoneIds.push(z.toLowerCase()) });
      this.items = this.items.filter(z => lowerCaseStoneIds.includes(z.stoneId.toLowerCase()))
    }

    if (this.filterRFID && this.filterRFID.length > 0) {
      let rfIds = this.filterRFID ? this.utilityService.checkCertificateIds(this.filterRFID) : [];
      this.items = this.items.filter(z => rfIds.includes(z.rfid))
    }

    if (this.filterStatus && this.filterStatus.length > 0)
      this.items = this.items.filter(z => this.filterStatus.includes(z.status))

    if (this.filterHold != null)
      this.items = this.items.filter(z => z.isHold == this.filterHold);
    else
      this.items = this.items.filter(z => z.isHold != null);

    if (this.filterLabReturn != null)
      this.items = this.items.filter(z => z.isLabReturn == this.filterLabReturn);
    else
      this.items = this.items.filter(z => z.isLabReturn != null);

    if (this.filterMemo != null)
      this.items = this.items.filter(z => z.isMemo == this.filterMemo);
    else
      this.items = this.items.filter(z => z.isMemo != null);

    if (this.filterTallied != null)
      this.items = this.items.filter(z => z.isTally == this.filterTallied);
    else
      this.items = this.items.filter(z => z.isTally != null);

    let itemDetail = this.items.slice(this.detailSkip, this.detailSkip + this.detailPageSize);
    this.gridDetailView = process(itemDetail, {});
    this.gridDetailView.total = this.items.length;

    this.spinnerService.hide();

  }

  public clearItemsFilter() {
    this.items = this.cloneStockTallyItems;
    this.filterStoneId = ''
    this.filterRFID = ''
    this.filterKapan = new Array<string>();
    this.filterStatus = new Array<string>();
    this.filterHold = null as any;
    this.filterLabReturn = null as any;
    this.filterMemo = null as any;
    this.filterTallied = null as any;
    this.listKapanItems = Array<{ name: string; isChecked: boolean }>();
    this.listStatusItems = Array<{ name: string; isChecked: boolean }>();
    this.loadDetailGrid();
  }

}

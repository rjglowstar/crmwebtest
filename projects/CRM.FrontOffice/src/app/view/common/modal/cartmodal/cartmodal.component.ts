import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { GridPropertiesService } from '../../../../services';
import { GridDetailConfig } from 'shared/businessobjects';
import { LeadCartItem } from '../../../../businessobjects';
import { NgxSpinnerService } from 'ngx-spinner';
import { PageChangeEvent } from '@progress/kendo-angular-grid';
import { DataResult, process } from '@progress/kendo-data-query';
import { InvItem } from '../../../../entities';
import { UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';

@Component({
  selector: 'app-cartmodal',
  templateUrl: './cartmodal.component.html',
  styleUrls: ['./cartmodal.component.css']
})
export class CartmodalComponent implements OnInit {

  @Input() public leadCartItem: LeadCartItem = new LeadCartItem();
  @Output() toggle: EventEmitter<boolean> = new EventEmitter();

  public fields!: GridDetailConfig[];
  public gridViewCartInventory!: DataResult;
  public pageSize = 15;
  public skip = 0;
  public listCartInventoryItems: InvItem[] = [];
  public gridCartInventoryData: InvItem[] = [];

  constructor(
    private gridPropertiesService: GridPropertiesService,
    private spinnerService: NgxSpinnerService,
    public utilityService: UtilityService,
    private alertDialogService: AlertdialogService,
  ) { }

  async ngOnInit() {
    this.loadDefaultMethods();
  }

  public async loadDefaultMethods() {
    await this.getGridConfig();
    await this.loadCartAllInv();
  }

  public async getGridConfig() {
    this.fields = await this.gridPropertiesService.getLeadCartInventoryItems();
  }

  public async loadCartAllInv() {
    this.listCartInventoryItems = this.leadCartItem.invItems;
    this.loadCartPaging();
  }

  public async loadCartPaging() {
    if (this.listCartInventoryItems.length > 0) {
      for (let i = this.skip; i < this.pageSize + this.skip; i++) {
        const element = this.listCartInventoryItems[i];
        if (element)
          this.gridCartInventoryData.push(element);
      }
      this.loadCartInventoryGrid(this.listCartInventoryItems);
    }
  }

  public async loadCartInventoryGrid(inventoryItems: InvItem[]) {
    if (inventoryItems.length > 0) {
      this.gridViewCartInventory = process(this.gridCartInventoryData, {});
      this.gridViewCartInventory.total = inventoryItems.length;
    }
    this.spinnerService.hide();
  }

  public pageChange(event: PageChangeEvent): void {
    this.spinnerService.show();
    this.gridCartInventoryData = [];
    this.skip = event.skip;
    this.loadCartPaging();
  }

  toggleCartDialog() {
    this.toggle.emit(false);
  }

  public copyToClipboard() {
    try {
      let res = this.listCartInventoryItems.map(x => x.stoneId).join(", ");
      if (res.length > 0) {
        navigator.clipboard.writeText(res);
        this.utilityService.showNotification(`Copy to clipboard successfully!`);
      }
    }
    catch (error: any) {
      this.spinnerService.hide();
      console.error(error);
      this.alertDialogService.show("Sone not able to copy, kindly contact administrator!");
    }
  }

}

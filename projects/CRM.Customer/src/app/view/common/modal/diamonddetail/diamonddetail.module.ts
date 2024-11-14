import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { SharedDirectiveModule } from 'shared/directives';
import { DiamondDetailRoutingModule } from './diamonddetail-routing.module';
import { DiamondDetailComponent } from './diamonddetail.component';
import { CartService, CustomerService, CustomerInvSearchService, WatchlistService, InventoryService } from '../../../../services';
import { CommonService, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { OrdersummaryModule } from '../ordersummary/ordersummary.module';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { PopupModule } from '@progress/kendo-angular-popup';
import { FormsModule } from '@angular/forms';
@NgModule({
  declarations: [DiamondDetailComponent],
  imports: [
    CommonModule,
    FormsModule,
    DiamondDetailRoutingModule,
    SharedDirectiveModule,
    TooltipModule,
    ButtonsModule,
    OrdersummaryModule,
    DropDownsModule,
    PopupModule
  ],
  exports: [DiamondDetailComponent],
  providers: [
    CommonService,
    UtilityService,
    AlertdialogService,
    WatchlistService,
    CustomerService,
    CustomerInvSearchService,
    InventoryService,
    CartService
  ],
})
export class DiamondDetailModule { }

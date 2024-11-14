import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MycartRoutingModule } from './mycart-routing.module';
import { MycartComponent } from './mycart.component';
import { ButtonModule } from '@progress/kendo-angular-buttons';
import { GridModule } from '@progress/kendo-angular-grid';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { FormsModule } from '@angular/forms';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { AppPreloadService, CartService, CustomerInvSearchService, CustomerService, EmailService, InventoryService, LeadService, MasterConfigService, SchemeService } from '../../services';
import { NotificationService } from '@progress/kendo-angular-notification';
import { LabelModule } from '@progress/kendo-angular-label';
import { OrdersummaryModule } from '../common/modal/ordersummary/ordersummary.module';
import { DiamondCompareModule } from '../common/modal/diamondcompare/diamondcompare.module';
import { MediaModule } from '../common/modal/media/media.module';
import { DiamondDetailModule } from '../common/modal/diamonddetail/diamonddetail.module';
import { SharedDirectiveModule } from 'shared/directives';
@NgModule({
  declarations: [MycartComponent],
  imports: [
    CommonModule,
    MycartRoutingModule,
    ButtonModule,
    GridModule,
    TooltipModule,
    DropDownsModule,
    InputsModule,
    FormsModule,
    DateInputsModule,
    LabelModule,
    OrdersummaryModule,
    DiamondCompareModule,
    DiamondDetailModule,
    MediaModule,
    SharedDirectiveModule
  ],
  providers:[
    NotificationService,
    UtilityService,
    MasterConfigService,
    AppPreloadService,
    AlertdialogService,
    CartService,
    LeadService,
    SchemeService,
    InventoryService,
    CustomerInvSearchService,
    EmailService,
    CustomerService
  ]
})
export class MycartModule { }

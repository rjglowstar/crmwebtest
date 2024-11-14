import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrdersummaryRoutingModule } from './ordersummary-routing.module';
import { OrdersummaryComponent } from './ordersummary.component';
import { AlertdialogService } from 'shared/views';
import { NgxSpinnerService } from 'ngx-spinner';
import { AppPreloadService, CartService, CustomerService, InventoryService, LeadService, SchemeService, SystemUserService } from '../../../../services';
import { LabelModule } from '@progress/kendo-angular-label';
import { ButtonModule } from '@progress/kendo-angular-buttons';
import { GridModule } from '@progress/kendo-angular-grid';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { FormsModule } from '@angular/forms';
import { SharedDirectiveModule } from 'shared/directives';
@NgModule({
  declarations: [OrdersummaryComponent],
  imports: [
    CommonModule,
    OrdersummaryRoutingModule,
    LabelModule,
    ButtonModule,
    GridModule,
    TooltipModule,
    DropDownsModule,
    InputsModule,
    FormsModule,
    SharedDirectiveModule
  ],
  providers:[
    AlertdialogService,
    AppPreloadService,
    CustomerService,
    SystemUserService,
    LeadService,
    CartService,
    InventoryService,
    SchemeService
  ],    
 exports:[OrdersummaryComponent]
})
export class OrdersummaryModule { }

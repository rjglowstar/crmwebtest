import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrdermodalRoutingModule } from './ordermodal-routing.module';
import { OrdermodalComponent } from './ordermodal.component';
import { CommuteService, GridPropertiesService, InventoryService, LeadService, OrderService, SupplierService } from '../../../../services';
import { FormsModule } from '@angular/forms';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { DialogsModule } from '@progress/kendo-angular-dialog';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { GridModule } from '@progress/kendo-angular-grid';
import { IndicatorsModule } from '@progress/kendo-angular-indicators';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LabelModule } from '@progress/kendo-angular-label';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { NotificationModule } from '@progress/kendo-angular-notification';
import { PopupModule } from '@progress/kendo-angular-popup';
import { AlertdialogService } from 'shared/views';
import { UtilityService } from 'shared/services';
import { SharedDirectiveModule } from 'shared/directives';


@NgModule({
  declarations: [OrdermodalComponent],
  imports: [
    CommonModule,
    OrdermodalRoutingModule,
    LayoutModule,
    InputsModule,
    DialogsModule,
    FormsModule,
    DropDownsModule,
    ButtonsModule,
    GridModule,
    IndicatorsModule,
    PopupModule,
    NotificationModule,
    LabelModule,
    SharedDirectiveModule,
  ],
  providers: [
    LeadService,
    AlertdialogService,
    GridPropertiesService,
    SupplierService,
    OrderService,
    UtilityService,
    InventoryService,
    CommuteService
  ],
  exports: [OrdermodalComponent]
})
export class OrdermodalModule { }

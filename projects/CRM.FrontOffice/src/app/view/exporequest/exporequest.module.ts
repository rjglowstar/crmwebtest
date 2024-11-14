import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpoRequestComponent } from './exporequest.component';
import { FormsModule } from '@angular/forms';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { GridModule } from '@progress/kendo-angular-grid';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { PopupModule } from '@progress/kendo-angular-popup';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { SharedDirectiveModule } from 'shared/directives';
import { GridconfigurationModule, AlertdialogService } from 'shared/views';
import { ConfigurationService, CustomerService, ExpoRequestService, GridPropertiesService, InventoryService, LeadService, OrderService, SchemeService, SupplierService, SystemUserService } from '../../services';
import { ExpoRequestRoutingModule } from './exporequest-routing.module';
import { ExpoCustRegisterModule } from '../common/modal/expoCustRegister/expoCustRegister.module';

@NgModule({
  declarations: [ExpoRequestComponent],
  imports: [
    CommonModule,
    ExpoRequestRoutingModule,
    FormsModule,
    DropDownsModule,
    ButtonsModule,
    InputsModule,
    LayoutModule,
    DialogModule,
    GridModule,
    PopupModule,
    SharedDirectiveModule,
    GridconfigurationModule,
    TooltipModule,
    ExpoCustRegisterModule
  ],
  providers: [
    ConfigurationService,
    OrderService,
    SchemeService,
    LeadService,
    CustomerService,
    SupplierService,
    InventoryService,
    ExpoRequestService,
    GridPropertiesService,
    AlertdialogService,
    SystemUserService
  ]
})
export class ExpoRequestModule { }

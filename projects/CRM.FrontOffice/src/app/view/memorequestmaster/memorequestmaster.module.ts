import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MemorequestmasterRoutingModule } from './memorequestmaster-routing.module';
import { MemorequestmasterComponent } from './memorequestmaster.component';
import { FormsModule } from '@angular/forms';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { GridModule } from '@progress/kendo-angular-grid';
import { IndicatorsModule } from '@progress/kendo-angular-indicators';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { PopupModule } from '@progress/kendo-angular-popup';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { SharedDirectiveModule } from 'shared/directives';
import { AlertdialogService, GridconfigurationModule } from 'shared/views';
import { AppPreloadService, BrokerService, CustomerService, InventoryService, MemorequestService, SupplierService } from '../../services';
import { UtilityService } from 'shared/services';


@NgModule({
  declarations: [MemorequestmasterComponent],
  imports: [
    CommonModule,
    MemorequestmasterRoutingModule,
    DropDownsModule,
    ButtonsModule,
    InputsModule,
    LayoutModule,
    DateInputsModule,
    DialogModule,
    GridModule,
    PopupModule,
    FormsModule,
    IndicatorsModule,
    SharedDirectiveModule,
    GridconfigurationModule,
    TooltipModule,
  ],
  providers: [
    MemorequestService,
    InventoryService,
    UtilityService,
    AlertdialogService,
    AppPreloadService,
    SupplierService,
    CustomerService,
    BrokerService,
  ]
})
export class MemorequestmasterModule { }

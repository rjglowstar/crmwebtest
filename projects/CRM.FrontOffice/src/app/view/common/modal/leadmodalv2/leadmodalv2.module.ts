import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
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
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { DragulaModule } from 'ng2-dragula';
import { SharedDirectiveModule } from 'shared/directives';
import { ConfigService, UtilityService } from 'shared/services';
import { AlertdialogService, GridconfigurationModule } from 'shared/views';
import { BrokerService, BusinessconfigurationService, ConfigurationService, CustomerService, GridPropertiesService, InventoryService, LeadService, MemorequestService, RejectedstoneService, SchemeService, SupplierService } from '../../../../services';
import { LeadcustomerrequestmodalModule } from '../leadcustomerrequestmodal/leadcustomerrequestmodal.module';
import { LeadrejectedmodalModule } from '../leadrejectedmodal/leadrejectedmodal.module';
import { LeadstonereleasemodalModule } from '../leadstonereleasemodal/leadstonereleasemodal.module';
import { Leadmodalv2RoutingModule } from './leadmodalv2-routing.module';
import { Leadmodalv2Component } from './leadmodalv2.component';

@NgModule({
  declarations: [Leadmodalv2Component],
  imports: [
    CommonModule,
    Leadmodalv2RoutingModule,
    LayoutModule,
    InputsModule,
    DialogsModule,
    FormsModule,
    DropDownsModule,
    ButtonsModule,
    GridModule,
    SharedDirectiveModule,
    DragulaModule.forRoot(),
    IndicatorsModule,
    PopupModule,
    NotificationModule,
    GridconfigurationModule,
    LabelModule,
    TooltipModule,
    LeadcustomerrequestmodalModule,
    LeadrejectedmodalModule,
    LeadstonereleasemodalModule,
  ],
  providers: [
    CustomerService,
    BrokerService,
    GridPropertiesService,
    UtilityService,
    AlertdialogService,
    InventoryService,
    ConfigService,
    LeadService,
    BusinessconfigurationService,
    RejectedstoneService,
    SchemeService,
    ConfigurationService,
    SupplierService,
    MemorequestService,
  ],
  exports: [Leadmodalv2Component]
})
export class Leadmodalv2Module { }

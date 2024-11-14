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
import { ConfigService, LogService, UtilityService } from 'shared/services';
import { AlertdialogService, GridconfigurationModule } from 'shared/views';
import { BrokerService, BusinessconfigurationService, ConfigurationService, CustomerService, GridPropertiesService, InventoryService, LeadService, MailService, MemorequestService, RejectedstoneService, SchemeService, SupplierService, SystemUserService } from '../../../../services';
import { LeadcustomerrequestmodalModule } from '../leadcustomerrequestmodal/leadcustomerrequestmodal.module';
import { LeadrejectedmodalModule } from '../leadrejectedmodal/leadrejectedmodal.module';
import { LeadstonereleasemodalModule } from '../leadstonereleasemodal/leadstonereleasemodal.module';
import { LeadmodalRoutingModule } from './leadmodal-routing.module';
import { LeadmodalComponent } from './leadmodal.component';
import { LeadcancelmodalModule } from '../leadcancelmodal/leadcancelmodal.module';


@NgModule({
  declarations: [LeadmodalComponent],
  imports: [
    CommonModule,
    LeadmodalRoutingModule,
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
    LeadcancelmodalModule
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
    SystemUserService,
    MemorequestService,
    MailService,
    LogService,
  ],
  exports: [LeadmodalComponent]
})
export class LeadmodalModule { }

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
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
import { CountdownModule } from 'ngx-countdown';
import { SharedDirectiveModule } from 'shared/directives';
import { ConfigService, LogService, UtilityService } from 'shared/services';
import { AlertdialogService, GridconfigurationModule } from 'shared/views';
import { BrokerService, CartService, CustomerService, GridPropertiesService, InventoryService, LeadService, MailService, PricingRequestService, SchemeService } from '../../services';
import { CartmodalModule } from '../common/modal/cartmodal/cartmodal.module';
import { LeadmodalModule } from '../common/modal/leadmodal/leadmodal.module';
import { LeadrejectedmodalModule } from '../common/modal/leadrejectedmodal/leadrejectedmodal.module';
import { LeadRoutingModule } from './lead-routing.module';
import { LeadComponent } from './lead.component';

@NgModule({
  declarations: [LeadComponent],
  imports: [
    CommonModule,
    LeadRoutingModule,
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
    LeadmodalModule,
    CartmodalModule,
    CountdownModule,
    DateInputsModule,
    LeadrejectedmodalModule
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
    CartService,
    SchemeService,
    PricingRequestService,
    MailService,
    LogService,
  ]
})
export class LeadModule { }

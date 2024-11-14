import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
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
import { DragulaModule } from 'ng2-dragula';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input-gg';
import { SharedDirectiveModule } from 'shared/directives';
import { AccountService, CommonService, ConfigService, FileStoreService, UtilityService } from 'shared/services';
import { AlertdialogService, GridconfigurationModule } from 'shared/views';
import { CustomerCriteriaService, CustomerPreferenceService, CustomerService, CustomerVerificationService, GridPropertiesService, SystemUserService, WatchListService } from '../../services';
import { CustomerRoutingModule } from './customer-routing.module';
import { CustomerdetailsComponent } from './customerdetails/customerdetails.component';
import { CustomerMasterComponent } from './customermaster/customermaster.component';

@NgModule({
  declarations: [CustomerMasterComponent, CustomerdetailsComponent],
  imports: [
    CommonModule,
    CustomerRoutingModule,
    FormsModule,
    DropDownsModule,
    ButtonsModule,
    InputsModule,
    LayoutModule,
    DateInputsModule,
    DialogModule,
    GridModule,
    PopupModule,
    SharedDirectiveModule,
    GridconfigurationModule,
    IndicatorsModule,
    NgxIntlTelInputModule,
    TooltipModule,
    DragulaModule.forRoot(),
  ],
  providers: [
    CustomerService,
    CustomerVerificationService,
    GridPropertiesService,
    AlertdialogService,
    CommonService,
    UtilityService,
    ConfigService,
    AccountService,
    SystemUserService,
    CustomerCriteriaService,
    FileStoreService,
    CustomerPreferenceService,
    WatchListService
  ],
})
export class CustomerModule { }
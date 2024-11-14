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
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input-gg';
import { SharedDirectiveModule } from 'shared/directives';
import { AccountService, CommonService, ConfigService, FileStoreService, UtilityService } from 'shared/services';
import { AlertdialogService, GridconfigurationModule } from 'shared/views';
import { ConfigurationService, CustomerService, CustomerVerificationService, GridPropertiesService, SystemUserService } from '../../services';
import { CustomerregistrationModule } from '../common/modal/customerregistration/customerregistration.module';
import { CustomerVerifyModule } from '../common/modal/customerverify/customerverify.module';
import { CustomerverificationComponent } from '../customerverification/customerverification.component';
import { CustomerverificationRoutingModule } from './customerverification-routing.module';


@NgModule({
  declarations: [CustomerverificationComponent],
  imports: [
    CommonModule,
    CustomerverificationRoutingModule,
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
    CustomerregistrationModule,
    CustomerVerifyModule
  ],
  providers:[
    CustomerService,
    CustomerVerificationService,
    SystemUserService,
    GridPropertiesService,
    AlertdialogService,
    CommonService,
    UtilityService,
    ConfigService,
    AccountService,
    FileStoreService,
    ConfigurationService
  ]
})
export class CustomerverificationModule { }

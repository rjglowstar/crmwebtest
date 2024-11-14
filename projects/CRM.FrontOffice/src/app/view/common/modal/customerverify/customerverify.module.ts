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
import { ConfigurationService, CustomerService, CustomerVerificationService, SystemUserService } from '../../../../services';
import { CustomerVerifyRoutingModule } from './customerverify-routing.module';
import { CustomerVerifyComponent } from './customerverify.component';

@NgModule({
  declarations: [CustomerVerifyComponent],
  imports: [
    CommonModule,
    CustomerVerifyRoutingModule,
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
    TooltipModule
  ],
  providers: [
    CustomerService,
    CustomerVerificationService,
    SystemUserService,
    AlertdialogService,
    CommonService,
    UtilityService,
    ConfigService,
    AccountService,
    FileStoreService,
    ConfigurationService
  ],
  exports: [CustomerVerifyComponent]
})
export class CustomerVerifyModule { }

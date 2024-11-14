import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { DateInputModule, DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { DialogsModule } from '@progress/kendo-angular-dialog';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { GridModule } from '@progress/kendo-angular-grid';
import { IndicatorsModule } from '@progress/kendo-angular-indicators';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LabelModule } from '@progress/kendo-angular-label';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { PopupModule } from '@progress/kendo-angular-popup';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input-gg';
import { SharedDirectiveModule } from 'shared/directives';
import { CommonService, FileStoreService, UtilityService } from 'shared/services';
import { AlertdialogService, GridconfigurationModule } from 'shared/views';
import { CustomerService, CustomerVerificationService } from '../../../../services';
import { CustomerregistrationRoutingModule } from './customerregistration-routing.module';
import { CustomerregistrationComponent } from './customerregistration.component';

@NgModule({
  declarations: [CustomerregistrationComponent],
  imports: [
    CommonModule,
    CustomerregistrationRoutingModule,
    LayoutModule,
    InputsModule,
    DialogsModule,
    FormsModule,
    DropDownsModule,
    ButtonsModule,
    GridModule,
    SharedDirectiveModule,
    IndicatorsModule,
    PopupModule,
    GridconfigurationModule,
    LabelModule,
    NgxIntlTelInputModule,
    DateInputModule,
    DateInputsModule    
  ],
  providers: [CustomerVerificationService,
    FileStoreService,
    CustomerService,
    UtilityService,
    AlertdialogService,
    CommonService],
  exports: [CustomerregistrationComponent]
})
export class CustomerregistrationModule { }

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
import { AppPreloadService, CustomerPreferenceService, CustomerService, GridPropertiesService, SystemUserService, WatchlistService } from '../../services';
import { CustomerprofileRoutingModule } from './customerprofile-routing.module';
import { CustomerprofileComponent } from './customerprofile.component';


@NgModule({
  declarations: [CustomerprofileComponent],
  imports: [
    CommonModule,
    CustomerprofileRoutingModule,
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
    GridPropertiesService,
    AlertdialogService,
    CommonService,
    UtilityService,
    ConfigService,
    AccountService,
    SystemUserService,
    FileStoreService,
    CustomerPreferenceService,
    AppPreloadService,
    WatchlistService
  ],
})
export class CustomerprofileModule { }

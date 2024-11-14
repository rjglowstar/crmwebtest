import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { SalesSheetRoutingModule } from './salessheet-routing.module';
import { SalesSheetComponent } from './salessheet.component';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { GridModule } from '@progress/kendo-angular-grid';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { FormsModule } from '@angular/forms';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { PopupModule } from '@progress/kendo-angular-popup';
import { NotificationModule } from '@progress/kendo-angular-notification';
import { LabelModule } from '@progress/kendo-angular-label';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { AlertdialogService, GridconfigurationModule, MediaModule } from 'shared/views';
import { AppPreloadService, CommonService, ConfigService, UtilityService } from 'shared/services';
import { SharedDirectiveModule } from 'shared/directives';
import { IntlModule } from '@progress/kendo-angular-intl'; 
import { CustomerService, GridPropertiesService, MasterConfigService, SalesSheetService, SupplierService, SystemUserService } from '../../services';
import { SearchdetailModule } from '../common/searchdetail/searchdetail.module';


@NgModule({
  declarations: [SalesSheetComponent],
  imports: [
    CommonModule,
    SalesSheetRoutingModule,
    DropDownsModule,
    ButtonsModule,
    InputsModule,
    LayoutModule,
    GridModule,
    DateInputsModule,
    FormsModule,
    DialogModule,
    PopupModule,
    NotificationModule,
    GridconfigurationModule,
    LabelModule,
    TooltipModule,
    SharedDirectiveModule,
    MediaModule,
    SearchdetailModule,
    IntlModule
  ],
  providers:[
    SalesSheetService,
    SupplierService,
    CustomerService,
    SystemUserService,
    AlertdialogService,
    AppPreloadService,
    UtilityService,
    ConfigService,
    GridPropertiesService,
    MasterConfigService,
    CommonService,
    DatePipe
  ]
})
export class SalesSheetModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { KapananalysisRoutingModule } from './kapananalysis-routing.module';
import { KapananalysisComponent } from './kapananalysis.component';
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
import { EmployeeService, GridPropertiesService, KapanAnalysisService, MasterConfigService, OrganizationService } from '../../services';
import { AlertdialogService, GridconfigurationModule } from 'shared/views';
import { AppPreloadService, CommonService, ConfigService, UtilityService } from 'shared/services';
import { SharedDirectiveModule } from 'shared/directives';
import { IntlModule } from '@progress/kendo-angular-intl'; 


@NgModule({
  declarations: [KapananalysisComponent],
  imports: [
    CommonModule,
    KapananalysisRoutingModule,
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
    IntlModule
  ],
  providers:[
    KapanAnalysisService,
    AlertdialogService,
    AppPreloadService,
    UtilityService,
    ConfigService,
    GridPropertiesService,
    MasterConfigService,
    CommonService,
    OrganizationService,
    EmployeeService,
  ]
})
export class KapananalysisModule { }

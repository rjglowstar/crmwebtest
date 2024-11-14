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
import { LabelModule } from '@progress/kendo-angular-label';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { PopupModule } from '@progress/kendo-angular-popup';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { SharedDirectiveModule } from 'shared/directives';
import { AppPreloadService, CommonService, ConfigService, FileStoreService, UtilityService } from 'shared/services';
import { AlertdialogService, GridconfigurationModule } from 'shared/views';
import { GridPropertiesService, WeeklysummaryService } from '../../services';
import { WeeklysummaryRoutingModule } from './weeklysummary-routing.module';
import { WeeklysummaryComponent } from './weeklysummary.component';

@NgModule({
  declarations: [WeeklysummaryComponent],
  imports: [
    CommonModule,
    WeeklysummaryRoutingModule,
    SharedDirectiveModule,
    InputsModule,
    DialogModule,
    FormsModule,
    DropDownsModule,
    ButtonsModule,
    LabelModule,
    LayoutModule,
    DateInputsModule,
    GridModule,
    PopupModule,
    TooltipModule,
    IndicatorsModule,
    GridconfigurationModule,
  ],
  providers:[
    CommonService,
    UtilityService,
    AlertdialogService,
    WeeklysummaryService,
    GridPropertiesService,
    AppPreloadService,
    ConfigService,
    UtilityService
  ]
})
export class WeeklysummaryModule { }

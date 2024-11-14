import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { DialogsModule } from '@progress/kendo-angular-dialog';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { FormsModule } from '@angular/forms';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { ButtonGroupModule, ButtonsModule } from '@progress/kendo-angular-buttons';
import { GridModule } from '@progress/kendo-angular-grid';
import { IndicatorsModule } from '@progress/kendo-angular-indicators';
import { LabelModule } from '@progress/kendo-angular-label';
import { PopupModule } from '@progress/kendo-angular-popup';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { AlertdialogService, GridconfigurationModule } from 'shared/views';
import { SharedDirectiveModule } from 'shared/directives';
import { GridPropertiesService, LoginhistoryService } from '../../services';
import { CommonService, ConfigService, UtilityService } from 'shared/services';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { GeotrackingRoutingModule } from './geotracking-routing.module';
import { GeotrackingComponent } from './geotracking.component';
import { DialogModule } from '@progress/kendo-angular-dialog';

@NgModule({
  declarations: [GeotrackingComponent],
  imports: [
    CommonModule,
    GeotrackingRoutingModule,
    DropDownsModule,
    ButtonsModule,
    InputsModule,
    LayoutModule,
    DateInputsModule,
    DialogModule,
    GridModule,
    PopupModule,
    GridconfigurationModule,
    TooltipModule,
    ButtonGroupModule,
    DialogsModule,
    FormsModule,
    IndicatorsModule,
    LabelModule,
    SharedDirectiveModule
  ],
  providers: [
    GridPropertiesService,
    UtilityService,
    AlertdialogService,
    ConfigService,
    LoginhistoryService,
    CommonService
  ]
})
export class GeotrackingModule { }

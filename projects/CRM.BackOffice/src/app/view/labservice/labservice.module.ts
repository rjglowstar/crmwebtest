import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LabserviceComponent } from './labservice.component';
import { LabserviceRoutingModule } from './labservice-routing.module';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { GridModule } from '@progress/kendo-angular-grid';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { FormsModule } from '@angular/forms';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { IndicatorsModule } from '@progress/kendo-angular-indicators';
import { NotificationModule } from '@progress/kendo-angular-notification';
import { PopupModule } from '@progress/kendo-angular-popup';
import { SharedDirectiveModule } from 'shared/directives';
import { GridPropertiesService, LabService } from '../../services';
import { CommonService, UtilityService } from 'shared/services';
import { TooltipModule } from '@progress/kendo-angular-tooltip';

@NgModule({
  declarations: [
    LabserviceComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    LabserviceRoutingModule,
    DropDownsModule,
    ButtonsModule,
    InputsModule,
    LayoutModule,
    DateInputsModule,
    DialogModule,
    GridModule,
    PopupModule,
    NotificationModule,
    IndicatorsModule,
    SharedDirectiveModule,
    TooltipModule
  ],
  providers: [
    GridPropertiesService,
    CommonService,
    LabService,
    UtilityService
  ]
})
export class LabserviceModule { }

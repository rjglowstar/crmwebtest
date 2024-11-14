import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { DialogsModule } from '@progress/kendo-angular-dialog';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { FormsModule } from '@angular/forms';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { GridModule } from '@progress/kendo-angular-grid';
import { IndicatorsModule } from '@progress/kendo-angular-indicators';
import { LabelModule } from '@progress/kendo-angular-label';
import { NotificationModule } from '@progress/kendo-angular-notification';
import { PopupModule } from '@progress/kendo-angular-popup';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { GridPropertiesService, SystemUserService, VowStatisticService } from '../../services';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { VowStatisticComponent } from './vowstatistic.component';
import { VowStatisticRoutingModule } from './vowstatistic-routing.module';
import { SharedDirectiveModule } from 'shared/directives';
import { AlertdialogService, GridconfigurationModule } from 'shared/views';
import { CommonService, ConfigService, UtilityService } from 'shared/services';


@NgModule({
  declarations: [VowStatisticComponent],
  imports: [
    CommonModule,
    VowStatisticRoutingModule,
    LayoutModule,
    InputsModule,
    DialogsModule,
    FormsModule,
    DropDownsModule,
    ButtonsModule,
    GridModule,
    IndicatorsModule,
    PopupModule,
    NotificationModule,
    LabelModule,
    TooltipModule,
    DateInputsModule,
    SharedDirectiveModule,
    GridconfigurationModule,
  ],
  providers: [
    GridPropertiesService,
    UtilityService,
    AlertdialogService,
    ConfigService,
    VowStatisticService,
    SystemUserService,
    CommonService
  ]
})
export class VowStatisticModule { }

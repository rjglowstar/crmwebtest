import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlanmakerComponent } from './planmaker.component';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { GridModule } from '@progress/kendo-angular-grid';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { PlanmakerRoutingModule } from './planmaker-routing.module';
import { FormsModule } from '@angular/forms';
import { IndicatorsModule } from '@progress/kendo-angular-indicators';
import { NotificationModule } from '@progress/kendo-angular-notification';
import { PopupModule } from '@progress/kendo-angular-popup';
import { LabelModule } from "@progress/kendo-angular-label";
import { AlertdialogService, GridconfigurationModule } from 'shared/views';
import { SharedDirectiveModule } from 'shared/directives';
import { CommonService, PricingService, UtilityService } from 'shared/services';
import { GridPropertiesService } from '../../../../services';

@NgModule({
  declarations: [PlanmakerComponent],
  imports: [
    CommonModule,
    ButtonsModule,
    GridModule,
    InputsModule,
    LayoutModule,
    DropDownsModule,
    PlanmakerRoutingModule,
    DateInputsModule,
    DialogModule,
    FormsModule,
    SharedDirectiveModule,
    IndicatorsModule,
    PopupModule,
    NotificationModule,   
    GridconfigurationModule,
    LabelModule
  ],
  providers: [
    GridPropertiesService,    
    CommonService,
    UtilityService,
    AlertdialogService,
    PricingService],
  exports: [PlanmakerComponent],
})
export class PlanmakerModule { }

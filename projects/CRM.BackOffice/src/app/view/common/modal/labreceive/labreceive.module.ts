import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridModule } from '@progress/kendo-angular-grid';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { FormsModule } from '@angular/forms';
import { NotificationModule } from '@progress/kendo-angular-notification';
import { PopupModule } from '@progress/kendo-angular-popup';
import { LabelModule } from "@progress/kendo-angular-label";
import { LabreceiveRoutingModule } from './labreceive-routing.module';
import { LabreceiveComponent } from './labreceive.component';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { IndicatorsModule } from '@progress/kendo-angular-indicators';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { AlertdialogService, GridconfigurationModule } from 'shared/views';
import { SharedDirectiveModule } from 'shared/directives';
import { EmployeeCriteriaService, GridPropertiesService, MasterConfigService, OrganizationService } from '../../../../services';
import { CommonService, UtilityService } from 'shared/services';

@NgModule({
  declarations: [LabreceiveComponent],
  imports: [
    CommonModule,
    GridModule,
    DropDownsModule,
    InputsModule,
    LayoutModule,
    ButtonsModule,
    DialogModule,
    FormsModule,
    PopupModule,
    NotificationModule, 
    GridconfigurationModule,
    LabelModule,
    LabreceiveRoutingModule,
    DateInputsModule,
    SharedDirectiveModule,
    IndicatorsModule,  
    TooltipModule,
  ],
  providers: [
    GridPropertiesService,   
    CommonService,
    UtilityService,
    MasterConfigService,
    OrganizationService, 
    AlertdialogService,
    EmployeeCriteriaService 
    ],
    exports: [LabreceiveComponent],
})
export class LabreceiveModule { }
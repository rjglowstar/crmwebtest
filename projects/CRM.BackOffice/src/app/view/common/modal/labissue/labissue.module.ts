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
import { LabelModule } from "@progress/kendo-angular-label";
import { LayoutModule } from '@progress/kendo-angular-layout';
import { NotificationModule } from '@progress/kendo-angular-notification';
import { PopupModule } from '@progress/kendo-angular-popup';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { GridPropertiesService, MasterConfigService, OrganizationService } from 'projects/CRM.BackOffice/src/app/services';
import { SharedDirectiveModule } from 'shared/directives';
import { CommonService, FileStoreService, UtilityService } from 'shared/services';
import { AlertdialogService, GridconfigurationModule } from 'shared/views';
import { LabissueRoutingModule } from './labissue-routing.module';
import { LabissueComponent } from './labissue.component';

@NgModule({
  declarations: [LabissueComponent],
  imports: [
    CommonModule,
    LabissueRoutingModule,
    GridModule,
    DropDownsModule,
    InputsModule,
    LayoutModule,
    ButtonsModule,
    DateInputsModule,
    DialogModule,
    FormsModule,
    SharedDirectiveModule,
    IndicatorsModule,
    PopupModule,
    NotificationModule,
    GridconfigurationModule,
    TooltipModule,
    LabelModule
  ],
  providers: [
    GridPropertiesService,
    CommonService,
    UtilityService,
    MasterConfigService,
    OrganizationService,
    AlertdialogService,    
    FileStoreService
  ],
  exports: [LabissueComponent],
})
export class LabissueModule { }
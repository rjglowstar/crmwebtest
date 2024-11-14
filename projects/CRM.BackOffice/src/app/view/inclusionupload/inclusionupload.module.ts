import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InclusionuploadRoutingModule } from './inclusionupload-routing.module';
import { InclusionuploadComponent } from './inclusionupload.component';
import { FormsModule } from '@angular/forms';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { GridModule } from '@progress/kendo-angular-grid';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { PopupModule } from '@progress/kendo-angular-popup';
import { AlertdialogService, GridconfigurationModule } from 'shared/views';
import { SharedDirectiveModule } from 'shared/directives';
import { MeasureGradeService, UtilityService } from 'shared/services';
import { CommuteService, GridPropertiesService, InclusionuploadService, MasterConfigService } from '../../services';

@NgModule({
  declarations: [InclusionuploadComponent],
  imports: [
    CommonModule,
    InclusionuploadRoutingModule,
    ButtonsModule,
    InputsModule,
    LayoutModule,
    DateInputsModule,
    DialogModule,
    GridModule,
    DropDownsModule,
    FormsModule,
    TooltipModule,
    GridconfigurationModule ,
    PopupModule,
    SharedDirectiveModule
  ],
  providers: [
    InclusionuploadService,
    AlertdialogService,
    UtilityService,
    MasterConfigService,
    GridPropertiesService,
    MeasureGradeService,
    CommuteService
  ]
})
export class InclusionuploadModule { }

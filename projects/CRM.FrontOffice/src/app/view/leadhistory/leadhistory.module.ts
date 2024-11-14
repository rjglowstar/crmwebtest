import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LeadhistoryRoutingModule } from './leadhistory-routing.module';
import { LeadhistoryComponent } from './leadhistory.component';
import { IndicatorsModule } from '@progress/kendo-angular-indicators';
import { SharedDirectiveModule } from 'shared/directives';
import { FormsModule } from '@angular/forms';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { LeadmodalModule } from '../common/modal/leadmodal/leadmodal.module';
import { GridModule } from '@progress/kendo-angular-grid';
import { AlertdialogService, GridconfigurationModule } from 'shared/views';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { PopupModule } from '@progress/kendo-angular-popup';
import { GridPropertiesService, MasterConfigService } from '../../services';
import { CommonService, MeasureGradeService, UtilityService } from 'shared/services';


@NgModule({
  declarations: [LeadhistoryComponent],
  imports: [
    CommonModule,
    LeadhistoryRoutingModule,
    IndicatorsModule,
    SharedDirectiveModule,
    FormsModule,
    ButtonsModule,
    DateInputsModule,
    DialogModule,
    DateInputsModule,
    LayoutModule,
    PopupModule,
    LeadmodalModule,
    DropDownsModule,
    GridModule,
    LayoutModule,
    GridconfigurationModule,
  ],
  providers: [
    GridPropertiesService,
    AlertdialogService,
    UtilityService,
    MasterConfigService,
    MeasureGradeService,
    CommonService,
  ]
})
export class LeadhistoryModule { }

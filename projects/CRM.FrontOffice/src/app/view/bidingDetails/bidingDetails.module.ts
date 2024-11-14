import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertdialogService } from 'shared/views/common/alertdialog/alertdialog.service';
import { BidingDetailsComponent } from './bidingDetails.component';
import { IndicatorsModule } from '@progress/kendo-angular-indicators';
import { SharedDirectiveModule } from 'shared/directives';
import { GridconfigurationModule } from 'shared/views';
import { GridModule } from '@progress/kendo-angular-grid';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { GridPropertiesService, MasterConfigService } from '../../services';
import { FormsModule } from '@angular/forms';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { LeadmodalModule } from '../common/modal/leadmodal/leadmodal.module';
import { PopupModule } from '@progress/kendo-angular-popup';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { CommonService, MeasureGradeService, UtilityService } from 'shared/services';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { BidingDetailsRoutingModule } from './bidingDetails-routing.module';


@NgModule({
  declarations: [BidingDetailsComponent],
  imports: [
    CommonModule,
    BidingDetailsRoutingModule,
    IndicatorsModule,
    SharedDirectiveModule,
    FormsModule,
    ButtonsModule,
    DateInputsModule,
    DialogModule,
    InputsModule,
    LayoutModule,
    PopupModule,
    LeadmodalModule,
    DropDownsModule,
    GridModule,
    LayoutModule,
    GridconfigurationModule
  ],
  providers: [
    GridPropertiesService,
    AlertdialogService,
    UtilityService,
    MasterConfigService,
    MeasureGradeService,
    CommonService,    
  ],
  exports: [BidingDetailsComponent],
})
export class BidingDetailsModule { }
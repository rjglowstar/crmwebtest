import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { LeaddetailsRoutingModule } from './leaddetails-routing.module';
import { LeaddetailsComponent } from './leaddetails.component';
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
import { GridconfigurationModule } from 'shared/views';


@NgModule({
  declarations: [LeaddetailsComponent],
  imports: [
    CommonModule,
    LeaddetailsRoutingModule,
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
  exports: [
    LeaddetailsComponent
  ],
  providers:[DatePipe]
})
export class LeaddetailsModule { }

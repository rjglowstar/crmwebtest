import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { GridModule } from '@progress/kendo-angular-grid';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { GridconfigurationModule } from 'shared/views';
import { LeadrejectedstonemasterRoutingModule } from './leadrejectedstonemaster-routing.module';
import { LeadrejectedstonemasterComponent } from './leadrejectedstonemaster.component';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { IndicatorsModule } from '@progress/kendo-angular-indicators';
import { LabelModule } from '@progress/kendo-angular-label';
import { PopupModule } from '@progress/kendo-angular-popup';
import { TooltipModule } from '@progress/kendo-angular-tooltip';


@NgModule({
  declarations: [LeadrejectedstonemasterComponent],
  imports: [
    CommonModule,
    LeadrejectedstonemasterRoutingModule,
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
  ]
})
export class LeadrejectedstonemasterModule { }

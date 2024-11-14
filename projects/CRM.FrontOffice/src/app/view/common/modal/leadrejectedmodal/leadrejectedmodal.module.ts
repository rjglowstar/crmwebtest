import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LeadrejectedmodalRoutingModule } from './leadrejectedmodal-routing.module';
import { LeadrejectedmodalComponent } from './leadrejectedmodal.component';
import { FormsModule } from '@angular/forms';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { DialogsModule } from '@progress/kendo-angular-dialog';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { GridModule } from '@progress/kendo-angular-grid';
import { IndicatorsModule } from '@progress/kendo-angular-indicators';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LabelModule } from '@progress/kendo-angular-label';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { PopupModule } from '@progress/kendo-angular-popup';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { SharedDirectiveModule } from 'shared/directives';


@NgModule({
  declarations: [LeadrejectedmodalComponent],
  imports: [
    CommonModule,
    LeadrejectedmodalRoutingModule,
    LayoutModule,
    InputsModule,
    DialogsModule,
    FormsModule,
    DropDownsModule,
    ButtonsModule,
    GridModule,
    SharedDirectiveModule,
    IndicatorsModule,
    PopupModule,
    LabelModule,
    TooltipModule,
  ],
  exports: [
    LeadrejectedmodalComponent
  ]
})
export class LeadrejectedmodalModule { }

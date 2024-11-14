import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RfidstocktallyboxRoutingModule } from './rfidstocktallybox-routing.module';
import { RfidstocktallyboxComponent } from './rfidstocktallybox.component';
import { FormsModule } from '@angular/forms';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { GridModule } from '@progress/kendo-angular-grid';
import { IndicatorsModule } from '@progress/kendo-angular-indicators';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LabelModule } from '@progress/kendo-angular-label';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { NotificationModule } from '@progress/kendo-angular-notification';
import { PopupModule } from '@progress/kendo-angular-popup';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { SharedDirectiveModule } from 'shared/directives';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';


@NgModule({
  declarations: [RfidstocktallyboxComponent],
  imports: [
    CommonModule,
    RfidstocktallyboxRoutingModule,
    DropDownsModule,
    ButtonsModule,
    InputsModule,
    LayoutModule,
    GridModule,
    FormsModule,
    DialogModule,
    PopupModule,
    NotificationModule,
    IndicatorsModule,
    SharedDirectiveModule,
    LabelModule,
    TooltipModule,
    DateInputsModule,
  ],
  exports: [
    RfidstocktallyboxComponent,
  ]
})
export class RfidstocktallyboxModule { }

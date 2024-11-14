import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { GridModule } from '@progress/kendo-angular-grid';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LabelModule } from '@progress/kendo-angular-label';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { NotificationModule } from '@progress/kendo-angular-notification';
import { PopupModule } from '@progress/kendo-angular-popup';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { PurchaseanalysisRoutingModule } from './purchaseanalysis-routing.module';
import { PurchaseanalysisComponent } from './purchaseanalysis.component';


@NgModule({
  declarations: [PurchaseanalysisComponent],
  imports: [
    CommonModule,
    PurchaseanalysisRoutingModule,
    DropDownsModule,
    ButtonsModule,
    InputsModule,
    LayoutModule,
    GridModule,
    DateInputsModule,
    FormsModule,
    DialogModule,
    PopupModule,
    NotificationModule,
    LabelModule,
    TooltipModule,
  ],
  providers: [
    AlertdialogService,
    UtilityService,

  ],
})
export class PurchaseanalysisModule { }

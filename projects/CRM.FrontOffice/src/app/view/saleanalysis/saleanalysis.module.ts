import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SaleanalysisRoutingModule } from './saleanalysis-routing.module';
import { SaleanalysisComponent } from './saleanalysis.component';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { DialogsModule } from '@progress/kendo-angular-dialog';
import { FormsModule } from '@angular/forms';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { GridModule } from '@progress/kendo-angular-grid';
import { IndicatorsModule } from '@progress/kendo-angular-indicators';
import { NotificationModule } from '@progress/kendo-angular-notification';
import { LabelModule } from '@progress/kendo-angular-label';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { PopupModule } from '@progress/kendo-angular-popup';
import { AlertdialogService, MediaModule } from 'shared/views';
import { ConfigService } from 'shared/services';

@NgModule({
  declarations: [SaleanalysisComponent],
  imports: [
    CommonModule,
    SaleanalysisRoutingModule,
    LayoutModule,
    InputsModule,
    DialogsModule,
    FormsModule,
    DropDownsModule,
    ButtonsModule,
    GridModule,
    IndicatorsModule,
    PopupModule,
    NotificationModule,
    LabelModule,
    TooltipModule,
    DateInputsModule,
    MediaModule
  ],
  providers: [
    AlertdialogService,
    ConfigService,
  ]
})
export class SaleanalysisModule { }

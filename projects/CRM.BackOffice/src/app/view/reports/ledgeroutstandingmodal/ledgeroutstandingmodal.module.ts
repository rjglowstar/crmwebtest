import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LedgeroutstandingmodalRoutingModule } from './ledgeroutstandingmodal-routing.module';
import { LedgeroutstandingmodalComponent } from './ledgeroutstandingmodal.component';
import { FormsModule } from '@angular/forms';
import { ButtonModule, ButtonsModule } from '@progress/kendo-angular-buttons';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { ExcelModule, GridModule } from '@progress/kendo-angular-grid';
import { IndicatorsModule } from '@progress/kendo-angular-indicators';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { NotificationModule } from '@progress/kendo-angular-notification';
import { PopupModule } from '@progress/kendo-angular-popup';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { SharedDirectiveModule } from 'shared/directives';


@NgModule({
  declarations: [LedgeroutstandingmodalComponent],
  imports: [
    CommonModule,
    LedgeroutstandingmodalRoutingModule,
    FormsModule,
    DropDownsModule,
    ButtonModule,
    ButtonsModule,
    InputsModule,
    LayoutModule,
    DateInputsModule,
    DialogModule,
    GridModule,
    PopupModule,
    NotificationModule,
    IndicatorsModule,
    SharedDirectiveModule,
    TooltipModule,
    ExcelModule,
  ],
  exports: [LedgeroutstandingmodalComponent]
})
export class LedgeroutstandingmodalModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RojmelRoutingModule } from './rojmel-routing.module';
import { RojmelComponent } from './rojmel.component';
import { DateInputsModule, DateRangeService } from '@progress/kendo-angular-dateinputs';
import { ButtonModule, ButtonsModule } from '@progress/kendo-angular-buttons';
import { FormsModule } from '@angular/forms';
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
import { CommonService, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { LedgerService, LedgerSummaryService, TransactionService } from '../../../services';
import { ExcelExportModule } from '@progress/kendo-angular-excel-export';


@NgModule({
  declarations: [RojmelComponent],
  imports: [
    CommonModule,
    RojmelRoutingModule,
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
    ExcelExportModule,
  ],
  providers: [
    LedgerService,
    LedgerSummaryService,
    CommonService,
    UtilityService,
    AlertdialogService,
    DateRangeService,
    TransactionService
  ],
  exports: [RojmelComponent],
})
export class RojmelModule { }

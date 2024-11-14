import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportsRoutingModule } from './reports-routing.module';
import { ReportsComponent } from './reports.component';
import { DateInputsModule, DateRangeService } from '@progress/kendo-angular-dateinputs';
import { ButtonModule, ButtonsModule } from '@progress/kendo-angular-buttons';
import { FormsModule } from '@angular/forms';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { GridModule } from '@progress/kendo-angular-grid';
import { IndicatorsModule } from '@progress/kendo-angular-indicators';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { NotificationModule } from '@progress/kendo-angular-notification';
import { PopupModule } from '@progress/kendo-angular-popup';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { SharedDirectiveModule } from 'shared/directives';
import { CommonService, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { LedgerService, LedgerSummaryService, TransactionService } from '../../services';
import { LedgeroutstandingmodalModule } from './ledgeroutstandingmodal/ledgeroutstandingmodal.module';
import { RojmelModule } from './rojmel/rojmel.module';
import { SalesStatisticsModule } from './salesstatistics/salesstatistics.module';


@NgModule({
  declarations: [ReportsComponent],
  imports: [
    CommonModule,
    ReportsRoutingModule,
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
    LedgeroutstandingmodalModule,
    RojmelModule,
    SalesStatisticsModule
  ],
  providers: [
    LedgerService,
    LedgerSummaryService,
    CommonService,
    UtilityService,
    AlertdialogService,
    DateRangeService,
    TransactionService
  ]
})
export class ReportsModule { }

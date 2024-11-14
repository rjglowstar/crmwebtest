import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { SalesStatisticsRoutingModule } from './salesstatistics-routing.module';
import { SalesStatisticsComponent } from './salesstatistics.component';
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
import { CommonService, ConfigService, UtilityService } from 'shared/services';
import { AlertdialogService, GridconfigurationModule } from 'shared/views';
import { GridPropertiesService, LedgerService, OrderService, SalesStatisticsService, TransactionService } from '../../../services';
import { ReceiptModule } from '../../common/modal/receipt/receipt.module';
import { SalesModule } from '../../common/modal/sales/sales.module';


@NgModule({
  declarations: [SalesStatisticsComponent],
  imports: [
    CommonModule,
    SalesStatisticsRoutingModule,
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
    ReceiptModule,
    SalesModule,
    GridconfigurationModule,
  ],
  providers: [
    DatePipe,
    LedgerService,
    OrderService,
    CommonService,
    UtilityService,
    AlertdialogService,
    DateRangeService,
    SalesStatisticsService,
    TransactionService,
    ConfigService,
    GridPropertiesService
  ],
  exports: [SalesStatisticsComponent],
})
export class SalesStatisticsModule { }

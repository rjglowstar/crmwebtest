import { CommonModule, DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { GridModule } from '@progress/kendo-angular-grid';
import { IndicatorsModule } from '@progress/kendo-angular-indicators';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { PopupModule } from '@progress/kendo-angular-popup';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { WebcamModule } from 'ngx-webcam';
import { SharedDirectiveModule } from 'shared/directives';
import { ConfigService, LogService, UtilityService } from 'shared/services';
import { AlertdialogService, GridconfigurationModule } from 'shared/views';
import { EmployeeService, GridPropertiesService, LedgerService, OrderService } from '../../services';
import { LedgermodalModule } from '../common/modal/ledger-modal/ledger-modal.module';
import { SalesModule } from '../common/modal/sales/sales.module';
import { OrderRoutingModule } from './order-routing.module';
import { OrderComponent } from './order.component';

@NgModule({
  declarations: [OrderComponent],
  imports: [
    CommonModule,
    OrderRoutingModule,
    DropDownsModule,
    ButtonsModule,
    InputsModule,
    LayoutModule,
    DateInputsModule,
    DialogModule,
    GridModule,
    PopupModule,
    FormsModule,
    IndicatorsModule,
    SharedDirectiveModule,
    GridconfigurationModule,
    TooltipModule,
    SalesModule,
    LedgermodalModule,
    WebcamModule
  ],
  providers: [
    GridPropertiesService,
    UtilityService,
    ConfigService,
    AlertdialogService,
    OrderService,
    LedgerService,
    DatePipe,
    LogService,
    EmployeeService
  ],
})
export class OrderModule { }
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BalancesheetRoutingModule } from './balancesheet-routing.module';
import { BalancesheetComponent } from './balancesheet.component';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
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
import { BalanceSheetService } from '../../services';


@NgModule({
  declarations: [BalancesheetComponent],
  imports: [
    CommonModule,
    BalancesheetRoutingModule,
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
  ],
  providers: [
    CommonService,
    UtilityService,
    AlertdialogService,
    BalanceSheetService
  ]
})
export class BalancesheetModule { }

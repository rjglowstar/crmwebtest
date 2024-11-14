import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ButtonGroupModule, ButtonsModule } from '@progress/kendo-angular-buttons';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
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
import { FormsModule } from '@angular/forms';

import { SharedDirectiveModule } from 'shared/directives';
import { LedgerSummaryRoutingModule } from './ledgersummary-routing.module';
import { LedgerSummaryComponent } from './ledgersummary.component';
import { AlertdialogService, GridconfigurationModule } from 'shared/views';
import { CommonService, UtilityService, ConfigService, FileStoreService } from 'shared/services';
import { AccountingconfigService, GridPropertiesService, LedgerService, LedgerSummaryService } from '../../services';


@NgModule({
  declarations: [LedgerSummaryComponent],
  imports: [
    CommonModule,
    LedgerSummaryRoutingModule,
    DialogModule,
    FormsModule,
    DropDownsModule,
    ButtonsModule,
    ButtonGroupModule,
    InputsModule,
    LabelModule,
    LayoutModule,
    DateInputsModule,
    GridModule,
    PopupModule,
    NotificationModule,
    IndicatorsModule,
    TooltipModule,
    SharedDirectiveModule,
    GridconfigurationModule,
  ],
  providers: [
    GridPropertiesService,
    CommonService,
    UtilityService,
    ConfigService,
    FileStoreService,
    AlertdialogService,
    AccountingconfigService,
    LedgerSummaryService,
    LedgerService
  ]
})
export class LedgerSummaryModule { }

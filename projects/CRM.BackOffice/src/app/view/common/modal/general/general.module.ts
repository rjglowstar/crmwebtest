import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeneralRoutingModule } from './general-routing.module';
import { GeneralComponent } from './general.component';
import { FormsModule } from '@angular/forms';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { GridModule } from '@progress/kendo-angular-grid';
import { AccountingconfigService, LedgerService, LedgerSummaryService, OrganizationService, PrintAccInvoiceFormat, TransactionService } from '../../../../services';
import { AppPreloadService, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { SharedDirectiveModule } from 'shared/directives';

@NgModule({
  declarations: [GeneralComponent],
  imports: [
    CommonModule,
    GeneralRoutingModule,
    FormsModule,
    InputsModule,
    LayoutModule,
    DialogModule,
    DropDownsModule,
    DateInputsModule,
    ButtonsModule,
    TooltipModule,
    GridModule,
    SharedDirectiveModule
  ],
  exports: [GeneralComponent],
  providers: [
    PrintAccInvoiceFormat,
    UtilityService,
    AlertdialogService,
    LedgerService,
    AccountingconfigService,
    TransactionService,
    OrganizationService,
    AppPreloadService,
    LedgerSummaryService
  ],
})
export class GeneralModule { }
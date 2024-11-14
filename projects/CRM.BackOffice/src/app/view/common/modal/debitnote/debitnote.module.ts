import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DebitNoteComponent } from './debitnote.component';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { GridModule } from '@progress/kendo-angular-grid';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { DebitNoteRoutingModule } from './debitnote-routing.module';
import { FormsModule } from '@angular/forms';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { AccountingconfigService, InventoryService, LedgerService, LogisticService, MasterConfigService, OrganizationService, PrintInvoiceFormat, TransactionService, TransactItemService } from '../../../../services';
import { AlertdialogService } from 'shared/views';
import { UtilityService } from 'shared/services';
import { SharedDirectiveModule } from 'shared/directives';
import { LabelModule } from '@progress/kendo-angular-label';

@NgModule({
  declarations: [DebitNoteComponent],
  imports: [
    DebitNoteRoutingModule,
    CommonModule,
    FormsModule,
    InputsModule,
    LayoutModule,
    DialogModule,
    DropDownsModule,
    DateInputsModule,
    ButtonsModule,
    TooltipModule,
    GridModule,
    SharedDirectiveModule,
    LabelModule
  ],
  providers: [
    AlertdialogService,
    UtilityService,
    AccountingconfigService,
    TransactItemService,
    LedgerService,
    TransactionService,
    LogisticService,
    PrintInvoiceFormat,
    OrganizationService,
    InventoryService,
    MasterConfigService
  ],
  exports: [DebitNoteComponent],
})

export class DebitNoteModule { }
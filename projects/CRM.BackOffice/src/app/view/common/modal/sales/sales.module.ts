import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalesComponent } from './sales.component';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { GridModule } from '@progress/kendo-angular-grid';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { SalesRoutingModule } from './sales-routing.module';
import { FormsModule } from '@angular/forms';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { AccountingconfigService, InventoryService, LedgerService, LogisticService, MasterConfigService, OrganizationService, PrintInvoiceFormat, TransactionService, TransactItemService } from '../../../../services';
import { AlertdialogService } from 'shared/views';
import { UtilityService } from 'shared/services';
import { SharedDirectiveModule } from 'shared/directives';
import { LabelModule } from '@progress/kendo-angular-label';
import { GridPropertiesService } from '../../../../services';
import { GridconfigurationModule } from 'shared/views';
import { PopupModule } from '@progress/kendo-angular-popup';
import { HkInvoiceFormatService } from 'projects/CRM.BackOffice/src/app/services/utility/invoicesPrints/hKInvoiceFormat.service';
import { BelgiumInvoiceFormatService } from 'projects/CRM.BackOffice/src/app/services/utility/invoicesPrints/belgiumInvoiceFormat.service';
import { UaeInvoiceFormatService } from 'projects/CRM.BackOffice/src/app/services/utility/invoicesPrints/uaeInvoiceFormat.service';
import { IndiaInvoiceFormatService } from 'projects/CRM.BackOffice/src/app/services/utility/invoicesPrints/indiaInvoiceFormat.service';

@NgModule({
  declarations: [SalesComponent],
  imports: [
    SalesRoutingModule,
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
    LabelModule,
    PopupModule,
    GridconfigurationModule,
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
    IndiaInvoiceFormatService,
    HkInvoiceFormatService,
    BelgiumInvoiceFormatService,
    UaeInvoiceFormatService,
    OrganizationService,
    InventoryService,
    MasterConfigService,
    GridPropertiesService,
  ],
  exports: [SalesComponent],
})

export class SalesModule { }
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionsRoutingModule } from './transactions-routing.module';
import { TransactionsComponent } from './transactions.component';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { FormsModule } from '@angular/forms';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { AlertdialogService, GridconfigurationModule } from 'shared/views';
import { AccountingconfigService, GridPropertiesService, LedgerService, TransactionService, TransactItemService } from '../../services';
import { ConfigService, UtilityService } from 'shared/services';
import { GridModule } from '@progress/kendo-angular-grid';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LabelModule } from '@progress/kendo-angular-label';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { PopupModule } from '@progress/kendo-angular-popup';
import { PurchaseModule } from '../common/modal/purchase/purchase.module';
import { SalesModule } from '../common/modal/sales/sales.module';
import { GeneralModule } from '../common/modal/general/general.module';
import { ContraVoucherModule } from '../common/modal/contravoucher/contravoucher.module';
import { CreditNoteModule } from '../common/modal/creditnote/creditnote.module';
import { DebitNoteModule } from '../common/modal/debitnote/debitnote.module';
import { ReceiptModule } from '../common/modal/receipt/receipt.module';
import { PaymentModule } from '../common/modal/payment/payment.module';
import { SharedDirectiveModule } from 'shared/directives';

@NgModule({
  declarations: [TransactionsComponent],
  imports: [
    CommonModule,
    TransactionsRoutingModule,
    GeneralModule,
    ReceiptModule,
    PaymentModule,
    PurchaseModule,
    SalesModule,
    ContraVoucherModule,
    CreditNoteModule,
    DebitNoteModule,
    ButtonsModule,
    InputsModule,
    LayoutModule,
    DateInputsModule,
    DialogModule,
    GridModule,
    DropDownsModule,
    FormsModule,
    TooltipModule,
    LabelModule,
    PopupModule,
    SharedDirectiveModule,
    GridconfigurationModule
  ],
  providers: [
    UtilityService,
    AccountingconfigService,
    AlertdialogService,
    LedgerService,
    ConfigService,
    GridPropertiesService,
    TransactItemService,
    TransactionService
  ]
})
export class TransactionsModule { }

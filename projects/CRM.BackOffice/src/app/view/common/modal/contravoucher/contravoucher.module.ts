import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContraVoucherRoutingModule } from './contravoucher-routing.module';
import { ContraVoucherComponent } from './contravoucher.component';
import { FormsModule } from '@angular/forms';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { GridModule } from '@progress/kendo-angular-grid';
import { LedgerService, AccountingconfigService, OrganizationService, TransactionService } from '../../../../services';
import { AppPreloadService, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { SharedDirectiveModule } from 'shared/directives';

@NgModule({
  declarations: [ContraVoucherComponent],
  imports: [
    CommonModule,
    ContraVoucherRoutingModule,
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
  ],
  providers: [
    UtilityService,
    AlertdialogService,
    LedgerService,
    AccountingconfigService,
    TransactionService,
    OrganizationService,
    AppPreloadService
  ],
  exports: [ContraVoucherComponent],
})
export class ContraVoucherModule { }
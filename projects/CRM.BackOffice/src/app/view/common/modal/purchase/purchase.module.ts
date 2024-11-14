import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PurchaseRoutingModule } from './purchase-routing.module';
import { PurchaseComponent } from './purchase.component';
import { FormsModule } from '@angular/forms';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { GridModule } from '@progress/kendo-angular-grid';
import { MeasureGradeService, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { AccountingconfigService, CommuteService, InventoryService, InventoryUploadService, InwardMemoService, LabService, LedgerService, MasterConfigService, OrderService, OrganizationService, TransactionService, TransactItemService } from '../../../../services';
import { LabelModule } from '@progress/kendo-angular-label';
import { SharedDirectiveModule } from 'shared/directives';


@NgModule({
  declarations: [PurchaseComponent],
  imports: [
    CommonModule,
    PurchaseRoutingModule,
    FormsModule,
    InputsModule,
    LayoutModule,
    DialogModule,
    DropDownsModule,
    DateInputsModule,
    ButtonsModule,
    TooltipModule,
    GridModule,
    LabelModule,
    SharedDirectiveModule,
  ],
  providers: [
    UtilityService,
    AlertdialogService,
    LedgerService,
    CommuteService,
    MasterConfigService,
    InventoryUploadService,
    AccountingconfigService,
    OrganizationService,
    TransactItemService,
    TransactionService,
    InventoryService,
    InwardMemoService,
    MeasureGradeService,
    LabService,
    OrderService
  ],
  exports: [PurchaseComponent],
})
export class PurchaseModule { }

import { CommonModule } from '@angular/common';
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
import { NotificationModule } from '@progress/kendo-angular-notification';
import { PopupModule } from '@progress/kendo-angular-popup';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input-gg';
import { SharedDirectiveModule } from 'shared/directives';
import { CommonService, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { AccountingconfigService, LedgerService } from '../../../../services';
import { CompanyModule } from '../company/company.module';
import { LedgermodalRoutingModule } from './ledger-modal-routing.module';
import { LedgermodalComponent } from './ledger-modal.component';
@NgModule({
  declarations: [LedgermodalComponent],
  imports: [
    CommonModule,
    LedgermodalRoutingModule,
    DropDownsModule,
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
    FormsModule,
    CompanyModule,
    NgxIntlTelInputModule,
  ],
  providers: [
    UtilityService,
    AlertdialogService,
    CommonService,
    AccountingconfigService,
    LedgerService,
  ],
  exports: [LedgermodalComponent]
})
export class LedgermodalModule { }

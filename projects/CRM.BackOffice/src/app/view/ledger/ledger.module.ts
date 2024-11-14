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
import { SharedDirectiveModule } from 'shared/directives';
import { CommonService, UtilityService } from 'shared/services';
import { AccountingconfigService, GridPropertiesService, LedgerService } from '../../services';
import { LedgermodalModule } from '../common/modal/ledger-modal/ledger-modal.module';
import { UserpermissionModule } from '../common/modal/userpermission/userpermission.module';
import { LedgerRoutingModule } from './ledger-routing.module';
import { LedgerdetailsComponent } from './ledgerdetails/ledgerdetails.component';
import { LedgerMasterComponent } from './ledgermaster/ledgermaster.component';

@NgModule({
  declarations: [
    LedgerMasterComponent,
    LedgerdetailsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    LedgerRoutingModule,
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
    UserpermissionModule,
    LedgermodalModule
  ],
  providers: [
    GridPropertiesService,
    CommonService,
    LedgerService,
    UtilityService,
    AccountingconfigService
  ]
})
export class LedgerModule { }

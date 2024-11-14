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
import { PopupModule } from '@progress/kendo-angular-popup';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { MemorequestService } from 'projects/CRM.BackOffice/src/app/services';
import { LedgermodalModule } from 'projects/CRM.BackOffice/src/app/view/common/modal/ledger-modal/ledger-modal.module';
import { MemoModule } from 'projects/CRM.BackOffice/src/app/view/common/modal/memo/memo.module';
import { QcrequestModalModule } from 'projects/CRM.BackOffice/src/app/view/common/modal/qcrequest-modal/qcrequest-modal.module';
import { LeadcancelmodalModule } from 'projects/CRM.FrontOffice/src/app/view/common/modal/leadcancelmodal/leadcancelmodal.module';
import { LeadcustomerrequestmodalModule } from 'projects/CRM.FrontOffice/src/app/view/common/modal/leadcustomerrequestmodal/leadcustomerrequestmodal.module';
import { LeadmodalModule } from 'projects/CRM.FrontOffice/src/app/view/common/modal/leadmodal/leadmodal.module';
import { LeadrejectedmodalModule } from 'projects/CRM.FrontOffice/src/app/view/common/modal/leadrejectedmodal/leadrejectedmodal.module';
import { LeadstonereleasemodalModule } from 'projects/CRM.FrontOffice/src/app/view/common/modal/leadstonereleasemodal/leadstonereleasemodal.module';
import { QcrequestdetailmodalModule } from 'projects/CRM.FrontOffice/src/app/view/common/modal/qcrequestdetailmodal/qcrequestdetailmodal.module';
import { SharedDirectiveModule } from 'shared/directives';
import { NotificationService, UtilityService } from 'shared/services';
import { AlertdialogService, GridconfigurationModule } from 'shared/views';
import { NotificationsRoutingModule } from './notifications-routing.module';
import { NotificationsComponent } from './notifications.component';


@NgModule({
  declarations: [NotificationsComponent],
  imports: [
    CommonModule,
    NotificationsRoutingModule,
    DropDownsModule,
    ButtonsModule,
    InputsModule,
    LayoutModule,
    DateInputsModule,
    DialogModule,
    GridModule,
    PopupModule,
    FormsModule,
    IndicatorsModule,
    SharedDirectiveModule,
    GridconfigurationModule,
    TooltipModule,
    LeadmodalModule,
    MemoModule,
    LedgermodalModule,
    LeadcustomerrequestmodalModule,
    LeadstonereleasemodalModule,
    LeadrejectedmodalModule,
    LeadcancelmodalModule,
    QcrequestdetailmodalModule,
    QcrequestModalModule,
  ],
  providers: [NotificationService,
    UtilityService,
    AlertdialogService,
    MemorequestService
  ]
})
export class NotificationsModule { }

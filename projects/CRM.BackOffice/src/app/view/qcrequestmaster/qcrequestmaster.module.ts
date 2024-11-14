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
import { SharedDirectiveModule } from 'shared/directives';
import { GridconfigurationModule } from 'shared/views';
import { QcrequestModalModule } from '../common/modal/qcrequest-modal/qcrequest-modal.module';
import { QcrequestmasterRoutingModule } from './qcrequestmaster-routing.module';
import { QcrequestmasterComponent } from './qcrequestmaster.component';


@NgModule({
  declarations: [QcrequestmasterComponent],
  imports: [
    CommonModule,
    QcrequestmasterRoutingModule,
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
    QcrequestModalModule,
    // MemoModule,
    // LedgermodalModule,
  ],
  providers: [
    // MemorequestService,
    // InventoryService,
    // UtilityService,
    // AlertdialogService,
    // AppPreloadService,
    // LedgerService,
  ]
})
export class QcrequestmasterModule { }

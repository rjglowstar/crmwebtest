import { CommonModule, DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { GridModule } from '@progress/kendo-angular-grid';
import { IndicatorsModule } from '@progress/kendo-angular-indicators';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LabelModule } from "@progress/kendo-angular-label";
import { LayoutModule } from '@progress/kendo-angular-layout';
import { NotificationModule } from '@progress/kendo-angular-notification';
import { PopupModule } from '@progress/kendo-angular-popup';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { SharedDirectiveModule } from 'shared/directives';
import { CommonService, FileStoreService, MeasureGradeService, PricingService, UtilityService } from 'shared/services';
import { AlertdialogService, GridconfigurationModule, MediaModule } from 'shared/views';
import { CommuteService, InclusionuploadService, GridPropertiesService, InventoryService, MasterConfigService, OrganizationService, ExportRequestService } from '../../services';
import { LabissueModule } from '../common/modal/labissue/labissue.module';
import { LabreceiveModule } from '../common/modal/labreceive/labreceive.module';
import { InventoryRoutingModule } from './inventory-routing.module';
import { InventoryComponent } from './inventory.component';

import { MemoModule } from '../common/modal/memo/memo.module';
import { SearchdetailModule } from '../common/searchdetail/searchdetail.module';

@NgModule({
  declarations: [InventoryComponent],
  imports: [
    CommonModule,
    InventoryRoutingModule,
    DropDownsModule,
    ButtonsModule,
    InputsModule,
    LayoutModule,
    GridModule,
    DateInputsModule,
    FormsModule,
    DialogModule,
    PopupModule,
    NotificationModule,
    IndicatorsModule,
    SharedDirectiveModule,
    GridconfigurationModule,
    LabelModule,
    LabissueModule,
    LabreceiveModule,
    TooltipModule,
    MemoModule,
    MediaModule,
    SearchdetailModule,
  ],
  providers: [
    GridPropertiesService,
    CommonService,
    InventoryService,
    UtilityService,
    MasterConfigService,
    OrganizationService,
    AlertdialogService,
    PricingService,
    DatePipe,
    FileStoreService,
    MeasureGradeService,
    InclusionuploadService,
    CommuteService,
    ExportRequestService
  ]
})
export class InventoryModule { }
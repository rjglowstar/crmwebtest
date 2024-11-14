import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MemoreturnRoutingModule } from './memoreturn-routing.module';
import { MemoreturnComponent } from './memoreturn.component';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { GridModule } from '@progress/kendo-angular-grid';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { FormsModule } from '@angular/forms';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { LabelModule } from '@progress/kendo-angular-label';
import { PopupModule } from '@progress/kendo-angular-popup';
import { CommuteService, GridPropertiesService, InventoryService, InventoryUploadService, InwardMemoService, LabService, LedgerService, LogisticService, MasterConfigService, OrganizationService, PrintMemoReturnFormat } from '../../services';
import { ConfigService, MeasureGradeService, PricingService, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';

@NgModule({
  declarations: [MemoreturnComponent],
  imports: [
    CommonModule,
    MemoreturnRoutingModule,
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
    
  ],
  providers: [
    GridPropertiesService,
    UtilityService,
    ConfigService,
    AlertdialogService,
    LedgerService,
    DatePipe,
    InwardMemoService,
    LogisticService,
    PricingService,
    CommuteService,
    MasterConfigService,
    InventoryUploadService,
    InventoryService,
    MeasureGradeService,
    LabService,
    OrganizationService,
    PrintMemoReturnFormat
  ],
})
export class MemoreturnModule { }

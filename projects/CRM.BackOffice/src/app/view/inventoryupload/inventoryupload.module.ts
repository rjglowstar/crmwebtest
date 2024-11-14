import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { GridModule } from '@progress/kendo-angular-grid';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LabelModule } from '@progress/kendo-angular-label'
import { LayoutModule } from '@progress/kendo-angular-layout';
import { PopupModule } from '@progress/kendo-angular-popup';
import { TooltipModule } from "@progress/kendo-angular-tooltip";
import { SharedDirectiveModule } from 'shared/directives';
import { PricingService, UtilityService } from 'shared/services';
import { GridconfigurationModule } from 'shared/views';
import { CommuteService, EmployeeCriteriaService, GridPropertiesService, InventoryUploadService, MasterConfigService, OrganizationService } from '../../services';
import { InventoryuploadRoutingModule } from './inventoryupload-routing.module';
import { InventoryuploadComponent } from './inventoryupload.component';

@NgModule({
  declarations: [InventoryuploadComponent],
  imports: [
    CommonModule,
    InventoryuploadRoutingModule,
    ButtonsModule,
    InputsModule,
    LayoutModule,
    DateInputsModule,
    DialogModule,
    GridModule,
    DropDownsModule,
    FormsModule,
    TooltipModule,
    GridconfigurationModule,
    SharedDirectiveModule,
    LabelModule,
    PopupModule
  ],
  providers: [
    InventoryUploadService,
    UtilityService,
    MasterConfigService,
    GridPropertiesService,
    PricingService,
    CommuteService,
    EmployeeCriteriaService,
    OrganizationService
  ],
})
export class InventoryUploadModule { }

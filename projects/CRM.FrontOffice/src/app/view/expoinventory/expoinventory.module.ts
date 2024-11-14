import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { GridModule } from '@progress/kendo-angular-grid';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LabelModule } from "@progress/kendo-angular-label";
import { LayoutModule } from '@progress/kendo-angular-layout';
import { PopupModule } from "@progress/kendo-angular-popup";
import { TooltipModule } from "@progress/kendo-angular-tooltip";
import { SharedDirectiveModule } from 'shared/directives';
import { CommonService, MeasureGradeService, PricingService, UtilityService } from 'shared/services';
import { AlertdialogService, GridconfigurationModule, MediaModule } from 'shared/views';
import { CustomerService, ExpoRequestService, GridPropertiesService, InventoryService, LeadService, MasterConfigService, SupplierService } from '../../services';
import { LeadmodalModule } from '../common/modal/leadmodal/leadmodal.module';
import { SearchdetailModule } from '../common/searchdetail/searchdetail.module';
import { ExpoInventoryRoutingModule } from './expoinventory-routing.module';
import { ExpoInventoryComponent } from './expoinventory.component';

@NgModule({
  declarations: [ExpoInventoryComponent],
  imports: [
    CommonModule,
    ExpoInventoryRoutingModule,
    ButtonsModule,
    InputsModule,
    LayoutModule,
    DateInputsModule,
    DialogModule,
    GridModule,
    DropDownsModule,
    FormsModule,
    SharedDirectiveModule,
    GridconfigurationModule,
    SearchdetailModule,
    PopupModule,
    LabelModule,
    MediaModule,
    TooltipModule,
    LeadmodalModule
  ],
  providers: [
    InventoryService,
    AlertdialogService,
    UtilityService,
    MasterConfigService,
    SupplierService,
    GridPropertiesService,
    PricingService,
    MeasureGradeService,
    CustomerService,
    CommonService,    
    LeadService,
    ExpoRequestService
  ],
})
export class ExpoInventoryModule { }
import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { GridModule } from '@progress/kendo-angular-grid';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { PopupModule } from '@progress/kendo-angular-popup';
import { FilterComponent } from "./filter.component";
import { InventoryService, MasterConfigService, PricingRequestService, SupplierService, SystemUserService, UserPricingCriteriaService } from '../../../../services';
import { AlertdialogService } from 'shared/views';
import { UtilityService, CommonService } from 'shared/services';
import { SharedDirectiveModule } from 'shared/directives';
import { DateRangeModule } from "@progress/kendo-angular-dateinputs";
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { TooltipModule } from "@progress/kendo-angular-tooltip";

@NgModule({
  imports: [
    CommonModule,
    GridModule,
    FormsModule,
    LayoutModule,
    InputsModule,
    ButtonsModule,
    DropDownsModule,
    DialogModule,
    PopupModule,
    SharedDirectiveModule,
    DateRangeModule,
    DateInputsModule,
    TooltipModule
  ],
  declarations: [FilterComponent],
  exports: [FilterComponent],
  providers: [PricingRequestService,
    AlertdialogService,
    UserPricingCriteriaService,
    SupplierService,
    MasterConfigService,
    UtilityService,
    CommonService,
    InventoryService,
    SystemUserService]
})
export class FilterModule { }
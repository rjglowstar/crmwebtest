import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { GridModule } from '@progress/kendo-angular-grid';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { PopupModule } from '@progress/kendo-angular-popup';
import { CommuteService, GridPropertiesService, InventoryService, PricingRequestService, SpecialstonecriteriaService, SupplierService, SystemUserService, UserPricingCriteriaService } from '../../services';
import { ConfigService, UtilityService, PricingService } from 'shared/services';
import { AlertdialogService, GridconfigurationModule, MediaModule } from 'shared/views';
import { FilterModule } from '../common/modal/filter/filter.module';
import { SharedDirectiveModule } from 'shared/directives';
import { ChartsModule } from '@progress/kendo-angular-charts';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { InvetoryPriceV2Component } from './inventoryPriceV2.component';
import { InvetoryPriceV2RoutingModule } from './inventoryPriceV2-routing.module';
import { PriceAnalyticsModule } from '../common/modal/priceanalytics/priceanalytic.module';
import { PricingInvFilterModule } from '../common/modal/pricingInvFilter/pricingInvFilter.module';

@NgModule({
  declarations: [InvetoryPriceV2Component],
  imports: [
    CommonModule,
    InvetoryPriceV2RoutingModule,
    InputsModule,
    LayoutModule,
    ButtonsModule,
    DropDownsModule,
    GridModule,
    PopupModule,
    FormsModule,
    ChartsModule,
    DialogModule,
    FilterModule,
    PricingInvFilterModule,
    GridconfigurationModule,
    MediaModule,
    TooltipModule,
    SharedDirectiveModule,
    PriceAnalyticsModule
  ],
  providers: [
    InventoryService,
    PricingRequestService,
    ConfigService,
    GridPropertiesService,
    AlertdialogService,
    UtilityService,
    UserPricingCriteriaService,
    PricingService,
    SpecialstonecriteriaService,
    SupplierService,    
    SystemUserService,
    CommuteService
  ]
})
export class InvetoryPriceV2Module { }

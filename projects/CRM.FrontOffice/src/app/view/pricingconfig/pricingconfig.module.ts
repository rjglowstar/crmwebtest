import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PricingConfigRoutingModule } from './pricingconfig-routing.module';
import { PricingConfigComponent } from './pricingconfig.component';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { GridModule } from '@progress/kendo-angular-grid';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { PopupModule } from '@progress/kendo-angular-popup';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { MasterConfigService, PriceExpiryCriteriaService, PricingConfigService } from '../../services';
import { SharedDirectiveModule } from 'shared/directives';
import { UtilityService } from 'shared/services';
import { GridconfigurationModule, MediaModule, AlertdialogService } from 'shared/views';

@NgModule({
  declarations: [PricingConfigComponent],
  imports: [
    CommonModule,
    PricingConfigRoutingModule,
    InputsModule,
    LayoutModule,
    ButtonsModule,
    DropDownsModule,
    GridModule,
    PopupModule,
    FormsModule,
    DialogModule,
    GridconfigurationModule,
    MediaModule,
    TooltipModule,
    SharedDirectiveModule,
  ],
  providers: [
    AlertdialogService,
    PricingConfigService,
    UtilityService,
    PriceExpiryCriteriaService,
    MasterConfigService
  ]
})
export class PricingConfigModule { }

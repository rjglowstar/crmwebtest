import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StonemediaComponent } from './stonemedia.component';
import { StonemediaRoutingModule } from './stonemedia-routing.module';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { GridModule } from '@progress/kendo-angular-grid';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { NgxSplideModule } from 'ngx-splide';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { FormsModule } from '@angular/forms';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { IndicatorsModule } from '@progress/kendo-angular-indicators';
import { NotificationModule } from '@progress/kendo-angular-notification';
import { PopupModule } from '@progress/kendo-angular-popup';
import { UserpermissionModule } from '../common/modal/userpermission/userpermission.module';
import { LabelModule } from "@progress/kendo-angular-label";
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { AlertdialogService, GridconfigurationModule } from 'shared/views';
import { SharedDirectiveModule } from 'shared/directives';
import { CommuteService, GridPropertiesService, InventoryService, MasterConfigService, OrganizationService } from '../../services';
import { CommonService, PricingService, UtilityService } from 'shared/services';


@NgModule({
  declarations: [StonemediaComponent],
  imports: [
    CommonModule,
    StonemediaRoutingModule,
    InputsModule,
    LayoutModule,
    DropDownsModule,
    GridModule,
    ButtonsModule,
    NgxSplideModule,
    DateInputsModule,    
    FormsModule,  
    DialogModule,
    PopupModule,
    NotificationModule,
    IndicatorsModule,
    SharedDirectiveModule,
    UserpermissionModule,
    GridconfigurationModule, 
    TooltipModule,
    LabelModule
  ],
  providers: [
    GridPropertiesService,
    CommonService,    
    UtilityService,
    MasterConfigService,
    OrganizationService,
    InventoryService,
    AlertdialogService,
    PricingService,
    CommuteService
  ]
})
export class StonemediaModule { }

import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { OrderdetailRoutingModule } from './orderdetail-routing.module';
import { OrderdetailComponent } from './orderdetail.component';
import { SharedDirectiveModule } from 'shared/directives';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { FormsModule } from '@angular/forms';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { LabelModule } from '@progress/kendo-angular-label';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { GridModule } from '@progress/kendo-angular-grid';
import { PopupModule } from '@progress/kendo-angular-popup';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { IndicatorsModule } from '@progress/kendo-angular-indicators';
import { AlertdialogService, GridconfigurationModule } from 'shared/views';
import { AppPreloadService, CommonService, ConfigService, UtilityService } from 'shared/services';
import { BrokerService, GridPropertiesService, InventoryService, MasterConfigService, OrderDetailService, SystemUserService } from '../../services';
import { SearchdetailModule } from '../common/searchdetail/searchdetail.module';


@NgModule({
  declarations: [OrderdetailComponent],
  imports: [
    CommonModule,
    OrderdetailRoutingModule,
    SharedDirectiveModule,
    InputsModule,
    DialogModule,
    FormsModule,
    DropDownsModule,
    ButtonsModule,
    LabelModule,
    LayoutModule,
    DateInputsModule,
    GridModule,
    PopupModule,
    TooltipModule,
    IndicatorsModule,
    GridconfigurationModule,
    SearchdetailModule
  ],
  providers: [
    CommonService,
    OrderDetailService,
    AlertdialogService,
    GridPropertiesService,
    AppPreloadService,
    ConfigService,
    MasterConfigService,
    InventoryService,
    CommonService,
    UtilityService,
    BrokerService,
    SystemUserService,
    DatePipe
  ],
})
export class OrderdetailModule { }

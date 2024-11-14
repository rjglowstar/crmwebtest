import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchresultRoutingModule } from './searchresult-routing.module';
import { SearchresultComponent } from './searchresult.component';
import { ButtonModule, ButtonsModule } from '@progress/kendo-angular-buttons';
import { GridModule } from '@progress/kendo-angular-grid';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { FormsModule } from '@angular/forms';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { LabelModule } from '@progress/kendo-angular-label';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { CommonService, ConfigService, UtilityService } from 'shared/services';
import { AlertdialogService, GridconfigurationModule } from 'shared/views';
import { CartService, CustomerInvSearchService, CustomerLogService, CustomerPreferenceService, CustomerService, EmailService, GridPropertiesService, MasterConfigService, WatchlistService } from '../../services';
import { SharedDirectiveModule } from 'shared/directives';
import { DiamondDetailModule } from '../common/modal/diamonddetail/diamonddetail.module';
import { DiamondCompareModule } from '../common/modal/diamondcompare/diamondcompare.module';
import { MediaModule } from '../common/modal/media/media.module';
import { OrdersummaryModule } from '../common/modal/ordersummary/ordersummary.module';
import { MyappointModule } from '../common/modal/myappoint/myappoint.module';

@NgModule({
  declarations: [SearchresultComponent],
  imports: [
    CommonModule,
    SearchresultRoutingModule,
    ButtonModule,
    ButtonsModule,
    GridModule,
    TooltipModule,
    DropDownsModule,
    InputsModule,
    FormsModule,
    DateInputsModule,
    LayoutModule,
    LabelModule,
    SharedDirectiveModule,
    GridconfigurationModule,
    DiamondCompareModule,
    DiamondDetailModule,
    MediaModule,
    OrdersummaryModule,
    MyappointModule
  ],
  providers: [
    CommonService,
    UtilityService,
    AlertdialogService,
    MasterConfigService,
    CustomerLogService,
    GridPropertiesService,
    ConfigService,
    CustomerInvSearchService,
    WatchlistService,
    CartService,
    CustomerService,
    CustomerPreferenceService,
    EmailService
  ]
})
export class SearchresultModule { }

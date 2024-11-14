import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchhistoryRoutingModule } from './searchhistory-routing.module';
import { SearchhistoryComponent } from './searchhistory.component';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { ButtonGroupModule, ButtonsModule } from '@progress/kendo-angular-buttons';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { DialogModule, DialogsModule } from '@progress/kendo-angular-dialog';
import { GridModule } from '@progress/kendo-angular-grid';
import { PopupModule } from '@progress/kendo-angular-popup';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { FormsModule } from '@angular/forms';
import { IndicatorsModule } from '@progress/kendo-angular-indicators';
import { NotificationModule } from '@progress/kendo-angular-notification';
import { LabelModule } from '@progress/kendo-angular-label';
import { AlertdialogService } from 'shared/views';
import { SharedDirectiveModule } from 'shared/directives';
import { CustomerSearchHistoryService, CustomerService, InventoryService, MasterConfigService, SystemUserService } from '../../services';
import { CommonService, ConfigService, UtilityService } from 'shared/services';

@NgModule({
  declarations: [SearchhistoryComponent],
  imports: [
    CommonModule,
    SearchhistoryRoutingModule,
    ButtonGroupModule,
    DialogModule,
    LayoutModule,
    InputsModule,
    DialogsModule,
    FormsModule,
    DropDownsModule,
    ButtonsModule,
    GridModule,
    IndicatorsModule,
    PopupModule,
    NotificationModule,
    LabelModule,
    TooltipModule,
    DateInputsModule,
    SharedDirectiveModule,
  ],
  providers: [
    UtilityService,
    AlertdialogService,
    ConfigService,
    CustomerSearchHistoryService,
    CommonService,
    MasterConfigService,
    CustomerService,
    SystemUserService,
    InventoryService
  ]
})
export class SearchhistoryModule { }

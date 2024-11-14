import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrokerComponent } from './broker.component';
import { BrokerRoutingModule } from './broker-routing.module';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { GridModule } from '@progress/kendo-angular-grid';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { FormsModule } from '@angular/forms';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { IndicatorsModule } from '@progress/kendo-angular-indicators';
import { NotificationModule } from '@progress/kendo-angular-notification';
import { PopupModule } from '@progress/kendo-angular-popup';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { SharedDirectiveModule } from 'shared/directives';
import { BrokerService, GridPropertiesService } from '../../services';
import { FileStoreService, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';

@NgModule({
  declarations: [
    BrokerComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    BrokerRoutingModule,
    DropDownsModule,
    ButtonsModule,
    InputsModule,
    LayoutModule,
    DateInputsModule,
    DialogModule,
    GridModule,
    PopupModule,
    NotificationModule,
    IndicatorsModule,
    SharedDirectiveModule,
    TooltipModule,
  ],
  providers: [
    GridPropertiesService,
    BrokerService,
    UtilityService,
    AlertdialogService,
    FileStoreService
  ]
})
export class BrokerModule { }

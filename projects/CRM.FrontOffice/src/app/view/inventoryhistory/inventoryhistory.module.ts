import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IndicatorsModule } from '@progress/kendo-angular-indicators';
import { SharedDirectiveModule } from 'shared/directives';
import { FormsModule } from '@angular/forms';
import { ButtonModule, ButtonsModule } from '@progress/kendo-angular-buttons';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { GridModule } from '@progress/kendo-angular-grid';
import { AlertdialogService, GridconfigurationModule } from 'shared/views';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { GridPropertiesService, MasterConfigService } from '../../services';
import { CommonService, UtilityService } from 'shared/services';
import { InventoryhistoryComponent } from './inventoryhistory.component';
import { InventoryhistoryRoutingModule } from './inventoryhistory-routing.module';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { InputsModule } from '@progress/kendo-angular-inputs';


@NgModule({
  declarations: [InventoryhistoryComponent],
  imports: [
    CommonModule,
    InventoryhistoryRoutingModule,
    IndicatorsModule,
    SharedDirectiveModule,
    FormsModule,
    ButtonsModule,
    DateInputsModule,
    DateInputsModule,
    LayoutModule,
    DropDownsModule,
    GridModule,
    GridconfigurationModule,
    ButtonModule,
    TooltipModule,
    DialogModule,
    InputsModule,
  ],
  providers: [
    GridPropertiesService,
    AlertdialogService,
    UtilityService,
    MasterConfigService,
    CommonService,
  ]
})
export class InventoryhistoryModule { }

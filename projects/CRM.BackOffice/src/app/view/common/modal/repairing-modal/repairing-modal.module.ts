import { CommonModule, DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { GridModule } from '@progress/kendo-angular-grid';
import { IndicatorsModule } from '@progress/kendo-angular-indicators';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LabelModule } from '@progress/kendo-angular-label';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { NotificationModule } from '@progress/kendo-angular-notification';
import { PopupModule } from '@progress/kendo-angular-popup';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { CommuteService, GridPropertiesService, InventoryService, MasterConfigService } from '../../../../services';
import { SharedDirectiveModule } from 'shared/directives';
import { UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { RepairingModalRoutingModule } from './repairing-modal-routing.module';
import { RepairingModalComponent } from './repairing-modal.component';


@NgModule({
  declarations: [RepairingModalComponent],
  imports: [
    CommonModule,
    RepairingModalRoutingModule,
    DropDownsModule,
    ButtonsModule,
    InputsModule,
    LayoutModule,
    GridModule,
    DateInputsModule,
    FormsModule,
    DialogModule,
    PopupModule,
    NotificationModule,
    IndicatorsModule,
    SharedDirectiveModule,
    LabelModule,
    TooltipModule,
  ],
  providers: [
    GridPropertiesService,
    UtilityService,
    MasterConfigService,
    AlertdialogService,
    DatePipe,
    CommuteService,
    InventoryService
  ],
  exports: [RepairingModalComponent]
})
export class RepairingModalModule { }

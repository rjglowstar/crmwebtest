import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { ExcelModule, GridModule } from '@progress/kendo-angular-grid';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LabelModule } from '@progress/kendo-angular-label';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { PendingChangesGuard } from 'shared/auth';
import { SharedDirectiveModule } from 'shared/directives';
import { UtilityService } from 'shared/services';
import { AlertdialogService, GridconfigurationModule } from 'shared/views';
import { CommuteService, GridPropertiesService, RfidService, StocktallyService } from '../../services';
import { RfidstocktallyboxModule } from '../common/modal/rfidstocktallybox/rfidstocktallybox.module';
import { RfidstocktallyitemsModule } from '../common/modal/rfidstocktallyitems/rfidstocktallyitems.module';
import { RfidRoutingModule } from './rfid-routing.module';
import { RfidsetupComponent } from './rfidsetup/rfidsetup.component';
import { RfidstocktallyComponent } from './rfidstocktally/rfidstocktally.component';


@NgModule({
  declarations: [
    RfidstocktallyComponent,
    RfidsetupComponent],
  imports: [
    CommonModule,
    RfidRoutingModule,
    ButtonsModule,
    InputsModule,
    LayoutModule,
    DateInputsModule,
    DialogModule,
    GridModule,
    DropDownsModule,
    FormsModule,
    SharedDirectiveModule,
    GridconfigurationModule,
    LabelModule,
    TooltipModule,
    ExcelModule,
    RfidstocktallyboxModule,
    RfidstocktallyitemsModule,
  ],
  providers: [
    RfidService,
    StocktallyService,
    AlertdialogService,
    UtilityService,
    GridPropertiesService,
    PendingChangesGuard,
    CommuteService,
  ],
})
export class RfidModule { }

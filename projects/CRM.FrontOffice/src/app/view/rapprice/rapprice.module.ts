import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RappriceRoutingModule } from './rapprice-routing.module';
import { RappriceComponent } from './rapprice.component';
import { FormsModule } from '@angular/forms';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { GridModule } from '@progress/kendo-angular-grid';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { AlertdialogService, GridconfigurationModule } from 'shared/views';
import { PopupModule } from '@progress/kendo-angular-popup';
import { SharedDirectiveModule } from 'shared/directives';
import { UtilityService } from 'shared/services';
import { MasterConfigService, RapPriceService, SupplierService } from '../../services';


@NgModule({
  declarations: [RappriceComponent],
  imports: [
    CommonModule,
    RappriceRoutingModule,
    DropDownsModule,
    ButtonsModule,
    InputsModule,
    LayoutModule,
    DateInputsModule,
    DialogModule,
    GridModule,
    PopupModule,
    CommonModule,
    FormsModule,
    TooltipModule,
    GridconfigurationModule,
    SharedDirectiveModule
  ],
  providers: [
    AlertdialogService,
    UtilityService,
    MasterConfigService,
    SupplierService,
    RapPriceService    
  ]
})
export class RappriceModule { }

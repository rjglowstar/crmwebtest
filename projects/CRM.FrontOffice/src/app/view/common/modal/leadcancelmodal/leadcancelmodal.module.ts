import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LeadcancelmodalRoutingModule } from './leadcancelmodal-routing.module';
import { LeadcancelmodalComponent } from './leadcancelmodal.component';
import { FormsModule } from '@angular/forms';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { DialogsModule } from '@progress/kendo-angular-dialog';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { GridModule } from '@progress/kendo-angular-grid';
import { IndicatorsModule } from '@progress/kendo-angular-indicators';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LabelModule } from '@progress/kendo-angular-label';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { PopupModule } from '@progress/kendo-angular-popup';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { SharedDirectiveModule } from 'shared/directives';
import { CommuteService, SchemeService, SupplierService } from 'projects/CRM.FrontOffice/src/app/services';


@NgModule({
  declarations: [LeadcancelmodalComponent],
  imports: [
    CommonModule,
    LeadcancelmodalRoutingModule,
    LayoutModule,
    InputsModule,
    DialogsModule,
    FormsModule,
    DropDownsModule,
    ButtonsModule,
    GridModule,
    SharedDirectiveModule,
    IndicatorsModule,
    PopupModule,
    LabelModule,
    TooltipModule,
  ],
  exports: [
    LeadcancelmodalComponent
  ], 
  providers: [
    SupplierService,
    SchemeService,
    CommuteService
  ]
})
export class LeadcancelmodalModule { }

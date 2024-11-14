import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyorderRoutingModule } from './myorder-routing.module';
import { MyorderComponent } from './myorder.component';
import { ButtonModule } from '@progress/kendo-angular-buttons';
import { GridModule } from '@progress/kendo-angular-grid';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { FormsModule } from '@angular/forms';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { UtilityService } from 'shared/services';
import { AppPreloadService, LeadService, MasterConfigService } from '../../services';
import { AlertdialogService } from 'shared/views';
import { NgxSpinnerService } from 'ngx-spinner';
import { SharedDirectiveModule } from 'shared/directives';
import { IndicatorsModule } from '@progress/kendo-angular-indicators';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { LabelModule } from '@progress/kendo-angular-label';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { PopupModule } from '@progress/kendo-angular-popup';


@NgModule({
  declarations: [MyorderComponent],
  imports: [
    CommonModule,
    MyorderRoutingModule,
    ButtonModule,
    GridModule,
    TooltipModule,
    DropDownsModule,
    InputsModule,
    FormsModule,
    IndicatorsModule,
    DateInputsModule,
    SharedDirectiveModule,
    DialogModule,
    FormsModule,    
    DropDownsModule,
    ButtonsModule,
    LabelModule,
    LayoutModule,
    PopupModule
  ],
  providers: [
    UtilityService,
    MasterConfigService,
    AppPreloadService,
    LeadService,
    AlertdialogService,
  ]
})
export class MyorderModule { }
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SchememasterRoutingModule } from './schememaster-routing.module';
import { SchememasterComponent } from './schememaster.component';
import { FormsModule } from '@angular/forms';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { GridModule } from '@progress/kendo-angular-grid';
import { IndicatorsModule } from '@progress/kendo-angular-indicators';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { PopupModule } from '@progress/kendo-angular-popup';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { SharedDirectiveModule } from 'shared/directives';
import { SchemeService } from '../../../services';
import { AppPreloadService, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';


@NgModule({
  declarations: [SchememasterComponent],
  imports: [
    CommonModule,
    SchememasterRoutingModule,
    FormsModule,
    DropDownsModule,
    ButtonsModule,
    InputsModule,
    LayoutModule,
    DateInputsModule,
    DialogModule,
    GridModule,
    PopupModule,
    IndicatorsModule,
    SharedDirectiveModule,
    TooltipModule,
  ],
  providers: [
    SchemeService,
    UtilityService,
    AlertdialogService,
    AppPreloadService
  ]
})
export class SchememasterModule { }

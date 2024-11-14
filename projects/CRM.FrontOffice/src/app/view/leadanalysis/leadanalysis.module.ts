import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { LeadanalysisRoutingModule } from './leadanalysis-routing.module';
import { LeadanalysisComponent } from './leadanalysis.component';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { DialogsModule } from '@progress/kendo-angular-dialog';
import { FormsModule } from '@angular/forms';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { GridModule } from '@progress/kendo-angular-grid';
import { IndicatorsModule } from '@progress/kendo-angular-indicators';
import { NotificationModule } from '@progress/kendo-angular-notification';
import { LabelModule } from '@progress/kendo-angular-label';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { PopupModule } from '@progress/kendo-angular-popup';
import { AlertdialogService, MediaModule } from 'shared/views';
import { ConfigService } from 'shared/services';
import { LeadService, SystemUserService } from '../../services';
import { IntlModule } from '@progress/kendo-angular-intl';
import { SharedDirectiveModule } from 'shared/directives';
import { ChartsModule } from '@progress/kendo-angular-charts';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LeadanalysisdetailComponent } from './leadanalysisdetail/leadanalysisdetail.component';


@NgModule({
  declarations: [LeadanalysisComponent, LeadanalysisdetailComponent],
  imports: [
    CommonModule,
    LeadanalysisRoutingModule,
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
    IntlModule,
    SharedDirectiveModule,
    ChartsModule,
    MediaModule,
  ],
  providers: [
    AlertdialogService,
    ConfigService,
    LeadService,
    SystemUserService
  ]
})
export class LeadanalysisModule { }

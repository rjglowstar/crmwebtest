import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonGroupModule, ButtonsModule } from '@progress/kendo-angular-buttons';
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
import { SharedDirectiveModule } from 'shared/directives';
import { CommonService, ConfigService, UtilityService } from 'shared/services';
import { ChequeRoutingModule } from './cheque-routing.module';
import { ChequeComponent } from './cheque.component';
import { AlertdialogService } from 'shared/views/common/alertdialog/alertdialog.service';
import { GridconfigurationModule } from 'shared/views';
import { GridPropertiesService } from '../../services';

@NgModule({
  declarations: [ChequeComponent],
  imports: [
    CommonModule,
    ChequeRoutingModule,
    ButtonsModule,
    InputsModule,
    LayoutModule,
    DropDownsModule,
    GridModule,
    DialogModule,
    FormsModule,
    ButtonGroupModule,
    LabelModule,
    DateInputsModule,
    PopupModule,
    NotificationModule,
    IndicatorsModule,
    TooltipModule,
    SharedDirectiveModule,
    GridconfigurationModule    
  ],
  providers: [
    GridPropertiesService,   
    CommonService,
    UtilityService,
    ConfigService,
    AlertdialogService
  ]
})
export class ChequeModule { }

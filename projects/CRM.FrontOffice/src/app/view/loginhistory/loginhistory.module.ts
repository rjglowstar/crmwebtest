import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { DialogsModule } from '@progress/kendo-angular-dialog';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { FormsModule } from '@angular/forms';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { GridModule } from '@progress/kendo-angular-grid';
import { IndicatorsModule } from '@progress/kendo-angular-indicators';
import { LabelModule } from '@progress/kendo-angular-label';
import { NotificationModule } from '@progress/kendo-angular-notification';
import { PopupModule } from '@progress/kendo-angular-popup';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { AlertdialogService, GridconfigurationModule } from 'shared/views';
import { SharedDirectiveModule } from 'shared/directives';
import { GridPropertiesService, LoginhistoryService } from '../../services';
import { CommonService, ConfigService, UtilityService } from 'shared/services';
import { LoginhistoryComponent } from './loginhistory.component';
import { LoginhistoryRoutingModule } from './loginhistory-routing.module';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';


@NgModule({
  declarations: [LoginhistoryComponent],
  imports: [
    CommonModule,
    LoginhistoryRoutingModule,
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
    SharedDirectiveModule,
    GridconfigurationModule,
  ],
  providers: [
    GridPropertiesService,
    UtilityService,
    AlertdialogService,
    ConfigService,
    LoginhistoryService,
    CommonService
  ]
})
export class LoginhistoryModule { }

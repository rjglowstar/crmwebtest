import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ExpomasterRoutingModule } from './expomaster-routing.module';
import { ExpomasterComponent } from './expomaster.component';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { FormsModule } from '@angular/forms';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { AlertdialogService, GridconfigurationModule } from 'shared/views';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { ButtonGroupModule, ButtonsModule } from '@progress/kendo-angular-buttons';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LabelModule } from '@progress/kendo-angular-label';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { GridModule } from '@progress/kendo-angular-grid';
import { PopupModule } from '@progress/kendo-angular-popup';
import { NotificationModule } from '@progress/kendo-angular-notification';
import { IndicatorsModule } from '@progress/kendo-angular-indicators';
import { AppPreloadService, CommonService, ConfigService, UtilityService } from 'shared/services';
import { SharedDirectiveModule } from 'shared/directives';
import { GridPropertiesService } from '../../services';


@NgModule({
  declarations: [ExpomasterComponent],
  imports: [
    CommonModule,
    ExpomasterRoutingModule,
    DialogModule,
    FormsModule,
    LayoutModule,
    GridconfigurationModule,
    DropDownsModule,
    ButtonsModule,
    ButtonGroupModule,
    InputsModule,
    LabelModule,
    DateInputsModule,
    GridModule,
    PopupModule,
    NotificationModule,
    IndicatorsModule,
    SharedDirectiveModule
  ],
  providers: [
    AlertdialogService,
    CommonService,
    UtilityService,
    AppPreloadService,
    ConfigService,
    GridPropertiesService
  ],
})
export class ExpomasterModule { }

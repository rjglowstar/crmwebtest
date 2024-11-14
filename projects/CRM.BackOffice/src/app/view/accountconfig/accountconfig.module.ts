import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccountconfigRoutingModule } from './accountconfig-routing.module';
import { AccountconfigmasterComponent } from './accountconfigmaster/accountconfigmaster.component';
import { FormsModule } from '@angular/forms';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { GridModule } from '@progress/kendo-angular-grid';
import { IndicatorsModule } from '@progress/kendo-angular-indicators';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { NotificationModule } from '@progress/kendo-angular-notification';
import { PopupModule } from '@progress/kendo-angular-popup';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { SharedDirectiveModule } from 'shared/directives';
import { CommonService, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';


@NgModule({
  declarations: [AccountconfigmasterComponent],
  imports: [
    CommonModule,
    AccountconfigRoutingModule,
    FormsModule,
    DropDownsModule,
    ButtonsModule,
    InputsModule,
    LayoutModule,
    DateInputsModule,
    DialogModule,
    GridModule,
    PopupModule,
    NotificationModule,
    IndicatorsModule,
    SharedDirectiveModule,
    TooltipModule,
  ],
  providers: [
    CommonService,
    UtilityService,
    AlertdialogService,
  ]
})
export class AccountconfigModule { }

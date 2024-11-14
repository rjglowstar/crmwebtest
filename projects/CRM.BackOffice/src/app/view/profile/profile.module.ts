import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileRoutingModule } from './profile-routing.module';
import { ProfileComponent } from './profile.component';
import { FormsModule } from '@angular/forms';
import { SharedDirectiveModule } from 'shared/directives';
import { AccountService, AppPreloadService, CommonService, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { EmployeeService } from '../../services';
import { UserpermissionModule } from '../common/modal/userpermission/userpermission.module';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { ButtonsModule, ButtonGroupModule } from '@progress/kendo-angular-buttons';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { GridModule } from '@progress/kendo-angular-grid';
import { IndicatorsModule } from '@progress/kendo-angular-indicators';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LabelModule } from '@progress/kendo-angular-label';
import { NotificationModule } from '@progress/kendo-angular-notification';
import { PopupModule } from '@progress/kendo-angular-popup';
import { TooltipModule } from '@progress/kendo-angular-tooltip';

@NgModule({
  declarations: [ProfileComponent],
  imports: [
    CommonModule,
    FormsModule,
    ProfileRoutingModule,
    LayoutModule,
    DialogModule,
    SharedDirectiveModule,
    UserpermissionModule,
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
    TooltipModule,
  ],
  providers: [
    AccountService,
    EmployeeService,
    AlertdialogService,
    CommonService,
    UtilityService,
    AppPreloadService,
  ]
})
export class ProfileModule { }

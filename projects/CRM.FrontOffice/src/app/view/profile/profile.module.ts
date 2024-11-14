import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileRoutingModule } from './profile-routing.module';
import { ProfileComponent } from './profile.component';
import { SharedDirectiveModule } from 'shared/directives';
import { AlertdialogService, GridconfigurationModule } from 'shared/views';
import { UserpermissionModule } from '../common/modal/userpermission/userpermission.module';
import { AccountService, CommonService, UtilityService } from 'shared/services';
import { AppPreloadService, SystemUserService } from '../../services';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { FormsModule } from '@angular/forms';
import { ButtonGroupModule, ButtonsModule } from '@progress/kendo-angular-buttons';
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
    DialogModule,
    FormsModule,
    ProfileRoutingModule,
    LayoutModule,
    SharedDirectiveModule,
    UserpermissionModule,
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
    TooltipModule,
  ],
  providers: [
    AppPreloadService,
    SystemUserService,
    AlertdialogService,
    CommonService,
    UtilityService,
    AccountService
  ],
})
export class ProfileModule { }

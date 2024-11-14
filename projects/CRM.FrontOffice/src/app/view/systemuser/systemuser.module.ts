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
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input-gg';
import { SharedDirectiveModule } from 'shared/directives';
import { AccountService, CommonService, ConfigService, UtilityService } from 'shared/services';
import { AlertdialogService, GridconfigurationModule } from 'shared/views';
import { AppPreloadService, GridPropertiesService, MasterConfigService, SystemUserService } from '../../services';
import { UserImageService } from '../../services/systemuser/userimage.service';
import { UserpermissionModule } from '../common/modal/userpermission/userpermission.module';
import { SystemuserRoutingModule } from './systemuser-routing.module';
import { SystemuserdetailsComponent } from './systemuserdetails/systemuserdetails.component';
import { SystemusermasterComponent } from './systemusermaster/systemusermaster.component';

@NgModule({
  imports: [
    CommonModule,
    SystemuserRoutingModule,
    FormsModule,
    DropDownsModule,
    ButtonsModule,
    ButtonGroupModule,
    InputsModule,
    LabelModule,
    LayoutModule,
    DateInputsModule,
    DialogModule,
    GridModule,
    PopupModule,
    NotificationModule,
    IndicatorsModule,
    TooltipModule,
    SharedDirectiveModule,
    UserpermissionModule,
    GridconfigurationModule,
    NgxIntlTelInputModule
  ],
  providers: [
    AppPreloadService,
    AccountService,
    GridPropertiesService,
    SystemUserService,
    AlertdialogService,
    CommonService,
    UtilityService,
    ConfigService,
    MasterConfigService,
    UserImageService
  ],
  declarations: [SystemusermasterComponent, SystemuserdetailsComponent]
})
export class SystemuserModule { }

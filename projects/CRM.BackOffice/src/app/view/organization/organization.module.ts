import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
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
import { UserpermissionModule } from '../common/modal/userpermission/userpermission.module';
import { SharedDirectiveModule } from 'shared/directives/shareddirecitve.module';
import { CommonService, ConfigService, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { OrganizationconfigService, OrganizationService } from '../../services';
import { OrganizationRoutingModule } from './organization-routing.module';
import { OrganizationconfigComponent } from './organizationconfig/organizationconfig.component';
import { OrganizationdetailsComponent } from './organizationdetails/organizationdetails.component';

@NgModule({
  declarations: [
    OrganizationdetailsComponent,
    OrganizationconfigComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    OrganizationRoutingModule,
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
    UserpermissionModule,
    TooltipModule,
  ],
  providers: [
    CommonService,
    OrganizationService,
    UtilityService,
    OrganizationconfigService,
    ConfigService,
    AlertdialogService
  ]
})
export class OrganizationModule { }
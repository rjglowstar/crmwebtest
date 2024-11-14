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
import { PopupModule } from "@progress/kendo-angular-popup";
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input-gg';
import { SharedDirectiveModule } from 'shared/directives';
import { AccountService, CommonService, ConfigService, UtilityService } from 'shared/services';
import { AlertdialogService, GridconfigurationModule } from 'shared/views';
import { EmployeeService, GridPropertiesService, OrganizationService } from '../../services';
import { UserpermissionModule } from '../common/modal/userpermission/userpermission.module';
import { EmployeeRoutingModule } from './employee-routing.module';
import { EmployeedetailsComponent } from './employeedetails/employeedetails.component';
import { EmployeemasterComponent } from './employeemaster/employeemaster.component';
@NgModule({
    declarations: [
        EmployeemasterComponent,
        EmployeedetailsComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        EmployeeRoutingModule,
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
        AccountService,
        GridPropertiesService,
        EmployeeService,
        OrganizationService,
        AlertdialogService,
        CommonService,
        UtilityService,
        ConfigService,
    ]

})
export class EmployeeModule { }

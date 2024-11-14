import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { GridModule } from '@progress/kendo-angular-grid';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { PopupModule } from '@progress/kendo-angular-popup';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { ConfigService, UtilityService } from 'shared/services';
import { AlertdialogService, GridconfigurationModule } from 'shared/views';
import { GridPropertiesService, ManageService } from '../../services';
import { UserRoutingModule } from './user-routing.module';
import { UserComponent } from './user.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        UserRoutingModule,
        DropDownsModule,
        ButtonsModule,
        InputsModule,
        LayoutModule,
        DateInputsModule,
        DialogModule,
        GridModule,
        PopupModule,
        TooltipModule,
        GridconfigurationModule
    ],
    providers: [
        ManageService,
        AlertdialogService,
        UtilityService,
        GridPropertiesService,
        ConfigService
    ],
    declarations: [UserComponent]
})
export class UserModule { }

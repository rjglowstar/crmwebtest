import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { DropDownListModule, DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { IntlModule } from '@progress/kendo-angular-intl';
import { LabelModule } from '@progress/kendo-angular-label';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { NotificationService } from '@progress/kendo-angular-notification';
import { ProgressBarModule } from '@progress/kendo-angular-progressbar';
import { NgClickOutsideDirective } from 'ng-click-outside2';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input-gg';
import { SharedDirectiveModule } from 'shared/directives';
import { CommonService, FileStoreService, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { RegisterService, SystemUserService } from '../../../services';
import { RegisterRoutingModule } from './register-routing.module';
import { RegisterComponent } from './register.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        DropDownListModule,
        RegisterRoutingModule,
        HttpClientModule,
        ProgressBarModule,
        ButtonsModule,
        DateInputsModule,
        LayoutModule,
        InputsModule,
        DropDownsModule,
        LabelModule,
        IntlModule,
        NgxIntlTelInputModule,
        SharedDirectiveModule,
        NgClickOutsideDirective
    ],
    providers: [RegisterService,
        CommonService,
        UtilityService,
        AlertdialogService,
        NotificationService,
        FileStoreService,
        SystemUserService],
    declarations: [RegisterComponent],
})
export class RegisterModule { }
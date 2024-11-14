import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NotificationModule } from '@progress/kendo-angular-notification';
import { NgxSpinnerModule } from 'ngx-spinner';
import { SharedDirectiveModule } from 'shared/directives';
import { AccountService, LogService, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { AppPreloadService } from '../../../services';
import { LoginRoutingModule } from './login-routing.module';
import { LoginComponent } from './login.component';
@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        LoginRoutingModule,
        NotificationModule,
        NgxSpinnerModule,
        SharedDirectiveModule
    ],
    providers: [
        AppPreloadService,
        AccountService,
        AlertdialogService,
        UtilityService,
        LogService
    ],
    declarations: [LoginComponent]
})
export class LoginModule { }
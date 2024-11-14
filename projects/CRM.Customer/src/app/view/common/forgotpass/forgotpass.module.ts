import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ForgotpassComponent } from './forgotpass.component';
import { ForgotpassRoutingModule } from './forgotpass-routing.module';
import { CommonService, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { NotificationService } from '@progress/kendo-angular-notification';
import { SharedDirectiveModule } from 'shared/directives';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgxOtpInputModule } from 'ngx-otp-input';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,        
        ForgotpassRoutingModule,
        SharedDirectiveModule,
        NgxSpinnerModule,
        NgxOtpInputModule,
    ],
    providers: [
        CommonService,
        UtilityService,
        AlertdialogService,
        NotificationService,
    ],
    declarations: [ForgotpassComponent]
})
export class ForgotpassModule { }
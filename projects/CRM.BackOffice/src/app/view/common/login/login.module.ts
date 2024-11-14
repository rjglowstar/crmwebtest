import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoginRoutingModule } from './login-routing.module';
import { LoginComponent } from './login.component';
import { NotificationModule } from '@progress/kendo-angular-notification';
import { NgxSpinnerModule } from 'ngx-spinner';
import { AccountService, AppPreloadService, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
// import { AlertdialogService } from 'common/views';

@NgModule({
  declarations: [LoginComponent],
  imports: [
    CommonModule,
    FormsModule,
    LoginRoutingModule,
    NotificationModule,
    NgxSpinnerModule
  ],
  providers: [
    AppPreloadService,
    AccountService,
    AlertdialogService,
    UtilityService
  ]
})
export class LoginModule { }

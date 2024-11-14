import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LabelModule } from '@progress/kendo-angular-label';
import { NotificationModule } from '@progress/kendo-angular-notification';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { SharedDirectiveModule } from 'shared/directives';
import { UtilityService } from 'shared/services';
import { NgxSpinnerModule } from 'ngx-spinner';
import { AuthGuard, AuthenticationService, AuthInterceptor } from 'shared/auth';
import { NavigationService } from '../services';
import { HeaderComponent, SideMenuComponent } from './shell';
import { ViewRoutingModule } from './view-routing.module';
import { ViewComponent } from './view.component';
import 'hammerjs';
import { LeadmodalModule } from './common/modal/leadmodal/leadmodal.module';
import { LeadcustomerrequestmodalModule } from './common/modal/leadcustomerrequestmodal/leadcustomerrequestmodal.module';
import { CustomerVerifyModule } from './common/modal/customerverify/customerverify.module';
import { LeadrejectedmodalModule } from './common/modal/leadrejectedmodal/leadrejectedmodal.module';
import { LeadstonereleasemodalModule } from './common/modal/leadstonereleasemodal/leadstonereleasemodal.module';
import { PopupModule } from '@progress/kendo-angular-popup';
import { FormsModule } from '@angular/forms';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { ReleasenoteModule } from 'shared/views/modal/releasenote/releasenote.module';
import { LeadcancelmodalModule } from './common/modal/leadcancelmodal/leadcancelmodal.module';
import { QcrequestdetailmodalModule } from './common/modal/qcrequestdetailmodal/qcrequestdetailmodal.module';

@NgModule({
  declarations: [ViewComponent,
    HeaderComponent,
    SideMenuComponent],
  imports: [
    CommonModule,
    ViewRoutingModule,
    HttpClientModule,
    ButtonsModule,
    TooltipModule,
    DropDownsModule,
    LabelModule,
    InputsModule,
    FormsModule,
    NgxSpinnerModule,
    NotificationModule,
    SharedDirectiveModule,
    LeadmodalModule,
    PopupModule,
    LeadcustomerrequestmodalModule,
    CustomerVerifyModule,
    LeadrejectedmodalModule,
    LeadstonereleasemodalModule,
    LayoutModule,
    ReleasenoteModule,
    LeadcancelmodalModule,
    QcrequestdetailmodalModule,
  ],
  providers: [
    AuthGuard,
    AuthenticationService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    UtilityService,
    NavigationService
  ],
})
export class ViewModule { }

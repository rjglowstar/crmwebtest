import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LabelModule } from '@progress/kendo-angular-label';
import { NotificationModule } from '@progress/kendo-angular-notification';
import { PopupModule } from '@progress/kendo-angular-popup';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import 'hammerjs';
import { NgxSpinnerModule } from 'ngx-spinner';
import { AuthenticationService, AuthGuard, AuthInterceptor } from 'shared/auth';
import { SharedDirectiveModule } from 'shared/directives';
import { UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { ReleasenoteModule } from 'shared/views/modal/releasenote/releasenote.module';
import { MemorequestService } from '../services';
import { NavigationService } from '../services/navigation/navigation.service';
import { LedgermodalModule } from './common/modal/ledger-modal/ledger-modal.module';
import { MemoModule } from './common/modal/memo/memo.module';
import { QcrequestModalModule } from './common/modal/qcrequest-modal/qcrequest-modal.module';
import { HeaderComponent, SideMenuComponent } from './shell';
import { ViewRoutingModule } from './view-routing.module';
import { ViewComponent } from './view.component';
import { UAEMemoPrint } from '../services/utility/memoPrint/uaeMemoPrint.service';
import { LabMemoPrint } from '../services/utility/memoPrint/labMemoPrint.service';
import { IndiaMemoPrint } from '../services/utility/memoPrint/indiaMemoPrint.service';
import { HKMemoPrint } from '../services/utility/memoPrint/hkMemoPrint.service';
import { BelgiumMemoPrint } from '../services/utility/memoPrint/belgiumMemoPrint.service';

@NgModule({
  declarations: [
    ViewComponent,
    HeaderComponent,
    SideMenuComponent
  ],
  imports: [
    CommonModule,
    ViewRoutingModule,
    HttpClientModule,
    FormsModule,
    ButtonsModule,
    TooltipModule,
    DropDownsModule,
    LabelModule,
    InputsModule,
    NgxSpinnerModule,
    NotificationModule,
    SharedDirectiveModule,
    PopupModule,
    MemoModule,
    LedgermodalModule,
    ReleasenoteModule,
    QcrequestModalModule,
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
    NavigationService,
    MemorequestService,
    AlertdialogService,
    UAEMemoPrint,
    LabMemoPrint,
    IndiaMemoPrint,
    HKMemoPrint,
    BelgiumMemoPrint 
  ],
  exports: [
    ButtonsModule,
    DropDownsModule,
    LabelModule,
    InputsModule,
  ]
})
export class ViewModule { }

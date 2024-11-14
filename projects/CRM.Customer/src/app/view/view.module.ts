import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LabelModule } from '@progress/kendo-angular-label';
import { NotificationModule } from '@progress/kendo-angular-notification';
import 'hammerjs';
import { NgClickOutsideDirective } from 'ng-click-outside2';
import { NgxSpinnerModule } from 'ngx-spinner';
import { AuthGuard, AuthInterceptor, AuthenticationService } from 'shared/auth';
import { SharedDirectiveModule } from 'shared/directives';
import { AppPreloadService, SuggestionService } from 'shared/services';
import { SuggestionModule } from './common/modal/suggestion/suggestion.module';
import { FooterComponent, HeaderComponent, HeaderLandingComponent, FooterLandingComponent } from './shell';
import { ViewRoutingModule } from './view-routing.module';
import { ViewComponent } from './view.component';
import { RouteAuthGuard } from '../services/auth';

@NgModule({
  declarations: [
    ViewComponent,
    HeaderComponent,
    FooterComponent,
    HeaderLandingComponent,
    FooterLandingComponent
  ],
  imports: [
    CommonModule,
    ViewRoutingModule,
    HttpClientModule,
    ButtonsModule,
    DropDownsModule,
    LabelModule,
    InputsModule,
    NgxSpinnerModule,
    NotificationModule,
    SuggestionModule,
    SharedDirectiveModule,
    FormsModule,
    NgClickOutsideDirective
  ],
  providers: [
    AuthGuard,
    RouteAuthGuard,
    AuthenticationService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    AppPreloadService,
    SuggestionService,
  ],
})
export class ViewModule { }

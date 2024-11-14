import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { AuthenticationService, AuthInterceptor } from 'shared/auth';
import { AlertdialogModule } from 'shared/views';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AppPreloadService } from './services';
import { GaugesModule } from '@progress/kendo-angular-gauges';
import { NotificationModule } from '@progress/kendo-angular-notification';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { NotificationService, WebsocketService } from 'shared/services';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthGuard } from './services/auth';
@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    DialogModule,
    BrowserAnimationsModule,
    TooltipModule,
    AlertdialogModule,
    GaugesModule,
    NotificationModule,
    FormsModule,

    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (http: HttpClient) => new TranslateHttpLoader(http, './assets/i18n/', '.json'),
        deps: [HttpClient]
      }
    }),
  ],
  providers: [
    AuthGuard,
    AuthenticationService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    AppPreloadService,
    NotificationService,
    WebsocketService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

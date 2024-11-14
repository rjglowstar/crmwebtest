import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { DragulaModule } from 'ng2-dragula';
import { SharedDirectiveModule } from 'shared/directives';
import { AppPreloadService, ConfigService, UtilityService } from 'shared/services';
import { ReleasenoteRoutingModule } from './releasenote-routing.module';
import { ReleasenoteComponent } from './releasenote.component';


@NgModule({
  declarations: [ReleasenoteComponent],
  imports: [
    CommonModule,
    FormsModule,
    LayoutModule,
    InputsModule,
    ReleasenoteRoutingModule,
    DragulaModule.forRoot(),
    SharedDirectiveModule
  ],
  exports: [ReleasenoteComponent],
  providers: [UtilityService,
    AppPreloadService,
    ConfigService,
  ]
})
export class ReleasenoteModule { }
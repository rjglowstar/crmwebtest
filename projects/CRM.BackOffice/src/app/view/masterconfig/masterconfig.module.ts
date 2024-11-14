import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { SharedDirectiveModule } from 'shared/directives';
import { UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { MasterConfigService } from '../../services';
import { MasterconfigRoutingModule } from './masterconfig-routing.module';
import { MasterconfigComponent } from './masterconfig.component';


@NgModule({
  declarations: [MasterconfigComponent],
  imports: [
    CommonModule,
    MasterconfigRoutingModule,
    ButtonsModule,
    DropDownsModule,
    FormsModule,
    DialogModule,
    LayoutModule,
    InputsModule,
    SharedDirectiveModule
  ],
  providers: [
    MasterConfigService,
    AlertdialogService,
    UtilityService
  ]
})
export class MasterconfigModule { }

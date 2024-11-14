import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { ButtonModule } from '@progress/kendo-angular-buttons';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { GridModule } from '@progress/kendo-angular-grid';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { SharedDirectiveModule } from 'shared/directives';
import { UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { ConfigurationService, SystemUserService } from '../../services';
import { ConfigurationRoutingModule } from './configuration-routing.module';
import { ConfigurationComponent } from './configuration.component';


@NgModule({
  declarations: [ConfigurationComponent],
  imports: [
    CommonModule,
    ConfigurationRoutingModule,
    FormsModule,
    SharedDirectiveModule,
    LayoutModule,
    ButtonModule,
    TooltipModule,
    DropDownsModule,
    DialogModule,
    InputsModule,
    GridModule
  ],
  providers: [
    AlertdialogService,
    UtilityService,
    ConfigurationService,
    //PanelBarService,
    SystemUserService,
  ]
})
export class ConfigurationModule { }

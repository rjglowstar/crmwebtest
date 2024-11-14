import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { NotificationModule } from '@progress/kendo-angular-notification';
import { NavigationService } from '../../services';
import { GridmasterconfigurationModule } from '../common/gridmasterconfiguration/gridmasterconfiguration.module';
import { UserpermissionModule } from '../common/modal/userpermission/userpermission.module';
import { ConfigurationRoutingModule } from './configuration-routing.module';
import { ConfigurationComponent } from './configuration.component';

@NgModule({
  declarations: [ConfigurationComponent],
  imports: [
    CommonModule,
    ConfigurationRoutingModule,
    UserpermissionModule,
    ButtonsModule,
    InputsModule,
    DropDownsModule,
    DialogModule,
    NotificationModule,
    GridmasterconfigurationModule,
  ],
  providers: [
    NavigationService,
  ]
})
export class ConfigurationModule { }
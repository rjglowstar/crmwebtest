import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { RejectedstoneRoutingModule } from './rejectedstone-routing.module';
import { RejectedstoneComponent } from './rejectedstone.component';
import { GridPropertiesService, RejectedstoneService } from '../../services';
import { UtilityService, ConfigService } from 'shared/services';
import { AlertdialogService, GridconfigurationModule } from 'shared/views';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { GridModule } from '@progress/kendo-angular-grid';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [RejectedstoneComponent],
  imports: [
    CommonModule,
    RejectedstoneRoutingModule,
    DropDownsModule,
    ButtonsModule,
    InputsModule,
    LayoutModule,
    DialogModule,
    GridModule,
    GridconfigurationModule,
    FormsModule,
  ],
  providers: [
    RejectedstoneService,
    GridPropertiesService,
    UtilityService,
    ConfigService,
    AlertdialogService,
    DatePipe,
  ]
})
export class RejectedstoneModule { }

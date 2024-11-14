import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AppointmentlistRoutingModule } from './appointmentlist-routing.module';
import { AppointmentlistComponent } from './appointmentlist.component';
import { ButtonModule, ButtonsModule } from '@progress/kendo-angular-buttons';
import { GridModule } from '@progress/kendo-angular-grid';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { FormsModule } from '@angular/forms';
import { DateInputsModule, TimePickerModule } from '@progress/kendo-angular-dateinputs';
import { LabelModule } from '@progress/kendo-angular-label';
import { AppointmentService, GridPropertiesService } from '../../services';
import { UtilityService } from 'shared/services';
import { AlertdialogService, GridconfigurationModule } from 'shared/views';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { MyappointModule } from '../common/modal/myappoint/myappoint.module';

@NgModule({
  declarations: [AppointmentlistComponent],
  imports: [
    CommonModule,
    AppointmentlistRoutingModule,
    ButtonModule,
    GridModule,
    TooltipModule,
    DropDownsModule,
    InputsModule,
    FormsModule,
    DateInputsModule,
    LabelModule,
    TimePickerModule,
    ButtonsModule,    
    LayoutModule,   
    DialogModule,
    GridconfigurationModule,
    MyappointModule
  ],
  providers: [
    GridPropertiesService,
    UtilityService,
    AlertdialogService,
    AppointmentService,
    DatePipe
  ],
})
export class AppointmentlistModule { }

import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MyappointmentRoutingModule } from './myappointment-routing.module';
import { MyappointmentComponent } from './myappointment.component';
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
import { SharedDirectiveModule } from 'shared/directives';
@NgModule({
  declarations: [MyappointmentComponent],
  imports: [
    CommonModule,
    MyappointmentRoutingModule,
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
    MyappointModule,
    SharedDirectiveModule
  ],
  providers: [
    GridPropertiesService,
    UtilityService,
    AlertdialogService,
    AppointmentService,
    DatePipe
  ],
})
export class MyappointmentModule { }

import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RecsearchRoutingModule } from './recsearch-routing.module';
import { RecsearchComponent } from './recsearch.component';
import { FormsModule } from '@angular/forms';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { DialogsModule } from '@progress/kendo-angular-dialog';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { GridModule } from '@progress/kendo-angular-grid';
import { IndicatorsModule } from '@progress/kendo-angular-indicators';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LabelModule } from '@progress/kendo-angular-label';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { NotificationModule } from '@progress/kendo-angular-notification';
import { PopupModule } from '@progress/kendo-angular-popup';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { GridconfigurationModule, MediaModule } from 'shared/views';
import { DateInputsModule, TimePickerModule } from '@progress/kendo-angular-dateinputs';
import { SharedDirectiveModule } from 'shared/directives';


@NgModule({
  declarations: [RecsearchComponent],
  imports: [
    CommonModule,
    RecsearchRoutingModule,
    LayoutModule,
    InputsModule,
    DialogsModule,
    FormsModule,
    DropDownsModule,
    ButtonsModule,
    GridModule,
    IndicatorsModule,
    PopupModule,
    NotificationModule,
    GridconfigurationModule,
    LabelModule,
    TooltipModule,
    DateInputsModule,
    TimePickerModule,
    SharedDirectiveModule,
    MediaModule
  ],
  providers: [    
    DatePipe
  ],
  exports: [RecsearchComponent]
})
export class RecsearchModule { }

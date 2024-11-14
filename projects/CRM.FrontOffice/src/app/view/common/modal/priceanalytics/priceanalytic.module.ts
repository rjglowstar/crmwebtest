import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { PriceAnalyticsRoutingModule } from './priceanalytic-routing.module';
import { PriceAnalyticsComponent } from './priceanalytic.component';
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
import { DateInputsModule, TimePickerModule } from '@progress/kendo-angular-dateinputs';
import { SharedDirectiveModule } from 'shared/directives';
import { GridconfigurationModule } from 'shared/views';

@NgModule({
  declarations: [PriceAnalyticsComponent],
  imports: [
    CommonModule,
    PriceAnalyticsRoutingModule,
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
    LabelModule,
    TooltipModule,
    DateInputsModule,
    TimePickerModule,
    GridconfigurationModule,
    SharedDirectiveModule
  ],
  providers: [    
    DatePipe
  ],
  exports: [PriceAnalyticsComponent]
})
export class PriceAnalyticsModule { }

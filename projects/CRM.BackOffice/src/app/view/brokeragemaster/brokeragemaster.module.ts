import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BrokeragemasterRoutingModule } from './brokeragemaster-routing.module';
import { BrokeragemasterComponent } from './brokeragemaster.component';
import { FormsModule } from '@angular/forms';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { GridModule } from '@progress/kendo-angular-grid';
import { IndicatorsModule } from '@progress/kendo-angular-indicators';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { PopupModule } from '@progress/kendo-angular-popup';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { SharedDirectiveModule } from 'shared/directives';
import { GridconfigurationModule } from 'shared/views';
import { BrokerageService } from '../../services';
import { GeneralModule } from '../common/modal/general/general.module';


@NgModule({
  declarations: [BrokeragemasterComponent],
  imports: [
    CommonModule,
    BrokeragemasterRoutingModule,
    DropDownsModule,
    ButtonsModule,
    InputsModule,
    LayoutModule,
    DateInputsModule,
    DialogModule,
    GridModule,
    PopupModule,
    FormsModule,
    IndicatorsModule,
    SharedDirectiveModule,
    GridconfigurationModule,
    TooltipModule,
    GeneralModule,
  ],
  providers: [
    BrokerageService
  ]
})
export class BrokeragemasterModule { }

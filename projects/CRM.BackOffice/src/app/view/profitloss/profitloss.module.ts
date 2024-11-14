import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProfitlossRoutingModule } from './profitloss-routing.module';
import { ProfitlossComponent } from './profitloss.component';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { TooltipModule } from '@progress/kendo-angular-tooltip';


@NgModule({
  declarations: [ProfitlossComponent],
  imports: [
    CommonModule,
    ProfitlossRoutingModule,
    DateInputsModule,
    ButtonsModule,
    TooltipModule
  ]
})
export class ProfitlossModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FtpaddiscRoutingModule } from './ftpaddisc-routing.module';
import { FtpAddDiscComponent } from './ftpaddisc.component';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { GridModule } from '@progress/kendo-angular-grid';
import { IndicatorsModule } from '@progress/kendo-angular-indicators';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LabelModule } from '@progress/kendo-angular-label';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { PopupModule } from '@progress/kendo-angular-popup';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [FtpAddDiscComponent],
  imports: [
    CommonModule,
    FtpaddiscRoutingModule,
    CommonModule,
    InputsModule,
    DialogModule,
    DropDownsModule,
    ButtonsModule,
    LabelModule,
    LayoutModule,
    DateInputsModule,
    GridModule,
    PopupModule,
    TooltipModule,
    IndicatorsModule,
    FormsModule
  ],
  exports: [
    FtpAddDiscComponent
  ],
})
export class FtpAddDiscModule { }

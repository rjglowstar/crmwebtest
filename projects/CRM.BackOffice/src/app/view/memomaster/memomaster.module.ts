import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MemomasterRoutingModule } from './memomaster-routing.module';
import { MemomasterComponent } from './memomaster.component';
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
import { AlertdialogService, GridconfigurationModule } from 'shared/views';
import { SharedDirectiveModule } from 'shared/directives';
import { GridPropertiesService, MemoService, PrintMemoFormat } from '../../services';
import { UtilityService } from 'shared/services';
import { MemoModule } from '../common/modal/memo/memo.module';
import { MemoFilterPipe } from '../../directives/memofilter.pipe';
import { BelgiumMemoPrint } from '../../services/utility/memoPrint/belgiumMemoPrint.service';
import { HKMemoPrint } from '../../services/utility/memoPrint/hkMemoPrint.service';
import { IndiaMemoPrint } from '../../services/utility/memoPrint/indiaMemoPrint.service';
import { LabMemoPrint } from '../../services/utility/memoPrint/labMemoPrint.service';
import { UAEMemoPrint } from '../../services/utility/memoPrint/uaeMemoPrint.service';

@NgModule({
  declarations: [
    MemomasterComponent,
    MemoFilterPipe],
  imports: [
    CommonModule,
    MemomasterRoutingModule,
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
    MemoModule
  ],
  providers: [
    GridPropertiesService,
    UtilityService,
    AlertdialogService,
    MemoService,
    DatePipe,
    PrintMemoFormat,
    UAEMemoPrint,
    LabMemoPrint,
    IndiaMemoPrint,
    HKMemoPrint,
    BelgiumMemoPrint    
  ],
})
export class MemomasterModule { }

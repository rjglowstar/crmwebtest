import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EbidingRoutingModule } from './ebiding-routing.module';
import { ButtonModule, ButtonsModule } from '@progress/kendo-angular-buttons';
import { GridModule } from '@progress/kendo-angular-grid';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { FormsModule } from '@angular/forms';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { CommonService, ConfigService, UtilityService } from 'shared/services';
import { AlertdialogService, GridconfigurationModule } from 'shared/views';
import { GridPropertiesService, MasterConfigService } from '../../services';
import { LabelModule } from '@progress/kendo-angular-label';
import { MediaModule } from '../common/modal/media/media.module';
import { SharedDirectiveModule } from 'shared/directives';
import { EbidingComponent } from './ebiding.component';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { DiamondDetailModule } from '../common/modal/diamonddetail/diamonddetail.module';
import { FilterValuesPipe } from '../../services/pipes/filter-values.pipe';

@NgModule({
  declarations: [EbidingComponent, FilterValuesPipe],
  imports: [
    CommonModule,
    EbidingRoutingModule,
    ButtonModule,
    ButtonsModule,
    GridModule,
    TooltipModule,
    DropDownsModule,
    InputsModule,
    FormsModule,
    DateInputsModule,
    LayoutModule,
    LabelModule,
    SharedDirectiveModule,
    GridconfigurationModule,
    MediaModule,
    DiamondDetailModule,
  ],
  providers: [
    CommonService,
    UtilityService,
    AlertdialogService,
    MasterConfigService,
    GridPropertiesService,
    ConfigService,
  ]
})
export class EbidingModule { }

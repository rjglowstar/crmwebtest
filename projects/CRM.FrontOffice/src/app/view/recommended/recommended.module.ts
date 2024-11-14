import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecommendedComponent } from './recommended.component';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { DialogModule, DialogsModule } from '@progress/kendo-angular-dialog';
import { DateInputsModule, TimePickerModule } from '@progress/kendo-angular-dateinputs';
import { GridModule } from '@progress/kendo-angular-grid';
import { DropDownsModule, SharedDirectivesModule } from '@progress/kendo-angular-dropdowns';
import { FormsModule } from '@angular/forms';
import { GridconfigurationModule, MediaModule } from 'shared/views';
import { PopupModule } from '@progress/kendo-angular-popup';
import { LabelModule } from '@progress/kendo-angular-label';
import { GridPropertiesService, RecommendedService } from '../../services';
import { RecommendedRoutingModule } from './recommended-routing.module';
import { ConfigService, UtilityService } from 'shared/services';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { IndicatorsModule } from '@progress/kendo-angular-indicators';
import { NotificationModule } from '@progress/kendo-angular-notification';
import { SharedDirectiveModule } from 'shared/directives';
import { RecsearchModule } from '../common/modal/recsearch/recsearch.module';

@NgModule({
  declarations: [RecommendedComponent],
  imports: [
    CommonModule,
    RecommendedRoutingModule,
    InputsModule,
    ButtonsModule,
    LayoutModule,
    DialogModule,
    DateInputsModule,
    GridModule,
    DropDownsModule,
    FormsModule,
    SharedDirectivesModule,
    GridconfigurationModule,
    PopupModule,
    LabelModule,
    TooltipModule,
    MediaModule,
    DialogsModule,
    IndicatorsModule,
    NotificationModule,
    TimePickerModule,
    SharedDirectiveModule,
    RecsearchModule,
  ],
  providers: [
    RecommendedService,
    GridPropertiesService,
    UtilityService,
    ConfigService
  ]
})
export class RecommendedModule { }

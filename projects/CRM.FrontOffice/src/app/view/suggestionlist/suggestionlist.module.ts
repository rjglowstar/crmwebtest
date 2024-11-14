import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SuggestionlistRoutingModule } from './suggestionlist-routing.module';
import { SuggestionlistComponent } from './suggestionlist.component';
import { FormsModule } from '@angular/forms';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { GridModule } from '@progress/kendo-angular-grid';
import { IndicatorsModule } from '@progress/kendo-angular-indicators';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { NotificationModule } from '@progress/kendo-angular-notification';
import { PopupModule } from '@progress/kendo-angular-popup';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { SharedDirectiveModule } from 'shared/directives';
import { AlertdialogService, GridconfigurationModule } from 'shared/views';
import { CommonService, UtilityService, ConfigService } from 'shared/services';
import { AppPreloadService, GridPropertiesService } from '../../services';
import { SuggestionService } from 'shared/services';


@NgModule({
  declarations: [SuggestionlistComponent],
  imports: [
    CommonModule,
    SuggestionlistRoutingModule,
    FormsModule,
    DropDownsModule,
    ButtonsModule,
    InputsModule,
    LayoutModule,
    DateInputsModule,
    DialogModule,
    GridModule,
    PopupModule,
    NotificationModule,
    IndicatorsModule,
    SharedDirectiveModule,
    GridconfigurationModule,
    TooltipModule,
  ],
  providers: [
    AppPreloadService,
    GridPropertiesService,
    CommonService,
    SuggestionService,
    UtilityService,
    ConfigService,
    AlertdialogService 
  ]
})
export class SuggestionlistModule { }

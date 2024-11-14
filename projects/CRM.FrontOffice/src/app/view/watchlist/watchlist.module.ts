import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WatchlistComponent } from './watchlist.component';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { GridModule } from '@progress/kendo-angular-grid';
import { DropDownsModule, SharedDirectivesModule } from '@progress/kendo-angular-dropdowns';
import { FormsModule } from '@angular/forms';
import { GridconfigurationModule } from 'shared/views';
import { PopupModule } from '@progress/kendo-angular-popup';
import { LabelModule } from '@progress/kendo-angular-label';
import { GridPropertiesService, WatchListService } from '../../services';
import { WatchlistRoutingModule } from './watchlist-routing.module';
import { ConfigService, UtilityService } from 'shared/services';
import { TooltipModule } from '@progress/kendo-angular-tooltip';

@NgModule({
  declarations: [WatchlistComponent],
  imports: [
    CommonModule,
    WatchlistRoutingModule,
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
    TooltipModule
  ],
  providers:[
    WatchListService,
    GridPropertiesService,
    UtilityService,
    ConfigService
  ]
})
export class WatchlistModule { }

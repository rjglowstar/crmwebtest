import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { DragulaModule } from 'ng2-dragula';
import { ConfigService, UtilityService } from 'shared/services';
import { GridPropertiesService } from '../../../services';
import { GridmasterconfigurationRoutingModule } from './gridmasterconfiguration-routing.module';
import { GridmasterconfigurationComponent } from './gridmasterconfiguration.component';

@NgModule({
  declarations: [GridmasterconfigurationComponent],
  imports: [
    CommonModule,
    FormsModule,
    LayoutModule,
    InputsModule,
    GridmasterconfigurationRoutingModule,
    ButtonsModule,
    TooltipModule,
    DragulaModule.forRoot(),
  ],
  exports: [
    GridmasterconfigurationComponent
  ],
  providers: [GridPropertiesService,
    UtilityService,
    ConfigService,
  ]
})
export class GridmasterconfigurationModule { }
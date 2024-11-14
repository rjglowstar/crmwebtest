import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { DragulaModule } from 'ng2-dragula';
import { StoneProposalService } from 'projects/CRM.FrontOffice/src/app/services';
import { GridconfigurationRoutingModule } from './gridconfiguration-routing.module';
import { GridconfigurationComponent } from './gridconfiguration.component';
import { SharedDirectiveModule } from 'shared/directives/shareddirecitve.module';
import { UtilityService } from 'shared/services/utility/utility.service';
import { AppPreloadService } from 'shared/services/common/apppreload.service';
import { ConfigService } from 'shared/services/configs/config.service';

@NgModule({
  declarations: [GridconfigurationComponent],
  imports: [
    CommonModule,
    FormsModule,
    LayoutModule,
    InputsModule,
    GridconfigurationRoutingModule,
    DragulaModule.forRoot(),
    SharedDirectiveModule
  ],
  exports: [GridconfigurationComponent],
  providers: [UtilityService,
    AppPreloadService,
    ConfigService,
    StoneProposalService
  ]
})
export class GridconfigurationModule { }
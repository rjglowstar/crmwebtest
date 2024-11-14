import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { ButtonModule } from '@progress/kendo-angular-buttons';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { FormsModule } from '@angular/forms';
import { ChartsModule } from '@progress/kendo-angular-charts';
import { SharedDirectiveModule } from 'shared/directives';
import { DiamondDetailModule } from '../common/modal/diamonddetail/diamonddetail.module';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { CustomerDashboardService, MasterConfigService, SchemeService } from '../../services';
import { AlertdialogService } from 'shared/views';
import { UtilityService } from 'shared/services';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { UserImageService } from '../../services/organization/userimage.service';
import { SwiperModule } from 'swiper/angular';
import { ArcGaugeModule } from '@progress/kendo-angular-gauges';

@NgModule({
  declarations: [DashboardComponent],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    ButtonModule,
    TooltipModule,
    DropDownsModule,
    InputsModule,
    FormsModule,
    ChartsModule,
    SharedDirectiveModule,
    DiamondDetailModule,
    LayoutModule,
    SwiperModule,
    ArcGaugeModule,
    NgCircleProgressModule.forRoot({
      "backgroundColor": "#be6060",
      "outerStrokeWidth": 10,
      "unitsFontSize": "32",
      "outerStrokeColor": "#4d4d4d",
      "innerStrokeColor": "#d3d3d3",
      "innerStrokeWidth": 5,
      "showSubtitle": false,
      "showBackground": false,
      "responsive": true,
      "titleFontSize": "32"
    })
  ],
  providers: [
    CustomerDashboardService,
    UtilityService,
    AlertdialogService,
    MasterConfigService,
    SchemeService, 
    UserImageService
  ]
})
export class DashboardModule { }

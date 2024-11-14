import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { ChartsModule, SparklineModule } from '@progress/kendo-angular-charts';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { GridModule } from '@progress/kendo-angular-grid';
import { IndicatorsModule } from '@progress/kendo-angular-indicators';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { IntlModule } from '@progress/kendo-angular-intl';
import { LabelModule } from "@progress/kendo-angular-label";
import { LayoutModule } from '@progress/kendo-angular-layout';
import { NotificationModule } from '@progress/kendo-angular-notification';
import { PopupModule } from '@progress/kendo-angular-popup';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { GradingRoutingModule } from './grading-routing.module';
import { GradingComponent } from './grading.component';
import { SharedDirectiveModule } from 'shared/directives';
import { PricingService, UtilityService } from 'shared/services';
import { AlertdialogService, GridconfigurationModule } from 'shared/views';
import { GridPropertiesService, MasterConfigService, OrganizationService } from '../../services';
import { PlanmakerModule } from '../common/modal/planmaker/planmaker.module';

@NgModule({
  declarations: [GradingComponent],
  imports: [
    CommonModule,
    GradingRoutingModule,
    InputsModule,
    LayoutModule,
    DropDownsModule,
    ButtonsModule,
    ChartsModule,
    GridModule,
    PlanmakerModule,
    SparklineModule,
    DateInputsModule,
    DialogModule,
    FormsModule,
    SharedDirectiveModule,
    IndicatorsModule,
    PopupModule,
    NotificationModule,    
    GridconfigurationModule,
    LabelModule,
    IntlModule,
    TooltipModule,
    ChartsModule
  ],
  providers: [
    GridPropertiesService,    
    UtilityService,
    MasterConfigService,
    OrganizationService,    
    AlertdialogService,
    PricingService
  ],
})
export class GradingModule { }

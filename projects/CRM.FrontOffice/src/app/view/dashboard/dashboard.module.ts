import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardComponent } from './dashboard.component';
import { DashboardRoutingModule } from './dashboard-routing.module'
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { DialogModule, DialogsModule } from '@progress/kendo-angular-dialog';
import { ChartsModule } from '@progress/kendo-angular-charts';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { GaugesModule } from '@progress/kendo-angular-gauges';
import { GridModule } from '@progress/kendo-angular-grid';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { DashboardService } from '../../services';
import { AlertdialogService } from 'shared/views';
import { NotificationService } from 'shared/services';
import { DropDownsModule } from "@progress/kendo-angular-dropdowns";
import { LeadmodalModule } from '../common/modal/leadmodal/leadmodal.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ButtonsModule,
        DashboardRoutingModule,
        DialogModule,
        ChartsModule,
        InputsModule,
        ButtonsModule,
        DialogsModule,
        GaugesModule,
        GridModule,
        TooltipModule,
        DropDownsModule,
        LeadmodalModule
    ],
    providers: [DashboardService, AlertdialogService, NotificationService],
    declarations: [DashboardComponent]
})
export class DashboardModule { }
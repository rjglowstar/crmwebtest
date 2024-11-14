import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { GridModule } from '@progress/kendo-angular-grid';
import { IndicatorsModule } from '@progress/kendo-angular-indicators';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LabelModule } from '@progress/kendo-angular-label';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { PopupModule } from '@progress/kendo-angular-popup';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { NgxSpinnerModule } from 'ngx-spinner';
import { SharedDirectiveModule } from 'shared/directives';
import { CommonService, NotificationService, PricingService, UtilityService } from 'shared/services';
import { AlertdialogService, GridconfigurationModule, MediaModule } from 'shared/views';
import { CustomerInvSearchService, CustomerLogService, CustomerService, GridPropertiesService, LeadService, MasterConfigService, SchemeService, StoneProposalService } from '../../services';
import { ExpoinventoriesRoutingModule } from './expoinventories-routing.module';
import { ExpoinventoriesComponent } from './expoinventories.component';
import { ExpoRequestService } from '../../services/business/exporequest.service';

@NgModule({
    declarations: [ExpoinventoriesComponent],
    imports: [
        CommonModule,
        ExpoinventoriesRoutingModule,
        ButtonsModule,
        InputsModule,
        LayoutModule,
        DateInputsModule,
        DialogModule,
        GridModule,
        DropDownsModule,
        FormsModule,
        PopupModule,
        LabelModule,
        GridconfigurationModule,
        SharedDirectiveModule,
        MediaModule,
        IndicatorsModule,
        TooltipModule,
        NgxSpinnerModule,
    ],
    providers: [
        CommonService,
        UtilityService,
        AlertdialogService,
        MasterConfigService,
        GridPropertiesService,
        PricingService,
        StoneProposalService,
        CustomerService,
        CustomerLogService,
        CustomerInvSearchService,
        LeadService,
        SchemeService,
        NotificationService,
        ExpoRequestService,
    ]
})

export class ExpoinventoriesModule { }
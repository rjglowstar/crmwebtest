import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BusinessconfigRoutingModule } from './businessconfig-routing.module';
import { BusinessconfigComponent } from './businessconfig.component';
import { FormsModule } from '@angular/forms';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { DialogsModule } from '@progress/kendo-angular-dialog';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { GridModule } from '@progress/kendo-angular-grid';
import { IndicatorsModule } from '@progress/kendo-angular-indicators';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { PopupModule } from '@progress/kendo-angular-popup';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { BusinessconfigurationService, CustomerService } from '../../services';


@NgModule({
  declarations: [BusinessconfigComponent],
  imports: [
    CommonModule,
    BusinessconfigRoutingModule,
    LayoutModule,
    InputsModule,
    DialogsModule,
    FormsModule,
    DropDownsModule,
    ButtonsModule,
    GridModule,
    IndicatorsModule,
    PopupModule,
    TooltipModule,
  ],
  providers:[
    UtilityService,
    AlertdialogService,
    BusinessconfigurationService,
    CustomerService,
  ]
})
export class BusinessconfigModule { }

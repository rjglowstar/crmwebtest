import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { KapancompareRoutingModule } from './kapancompare-routing.module';
import { KapancompareComponent } from './kapancompare.component';
import { AlertdialogService } from 'shared/views';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { FormsModule } from '@angular/forms';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { InventoryService, KapanCompareService } from '../../services';
import { SharedDirectiveModule } from 'shared/directives';
import { IntlModule } from '@progress/kendo-angular-intl';
import { PopupModule } from '@progress/kendo-angular-popup';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { ButtonsModule } from '@progress/kendo-angular-buttons';


@NgModule({
  declarations: [KapancompareComponent],
  imports: [
    CommonModule,
    KapancompareRoutingModule,
    DropDownsModule,
    FormsModule,
    TooltipModule,
    SharedDirectiveModule,
    LayoutModule,
    PopupModule,
    IntlModule,
    DialogModule,
    ButtonsModule
  ],
  providers:[
    AlertdialogService,
    InventoryService,
    KapanCompareService
  ]
})
export class KapancompareModule { }

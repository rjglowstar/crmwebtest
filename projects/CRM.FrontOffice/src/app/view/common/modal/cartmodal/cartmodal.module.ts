import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CartmodalRoutingModule } from './cartmodal-routing.module';
import { CartmodalComponent } from './cartmodal.component';
import { SharedDirectiveModule } from 'shared/directives';
import { FormsModule } from '@angular/forms';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { DialogsModule } from '@progress/kendo-angular-dialog';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { GridModule } from '@progress/kendo-angular-grid';
import { IndicatorsModule } from '@progress/kendo-angular-indicators';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LabelModule } from '@progress/kendo-angular-label';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { NotificationModule } from '@progress/kendo-angular-notification';
import { PopupModule } from '@progress/kendo-angular-popup';
import { CartService } from '../../../../services';
import { TooltipModule } from '@progress/kendo-angular-tooltip';


@NgModule({
  declarations: [CartmodalComponent],
  imports: [
    CommonModule,
    CartmodalRoutingModule,
    LayoutModule,
    InputsModule,
    DialogsModule,
    FormsModule,
    DropDownsModule,
    ButtonsModule,
    GridModule,
    SharedDirectiveModule,
    IndicatorsModule,
    PopupModule,
    NotificationModule,
    LabelModule,
    TooltipModule,
  ],
  providers: [CartService],
  exports: [CartmodalComponent]
})
export class CartmodalModule { }

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule, ButtonsModule } from '@progress/kendo-angular-buttons';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LabelModule } from '@progress/kendo-angular-label';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { CartService, CustomerService, CustomerInvSearchService, WatchlistService } from '../../../../services';
import { SharedDirectiveModule } from 'shared/directives';
import { CommonService, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { DiamondCompareRoutingModule } from './diamondcompare-routing.module';
import { DiamondCompareComponent } from './diamondcompare.component';
@NgModule({
  declarations: [DiamondCompareComponent],
  imports: [
    CommonModule,
    FormsModule,
    DiamondCompareRoutingModule,
    SharedDirectiveModule,
    ButtonsModule,
    ButtonModule,
    LayoutModule,
    LabelModule,
    InputsModule
  ],
  providers: [
    CommonService,
    UtilityService,
    AlertdialogService,
    WatchlistService,
    CustomerService,
    CustomerInvSearchService,
    CartService
  ],
  exports: [DiamondCompareComponent],
})
export class DiamondCompareModule { }

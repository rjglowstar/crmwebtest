import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SpecialStoneRoutingModule } from './specialstone-routing.module';
import { SpecialStoneComponent } from './specialstone.component';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { GridModule } from '@progress/kendo-angular-grid';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { PopupModule } from '@progress/kendo-angular-popup';
import { UtilityService } from 'shared/services';
import { AlertdialogService, GridconfigurationModule, MediaModule } from 'shared/views';
import { SharedDirectiveModule } from 'shared/directives';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { SpecialstonecriteriaService } from '../../services';

@NgModule({
  declarations: [SpecialStoneComponent],
  imports: [
    CommonModule,
    SpecialStoneRoutingModule,
    InputsModule,
    LayoutModule,
    ButtonsModule,
    DropDownsModule,
    GridModule,
    PopupModule,
    FormsModule,
    DialogModule,
    GridconfigurationModule,
    MediaModule,
    TooltipModule,
    SharedDirectiveModule
  ],
  providers: [
    AlertdialogService,
    SpecialstonecriteriaService,
    UtilityService
  ]
})
export class SpecialStoneModule { }

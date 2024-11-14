import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SuggestionComponent } from './suggestion.component';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from '@progress/kendo-angular-buttons';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { GridModule } from '@progress/kendo-angular-grid';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LabelModule } from '@progress/kendo-angular-label';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { AppPreloadService, UtilityService } from 'shared/services';
import { AlertdialogService } from 'shared/views';
import { SuggestionRoutingModule } from './suggestion-routing.module';
import { SharedDirectiveModule } from 'shared/directives';
@NgModule({
  declarations: [SuggestionComponent],
  imports: [
    CommonModule,
    SuggestionRoutingModule,
    LabelModule,
    ButtonModule,
    GridModule,
    TooltipModule,
    DropDownsModule,
    InputsModule,
    FormsModule,
    SharedDirectiveModule
  ],
  providers: [
    AlertdialogService,
    AppPreloadService,
    UtilityService
  ],
  exports: [SuggestionComponent]
})
export class SuggestionModule { }

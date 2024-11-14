import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { GridModule } from '@progress/kendo-angular-grid';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LabelModule } from '@progress/kendo-angular-label';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { SharedDirectiveModule } from 'shared/directives';
import { QcrequestModalRoutingModule } from './qcrequest-modal-routing.module';
import { QcrequestModalComponent } from './qcrequest-modal.component';


@NgModule({
  declarations: [QcrequestModalComponent],
  imports: [
    CommonModule,
    QcrequestModalRoutingModule,
    FormsModule,
    InputsModule,
    LayoutModule,
    DialogModule,
    DropDownsModule,
    DateInputsModule,
    ButtonsModule,
    TooltipModule,
    GridModule,
    LabelModule,
    SharedDirectiveModule,
  ],
  exports:[
    QcrequestModalComponent
  ]
})
export class QcrequestModalModule { }

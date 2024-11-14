import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ExportRequestRoutingModule } from './exportrequest-routing.module';
import { ExportRequestComponent } from './exportrequest.component';
import { GridPropertiesService, ExportRequestService } from '../../services';
import { FormsModule } from '@angular/forms';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { GridModule } from '@progress/kendo-angular-grid';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { AlertdialogService, GridconfigurationModule } from 'shared/views';
import { UtilityService, ConfigService } from 'shared/services';
import { MemoModule } from '../common/modal/memo/memo.module';
import { LabissueModule } from '../common/modal/labissue/labissue.module';
import { SharedDirectiveModule } from 'shared/directives';
import { PopupModule } from '@progress/kendo-angular-popup';

@NgModule({
  declarations: [ExportRequestComponent],
  imports: [
    CommonModule,
    ExportRequestRoutingModule,
    DropDownsModule,
    ButtonsModule,
    InputsModule,
    LayoutModule,
    DialogModule,
    GridModule,
    PopupModule,
    SharedDirectiveModule,
    GridconfigurationModule,
    FormsModule,
    MemoModule,
    LabissueModule,
  ],
  providers: [
    ExportRequestService,
    GridPropertiesService,
    UtilityService,
    ConfigService,
    AlertdialogService,
    DatePipe,
  ]
})
export class ExportRequestModule { }
import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RepairingRoutingModule } from './repairing-routing.module';
import { RepairingComponent } from './repairing.component';
import { GridPropertiesService, RepairingService } from '../../services';
import { FormsModule } from '@angular/forms';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { ExcelModule, GridModule } from '@progress/kendo-angular-grid';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { AlertdialogService, GridconfigurationModule } from 'shared/views';
import { UtilityService, ConfigService } from 'shared/services';
import { RepairingModalModule } from '../common/modal/repairing-modal/repairing-modal.module';
import { MemoModule } from '../common/modal/memo/memo.module';
import { RepairingmultiModule } from '../common/modal/repairingmulti/repairingmulti.module';
import { LabissueModule } from '../common/modal/labissue/labissue.module';
import { ExcelExportModule } from '@progress/kendo-angular-excel-export';

@NgModule({
  declarations: [RepairingComponent],
  imports: [
    CommonModule,
    RepairingRoutingModule,
    DropDownsModule,
    ButtonsModule,
    InputsModule,
    LayoutModule,
    DialogModule,
    GridModule,
    GridconfigurationModule,
    FormsModule,
    RepairingModalModule,
    MemoModule,
    RepairingmultiModule,
    LabissueModule,
    ExcelModule,
    ExcelExportModule,
  ],
  providers: [
    RepairingService,
    GridPropertiesService,
    UtilityService,
    ConfigService,
    AlertdialogService,
    DatePipe,
  ]
})
export class RepairingModule { }

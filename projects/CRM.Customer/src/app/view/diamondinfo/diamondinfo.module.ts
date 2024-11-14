import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DiamondinfoRoutingModule } from './diamondinfo-routing.module';
import { DiamondinfoComponent } from './diamondinfo.component';
import { DialogsModule } from '@progress/kendo-angular-dialog';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
  declarations: [DiamondinfoComponent],
  imports: [
    CommonModule,
    DialogsModule,
    DiamondinfoRoutingModule,
    TranslateModule
  ]
})
export class DiamondinfoModule { }

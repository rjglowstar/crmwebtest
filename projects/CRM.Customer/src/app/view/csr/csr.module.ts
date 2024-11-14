import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { CsrRoutingModule } from './csr-routing.module';
import { CsrComponent } from './csr.component';
import { SharedDirectiveModule } from 'shared/directives';
import { SwiperModule } from 'swiper/angular';
import { CountUpModule } from 'ngx-countup';
@NgModule({
  declarations: [CsrComponent],
  imports: [
    CommonModule,
    CsrRoutingModule,
    LayoutModule,
    SharedDirectiveModule,
    SwiperModule,
    CountUpModule
  ]
})
export class CsrModule { }

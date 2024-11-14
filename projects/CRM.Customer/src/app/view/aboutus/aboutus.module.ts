import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AboutusRoutingModule } from './aboutus-routing.module';
import { AboutusComponent } from './aboutus.component';
import { SharedDirectiveModule } from 'shared/directives';
import { SwiperModule } from 'swiper/angular';
@NgModule({
  declarations: [AboutusComponent],
  imports: [
    CommonModule,
    AboutusRoutingModule,
    SharedDirectiveModule,
    SwiperModule
  ]
})
export class AboutusModule { }

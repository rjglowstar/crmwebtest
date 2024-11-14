import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SharedDirectiveModule } from 'shared/directives';
import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { SwiperModule } from 'swiper/angular';

@NgModule({
  declarations: [HomeComponent],
  imports: [
    CommonModule,
    HomeRoutingModule,
    SharedDirectiveModule,
    SwiperModule
  ]
})
export class HomeModule { }

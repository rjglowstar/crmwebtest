import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CraftsmanshipRoutingModule } from './craftsmanship-routing.module';
import { SwiperModule } from 'swiper/angular';
import { SharedDirectiveModule } from 'shared/directives';
import { CraftsmanshipComponent } from './craftsmanship.component';

@NgModule({
  declarations: [CraftsmanshipComponent],
  imports: [
    CommonModule,
    CraftsmanshipRoutingModule,
    SharedDirectiveModule,
    SwiperModule
  ]
})
export class CraftsmanshipModule { }

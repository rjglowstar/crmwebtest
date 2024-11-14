import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedDirectiveModule } from 'shared/directives';
import { EventnewRoutingModule } from './eventnew-routing.module';
import { EventnewComponent } from './eventnew.component';
import { SwiperModule } from 'swiper/angular';

@NgModule({
  declarations: [EventnewComponent],
  imports: [
    CommonModule,
    EventnewRoutingModule,
    SharedDirectiveModule,
    SwiperModule
  ]
})
export class EventnewModule { }

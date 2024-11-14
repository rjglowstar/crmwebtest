import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { EventdetailRoutingModule } from './eventdetail-routing.module';
import { EventdetailComponent } from './eventdetail.component';
// import { NgImageFullscreenViewModule } from 'ng-image-fullscreen-view';
import { SharedDirectiveModule } from 'shared/directives';
@NgModule({
  declarations: [EventdetailComponent],
  imports: [
    CommonModule,
    EventdetailRoutingModule,
    //NgImageFullscreenViewModule,
    SharedDirectiveModule
  ]
})
export class EventdetailModule { }

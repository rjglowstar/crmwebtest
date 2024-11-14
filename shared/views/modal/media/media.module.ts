import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedDirectiveModule } from 'shared/directives';
import { MediaRoutingModule } from './media-routing.module';
import { MediaComponent } from './media.component';



@NgModule({
  declarations: [MediaComponent],
  imports: [
    CommonModule,
    MediaRoutingModule,
    SharedDirectiveModule,
  ],
  exports: [MediaComponent],
})
export class MediaModule { }

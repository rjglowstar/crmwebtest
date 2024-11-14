
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LinkExpireRoutingModule } from './link-expire-routing.module';
import { LinkExpireComponent } from './link-expire.component';

@NgModule({
  imports: [
    CommonModule,
    LinkExpireRoutingModule
  ],
  declarations: [LinkExpireComponent]
})
export class LinkExpireModule { }

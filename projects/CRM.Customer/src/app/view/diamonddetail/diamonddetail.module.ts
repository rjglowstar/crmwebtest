import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { NgClickOutsideDirective } from 'ng-click-outside2';
import { SharedDirectiveModule } from 'shared/directives';
import { DiamonddetailRoutingModule } from './diamonddetail-routing.module';
import { DiamonddetailComponent } from './diamonddetail.component';


@NgModule({
  declarations: [DiamonddetailComponent],
  imports: [
    CommonModule,
    DiamonddetailRoutingModule,
    SharedDirectiveModule,
    NgClickOutsideDirective
  ]
})
export class DiamonddetailModule { }

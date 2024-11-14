import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GradingRoutingModule } from './grading-routing.module';
import { GradingComponent } from './grading.component';
import { SharedDirectiveModule } from 'shared/directives';
@NgModule({
  declarations: [GradingComponent],
  imports: [
    CommonModule,
    GradingRoutingModule,
    SharedDirectiveModule
  ]
})
export class GradingModule { }

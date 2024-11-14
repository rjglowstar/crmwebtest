import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedDirectiveModule } from 'shared/directives';
import { SustainabilityRoutingModule } from './sustainability-routing.module';
import { SustainabilityComponent } from './sustainability.component';


@NgModule({
  imports: [
    CommonModule,
    SustainabilityRoutingModule,
    SharedDirectiveModule
  ],
  declarations: [SustainabilityComponent]
})
export class SustainabilityModule { }

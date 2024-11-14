import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BidingResultComponent } from './bidingResult.component';

const routes: Routes = [
  {
    path: '',
    component: BidingResultComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BidingResultRoutingModule { }
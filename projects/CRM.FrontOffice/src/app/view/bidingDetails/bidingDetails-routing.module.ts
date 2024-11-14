import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BidingDetailsComponent } from './bidingDetails.component';

const routes: Routes = [
  {
    path: '',
    component: BidingDetailsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BidingDetailsRoutingModule { }
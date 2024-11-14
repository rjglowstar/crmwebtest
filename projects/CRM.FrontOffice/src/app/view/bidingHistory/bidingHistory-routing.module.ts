import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BidingHistoryComponent } from './bidingHistorycomponent';

const routes: Routes = [
  {
    path: '',
    component: BidingHistoryComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BidingHistoryRoutingModule { }

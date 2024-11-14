import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PendingPricingComponent } from './pendingpricing.component';

const routes: Routes = [
  {
    path: '',
    component: PendingPricingComponent

  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PendingPricingRoutingModule { }

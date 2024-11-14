import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OrdersummaryComponent } from './ordersummary.component';

const routes: Routes = [
  {
    path: '',
    component: OrdersummaryComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrdersummaryRoutingModule { }

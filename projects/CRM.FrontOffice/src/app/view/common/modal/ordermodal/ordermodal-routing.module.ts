import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OrdermodalComponent } from './ordermodal.component';

const routes: Routes = [
  {
    path: '',
    component: OrdermodalComponent,
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrdermodalRoutingModule { }

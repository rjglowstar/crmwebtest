import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RequestPriceComponent } from './requestprice.component';

const routes: Routes = [
  {
    path: '',
    component: RequestPriceComponent

  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RequestPriceRoutingModule { }

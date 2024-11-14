import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InvetoryPriceV2Component } from './inventoryPriceV2.component';

const routes: Routes = [
  {
    path: '',
    component: InvetoryPriceV2Component

  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InvetoryPriceV2RoutingModule { }

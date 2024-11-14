import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PricingConfigComponent } from './pricingconfig.component';

const routes: Routes = [
  {
    path: '',
    component: PricingConfigComponent

  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PricingConfigRoutingModule { }

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InvetoryPriceComponent } from './inventoryprice.component';

const routes: Routes = [
  {
    path: '',
    component: InvetoryPriceComponent

  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InvetoryPriceRoutingModule { }

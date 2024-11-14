import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RepairingmultiComponent } from './repairingmulti.component';

const routes: Routes = [
  {
    path: '',
    component: RepairingmultiComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RepairingmultiRoutingModule { }

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RepairingComponent } from './repairing.component';

const routes: Routes = [
  {
    path: '',
    component: RepairingComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RepairingRoutingModule { }

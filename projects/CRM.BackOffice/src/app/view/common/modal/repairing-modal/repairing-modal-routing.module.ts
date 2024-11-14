import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RepairingModalComponent } from './repairing-modal.component';

const routes: Routes = [
  {
    path: '',
    component: RepairingModalComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RepairingModalRoutingModule { }

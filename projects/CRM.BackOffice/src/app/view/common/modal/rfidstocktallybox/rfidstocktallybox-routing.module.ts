import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RfidstocktallyboxComponent } from './rfidstocktallybox.component';

const routes: Routes = [
  {
    path: '',
    component: RfidstocktallyboxComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RfidstocktallyboxRoutingModule { }

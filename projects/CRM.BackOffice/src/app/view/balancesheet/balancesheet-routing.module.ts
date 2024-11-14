import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BalancesheetComponent } from './balancesheet.component';

const routes: Routes = [
  {
    path: '',
    component: BalancesheetComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BalancesheetRoutingModule { }

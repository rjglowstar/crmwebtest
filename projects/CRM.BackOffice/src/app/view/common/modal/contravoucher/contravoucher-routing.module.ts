import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ContraVoucherComponent } from './contravoucher.component';

const routes: Routes = [
  {
    path: '',
    component: ContraVoucherComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContraVoucherRoutingModule { }

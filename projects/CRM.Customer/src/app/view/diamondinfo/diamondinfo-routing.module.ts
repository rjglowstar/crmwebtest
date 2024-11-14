import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DiamondinfoComponent } from './diamondinfo.component';

const routes: Routes = [
  {
    path:'',
    component: DiamondinfoComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DiamondinfoRoutingModule { }

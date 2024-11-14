import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DiamonddetailComponent } from './diamonddetail.component';

const routes: Routes = [{ path: ':id', component: DiamonddetailComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DiamonddetailRoutingModule { }

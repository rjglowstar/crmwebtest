import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DiamondDetailComponent } from './diamonddetail.component';

const routes: Routes = [
  {
    path: '',
    component: DiamondDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DiamondDetailRoutingModule { }

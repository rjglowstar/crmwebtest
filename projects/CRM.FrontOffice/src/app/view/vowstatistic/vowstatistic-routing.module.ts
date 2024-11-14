import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { VowStatisticComponent } from './vowstatistic.component';

const routes: Routes = [
  {
    path: '',
    component: VowStatisticComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VowStatisticRoutingModule { }

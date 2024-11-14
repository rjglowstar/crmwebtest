import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GradingComponent } from './grading.component';

const routes: Routes = [
  {
    path: '',
    component: GradingComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GradingRoutingModule { }
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { Leadmodalv2Component } from './leadmodalv2.component';

const routes: Routes = [
  {
    path: '',
    component: Leadmodalv2Component,
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class Leadmodalv2RoutingModule { }

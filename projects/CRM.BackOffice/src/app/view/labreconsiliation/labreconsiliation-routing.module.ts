import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LabreconsiliationComponent } from './labreconsiliation.component';

const routes: Routes = [
  {
    path: '',
    component: LabreconsiliationComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LabreconsiliationRoutingModule { }

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LabexpenseComponent } from './labexpense.component';

const routes: Routes = [
  {
    path: '',
    component: LabexpenseComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LabexpenseRoutingModule { }

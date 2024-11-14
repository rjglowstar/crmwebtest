import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LabissueComponent } from './labissue.component';

const routes: Routes = [
  {
    path: '',
    component: LabissueComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LabissueRoutingModule { }

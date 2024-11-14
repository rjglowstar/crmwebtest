import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LabissuemasterComponent } from './labissuemaster.component';

const routes: Routes = [
  {
    path: '',
    component: LabissuemasterComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LabissuemasterRoutingModule { }

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { KapananalysisComponent } from './kapananalysis.component';

const routes: Routes = [
  {
    path: '',
    component: KapananalysisComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class KapananalysisRoutingModule { }

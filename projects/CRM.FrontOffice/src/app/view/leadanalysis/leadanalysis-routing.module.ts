import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LeadanalysisComponent } from './leadanalysis.component';

const routes: Routes = [
  {
    path: '',
    component: LeadanalysisComponent,
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LeadanalysisRoutingModule { }

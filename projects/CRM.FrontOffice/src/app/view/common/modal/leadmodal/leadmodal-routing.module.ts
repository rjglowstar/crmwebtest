import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LeadmodalComponent } from './leadmodal.component';

const routes: Routes = [
  {
    path: '',
    component: LeadmodalComponent,
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LeadmodalRoutingModule { }

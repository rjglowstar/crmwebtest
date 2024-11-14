import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LeadcustomerrequestmodalComponent } from './leadcustomerrequestmodal.component';

const routes: Routes = [
  {
    path: '',
    component: LeadcustomerrequestmodalComponent,
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LeadcustomerrequestmodalRoutingModule { }

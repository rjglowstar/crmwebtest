import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LeaddetailsComponent } from './leaddetails.component';

const routes: Routes = [
  {
    path: '',
    component: LeaddetailsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LeaddetailsRoutingModule { }

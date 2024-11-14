import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LeadhistoryComponent } from './leadhistory.component';

const routes: Routes = [
  {
    path: '',
    component: LeadhistoryComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LeadhistoryRoutingModule { }

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LeadrejectedstonemasterComponent } from './leadrejectedstonemaster.component';

const routes: Routes = [
  {
    path: '',
    component: LeadrejectedstonemasterComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LeadrejectedstonemasterRoutingModule { }

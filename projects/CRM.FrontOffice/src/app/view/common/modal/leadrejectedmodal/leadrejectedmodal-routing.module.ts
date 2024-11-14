import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LeadrejectedmodalComponent } from './leadrejectedmodal.component';

const routes: Routes = [{
  path: "",
  component: LeadrejectedmodalComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LeadrejectedmodalRoutingModule { }

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LeadcancelmodalComponent } from './leadcancelmodal.component';

const routes: Routes = [{
  path: "",
  component: LeadcancelmodalComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LeadcancelmodalRoutingModule { }

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LeadstonereleasemodalComponent } from './leadstonereleasemodal.component';

const routes: Routes = [{
  path: '',
  component: LeadstonereleasemodalComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LeadstonereleasemodalRoutingModule { }

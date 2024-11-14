import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WeeklysummaryComponent } from './weeklysummary.component';

const routes: Routes = [{
  path:'',
  component:WeeklysummaryComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WeeklysummaryRoutingModule { }

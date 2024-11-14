import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { KapancompareComponent } from './kapancompare.component';

const routes: Routes = [{
  path:'',
  component:KapancompareComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class KapancompareRoutingModule { }

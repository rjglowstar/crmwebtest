import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GeotrackingComponent } from './geotracking.component';

const routes: Routes = [
  {
    path: '',
    component: GeotrackingComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GeotrackingRoutingModule { }

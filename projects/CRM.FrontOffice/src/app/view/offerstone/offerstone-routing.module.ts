import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OfferstoneComponent } from './offerstone.component';

const routes: Routes = [
  {
    path: '',
    component: OfferstoneComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OfferstoneRoutingModule { }

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EbidingComponent } from './ebiding.component';

const routes: Routes = [
  {
    path: '',
    component: EbidingComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EbidingRoutingModule { }

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InwardmemoComponent } from './inwardmemo.component';

const routes: Routes = [
  {
    path: '',
    component: InwardmemoComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InwardmemoRoutingModule { }

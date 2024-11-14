import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MyappointComponent } from './myappoint.component';

const routes: Routes = [
  {
    path: '',
    component: MyappointComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MyappointRoutingModule { }

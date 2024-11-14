import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MyorderComponent } from './myorder.component';

const routes: Routes = [
  {
    path: '',
    component: MyorderComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MyorderRoutingModule { }

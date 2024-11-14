import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SchememasterComponent } from './schememaster.component';

const routes: Routes = [
  {
    path: '',
    component: SchememasterComponent
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SchememasterRoutingModule { }

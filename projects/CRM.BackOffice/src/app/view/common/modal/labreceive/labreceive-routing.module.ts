import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LabreceiveComponent } from './labreceive.component';

const routes: Routes = [
  {
    path: '',
    component: LabreceiveComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LabreceiveRoutingModule { }

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RojmelComponent } from './rojmel.component';

const routes: Routes = [
  {
    path: '',
    component: RojmelComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RojmelRoutingModule { }

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MemomasterComponent } from './memomaster.component';

const routes: Routes = [
  {
    path: '',
    component: MemomasterComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MemomasterRoutingModule { }

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ExpomasterComponent } from './expomaster.component';

const routes: Routes = [
  {
    path:'',
    component:ExpomasterComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExpomasterRoutingModule { }

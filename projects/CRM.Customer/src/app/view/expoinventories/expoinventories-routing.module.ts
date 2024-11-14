import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ExpoinventoriesComponent } from './expoinventories.component';

const routes: Routes = [
  {
    path:'',
    component:ExpoinventoriesComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class ExpoinventoriesRoutingModule { }
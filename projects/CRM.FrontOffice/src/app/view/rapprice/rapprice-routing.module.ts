import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RappriceComponent } from './rapprice.component';

const routes: Routes = [
  {
    path: '',
    component: RappriceComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RappriceRoutingModule { }

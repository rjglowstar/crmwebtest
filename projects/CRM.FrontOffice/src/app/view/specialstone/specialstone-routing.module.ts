import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SpecialStoneComponent } from './specialstone.component';

const routes: Routes = [
  {
    path: '',
    component: SpecialStoneComponent

  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SpecialStoneRoutingModule { }

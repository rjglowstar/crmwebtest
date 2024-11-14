import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RejectedstoneComponent } from './rejectedstone.component';

const routes: Routes = [
  {
    path: '',
    component: RejectedstoneComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RejectedstoneRoutingModule { }

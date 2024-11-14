import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MemoreturnComponent } from './memoreturn.component';

const routes: Routes = [
  {
    path: '',
    component: MemoreturnComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MemoreturnRoutingModule { }

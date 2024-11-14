import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EventdetailComponent } from './eventdetail.component';

const routes: Routes = [
  {
    path: '',
    component: EventdetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EventdetailRoutingModule { }

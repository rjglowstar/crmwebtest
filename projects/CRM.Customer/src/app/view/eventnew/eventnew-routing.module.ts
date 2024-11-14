import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EventnewComponent } from './eventnew.component';

const routes: Routes = [
  {
    path:'',
    component: EventnewComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EventnewRoutingModule { }

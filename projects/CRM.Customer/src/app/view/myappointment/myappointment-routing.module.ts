import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MyappointmentComponent } from './myappointment.component';

const routes: Routes = [
  {
    path: '',
    component: MyappointmentComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MyappointmentRoutingModule { }

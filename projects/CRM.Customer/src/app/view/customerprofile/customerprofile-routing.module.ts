import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CustomerprofileComponent } from './customerprofile.component';

const routes: Routes = [
  {
    path: '',
    component: CustomerprofileComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomerprofileRoutingModule { }

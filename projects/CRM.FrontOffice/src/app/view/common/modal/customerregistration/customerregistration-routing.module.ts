import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CustomerregistrationComponent } from './customerregistration.component';

const routes: Routes = [{
  path:'',
  component:CustomerregistrationComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomerregistrationRoutingModule { }

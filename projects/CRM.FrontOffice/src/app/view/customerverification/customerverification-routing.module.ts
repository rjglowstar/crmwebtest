import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CustomerverificationComponent } from './customerverification.component';

const routes: Routes = [{
  path: '',
  component: CustomerverificationComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomerverificationRoutingModule { }

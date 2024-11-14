import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CustomerVerifyComponent } from './customerverify.component';

const routes: Routes = [{
  path: '',
  component: CustomerVerifyComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomerVerifyRoutingModule { }

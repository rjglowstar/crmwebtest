import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BusinessconfigComponent } from './businessconfig.component';

const routes: Routes = [
  {
    path: '',
    component: BusinessconfigComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BusinessconfigRoutingModule { }

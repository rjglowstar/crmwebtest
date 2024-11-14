import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ExpoCustRegisterComponent } from './expoCustRegister.component';

const routes: Routes = [{
  path:'',
  component:ExpoCustRegisterComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExpoCustRegisterRoutingModule { }

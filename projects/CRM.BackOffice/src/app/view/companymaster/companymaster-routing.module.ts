import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CompanymasterComponent } from './companymaster.component';

const routes: Routes = [{
  path: '',
  component: CompanymasterComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CompanymasterRoutingModule { }

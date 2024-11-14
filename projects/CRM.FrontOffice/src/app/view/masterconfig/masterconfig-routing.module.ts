import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MasterconfigComponent } from './masterconfig.component';

const routes: Routes = [{
  path: '',
  component: MasterconfigComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class MasterconfigRoutingModule { }

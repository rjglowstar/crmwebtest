import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LogisticsmasterComponent } from './logisticsmaster.component';

const routes: Routes = [{
  path: '',
  component: LogisticsmasterComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LogisticsmasterRoutingModule { }

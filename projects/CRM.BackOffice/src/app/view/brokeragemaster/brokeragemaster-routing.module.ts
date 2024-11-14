import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BrokeragemasterComponent } from './brokeragemaster.component';

const routes: Routes = [{
  path: '',
  component: BrokeragemasterComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BrokeragemasterRoutingModule { }

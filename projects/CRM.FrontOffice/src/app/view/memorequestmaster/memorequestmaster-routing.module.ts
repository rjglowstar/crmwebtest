import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MemorequestmasterComponent } from './memorequestmaster.component';

const routes: Routes = [
  {
    path: '',component: MemorequestmasterComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MemorequestmasterRoutingModule { }

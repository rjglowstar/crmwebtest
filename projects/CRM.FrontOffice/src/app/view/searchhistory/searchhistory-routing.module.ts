import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SearchhistoryComponent } from './searchhistory.component';

const routes: Routes = [
  {
    path: '',
    component: SearchhistoryComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SearchhistoryRoutingModule { }

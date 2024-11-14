import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SalesSheetComponent } from './salessheet.component';

const routes: Routes = [
  {
    path: '',
    component: SalesSheetComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SalesSheetRoutingModule { }

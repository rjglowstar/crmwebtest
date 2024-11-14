import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SaleanalysisComponent } from './saleanalysis.component';

const routes: Routes = [
  {
    path:'',
    component:SaleanalysisComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SaleanalysisRoutingModule { }

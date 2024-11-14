import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PurchaseanalysisComponent } from './purchaseanalysis.component';

const routes: Routes = [{
  path: '',
  component: PurchaseanalysisComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PurchaseanalysisRoutingModule { }

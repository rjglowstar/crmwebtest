import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LedgeroutstandingmodalComponent } from './ledgeroutstandingmodal.component';

const routes: Routes = [{
  path: '',
  component: LedgeroutstandingmodalComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LedgeroutstandingmodalRoutingModule { }

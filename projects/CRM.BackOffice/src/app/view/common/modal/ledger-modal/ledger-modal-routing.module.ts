import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LedgermodalComponent } from './ledger-modal.component';

const routes: Routes = [
  {
    path: '',
    component: LedgermodalComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LedgermodalRoutingModule { }

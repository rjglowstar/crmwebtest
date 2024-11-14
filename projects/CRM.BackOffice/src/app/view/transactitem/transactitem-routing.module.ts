import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TransactitemComponent } from './transactitem.component';

const routes: Routes = [{ path: '', component: TransactitemComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TransactitemRoutingModule { }

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RecsearchComponent } from './recsearch.component';

const routes: Routes = [{ path: '', component: RecsearchComponent, pathMatch: 'full' }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RecsearchRoutingModule { }

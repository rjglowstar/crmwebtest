import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ManageeventComponent } from './manageevent.component';

const routes: Routes = [{ path: '', component: ManageeventComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManageeventRoutingModule { }

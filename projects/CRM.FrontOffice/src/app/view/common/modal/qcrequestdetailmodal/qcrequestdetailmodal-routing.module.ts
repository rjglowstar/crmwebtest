import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { QcrequestdetailmodalComponent } from './qcrequestdetailmodal.component';

const routes: Routes = [
  {
    path: '',
    component: QcrequestdetailmodalComponent,
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class QcrequestdetailmodalRoutingModule { }

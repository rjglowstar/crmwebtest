import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BidingUploadComponent } from './bidingUpload.component';

const routes: Routes = [
  {
    path: '',
    component: BidingUploadComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BidingUploadRoutingModule { }

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { QcrequestModalComponent } from './qcrequest-modal.component';

const routes: Routes = [{
  path: '', component: QcrequestModalComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class QcrequestModalRoutingModule { }

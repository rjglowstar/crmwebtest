import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InclusionuploadComponent } from './inclusionupload.component';

const routes: Routes = [
  {
    path: '',
    component: InclusionuploadComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InclusionuploadRoutingModule { }

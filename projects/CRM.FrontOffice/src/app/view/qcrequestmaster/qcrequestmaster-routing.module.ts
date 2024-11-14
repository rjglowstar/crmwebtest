import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { QcrequestmasterComponent } from './qcrequestmaster.component';

const routes: Routes = [
  {
    path: '',component: QcrequestmasterComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class QcrequestmasterRoutingModule { }

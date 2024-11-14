import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ExportRequestComponent } from './exportrequest.component';

const routes: Routes = [
  {
    path: '',
    component: ExportRequestComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExportRequestRoutingModule { }

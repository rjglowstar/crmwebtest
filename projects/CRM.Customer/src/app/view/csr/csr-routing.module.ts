import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CsrComponent } from './csr.component';

const routes: Routes = [
  {
    path:'',
    component: CsrComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CsrRoutingModule { }

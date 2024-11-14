import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginhistoryComponent } from './loginhistory.component';

const routes: Routes = [
  {
    path: '',
    component: LoginhistoryComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LoginhistoryRoutingModule { }

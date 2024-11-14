import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AccountconfigmasterComponent } from './accountconfigmaster/accountconfigmaster.component';

const routes: Routes = [
  {
      path: '',
      component: AccountconfigmasterComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountconfigRoutingModule { }

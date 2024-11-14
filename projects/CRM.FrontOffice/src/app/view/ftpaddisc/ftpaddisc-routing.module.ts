import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FtpAddDiscComponent } from './ftpaddisc.component';

const routes: Routes = [
  {
    path: '',
    component: FtpAddDiscComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FtpaddiscRoutingModule { }

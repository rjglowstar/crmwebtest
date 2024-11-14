import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomerdetailsComponent } from './customerdetails/customerdetails.component';
import { CustomerMasterComponent } from './customermaster/customermaster.component';

const routes: Routes = [
  {
      path: '',
      redirectTo: 'master',
      pathMatch:'full'
  },
  {   
      path: 'master',
      component: CustomerMasterComponent
  },
  {
      path: 'details/:id',
      component: CustomerdetailsComponent
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomerRoutingModule { }

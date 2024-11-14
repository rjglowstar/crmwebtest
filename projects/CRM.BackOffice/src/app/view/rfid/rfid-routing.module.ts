import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PendingChangesGuard } from 'shared/auth';
import { RfidsetupComponent } from './rfidsetup/rfidsetup.component';
import { RfidstocktallyComponent } from './rfidstocktally/rfidstocktally.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'rfidsetup',
    pathMatch:'full'
  },
  {
    path: 'rfidsetup',
    component: RfidsetupComponent,
  },
  {
    path: 'rfidstocktally',
    component: RfidstocktallyComponent,
    canDeactivate: [PendingChangesGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RfidRoutingModule { }

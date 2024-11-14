import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LedgerMasterComponent } from './ledgermaster/ledgermaster.component';
import { LedgerdetailsComponent } from './ledgerdetails/ledgerdetails.component';

const routes: Routes = [
    {
        path: '',
        component: LedgerMasterComponent
    },
    {
        path: 'details/:id',
        component: LedgerdetailsComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class LedgerRoutingModule {}


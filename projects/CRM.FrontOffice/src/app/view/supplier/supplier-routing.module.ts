import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SupplierdetailsComponent } from './supplierdetails/supplierdetails.component';
import { SuppliermasterComponent } from './suppliermaster/suppliermaster.component';

const routes: Routes = [
    {
        path: '',
        component: SuppliermasterComponent,
        pathMatch: 'full'
    },
    {
        path: 'details/:id',
        component: SupplierdetailsComponent
    },    
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class SupplierRoutingModule { }
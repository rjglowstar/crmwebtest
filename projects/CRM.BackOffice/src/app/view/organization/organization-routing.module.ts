import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrganizationconfigComponent } from './organizationconfig/organizationconfig.component';
import { OrganizationdetailsComponent } from './organizationdetails/organizationdetails.component';

const routes: Routes = [
    {
        path: '',
        component: OrganizationdetailsComponent
    },
    {
        path: 'configurations/:id',
        component: OrganizationconfigComponent
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class OrganizationRoutingModule { }
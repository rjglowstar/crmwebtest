import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmployeedetailsComponent } from './employeedetails/employeedetails.component';
import { EmployeemasterComponent } from './employeemaster/employeemaster.component';

const routes: Routes = [
    {
        path: '',
        redirectTo: 'search',
        pathMatch:'full'
    },
    {
        path: 'search',
        component: EmployeemasterComponent
    },
    {
        path: 'details/:id',
        component: EmployeedetailsComponent
    }

];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class EmployeeRoutingModule { }


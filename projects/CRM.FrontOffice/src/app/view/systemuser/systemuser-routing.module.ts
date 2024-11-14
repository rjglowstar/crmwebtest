import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SystemuserdetailsComponent } from './systemuserdetails/systemuserdetails.component';
import { SystemusermasterComponent } from './systemusermaster/systemusermaster.component';

const routes: Routes = [
    {
        path: '',
        redirectTo: 'search',
        pathMatch:'full'
    },
    {   
        path: 'search',
        component: SystemusermasterComponent
    },
    {
        path: 'details/:id',
        component: SystemuserdetailsComponent
    }

];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SystemuserRoutingModule { }


import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserpermissionComponent } from './userpermission.component';

const routes: Routes = [
    {
        path: '',
        component: UserpermissionComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class UserpermissionRoutingModule {}
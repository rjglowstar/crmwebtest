import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CertifieddiamondsComponent } from './certifieddiamonds.component';

const routes: Routes = [
    {
        path: '',
        component: CertifieddiamondsComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CertifieddiamondsRoutingModule { }
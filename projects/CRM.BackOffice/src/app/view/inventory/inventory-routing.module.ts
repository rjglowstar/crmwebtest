import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InventoryComponent } from './inventory.component';
import { CertificateLinkComponent } from './certificate-link/certificate-link.component';

const routes: Routes = [
    {
        path: '',
        component: InventoryComponent
    },
    {
        path: 'certificateLink',
        component: CertificateLinkComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class InventoryRoutingModule { }
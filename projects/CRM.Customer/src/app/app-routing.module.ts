import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', loadChildren: () => import('./view/view.module').then(m => m.ViewModule) },
  { path: 'register', data: { title: 'Register' }, loadChildren: () => import('./view/common/register/register.module').then(m => m.RegisterModule) },
  { path: 'login', data: { title: 'Login' }, loadChildren: () => import('./view/common/login/login.module').then(m => m.LoginModule) },
  { path: 'forgotpass', data: { title: 'Forget Password' }, loadChildren: () => import('./view/common/forgotpass/forgotpass.module').then(m => m.ForgotpassModule) },  
  { path: 'linkexpire', data: { title: 'Link Expire' }, loadChildren: () => import('../../../../shared/views/common/link-expire/link-expire.module').then(m => m.LinkExpireModule) },
  { path: 'proposal', data: { title: 'Proposal' }, loadChildren: () => import('./view/proposal/proposal.module').then(m => m.ProposalModule) },
  { path: 'expoinventories', data: { title: 'Expo inventories' }, loadChildren: () => import('./view/expoinventories/expoinventories.module').then(m => m.ExpoinventoriesModule) },
  { path: 'not-found', loadChildren: () => import('../../../../shared/views/common/not-found/not-found.module').then(m => m.NotFoundModule) },
  { path: 'diamond-detail', loadChildren: () => import('./view/diamonddetail/diamonddetail.module').then(m => m.DiamonddetailModule) },
  { path: '**', redirectTo: 'not-found' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }

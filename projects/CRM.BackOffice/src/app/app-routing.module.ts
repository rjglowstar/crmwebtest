import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'shared/auth';

const routes: Routes = [
  { path: '', loadChildren: () => import('./view/view.module').then(m => m.ViewModule), canActivate: [AuthGuard] },
  { path: 'login', loadChildren: () => import('./view/common/login/login.module').then(m => m.LoginModule) },
  { path: 'not-found', loadChildren: () => import('../../../../shared/views/common/not-found/not-found.module').then(m => m.NotFoundModule) },
  { path: '**', redirectTo: 'not-found' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {})],
  exports: [RouterModule]
})
export class AppRoutingModule { }

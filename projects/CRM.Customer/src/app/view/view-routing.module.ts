import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard, RouteAuthGuard } from '../services/auth';
import { ViewComponent } from './view.component';

const routes: Routes = [{
  path: '',
  component: ViewComponent,
  children: [
    { path: '', redirectTo: 'home', data: { title: 'Home' }, pathMatch: 'full' },
    { path: 'home', data: { title: 'Home' }, loadChildren: () => import('./home/home.module').then(m => m.HomeModule), canActivate: [RouteAuthGuard] },
    { path: 'products', data: { title: 'Products' }, loadChildren: () => import('./products/products.module').then(m => m.ProductsModule), canActivate: [RouteAuthGuard] },
    { path: 'sustainability', data: { title: 'Sustainability' }, loadChildren: () => import('./sustainability/sustainability.module').then(m => m.SustainabilityModule), canActivate: [RouteAuthGuard] },
    { path: 'craftsmanship', data: { title: 'Craftsmanship' }, loadChildren: () => import('./craftsmanship/craftsmanship.module').then(m => m.CraftsmanshipModule),canActivate:[RouteAuthGuard] },
    { path: 'dashboard', data: { title: 'Dashboard' }, loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule), canActivate: [AuthGuard] },
    { path: 'ebiding', data: { title: 'E-Biding' }, loadChildren: () => import('./ebiding/ebiding.module').then(m => m.EbidingModule), canActivate: [AuthGuard] },
    { path: 'customerprofile', data: { title: 'CustomerProfile' }, loadChildren: () => import('./customerprofile/customerprofile.module').then(m => m.CustomerprofileModule), canActivate: [AuthGuard] },
    { path: 'myorder', data: { title: 'My Order' }, loadChildren: () => import('./myorder/myorder.module').then(m => m.MyorderModule), canActivate: [AuthGuard] },
    { path: 'mycart', data: { title: 'My Cart' }, loadChildren: () => import('./mycart/mycart.module').then(m => m.MycartModule), canActivate: [AuthGuard] },
    { path: 'watchlist', data: { title: 'Watchlist' }, loadChildren: () => import('./watchlist/watchlist.module').then(m => m.WatchlistModule), canActivate: [AuthGuard] },
    { path: 'searchresult', data: { title: 'Search Result' }, loadChildren: () => import('./searchresult/searchresult.module').then(m => m.SearchresultModule), canActivate: [AuthGuard] },
    { path: 'myappointment', data: { title: 'My Appointment' }, loadChildren: () => import('./myappointment/myappointment.module').then(m => m.MyappointmentModule), canActivate: [AuthGuard] },
    { path: 'event', data: { title: 'Event' }, loadChildren: () => import('./event/event.module').then(m => m.EventModule), canActivate: [AuthGuard] },
    { path: 'eventnew', data: { title: 'Event' }, loadChildren: () => import('./eventnew/eventnew.module').then(m => m.EventnewModule),canActivate:[RouteAuthGuard] },
    // { path: 'eventdetail', data: { title: 'Event Detail' }, loadChildren: () => import('./eventdetail/eventdetail.module').then(m => m.EventdetailModule), canActivate: [AuthGuard] },
    { path: 'grading', data: { title: 'Grading' }, loadChildren: () => import('./grading/grading.module').then(m => m.GradingModule) },
    { path: 'aboutus', data: { title: 'About Us' }, loadChildren: () => import('./aboutus/aboutus.module').then(m => m.AboutusModule), canActivate: [RouteAuthGuard] },
    { path: 'contactus', data: { title: 'Contact Us' }, loadChildren: () => import('./contactus/contactus.module').then(m => m.ContactusModule), canActivate: [RouteAuthGuard] },
    { path: 'whyus', data: { title: 'Why Us' }, loadChildren: () => import('./whyus/whyus.module').then(m => m.WhyusModule) },
    { path: 'terms', data: { title: 'Terms and Condition' }, loadChildren: () => import('./terms/terms.module').then(m => m.TermsModule) },
    { path: 'csr', data: { title: 'Social Responsibility' }, loadChildren: () => import('./csr/csr.module').then(m => m.CsrModule), canActivate: [RouteAuthGuard] },
    { path: 'diamondinfo', data: { title: 'Diamond Info' }, loadChildren: () => import('./diamondinfo/diamondinfo.module').then(m => m.DiamondinfoModule) },
  ]
},
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ViewRoutingModule { }

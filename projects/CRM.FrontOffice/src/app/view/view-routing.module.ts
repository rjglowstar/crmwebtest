import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'shared/auth';
import { ViewComponent } from './view.component';

const routes: Routes = [{
  path: '',
  component: ViewComponent,
  children: [
    { path: '', redirectTo: 'dashboard' ,pathMatch:'full'},
    { path: 'dashboard', loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule), canActivate: [AuthGuard] },
    { path: 'systemuser', loadChildren: () => import('./systemuser/systemuser.module').then(m => m.SystemuserModule), canActivate: [AuthGuard] },
    { path: 'supplier', loadChildren: () => import('./supplier/supplier.module').then(m => m.SupplierModule), canActivate: [AuthGuard] },
    { path: 'customerverification', loadChildren: () => import('./customerverification/customerverification.module').then(m => m.CustomerverificationModule), canActivate: [AuthGuard] },
    { path: 'masterconfig', loadChildren: () => import('./masterconfig/masterconfig.module').then(m => m.MasterconfigModule), canActivate: [AuthGuard] },
    { path: 'pricingconfig', loadChildren: () => import('./pricingconfig/pricingconfig.module').then(m => m.PricingConfigModule), canActivate: [AuthGuard] },
    { path: 'rapupload', loadChildren: () => import('./rapprice/rapprice.module').then(m => m.RappriceModule), canActivate: [AuthGuard] },
    { path: 'specialstone', loadChildren: () => import('./specialstone/specialstone.module').then(m => m.SpecialStoneModule), canActivate: [AuthGuard] },
    { path: 'pendingpricing', loadChildren: () => import('./pendingpricing/pendingpricing.module').then(m => m.PendingPricingModule), canActivate: [AuthGuard] },
    { path: 'requestprice', loadChildren: () => import('./requestprice/requestprice.module').then(m => m.RequestPriceModule), canActivate: [AuthGuard] },
    { path: 'inventoryprice', loadChildren: () => import('./Inventoryprice/inventoryprice.module').then(m => m.InvetoryPriceModule), canActivate: [AuthGuard] },
    { path: 'inventorypricev2', loadChildren: () => import('./inventoryPriceV2/inventoryPriceV2.module').then(m => m.InvetoryPriceV2Module), canActivate: [AuthGuard] },
    { path: 'inventory', loadChildren: () => import('./inventory/inventory.module').then(m => m.InventoryModule), canActivate: [AuthGuard] },
    { path: 'configuration', loadChildren: () => import('./configuration/configuration.module').then(m => m.ConfigurationModule), canActivate: [AuthGuard] },
    { path: 'schememaster', loadChildren: () => import('./common/schememaster/schememaster.module').then(m => m.SchememasterModule), canActivate: [AuthGuard] },
    { path: 'broker', loadChildren: () => import('./broker/broker.module').then(m => m.BrokerModule), canActivate: [AuthGuard] },
    { path: 'customer', loadChildren: () => import('./customer/customer.module').then(m => m.CustomerModule), canActivate: [AuthGuard] },
    { path: 'cart', loadChildren: () => import('./cart/cart.module').then(m => m.CartModule), canActivate: [AuthGuard] },
    { path: 'lead', loadChildren: () => import('./lead/lead.module').then(m => m.LeadModule), canActivate: [AuthGuard] },
    { path: 'businessconfig', loadChildren: () => import('./businessconfig/businessconfig.module').then(m => m.BusinessconfigModule), canActivate: [AuthGuard] },
    { path: 'watchlist', loadChildren: () => import('./watchlist/watchlist.module').then(m => m.WatchlistModule), canActivate: [AuthGuard] },
    { path: 'suggestionlist', loadChildren: () => import('./suggestionlist/suggestionlist.module').then(m => m.SuggestionlistModule), canActivate: [AuthGuard] },
    { path: 'order', loadChildren: () => import('./order/order.module').then(m => m.OrderModule), canActivate: [AuthGuard] },
    { path: 'orderdetail', loadChildren: () => import('./orderdetail/orderdetail.module').then(m => m.OrderdetailModule), canActivate: [AuthGuard] },
    { path: 'appointmentlist', loadChildren: () => import('./appointmentlist/appointmentlist.module').then(m => m.AppointmentlistModule), canActivate: [AuthGuard] },
    { path: 'geotracking', loadChildren: () => import('./geotracking/geotracking.module').then(m => m.GeotrackingModule), canActivate: [AuthGuard] },
    { path: 'searchhistory', loadChildren: () => import('./searchhistory/searchhistory.module').then(m => m.SearchhistoryModule), canActivate: [AuthGuard] },
    { path: 'loginhistory', loadChildren: () => import('./loginhistory/loginhistory.module').then(m => m.LoginhistoryModule), canActivate: [AuthGuard] },
    { path: 'inventoryhistory', loadChildren: () => import('./inventoryhistory/inventoryhistory.module').then(m => m.InventoryhistoryModule), canActivate: [AuthGuard] },
    { path: 'event', loadChildren: () => import('./manageevent/manageevent.module').then(m => m.ManageeventModule), canActivate: [AuthGuard] },
    { path: 'vowstatistic', loadChildren: () => import('./vowstatistic/vowstatistic.module').then(m => m.VowStatisticModule), canActivate: [AuthGuard] },
    { path: 'profile', loadChildren: () => import('./profile/profile.module').then(m => m.ProfileModule), canActivate: [AuthGuard] },
    { path: 'memorequest-master', loadChildren: () => import('./memorequestmaster/memorequestmaster.module').then(m => m.MemorequestmasterModule), canActivate: [AuthGuard] },
    { path: 'qcrequest-master', loadChildren: () => import('./qcrequestmaster/qcrequestmaster.module').then(m => m.QcrequestmasterModule), canActivate: [AuthGuard] },
    { path: 'stonemedia', loadChildren: () => import('./stonemedia/stonemedia.module').then(m => m.StonemediaModule), canActivate: [AuthGuard] },
    { path: 'recommended', loadChildren: () => import('./recommended/recommended.module').then(m => m.RecommendedModule), canActivate: [AuthGuard] },
    { path: 'rejcetedstones', loadChildren: () => import('./rejectedstone/rejectedstone.module').then(m => m.RejectedstoneModule), canActivate: [AuthGuard] },
    { path: 'rejcetedstonesmaster', loadChildren: () => import('./leadrejectedstonemaster/leadrejectedstonemaster.module').then(m => m.LeadrejectedstonemasterModule), canActivate: [AuthGuard] },
    { path: 'purchaseanalysis', loadChildren: () => import('./purchaseanalysis/purchaseanalysis.module').then(m => m.PurchaseanalysisModule), canActivate: [AuthGuard] },
    { path: 'kapancompare', loadChildren: () => import('./kapancompare/kapancompare.module').then(m => m.KapancompareModule), canActivate: [AuthGuard] },
    { path: 'notifications', loadChildren: () => import('shared/views/common/notifications/notifications.module').then(m => m.NotificationsModule), canActivate: [AuthGuard] },
    { path: 'leadanalysis', loadChildren: () => import('./leadanalysis/leadanalysis.module').then(m => m.LeadanalysisModule), canActivate: [AuthGuard] },
    { path: 'salessheet', loadChildren: () => import('./salessheet/salessheet.module').then(m => m.SalesSheetModule), canActivate: [AuthGuard] },
    { path: 'leaddetails', loadChildren: () => import('./leaddetails/leaddetails.module').then(m => m.LeaddetailsModule), canActivate: [AuthGuard] },
    { path: 'expoinventory', loadChildren: () => import('./expoinventory/expoinventory.module').then(m => m.ExpoInventoryModule), canActivate: [AuthGuard] },
    { path: 'exporequest', loadChildren: () => import('./exporequest/exporequest.module').then(m => m.ExpoRequestModule), canActivate: [AuthGuard] },
    { path: 'offerstone', loadChildren: () => import('./offerstone/offerstone.module').then(m => m.OfferstoneModule), canActivate: [AuthGuard] },
    { path: 'expomaster', loadChildren: () => import('./expomaster/expomaster.module').then(m => m.ExpomasterModule), canActivate: [AuthGuard] },
    { path: 'leadhistory', loadChildren: () => import('./leadhistory/leadhistory.module').then(m => m.LeadhistoryModule), canActivate: [AuthGuard] },
    { path: 'saleanalysis', loadChildren: () => import('./saleanalysis/saleanalysis.module').then(m=>m.SaleanalysisModule), canActivate:[AuthGuard]},
    { path: 'ftpaddisc', loadChildren: () => import('./ftpaddisc/ftpaddisc.module').then(m=>m.FtpAddDiscModule), canActivate:[AuthGuard]},
    { path: 'bidingupload', loadChildren: () => import('./bidingUpload/bidingUpload.module').then(m=>m.BidingUploadModule), canActivate:[AuthGuard]},
    { path: 'bidingresults', loadChildren: () => import('./bidingResult/bidingResult.module').then(m=>m.BidingResultModule), canActivate:[AuthGuard]},
    { path: 'bidinghistory', loadChildren: () => import('./bidingHistory/bidingHistory.module').then(m=>m.BidingHistoryModule), canActivate:[AuthGuard]}
  ]
},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ViewRoutingModule { }
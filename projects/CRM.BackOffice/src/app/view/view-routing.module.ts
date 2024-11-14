import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'shared/auth';
import { ViewComponent } from './view.component';

const routes: Routes = [{
  path: '',
  component: ViewComponent,
  children: [
    { path: '', redirectTo: 'dashboard',pathMatch:'full' },
    { path: 'dashboard', loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule), canActivate: [AuthGuard] },
    { path: 'organization', loadChildren: () => import('./organization/organization.module').then(m => m.OrganizationModule), canActivate: [AuthGuard] },
    { path: 'employee', loadChildren: () => import('./employee/employee.module').then(m => m.EmployeeModule), canActivate: [AuthGuard] },
    { path: 'user', loadChildren: () => import('./user/user.module').then(m => m.UserModule), canActivate: [AuthGuard] },
    { path: 'masterconfig', loadChildren: () => import('./masterconfig/masterconfig.module').then(m => m.MasterconfigModule), canActivate: [AuthGuard] },
    { path: 'logisticsmaster', loadChildren: () => import('./logisticsmaster/logisticsmaster.module').then(m => m.LogisticsmasterModule), canActivate: [AuthGuard] },
    { path: 'companymaster', loadChildren: () => import('./companymaster/companymaster.module').then(m => m.CompanymasterModule), canActivate: [AuthGuard] },
    { path: 'configuration', loadChildren: () => import('./configuration/configuration.module').then(m => m.ConfigurationModule), canActivate: [AuthGuard] },
    { path: 'ledger', loadChildren: () => import('./ledger/ledger.module').then(m => m.LedgerModule), canActivate: [AuthGuard] },
    { path: 'lab', loadChildren: () => import('./lab/lab.module').then(m => m.LabModule), canActivate: [AuthGuard] },
    { path: 'labissue', loadChildren: () => import('./common/modal/labissue/labissue.module').then(m => m.LabissueModule), canActivate: [AuthGuard] },
    { path: 'labreceive', loadChildren: () => import('./common/modal/labreceive/labreceive.module').then(m => m.LabreceiveModule), canActivate: [AuthGuard] },
    { path: 'labissuemaster', loadChildren: () => import('./labissuemaster/labissuemaster.module').then(m => m.LabssuemasterModule), canActivate: [AuthGuard] },
    { path: 'labexpense', loadChildren: () => import('./labexpense/labexpense.module').then(m => m.LabexpenseModule), canActivate: [AuthGuard] },
    { path: 'labservice', loadChildren: () => import('./labservice/labservice.module').then(m => m.LabserviceModule), canActivate: [AuthGuard] },
    { path: 'labreconsiliation', loadChildren: () => import('./labreconsiliation/labreconsiliation.module').then(m => m.LabreconsiliationModule), canActivate: [AuthGuard] },
    { path: 'inventoryupload', loadChildren: () => import('./inventoryupload/inventoryupload.module').then(m => m.InventoryUploadModule), canActivate: [AuthGuard] },
    { path: 'inventory', loadChildren: () => import('./inventory/inventory.module').then(m => m.InventoryModule), canActivate: [AuthGuard] },
    { path: 'inventory/certificateLink', loadChildren: () => import('./inventory/certificate-link/certificate-link.module').then(m => m.CertificateLinkModule), canActivate: [AuthGuard] },
    { path: 'inclusionupload', loadChildren: () => import('./inclusionupload/inclusionupload.module').then(m => m.InclusionuploadModule), canActivate: [AuthGuard] },
    { path: 'configuration', loadChildren: () => import('./configuration/configuration.module').then(m => m.ConfigurationModule), canActivate: [AuthGuard] },
    { path: 'rfid', loadChildren: () => import('./rfid/rfid.module').then(m => m.RfidModule), canActivate: [AuthGuard] },
    { path: 'accountconfig', loadChildren: () => import('./accountconfig/accountconfig.module').then(m => m.AccountconfigModule), canActivate: [AuthGuard] },
    { path: 'grading', loadChildren: () => import('./grading/grading.module').then(m => m.GradingModule), canActivate: [AuthGuard] },
    { path: 'memomaster', loadChildren: () => import('./memomaster/memomaster.module').then(m => m.MemomasterModule), canActivate: [AuthGuard] },
    // { path: 'schememaster', loadChildren: () => import('./common/schememaster/schememaster.module').then(m => m.SchememasterModule), canActivate: [AuthGuard] },
    { path: 'transactitem', loadChildren: () => import('./transactitem/transactitem.module').then(m => m.TransactitemModule), canActivate: [AuthGuard] },
    { path: 'transactions', loadChildren: () => import('./transactions/transactions.module').then(m => m.TransactionsModule), canActivate: [AuthGuard] },
    { path: 'balancesheet', loadChildren: () => import('./balancesheet/balancesheet.module').then(m => m.BalancesheetModule), canActivate: [AuthGuard] },
    { path: 'profitloss', loadChildren: () => import('./profitloss/profitloss.module').then(m => m.ProfitlossModule), canActivate: [AuthGuard] },
    { path: 'order', loadChildren: () => import('./order/order.module').then(m => m.OrderModule), canActivate: [AuthGuard] },
    { path: 'inwardmemo', loadChildren: () => import('./inwardmemo/inwardmemo.module').then(m => m.InwardmemoModule), canActivate: [AuthGuard] },
    { path: 'kapananalysis', loadChildren: () => import('./kapananalysis/kapananalysis.module').then(m => m.KapananalysisModule), canActivate: [AuthGuard] },
    { path: 'weeklysummary', loadChildren: () => import('./weeklysummary/weeklysummary.module').then(m => m.WeeklysummaryModule), canActivate: [AuthGuard] },
    { path: 'profile', loadChildren: () => import('./profile/profile.module').then(m => m.ProfileModule), canActivate: [AuthGuard] },
    { path: 'memorequest-master', loadChildren: () => import('./memorequestmaster/memorequestmaster.module').then(m => m.MemorequestmasterModule), canActivate: [AuthGuard] },
    { path: 'qcrequest-master', loadChildren: () => import('./qcrequestmaster/qcrequestmaster.module').then(m => m.QcrequestmasterModule), canActivate: [AuthGuard] },
    { path: 'stonemedia', loadChildren: () => import('./stonemedia/stonemedia.module').then(m => m.StonemediaModule), canActivate: [AuthGuard] },
    { path: 'repairing', loadChildren: () => import('./repairing/repairing.module').then(m => m.RepairingModule), canActivate: [AuthGuard] },
    { path: 'ledgersummary', loadChildren: () => import('./ledgersummary/ledgersummary.module').then(m => m.LedgerSummaryModule), canActivate: [AuthGuard] },
    { path: 'notifications', loadChildren: () => import('shared/views/common/notifications/notifications.module').then(m => m.NotificationsModule), canActivate: [AuthGuard] },
    { path: 'cheque', loadChildren: () => import('./cheque/cheque.module').then(m => m.ChequeModule), canActivate: [AuthGuard] },
    { path: 'memoreturn', loadChildren: () => import('./memoreturn/memoreturn.module').then(m => m.MemoreturnModule), canActivate: [AuthGuard] },
    { path: 'reports', loadChildren: () => import('./reports/reports.module').then(m => m.ReportsModule), canActivate: [AuthGuard] },
    { path: 'exportrequest', loadChildren: () => import('./exportrequest/exportrequest.module').then(m => m.ExportRequestModule), canActivate: [AuthGuard] },
    { path: 'brokerage-master', loadChildren: () => import('./brokeragemaster/brokeragemaster.module').then(m => m.BrokeragemasterModule), canActivate: [AuthGuard] },
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ViewRoutingModule { }
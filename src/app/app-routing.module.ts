import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ActionComponent } from './action/action.component';
import { DetailsComponent } from './action/details/details.component';
import { AreaAddEditComponent } from './area/area-add-edit/area-add-edit.component';
import { AreaListComponent } from './area/area-list/area-list.component';
import { AreaComponent } from './area/area.component';
import { AuditAddEditComponent } from './audit/audit-add-edit/audit-add-edit.component';
import { AuditDetailsComponent } from './audit/audit-details/audit-details.component';
import { AuditListComponent } from './audit/audit-list/audit-list.component';
import { AuditComponent } from './audit/audit.component';
import { DownloadApkComponent } from './home/download-apk/download-apk.component';
import { HomeComponent } from './home/home.component';
import { NotificationComponent } from './notification/notification.component';
import { RedTagComponent } from './red-tag/red-tag.component';
import { LoginComponent } from './user/login/login.component';
import { OrganisationAddComponent } from './user/organisation-add/organisation-add.component';
import { RegistrationComponent } from './user/registration/registration.component';
import { UserAddEditComponent } from './user/user-add-edit/user-add-edit.component';
import { UserListComponent } from './user/user-list/user-list.component';
import { UserComponent } from './user/user.component';
import { CreateAccountComponent } from './user/create-account/create-account.component';
import { ForgotPasswordComponent } from './user/forget-password/forgot-password.component';
import { ValidationComponent } from './user/validation/validation.component';
import { ChecklistComponent } from './checklist/checklist.component';
import { ProductDashboardComponent } from './product/product-dashboard/product-dashboard.component';
import { ProductInspectionComponent } from './product/product-inspection/product-inspection.component';
import { ListProbComponent } from './problem/list-prob/list-prob.component';
import { DetailsProbComponent } from './problem/list-prob/details-prob/details-prob.component';
import { ProductDetailsComponent } from './product/product-inspection/product-details/product-details.component';
import { ComplaintComponent } from './complaint/complaint.component';
import { ComplaintListComponent } from './complaint/complaint-list/complaint-list.component';
import { ComplaintDetailsComponent } from './complaint/complaint-list/complaint-details/complaint-details.component';
import { D8ProbComponent } from './methodologies/d8-prob/d8-prob.component';
import { EightDComponent } from './methodologies/8d/eight-d.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  {
    path: 'user',
    component: UserComponent,
    //children: [
    //   { path: 'registration', component: RegistrationComponent},
    //   { path: 'login', component: LoginComponent}
    //  ]
  },
  { path: 'user/registration', component: RegistrationComponent },
  { path: 'user/login', component: LoginComponent },
  { path: 'user/create-account', component: CreateAccountComponent },
  { path: 'user/forgot-password', component: ForgotPasswordComponent },
  { path: 'home', component: HomeComponent },
  // loadChildren: () => import()},
  { path: 'area', component: AreaComponent },
  { path: 'audit', component: AuditComponent },
  { path: 'action', component: ActionComponent },
  { path: 'redtag', component: RedTagComponent },
  { path: 'downloadApk', component: DownloadApkComponent },
  { path: 'user/add-edit', component: UserAddEditComponent },
  { path: 'user/add-edit/:id', component: UserAddEditComponent },
  { path: 'user/list', component: UserListComponent },
  { path: 'area/list', component: AreaListComponent },
  { path: 'area/add-edit', component: AreaAddEditComponent },
  { path: 'area/add-edit/:id', component: AreaAddEditComponent },
  { path: 'user/organisation', component: OrganisationAddComponent },
  { path: 'audit/add-audit', component: AuditAddEditComponent },
  { path: 'audit/list', component: AuditListComponent },
  { path: 'organisation/add', component: OrganisationAddComponent },
  { path: 'action/details/:id', component: DetailsComponent },
  { path: 'audit/details/:id', component: AuditDetailsComponent },
  { path: 'notification', component: NotificationComponent },
  { path: 'auth/confirm-account', component: ValidationComponent },
  { path: 'checklist', component: ChecklistComponent },
  { path: 'product-dashboard', component: ProductDashboardComponent },
  { path: 'product-inspection', component: ProductInspectionComponent },
  { path: 'app-list-prob', component: ListProbComponent },
  {
    path: 'app-list-prob/app-details-prob/:id',
    component: DetailsProbComponent,
  },
  {
    path: 'product-inspection/details/:id',
    component: ProductDetailsComponent,
  },
  { path: 'reclamation/:name', component: ComplaintComponent },
  { path: 'complaints', component: ComplaintListComponent },
  { path: 'complaints/details/:id', component: ComplaintDetailsComponent },
  { path: 'app-list-prob', component: ListProbComponent },
  {
    path: 'app-list-prob/app-details-prob/:id',
    component: DetailsProbComponent,
  },
  {
    path: 'app-list-prob/app-details-prob/app-d8-prob/:id',
    component: D8ProbComponent,
  },
  { path: '8d/:id', component: EightDComponent },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      useHash: true,
      scrollPositionRestoration: 'top',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}

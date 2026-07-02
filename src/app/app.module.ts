import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { UserComponent } from './user/user.component';
import { RegistrationComponent } from './user/registration/registration.component';
import { UserService } from './shared/user.service';
import { LoginComponent } from './user/login/login.component';
import { AuditComponent } from './audit/audit.component';
import { ActionComponent } from './action/action.component';
import { AreaComponent } from './area/area.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import {
  HttpClientModule,
  HTTP_INTERCEPTORS,
  HttpClient,
} from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { EventService } from './shared/event.service';
import { AuditActionService } from './shared/auditAction.service';
import { AuditService } from './shared/audit.service';
import { ForbiddenComponent } from './forbidden/forbidden.component';
import { JwtInterceptor } from './auth/jwt.interceptor';
import { RedTagComponent } from './red-tag/red-tag.component';
import { RedTagService } from './shared/redTag.service';
import { UserAddEditComponent } from './user/user-add-edit/user-add-edit.component';
import { UserListComponent } from './user/user-list/user-list.component';
import { AreaListComponent } from './area/area-list/area-list.component';
import { AreaAddEditComponent } from './area/area-add-edit/area-add-edit.component';
import { AuditAddEditComponent } from './audit/audit-add-edit/audit-add-edit.component';
import { AuditListComponent } from './audit/audit-list/audit-list.component';
import { OrganisationAddComponent } from './user/organisation-add/organisation-add.component';
import { DownloadApkComponent } from './home/download-apk/download-apk.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterrComponent } from './components/footerr/footerr.component';
import { DetailsComponent } from './action/details/details.component';
import { SidebarRightComponent } from './components/sidebar-right/sidebar-right.component';
import { AuditDetailsComponent } from './audit/audit-details/audit-details.component';
import { JwPaginationModule } from 'jw-angular-pagination';
import { NotificationComponent } from './notification/notification.component';
import { NotificationService } from './shared/notification.service';
import { CreateAccountComponent } from './user/create-account/create-account.component';
import { ForgotPasswordComponent } from './user/forget-password/forgot-password.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ValidationComponent } from './user/validation/validation.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DatePipe } from '@angular/common';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { BarChartComponent } from './shared/charts/bar-chart/bar-chart.component';
import { ChecklistComponent } from './checklist/checklist.component';
import { ProductDashboardComponent } from './product/product-dashboard/product-dashboard.component';
import { ProductInspectionComponent } from './product/product-inspection/product-inspection.component';
import { ListProbComponent } from './problem/list-prob/list-prob.component';
import { ProductDetailsComponent } from './product/product-inspection/product-details/product-details.component';
import { ComplaintComponent } from './complaint/complaint.component';
import { ComplaintListComponent } from './complaint/complaint-list/complaint-list.component';
import { ComplaintDetailsComponent } from './complaint/complaint-list/complaint-details/complaint-details.component';
import { DetailsProbComponent } from './problem/list-prob/details-prob/details-prob.component';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { D8ProbComponent } from './methodologies/d8-prob/d8-prob.component';
import { OverlayContainer } from 'ngx-toastr';
import { EightDComponent } from './methodologies/8d/eight-d.component';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    UserComponent,
    LoginComponent,
    CreateAccountComponent,
    RegistrationComponent,
    AuditComponent,
    ForbiddenComponent,
    ActionComponent,
    AreaComponent,
    RedTagComponent,
    UserAddEditComponent,
    UserListComponent,
    AreaListComponent,
    AreaAddEditComponent,
    AuditAddEditComponent,
    AuditListComponent,
    OrganisationAddComponent,
    DownloadApkComponent,
    HeaderComponent,
    FooterrComponent,
    DetailsComponent,
    SidebarRightComponent,
    AuditDetailsComponent,
    NotificationComponent,
    ForgotPasswordComponent,
    ValidationComponent,
    BarChartComponent,
    ChecklistComponent,
    ProductDashboardComponent,
    ProductInspectionComponent,
    ProductDetailsComponent,
    ComplaintComponent,
    ComplaintListComponent,
    ComplaintDetailsComponent,
    ListProbComponent,
    DetailsProbComponent,
    D8ProbComponent,
    EightDComponent,
  ],
  imports: [
    RouterModule,
    CommonModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient],
      },
    }),
    BrowserModule,
    JwPaginationModule,
    NgbModule,
    NgSelectModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    ModalModule.forRoot(),
    NgxSliderModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],

  providers: [
    UserService,
    AuditService,
    AuditActionService,
    RedTagService,
    EventService,
    RedTagService,
    NotificationService,
    DatePipe,

    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true,
    },
  ],

  bootstrap: [AppComponent],
})
export class AppModule {}

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuditService } from '../shared/audit.service';
import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { UserService } from '../shared/user.service';
import { Audit } from '../models/audit.model';
import { FormBuilder } from '@angular/forms';
import { User } from '../models/user.model';
import { AreaService } from '../shared/area.service';
import { DatePipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { AuditActionService } from '../shared/auditAction.service';

@Component({
  selector: 'app-audit',
  templateUrl: './audit.component.html',
  styleUrls: ['./audit.component.scss'],
})
export class AuditComponent implements OnInit, OnDestroy {
  // Make Math available in template
  Math = Math;

  pageOfItems: Array<Audit>;
  pageOfItemsUser: Array<User>;
  organisation: any;
  pageSize = 12;
  auditSelected = false;
  audit: any;
  auditTasksGroup: any;
  auditTasks: any;
  closed = false;
  valueclosed = [];
  users: any;
  areas: any;
  audits: any;
  filteredData: any;
  result: any;
  list: any;
  page!: number;
  allData: any;
  ngbPaginationPage = 1;
  totalItems = 0;
  area = -1;
  auditorId = -1;
  selectedStatus = '';
  selectedChecklist = '';
  selectedAnonymous = '';
  minDate = '';
  maxDate = '';
  rowClicked: any;
  auditPercentage = [];
  percentage: any;
  sub: Subscription;
  load = false;
  auditActionObject: any;
  enqueteStatus: any = [];
  status = [
    { name: 'Créée', send: 'CREATED' },
    { name: 'En cours', send: 'STARTED' },
    { name: 'Cloturée', send: 'FINISHED' },
    { name: 'Annulée', send: 'CANCELED' },
  ];
  anonymous = [
    { name: 'Anonyme', value: 'Anonymous' },
    { name: 'Authentifié', value: 'notAnonymous' },
  ];
  checklist = [
    { name: 'Anomalie', value: 'Je signale une anomalie' },
    { name: 'Emotion', value: 'J’exprime mon émotion' },
    { name: 'Innovation', value: 'J’exprime mon idée innovante' },
    { name: 'Remerciement', value: 'J’exprime mon remerciement' },
  ];
  currentRole: any;

  formModel = this.formBuilder.group({
    audit: ['audit'],
    auditor: [''],
    area: [''],
    from: [''],
    to: ['null'],
  });

  constructor(
    private formBuilder: FormBuilder,
    public service: AuditService,
    public userservice: UserService,
    public areaService: AreaService,
    public auditActionService: AuditActionService,
    private router: Router,
    private toastr: ToastrService,
    private datepipe: DatePipe
  ) {}

  ngOnInit(): void {
    if (localStorage.getItem('token') == null) {
      this.router.navigateByUrl('/user/login');
    }
    const currentUser = localStorage.getItem('curUser');
    this.currentRole = JSON.parse(currentUser).roles[0].name;

    console.log(this.currentRole);
    if (this.currentRole === 'ROLE_DRH') {
      this.checklist = [
        { name: 'Innovation', value: 'J’exprime mon idée innovante' },
        { name: 'Remerciement', value: 'J’exprime mon remerciement' },
      ];
    }
    if (this.currentRole === 'ROLE_DG') {
      const checklistList = document.getElementById(
        'checklistList'
      ) as HTMLElement;
      checklistList.style.display = 'none';
    }

    this.getRequests();
  }

  getRequests(page?: number, dontNavigate?: boolean): void {
    const pageToLoad: number = page || this.page || 1;
    this.sub = this.service
      .getRequest({
        page: pageToLoad - 1,
        size: 15,
        requestAnonymous: this.selectedAnonymous,
        requestStatus: this.selectedStatus,
        requestChecklist: this.selectedChecklist,
        currentRole: this.currentRole,
        // minDate: this.minDate,
        // maxDate: this.maxDate,
      })
      .subscribe(
        (res: HttpResponse<Audit[]>) =>
          this.onSuccess(res.body, res.headers, pageToLoad, !dontNavigate),
        () => this.onError()
      );
  }

  protected onSuccess(
    data: Audit[] | null,
    headers: HttpHeaders,
    page: number,
    navigate: boolean
  ): void {
    this.enqueteStatus = [];
    this.page = page;
    if (navigate) {
      this.router.navigate(['/audit'], {
        queryParams: {
          page: this.page,
          size: 15,
          requestAnonymous: this.selectedAnonymous,
          requestStatus: this.selectedStatus,
          requestChecklist: this.selectedChecklist,
        },
      });
    }
    this.filteredData = data || [];
    this.allData = this.filteredData.content;
    this.allData.sort((a, b) => b.id - a.id);

    console.log(this.allData);
    this.totalItems = this.filteredData.totalElements;
    console.log(this.totalItems);
    this.rowClicked = -1;

    this.ngbPaginationPage = this.page;

    this.load = true;
  }

  loadPage(page?: number, dontNavigate?: boolean): void {
    this.enqueteStatus = [];
    console.log(page);
    const pageToLoad: number = page || this.page || 1;

    this.service
      .getRequest({
        page: pageToLoad - 1,
        size: 15,
        requestAnonymous: this.selectedAnonymous,
        requestStatus: this.selectedStatus,
        requestChecklist: this.selectedChecklist,
      })
      .subscribe(
        (res: HttpResponse<Audit[]>) =>
          this.onSuccess(res.body, res.headers, pageToLoad, !dontNavigate),
        () => this.onError()
      );
  }

  protected onError(): void {
    console.log('error');
    this.ngbPaginationPage = this.page ?? 1;
  }

  pageClick(pageOfItems: Array<Audit>): void {
    this.filteredData = pageOfItems;
    console.log(this.filteredData);
  }

  pageClick1(pageOfItemsUser: Array<User>): void {
    this.pageOfItemsUser = pageOfItemsUser;
  }

  addAudit(): void {
    this.router.navigate(['/audit/add-audit']);
  }

  showAudit(id: string, i: number): void {
    this.router.navigateByUrl('/action/details/' + id);
  }

  closePopup(): void {
    const popup = document.getElementById('popup');
    //  as HTMLElement;
    popup.style.display = 'none';
  }

  extractData(): void {}

  closeList(j: number): void {
    const list = document.getElementById(j.toString());
    //  as HTMLElement;
    list.style.display = 'none';
    this.closed = true;
    this.valueclosed.push(j);
  }

  openList(j: number): void {
    const list = document.getElementById(j.toString());
    //  as HTMLElement;
    list.style.display = 'block';
    this.closed = false;
    this.valueclosed.forEach((element, index) => {
      if (element === j) {
        this.valueclosed.splice(index, 1);
      }
    });
  }
  formClosed(i: number): boolean {
    for (const j of this.valueclosed.keys()) {
      if (i === this.valueclosed[j]) {
        return true;
      }
    }
    return false;
  }

  changeAudit(): void {
    // this.result = this.audits.body.content
    const filteredAnonymous = document.getElementById(
      'anonymous'
    ) as HTMLSelectElement;
    const filteredstatus = document.getElementById(
      'status'
    ) as HTMLInputElement;
    const filteredChecklist = document.getElementById(
      'checklist'
    ) as HTMLInputElement;
    // const startingDate = document.getElementById('from') as HTMLSelectElement;
    // const endDate = document.getElementById('to') as HTMLSelectElement;

    console.log(filteredAnonymous.value);
    if (filteredAnonymous.value !== 'null') {
      this.selectedAnonymous = filteredAnonymous.value;
    } else {
      this.selectedAnonymous = '';
    }

    if (filteredstatus.value !== 'null') {
      this.selectedStatus = filteredstatus.value;
    } else {
      this.selectedStatus = '';
    }

    if (filteredChecklist.value !== 'null') {
      this.selectedChecklist = filteredChecklist.value;
    } else {
      this.selectedChecklist = '';
    }

    // if (startingDate.value !== ''){
    //   this.minDate = this.datepipe.transform(startingDate.value, 'yyyy-MM-dd HH:mm:ss');
    //   // this.result = this.result.filter(obj => {
    //   //   return obj.date >= startingDate.value
    //   // })
    // }
    //
    // if (endDate.value !== ''){
    //   this.maxDate = this.datepipe.transform(endDate.value, 'yyyy-MM-dd HH:mm:ss');
    //   // this.result = this.result.filter(obj => {
    //   //   return obj.date <= endDate.value
    //   // })
    // }

    this.getRequests(0);

    console.log(this.result);
  }

  goToAction(id): void {
    this.router.navigate(['/action/details/' + id]);
  }

  ngOnDestroy(): void {
    // prevent memory leak when component destroyed
    this.sub.unsubscribe();
  }

  viewDetails(id): void {
    this.router.navigateByUrl('/audit/details/' + id);
  }
}

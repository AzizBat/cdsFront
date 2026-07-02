import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuditActionService } from '../shared/auditAction.service';
import {  HttpResponse ,HttpHeaders} from '@angular/common/http';
import { AuditAction } from '../models/auditAction.model';
import {UserService} from "../shared/user.service";
import {DatePipe} from "@angular/common";

import {FormBuilder} from "@angular/forms";
import {AreaService} from "../shared/area.service";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-action',
  templateUrl: './action.component.html',
  styleUrls: ['./action.component.scss'],

})
export class ActionComponent implements OnInit {

  data: Array<any>
  pageOfItems : Array<AuditAction>;
  pageSize: number = 8;
  organisation: any
  difference = []
  totaldays =[]
  leftdays = []
  totalItems =0
  ngbPaginationPage = 1;
  page!: number;
  allData: any;
  filteredData :any
  result :any
  area = -1
  status = ""
  affectedUsers = -1
  minDate = ""
  maxDate = ""
  actions :any
  areas :any
  users :any
  sortingBy = ""
  checked = false
  sub : Subscription
  abs = []
  load = false;
  estim :any

  statusConstants = [
    {name:"Created", value:"CREATED"},
    {name:"Started", value:"STARTED"},
    {name:"Finished", value:"FINISHED"},
    {name:"Canceled", value:"CANCELED"},
    ]



  formModel= this.formBuilder.group({
    areaName: [''],
    affectedUsers: [''],
    status: [''],
    from: [''],
    to: [''],
  });




  constructor(
    private formBuilder: FormBuilder,
    public service: AuditActionService,
    private router: Router,
    private toastr: ToastrService,
    public userservice: UserService,
    private datepipe:DatePipe,
    public areaService: AreaService,

  ) {
    this.data = new Array<any>()
  }

  ngOnInit() {
    this.userservice.getOrganisation().subscribe(res => (this.organisation = res || []));
    this.userservice.getUsers().subscribe(res => {(this.users = res || [])
      this.users = this.users.body.content});
    this.getActions();
    this.areaService.getAreas1().subscribe(res => {(this.areas = res || [])
      this.areas = this.areas.body.content} );
  }

  getActions(page?: number, dontNavigate?: boolean){
    const pageToLoad: number = page || this.page || 1;
   this.sub = this.service.getActions(
      {
        page: pageToLoad - 1,
        size: 12,
        areaId:this.area,
        status:this.status,
        affectedUsers:this.affectedUsers,
        minDate:this.minDate,
        maxDate:this.maxDate,
        sortingBy:this.sortingBy,
      })
      .subscribe(
          (res: HttpResponse<AuditAction[]>) => {this.onSuccess(res.body, res.headers, pageToLoad, !dontNavigate)
          },
          () => this.onError()
        );
  }

  loadPage(page?: number, dontNavigate?: boolean): void {
    console.log(page)
    const pageToLoad: number = page || this.page || 1;

    this.service
      .getActions({
        page: pageToLoad - 1,
        size: 12,
        areaId:this.area,
        status:this.status,
        affectedUsers:this.affectedUsers,
        minDate:this.minDate,
        maxDate:this.maxDate,
        sortingBy:this.sortingBy
      })
      .subscribe(
        (res: HttpResponse<AuditAction[]>) => this.onSuccess(res.body, res.headers, pageToLoad, !dontNavigate),
        () => this.onError()
      );
  }

  protected onSuccess(data: AuditAction[] | null, _headers: HttpHeaders, page: number, navigate: boolean): void {
    this.totaldays = []
    this.leftdays = []
    this.difference = []
    this.abs = []
    this.page = page;
    if (navigate) {
      this.router.navigate(['/action'], {
        queryParams: {
          page: this.page,
          size: 12,
          areaId:this.area,
          status:this.status,
          affectedUsers:this.affectedUsers,
          minDate:this.minDate,
          maxDate:this.maxDate,
          sortingBy:this.sortingBy
        },
      });
    }
    this.allData = data || [];
    this.filteredData = this.allData.content
    this.result = this.allData.content
    this.ngbPaginationPage = this.page;
    this.totalItems = this.allData.totalElements;
      for (let i of this.filteredData.keys()){
        const date1 =new Date(this.filteredData[i].deadline)
        const date2 =new Date(this.filteredData[i].date)
        const date3 =new Date()
        const date4 =new Date(this.filteredData[i].modifiedDate)
        if(this.filteredData[i].status !=="FINISHED"){
        const totalDays = Math.ceil((date1.getTime() - date2.getTime())/ (1000 * 3600 * 24))
        const leftDays = Math.ceil((date1.getTime() - date3.getTime())/ (1000 * 3600 * 24))
         this.estim = this.difference.push((leftDays / totalDays)*100);

        }
      else {
        this.difference.push(date1.getTime() - date4.getTime())


        }
      }
    this.load = true;
  }

  protected onError(): void {
    console.log('error');
    this.ngbPaginationPage = this.page ?? 1;
  }

  viewDetails (id) {
    this.router.navigateByUrl('/action/details/' + id);
}


pageClick(pageOfItems : Array<AuditAction>){
  this.pageOfItems = pageOfItems;
}


  onLogout() {
    localStorage.removeItem('token');
    localStorage.clear();
    this.router.navigate(['/user/login']);
  }

  changeAudit(){
    // this.result = this.audits.body.content
    let filteredArea = document.getElementById('area') as HTMLSelectElement;
    let filteredState = document.getElementById('state') as HTMLSelectElement;
    let filteredAffectedUsers = document.getElementById('affectedUsers') as HTMLSelectElement;
    let startingDate = document.getElementById('from') as HTMLSelectElement;
    let endDate = document.getElementById('to') as HTMLSelectElement;
    console.log(startingDate.value)
    console.log(this.actions)


    if(filteredArea.options[filteredArea.selectedIndex].value !== "null"){
      this.area = parseInt(filteredArea.options[filteredArea.selectedIndex].value)
      //  this.result = this.result.filter(obj => {
      //   return obj.name === filteredAudit.options[filteredAudit.selectedIndex].value
      // })
    }

    if(filteredState.options[filteredState.selectedIndex].value !== "null"){
      this.status =filteredState.options[filteredState.selectedIndex].value
      // this.result = this.result.filter(obj => {
      //   return obj.auditorId === Number(filteredAuditor.options[filteredAuditor.selectedIndex].value)
      // })
    }

    if(filteredAffectedUsers.options[filteredAffectedUsers.selectedIndex].value !== "null"){
      this.affectedUsers = parseInt(filteredAffectedUsers.options[filteredAffectedUsers.selectedIndex].value)
      // this.result = this.result.filter(obj => {
      //   return obj.areaId === Number(filteredArea.options[filteredArea.selectedIndex].value)
      // })
    }

    if(startingDate.value !== ""){
      this.minDate =this.datepipe.transform(startingDate.value, "dd/MM/yyyy")
      // this.result = this.result.filter(obj => {
      //   return obj.date >= startingDate.value
      // })
    }

    if(endDate.value !== ""){
      this.maxDate =this.datepipe.transform(endDate.value, "dd/MM/yyyy")
      // this.result = this.result.filter(obj => {
      //   return obj.date <= endDate.value
      // })
    }

    this.getActions(0)

    console.log(this.result)
  }

  sorting(){
    const checkbox = document.getElementById('sort') as HTMLInputElement;
    if (checkbox.checked === true) {
      this.checked = true
      this.sortingBy = "deadline"
    }
    else{
      this.checked = false
      this.sortingBy = "lastValue"
    }
    this.getActions(0);
  }

  ngOnDestroy() {
    //prevent memory leak when component destroyed
    this.sub.unsubscribe();
  }
}
